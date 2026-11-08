"""Integra o bloco de notas mantendo os três aplicativos e o gerador consistentes."""
from pathlib import Path
import re
ROOT=Path(__file__).resolve().parents[1]

def aplicar_notas_pessoais(html,distribuicao=False):
    for tag,key,name in [('style','pf-notas-style','notas.css'),('script','pf-notas-core','notas_core.js'),('script','pf-notas-ui','notas_ui.js')]:
        code=(ROOT/'automacao'/name).read_text(encoding='utf-8-sig')
        if distribuicao:code=code.replace('localStorage','pfdLocal').replace('sessionStorage','pfdSession')
        block=f'<{tag} id="{key}">\n'+code+f'\n</{tag}>'
        pattern=rf'<{tag} id="{key}">[\s\S]*?</{tag}>'
        if re.search(pattern,html):html=re.sub(pattern,lambda _:block,html)
        else:
            position=html.lower().rfind('</body>')
            if position<0:raise ValueError('Página sem fechamento de body para o bloco de notas.')
            html=html[:position]+block+'\n'+html[position:]
    return html

if __name__=='__main__':
    for name in ['index.html','distribuicao/app.html','teste-gemini/app.html']:
        p=ROOT/name;p.write_text(aplicar_notas_pessoais(p.read_text(encoding='utf-8-sig'),name.startswith('distribuicao/')),encoding='utf-8')
