# Legibilidade no celular — V4.12.45

Atualização exclusivamente de apresentação móvel: letras, números, símbolos e ícones maiores, incluindo a barra superior e a inferior. A barra inferior recebe fundo azul-petróleo, borda turquesa e rótulos claros; o conteúdo mantém sua paleta de tema claro ou escuro.

Principais tamanhos: texto base 19px, título superior 18px, comandos superiores 15px, títulos de cartões 16px, valores 22px, saldo 36px, nomes dos lançamentos 19px, informações secundárias 16px, ícones inferiores 28px e rótulos inferiores 14px. Em telas muito estreitas alguns valores se ajustam para caber, permanecendo maiores que os anteriores. O saldo usa uma linha completa para evitar que o botão de ocultar provoque quebra no meio do valor.

Calendário Financeiro: mês maior, setas maiores, números dos dias em 19px, dias da semana em 13px, indicadores maiores e detalhes com textos de 16 a 19px. A grade mensal mantém sete colunas. Os totais resumidos de cada célula continuam usando reticências quando não cabem, como na versão anterior; toque no dia para consultar os valores completos nos detalhes. O seletor de data nativo do Android segue as preferências do sistema; o campo do aplicativo foi ampliado.

Calculadora: teclas e operações em 27px, visor em 36px, símbolos maiores, botão de fechar com área mínima de 44px e explicação da porcentagem em 15px. O painel tem rolagem quando a altura disponível é pequena.

As regras são limitadas ao layout móvel em tela. Não alteram o layout normal do PC, fórmulas, transações, filtros, expansão em árvore, autenticação ou sincronização. Os mesmos estilos estão incorporados ao HTML pessoal, distribuicao/app.html e teste-gemini/app.html. Não é necessário APK.

Manutenção: a fonte é automacao/mobile_legibilidade.css. Execute python automacao/aplicar_mobile_legibilidade.py após as demais camadas visuais para incorporar os estilos às três telas. A aplicação é idempotente.

Validação: 45 testes existentes aprovados. Conferência no navegador com o layout móvel e funções reais do calendário e calculadora, usando dados fictícios: grade com 42 dias, tamanhos das fontes, troca para modo escuro, operação 7 + 3 = 10, larguras de 320, 390 e 430 pixels sem transbordamento horizontal, além do contraste da nova barra inferior. Os arquivos de conta e isolamento foram comparados em bytes com a V4.12.44.

Publicação: extraia o ZIP de atualização e envie todo o conteúdo na raiz do repositório existente, preservando as pastas e incluindo index.html da raiz. O pacote tem menos de 100 arquivos. Depois do Actions concluir, reabra o aplicativo e aceite a atualização do PWA pelo fluxo existente. Nenhuma publicação remota foi feita nesta entrega.

Nome sugerido do commit: Melhora legibilidade do layout no celular.
