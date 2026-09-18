# DevFlow v1 Tasks

## Execution Protocol (MANDATORY -- do not skip)

Implement these tasks with the `tlc-spec-driven` skill: **activate it by name and follow its Execute flow and Critical Rules.** Do not search for skill files by filesystem path. The skill is the source of truth for the full flow (per-task cycle, sub-agent delegation, adequacy review, Verifier, discrimination sensor).

**If the skill cannot be activated, STOP and tell the user - do not proceed without it.**

---

**Design**: `.specs/features/devflow-v1/design.md`  
**Status**: Approved

---

## Test Coverage Matrix

> Generated from codebase, project guidelines, and spec - confirm before Execute. Guidelines found: none beyond stack notes in `README.md` / `AGENTS.md` - strong defaults applied. User confirmed: Vitest unit + integration; **Prisma Client mocked** (no real test DB); no e2e in v1.

| Code Layer | Required Test Type | Coverage Expectation | Location Pattern | Run Command |
| ---------- | ------------------ | -------------------- | ---------------- | ----------- |
| Domain helpers (`tags`, `filter-tasks`, validators, `dashboard-metrics`) | unit | All branches; 1:1 to related spec ACs; listed edge cases for that helper | `src/**/*.test.ts` | `npm test` |
| Server actions (`auth`, `tasks`) | integration | Happy + edge/error paths; **Prisma Client mocked** (no real DB) | `src/**/*.test.ts` | `npm test` |
| UI components / pages | none | - (build gate only) | - | build gate only |
| Prisma schema / app config | none | - (build gate only) | - | build gate only |

## Gate Check Commands

> Generated from codebase + user-confirmed matrix - confirm before Execute.

| Gate Level | When to Use | Command |
| ---------- | ----------- | ------- |
| Quick | After tasks with unit/integration tests | `npm test` |
| Full | After server-action integration tasks | `npm test` |
| Build | After phase completion or UI/config-only tasks | `npm test && npm run lint && npx tsc --noEmit` |

---

## Execution Plan

Phases are ordered and run sequentially - each phase completes before the next begins, and tasks within a phase execute in order.

### Phase 1: Foundation

```
T1 -> T2 -> T5 -> T7
T1 -> T3 -> T4
T2 -> T6
T2 -> T7
```

### Phase 2: Authentication

```
T8 -> T9 -> T11 -> T12
T8 -> T10 -> T11
T11 -> T13
```

### Phase 3: App shell & landing

```
T15 -> T16
T14
T17
```

### Phase 4: Task domain & metrics helpers

```
T18
T19
T20
```

### Phase 5: Board & dashboard UI

```
T21 -> T25 -> T26
T22 -> T25
T23 -> T25
T24 -> T25
T27
```

---

## Task Breakdown

### Phase 1: Foundation

### T1: Add project dependencies and npm scripts

**What**: Install and declare runtime/dev deps (Prisma, Auth.js, bcryptjs, Zod, `@dnd-kit/core`, Vitest) and scripts `test` / `test:watch`.
**Where**: `package.json`
**Depends on**: None
**Reuses**: Existing Next.js scaffold scripts
**Requirement**: AUTH-01, BOARD-01 (toolchain)

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [x] Dependencies listed in `package.json` and installable via `npm install`
- [x] `npm test` script invokes Vitest
- [x] Gate check passes: `npm run lint`

**Tests**: none
**Gate**: build
**Commit**: `chore(tooling): add vitest prisma auth and dnd dependencies`

---

### T2: Configure Vitest

**What**: Add Vitest config for TypeScript path aliases and `*.test.ts` discovery under `src/`.
**Where**: `vitest.config.ts`
**Depends on**: T1
**Reuses**: `tsconfig.json` paths
**Requirement**: (test infrastructure)

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [x] `vitest.config.ts` resolves `@/` imports
- [x] `npm test` runs successfully (0 tests OK)

**Tests**: none
**Gate**: build
**Commit**: `chore(test): add vitest config`

---

### T3: Define Prisma schema

**What**: Create Prisma schema with User, Workspace, Board, Column, Task, Priority enum, indexes, and relations per design.
**Where**: `prisma/schema.prisma`
**Depends on**: T1
**Reuses**: Design data models
**Requirement**: AUTH-02, BOARD-01, BOARD-08, MOVE-03, DASH-03

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [x] Schema matches design (1:1 workspace/board; `tags String[]`; column unique name/position per board)
- [x] `.env` documents `DATABASE_URL`, `AUTH_SECRET`, `AUTH_URL` locally and is never committed
- [x] `npx prisma validate` succeeds (with env present)

**Tests**: none
**Gate**: build
**Commit**: `feat(db): add prisma schema for workspace board and tasks`

---

### T4: Add Prisma client singleton

**What**: Export a PrismaClient singleton safe for Next.js hot reload.
**Where**: `src/lib/prisma.ts`
**Depends on**: T3
**Reuses**: Design `src/lib/prisma.ts` contract
**Requirement**: BOARD-01, ISO-01

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [x] Singleton exported as `prisma`
- [x] Gate check passes: `npx tsc --noEmit`

**Tests**: none
**Gate**: build
**Commit**: `feat(db): add prisma client singleton`

---

### T5: Implement tag dedupe helper

**What**: Implement `dedupeTags` (case-insensitive; keep first-seen casing) with unit tests covering BOARD-08 and edge duplicate cases.
**Where**: `src/lib/tags.ts`
**Depends on**: T2
**Reuses**: Design `dedupeTags` contract
**Requirement**: BOARD-08

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [x] `dedupeTags` implemented
- [x] Unit tests in `src/lib/tags.test.ts` cover case duplicates and empty list
- [x] Gate check passes: `npm test`
- [x] Test count: ≥3 tests pass (no silent deletions)

**Tests**: unit
**Gate**: quick
**Commit**: `feat(tasks): add case-insensitive tag dedupe helper`

---

### T6: Add auth Zod validators

**What**: Zod schemas for register/login (email format, password min 8) with unit tests for AUTH-05 invalid cases.
**Where**: `src/lib/validators/auth.ts`
**Depends on**: T2
**Reuses**: Design validation limits
**Requirement**: AUTH-05, AUTH-06

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [x] Schemas exported for register and login
- [x] Unit tests cover invalid email, short password, valid payloads
- [x] Gate check passes: `npm test`
- [x] Test count: ≥4 tests pass

**Tests**: unit
**Gate**: quick
**Commit**: `feat(auth): add zod validators for login and register`

---

### T7: Add task Zod validators

**What**: Zod schema for task create/update (title 1–120, description ≤2000, ≤10 tags ≤30 chars, priority enum, columnId) with unit tests for BOARD-07.
**Where**: `src/lib/validators/task.ts`
**Depends on**: T2, T5
**Reuses**: `dedupeTags` from T5
**Requirement**: BOARD-07, BOARD-02

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [x] Schema enforces spec bounds
- [x] Unit tests cover empty title, oversize fields, too many tags, oversize tag
- [x] Gate check passes: `npm test`
- [x] Test count: ≥5 tests pass

**Tests**: unit
**Gate**: quick
**Commit**: `feat(tasks): add zod validators for task forms`

---

### Phase 2: Authentication

### T8: Configure Auth.js Credentials + JWT

**What**: Create Auth.js config with Credentials provider, bcrypt verify, JWT session callbacks exposing `user.id`.
**Where**: `src/auth.ts`
**Depends on**: T4, T6
**Reuses**: AD-001; design auth module
**Requirement**: AUTH-01, AUTH-03, AUTH-06, AUTH-09

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [ ] `auth`, `handlers`, `signIn`, `signOut` exported
- [ ] Session strategy is JWT; `session.user.id` available on server
- [ ] Gate check passes: `npx tsc --noEmit`

**Tests**: none
**Gate**: build
**Commit**: `feat(auth): configure authjs credentials with jwt session`

---

### T9: Mount Auth.js route handlers

**What**: Wire Auth.js `handlers` to the App Router catch-all route.
**Where**: `src/app/api/auth/[...nextauth]/route.ts`
**Depends on**: T8
**Reuses**: `src/auth.ts` handlers
**Requirement**: AUTH-03, AUTH-09

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [x] GET/POST handlers exported
- [x] Gate check passes: `npx tsc --noEmit`

**Tests**: none
**Gate**: build
**Commit**: `feat(auth): add nextauth app router handlers`

---

### T10: Add auth guards

**What**: Implement `requireUser` (redirect `/login`) and `getOwnedTaskOr404` (404 if not owner).
**Where**: `src/lib/auth-guards.ts`
**Depends on**: T8
**Reuses**: Design auth-guards contract; Prisma via T4 (already available)
**Requirement**: AUTH-07, ISO-01, ISO-02

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [x] `requireUser` and ownership helper exported
- [x] Ownership miss uses `notFound()` (404)
- [x] Gate check passes: `npx tsc --noEmit`

**Tests**: none
**Gate**: build
**Commit**: `feat(auth): add requireUser and ownership 404 guards`

---

### T11: Implement auth server actions

**What**: `registerAction` (transactional user+workspace+board+3 columns then signIn), `loginAction`, `logoutAction` with integration tests using **mocked Prisma Client** (and mocked Auth.js signIn/signOut where needed).
**Where**: `src/app/actions/auth.ts`
**Depends on**: T9, T10
**Reuses**: Validators T6; Prisma T4; schema T3; AD-002
**Requirement**: AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05, AUTH-06

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [ ] Register creates User + Workspace "Meu Workspace" + Board "Board Principal" + columns To Do / In Progress / Done atomically
- [ ] Duplicate email / validation failures return field errors without partial graph (assert via mock)
- [ ] Invalid login returns "Email ou senha incorretos"
- [ ] Integration tests mock Prisma (no real DB)
- [ ] Gate check passes: `npm test`
- [ ] Test count: ≥5 tests pass

**Tests**: integration
**Gate**: full
**Commit**: `feat(auth): add register login logout server actions`

---

### T12: Build register page

**What**: `/register` form calling `registerAction` with inline field errors; redirect authenticated users to `/board`.
**Where**: `src/app/(auth)/register/page.tsx`
**Depends on**: T11
**Reuses**: Auth validators messages
**Requirement**: AUTH-01, AUTH-05, AUTH-08

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [ ] Page renders email/password fields and submits to `registerAction`
- [ ] Shows inline errors from action result
- [ ] Gate check passes: `npm run lint && npx tsc --noEmit`

**Tests**: none
**Gate**: build
**Commit**: `feat(auth): add register page`

---

### T13: Build login page

**What**: `/login` form calling `loginAction` with generic error message; redirect authenticated users to `/board`.
**Where**: `src/app/(auth)/login/page.tsx`
**Depends on**: T11
**Reuses**: Same form patterns as register
**Requirement**: AUTH-03, AUTH-06, AUTH-08

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [ ] Page submits to `loginAction` and shows "Email ou senha incorretos" on failure
- [ ] Gate check passes: `npm run lint && npx tsc --noEmit`

**Tests**: none
**Gate**: build
**Commit**: `feat(auth): add login page`

---

### Phase 3: App shell & landing

### T14: Build reusable Modal component

**What**: Application modal (overlay, Esc to close, no `window.confirm`) used by create/edit/delete flows.
**Where**: `src/components/ui/Modal.tsx`
**Depends on**: T1
**Reuses**: Tailwind; design Modal contract
**Requirement**: BOARD-05, BOARD-11

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [ ] Modal supports open/close, title, children, onClose
- [ ] Does not use `window.confirm`
- [ ] Gate check passes: `npx tsc --noEmit`

**Tests**: none
**Gate**: build
**Commit**: `feat(ui): add application modal component`

---

### T15: Build AppNav

**What**: Authenticated nav with links to Board, Dashboard, and Logout action.
**Where**: `src/components/AppNav.tsx`
**Depends on**: T11
**Reuses**: `logoutAction`
**Requirement**: DASH-05, AUTH-04

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [ ] Links to `/board` and `/dashboard`; logout control present
- [ ] Gate check passes: `npx tsc --noEmit`

**Tests**: none
**Gate**: build
**Commit**: `feat(ui): add authenticated app navigation`

---

### T16: Add protected app layout

**What**: `(app)` layout calling `requireUser` and rendering `AppNav`.
**Where**: `src/app/(app)/layout.tsx`
**Depends on**: T15
**Reuses**: `requireUser` (T10), `AppNav`
**Requirement**: AUTH-07, DASH-05

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [ ] Unauthenticated access redirects to `/login`
- [ ] Nav rendered for children routes
- [ ] Gate check passes: `npx tsc --noEmit`

**Tests**: none
**Gate**: build
**Commit**: `feat(app): add protected layout with nav`

---

### T17: Replace home with landing page

**What**: Public `/` landing with DevFlow brand, one sentence, CTAs to login/register; light mode only.
**Where**: `src/app/page.tsx`
**Depends on**: T1
**Reuses**: Tailwind; remove scaffold boilerplate
**Requirement**: LAND-01, LAND-02

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [ ] Brand, supporting sentence, CTAs to `/login` and `/register` present
- [ ] No dark-mode toggle; light presentation
- [ ] Gate check passes: `npm run lint && npx tsc --noEmit`

**Tests**: none
**Gate**: build
**Commit**: `feat(landing): replace scaffold home with devflow landing`

---

### Phase 4: Task domain & metrics helpers

### T18: Implement task server actions

**What**: `createTaskAction`, `updateTaskAction`, `deleteTaskAction`, `moveTaskAction` with ownership checks, revalidatePath, and integration tests with **mocked Prisma Client**.
**Where**: `src/app/actions/tasks.ts`
**Depends on**: T7, T10
**Reuses**: task validators, auth-guards, AD-002, AD-003
**Requirement**: BOARD-02, BOARD-03, BOARD-04, BOARD-06, BOARD-07, MOVE-01, MOVE-02, MOVE-03, ISO-01, ISO-02

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [ ] Create defaults priority MEDIUM and column To Do when unspecified; bumps `updatedAt` for top ordering
- [ ] Update/delete/move enforce ownership → 404 path covered via mock
- [ ] Delete is hard delete; move updates `columnId` + `updatedAt`
- [ ] Integration tests mock Prisma (no real DB); cover validation failures
- [ ] Gate check passes: `npm test`
- [ ] Test count: ≥8 tests pass

**Tests**: integration
**Gate**: full
**Commit**: `feat(tasks): add crud and move server actions`

---

### T19: Implement client filter helper

**What**: Pure `filterTasks` applying priority + tag + title search with AND semantics and case-insensitive tag/title matching; unit tests for FILT-*.
**Where**: `src/lib/filter-tasks.ts`
**Depends on**: T2
**Reuses**: TaskDTO shape from design
**Requirement**: FILT-01, FILT-02, FILT-03, FILT-04, FILT-05, FILT-06, FILT-07

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [ ] AND semantics across active filters; empty filters return all
- [ ] Unit tests cover each filter alone, combined AND, clear-all, zero matches
- [ ] Gate check passes: `npm test`
- [ ] Test count: ≥6 tests pass

**Tests**: unit
**Gate**: quick
**Commit**: `feat(board): add and-semantics task filter helper`

---

### T20: Implement dashboard metrics helper

**What**: Aggregation helper computing byStatus, byPriority, and completedLast7Days (Done + `updatedAt` within 7 days) with unit tests (injectable clock or fixed dates).
**Where**: `src/lib/dashboard-metrics.ts`
**Depends on**: T2
**Reuses**: Design `DashboardMetrics`
**Requirement**: DASH-01, DASH-02, DASH-03, DASH-04

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [ ] Metrics match spec rules including zero-task case
- [ ] Unit tests cover mixed columns/priorities and 7-day boundary
- [ ] Gate check passes: `npm test`
- [ ] Test count: ≥4 tests pass

**Tests**: unit
**Gate**: quick
**Commit**: `feat(dashboard): add metrics aggregation helper`

---

### Phase 5: Board & dashboard UI

### T21: Build TaskCard

**What**: Card showing title, priority indicator, and tag chips.
**Where**: `src/components/board/TaskCard.tsx`
**Depends on**: T1
**Reuses**: Design TaskDTO presentation
**Requirement**: BOARD-09

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [ ] Renders title, priority badge/indicator, tag chips
- [ ] Gate check passes: `npx tsc --noEmit`

**Tests**: none
**Gate**: build
**Commit**: `feat(board): add task card component`

---

### T22: Build BoardFilters

**What**: UI for priority select, tag select, title search, and Limpar filtros; uses `filterTasks` via parent state (no URL persistence).
**Where**: `src/components/board/BoardFilters.tsx`
**Depends on**: T19
**Reuses**: `filter-tasks`
**Requirement**: FILT-01, FILT-02, FILT-03, FILT-05, FILT-07

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [ ] Controls for priority, tag, title; clear button resets filters
- [ ] Does not write filters to URL
- [ ] Gate check passes: `npx tsc --noEmit`

**Tests**: none
**Gate**: build
**Commit**: `feat(board): add board filter controls`

---

### T23: Build TaskFormModal

**What**: Create/edit modal form (title, description, priority, tags, column select) wired to task actions.
**Where**: `src/components/board/TaskFormModal.tsx`
**Depends on**: T14, T18
**Reuses**: `Modal`, task actions
**Requirement**: BOARD-02, BOARD-03, BOARD-07, BOARD-11, MOVE-02, MOVE-04

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [ ] Create and edit modes work via same modal
- [ ] Inline validation errors shown; column select present for mobile move path
- [ ] Gate check passes: `npx tsc --noEmit`

**Tests**: none
**Gate**: build
**Commit**: `feat(board): add task create edit modal`

---

### T24: Build ConfirmDeleteModal

**What**: Custom confirmation modal for delete (Confirm/Cancel); never `window.confirm`.
**Where**: `src/components/board/ConfirmDeleteModal.tsx`
**Depends on**: T14, T18
**Reuses**: `Modal`, `deleteTaskAction`
**Requirement**: BOARD-04, BOARD-05, BOARD-06

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [ ] Confirm calls delete action; Cancel closes without deleting
- [ ] No usage of `window.confirm` in this file
- [ ] Gate check passes: `npx tsc --noEmit`

**Tests**: none
**Gate**: build
**Commit**: `feat(board): add custom delete confirmation modal`

---

### T25: Build KanbanBoard with drag-and-drop

**What**: Three-column board using `@dnd-kit`; drop calls `moveTaskAction`; integrates cards, filters, empty/filtered states, opens form/delete modals.
**Where**: `src/components/board/KanbanBoard.tsx`
**Depends on**: T21, T22, T23, T24
**Reuses**: `@dnd-kit/core`, board components; actions/filters from prior phases
**Requirement**: BOARD-01, BOARD-10, MOVE-01, MOVE-03, MOVE-04, FILT-06

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [ ] Columns To Do / In Progress / Done render filtered tasks
- [ ] DnD to another column invokes move; cancel drop leaves card in place
- [ ] Empty board CTA and "Nenhuma tarefa encontrada" + clear filters when needed
- [ ] Gate check passes: `npx tsc --noEmit`

**Tests**: none
**Gate**: build
**Commit**: `feat(board): add kanban board with drag and drop`

---

### T26: Add board page

**What**: Server page `/board` loads owned board+columns+tasks (`updatedAt` desc) and renders `KanbanBoard`.
**Where**: `src/app/(app)/board/page.tsx`
**Depends on**: T25
**Reuses**: `requireUser`, Prisma, `KanbanBoard`, layout T16
**Requirement**: BOARD-01, AUTH-07, ISO-01

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [ ] Loads only current user's board graph
- [ ] Passes data into `KanbanBoard`
- [ ] Gate check passes: `npm test && npm run lint && npx tsc --noEmit`

**Tests**: none
**Gate**: build
**Commit**: `feat(board): add authenticated board page`

---

### T27: Add dashboard page

**What**: Server page `/dashboard` loads user tasks, computes metrics via helper, shows counts and empty-state link to `/board`.
**Where**: `src/app/(app)/dashboard/page.tsx`
**Depends on**: T20, T16
**Reuses**: `dashboard-metrics`, `requireUser`, AppNav via layout
**Requirement**: DASH-01, DASH-02, DASH-03, DASH-04, DASH-05

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [ ] Displays by-status, by-priority, and completed-last-7-days counts
- [ ] Zero tasks → zeros + link to `/board`
- [ ] Gate check passes: `npm test && npm run lint && npx tsc --noEmit`

**Tests**: none
**Gate**: build
**Commit**: `feat(dashboard): add metrics dashboard page`

---

## Phase Execution Map

```
Phase 1 -> Phase 2 -> Phase 3 -> Phase 4 -> Phase 5

Phase 1:  T1 -> T2 -> T5 -> T7
          T1 -> T3 -> T4
          T2 -> T6
          T2 -> T7

Phase 2:  T8 -> T9 -> T11 -> T12
          T8 -> T10 -> T11
          T11 -> T13

Phase 3:  T15 -> T16
          T14
          T17

Phase 4:  T18
          T19
          T20

Phase 5:  T21 -> T25 -> T26
          T22 -> T25
          T23 -> T25
          T24 -> T25
          T27
```

Suggested Execute batches (~7 tasks): **B1** Phase1 | **B2** Phase2 | **B3** Phase3+Phase4 (7 tasks) | **B4** Phase5.

Execution is strictly sequential within each batch (follow task number order when diagram branches). Offer batch sub-agents at Execute if the user accepts.

---

## Task Granularity Check

| Task | Scope | Status |
| ---- | ----- | ------ |
| T1–T4 | 1 config/schema/client file each | ✅ Granular |
| T5–T7 | 1 helper/validator module + co-located tests each | ✅ Granular |
| T8–T13 | 1 auth file/page each | ✅ Granular |
| T14–T17 | 1 UI/layout/page each | ✅ Granular |
| T18–T20 | 1 domain module + tests each | ✅ Granular |
| T21–T27 | 1 component/page each | ✅ Granular |

---

## Diagram-Definition Cross-Check

| Task | Depends On (task body) | Diagram Shows | Status |
| ---- | ---------------------- | ------------- | ------ |
| T1 | None | (start) | ✅ Match |
| T2 | T1 | T1 → T2 | ✅ Match |
| T3 | T1 | T1 → T3 | ✅ Match |
| T4 | T3 | T3 → T4 | ✅ Match |
| T5 | T2 | T2 → T5 | ✅ Match |
| T6 | T2 | T2 → T6 | ✅ Match |
| T7 | T2, T5 | T2 → T7, T5 → T7 | ✅ Match |
| T8 | T4, T6 (cross-phase) | (phase start) | ✅ Match |
| T9 | T8 | T8 → T9 | ✅ Match |
| T10 | T8 | T8 → T10 | ✅ Match |
| T11 | T9, T10 | T9 → T11, T10 → T11 | ✅ Match |
| T12 | T11 | T11 → T12 | ✅ Match |
| T13 | T11 | T11 → T13 | ✅ Match |
| T14 | T1 (cross) | (standalone) | ✅ Match |
| T15 | T11 (cross) | (phase start) | ✅ Match |
| T16 | T15 | T15 → T16 | ✅ Match |
| T17 | T1 (cross) | (standalone) | ✅ Match |
| T18 | T7, T10 (cross) | (standalone) | ✅ Match |
| T19 | T2 (cross) | (standalone) | ✅ Match |
| T20 | T2 (cross) | (standalone) | ✅ Match |
| T21 | T1 (cross) | (phase start) | ✅ Match |
| T22 | T19 (cross) | (phase start) | ✅ Match |
| T23 | T14, T18 (cross) | (phase start) | ✅ Match |
| T24 | T14, T18 (cross) | (phase start) | ✅ Match |
| T25 | T21, T22, T23, T24 | T21/22/23/24 → T25 | ✅ Match |
| T26 | T25 | T25 → T26 | ✅ Match |
| T27 | T20, T16 (cross) | (standalone) | ✅ Match |

---

## Test Co-location Validation

| Task | Code Layer Created/Modified | Matrix Requires | Task Says | Status |
| ---- | --------------------------- | --------------- | --------- | ------ |
| T1 | package config | none | none | ✅ OK |
| T2 | Vitest config | none | none | ✅ OK |
| T3 | Prisma schema | none | none | ✅ OK |
| T4 | Prisma client | none | none | ✅ OK |
| T5 | Domain helper | unit | unit | ✅ OK |
| T6 | Domain helper | unit | unit | ✅ OK |
| T7 | Domain helper | unit | unit | ✅ OK |
| T8–T10 | Auth config/guards | none | none | ✅ OK |
| T11 | Server actions | integration | integration | ✅ OK |
| T12–T17 | UI / pages | none | none | ✅ OK |
| T18 | Server actions | integration | integration | ✅ OK |
| T19 | Domain helper | unit | unit | ✅ OK |
| T20 | Domain helper | unit | unit | ✅ OK |
| T21–T27 | UI / pages | none | none | ✅ OK |
