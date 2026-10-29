"""Correções específicas da distribuição aplicadas depois do adaptador de acesso."""

def corrigir_distribuicao(s):
    old="async function obterSessaoNuvem(){window.pfdAssert();inicializarSupabaseCliente();const {data,error}=await supabaseCliente.auth.getSession();if(error)throw error;window.pfdAssert();if(data.session?.user?.id!==window.parent.pfdUser?.id)throw Error('A sessão mudou. Entre novamente.');return data.session;}"
    new="async function obterSessaoNuvem(){window.pfdAssert();inicializarSupabaseCliente();const session=await window.parent.pfdGetSession();window.pfdAssert();if(session?.user?.id!==window.parent.pfdUser?.id)throw Error('A sessão pertence a outra conta. Entre novamente.');return session;}"
    assert old in s
    s=s.replace(old,new)
    s=s.replace("estado === 'online' || estado.includes('conect')","estado === 'online'")
    s=s.replace("/falha|erro|conflito/i.test(texto)","/falha|erro|conflito|pendente/i.test(texto)")
    s=s.replace("atualizarStatusNuvem('Alteração salva neste dispositivo; sincronização pendente.');","atualizarStatusNuvem('Falha na sincronização. Alteração salva neste dispositivo; sincronização pendente. '+e.message);")
    needle="if (badge) {badge.textContent=ok?"
    pos=s.index(needle)
    end=s.index('\n',pos)
    s=s[:end]+"\n            document.querySelectorAll('button[onclick=\"abrirConfiguracaoNuvem()\"]').forEach(btn=>{btn.style.setProperty('background-color',ok?'#047857':/falha|erro|conflito|pendente/i.test(texto)?'#b91c1c':/sincronizando/i.test(texto)?'#b45309':'#64748b','important');btn.title=texto;});"+s[end:]
    s=s.replace("el('cloud').classList.toggle('online',sessionConnected);el('cloud').textContent=/sincronizando/i.test(raw)?'↻ Sincronizando':sessionConnected?'● Conectada':'○ Desconectada';", "const synced=sessionConnected&&raw==='Online';el('cloud').classList.toggle('online',synced);el('cloud').textContent=/sincronizando/i.test(raw)?'↻ Sincronizando':/falha|erro|pendente/i.test(raw)?'● Falha na sincronização':synced?'● Sincronizada':'○ Sincronização pendente';")
    s=s.replace("proxy(groups['Ferramentas'],el('btnInstalarDesktop')", "button(groups['Ferramentas'],'Backup dos meus dados','folder',()=>{window.pfdAssert();fazerBackup();});\n proxy(groups['Ferramentas'],el('btnInstalarDesktop')")
    s=s.replace('Para mudar de Usuário para Administrador será solicitada a senha do Planejamento Financeiro.','O perfil Administrador depende de autorização no serviço. O backup dos seus dados está disponível em Ações e ferramentas.')
    # Autenticação válida não comprova que o pacote financeiro foi sincronizado.
    s=s.replace("if (badge) badge.textContent = 'Online';", "if (badge && /^(Local|Conectar)$/.test(badge.textContent.trim())) atualizarStatusNuvem('Conta autenticada; aguardando sincronização.');")
    s=s.replace("if (badge) badge.textContent = 'Local';", "atualizarStatusNuvem('Sessão indisponível; aguardando conexão.');")
    s=s.replace("indicator('Online');return fresh;", "return fresh;")
    s=s.replace("const erro = estado.includes('falha') || estado.includes('erro');", "const erro = /falha|erro|expirada/.test(estado);")
    # A promessa de restauração também precisa preservar e exibir o erro.
    start=s.index('        // Tenta restaurar a sessão manual')
    end=s.index('        }, 150);',start)
    region=s[start:end]
    region=region.replace('            });', "            }).catch(error => atualizarStatusNuvem('Falha ao recuperar a sessão: '+error.message));")
    s=s[:start]+region+s[end:]
    return s
