# Repository Guidelines

## Project Structure & Module Organization
This repository is a Next.js App Router application. Route handlers and pages live in `app/`, grouped under `app/(auth)` and `app/(chat)`. Shared UI is in `components/`, with chat-specific pieces under `components/chat` and generic primitives under `components/ui`. Server and domain logic lives in `lib/`, including AI integrations in `lib/ai`, database code in `lib/db`, and editor utilities in `lib/editor`. Artifact-specific client/server code is split across `artifacts/`. Static assets live in `public/`. End-to-end tests and test helpers live in `tests/`.

## Build, Test, and Development Commands
- `pnpm dev`: start the local dev server on port `3000`.
- `pnpm build`: run DB migrations, then build the production app.
- `pnpm start`: serve the production build locally.
- `pnpm check`: run Ultracite/Biome checks.
- `pnpm fix`: apply automatic formatting and lint fixes.
- `pnpm db:migrate`: apply migrations from `lib/db/migrations`.
- `pnpm test`: run Playwright end-to-end tests in `tests/e2e`.

For local services, use `docker compose up -d` and keep `.env.local` aligned with `POSTGRES_URL` and `REDIS_URL`.

## Coding Style & Naming Conventions
Use TypeScript throughout. Biome is configured for 2-space indentation in `biome.jsonc`; prefer `pnpm fix` before opening a PR. Follow existing naming patterns: PascalCase for React components, camelCase for functions and variables, and route filenames that match Next.js conventions such as `page.tsx` and `route.ts`. Keep modules focused and place feature-specific helpers close to their owning feature.

## Testing Guidelines
Playwright is the primary test framework. Add end-to-end coverage in `tests/e2e/*.test.ts` and page objects or helpers under `tests/pages` and `tests/helpers.ts` when flows become reusable. Run `pnpm test` against a working `.env.local`; the Playwright config boots `pnpm dev` automatically.

## Commit & Pull Request Guidelines
Recent history uses short, imperative commit subjects, for example `update links in README.md (#1476)`. Keep commits narrowly scoped and descriptive. PRs should explain the user-visible change, note any config or migration impact, and include screenshots for UI changes. Link the relevant issue or PR context when available.

## Security & Configuration Tips
Do not commit `.env.local` or real secrets. Required local variables include `AUTH_SECRET`, `POSTGRES_URL`, and optionally `REDIS_URL`, `AI_GATEWAY_API_KEY`, and `BLOB_READ_WRITE_TOKEN`. Postgres migrations expect `pgcrypto`; the provided Docker setup enables it automatically.
