        let pfRecuperacaoEmAndamento = false;
        function pfCompararPacotesRecuperacao(pacote) {
            const copia = {...pacote};
            delete copia.atualizado_localmente_em;
            return JSON.stringify(copia);
        }
        async function resolverConflitoNuvem() {
            if (pfRecuperacaoEmAndamento) return;
            pfRecuperacaoEmAndamento = true;
            let baseAnterior = null, baseRecuperacao = null;
            try {
                window.pfdAssert();
                clearTimeout(sincronizacaoNuvemTimer);
                await pfFilaEnvio;
                const remoto = await carregarPacoteNuvem();
                window.pfdAssert();
                if (!remoto?.payload || !remoto.updated_at) throw Error('Não foi possível obter uma cópia válida da nuvem. Nenhum dado foi substituído.');
                const local = coletarPacoteNuvem();
                const confirmar = window.confirm(
                    'Recuperar a nuvem usando os dados DESTE dispositivo?\n\n' +
                    'Neste dispositivo: ' + local.transacoes.length + ' lançamento(s).\n' +
                    'Na nuvem: ' + (remoto.payload.transacoes?.length || 0) + ' lançamento(s).\n' +
                    'Versão da nuvem: ' + remoto.updated_at + '\n\n' +
                    'Será baixado um arquivo com as duas cópias antes da substituição. ' +
                    'Confirme somente se os dados deste dispositivo forem os que deseja manter.'
                );
                if (!confirmar) return;
                const backup = {sistema:'Planejamento Financeiro', finalidade:'Cópias antes da recuperação da nuvem', user_id:window.pfdAssert(), data_backup:new Date().toISOString(), local, nuvem:remoto};
                const url = URL.createObjectURL(new Blob([JSON.stringify(backup,null,2)],{type:'application/json;charset=utf-8'}));
                const link = document.createElement('a');
                link.href=url;link.download='backup_conflito_nuvem_'+new Date().toISOString().slice(0,10)+'.json';
                document.body.appendChild(link);link.click();link.remove();
                setTimeout(()=>URL.revokeObjectURL(url),60000);
                if (!window.confirm('Confira se o arquivo backup_conflito_nuvem foi baixado.\n\nClique em OK somente com o arquivo salvo, para substituir a nuvem pela cópia deste dispositivo. Se o download não terminou, clique em Cancelar.')) return;
                await pfFilaEnvio;
                const atual = await carregarPacoteNuvem();
                window.pfdAssert();
                if (!pfMesmaVersao(atual?.updated_at,remoto.updated_at)) throw Error('A nuvem mudou durante a recuperação. Nenhum dado foi substituído. Tente comparar novamente.');
                if (pfCompararPacotesRecuperacao(local)!==pfCompararPacotesRecuperacao(coletarPacoteNuvem())) throw Error('Os dados locais mudaram durante a recuperação. Faça uma nova comparação antes de continuar.');
                baseAnterior=pfdLocal.getItem(CHAVE_ULTIMA_SINCRONIZACAO)||'';
                baseRecuperacao=remoto.updated_at;
                pfdLocal.setItem(CHAVE_ULTIMA_SINCRONIZACAO,baseRecuperacao);
                // Mantém o PATCH condicional e as verificações de conta existentes.
                await salvarPacoteNuvem();
                baseRecuperacao=null;
                alert('Recuperação concluída. Os dados deste dispositivo foram confirmados na nuvem.');
            } catch(error) {
                if (baseRecuperacao && pfdLocal.getItem(CHAVE_ULTIMA_SINCRONIZACAO)===baseRecuperacao) {
                    if (baseAnterior) pfdLocal.setItem(CHAVE_ULTIMA_SINCRONIZACAO,baseAnterior);
                    else pfdLocal.removeItem(CHAVE_ULTIMA_SINCRONIZACAO);
                }
                atualizarStatusNuvem('Falha na recuperação: '+error.message);
                alert('Não foi possível concluir a recuperação: '+error.message);
            } finally {
                pfRecuperacaoEmAndamento=false;
            }
        }

