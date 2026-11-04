# Correção: salvar gráficos em PDF sem voltar ao login

Este pacote contém 8 arquivos. Extraia e envie o conteúdo ao GitHub mantendo as pastas, substituindo os arquivos existentes. Não envie o ZIP sem extrair.

Base: atualização dos relatórios já entregue nesta conversa.

## Defeito corrigido
O observador de largura/tipo de ponteiro recarregava a página em qualquer mudança. A prévia de impressão pode alterar essas consultas de mídia, e a recarga faz a versão pessoal solicitar novamente o login. A distribuição recupera seu acesso de forma diferente.

A correção ignora eventos durante a impressão e sua transição de retorno. Antes de recarregar por uma mudança real de layout, confere o valor atual da consulta, evitando eventos antigos da prévia.

A proteção de acesso, os dados, os relatórios, filtros e gráficos são preservados. Não mantém senha nem cria sessão automática.

## Conferir após a publicação
1. Aguarde o workflow de publicação do GitHub concluir.
2. Abra a versão pessoal, entre e acesse Gráficos e evoluções.
3. Salve um PDF; confirme que o sistema continua aberto e autenticado.
4. Repita cancelando a janela de impressão.

A regressão é coberta por testes de mudanças de mídia, repetição, cancelamento e troca real de layout. O ambiente bloqueia a abertura de arquivos locais no navegador, portanto a conferência do diálogo nativo de impressão deve ser feita no aplicativo publicado.
