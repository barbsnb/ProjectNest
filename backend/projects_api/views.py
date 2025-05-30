from django.contrib.auth import get_user_model, login, logout
from rest_framework.authentication import SessionAuthentication
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics
from rest_framework import permissions, status
from .serializers import ImprovementSuggestionSerializer, UserProjectSerializer, ProjectAnalysisSerializer
from .models import Project, ProjectAnalysis, ImprovementSuggestion
from .services.UserProjectUpdater import UserProjectUpdater
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
            project = serializer.instance  # get the saved Project instance

            # Automatically update/create the related ProjectAnalysis
            try:
                UserProjectUpdater.update_project_analysis(
                    project_id=project.id
                )
                logger.info(f"ProjectAnalysis initialized for project id {project.id}")
            except Exception as e:
                logger.exception(f"Failed to initialize ProjectAnalysis for project id {project.id}: {str(e)}")

            logger.info("Project saved successfully")
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            logger.error(f"Data validation error: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

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