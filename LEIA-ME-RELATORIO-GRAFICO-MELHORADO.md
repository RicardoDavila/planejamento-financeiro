# Relatório gráfico com melhorias

Base: atualização anterior desta conversa, incluindo a correção de retorno ao login ao imprimir. O pacote contém apenas arquivos alterados, abaixo de 90 arquivos.

## Envio ao GitHub
Extraia o ZIP e envie os arquivos e pastas preservando seus caminhos na raiz do repositório. Confirme o commit e aguarde a publicação em Actions. Não envie o ZIP fechado ao repositório. Não apague os demais arquivos.

## Alterações
- “Resultado previsto do período” e “Margem prevista do período” substituem os nomes que podiam sugerir saldo bancário ou poupança realizada.
- Mantém os indicadores e acrescenta despesas pagas/a vencer, alertas de liquidez e critérios de leitura.
- Histórico: N/D para meses fora do recorte; “Sem lançamentos” para meses dentro do filtro sem registros. Não cria valores de meses não consultados. As alternativas interativas também respeitam essa cobertura.
- Receitas por descrição e por vencimento têm títulos correspondentes. Uma única data é mostrada como barra; datas sem valor da métrica e cadastros sem data/zerados não viram pontos artificiais.
- Cadastro sem data ou zerado é separado em pendências, sem excluir o registro. Possíveis duplicidades são sinalizadas para conferência.
- Datas padronizadas, filtros e emissão no cabeçalho. A impressão remove instruções interativas e melhora a distribuição de gráficos/tabelas.
- Gráficos mantidos: cascata, ranking, vencidos por faixa, mapa de calor, histórico, evolução por vencimento e distribuição por descrição/rubrica.
- Nenhum saldo bancário, probabilidade de recebimento ou histórico indisponível é inventado. Os indicadores de despesas deste painel não incluem investimentos; isso é explicitado na nota.

## Verificação
Testes de totais, filtros, datas, pendências, histórico fora do recorte, segurança de texto e preservação dos dados. A referência de código do teste de preservação foi atualizada para estas mudanças aprovadas; as conferências numéricas existentes continuam presentes.

O ambiente bloqueia a abertura de arquivos locais no navegador. Após publicar, confira o PDF no aplicativo, incluindo salvar e cancelar a impressão. A paginação exata depende das configurações do navegador; use A4 paisagem e fundos ativados. A atualização não substitui dados, credenciais ou cadastros.
