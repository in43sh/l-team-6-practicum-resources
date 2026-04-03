# Team 6 Practicum Resources

Shared configuration files, guides, and product specs for the Sonix practicum project.

## What's in this repo

### Config files

| File | Purpose |
| --- | --- |
| `.env.example` | Template for environment variables (frontend and backend) |
| `.prettierrc.json` | Prettier formatting config |
| `eslint.config.js` | ESLint config (flat config, includes TypeScript, React, and Prettier) |

### Top-level docs

| File | Purpose |
| --- | --- |
| `CONTRIBUTING.md` | Team workflow: branches, PRs, merge strategy, conflict resolution |
| `SETUP.md` | How to clone and run the project locally |
| `mvp.md` | Sonix MVP spec: frontend, backend, routes, UI states, release checklist |
| `stitch-prompt.md` | Full Stitch design prompt for the Sonix UI |

### Guides (`docs/`)

| File | Purpose |
| --- | --- |
| `GIT_GUIDE.md` | Branch naming, commit messages, PR title conventions |
| `FRONTEND_GUIDE.md` | React project structure, components, state, env vars, testing |
| `BACKEND_GUIDE.md` | Node/Express/MongoDB structure, routes, controllers, auth, errors |
| `TAILWIND_GUIDE.md` | Tailwind utility patterns, responsive design, conditional classes |
| `TYPESCRIPT_GUIDE.md` | TypeScript patterns for React and Node: props, events, async, nulls |
| `TESTING_GUIDE.md` | What to test, how to structure tests, manual testing checklist |

## How to use

Copy the config files into your project root:

```bash
cp .env.example .env
cp .prettierrc.json <your-project>/
cp eslint.config.js <your-project>/
```

Fill in the real values in `.env`. Never commit `.env`.

Read `SETUP.md` to get the project running locally, and `CONTRIBUTING.md` before opening your first PR.
