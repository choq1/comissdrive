# Plano 12 — Módulo de Vendas (Faturamento por item)

## Objetivo

Evoluir o faturamento de "um número agregado por funcionário/período, sem tela própria" para uma base de **vendas granulares** (venda bruta, líquida, data, loja, item), com uma tela de gestão de faturamento (`/revenue`), ranking de itens mais vendidos, e o botão de cálculo de comissão que nunca existiu na UI.

## O que existia antes (motivo do plano)

Ao testar a importação de Faturamento (Fase 11), ficou uma dúvida legítima do usuário: "pra onde vai isso?". A resposta era que `RevenueRecord` nunca teve tela própria — só alimentava `commissionResultService.calculateForPeriod`, disparado por `POST /api/commissions/calculate`, que por sua vez **não tinha nenhum gatilho na UI** (endpoint só chamável por fora). O dado importado literalmente desaparecia do ponto de vista do usuário.

## O que foi feito

### Modelo de dados

- **Novo modelo `Sale`**: `id, employeeId, date (YYYY-MM-DD), period (YYYY-MM, derivado de date), store, itemDescription, itemSku?, quantity, grossAmount, netAmount`. Índices em `(employeeId, period)` e `itemDescription`.
- **`RevenueRecord` ganhou `@@unique([employeeId, period])`** — antes nada impedia duas linhas para o mesmo par (a Fase 11 já tinha gerado isso via reimportação repetida em teste manual). Antes de aplicar a migration, foram limpos no banco de dev: 12 linhas duplicadas e 2 linhas com `employeeId` inválido (um nome de pessoa em vez de um id — ver bug abaixo).
- Migration `20260725234203_add_sale_and_revenue_unique` — aplicada via `prisma migrate diff` + `migrate deploy` (não interativo), já que `prisma migrate dev` recusa rodar em ambiente sem TTY quando há um aviso de possível perda de dado a confirmar.

### Bug encontrado e corrigido: `employeeId` não validado no commit de import

Durante o teste manual da Fase 11, uma correção feita direto na tela de prévia (digitar um valor no lugar de "Funcionário") não passava pela mesma resolução de código→id que a planilha original passava — o commit só revalidava tipo/formato, não se o funcionário existia. Isso deixou passar um `RevenueRecord` com `employeeId: "Gabriel Herculano Silva"` (um nome, não um id). Corrigido em `apps/api/src/services/importService.ts`: o commit agora roda o mesmíssimo pipeline `coerce → resolveRow → schema` do preview (via `buildImportConfigs()`), então uma correção manual inválida é barrada nos dois lugares, não só na planilha.

### Backend

- `apps/api/src/schemas/sale.schema.ts`, `apps/api/src/services/saleService.ts` (CRUD via `createCrudRepository`).
- `apps/api/src/services/revenueAggregationService.ts` — `recomputeRevenueForPairs(pairs)`: soma `Sale.netAmount` por par funcionário/período e faz `upsert` em `RevenueRecord`. Chamado depois de toda mutação em `Sale` (CRUD manual em `saleController.ts` e commit de import da entidade `sale` em `importService.ts`).
- `apps/api/src/routes/sales.routes.ts` — CRUD (leitura admin+manager, mutação admin-only) + `GET /api/sales/ranking` (agregação via `prisma.sale.groupBy`, filtros `?period=&store=&employeeId=`).
- `apps/api/src/schemas/importConfigs.ts` — 4ª entidade `sale` no sistema de import da Fase 11 (cabeçalhos PT-BR: Funcionário/Data/Loja/Descrição do item/Código do item/Quantidade/Venda bruta/Venda líquida), reaproveitando `createEmployeeResolver()`. Nova função `toDate()` (aceita `DD/MM/AAAA` e ISO). `period` nunca é uma coluna própria — é sempre derivado de `date`.
- `apps/api/src/controllers/saleController.ts` — no CRUD manual, `period` também é sempre derivado de `date` no servidor (o formulário não pede esse campo).
- `RevenueRecord` agora **sempre** é gravado via `upsert` (tanto no commit de import da entidade `revenue` quanto na agregação de `Sale`), nunca `create` puro — necessário depois da unique constraint. `revenueController.create` (entrada manual single-record) trata conflito de unicidade com 409 em vez de deixar estourar 500.
- Endpoint de cálculo de comissão (`POST /api/commissions/calculate`) não mudou — só ganhou finalmente um consumidor na UI.

### Frontend

- Nova tela **`/revenue`** (visível a admin e manager, mutações admin-only): KPIs (venda líquida/bruta total e ticket médio do período mais recente), `SalesTable.tsx` (CRUD completo de `Sale`, mesmo padrão de `EmployeesTable.tsx`), `ItemRankingTable.tsx` (ranking do período mais recente), `CalculateCommissionsPanel.tsx` (admin-only — período + botão, chama `POST /api/commissions/calculate`).
- Novo item de Sidebar `/revenue` ("Faturamento"/"Revenue"), não `adminOnly`.
- `BulkImportPanel.tsx` ganhou a opção "Vendas" no seletor de entidade.
- `lib/api.ts` (`getSales`, `getItemRanking`), `apiClient.ts` (`createSale`/`updateSale`/`deleteSale`, `calculateCommissions`).
- `types/domain.ts` (api e web): `Sale`, `ItemRankingRow`.
- `lib/i18n/dictionaries.ts`: nova seção `revenue` (PT-BR/EN) + `settings.imports.entitySale`/campos de venda.

### Testes

- `revenueAggregationService.test.ts` — soma correta, upsert não duplica linha, zera quando não há mais vendas, dedupe de pares repetidos.
- `sales.routes.test.ts` — CRUD completo com verificação de que `RevenueRecord` é recalculado a cada mutação; ranking agregado.
- `imports.routes.test.ts` — fluxo preview→commit da entidade `sale` com recompute de `RevenueRecord`; teste de regressão do bug de `employeeId` não validado no commit.

## Verificação

- `npm test` — 63 testes passando.
- `npx tsc --noEmit` limpo em `apps/api` e `apps/web`; `npm run build --workspace=apps/web` limpo.
- Fluxo ponta a ponta validado via HTTP direto: criar venda → `RevenueRecord` recalculado → ranking correto → excluir venda → `RevenueRecord` zera.

## Nota de design registrada em `guia/07-vendas-e-faturamento.md`

Se um `RevenueRecord` for cadastrado por outro caminho (import direto de "Faturamento", ou o formulário manual antigo) e depois uma venda for lançada pro mesmo par funcionário/período, o valor da venda **sobrescreve** o que estava lá — os dois caminhos não coexistem harmoniosamente pro mesmo período, o último a escrever vence.

## Ajuste pós-entrega: painel de import movido de Settings pra Faturamento

Depois de entregue, o usuário testou a importação em Configurações e relatou que "não integrava em lugar nenhum" — não era um bug (o commit gravava certo, os testes cobriam isso), mas sim uma desconexão de UX: importar em Configurações e ter que navegar até outra tela pra conferir o resultado dava a impressão de que nada tinha acontecido. Movido a pedido do usuário:

- `apps/web/src/components/settings/BulkImportPanel.tsx` → `apps/web/src/components/revenue/BulkImportPanel.tsx`, removido de `apps/web/src/app/settings/page.tsx` e adicionado em `apps/web/src/app/revenue/page.tsx` (ao lado do painel de "Calcular comissões", ambos admin-only).
- Dicionário `dict.settings.imports` → `dict.revenue.imports` (PT-BR/EN) — mesmas chaves, só trocou de seção.
- Entidade padrão do seletor mudou de `employee` pra `sale`, já que o painel agora vive na tela de Faturamento (mais provável ser o caso de uso mais comum ali).
- Nenhuma mudança de backend — as rotas `/api/imports/*` continuam as mesmas.

## Próximos passos

`plan/13-aprovacao-importacoes.md` (não feito): fluxo de aprovação pendente para as 4 entidades de import (incluindo `sale`), trocando commit imediato por enviar→pendente→admin aprova/rejeita.
