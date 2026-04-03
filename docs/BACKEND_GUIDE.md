# Backend Guide

This guide helps our team build a simple, organized backend with **Node.js**, **Express**, and **MongoDB/Mongoose**. It works for projects using either JavaScript or TypeScript.

The goal is not to build a perfect enterprise backend. The goal is to keep the backend clear, safe, and easy for the whole team to understand.

## Core Principles

- keep the structure simple
- give each file one main job
- keep database code out of routes
- validate input before saving data
- return clear errors when something goes wrong
- keep secrets in `.env`, never in Git

## Recommended Project Structure

If your project uses TypeScript, use `.ts`. If your project uses JavaScript, use `.js`.

```text
src/
  app.ts
  server.ts
  config/
    passport.ts
  db/
    connect.ts
  routes/
    authRoutes.ts
    booksRoutes.ts
  controllers/
    authController.ts
    booksController.ts
  models/
    User.ts
    Book.ts
  middleware/
    auth.ts
    errorHandler.ts
    notFound.ts
  errors/
    badRequest.ts
    notFound.ts
    unauthenticated.ts
    index.ts
  utils/
    parseValidationError.ts
tests/
  auth.test.ts
  books.test.ts
views/
public/
```

Notes:

- `views/` and `public/` are mainly for server-rendered apps such as Express + EJS
- API-only backends may not need `views/` or `public/`
- if the project is very small, `app.ts` and `server.ts` can live in the same file
- add folders only when they solve a real problem

## What Each Folder Is For

- `app.ts`: create the Express app, add middleware, and register routes
- `server.ts`: connect to the database and start the server
- `config/`: setup that is shared by the app, such as Passport config
- `db/`: database connection setup
- `routes/`: define endpoints and connect them to controller functions
- `controllers/`: handle request and response logic
- `models/`: Mongoose schemas and models
- `middleware/`: auth, error handling, and other reusable request logic
- `errors/`: custom error classes
- `utils/`: small helpers that do not fit elsewhere
- `tests/`: backend tests
- `views/`: templates for server-rendered apps
- `public/`: static files for server-rendered apps

## Two Common Backend Styles

The projects we looked at mostly follow one of these styles:

### API Backend

Use this when the frontend is a separate React app or when the backend mainly serves JSON.

- routes point to controllers
- controllers return JSON
- frontend calls the backend with `fetch` or Axios
- auth is often token-based

### Server-Rendered Backend

Use this when Express renders pages directly with EJS.

- controllers usually `render` views or `redirect`
- `views/` and `public/` are part of the app structure
- auth often uses sessions and Passport
- flash messages and form handling are common

Pick one main style per project and stay consistent.

## Simple Request Flow

Try to keep the flow like this:

```text
route -> controller -> model/database -> response
```

Examples:

- `routes/booksRoutes.ts` defines `GET /books`
- `controllers/booksController.ts` gets the books
- `models/Book.ts` defines the data shape

## Routes

Keep routes small. Routes should mostly say which controller runs for which URL.

Good examples:

- `/auth/register`
- `/auth/login`
- `/books`
- `/books/:id`

Try not to put a lot of business logic directly inside route files.

## Controllers

Controllers handle request and response logic.

- API controllers usually return JSON and status codes
- server-rendered controllers usually render a view or redirect
- keep controllers readable
- if a controller is getting too large, split the logic up

## Models

Use models for database structure and validation rules.

- keep model files focused on one resource
- use clear field names
- add validation where it belongs
- avoid repeating the same validation in many places if the model can handle it

## Middleware

Middleware is useful for logic that should run in many places.

Common examples:

- auth middleware to protect routes
- `notFound` middleware for missing routes
- `errorHandler` middleware for consistent errors

If the same request logic appears in many routes, it may belong in middleware.

## Auth

Keep auth simple.

- if the project needs auth, use one clear approach
- server-rendered apps often use sessions and Passport
- API backends often use token-based auth
- keep auth logic in dedicated routes, controllers, and middleware
- hash passwords before saving them
- protect private routes with auth middleware

For student projects, consistency matters more than advanced auth patterns.

## Security Basics

- use `helmet` or similar middleware for safer defaults
- add rate limiting to sensitive routes such as login or signup
- validate and sanitize user input
- if you use sessions and forms, consider CSRF protection

## Errors and Validation

- validate user input before creating or updating records
- return helpful error messages
- use custom errors when the same error pattern repeats
- log unexpected server errors

Do not send raw stack traces to users.

## Environment Variables

Keep secrets in `.env`, such as:

- `PORT`
- `MONGO_URI`
- `SESSION_SECRET`
- `JWT_SECRET`

Never commit `.env` files.

For deployment, use MongoDB Atlas (free tier) to host your database in the cloud. Copy the connection string it gives you into your hosting platform's environment variables as `MONGO_URI`.

## Testing

You do not need a huge test suite. Start small.

Good early backend tests:

- one auth test
- one CRUD test
- one error-case test

If the backend has very little time, test the most important user flow first.

## When To Keep It Smaller

If the project is tiny, it is okay to start with fewer files.

For example, you may not need:

- a custom `errors/` folder on day one
- a `config/` folder before auth is added
- many utility files for a simple project

Start simple, then split things when the code becomes hard to read or reuse.

## Team Habits

- keep route names clear and predictable
- use consistent response shapes
- remove debug logs before opening a PR
- keep controllers readable
- ask for help when a file starts doing too many things
