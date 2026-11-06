# V4.12.75 — melhorias no assistente financeiro

## Alterações

- O modo local se chama “Cálculo local · sem envio à IA”. O aviso esclarece que a sincronização em nuvem do sistema é independente.
- O Gemini informa que a pergunta e totais do período são enviados via Supabase, com categorias codificadas. A autorização existente continua obrigatória e não é marcada automaticamente.
- A área inicial contém seis exemplos compatíveis com o cálculo local: resumo, gastos, comparação, categorias, valores a pagar e receitas a receber.
- Exemplos e atalhos apenas preenchem a pergunta. Pressione Enter ou clique em Enviar para consultar. Nenhuma consulta à IA é disparada ao escolher um exemplo.
- Atalhos têm nomes explícitos e dicas ao passar o cursor.
- O intervalo exato é exibido com datas por extenso, tanto por mês quanto no intervalo personalizado.
- A pergunta tem campo maior, placeholder orientador e ajuda de teclado. Enviar recebe maior destaque; Limpar conversa tem apresentação secundária.
- As respostas aparecem em cartões com identificação da origem. Nas respostas locais, é possível abrir os lançamentos de referência do período; comparações também oferecem o período anterior.
- Os registros são somente de leitura, mostrados em lotes de 100 com botão para mostrar mais. A tabela tem rolagem horizontal própria em telas estreitas.
- As listas de referência contêm receitas e despesas válidas do período inteiro. O texto esclarece que perguntas por categoria, status ou duplicidade podem usar apenas parte dessa lista; elas não são apresentadas como prova exata de cada frase da resposta.
- Contraste, foco visível, áreas de toque e distribuição em telas menores foram ajustados.

## Dados e segurança

Os cálculos existentes não foram alterados. As consultas continuam por vencimento e o saldo não inclui saldo inicial de conta. Consultas locais de vencimentos no modo por mês podem consultar toda a base, conforme aviso; em intervalo personalizado, respeitam as datas selecionadas.

A consulta ao Gemini continua exigindo conta, autorização e ação explícita de envio. Limpar conversa, trocar o período ou modo e sair da conta invalidam respostas pendentes. Nenhum lançamento é editado pela nova interface.

## Instalação

O ZIP contém 20 arquivos, abaixo do limite de 90, e é cumulativo em relação ao projeto original enviado: inclui também as atualizações anteriores de relatórios, PDF/impressão, corretor ortográfico e correção dos testes de publicação.

Extraia e copie o conteúdo para a raiz do repositório existente, substituindo os arquivos correspondentes. Inclua a pasta automacao no commit e preserve todos os demais arquivos do repositório. Faça um novo commit na main para publicar.

## Verificação

- A bateria usada na publicação passou com 57 testes.
- O novo teste verifica as três versões: exemplos e atalhos sem envio, envio pelo formulário/Enter, intervalo exato, registros de referência, autorização do Gemini, cancelamento de respostas pendentes, logout e preservação dos dados. As chamadas externas são simuladas; nenhuma consulta real ao Gemini foi enviada.
- As verificações de sintaxe dos scripts passaram.
- A geração do site V4.12.75 concluiu com sucesso, incluindo os controles de distribuição.
- Após os ajustes finais de texto/contraste, o teste específico, a compilação dos scripts e a geração do site foram repetidos com sucesso.
- O ZIP foi comparado ao original para conferir que inclui todas as alterações necessárias.

Limitação: a conferência visual em navegador real e celular permanece pendente, pois o ambiente bloqueou a abertura do Chrome automatizado. Os testes de interface usam um documento simulado e não substituem a conferência visual.
