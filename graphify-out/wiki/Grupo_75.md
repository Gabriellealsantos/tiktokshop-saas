# Grupo 75

> 12 nodes · cohesion 0.29

## Key Concepts

- **server.ts** (8 connections) — `frontend/src/server.ts`
- **renderErrorPage()** (5 connections) — `frontend/src/lib/error-page.ts`
- **start.ts** (5 connections) — `frontend/src/start.ts`
- **fetch()** (4 connections) — `frontend/src/server.ts`
- **normalizeCatastrophicSsrResponse()** (4 connections) — `frontend/src/server.ts`
- **error-capture.ts** (3 connections) — `frontend/src/lib/error-capture.ts`
- **consumeLastCapturedError()** (3 connections) — `frontend/src/lib/error-capture.ts`
- **error-page.ts** (3 connections) — `frontend/src/lib/error-page.ts`
- **getServerEntry()** (2 connections) — `frontend/src/server.ts`
- **record()** (1 connections) — `frontend/src/lib/error-capture.ts`
- **ServerEntry** (1 connections) — `frontend/src/server.ts`
- **errorMiddleware** (1 connections) — `frontend/src/start.ts`

## Relationships

- [Front — Roteamento (TanStack)](Front_%E2%80%94_Roteamento_%28TanStack%29.md) (2 shared connections)

## Source Files

- `frontend/src/lib/error-capture.ts`
- `frontend/src/lib/error-page.ts`
- `frontend/src/server.ts`
- `frontend/src/start.ts`

## Audit Trail

- EXTRACTED: 40 (100%)
- INFERRED: 0 (0%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*