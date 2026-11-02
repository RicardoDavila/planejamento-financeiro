# Gráficos selecionáveis e lançamentos — V4.12.40


Esta versão amplia os controles para os 11 gráficos das telas financeiras, os dois gráficos do relatório Gerencial e os quatro do relatório de Fluxo de Caixa. Cada gráfico começa em **Padrão (original)**. O seletor oferece Linhas, Áreas, Colunas, Barras horizontais, Pizza, Rosca e Dispersão.

Clique em barras, pontos ou fatias para abrir as descrições e os lançamentos correspondentes abaixo do gráfico. Outro clique recolhe. A opção “Ver pontos e lançamentos” permite acessar os mesmos dados pelo teclado. Nas rubricas da análise mensal, a expansão original permanece no formato padrão.

Dispersão permite escolher as séries dos eixos X e Y e exige duas séries numéricas comparáveis. Pizza e rosca exibem percentuais de uma série positiva e aditiva; saldos acumulados, valores negativos ou totais zerados recebem uma explicação e mantêm o gráfico original. Mais de oito fatias são agrupadas em “Outros”, preservando os lançamentos do grupo. Indicadores derivados exibem os registros que participam do cálculo, sem duplicá-los nos totais.

As escolhas permanecem apenas na memória da página. Os relatórios recebem os dados do recorte no momento da abertura e mantêm o formato escolhido na impressão. A nova camada não adiciona dependências externas. Login, isolamento, cálculos e sincronização permanecem preservados.

Para manter os módulos incorporados, execute `python automacao/aplicar_icones.py` e depois `python automacao/aplicar_graficos.py`. Fontes: `automacao/graficos_interativos.js` e `.css`. A segunda aplicação é idempotente.

Validação desta entrega: 43 testes aprovados; verificação no navegador com dados fictícios, incluindo relatórios, celular, bloqueio de acesso e preservação dos dados dos gráficos originais. As notas abaixo registram as revisões anteriores.

A V4.12.39 acrescenta expansão por clique apenas aos quadros de Receitas por Rubrica e Despesas por Rubricas da análise mensal. Os títulos incluem “(clique na barra para abrir lançamentos)”. Cada rubrica começa recolhida; ao clicar ou usar Enter/Espaço, exibe as barras das descrições logo abaixo. Outro clique recolhe os detalhes.

Descrições iguais são somadas dentro da mesma rubrica e do mesmo tipo. As barras seguem os filtros ativos. O total da rubrica permanece na barra principal e não é somado novamente aos indicadores. A expansão é mantida em memória durante as atualizações da lista e limpa ao bloquear o painel. A evolução mensal e os demais gráficos permanecem como estavam.

Foram acrescentados testes de agrupamento, filtros, separação entre receitas/despesas, expansão, dados vazios e segurança dos textos. O hash de referência do bloco de layout desktop foi atualizado para esta alteração autorizada; os outros hashes foram preservados.

A V4.12.38 substitui a carteira genérica do cabeçalho das janelas de Ajuda, Manuais, Versão e Sobre pelo PNG oficial do projeto, incorporado ao HTML. Não depende de rede nem modifica os ícones funcionais de PDF, links ou fechamento. Os textos e os comportamentos dessas janelas permanecem iguais.

A V4.12.37 uniformiza as cores dos títulos e ícones do resumo inicial no tema escuro com as famílias mais claras de Gráficos e Evoluções. A cor do valor de Investimentos também foi clareada. A correção está em `automacao/tema_escuro_resumo.css`, incorporada pelo mesmo comando de manutenção. Não modifica o tema claro nem a impressão.

Esta atualização acrescenta ícones sem renomear categorias, cartões, situações, menus ou botões. Os valores e textos continuam sendo os originais.

Aplicação: resumos do PC e do celular, tipos e situações dos lançamentos, navegação lateral/inferior e cartões dos relatórios. A mesma camada foi incluída na versão pessoal, na distribuição e na cópia teste-gemini existente.

Os ícones são SVG decorativos incorporados ao HTML. Não exigem instalação, APK, nova biblioteca, cadastro ou conexão adicional. Os nomes continuam acessíveis aos leitores de tela; os símbolos não são anunciados repetidamente.

Os cálculos, dados, login, isolamento das contas e sincronização foram preservados. A exibição dos ícones acompanha as atualizações das listas, sem modificar as funções financeiras. Os relatórios recebem os mesmos desenhos e continuam compreensíveis na impressão em preto e branco.

## Publicação no repositório atual

Extraia o ZIP e atualize os arquivos do projeto no seu repositório, mantendo a estrutura das pastas. Não envie apenas o ZIP como um arquivo dentro do site. Mantenha suas configurações de GitHub Pages e os demais arquivos de configuração existentes no repositório.

Os arquivos de versão e os caches do PWA foram atualizados para V4.12.40. Depois da publicação, os usuários devem usar o fluxo de atualização já existente no aplicativo. Nenhuma publicação remota foi executada durante esta entrega.

Esta revisão completa os cartões e os títulos de Gráficos e Evoluções, a impressão do painel e os relatórios Gerencial e de Fluxo de Caixa. Reconhece os símbolos antigos no início dos rótulos e os substitui pelo SVG correspondente, sem modificar as palavras. O Fluxo de Caixa passa pela camada de ícones antes de abrir a nova aba.

## Manutenção

As fontes da camada visual estão em `automacao/icones_interface.js` e `automacao/icones_interface.css`. Após editá-las, execute:

```powershell
python automacao/aplicar_icones.py
```

Esse comando incorpora a camada nas três telas e pode ser repetido sem duplicar ícones. O gerador de distribuição existente também preserva o bloco incorporado ao HTML pessoal.

## Verificação

Foi feita comparação com o ZIP original: nas três telas financeiras, removendo a camada de ícones, sua chamada na geração do Fluxo de Caixa e normalizando o número da versão, o HTML e o JavaScript originais permanecem idênticos. Os arquivos de acesso e isolamento permanecem idênticos em bytes.

Os testes existentes do projeto foram executados. Uma página de verificação isolada no navegador também confirmou a preservação dos textos, os ícones de tipo/situação, a atualização de linhas, a ausência de duplicações e os ícones nos relatórios. A página usa exemplos fictícios e não faz parte do aplicativo entregue. Não foi realizado login em contas reais ou alteração de dados na nuvem.
