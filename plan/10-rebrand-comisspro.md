# Plano 10 — Rebrand: Commissioning → ComissPro

## Objetivo

Trocar a marca do produto de "Commissioning" para "ComissPro", com identidade visual nova (favicon + logos em 3 tamanhos, entregues em `img/`) e domínio de e-mail `comisspro.com.br` (antes `commissioning.local`, fictício). Junto da troca, criar um sistema de branding centralizado para que a próxima troca (ex: marca white-label para um cliente) seja rápida — editar 1 arquivo de config + sobrescrever arquivos de imagem, sem caçar JSX espalhado.

## O que existia antes

Nenhum sistema de branding: o nome "Commissioning" era texto hardcoded em 3 pontos (`layout.tsx` → `metadata`, `Sidebar.tsx`, `login/page.tsx`), sem logo/imagem nenhuma — só um `~` estilizado. Favicon era um `.ico` estático sem relação com a marca. E-mails de usuários fictícios usavam `@commissioning.local`.

## O que foi feito

### Sistema de branding central (frontend)

- `apps/web/src/lib/branding.ts` — fonte única de verdade: `name`, `description`, `domain`, paths/dimensões dos logos (`logos.small`, `logos.medium`).
- `apps/web/src/components/layout/BrandLogo.tsx` — componente que renderiza o logo a partir de `branding.logos`, via `<img>` puro (SVG local não passa pelo otimizador do `next/image`, que bloqueia SVG por padrão sem `dangerouslyAllowSVG`).
- `apps/web/public/brand/` — `logo-small.svg`, `logo-medium.svg`, `logo-large.svg`, `favicon.svg` (nomes genéricos, não presos ao nome do cliente atual — trocar de marca é sobrescrever esses arquivos).
- Favicon/app icon: convenção nativa do App Router do Next 16 (`apps/web/src/app/icon.svg` + `apps/web/src/app/apple-icon.png`) substitui `metadata.icons` — sem precisar tocar em `layout.tsx`. `favicon.ico` antigo removido.

### Consumo da config

- `layout.tsx`: `metadata.title`/`description` passam a ler `branding.name`/`branding.description`.
- `Sidebar.tsx` e `login/page.tsx`: texto `~ Commissioning` trocado por `<BrandLogo size="small" />` / `<BrandLogo size="medium" />`.

### Backend

- `apps/api/prisma/seed-data/users.json`: e-mails dos usuários fictícios do seed atualizados para `admin@comisspro.com.br` / `manager@comisspro.com.br`.
- `apps/api/src/routes/auth.routes.test.ts` e `users.routes.test.ts`: e-mails de teste atualizados para o domínio novo.
- Banco de dev existente (Supabase): `seed.ts` usa `createMany` (não é idempotente), então editar o JSON não alterava as linhas já gravadas — rodado um update pontual (script `ts-node` avulso, descartado depois) nos usuários já existentes, incluindo um terceiro usuário (`gabriel@commissioning.local`, criado depois do seed original via UI, fora do `users.json`) que também usava o domínio antigo.

### Documentação

- `guia/01-nome-e-marca.md` reescrito: sai o "edite 4 lugares em JSX", entra o passo a passo sobre `branding.ts` + arquivos de `public/brand/`.
- `guia/04-usuarios-e-permissoes.md` e `guia/05-variaveis-de-ambiente.md`: referências a `commissioning.local` atualizadas; exemplo de `FRONTEND_URL` de produção com o domínio novo.
- `CLAUDE.md`: árvore de pastas, seção de Frontend e roadmap atualizados para refletir o novo sistema de branding e a fase 10.
- `package.json` raiz: `"name"` de `comissionamento-saas` para `comisspro`.

## Verificação

- `npx tsc --noEmit --workspace=apps/web` e `npm run build --workspace=apps/web`.
- `npm test` (raiz) — suites de `auth.routes.test.ts`/`users.routes.test.ts` com os e-mails novos.
- Checagem visual (`npm run dev:web` + `npm run dev:api`): aba do navegador (título + favicon), Sidebar, tela de login, em PT-BR e EN; login com `admin@comisspro.com.br` / `mudar123`.
