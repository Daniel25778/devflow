# DevFlow v1 Specification

## Problem Statement

Desenvolvedores precisam de um Kanban pessoal simples para organizar tarefas sem a complexidade de ferramentas de times. DevFlow v1 é um app de portfólio publicável que demonstra autenticação, CRUD, drag-and-drop e métricas básicas com stack moderna (Next.js, Prisma, PostgreSQL), entregável até o fim de semana.

## Goals

- [ ] Usuário consegue se cadastrar, fazer login e usar um board Kanban completo (criar, editar, excluir, mover tarefas) em uma sessão contínua
- [ ] Usuário consegue filtrar tarefas por prioridade, tag e título, e ver métricas no dashboard
- [ ] Aplicação autenticada, com dados isolados por usuário, deployável publicamente (Vercel + Railway)

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
| ------- | ------ |
| Múltiplos boards por workspace | Escopo v1; um board basta para o demo |
| Colaboração / times / convites | Single-user; fora do prazo |
| Comentários, anexos, notificações | Complexidade sem ganho para portfólio mínimo |
| Integrações externas (GitHub, Slack, etc.) | Fora do prazo |
| Verificação de e-mail / reset de senha | Auth mínima deliberada |
| Renomear workspace, board ou colunas | Nomes fixos no bootstrap |
| Soft-delete / lixeira | Hard delete apenas |
| Reordenação fine-grained dentro da coluna | Só coluna importa; topo ao entrar |
| Persistência de filtros na URL | Estado efêmero na sessão de UI |
| Dark mode | Light mode apenas na v1 |
| Exclusão de conta | Fora do caminho crítico do demo |
| Analytics / APM | Logs padrão da plataforma bastam |

---

## Assumptions & Open Questions

Every ambiguity is resolved or recorded here - nothing is left silently unclear.

| Assumption / decision | Chosen default | Rationale | Confirmed? |
| --------------------- | -------------- | --------- | ---------- |
| Auth mínima | Register + login + logout; sem verify/reset | Prazo e portfólio | y |
| Bootstrap | Auto-cria workspace + board + 3 colunas no cadastro | Zero setup | y |
| Nomes padrão | Workspace `"Meu Workspace"`; board `"Board Principal"` | Simples; rename fora | y |
| Prioridade padrão | `média` ao criar | Neutro | y |
| Limites de campos | Título 120; desc 2000; ≤10 tags; tag ≤30 | Validação concreta | y |
| Tags | Livres; dedupe case-insensitive na tarefa | Flexível e rápido | y |
| CRUD UI | Modais customizados para criar/editar/confirmar exclusão; hard delete | UX previsível; sem `confirm()` nativo | y |
| Move | DnD principal; select no editar; topo da coluna; mobile via select | Cobre desktop + mobile sem a11y DnD | y |
| Filtros | Prioridade + tag + título; AND; limpar; sem persistência | Comportamento óbvio | y |
| Dashboard “7 dias” | Done + `updatedAt` ≥ now−7d | Sem histórico de movimentação | y |
| Rotas | `/`, `/login`, `/register`, `/board`, `/dashboard` | Fluxo clássico | y |
| Ownership leak | Recurso alheio → 404 | Não vaza existência | y |
| Login error | Mensagem genérica | Não revela qual campo falhou | y |
| Visual | Light mode; badge de prioridade; chips de tag | Demo legível | y |

**Open questions:** none - all resolved or logged above (required before the spec is confirmed).

---

## User Stories

### P1: Autenticação e bootstrap do workspace ⭐ MVP

**User Story**: As a developer, I want to create an account and sign in so that I get my own workspace ready to use.

**Why P1**: Sem auth e dados próprios não há produto demonstrável.

**Acceptance Criteria** (each line is one EARS pattern):

1. WHEN a visitor submits valid email and password on `/register` THEN the system SHALL create a user account and establish an authenticated session
2. WHEN a user account is created THEN the system SHALL create exactly one workspace named "Meu Workspace", one board named "Board Principal", and three columns named "To Do", "In Progress", and "Done" for that user
3. WHEN a registered user submits correct email and password on `/login` THEN the system SHALL establish an authenticated session and redirect to `/board`
4. WHEN an authenticated user chooses logout THEN the system SHALL end the session and redirect to `/login`
5. IF registration email is already in use OR password does not meet the minimum length of 8 characters OR email format is invalid THEN the system SHALL reject the request and show an inline field error without creating an account
6. IF login credentials are invalid THEN the system SHALL reject the request and show the message "Email ou senha incorretos"
7. WHILE the user is unauthenticated the system SHALL redirect requests to `/board` and `/dashboard` to `/login`
8. WHILE the user is authenticated the system SHALL redirect requests to `/login` and `/register` to `/board`
9. The system SHALL persist the authenticated session across browser refreshes until logout

**Independent Test**: Register a new user → land on `/board` with three empty columns; logout; login again with same credentials → same board.

---

### P1: Board Kanban e CRUD de tarefas ⭐ MVP

**User Story**: As a developer, I want to create, view, edit, and delete tasks on a Kanban board so that I can manage my work.

**Why P1**: Core do produto.

**Acceptance Criteria**:

1. WHEN an authenticated user opens `/board` THEN the system SHALL display their single board with columns "To Do", "In Progress", and "Done" and the tasks in each column
2. WHEN the user submits a new task with a non-empty title THEN the system SHALL create the task in the selected column (default "To Do") with default priority "média" and show it at the top of that column
3. WHEN the user saves edits to a task (title, description, priority, tags, column) THEN the system SHALL persist the changes and update the board
4. WHEN the user confirms deletion in the custom confirmation modal THEN the system SHALL permanently remove the task from the database and the board
5. WHEN the user requests to delete a task THEN the system SHALL open an application-owned confirmation modal (not the browser native `confirm()` dialog) before deleting
6. IF the user cancels the confirmation modal THEN the system SHALL leave the task unchanged and close the modal
7. IF title is empty OR title exceeds 120 characters OR description exceeds 2000 characters OR more than 10 tags OR any tag exceeds 30 characters THEN the system SHALL reject the save and show inline validation errors
8. The system SHALL allow zero or more free-text tags per task and SHALL deduplicate tags on the same task in a case-insensitive manner
9. The system SHALL display each task card with title, priority indicator, and tag chips
10. WHEN the board has no tasks and no active filters THEN the system SHALL show an empty state with a call-to-action to create the first task
11. The system SHALL open create and edit flows in application modals

**Independent Test**: Create a task → see it in To Do → edit fields → confirm delete in custom modal → task gone; cancel delete once → task remains.

---

### P1: Mover tarefas entre colunas ⭐ MVP

**User Story**: As a developer, I want to move tasks between columns so that I can reflect progress.

**Why P1**: Kanban sem mover não demonstra o fluxo.

**Acceptance Criteria**:

1. WHEN the user drops a task card onto another column via drag-and-drop THEN the system SHALL update the task's column to that column and place the task at the top of that column
2. WHEN the user changes the column field in the edit modal and saves THEN the system SHALL move the task to that column and place it at the top
3. The system SHALL not require or persist fine-grained order among tasks within a column beyond "newly entered or created tasks appear at the top"
4. WHILE viewing the board on a viewport where drag-and-drop is impractical the system SHALL still allow column changes via the edit modal select

**Independent Test**: Drag a task from To Do to In Progress → persists after refresh; change column via edit modal → same persistence.

---

### P1: Isolamento de dados ⭐ MVP

**User Story**: As a developer, I want my tasks private to my account so that other users cannot see or change them.

**Why P1**: Segurança básica e credibilidade do portfólio.

**Acceptance Criteria**:

1. WHILE a user is authenticated the system SHALL only read and write tasks, board, and workspace belonging to that user
2. IF an authenticated user requests a task or board resource that belongs to another user THEN the system SHALL respond with 404

**Independent Test**: Two accounts; user A cannot read/update/delete user B's task IDs (404).

---

### P2: Filtrar tarefas

**User Story**: As a developer, I want to filter tasks by priority, tag, and title search so that I can find work quickly.

**Why P2**: Melhora o demo mas o CRUD+DnD já vende o produto; ainda assim está no escopo v1 desejado e deve shippar.

**Acceptance Criteria**:

1. WHEN the user selects a priority filter THEN the system SHALL show only tasks with that priority
2. WHEN the user selects a tag filter THEN the system SHALL show only tasks that include that tag (case-insensitive match)
3. WHEN the user enters text in the title search THEN the system SHALL show only tasks whose title contains that text (case-insensitive)
4. WHILE multiple filters are active the system SHALL apply them with AND semantics
5. WHEN the user activates "Limpar filtros" THEN the system SHALL clear all filters and show all tasks again
6. WHEN active filters match zero tasks THEN the system SHALL show "Nenhuma tarefa encontrada" and a way to clear filters
7. The system SHALL not persist filter state in the URL or across new browser sessions

**Independent Test**: Create tasks with varied priority/tags/titles → apply each filter alone and combined → clear → full list returns.

---

### P2: Dashboard de métricas

**User Story**: As a developer, I want a simple dashboard of task metrics so that I can see status and recent completion at a glance.

**Why P2**: Diferencial de portfólio; depende de tarefas existentes.

**Acceptance Criteria**:

1. WHEN an authenticated user opens `/dashboard` THEN the system SHALL display counts of their tasks grouped by column status
2. WHEN an authenticated user opens `/dashboard` THEN the system SHALL display counts of their tasks grouped by priority
3. WHEN an authenticated user opens `/dashboard` THEN the system SHALL display the count of tasks that are in column "Done" and whose `updatedAt` is within the last 7 days
4. IF the user has zero tasks THEN the system SHALL show zero for all metrics and a link to `/board`
5. The system SHALL expose navigation links among Board, Dashboard, and Logout for authenticated users

**Independent Test**: Seed tasks across columns/priorities; move one to Done; open `/dashboard` → counts match; empty account → zeros + link.

---

### P3: Landing pública

**User Story**: As a visitor, I want a simple landing page so that I understand what DevFlow is and can sign up or log in.

**Why P3**: Nice-to-have de apresentação; auth pages alone would work, but landing was agreed.

**Acceptance Criteria**:

1. WHEN a visitor opens `/` THEN the system SHALL show the DevFlow brand name, one short supporting sentence, and CTAs to `/login` and `/register`
2. The system SHALL render the application in light mode only for v1

**Independent Test**: Open `/` logged out → see brand + CTAs; follow CTAs to auth pages.

---

## Edge Cases

- IF registration is submitted with duplicate email THEN the system SHALL reject without creating workspace/board
- IF drag-and-drop is cancelled mid-drag (drop outside a column) THEN the system SHALL leave the task in its original column
- IF filtered board would hide a task just created that does not match filters THEN the system SHALL keep filters active and only show matching tasks (user clears filters to see it)
- IF tag list on submit contains duplicates differing only by case THEN the system SHALL store a single tag (first-seen casing or normalized form — implementation choice) for that task
- IF session cookie is missing or invalid THEN the system SHALL treat the user as unauthenticated and redirect protected routes to `/login`
- IF description is omitted THEN the system SHALL store an empty description and still create/update the task

---

## Requirement Traceability

Each requirement gets a unique ID for tracking across design, tasks, and validation.

| Requirement ID | Story | Phase | Status |
| -------------- | ----- | ----- | ------ |
| AUTH-01 | P1: Autenticação e bootstrap | Tasks | In Tasks |
| AUTH-02 | P1: Autenticação e bootstrap | Tasks | In Tasks |
| AUTH-03 | P1: Autenticação e bootstrap | Tasks | In Tasks |
| AUTH-04 | P1: Autenticação e bootstrap | Tasks | In Tasks |
| AUTH-05 | P1: Autenticação e bootstrap | Tasks | In Tasks |
| AUTH-06 | P1: Autenticação e bootstrap | Tasks | In Tasks |
| AUTH-07 | P1: Autenticação e bootstrap | Tasks | In Tasks |
| AUTH-08 | P1: Autenticação e bootstrap | Tasks | In Tasks |
| AUTH-09 | P1: Autenticação e bootstrap | Tasks | In Tasks |
| BOARD-01 | P1: Board Kanban e CRUD | Tasks | In Tasks |
| BOARD-02 | P1: Board Kanban e CRUD | Tasks | In Tasks |
| BOARD-03 | P1: Board Kanban e CRUD | Tasks | In Tasks |
| BOARD-04 | P1: Board Kanban e CRUD | Tasks | In Tasks |
| BOARD-05 | P1: Board Kanban e CRUD | Tasks | In Tasks |
| BOARD-06 | P1: Board Kanban e CRUD | Tasks | In Tasks |
| BOARD-07 | P1: Board Kanban e CRUD | Tasks | In Tasks |
| BOARD-08 | P1: Board Kanban e CRUD | Tasks | In Tasks |
| BOARD-09 | P1: Board Kanban e CRUD | Tasks | In Tasks |
| BOARD-10 | P1: Board Kanban e CRUD | Tasks | In Tasks |
| BOARD-11 | P1: Board Kanban e CRUD | Tasks | In Tasks |
| MOVE-01 | P1: Mover tarefas | Tasks | In Tasks |
| MOVE-02 | P1: Mover tarefas | Tasks | In Tasks |
| MOVE-03 | P1: Mover tarefas | Tasks | In Tasks |
| MOVE-04 | P1: Mover tarefas | Tasks | In Tasks |
| ISO-01 | P1: Isolamento de dados | Tasks | In Tasks |
| ISO-02 | P1: Isolamento de dados | Tasks | In Tasks |
| FILT-01 | P2: Filtrar tarefas | Tasks | In Tasks |
| FILT-02 | P2: Filtrar tarefas | Tasks | In Tasks |
| FILT-03 | P2: Filtrar tarefas | Tasks | In Tasks |
| FILT-04 | P2: Filtrar tarefas | Tasks | In Tasks |
| FILT-05 | P2: Filtrar tarefas | Tasks | In Tasks |
| FILT-06 | P2: Filtrar tarefas | Tasks | In Tasks |
| FILT-07 | P2: Filtrar tarefas | Tasks | In Tasks |
| DASH-01 | P2: Dashboard de métricas | Tasks | In Tasks |
| DASH-02 | P2: Dashboard de métricas | Tasks | In Tasks |
| DASH-03 | P2: Dashboard de métricas | Tasks | In Tasks |
| DASH-04 | P2: Dashboard de métricas | Tasks | In Tasks |
| DASH-05 | P2: Dashboard de métricas | Tasks | In Tasks |
| LAND-01 | P3: Landing pública | Tasks | In Tasks |
| LAND-02 | P3: Landing pública | Tasks | In Tasks |

**ID format:** `[CATEGORY]-[NUMBER]` (e.g., `AUTH-01`, `BOARD-03`)

**Status values:** Pending → In Design → In Tasks → Implementing → Verified

**Coverage:** 40 total, 0 mapped to tasks, 40 unmapped (tasks phase not started)

**AC ↔ ID mapping:** Each acceptance criterion in story order maps 1:1 to the IDs above within that story's category (AUTH-01…09, BOARD-01…11, MOVE-01…04, ISO-01…02, FILT-01…07, DASH-01…05, LAND-01…02).

---

## Success Criteria

How we know the feature is successful:

- [ ] New user can go from landing → register → populated empty board in under 2 minutes
- [ ] User can create, edit, delete (via custom modal), and move tasks; state survives refresh
- [ ] Filters (priority, tag, title) and dashboard metrics match board data for a seeded account
- [ ] Second user cannot access first user's tasks (404)
- [ ] App is deployable on Vercel with PostgreSQL on Railway for a public demo URL
