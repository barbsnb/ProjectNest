# PRAETOR

PRAETOR is a multi-agent technical audit assistant for software projects. The product goal is simple: turn a GitHub repository into a prioritized engineering report covering security, architecture, code quality, testing, performance, documentation, and concrete remediation steps.

The current codebase is an early MVP prototype built for the ZPDS course at Warsaw University of Technology. It already contains user accounts, project records, LLM-generated project analysis, improvement suggestions, and an assistant chat. The next product milestone is repository-level analysis from a GitHub link.

## Product Scope

PRAETOR is designed for students, early-stage teams, small founders, and less experienced builders who need senior-level feedback before they ship. The target experience is:

1. User creates an account.
2. User submits a GitHub repository link.
3. PRAETOR ingests the repository safely.
4. Specialized agents review the codebase.
5. The app returns a prioritized audit report with risks, evidence, and fix recommendations.
6. User can discuss the report with an assistant that understands the project context.

## Current Features

- Django REST API with session-based authentication and per-project ownership checks.
- React frontend with login, registration, GitHub-based audit creation, analysis, suggestions, and chat views.
- GitHub repository ingestion for public repositories with file count, size limits, ignored vendor directories, and snapshot metadata.
- Deterministic analysis runs with normalized findings for secrets, dependency manifests, npm audit when lockfiles are present, Python dependency audit placeholders, and repository metrics.
- Multi-agent LLM review with Security, Architecture, Code Quality, and Testing/Reliability reviewers. Agent outputs are parsed as JSON, stored as `AgentResult`, converted to findings, deduplicated, and shown separately from deterministic tool findings.
- Professional report UX with dashboard summaries, top risks, category scores, paginated findings, finding detail, and contextual assistant handoff.
- Report assistant conversations grounded in project ownership, latest analysis run, selected finding data, report summary, bounded chat history, and selected code excerpts.
- OpenAI-compatible LLM integration with optional GPT4All-compatible local endpoint.
- Project analysis categories: code quality, architecture, security, tests, performance, documentation, and tooling.
- Environment-based configuration for secrets and LLM provider.

## Tech Stack

- Backend: Django 5, Django REST Framework, django-cors-headers.
- Frontend: React 18, React Bootstrap, React Router, Axios.
- LLM: OpenAI API or GPT4All-compatible local endpoint.
- Database: SQLite for local development.

## Repository Structure

```text
backend/
  config/          Django project settings and URL routing
  user_api/        Custom user model, auth endpoints, survey model
  projects_api/    Project, analysis, and improvement suggestion domain
    services/      Repository ingestion and project analysis services
  llm_api/         LLM managers, chat sessions, prompts, chat endpoints
frontend/
  src/             React app source
```

## Security Notice

Never commit secrets, API keys, local databases, virtual environments, `node_modules`, build output, or Python bytecode. Use `.env.example` as the template for local configuration.

If an API key has ever been visible in the repository or IDE context, revoke it at the provider immediately and create a new one.

## Backend Setup

Create and activate a virtual environment, then install dependencies:

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

Create a local environment file from the template and set your values:

```bash
copy .env.example .env
```

For the React app, create `frontend/.env` if the backend runs on a different URL:

```text
REACT_APP_API_URL=http://127.0.0.1:8000
```

Run the backend:

```bash
cd backend
python manage.py migrate
python manage.py runserver
```

By default, the API runs at:

```text
http://127.0.0.1:8000/
```

## Frontend Setup

Install frontend dependencies and start the development server:

```bash
cd frontend
npm install
npm start
```

By default, the frontend runs at:

```text
http://127.0.0.1:3000/
```

## Environment Variables

The most important local variables are:

```text
DJANGO_SECRET_KEY=change-me
DJANGO_DEBUG=True
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1
DJANGO_CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
LLM_PROVIDER=openai
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4.1-nano
REACT_APP_API_URL=http://127.0.0.1:8000
```

For local GPT4All-compatible usage:

```text
LLM_PROVIDER=gpt4all
GPT4ALL_URL=http://localhost:4891/v1/chat/completions
GPT4ALL_MODEL=Llama 3 8B Instruct
```

## Development Commands

Backend checks:

```bash
cd backend
python manage.py check
python manage.py makemigrations --check --dry-run
python manage.py test
```

Frontend checks:

```bash
cd frontend
npm run build
npm audit --omit=dev
```

## Demo Flow

Use a small public GitHub repository that you control or can safely analyze. Keep it under the current ingestion limits: 500 text files, 300 KB per file, and 20 MB total text.

Recommended Demo Day path:

1. Register or log in.
2. Open **New Audit** and submit `https://github.com/<owner>/<repo>`.
3. Wait for the repository snapshot to be indexed.
4. Run the audit from the report screen.
5. Open the top critical/high finding.
6. Use **Ask assistant about this finding** to show contextual remediation guidance.

The CI workflow in `.github/workflows/ci.yml` runs backend checks, backend tests, frontend build, dependency checks, and a lightweight secret scan for committed API keys.

## Cleanup Policy

The repository should contain source code, lockfiles, migrations, documentation, and static source assets only. Generated local artifacts must stay untracked:

- `node_modules/`
- `frontend/build/`
- `backend/db.sqlite3`
- `.env`
- `__pycache__/`
- `*.pyc`
- `docs/` for local planning, sprint prompts, and internal audit notes

## Project Status

Sprint 6 hardens the Demo Day path: auth responses no longer expose credentials, protected frontend routes guard the workspace, finding detail has ownership checks, CI covers backend/frontend validation, and the README now documents the demo path. Remaining product work should focus on deployment configuration, report export, and richer remediation workflow.
