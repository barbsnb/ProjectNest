from io import BytesIO
from unittest.mock import patch
import zipfile

from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

from projects_api.models import Project, RepositorySnapshot


class FakeResponse:
    def __init__(self, data=None, content=b"", status_code=200):
        self._data = data or {}
        self.content = content
        self.status_code = status_code

    def json(self):
        return self._data

    def raise_for_status(self):
        if self.status_code >= 400:
            raise RuntimeError(f"HTTP {self.status_code}")

    def iter_content(self, chunk_size=65536):
        for index in range(0, len(self.content), chunk_size):
            yield self.content[index:index + chunk_size]


def build_repo_zip():
    buffer = BytesIO()
    with zipfile.ZipFile(buffer, "w") as archive:
        archive.writestr("octo-demo/README.md", "# Demo\n")
        archive.writestr("octo-demo/src/app.py", "print('ok')\n")
        archive.writestr("octo-demo/node_modules/pkg/index.js", "console.log('ignored')\n")
        archive.writestr("octo-demo/assets/logo.png", b"\x00\x01\x02")
    return buffer.getvalue()


def fake_github_get(url, **kwargs):
    if url == "https://api.github.com/repos/octo/demo":
        return FakeResponse(data={"default_branch": "main", "html_url": "https://github.com/octo/demo"})
    if url == "https://api.github.com/repos/octo/demo/commits/main":
        return FakeResponse(data={"sha": "abc123def456"})
    if url == "https://api.github.com/repos/octo/demo/zipball/main":
        return FakeResponse(content=build_repo_zip())
    return FakeResponse(status_code=404)


class RepositoryIngestionApiTests(TestCase):
    def setUp(self):
        User = get_user_model()
        self.user = User.objects.create_user(
            email="owner@example.com",
            username="owner",
            password="pass12345",
        )
        self.other_user = User.objects.create_user(
            email="other@example.com",
            username="other",
            password="pass12345",
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    @patch("projects_api.services.repo_ingestion.requests.get", side_effect=fake_github_get)
    def test_public_github_url_creates_project_and_snapshot(self, mocked_get):
        create_response = self.client.post(
            "/api/project/",
            {
                "name": "Demo audit",
                "description": "Repository ingestion test",
                "repo_url": "https://github.com/octo/demo",
            },
            format="json",
        )

        self.assertEqual(create_response.status_code, 201)
        project = Project.objects.get(id=create_response.data["id"])
        self.assertEqual(project.user, self.user)

        ingest_response = self.client.post(f"/api/projects/{project.id}/ingest/")

        self.assertEqual(ingest_response.status_code, 201)
        project.refresh_from_db()
        self.assertEqual(project.default_branch, "main")
        self.assertEqual(project.last_commit_sha, "abc123def456")

        snapshot = RepositorySnapshot.objects.get(project=project)
        included_paths = {entry["path"] for entry in snapshot.included_files}
        ignored_paths = {entry["path"] for entry in snapshot.ignored_files}

        self.assertIn("README.md", included_paths)
        self.assertIn("src/app.py", included_paths)
        self.assertNotIn("node_modules/pkg/index.js", included_paths)
        self.assertIn("node_modules/pkg/index.js", ignored_paths)
        self.assertTrue(
            any(entry["reason"] == "ignored_directory:node_modules" for entry in snapshot.ignored_files)
        )
        self.assertEqual(snapshot.file_count, 2)
        self.assertGreaterEqual(mocked_get.call_count, 3)

    def test_invalid_github_url_returns_400(self):
        response = self.client.post(
            "/api/project/",
            {
                "name": "Invalid audit",
                "description": "",
                "repo_url": "https://gitlab.com/octo/demo",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("repo_url", response.data)

    @patch("projects_api.services.repo_ingestion.requests.get", side_effect=fake_github_get)
    def test_user_cannot_ingest_or_read_another_users_snapshot(self, mocked_get):
        project = Project.objects.create(
            name="Private owner project",
            description="",
            repo_url="https://github.com/octo/demo",
            user=self.user,
        )
        RepositorySnapshot.objects.create(
            project=project,
            commit_sha="abc123def456",
            branch="main",
            file_count=1,
            total_size_bytes=10,
            included_files=[{"path": "README.md", "size_bytes": 10}],
            ignored_files=[],
        )

        self.client.force_authenticate(user=self.other_user)

        snapshot_response = self.client.get(f"/api/projects/{project.id}/snapshot/")
        ingest_response = self.client.post(f"/api/projects/{project.id}/ingest/")

        self.assertEqual(snapshot_response.status_code, 404)
        self.assertEqual(ingest_response.status_code, 404)
        mocked_get.assert_not_called()
