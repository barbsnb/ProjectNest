from django.db import models
from django.conf import settings


class Project(models.Model):
    name = models.CharField(max_length=255, verbose_name="Nazwa projektu")
    description = models.TextField(verbose_name="Opis projektu")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

    keywords = models.TextField(
        verbose_name="Słowa kluczowe z projektu",
        blank=True,
        help_text="Oddzielone przecinkami, np. UI, UX, frontend, React, Django, backend")

    def __str__(self):
        return self.name

    def get_keywords_list(self):
        if not self.keywords:
            return []
        return [k.strip() for k in self.keywords.split(',')]


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


class ImprovementSuggestion(models.Model):
    PRIORITY_CHOICES = [
        ('low', 'Niski'),
        ('medium', 'Średni'),
        ('high', 'Wysoki'),
    ]

    STATUS_CHOICES = [
        ('new', 'Nowa'),
        ('in_progress', 'W trakcie'),
        ('done', 'Zrealizowana'),
    ]

    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="improvement_suggestions")
    title = models.CharField(max_length=255, verbose_name="Tytuł sugestii")
    description = models.TextField(verbose_name="Opis sugestii")
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium', verbose_name="Priorytet")
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='new', verbose_name="Status")
    recommendations = models.TextField(verbose_name="Rekomendacje")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} ({self.get_priority_display()})"


