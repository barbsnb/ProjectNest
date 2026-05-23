from django.db import models
from django.conf import settings
from django.utils import timezone


class Project(models.Model):
    name = models.CharField(max_length=255, verbose_name="Nazwa projektu")
    description = models.TextField(verbose_name="Opis projektu", blank=True, default="")
    repo_url = models.URLField(verbose_name="URL repozytorium GitHub", blank=True)
    default_branch = models.CharField(max_length=255, blank=True)
    last_commit_sha = models.CharField(max_length=64, blank=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class RepositorySnapshot(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="repository_snapshots")
    commit_sha = models.CharField(max_length=64, blank=True)
    branch = models.CharField(max_length=255, blank=True)
    file_count = models.PositiveIntegerField(default=0)
    total_size_bytes = models.PositiveIntegerField(default=0)
    included_files = models.JSONField(default=list, blank=True)
    ignored_files = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Snapshot {self.project.name} @ {self.commit_sha[:7] or self.branch}"


class AnalysisRun(models.Model):
    STATUS_QUEUED = "queued"
    STATUS_INGESTING = "ingesting"
    STATUS_ANALYZING = "analyzing"
    STATUS_COMPLETED = "completed"
    STATUS_FAILED = "failed"

    STATUS_CHOICES = [
        (STATUS_QUEUED, "Queued"),
        (STATUS_INGESTING, "Ingesting"),
        (STATUS_ANALYZING, "Analyzing"),
        (STATUS_COMPLETED, "Completed"),
        (STATUS_FAILED, "Failed"),
    ]

    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="analysis_runs")
    snapshot = models.ForeignKey(
        RepositorySnapshot,
        on_delete=models.SET_NULL,
        related_name="analysis_runs",
        blank=True,
        null=True,
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_QUEUED)
    started_at = models.DateTimeField(default=timezone.now)
    finished_at = models.DateTimeField(blank=True, null=True)
    error_message = models.TextField(blank=True)
    score_total = models.PositiveSmallIntegerField(default=100)

    class Meta:
        ordering = ["-started_at"]

    def __str__(self):
        return f"AnalysisRun {self.id} for {self.project.name} ({self.status})"


class Finding(models.Model):
    SEVERITY_CRITICAL = "critical"
    SEVERITY_HIGH = "high"
    SEVERITY_MEDIUM = "medium"
    SEVERITY_LOW = "low"
    SEVERITY_INFO = "info"

    SEVERITY_CHOICES = [
        (SEVERITY_CRITICAL, "Critical"),
        (SEVERITY_HIGH, "High"),
        (SEVERITY_MEDIUM, "Medium"),
        (SEVERITY_LOW, "Low"),
        (SEVERITY_INFO, "Info"),
    ]

    STATUS_NEW = "new"
    STATUS_ACCEPTED = "accepted"
    STATUS_FIXED = "fixed"
    STATUS_IGNORED = "ignored"

    STATUS_CHOICES = [
        (STATUS_NEW, "New"),
        (STATUS_ACCEPTED, "Accepted"),
        (STATUS_FIXED, "Fixed"),
        (STATUS_IGNORED, "Ignored"),
    ]

    SOURCE_TOOL = "tool"
    SOURCE_AI = "ai"

    SOURCE_CHOICES = [
        (SOURCE_TOOL, "Tool"),
        (SOURCE_AI, "AI"),
    ]

    run = models.ForeignKey(AnalysisRun, on_delete=models.CASCADE, related_name="findings")
    source = models.CharField(max_length=20, choices=SOURCE_CHOICES, default=SOURCE_TOOL)
    agent_name = models.CharField(max_length=120, blank=True)
    category = models.CharField(max_length=80)
    severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES)
    title = models.CharField(max_length=255)
    description = models.TextField()
    file_path = models.CharField(max_length=1024, blank=True)
    line_start = models.PositiveIntegerField(blank=True, null=True)
    evidence = models.TextField(blank=True)
    recommendation = models.TextField()
    confidence = models.FloatField(default=0.8)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_NEW)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["severity", "category", "file_path", "line_start", "id"]

    def __str__(self):
        return f"{self.severity}: {self.title}"


class AgentResult(models.Model):
    run = models.ForeignKey(AnalysisRun, on_delete=models.CASCADE, related_name="agent_results")
    agent_name = models.CharField(max_length=120)
    status = models.CharField(max_length=20, choices=AnalysisRun.STATUS_CHOICES, default=AnalysisRun.STATUS_COMPLETED)
    model = models.CharField(max_length=120, blank=True)
    prompt_version = models.CharField(max_length=80, blank=True)
    summary = models.TextField(blank=True)
    raw_output = models.JSONField(default=dict, blank=True)
    normalized_output = models.JSONField(default=dict, blank=True)
    started_at = models.DateTimeField(default=timezone.now)
    finished_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(default=timezone.now)
    error_message = models.TextField(blank=True)

    class Meta:
        ordering = ["agent_name", "id"]

    def __str__(self):
        return f"{self.agent_name} ({self.status})"


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
