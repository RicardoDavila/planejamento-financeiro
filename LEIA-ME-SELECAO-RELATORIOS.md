# Correção de traduções, avisos e perfil — V4.12.80

Nome da atualização: Correção de traduções, avisos e perfil

Corrige os textos identificados nas imagens: filtros de rubricas e subitens, agrupamento e opções do fluxo de caixa, modos e resumos da análise, títulos de gráficos, indicadores, explicações, avisos de vencimento/backup, saudação e perfil. Inclui inglês e espanhol, com retorno aos textos originais em português.

O conteúdo cadastrado pelo usuário (nomes, categorias, descrições e subitens) é preservado. Por exemplo, uma categoria chamada CELULAR continua com esse nome. As opções padrão como Todas as Rubricas são traduzidas mantendo o valor interno original; nenhum lançamento ou cálculo é reescrito. Idioma e moeda continuam independentes.

O layout existente foi preservado. As mudanças de perfil apenas permitem reconhecer a saudação traduzida ao apresentar o nome do usuário. Também foi corrigida a aplicação da política de conexão para impedir que a inclusão do host de cotações alterasse o endereço de consulta dos indicadores BCB.

O bloco de notas permanece adiado. O pacote traz o gerador sem a integração de notas e uma verificação dessa ausência, inclusive para quem chegou a enviar a atualização de notas ao repositório antes de adiar a funcionalidade. Arquivos antigos não utilizados podem permanecer no repositório, sem exclusão manual.

## Instalação

Substitua todos os arquivos correspondentes na raiz do projeto, incluindo os arquivos da pasta automacao. Não apague os demais arquivos e não altere publicar.yml. O pacote é complementar às atualizações anteriores de idioma/moeda e pode ser aplicado sobre o envio das notas que não chegou a ser publicado.

Depois da publicação, recarregue a página e selecione inglês em Idioma. Confira os filtros, gráficos, fluxo de caixa, avisos e perfil; volte para português para verificar a restauração. O pacote não é uma publicação automática no GitHub.

## Verificação

Testes de tradução de mensagens fixas e compostas, preservação de nomes e valores dos seletores, troca e retorno de idioma, perfil, avisos e endpoint BCB. Geração das versões públicas e validação de JavaScript. Comparação dos blocos CSS existentes nas três aplicações com a versão anterior, sem alterações.
