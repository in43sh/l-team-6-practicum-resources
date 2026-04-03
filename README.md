# Team 6 Practicum Resources

Shared configuration files, guides, and product specs for the Sonix practicum project.

## What's in this repo

### Config files

| File | Purpose |
| --- | --- |
| `.gitignore` | Ignores local-only files like `.DS_Store` and `.claude/` |
| `.env.example` | Template for environment variables (frontend and backend) |
| `.prettierrc.json` | Prettier formatting config |
| `eslint.config.js` | Combined ESLint flat config for a React/TypeScript project |
| `eslint.frontend.config.js` | Optional split ESLint flat config for a frontend-only repo |
| `eslint.backend.config.js` | Optional split ESLint flat config for a backend-only repo |

### Top-level docs

| File | Purpose |
| --- | --- |
| `CONTRIBUTING.md` | Team workflow: branches, PRs, merge strategy, conflict resolution |
| `SETUP.md` | How to clone and run the project locally |
| `mvp.md` | Sonix MVP spec: frontend, backend, routes, UI states, release checklist |
| `stitch-prompt.md` | Full Stitch design prompt for the Sonix UI |
| `.github/pull_request_template.md` | Lightweight PR template for change summary and testing notes |

### GitHub Rulesets (`github/`)

| File | Purpose |
| --- | --- |
| `github/README.md` | How to import the branch protection rulesets into GitHub |
| `github/dev-branch-protection.json` | Starter ruleset for the `development` branch |
| `github/main-branch-protection.json` | Starter ruleset for the `main` branch |

### Guides (`docs/`)

| File | Purpose |
| --- | --- |
| `docs/GIT_GUIDE.md` | Branch naming, commit messages, PR title conventions |
| `docs/FRONTEND_GUIDE.md` | React project structure, components, state, env vars, testing |
| `docs/BACKEND_GUIDE.md` | Node/Express/MongoDB structure, routes, controllers, auth, errors |
| `docs/TAILWIND_GUIDE.md` | Tailwind utility patterns, responsive design, conditional classes |
| `docs/TYPESCRIPT_GUIDE.md` | TypeScript patterns for React and Node: props, events, async, nulls |
| `docs/TESTING_GUIDE.md` | What to test, how to structure tests, manual testing checklist |

## How to use

Copy the config files into your project root:

```bash
cp .env.example .env
cp .prettierrc.json <your-project>/
cp eslint.config.js <your-project>/
```

Fill in the real values in `.env`. Never commit `.env`.

Read `SETUP.md` to get the project running locally, and `CONTRIBUTING.md` before opening your first PR.

If the team uses separate frontend and backend repos, use `eslint.frontend.config.js` and `eslint.backend.config.js` instead of the combined `eslint.config.js`.
