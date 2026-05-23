from pathlib import PurePosixPath
import json

from django.shortcuts import get_object_or_404

from llm_api.models import ChatMessage
from projects_api.models import AnalysisRun, Finding
from projects_api.services.repo_ingestion import load_repository_text_files


MAX_HISTORY_MESSAGES = 8
MAX_MESSAGE_CHARS = 1200
MAX_CODE_CHARS = 3500
MAX_PROMPT_CHARS = 14000


REPORT_ASSISTANT_PROMPT = """
You are PRAETOR's report assistant.
Your job is to teach a less experienced builder how to understand and fix findings from a repository audit.

Rules:
- Answer using the provided project, report, finding, code excerpt, and recent conversation context.
- Be concrete: explain why the issue matters, how to verify it, and what to change first.
- If code context is missing, say what evidence is available and what the user should inspect.
- Do not invent files, line numbers, vulnerabilities, or tool results.
- Keep the answer concise, practical, and educational.
""".strip()


def send_report_chat_message(session, content, finding_id=None, analysis_run_id=None):
    finding = _get_owned_finding(session, finding_id) if finding_id else None
    analysis_run = _resolve_analysis_run(session, finding, analysis_run_id)
    context = build_report_assistant_context(session, content, finding=finding, analysis_run=analysis_run)

    user_msg = ChatMessage.objects.create(
        session=session,
        analysis_run=analysis_run,
        finding=finding,
        role="user",
        content=content,
    )

    try:
        assistant_response = _build_llm_interface().conditioning_msg_string(
            conditioning=REPORT_ASSISTANT_PROMPT,
            raw_prompt=context["prompt"],
            session_id=None,
        )
    except Exception:
        assistant_response = (
            "Nie moge teraz polaczyc sie z modelem LLM. Kontekst rozmowy zostal zapisany. "
            "Sprobuj ponownie za chwile albo przeanalizuj sekcje Evidence i Recommendation przy tym findingu."
        )

    assistant_msg = ChatMessage.objects.create(
        session=session,
        analysis_run=analysis_run,
        finding=finding,
        role="assistant",
        content=assistant_response,
    )

    return user_msg, assistant_msg, context["summary"]


def build_report_assistant_context(session, user_question, finding=None, analysis_run=None):
    project = session.project
    analysis_run = analysis_run or project.analysis_runs.first()
    report_summary = _report_summary(analysis_run) if analysis_run else {}
    code_excerpt = _code_excerpt(project, finding) if finding else None

    context = {
        "project": {
            "id": project.id,
            "name": _clip_text(project.name, 300),
            "repo_url": _clip_text(project.repo_url, 500),
            "description": _clip_text(project.description, 1000),
        },
        "analysis_run": _run_payload(analysis_run),
        "report_summary": report_summary,
        "finding": _finding_payload(finding),
        "code_excerpt": code_excerpt,
        "recent_messages": _recent_messages(session),
        "user_question": _clip_text(user_question, MAX_MESSAGE_CHARS),
    }

    prompt = json.dumps(context, ensure_ascii=False)
    if len(prompt) > MAX_PROMPT_CHARS:
        context["recent_messages"] = context["recent_messages"][-4:]
        prompt = json.dumps(context, ensure_ascii=False)
    if len(prompt) > MAX_PROMPT_CHARS:
        context["code_excerpt"] = _trim_code_excerpt(context.get("code_excerpt"))
        prompt = json.dumps(context, ensure_ascii=False)
    if len(prompt) > MAX_PROMPT_CHARS:
        context["report_summary"]["top_findings"] = []
        prompt = json.dumps(context, ensure_ascii=False)
    if len(prompt) > MAX_PROMPT_CHARS:
        context = {
            "truncated": True,
            "analysis_run": context["analysis_run"],
            "finding": context["finding"],
            "user_question": context["user_question"],
        }
        prompt = json.dumps(context, ensure_ascii=False)

    return {
        "prompt": prompt,
        "summary": {
            "finding_id": finding.id if finding else None,
            "analysis_run_id": analysis_run.id if analysis_run else None,
            "file_path": finding.file_path if finding else "",
            "category": finding.category if finding else "",
            "severity": finding.severity if finding else "",
        },
    }


def _get_owned_finding(session, finding_id):
    return get_object_or_404(
        Finding,
        id=finding_id,
        run__project=session.project,
        run__project__user=session.project.user,
    )


def _resolve_analysis_run(session, finding=None, analysis_run_id=None):
    if finding:
        return finding.run
    if analysis_run_id:
        return get_object_or_404(
            AnalysisRun,
            id=analysis_run_id,
            project=session.project,
            project__user=session.project.user,
        )
    return session.project.analysis_runs.first()


def _report_summary(run):
    findings = list(run.findings.all()) if run else []
    categories = {}
    for finding in findings:
        categories[finding.category] = categories.get(finding.category, 0) + 1

    top_findings = sorted(
        findings,
        key=lambda finding: (_severity_rank(finding.severity), -finding.confidence, finding.title),
    )[:3]

    return {
        "score_total": run.score_total,
        "status": run.status,
        "critical_count": sum(1 for finding in findings if finding.severity == Finding.SEVERITY_CRITICAL),
        "high_count": sum(1 for finding in findings if finding.severity == Finding.SEVERITY_HIGH),
        "category_counts": categories,
        "top_findings": [_finding_payload(finding) for finding in top_findings],
    }


def _run_payload(run):
    if not run:
        return None
    return {
        "id": run.id,
        "status": run.status,
        "score_total": run.score_total,
        "started_at": run.started_at.isoformat() if run.started_at else None,
        "finished_at": run.finished_at.isoformat() if run.finished_at else None,
    }


def _finding_payload(finding):
    if not finding:
        return None
    return {
        "id": finding.id,
        "source": finding.source,
        "agent_name": finding.agent_name,
        "category": finding.category,
        "severity": finding.severity,
        "title": _clip_text(finding.title, 300),
        "description": _clip_text(finding.description, 1500),
        "file_path": _clip_text(finding.file_path, 500),
        "line_start": finding.line_start,
        "evidence": _clip_text(finding.evidence, 1200),
        "recommendation": _clip_text(finding.recommendation, 1500),
        "confidence": finding.confidence,
        "status": finding.status,
    }


def _code_excerpt(project, finding):
    if not finding.file_path:
        return None
    try:
        files = load_repository_text_files(project)
    except Exception:
        return {"path": finding.file_path, "available": False, "content": ""}

    file_data = next((item for item in files if item.get("path") == finding.file_path), None)
    if not file_data:
        return {"path": finding.file_path, "available": False, "content": ""}

    content = file_data.get("content", "")
    lines = content.splitlines()
    if finding.line_start:
        start = max(finding.line_start - 8, 1)
        end = min(finding.line_start + 8, len(lines))
    else:
        start = 1
        end = min(32, len(lines))

    excerpt_lines = []
    for index in range(start, end + 1):
        excerpt_lines.append(f"{index}: {lines[index - 1]}")

    return {
        "path": finding.file_path,
        "available": True,
        "line_start": start,
        "line_end": end,
        "content": "\n".join(excerpt_lines)[:MAX_CODE_CHARS],
        "extension": PurePosixPath(finding.file_path).suffix.lower(),
    }


def _recent_messages(session):
    messages = session.messages.order_by("-timestamp")[:MAX_HISTORY_MESSAGES]
    return [
        {
            "role": message.role,
            "content": message.content[:MAX_MESSAGE_CHARS],
            "finding_id": message.finding_id,
        }
        for message in reversed(list(messages))
    ]


def _trim_code_excerpt(excerpt):
    if not excerpt:
        return excerpt
    excerpt = dict(excerpt)
    excerpt["content"] = excerpt.get("content", "")[:1200]
    return excerpt


def _clip_text(value, max_chars):
    if value is None:
        return ""
    value = str(value)
    if len(value) <= max_chars:
        return value
    return value[: max_chars - 15] + "\n[truncated]"


def _severity_rank(severity):
    return {
        Finding.SEVERITY_CRITICAL: 0,
        Finding.SEVERITY_HIGH: 1,
        Finding.SEVERITY_MEDIUM: 2,
        Finding.SEVERITY_LOW: 3,
        Finding.SEVERITY_INFO: 4,
    }.get(severity, 5)


def _build_llm_interface():
    from llm_api.services import StringLLMChatInterface

    return StringLLMChatInterface()
