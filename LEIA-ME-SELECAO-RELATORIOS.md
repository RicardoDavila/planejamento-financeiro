# V4.12.74 — corretor ortográfico em português

## Como usar

Ao clicar em um campo de descrição, observações ou texto de classificação, aparece a indicação ABC com instruções. O campo solicita ao navegador verificação ortográfica em português do Brasil.

Palavras suspeitas podem ser sublinhadas pelo navegador. No computador, clique com o botão direito sobre a palavra para consultar as sugestões. No celular, as sugestões e sua apresentação dependem do teclado instalado.

A correção ortográfica em português precisa estar habilitada no navegador ou teclado. O sistema não tem um dicionário próprio e não garante a detecção de todos os erros. A marcação visual, a disponibilidade do dicionário e as sugestões dependem do navegador, de suas configurações e do teclado.

O código não substitui palavras, não salva correções automaticamente e não envia os textos a um serviço de correção próprio. O corretor do navegador obedece às configurações de privacidade do próprio navegador. Senhas, e-mails, credenciais, datas e campos numéricos não recebem a assistência deste módulo.

Os campos criados dinamicamente durante a edição também recebem a configuração quando são focados. O título e a indicação de ajuda são mantidos acessíveis sem substituir os rótulos dos campos.

## Instalação

Este pacote é cumulativo: inclui as melhorias anteriores dos relatórios, os botões de PDF/impressão com cabeçalho e logotipo e a correção dos testes de publicação.

Extraia e copie os arquivos para a raiz do repositório atual, substituindo os correspondentes. Inclua a pasta automacao no commit. Não exclua os demais arquivos do repositório. Depois, faça um novo commit na main para publicar.

## Verificação

Os 56 testes de publicação passaram. As verificações de sintaxe dos scripts das três versões passaram. A geração do site V4.12.74 concluiu com sucesso. A verificação visual do sublinhado e das sugestões deve ser feita no navegador ou teclado usado pelo usuário; esse recurso é fornecido pelo navegador, e não pelo JavaScript da aplicação.
