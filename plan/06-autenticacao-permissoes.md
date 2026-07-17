# Fase 6 — Autenticação e controle de acesso por role

## Objetivo

Login real (JWT em cookie httpOnly) e enforcement de permissão por `role` (admin vs manager), tanto na API Express quanto nas telas do Next.js.

## Backend (`apps/api`)

- `User` ganhou `passwordHash` (`types/domain.ts`); `PublicUser = Omit<User, "passwordHash">` é o shape devolvido em toda resposta HTTP — nunca o objeto completo. `userController.ts` tem um `toPublicUser()` (exportado de `services/userService.ts`) aplicado em todos os handlers de `list`/`getById`/`create`/`update`.
- `userSchema` (`schemas/user.schema.ts`) exige `password` (min 8) na criação; `userUpdateSchema` aceita `password` opcional (se vier, gera novo hash; se não, mantém o existente). Hash via `bcryptjs` (puro JS — evita toolchain de compilação nativa no Windows com `ts-node-dev`).
- Novo módulo de auth: `services/authService.ts` (`login`), `controllers/authController.ts` (`login`/`logout`/`me`), `routes/auth.routes.ts` montado em `/api/auth`. `POST /api/auth/login` seta um cookie `token` httpOnly (JWT, 8h de validade, `sameSite: "lax"`, `secure` só em produção). `POST /api/auth/logout` limpa o cookie. `GET /api/auth/me` devolve o usuário logado.
- `middleware/auth.ts`: `requireAuth` (valida o JWT do cookie, popula `req.user = { sub, role }`) e `requireRole(...roles)`. Tipagem de `req.user` via augmentation em `types/express.d.ts`.
- Todas as rotas exigem `requireAuth` (exceto `/health` e `/api/auth/login`/`logout`). Mutações de employees/invoices/revenue/rules/commissions exigem `requireRole("admin")`; leitura é liberada para admin+manager. `/api/users` (leitura e escrita) é **admin-only** — gestão de permissões não é dado que manager acompanha.
- `app.ts`: `cors()` trocado por `cors({ origin: FRONTEND_URL, credentials: true })` (cookie cross-origin não funciona com wildcard) + `cookie-parser` registrado antes de `express.json()`.
- Script `apps/api/src/scripts/seedPasswords.ts` (`npm run seed:passwords --workspace=apps/api`): define a senha padrão `mudar123` para usuários existentes sem `passwordHash`. Já rodado uma vez — `users.json` está com os hashes.
- Testes: helper `test-utils/authCookie.ts` gera um JWT de teste (sem depender de bcrypt/login real) para os testes de rotas existentes, todos ajustados com `.set("Cookie", authCookie())`. Novo `auth.routes.test.ts` cobre login (sucesso/senha errada/email inexistente), `/me`, e os códigos 401/403 de rotas protegidas.

## Frontend (`apps/web`)

- **Atenção**: esta versão do Next.js (16.2.10) **renomeou `middleware.ts` para `proxy.ts`** (função exportada `proxy`, não `middleware`) — confirmado em `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md`. Roda em runtime Node.js por padrão, então `jsonwebtoken.verify` funciona sem restrição de Edge Runtime.
- `apps/web/src/proxy.ts`: lê o cookie `token`, valida o JWT (mesmo `JWT_SECRET` da API); sem cookie válido → redirect para `/login`; role `manager` tentando `/settings` → redirect para `/dashboard`. `matcher` exclui `/login`, `_next` e `favicon.ico`.
- `lib/api.ts` (server-only, usa `next/headers` `cookies()` para repassar o cookie da request atual às chamadas para a API) ficou só com as funções de **leitura** usadas por Server Components. Todas as **mutações** (rules/tiers/users) e `login`/`logout` foram para `lib/apiClient.ts` (`credentials: "include"`, sem `next/headers`) — são usadas por Client Components. Essa separação existe porque um módulo que importa `next/headers` quebra ao ser bundlado para o client (erro confirmado em dev: "You're importing a module that depends on next/headers... in the Pages Router").
- `/login` (`app/login/page.tsx` + `components/auth/LoginForm.tsx`): form simples email/senha, chama `login()` de `apiClient.ts`, em sucesso navega para `/dashboard`.
- `lib/session.ts` (`getCurrentUser()`, server-only) + `contexts/UserContext.tsx` (`UserProvider`/`useCurrentUser`): `layout.tsx` busca o usuário logado uma vez e expõe via contexto para os Client Components.
- `Sidebar.tsx`: esconde o item "Settings" quando `role !== "admin"`, mostra nome/role do usuário e botão de logout; não renderiza nada em `/login`.
- `settings/page.tsx`: segunda camada de defesa — `redirect("/dashboard")` se o usuário não for admin, mesmo que o `proxy.ts` já bloqueie.
- `UserPermissionsPanel.tsx`: form de criação de usuário ganhou campo de senha (agora obrigatório na API).

## Variáveis de ambiente (`.env.example`)

```
# apps/api
FRONTEND_URL=http://localhost:3000   # origin liberado pelo CORS (credentials:true não aceita wildcard)

# apps/web
JWT_SECRET=changeme                   # precisa ser IDÊNTICO ao da api — usado pelo proxy.ts para validar a sessão
```

## Credenciais de teste (ambiente fictício, ver seed)

- `admin@commissioning.local` / `mudar123` (role admin)
- `manager@commissioning.local` / `mudar123` (role manager)

## Verificação feita

- `npm run test --workspace=apps/api`: 42 testes, todos passando.
- `npx tsc --noEmit` limpo em `apps/api` (exceto um erro pré-existente não relacionado em `commissionEngine.test.ts`) e em `apps/web`.
- Fluxo ponta a ponta testado via `curl` com cookie jar (sem browser disponível no ambiente): redirect para `/login` sem sessão, login admin/manager, `/settings` acessível para admin e redirecionando para `/dashboard` para manager, Sidebar filtrando o item Settings corretamente por role, logout limpando a sessão e voltando a redirecionar para `/login`.
