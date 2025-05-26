from django.db import models
from django.contrib.auth.base_user import BaseUserManager
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django import forms
from datetime import timedelta



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

class Project(models.Model):
    name = models.CharField(max_length=255, verbose_name="Nazwa projektu")
    description = models.TextField(verbose_name="Opis projektu")
    user = models.ForeignKey("AppUser", on_delete=models.CASCADE)

    def __str__(self):
        return self.name
    
class ChatSession(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="chat_sessions")
    created_at = models.DateTimeField(auto_now_add=True)
    title = models.CharField(max_length=255, default="Nowa rozmowa")

    def __str__(self):
        return f"{self.title} - {self.project.name}"


class Message(models.Model):
    CHAT_SENDER_CHOICES = [
        ("user", "Użytkownik"),
        ("ai", "Asystent AI"),
    ]

    session = models.ForeignKey(ChatSession, on_delete=models.CASCADE, related_name="messages")
    sender = models.CharField(max_length=10, choices=CHAT_SENDER_CHOICES)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.sender} @ {self.timestamp}: {self.content[:30]}"




