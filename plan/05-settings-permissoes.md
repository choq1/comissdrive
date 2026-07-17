# Fase 5 — Settings: editor de regras + painel de permissões

## Contexto

O roadmap (`CLAUDE.md`) tinha a fase 5 como: "Frontend: tela Settings (editor de regras) + painel de permissões de usuário". O item "Settings" existia na sidebar mas ficava `disabled: true` (placeholder "Em breve") e não havia pasta `app/settings`. O backend já tinha CRUD completo de `CommissionRule` (`/api/rules`), mas os `CommissionTier` só tinham leitura (`GET /api/rules/tiers`) — não havia como criar/editar/remover uma faixa de tier via API, e `CommissionTier` nem tinha `id` próprio (chave era `ruleId + tierName`). Não existia nenhum CRUD de `User` no backend, embora `users.json` e o tipo `User` (com `role: "admin" | "manager"`) já existissem.

Esta fase entregou, seguindo a referência visual `configurações globais.png` (card "Commission Rules Editor" à esquerda + card "User Permissions" à direita): CRUD completo de regras/tiers e um painel de gestão de usuários (nome/e-mail/role/employeeId vinculado). **Não inclui autenticação real nem controle de acesso por role** — isso é fase 6; o painel de permissões apenas gerencia os registros de `User`, sem login nem enforcement.

É a primeira tela do app a fazer mutações (POST/PUT/DELETE) — até então tudo era leitura via Server Component. Mantivemos o padrão existente para leitura inicial (Server Component + `lib/api.ts` com `cache: "no-store"`) e usamos Client Components com `fetch` direto para a API Express (CORS já está aberto) para as mutações, seguidas de `router.refresh()` para re-sincronizar os dados do servidor — sem Server Actions nem nova lib de estado.

## Mudança de modelo de dados: `CommissionTier` ganhou `id`

Necessário para editar/remover uma faixa individualmente pela API. Mudou em `apps/api/src/types/domain.ts`, `apps/web/src/types/domain.ts` (mirror manual) e `apps/api/src/data/rules.json` (os 2 tiers seed ganharam `id: "tier_sales_1"`/`"tier_sales_2"`).

## Backend (`apps/api`)

- `commissionRuleService.ts`: `createTier`/`updateTier`/`removeTier` (mesmo padrão de `create/update/remove` de rule). `remove(ruleId)` de uma rule `tiered` agora também remove seus tiers em cascata.
- `schemas/rule.schema.ts`: `commissionTierSchema`/`commissionTierUpdateSchema`.
- `commissionRuleController.ts`: `createTier`/`updateTier`/`removeTier`.
- `rules.routes.ts`: `POST /tiers`, `PUT /tiers/:id`, `DELETE /tiers/:id`.
- Novo CRUD de `User`, reaproveitando `createCrudRepository` (mesma fábrica de `employeeService`): `schemas/user.schema.ts`, `services/userService.ts`, `controllers/userController.ts`, `routes/users.routes.ts`, montado em `routes/index.ts` como `/api/users`.
- Testes: `rules.routes.test.ts` estendido com tier CRUD + cascade delete; novo `users.routes.test.ts` espelhando `employees.routes.test.ts`.

## Frontend (`apps/web`)

- `lib/api.ts`: `createRule/updateRule/deleteRule`, `createTier/updateTier/deleteTier`, `getUsers/createUser/updateUser/deleteUser` — todas via `apiFetch` com `method`/`body`. `apiFetch` ganhou tratamento de resposta `204` (sem corpo) para não quebrar nos `DELETE`.
- Componentes de UI genéricos novos em `components/ui/`: `Modal.tsx`, `Input.tsx`, `Select.tsx`, `Button.tsx` (não existia nenhum antes; seguem a paleta `slate-800/900` já usada em `DataTable`/`EmployeesTable`).
- `components/settings/RulesEditor.tsx` (`"use client"`): lista rules com edição/exclusão via modal; rules `tiered` mostram sub-lista de tiers com add/edit/delete próprios.
- `components/settings/UserPermissionsPanel.tsx` (`"use client"`): `DataTable` de usuários com role editável inline (`Select`), modal de criação, exclusão.
- `app/settings/page.tsx` (Server Component): busca rules/tiers/users/employees via `Promise.all`, layout de duas colunas (`RulesEditor` largo à esquerda, `UserPermissionsPanel` à direita).
- `components/layout/Sidebar.tsx`: removido `disabled: true` do item Settings (e simplificado o componente, já que não há mais item desabilitado).

## Incidente durante a implementação: projeto saiu do OneDrive

No meio da fase, ao testar a tela `/settings` com os dois dev servers rodando, a máquina travou e reiniciou. Diagnóstico: o projeto vivia em uma pasta sincronizada pelo OneDrive, e o motor de sync competia em tempo real por I/O de disco com os watchers de arquivo do `ts-node-dev` (API) e do Turbopack (`next dev`, web) sobre `node_modules`/`.next`. Um `curl` de teste chegou a ficar mais de 2 minutos pendurado esperando a compilação da rota, e logo depois um comando `git` falhou com erro de "arquivo de paginação muito pequeno" (sintoma de exaustão de recursos do Windows).

Solução aplicada: o projeto inteiro foi copiado (via `robocopy`, preservando `.git` e todo o histórico/mudanças pendentes, excluindo apenas `node_modules`/`.next`/`dist` que são regeneráveis) para `C:\xampp\htdocs\Projeto Piloto`, fora de qualquer pasta com sync em nuvem. `npm install` rodado de novo lá, suíte de testes (32/32) e SSR das 5 telas confirmados funcionando — a mesma rota `/settings` que travava por >120s no OneDrive respondeu em ~400ms no novo local. A cópia antiga no OneDrive foi mantida como rede de segurança até o usuário confirmar e apagar manualmente. Ver nota permanente em `CLAUDE.md` → "Localização do projeto".

## Verificação

- `npm test` na raiz: 32/32 testes passando (Vitest + Supertest), incluindo os novos casos de tier CRUD, cascade delete e users CRUD.
- `npx tsc --noEmit` limpo em `apps/web`.
- SSR de `/settings`, `/dashboard`, `/employees`, `/commissions`, `/invoices` verificado via `curl` contra o dev server real (200 em todas, conteúdo esperado presente — nomes de rules seed, usuário "Romadon", botões "Add new rule"/"Add user"). Verificação de interação via clique/modal em navegador real não foi feita nesta sessão (sem `chromium-cli`/Playwright disponível localmente) — recomenda-se um passe manual no navegador antes de considerar a fase totalmente fechada.
