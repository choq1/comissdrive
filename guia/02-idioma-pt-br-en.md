# Idioma (PT-BR / EN)

O produto suporta dois idiomas, com um botão de troca (globo + "PT/EN") no rodapé da Sidebar. Idioma padrão: **PT-BR**.

## Como funciona (arquitetura)

- `apps/web/src/lib/i18n/dictionaries.ts` — dicionário estático com todas as strings de interface, organizado por área (`sidebar`, `dashboard`, `employees`, `commissions`, `invoices`, `settings.rules`, `settings.users`, `login`, `status`, `common`, `charts`, `pageHeader`). **Toda string nova de interface precisa de uma chave aqui, nos dois idiomas.**
- `apps/web/src/lib/i18n/getServerLocale.ts` — lê o cookie `locale` em Server Components (páginas `page.tsx`).
- `apps/web/src/contexts/LanguageContext.tsx` (`useLanguage()`) — usado em Client Components (`"use client"`) para ler `{ locale, dict, setLocale }`.
- `apps/web/src/components/layout/LanguageToggle.tsx` — o botão em si; grava o cookie `locale` e chama `router.refresh()` para os Server Components também re-renderizarem no novo idioma.
- `apps/web/src/lib/format.ts` — `formatCurrency`/`formatPeriodLabel` são *locale-aware*: PT-BR mostra `R$`, EN mostra `$` (mesmo valor numérico armazenado, sem conversão de câmbio — decisão de produto, ver `plan/` da implementação de i18n).

## Passo a passo — adicionar um texto novo na interface

1. Adicionar a chave no `interface Dictionary` e nos dois blocos (`"pt-BR"` e `"en"`) em `dictionaries.ts`.
2. No componente:
   - **Server Component** (`page.tsx`): `const dict = dictionaries[await getServerLocale()]`, usar `dict.area.chave`.
   - **Client Component** (`"use client"`): `const { dict } = useLanguage();`, usar `dict.area.chave`.
3. Nunca deixar string literal solta na JSX de telas/componentes de produto — sempre passar pelo dicionário (é o que garante que o toggle funcione).

## Passo a passo — adicionar um 3º idioma (ex: espanhol)

1. Em `dictionaries.ts`: adicionar `"es"` ao `type Locale`, e um novo bloco completo `es: { ... }` em `dictionaries` (copiar a estrutura do `en`, traduzir todos os valores).
2. Em `format.ts`: adicionar o mapeamento de moeda/locale do `Intl.NumberFormat`/`toLocaleDateString` para `"es"` (decidir moeda: manter `$`/`USD` ou definir outra).
3. Em `LanguageToggle.tsx`: hoje é um toggle binário (PT/EN) — com 3+ idiomas, trocar para um `<select>` ou lista de opções.
4. Em `getServerLocale.ts`: incluir `"es"` na validação do valor do cookie.

## Dado de negócio NÃO é traduzido automaticamente

Valores cadastrados pelo admin (nome de departamento, cargo, nome de funcionário, nome de regra de comissão) **não passam pelo dicionário** — são dados reais do banco, exibidos como foram digitados, independente do idioma da interface. Se um cliente quer ver "Vendas" em vez de "Sales", o caminho é editar o dado (ver [`03-funcionarios-e-dados.md`](03-funcionarios-e-dados.md)), não mexer no dicionário.

## Verificação

- `npx tsc --noEmit` (o `Dictionary` interface é tipado — string faltando em um dos idiomas quebra o build).
- Testar manualmente clicando no botão de idioma em cada tela (Dashboard, Employees, Commissions, Invoices, Settings, Login) e conferir que nada ficou em inglês/português "vazado".
