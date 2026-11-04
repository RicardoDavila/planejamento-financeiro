# Correção — menu, Tipo de pessoa e seleção

Aplicar sobre a atualização anterior de PC e Distribuição.

1. Extraia o ZIP e envie seus arquivos à raiz do repositório, preservando as pastas automacao e distribuicao.
2. Commit sugerido: Corrige menu, tipo de pessoa e seleção
3. Aguarde a publicação em Actions e atualize a página do aplicativo.

## Corrigido

- Menu superior em lista suspensa compacta, como na prévia aprovada, sem busca, cabeçalho extenso ou rodapé de perfil. Ações originais e verificação de permissão preservadas. Fecha ao escolher uma ação, clicar fora ou pressionar Escape.
- Coluna Tipo de pessoa entre Descrição e Valor. Clique no valor para filtrar; cadastro continua em Novo/Editar lançamento. Registros sem classificação mostram Não classificado.
- Seleção em coluna própria, com uma caixa por linha. Datas de vencimento e pagamento permanecem somente datas.
- Atualizações repetidas não acrescentam caixas nem texto on. A decoração da tabela é reconstruída após o processamento da apresentação antiga.
- Demais colunas, Editar e Lixeira preservados.

O módulo continua exclusivo do PC e da Distribuição no PC. Os blocos do modo Celular permanecem iguais aos da base anterior.

Validação: teste específico simula quatro atualizações consecutivas, incluindo o processamento antigo que convertia o checkbox em on. Confere uma seleção por linha, Tipo de pessoa e preservação das datas, valores, observação e ações. Inclui as suítes anteriores do projeto.
