# do przekształcania danych modeli django na forme przesylana przez siec
from rest_framework import serializers
from .models import (
    AgentResult,
    AnalysisRun,
    Finding,
    ImprovementSuggestion,
    Project,
    ProjectAnalysis,
    RepositorySnapshot,
)
from .services.repo_ingestion import RepoIngestionError, validate_github_repo_url

class UserProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = (
            "id",
            "name",
            "description",
            "repo_url",
            "default_branch",
            "last_commit_sha",
            "user",
            "created_at",
            "updated_at",
        )
        read_only_fields = (
            "user",
            "default_branch",
            "last_commit_sha",
            "created_at",
            "updated_at",
        )

    def validate_repo_url(self, value):
        if not value:
            raise serializers.ValidationError("URL repozytorium GitHub jest wymagany.")
        try:
            return validate_github_repo_url(value).normalized_url
        except RepoIngestionError as exc:
            raise serializers.ValidationError(exc.message) from exc

    def create(self, validated_data):
        request = self.context.get("request")
        if not request or not request.user or not request.user.is_authenticated:
            raise serializers.ValidationError("Projekt musi być przypisany do zalogowanego użytkownika.")
        return Project.objects.create(user=request.user, **validated_data)


class RepositorySnapshotSerializer(serializers.ModelSerializer):
    class Meta:
        model = RepositorySnapshot
        fields = (
            "id",
            "project",
            "commit_sha",
            "branch",
            "file_count",
            "total_size_bytes",
            "included_files",
            "ignored_files",
            "created_at",
        )
        read_only_fields = fields


class AgentResultSerializer(serializers.ModelSerializer):
    findings_count = serializers.SerializerMethodField()

    class Meta:
        model = AgentResult
        fields = (
            "id",
            "run",
            "agent_name",
            "status",
            "model",
            "prompt_version",
            "summary",
            "raw_output",
            "normalized_output",
            "started_at",
            "finished_at",
            "created_at",
            "error_message",
            "findings_count",
        )
        read_only_fields = fields

    def get_findings_count(self, obj):
        return obj.run.findings.filter(agent_name=obj.agent_name).count()


class AnalysisRunSerializer(serializers.ModelSerializer):
    agent_results = AgentResultSerializer(many=True, read_only=True)
    findings_count = serializers.SerializerMethodField()
    category_scores = serializers.SerializerMethodField()

    class Meta:
        model = AnalysisRun
        fields = (
            "id",
            "project",
            "snapshot",
            "status",
            "started_at",
            "finished_at",
            "error_message",
            "score_total",
            "agent_results",
            "findings_count",
            "category_scores",
        )
        read_only_fields = fields

    def get_findings_count(self, obj):
        return obj.findings.count()

    def get_category_scores(self, obj):
        penalties = {
            Finding.SEVERITY_CRITICAL: 25,
            Finding.SEVERITY_HIGH: 15,
            Finding.SEVERITY_MEDIUM: 7,
            Finding.SEVERITY_LOW: 3,
            Finding.SEVERITY_INFO: 0,
        }
        categories = {}
        for finding in obj.findings.all():
            categories.setdefault(finding.category, 100)
            categories[finding.category] = max(
                0,
                categories[finding.category] - penalties.get(finding.severity, 0),
            )
        return categories


class FindingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Finding
        fields = (
            "id",
            "run",
            "source",
            "agent_name",
            "category",
            "severity",
            "title",
            "description",
            "file_path",
            "line_start",
            "evidence",
            "recommendation",
            "confidence",
            "status",
            "created_at",
        )
        read_only_fields = fields



class ProjectAnalysisSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectAnalysis
        fields = "__all__"
        read_only_fields = ["project", "created_at"]


class ImprovementSuggestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ImprovementSuggestion
        fields = [
            'id',
            'project',
            'title',
            'description',
            'priority',
            'status',
            'recommendations',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']
