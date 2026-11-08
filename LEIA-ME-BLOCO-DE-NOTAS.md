# Bloco de notas

O botão **Notas** fica no cabeçalho visível, tanto no computador quanto no celular. O atalho é **Ctrl+Alt+N**. O painel acompanha os temas claro e escuro, permite buscar texto/#tags, fixar notas, escolher cores, inserir tarefas e exportar as notas visíveis da conta em TXT. Os lembretes por `@dd/mm/aaaa` aparecem na lista; não são notificações agendadas fora do aplicativo.

## Salvamento

O texto é salvo após 600 ms sem digitação e também ao voltar, fechar o painel ou alternar a visibilidade da página. O sucesso só aparece após a transação IndexedDB terminar. Se houver falha, o editor permanece aberto, e **Exportar** permite baixar o rascunho ainda não salvo. Se o navegador não conseguir gravar, fechar a aba pode perder o rascunho que só está em memória.

Notas são separadas por conta. Sem sessão Supabase, ficam no modo local do navegador, após o desbloqueio normal do aplicativo. Notas locais não são atribuídas automaticamente à próxima pessoa que entrar. Ao sair, notas já confirmadas podem ser removidas do cache; notas pendentes são mantidas para reenvio na mesma conta. O armazenamento do navegador não é criptografia: use seu próprio perfil de navegador em computadores compartilhados.

O backup financeiro atual continua dedicado aos lançamentos. Para guardar o texto das notas, use a exportação do próprio painel de notas. Não limpe os dados do navegador sem exportar notas ainda não sincronizadas.

## Ativar a sincronização uma única vez

1. No mesmo projeto Supabase já usado pelo aplicativo, abra **SQL Editor → New query**.
2. Abra `automacao/notas_supabase.sql`, copie todo o texto e execute-o no SQL Editor.
3. Publique os arquivos atualizados no mesmo repositório GitHub, mantendo suas pastas, inclusive `.github`.
4. Depois da publicação verde, abra o aplicativo, entre na conta, crie uma nota de teste e clique em **Sincronizar**.
5. Abra a mesma conta em outro aparelho, clique em **Sincronizar** e confira a nota. Verifique também que uma segunda conta não vê essa nota.

O script cria somente `public.pf_notas_v3` e sua função de gravação. Não altera `public.notas` nem tabelas financeiras. Pode ser executado novamente. Não use o SQL da primeira sugestão: esta implementação usa revisão do servidor e uma função com verificação explícita do dono esperado.

Até o SQL ser instalado, o salvamento local funciona; o painel informa que a nuvem ainda precisa ser ativada. O SQL foi revisado e sua interface foi testada com um servidor simulado; não foi executado neste atendimento em um Supabase real.

## Conflitos, exclusões e aparelhos offline

O servidor só aceita alterações baseadas na revisão atual. Se outro aparelho modificou a nota, a edição local é preservada em uma cópia de conflito antes de ser substituída pela versão remota. Alterações concorrentes em abas do mesmo navegador também geram cópias, por meio de transações locais.

As exclusões são registros sincronizáveis, não remoções físicas da tabela. Uma edição offline de uma nota excluída pode ser recuperada como cópia. Se uma exclusão concorrer com uma edição mais recente, o texto remoto é mantido e pode ser necessário confirmar a exclusão novamente. Não há limpeza automática de tombstones após 30 dias, para que um aparelho antigo não ressuscite notas apagadas.

A sincronização consulta também aparelhos sem alterações locais: ao abrir as notas, ao reconectar, ao voltar à aba e periodicamente enquanto o aplicativo estiver visível. Falhas deixam alterações locais pendentes; sucesso no envio só é registrado após confirmação da revisão enviada.

As notas não são traduzidas automaticamente e não entram nos relatórios financeiros nem na impressão da página. **Resumo do painel** só copia dados por ação explícita e com o painel visível e desbloqueado.

## Notas antigas

A importação de notas antigas no armazenamento local v1/v2 pede confirmação. Cancelar mantém o original. O registro antigo só é removido depois de uma gravação transacional e da conferência dos IDs importados. A opção de console `PFNotas.importarAntigas()` permite tentar novamente após cancelar. Não há importação automática de antigas tabelas de notas do servidor.

## Validação

Há testes de persistência, concorrência, conflitos, falhas de gravação, troca de conta, reenvio sem duplicação e estado da interface. A inspeção visual final e o teste de isolamento em um Supabase real devem ser conferidos após a instalação. As verificações da publicação preservam também os recursos aprovados anteriormente.
