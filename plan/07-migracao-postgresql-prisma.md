# Fase 7 — Migração de JSON para PostgreSQL (Prisma)

## Objetivo

Trocar a camada de persistência (JSON local em `apps/api/src/data/*.json`, via `lib/jsonStore.ts` + `lib/crudRepository.ts`) por PostgreSQL gerenciado no Supabase, acessado via Prisma ORM. Endpoints REST, contratos de resposta e regras de negócio (motor de comissão, workflow de status, autenticação) permanecem intactos — só a forma como os dados são lidos/escritos muda.

## Banco (Supabase)

- Postgres gerenciado na nuvem (free tier), projeto criado manualmente pelo usuário no Supabase.
- **Conexão via session pooler** (`aws-1-sa-east-1.pooler.supabase.com:5432`), não a conexão direta (`db.<ref>.supabase.co:5432`, IPv6-only e inalcançável na rede de dev) nem o transaction pooler (porta `6543`, que não suporta os recursos que `prisma migrate` precisa — a tentativa nessa porta travou indefinidamente).
- `DATABASE_URL` fica em `apps/api/.env` (gitignored), placeholder documentado em `.env.example`.
- O schema `public` já tinha uma tabela `usuarios` de outro projeto/teste do usuário — confirmado que não tinha relação com este projeto, resetado (`prisma migrate reset --force`, com consentimento explícito do usuário, já que é uma operação destrutiva) antes da primeira migration.

## Schema Prisma

`apps/api/prisma/schema.prisma` — um modelo por entidade de `types/domain.ts`, enums Prisma espelhando os union types TS (`EmployeeStatus`, `CommissionTierLevel`, `CommissionRuleType`, `CommissionRuleScope`, `CommissionResultStatus`, `InvoiceStatus`, `UserRole`).

- `CommissionRule` 1—N `CommissionTier` via `ruleId`, com `onDelete: Cascade` — substitui a exclusão manual em cascata que existia em `commissionRuleService.remove`.
- `CommissionResult` sem `id` próprio, igual ao shape do domínio — `@@id([employeeId, period])` como chave composta.
- Campos monetários/percentuais mapeados como `Float` (não `Decimal`) — paridade 1:1 com `number` do JS, sem introduzir conversão `Decimal → number` na camada de serviço.
- `period`, `dueDate`, `paidDate` continuam `String` (não `DateTime`) — evita mudança de timezone/formatação que o frontend não espera.
- IDs continuam gerados em código (`` `${idPrefix}_${randomUUID()}` ``), não pelo Prisma, para manter o formato existente (`emp_...`, `rule_...`, `user_...`).

**Prisma fixado em `^6`, não `^7`** (major mais recente no momento): a v7 exige `PrismaClient` com `adapter` de driver (`@prisma/adapter-pg` + `pg`) e move `DATABASE_URL` de `schema.prisma` para `prisma.config.ts`, aumentando o escopo desta migração sem necessidade. `prisma.config.ts` (mínimo, só `schema` + `migrations.seed`) foi adicionado porque o Prisma 6 já emite deprecation warning para o `package.json#prisma.seed`.

## Camada de acesso a dados

- `lib/prisma.ts`: singleton `PrismaClient` (padrão `globalThis`, evita múltiplas instâncias no hot-reload do `ts-node-dev --respawn`).
- `lib/crudRepository.ts`: reescrito para receber um delegate Prisma (`prisma.employee`, `prisma.user`, etc.) em vez de um nome de arquivo JSON — mesma assinatura pública (`list/findById/create/update/remove`), então `employeeService.ts`/`invoiceService.ts`/`revenueService.ts`/`userService.ts` continuam wrappers de uma linha e `controllers/*` não mudaram. Erros "not found" do Prisma (`P2025`) viram `undefined`/`false` (mesmo contrato de antes); outros erros propagam.
- `commissionRuleService.ts`: reescrito sobre `prisma.commissionRule`/`prisma.commissionTier`; cascade de tiers agora é responsabilidade do banco.
- `commissionResultService.ts`: `calculateForPeriod` usa `findUnique`/`upsert` pela chave composta `employeeId_period`, respeitando o congelamento de status `approved`/`paid`; `updateStatus` idem.
- `userService.findByEmail` vira `prisma.user.findUnique({ where: { email } })`.
- `authService.ts` não mudou (só depende de `userService`).

## Tipos

`Invoice.paidDate` e `User.employeeId` mudaram de `?: string` (opcional/undefined) para `?: string | null` em `types/domain.ts` (api e web, cópia manual) — colunas nullable no Postgres retornam `null`, não `undefined`. `user.schema.ts` já esperava `.nullable()` em `employeeId`, então o ajuste alinha um shape que já estava um pouco inconsistente.

## Seed

`apps/api/prisma/seed.ts` lê `prisma/seed-data/*.json` (cópia congelada do antigo `src/data/*.json`, incluindo os hashes de senha já gerados em `users.json`) e popula o banco via `createMany`, preservando os IDs e dados de demo existentes. Registrado em `prisma.config.ts` (`migrations.seed`), roda com `npx prisma db seed`.

`src/lib/jsonStore.ts`, `src/lib/jsonStore.test.ts` e `src/data/` foram removidos — sem uso após a migração. `scripts/seedPasswords.ts` e os testes que faziam cleanup direto em `commissionResults.json` (`commissionResultService.test.ts`, `commissions.routes.test.ts`) foram adaptados para usar `prisma`.

## Testes

Os testes de integração (`routes/*.routes.test.ts`) continuam rodando contra `createApp()` via supertest, agora contra o Postgres real (mesmo `DATABASE_URL` de dev) — sem banco de teste isolado nem transação por teste, preservando o comportamento anterior (que já mutava os JSON reais sem isolamento). **Melhoria futura, não implementada nesta fase**: banco de teste separado ou wrap por transação com rollback.

40 testes (9 arquivos) passando contra o Supabase real após a migração.

## Verificação manual

- `GET /health` → `{"status":"ok"}`.
- `POST /api/auth/login` (admin) → cookie JWT válido.
- `GET /api/employees` autenticado → lista os 7 funcionários do seed.
