# do przekształcania danych modeli django na forme przesylana przez siec
from rest_framework import serializers
from .models import Project, ProjectAnalysis, ImprovementSuggestion, RepositorySnapshot
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
            raise serializers.ValidationError("Projekt musi byc przypisany do zalogowanego uzytkownika.")
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
