from dataclasses import dataclass
from difflib import SequenceMatcher
from pathlib import PurePosixPath
from django.utils import timezone
import json
import os

from projects_api.models import AgentResult, AnalysisRun, Finding


PROMPT_VERSION = "praetor-agent-v1"
MAX_FILES_PER_AGENT = 12
MAX_CHARS_PER_FILE = 3500
MAX_TOTAL_CONTEXT_CHARS = 18000
VALID_SEVERITIES = {
    Finding.SEVERITY_CRITICAL,
    Finding.SEVERITY_HIGH,
    Finding.SEVERITY_MEDIUM,
    Finding.SEVERITY_LOW,
    Finding.SEVERITY_INFO,
}


@dataclass(frozen=True)
class AgentDefinition:
    name: str
    category: str
    focus: str
    file_patterns: tuple[str, ...]


AGENTS = (
    AgentDefinition(
        name="Security Auditor",
        category="security",
        focus=(
            "Find concrete security risks: secrets, auth/ownership mistakes, unsafe input handling, "
            "dependency risk, insecure defaults, and data exposure."
        ),
        file_patterns=(
            ".env",
            "settings.py",
            "urls.py",
            "views.py",
            "serializers.py",
            "models.py",
            "middleware",
            "auth",
            "security",
            "package.json",
            "requirements.txt",
        ),
    ),
    AgentDefinition(
        name="Architecture Reviewer",
        category="architecture",
        focus=(
            "Review boundaries, coupling, module responsibility, data flow, error handling, and whether "
            "the repository structure can support a maintainable SaaS audit product."
        ),
        file_patterns=("settings.py", "urls.py", "models.py", "views.py", "services", "api", "App.js", "package.json"),
    ),
    AgentDefinition(
        name="Code Quality Reviewer",
        category="code_quality",
        focus=(
            "Review readability, duplication, naming, maintainability, dead code, overly complex functions, "
            "and consistency with the local project style."
        ),
        file_patterns=(".py", ".js", ".jsx", ".ts", ".tsx", ".css"),
    ),
    AgentDefinition(
        name="Testing and Reliability Reviewer",
        category="testing_reliability",
        focus=(
            "Review test coverage signals, failure modes, observability, deterministic validation, performance "
            "risks, and operational reliability."
        ),
        file_patterns=("test", "tests", "spec", "package.json", "requirements.txt", ".py", ".js", ".jsx"),
    ),
)


def run_agent_review(run, project, snapshot, files, tool_findings):
    model_name = _model_name()
    all_findings = []

    try:
        llm = _build_llm_interface()
    except Exception as exc:
        for agent in AGENTS:
            AgentResult.objects.create(
                run=run,
                agent_name=agent.name,
                status=AnalysisRun.STATUS_FAILED,
                model=model_name,
                prompt_version=PROMPT_VERSION,
                summary=f"{agent.name} could not start because the LLM provider is unavailable.",
                raw_output={},
                normalized_output={},
                started_at=timezone.now(),
                finished_at=timezone.now(),
                error_message=str(exc),
            )
        return []

    for agent in AGENTS:
        result, findings = _run_single_agent(
            run=run,
            project=project,
            snapshot=snapshot,
            files=files,
            tool_findings=tool_findings,
            agent=agent,
            llm=llm,
            model_name=model_name,
        )
        all_findings.extend(findings)

    return all_findings


def deduplicate_findings(findings):
    deduped = []
    for finding in findings:
        if not _is_duplicate(finding, deduped):
            deduped.append(finding)
    return deduped


def _run_single_agent(run, project, snapshot, files, tool_findings, agent, llm, model_name):
    started_at = timezone.now()
    prompt = _agent_prompt(agent)
    raw_output = {}
    normalized_output = {}

    try:
        selected_files = _select_files_for_agent(agent, files)
        raw_prompt = _build_agent_context(project, snapshot, selected_files, tool_findings)
        raw_response = llm.conditioning_msg_string(conditioning=prompt, raw_prompt=raw_prompt)
        raw_output["response"] = raw_response

        try:
            normalized_output = _parse_agent_json(raw_response)
        except ValueError as exc:
            repair_response = _repair_agent_json(llm, prompt, raw_response, str(exc))
            raw_output["repair_response"] = repair_response
            normalized_output = _parse_agent_json(repair_response)

        findings = _normalize_agent_findings(agent, normalized_output)
        AgentResult.objects.create(
            run=run,
            agent_name=agent.name,
            status=AnalysisRun.STATUS_COMPLETED,
            model=model_name,
            prompt_version=PROMPT_VERSION,
            summary=normalized_output.get("summary", f"{agent.name} completed."),
            raw_output=raw_output,
            normalized_output=normalized_output,
            started_at=started_at,
            finished_at=timezone.now(),
        )
        return None, findings
    except Exception as exc:
        AgentResult.objects.create(
            run=run,
            agent_name=agent.name,
            status=AnalysisRun.STATUS_FAILED,
            model=model_name,
            prompt_version=PROMPT_VERSION,
            summary=f"{agent.name} failed gracefully.",
            raw_output=raw_output,
            normalized_output=normalized_output,
            started_at=started_at,
            finished_at=timezone.now(),
            error_message=str(exc),
        )
        return None, []


def _build_llm_interface():
    from llm_api.services import StringLLMChatInterface

    return StringLLMChatInterface()


def _agent_prompt(agent):
    return f"""
You are PRAETOR's {agent.name}.
Product vision: PRAETOR audits a real GitHub repository and returns concrete prioritized engineering findings.
Agent focus: {agent.focus}

Return only valid JSON with this schema:
{{
  "summary": "short summary of this agent review",
  "findings": [
    {{
      "category": "{agent.category}",
      "severity": "critical|high|medium|low|info",
      "title": "specific issue title",
      "description": "what is wrong and why it matters",
      "file_path": "relative/path.ext or empty string",
      "line_start": 123,
      "evidence": "short concrete evidence from the provided context",
      "recommendation": "specific remediation step",
      "confidence": 0.0
    }}
  ]
}}

Rules:
- Return at most 8 findings.
- Use only the provided repository context and tool findings.
- Do not invent files or line numbers. Use null for unknown line_start.
- Prefer fewer, concrete findings over generic advice.
- Do not include markdown, prose outside JSON, or comments.
""".strip()


def _build_agent_context(project, snapshot, files, tool_findings):
    tool_context = [
        {
            "category": finding.get("category"),
            "severity": finding.get("severity"),
            "title": finding.get("title"),
            "file_path": finding.get("file_path"),
            "line_start": finding.get("line_start"),
            "evidence": finding.get("evidence"),
        }
        for finding in tool_findings[:20]
    ]

    file_context = []
    total_chars = 0
    for file_data in files:
        content = file_data.get("content", "")[:MAX_CHARS_PER_FILE]
        if total_chars + len(content) > MAX_TOTAL_CONTEXT_CHARS:
            break
        total_chars += len(content)
        file_context.append(
            {
                "path": file_data["path"],
                "size_bytes": file_data.get("size_bytes", 0),
                "line_count": file_data.get("line_count", 0),
                "content_excerpt": content,
            }
        )

    context = {
        "project": {
            "name": project.name,
            "description": project.description,
            "repo_url": project.repo_url,
        },
        "snapshot": {
            "branch": snapshot.branch,
            "commit_sha": snapshot.commit_sha,
            "file_count": snapshot.file_count,
            "total_size_bytes": snapshot.total_size_bytes,
        },
        "tool_findings": tool_context,
        "files": file_context,
    }
    return json.dumps(context, ensure_ascii=False)


def _select_files_for_agent(agent, files):
    scored_files = []
    for file_data in files:
        path = file_data["path"]
        lower_path = path.lower()
        score = 0
        for pattern in agent.file_patterns:
            pattern_lower = pattern.lower()
            if pattern_lower.startswith(".") and PurePosixPath(path).suffix.lower() == pattern_lower:
                score += 3
            elif pattern_lower in lower_path:
                score += 2
        if PurePosixPath(path).name.lower() in {"readme.md", "package.json", "requirements.txt", "pyproject.toml"}:
            score += 1
        scored_files.append((score, file_data.get("size_bytes", 0), file_data))

    scored_files.sort(key=lambda item: (-item[0], item[1]))
    selected = [item[2] for item in scored_files if item[0] > 0][:MAX_FILES_PER_AGENT]
    if selected:
        return selected
    return [item[2] for item in scored_files[:MAX_FILES_PER_AGENT]]


def _parse_agent_json(raw_response):
    try:
        payload = json.loads(_strip_json_markdown(raw_response))
    except json.JSONDecodeError as exc:
        raise ValueError(f"Invalid JSON: {exc}") from exc

    if not isinstance(payload, dict):
        raise ValueError("Agent output must be a JSON object.")
    if "findings" not in payload or not isinstance(payload["findings"], list):
        raise ValueError("Agent output must contain a findings list.")

    payload.setdefault("summary", "")
    return payload


def _repair_agent_json(llm, prompt, raw_response, error_message):
    repair_prompt = json.dumps(
        {
            "error": error_message,
            "invalid_response": raw_response[:6000],
            "instruction": "Return only corrected valid JSON matching the requested PRAETOR schema.",
        },
        ensure_ascii=False,
    )
    return llm.conditioning_msg_string(conditioning=prompt, raw_prompt=repair_prompt)


def _normalize_agent_findings(agent, payload):
    findings = []
    for item in payload.get("findings", [])[:8]:
        if not isinstance(item, dict):
            continue

        severity = str(item.get("severity", Finding.SEVERITY_INFO)).lower()
        if severity not in VALID_SEVERITIES:
            severity = Finding.SEVERITY_INFO

        confidence = _coerce_confidence(item.get("confidence", 0.75), severity)
        findings.append(
            {
                "source": Finding.SOURCE_AI,
                "agent_name": agent.name,
                "category": str(item.get("category") or agent.category)[:80],
                "severity": severity,
                "title": str(item.get("title") or f"{agent.name} finding")[:255],
                "description": str(item.get("description") or ""),
                "file_path": str(item.get("file_path") or "")[:1024],
                "line_start": _coerce_line(item.get("line_start")),
                "evidence": str(item.get("evidence") or ""),
                "recommendation": str(item.get("recommendation") or "Review and remediate this issue."),
                "confidence": confidence,
            }
        )
    return findings


def _is_duplicate(candidate, existing_findings):
    for finding in existing_findings:
        same_location = (
            candidate.get("category") == finding.get("category")
            and candidate.get("file_path", "") == finding.get("file_path", "")
            and candidate.get("line_start") == finding.get("line_start")
        )
        if not same_location:
            continue
        title_similarity = SequenceMatcher(
            None,
            candidate.get("title", "").lower(),
            finding.get("title", "").lower(),
        ).ratio()
        if title_similarity >= 0.72:
            return True
    return False


def _strip_json_markdown(value):
    cleaned = (value or "").strip()
    if cleaned.startswith("```"):
        lines = cleaned.splitlines()
        if lines and lines[0].startswith("```"):
            lines = lines[1:]
        if lines and lines[-1].startswith("```"):
            lines = lines[:-1]
        cleaned = "\n".join(lines).strip()
    return cleaned


def _coerce_line(value):
    if value in ("", None):
        return None
    try:
        parsed = int(value)
    except (TypeError, ValueError):
        return None
    return parsed if parsed > 0 else None


def _coerce_confidence(value, severity):
    try:
        confidence = float(value)
    except (TypeError, ValueError):
        confidence = 0.75
    confidence = max(0.0, min(confidence, 1.0))
    if severity in {Finding.SEVERITY_CRITICAL, Finding.SEVERITY_HIGH}:
        return max(confidence, 0.7)
    return confidence


def _model_name():
    return os.getenv("OPENAI_MODEL") or os.getenv("GPT4ALL_MODEL") or "unknown"
