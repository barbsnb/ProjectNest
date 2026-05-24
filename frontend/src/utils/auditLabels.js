export const severityLabels = {
  critical: "Krytyczne",
  high: "Wysokie",
  medium: "Średnie",
  low: "Niskie",
  info: "Informacyjne",
};

export const statusLabels = {
  queued: "W kolejce",
  ingesting: "Indeksowanie",
  analyzing: "Analiza",
  completed: "Zakończone",
  failed: "Błąd",
  not_started: "Nie rozpoczęto",
  new: "Nowe",
  accepted: "Zaakceptowane",
  ignored: "Zignorowane",
  fixed: "Naprawione",
  in_progress: "W trakcie",
  done: "Zrealizowane",
};

export const sourceLabels = {
  tool: "Narzędzie",
  ai: "Agent AI",
};

export const categoryLabels = {
  architecture: "Architektura",
  code_quality: "Jakość kodu",
  dependencies: "Zależności",
  documentation: "Dokumentacja",
  performance: "Wydajność",
  repo_metrics: "Metryki repozytorium",
  security: "Bezpieczeństwo",
  testing_reliability: "Testy i niezawodność",
};

export const priorityLabels = {
  high: "Wysoki",
  medium: "Średni",
  low: "Niski",
};

export const agentLabels = {
  "Security Auditor": "Audytor bezpieczeństwa",
  "Audytor bezpieczeństwa": "Audytor bezpieczeństwa",
  "Architecture Reviewer": "Recenzent architektury",
  "Recenzent architektury": "Recenzent architektury",
  "Code Quality Reviewer": "Recenzent jakości kodu",
  "Recenzent jakości kodu": "Recenzent jakości kodu",
  "Testing and Reliability Reviewer": "Recenzent testów i niezawodności",
  "Recenzent testów i niezawodności": "Recenzent testów i niezawodności",
  secret_pattern_scan: "Skan sekretów",
  dependency_manifest_detection: "Wykrywanie manifestów zależności",
  npm_audit: "Audyt npm",
  python_dependency_audit: "Audyt zależności Python",
  repo_metrics: "Metryki repozytorium",
  deterministic_tool: "Narzędzie deterministyczne",
};

export const labelOrValue = (labels, value) => labels[value] || value || "-";
