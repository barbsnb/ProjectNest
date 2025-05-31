# do przekształcania danych modeli django na forme przesylana przez siec
from rest_framework import serializers
from django.contrib.auth import get_user_model, authenticate


# konteneryzacja danych do formatu json

UserModel = get_user_model()


class UserRegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserModel
        fields = [
            "email",
            "username",
            "password",
            "survey"
        ]
        extra_kwargs = {
            "password": {"write_only": True}
        }

    def create(self, validated_data):
        survey_data = validated_data.pop("survey", None)

        user_obj = UserModel.objects.create_user(
            email=validated_data["email"],
            password=validated_data["password"],
            username=validated_data["username"],
        )

        if survey_data:
            user_obj.survey = survey_data
            user_obj.save()

        return user_obj


class UserLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()

    ##
    def check_user(self, clean_data):
        user = authenticate(
            username=clean_data["email"], password=clean_data["password"]
        )
        if not user:
            raise ValueError("user not found")
        return user

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserModel
        fields = (
            "user_id",
            "email",
            "username",
        )




