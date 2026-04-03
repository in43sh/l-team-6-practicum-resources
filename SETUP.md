# Setup Guide

This guide helps the team get a project running locally for the first time.

## Before You Start

Make sure you have:

- Git
- Node.js and npm
- VS Code or another code editor
- access to the project repository

If the repo includes a Node version file such as `.nvmrc`, use that version of Node.

Also check which package manager the project uses:

- `package-lock.json` -> use `npm`
- `pnpm-lock.yaml` -> use `pnpm`
- `yarn.lock` -> use `yarn`

The examples below use `npm`, but the main idea is the same for any package manager.

## 1. Identify The Project Layout

Most practicum teams use one of these setups:

### Option A: Separate frontend and backend repos

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

### Option B: One repo with everything inside

Clone the single repo:

```bash
git clone <project-repo-url>
cd <project-folder>
```

Common shapes include:

```text
my-project/
  client/
  server/
```

or:

```text
my-project/
  apps/frontend/
  apps/backend/
```

or a single app at the repo root.

If you are not sure where to start, check:

- the root `package.json`
- the `scripts` section in each `package.json`
- the project README

## 2. Install Dependencies

### If you have separate frontend and backend repos

```bash
cd my-project-frontend
npm install
cd ../my-project-backend
npm install
```

### If you have one repo

If the project has a root `package.json`, start there:

```bash
cd <project-folder>
npm install
```

If the frontend and backend each have their own `package.json`, install in each app folder too:

```bash
cd client
npm install
cd ../server
npm install
```

## 3. Set Up Environment Variables

If a repo includes `.env.example`, copy it and fill in the real values:

```bash
cp .env.example .env
```

Common frontend values include:

- API base URL (the address your backend runs on locally, e.g. `http://localhost:5000`)

Common backend values include:

- database connection string
- session secret or JWT secret
- any third-party API keys

Never commit `.env`.

If the project has more than one app folder, repeat this in each place that needs its own `.env`.

## 4. Start The App

### If you have separate frontend and backend repos

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

### If you have one repo

Start the app based on the scripts in `package.json`.

Common examples:

```bash
npm run dev
```

```bash
npm run client
```

```bash
npm run server
```

```bash
npm run frontend
```

```bash
npm run backend
```

Some repos start both apps from the root. Others need one terminal per app folder. Follow the scripts that already exist instead of inventing new commands.

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
npm run client
npm run server
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
- are you using the same package manager the repo already uses?
- does `package.json` actually contain the script you are trying to run?

If you are still stuck:

1. copy the exact error message
2. check `package.json` scripts
3. ask in team chat or open a draft PR with notes

## Keep This File Updated

Whenever setup changes, update this file right away.

A good setup guide should help a new teammate get the project running without guessing.
