# Notas privadas no assistente financeiro — V4.12.79

Nome da atualização: Notas privadas no assistente financeiro

Abra Assistente financeiro > Notas do período. O painel abre separadamente, sem reorganizar o layout existente. O mês inicial acompanha o período do assistente; em intervalos, começa pelo mês da data inicial. O seletor Mês da nota permite consultar ou criar notas em outro mês.

Recursos: notas por mês, salvamento automático com indicação de sucesso ou falha, busca por título/texto/etiquetas, filtro por etiqueta, fixação, exportação de todas as notas para JSON, importação de JSON e exclusão de uma nota com confirmação.

Cada nota aceita título de até 120 caracteres, texto de até 20 mil caracteres e até 10 etiquetas de até 30 caracteres. O armazenamento admite até 2 mil notas, dentro do limite total de aproximadamente 3 milhões de caracteres e da capacidade disponível do navegador. Falhas de salvamento mantêm o texto aberto com aviso e a opção de tentar novamente. Alterações concorrentes na mesma nota são recusadas para não sobrescrever silenciosamente outra edição.

As notas são locais deste navegador/dispositivo. Na distribuição, usam o adaptador de armazenamento isolado da conta. Não são enviadas à IA, à nuvem nem incluídas nos lançamentos, cálculos ou relatórios financeiros. A troca de idioma não traduz o conteúdo pessoal das notas. Use Exportar notas para guardar uma cópia ou transferi-las a outro navegador. A importação valida o arquivo antes de gravar e preserva as notas existentes, atribuindo outro identificador quando necessário.

## Aplicação

Pacote complementar à versão com a correção de moedas V4.12.78. Extraia na raiz do projeto e substitua os arquivos correspondentes, incluindo automacao. Não apague os demais arquivos. Mantenha o publicar.yml que já funcionou. Após publicar, atualize a página e abra o Assistente financeiro.

## Verificação

60 testes automatizados aprovados. Foram acrescentados testes de persistência, isolamento da chave de notas, busca, etiquetas, fixação, concorrência, limite de armazenamento, importação sem gravação parcial e exclusão. As versões públicas foram geradas com validação de JavaScript. Os blocos CSS existentes nas três aplicações foram preservados. O módulo real de notas também foi testado no navegador em ambiente isolado: criação, edição, salvamento automático, etiquetas, fixação e persistência após recarregar. Essa verificação não utilizou registros financeiros do projeto.
