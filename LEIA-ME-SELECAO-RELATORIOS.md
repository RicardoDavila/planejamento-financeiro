# Atualização V4.12.72 — conteúdo dos relatórios

Implementação do requisito de escolher campos, tabelas e gráficos antes da exportação.

## Como usar

1. Abra o sistema pelo mesmo ponto de entrada usado anteriormente.
2. Acione o relatório gerencial, o relatório de fluxo de caixa ou a exportação de gráficos.
3. Na aba do relatório, use **Incluir no relatório** para selecionar o conteúdo e as colunas das tabelas. Todos os itens começam selecionados, exceto quando você optou por salvar preferências.
4. Use **Selecionar tudo** ou **Desmarcar tudo**, se desejar.
5. Clique em **Pré-visualizar**. A prévia aparece abaixo da lista.
6. Clique em **Gerar PDF** e escolha **Salvar como PDF** no diálogo do navegador, ou clique em **Imprimir**.

Após qualquer mudança, é necessário atualizar a prévia antes de exportar. Uma seleção vazia bloqueia os botões de exportação. As opções têm rótulos clicáveis e áreas de toque de pelo menos 44 px, em uma coluna em telas pequenas.

## Dados e preferências

A seleção age somente no documento gerado em outra aba. Não exclui lançamentos, não altera filtros, não recalcula valores e não muda o conteúdo das telas do sistema. Totais exibidos mantêm o valor calculado originalmente, mesmo quando uma coluna é ocultada.

As preferências são opcionais, locais ao navegador e separadas pelo título do relatório. Desmarcar **Salvar estas preferências para os próximos relatórios** remove a preferência daquele relatório. Se o navegador impedir armazenamento local, o relatório continua funcionando e informa que não foi possível salvar a preferência.

## Arquivos e compatibilidade

Foram atualizados index.html, distribuicao/app.html e teste-gemini/app.html. O módulo fica incorporado a cada HTML, sem novas dependências de execução. As rotas de gráficos das versões de distribuição geram uma cópia independente, incluindo as imagens dos canvas. A versão e as chaves de cache dos service workers foram atualizadas para V4.12.72.

O ZIP recebido foi preservado. Para atualizar uma instalação, mantenha o procedimento de atualização e backup já utilizado no projeto. Este ZIP contém os arquivos da aplicação e a documentação. Scripts de automação/testes e configurações do GitHub foram excluídos do pacote de instalação para respeitar o limite de 90 arquivos.

## Verificação realizada

Passaram:
- automacao/test_selecao_relatorio.cjs: compilação de todos os scripts inline, geração e idempotência do bootstrap, remoção da impressão automática e integração nas rotas de exportação.
- automacao/test_preservacao_relatorio.cjs: cálculos e painéis originais preservados nas três versões.
- automacao/test_relatorio.cjs: geração, filtros, totais, escape de texto, viewport e tratamento de popup bloqueado; atualizado para exigir prévia antes da impressão.
- automacao/test_relatorios_conciliacao.cjs: saldos, datas efetivas, liquidez, duplicidades e recortes parciais.
- automacao/test_padrao_relatorios.cjs: identidade visual compartilhada e elementos existentes.

Limitação de verificação: o ambiente bloqueou a abertura do Chrome automatizado (spawn EPERM). Portanto, a interação visual em computador e celular e a renderização final do PDF não foram validadas aqui. Os testes foram mantidos fora deste pacote de instalação. A conferência visual deve ser realizada no navegador após aplicar a atualização.
