# Tradexa GPT — Backend Decisions & Codebase Guide

> **Purpose:** Understand *what you built*, *why each piece exists*, and *how to rebuild it from scratch*. Read this until you can explain every layer without looking at the code.

**Companion docs:** `decision.md` (frontend choices) · Swagger UI at `http://localhost:8080/swagger-ui/index.html`

---

## Table of contents

1. [What this backend does (30-second pitch)](#1-what-this-backend-does)
2. [Architecture at a glance](#2-architecture-at-a-glance)
3. [How a request travels (the most important diagram)](#3-how-a-request-travels)
4. [Folder map — what lives where](#4-folder-map)
5. [Layer-by-layer deep dive](#5-layer-by-layer-deep-dive)
6. [Design patterns & strategies you used](#6-design-patterns--strategies)
7. [API reference](#7-api-reference)
8. [Database model](#8-database-model)
9. [Security flow (JWT)](#9-security-flow-jwt)
10. [Decision log — every choice & tradeoff](#10-decision-log)
11. [Boilerplate vs meaningful code](#11-boilerplate-vs-meaningful-code)
12. [Rebuild from scratch — step order](#12-rebuild-from-scratch)
13. [Known gaps (honest audit)](#13-known-gaps)
14. [Self-test — can you explain these?](#14-self-test)
15. [Changelog](#15-changelog)

---

## 1. What this backend does

**Tradexa GPT** is a **trade journal + analytics REST API**.

A trader (or you via Postman/frontend) can:

| Capability | What happens |
|------------|--------------|
| **Register / Login** | Create account, get JWT token |
| **CRUD trades** | Create, read, update, delete individual trades |
| **Upload CSV** | Bulk-import trades from a spreadsheet |
| **Analytics** | Get win rate, total PnL, per-symbol breakdown |
| **Health check** | Confirm server is running |

**Tech:** Java 21 · Spring Boot 4.1 · MySQL · JWT · Maven

**Port:** `8080` · **Base path:** `/api/v1`

---

## 2. Architecture at a glance

You built a **layered (n-tier) architecture** — industry standard for Spring apps:

```
┌─────────────────────────────────────────────────────────┐
│  CLIENT (Postman / React / curl)                        │
└───────────────────────────┬─────────────────────────────┘
                            │ HTTP JSON
┌───────────────────────────▼─────────────────────────────┐
│  CONTROLLER layer    ← receives HTTP, returns JSON      │
│  AuthController, TradeController, FileController, ...   │
└───────────────────────────┬─────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────┐
│  SERVICE layer       ← business logic lives here        │
│  UserService, TradeService, FileService, AnalyticsService│
└───────────────────────────┬─────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
┌───────────────┐  ┌───────────────┐  ┌─────────────────┐
│  REPOSITORY   │  │  PARSER       │  │  SECURITY       │
│  (JPA/MySQL)  │  │  CsvTradeParser│  │  JwtService     │
└───────────────┘  └───────────────┘  └─────────────────┘
        │
        ▼
┌───────────────┐
│  MySQL DB     │
│  users, trades│
└───────────────┘
```

**Golden rule you followed:** Controllers are thin. Services hold logic. Repositories talk to DB. Never skip layers.

---

## 3. How a request travels

### Example: `POST /api/v1/trades` (create a trade)

```
1. HTTP request hits TradeController.addTrade()
2. Spring validates @Valid TradeRequest (symbol required, quantity > 0, etc.)
3. Controller calls tradeService.addTrade(request)
4. TradeService uses TradeMapper.toEntity() → Trade object
5. TradeService calls tradeRepository.save(trade) → MySQL INSERT
6. TradeMapper.toResponse() → TradeResponse DTO
7. Controller wraps in ApiResponse { success, message, data, timestamp }
8. Spring serializes to JSON, returns 201 CREATED
```

If trade id=99 doesn't exist on `GET /api/v1/trades/99`:

```
TradeService.getTradeById(99)
  → tradeRepository.findById(99) returns empty
  → throws TradeNotFoundException
  → GlobalExceptionHandler catches it
  → returns 404 + ApiResponse { success: false, message: "Trade with id 99 not found" }
```

### Example: Protected request with JWT

```
1. Client sends: Authorization: Bearer eyJhbG...
2. JwtAuthenticationFilter runs BEFORE controller
3. Extracts email from token via JwtService
4. Loads User from DB, validates token not expired
5. Sets SecurityContext (Spring knows "who" is calling)
6. SecurityConfig already blocked unauthenticated requests
7. Request reaches controller
```

---

## 4. Folder map

```
tradexa-gpt-backend/src/main/java/com/tradexa/gpt/
│
├── TradexaGptBackendApplication.java   ← Entry point (@SpringBootApplication)
│
├── controller/          ← HTTP in/out (REST endpoints)
│   ├── AuthController
│   ├── TradeController
│   ├── FileController
│   ├── AnalyticsController
│   └── HealthController
│
├── service/             ← Business logic
│   ├── UserService
│   ├── TradeService
│   ├── FileService
│   └── HealthService
│
├── repository/          ← Database access (Spring Data JPA)
│   ├── UserRepository
│   └── TradeRepository
│
├── entity/              ← DB table mappings (JPA @Entity)
│   ├── User, Trade, TradeSide, UserRole
│
├── dto/                 ← Request/Response shapes (API contract)
│   ├── TradeRequest, TradeResponse
│   ├── LoginRequest, LoginResponse
│   └── AnalyticsSummaryResponse, ...
│
├── mapper/              ← Convert DTO ↔ Entity
│   └── TradeMapper
│
├── parser/              ← CSV file parsing
│   └── CsvTradeParser
│
├── util/                ← Shared helpers
│   └── ParserUtil
│
├── validation/          ← Manual validation (legacy — see §13)
│   └── TradeValidator
│
├── analytics/           ← Analytics business logic (separate package)
│   └── AnalyticsService
│
├── security/            ← JWT auth
│   ├── JwtService
│   └── JwtAuthenticationFilter
│
├── config/              ← Spring configuration beans
│   ├── SecurityConfig
│   └── OpenApiConfig
│
├── exception/           ← Custom exceptions + global handler
│   ├── GlobalExceptionHandler (@ControllerAdvice)
│   ├── TradeNotFoundException
│   └── ...
│
└── common/
    └── ApiResponse.java ← Standard JSON wrapper for ALL endpoints
```

---

## 5. Layer-by-layer deep dive

### 5.1 Controllers — "the front door"

**Job:** Accept HTTP, delegate to service, return HTTP status + JSON.

**Pattern you use everywhere:**

```java
ApiResponse<TradeResponse> response = new ApiResponse<>();
response.setSuccess(true);
response.setMessage("Trade created successfully");
response.setData(savedTrade);
response.setTimestamp(LocalDateTime.now());
return new ResponseEntity<>(response, HttpStatus.CREATED);
```

| Controller | Base path | Responsibility |
|------------|-----------|----------------|
| `AuthController` | `/api/v1/auth` | register, login — **public** |
| `TradeController` | `/api/v1/trades` | CRUD — **JWT required** |
| `FileController` | `/api/v1/files` | CSV upload — **JWT required** |
| `AnalyticsController` | `/api/v1/analytics` | summary, symbols — **JWT required** |
| `HealthController` | `/api/v1/health` | uptime check — **JWT required** (see §13) |

**Annotations you used:**
- `@RestController` — class handles REST, return value = JSON body
- `@RequestMapping("/api/v1/trades")` — base URL prefix
- `@PostMapping`, `@GetMapping`, `@PutMapping`, `@DeleteMapping` — HTTP verbs
- `@PathVariable Integer id` — URL segment `/trades/{id}`
- `@RequestBody TradeRequest` — JSON body → Java object
- `@Valid` — trigger Jakarta Bean Validation on DTO fields
- `@RequestParam("file") MultipartFile` — file upload

---

### 5.2 DTOs — "the API contract"

**Job:** Define exactly what clients send/receive. **Never expose `Entity` directly.**

| DTO | Direction | Purpose |
|-----|-----------|---------|
| `TradeRequest` | In | Create/update trade fields + `@NotBlank`, `@Positive` validation |
| `TradeResponse` | Out | Trade data including `id` (no password, no internal fields) |
| `RegisterRequest` | In | name, email, password |
| `LoginResponse` | Out | user info + **JWT token** |
| `AnalyticsSummaryResponse` | Out | Aggregated stats |

**Why separate Entity vs DTO?**
- Entity = database shape (may have fields clients shouldn't set)
- DTO = API shape (stable even if DB changes)
- Example: `Trade` entity has `broker`, `strategy`, `commission` — but `TradeRequest`/`TradeResponse` don't expose them yet

---

### 5.3 Entities — "database tables as Java classes"

**`Trade`** → table `trades`
- `@Entity` + `@Table(name = "trades")`
- `@Id @GeneratedValue(strategy = IDENTITY)` — MySQL auto-increment
- Fields: symbol, side (enum), quantity, prices, times, pnl
- Extra fields ready for future: broker, strategy, timeframe, tags, commission, slippage

**`User`** → table `users`
- Unique email constraint: `@Column(unique = true)`
- Password stored **hashed** (BCrypt), never plain text
- Role: `@Enumerated(EnumType.STRING)` → stored as `"USER"` or `"ADMIN"` in DB

**`TradeSide`** enum: `BUY`, `SELL`

**`UserRole`** enum: `USER`, `ADMIN`

---

### 5.4 Repositories — "database queries without writing SQL"

```java
public interface TradeRepository extends JpaRepository<Trade, Integer> {}
```

Spring Data JPA **implements this interface at runtime**. You get free:
- `save()`, `findAll()`, `findById()`, `deleteById()`, `existsById()`, `saveAll()`

```java
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);      // custom query from method name
    boolean existsByEmail(String email);
}
```

**Strategy:** Method naming convention → Spring generates SQL automatically.

---

### 5.5 Services — "where the real work happens"

#### `TradeService`
- `addTrade` → map request → save → map response
- `getAllTrades` → stream + `TradeMapper::toResponse` (Java functional style)
- `getTradeById` → `orElseThrow(TradeNotFoundException)` — **Optional pattern**
- `updateTrade` → fetch, mutate fields, save
- `deleteTrade` → exists check then delete
- `saveAllTrades` → bulk insert (used by CSV upload)

#### `UserService`
- `register` → check duplicate email → BCrypt hash password → save → return safe response (no password)
- `login` → find user → verify password → generate JWT

#### `FileService`
- Validate file not empty, must be `.csv`
- Delegate parsing to `CsvTradeParser`
- Save all parsed trades via `TradeService.saveAllTrades`

#### `AnalyticsService`
- Loads all trades from DB
- Computes: totalTrades, winning/losing count, total PnL, win rate, avg profit/loss
- Groups by symbol in a `HashMap` for per-symbol analytics

---

### 5.6 Mapper — "translation layer"

`TradeMapper` is a **static utility class** (no Spring bean):

```
TradeRequest  ──toEntity()──►  Trade  ──toResponse()──►  TradeResponse
```

**Why static?** Pure functions, no dependencies, easy to test.

**Alternative you didn't use yet:** MapStruct (code generation for mappers).

---

### 5.7 Parser pipeline (CSV upload)

```
MultipartFile
    → CsvTradeParser.parse()
        → Apache Commons CSV reads rows
        → ParserUtil converts String → int/BigDecimal/LocalDateTime/TradeSide
    → List<Trade>
    → TradeService.saveAllTrades()
```

**Expected CSV columns:** `Symbol`, `Side`, `Quantity`, `EntryPrice`, `ExitPrice`, `EntryTime`, `ExitTime`, `Pnl`

**Date format:** ISO-8601 e.g. `2026-01-15T10:30:00`

---

### 5.8 Exception handling

**Custom exceptions** (extend `RuntimeException`):
- `TradeNotFoundException` → 404
- `UserAlreadyExistsException` → 409 CONFLICT
- `InvalidFileException` → 400
- `CsvParsingException` → 400 (defined but parser currently throws generic RuntimeException — see §13)

**`GlobalExceptionHandler`** with `@ControllerAdvice`:
- One place handles ALL exceptions app-wide
- Always returns consistent `ApiResponse` shape (even on errors)
- `MethodArgumentNotValidException` → field-level validation errors map

---

### 5.9 Security

**`SecurityConfig`:**
- CSRF disabled (stateless REST API — normal for JWT apps)
- Session stateless (no server-side sessions)
- Public: `/api/v1/auth/**`, Swagger docs
- Everything else: must be authenticated

**`JwtService`:**
- Signs token with HMAC-SHA secret from `application.properties`
- Subject = user email
- 24h expiry (`jwt.expiration=86400000` ms)

**`JwtAuthenticationFilter`:**
- Extends `OncePerRequestFilter` — runs once per HTTP request
- Reads `Authorization: Bearer <token>`
- Validates and sets Spring Security context

**`BCryptPasswordEncoder`:**
- One-way hash — can't reverse password from DB
- `encode()` on register, `matches()` on login

---

### 5.10 `ApiResponse<T>` — your standard envelope

Every endpoint returns:

```json
{
  "success": true,
  "message": "Human readable message",
  "data": { ... actual payload ... },
  "timestamp": "2026-08-12T16:00:00"
}
```

**Why?** Frontend always knows where to look. Errors use same shape with `success: false`.

### Advanced analytics (`StatisticsCalculator`)

| Metric | Formula / meaning |
|--------|-------------------|
| **Mean** | Average PnL per trade |
| **Median** | Middle PnL when sorted — less skewed by outliers |
| **Variance** | Sample variance of PnL (n−1 denominator) |
| **Standard deviation** | √variance — spread of returns |
| **Skewness** | Distribution asymmetry; positive = more big wins |
| **Expectancy** | `(winRate × avgWin) + (lossRate × avgLoss)` — expected $ per trade |
| **Market hours** | Groups by `entryTime.hour` with session labels (PRE_MARKET, OPEN, MIDDAY, etc.) |

**Endpoints:**
- `GET /api/v1/analytics/summary` — all stats above in one response
- `GET /api/v1/analytics/market-hours` — hourly breakdown for charts

---

| Pattern / Strategy | Where | Why |
|--------------------|-------|-----|
| **Layered Architecture** | Whole app | Separation of concerns, testable layers |
| **Dependency Injection (DI)** | Constructor injection in all services/controllers | Spring provides dependencies; easy to mock in tests |
| **Repository Pattern** | `*Repository` interfaces | Abstract DB access |
| **DTO Pattern** | `dto/` package | Decouple API from DB schema |
| **Mapper Pattern** | `TradeMapper` | Centralize object conversion |
| **Strategy (parsing)** | `CsvTradeParser` + `ParserUtil` | Swap CSV for XLSX later without touching FileService |
| **Filter Chain** | `JwtAuthenticationFilter` | Cross-cutting auth before every request |
| **Global Exception Handler** | `@ControllerAdvice` | DRY error responses |
| **Optional.orElseThrow** | TradeService | Clean null handling vs nested ifs |
| **Stream API** | `getAllTrades()` | Functional mapping entity → response |
| **Enum for fixed values** | TradeSide, UserRole | Type safety vs magic strings |
| **BigDecimal for money** | prices, pnl | Avoid float rounding bugs |
| **Constructor injection** | All `@Service`, `@RestController` | Immutable dependencies, required fields |

---

## 7. API reference

| Method | Endpoint | Auth | Body / Params |
|--------|----------|------|---------------|
| POST | `/api/v1/auth/register` | No | `{ name, email, password }` |
| POST | `/api/v1/auth/login` | No | `{ email, password }` |
| GET | `/api/v1/trades` | JWT | — |
| POST | `/api/v1/trades` | JWT | TradeRequest JSON |
| GET | `/api/v1/trades/{id}` | JWT | — |
| PUT | `/api/v1/trades/{id}` | JWT | TradeRequest JSON |
| DELETE | `/api/v1/trades/{id}` | JWT | — |
| POST | `/api/v1/files/upload` | JWT | multipart `file` (.csv) |
| GET | `/api/v1/analytics/summary` | JWT | — (includes mean, median, variance, skewness, expectancy) |
| GET | `/api/v1/analytics/symbols` | JWT | — |
| GET | `/api/v1/analytics/market-hours` | JWT | — (PnL/win rate grouped by entry hour) |
| GET | `/api/v1/health` | No | — |

**Login response `data` includes:** `token` — send as `Authorization: Bearer <token>`

---

## 8. Database model

```
users                          trades
┌────────────────────┐        ┌────────────────────┐
│ id (PK, BIGINT)    │◄───────│ user_id (FK)       │
│ name               │        │ id (PK, INT)       │
│ email (UNIQUE)     │        │ symbol             │
│ password (hashed)  │        │ side (BUY/SELL)    │
│ role (USER/ADMIN)  │        │ quantity           │
└────────────────────┘        │ entry_price        │
                              │ exit_price         │
                              │ entry_time         │
                              │ exit_time          │
                              │ pnl                │
                              │ broker (nullable)  │
                              │ strategy, etc.     │
                              └────────────────────┘
```

**Note:** Trades are **scoped per user** via `user_id`. Each user only sees their own trades, uploads, and analytics.

**Schema management:** `spring.jpa.hibernate.ddl-auto=update` — Hibernate auto-creates/alters tables on startup. Fine for dev; use Flyway/Liquibase for production.

---

## 9. Security flow (JWT)

```
REGISTER                          LOGIN
────────                          ─────
POST /auth/register               POST /auth/login
  → hash password (BCrypt)          → find user by email
  → save User                         → matches(password, hash)?
  → return id, name, email            → jwtService.generateToken(email)
    (NO token on register)            → return token + user info

SUBSEQUENT REQUESTS
───────────────────
Header: Authorization: Bearer eyJhbGci...
  → JwtAuthenticationFilter
  → extract email from token
  → validate signature + expiry
  → set SecurityContext
  → controller runs
```

---

## 10. Decision log

### Spring Boot + Maven

| | |
|---|---|
| **Why** | Industry standard Java backend. Auto-configures Tomcat, Jackson (JSON), connection pooling. |
| **Tradeoff** | Heavy framework — learning curve. Payoff: don't write boilerplate server code. |
| **Boilerplate?** | `pom.xml`, `@SpringBootApplication` — generated once, then stable. |

### Java 21

| | |
|---|---|
| **Why** | LTS, modern language features (records, pattern matching available if you want them). |
| **Tradeoff** | Ensure JDK 21 installed locally. |

### MySQL + Spring Data JPA

| | |
|---|---|
| **Why** | Persistent storage. JPA = work with Java objects, Hibernate generates SQL. |
| **Alternatives** | PostgreSQL (similar), MongoDB (document — different model), in-memory List (what README originally mentioned — you've moved past this) |
| **Tradeoff** | JPA magic can hide SQL — sometimes you need to understand what's executed. |
| **Boilerplate?** | `application.properties` datasource config — required setup. |

### DTOs separate from Entities

| | |
|---|---|
| **Why** | API stability, hide passwords/internal fields, validation on input DTOs only. |
| **Tradeoff** | More classes + mapper code. Worth it on any real API. |
| **Meaningful** | This is a core skill — every backend job uses this. |

### ApiResponse wrapper

| | |
|---|---|
| **Why** | Consistent JSON shape for frontend. One place to check `success`. |
| **Tradeoff** | Extra nesting (`response.data.data` on frontend). Some APIs use raw bodies + HTTP status only. |
| **Meaningful** | You chose consistency over minimalism — valid product decision. |

### JWT stateless auth

| | |
|---|---|
| **Why** | Scales horizontally (no server session store). Works with SPA/mobile. |
| **Alternatives** | Session cookies (simpler for server-rendered apps) |
| **Tradeoff** | Can't revoke token before expiry without a blocklist. No refresh token yet. |
| **Meaningful** | Understand filter chain + Bearer header — essential. |

### BCrypt for passwords

| | |
|---|---|
| **Why** | Industry standard slow hash — resistant to brute force. |
| **Never** | Store plain text or use MD5/SHA1 for passwords. |

### Constructor dependency injection

| | |
|---|---|
| **Why** | Dependencies explicit, fields `final`, easy to unit test with mocks. |
| **Avoid** | `@Autowired` on fields (harder to test, hidden dependencies). |

### Apache Commons CSV

| | |
|---|---|
| **Why** | Battle-tested CSV parsing vs hand-rolling split-by-comma. |
| **Tradeoff** | External dependency. Handles edge cases (quotes, commas in fields). |

### Jakarta Bean Validation (`@Valid`, `@NotBlank`, etc.)

| | |
|---|---|
| **Why** | Declarative validation on DTOs — Spring returns 400 automatically. |
| **vs TradeValidator** | You have BOTH — `@Valid` on controller is the active path. `TradeValidator` is redundant (see §13). |

### Mockito unit tests (UserServiceTest)

| | |
|---|---|
| **Why** | Test business logic without starting Spring or MySQL. |
| **Pattern** | Arrange → Act → Assert + `verify()` mock interactions |
| **Tradeoff** | Doesn't test HTTP layer — need `@WebMvcTest` or integration tests for that. |

### springdoc OpenAPI (Swagger)

| | |
|---|---|
| **Why** | Auto-generated API docs + try-it-out UI. |
| **Boilerplate?** | `OpenApiConfig` is minimal — mostly for title/contact metadata. |

### Analytics in separate package

| | |
|---|---|
| **Why** | Domain separation — analytics can grow (reports, charts data) without bloating `service/`. |
| **Tradeoff** | Small app could keep it in `TradeService` — separate package scales better. |

---

## 11. Boilerplate vs meaningful code

| Boilerplate (framework generates / copy once) | Meaningful (you must understand) |
|-----------------------------------------------|----------------------------------|
| `@SpringBootApplication` | Request flow: Controller → Service → Repository |
| `pom.xml` dependencies | Why DTO ≠ Entity |
| Empty `JpaRepository` interface | JWT filter + SecurityConfig rules |
| Lombok in pom (listed but entities use manual getters/setters) | `GlobalExceptionHandler` pattern |
| `OpenApiConfig` metadata | `Optional.orElseThrow` for not-found |
| `@Repository` annotation | BCrypt encode vs matches |
| Test `@BeforeEach openMocks` | CSV parse → saveAll pipeline |
| | `ApiResponse` wrapping in every controller |

---

## 12. Rebuild from scratch

If you had to build this again **without AI**, follow this order:

```
Phase 1 — Skeleton
  □ Spring Initializr: Web, JPA, MySQL, Validation, Security, Lombok
  □ application.properties (DB, port, jwt.secret)
  □ Health endpoint (prove server runs)

Phase 2 — Trades CRUD (no auth yet)
  □ Trade entity + TradeRepository
  □ TradeRequest / TradeResponse DTOs
  □ TradeMapper
  □ TradeService (all CRUD methods)
  □ TradeController
  □ ApiResponse wrapper
  □ TradeNotFoundException + GlobalExceptionHandler
  □ Test in Postman

Phase 3 — Validation
  □ Add @NotBlank, @Positive on TradeRequest
  □ @Valid on controller
  □ Handle MethodArgumentNotValidException

Phase 4 — Auth
  □ User entity + UserRepository
  □ BCrypt password encoding
  □ Register + Login endpoints
  □ JwtService (generate + validate)
  □ JwtAuthenticationFilter
  □ SecurityConfig (public auth, protect rest)

Phase 5 — CSV Upload
  □ FileController + MultipartFile
  □ CsvTradeParser + ParserUtil
  □ FileService orchestration
  □ InvalidFileException handling

Phase 6 — Analytics
  □ AnalyticsSummaryResponse DTOs
  □ AnalyticsService (loop + aggregate)
  □ AnalyticsController

Phase 7 — Tests + Docs
  □ UserServiceTest with Mockito
  □ TradeServiceTest (fill in — currently empty)
  □ Swagger via springdoc

Phase 8 — Production hardening (next steps)
  □ CORS for frontend
  □ Link trades to user (user_id FK)
  □ Custom InvalidCredentialsException
  □ Environment variables for secrets (not hardcoded password in properties)
  □ Flyway migrations
```

---

## 13. Known gaps (honest audit)

Things still worth improving later:

| Gap | Current state | What a senior would do |
|-----|---------------|------------------------|
| **Secrets in application.properties** | DB password + JWT secret in repo | Use env vars / `.env` not committed |
| **No pagination** | `findAllByUserId()` loads everything | `Pageable` for large datasets |
| **No refresh token** | 24h re-login | Refresh endpoint + shorter access token |
| **Entity extra fields unused** | broker, strategy on Trade but not in API | Expose in DTO when feature ready |
| **Orphan trades in DB** | Old rows with `user_id = null` won't appear | One-time SQL cleanup or migration |

### Fixed (2026-08-12 — frontend-ready pass)

| Was broken | Fix applied |
|------------|-------------|
| No CORS | `CorsConfig` + `app.cors.allowed-origins` |
| Health required JWT | `/api/v1/health` in `permitAll()` |
| All users saw all trades | `user_id` FK + `CurrentUserService` + scoped queries |
| Login returned 500 on bad creds | `InvalidCredentialsException` → 401 |
| Null PnL bug in analytics | Null-safe via `StatisticsCalculator.safePnl()` |
| CSV parse threw generic RuntimeException | Now throws `CsvParsingException` |
| Unused `TradeValidator` | Removed (validation via `@Valid` on DTOs) |
| Login missing user `id` | `LoginResponse.id` now set |
| Empty `TradeServiceTest` | Added user-scoped CRUD tests |
| Spring context test needed MySQL | H2 in-memory for tests (`src/test/resources`) |
| Basic analytics only | Added mean, median, variance, std dev, skewness, expectancy, market-hour endpoint |

---

## 14. Self-test

After reading this, you should answer **without opening code**:

1. What are the 4 layers and what does each do?
2. Why don't we return `Trade` entity directly from the controller?
3. What happens when `findById(999)` finds nothing?
4. Where is the password hashed? Where is it verified?
5. What header does the client send after login?
6. What runs first — controller or JwtAuthenticationFilter?
7. What's the difference between `TradeRequest` and `TradeResponse`?
8. How does Spring know to implement `UserRepository.findByEmail`?
9. Why `BigDecimal` instead of `double` for prices?
10. Walk through CSV upload from HTTP to database in 5 steps.

If you can answer 8+/10 — **you understand what you built.**

---

## 15. Changelog

| Date | Decision | Notes |
|------|----------|-------|
| Project start | Layered Spring Boot REST | Core architecture |
| — | MySQL + JPA | Moved from in-memory (per README history) |
| — | ApiResponse wrapper | All endpoints consistent |
| — | JWT + Spring Security | Stateless auth |
| — | DTO + Mapper pattern | Trade API contract |
| — | Commons CSV parser | Bulk trade import |
| — | AnalyticsService separate package | Domain separation |
| — | Mockito unit tests | UserService covered |
| 2026-08-12 | This document created | Backend decisions log |
| 2026-08-12 | Frontend-ready hardening | CORS, user-scoped trades, auth exceptions, health public |
| 2026-08-12 | Advanced analytics | mean, median, variance, skewness, expectancy, market-hours |

---

*When you add a feature, update §15 and add a subsection to §10. When you fix a gap from §13, move it to changelog.*
