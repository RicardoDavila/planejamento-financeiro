# Correção da publicação — V4.12.72

## Aplicar no GitHub

Este é um pacote de atualização com 16 arquivos alterados, abaixo do limite de 90.

1. Extraia o ZIP no computador.
2. Copie seu conteúdo para a raiz do repositório existente, substituindo os arquivos correspondentes e mantendo as pastas automacao, distribuicao e teste-gemini nos caminhos indicados.
3. Inclua os arquivos da pasta automacao no mesmo commit. Eles corrigem a integração dos testes com o novo módulo de seleção dos relatórios.
4. Preserve todos os outros arquivos do repositório, inclusive .github/workflows/publicar.yml e os demais scripts de automacao. Este ZIP não substitui o repositório inteiro.
5. Faça o commit na branch main para executar novamente a publicação.

## Correções

O pacote anterior omitiu testes que precisavam acompanhar a atualização. Os testes de relatórios gerenciais, conciliação e fluxo de caixa agora carregam o novo módulo. O teste de geração exige prévia antes da impressão. Foi acrescentada uma verificação descoberta pelo comando de testes do workflow.

As preferências dos relatórios usam o adaptador de armazenamento da aplicação de origem, preservando o isolamento por conta na distribuição.

## Funcionalidade

Abra um relatório, escolha os campos, tabelas e gráficos e clique em Pré-visualizar. Gerar PDF e Imprimir ficam disponíveis depois da prévia. Gerar PDF abre o diálogo do navegador, onde se escolhe Salvar como PDF. Qualquer alteração na seleção exige atualizar a prévia. Todos os itens começam selecionados, exceto quando há preferências salvas por opção do usuário.

A seleção afeta somente o documento gerado. Os registros financeiros, cálculos, totais e telas normais permanecem preservados.

## Verificação

Foi executada a mesma sequência de verificação e geração usada pelo workflow publicar.yml:

- python -m unittest discover -s automacao -p 'test_*.py' -v: 56 testes passaram.
- python automacao/gerar.py --output [pasta vazia] --version V4.12.72: geração concluída, incluindo verificações de JavaScript e isolamento.
- O pacote foi conferido contra o ZIP original: todos os arquivos alterados e novos necessários estão incluídos.

A execução efetiva do GitHub Actions depende do repositório remoto. A imagem enviada mostra a etapa que falhou, mas não contém o log detalhado. A falha de integração dos testes foi reproduzida e corrigida localmente.

A validação visual em navegador, celular e PDF continua pendente: o ambiente local bloqueou a abertura do Chrome automatizado (spawn EPERM). O teste de navegador foi incluído como verificação opcional e não faz parte da descoberta automática do workflow.
