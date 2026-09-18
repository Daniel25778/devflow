# DevFlow

DevFlow é um Kanban pessoal para desenvolvedores. O projeto combina autenticação por email e senha, um board com três colunas, CRUD de tarefas, drag-and-drop, filtros e um dashboard de métricas.

O objetivo não foi apenas construir uma interface funcional. O projeto foi desenvolvido como um estudo prático de **Spec-Driven Development (SDD)**: requisitos explícitos, decisões registradas, tarefas rastreáveis, commits atômicos e verificação independente antes do encerramento da feature.

## Funcionalidades

- Cadastro com bootstrap automático de workspace, board e colunas `To Do`, `In Progress` e `Done`
- Login, logout e sessão JWT com Auth.js
- Isolamento de dados por usuário
- Criação, edição, exclusão e movimentação de tarefas
- Drag-and-drop com `@dnd-kit`
- Prioridades `baixa`, `média` e `alta`
- Tags livres com deduplicação case-insensitive
- Filtros combináveis por prioridade, tag e título
- Dashboard com métricas por status, prioridade e conclusão nos últimos sete dias
- Interface responsiva com fluxo alternativo de movimentação por select no formulário

## Stack

- [Next.js 16](https://nextjs.org/) com App Router e TypeScript
- [React 19](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Prisma](https://www.prisma.io/) com PostgreSQL
- [Auth.js](https://authjs.dev/) v5 beta com Credentials e JWT
- [Zod](https://zod.dev/) para validação
- [Vitest](https://vitest.dev/) para testes
- [dnd-kit](https://dndkit.com/) para drag-and-drop
- Deploy planejado: [Vercel](https://vercel.com/) + [Railway](https://railway.app/)

## Arquitetura

O projeto usa Server Components por padrão e concentra mutações em Server Actions.

```text
src/
├── app/
│   ├── (auth)/              # Login e cadastro
│   ├── (app)/               # Layout protegido, board e dashboard
│   ├── actions/             # Server Actions de auth e tarefas
│   └── api/auth/            # Handlers do Auth.js
├── components/
│   ├── board/               # Kanban, cards, filtros e modais
│   └── ui/                  # Componentes compartilhados
├── lib/
│   ├── validators/          # Schemas Zod
│   ├── auth-guards.ts       # Sessão e ownership
│   ├── filter-tasks.ts      # Filtros client-side
│   ├── dashboard-metrics.ts # Agregação de métricas
│   ├── prisma.ts            # Singleton do Prisma Client
│   └── tags.ts              # Deduplicação de tags
└── auth.ts                  # Configuração do Auth.js
```

O modelo de dados está em [prisma/schema.prisma](prisma/schema.prisma). Cada usuário possui um workspace, um board, três colunas padrão e suas próprias tarefas. Queries protegidas filtram pelo `workspace.userId`; recursos de outro usuário resultam em 404.

## Rodando localmente

### Pré-requisitos

- Node.js compatível com o projeto
- PostgreSQL acessível pela máquina local
- npm

Instale as dependências:

```bash
npm install --legacy-peer-deps
```

O `--legacy-peer-deps` é necessário atualmente porque `next-auth@5.0.0-beta.29` declara peer dependency para Next.js 14 ou 15, enquanto o projeto usa Next.js 16.

Crie um arquivo `.env` na raiz. Nunca versione esse arquivo:

```env
DATABASE_URL="postgresql://usuario:senha@host:5432/devflow"
AUTH_SECRET="sua-chave-secreta"
AUTH_URL="http://localhost:3000"
```

Para uma instalação local, `DATABASE_URL` deve apontar para um host acessível pela sua máquina. URLs internas como `postgres.railway.internal` funcionam dentro da Railway, mas não a partir do computador local. Para gerar um secret forte:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
```

Gere o Prisma Client e sincronize o schema:

```bash
npx prisma generate
npx prisma db push
```

Inicie o servidor:

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

### Comandos úteis

```bash
npm test                         # suíte Vitest
npm run lint                     # ESLint
npx tsc --noEmit                 # verificação TypeScript
npx prisma validate              # validação do schema
npx prisma studio                # interface visual do banco
npm run build                   # build de produção
npm start                       # executa o build de produção
```

Para testar o comportamento de produção localmente:

```bash
npm run build
npm start
```

## Spec-Driven Development no projeto

O DevFlow v1 foi executado com o fluxo da skill `tlc-spec-driven`:

```text
Specify → Design → Tasks → Execute → Verify
```

### 1. Specify

O problema foi transformado em requisitos testáveis no [spec.md](.specs/features/devflow-v1/spec.md). Cada história de usuário recebeu critérios de aceitação em formato EARS e um identificador rastreável, como `AUTH-01`, `BOARD-07`, `MOVE-01` e `DASH-03`.

O documento também registra decisões que poderiam gerar ambiguidade:

- um workspace e um board por usuário
- bootstrap automático no cadastro
- erro genérico no login
- recurso de outro usuário responde 404
- filtros combinados com semântica AND
- conclusão recente baseada em `Done` e `updatedAt` dos últimos sete dias

### 2. Design

As decisões arquiteturais foram registradas em [design.md](.specs/features/devflow-v1/design.md), incluindo:

- uso de Credentials + JWT sem Prisma Adapter
- fronteiras entre Server Components, Client Components e Server Actions
- contrato dos guards de autenticação
- formato `TaskDTO` e `DashboardMetrics`
- estratégia de ownership e ordem das tarefas

### 3. Tasks

O trabalho foi dividido em 27 tarefas atômicas em [tasks.md](.specs/features/devflow-v1/tasks.md). Cada tarefa define:

- arquivos e dependências
- requisito atendido
- critérios objetivos de conclusão
- tipo de teste
- gate de validação
- mensagem de commit esperada

As tarefas foram executadas em sequência, sem agrupar entregas não relacionadas. O status foi atualizado junto com cada implementação, e cada tarefa recebeu seu próprio commit Conventional Commit.

### 4. Execute

O ciclo aplicado a cada tarefa foi:

```text
ler contrato → implementar o mínimo necessário → executar o gate
→ revisar adequação → atualizar rastreabilidade → commit atômico
```

Exemplos de gates usados:

- helpers e validators: `npm test`
- actions de autenticação e tarefas: `npm test` com Prisma mockado
- páginas e configuração: `npm run lint && npx tsc --noEmit`
- páginas finais e fechamento de fase: `npm test && npm run lint && npx tsc --noEmit`

A camada de domínio foi testada sem banco real. Os testes de Server Actions mockam o Prisma Client e verificam resultados, payloads, validações, ownership, revalidação e efeitos de persistência esperados.

### 5. Verify

Depois da última tarefa, foi feita uma verificação independente baseada na especificação. O verificador confirmou:

- todas as tarefas T1-T27 concluídas
- critérios de aceitação mapeados para evidências no código e nos testes
- ausência de lacunas de precisão na especificação
- 40 testes passando, sem skips
- lint e TypeScript passando
- mutação `>=` para `>` na regra de sete dias detectada pelos testes
- mutação de AND para OR nos filtros detectada pelos testes
- worktree real preservado após os sensores em ambiente isolado

O resultado está documentado em [validation.md](.specs/features/devflow-v1/validation.md), com veredito `PASS`.

## Rastreamento do processo

Os artefatos SDD ficam versionados no diretório [.specs](.specs):

| Artefato | Finalidade |
| --- | --- |
| [spec.md](.specs/features/devflow-v1/spec.md) | Requisitos e critérios de aceitação |
| [design.md](.specs/features/devflow-v1/design.md) | Decisões arquiteturais e contratos |
| [tasks.md](.specs/features/devflow-v1/tasks.md) | Plano executável, dependências e gates |
| [STATE.md](.specs/STATE.md) | Handoff e estado atual do trabalho |
| [validation.md](.specs/features/devflow-v1/validation.md) | Verificação final independente |

O histórico Git também funciona como trilha de execução. Os commits seguem o formato Conventional Commits e representam entregas pequenas, por exemplo:

```text
feat(auth): add register login logout server actions
feat(tasks): add crud and move server actions
feat(board): add kanban board with drag and drop
feat(dashboard): add metrics dashboard page
```

## Estado atual

DevFlow v1 está implementado e validado localmente.

```text
40 testes passando
ESLint passando
TypeScript passando
Verificação SDD: PASS
```

O deploy público ainda depende da configuração de produção da Vercel, da URL pública do PostgreSQL na Railway e das respectivas variáveis de ambiente.
