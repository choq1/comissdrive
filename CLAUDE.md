# CLAUDE.md — SaaS de Cálculo de Comissionamento

Este arquivo documenta o projeto para consulta em qualquer sessão futura. Mantenha-o atualizado conforme o projeto evolui.

## Visão geral

SaaS que calcula automaticamente a comissão que cada funcionário recebe ao fim de um período, com base em regras de negócio configuráveis pelo administrador (percentual sobre faturamento, bônus por volume, estrutura em tiers).

Dois papéis de acesso, na mesma aplicação (controlados por `role`):

- **Admin**: cadastra métricas (funcionários, faturamento) e define as regras de cálculo de comissão. Acessa também permissões de usuário e integrações (Salesforce, Stripe, Slack).
- **Manager / Gestão**: acompanha dashboards, funcionários, comissões e invoices geradas a partir das regras definidas pelo admin.

Referência visual (pasta raiz do projeto): `dashboard.png`, `analytics.png`, `Gestão.png`, `configurações globais.png` — app "Commissioning", dark-theme, sidebar com Dashboard / Employees / Commissions / Invoices / Settings.

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
│   └── 04-frontend-telas.md
├── package.json                # root, npm workspaces
├── .husky/                     # hooks de git (pre-commit, pre-push) — prontos, ativam ao rodar `git init`
├── .gitignore
├── .env.example
└── apps/
    ├── web/                    # Next.js + Tailwind — frontend (admin + gestão)
    │   └── src/
    │       ├── app/            # rotas: /dashboard, /employees, /commissions, /invoices (Settings entra na fase 5)
    │       ├── components/
    │       │   ├── layout/     # Sidebar, PageHeader
    │       │   ├── ui/         # KpiCard, StatusBadge, DataTable (genéricos, reaproveitados pelas 4 telas)
    │       │   ├── dashboard/  # CommissionGrowthChart, TopPerformers
    │       │   ├── employees/  # EmployeesTable (busca + filtro client-side)
    │       │   └── commissions/# TopCommissionedBarChart, DepartmentPieChart
    │       ├── lib/            # api.ts (fetch tipado por entidade, cache: "no-store"), format.ts
    │       └── types/          # domain.ts — cópia manual do domain.ts da API (ver nota de dívida técnica abaixo)
    └── api/                    # Express — backend
        └── src/
            ├── app.ts          # cria o Express app (usado também nos testes)
            ├── index.ts        # entrypoint: só chama app.listen
            ├── routes/         # employees, invoices, rules (+ *.test.ts colocados)
            ├── controllers/
            ├── services/       # CRUD sobre os JSON + commissionEngine.ts (motor de cálculo) + commissionResultService.ts (persistência/workflow)
            ├── schemas/        # validação zod por entidade
            ├── lib/            # jsonStore.ts (leitura/escrita), crudRepository.ts (fábrica de CRUD)
            ├── data/           # employees.json, rules.json, invoices.json, revenue.json, commissionResults.json, users.json
            └── middleware/     # errorHandler.ts (+ auth/role-guard na fase 6)
```

## Modelo de dados

- **Employee**: `id, code, name, role (cargo), department, baseSalary, tier (Gold/Silver), status`
- **RevenueRecord**: `id, employeeId, period (YYYY-MM), revenueAmount` — faturamento do funcionário no período, cadastrado pelo admin
- **CommissionRule**: `id, name, type (base | volumeBonus | tiered), scope (department | role | global), appliesTo (valor alvo do scope, ex: "Sales"; null quando scope=global), percentage, threshold`
- **CommissionTier**: `ruleId, tierName, minRevenue, maxRevenue, percentage` — faixas de uma regra `type: "tiered"`
- **CommissionResult** (calculado, persistido): `employeeId, period, baseSalary, revenue, appliedRules[], commissionAmount, totalPay, status (pending/approved/paid)`
- **Invoice**: `id, employeeId, period, amount, status, dueDate, paidDate`
- **User** (auth): `id, name, email, passwordHash, role (admin/manager), employeeId?`

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
- `/api/rules` (+ `/api/rules/tiers` para listar a estrutura de tiers)
- `/api/revenue` *(fase 3)*

Endpoints do motor de cálculo *(fase 3)*:

- `POST /api/commissions/calculate` — body `{ period }`, calcula/atualiza os resultados de comissão de todos os funcionários ativos com faturamento cadastrado naquele período.
- `GET /api/commissions` — lista resultados (`?period=`, `?employeeId=` opcionais).
- `PATCH /api/commissions/:employeeId/:period/status` — body `{ status }`, avança o status (`pending → approved → paid`).

Validação de payload via `zod` (`src/schemas/`), erros padronizados em `{ error, details? }` pelo `middleware/errorHandler.ts` (400 para validação, 404 para não encontrado, 500 para erro inesperado).

## Frontend (fase 4)

- **Next.js 16.2.10 + React 19.2.4** — versão com breaking changes relevantes em relação ao Next.js "clássico" (ver `apps/web/AGENTS.md`, que manda checar `node_modules/next/dist/docs/` antes de mexer no App Router). O que já mudou e foi levado em conta: `params`/`searchParams` de página são `Promise` (nenhuma tela desta fase usa ainda, mas vale lembrar nas próximas); `fetch` em Server Components não é cacheado automaticamente nessa versão — por isso `lib/api.ts` usa `cache: "no-store"` explicitamente em toda chamada, garantindo dado sempre fresco independente do modelo de cache ativo no projeto.
- **Padrão de dados**: cada `app/*/page.tsx` é Server Component, busca direto da API Express via `lib/api.ts` e passa os dados como props para Client Components (`"use client"`) que só cuidam de interatividade local (busca/filtro em `EmployeesTable`, gráficos Recharts). Sem chamadas à API do lado do cliente nesta fase.
- **Telas**: `/dashboard` (KPIs, gráfico de tendência de comissão, top performers, pagamentos recentes), `/employees` (tabela com busca/filtro por department), `/commissions` (KPIs de analytics, gráfico de barras top 5, gráfico de pizza por department, invoices recentes), `/invoices` (tabela simples). `/settings` aparece na sidebar mas fica desabilitada até a fase 5.
- **Dívida técnica registrada**: `apps/web/src/types/domain.ts` é uma cópia manual de `apps/api/src/types/domain.ts` (sem pacote compartilhado no monorepo ainda) — ao mudar um, replicar a mudança no outro.

## Testes

- **Framework**: Vitest + Supertest, na `apps/api` (`npm run test --workspace=apps/api` ou `npm test` na raiz).
- Testes ficam colocados junto do código (`*.test.ts` ao lado do arquivo testado): unitários para `lib/jsonStore.ts`, integração (via Supertest contra `app.ts`) para cada grupo de rotas.
- `app.ts` existe separado de `index.ts` justamente para permitir importar o Express app nos testes sem abrir porta.
- Frontend (`apps/web`) ainda não tem testes configurados — entra em fase futura junto das telas.

## Política de Git

- O projeto **ainda não é um repositório git** (fica para uma fase futura fazer `git init` + primeiro commit).
- Hooks do Husky já estão preparados em `.husky/` (`pre-commit` roda `lint-staged`; `pre-push` roda `npm test` e bloqueia o push se algum teste falhar) — eles ativam sozinhos assim que o repositório for inicializado e `npm install` rodar novamente (script `prepare`).
- **Push sempre exige aprovação humana explícita** — isso vale tanto para mim (Claude) quanto para qualquer automação futura de CI/CD. O hook `pre-push` é uma rede de segurança extra (testes quebrados nunca sobem), não um substituto da aprovação.

## Roadmap / Fases

Cada fase gera um plano próprio salvo em `plan/`.

1. **`plan/01-setup-inicial.md`** — estrutura de pastas, CLAUDE.md, scaffold do Next.js e do Express, instalação de dependências. ✅
2. **`plan/02-crud-testes-git.md`** — CRUD de Employees, CommissionRules, Invoices sobre os arquivos JSON; testes automatizados (Vitest + Supertest); hooks de Husky preparados. ✅
3. **`plan/03-motor-calculo.md`** — Motor de cálculo de comissão (`services/commissionEngine.ts`), faturamento (`RevenueRecord`/`/api/revenue`), persistência dos resultados com workflow de status (`/api/commissions`) + testes. ✅
4. **`plan/04-frontend-telas.md`** — Frontend: telas Dashboard, Employees, Commissions, Invoices consumindo a API (sidebar, KPIs, gráficos Recharts, tabelas). ✅ *(atual)*
5. Frontend: tela Settings (editor de regras) + painel de permissões de usuário.
6. Autenticação (login, JWT ou sessão) e controle de acesso por role (admin vs manager).
7. Migração de JSON para PostgreSQL (com Prisma).
8. Deploy.
9. **CI/CD (GitHub Actions)** — quando o repositório for para o GitHub, workflow que roda `npm test` a cada push/PR, como camada adicional aos hooks locais. O push continua exigindo aprovação humana; o CI só impede merge/deploy com testes quebrados.

## Convenções

- Todo plano de implementação (mesmo os incrementais) é salvo em `plan/NN-titulo.md`, numerado sequencialmente.
- Este `CLAUDE.md` deve ser atualizado sempre que decisões de arquitetura, modelo de dados ou stack mudarem.
