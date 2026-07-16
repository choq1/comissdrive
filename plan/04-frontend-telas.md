# Fase 4 — Frontend: Dashboard, Employees, Commissions, Invoices

## Contexto

A API (fases 1-3) já tem CRUD completo + motor de cálculo de comissão funcionando e testado. O frontend (`apps/web`) ainda é o scaffold padrão do `create-next-app` — só existem `lib/api.ts` (helper de fetch) e `types/domain.ts` (cópia dos tipos da API), sem nenhuma tela real. Esta fase conecta o frontend à API e entrega as 4 telas principais do roadmap (Settings fica para a fase 5, junto do editor de regras e permissões).

**Atenção de versão**: `apps/web/AGENTS.md` avisa que o Next.js 16.2.10 + React 19.2.4 instalados têm breaking changes em relação ao Next.js "clássico". Confirmei na doc local (`node_modules/next/dist/docs/01-app/`):
- `params`/`searchParams` de `page.tsx`/`layout.tsx` são **Promises** — sempre `await`.
- `fetch` em Server Components **não é cacheado por padrão** nesta versão (modelo antigo de cache automático não se aplica) — mesmo assim, vamos ser explícitos com `cache: "no-store"` em `lib/api.ts` para garantir dado sempre fresco, independente do modelo de cache ativo.
- Convenções de arquivo (`page.tsx`, `layout.tsx`, `loading.tsx`) continuam as mesmas.

Decisões validadas com o usuário:
- Vou expandir o seed de dados para **3 períodos** (`2024-03`, `2024-04`, `2024-05`) em `revenue.json`, recalculados via `commissionResultService.calculateForPeriod` para cada um — dá um gráfico de tendência real no dashboard, tudo gerado pelo motor de cálculo (nada hardcoded no frontend).
- Testes de frontend (Vitest + React Testing Library) ficam para uma **fase futura dedicada** — não entram nesta fase.

## Preparação de dados (antes das telas)

- `apps/api/src/data/revenue.json`: adicionar registros para `2024-03` e `2024-04` (mesmos 7 employees, valores variados mas plausíveis, alguns cruzando o threshold de $50k para exercitar volume bonus/tiers em mais de um período).
- Rodar `commissionResultService.calculateForPeriod` para os 3 períodos (via endpoint `POST /api/commissions/calculate` com o servidor local, ou um script pontual) para popular `commissionResults.json` — esse arquivo passa a ter dado seed permanente (deixa de ser resetado para `[]`).
- `apps/web/src/types/domain.ts`: sincronizar com `apps/api/src/types/domain.ts` (adicionar `id` em `RevenueRecord`, `appliesTo` em `CommissionRule`, `threshold: number | null` sem `optional`). Mantém a duplicação manual já existente entre os dois `types/domain.ts` (não vou criar um pacote compartilhado agora — fora de escopo, mas registro como dívida técnica no `CLAUDE.md`).

## Nova dependência: ícones

Adicionar `lucide-react` (leve, tree-shakeable, sem config extra) para os ícones da sidebar/topbar/badges, batendo com os ícones das imagens de referência (`dashboard.png` etc.).

## Estrutura de telas (App Router)

```
apps/web/src/
├── app/
│   ├── layout.tsx            # root layout: shell fixo (Sidebar + Topbar) envolvendo {children}, tema dark por padrão
│   ├── page.tsx               # redirect("/dashboard") via next/navigation
│   ├── dashboard/page.tsx     # Server Component
│   ├── employees/page.tsx     # Server Component
│   ├── commissions/page.tsx   # Server Component
│   └── invoices/page.tsx      # Server Component
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx        # nav Dashboard/Employees/Commissions/Invoices/Settings ("use client", usePathname p/ estado ativo; Settings desabilitado/"em breve" até fase 5)
│   │   └── Topbar.tsx
│   ├── ui/
│   │   ├── KpiCard.tsx
│   │   ├── StatusBadge.tsx    # pending/approved/paid e invoice status
│   │   └── DataTable.tsx      # tabela genérica simples (thead/tbody + estilos), reaproveitada pelas 4 telas
│   ├── dashboard/
│   │   ├── CommissionGrowthChart.tsx  # "use client", recharts AreaChart
│   │   └── TopPerformers.tsx
│   ├── employees/
│   │   └── EmployeesTable.tsx  # "use client": busca por nome + filtro por department sobre os dados já carregados (sem nova chamada à API)
│   └── commissions/
│       ├── TopCommissionedBarChart.tsx  # "use client", recharts BarChart
│       └── DepartmentPieChart.tsx        # "use client", recharts PieChart
└── lib/
    └── api.ts                 # ganha funções tipadas: getEmployees(), getInvoices(), getCommissionResults(params), getRevenue(), getCommissionRules()
```

Padrão de dados: cada `page.tsx` é Server Component, faz `fetch` direto para a API Express (`lib/api.ts`, sempre `cache: "no-store"`) e passa os dados como props para Client Components que cuidam só de interatividade (filtro, gráfico). Sem chamadas à API do lado do cliente nesta fase — mantém simples e sem necessidade de loading states complexos.

## Conteúdo por tela (baseado nas imagens de referência)

- **Dashboard** (`dashboard.png`): KPI cards (Total Commissions Paid = soma de `commissionAmount` com status `paid`; Monthly Sales Target = estático por enquanto, não há endpoint de metas ainda — vira nota no código); `CommissionGrowthChart` somando `commissionAmount` por período de `commissionResults`; `TopPerformers` (top employees por `commissionAmount` no período mais recente); tabela "Recent Commission Payments" (últimos `commissionResults` com status `paid`, join com nome do employee).
- **Employees** (`Gestão.png`): tabela de `/api/employees` com busca e filtro por department (client-side), coluna "Current Commission" vindo do `commissionResults` do período mais recente para aquele employee (0 se não houver).
- **Commissions** (`analytics.png`): KPI cards (Total Paid This Month, Pending Invoices Count, Average Commission Rate = média de `commissionAmount/revenue` do período), `TopCommissionedBarChart` (top 5 employees por comissão), `DepartmentPieChart` (soma de comissão agrupada por department do employee), tabela "Recent Invoices" reaproveitando `/api/invoices`.
- **Invoices**: tabela simples de `/api/invoices` com `StatusBadge` (pending/approved/paid) — tela mais enxuta, sem gráficos.

## Arquivos a criar/editar (resumo)

- **Novos**: todos os `components/*` listados acima, `app/dashboard/page.tsx`, `app/employees/page.tsx`, `app/commissions/page.tsx`, `app/invoices/page.tsx`.
- **Editados**: `app/layout.tsx` (shell + metadata "Commissioning"), `app/page.tsx` (redirect), `app/globals.css` (ajustar paleta dark se necessário além do que o Tailwind já resolve), `lib/api.ts` (funções tipadas + `cache: "no-store"`), `types/domain.ts` (sync com a API), `apps/web/package.json` (dependência `lucide-react`), `apps/api/src/data/revenue.json` (+2 períodos), `apps/api/src/data/commissionResults.json` (seed calculado, deixa de ser resetado para `[]`), `CLAUDE.md` (roadmap fase 4 concluída, nota sobre duplicação de tipos como dívida técnica).

## Fora de escopo

- Tela de Settings / editor de regras / permissões de usuário (fase 5).
- Autenticação e guarda de rotas por role (fase 6) — todas as telas ficam abertas por enquanto.
- Testes de frontend (fase futura dedicada, conforme decidido).
- Formulários de criação/edição (ex: "Add New Employee") — esta fase é leitura/visualização; escrita pelo frontend entra quando Settings/CRUD via UI forem endereçados.

## Verificação

- `npm run dev:api` + `npm run dev:web` rodando juntos; navegar `/dashboard`, `/employees`, `/commissions`, `/invoices` no browser e conferir que os dados batem com o que a API retorna (comparar com `curl`/testes já existentes).
- `npm run build --workspace=apps/web` sem erros de tipo (garante que os Server Components com `params`/`searchParams` como Promise estão corretos).
- `npm run test --workspace=apps/api` continua verde (a expansão do seed não deve quebrar os testes existentes — os testes de `commissionResultService`/`commissions.routes` usam períodos próprios e já limpam depois de si).
- Conferir visualmente que a sidebar, KPI cards e gráficos batem com a estética das imagens de referência (dark theme, mesma disposição geral).
