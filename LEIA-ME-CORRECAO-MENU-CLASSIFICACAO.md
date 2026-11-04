# Correção — menu livre, Observação e classificação PF/PJ

Aplicar sobre as atualizações anteriores de PC e Distribuição. Extraia o ZIP e envie o conteúdo à raiz do repositório, preservando as pastas automacao e distribuicao.

Commit: Ajusta menu, observação e classificação PF/PJ

## Menu

A lista suspensa agora tem um elemento próprio, sem o painel visual antigo. Não contém título, caixa de busca, cartão de ação principal ou perfil. Exibe somente os itens, preservando as ações e as verificações de permissão originais. Fecha por clique fora, escolha de uma ação ou Escape.

## Observação

As larguras foram definidas para as 12 colunas atuais, em vez da configuração antiga de 10 colunas. Observação recebeu espaço próprio, fonte de 10 px e quebra normal do texto; o cabeçalho não quebra letra por letra. Em janelas menores, a rolagem horizontal permite acessar todas as colunas sem comprimir Observação em uma faixa lateral.

## Pré-classificação solicitada

Ao abrir a aplicação no PC, depois da autenticação, os lançamentos sem classificação são preenchidos e gravados usando a regra autorizada:

- Rubrica EMPRESA: PJ (independente de maiúsculas ou espaços nas extremidades).
- Demais rubricas: PF.

A regra também atende lançamentos antigos/históricos. Registros já definidos como PF ou PJ são preservados. Uma escolha manual de Não classificado também é preservada após a edição.

Em Novo lançamento, o tipo de pessoa sugerido acompanha a rubrica enquanto você não escolher manualmente outro tipo. Em Editar, a classificação existente é mantida e pode ser alterada. As escolhas manuais não são sobrescritas pela pré-classificação.

A classificação fica no cadastro e acompanha a sincronização existente. O layout, os menus e as funções do modo Celular não foram alterados; a pré-classificação é executada no PC.

## Validação

Testes específicos executam o menu e suas ações legadas, conferem ausência de título/cartões na nova lista, validam idempotência da pré-classificação e preservação de escolhas manuais. Mantidos os testes de seleção sem duplicidade, datas e demais funcionalidades. A validação visual interativa no Chrome não foi automatizada neste ambiente.
