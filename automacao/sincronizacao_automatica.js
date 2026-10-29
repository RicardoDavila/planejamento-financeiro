        function pfCanonicoSync(valor) {
            if (Array.isArray(valor)) return valor.map(pfCanonicoSync);
            if (valor && typeof valor === 'object') return Object.fromEntries(Object.keys(valor).sort().map(k=>[k,pfCanonicoSync(valor[k])]));
            return valor;
        }
        function pfDadosFinanceirosIguais(a,b) {
            const campos=['transacoes','rubricas_ocultas','subitens_ocultos','rubricas_extras','subitens_extras','lixeira','data_abertura_projeto'];
            const selecionar=p=>Object.fromEntries(campos.map(k=>[k,k==='transacoes'?[...(p?.[k]||[])].sort((x,y)=>String(x.id).localeCompare(String(y.id))):p?.[k]??(k==='data_abertura_projeto'?'':[])]));
            return JSON.stringify(pfCanonicoSync(selecionar(a)))===JSON.stringify(pfCanonicoSync(selecionar(b)));
        }
        async function pfConfirmarCopiasIguais(remote) {
            // Só reconcilia automaticamente se TODOS os dados financeiros coincidirem.
            const local=coletarPacoteNuvem();
            if (!remote?.updated_at || !pfDadosFinanceirosIguais(local,remote.payload)) return false;
            const historico=[...(remote.payload.historico||[]),...(local.historico||[])];
            const unicos=new Map(historico.map(h=>[JSON.stringify(pfCanonicoSync(h)),h]));
            const combinado=[...unicos.values()].sort((a,b)=>String(b.data||'').localeCompare(String(a.data||'')));
            const anterior=localStorage.getItem(CHAVE_ULTIMA_SINCRONIZACAO)||'';
            localStorage.setItem(CHAVE_HISTORICO,JSON.stringify(combinado));
            localStorage.setItem(CHAVE_ULTIMA_SINCRONIZACAO,remote.updated_at);
            try {
                // O envio existente ainda verifica a versão e usa PATCH condicional.
                await salvarPacoteNuvem();
                return true;
            } catch(error) {
                if (localStorage.getItem(CHAVE_ULTIMA_SINCRONIZACAO)===remote.updated_at) {
                    if(anterior)localStorage.setItem(CHAVE_ULTIMA_SINCRONIZACAO,anterior);
                    else localStorage.removeItem(CHAVE_ULTIMA_SINCRONIZACAO);
                }
                throw error;
            }
        }
        let pfAtualizacaoAoRetornar=null;
        async function pfVerificarNuvemAoRetornar() {
            if(document.hidden||document.body.classList.contains('auth-pendente'))return;
            if(pfAtualizacaoAoRetornar)return pfAtualizacaoAoRetornar;
            const operation=(async()=>{
                try {
                    await pfSincronizarConta();
                    popularSelectsDinamicos();renderTable();atualizarPainelGerencial();atualizarInfoBanco();verificarContasVencendoHoje();
                }catch(error){atualizarStatusNuvem('Falha na sincronização automática: '+error.message);}
            })();
            pfAtualizacaoAoRetornar=operation;
            try{await operation;}finally{pfAtualizacaoAoRetornar=null;}
        }
        document.addEventListener('visibilitychange',pfVerificarNuvemAoRetornar);
        window.addEventListener('online',pfVerificarNuvemAoRetornar);
        window.addEventListener('focus',pfVerificarNuvemAoRetornar);

