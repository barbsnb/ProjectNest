from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics
from rest_framework import permissions, status
from rest_framework.pagination import PageNumberPagination
from django.db.models import Q
from .serializers import (
    AnalysisRunSerializer,
    FindingSerializer,
    ImprovementSuggestionSerializer,
    ProjectAnalysisSerializer,
    RepositorySnapshotSerializer,
    UserProjectSerializer,
)
from .models import AnalysisRun, Finding, Project, ProjectAnalysis, ImprovementSuggestion
from .services.analysis_pipeline import execute_analysis_run
from .services.repo_ingestion import RepoIngestionError, ingest_project_repository
from .services.UserProjectUpdater import UserProjectUpdater
from .services.UserProjectSuggestionsGenerator import UserProjectSuggestionsGenerator
from django.shortcuts import get_object_or_404
import logging

logger = logging.getLogger(__name__)

SEVERITY_ORDER = [
    Finding.SEVERITY_CRITICAL,
    Finding.SEVERITY_HIGH,
    Finding.SEVERITY_MEDIUM,
    Finding.SEVERITY_LOW,
    Finding.SEVERITY_INFO,
]


class FindingPagination(PageNumberPagination):
    page_size = 25
    page_size_query_param = "page_size"
    max_page_size = 100


def get_owned_project(request, project_id):
    return get_object_or_404(Project, id=project_id, user=request.user)


def get_owned_analysis_run(request, run_id):
    return get_object_or_404(AnalysisRun, id=run_id, project__user=request.user)


class UserProject(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        serializer = UserProjectSerializer(data=request.data, context={"request": request})
        if serializer.is_valid():
            serializer.save()
            project = serializer.instance
            logger.info("Utworzono projekt %s.", project.id)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        logger.error("Nie udało się utworzyć projektu: %s", serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        

class UserProjectDetail(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request, project_id):
        project = get_owned_project(request, project_id)
        serializer = UserProjectSerializer(project)
        return Response(serializer.data)


class ProjectIngestView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request, project_id):
        project = get_owned_project(request, project_id)
        try:
            snapshot = ingest_project_repository(project)
        except RepoIngestionError as exc:
            return Response({"error": exc.message}, status=exc.status_code)
        except Exception as exc:
            logger.exception("Nieoczekiwany błąd indeksowania repozytorium dla projektu %s: %s", project_id, exc)
            return Response(
                {"error": "Nie udało się zindeksować repozytorium."},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        serializer = RepositorySnapshotSerializer(snapshot)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class ProjectSnapshotDetailView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request, project_id):
        project = get_owned_project(request, project_id)
        snapshot = project.repository_snapshots.first()
        if not snapshot:
            return Response({"error": "Snapshot repozytorium nie istnieje."}, status=status.HTTP_404_NOT_FOUND)
        serializer = RepositorySnapshotSerializer(snapshot)
        return Response(serializer.data, status=status.HTTP_200_OK)


class ProjectAnalysisRunCreateView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request, project_id):
        project = get_owned_project(request, project_id)
        run = execute_analysis_run(project)
        serializer = AnalysisRunSerializer(run)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class ProjectAnalysisRunDetailView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request, project_id, run_id):
        get_owned_project(request, project_id)
        run = get_object_or_404(AnalysisRun, id=run_id, project_id=project_id, project__user=request.user)
        serializer = AnalysisRunSerializer(run)
        return Response(serializer.data, status=status.HTTP_200_OK)


class ProjectReportSummaryView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request, project_id):
        project = get_owned_project(request, project_id)
        run = project.analysis_runs.select_related("snapshot").prefetch_related("findings", "agent_results").first()
        if not run:
            return Response(
                {
                    "project": UserProjectSerializer(project).data,
                    "latest_run": None,
                    "score_total": None,
                    "status": "not_started",
                    "critical_count": 0,
                    "high_count": 0,
                    "category_counts": {},
                    "category_scores": {},
                    "top_findings": [],
                    "agent_results": [],
                },
                status=status.HTTP_200_OK,
            )

        findings = list(run.findings.all())
        category_counts = {}
        category_scores = {}
        for finding in findings:
            category_counts[finding.category] = category_counts.get(finding.category, 0) + 1
            category_scores.setdefault(finding.category, 100)
            category_scores[finding.category] = max(
                0,
                category_scores[finding.category] - _severity_penalty(finding.severity),
            )

        top_findings = sorted(
            findings,
            key=lambda item: (SEVERITY_ORDER.index(item.severity), -item.confidence, item.category, item.title),
        )[:3]

        latest_run = _analysis_run_summary_payload(run, findings, category_scores)
        agent_results = _agent_result_summary_payloads(run, findings)

        return Response(
            {
                "project": UserProjectSerializer(project).data,
                "latest_run": latest_run,
                "score_total": run.score_total,
                "status": run.status,
                "critical_count": sum(1 for finding in findings if finding.severity == Finding.SEVERITY_CRITICAL),
                "high_count": sum(1 for finding in findings if finding.severity == Finding.SEVERITY_HIGH),
                "category_counts": category_counts,
                "category_scores": category_scores,
                "top_findings": FindingSerializer(top_findings, many=True).data,
                "agent_results": agent_results,
            },
            status=status.HTTP_200_OK,
        )


class AnalysisRunFindingListView(generics.ListAPIView):
    serializer_class = FindingSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = FindingPagination

    def get_queryset(self):
        run_id = self.kwargs.get("run_id")
        get_owned_analysis_run(self.request, run_id)
        queryset = Finding.objects.filter(run_id=run_id, run__project__user=self.request.user)

        severity = self.request.query_params.get("severity")
        if severity:
            queryset = queryset.filter(severity=severity)

        category = self.request.query_params.get("category")
        if category:
            queryset = queryset.filter(category=category)

        source = self.request.query_params.get("source")
        if source:
            queryset = queryset.filter(source=source)

        search = self.request.query_params.get("search")
        if search:
            queryset = queryset.filter(Q(title__icontains=search) | Q(file_path__icontains=search))

        return queryset


class AnalysisRunFindingDetailView(generics.RetrieveAPIView):
    serializer_class = FindingSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_url_kwarg = "finding_id"

    def get_queryset(self):
        run_id = self.kwargs.get("run_id")
        get_owned_analysis_run(self.request, run_id)
        return Finding.objects.filter(run_id=run_id, run__project__user=self.request.user)


class ProjectAnalysisGenerate(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request, project_id):
        try:
            get_owned_project(request, project_id)
            analysis_data = UserProjectUpdater.update_project_analysis(project_id=project_id)
            return Response(analysis_data, status=status.HTTP_200_OK)
        except Project.DoesNotExist:
            return Response({"error": "Projekt nie istnieje."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error("Błąd generowania analizy: %s", e)
            return Response({"error": "Nie udało się wygenerować analizy."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ProjectSuggestionsGenerate(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request, project_id):
        try:
            get_owned_project(request, project_id)
            suggestions_data = UserProjectSuggestionsGenerator.generate_project_suggestions(project_id=project_id)
            return Response(suggestions_data, status=status.HTTP_200_OK)
        except Project.DoesNotExist:
            return Response({"error": "Projekt nie istnieje."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error("Błąd generowania sugestii: %s", e)
            return Response({"error": "Nie udało się wygenerować sugestii."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ProjectListView(generics.ListAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = UserProjectSerializer

    def get_queryset(self):
        return Project.objects.filter(user=self.request.user).order_by("-updated_at")


class ProjectAnalysisDetailView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request, project_id):
        analysis = get_object_or_404(ProjectAnalysis, project__id=project_id, project__user=request.user)
        serializer = ProjectAnalysisSerializer(analysis)
        return Response(serializer.data, status=status.HTTP_200_OK)


class ImprovementSuggestionListView(generics.ListAPIView):
    serializer_class = ImprovementSuggestionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        project_id = self.kwargs.get('project_id')
        return ImprovementSuggestion.objects.filter(project_id=project_id, project__user=self.request.user)


class ImprovementSuggestionDetailView(generics.RetrieveAPIView):
    serializer_class = ImprovementSuggestionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ImprovementSuggestion.objects.filter(project__user=self.request.user)


def _severity_penalty(severity):
    return {
        Finding.SEVERITY_CRITICAL: 25,
        Finding.SEVERITY_HIGH: 15,
        Finding.SEVERITY_MEDIUM: 7,
        Finding.SEVERITY_LOW: 3,
        Finding.SEVERITY_INFO: 0,
    }.get(severity, 0)


def _analysis_run_summary_payload(run, findings, category_scores):
    return {
        "id": run.id,
        "project": run.project_id,
        "snapshot": run.snapshot_id,
        "status": run.status,
        "started_at": run.started_at,
        "finished_at": run.finished_at,
        "error_message": run.error_message,
        "score_total": run.score_total,
        "findings_count": len(findings),
        "category_scores": category_scores,
    }


def _agent_result_summary_payloads(run, findings):
    finding_counts = {}
    for finding in findings:
        if finding.agent_name:
            finding_counts[finding.agent_name] = finding_counts.get(finding.agent_name, 0) + 1

    return [
        {
            "id": result.id,
            "run": result.run_id,
            "agent_name": result.agent_name,
            "status": result.status,
            "model": result.model,
            "prompt_version": result.prompt_version,
            "summary": result.summary,
            "started_at": result.started_at,
            "finished_at": result.finished_at,
            "created_at": result.created_at,
            "error_message": result.error_message,
            "findings_count": finding_counts.get(result.agent_name, 0),
        }
        for result in run.agent_results.all()
    ]
