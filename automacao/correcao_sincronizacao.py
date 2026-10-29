from pathlib import Path
import re

PERSONAL_VERSION='V4.11.18'


def corrigir_sincronizacao(html, distribuicao=False):
    storage='pfdLocal' if distribuicao else 'localStorage'
    helper=Path(__file__).with_name('sincronizacao_automatica.js').read_text(encoding='utf-8').replace('localStorage',storage)
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
    if not distribuicao:
        html=re.sub(r"const CURRENT_VERSION='V[0-9.]+';", "const CURRENT_VERSION='"+PERSONAL_VERSION+"';",html)
    return html
