from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

from llm_api.models import ChatMessage, ChatSession
from projects_api.models import AnalysisRun, Finding, Project, RepositorySnapshot


class CapturingLLM:
    def __init__(self, captured):
        self.captured = captured

    def conditioning_msg_string(self, conditioning, raw_prompt, session_id=None):
        self.captured["conditioning"] = conditioning
        self.captured["raw_prompt"] = raw_prompt
        self.captured["session_id"] = session_id
        return "Zacznij od usunięcia niebezpiecznego skrótu i dodaj test regresyjny."


class FailingLLM:
    def conditioning_msg_string(self, conditioning, raw_prompt, session_id=None):
        raise RuntimeError("provider unavailable")


class ReportAssistantApiTests(TestCase):
    def setUp(self):
        User = get_user_model()
        self.user = User.objects.create_user(
            email="assistant-owner@example.com",
            username="assistant-owner",
            password="pass12345",
        )
        self.other_user = User.objects.create_user(
            email="assistant-other@example.com",
            username="assistant-other",
            password="pass12345",
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    @patch("llm_api.report_assistant.load_repository_text_files")
    def test_question_about_finding_includes_report_context(self, mocked_files):
        project, run, finding = self._project_run_and_finding()
        session = ChatSession.objects.create(session_id="owner-session", project=project)
        captured = {}
        mocked_files.return_value = [
            {
                "path": "src/app.py",
                "content": "def check(user):\n    return user.is_admin\n",
                "line_count": 2,
            }
        ]

        with patch("llm_api.report_assistant._build_llm_interface", return_value=CapturingLLM(captured)):
            response = self.client.post(
                f"/api/chat/sessions/{session.session_id}/messages/",
                {"content": "Wyjaśnij ten wynik audytu.", "finding_id": finding.id},
                format="json",
            )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["context"]["finding_id"], finding.id)
        self.assertIn("PRAETOR", captured["conditioning"])
        self.assertIn("Niebezpieczny skrót administratora", captured["raw_prompt"])
        self.assertIn("src/app.py", captured["raw_prompt"])
        self.assertIn("return user.is_admin", captured["raw_prompt"])
        self.assertIsNone(captured["session_id"])
        self.assertEqual(ChatMessage.objects.filter(session=session).count(), 2)
        self.assertEqual(ChatMessage.objects.filter(session=session, finding=finding).count(), 2)
        self.assertEqual(ChatMessage.objects.filter(session=session, analysis_run=run).count(), 2)

    def test_user_cannot_ask_about_other_users_finding(self):
        _, _, finding = self._project_run_and_finding()
        other_project = Project.objects.create(
            name="Inny projekt",
            description="",
            repo_url="https://github.com/octo/other",
            user=self.other_user,
        )
        other_session = ChatSession.objects.create(session_id="other-session", project=other_project)

        self.client.force_authenticate(user=self.other_user)
        response = self.client.post(
            f"/api/chat/sessions/{other_session.session_id}/messages/",
            {"content": "Czy mogę to zobaczyć?", "finding_id": finding.id},
            format="json",
        )

        self.assertEqual(response.status_code, 404)
        self.assertEqual(ChatMessage.objects.filter(session=other_session).count(), 0)

    @patch("llm_api.report_assistant._build_llm_interface", return_value=FailingLLM())
    def test_llm_failure_returns_friendly_assistant_message(self, mocked_llm):
        project, _, finding = self._project_run_and_finding()
        session = ChatSession.objects.create(session_id="failure-session", project=project)

        response = self.client.post(
            f"/api/chat/sessions/{session.session_id}/messages/",
            {"content": "Co mam zrobić?", "finding_id": finding.id},
            format="json",
        )

        self.assertEqual(response.status_code, 201)
        assistant_content = response.data["assistant_message"]["content"]
        self.assertIn("Nie mogę teraz połączyć się z modelem LLM", assistant_content)
        self.assertNotIn("provider unavailable", assistant_content)
        self.assertEqual(ChatMessage.objects.filter(session=session).count(), 2)

    def _project_run_and_finding(self):
        project = Project.objects.create(
            name="Audyt asystenta",
            description="Mała aplikacja webowa",
            repo_url="https://github.com/octo/demo",
            user=self.user,
        )
        snapshot = RepositorySnapshot.objects.create(
            project=project,
            commit_sha="abc123",
            branch="main",
            file_count=1,
            total_size_bytes=64,
            included_files=[{"path": "src/app.py", "size_bytes": 64}],
            ignored_files=[],
        )
        run = AnalysisRun.objects.create(
            project=project,
            snapshot=snapshot,
            status=AnalysisRun.STATUS_COMPLETED,
            score_total=72,
        )
        finding = Finding.objects.create(
            run=run,
            source=Finding.SOURCE_TOOL,
            category="security",
            severity=Finding.SEVERITY_HIGH,
            title="Niebezpieczny skrót administratora",
            description="Uprzywilejowana gałąź logiki polega bezpośrednio na fladze użytkownika.",
            file_path="src/app.py",
            line_start=2,
            evidence="src/app.py:2",
            recommendation="Przenieś autoryzację do dedykowanego sprawdzenia uprawnień i obejmij ją testami.",
            confidence=0.91,
        )
        return project, run, finding
