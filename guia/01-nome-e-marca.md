# Nome do produto, logotipo e favicon

O nome, descrição e logos do produto vêm de uma **config central**, não de texto espalhado pelo código: `apps/web/src/lib/branding.ts`. Trocar de marca (ex: para um cliente novo) é editar esse arquivo + sobrescrever os arquivos de imagem — sem caçar JSX em várias telas.

## Config central — `apps/web/src/lib/branding.ts`

```ts
export const branding = {
  name: "ComissPro",
  description: "SaaS de cálculo de comissionamento",
  domain: "comisspro.com.br",
  logos: {
    small: { src: "/brand/logo-small.svg", width: 105, height: 28 },
    medium: { src: "/brand/logo-medium.svg", width: 271, height: 100 },
  },
} as const;
```

| Campo | Onde aparece |
|---|---|
| `name` | Título da aba do navegador (`layout.tsx` → `metadata.title`), `alt` das imagens de logo |
| `description` | Meta description da página (SEO) |
| `domain` | Documentação/referência (ver [`04-usuarios-e-permissoes.md`](04-usuarios-e-permissoes.md) para os e-mails de usuários do ambiente de teste) |
| `logos.small` | Logo na Sidebar (`Sidebar.tsx`, via `<BrandLogo size="small" />`) |
| `logos.medium` | Logo na tela de login (`login/page.tsx`, via `<BrandLogo size="medium" />`) |

O componente `apps/web/src/components/layout/BrandLogo.tsx` é o único lugar que renderiza logo — lê `branding.logos` e usa `<img>` puro (SVG local não passa pelo otimizador do `next/image`, que bloqueia SVG por padrão).

## Passo a passo — trocar o nome

1. Editar `name`, `description` e `domain` em `apps/web/src/lib/branding.ts`.
2. Rodar `npx tsc --noEmit --workspace=apps/web` e `npm run build --workspace=apps/web` para garantir que nada quebrou.

## Passo a passo — trocar as artes (logo + favicon)

Todas as artes do produto moram em dois lugares, sempre com os **mesmos nomes de arquivo** — trocar de cliente é sobrescrever esses arquivos, mantendo formato SVG e proporção parecida:

| Arquivo | Uso | Características esperadas |
|---|---|---|
| `apps/web/public/brand/logo-small.svg` | Sidebar | ícone + wordmark, **sem fundo** (fica sobre `bg-slate-950`) |
| `apps/web/public/brand/logo-medium.svg` | Tela de login | ícone + wordmark, pode ter fundo próprio (usado "em bloco") |
| `apps/web/public/brand/logo-large.svg` | Reservado para uso futuro (marketing/material maior) | ícone + wordmark, fundo próprio |
| `apps/web/public/brand/favicon.svg` | Referência da arte do ícone (não usada diretamente pelo navegador) | só o ícone, sem wordmark |
| `apps/web/src/app/icon.svg` | Favicon real (convenção do Next.js — ver abaixo) | mesma arte do favicon, ícone quadrado |
| `apps/web/src/app/apple-icon.png` | Ícone para tela de início no iOS | PNG, mesma arte, fundo sólido (PNG não suporta transparência bem em todos os contextos de apple-touch-icon) |

Se as dimensões dos novos logos forem muito diferentes das atuais, ajustar `width`/`height` de `branding.logos` em `branding.ts` para não distorcer.

## Sobre o favicon (ícone da aba do navegador)

Diferente de versões antigas do Next.js, **não existe mais `favicon.ico` neste projeto**. O App Router (Next.js 16) reconhece automaticamente `apps/web/src/app/icon.svg` como o favicon — não precisa registrar nada em `layout.tsx`. Basta substituir esse arquivo. Ver `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/01-metadata/app-icons.md` para as convenções completas (`icon`, `apple-icon`, `favicon`) caso seja necessário voltar a usar `.ico`.

## Verificação

- `npm run dev:web` e conferir visualmente: aba do navegador (título + favicon), Sidebar, tela de login.
- Testar em ambos os idiomas (o nome da marca não muda entre PT-BR/EN, então deve aparecer igual nos dois).
