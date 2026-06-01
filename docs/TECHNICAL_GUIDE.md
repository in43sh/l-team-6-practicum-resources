> A new engineer or AI assistant reading only this file should understand how the system is built, where everything lives, how to run and deploy it, and which non-obvious decisions to respect.

---

## 1. What This Is

**One-line mission:** Sonix lets users browse, play, and save audio-reactive WebGL shader visualizers that render in real-time to their microphone input.

**Roles:**

| Role | Access |

|---|---|

| Public visitor | Landing page + demo player (`/visualizer/demo`) only |

| Registered user | Full catalog, save favorites, play any visualizer, settings |

| Admin / content manager | No web UI — visualizers are managed via the seed script only |

**State:** Actively developed Code-the-Dream practicum project (team6). Not yet in public production.

**Major moving parts:**

- **Backend** — Express 5 API + MongoDB, serves the built SPA in production

- **Frontend** — React 19 SPA, Three.js WebGL shader renderer, Vite build

- **Shared** — TypeScript types + `ApiEndpoints` enum consumed by both workspaces

- **MongoDB** — primary data store; GridFS bucket `images` for binary file storage

---

## 2. Architecture

![Architecture diagram](docs/diagrams/architecture.svg)

### Representative end-to-end flow — authenticated user opens a visualizer

![Visualizer load sequence](docs/diagrams/visualizer-flow.svg)

---

## 3. Repository Structure

```

sonix/ ← npm workspace root

├── package.json ← workspace scripts (dev, build, test, lint, format)

├── render.yaml ← Render deployment config

├── .env.example ← ⚠ EMPTY — no placeholder values; see §11 for all required vars

├── shared/ ← @sonix/shared — compiled to shared/dist/

│ └── src/index.ts ← TS interfaces (User, Visualizer, UserVisual, ApiResponse)

│ + ApiEndpoints enum + endpoint builder fns

├── backend/ ← @sonix/backend

│ ├── src/

│ │ ├── server.ts ← entry point: load env, connectDB, listen

│ │ ├── app.ts ← Express app: middleware stack + route mounts + SPA fallback

│ │ ├── db/connect.ts ← mongoose.connect wrapper

│ │ ├── models/ ← Mongoose schemas (User, Visualizer, UserVisual, Image)

│ │ ├── routes/ ← Express Routers (auth, user, visualizer, images)

│ │ ├── controllers/ ← Route handlers (auth, user, visualizer, images)

│ │ ├── middleware/ ← authentication, errorHandler, notFound, uploadImage

│ │ ├── services/ ← imageStorage.ts (validation + GridFS wrapper)

│ │ ├── utils/ ← jwt.ts, gridfs.ts, imageValidation.ts

│ │ ├── errors/ ← CustomAPIError + subclasses (BadRequest, NotFound, …)

│ │ └── scripts/

│ │ └── seedVisualizers.ts ← one-shot DB seeder (wipes + re-inserts all visualizers)

│ ├── config/

│ │ └── db.postgres.js ← ⚠ DEAD CODE — not imported anywhere; pg package also unused

│ ├── tests/ ← Vitest test suite (mirrors src/ structure)

│ └── public/previews/ ← PNG preview images consumed by seed script (not in git)

└── frontend/ ← @sonix/frontend

├── src/

│ ├── main.tsx ← React root: wraps App in AuthProvider + ToastProvider

│ ├── App.tsx ← React Router route table

│ ├── api/ ← fetch wrappers (client.ts, auth.ts, users.ts, visualizers.ts, images.ts)

│ ├── context/ ← AuthProvider (session state), ToastProvider (notification queue)

│ ├── pages/ ← One file per route (LandingPage, LoginPage, …)

│ ├── components/ ← Shared UI (NavBar, VisualizerCard, VisualizerPlayerShell, …)

│ ├── hooks/ ← Custom hooks (useAudioAnalyzer, usePlayerVisualizer, …)

│ ├── routes/ ← ProtectedRoute, GuestRoute, paths.ts (Routes enum)

│ └── utils/ ← visualPreview.ts (Three.js renderer), audioDevices.ts, …

└── tests/ ← Vitest + Testing Library test suite

```

---

## 4. Tech Stack

| Layer | Technology | Why |

|---|---|---|

| Runtime | Node.js ≥ 24 | Workspace requirement; matches Render NODE_VERSION |

| Backend framework | Express 5 | Team familiarity; async error propagation in v5 without wrapper |

| Database | MongoDB 9 (Mongoose) | Schema-flexible for GLSL text blobs; GridFS for binary storage in the same DB |

| File storage | MongoDB GridFS bucket `images` | Keeps all data in one service; avoids S3 dependency for practicum scope |

| Auth | JWT in httpOnly signed cookie | Token unreachable by JS (XSS-resistant); `sameSite: strict` prevents CSRF |

| Password hashing | bcryptjs (10 rounds) | Industry standard; pure-JS, no native addon |

| Security headers | helmet | Sane defaults with one middleware line |

| Rate limiting | express-rate-limit | Auth routes 20/15 min (prod), global 100/15 min (prod) |

| Frontend framework | React 19 | Team familiarity; used in curriculum |

| Routing | React Router v6 | Standard for React SPAs |

| 3D/WebGL | Three.js 0.184 + WebGL2 | Abstracts WebGL boilerplate; `RawShaderMaterial` passes GLSL directly |

| Styling | Tailwind CSS v4 | Utility-first; no separate design token step |

| Build tool | Vite 8 | Fast HMR; handles TS + React transform |

| Type sharing | `@sonix/shared` npm workspace | Single source of truth for interfaces + API endpoint strings |

| Testing | Vitest + Supertest + mongodb-memory-server | In-memory Mongo avoids real DB in CI; fast |

| Deployment | Render (free plan) | Zero-config for Node; auto-deploy on push |

---

## 5. Data Architecture

### Collections

#### `users`

| Field | Type | Purpose |

|---|---|---|

| `_id` | ObjectId | Primary key |

| `name` | String (2–50) | Display name |

| `email` | String (unique) | Login identifier; regex-validated |

| `password` | String (min 8) | bcrypt hash; stripped from `toJSON()` output |

| `image` | ObjectId → `images` | Optional avatar; set after `POST /api/v1/images/users/user` |

| `createdAt` | Date | Set on insert (default: Date.now) |

#### `visualizers`

| Field | Type | Purpose |

|---|---|---|

| `_id` | ObjectId | Primary key |

| `name` | String (trimmed) | Display title |

| `source` | String | ⚠ Attribution / origin URL — defined in schema and present in seed JSON, but **not returned by any API endpoint and not used in the frontend** |

| `glsl` | String (required) | Full GLSL fragment shader source |

| `imageUrl` | ObjectId → `images` | Thumbnail; absent → no preview image |

| `isDemo` | Boolean (default false) | Exactly one doc has `true`; returned by `GET /demo` without auth |

| `tags` | String[] (default []) | Filterable categories (e.g. `"abstract"`, `"neon"`) |

| `createdAt` / `updatedAt` | Date | Mongoose `timestamps: true` |

#### `uservisuals` (join table — user's saved collection)

| Field | Type | Purpose |

|---|---|---|

| `_id` | ObjectId | Primary key |

| `userId` | ObjectId → `users` | Owner |

| `visualizerId` | ObjectId → `visualizers` | Saved item |

| `savedAt` | Date | Default: Date.now |

**Unique index:** `{ userId: 1, visualizerId: 1 }` — duplicate save returns 400 (caught before insert).

#### `images` (metadata; binary in GridFS)

| Field | Type | Purpose |

|---|---|---|

| `_id` | ObjectId | Primary key |

| `ownerType` | `'user'` \| `'visualizer'` | Discriminator |

| `ownerId` | ObjectId | Ref to the owning User or Visualizer |

| `fileId` | ObjectId | GridFS `files._id` in bucket `images` |

| `filename` | String | Original filename |

| `contentType` | String | MIME type (jpeg/png/webp/gif) |

| `size` | Number | Bytes |

**Unique index:** `{ ownerType: 1, ownerId: 1 }` — one image per entity; upload uses `findOneAndUpdate` with `upsert: true`, so re-uploading replaces the old GridFS file and metadata record.

### Entity Relationships

![Entity relationships](docs/diagrams/er.svg)

---

## 6. Core Subsystems

### 6.1 Authentication & Authorization

**Mechanism:** JWT stored in an httpOnly signed cookie named `token`.

**Login flow:**

1. `POST /api/v1/auth/login` → validate credentials → `user.createJWT()` → `attachCookiesToResponse()`

2. `attachCookiesToResponse` sets `res.cookie('token', jwt, { httpOnly, signed, secure, sameSite: 'strict', expires: +7 days })`

3. Cookie is signed using `JWT_SECRET` via `cookieParser(process.env.JWT_SECRET)` initialized in `app.ts`

4. Frontend reads no token — it just sends `credentials: 'include'` on every fetch

**Session restoration:** `AuthProvider` calls `GET /api/v1/users/user` on mount. If cookie is valid → sets `user` state. If not → `user = null`. `loading: true` during this check; app blocks render until resolved.

**Route guards (backend):** `authenticateUser` middleware ([backend/src/middleware/authentication.ts](backend/src/middleware/authentication.ts)):

- Reads `req.signedCookies.token`

- Verifies with `jwt.verify(token, JWT_SECRET)`

- Attaches `req.user = { userId, name, email }` for downstream controllers

**Route guards (frontend):**

- `ProtectedRoute` — redirects unauthenticated users to `/login`

- `GuestRoute` — redirects authenticated users away from `/login` and `/signup`

**Logout:** Server sets cookie to expired string `'logout'` with `expires: new Date(Date.now())`. Frontend clears `user` state.

**Roles:** No RBAC. All authenticated users have identical permissions. Admins have no web interface — they run the seed script directly.

> ⚠ **Why httpOnly cookie instead of localStorage JWT?** An httpOnly cookie is invisible to JavaScript — XSS attacks that inject `document.cookie` or fetch calls cannot read the token. `sameSite: 'strict'` blocks cross-site request forgery. If this were stored in localStorage, any injected script could exfiltrate it.

### 6.2 API Surface

See §7 for full endpoint tables.

**Conventions:**

- All responses: `{ data: T }` on success, `{ error: { message: string } }` on failure

- 204 responses have no body

- All errors flow through `errorHandler` middleware in [backend/src/middleware/errorHandler.ts](backend/src/middleware/errorHandler.ts)

- Error classes live in [backend/src/errors/](backend/src/errors/) — throw a subclass in any controller; it surfaces with the correct HTTP status automatically

**Rate limits:**

| Scope | Production | Development |

|---|---|---|

| Global (all routes) | 100 req / 15 min / IP | 1000 req / 15 min / IP |

| Auth routes only | 20 req / 15 min / IP | 1000 req / 15 min / IP |

### 6.3 Frontend — State Management

No global state library. Two React contexts:

| Context | Provider | What it holds |

|---|---|---|

| `AuthContext` | `AuthProvider` | `user: User \| null`, `loading`, `login()`, `register()`, `updateProfile()`, `logout()` |

| `ToastContext` | `ToastProvider` | `toast.success()`, `toast.error()`, `toast.info()` — ephemeral notification queue |

Server state is fetched directly in components and pages with `useEffect` + `useState`. No React Query or SWR.

**GLSL cache** ([frontend/src/hooks/usePreviewGlsl.ts](frontend/src/hooks/usePreviewGlsl.ts)): Module-level `Map` instances (not React state) — survive component unmounts. Prevents duplicate API calls when hovering multiple cards or navigating back to player:

- `glslCache: Map<string, string>` — cacheKey → glsl string

- `visualMetaCache: Map<string, PlayerVisual>` — cacheKey → { id, name, tags, isDemo }

- `pendingRequests: Map<string, Promise>` — deduplicates simultaneous fetches for the same key

### 6.4 GLSL Shader Renderer

The core product feature. Lives in [frontend/src/utils/visualPreview.ts](frontend/src/utils/visualPreview.ts).

**Pipeline:**

1. Create `canvas` element → `getContext('webgl2')`

2. Wrap in `THREE.WebGLRenderer` (reusing the existing WebGL2 context)

3. Orthographic camera + fullscreen `PlaneGeometry(2,2)` — effectively a screen-space quad

4. `THREE.RawShaderMaterial` with `glslVersion: THREE.GLSL3`, vertex shader provides `gl_Position`, fragment shader is the stored GLSL

5. Uniforms match ShaderToy convention:

| Uniform | Type | Value |

|---|---|---|

| `iTime` | float | Seconds since start (pause-aware) |

| `iTimeDelta` | float | Frame delta seconds |

| `iFrame` | int | Frame counter |

| `iFrameRate` | float | Instantaneous FPS |

| `iResolution` | vec3 | Canvas pixel dimensions (z=1) |

| `iMouse` | vec4 | Mouse position (x,y) + click state |

| `iDate` | vec4 | Year, month, day, time-of-day seconds |

| `iChannelTime` | float[4] | Per-channel time (only [0] used) |

| `iChannelResolution` | vec3[4] | Per-channel texture size |

| `iChannel0` | sampler2D | 512×2 RGBA FFT texture |

1. `iChannel0` FFT texture: 512 × 2 pixels, RGBA format, each pixel's R/G/B = frequency bin amplitude (0–255). Built from `AnalyserNode.getByteFrequencyData()` (128 bins from FFT_SIZE=256, upsampled to 512 columns) every animation frame.

**Preview mode (card hover):** Same pipeline, but: `immersive=false` → CSS filter `saturate(2.5) contrast(1.7) brightness(1.5)` applied for visual pop. Uses synthetic FFT (`fillSyntheticFft`) — no microphone needed. One active preview at a time, coordinated via `window.dispatchEvent(new CustomEvent('visual-card-preview-change', ...))`.

> ℹ **Synthetic FFT:** Card previews and the demo player never request microphone access. `fillSyntheticFft()` generates a fake-but-plausible frequency curve (heavy bass roll-off, gentle mid-wave) so shaders animate visually without audio. Real mic data only flows in the authenticated full-screen player.

**Player mode (full page):** `immersive=true` — no CSS filter, real microphone FFT, play/pause control, fullscreen API.

**Cleanup:** `startVisualPreview` returns a cleanup function that cancels rAF, disconnects ResizeObserver, disposes Three.js objects, and removes the canvas. Called from React `useEffect` cleanup.

### 6.5 Image Storage (GridFS)

Images (user avatars + visualizer thumbnails) are stored as binary chunks in MongoDB GridFS bucket `images`.

**Upload path:**

```

POST /api/v1/images/users/user

→ multer.memoryStorage() (max 5 MB; JPEG/PNG/WebP/GIF only)

→ uploadBufferToGridFS(buffer, filename, mimetype, 'images')

→ Image.findOneAndUpdate({ ownerType, ownerId }, ..., { upsert: true })

→ User.findByIdAndUpdate(userId, { image: imageRecord._id })

```

**Serve path:**

```

GET /api/v1/images/users/:userId

→ Image.findOne({ ownerType: 'user', ownerId })

→ res.setHeader('Content-Type', image.contentType)

→ openGridFSDownloadStream(image.fileId, 'images').pipe(res)

```

GridFS utilities: [backend/src/utils/gridfs.ts](backend/src/utils/gridfs.ts) — `uploadBufferToGridFS`, `deleteGridFSFile`, `openGridFSDownloadStream`, `getGridFSBucket`. All use `mongoose.connection.db` which is available after `connectDB()` resolves.

> ⚠ **Why GridFS instead of S3/disk?** Keeps all data — documents and binaries — in a single MongoDB service. Eliminates S3 bucket setup, IAM credentials, and a second billing surface. Acceptable trade-off for practicum scope; revisit if the image volume grows large enough to strain MongoDB storage.

### 6.6 Visualizer Catalog & Seed

Visualizers are seeded once via [backend/src/scripts/seedVisualizers.ts](backend/src/scripts/seedVisualizers.ts):

- Reads `backend/src/seed/visualizers.seed.json` — array of `{ shader (base64 GLSL), title, description, categories, image, id }`

- Reads PNG preview files from `backend/public/previews/`

- **Wipes** all `Visualizer`, `Image`, and GridFS `images` bucket docs before inserting

- First entry (`index === 0`) is marked `isDemo: true`

GLSL in the seed file is base64-encoded. The seeder decodes it: `Buffer.from(entry.shader, 'base64').toString('utf-8')`.

**Run:** `npm run seed -w backend` (requires `MONGO_URI` in `.env`).

---

## 7. API Reference

### Public endpoints (no auth required)

| Method | Path | Purpose |

|---|---|---|

| GET | `/api/v1/health` | Health check — returns `{ status: 'ok' }` |

| POST | `/api/v1/auth/register` | Create account — body: `{ name, email, password }` |

| POST | `/api/v1/auth/login` | Authenticate — body: `{ email, password }` |

| POST | `/api/v1/auth/logout` | Invalidate session cookie |

| GET | `/api/v1/visualizers` | Paginated catalog — query: `page`, `limit` (max 50), `search`, `tag`; excludes `glsl` field |

| GET | `/api/v1/visualizers/demo` | Demo visualizer (full including `glsl`) |

| GET | `/api/v1/visualizers/tags` | Sorted list of distinct tag strings |

| GET | `/api/v1/images/users/:userId` | User avatar image stream |

| GET | `/api/v1/images/visualizers/:visualizerId` | Visualizer thumbnail image stream |

### Authenticated endpoints (cookie required)

| Method | Path | Purpose |

|---|---|---|

| GET | `/api/v1/visualizers/:id` | Full visualizer including `glsl` |

| GET | `/api/v1/users/user` | Current user profile |

| PATCH | `/api/v1/users/user` | Update name/email — body: `{ name?, email? }` |

| DELETE | `/api/v1/users/user` | Delete account — body: `{ password }` (cascade deletes UserVisuals) |

| PATCH | `/api/v1/users/user/password` | Change password — body: `{ currentPassword, newPassword }` |

| GET | `/api/v1/users/current/visuals` | User's saved collection (populated `visualizerId`) |

| POST | `/api/v1/users/current/visuals/:id` | Save visualizer to collection |

| DELETE | `/api/v1/users/current/visuals/:id` | Remove from collection |

| POST | `/api/v1/images/users/user` | Upload/replace user avatar — `multipart/form-data`, field `image` |

| DELETE | `/api/v1/images/users/user` | Delete user avatar |

---

## 8. Frontend Pages & Routes

| Route | Page file | Auth | Notable behavior |

|---|---|---|---|

| `/` | `LandingPage.tsx` | Public | Marketing/intro; links to demo + signup |

| `/login` | `LoginPage.tsx` | GuestRoute | Redirects to `/explore` if already logged in |

| `/signup` | `SignUpPage.tsx` | GuestRoute | Redirects to `/explore` if already logged in |

| `/explore` | `ExplorePage.tsx` | ProtectedRoute | Paginated grid (8/page), search (400 ms debounce), tag filter; optimistic save/unsave |

| `/visualizer/demo` | `DemoPlayerPage.tsx` | Public | Full-screen player with synthetic FFT; no save button |

| `/visualizer/:id` | `PlayerPage.tsx` | ProtectedRoute | Full-screen player with mic input; keyboard shortcuts `S` (play), `M` (mute), `F` (fullscreen) |

| `/my-visuals` | `MyVisualsPage.tsx` | ProtectedRoute | User's saved collection; sort by recent/A-Z/Z-A; confirm-before-remove |

| `/settings` | `SettingsPage.tsx` | ProtectedRoute | Display name (auto-save on blur), change password, delete account (modal) |

| `*` | `NotFoundPage.tsx` | Public | 404 fallback |

**Navigation:** `NavBar` renders on every page. Shows logo + auth links (guest) or avatar + user menu (authenticated). `Avatar` is generated from name initial + deterministic gradient (no custom avatar image in nav — `image` field is uploaded separately via settings, currently only used for data model completeness).

**State management approach:** Server state managed locally per page with `useEffect` + `useState`. No caching layer except the GLSL module-level cache described in §6.3.

---

## 9. Testing

### Backend — Vitest + Supertest + mongodb-memory-server

Tests run against an in-memory MongoDB instance (`mongodb-memory-server`). No real DB or network needed.

| Folder | Files | What's covered |

|---|---|---|

| `tests/controllers/` | auth, images, user, visualizer | HTTP-level route integration |

| `tests/routes/` | auth, images, users, visualizers | Route mounting + middleware chain |

| `tests/models/` | User, UserVisual, Image | Schema validation, hooks, methods |

| `tests/middleware/` | errorHandler, notFound, uploadImage | Middleware behavior |

| `tests/services/` | imageStorage | Validation + GridFS wrapper |

| `tests/utils/` | gridfs | GridFS bucket operations |

| `tests/db/` | connect, visualizer | DB connection + model integration |

| `tests/errors/` | CustomAPIError, subclasses | Error hierarchy |

### Frontend — Vitest + @testing-library/react + jsdom

| Folder | Files | What's covered |

|---|---|---|

| `tests/api/` | client, wrappers | `apiFetch`, API function wrappers |

| `tests/components/` | 9 components | NavBar, VisualizerCard, PlayerControlBar, etc. |

| `tests/context/` | AuthProvider, ToastProvider, hooks | Context behavior |

| `tests/hooks/` | 8 hooks | useAudioAnalyzer, usePlayerGlsl, usePlayerVisualizer, etc. |

| `tests/pages/` | 5 pages | Login, Signup, MyVisuals, Settings, basic pages |

| `tests/routes/` | routeGuards | ProtectedRoute + GuestRoute redirect behavior |

| `tests/utils/` | visualPreview | Three.js renderer utility |

### Run commands

```bash

npm test # backend + frontend (all)

npm run test:coverage # with coverage report

npm run test -w backend # backend only

npm run test -w frontend # frontend only

```

### What is NOT tested

- GLSL shader output or visual correctness — no GPU in CI

- GridFS streaming in production-like environment (in-memory Mongo has GridFS but no real I/O)

- Render deployment pipeline

- End-to-end browser flows (no Playwright/Cypress)

- Rate limiter behavior under load

- `DemoPlayerPage` and `PlayerPage` full integration (WebGL not available in jsdom)

- Seed script

---

## 10. Local Development

### Prerequisites

- Node.js ≥ 24.0.0 (`node --version`)

- MongoDB running locally (e.g. `brew services start mongodb-community` or Docker)

- `npm` (comes with Node)

### Setup

```bash

# 1. Clone and install

git clone https://github.com/Code-the-Dream-School/l-group-practicum-team6

cd l-group-practicum-team6

npm install

  

# 2. Create .env (root .env.example is empty — use these values)

cat > .env << 'EOF'

MONGO_URI=mongodb://localhost:27017/sonix

JWT_SECRET=your-local-secret-min-32-chars

JWT_LIFETIME=7d

CLIENT_URL=http://localhost:5173

VITE_API_BASE_URL=http://localhost:5001

VITE_PUBLIC_APP_NAME=Sonix

EOF

  

# 3. Seed the visualizer catalog

# Requires: backend/src/seed/visualizers.seed.json

# backend/public/previews/*.png (one PNG per visualizer)

npm run seed -w backend

  

# 4. Start dev servers (backend :5001 + frontend :5173 concurrently)

npm run dev

```

### Commands reference

| Command | What it does |

|---|---|

| `npm run dev` | Backend (`nodemon ts-node`) + Vite frontend concurrently |

| `npm run build` | Compile shared → frontend → backend (for production) |

| `npm start` | Start compiled backend (`node dist/server.js`) |

| `npm test` | Run all tests (backend + frontend) |

| `npm run test:coverage` | Tests with V8 coverage report |

| `npm run lint` | ESLint across all workspaces |

| `npm run typecheck` | TypeScript type-check all workspaces |

| `npm run format` | Prettier format in-place |

| `npm run format:check` | Prettier check (CI) |

| `npm run seed -w backend` | Seed / re-seed visualizers (DESTRUCTIVE — wipes existing data) |

### Common first-run issues

| Problem | Fix |

|---|---|

| `MONGO_URI environment variable is not set` | Create `.env` at repo root with `MONGO_URI=...` |

| `Missing preview file: foo.png` | Place PNG files in `backend/public/previews/` before seeding |

| `Cannot find module '@sonix/shared'` | Run `npm run build -w shared` (shared must be compiled first) |

| Frontend shows blank page on `/explore` | Backend not running; check port 5001 |

| Auth cookie not sent | `VITE_API_BASE_URL` must match backend origin exactly (including port) |

| `ERR_USE_AFTER_FREE` or `MongoServerError` in tests | Stale mongo-memory-server process; `pkill mongod` and retry |

---

## 11. Environment Variables

| Variable | Required | Secret | Purpose |

|---|---|---|---|

| `MONGO_URI` | Yes | Yes | MongoDB connection string |

| `JWT_SECRET` | Yes | Yes | Signs JWTs and verifies signed cookies (Render auto-generates) |

| `JWT_LIFETIME` | No | No | JWT expiry (default `7d` in code; Render sets `1d`) |

| `CLIENT_URL` | Yes | No | CORS allowed origin — must be exact frontend URL |

| `VITE_API_BASE_URL` | No | No | API base for frontend fetches; `''` in prod (same origin), `http://localhost:5001` in dev |

| `VITE_PUBLIC_APP_NAME` | No | No | App display name; defaults to `Sonix` |

| `NODE_ENV` | No | No | `production` enables secure cookies, disables morgan, strips error stacks |

| `PORT` | No | No | Server listen port; defaults to `5001` |

> **Warning:** `JWT_SECRET` and `JWT_LIFETIME` govern both cookie signing and JWT verification. They must be consistent across restarts. Render auto-generates `JWT_SECRET` per service — never hardcode it.

---

## 12. Deployment

**Platform:** Render (free plan, Oregon region)

**Repo:** `https://github.com/Code-the-Dream-School/l-group-practicum-team6`

**Branch:** `dev` (auto-deploy on push)

### Build & start

```

Build command: npm install && npm run build

Start command: npm start

```

`npm run build` compiles in workspace order: `shared` → `frontend` (Vite) → `backend` (tsc). The backend `start` command runs `node dist/server.js`.

### SPA serving

In production, Express serves the React build from `frontend/dist/`:

```typescript

// app.ts

app.use(express.static(clientDist));

app.get(/^\/(?!api\/).*/, (_req, res) => {

res.sendFile(path.join(clientDist, 'index.html'));

});

```

All non-`/api` GET requests fall through to `index.html`, enabling client-side routing on hard refresh.

### Health check

Render polls `GET /api/v1/health` → `{ status: 'ok' }` to determine service health.

### Env vars on Render

Set in the Render dashboard or `render.yaml`. Sensitive values (`MONGO_URI`, `CLIENT_URL`) are marked `sync: false` and must be set manually. `JWT_SECRET` is auto-generated by Render (`generateValue: true`).

### Deploy flow

```

git push origin dev

→ Render detects push

→ npm install && npm run build

→ health check passes

→ traffic switches to new deploy

```

No preview environments are configured. No separate production branch — `dev` is the deployed branch.

---

## 13. Security Model

### Auth boundaries

- All writes and reads of user-specific data require a valid signed JWT cookie

- Only `GET /api/v1/visualizers` (list), `GET /api/v1/visualizers/demo`, `GET /api/v1/visualizers/tags`, `GET /api/v1/images/*`, `POST /api/v1/auth/*` are public

- `getVisualizerById` (full GLSL) requires auth — prevents anonymous GLSL scraping

- User can only modify their own data (controllers use `req.user.userId` from verified JWT, not from request body)

### Cookie security

- `httpOnly: true` — inaccessible to JavaScript

- `signed: true` — server detects tampering (HMAC via `JWT_SECRET`)

- `secure: true` in production — HTTPS only

- `sameSite: 'strict'` — cookie not sent on cross-site navigations (CSRF mitigation)

### Input validation

- Email: regex `/^\S+@\S+\.\S+$/` at schema level

- Password: min 8 chars at schema level; bcrypt 10 rounds

- Image upload: MIME type whitelist (`image/jpeg`, `image/png`, `image/webp`, `image/gif`); 5 MB max via multer `limits.fileSize`

- ObjectId: `mongoose.Types.ObjectId.isValid(id)` checked before any `findById` in user/visualizer controllers

- Pagination: `Math.max(1, parseInt(...))` and `Math.min(50, ...)` guard on limit

### Error responses

Production: `{ error: { message: 'Internal server error' } }` (stack hidden).

Development: `{ error: { message: err.message } }` (full message, no stack in JSON).

`CustomAPIError` subclasses always expose their message in both environments.

### Headers

`helmet()` applied globally — sets `Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, etc. with sane defaults.

---

## 14. Key Patterns

### 1. Error class hierarchy

All application errors extend `CustomAPIError` → carries HTTP status code. Throw from any controller; `errorHandler` catches and serializes. Never `res.status(xxx).json(...)` inside a controller for errors.

```typescript

// errors/index.ts

export { BadRequestError } // 400

export { UnauthenticatedError } // 401

export { ForbiddenError } // 403

export { NotFoundError } // 404

```

### 2. Shared types as the contract

`@sonix/shared` is the single source of truth for API shapes. Both frontend API wrappers and backend response bodies use the same `User`, `Visualizer`, `ApiResponse<T>` interfaces. The `ApiEndpoints` enum is imported by both — backend routes are mounted at the same paths the frontend calls.

### 3. GLSL cache deduplication

The `pendingRequests` Map in `usePreviewGlsl.ts` prevents N concurrent fetches for the same visualizer when N cards are hovered before the first fetch resolves. Pattern: check cache → check pending → create promise → store in pending → `.finally(() => pendingRequests.delete(key))`.

### 4. Optimistic UI for save/unsave

`ExplorePage` updates `savedVisualIds` state immediately on toggle, then sends the API request. On failure, rolls back to the previous state and shows a toast. Keeps the UI snappy without loading states on every heart click.

### 5. `getAllVisualizers` excludes `glsl`

`.select('_id name imageUrl isDemo tags')` keeps list responses small — GLSL strings can be large. Full GLSL is only fetched via `GET /visualizers/:id` when a user actually opens the player.

### 6. Synthetic FFT for demo / preview

The demo player and card previews never request microphone access. `fillSyntheticFft` generates a plausible frequency curve (boosted bass, gentle wave) so shaders animate meaningfully without audio.

### 7. Single image per entity (upsert pattern)

`Image.findOneAndUpdate({ ownerType, ownerId }, ..., { upsert: true })` — uploading a new avatar atomically replaces the metadata record. The old GridFS file is deleted before the new one is created to avoid orphaned binary chunks.

---

## 15. Glossary

| Term | Definition |

|---|---|

| **Visualizer** | A named GLSL fragment shader with metadata (tags, preview image). The core content unit of Sonix. |

| **GLSL** | OpenGL Shading Language — the source code of a visualizer's fragment shader, stored as a UTF-8 string in MongoDB |

| **iChannel0** | The FFT audio texture passed to each shader as `sampler2D`. 512×2 RGBA pixels; each pixel's R value is a frequency bin amplitude (0–255). Matches ShaderToy convention. |

| **FFT** | Fast Fourier Transform — converts microphone time-domain audio to frequency spectrum. Source: `AnalyserNode.getByteFrequencyData()` with FFT_SIZE=256 (128 output bins). |

| **Demo visualizer** | The one `Visualizer` document with `isDemo: true`. Publicly playable without auth; uses synthetic FFT. |

| **Signed cookie** | HTTP cookie whose value is HMAC-signed by Express `cookie-parser` using `JWT_SECRET`. Server rejects any cookie whose signature doesn't match. |

| **GridFS** | MongoDB's chunked binary file storage protocol. Splits files into 255 KB chunks stored in `images.chunks`, with metadata in `images.files`. |

| **UserVisual** | The join-table document representing one user saving one visualizer to their collection (favorites). |

| **Synthetic FFT** | `fillSyntheticFft()` — procedurally generated frequency data approximating a real music spectrum, used when no microphone is available. |

| **GuestRoute** | React wrapper that redirects authenticated users away from login/signup pages. Inverse of `ProtectedRoute`. |

| **`@sonix/shared`** | The npm workspace package (`shared/`) that exports TypeScript interfaces and the `ApiEndpoints` enum to both backend and frontend. Must be built (`npm run build -w shared`) before other workspaces can consume it. |

| **`source` field** | A `String` field on `Visualizer` intended for attribution/origin URL. Defined in schema but not returned by any API endpoint and not used in the frontend. |

---

## 16. File-by-File Reference

### Infrastructure / entry points

| File | Role |

|---|---|

| [backend/src/server.ts](backend/src/server.ts) | Process entry: load env, `connectDB`, `app.listen` |

| [backend/src/app.ts](backend/src/app.ts) | Express app: global middleware, route mounts, SPA fallback |

| [backend/src/db/connect.ts](backend/src/db/connect.ts) | `mongoose.connect` wrapper called by server.ts |

| [frontend/src/main.tsx](frontend/src/main.tsx) | React root: renders `<AuthProvider><ToastProvider><App/>` |

| [frontend/src/App.tsx](frontend/src/App.tsx) | React Router route table (all routes declared here) |

| [render.yaml](render.yaml) | Render deployment config (build, start, env vars) |

### Auth

| File | Role |

|---|---|

| [backend/src/middleware/authentication.ts](backend/src/middleware/authentication.ts) | `authenticateUser` middleware — reads signed cookie, verifies JWT, attaches `req.user` |

| [backend/src/utils/jwt.ts](backend/src/utils/jwt.ts) | `createJWT()` and `attachCookiesToResponse()` |

| [backend/src/controllers/auth.ts](backend/src/controllers/auth.ts) | `register`, `login`, `logout` handlers |

| [frontend/src/context/AuthProvider.tsx](frontend/src/context/AuthProvider.tsx) | Session state, `login()`, `register()`, `updateProfile()`, `logout()` |

| [frontend/src/routes/ProtectedRoute.tsx](frontend/src/routes/ProtectedRoute.tsx) | Redirects unauthenticated users to `/login` |

| [frontend/src/routes/GuestRoute.tsx](frontend/src/routes/GuestRoute.tsx) | Redirects authenticated users to `/explore` |

### Data models

| File | Role |

|---|---|

| [backend/src/models/User.ts](backend/src/models/User.ts) | User schema; bcrypt pre-save hook; `comparePassword()`, `createJWT()`, `toJSON()` |

| [backend/src/models/Visualizer.ts](backend/src/models/Visualizer.ts) | Visualizer schema with `timestamps` |

| [backend/src/models/UserVisual.ts](backend/src/models/UserVisual.ts) | Join table; unique index on (userId, visualizerId) |

| [backend/src/models/Image.ts](backend/src/models/Image.ts) | Image metadata; unique index on (ownerType, ownerId) |

### Business logic

| File | Role |

|---|---|

| [backend/src/controllers/user.ts](backend/src/controllers/user.ts) | Profile CRUD; favorites add/remove/list |

| [backend/src/controllers/visualizer.ts](backend/src/controllers/visualizer.ts) | Catalog list (paginated/filtered), demo, tags, single item |

| [backend/src/controllers/images.ts](backend/src/controllers/images.ts) | Upload/serve/delete user + visualizer images via GridFS |

| [backend/src/services/imageStorage.ts](backend/src/services/imageStorage.ts) | Validates + delegates to gridfs.ts; used by image controller |

| [backend/src/utils/gridfs.ts](backend/src/utils/gridfs.ts) | Low-level GridFS: upload buffer, delete, open download stream |

| [backend/src/utils/imageValidation.ts](backend/src/utils/imageValidation.ts) | `ALLOWED_IMAGE_TYPES`, `MAX_IMAGE_SIZE_BYTES` (5 MB), validation fns |

| [backend/src/scripts/seedVisualizers.ts](backend/src/scripts/seedVisualizers.ts) | One-shot seeder: wipe + insert all visualizers from JSON + PNGs |

### Frontend — core

| File | Role |

|---|---|

| [frontend/src/utils/visualPreview.ts](frontend/src/utils/visualPreview.ts) | `startVisualPreview()` — entire Three.js/WebGL2 shader rendering pipeline |

| [frontend/src/hooks/useAudioAnalyzer.ts](frontend/src/hooks/useAudioAnalyzer.ts) | Microphone capture, AudioContext, AnalyserNode, device selection, mute |

| [frontend/src/hooks/usePreviewGlsl.ts](frontend/src/hooks/usePreviewGlsl.ts) | Module-level GLSL cache + dedup pending requests |

| [frontend/src/components/VisualizerPlayerShell.tsx](frontend/src/components/VisualizerPlayerShell.tsx) | Full-screen player: audio + rendering + controls + fullscreen + keyboard |

| [frontend/src/api/client.ts](frontend/src/api/client.ts) | `apiFetch<T>()` — base fetch wrapper; `credentials: 'include'`; throws `ApiError` |

### Shared

| File | Role |

|---|---|

| [shared/src/index.ts](shared/src/index.ts) | `User`, `Visualizer`, `VisualizerListItem`, `UserVisual`, `ApiResponse<T>`, `ApiError`, `ApiEndpoints` enum, endpoint builder fns |

---

## 17. Future Work

> ⚠ **Known gaps and dead ends** — items below are confirmed incomplete or deferred. Each has enough context to act on.

1. **Admin web UI** — No interface to add, edit, or delete visualizers. Currently requires direct DB access via the seed script. Priority if content catalog grows.

2. **User shader upload** — Users cannot submit their own GLSL. Schema (`glsl` field) is ready; missing: upload endpoint, validation/sandboxing, review workflow.

3. **Social / sharing features** — No shareable links (authenticated routes block unauthenticated access), no public profiles, no comments. Sharing a visualizer currently requires the recipient to have an account.

4. **AI integration** — Roadmap unclear. Possible directions: AI-generated shader suggestions, natural language → GLSL generation, smart tag inference.

5. **⚠ Dead code — `pg` + `db.postgres.js`** — `pg` package is installed and `backend/src/config/db.postgres.js` exists but neither is imported anywhere in the codebase. Remove or wire up. Candidate use: user analytics, audit logs, relational data that doesn't fit Mongo.

6. **⚠ `.env.example` is empty** — New contributors have zero hint of required variables. Populate with placeholder values matching §11 before onboarding the next engineer.

7. **Password reset / email verification** — No forgot-password flow. No email service integrated. Users who lose their password cannot recover their account.

8. **Avatar image in NavBar** — `User.image` field exists and upload endpoint is wired up, but the NavBar avatar always renders a gradient initial — it never fetches or displays the uploaded photo.

9. **⚠ `source` field on Visualizer** — Defined in schema, base64-encoded in seed JSON, but not returned by any API endpoint and not rendered anywhere in the UI. Either expose it or remove it to avoid future confusion.
