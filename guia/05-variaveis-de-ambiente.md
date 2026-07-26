# Variáveis de ambiente (por cliente/ambiente)

> **Nota**: o `CLAUDE.md` menciona um `.env.example` na raiz, mas ele não existe hoje no repositório (só o `.env` real, não commitado). Considerar criar um `.env.example` de referência num próximo plano — por ora, use esta página como fonte de verdade das variáveis necessárias.

## `apps/api/.env` (backend)

| Variável | Uso |
|---|---|
| `PORT` | Porta em que o Express sobe (dev local). |
| `DATABASE_URL` | Connection string do PostgreSQL (Supabase). **Usar o session pooler** (`*.pooler.supabase.com`, porta `5432`) — a porta `6543` (transaction pooler) não suporta o que `prisma migrate` precisa (ver `CLAUDE.md` → Persistência). |
| `JWT_SECRET` | Chave de assinatura do JWT de sessão (cookie `token`). Trocar por um valor forte e único por cliente/ambiente — nunca reaproveitar entre clientes. |
| `FRONTEND_URL` | URL do frontend, usada pelo CORS (`cors({ origin: FRONTEND_URL, credentials: true })`) — precisa bater exatamente com a URL onde o Next.js está publicado, senão o cookie de sessão cross-origin não funciona. Ex. produção: `https://app.comisspro.com.br`. |

## `apps/web` (frontend)

| Variável | Uso |
|---|---|
| `NEXT_PUBLIC_API_URL` | URL da API Express (`apps/web/src/lib/api.ts` e `apiClient.ts`). Se não for definida, cai no fallback `http://localhost:3333` — **precisa ser definida explicitamente em produção**, apontando pro backend publicado do cliente. |

## Passo a passo — provisionar um cliente novo

1. Criar um banco PostgreSQL novo no Supabase (ou outro provedor) exclusivo do cliente — **nunca reaproveitar o mesmo banco entre clientes diferentes**.
2. Preencher `apps/api/.env` com o `DATABASE_URL` desse banco, um `JWT_SECRET` novo, e o `FRONTEND_URL` real de produção.
3. Rodar as migrations nesse banco: `npx prisma migrate deploy --schema=apps/api/prisma/schema.prisma` (produção usa `migrate deploy`, não `migrate dev`).
4. Decidir se roda o seed de dados de exemplo (`npx prisma db seed --workspace=apps/api`) — normalmente **não**, para cliente real; cadastrar os dados reais pela interface (ver [`03-funcionarios-e-dados.md`](03-funcionarios-e-dados.md) e [`04-usuarios-e-permissoes.md`](04-usuarios-e-permissoes.md)).
5. Publicar o frontend com `NEXT_PUBLIC_API_URL` apontando pro backend desse cliente.

## Verificação

- `GET /health` na API deve responder 200.
- Login na tela `/login` deve setar o cookie `token` e redirecionar pro dashboard sem erro de CORS no console do navegador (sintoma de `FRONTEND_URL` errado).
