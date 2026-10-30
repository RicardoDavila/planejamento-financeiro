# Fluxo de caixa - layout aprovado

## Uso

Abra Ações e ferramentas > Fluxo de caixa > Gerar relatório de fluxo de caixa.

Selecione os filtros e agrupe por dia, semana ou mês. O relatório inclui os dias sem movimento dentro do intervalo. A previsão de 30 dias mantém os filtros de conteúdo e considera hoje e os próximos 29 dias, independentemente do mês selecionado.

Na impressão, use A4 paisagem e desmarque Cabeçalhos e rodapés do navegador. A paginação pode crescer conforme o número de lançamentos. Os saldos iniciais são reconstruídos a partir dos lançamentos cadastrados e não representam conciliação bancária. Atrasados não são reagendados automaticamente na projeção.

Excel usa a biblioteca XLSX já carregada pelo projeto; CSV permanece disponível se essa biblioteca não carregar. Preparar e-mail abre um rascunho com o resumo: anexe manualmente o PDF ou a planilha.

## Aplicação no projeto

Este pacote é o projeto completo com as alterações, sem publicação. A automação existente em .github/workflows gera as versões pessoal e de distribuição. Preserve a distinção entre os arquivos-fonte e o site gerado.

Para gerar uma cópia pronta para hospedagem, em uma pasta de saída vazia:

```powershell
python automacao/gerar.py --output build/site --version V4.12.6
```

Para verificar:

```powershell
python -m unittest discover -s automacao -p "test_*.py"
```

Os dados fictícios da prévia não foram incorporados ao projeto. Nenhuma alteração foi publicada no site em uso.

## Padrão dos demais relatórios

Gerencial/mensal, gráficos evolutivos e fluxo de caixa compartilham logotipo incorporado, fonte do sistema e paleta azul-escura com verde para entradas e vermelho para saídas. Barras verticais exibem valores no topo; barras horizontais, na extremidade. Rótulos densos ficam inclinados para preservar os valores completos. Use A4 paisagem e desmarque os cabeçalhos e rodapés do navegador. O arquivo-fonte incorpora o módulo compartilhado pf-report-theme para evitar dependências adicionais de arquivos locais.

## Preservação do relatório gráfico original

Mantidos: painel executivo com sete indicadores e leitura do período; cascata financeira; ranking de rúbricas e percentuais; vencidos por faixa; mapa de calor diário; histórico de 12 meses; lançamentos do recorte; evolução temporal; distribuição por rúbrica; resumo executivo de totais; filtros e comparações. As funções originais de cálculo, renderização das análises e filtragem dos gráficos são conferidas por hash e por teste com dados fictícios. Os limites e critérios originais de exibição permanecem preservados. Os dados da prévia são fictícios e não substituem a base do usuário.

## Marca na navegação

O símbolo de pizza do cabeçalho e da barra lateral foi substituído pelo ícone azul original do aplicativo (icon-192.png), também usado nos relatórios. A imagem da marca fica incorporada ao HTML para evitar falhas de caminho.
