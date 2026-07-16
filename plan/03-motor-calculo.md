# Fase 3 — Motor de Cálculo de Comissão

## Contexto

As fases 1 e 2 já entregaram o scaffold (Next.js + Express) e o CRUD de Employees/CommissionRules/Invoices sobre JSON, com testes (Vitest+Supertest) e hooks de Husky preparados (`plan/01-setup-inicial.md`, `plan/02-crud-testes-git.md`). Falta a peça central do produto: o cálculo de comissão em si (`comissão = base% × faturamento + bônusVolume + tiers`, já descrito em `CLAUDE.md`).

Ao mapear os dados existentes para implementar isso, dois gaps de modelo apareceram e foram decididos com o usuário:

1. **Não existe faturamento (revenue) em lugar nenhum** — `employees.json` só tem `baseSalary`. Sem faturamento por período não há o que calcular. → Criar `revenue.json` (`RevenueRecord`) com CRUD próprio, alimentado pelo admin (bate com o `CLAUDE.md`: "Admin cadastra métricas... faturamento").
2. **`CommissionRule` não sabe a quem se aplica** — tem `scope` (`department`/`role`/`global`) mas nenhum campo com o valor alvo (ex: "Sales"). → Adicionar `appliesTo: string | null` (null para `scope: "global"`).

Também: `rules.json` tem tiers apontando para `rule_tiered_sales`, mas essa regra não existe no array `rules` — é preciso criar essa regra que falta.

Decisões validadas com o usuário:
- Tiers são **progressivos** (estilo faixa de IR): cada faixa de faturamento paga sua própria %, evitando saltos ao cruzar um limite.
- O resultado do cálculo é **persistido** em `commissionResults.json` com fluxo de status `pending → approved → paid` (bate com o campo `status` já previsto em `CommissionResult` e com as telas de referência que mostram histórico).

## Modelo de dados (ajustes)

Em `apps/api/src/types/domain.ts`:
- `RevenueRecord` ganha `id: string`.
- `CommissionRule` ganha `appliesTo: string | null`.

Em `apps/api/src/data/rules.json`:
- `rule_base_sales` e `rule_volume_sales` ganham `"appliesTo": "Sales"`.
- Nova regra `rule_tiered_sales` (`type: "tiered"`, `scope: "department"`, `appliesTo: "Sales"`, `percentage: 0`, `threshold: null`) — o percentual real vem dos `tiers` já existentes, não do campo `percentage` da regra tiered.

Novo `apps/api/src/data/revenue.json`: um `RevenueRecord` por employee para o período `2024-05` (dado fictício, seguindo o padrão dos outros seeds), incluindo pelo menos um valor acima de $50k (ex: Ana Silva) para exercitar volume bonus + tiers nos testes.

Novo `apps/api/src/data/commissionResults.json`: `[]` inicialmente.

## Motor de cálculo — `services/commissionEngine.ts`

Função pura, sem I/O, fácil de testar:

```
calculateCommission(employee, revenueAmount, rules, tiers) → { commissionAmount, appliedRules[] }
```

- `ruleMatches(rule, employee)`: `global` sempre casa; `department`/`role` casam se `rule.appliesTo === employee.department|role`.
- `base` = soma de `percentage% × revenueAmount` das regras `type: "base"` aplicáveis.
- `volumeBonus` = soma de `percentage% × revenueAmount` das regras `type: "volumeBonus"` aplicáveis **cujo `revenueAmount > threshold`**.
- `tiered` = para cada regra `type: "tiered"` aplicável, soma progressiva sobre os `tiers` daquela regra (`ruleId`): cada faixa `[minRevenue, maxRevenue)` tributa só a parte do faturamento dentro dela pela sua `percentage`.
- `commissionAmount = base + volumeBonus + tiered`; `appliedRules` = ids das regras que contribuíram (> 0).
- `totalPay = employee.baseSalary + commissionAmount`.

## Persistência e workflow — `services/commissionResultService.ts`

- `calculateForPeriod(period)`: para cada employee ativo com `RevenueRecord` nesse período, roda `commissionEngine` e faz upsert em `commissionResults.json` com `status: "pending"`. **Resultados já `approved` ou `paid` não são recalculados/sobrescritos** (congelados, como uma invoice fechada).
- `list({ period?, employeeId? })`: lista/filtra resultados.
- `updateStatus(employeeId, period, newStatus)`: só permite transição sequencial `pending → approved → paid`; qualquer outra combinação retorna 400 (`HttpError`, reaproveitando `middleware/errorHandler.ts`).

## Endpoints novos

- `/api/revenue` — CRUD padrão (GET lista, GET id, POST, PUT, DELETE), via `createCrudRepository` (mesma fábrica de `lib/crudRepository.ts` usada por employees/invoices), validado por `schemas/revenue.schema.ts`.
- `/api/commissions`:
  - `GET /` — lista resultados (query `?period=`, `?employeeId=`).
  - `POST /calculate` — body `{ period }`, roda `calculateForPeriod`, retorna os resultados daquele período.
  - `PATCH /:employeeId/:period/status` — body `{ status }` validado por `schemas/commissionStatus.schema.ts`, aplica a transição.

Seguem o mesmo padrão de `controllers/employeeController.ts` e `routes/employees.routes.ts` já existentes; montados em `routes/index.ts` junto dos demais.

## Testes (Vitest, colocados como já é o padrão do projeto)

- `services/commissionEngine.test.ts` — unitário, cobre: só base; base + volume bonus (acima/abaixo do threshold); base + volume bonus + tiers progressivos (validar o exemplo dos $80k → $2.500 + $6.000 de tiers); regra que não casa com o employee é ignorada.
- `services/commissionResultService.test.ts` — unitário/integração leve: calcula, recalcula (idempotente para `pending`), não sobrescreve `approved`/`paid`, valida transições de status inválidas.
- `routes/revenue.routes.test.ts` e `routes/commissions.routes.test.ts` — integração via Supertest, mesmo padrão dos testes já existentes (`employees.routes.test.ts`).

## Arquivos a criar/editar (resumo)

- **Novos**: `data/revenue.json`, `data/commissionResults.json`, `schemas/revenue.schema.ts`, `schemas/commissionStatus.schema.ts`, `services/commissionEngine.ts` (+teste), `services/revenueService.ts`, `services/commissionResultService.ts` (+teste), `controllers/revenueController.ts`, `controllers/commissionController.ts`, `routes/revenue.routes.ts`, `routes/commissions.routes.ts` (+testes).
- **Editados**: `types/domain.ts` (RevenueRecord.id, CommissionRule.appliesTo), `data/rules.json` (appliesTo + regra tiered faltante), `routes/index.ts` (montar `/api/revenue` e `/api/commissions`), `CLAUDE.md` (modelo de dados atualizado, endpoints novos, roadmap fase 3 concluída), `plan/03-motor-calculo.md` (este plano salvo).

## Fora de escopo

- Telas do frontend (fase 4).
- Autenticação/roles reais (fase 6) — endpoints continuam sem guarda de acesso por enquanto.
- Qualquer ação de git (push, commit) — segue a política já registrada no `CLAUDE.md`.

## Verificação

- `npm run test --workspace=apps/api` (ou `npm test` na raiz): toda a suíte, incluindo os novos testes do motor de cálculo, passa.
- Fluxo manual via curl/Supertest: `POST /api/revenue` cadastra faturamento → `POST /api/commissions/calculate` com o período → `GET /api/commissions?period=...` mostra o resultado com `status: "pending"` → `PATCH .../status` para `approved` depois `paid`, confirmando que uma segunda chamada a `/calculate` não sobrescreve um resultado já `paid`.
- `npm run dev:api` continua subindo normalmente e `/health` responde.
