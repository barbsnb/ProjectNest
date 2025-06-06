# do przekształcania danych modeli django na forme przesylana przez siec
from rest_framework import serializers
from .models import Project, ProjectAnalysis, ImprovementSuggestion

class UserProjectSerializer(serializers.ModelSerializer):

    keywords = serializers.CharField(
        required=False, allow_blank=True, help_text="Oddzielone przecinkami, np. UI, UX, frontend"
    )
    keywords_list = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Project
        fields = (
            "id",
            "name",
            "description",
            "user",
            "keywords",
            "keywords_list",
        )

    def get_keywords_list(self, obj):
        return obj.get_keywords_list()



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