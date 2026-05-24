from django.contrib.auth import get_user_model
from rest_framework.exceptions import ValidationError


UserModel = get_user_model()


def custom_validation(data):
    email = (data.get("email") or "").strip()
    username = (data.get("username") or "").strip()
    password = (data.get("password") or "").strip()

    errors = {}

    if not email:
        errors["email"] = "Adres e-mail jest wymagany."
    elif UserModel.objects.filter(email=email).exists():
        errors["email"] = "Ten adres e-mail już istnieje."

    if not username:
        errors["username"] = "Nazwa użytkownika jest wymagana."

    if not password or len(password) < 8:
        errors["password"] = "Hasło musi mieć co najmniej 8 znaków."

    if errors:
        raise ValidationError(errors)

    return data
