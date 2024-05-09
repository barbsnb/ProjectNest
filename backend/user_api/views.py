from django.contrib.auth import get_user_model, login, logout
from rest_framework.authentication import SessionAuthentication
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics
from .serializers import UserRegisterSerializer, UserLoginSerializer, UserSerializer
from rest_framework import permissions, status
from .validations import custom_validation, validate_email, validate_password
from .models import Visit
from .serializers import UserVisitSerializer
import logging

# Inicjalizacja loggera
logger = logging.getLogger(__name__)

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
			#print(f"W post user login {serializer.data}")
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
		#print(f"Request: {request}")
		#print(f"Before serializer: {request.user}")
		serializer = UserSerializer(request.user)
		# print(f"After serializer: {serializer.data}")
		return Response({'user': serializer.data}, status=status.HTTP_200_OK)

class UserVisit(APIView):
    permission_classes = (permissions.AllowAny,)
    authentication_classes = ()
    
    def post(self, request):
        logger.info(f"Received POST request: {request.data}")
        
        serializer = UserVisitSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            logger.info("Data saved successfully")
            
            serializer.data.dormitory = request.data.user.dormitory #nie wiem czy ok - nadanie kolumnie dormitory tej samej wartosci co użytkownik zalogowany
            
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
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class AllVisitListView(APIView):
    permission_classes = (permissions.IsAuthenticated,)
    authentication_classes = (SessionAuthentication,)
    
    def get(self, request):
        try:
            if request.user.is_authenticated:
                if request.user.is_receptionist:
                    print("sdasd")
                    print(request.user.dormitory)
                    visits = Visit.objects.filter(dormitory=request.user.dormitory)
                    serializer = UserVisitSerializer(visits, many=True)
                    return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

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



