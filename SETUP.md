# Setup Guide

This guide helps the team get a project running locally for the first time.

## Before You Start

Make sure you have:

- Git
- Node.js and npm
- VS Code or another code editor
- access to the project repository

If the repo includes a Node version file such as `.nvmrc`, use that version of Node.

## 1. Clone Both Repos

Clone the frontend and backend into separate folders, side by side:

```bash
git clone <frontend-repo-url>
git clone <backend-repo-url>
```

You should now have two folders, for example:

```text
my-project-frontend/
my-project-backend/
```

Open each folder in its own VS Code window, or open the parent folder and use the integrated terminal to work in each.

## 2. Set Up the Frontend

```bash
cd my-project-frontend
npm install
```

If the repo includes `.env.example`, copy it and fill in the real values:

```bash
cp .env.example .env
```

Common frontend values:

- API base URL (the address your backend runs on locally, e.g. `http://localhost:5000`)

Never commit `.env`.

## 3. Set Up the Backend

```bash
cd my-project-backend
npm install
```

If the repo includes `.env.example`, copy it and fill in the real values:

```bash
cp .env.example .env
```

Common backend values:

- database connection string
- session secret or JWT secret
- any third-party API keys

Never commit `.env`.

## 4. Start Both Apps

Start each app in its own terminal:

```bash
# Terminal 1 — frontend
cd my-project-frontend
npm run dev
```

```bash
# Terminal 2 — backend
cd my-project-backend
npm run dev
```

Watch the terminal output to confirm which local URL or port each app is using. Make sure the frontend's API base URL in `.env` matches the port your backend is running on.

---

## Check That It Works

Try a few simple checks:

- the app starts without crashing
- the frontend loads in the browser
- the backend responds on its port
- login, signup, or the main page works
- automated tests run successfully

## Common Commands

These vary by project, but common ones are:

```bash
npm run dev
npm start
npm test
npm run build
```

## If Something Is Broken

Check these first:

- did `npm install` finish successfully in every app folder?
- is `.env` present and filled in correctly in every app folder?
- are you in the correct folder?
- are frontend and backend both running if the project needs both?
- is the port already being used by another app?

If you are still stuck:

1. copy the exact error message
2. check `package.json` scripts
3. ask in team chat or open a draft PR with notes

## Keep This File Updated

Whenever setup changes, update this file right away.

A good setup guide should help a new teammate get the project running without guessing.
