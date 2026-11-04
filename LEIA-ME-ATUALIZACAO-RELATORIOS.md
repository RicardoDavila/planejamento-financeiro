# Atualização dos relatórios

Base: ZIP de 04/11/2026 às 14:45. Este pacote contém apenas arquivos alterados.

## Como enviar ao GitHub
1. Extraia o ZIP.
2. No repositório, use Add file > Upload files.
3. Envie index.html, a pasta distribuicao, a pasta teste-gemini, a pasta automacao e este LEIA-ME, preservando os caminhos. As pastas do ZIP contêm somente as alterações; os demais arquivos do repositório devem permanecer.
4. Confirme o commit e aguarde a execução da publicação (Actions).
5. Reabra o aplicativo e gere os dois relatórios com seus filtros habituais.

Não envie o ZIP como um arquivo ao repositório: envie o conteúdo extraído. O pacote possui 7 arquivos, abaixo do limite de 90 solicitado.

## O que muda
- Resultado líquido previsto não é chamado de saldo de caixa final.
- O gerencial usa a mesma lógica de saldos e liquidação do fluxo de caixa; cabeçalho mostra os filtros completos.
- Os relatórios esclarecem vencimento, corte, total cadastrado, realizado, em aberto e a ausência de conciliação bancária.
- A ponte do fluxo de caixa calcula as diferenças pelos registros reais: receitas não recebidas, saídas não liquidadas e diferenças de datas efetivas.
- Maior lançamento e maior saída diária são indicadores distintos; há alertas de liquidez, próxima entrada e registros repetidos para conferência.
- Os gráficos existentes permanecem e o gerencial recebe trajetória de saldo. A impressão evita dividir o quadro de situação financeira e repete cabeçalhos das tabelas.
- A planilha do fluxo inclui a conciliação e a parcela em aberto.
- Não cria cenários, metas, saldos bancários ou classificações que não estejam cadastrados.
- Nenhum lançamento é alterado ou excluído. Filtros Semestre e Ano preservados.

## Verificação
Inclui testes específicos de conciliação, corte, liquidez, repetições, recortes parciais e geração dos relatórios. A publicação é verificada pelo gerador existente.
A abertura de arquivos locais no navegador foi bloqueada pela política de segurança do ambiente; a conferência visual final da impressão deve ser feita ao gerar os PDFs no aplicativo.

A versão publicada e os caches são atualizados pelo fluxo de publicação existente. Não é necessário substituir os arquivos de acesso ou os service workers protegidos.
