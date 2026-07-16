# Fase 2 — CRUD da API, Testes Automatizados e Preparação para Git/CI

## Contexto

O setup inicial (`plan/01-setup-inicial.md`) já criou o monorepo (`apps/web` Next.js + `apps/api` Express), com dados fictícios em JSON (`apps/api/src/data/*.json`) e tipos de domínio compartilhados. O projeto ainda não tem lógica de negócio nem testes, e ainda não é um repositório git.

Esta fase tem dois objetivos:

1. **Implementar o CRUD da API** (Employees, Commission Rules/Tiers, Invoices) sobre os arquivos JSON existentes, com uma camada de acesso a dados isolada para facilitar a futura migração ao PostgreSQL (fase 7 do roadmap).
2. **Preparar a base de testes e automação de git** para que, quando o projeto for versionado (fase futura), cada commit rode a suíte de testes automaticamente e nenhum `push` aconteça sem teste verde e aprovação humana explícita — o pull do "sistema mais autônomo" pedido pelo usuário, mas sempre com o push sob controle humano (é a mesma política de segurança que já sigo hoje: nunca faço `git push` sem confirmação).

Decisões validadas com o usuário:
- Testes da API: **Vitest + Supertest**.
- **Não** fazer `git init` nesta fase — fica para uma fase futura, quando o projeto for de fato subido ao GitHub.
- Por ora, só **hooks locais (Husky)**; o usuário já sinalizou que quer evoluir para **CI/CD (GitHub Actions)** futuramente — isso entra como fase explícita no roadmap do `CLAUDE.md`, não implementado agora (não há repositório remoto ainda).

## Arquitetura do CRUD (apps/api)

Separar em camadas para isolar a persistência (JSON hoje, Postgres amanhã):

```
apps/api/src/
├── app.ts                 # cria e configura o Express app (sem listen) — permite importar em testes
├── index.ts                # só chama app.listen(PORT) — entrypoint de execução
├── lib/
│   └── jsonStore.ts         # readData<T>(file) / writeData<T>(file, data) genéricos sobre src/data/*.json
├── schemas/
│   ├── employee.schema.ts   # zod
│   ├── rule.schema.ts
│   └── invoice.schema.ts
├── services/
│   ├── employeeService.ts       # regras + chamadas ao jsonStore
│   ├── commissionRuleService.ts
│   └── invoiceService.ts
├── controllers/
│   ├── employeeController.ts
│   ├── commissionRuleController.ts
│   └── invoiceController.ts
├── routes/
│   ├── employees.routes.ts   # GET /, GET /:id, POST /, PUT /:id, DELETE /:id
│   ├── rules.routes.ts
│   ├── invoices.routes.ts
│   └── index.ts               # agrega e monta em /api/employees, /api/rules, /api/invoices
└── middleware/
    └── errorHandler.ts        # captura erros e responde JSON consistente ({ error: string })
```

`app.ts` precisa existir separado de `index.ts` justamente para o Supertest poder importar o app Express sem precisar abrir a porta — é o padrão mais comum para testar Express com Vitest/Jest.

Cada entidade tem as mesmas 5 rotas (listar, buscar por id, criar, atualizar, remover), validação de payload via zod nos `controllers`, e erros de "não encontrado" tratados como 404 via `errorHandler`.

## Testes (Vitest + Supertest)

- Dependências novas em `apps/api`: `vitest`, `supertest`, `@types/supertest` (dev).
- `apps/api/vitest.config.ts` apontando para `src`.
- Padrão de arquivo: colocado junto do código (`*.test.ts` ao lado do arquivo testado) — mais fácil de manter sincronizado.
- Cobertura mínima desta fase:
  - `lib/jsonStore.test.ts` — unitário, valida leitura/escrita (usar um arquivo JSON temporário em vez dos dados reais).
  - `routes/employees.routes.test.ts` — integração via Supertest contra o `app` importado de `app.ts`: cobre GET list, GET by id (404 se não existir), POST (cria e retorna 201), PUT, DELETE.
  - Mesmo padrão replicado para `rules` e `invoices` (arquivos representativos, não é necessário detalhar caso a caso aqui).
- Scripts em `apps/api/package.json`: `"test": "vitest run"`, `"test:watch": "vitest"`.
- Script agregador na raiz: `"test": "npm run test --workspaces --if-present"`.

## Preparação de Git/Hooks (sem `git init` ainda)

- Instalar na raiz (devDependencies): `husky`, `lint-staged`.
- Criar `.husky/pre-commit` (roda `lint-staged` — lint + typecheck rápido nos arquivos staged) e `.husky/pre-push` (roda `npm run test` completo; se falhar, bloqueia o push).
- Adicionar `"prepare": "husky"` no `package.json` raiz e a config do `lint-staged` (pode ficar em `package.json` raiz, chave `"lint-staged"`).
- Como ainda **não há repositório git**, os hooks ficam prontos mas inertes — ativam sozinhos assim que uma fase futura rodar `git init` + `npm install` (o script `prepare` religa os hooks automaticamente).
- Documentar no `CLAUDE.md`, em uma seção "Política de Git": pushes **sempre** exigem aprovação humana explícita — isso vale tanto para mim (Claude) quanto para qualquer automação futura; o hook `pre-push` é uma rede de segurança adicional (testes quebrados nunca sobem), não um substituto da aprovação.
- Adicionar ao roadmap do `CLAUDE.md` uma fase futura explícita: **"Fase 9: CI/CD (GitHub Actions)"** — workflow que roda testes a cada push/PR quando o repositório estiver no GitHub. Não implementada agora por não haver remoto ainda; fica registrada para quando o usuário decidir subir o projeto.

## Dados de exemplo

Os arquivos `apps/api/src/data/*.json` já existentes (criados na fase 1) serão reaproveitados como fonte de dados para o CRUD e para os testes de integração — nenhuma mudança de schema é necessária, os tipos em `src/types/domain.ts` já refletem essa estrutura.

## Arquivos a criar/editar (resumo)

- **Novos**: `apps/api/src/app.ts`, `lib/jsonStore.ts` (+ teste), `schemas/*.ts`, `services/*.ts`, `controllers/*.ts`, `routes/*.ts`, `middleware/errorHandler.ts`, testes `*.test.ts` colocados, `apps/api/vitest.config.ts`, `.husky/pre-commit`, `.husky/pre-push`.
- **Editados**: `apps/api/src/index.ts` (vira apenas o entrypoint), `apps/api/package.json` (deps de teste + scripts), root `package.json` (script `test`, `prepare`, `lint-staged`, deps husky/lint-staged), `CLAUDE.md` (seção de testes, política de git, roadmap fase 9).

## Fora de escopo nesta fase

- Motor de cálculo de comissão (fase 3 do roadmap original).
- Telas do frontend consumindo a API (fase 4).
- `git init`, primeiro commit e qualquer push remoto.
- Workflow real do GitHub Actions (fica documentado como fase futura, não implementado).

## Verificação

- `npm run test --workspace=apps/api` (ou `npm test` na raiz) roda a suíte Vitest e todos os testes passam.
- `curl`/Supertest confirmam CRUD funcionando: criar um employee via POST, buscar via GET, atualizar, remover — refletindo no arquivo `employees.json`.
- `npm run dev:api` continua subindo normalmente (via `index.ts` → `app.ts`) e `/health` continua respondendo.
- `.husky/pre-commit` e `.husky/pre-push` existem com o conteúdo correto (não é possível testar a ativação real sem um repo git, o que é esperado nesta fase).
- `CLAUDE.md` atualizado refletindo testes, política de git e a nova fase 9 no roadmap.
