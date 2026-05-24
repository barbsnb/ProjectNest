from django.contrib.auth import get_user_model
from rest_framework.exceptions import ValidationError


UserModel = get_user_model()


def custom_validation(data):
    email = (data.get("email") or "").strip()
    username = (data.get("username") or "").strip()
    password = (data.get("password") or "").strip()

    errors = {}

    if not email:
        errors["email"] = "Email jest wymagany."
    elif UserModel.objects.filter(email=email).exists():
        errors["email"] = "Ten email juz istnieje."

    if not username:
        errors["username"] = "Nazwa uzytkownika jest wymagana."

    if not password or len(password) < 8:
        errors["password"] = "Haslo musi miec co najmniej 8 znakow."

    if errors:
        raise ValidationError(errors)

    return data
