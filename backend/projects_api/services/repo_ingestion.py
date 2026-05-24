from dataclasses import dataclass
from io import BytesIO
from pathlib import PurePosixPath
from typing import Iterable
from urllib.parse import urlparse
import zipfile

import requests

from projects_api.models import RepositorySnapshot


MAX_FILE_SIZE_BYTES = 300 * 1024
MAX_INCLUDED_FILES = 500
MAX_TOTAL_TEXT_BYTES = 20 * 1024 * 1024
MAX_ARCHIVE_BYTES = 50 * 1024 * 1024
MAX_IGNORED_FILES_STORED = 1000

IGNORED_DIRECTORIES = {
    ".git",
    "node_modules",
    "venv",
    ".venv",
    "dist",
    "build",
    "__pycache__",
    ".next",
    "coverage",
}

TEXT_EXTENSIONS = {
    ".bash",
    ".c",
    ".cfg",
    ".conf",
    ".cpp",
    ".cs",
    ".css",
    ".csv",
    ".dockerfile",
    ".env.example",
    ".go",
    ".gradle",
    ".h",
    ".html",
    ".java",
    ".js",
    ".json",
    ".jsx",
    ".kt",
    ".lock",
    ".md",
    ".php",
    ".properties",
    ".py",
    ".rb",
    ".rs",
    ".scss",
    ".sh",
    ".sql",
    ".toml",
    ".ts",
    ".tsx",
    ".txt",
    ".xml",
    ".yaml",
    ".yml",
}

TEXT_FILENAMES = {
    ".dockerignore",
    ".editorconfig",
    ".env.example",
    ".gitignore",
    "Dockerfile",
    "Makefile",
    "README",
    "README.md",
}


class RepoIngestionError(Exception):
    def __init__(self, message, status_code=400):
        super().__init__(message)
        self.message = message
        self.status_code = status_code


@dataclass(frozen=True)
class GitHubRepoRef:
    owner: str
    repo: str
    normalized_url: str


def validate_github_repo_url(repo_url: str) -> GitHubRepoRef:
    parsed = urlparse((repo_url or "").strip())
    if parsed.scheme not in ("https", "http"):
        raise RepoIngestionError("Podaj pelny URL repozytorium GitHub.")
    if parsed.netloc.lower() != "github.com":
        raise RepoIngestionError("Obsługiwane są tylko publiczne repozytoria z github.com.")

    path_parts = [part for part in parsed.path.strip("/").split("/") if part]
    if len(path_parts) != 2:
        raise RepoIngestionError("URL musi wskazywac repozytorium w formacie https://github.com/owner/repo.")

    owner, repo = path_parts
    if repo.endswith(".git"):
        repo = repo[:-4]
    if not owner or not repo:
        raise RepoIngestionError("Nieprawidlowy URL repozytorium GitHub.")

    return GitHubRepoRef(owner=owner, repo=repo, normalized_url=f"https://github.com/{owner}/{repo}")


def ingest_project_repository(project):
    repo_ref = validate_github_repo_url(project.repo_url)
    repo_data = _fetch_json(f"https://api.github.com/repos/{repo_ref.owner}/{repo_ref.repo}")
    branch = repo_data.get("default_branch") or "main"
    normalized_url = repo_data.get("html_url") or repo_ref.normalized_url

    commit_sha = _fetch_commit_sha(repo_ref, branch)
    archive_bytes = _download_archive(repo_ref, branch)
    snapshot_data = _index_zip_archive(archive_bytes)

    project.repo_url = normalized_url
    project.default_branch = branch
    project.last_commit_sha = commit_sha
    project.save(update_fields=["repo_url", "default_branch", "last_commit_sha", "updated_at"])

    return RepositorySnapshot.objects.create(
        project=project,
        commit_sha=commit_sha,
        branch=branch,
        file_count=snapshot_data["file_count"],
        total_size_bytes=snapshot_data["total_size_bytes"],
        included_files=snapshot_data["included_files"],
        ignored_files=snapshot_data["ignored_files"],
    )


def load_repository_text_files(project):
    repo_ref = validate_github_repo_url(project.repo_url)
    branch = project.default_branch
    if not branch:
        repo_data = _fetch_json(f"https://api.github.com/repos/{repo_ref.owner}/{repo_ref.repo}")
        branch = repo_data.get("default_branch") or "main"

    archive_bytes = _download_archive(repo_ref, branch)
    return _index_zip_archive(archive_bytes, include_content=True)["included_files"]


def _fetch_json(url):
    response = requests.get(url, headers=_headers(), timeout=15)
    if response.status_code == 404:
        raise RepoIngestionError("Repozytorium GitHub nie istnieje albo nie jest publiczne.", status_code=404)
    try:
        response.raise_for_status()
    except requests.RequestException as exc:
        raise RepoIngestionError(f"GitHub API zwrocil blad: {exc}", status_code=502) from exc
    return response.json()


def _fetch_commit_sha(repo_ref: GitHubRepoRef, branch: str) -> str:
    commit_data = _fetch_json(f"https://api.github.com/repos/{repo_ref.owner}/{repo_ref.repo}/commits/{branch}")
    return commit_data.get("sha", "")


def _download_archive(repo_ref: GitHubRepoRef, branch: str) -> bytes:
    archive_url = f"https://api.github.com/repos/{repo_ref.owner}/{repo_ref.repo}/zipball/{branch}"
    response = requests.get(archive_url, headers=_headers(), timeout=60, stream=True)
    if response.status_code == 404:
        raise RepoIngestionError("Nie można pobrać archiwum repozytorium.", status_code=404)
    try:
        response.raise_for_status()
    except requests.RequestException as exc:
        raise RepoIngestionError(f"Nie udało się pobrać repozytorium: {exc}", status_code=502) from exc

    archive = BytesIO()
    total_size = 0
    for chunk in _iter_response_content(response):
        total_size += len(chunk)
        if total_size > MAX_ARCHIVE_BYTES:
            raise RepoIngestionError("Archiwum repozytorium przekracza limit rozmiaru.")
        archive.write(chunk)
    return archive.getvalue()


def _iter_response_content(response) -> Iterable[bytes]:
    if hasattr(response, "iter_content"):
        for chunk in response.iter_content(chunk_size=1024 * 64):
            if chunk:
                yield chunk
    else:
        yield response.content


def _index_zip_archive(archive_bytes: bytes, include_content=False):
    included_files = []
    ignored_files = []
    total_text_size = 0

    try:
        with zipfile.ZipFile(BytesIO(archive_bytes)) as archive:
            for member in archive.infolist():
                if member.is_dir():
                    continue

                relative_path = _normalize_zip_path(member.filename)
                if not relative_path:
                    continue

                reason = _ignore_reason(relative_path, member.file_size, len(included_files), total_text_size)
                if reason:
                    _append_ignored(ignored_files, relative_path, reason, member.file_size)
                    continue

                content = archive.read(member)
                if _looks_binary(content):
                    _append_ignored(ignored_files, relative_path, "binary_file", member.file_size)
                    continue

                total_text_size += member.file_size
                file_data = {
                    "path": relative_path,
                    "size_bytes": member.file_size,
                    "extension": PurePosixPath(relative_path).suffix.lower(),
                    "line_count": _count_lines(content),
                }
                if include_content:
                    file_data["content"] = content.decode("utf-8")
                included_files.append(file_data)
    except zipfile.BadZipFile as exc:
        raise RepoIngestionError("GitHub zwrocil niepoprawne archiwum ZIP.", status_code=502) from exc

    return {
        "file_count": len(included_files),
        "total_size_bytes": total_text_size,
        "included_files": included_files,
        "ignored_files": ignored_files,
    }


def _normalize_zip_path(path: str) -> str:
    path = path.replace("\\", "/")
    parts = PurePosixPath(path).parts
    if len(parts) <= 1:
        return ""
    return "/".join(parts[1:])


def _ignore_reason(path: str, size: int, included_count: int, current_total_size: int) -> str:
    parts = set(PurePosixPath(path).parts)
    ignored_dir = next((part for part in parts if part in IGNORED_DIRECTORIES), None)
    if ignored_dir:
        return f"ignored_directory:{ignored_dir}"
    if size > MAX_FILE_SIZE_BYTES:
        return "file_too_large"
    if included_count >= MAX_INCLUDED_FILES:
        return "file_limit_exceeded"
    if current_total_size + size > MAX_TOTAL_TEXT_BYTES:
        return "total_text_limit_exceeded"
    if not _has_text_name(path):
        return "unsupported_extension"
    return ""


def _has_text_name(path: str) -> bool:
    name = PurePosixPath(path).name
    suffix = PurePosixPath(path).suffix.lower()
    return name in TEXT_FILENAMES or suffix in TEXT_EXTENSIONS


def _looks_binary(content: bytes) -> bool:
    sample = content[:2048]
    if b"\0" in sample:
        return True
    try:
        sample.decode("utf-8")
        return False
    except UnicodeDecodeError:
        return True


def _count_lines(content: bytes) -> int:
    if not content:
        return 0
    return content.count(b"\n") + (0 if content.endswith(b"\n") else 1)


def _append_ignored(ignored_files, path, reason, size):
    if len(ignored_files) < MAX_IGNORED_FILES_STORED:
        ignored_files.append({"path": path, "reason": reason, "size_bytes": size})


def _headers():
    return {
        "Accept": "application/vnd.github+json",
        "User-Agent": "PRAETOR-repository-ingestion",
    }
