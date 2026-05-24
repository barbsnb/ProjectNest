from collections import Counter
from pathlib import PurePosixPath
from tempfile import TemporaryDirectory
from django.utils import timezone
import json
import logging
import subprocess
import re

from projects_api.models import AgentResult, AnalysisRun, Finding
from projects_api.services.agent_orchestrator import deduplicate_findings, run_agent_review
from projects_api.services.repo_ingestion import (
    RepoIngestionError,
    ingest_project_repository,
    load_repository_text_files,
)


logger = logging.getLogger(__name__)

SECRET_PATTERNS = [
    ("klucz dostępu AWS", re.compile(r"\bAKIA[0-9A-Z]{16}\b")),
    ("klucz API OpenAI", re.compile(r"\bsk(?:-proj)?-[A-Za-z0-9_-]{20,}\b")),
    ("token GitHub", re.compile(r"\bgh[pousr]_[A-Za-z0-9_]{36,255}\b")),
    ("klucz API Google", re.compile(r"\bAIza[0-9A-Za-z_-]{35}\b")),
    ("nagłówek klucza prywatnego", re.compile(r"-----BEGIN [A-Z ]*PRIVATE KEY-----")),
]

DEPENDENCY_MANIFESTS = {
    "package.json": "Manifest pakietów Node.js",
    "package-lock.json": "Zablokowany graf zależności Node.js",
    "yarn.lock": "Zablokowany graf zależności Yarn",
    "pnpm-lock.yaml": "Zablokowany graf zależności pnpm",
    "requirements.txt": "Lista zależności Python",
    "pyproject.toml": "Manifest projektu Python",
    "Pipfile": "Manifest Pipenv dla Python",
    "poetry.lock": "Zablokowany graf zależności Poetry",
}

LANGUAGE_BY_EXTENSION = {
    ".css": "CSS",
    ".go": "Go",
    ".html": "HTML",
    ".java": "Java",
    ".js": "JavaScript",
    ".jsx": "JavaScript",
    ".kt": "Kotlin",
    ".php": "PHP",
    ".py": "Python",
    ".rb": "Ruby",
    ".rs": "Rust",
    ".ts": "TypeScript",
    ".tsx": "TypeScript",
}

SEVERITY_PENALTIES = {
    Finding.SEVERITY_CRITICAL: 25,
    Finding.SEVERITY_HIGH: 15,
    Finding.SEVERITY_MEDIUM: 7,
    Finding.SEVERITY_LOW: 3,
    Finding.SEVERITY_INFO: 0,
}


def execute_analysis_run(project):
    run = AnalysisRun.objects.create(project=project, status=AnalysisRun.STATUS_QUEUED)

    try:
        snapshot = _ensure_snapshot(project, run)
        run.snapshot = snapshot
        run.status = AnalysisRun.STATUS_ANALYZING
        run.save(update_fields=["snapshot", "status"])

        files = load_repository_text_files(project)
        findings = []

        findings.extend(_scan_secret_patterns(run, files))
        findings.extend(_detect_dependency_manifests(run, files))
        findings.extend(_run_npm_audit(run, files))
        findings.extend(_record_python_dependency_placeholder(run, files))
        _record_repo_metrics(run, snapshot, files)

        findings = [_ensure_tool_finding(finding) for finding in findings]
        findings.extend(run_agent_review(run, project, snapshot, files, findings))
        findings = deduplicate_findings(findings)

        Finding.objects.bulk_create([Finding(run=run, **finding) for finding in findings])

        run.score_total = _calculate_score(findings)
        run.status = AnalysisRun.STATUS_COMPLETED
        run.finished_at = timezone.now()
        run.save(update_fields=["score_total", "status", "finished_at"])
    except RepoIngestionError as exc:
        _fail_run(run, exc.message)
    except Exception as exc:
        logger.exception("Nieoczekiwany błąd analizy projektu %s.", project.id)
        _fail_run(run, "Wystąpił nieoczekiwany błąd analizy.")

    return run


def _ensure_snapshot(project, run):
    run.status = AnalysisRun.STATUS_INGESTING
    run.save(update_fields=["status"])

    snapshot = project.repository_snapshots.first()
    if snapshot:
        return snapshot
    return ingest_project_repository(project)


def _scan_secret_patterns(run, files):
    started_at = timezone.now()
    findings = []
    scanned_lines = 0

    for file_data in files:
        path = file_data["path"]
        for line_number, line in enumerate(file_data.get("content", "").splitlines(), start=1):
            scanned_lines += 1
            for label, pattern in SECRET_PATTERNS:
                match = pattern.search(line)
                if not match:
                    continue
                findings.append(
                    {
                        "category": "security",
                        "severity": Finding.SEVERITY_CRITICAL,
                        "title": f"Wykryto potencjalny sekret: {label}",
                        "description": "Deterministyczny skaner znalazł w kodzie wzorzec przypominający sekret.",
                        "file_path": path,
                        "line_start": line_number,
                        "evidence": _mask_secret_match(label, match.group(0)),
                        "recommendation": (
                            "Usuń wartość z historii gita, zrotuj poświadczenie i ładuj je z menedżera sekretów "
                            "albo ze zmiennej środowiskowej."
                        ),
                        "confidence": 0.95,
                    }
                )

    AgentResult.objects.create(
        run=run,
        agent_name="secret_pattern_scan",
        status=AnalysisRun.STATUS_COMPLETED,
        summary=f"Przeskanowano {len(files)} plików i {scanned_lines} linii pod kątem sekretów wysokiego ryzyka.",
        raw_output={"findings_count": len(findings), "scanned_files": len(files), "scanned_lines": scanned_lines},
        normalized_output={"findings_count": len(findings)},
        prompt_version="deterministic-v1",
        started_at=started_at,
        finished_at=timezone.now(),
    )
    return findings


def _detect_dependency_manifests(run, files):
    started_at = timezone.now()
    findings = []
    manifests = []

    for file_data in files:
        name = PurePosixPath(file_data["path"]).name
        if name not in DEPENDENCY_MANIFESTS:
            continue

        manifests.append(file_data["path"])
        findings.append(
            {
                "category": "dependencies",
                "severity": Finding.SEVERITY_INFO,
                "title": f"Wykryto manifest zależności: {name}",
                "description": DEPENDENCY_MANIFESTS[name],
                "file_path": file_data["path"],
                "line_start": None,
                "evidence": f"{name} znajduje się w zindeksowanym snapshocie repozytorium.",
                "recommendation": (
                    "Utrzymuj zależności w plikach lock, regularnie je przeglądaj i obejmij automatycznym "
                    "skanowaniem podatności."
                ),
                "confidence": 0.9,
            }
        )

    AgentResult.objects.create(
        run=run,
        agent_name="dependency_manifest_detection",
        status=AnalysisRun.STATUS_COMPLETED,
        summary=f"Wykryto {len(manifests)} plików manifestów zależności.",
        raw_output={"manifests": manifests},
        normalized_output={"findings_count": len(findings), "manifests": manifests},
        prompt_version="deterministic-v1",
        started_at=started_at,
        finished_at=timezone.now(),
    )
    return findings


def _run_npm_audit(run, files):
    started_at = timezone.now()
    package_lock = _find_file(files, "package-lock.json")
    package_json = _find_sibling_package_json(files, package_lock)

    if not package_lock:
        AgentResult.objects.create(
            run=run,
            agent_name="npm_audit",
            status=AnalysisRun.STATUS_COMPLETED,
            summary="Nie wykryto pliku package-lock.json.",
            raw_output={"skipped": True, "reason": "missing_package_lock"},
            normalized_output={"findings_count": 0},
            prompt_version="deterministic-v1",
            started_at=started_at,
            finished_at=timezone.now(),
        )
        return []

    if not package_json:
        AgentResult.objects.create(
            run=run,
            agent_name="npm_audit",
            status=AnalysisRun.STATUS_FAILED,
            summary="Wykryto package-lock.json, ale brakuje odpowiadającego pliku package.json.",
            raw_output={"skipped": True, "reason": "missing_package_json", "package_lock": package_lock["path"]},
            normalized_output={"findings_count": 0},
            prompt_version="deterministic-v1",
            started_at=started_at,
            finished_at=timezone.now(),
            error_message="npm audit wymaga pliku package.json obok package-lock.json.",
        )
        return []

    try:
        audit_data = _execute_npm_audit(package_json, package_lock)
    except Exception as exc:
        AgentResult.objects.create(
            run=run,
            agent_name="npm_audit",
            status=AnalysisRun.STATUS_FAILED,
            summary="Nie udało się zakończyć npm audit.",
            raw_output={"package_lock": package_lock["path"]},
            normalized_output={"findings_count": 0},
            prompt_version="deterministic-v1",
            started_at=started_at,
            finished_at=timezone.now(),
            error_message=str(exc),
        )
        return []

    vulnerabilities = audit_data.get("vulnerabilities", {})
    findings = []
    for package_name, vulnerability in list(vulnerabilities.items())[:20]:
        severity = _normalize_npm_severity(vulnerability.get("severity"))
        via = vulnerability.get("via", [])
        title = _npm_vulnerability_title(package_name, via)
        findings.append(
            {
                "category": "dependencies",
                "severity": severity,
                "title": title,
                "description": (
                    f"npm audit zgłosił problem o poziomie {_npm_severity_label(vulnerability.get('severity'))} "
                    f"w pakiecie {package_name}."
                ),
                "file_path": package_lock["path"],
                "line_start": None,
                "evidence": f"Pakiet: {package_name}; zakres: {vulnerability.get('range', 'nieznany')}",
                "recommendation": "Sprawdź podatny pakiet i wykonaj kontrolowaną aktualizację zależności albo npm audit fix.",
                "confidence": 0.9,
            }
        )

    metadata = audit_data.get("metadata", {})
    AgentResult.objects.create(
        run=run,
        agent_name="npm_audit",
        status=AnalysisRun.STATUS_COMPLETED,
        summary=f"npm audit zgłosił {len(vulnerabilities)} podatnych pakietów.",
        raw_output={
            "package_lock": package_lock["path"],
            "vulnerabilities": metadata.get("vulnerabilities", {}),
            "reported_packages": list(vulnerabilities.keys())[:50],
        },
        normalized_output={"findings_count": len(findings)},
        prompt_version="deterministic-v1",
        started_at=started_at,
        finished_at=timezone.now(),
    )
    return findings


def _record_python_dependency_placeholder(run, files):
    started_at = timezone.now()
    python_manifests = [
        file_data for file_data in files if PurePosixPath(file_data["path"]).name in {"requirements.txt", "pyproject.toml"}
    ]
    findings = []

    for file_data in python_manifests:
        findings.append(
            {
                "category": "dependencies",
                "severity": Finding.SEVERITY_INFO,
                "title": "Audyt zależności Python wymaga konfiguracji",
                "description": (
                    "W repozytorium wykryto manifest zależności Python, ale lokalny skaner podatności "
                    "nie jest jeszcze skonfigurowany."
                ),
                "file_path": file_data["path"],
                "line_start": None,
                "evidence": f"Wykryto {PurePosixPath(file_data['path']).name}.",
                "recommendation": "Dodaj integrację pip-audit albo Safety w etapie audytu zależności.",
                "confidence": 0.7,
            }
        )

    AgentResult.objects.create(
        run=run,
        agent_name="python_dependency_audit",
        status=AnalysisRun.STATUS_COMPLETED,
        summary=f"Zapisano informację o {len(python_manifests)} manifestach Python wymagających audytu.",
        raw_output={"manifests": [file_data["path"] for file_data in python_manifests]},
        normalized_output={"findings_count": len(findings)},
        prompt_version="deterministic-v1",
        started_at=started_at,
        finished_at=timezone.now(),
    )
    return findings


def _record_repo_metrics(run, snapshot, files):
    started_at = timezone.now()
    languages = Counter()
    for file_data in files:
        extension = PurePosixPath(file_data["path"]).suffix.lower()
        language = LANGUAGE_BY_EXTENSION.get(extension, extension.lstrip(".") or "Inne")
        languages[language] += 1

    largest_files = sorted(
        (
            {
                "path": file_data["path"],
                "size_bytes": file_data.get("size_bytes", 0),
                "line_count": file_data.get("line_count", 0),
            }
            for file_data in files
        ),
        key=lambda item: item["size_bytes"],
        reverse=True,
    )[:10]

    AgentResult.objects.create(
        run=run,
        agent_name="repo_metrics",
        status=AnalysisRun.STATUS_COMPLETED,
        summary=f"Zindeksowano {snapshot.file_count} plików tekstowych i {snapshot.total_size_bytes} bajtów.",
        raw_output={
            "file_count": snapshot.file_count,
            "total_size_bytes": snapshot.total_size_bytes,
            "languages": dict(languages),
            "largest_files": largest_files,
            "ignored_files_count": len(snapshot.ignored_files),
        },
        normalized_output={
            "languages": dict(languages),
            "largest_files_count": len(largest_files),
        },
        prompt_version="deterministic-v1",
        started_at=started_at,
        finished_at=timezone.now(),
    )


def _execute_npm_audit(package_json, package_lock):
    with TemporaryDirectory(prefix="praetor-npm-audit-") as temp_dir:
        package_json_path = f"{temp_dir}/package.json"
        package_lock_path = f"{temp_dir}/package-lock.json"

        with open(package_json_path, "w", encoding="utf-8") as file:
            file.write(package_json.get("content", ""))
        with open(package_lock_path, "w", encoding="utf-8") as file:
            file.write(package_lock.get("content", ""))

        result = subprocess.run(
            ["npm", "audit", "--json", "--omit=dev"],
            cwd=temp_dir,
            capture_output=True,
            text=True,
            timeout=30,
            check=False,
        )

    output = result.stdout or result.stderr
    if not output:
        raise RuntimeError("npm audit nie zwrócił wyniku.")

    try:
        return json.loads(output)
    except json.JSONDecodeError as exc:
        raise RuntimeError(f"npm audit zwrócił wynik, który nie jest poprawnym JSON: {output[:240]}") from exc


def _find_file(files, filename):
    return next((file_data for file_data in files if PurePosixPath(file_data["path"]).name == filename), None)


def _find_sibling_package_json(files, package_lock):
    if not package_lock:
        return None

    package_lock_parent = PurePosixPath(package_lock["path"]).parent
    for file_data in files:
        path = PurePosixPath(file_data["path"])
        if path.name == "package.json" and path.parent == package_lock_parent:
            return file_data
    return None


def _normalize_npm_severity(severity):
    if severity == "critical":
        return Finding.SEVERITY_CRITICAL
    if severity == "high":
        return Finding.SEVERITY_HIGH
    if severity == "moderate":
        return Finding.SEVERITY_MEDIUM
    if severity == "low":
        return Finding.SEVERITY_LOW
    return Finding.SEVERITY_INFO


def _npm_vulnerability_title(package_name, via):
    for item in via:
        if isinstance(item, dict) and item.get("title"):
            return f"Podatność npm: {item['title']}"
    return f"Podatny pakiet npm: {package_name}"


def _npm_severity_label(severity):
    return {
        "critical": "krytycznym",
        "high": "wysokim",
        "moderate": "średnim",
        "low": "niskim",
        "info": "informacyjnym",
    }.get(severity, "nieznanym")


def _mask_secret_match(label, value):
    if label == "nagłówek klucza prywatnego":
        return "Wykryto nagłówek klucza prywatnego."
    if len(value) <= 8:
        return "Dopasowano wartość przypominającą sekret."
    return f"Dopasowano wartość przypominającą sekret: {value[:4]}...{value[-4:]}"


def _calculate_score(findings):
    score = 100
    for finding in findings:
        score -= SEVERITY_PENALTIES.get(finding["severity"], 0)
    return max(score, 0)


def _ensure_tool_finding(finding):
    finding.setdefault("source", Finding.SOURCE_TOOL)
    finding.setdefault("agent_name", _tool_agent_name(finding.get("category"), finding.get("title", "")))
    return finding


def _tool_agent_name(category, title):
    title = (title or "").lower()
    if category == "security":
        return "secret_pattern_scan"
    if "dependency manifest" in title or "manifest zależności" in title:
        return "dependency_manifest_detection"
    if "python dependency" in title or "zależności python" in title:
        return "python_dependency_audit"
    if category == "dependencies":
        return "npm_audit"
    return "deterministic_tool"


def _fail_run(run, message):
    run.status = AnalysisRun.STATUS_FAILED
    run.error_message = message
    run.score_total = 0
    run.finished_at = timezone.now()
    run.save(update_fields=["status", "error_message", "score_total", "finished_at"])
