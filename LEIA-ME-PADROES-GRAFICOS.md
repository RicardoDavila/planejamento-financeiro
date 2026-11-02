# Formatos iniciais dos gráficos — V4.12.46

Na análise da página principal, os gráficos começam nos seguintes formatos:

| Gráfico | Formato inicial |
|---|---|
| Evolução das Receitas | Áreas |
| Evolução das Despesas | Pizza (circular) |
| Receitas por Rubrica (clique na barra para abrir lançamentos) | Padrão (original) |
| Despesas por Rubricas (clique na barra para abrir lançamentos) | Colunas |

Os formatos são definidos ao criar a visualização. O usuário pode escolher outro formato durante a sessão; atualizar filtros não desfaz essa escolha. Recarregar ou reabrir a página restaura a configuração da tabela. Não há gravação de preferência em armazenamento. Os gráficos dos relatórios e os demais gráficos continuam com seus padrões anteriores.

A mudança está incorporada às três telas financeiras. Fontes maiores do celular, tema escuro, filtros rápidos e expansão em árvore permanecem preservados. Os formatos que têm restrições de dados, como pizza para valores negativos ou sem total positivo, continuam exibindo a explicação existente e o gráfico original como alternativa, sem alterar valores.

Validação: 45 testes aprovados. O navegador confirmou os quatro seletores e o retorno a Áreas após trocar manualmente para Linhas e recarregar. Os exemplos de conferência usam dados fictícios. Login, isolamento e sincronização não foram modificados.

Publicação: extraia o ZIP de atualização e envie todo o conteúdo na raiz do repositório existente, preservando as subpastas e incluindo index.html da raiz. O pacote tem menos de 100 arquivos. Após o Actions concluir, reabra o aplicativo e aceite a atualização existente do PWA. Nenhuma publicação remota foi executada.

Nome sugerido do commit: Define formatos padrão dos quatro gráficos.
