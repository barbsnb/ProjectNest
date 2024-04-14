# do przekształcania danych modeli django na forme przesylana przez siec 
from rest_framework import serializers
from django.contrib.auth import get_user_model, authenticate
from .models import Visit

#konteneryzacja danych do formatu json

UserModel = get_user_model()

class UserRegisterSerializer(serializers.ModelSerializer):
	class Meta:
		model = UserModel
		fields = fields = ['email', 'password', 'username', 'first_name', 'last_name', 'phone_number', 'dormitory', 'room_number']
	def create(self, validated_data):
		user_obj = UserModel.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            username=validated_data['username'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            phone_number=validated_data['phone_number'],
            dormitory=validated_data['dormitory'],
            room_number=validated_data['room_number']
        )
		user_obj.save()
		return user_obj

class UserLoginSerializer(serializers.Serializer):
	email = serializers.EmailField()
	password = serializers.CharField()
	##
	def check_user(self, clean_data):
		user = authenticate(
      	username=clean_data['email'], 
       	password=clean_data['password']
        
        )
		if not user:
			raise ValueError('user not found')
		return user

class UserSerializer(serializers.ModelSerializer):
	class Meta:
		model = UserModel
		fields = (
      		'email', 
        	'username', 
			'first_name', 
			'last_name', 
			'phone_number', 
			'dormitory', 
			'room_number')
  
class UserVisitSerializer(serializers.ModelSerializer):
    class Meta:
        model = Visit
        fields = (
            'start_date', 
            'start_time', 
            'end_date', 
            'end_time', 
            'guest_first_name', 
            'guest_last_name', 
            'guest_phone_nr', 
            'guest_email'
            )