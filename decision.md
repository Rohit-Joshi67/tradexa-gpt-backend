# Tradexa GPT — Frontend Decisions Log

> **Purpose of this file:** Every time we pick a tool, pattern, or folder structure, we write down *what* we chose, *why*, *what we gave up*, and *what is boilerplate vs. what actually teaches you something*. Read this before coding and update it when we change direction.

**Companion doc:** [`backend-decisions.md`](backend-decisions.md) — full backend architecture, patterns, and rebuild guide.

> **Backend is frontend-ready (2026-08-12):** CORS enabled, user-scoped trades, public health, advanced analytics on `/analytics/summary` and `/analytics/market-hours`.

---

## How to use this doc (beginner → good engineer path)

| Phase | What you focus on | What you can ignore for now |
|-------|-------------------|-----------------------------|
| **1. Make it work** | Login, list trades, one form | Fancy UI, tests, caching |
| **2. Make it correct** | Auth guards, error handling, types | Micro-optimizations |
| **3. Make it maintainable** | Folder structure, reusable API layer | Over-abstraction |
| **4. Make it production-ready** | CORS, env vars, deployment | Premature scaling |

**Rule:** If you can't explain *why* we picked something in one sentence, stop and read that section again before moving on.

---

## 0. Context — what we're building

**Backend (already exists):** Spring Boot REST API on `http://localhost:8080`

- Auth: JWT (`Bearer` token in `Authorization` header)
- Trades CRUD, CSV upload, analytics
- Every response wrapped in `ApiResponse<T>`:

```json
{
  "success": true,
  "message": "Login successful",
  "data": { "token": "...", "email": "..." },
  "timestamp": "2026-08-12T16:00:00"
}
```

**Frontend (we will build):** React SPA that talks to this API.

**Success criteria for v1:**
1. Register + Login
2. View/create/edit/delete trades (authenticated)
3. View analytics summary
4. Upload CSV

---

## 1. Project scaffolding

### Decision: **Vite + React + TypeScript**

```bash
npm create vite@latest tradexa-gpt-frontend -- --template react-ts
```

| | |
|---|---|
| **Why** | Vite is fast (instant dev server), simple config, industry standard in 2026. TypeScript catches API shape mismatches *before* runtime — huge win when your backend has many DTOs. |
| **Alternatives considered** | Create React App (deprecated/slow), Next.js (SSR — overkill for a dashboard SPA backed by separate Spring API) |
| **Tradeoff** | TS has a learning curve. You'll write types for `Trade`, `LoginResponse`, etc. That's intentional — it mirrors your Java DTOs. |
| **Boilerplate?** | `vite.config.ts`, `index.html`, `main.tsx` — mostly generated. **Learn:** how `main.tsx` mounts `<App />` into `#root`. |

### Decision: **Separate repo/folder** (`tradexa-gpt-frontend/` sibling to backend)

| | |
|---|---|
| **Why** | Backend and frontend deploy independently. Spring serves JSON; React serves UI. Clean boundary. |
| **Tradeoff** | Two terminals, CORS or proxy needed. Monorepo (single repo with `/backend` + `/frontend`) is fine too — we chose sibling folders for simplicity. |
| **Boilerplate?** | None extra. Just folder organization. |

---

## 2. Core libraries

### Decision: **React Router** for navigation

| | |
|---|---|
| **Why** | Multiple pages: Login, Register, Dashboard, Trades, Upload. URLs (`/trades`, `/login`) are bookmarkable and match how users think. |
| **Alternatives** | Single-page with `useState` tab switching — works for 2 screens, falls apart at 5+. |
| **Tradeoff** | Must wrap app in `<BrowserRouter>`, define `<Routes>`. Slightly more setup. |
| **Boilerplate?** | Route definitions in `App.tsx` — **meaningful**, not throwaway. This is your app's map. |

### Decision: **Axios** for HTTP (not raw `fetch`)

| | |
|---|---|
| **Why** | Interceptors: attach JWT to every request in one place. Cleaner error objects. Less repetitive than wrapping `fetch` yourself. |
| **Alternatives** | Native `fetch` — fine, but you'll rewrite interceptor logic manually. TanStack Query alone doesn't replace HTTP client. |
| **Tradeoff** | +13kb bundle. For a learning project, the clarity wins. |
| **Boilerplate?** | `api/client.ts` with base URL + auth header — **high-value boilerplate**. Copy this pattern in every job. |

### Decision: **TanStack Query (React Query)** — optional for v1, recommended for v2

| | |
|---|---|
| **Why** | Handles loading/error states, caching, refetch after mutations. Stops you from sprinkling `useState` + `useEffect` everywhere. |
| **When to add** | After basic CRUD works with plain `useEffect`. Adding too early obscures what's happening. |
| **Tradeoff** | Mental model: `useQuery` / `useMutation` / cache keys. Worth it once you have 3+ API calls. |
| **Boilerplate?** | `QueryClientProvider` wrapper — boilerplate. **Learning:** stale time, invalidation after create trade. |

### Decision: **No UI framework in v1** (plain CSS or CSS modules)

| | |
|---|---|
| **Why** | Learn React data flow first. Tailwind/MUI/Chakra are great but add 20 concepts on day one. |
| **When to add** | Once forms + tables work. Tailwind or shadcn/ui are good next steps. |
| **Tradeoff** | UI looks plain initially. That's OK. |
| **Boilerplate?** | N/A |

---

## 3. Folder structure

```
src/
  api/           ← HTTP calls only. No JSX here.
  types/         ← TypeScript mirrors of Java DTOs
  context/       ← Auth state (token, user)
  pages/         ← One file per route/screen
  components/    ← Reusable UI (TradeForm, ProtectedRoute)
  App.tsx
  main.tsx
```

| | |
|---|---|
| **Why this split** | **Separation of concerns:** `api/trades.ts` doesn't know about React. Pages compose components + call API. Easy to test and reason about. |
| **Anti-pattern to avoid** | Putting `axios.post(...)` inside a button's `onClick` in every file — works once, unmaintainable at 10 endpoints. |
| **Boilerplate?** | Folder creation — zero runtime cost. **Meaningful habit** for any frontend job. |

---

## 4. Backend ↔ Frontend connection

### Decision: **CORS on backend** (primary approach)

Spring config allowing `http://localhost:5173` (Vite default port).

| | |
|---|---|
| **Why** | Browser security: React on `:5173` calling API on `:8080` is cross-origin. Without CORS headers, browser blocks the response even if Postman works. |
| **Alternative** | Vite dev proxy — frontend calls `/api/...`, Vite forwards to `:8080`. Same-origin in dev, no CORS needed locally. Still need CORS in production unless same domain. |
| **Tradeoff** | CORS misconfiguration is the #1 "works in Postman, fails in browser" bug. You'll hit this once and remember forever. |
| **Boilerplate?** | `CorsConfig.java` — ~15 lines. **Must understand**, not copy-paste blindly. |

### Decision: **Base URL via environment variable**

```env
# .env
VITE_API_URL=http://localhost:8080
```

| | |
|---|---|
| **Why** | Dev vs staging vs prod URLs change. Never hardcode `localhost:8080` in 12 files. |
| **Vite rule** | Only vars prefixed `VITE_` are exposed to browser code. |
| **Boilerplate?** | One line in `client.ts`. Standard practice. |

---

## 5. Authentication design

### Decision: **JWT stored in `localStorage`**

| | |
|---|---|
| **Why** | Backend already returns `token` in `LoginResponse`. Simplest client storage for SPA learning. |
| **How it flows** | Login → save `token` → axios interceptor adds `Authorization: Bearer <token>` → Spring `JwtAuthenticationFilter` validates |
| **Alternatives** | `sessionStorage` (cleared on tab close), **httpOnly cookie** (more secure, needs backend cookie setup — better for production) |
| **Tradeoff** | `localStorage` is vulnerable to XSS. For learning + localhost, acceptable. **Production upgrade path:** httpOnly cookies + refresh tokens. |
| **Boilerplate?** | `AuthContext` + `localStorage.setItem/getItem` — half boilerplate, half core pattern. |

### Decision: **`ProtectedRoute` component**

Redirect to `/login` if no token.

| | |
|---|---|
| **Why** | Centralizes "am I logged in?" logic. Without it, every page duplicates the check. |
| **Tradeoff** | Client-side only — user can bypass in DevTools. **Real security is on the backend** (your Spring Security already enforces this). Frontend guard is UX, not security. |
| **Boilerplate?** | ~10 lines. **Important concept:** client auth ≠ server auth. |

### Decision: **No refresh token in v1**

| | |
|---|---|
| **Why** | Backend issues one JWT with 24h expiry (`jwt.expiration=86400000`). Refresh flow needs new backend endpoints. |
| **Tradeoff** | User re-logs in after expiry. Fine for v1. |

---

## 6. Data modeling (TypeScript ↔ Java)

### Decision: **Manual types in `types/api.ts`** (not auto-generated yet)

| | |
|---|---|
| **Why** | Forces you to read Java DTOs (`TradeRequest`, `TradeResponse`, `AnalyticsSummaryResponse`) and understand field names. JSON uses camelCase — matches Java getters via Jackson. |
| **Future upgrade** | OpenAPI codegen from `/v3/api-docs` — generates types automatically. Do this when API stabilizes. |
| **Tradeoff** | Types can drift from backend if you forget to update. Mitigation: check Swagger when adding fields. |
| **Boilerplate?** | Typing every field feels repetitive. **This is you learning the domain model** — not waste. |

### Important field notes (from your backend)

| Field | Type | Gotcha |
|-------|------|--------|
| `side` | `"BUY" \| "SELL"` | Java enum → JSON string |
| `entryTime`, `exitTime` | ISO string `"2026-08-12T10:30:00"` | Use `<input type="datetime-local">` + convert |
| `entryPrice`, `pnl` | number | Java `BigDecimal` → JSON number |
| API wrapper | always unwrap `.data.data` | First `.data` = axios, second = your `ApiResponse` |

---

## 7. Page-by-page decisions

### Login / Register

| | |
|---|---|
| **Pattern** | Controlled inputs (`useState` for email/password), submit calls `api/auth.ts`, on success navigate to `/` |
| **Why not form libraries yet** | React Hook Form is great — add after you understand controlled components |
| **Error handling** | Backend returns 400/401 with message in `ApiResponse.message` or validation errors from `@ControllerAdvice` — show in UI |

### Trades page

| | |
|---|---|
| **List** | `GET /api/v1/trades` → table with symbol, side, pnl, actions |
| **Create** | `POST /api/v1/trades` with `TradeRequest` body |
| **Edit** | `PUT /api/v1/trades/{id}` |
| **Delete** | `DELETE /api/v1/trades/{id}` with confirm dialog |
| **Why table first** | CRUD is the backbone of most internal tools. Master this pattern = 80% of frontend jobs |

### Dashboard (Analytics)

| | |
|---|---|
| **Data** | `GET /api/v1/analytics/summary` + `/symbols` |
| **UI v1** | Stat cards (total PnL, win rate) + simple HTML table for symbols |
| **UI v2** | Recharts bar chart — add when numbers display correctly |

### Upload page

| | |
|---|---|
| **Pattern** | `<input type="file" accept=".csv">` → `FormData` → `POST /api/v1/files/upload` |
| **Gotcha** | Do NOT set `Content-Type: application/json`. Browser sets multipart boundary automatically. |
| **Why separate page** | File upload error handling (size, format) is different from JSON forms |

---

## 8. What is boilerplate vs what teaches you

| Boilerplate (safe to generate/copy) | Meaningful (must understand) |
|-------------------------------------|------------------------------|
| Vite config defaults | Why CORS exists |
| `QueryClientProvider` setup | JWT request flow |
| ESLint config | `ApiResponse` unwrapping |
| `index.css` reset | Protected vs public routes |
| Import paths | Controlled form → API → re-render |
| Package.json scripts | Client-side auth ≠ server security |
| React StrictMode wrapper | When to refetch after mutation |

**Engineer mindset:** Boilerplate is fine to copy once you know *what job it does*. Good engineers don't memorize Vite config — they know *when* they need a bundler and *what* env vars are for.

---

## 9. Errors you'll hit (and what they teach)

| Symptom | Cause | Lesson |
|---------|-------|--------|
| CORS error in console | Backend not allowing `:5173` | Browser security model |
| 401 on every request | Missing/wrong `Bearer` token | Interceptor debugging |
| 401 only after 24h | JWT expired | Token lifecycle |
| `data.data` is undefined | Forgot API wrapper unwrapping | Read backend response shape |
| 400 on create trade | Validation failed (`@Valid` on `TradeRequest`) | Match backend constraints in form |
| Network Error | Backend not running | Check `:8080` health |
| Empty array after upload | CSV parsed but UI didn't refetch | Mutations need cache invalidation |

---

## 10. Build order (our agreed sequence)

```
Step 1  → CORS or Vite proxy          (connectivity)
Step 2  → api/client.ts + types       (foundation)
Step 3  → Login + Register pages      (auth flow)
Step 4  → ProtectedRoute + AuthContext (guard)
Step 5  → Trades list (GET)           (prove auth works)
Step 6  → Create trade form (POST)    (first mutation)
Step 7  → Edit + Delete               (full CRUD)
Step 8  → Analytics dashboard         (read-only aggregation)
Step 9  → CSV upload                  (multipart)
Step 10 → Polish (loading, errors)    (UX)
Step 11 → React Query (optional)      (cache layer)
Step 12 → UI library (optional)       (visual polish)
```

**Why this order:** Each step depends on the previous. Skipping to Dashboard before Login means debugging auth + analytics simultaneously — painful.

---

## 11. Production tradeoffs (future — don't build yet)

| Topic | v1 (learning) | Production |
|-------|---------------|------------|
| Token storage | localStorage | httpOnly cookie |
| API types | Manual TS | OpenAPI codegen |
| Styling | Plain CSS | Tailwind + component lib |
| Hosting | localhost | Vercel/Netlify (FE) + AWS/Railway (BE) |
| Env secrets | `.env` gitignored | CI/CD secrets manager |
| Testing | Manual via UI | Vitest + Playwright |

---

## 12. Decision changelog

| Date | Decision | Reason |
|------|----------|--------|
| 2026-08-12 | Vite + React + TS | Speed, type safety, industry standard |
| 2026-08-12 | Axios over fetch | JWT interceptors |
| 2026-08-12 | localStorage for JWT | Matches current backend; simplest v1 |
| 2026-08-12 | No UI lib in v1 | Focus on React + API patterns |
| 2026-08-12 | CORS on backend | Required for browser → Spring on different ports |
| 2026-08-12 | Separate frontend folder | Independent deploy, clear boundary |

---

## 13. How to update this file

When we make a new choice, add a row to **§12** and a section if it's big enough. Template:

```markdown
### Decision: **[choice]**

| | |
|---|---|
| **Why** | ... |
| **Alternatives** | ... |
| **Tradeoff** | ... |
| **Boilerplate?** | ... |
```

**Ask yourself before every dependency:** "Does this teach me something, or am I avoiding learning React basics?" If avoiding — skip the dependency.

---

*Next step when you're ready: we scaffold `tradexa-gpt-frontend` and implement Step 1–4 together, explaining each file as we create it.*
