# CLAUDE.md

Guidance for Claude Code when working with this repository.

## Project Overview

CDV webapp - full-stack application with Flask REST API backend and Next.js frontend.

## Quick Start

```bash
# Backend (terminal 1)
cd backend && poetry install && poetry run flask --app "app:create_app()" run --port 5000

# Frontend (terminal 2)
cd frontend && nvm use && npm install && npm run dev
```

## Development Commands

### Backend
```bash
cd backend
poetry install                                      # Install dependencies
poetry run flask --app "app:create_app()" run       # Dev server (default: 5000)
poetry run pytest                                   # Run tests
```

### Frontend
```bash
cd frontend
nvm use                  # Use Node 24 LTS
npm install              # Install dependencies
npm run dev              # Dev server (http://localhost:3000)
npm run build            # Production build
npm run lint             # Linting
```

## Architecture

### Backend
- **Stack**: Flask 3.x | Python 3.11+ | Poetry
- **Pattern**: App factory (`app/__init__.py` → `create_app()`)
- **Routes**: Flask Blueprints with `/api` prefix (`app/routes.py`)

### Frontend
- **Stack**: Next.js 16.x | React 19 | TypeScript | Node 24 LTS
- **Routing**: App Router (`app/` directory)
- **Layout**: `app/layout.tsx`

## Agent Instructions

Specialized instructions for each part of the codebase:

| Agent | File | Focus |
|-------|------|-------|
| Backend | `backend/AGENTS.md` | Flask patterns, security, PEP8 |
| Frontend | `frontend/AGENTS.md` | a11y, SEO, Core Web Vitals |

## Project Structure

```
cdv-webapp/
├── backend/
│   ├── app/
│   │   ├── __init__.py    # create_app() factory
│   │   └── routes.py      # API endpoints
│   ├── pyproject.toml
│   └── AGENTS.md          # Backend agent instructions
├── frontend/
│   ├── app/
│   │   ├── layout.tsx     # Root layout
│   │   └── page.tsx       # Home page
│   ├── .nvmrc             # Node version
│   └── AGENTS.md          # Frontend agent instructions
├── .gitignore
└── CLAUDE.md
```
