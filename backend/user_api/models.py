from django.db import models
from django.contrib.auth.base_user import BaseUserManager
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.db.models import JSONField
from django.conf import settings

class AppUserManager(BaseUserManager):
    def create_user(self, email, username, password=None):
        if not email:
            raise ValueError("Email jest wymagany")
        if not username:
            raise ValueError("Nazwa użytkownika jest wymagana")

        email = self.normalize_email(email)
        user = self.model(
            email=email,
            username=username,
        )
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, username, password=None):
        user = self.create_user(email, username, password)
        user.is_superuser = True
        user.is_staff = True
        user.save(using=self._db)
        return user


class AppUser(AbstractBaseUser, PermissionsMixin):
    user_id = models.AutoField(primary_key=True)
    email = models.EmailField(max_length=50, unique=True)
    username = models.CharField(max_length=50, unique=True)
    
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    objects = AppUserManager()

    def __str__(self):
        return f"{self.username} ({self.email})"

class Survey(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='survey')

    direction = models.JSONField(blank=True, null=True)
    focus = models.JSONField(blank=True, null=True)
    experience = models.CharField(max_length=100, blank=True, null=True)
    time_available = models.CharField(max_length=100, blank=True, null=True)
    challenges = models.JSONField(blank=True, null=True)
    technologies = models.JSONField(blank=True, null=True)

    def __str__(self):
        return f"Survey for {self.user.username}"

