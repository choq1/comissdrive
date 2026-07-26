# Funcionários e dados cadastrais (departamento, cargo, etc.)

## Onde editar

Tela **Employees** (`/employees`), visível só para usuários `admin`. Tem busca, filtro por departamento, e botão **"Adicionar funcionário"** + ícones de editar/excluir por linha (`apps/web/src/components/employees/EmployeesTable.tsx`).

Campos editáveis pela tela: `code`, `name` (nome completo), `role` (cargo), `department`, `baseSalary`, `tier` (Gold/Silver), `status` (active/inactive).

> Usuários com role `manager` veem a tabela mas não os controles de adicionar/editar/excluir (a API já rejeita essas mutações pra esse role com 403 — a interface só esconde o botão).

## ⚠️ Cuidado ao renomear `department` ou `role`: `CommissionRule.appliesTo`

O motor de cálculo (`apps/api/src/services/commissionEngine.ts`, função `ruleMatches`) casa uma regra de comissão com um funcionário por **comparação exata de string**:

```ts
if (rule.scope === "department") return rule.appliesTo === employee.department;
if (rule.scope === "role") return rule.appliesTo === employee.role;
```

Isso significa: se você renomear o departamento de um funcionário de `"Sales"` para `"Vendas"` na tela Employees, **qualquer `CommissionRule` com `scope: "department"` e `appliesTo: "Sales"` deixa de bater com esse funcionário silenciosamente** — sem erro, o funcionário simplesmente para de receber aquela parte da comissão no próximo cálculo.

**Sempre que renomear um `department`/`role` usado em alguma regra:**
1. Ir em Settings → Editor de Regras de Comissão.
2. Localizar a(s) regra(s) com `scope: department`/`role` e `appliesTo` igual ao valor antigo.
3. Editar a regra e atualizar `appliesTo` para o novo valor, **exatamente igual** ao novo `department`/`role` dos funcionários (mesma grafia/maiúsculas).
4. Recalcular o período afetado em Commissions, se necessário, para conferir que o valor voltou a bater.

## Por que o nome do departamento não é traduzido automaticamente

Ver [`02-idioma-pt-br-en.md`](02-idioma-pt-br-en.md) — `department`/`role`/`name` são texto livre cadastrado pelo admin, não strings de interface. O idioma da tela não afeta esse dado.

## Verificação após editar um funcionário

- Conferir que o novo valor aparece na tabela Employees.
- Ir em Commissions e conferir que o gráfico "Distribuição de Comissão por Departamento" reflete o novo nome.
- Se o funcionário estava associado a uma regra por `department`/`role`, recalcular o período em Commissions e comparar o valor de comissão antes/depois (ver aviso acima).
