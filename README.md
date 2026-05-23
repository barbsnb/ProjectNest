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

- Django REST API with session-based authentication.
- React frontend with login, registration, project creation, analysis, suggestions, and chat views.
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
```

Frontend checks:

```bash
cd frontend
npm run build
npm audit --omit=dev
```

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

Sprint 0 is focused on repository hygiene, documentation, and preparing the codebase for a public GitHub link. The next sprint should implement GitHub repository ingestion and a real repository audit pipeline.
