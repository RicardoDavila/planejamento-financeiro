from pathlib import Path
import re

PERSONAL_VERSION='V4.11.18'


def corrigir_sincronizacao(html, distribuicao=False):
    storage='pfdLocal' if distribuicao else 'localStorage'
    helper=Path(__file__).with_name('sincronizacao_automatica.js').read_text(encoding='utf-8')
    helper+='\n'+Path(__file__).with_name('recuperacao_celular.js').read_text(encoding='utf-8')
    helper=helper.replace('localStorage',storage)
    marker='        async function pfSincronizarConta(){'
    if html.count(marker)!=1:
        raise ValueError('Não foi possível localizar a sincronização compartilhada.')
    html=html.replace(marker,helper+marker,1)
    old="if(pfTemAlteracoesLocais()){await salvarPacoteNuvem();return 'enviado';}"
    new="if(pfTemAlteracoesLocais()){if(await pfConfirmarCopiasIguais(remote))return 'enviado';await salvarPacoteNuvem();return 'enviado';}"
    if html.count(old)!=1:
        raise ValueError('A regra de envio mudou; revise a reconciliação antes de publicar.')
    html=html.replace(old,new,1)
    old='                    if (!pfTemAlteracoesLocais()) {'
    new="                    if (pfTemAlteracoesLocais()) {\n                        await pfSincronizarConta();\n                        popularSelectsDinamicos();renderTable();atualizarPainelGerencial();atualizarInfoBanco();verificarContasVencendoHoje();\n                    } else {"
    if html.count(old)!=1:
        raise ValueError('A regra de atualização automática mudou.')
    html=html.replace(old,new,1)
    html=html.replace("} catch(e) { console.warn('Sincronização automática:', e); }", "} catch(e) { console.warn('Sincronização automática:', e); atualizarStatusNuvem('Falha na sincronização automática: '+e.message); }")
    # Na interface móvel, conexão da sessão não comprova sincronização dos dados.
    old="el('cloud').classList.toggle('online',sessionConnected);el('cloud').textContent=/sincronizando/i.test(raw)?'↻ Sincronizando':sessionConnected?'● Conectada':'○ Desconectada';"
    new="const synced=sessionConnected&&raw==='Online';el('cloud').classList.toggle('online',synced);el('cloud').textContent=/sincronizando/i.test(raw)?'↻ Sincronizando':/falha|erro|pendente|expirada/i.test(raw)?'● Sincronização pendente':synced?'● Sincronizada':'○ Sem confirmação';"
    html=html.replace(old,new)
    html=html.replace("if (badge) badge.textContent = 'Online';", "if (badge && /^(Local|Conectar)$/.test(badge.textContent.trim())) atualizarStatusNuvem('Conta conectada; aguardando sincronização.');")
    html=html.replace("indicator('Online');return fresh;", "return fresh;")
    # As alterações automáticas de status não devem impedir o recebimento do PC.
    anchor='        function pfTemAlteracoesLocais(){'
    html=html.replace(anchor,anchor+'\n            const confirmed=pfLerBaseFinanceiraConfirmada();if(confirmed)return !pfDadosFinanceirosIguais(coletarPacoteNuvem(),confirmed.financeiro);',1)
    html=html.replace('            const operation=async()=>{', "            const operation=async()=>{\n                if(pfRecebendoDadosNuvem)throw Error('Recebimento da nuvem em andamento. Aguarde a conclusão.');",1)
    html=html.replace("localStorage.setItem('pf_alteracao_confirmada',token);".replace('localStorage',storage),"localStorage.setItem('pf_alteracao_confirmada',token);pfSalvarBaseFinanceiraConfirmada(payload,session.user.id,rows[0].updated_at);".replace('localStorage',storage),1)
    html=html.replace(marker,marker+"\n            if(pfRecebendoDadosNuvem)throw Error('Recebimento da nuvem em andamento. Aguarde a conclusão.');",1)
    anchor="            atualizarStatusNuvem('Banco da sua conta carregado neste dispositivo.',true);return 'carregado';"
    html=html.replace(anchor,"            pfSalvarBaseFinanceiraConfirmada(remote.payload,pfIdContaSync(),remote.updated_at);\n"+anchor,1)
    # O envio agendado passa pela mesma reconciliação da sincronização manual.
    html=html.replace('if (session) await salvarPacoteNuvem();','if (session) await pfSincronizarConta();',1)
    button='<button type="button" onclick="receberDadosNuvemComBackup()" class="w-full border border-blue-700 text-blue-800 rounded-lg py-2.5 text-sm font-semibold">Receber dados do PC/nuvem (com backup)</button>'
    anchor='                    <button onclick="testarConexaoNuvem()"'
    if html.count(anchor)!=1:raise ValueError('Não foi possível incluir o recebimento seguro no painel de nuvem.')
    html=html.replace(anchor,'                    '+button+'\n'+anchor,1)
    html=html.replace('neste PC','neste dispositivo').replace('este PC','este dispositivo')
    if not distribuicao:
        old="try { await supabaseCliente.auth.signOut({ scope: 'local' }); } catch (_) {}"
        if html.count(old)!=1:raise ValueError('A rotina de login mudou; revise a preservação da sessão.')
        html=html.replace(old,'// Preserva a sessão anterior até a nova autenticação ser validada.',1)
        html=html.replace('// Limpa uma sessão antiga somente deste dispositivo antes de autenticar.','// Uma tentativa recusada não deve encerrar a sessão anterior.',1)
        a=html.index('        async function entrarNuvem()');b=html.index('        async function criarContaNuvem()',a)
        region=html[a:b].replace('const detalhe = resumirErroSupabase(e);','const detalhe = pfDetalheFalhaLoginNuvem(e);')
        html=html[:a]+region+html[b:]
        html=re.sub(r"const CURRENT_VERSION='V[0-9.]+';", "const CURRENT_VERSION='"+PERSONAL_VERSION+"';",html)
    return html
