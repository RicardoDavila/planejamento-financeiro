# Filtros rápidos dos cartões — V4.12.42

Clique em um cartão do Painel Gerencial para filtrar os lançamentos relacionados. A seleção substitui a seleção de outro cartão; ela não acumula filtros de cartões. O cartão ativo recebe um contorno e um aviso informa o recorte aplicado. **Limpar filtro** restaura o período e os filtros que estavam definidos antes do primeiro clique. Clicar novamente no mesmo cartão também limpa o filtro. O comando geral Limpar Filtros remove igualmente o filtro do cartão.

Os nomes e as regras dos valores existentes foram mantidos:

| Cartão | Lançamentos considerados |
|---|---|
| Receitas | Tipo Receita |
| Recebido | Receitas com status diferente de Não Recebido, conforme o cálculo já usado pelo cartão |
| Despesas | Tipo Despesa |
| A vencer | Status A Vencer, conforme o cálculo já usado pelo cartão |
| Vencido | Status Vencido |
| Investimentos | Tipo Investimentos ou rubrica INVESTIMENTOS |
| Saldo previsto | Receitas, despesas e investimentos que compõem o saldo |
| Situação | Vencidos, se houver valor vencido positivo; a vencer, se houver valor a vencer positivo; caso contrário, os componentes do saldo |

O recorte respeita o período, rubrica, subitem, descrição e os demais filtros em uso. Lista, totais, análise mensal, fluxo de caixa e relatórios usam o recorte ativo. Gráficos e Evoluções mantém também seus próprios filtros de período e conteúdo, aplicando o filtro do cartão em conjunto. O histórico mensal conserva sua janela de seis meses e filtra o tipo/situação do cartão. Relatórios já abertos representam o momento de sua geração: gere novamente após trocar o filtro.

As escolhas ficam apenas na memória da página. Ao recarregar, o filtro do cartão começa desativado. Não há gravação de transações, mudanças em contas, login ou sincronização. O bloqueio de autenticação limpa a seleção. Os cartões podem ser acionados por clique, Enter ou Espaço. O aviso e o botão também se adaptam ao celular e ao tema escuro.

Manutenção: execute `python automacao/aplicar_icones.py`, `python automacao/aplicar_graficos.py` e `python automacao/aplicar_filtros_cartoes.py`, nessa ordem, após editar as fontes dessas camadas. Os comandos podem ser repetidos sem duplicar os blocos. Os pontos de integração PFQF somente filtram as entradas dos gráficos, sem alterar fórmulas.

Validação: 44 testes aprovados. O teste específico cobre os oito cartões, troca de seleção, limpeza, restauração do período, teclado, bloqueio de acesso, ausência de alteração dos registros e integração nas três telas. A conferência no navegador usa dados fictícios e verificou desktop e largura de celular. Os arquivos de login e isolamento foram comparados em bytes com a entrega anterior.

Publicação: extraia o projeto e atualize os arquivos no repositório existente, mantendo as pastas. Não publique apenas o ZIP como arquivo no site. Versão e caches do PWA foram atualizados; nenhuma publicação remota foi feita nesta entrega.

## Correção da tela própria do celular

A V4.12.42 conecta os sete cartões realmente visíveis no layout móvel (`pm-kRec`, `pm-kReceived`, `pm-kDes`, `pm-kVen`, `pm-kOverdue`, `pm-kInv`, `pm-kSaldo`). A seleção e o aviso com **Limpar filtro** aparecem nessa tela, além dos resumos anteriores.

As regras móveis foram mantidas: recebido considera data de pagamento ou os estados reconhecidos pelo layout móvel; vencidas considera despesas sem pagamento vencidas antes de hoje; a vencer considera despesas sem pagamento que não estão vencidas. Isso mantém os lançamentos filtrados coerentes com os valores mostrados no celular. O botão de mostrar/ocultar os valores do saldo permanece separado da ação de filtrar.

Foram aprovados 44 testes, incluindo os sete cartões móveis, seleção e limpeza no aviso móvel, regras de pagamento, preservação do PC e proteção de acesso. A conferência no navegador executou o layout móvel original, com os filtros originais e dados fictícios, e confirmou Vencidas, Receitas, A vencer e Limpar filtro sem transbordamento horizontal em largura de celular.

O pacote de correção contém apenas os arquivos alterados em relação à V4.12.41. Extraia-o e envie todo o conteúdo na raiz do repositório existente, mantendo as subpastas. Inclua o index.html da raiz. Após a publicação aprovada, abra novamente o aplicativo e aceite a atualização pelo fluxo existente do PWA.
