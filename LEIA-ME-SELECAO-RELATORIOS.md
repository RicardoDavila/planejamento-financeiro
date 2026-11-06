# V4.12.76 — idioma global na barra atual

Nome sugerido para a atualização: Idioma global sem alterar o layout

## O que foi integrado

A barra superior atual recebe somente um novo botão: Idioma ▾. O menu abre para baixo e oferece Português (Brasil), English e Español. Não foram incorporadas as telas redesenhadas da demonstração.

A preferência se aplica aos textos cadastrados da interface e fica salva no navegador. Na distribuição com contas, o armazenamento utiliza o adaptador isolado da conta. O assistente e os relatórios não recebem seletores próprios.

As páginas de conta acompanham o idioma selecionado na aplicação sem criar outro menu. As janelas de gráficos recebem apenas o idioma da janela principal, sem novo acesso a banco, sessão ou armazenamento.

## Preservação do layout e dos dados

Todos os blocos de CSS existentes nas aplicações, páginas de entrada e janelas de gráficos foram comparados à versão V4.12.75 e preservados. As regras novas se limitam a #pfLanguageButton e #pfLanguageMenu. O botão reutiliza a classe dos itens da barra e o menu aproveita as cores da lista suspensa atual.

Grades, cartões, posições dos painéis, temas, fontes e controles existentes não foram redesenhados. Em idiomas diferentes, textos mais longos podem ter as quebras naturais permitidas pelo CSS já existente.

Registros financeiros, nomes, descrições, observações, códigos de tipos/status, valores de filtros e cálculos permanecem preservados. Os dados dos registros não são reescritos para traduzir a interface. Opções de sistema mantêm seus valores internos originais mesmo quando o texto exibido é traduzido.

A moeda continua BRL. Os formatos numéricos financeiros das rotinas existentes são mantidos, para preservar leitura, impressão e cálculos. Datas por extenso e rótulos de datas cadastrados no módulo acompanham o idioma. Controles e diálogos nativos seguem também as configurações do navegador/sistema.

## Traduções e assistente

O catálogo central tem 761 entradas e está em automacao/idiomas.js. O módulo observa textos dinâmicos e atributos de ajuda sem alterar valores digitados. Novos textos sem tradução cadastrada continuam em português como alternativa segura. Documentos externos, manuais PDF e conteúdo dos registros não são retraduzidos automaticamente.

O assistente local reconhece as consultas predefinidas e termos usuais nos três idiomas, mantendo os cálculos existentes. No Gemini, a pergunta recebe uma instrução para responder no idioma escolhido. Conta, limites, verificação de autorização e ação explícita de envio continuam exigidos. Nenhuma consulta é disparada apenas ao trocar o idioma. Perguntas que ultrapassem o limite após essa instrução devem ser reduzidas; não são truncadas silenciosamente.

Não foi adicionado serviço externo de tradução. A escolha de idioma não envia registros a tradutores externos.

## Instalar a atualização

O ZIP contém 32 arquivos, abaixo do limite de 90. É cumulativo em relação ao projeto originalmente enviado, incluindo as correções anteriores desta conversa.

1. Extraia o ZIP.
2. Copie o conteúdo para a raiz do repositório atual, substituindo os arquivos correspondentes.
3. Inclua todos os arquivos da pasta automacao no mesmo commit. O gerador de publicação depende dos novos módulos e testes.
4. Preserve os demais arquivos, pastas e o workflow .github/workflows/publicar.yml. Este pacote é uma atualização, não um repositório completo.
5. Faça um novo commit na main para publicar.

A tradução deve ser editada em automacao/idiomas.js. O helper automacao/aplicar_idiomas.py incorpora o módulo nos HTMLs; o gerador de publicação mantém as cópias sincronizadas. O módulo separado automacao/idiomas_graficos.js conserva o isolamento das janelas de gráficos.

## Verificações

- Bateria completa de 58 testes de publicação aprovada, incluindo isolamento, sessão, dados financeiros, relatórios e idiomas.
- Geração do site V4.12.76 concluída com verificações de scripts e distribuição.
- Comparação dos estilos existentes com a versão anterior sem alterações.
- Testes específicos de legendas, valores numéricos, nomes do cadastro e valores internos dos filtros preservados.
- Verificação interativa em navegador com uma página de validação isolada: menu global, traduções dinâmicas, preferência após recarregar, filtros com códigos originais, pergunta/resposta local em inglês e registros financeiros intactos. Foram usados somente dados fictícios nessa validação, sem consulta real ao Gemini.
- ZIP conferido contra o arquivo original para garantir a inclusão de todas as alterações necessárias.

A conferência visual foi feita em ambiente de validação, não na sessão financeira real do usuário. A publicação efetiva no GitHub Actions e a conferência final do aplicativo instalado ocorrem após aplicar o pacote.
