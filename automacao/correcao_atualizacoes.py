from pathlib import Path


def corrigir_atualizacoes(html, distribuicao=False):
    start=html.index(' let pfVerificacaoAutomaticaIniciada=false;')
    end=html.index(" document.addEventListener('click',e=>{const m=document.getElementById('pfHelpModal');",start)
    script=Path(__file__).with_name('avisos_atualizacao.js').read_text(encoding='utf-8')
    base='https://ricardodavila.github.io/planejamento-financeiro/' + ('distribuicao/' if distribuicao else '')
    script=script.replace('__PF_UPDATE_BASE__',base).replace('__PF_UPDATE_HOST__','window.parent' if distribuicao else 'window').replace('__PF_UPDATE_STORAGE__','pfdLocal' if distribuicao else 'localStorage')
    return html[:start]+script+'\n'+html[end:]
