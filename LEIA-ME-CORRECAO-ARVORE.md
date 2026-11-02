# Correção da árvore de rubricas — V4.12.44

Clique na barra da rubrica para abrir suas descrições com as barras correspondentes logo abaixo. Outro clique recolhe a árvore. A expansão permanece ao atualizar a análise e funciona por clique ou teclado. A seleção de uma descrição mantém seu detalhamento visível após atualizar o filtro.

O problema era uma disputa entre o evento nativo de abertura/recolhimento, que é enfileirado pelo navegador, e o filtro rápido, que redesenhava imediatamente as barras. A correção alterna a árvore e registra seu estado de forma síncrona antes de aplicar o filtro. A restauração dos detalhes também reconhece os pontos de descrições, além dos pontos das rubricas principais.

Os filtros de rubrica, subitem e descrição continuam disponíveis, com Limpar filtro para restaurar o recorte anterior. A correção foi incorporada às três telas: index.html, distribuicao/app.html e teste-gemini/app.html. Não há alteração de cálculos, transações, autenticação ou sincronização.

Validação: 45 testes aprovados. O novo teste reproduz o redesenho durante o clique e verifica se a árvore foi salva aberta/recolhida antes dele. A conferência no navegador executou as funções de análise, o listener de toggle e as camadas reais do projeto com dados fictícios; confirmou barras filhas de receitas e despesas, atualização, clique repetido, teclado, detalhes da descrição e Limpar filtro.

Publicação: extraia o ZIP de correção e envie todo o conteúdo na raiz do repositório, preservando as pastas. Inclua index.html da raiz. São menos de 100 arquivos. Após o Actions concluir com sucesso, aceite a atualização existente no aplicativo. Nenhuma publicação remota foi feita nesta entrega.

Nome sugerido do commit: Corrige expansão das barras em árvore.
