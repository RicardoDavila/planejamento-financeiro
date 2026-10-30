# Correção da sincronização do celular

## Atualização pelo GitHub

Envie o conteúdo completo desta pasta para a raiz do repositório, mantendo as subpastas, inclusive automacao. A publicação existente gera as versões pessoal e de distribuição. Aguarde a etapa Publicar ficar verde.

## Depois da publicação

1. No celular, abra Menu > Ajuda e informações > Verificar atualizações e instale a versão nova. Se necessário, feche e reabra o aplicativo. Não limpe os dados do navegador nem reinstale o aplicativo para resolver o conflito.
2. Em Sincronização em Nuvem, use o mesmo e-mail e a senha da conta de sincronização do PC. A senha de abertura do aplicativo é independente. O erro invalid_credentials significa que o serviço recusou o e-mail/senha; a atualização não troca nem recupera essa senha.
3. Com a conta conectada, escolha Receber dados do PC/nuvem (com backup). O aplicativo compara as cópias, salva um backup JSON com os dados atuais deste dispositivo e da nuvem e pede que você confira o download antes de substituir a cópia local.
4. Se houver lançamentos exclusivos do celular, preserve o backup para conferi-los. O recebimento não mescla automaticamente cópias divergentes e não sobrescreve a nuvem.

## Proteções

Uma tentativa de login recusada deixa de encerrar a sessão anterior. A referência por conta permite distinguir mudanças financeiras de status calculados automaticamente. Conflitos reais continuam bloqueados. O recebimento verifica conta, versão da nuvem e alterações locais antes da aplicação; se algo mudou, interrompe a operação. O arquivo de backup deve ser preservado.

Os testes usam dados fictícios; nenhuma conta ou base financeira real foi acessada para validar esta correção.
