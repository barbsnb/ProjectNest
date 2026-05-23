from io import BytesIO
from unittest.mock import patch
import zipfile

from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

from projects_api.models import AgentResult, AnalysisRun, Finding, Project, RepositorySnapshot


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


class FakeOneBadAgentLLM:
    def conditioning_msg_string(self, conditioning, raw_prompt, session_id=None):
        if "Security Auditor" in conditioning:
            return "not-json"
        return '{"summary":"ok","findings":[]}'


class FakeDuplicateFindingLLM:
    def conditioning_msg_string(self, conditioning, raw_prompt, session_id=None):
        return """
        {
          "summary": "duplicate finding",
          "findings": [
            {
              "category": "architecture",
              "severity": "medium",
              "title": "Service layer is too tightly coupled",
              "description": "The same architectural issue was reported by multiple agents.",
              "file_path": "src/app.py",
              "line_start": 10,
              "evidence": "src/app.py:10",
              "recommendation": "Separate orchestration from request handling.",
              "confidence": 0.82
            }
          ]
        }
        """


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

    @patch("projects_api.services.analysis_pipeline.run_agent_review", return_value=[])
    @patch("projects_api.services.analysis_pipeline.load_repository_text_files")
    def test_analysis_run_creates_critical_finding_for_secret(self, mocked_files, mocked_agents):
        demo_secret = "AKIA" + "IOSFODNN7EXAMPLE"
        project = Project.objects.create(
            name="Secret audit",
            description="",
            repo_url="https://github.com/octo/demo",
            default_branch="main",
            user=self.user,
        )
        RepositorySnapshot.objects.create(
            project=project,
            commit_sha="abc123def456",
            branch="main",
            file_count=1,
            total_size_bytes=48,
            included_files=[{"path": "settings.py", "size_bytes": 48}],
            ignored_files=[],
        )
        mocked_files.return_value = [
            {
                "path": "settings.py",
                "size_bytes": 48,
                "extension": ".py",
                "line_count": 1,
                "content": f"SECRET_KEY = '{demo_secret}'\n",
            }
        ]

        response = self.client.post(f"/api/projects/{project.id}/analysis-runs/")

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["status"], AnalysisRun.STATUS_COMPLETED)

        finding = Finding.objects.get(run_id=response.data["id"], category="security")
        self.assertEqual(finding.severity, Finding.SEVERITY_CRITICAL)
        self.assertEqual(finding.file_path, "settings.py")
        self.assertEqual(finding.line_start, 1)
        self.assertEqual(finding.source, Finding.SOURCE_TOOL)
        self.assertNotIn(demo_secret, finding.evidence)

    def test_analysis_run_failure_does_not_crash_request(self):
        project = Project.objects.create(
            name="Broken audit",
            description="",
            repo_url="",
            user=self.user,
        )

        response = self.client.post(f"/api/projects/{project.id}/analysis-runs/")

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["status"], AnalysisRun.STATUS_FAILED)
        self.assertTrue(response.data["error_message"])

    def test_user_cannot_read_findings_for_other_users_run(self):
        project = Project.objects.create(
            name="Owner run",
            description="",
            repo_url="https://github.com/octo/demo",
            user=self.user,
        )
        snapshot = RepositorySnapshot.objects.create(project=project, branch="main")
        run = AnalysisRun.objects.create(
            project=project,
            snapshot=snapshot,
            status=AnalysisRun.STATUS_COMPLETED,
        )
        Finding.objects.create(
            run=run,
            category="security",
            severity=Finding.SEVERITY_CRITICAL,
            title="Secret",
            description="Secret finding",
            file_path="settings.py",
            evidence="masked",
            recommendation="Rotate the credential.",
            confidence=0.95,
        )

        self.client.force_authenticate(user=self.other_user)
        response = self.client.get(f"/api/analysis-runs/{run.id}/findings/")

        self.assertEqual(response.status_code, 404)

    def test_report_summary_respects_project_ownership(self):
        project = self._project_with_snapshot()
        run = AnalysisRun.objects.create(
            project=project,
            snapshot=project.repository_snapshots.first(),
            status=AnalysisRun.STATUS_COMPLETED,
            score_total=68,
        )
        Finding.objects.create(
            run=run,
            category="security",
            severity=Finding.SEVERITY_CRITICAL,
            title="Hardcoded secret",
            description="A secret-like value was detected.",
            file_path="settings.py",
            evidence="masked",
            recommendation="Rotate and remove the credential.",
            confidence=0.95,
        )

        owner_response = self.client.get(f"/api/projects/{project.id}/report-summary/")
        self.assertEqual(owner_response.status_code, 200)
        self.assertEqual(owner_response.data["critical_count"], 1)
        self.assertEqual(owner_response.data["top_findings"][0]["status"], Finding.STATUS_NEW)

        self.client.force_authenticate(user=self.other_user)
        other_response = self.client.get(f"/api/projects/{project.id}/report-summary/")
        self.assertEqual(other_response.status_code, 404)

    def test_findings_endpoint_is_paginated(self):
        project = self._project_with_snapshot()
        run = AnalysisRun.objects.create(
            project=project,
            snapshot=project.repository_snapshots.first(),
            status=AnalysisRun.STATUS_COMPLETED,
        )
        for index in range(3):
            Finding.objects.create(
                run=run,
                category="code_quality",
                severity=Finding.SEVERITY_LOW,
                title=f"Finding {index}",
                description="Demo finding",
                file_path=f"src/file_{index}.py",
                evidence="demo",
                recommendation="Review this finding.",
                confidence=0.8,
            )

        response = self.client.get(f"/api/analysis-runs/{run.id}/findings/?page_size=2")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 3)
        self.assertEqual(len(response.data["results"]), 2)

    @patch("projects_api.services.agent_orchestrator._build_llm_interface", return_value=FakeOneBadAgentLLM())
    @patch("projects_api.services.analysis_pipeline.load_repository_text_files")
    def test_invalid_json_from_one_agent_does_not_fail_entire_run(self, mocked_files, mocked_llm):
        project = self._project_with_snapshot()
        mocked_files.return_value = [
            {
                "path": "src/app.py",
                "size_bytes": 32,
                "extension": ".py",
                "line_count": 2,
                "content": "def handler(request):\n    return None\n",
            }
        ]

        response = self.client.post(f"/api/projects/{project.id}/analysis-runs/")

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["status"], AnalysisRun.STATUS_COMPLETED)

        agent_results = AgentResult.objects.filter(run_id=response.data["id"], prompt_version="praetor-agent-v1")
        self.assertEqual(agent_results.count(), 4)
        self.assertEqual(agent_results.get(agent_name="Security Auditor").status, AnalysisRun.STATUS_FAILED)
        self.assertEqual(agent_results.exclude(agent_name="Security Auditor").filter(status=AnalysisRun.STATUS_COMPLETED).count(), 3)

    @patch("projects_api.services.agent_orchestrator._build_llm_interface", return_value=FakeDuplicateFindingLLM())
    @patch("projects_api.services.analysis_pipeline.load_repository_text_files")
    def test_duplicate_agent_findings_are_deduplicated(self, mocked_files, mocked_llm):
        project = self._project_with_snapshot()
        mocked_files.return_value = [
            {
                "path": "src/app.py",
                "size_bytes": 64,
                "extension": ".py",
                "line_count": 12,
                "content": "\n".join(["def handler(request):", "    return None"] * 6),
            }
        ]

        response = self.client.post(f"/api/projects/{project.id}/analysis-runs/")

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["status"], AnalysisRun.STATUS_COMPLETED)
        self.assertEqual(AgentResult.objects.filter(run_id=response.data["id"], prompt_version="praetor-agent-v1").count(), 4)
        self.assertEqual(Finding.objects.filter(run_id=response.data["id"], source=Finding.SOURCE_AI).count(), 1)

    def _project_with_snapshot(self):
        project = Project.objects.create(
            name="Agent audit",
            description="Small demo project",
            repo_url="https://github.com/octo/demo",
            default_branch="main",
            user=self.user,
        )
        RepositorySnapshot.objects.create(
            project=project,
            commit_sha="abc123def456",
            branch="main",
            file_count=1,
            total_size_bytes=64,
            included_files=[{"path": "src/app.py", "size_bytes": 64}],
            ignored_files=[],
        )
        return project
