# Guia de manutenção e adaptação para clientes

Este diretório é o **manual operacional** do produto — o lugar a consultar sempre que for necessário alterar algo em produção para adaptar a ferramenta a um novo cliente (nome, logo, idioma, dados cadastrais, usuários, ambiente).

Diferente de `plan/` (histórico de planos de implementação, um arquivo por fase, nunca editado depois de concluído), os arquivos aqui **são vivos**: refletem o estado atual do produto e devem ser atualizados sempre que um plano os afetar.

## Regra de manutenção

**Todo plano implementado que mude algo descrito aqui (nome/marca, idiomas, dados cadastrais editáveis, papéis de usuário, variáveis de ambiente, deploy) deve terminar com a atualização do arquivo correspondente neste diretório.** Se o plano introduzir um tópico novo de manutenção que ainda não tem arquivo, criar um novo `guia/NN-topico.md` seguindo a numeração sequencial. Essa regra também está registrada em `CLAUDE.md` → Convenções.

## Índice

| Arquivo | Assunto |
|---|---|
| [`01-nome-e-marca.md`](01-nome-e-marca.md) | Trocar o nome do produto, inserir logotipo, favicon |
| [`02-idioma-pt-br-en.md`](02-idioma-pt-br-en.md) | Como funciona o botão de idioma (PT-BR/EN), como adicionar textos novos ou um 3º idioma |
| [`03-funcionarios-e-dados.md`](03-funcionarios-e-dados.md) | Editar/cadastrar funcionários (departamento, cargo, etc.) pela tela, e o cuidado com `CommissionRule.appliesTo` |
| [`04-usuarios-e-permissoes.md`](04-usuarios-e-permissoes.md) | Criar/gerenciar usuários admin e manager, senha padrão de ambiente de teste |
| [`05-variaveis-de-ambiente.md`](05-variaveis-de-ambiente.md) | Variáveis de ambiente por cliente/ambiente (banco, JWT, URLs) |
| [`06-importacao-de-dados.md`](06-importacao-de-dados.md) | Importação em massa de Funcionários/Faturamento/Faturas/Vendas via planilha (.xlsx/.csv) |
| [`07-vendas-e-faturamento.md`](07-vendas-e-faturamento.md) | Vendas granulares por item, agregação para faturamento, cálculo de comissão, ranking de itens |
