# Usuários e permissões (admin / manager)

## Papéis

Dois papéis (`role`), mesma aplicação:

- **admin**: acesso total — cadastra funcionários, faturamento, regras de comissão, gerencia usuários, vê tudo.
- **manager**: acesso de leitura a Dashboard/Employees/Commissions/Invoices; **não** vê a tela Settings nem os controles de adicionar/editar/excluir em Employees (a Sidebar já esconde esses itens pra esse role, e a API rejeita a mutação com 403 mesmo que alguém tente forçar).

## Onde gerenciar usuários

Tela **Settings** (`/settings`, admin-only) → painel "User Permissions": criar usuário, trocar role de um usuário existente, excluir usuário. Campos: nome, email, senha, role, funcionário vinculado (opcional).

## Senha padrão de ambiente de teste

`apps/api/src/scripts/seedPasswords.ts` define a senha `mudar123` para os dois usuários fictícios do seed (`admin@comisspro.com.br`, `manager@comisspro.com.br`). Rodar com:

```
npm run seed:passwords --workspace=apps/api
```

**Nunca usar essa senha/esses usuários em produção real de um cliente** — são só para ambiente de desenvolvimento/demo.

## Passo a passo — preparar o primeiro admin de um cliente novo

1. Rodar o seed do banco (`npx prisma db seed --workspace=apps/api`) só se for usar os dados de exemplo — normalmente **não** é o caso para um cliente real (ver [`03-funcionarios-e-dados.md`](03-funcionarios-e-dados.md) para cadastrar os funcionários reais do cliente).
2. Criar o usuário admin do cliente diretamente via `POST /api/users` (não tem UI de "primeiro cadastro" — a tela de Settings já exige estar logado como admin, então o primeiro admin precisa ser criado via API ou diretamente no banco).
3. A partir daí, esse admin consegue logar em `/login` e cadastrar o resto (funcionários, regras, outros usuários) pela interface.

## Sessão

JWT em cookie httpOnly `token`, 8h de validade. Login/logout em `/api/auth/login` e `/api/auth/logout`. Ver `CLAUDE.md` → "Autenticação e controle de acesso" para detalhes técnicos.
