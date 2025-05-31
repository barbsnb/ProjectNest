from django.core.exceptions import ValidationError
from django.contrib.auth import get_user_model

UserModel = get_user_model()


from rest_framework.exceptions import ValidationError
from django.contrib.auth import get_user_model

UserModel = get_user_model()

def custom_validation(data):
    email = data.get("email", "").strip()
    username = data.get("username", "").strip()
    password = data.get("password", "").strip()

    errors = {}

    if not email:
        errors["email"] = "Email jest wymagany"
    elif UserModel.objects.filter(email=email).exists():
        errors["email"] = "Ten email już istnieje"

    if not username:
        errors["username"] = "Nazwa użytkownika jest wymagana"

    if not password or len(password) < 8:
        errors["password"] = "Hasło musi mieć co najmniej 8 znaków"

    if errors:
        raise ValidationError(errors)

    return data



def validate_email(data):
    email = data["email"].strip()
    if not email:
        raise ValidationError("an email is needed")
    return True


def validate_username(data):
    username = data["username"].strip()
    if not username:
        raise ValidationError("choose another username")
    return True


def validate_password(data):
    password = data["password"].strip()
    if not password:
        raise ValidationError("a password is needed")
    return True
