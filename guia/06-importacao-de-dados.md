# Importação em massa de dados (planilha)

O painel **"Importação em massa"** dentro da tela **Faturamento** (`/revenue`, admin-only, `apps/web/src/components/revenue/BulkImportPanel.tsx`) permite cadastrar Vendas, Faturamento, Funcionários ou Faturas em lote a partir de um arquivo `.xlsx`/`.csv`, em vez de um registro por vez. Ficava em Configurações até a fase 12; foi movido pra Faturamento pra ficar junto do resto do fluxo de gestão de vendas (você importa e já vê o resultado na mesma tela, sem precisar navegar).

## Fluxo

1. Escolher o tipo de dado (Funcionários / Faturamento / Faturas / Vendas).
2. Selecionar o arquivo e clicar em "Analisar" — o backend faz o parse e devolve uma **prévia**: nada é gravado no banco ainda.
3. Linhas com erro aparecem destacadas, com a mensagem do problema. É possível corrigir os valores direto na tabela antes de confirmar.
4. Clicar em "Confirmar importação" grava as linhas em uma única transação. O resultado (quantas foram importadas / quantas falharam) fica registrado em `ImportLog` (tabela de auditoria — quem importou, quando, quantas linhas).

## Cabeçalhos aceitos por planilha

Os nomes de coluna abaixo são reconhecidos **sem diferenciar maiúsculas/acentos**. O nome em português é o canônico (usar nos templates distribuídos ao cliente); o inglês funciona como alias secundário.

### Funcionários

| Coluna (PT-BR) | Alias EN | Campo | Observação |
|---|---|---|---|
| Código | code | `code` | Identificador de negócio do funcionário (ex: `E001`) |
| Nome | name | `name` | |
| Cargo | role | `role` | |
| Departamento | department | `department` | |
| Salário base | base salary | `baseSalary` | Aceita `1.500,50` ou `1500.50` |
| Tier | tier | `tier` | Aceita `Ouro`/`Prata` além de `Gold`/`Silver` |
| Status | situação | `status` | Aceita `Ativo`/`Inativo` além de `active`/`inactive` |

### Faturamento e Faturas

| Coluna (PT-BR) | Alias EN | Campo | Observação |
|---|---|---|---|
| Funcionário | employee / employee id | `employeeId` | Aceita o **código** do funcionário (ex: `E001`), o **nome** ou o id interno — resolvido para o id interno automaticamente. Se não encontrar, a linha fica com erro "Funcionário não encontrado" |
| Período | period | `period` | Formato `YYYY-MM` |
| Faturamento (só faturamento) | revenue amount | `revenueAmount` | |
| Valor (só faturas) | amount | `amount` | |
| Status (só faturas) | situação | `status` | Aceita `Pendente`/`Aprovado`/`Pago` além de `pending`/`approved`/`paid` |
| Vencimento (só faturas) | due date | `dueDate` | |
| Data de pagamento (só faturas) | paid date | `paidDate` | Opcional |

### Vendas

| Coluna (PT-BR) | Alias EN | Campo | Observação |
|---|---|---|---|
| Funcionário | employee / employee id | `employeeId` | Mesma resolução por código/nome/id das demais entidades |
| Data | date | `date` | Aceita `DD/MM/AAAA` (BR) ou `YYYY-MM-DD` (ISO); o "Período" (`YYYY-MM`) é **derivado automaticamente** da data, não é uma coluna separada |
| Loja | store | `store` | |
| Descrição do item | item description | `itemDescription` | |
| Código do item | item sku / sku | `itemSku` | Opcional |
| Quantidade | quantity | `quantity` | |
| Venda bruta | gross amount | `grossAmount` | |
| Venda líquida | net amount | `netAmount` | **É esse valor que alimenta o cálculo de comissão** (ver `guia/07-vendas-e-faturamento.md`) |

## Comportamento de commit parcial

Se algumas linhas da planilha tiverem erro e outras não, apenas as válidas são gravadas — a importação nunca é "tudo ou nada" no nível do arquivo inteiro (é tudo-ou-nada só dentro do conjunto de linhas que o admin confirma, via transação do Prisma). Linhas com erro precisam ser corrigidas manualmente na tela ou excluídas de uma nova tentativa.

## Onde mexer para adaptar a um cliente novo

- Novos aliases de coluna (ex: um sinônimo que o cliente usa): editar `columnAliases` em `apps/api/src/schemas/importConfigs.ts`.
- Novos valores aceitos para tier/status (ex: um terceiro tier): editar os mapas `TIER_ALIASES`/`STATUS_ALIASES`/`INVOICE_STATUS_ALIASES` no mesmo arquivo.
- Limite de tamanho do arquivo (hoje 10MB): `apps/api/src/routes/imports.routes.ts`, config do `multer`.

## OCR de documentos escaneados

Ainda não implementado — ver roadmap no `CLAUDE.md`. Quando implementado, esta seção será atualizada com o layout de documento exigido.
