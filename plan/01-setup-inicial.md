# SaaS de Cálculo de Comissionamento — Plano de Setup Inicial

## Contexto

O objetivo é criar um SaaS que calcula a comissão que cada funcionário recebe ao fim de um período, com base em regras de negócio configuráveis (percentual sobre faturamento, bônus por volume, estrutura em tiers). A plataforma terá dois papéis de acesso:

- **Admin**: cadastra métricas e define as regras de cálculo de comissão (regra base, bônus por volume, tiers, permissões de usuário, integrações).
- **Gestão (manager)**: acompanha dashboards, funcionários, comissões e invoices geradas a partir dessas regras.

As 4 imagens anexadas (`dashboard.png`, `analytics.png`, `Gestão.png`, `configurações globais.png`) mostram a referência visual: um app "Commissioning" dark-theme, com sidebar (Dashboard, Employees, Commissions, Invoices, Settings), KPI cards, gráficos de comissão, tabela de funcionários com tier (Gold/Silver) e status de meta, e um editor de regras de comissão (Base Rule, Volume Bonus, Tiered Structure) + painel de permissões de usuário.

Esta é a **primeira etapa** do projeto: mapear a arquitetura, documentar tudo em `CLAUDE.md`, registrar este e os próximos planos na pasta `plan/`, criar a estrutura de pastas/arquivos e instalar as dependências — sem ainda implementar as features completas (isso será feito em planos/fases seguintes, cada um também salvo em `plan/`).

## Decisões já validadas com o usuário

| Decisão | Escolha |
|---|---|
| Frontend | **Next.js (React + TypeScript)** + Tailwind CSS |
| Backend | **Express + TypeScript** |
| Persistência | **JSON local** agora (arquivos em `apps/api/data/`), com migração planejada para **PostgreSQL** depois |
| Autenticação/Autorização | **Uma aplicação única**, com **roles** (`admin` vs `manager`) controlando o que cada um vê/edita — não dois apps separados |

## Estrutura de pastas proposta

```
Projeto Piloto/
├── CLAUDE.md                 # documentação viva do projeto
├── plan/                     # todo plano criado (este e os futuros) fica salvo aqui
│   └── 01-setup-inicial.md
├── package.json               # root com npm workspaces (apps/*)
├── .gitignore
├── .env.example
└── apps/
    ├── web/                   # Next.js (TS) + Tailwind — frontend admin + gestão
    │   ├── src/
    │   │   ├── app/           # App Router (Next 14+): /dashboard, /employees, /commissions, /invoices, /settings
    │   │   ├── components/
    │   │   ├── lib/           # client de API, helpers
    │   │   └── types/         # tipos compartilhados de domínio (Employee, CommissionRule, etc.)
    │   ├── tailwind.config.ts
    │   └── package.json
    └── api/                   # Express (TS) — backend
        ├── src/
        │   ├── routes/        # /employees, /commissions, /rules, /invoices, /auth
        │   ├── controllers/
        │   ├── services/      # motor de cálculo de comissão
        │   ├── data/          # employees.json, rules.json, invoices.json, users.json
        │   ├── middleware/    # auth/role-guard (placeholder por enquanto)
        │   └── index.ts
        ├── tsconfig.json
        └── package.json
```

Uso de **npm workspaces** na raiz para instalar e rodar `web` e `api` com um único `npm install`, mantendo os dois projetos desacoplados dentro do monorepo.

## Modelo de dados (documentado no CLAUDE.md)

- **Employee**: `id, code, name, role (cargo), department, baseSalary, tier (Gold/Silver), status`
- **RevenueRecord**: `employeeId, period (YYYY-MM), revenueAmount` — faturamento do funcionário no período
- **CommissionRule**: `id, name, type (base | volumeBonus | tiered), scope (department | role | global), percentage, threshold` — regras configuráveis pelo admin
- **CommissionTier**: `ruleId, tierName, minRevenue, maxRevenue, percentage` — faixas da estrutura em tiers
- **CommissionResult** (calculado): `employeeId, period, baseSalary, revenue, appliedRules[], commissionAmount, totalPay, status (pending/approved/paid)`
- **Invoice**: `id, employeeId, period, amount, status, dueDate, paidDate`
- **User** (auth): `id, name, email, passwordHash, role (admin/manager), employeeId?`

Fórmula de comissão (motor a ser implementado em fase futura, documentada agora como referência):
`comissão = (base% × faturamento) + (faturamento > limiteVolume ? bônusVolume% × faturamento : 0) + cálculoPorTiers(faturamento)`

## O que será feito nesta etapa (execução após aprovação do plano)

1. **Criar a pasta `plan/` na raiz do projeto e salvar este plano, na íntegra, como `plan/01-setup-inicial.md`** — é o primeiro arquivo a ser gravado no projeto, servindo de registro histórico e de referência para a execução. Todo plano futuro (fase 2, fase 3...) seguirá o mesmo padrão: `plan/02-...md`, `plan/03-...md`, etc.
2. Criar `CLAUDE.md` na raiz com: visão geral, papéis, modelo de dados, regras de negócio, stack, estrutura de pastas, comandos de desenvolvimento e roadmap de fases (cada fase referenciando seu arquivo em `plan/`).
3. Criar `apps/web` com Next.js + TypeScript + Tailwind (scaffold via `create-next-app` com flags não-interativas: TS, Tailwind, App Router, sem `src/` fora do padrão, ESLint).
4. Criar `apps/api` com Express + TypeScript: `package.json`, `tsconfig.json`, `src/index.ts` com um servidor mínimo (`/health`), estrutura de pastas `routes/controllers/services/data/middleware`, e os arquivos JSON iniciais (`employees.json`, `rules.json`, `invoices.json`, `users.json`) com alguns dados fictícios baseados nas imagens (ex.: Ana Silva, Carlos Santos etc.) para já ter algo visível no dashboard depois.
5. Configurar `package.json` raiz com npm workspaces e scripts (`dev`, `dev:web`, `dev:api`).
6. Instalar dependências:
   - **web**: `next react react-dom typescript @types/react @types/node tailwindcss postcss autoprefixer eslint eslint-config-next` (+ `recharts` para os gráficos de comissão/analytics, já que as imagens mostram line/bar/pie charts)
   - **api**: `express cors dotenv zod uuid` + dev: `typescript ts-node-dev @types/express @types/node @types/cors @types/uuid`
7. Criar `.gitignore` (node_modules, .env, .next, dist) e `.env.example` com placeholders (porta da API, JWT secret placeholder para fase de auth futura).

## Fora de escopo nesta etapa (fica para próximos planos, cada um em `plan/`)

- Implementação real do motor de cálculo de comissão
- Autenticação/login funcional e proteção de rotas por role
- Telas completas (Dashboard, Employees, Commissions, Invoices, Settings) com dados reais vindos da API
- Migração de JSON para PostgreSQL

## Verificação

- `npm install` na raiz completa sem erros e cria `node_modules` compartilhado.
- `npm run dev:api` sobe o Express e `GET http://localhost:<porta>/health` responde 200.
- `npm run dev:web` sobe o Next.js em modo dev e a página inicial carrega no navegador sem erro de build, com Tailwind aplicando estilos (testar com uma classe utilitária visível).
- `CLAUDE.md` e `plan/01-setup-inicial.md` existem e refletem fielmente o que foi decidido.
