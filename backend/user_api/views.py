from django.contrib.auth import get_user_model, login, logout
from rest_framework.authentication import SessionAuthentication
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics
from rest_framework import permissions, status
from .serializers import UserRegisterSerializer, ImprovementSuggestionSerializer, UserLoginSerializer, UserSerializer, UserProjectSerializer, ProjectAnalysisSerializer
from .validations import custom_validation, validate_email, validate_password
from .models import Project, ProjectAnalysis, ImprovementSuggestion
from django.shortcuts import get_object_or_404
import logging


# Inicjalizacja loggera
logger = logging.getLogger(__name__)
User = get_user_model()


class UserRegister(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        clean_data = custom_validation(request.data)
        serializer = UserRegisterSerializer(data=clean_data)
        if serializer.is_valid(raise_exception=True):
            user = serializer.create(clean_data)
            if user:
                return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(status=status.HTTP_400_BAD_REQUEST)


class UserLogin(APIView):
    permission_classes = (permissions.AllowAny,)
    authentication_classes = (SessionAuthentication,)

    ##
    def post(self, request):
        data = request.data
        assert validate_email(data)
        assert validate_password(data)
        serializer = UserLoginSerializer(data=data)
        if serializer.is_valid(raise_exception=True):
            user = serializer.check_user(data)
            login(request, user)
            # print(f"W post user login {serializer.data}")
            return Response(serializer.data, status=status.HTTP_200_OK)


class UserLogout(APIView):
    permission_classes = (permissions.AllowAny,)
    authentication_classes = ()

    def post(self, request):
        logout(request)
        return Response(status=status.HTTP_200_OK)


class UserView(APIView):
    permission_classes = (permissions.IsAuthenticated,)
    authentication_classes = (SessionAuthentication,)

    ##
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response({"user": serializer.data}, status=status.HTTP_200_OK)


class UserProject(APIView):
    permission_classes = (permissions.AllowAny,)
    authentication_classes = ()

    def post(self, request):
        serializer = UserProjectSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            logger.info("Data saved successfully")

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