# Vendas e Faturamento

A tela **Faturamento** (`/revenue`, visível para admin e manager) gerencia a base de vendas granulares por funcionário — venda bruta, líquida, data, loja, item — e é a fonte de dados que alimenta o cálculo de comissão.

## Modelo de dados

- **`Sale`** (venda individual): `employeeId, date (YYYY-MM-DD), period (YYYY-MM, derivado de date), store, itemDescription, itemSku?, quantity, grossAmount, netAmount`.
- **`RevenueRecord`** (agregado por funcionário/período, único por par — `@@unique([employeeId, period])`): `revenueAmount` é a **soma de `Sale.netAmount`** de todas as vendas daquele funcionário naquele período. É esse valor que o motor de comissão (`commissionEngine.ts`) usa — nunca a venda bruta.

## Como o agregado é recalculado

Toda escrita em `Sale` (criar/editar/excluir uma venda pela tela, ou confirmar uma importação de planilha de Vendas) dispara `revenueAggregationService.recomputeRevenueForPairs()`, que soma novamente todas as vendas do par funcionário/período afetado e grava (`upsert`) em `RevenueRecord`. Não é preciso rodar nada manualmente para isso — é automático a cada mudança em `Sale`.

**Importante**: se um `RevenueRecord` para um funcionário/período foi cadastrado por outro caminho (import direto de "Faturamento", ou o antigo formulário manual de `/api/revenue`) e depois uma venda é lançada para esse mesmo par, o agregado de `Sale` **sobrescreve** esse valor na próxima escrita em `Sale` daquele par. Ou seja: escolha um caminho por período — ou você lança vendas item a item (recomendado, dá ranking e detalhe) ou importa o faturamento agregado direto — misturar os dois pro mesmo funcionário/período faz o último a escrever vencer.

## Calculando comissões

O motor de comissão (`POST /api/commissions/calculate`) sempre existiu na API, mas não tinha nenhum botão na interface até esta fase — o cálculo só acontecia se alguém chamasse o endpoint por fora (Postman/script). Agora há um painel **"Calcular comissões do período"** na tela de Faturamento (admin-only): informe o período (`YYYY-MM`) e clique em Calcular. Isso recalcula `CommissionResult` para todos os funcionários ativos com faturamento (`RevenueRecord`) naquele período — resultados já `approved`/`paid` continuam congelados (não são sobrescritos).

## Ranking de itens

A mesma tela mostra o ranking dos itens mais vendidos (por venda líquida) no período mais recente com vendas cadastradas, via `GET /api/sales/ranking` (aceita filtros opcionais `?period=&store=&employeeId=`).

## Onde mexer para adaptar a um cliente novo

- Campos adicionais de venda (ex: categoria do item, canal de venda): adicionar coluna em `apps/api/prisma/schema.prisma` no modelo `Sale`, migration, e replicar no `sale.schema.ts`, `types/domain.ts` (api e web) e `SalesTable.tsx`.
- Cabeçalhos de planilha de Vendas aceitos na importação: `guia/06-importacao-de-dados.md`.
