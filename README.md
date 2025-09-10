# igame-backend

Minimal backend for the iGaming project. This service exposes REST endpoints using Express and stores data in Supabase.

## Approach

-   Server: built with Express and a small, focused middleware stack.
-   Structure: route -> controller -> service. Routes parse and forward requests to controllers; controllers handle request/response shape and call services; services encapsulate business logic and talk to Supabase.
-   Validation: request validation is handled in middleware using Joi schemas so controllers receive validated data.
-   Authorization: JWT-based auth enforced via an `auth` middleware that verifies the token and injects the user into the request.
-   Database: Supabase (Postgres) is used as the primary persistence layer via the Supabase client in `src/config/supabase`.
-   Logging: configurable logger (see `src/config/logger`) driven by environment flags.

This keeps controllers thin, services pure, and middleware responsible for cross-cutting concerns (validation, authorization, error handling).

## Environment variables

Below are the environment variables used by the project and a short description for each. Put these into a `.env` file at the project root or set them in your deployment environment.

-   `PORT` — port the Express server listens on (default: `5002`). Used in `src/server.ts`.
-   `API_ROUTE` — API base route (default: `/api/v1`).
-   `FRONTEND_URL` — the allowed CORS origin for the frontend client.
-   `SUPABASE_URL` — Supabase project URL (required).
-   `SUPABASE_ANON_KEY` — Supabase anon key used for client-side operations (required for some flows).
-   `SUPABASE_SERVICE_ROLE_KEY` — Supabase service role key (used server-side for privileged operations).
-   `ACCESS_TOKEN_SECRET` — secret used to sign/verify JWT access tokens (required).
-   `MAX_AGE` — token expiration (as a number). The code expects a numeric value (e.g., `3600000` for 1 hour in milliseconds).
-   `GAME_DURATION` — default session duration used by the game session service (default: `100`). This project uses the numeric value from `process.env`; assume seconds unless you prefer milliseconds (confirm and keep consistent with client).
-   `MAX_USERS_PER_SESSION` — maximum players per game session (default: `10`).
-   `SHOW_LOGS` — if `true`, shows additional important log output in the console.
-   `LOG_LEVEL` — logger level (default: `info`).

Sample `.env` (example values):

```
PORT=5002
API_ROUTE=/api/v1
FRONTEND_URL=http://localhost:3000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=anon_key_here
SUPABASE_SERVICE_ROLE_KEY=service_role_key_here
ACCESS_TOKEN_SECRET=supersecretkey
MAX_AGE=3600000
GAME_DURATION=100
MAX_USERS_PER_SESSION=10
SHOW_LOGS=true
LOG_LEVEL=info
```

Notes and assumptions

-   `GAME_DURATION` default in code is `100`. I inferred this is measured in seconds; adjust to milliseconds if you use millisecond-based timers elsewhere.
-   Keep secrets (like `SUPABASE_SERVICE_ROLE_KEY` and `ACCESS_TOKEN_SECRET`) out of version control and use a secrets manager in production.

## Quick start

1. Copy the sample `.env` values into `.env` and fill in real keys.
2. Install dependencies (pnpm / npm) and run the server. The server route and port are controlled by the environment variables above.
