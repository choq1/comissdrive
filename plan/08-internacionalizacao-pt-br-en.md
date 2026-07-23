# Fase 8 — Internacionalização (PT-BR / EN)

## Objetivo

Traduzir toda a interface para PT-BR (idioma padrão) mantendo suporte a EN, com um botão de troca de idioma na Sidebar, sem depender de biblioteca de i18n externa (evitar risco de incompatibilidade com Next.js 16, recém lançado) e sem reestruturar rotas em `[locale]`.

## Arquitetura

- `apps/web/src/lib/i18n/dictionaries.ts` — dicionário estático (`Record<Locale, Dictionary>`, `Locale = "pt-BR" | "en"`), tipado via `interface Dictionary`, cobrindo todas as áreas de UI (sidebar, páginas, settings, status, gráficos).
- `apps/web/src/lib/i18n/getServerLocale.ts` — lê o cookie `locale` em Server Components (`await cookies()`, já era o padrão do projeto em `lib/api.ts`).
- `apps/web/src/contexts/LanguageContext.tsx` (`LanguageProvider`/`useLanguage()`) — estado mutável no client (diferente do `UserContext`, que é só leitura), persiste a escolha em cookie e chama `router.refresh()` ao trocar, para os Server Components também re-renderizarem no novo idioma.
- `apps/web/src/components/layout/LanguageToggle.tsx` — botão na Sidebar, mesmo padrão visual (`slate-800`/`cyan-300`) já usado nos outros elementos.
- `RootLayout` (`apps/web/src/app/layout.tsx`) lê o locale server-side (igual a `getCurrentUser()`) e envolve a árvore com `LanguageProvider`; `<html lang>` passa a ser dinâmico.

## Moeda

`formatCurrency`/`formatPeriodLabel` (`apps/web/src/lib/format.ts`) passaram a receber `locale` — PT-BR exibe `R$`, EN exibe `$`, **mesmo valor numérico armazenado no banco, sem conversão de câmbio** (decisão confirmada com o usuário: converter exigiria uma taxa de câmbio hardcoded e desatualizada).

## Dado de negócio não é traduzido

Valores cadastrados pelo admin (`department`, `role`, nomes) não passam pelo dicionário — só texto de interface é traduzido. Ver `guia/02-idioma-pt-br-en.md` e `guia/03-funcionarios-e-dados.md`.

## Padrão adotado para todo componente novo

- Server Component: `const dict = dictionaries[await getServerLocale()]`.
- Client Component (`"use client"`): `const { dict, locale } = useLanguage();`.
- `StatusBadge` ganhou uma prop `label` (traduzida) além de `status` (só para o estilo), já que é usado a partir de Server Components que não têm acesso direto ao hook client.
- `DataTable.emptyMessage` deixou de ter default hardcoded em PT-BR — agora é obrigatório, forçando cada call site a passar a mensagem traduzida.

## Testes e verificação

- `npx tsc --noEmit` + `npm run build --workspace=apps/web`.
- Verificado via `curl` com cookie `locale=en`/`pt-BR` em páginas autenticadas (dashboard, employees, settings), confirmando strings e formatação de moeda corretas nos dois idiomas.
- `npm test` (suíte da API) sem impacto — mudança é 100% frontend.

## Documentação viva

Guia de manutenção criado em `guia/02-idioma-pt-br-en.md` — como adicionar uma string nova, como adicionar um 3º idioma.
