# V4.12.77 — Consulta e relatórios em outras moedas

Nome da atualização: Consulta e relatórios em outras moedas

A barra superior recebe o menu Moeda, independente de Idioma, com BRL, USD e EUR. O layout e os estilos existentes foram preservados. A preferência é salva no navegador; na distribuição, usa o armazenamento isolado da conta.

A conversão é apenas visual, a partir dos valores originais em reais. Edição, registros, cálculos, histórico e backups continuam em BRL. Voltar para BRL recupera diretamente o valor original, sem conversão inversa. Os gráficos mantêm suas séries numéricas em BRL e adaptam a apresentação dos valores monetários.

As cotações vêm do Banco Central (PTAX de venda/fechamento). O menu informa a moeda-base, a taxa, a fonte, a data do fechamento e a consulta. A opção Atualizar cotação permite buscar novamente. Se a atualização falhar, a cotação salva é identificada com sua data; se nenhuma cotação válida estiver disponível, os valores continuam em R$ e a emissão em moeda estrangeira é bloqueada com aviso. A consulta ao BCB envia apenas moeda e intervalo de datas, sem lançamentos ou valores financeiros.

Os relatórios usam uma cópia da cotação na emissão e informam sua fonte e data. Cabeçalho, logotipo, seleção de itens, prévia, impressão e PDF existentes foram mantidos. Um relatório aberto não muda quando a moeda de consulta é alterada. As janelas auxiliares recebem a apresentação da janela principal, sem novo acesso a banco, contas ou armazenamento.

## Instalação

Extraia o ZIP na raiz do repositório e substitua os arquivos de mesmo nome, incluindo a pasta automacao. Não apague os demais arquivos. O pacote contém somente arquivos novos ou alterados desde o ZIP original e inclui as atualizações anteriores desta conversa.

Esta é uma atualização dos arquivos do projeto. A publicação no site depende de enviar esses arquivos ao repositório e concluir o fluxo de publicação.

## Verificação

Testes automatizados de preservação financeira, isolamento entre contas, relatórios, idiomas e conversão; geração das versões públicas com validação de JavaScript. Teste no navegador do módulo integrado com dados fictícios e PTAX real: USD, relatório com taxa fixa, edição/histórico em R$ e retorno ao valor original. Impressão física não foi acionada.
