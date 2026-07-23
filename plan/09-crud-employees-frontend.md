# Fase 9 — CRUD de Employees no frontend

## Objetivo

A API já tinha CRUD completo de `Employee` (`POST/PUT/DELETE /api/employees`, admin-only) desde a fase 2, mas a tela `/employees` era só leitura (busca + filtro). Isso ficou evidente ao notar que o valor de `department` exibido no gráfico de Commissions ("Sales") não tinha como ser corrigido/traduzido pela interface — só chamando a API diretamente. Esta fase fecha essa lacuna.

## Implementação

Seguiu o mesmo padrão já estabelecido em `RulesEditor.tsx`/`UserPermissionsPanel.tsx` (fase 5):

- `apps/web/src/lib/apiClient.ts`: `createEmployee`/`updateEmployee`/`deleteEmployee`, mesmo padrão de `createRule`/`updateRule`/`deleteRule` (`apiFetchClient`, `credentials: "include"`).
- `apps/web/src/components/employees/EmployeesTable.tsx`: ganhou botão "Adicionar funcionário" + ícones de editar/excluir por linha, e um `EmployeeFormModal` inline (campos: `code`, `name`, `role`, `department`, `baseSalary`, `tier`, `status`) reaproveitando `Modal`/`Input`/`Select`/`Button` (`components/ui`).
- Controles de mutação só aparecem para `useCurrentUser()?.role === "admin"` — a página continua visível (view-only) para `manager`, e a API já rejeitava essas mutações com 403 para esse role.
- Após criar/editar/excluir: `router.refresh()`, que re-executa o `EmployeesPage` (Server Component) e recalcula `currentCommission` a partir do motor de comissão — esse campo continua não-editável (é derivado, não faz parte de `Employee`).
- Sem alteração de backend — schema (`employee.schema.ts`) e rotas já cobriam o caso.

## Verificação

- `npx tsc --noEmit` + `npm run build --workspace=apps/web`.
- Testado via API (mesmo endpoint que o modal chama): editar `department` de `"Sales"` para `"Vendas"` em um funcionário existente e confirmar reflexo no gráfico de Commissions → Distribuição por Departamento (revertido depois do teste, para não alterar o dado de seed).
- Confirmado que o botão "Adicionar funcionário" não aparece para usuário `manager`.
- `npm test` (suíte da API) — 40 testes passando, sem impacto.

## Cuidado registrado (ver `guia/03-funcionarios-e-dados.md`)

Renomear `department`/`role` de um funcionário pode "desalinhar" silenciosamente uma `CommissionRule` com `scope: department`/`role`, já que `commissionEngine.ts` casa por comparação exata de string (`rule.appliesTo === employee.department`). Documentado no guia de manutenção, não corrigido automaticamente (fora de escopo desta fase).

## Documentação viva

Guia de manutenção criado em `guia/03-funcionarios-e-dados.md`.
