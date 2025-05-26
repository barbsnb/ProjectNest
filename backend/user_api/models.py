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

class ProjectAnalysis(models.Model):
    project = models.OneToOneField(Project, on_delete=models.CASCADE, related_name="analysis")

    # A. Jakość kodu
    readability = models.TextField(verbose_name="Czytelność (nazewnictwo, komentarze, formatowanie)", blank=True)
    structure = models.TextField(verbose_name="Struktura kodu", blank=True)
    principles = models.TextField(verbose_name="DRY / KISS / YAGNI", blank=True)

    # B. Architektura i projekt
    modularity = models.TextField(verbose_name="Modularność", blank=True)
    extensibility = models.TextField(verbose_name="Rozszerzalność", blank=True)
    design_patterns = models.TextField(verbose_name="Wzorce projektowe i spójność", blank=True)

    # C. Bezpieczeństwo
    input_validation = models.TextField(verbose_name="Walidacja danych wejściowych", blank=True)
    permission_management = models.TextField(verbose_name="Zarządzanie uprawnieniami", blank=True)
    vulnerabilities = models.TextField(verbose_name="Unikanie podatności (SQLi, XSS itp.)", blank=True)

    # D. Testowalność
    test_coverage = models.TextField(verbose_name="Pokrycie testami", blank=True)
    test_quality = models.TextField(verbose_name="Jakość testów", blank=True)
    test_automation = models.TextField(verbose_name="Automatyzacja testów", blank=True)

    # E. Wydajność
    performance = models.TextField(verbose_name="Złożoność / Efektywność", blank=True)

    # F. Dokumentacja
    comments_quality = models.TextField(verbose_name="Komentarze w kodzie", blank=True)
    documentation = models.TextField(verbose_name="README / dokumentacja techniczna", blank=True)
    installation_instructions = models.TextField(verbose_name="Instrukcja uruchomienia", blank=True)

    # G. Dobre praktyki
    coding_style = models.TextField(verbose_name="Styl kodowania (PEP8 itp.)", blank=True)
    tools_usage = models.TextField(verbose_name="CI/CD, lintery, formattery", blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Analiza: {self.project.name}"



