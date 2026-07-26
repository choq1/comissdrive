# Plano 11 — Importação em massa via planilha (.xlsx/.csv)

## Objetivo

Permitir que o admin cadastre Funcionários, Faturamento e Faturas em lote a partir de um arquivo `.xlsx`/`.csv`, em vez de um registro por vez pelas telas de CRUD existentes — essencial para onboarding de um cliente novo (dezenas/centenas de funcionários, meses de histórico de faturamento) e para o caso comum de "o cliente já tem essa planilha pronta". Primeira de duas fases; a segunda (`plan/12-ocr-documentos.md`, ainda não feita) adiciona OCR de imagens/documentos escaneados reaproveitando o mesmo fluxo.

## O que existia antes

Nenhuma capacidade de upload de arquivo em lugar nenhum do app — todo cadastro era um registro por vez via formulário (Employees, Rules, Users) ou só via API direta (Revenue/Invoices, sem tela própria).

## O que foi feito

### Backend

- **Dependências novas**: `exceljs` (parseia `.xlsx` e `.csv` com uma única lib) e `multer` (upload multipart), `@types/multer` como dev dependency.
- `apps/api/src/services/importParsingService.ts` — camada genérica de parsing: lê a planilha (via `exceljs`), mapeia cabeçalhos (case/acento-insensitive) para campos do schema via `columnAliases`, aplica `coerce` (conversão de tipos, ex: `"1.500,50"` → `1500.5`) e roda a validação zod por linha, devolvendo `RowResult[]` (linha + dados + erros em PT-BR).
- `apps/api/src/schemas/importConfigs.ts` — um `EntityImportConfig` por entidade (`employee`/`revenue`/`invoice`), construído em cima dos zod schemas já existentes (nenhuma validação paralela). Cabeçalhos canônicos em PT-BR (`Código`, `Funcionário`, `Faturamento`, etc.), com aliases em inglês. Para Faturamento/Faturas, a coluna "Funcionário" aceita código, nome ou id interno do funcionário — resolvido para o id real via `createEmployeeResolver()` (uma única consulta ao banco por importação, não por linha).
- `apps/api/src/services/importService.ts` — `commitImport(entity, rows, context)`: revalida cada linha (nunca confia no client, mesmo sendo admin-only), grava as válidas em `prisma.$transaction` (tudo-ou-nada só dentro do lote confirmado), gera IDs com os mesmos prefixos das entidades (`emp_`/`rev_`/`inv_`), e grava um `ImportLog` de auditoria ao final.
- **Modelo Prisma novo `ImportLog`** (`entity`, `source`, `fileName`, `uploadedBy`, `rowsTotal`, `rowsCommitted`, `rowsFailed`, `createdAt`) — migration `20260725222839_add_import_log` aplicada no Supabase de dev.
- **Rotas novas** `apps/api/src/routes/imports.routes.ts` montadas em `/api/imports`, mesmo padrão de guard das demais (`requireAuth` + `requireRole("admin")`):
  - `POST /api/imports/:entity/preview` (multipart, campo `file`) — função pura, não grava nada.
  - `POST /api/imports/:entity/commit` (JSON, `{ rows, fileName }`) — o client reenvia as linhas já revisadas/editadas na tela; sem sessão/cache no servidor entre as duas chamadas.
- `crudRepository.ts` não foi tocado — continua servindo o CRUD single-record das telas existentes; bulk-insert vive só em `importService.ts`.

### Frontend

- `apps/web/src/types/imports.ts` — tipos compartilhados do contrato de preview/commit (`RowResult`, `ImportPreviewResponse`, `ImportCommitResponse`).
- `apps/web/src/components/ui/FileInput.tsx` — novo primitivo de upload.
- `apps/web/src/lib/apiClient.ts` — nova função `apiFetchClientFormData` (sem `Content-Type` manual, deixa o browser gerar o boundary do multipart) + `previewImport`/`commitImportRows`.
- `apps/web/src/components/settings/BulkImportPanel.tsx` — seletor de entidade, upload, tabela de prévia com células editáveis inline para corrigir erros, botão de confirmação e resumo do resultado. Segue o mesmo padrão de estado (`saving`/try-finally/`router.refresh()`) de `RulesEditor.tsx`/`UserPermissionsPanel.tsx`.
- Painel adicionado à página `/settings` existente (`apps/web/src/app/settings/page.tsx`), sem rota nova nem item de Sidebar — reaproveita o gate `adminOnly` que a página já tinha.
- `apps/web/src/lib/i18n/dictionaries.ts` — nova seção `settings.imports` (PT-BR + EN).
- `apps/web/src/types/domain.ts` — tipo `ImportLog` espelhado manualmente (mesma dívida técnica documentada no `CLAUDE.md`).

### Testes

- `apps/api/src/services/importParsingService.test.ts` (unitário, sem DB): alias de cabeçalho PT-BR/EN, coerção numérica, erro de campo obrigatório em PT-BR, linhas vazias ignoradas.
- `apps/api/src/services/importService.test.ts` (contra o Postgres real de dev): lote parcialmente inválido só grava as linhas boas + `ImportLog` correto; lote todo inválido não grava nada.
- `apps/api/src/routes/imports.routes.test.ts` (Supertest, arquivo `.xlsx` montado em buffer no próprio teste via `exceljs`): 401 sem sessão, 403 para manager, 400 para entidade inválida, fluxo completo preview→commit com uma linha de funcionário inexistente sinalizada como erro.

## Verificação

- `npm test` (raiz) — 50 testes passando, incluindo os 3 arquivos novos.
- `npx tsc --noEmit` limpo em `apps/api` e `apps/web`; `npm run build --workspace=apps/web` limpo.
- Fluxo ponta a ponta validado via chamadas HTTP diretas (login admin → preview de planilha real → commit → registro criado com id `emp_...` → `ImportLog` gravado) — dev servers do Windows sem `chromium-cli`/Playwright disponível neste ambiente para screenshot do componente React; a verificação visual da tela em si (`BulkImportPanel`) fica pendente de um teste manual do usuário no navegador.

## Nota sobre dependências

`exceljs` traz `archiver` (usado internamente para escrever `.xlsx`, embora este plano só leia arquivos) como dependência transitiva, que por sua vez arrasta um `brace-expansion` com um advisory de ReDoS (severidade alta) e um `uuid` desatualizado (moderado) — `npm audit` reporta isso após a instalação. Não há voo de dado de usuário externo por esse caminho (é só parsing de upload administrativo), mas fica registrado para reavaliar se o ecossistema do `exceljs`/`archiver` publicar uma versão corrigida.

## Próximos passos

`plan/12-ocr-documentos.md` (não feito): OCR via Tesseract.js reaproveitando o mesmo contrato de preview/commit e a tela `BulkImportPanel.tsx`, para um layout de documento fixo e conhecido.
