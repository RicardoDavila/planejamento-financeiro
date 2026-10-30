        // A cópia confirmada permite distinguir alterações financeiras de status calculados.
        let pfRecebendoDadosNuvem=false;
        function pfIdContaSync(){
            try{return String(window.parent?.pfdUser?.id||(typeof obterSessaoNuvemManual==='function'?obterSessaoNuvemManual()?.user?.id:'')||'');}catch(_){return '';}
        }
        function pfSalvarBaseFinanceiraConfirmada(payload,userId,version){
            if(!userId||!version||String(userId)!==pfIdContaSync())return false;
            const fields=['transacoes','rubricas_ocultas','subitens_ocultos','rubricas_extras','subitens_extras','lixeira','data_abertura_projeto'];
            const financeiro=Object.fromEntries(fields.map(k=>[k,payload?.[k]??(k==='data_abertura_projeto'?'':[])]));
            try{localStorage.setItem('pf_base_financeira_confirmada_'+userId,JSON.stringify({user_id:String(userId),version,financeiro}));return true;}catch(error){console.warn('Não foi possível guardar a referência de sincronização; mantendo a proteção por versão.',error);return false;}
        }
        function pfLerBaseFinanceiraConfirmada(){
            try{
                const owner=pfIdContaSync();if(!owner)return null;
                const base=JSON.parse(localStorage.getItem('pf_base_financeira_confirmada_'+owner)||'null');
                const known=localStorage.getItem(CHAVE_ULTIMA_SINCRONIZACAO)||'';
                if(!base||base.user_id!==owner||!base.financeiro||!known)return null;
                if(base.version!==known&&!(typeof pfMesmaVersao==='function'&&pfMesmaVersao(base.version,known)))return null;
                return base;
            }catch(_){return null;}
        }
        function pfDetalheFalhaLoginNuvem(error){
            if(error?.code==='invalid_credentials'||/invalid login credentials/i.test(error?.message||''))return 'E-mail ou senha da conta de sincronização não conferem. Use a mesma conta da nuvem do computador. A senha de abertura do aplicativo é independente. Seus dados locais foram mantidos.';
            return resumirErroSupabase(error);
        }
        function pfComparacaoRecebimento(p){const c={...p};delete c.atualizado_localmente_em;return JSON.stringify(pfCanonicoSync(c));}
        async function receberDadosNuvemComBackup(){
            if(pfRecebendoDadosNuvem)return false;
            pfRecebendoDadosNuvem=true;
            let localAntes=null,antes=null,aplicando=false,concluido=false;
            const metadata=[CHAVE_ULTIMA_SINCRONIZACAO,CHAVE_ULTIMA_ALTERACAO_LOCAL,'pf_alteracao_token','pf_alteracao_confirmada'];
            try{
                clearTimeout(sincronizacaoNuvemTimer);await pfFilaEnvio;
                const session=await obterSessaoNuvem();
                if(!session?.access_token||!session.user?.id)throw Error('Entre na conta de sincronização com o mesmo e-mail e senha usados no computador.');
                const owner=String(session.user.id),remote=await carregarPacoteNuvem();
                if(String((await obterSessaoNuvem())?.user?.id||'')!==owner)throw Error('A conta mudou. Abra novamente a sincronização.');
                if(!Array.isArray(remote?.payload?.transacoes)||!remote.updated_at)throw Error('A nuvem não devolveu um banco válido. Nenhum dado foi substituído.');
                if(typeof validarBackup==='function')validarBackup(remote.payload);
                localAntes=coletarPacoteNuvem();
                if(!window.confirm('Receber neste dispositivo os dados atuais da sua conta na nuvem?\n\nNeste dispositivo: '+localAntes.transacoes.length+' lançamento(s).\nNa nuvem: '+remote.payload.transacoes.length+' lançamento(s).\n\nPrimeiro será salvo um backup das DUAS cópias. Depois da sua confirmação, somente os dados deste dispositivo serão substituídos.'))return false;
                const backup={sistema:'Planejamento Financeiro',finalidade:'Backup antes de receber dados da nuvem',user_id:owner,data_backup:new Date().toISOString(),local:localAntes,nuvem:remote};
                // Se a cópia de segurança não puder ser gravada, interrompe antes da troca.
                localStorage.setItem('pf_backup_antes_receber_nuvem_'+owner,JSON.stringify(backup));
                const url=URL.createObjectURL(new Blob([JSON.stringify(backup,null,2)],{type:'application/json;charset=utf-8'}));
                const link=document.createElement('a');link.href=url;link.download='backup_celular_e_nuvem_'+new Date().toISOString().replace(/[:.]/g,'-')+'.json';document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);
                if(!window.confirm('Confira se o arquivo backup_celular_e_nuvem foi baixado.\n\nCom o backup salvo, confirme para receber os dados da nuvem neste dispositivo. Se o download não terminou, cancele.'))return false;
                await pfFilaEnvio;
                const current=await carregarPacoteNuvem(),active=await obterSessaoNuvem();
                if(String(active?.user?.id||'')!==owner)throw Error('A conta mudou durante a comparação. Nenhum dado foi substituído.');
                if(!pfMesmaVersao(current?.updated_at,remote.updated_at))throw Error('A nuvem mudou durante a comparação. Compare novamente para receber a cópia mais recente.');
                if(pfComparacaoRecebimento(current?.payload)!==pfComparacaoRecebimento(remote.payload))throw Error('O conteúdo da nuvem mudou durante a comparação. Nenhum dado foi substituído.');
                if(pfComparacaoRecebimento(localAntes)!==pfComparacaoRecebimento(coletarPacoteNuvem()))throw Error('Os dados locais mudaram durante a comparação. Nenhum dado foi substituído.');
                antes=Object.fromEntries(metadata.map(k=>[k,localStorage.getItem(k)]));
                aplicando=true;aplicarPacoteNuvem(current.payload);
                localStorage.setItem(CHAVE_ULTIMA_SINCRONIZACAO,current.updated_at);
                localStorage.setItem(CHAVE_ULTIMA_ALTERACAO_LOCAL,current.updated_at);
                localStorage.setItem('pf_alteracao_confirmada',localStorage.getItem('pf_alteracao_token')||'');
                pfSalvarBaseFinanceiraConfirmada(current.payload,owner,current.updated_at);
                concluido=true;aplicando=false;
                popularSelectsDinamicos();renderTable();atualizarPainelGerencial();atualizarInfoBanco();verificarContasVencendoHoje();
                atualizarStatusNuvem('Dados da nuvem recebidos neste dispositivo. A cópia anterior foi preservada no backup.',true);
                alert('Dados recebidos com sucesso. A nuvem permaneceu intacta e a cópia anterior deste dispositivo está no backup.');return true;
            }catch(error){
                if(aplicando&&localAntes){
                    try{aplicarPacoteNuvem(localAntes);for(const [k,v]of Object.entries(antes||{})){if(v===null)localStorage.removeItem(k);else localStorage.setItem(k,v);}}
                    catch(rollbackError){console.error('Falha ao restaurar a cópia local; preserve o backup baixado.',rollbackError);}
                }
                atualizarStatusNuvem((concluido?'Dados recebidos; falha ao atualizar a tela: ':'Falha ao receber os dados: ')+error.message);
                alert((concluido?'Os dados foram recebidos, mas a tela precisa ser atualizada. ':'Não foi possível concluir o recebimento. Preserve o backup e os dados deste dispositivo. ')+error.message);return false;
            }finally{pfRecebendoDadosNuvem=false;}
        }
