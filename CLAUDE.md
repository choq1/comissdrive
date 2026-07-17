# CLAUDE.md — SaaS de Cálculo de Comissionamento

Este arquivo documenta o projeto para consulta em qualquer sessão futura. Mantenha-o atualizado conforme o projeto evolui.

## Visão geral

SaaS que calcula automaticamente a comissão que cada funcionário recebe ao fim de um período, com base em regras de negócio configuráveis pelo administrador (percentual sobre faturamento, bônus por volume, estrutura em tiers).

Dois papéis de acesso, na mesma aplicação (controlados por `role`):

- **Admin**: cadastra métricas (funcionários, faturamento) e define as regras de cálculo de comissão. Acessa também permissões de usuário e integrações (Salesforce, Stripe, Slack).
- **Manager / Gestão**: acompanha dashboards, funcionários, comissões e invoices geradas a partir das regras definidas pelo admin.

Referência visual (pasta raiz do projeto): `dashboard.png`, `analytics.png`, `Gestão.png`, `configurações globais.png` — app "Commissioning", dark-theme, sidebar com Dashboard / Employees / Commissions / Invoices / Settings.

## Localização do projeto

O projeto vive em `C:\xampp\htdocs\Projeto Piloto` (fora de qualquer pasta sincronizada por OneDrive/Dropbox/Google Drive). **Isso é proposital, não incidental**: originalmente o projeto ficava dentro de uma pasta do OneDrive, e rodar os dois dev servers (`ts-node-dev --respawn` na API + `next dev` com Turbopack no web) ali causou trava real da máquina (crash + reinício) — o motor de sincronização do OneDrive competia em tempo real por I/O de disco com os watchers de arquivo do Node/Next sobre `node_modules`/`.next`. Nunca mover o projeto de volta para uma pasta com sync em nuvem ativo.



## Stack tecnológica

| Camada | Tecnologia |
|---|---|
| Frontend | Next.js (React + TypeScript), Tailwind CSS, Recharts (gráficos) |
| Backend | Node.js, Express, TypeScript |
| Persistência | JSON local (`apps/api/src/data/*.json`) — migração planejada para PostgreSQL |
| Monorepo | npm workspaces (`apps/web`, `apps/api`) |

## Estrutura de pastas

```
Projeto Piloto/
├── CLAUDE.md
├── plan/                      # todo plano de trabalho criado fica salvo aqui (histórico)
│   ├── 01-setup-inicial.md
│   ├── 02-crud-testes-git.md
│   ├── 03-motor-calculo.md
│   ├── 04-frontend-telas.md
│   ├── 05-settings-permissoes.md
│   └── 06-autenticacao-permissoes.md
├── package.json                # root, npm workspaces
├── .husky/                     # hooks de git (pre-commit, pre-push) — ativos
├── .gitignore
├── .env.example
└── apps/
    ├── web/                    # Next.js + Tailwind — frontend (admin + gestão)
    │   └── src/
    │       ├── app/            # rotas: /dashboard, /employees, /commissions, /invoices, /settings
    │       ├── components/
    │       │   ├── layout/     # Sidebar, PageHeader
    │       │   ├── ui/         # KpiCard, StatusBadge, DataTable, Modal, Input, Select, Button (genéricos)
    │       │   ├── dashboard/  # CommissionGrowthChart, TopPerformers
    │       │   ├── employees/  # EmployeesTable (busca + filtro client-side)
    │       │   ├── commissions/# TopCommissionedBarChart, DepartmentPieChart
    │       │   └── settings/   # RulesEditor (rules + tiers), UserPermissionsPanel — "use client", primeiros CRUDs client-side do app
    │       ├── lib/            # api.ts (fetch tipado por entidade, cache: "no-store", + mutações POST/PUT/DELETE), format.ts
    │       └── types/          # domain.ts — cópia manual do domain.ts da API (ver nota de dívida técnica abaixo)
    └── api/                    # Express — backend
        └── src/
            ├── app.ts          # cria o Express app (usado também nos testes)
            ├── index.ts        # entrypoint: só chama app.listen
            ├── routes/         # employees, invoices, rules (+tiers), revenue, commissions, users (+ *.test.ts colocados)
            ├── controllers/
            ├── services/       # CRUD sobre os JSON + commissionEngine.ts (motor de cálculo) + commissionResultService.ts (persistência/workflow)
            ├── schemas/        # validação zod por entidade
            ├── lib/            # jsonStore.ts (leitura/escrita), crudRepository.ts (fábrica de CRUD)
            ├── data/           # employees.json, rules.json, invoices.json, revenue.json, commissionResults.json, users.json
            ├── scripts/        # seedPasswords.ts (seed de senha padrão para usuários de teste, fase 6)
            └── middleware/     # errorHandler.ts, auth.ts (requireAuth/requireRole, fase 6)
```

## Modelo de dados

- **Employee**: `id, code, name, role (cargo), department, baseSalary, tier (Gold/Silver), status`
- **RevenueRecord**: `id, employeeId, period (YYYY-MM), revenueAmount` — faturamento do funcionário no período, cadastrado pelo admin
- **CommissionRule**: `id, name, type (base | volumeBonus | tiered), scope (department | role | global), appliesTo (valor alvo do scope, ex: "Sales"; null quando scope=global), percentage, threshold`
- **CommissionTier**: `id, ruleId, tierName, minRevenue, maxRevenue, percentage` — faixas de uma regra `type: "tiered"`
- **CommissionResult** (calculado, persistido): `employeeId, period, baseSalary, revenue, appliedRules[], commissionAmount, totalPay, status (pending/approved/paid)`
- **Invoice**: `id, employeeId, period, amount, status, dueDate, paidDate`
- **User**: `id, name, email, role (admin/manager), employeeId?, passwordHash` — CRUD completo via `/api/users` (admin-only, desde a fase 5). `passwordHash` nunca é serializado nas respostas da API (`toPublicUser()` em `userController.ts`/`userService.ts` remove o campo); o cliente HTTP só manda `password` em texto puro no create/update, nunca recebe hash de volta. Login real e enforcement de permissão por role implementados na fase 6 (ver abaixo).

## Regra de negócio — cálculo de comissão

```
comissão = (base% × faturamento)
         + (faturamento > limiteVolume ? bônusVolume% × faturamento : 0)
         + cálculoPorTiers(faturamento)
```

Implementado em `services/commissionEngine.ts` (função pura `calculateCommission`):
- Uma regra "casa" com o funcionário se `scope: "global"`, ou se `scope: "department"/"role"` e `appliesTo` bate com o `department`/`role` do funcionário.
- `base` e `volumeBonus` aplicam o percentual da regra sobre o faturamento total (volume bonus só se faturamento > `threshold`).
- `cálculoPorTiers` é **progressivo** (estilo faixa de IR): cada faixa de faturamento paga só a sua própria %, sem saltos ao cruzar um limite.
- Todas as regras aplicáveis se somam (base + volume bonus + tiers podem coexistir para o mesmo funcionário).

`services/commissionResultService.ts` persiste o resultado em `commissionResults.json` com `status` inicial `pending`. Resultados `approved`/`paid` ficam congelados — recalcular um período não os sobrescreve. Transição de status é sequencial e só para frente: `pending → approved → paid`.

As regras (`CommissionRule` / `CommissionTier`) são configuráveis pelo admin na tela de Settings ("Global Settings & Rules").

## Como rodar (após instalação das dependências)

```
npm install              # na raiz, instala web + api via workspaces
npm run dev:api          # sobe o backend Express
npm run dev:web          # sobe o frontend Next.js
npm test                 # roda a suíte de testes de todos os workspaces (hoje: apps/api)
```

## API — endpoints

CRUD completo (GET lista, GET por id, POST, PUT, DELETE) para cada entidade, montado sob `/api`:

- `/api/employees`
- `/api/invoices`
- `/api/rules` (+ `/api/rules/tiers`, CRUD completo desde a fase 5 — deletar uma rule `tiered` remove seus tiers em cascata)
- `/api/revenue` *(fase 3)*
- `/api/users` *(fase 5)* — admin-only, inclusive leitura (fase 6)
- `/api/auth` *(fase 6)*: `POST /login` (público, seta cookie `token` httpOnly JWT), `POST /logout` (público, limpa o cookie), `GET /me` (autenticado, devolve o usuário logado)

Endpoints do motor de cálculo *(fase 3)*:

- `POST /api/commissions/calculate` — body `{ period }`, calcula/atualiza os resultados de comissão de todos os funcionários ativos com faturamento cadastrado naquele período.
- `GET /api/commissions` — lista resultados (`?period=`, `?employeeId=` opcionais).
- `PATCH /api/commissions/:employeeId/:period/status` — body `{ status }`, avança o status (`pending → approved → paid`).

Validação de payload via `zod` (`src/schemas/`), erros padronizados em `{ error, details? }` pelo `middleware/errorHandler.ts` (400 para validação, 404 para não encontrado, 500 para erro inesperado).

## Autenticação e controle de acesso (fase 6)

- **Sessão**: JWT assinado (`jsonwebtoken`) em cookie httpOnly `token` (`sameSite: "lax"`, `secure` só em produção, 8h de validade). Setado por `POST /api/auth/login`, limpo por `POST /api/auth/logout`. Senha com hash `bcryptjs` (puro JS — evita toolchain de compilação nativa no Windows com `ts-node-dev`).
- **Middlewares** (`apps/api/src/middleware/auth.ts`): `requireAuth` (valida o cookie, popula `req.user = { sub, role }`) e `requireRole(...roles)`, aplicados rota a rota (não globalmente) em cada arquivo de `routes/`. Tudo exige `requireAuth` exceto `/health` e `/api/auth/login`/`logout`. Mutações de employees/invoices/revenue/rules/commissions exigem role `admin`; `/api/users` é admin-only por completo (leitura incluída).
- **CORS**: `app.use(cors())` foi trocado por `cors({ origin: FRONTEND_URL, credentials: true })` — cookie cross-origin não funciona com `origin` wildcard. Requer a env `FRONTEND_URL` (ver `.env.example`).
- **Frontend**: `apps/web/src/proxy.ts` — **nesta versão do Next.js (16.2.10), o arquivo de middleware foi renomeado de `middleware.ts` para `proxy.ts`** (função exportada `proxy`, não `middleware`; ver `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md`). Roda em runtime Node.js por padrão, então usa `jsonwebtoken.verify` direto (mesma lib do backend). Sem sessão válida → redirect para `/login`; role `manager` em `/settings` → redirect para `/dashboard` (reforçado de novo em `settings/page.tsx`, defesa em profundidade).
- `lib/api.ts` (server-only, repassa o cookie via `next/headers` `cookies()`) ficou só com as funções de leitura usadas por Server Components. As mutações (rules/tiers/users) e `login`/`logout` moraram para `lib/apiClient.ts` (`credentials: "include"`) — separação necessária porque um módulo que importa `next/headers` quebra ao ser bundlado para o client.
- `contexts/UserContext.tsx` expõe o usuário logado (buscado uma vez em `layout.tsx` via `lib/session.ts`) para Client Components — usado pela `Sidebar` para esconder "Settings" de managers e mostrar o botão de logout.
- **Seed de senha**: `apps/api/src/scripts/seedPasswords.ts` (`npm run seed:passwords --workspace=apps/api`) define a senha padrão `mudar123` para os usuários fictícios existentes (`admin@commissioning.local`, `manager@commissioning.local`) — ambiente de teste, não usar em produção.

## Frontend (fases 4-5)

- **Next.js 16.2.10 + React 19.2.4** — versão com breaking changes relevantes em relação ao Next.js "clássico" (ver `apps/web/AGENTS.md`, que manda checar `node_modules/next/dist/docs/` antes de mexer no App Router). O que já mudou e foi levado em conta: `params`/`searchParams` de página são `Promise` (nenhuma tela usa ainda, mas vale lembrar nas próximas); `fetch` em Server Components não é cacheado automaticamente nessa versão — por isso `lib/api.ts` usa `cache: "no-store"` explicitamente em toda chamada, garantindo dado sempre fresco independente do modelo de cache ativo no projeto.
- **Padrão de leitura**: cada `app/*/page.tsx` é Server Component, busca direto da API Express via `lib/api.ts` e passa os dados como props para Client Components (`"use client"`) que cuidam de interatividade local (busca/filtro em `EmployeesTable`, gráficos Recharts).
- **Padrão de mutação (fase 5 em diante)**: `RulesEditor`/`UserPermissionsPanel` são os primeiros Client Components a fazer `POST`/`PUT`/`DELETE` — chamam `lib/api.ts` direto contra a API Express (CORS aberto, `app.use(cors())` sem opções) e, após sucesso, chamam `router.refresh()` (`next/navigation`) para re-buscar os dados do Server Component pai. Sem Server Actions, sem lib de estado global.
- **Telas**: `/login` (form email/senha, fase 6), `/dashboard` (KPIs, gráfico de tendência de comissão, top performers, pagamentos recentes), `/employees` (tabela com busca/filtro por department), `/commissions` (KPIs de analytics, gráfico de barras top 5, gráfico de pizza por department, invoices recentes), `/invoices` (tabela simples), `/settings` (editor de `CommissionRule`/`CommissionTier` + painel de `User` — admin-only, com enforcement real desde a fase 6: `proxy.ts` redireciona managers e a própria page reforça o guard).
- **Dívida técnica registrada**: `apps/web/src/types/domain.ts` é uma cópia manual de `apps/api/src/types/domain.ts` (sem pacote compartilhado no monorepo ainda) — ao mudar um, replicar a mudança no outro.

## Testes

- **Framework**: Vitest + Supertest, na `apps/api` (`npm run test --workspace=apps/api` ou `npm test` na raiz).
- Testes ficam colocados junto do código (`*.test.ts` ao lado do arquivo testado): unitários para `lib/jsonStore.ts`, integração (via Supertest contra `app.ts`) para cada grupo de rotas.
- `app.ts` existe separado de `index.ts` justamente para permitir importar o Express app nos testes sem abrir porta.
- Frontend (`apps/web`) ainda não tem testes configurados — entra em fase futura junto das telas.

## Política de Git

- O projeto já é um repositório git (`git init` + primeiro commit feitos na fase 2).
- Hooks do Husky ativos em `.husky/` (`pre-commit` roda `lint-staged`; `pre-push` roda `npm test` e bloqueia o push se algum teste falhar).
- **Push sempre exige aprovação humana explícita** — isso vale tanto para mim (Claude) quanto para qualquer automação futura de CI/CD. O hook `pre-push` é uma rede de segurança extra (testes quebrados nunca sobem), não um substituto da aprovação.

## Roadmap / Fases

Cada fase gera um plano próprio salvo em `plan/`.

1. **`plan/01-setup-inicial.md`** — estrutura de pastas, CLAUDE.md, scaffold do Next.js e do Express, instalação de dependências. ✅
2. **`plan/02-crud-testes-git.md`** — CRUD de Employees, CommissionRules, Invoices sobre os arquivos JSON; testes automatizados (Vitest + Supertest); hooks de Husky preparados. ✅
3. **`plan/03-motor-calculo.md`** — Motor de cálculo de comissão (`services/commissionEngine.ts`), faturamento (`RevenueRecord`/`/api/revenue`), persistência dos resultados com workflow de status (`/api/commissions`) + testes. ✅
4. **`plan/04-frontend-telas.md`** — Frontend: telas Dashboard, Employees, Commissions, Invoices consumindo a API (sidebar, KPIs, gráficos Recharts, tabelas). ✅
5. **`plan/05-settings-permissoes.md`** — Tela Settings: editor de `CommissionRule`/`CommissionTier` (CRUD completo, antes só tinha leitura) + painel de gestão de `User` (CRUD novo, `/api/users`). Primeiras mutações client-side do app. ✅
6. **`plan/06-autenticacao-permissoes.md`** — Autenticação (login via JWT em cookie httpOnly) e controle de acesso por role (admin vs manager), na API (middlewares `requireAuth`/`requireRole`) e no frontend (`proxy.ts`, guard em `/settings`, Sidebar filtrada por role). ✅
7. Migração de JSON para PostgreSQL (com Prisma).
8. Deploy.
9. **CI/CD (GitHub Actions)** — quando o repositório for para o GitHub, workflow que roda `npm test` a cada push/PR, como camada adicional aos hooks locais. O push continua exigindo aprovação humana; o CI só impede merge/deploy com testes quebrados.

## Convenções

- Todo plano de implementação (mesmo os incrementais) é salvo em `plan/NN-titulo.md`, numerado sequencialmente.
- Este `CLAUDE.md` deve ser atualizado sempre que decisões de arquitetura, modelo de dados ou stack mudarem.
- Todo commit liberado para push segue [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `chore:`, `docs:`, `test:`, `refactor:` etc.).
