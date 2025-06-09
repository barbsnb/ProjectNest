from django.contrib.auth import get_user_model, login, logout
from rest_framework.authentication import SessionAuthentication
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics
from rest_framework import permissions, status

from user_api.models import Survey
from .serializers import ImprovementSuggestionSerializer, UserProjectSerializer, ProjectAnalysisSerializer
from .models import Project, ProjectAnalysis, ImprovementSuggestion
from .services.UserProjectUpdater import UserProjectUpdater
from .services.UserProjectSuggestionsGenerator import UserProjectSuggestionsGenerator
from django.shortcuts import get_object_or_404
import logging

logger = logging.getLogger(__name__)

class UserProject(APIView):
    permission_classes = (permissions.AllowAny,)
    authentication_classes = ()

    def post(self, request):
        serializer = UserProjectSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            project = serializer.instance
            logger.info(f"Project {project.id} created")
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            logger.error(f"Project creation failed with errors: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
class UserProjectDetail(APIView):
    permission_classes = (permissions.AllowAny,)
    authentication_classes = ()

    def get(self, request, project_id):
        try:
            project = Project.objects.get(id=project_id)
            serializer = UserProjectSerializer(project)
            return Response(serializer.data)
        except Project.DoesNotExist:
            return Response({"error": "Project does not exist"}, status=status.HTTP_404_NOT_FOUND)

class ProjectAnalysisGenerate(APIView):
    permission_classes = (permissions.AllowAny,)
    authentication_classes = ()

    def post(self, request, project_id):
        try:
            analysis_data = UserProjectUpdater.update_project_analysis(project_id=project_id)
            return Response(analysis_data, status=status.HTTP_200_OK)
        except Project.DoesNotExist:
            return Response({"error": "Project not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Error generating analysis: {e}")
            return Response({"error": "Error generating analysis"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ProjectSuggestionsGenerate(APIView):
    permission_classes = (permissions.AllowAny,)
    authentication_classes = ()

    def post(self, request, project_id):
        try:
            suggestions_data = UserProjectSuggestionsGenerator.generate_project_suggestions(project_id=project_id)
            return Response(suggestions_data, status=status.HTTP_200_OK)
        except Project.DoesNotExist:
            return Response({"error": "Project not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Error generating suggestions: {e}")
            return Response({"error": "Error generating suggestions"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class KeywordsProjectSuggestionsGenerate(APIView):
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [SessionAuthentication]

    def get(self, request):
        try:
            suggestions_data = UserProjectSuggestionsGenerator.generate_suggestions_for_user_from_keywords(request.user)
            return Response(suggestions_data, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error generating suggestions: {e}")
            return Response({"error": "Error generating suggestions"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ProjectListView(generics.ListAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    authentication_classes = (SessionAuthentication,)
    serializer_class = UserProjectSerializer

    def get(self, request):
        try:
            if request.user.is_authenticated:
                queryset = Project.objects.filter(user=request.user.user_id)
                print(queryset)
                serializer = self.serializer_class(queryset, many=True)
                return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ProjectAnalysisDetailView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request, project_id):
        try:
            analysis = get_object_or_404(ProjectAnalysis, project__id=project_id)
            serializer = ProjectAnalysisSerializer(analysis)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ImprovementSuggestionListView(generics.ListAPIView):
    serializer_class = ImprovementSuggestionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        project_id = self.kwargs.get('project_id')
        return ImprovementSuggestion.objects.filter(project_id=project_id)


# Widok pojedynczej sugestii
class ImprovementSuggestionDetailView(generics.RetrieveAPIView):
    queryset = ImprovementSuggestion.objects.all()
    serializer_class = ImprovementSuggestionSerializer
    permission_classes = [permissions.IsAuthenticated]


class DevelopmentPathView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [SessionAuthentication]
    #add serializer

    def get(self, request):

        projects = Project.objects.get(user=request.user)
        survey = Survey.objects.get(user=request.user)

        all_keywords = []
        for project in projects:
            all_keywords.extend(project.get_keywords_list())

        unique_keywords = list(set(all_keywords))








