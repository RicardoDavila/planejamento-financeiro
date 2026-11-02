# Rubricas, Subitens e Descrições clicáveis — V4.12.43

Preparado para aplicação posterior. Nenhuma publicação no GitHub foi executada.

## Uso

Clique no nome de uma rubrica, subitem ou descrição para mostrar os lançamentos com o mesmo valor nesse campo. O filtro é exato: uma descrição não é confundida com outra que apenas contém parte do nome. Rubricas e subitens vazios podem ser selecionados pelos atalhos correspondentes do celular.

Uma seleção substitui a anterior. O aviso informa o campo e o valor em uso. **Limpar filtro** restaura o período e os filtros definidos antes da primeira seleção. Clicar de novo no mesmo texto também remove o filtro. Os cartões financeiros da versão anterior continuam funcionando e podem substituir a seleção de um item.

O filtro respeita o período, a busca e os demais filtros já escolhidos. Uma combinação sem resultados exibe a lista vazia e mantém o botão de limpeza disponível. A escolha só permanece na memória da página e é removida ao recarregar ou bloquear o acesso.

## Pontos de aplicação

- Lista de lançamentos no PC: Rubrica, Subitem e Descrição que já aparecem como texto.
- Tela própria do celular: cada rubrica e subitem é um alvo separado na linha abaixo da descrição; clicar na descrição também filtra. Nos detalhes do lançamento há botões de filtro para os três campos, acessíveis pelo teclado.
- Análise mensal: clicar na rubrica abre/recolhe suas descrições e aplica o filtro da rubrica. Clicar na barra de uma descrição abre os detalhes e aplica o filtro da descrição.
- Ranking e gráficos por rubrica ou descrição: o clique continua abrindo os lançamentos e aplica o campo identificado quando o ponto corresponde a um único valor desse campo.
- Detalhamento de Gráficos e Evoluções e tabelas de detalhes abertas pelos gráficos: rubricas e descrições podem ser clicadas.
- Previsão dos próximos 30 dias: descrições podem ser clicadas.

As mesmas fontes estão incorporadas em index.html, distribuicao/app.html e teste-gemini/app.html. A distribuição usa o layout móvel no celular. Menus de configuração e campos de edição continuam com suas funções existentes; não há filtro ao clicar em botões de editar, excluir ou cadastrar. Relatórios já gerados continuam sendo retratos do recorte existente no momento da geração; gere novamente para usar a seleção nova.

## Publicação quando aprovada

Extraia o pacote de atualização e envie **todo o conteúdo extraído** na raiz do repositório atual, preservando as subpastas. Inclua o index.html principal. O pacote tem menos de 100 arquivos para caber em um envio pelo GitHub. Após a execução do Actions terminar com sucesso, reabra o aplicativo e use o fluxo existente de atualização do PWA. Não envie somente o ZIP como arquivo no site.

Nome sugerido para o commit: **Filtra rubricas, subitens e descrições**.

## Manutenção e validação

Fontes novas: automacao/filtros_dinamicos.js e automacao/filtros_dinamicos.css. A seleção é compartilhada com automacao/filtros_cartoes.js. Aplique as camadas na ordem: aplicar_icones.py, aplicar_graficos.py, aplicar_filtros_cartoes.py e aplicar_filtros_dinamicos.py, na pasta automacao. Não há novas dependências externas nem gravações em transações, contas ou armazenamento por essa camada.

44 testes automatizados aprovados, com cobertura ampliada para os três campos, campos rejeitados, troca entre cartões e itens, limpeza, período, bloqueio e integração nas três telas. A verificação no navegador usou dados fictícios: confirmou os três filtros no PC e celular, teclado no PC, limpeza da lista, filtro de rubrica no ranking, expansão da rubrica mensal e seleção de sua descrição. Os arquivos de conta e isolamento permanecem idênticos em bytes à V4.12.42.
