from django.contrib.auth import get_user_model, login, logout
from rest_framework.authentication import SessionAuthentication, TokenAuthentication
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics
from .serializers import UserRegisterSerializer, UserLoginSerializer, UserSerializer
from rest_framework import permissions, status
from .validations import custom_validation, validate_email, validate_password
from .models import Visit, AppUser, VisitExtension
from .serializers import UserVisitSerializer, VisitExtensionSerializer
from datetime import timedelta
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
        # print(f"Request: {request}")
        # print(f"Before serializer: {request.user}")
        serializer = UserSerializer(request.user)
        # print(f"After serializer: {serializer.data}")
        return Response({"user": serializer.data}, status=status.HTTP_200_OK)


class UserVisit(APIView):
    permission_classes = (permissions.AllowAny,)
    authentication_classes = ()

    def post(self, request):
        serializer = UserVisitSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            logger.info("Data saved successfully")
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            logger.error(f"Data validation error: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class VisitListView(generics.ListAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    authentication_classes = (SessionAuthentication,)
    serializer_class = UserVisitSerializer

    def get(self, request):
        try:
            if request.user.is_authenticated:
                queryset = Visit.objects.filter(user=request.user.user_id)
                print(queryset)
                serializer = self.serializer_class(queryset, many=True)
                return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class AllVisitListView(APIView):
    permission_classes = (permissions.IsAuthenticated,)
    authentication_classes = (SessionAuthentication,)

    def get(self, request):
            try:
                if not request.user.is_authenticated:
                    return Response({"error": "User not authenticated"}, status=status.HTTP_401_UNAUTHORIZED)
                
                if not request.user.is_receptionist:
                    return Response({"error": "User is not a receptionist"}, status=status.HTTP_403_FORBIDDEN)
                
                visits = Visit.objects.filter(dormitory=request.user.dormitory)
                serializer = UserVisitSerializer(visits, many=True)
                return Response(serializer.data, status=status.HTTP_200_OK)
            
            except Exception as e:
                logger.error(f"Error fetching visit list: {e}")
                return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class RequestVisitExtension(APIView):
    permission_classes = (permissions.AllowAny,)
    authentication_classes = ()

    def post(self, request):
        logger.info(f"Received data: {request.data}")
        serializer = VisitExtensionSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            logger.info("Data saved successfully")
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            logger.error(f"Data validation error: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AllVisitExtensionListView(APIView):
    permission_classes = (permissions.AllowAny,)
    authentication_classes = ()

    def get(self, request):
        try:
            if request:
                if request:
                    requests = VisitExtension.objects.all()
                    serializer = VisitExtensionSerializer(requests, many=True)
                    return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ApproveRejectExtension(APIView):
    permission_classes = (permissions.AllowAny,)
    authentication_classes = ()

    def put(self, request, extension_id, action):
        try:
            extension = VisitExtension.objects.get(pk=extension_id)
        except VisitExtension.DoesNotExist:
            return Response(
                {"error": "Extension not found"}, status=status.HTTP_404_NOT_FOUND
            )

        comment = request.data.get("comment", "")

        if action == "approve":
            extension.status = "Approved"
            extension.visit.extend_visit()
        elif action == "reject":
            extension.status = "Rejected"
        else:
            return Response(
                {"error": "Invalid action"}, status=status.HTTP_400_BAD_REQUEST
            )

        extension.comment = comment
        extension.save()
        return Response(
            VisitExtensionSerializer(extension).data, status=status.HTTP_200_OK
        )


class UserDetailView(generics.RetrieveAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = (permissions.IsAuthenticated,)


# class VisitListView(generics.ListCreateAPIView):
#     permission_classes = (permissions.IsAuthenticated,)
#     authentication_classes = (SessionAuthentication,)
#     queryset = Visit.objects.all()
#     serializer_class = VisitSerializer

#     def list(self, request):
#         queryset = self.get_queryset()
#         serializer = UserSerializer(queryset, many=True)
#         return Response({serializer.data}, status=status.HTTP_200_OK)

# class VisitDetailView(generics.RetrieveUpdateDestroyAPIView):
#     permission_classes = (permissions.IsAuthenticated,)
#     authentication_classes = (SessionAuthentication,)
#     queryset = Visit.objects.all()
#     serializer_class = VisitSerializer

#     def list(self, request):
#         queryset = self.get_queryset()
#         serializer = UserSerializer(queryset, many=True)
#         return Response({serializer.data}, status=status.HTTP_200_OK)

# class VisitFormView(APIView):
#     def upload_form(request):
#         form = VisitForm(request.POST)
