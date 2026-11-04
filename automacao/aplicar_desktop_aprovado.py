"""Reaplica o módulo aprovado somente ao PC pessoal e à Distribuição.

O HTML mantém uma cópia embutida para funcionar com o cache/offline atual.
Use --check na revisão; sem esse argumento, sincroniza CSS, módulo e HTMLs.
"""
from pathlib import Path
import argparse, json, re
ROOT=Path(__file__).resolve().parents[1]
SCRIPT='<script id="pf-desktop-approved-v413">'
PATTERN=re.compile(re.escape(SCRIPT)+r'([\s\S]*?)</script>')
BRIDGE='\n/* desktop-composition-bridge */ if(!payload&&!passive&&window.PFDesktopApproved?.showComposition){if(protectedState(state))return;window.PFDesktopApproved.showComposition(overrideRows||pointRows(state,point),point.label+" · "+point.series);return;}'
def sync(check=False):
    module=ROOT/'automacao/desktop_aprovado.js'
    css=(ROOT/'automacao/desktop_aprovado.css').read_text(encoding='utf-8-sig')
    js=module.read_text(encoding='utf-8-sig')
    match=re.search(r'^const DESKTOP_CSS=(.*);$',js,re.M)
    if not match: raise ValueError('Constante de estilo não encontrada.')
    if check:
        if json.loads(match[1])!=css: raise ValueError('CSS fonte e CSS embutido divergentes.')
    else:
        js=js[:match.start(1)]+json.dumps(css,ensure_ascii=False).replace('<','\\u003c')+js[match.end(1):]
        module.write_bytes(js.encode('utf-8'))
    for name in ['index.html','distribuicao/app.html']:
        path=ROOT/name
        text=path.read_bytes().decode('utf-8')
        match=PATTERN.search(text)
        if check:
            if not match or match[1].replace('\r\n','\n')!=js: raise ValueError('Módulo divergente em '+name)
            continue
        if match: text=text[:match.start()]+SCRIPT+js+'</script>'+text[match.end():]
        else:
            head,tail=text.rsplit('</body>',1)
            text=head+SCRIPT+js+'</script>\n</body>'+tail
        if '/* desktop-composition-bridge */' not in text:
            old='function detail(state,point,overrideRows,passive=false){'
            if text.count(old)!=1: raise ValueError('Revisar o ponto de integração dos gráficos em '+name)
            text=text.replace(old,old+BRIDGE,1)
        path.write_bytes(text.encode('utf-8'))
    print('Módulo PC/Distribuição consistente; modo Celular preservado.')
if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--check',action='store_true');sync(parser.parse_args().check)
