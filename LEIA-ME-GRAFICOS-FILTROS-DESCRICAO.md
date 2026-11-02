# Gráficos: cartões e receitas por descrição — V4.12.47

Os sete cartões do Painel Executivo em Gráficos e Evoluções agora são clicáveis e acionáveis por Enter/Espaço. O aviso identifica a seleção e contém **Limpar filtro**. Clicar novamente no mesmo cartão também remove sua seleção.

| Cartão | Lançamentos considerados |
|---|---|
| Receitas previstas | Receitas |
| Receitas recebidas | Receitas com o mesmo critério de recebimento usado pelo cartão original |
| Despesas previstas | Despesas |
| Despesas vencidas | Despesas com status Vencido |
| Saldo previsto | Receitas e despesas que compõem o saldo do painel |
| Taxa de poupança prevista | Receitas e despesas que compõem o indicador |
| Comprometimento | Despesas que representam o comprometimento |

Os filtros rápidos da janela de gráficos são independentes dos filtros rápidos da página principal. Abrir a janela remove a seleção rápida anterior dessa janela e os critérios antigos de descrição/status/faixa de valores; o fluxo existente inicializa rubrica, subitem e tipo como Todos e utiliza o período da página principal. Selecionar EMPRESA na página principal não reduz silenciosamente o ranking ao abrir os gráficos. A seleção da página principal permanece preservada ao usar e fechar a janela. Limpar filtro em uma tela não limpa a seleção rápida da outra.

O Ranking de rubricas — despesas continua agrupado por rubrica e respeita os critérios explicitamente ativos na janela. Não houve mudança na regra de agrupamento do ranking: o item único relatado era consequência do filtro herdado.

Em Distribuição por Rubrica (Prev de Receita), o nome do gráfico foi mantido, mas suas barras agora apresentam os itens que compõem as receitas, agrupados por **Descrição**. Descrições iguais são somadas, inclusive quando pertencem a rubricas diferentes dentro do recorte. O campo de busca Descrição e os demais critérios continuam sendo aplicados antes do agrupamento. Uma nota sob o título informa esse agrupamento. Descrições vazias aparecem como Sem descrição.

Clicar em uma barra dessa composição abre os lançamentos da descrição e aplica o filtro exato de Descrição apenas na janela de gráficos. Uma descrição igual ao nome de uma rubrica continua sendo interpretada como descrição. Limpar filtro restaura o recorte anterior. As outras abas e os comparativos preservam seus agrupamentos anteriores.

Validação: 46 testes aprovados. Cobertura ampliada para os sete cartões, independência entre as duas telas, limpeza, reabertura, agrupamento e busca por descrição, descrições repetidas, nomes especiais, vazios, colisão entre nome de rubrica e descrição, preservação dos totais e das despesas. O navegador executou as funções reais de filtros, indicadores, ranking e gráficos com dados fictícios e confirmou a seleção EMPRESA na página principal sem restringir a abertura dos gráficos, cartão de despesas, barras Salário/Bônus, detalhamento por descrição e reabertura com ranking completo.

Fontes maiores do celular, tema escuro, formatos iniciais dos quatro gráficos da página principal, cálculos, autenticação e sincronização foram preservados. Os arquivos de conta e isolamento permanecem idênticos em bytes à entrega anterior. Pontos PFCE/PFQF fazem o agrupamento visual e aplicam os filtros aos dados de entrada; as fórmulas dos indicadores não foram alteradas.

Publicação: extraia o ZIP de atualização e envie todo o conteúdo na raiz do repositório existente, preservando as subpastas e incluindo index.html da raiz. O pacote contém menos de 100 arquivos. Após o Actions concluir, use a atualização existente do aplicativo. Nenhuma publicação remota foi feita nesta entrega.

Nome sugerido do commit: Ajusta filtros e receitas por descrição.
