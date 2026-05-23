from collections import Counter
from pathlib import PurePosixPath
from tempfile import TemporaryDirectory
from django.utils import timezone
import json
import subprocess
import re

from projects_api.models import AgentResult, AnalysisRun, Finding
from projects_api.services.repo_ingestion import (
    RepoIngestionError,
    ingest_project_repository,
    load_repository_text_files,
)


SECRET_PATTERNS = [
    ("AWS access key", re.compile(r"\bAKIA[0-9A-Z]{16}\b")),
    ("OpenAI API key", re.compile(r"\bsk(?:-proj)?-[A-Za-z0-9_-]{20,}\b")),
    ("GitHub token", re.compile(r"\bgh[pousr]_[A-Za-z0-9_]{36,255}\b")),
    ("Google API key", re.compile(r"\bAIza[0-9A-Za-z_-]{35}\b")),
    ("Private key header", re.compile(r"-----BEGIN [A-Z ]*PRIVATE KEY-----")),
]

DEPENDENCY_MANIFESTS = {
    "package.json": "Node.js package manifest",
    "package-lock.json": "Node.js locked dependency graph",
    "yarn.lock": "Yarn locked dependency graph",
    "pnpm-lock.yaml": "pnpm locked dependency graph",
    "requirements.txt": "Python pinned dependency list",
    "pyproject.toml": "Python project manifest",
    "Pipfile": "Python Pipenv manifest",
    "poetry.lock": "Poetry locked dependency graph",
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

        Finding.objects.bulk_create([Finding(run=run, **finding) for finding in findings])

        run.score_total = _calculate_score(findings)
        run.status = AnalysisRun.STATUS_COMPLETED
        run.finished_at = timezone.now()
        run.save(update_fields=["score_total", "status", "finished_at"])
    except RepoIngestionError as exc:
        _fail_run(run, exc.message)
    except Exception as exc:
        _fail_run(run, f"Unexpected analysis error: {exc}")

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
                        "title": f"Potential secret detected: {label}",
                        "description": "A deterministic secret pattern matched repository source code.",
                        "file_path": path,
                        "line_start": line_number,
                        "evidence": _mask_secret_match(label, match.group(0)),
                        "recommendation": (
                            "Remove the value from git history, rotate the credential, and load it from a "
                            "secret manager or environment variable."
                        ),
                        "confidence": 0.95,
                    }
                )

    AgentResult.objects.create(
        run=run,
        agent_name="secret_pattern_scan",
        status=AnalysisRun.STATUS_COMPLETED,
        summary=f"Scanned {len(files)} files and {scanned_lines} lines for high-risk secret patterns.",
        raw_output={"findings_count": len(findings), "scanned_files": len(files), "scanned_lines": scanned_lines},
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
                "title": f"Dependency manifest detected: {name}",
                "description": DEPENDENCY_MANIFESTS[name],
                "file_path": file_data["path"],
                "line_start": None,
                "evidence": f"{name} is present in the repository snapshot.",
                "recommendation": "Keep dependency manifests locked, reviewed, and covered by automated vulnerability checks.",
                "confidence": 0.9,
            }
        )

    AgentResult.objects.create(
        run=run,
        agent_name="dependency_manifest_detection",
        status=AnalysisRun.STATUS_COMPLETED,
        summary=f"Detected {len(manifests)} dependency manifest files.",
        raw_output={"manifests": manifests},
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
            summary="No package-lock.json detected.",
            raw_output={"skipped": True, "reason": "missing_package_lock"},
            started_at=started_at,
            finished_at=timezone.now(),
        )
        return []

    if not package_json:
        AgentResult.objects.create(
            run=run,
            agent_name="npm_audit",
            status=AnalysisRun.STATUS_FAILED,
            summary="package-lock.json detected, but matching package.json is missing.",
            raw_output={"skipped": True, "reason": "missing_package_json", "package_lock": package_lock["path"]},
            started_at=started_at,
            finished_at=timezone.now(),
            error_message="npm audit requires package.json next to package-lock.json.",
        )
        return []

    try:
        audit_data = _execute_npm_audit(package_json, package_lock)
    except Exception as exc:
        AgentResult.objects.create(
            run=run,
            agent_name="npm_audit",
            status=AnalysisRun.STATUS_FAILED,
            summary="npm audit could not complete.",
            raw_output={"package_lock": package_lock["path"]},
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
                "description": f"npm audit reported a {vulnerability.get('severity', 'unknown')} issue in {package_name}.",
                "file_path": package_lock["path"],
                "line_start": None,
                "evidence": f"Package: {package_name}; range: {vulnerability.get('range', 'unknown')}",
                "recommendation": "Review the affected package and run a controlled dependency update or npm audit fix.",
                "confidence": 0.9,
            }
        )

    metadata = audit_data.get("metadata", {})
    AgentResult.objects.create(
        run=run,
        agent_name="npm_audit",
        status=AnalysisRun.STATUS_COMPLETED,
        summary=f"npm audit reported {len(vulnerabilities)} vulnerable packages.",
        raw_output={
            "package_lock": package_lock["path"],
            "vulnerabilities": metadata.get("vulnerabilities", {}),
            "reported_packages": list(vulnerabilities.keys())[:50],
        },
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
                "title": "Python dependency audit pending",
                "description": "A Python dependency manifest is present, but a local vulnerability scanner is not configured yet.",
                "file_path": file_data["path"],
                "line_start": None,
                "evidence": f"Detected {PurePosixPath(file_data['path']).name}.",
                "recommendation": "Add pip-audit or Safety integration in the dependency audit stage.",
                "confidence": 0.7,
            }
        )

    AgentResult.objects.create(
        run=run,
        agent_name="python_dependency_audit",
        status=AnalysisRun.STATUS_COMPLETED,
        summary=f"Recorded placeholder for {len(python_manifests)} Python manifests.",
        raw_output={"manifests": [file_data["path"] for file_data in python_manifests]},
        started_at=started_at,
        finished_at=timezone.now(),
    )
    return findings


def _record_repo_metrics(run, snapshot, files):
    started_at = timezone.now()
    languages = Counter()
    for file_data in files:
        extension = PurePosixPath(file_data["path"]).suffix.lower()
        language = LANGUAGE_BY_EXTENSION.get(extension, extension.lstrip(".") or "Other")
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
        summary=f"Indexed {snapshot.file_count} text files and {snapshot.total_size_bytes} bytes.",
        raw_output={
            "file_count": snapshot.file_count,
            "total_size_bytes": snapshot.total_size_bytes,
            "languages": dict(languages),
            "largest_files": largest_files,
            "ignored_files_count": len(snapshot.ignored_files),
        },
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
        raise RuntimeError("npm audit returned no output.")

    try:
        return json.loads(output)
    except json.JSONDecodeError as exc:
        raise RuntimeError(f"npm audit returned non-JSON output: {output[:240]}") from exc


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
            return item["title"]
    return f"Vulnerable npm package: {package_name}"


def _mask_secret_match(label, value):
    if label == "Private key header":
        return "Private key header detected."
    if len(value) <= 8:
        return "Matched secret-like value."
    return f"Matched secret-like value: {value[:4]}...{value[-4:]}"


def _calculate_score(findings):
    score = 100
    for finding in findings:
        score -= SEVERITY_PENALTIES.get(finding["severity"], 0)
    return max(score, 0)


def _fail_run(run, message):
    run.status = AnalysisRun.STATUS_FAILED
    run.error_message = message
    run.score_total = 0
    run.finished_at = timezone.now()
    run.save(update_fields=["status", "error_message", "score_total", "finished_at"])
