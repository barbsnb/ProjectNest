from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics
from rest_framework import permissions, status
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
            logger.info(f"Project {project.id} created")
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        logger.error(f"Project creation failed with errors: {serializer.errors}")
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
            logger.exception(f"Unexpected repository ingestion error for project {project_id}: {exc}")
            return Response(
                {"error": "Nie udalo sie zindeksowac repozytorium."},
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


class AnalysisRunFindingListView(generics.ListAPIView):
    serializer_class = FindingSerializer
    permission_classes = [permissions.IsAuthenticated]

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

        return queryset


class ProjectAnalysisGenerate(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request, project_id):
        try:
            get_owned_project(request, project_id)
            analysis_data = UserProjectUpdater.update_project_analysis(project_id=project_id)
            return Response(analysis_data, status=status.HTTP_200_OK)
        except Project.DoesNotExist:
            return Response({"error": "Project not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Error generating analysis: {e}")
            return Response({"error": "Error generating analysis"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ProjectSuggestionsGenerate(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request, project_id):
        try:
            get_owned_project(request, project_id)
            suggestions_data = UserProjectSuggestionsGenerator.generate_project_suggestions(project_id=project_id)
            return Response(suggestions_data, status=status.HTTP_200_OK)
        except Project.DoesNotExist:
            return Response({"error": "Project not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Error generating suggestions: {e}")
            return Response({"error": "Error generating suggestions"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


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
