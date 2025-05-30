# do przekształcania danych modeli django na forme przesylana przez siec
from rest_framework import serializers
from .models import Project, ProjectAnalysis, ImprovementSuggestion

class UserProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = (
            "id",
            "name",
            "description",
            "user",
        )



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