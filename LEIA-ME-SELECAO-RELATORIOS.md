# V4.12.73 — PDF e impressão na análise mensal

## O que mudou

A coluna “Análise do mês de receitas e despesas por rubrica e evolução” agora tem Salvar em PDF e Imprimir no topo. Cada gráfico também tem seus próprios botões, junto ao seletor do tipo de gráfico.

Os botões do topo preparam os quatro gráficos. Os botões individuais preparam apenas o gráfico correspondente. O relatório mantém a visualização selecionada (áreas, pizza, colunas ou padrão), com título do projeto, logotipo incorporado, período, filtros e data de emissão. A apresentação usa fundo branco para impressão. Não depende do carregamento externo do logotipo.

Antes da saída, o relatório apresenta a seleção de conteúdo e a prévia. Clique em Pré-visualizar e, depois, Gerar PDF ou Imprimir. Para o PDF, escolha Salvar como PDF no diálogo do navegador.

Os dados, filtros e gráficos da tela original permanecem preservados. As verificações de acesso são repetidas antes de abrir o documento. Se a aba for bloqueada pelo navegador, o sistema informa que é necessário permitir sua abertura.

## Instalação

Este ZIP contém 18 arquivos e inclui cumulativamente a correção anterior da publicação e a seleção dos relatórios.

Extraia e copie o conteúdo para a raiz do repositório atual, substituindo os arquivos correspondentes. Inclua a pasta automacao no commit. Preserve os demais arquivos e pastas do repositório; este pacote é uma atualização, não um repositório completo. Faça um novo commit na main para publicar.

## Verificação

- A bateria de 56 testes usada pelo workflow passou.
- O teste específico de exportação mensal passou: relatório completo e individual, cabeçalho, logotipo, período, filtros, tipo selecionado, escape de texto, bloqueio de acesso e popup bloqueado.
- A compilação dos scripts das três versões passou.
- A geração do site V4.12.73 concluiu com sucesso, incluindo as verificações de distribuição.
- O ZIP foi comparado ao projeto original para conferir que inclui todas as alterações necessárias.

A interação visual em navegador, celular e o PDF renderizado continuam sem conferência visual neste ambiente, que bloqueia a abertura do Chrome automatizado. Os testes de exportação usam documentos simulados e não substituem essa conferência visual.
