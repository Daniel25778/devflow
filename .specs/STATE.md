# STATE

## Decisions

### AD-001
- **Decision**: Authentication uses Auth.js v5 with Credentials provider and JWT session strategy (httpOnly cookie); no Prisma Auth adapter tables in v1.
- **Reason**: Spec requires email/password with persistent session; Credentials requires JWT; custom User + register bootstrap is simpler than adapter Account/Session models for a single-provider app.
- **Trade-off**: Sessions are not server-revocable except by secret rotation; logout clears the cookie only.
- **Scope**: All authenticated routes and server actions
- **Date**: 2026-09-18
- **Status**: active

### AD-002
- **Decision**: All domain writes (register bootstrap side effects, task CRUD, move) go through Next.js Server Actions with `revalidatePath`; no public REST CRUD API in v1.
- **Reason**: Same-app UI + mutations; less surface area under a weekend deadline.
- **Trade-off**: Harder to expose a third-party API later without adding routes.
- **Scope**: `src/app/actions/*`, board/dashboard UI
- **Date**: 2026-09-18
- **Status**: active

### AD-003
- **Decision**: Task tags are stored as `String[]` on `Task` with application-level case-insensitive deduplication; no Tag entity or join table.
- **Reason**: Spec is free-text tags per task with no global taxonomy or colors.
- **Trade-off**: Cross-task tag rename/analytics need a future migration.
- **Scope**: Prisma `Task` model, task validators/actions, filters
- **Date**: 2026-09-18
- **Status**: active

## Handoff

- **Feature**: DevFlow v1 / `.specs/features/devflow-v1`
- **Phase / Task**: Tasks — `tasks.md` drafted (27 tasks, 5 phases), awaiting user approval
- **Completed**: Specify confirmed; Design Approach A approved; test matrix confirmed (Vitest + Prisma mocks)
- **In-progress**: none
- **Next step**: User approves `tasks.md`, then Execute (offer batch sub-agents: B1–B4)
- **Blockers**: none
- **Uncommitted files**: `.specs/features/devflow-v1/*`, `.specs/STATE.md`
- **Branch**: (local working tree)
