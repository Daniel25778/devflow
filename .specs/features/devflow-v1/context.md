# DevFlow v1 Context

**Gathered:** 2026-09-17
**Spec:** `.specs/features/devflow-v1/spec.md`
**Status:** Locked — design drafted (Approach A)

---

## Feature Boundary

DevFlow v1 is a single-user portfolio Kanban app: email/password auth, one workspace with one board (To Do / In Progress / Done), task CRUD with priority and tags, drag-and-drop between columns, filters (priority, tag, title search), and a simple metrics dashboard. Explicitly out of scope: multi-board, teams, comments, attachments, notifications, external integrations.

---

## Implementation Decisions

### Autenticação

- Cadastro (email + senha), login e logout apenas
- Sem verificação de e-mail e sem “esqueci a senha”
- Sessão persistente via cookie até logout explícito

### Bootstrap pós-cadastro

- Ao criar conta, criar automaticamente 1 workspace, 1 board e 3 colunas (To Do, In Progress, Done)
- Nomes padrão: workspace `"Meu Workspace"`, board `"Board Principal"`
- Sem renomear workspace/board/colunas na v1

### Modelo de tarefa

- Campos: título (obrigatório), descrição (opcional), prioridade (baixa/média/alta), tags (0..N), coluna
- Prioridade padrão ao criar: média
- Limites: título ≤ 120 chars; descrição ≤ 2000 chars; ≤ 10 tags; cada tag ≤ 30 chars

### Tags

- Texto livre, criadas na hora
- Deduplicação case-insensitive na mesma tarefa (`bug` = `Bug`)
- Sem taxonomia global nem cores de tag

### Criar / editar / excluir

- Criar e editar em modal da aplicação
- Excluir com **modal de confirmação customizado** da aplicação (nunca `window.confirm()` / dialog nativo do browser)
- Hard delete; sem lixeira / soft-delete

### Mover entre colunas

- Drag-and-drop no board é o caminho principal (desktop)
- No formulário de editar, select de coluna também move a tarefa
- Sem reordenação fine-grained dentro da coluna; ao entrar numa coluna, a tarefa vai para o topo
- Em mobile, mover via select no editar (sem fallback de teclado dedicado)

### Filtros

- Prioridade (uma), tag (uma), busca textual no título (contains, case-insensitive)
- Combinação AND entre filtros ativos
- Botão “Limpar filtros”
- Filtros não persistem na URL nem entre sessões

### Dashboard

- Rota `/dashboard` separada de `/board`
- Métricas: total por status (coluna); total por prioridade; concluídas nos últimos 7 dias = coluna Done e `updatedAt` ≥ now−7d
- Contagens simples (sem gráficos elaborados)

### Navegação e rotas

- Público: `/` (landing), `/login`, `/register`
- Autenticado: `/board`, `/dashboard`
- Não autenticado em rota protegida → redirect `/login`
- Autenticado em `/login` ou `/register` → redirect `/board`
- Nav: Board | Dashboard | Logout

### Landing

- Página mínima: marca DevFlow, uma frase, CTAs Entrar / Criar conta

### Empty states

- Board vazio: mensagem + CTA “Criar primeira tarefa”
- Filtros sem resultado: “Nenhuma tarefa encontrada” + limpar filtros
- Dashboard com zero tarefas: métricas em zero + link para o board

### Auth / ownership

- Usuário só acessa dados do próprio workspace
- Recurso de outro usuário → 404 (não 403)

### Validação e erros

- Erros de formulário inline nos campos
- Falha de rede/servidor: banner/toast genérico
- Login inválido: “Email ou senha incorretos” (genérico)

### Concorrência / dados

- Single-user por conta; sem merge/otimismo elaborado
- Refresh reflete estado do banco

### Conta e dados

- Sem exclusão de conta na v1
- Logout encerra sessão; dados permanecem no banco

### Observabilidade

- Sem analytics/APM na v1; logs de servidor padrão da plataforma

### Visual

- Light mode apenas
- Prioridade visível no card (badge/indicador discreto)
- Tags como chips no card
- Layout limpo e direto

### Agent's Discretion

- Biblioteca de drag-and-drop, biblioteca de UI para modais, e detalhes de layout pixel-level — desde que respeitem as decisões acima
- Escolha exata de hash de senha / lib de sessão fica para Design, desde que atenda email/senha + cookie persistente

### Declined / Undiscussed Gray Areas → Assumptions

Nenhuma área declinada. Todas as 18 áreas foram aceitas; único override explícito: confirmação de exclusão via modal customizado (não `confirm()` nativo).

---

## Specific References

- Usuário: “confirmação de exclusão também seja um modal customizado da aplicação, não o confirm() nativo do navegador”

---

## Deferred Ideas

- Verificação de e-mail / reset de senha
- Renomear workspace, board ou colunas
- Soft-delete / lixeira
- Reordenação fine-grained dentro da coluna
- Persistência de filtros na URL
- Dark mode
- Exclusão de conta
- Multi-board, times, comentários, anexos, notificações, integrações
