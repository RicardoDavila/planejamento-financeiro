# Atualização aprovada — PC e Distribuição

Base: planejamento-financeiro-main 04 11 2026 as 18 25.zip.
Versão de referência: V4.12.60. O GitHub Actions pode atribuir a numeração da publicação automaticamente.

## Aplicar no GitHub

1. Extraia o ZIP de atualização.
2. Na raiz do repositório, envie o conteúdo extraído, preservando as pastas `automacao` e `distribuicao` e substituindo os arquivos correspondentes.
3. Use a mensagem de commit: `Atualiza painel e gráficos no PC e distribuição` (47 caracteres).
4. Aguarde a conclusão da publicação em Actions e reabra o aplicativo.

Este pacote contém somente arquivos alterados/adicionados, dentro do limite de 90 arquivos. Não substitua a pasta inteira do projeto por este pacote parcial.

## Mudanças aplicadas no PC

- Painel distingue resultado do período, saldo inicial, saldo final projetado, menor saldo e data crítica. Os saldos vêm dos lançamentos reais anteriores, sem abertura fixa de demonstração, e não representam extrato bancário conciliado.
- Receitas, recebido, despesas, investimentos e Situação preservados. Inclui progresso recebido/pago e informação de risco de caixa.
- Menus superiores abrem para baixo, mantendo nome, perfil e ferramentas. Navegação por mês e paleta/fontes do projeto mantidas.
- Filtros avançados recolhíveis, períodos rápidos e organização compacta das ações na análise gráfica.
- Filtros rápidos nos cards e em Rubrica, Subitem, Descrição e Status. Filtros de itens podem ser combinados e removidos. O clique na descrição é exato; a busca digitada aceita parte do texto.
- Gráficos com opções de visualização e rolagem; clique abre janela de composição, permitindo detalhar rubrica, subitem, descrição e consultar os lançamentos. Inclui receitas por vencimento/descrição, ranking, atraso e mapa diário.
- Detalhamento da análise com Subitem separado, ordenação, paginação, totais e acesso ao cadastro original. As colunas originais dos lançamentos foram mantidas, com Editar e Lixeira em Ações.
- Seleção múltipla, baixa integral fora da coluna Ações, exclusão para a Lixeira e desfazer condicionado a não haver alteração posterior. Exclusões múltiplas limitadas a 200 para respeitar a capacidade da Lixeira existente.
- Fluxo diário destaca data crítica e receitas, oferece ocultação de dias sem movimento e curva do acumulado com referência zero. Exibe o intervalo explícito dos próximos 30 dias.
- Tipo de pessoa é cadastrado individualmente em Novo/Editar lançamento. Registros antigos ficam Não classificado; não se deduz PF/PJ pela rubrica.
- Simulação de atraso não altera os cadastros. Recorrência mensal exige marcação no cadastro, prévia e confirmação, com prevenção de repetição por origem/mês.
- Mostrar e ocultar o painel exigem a senha existente do projeto; na Distribuição, usa a confirmação da conta conectada. Cancelamento e respostas tardias não liberam o painel.
- PDF dos gráficos usa os filtros aplicados, inclui todos os lançamentos do recorte e abre em outra aba. Busca ainda não aplicada não entra no relatório.

## Celular e dados existentes

O novo módulo retorna antes de instalar interface, estilos ou substituir funções quando o modo Celular está ativo (incluindo a detecção por aparelho/toque). Os blocos de layout, menus, senha e gráficos do Celular foram preservados. A única ponte adicional no explorador compartilhado só atua quando o módulo do PC existe.

Contas, senhas, sincronização, isolamento entre usuários, janela de dois monitores e correção de impressão foram preservados. A cópia opcional `teste-gemini` não foi alterada. Nenhum lançamento pessoal ou senha de teste foi embutido no projeto.

Filtros de conteúdo não definem uma abertura completa de caixa: nesses recortes, os saldos acumulados do novo painel são N/D. Limpe os filtros para avaliar o caixa completo do tipo de pessoa selecionado. Pendências sem data ou com valor zero são preservadas no cadastro e separadas dos gráficos de movimentação.

## Validação

- 53 testes automatizados aprovados, incluindo os testes existentes do Celular, acesso, conta/isolamento, sincronização, relatórios e impressão sem retorno ao login.
- Testes adicionais do runtime do PC pessoal e da Distribuição: cálculos em centavos, filtros combinados, descrição exata, cards, composição, baixa/desfazer, recorrência, senha para mostrar/ocultar, cancelamento e proteção dos totais.
- Geração de publicação concluída com o gerador real do projeto.
- Conferência dos arquivos originais: alterações restritas ao módulo desktop, sua ponte no explorador e identificação da versão; arquivos de acesso e cópia opcional intactos.
- Validação visual interativa no Chrome não foi executada automaticamente neste ambiente.

## Manutenção

O módulo está embutido nos dois HTMLs para manter o funcionamento com o cache atual. As fontes ficam em `automacao/desktop_aprovado.js` e `automacao/desktop_aprovado.css`.

Após editar essas fontes, execute `python automacao/aplicar_desktop_aprovado.py` para sincronizar os HTMLs. Use `python automacao/aplicar_desktop_aprovado.py --check` para conferir a consistência. O aplicador não altera os arquivos da cópia opcional nem os módulos do Celular.
