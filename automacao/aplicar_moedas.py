"""Acrescenta apenas a apresentação monetária; não modifica a base financeira."""
from pathlib import Path
import re
ROOT=Path(__file__).resolve().parents[1]
def aplicar_moedas(html,distribuicao=False):
    code=(ROOT/'automacao/moedas.js').read_text(encoding='utf-8-sig')
    if distribuicao: code=code.replace('localStorage','pfdLocal')
    block='<script id="pf-global-currency">\n'+code+'\n</script>'
    pattern=r'<script id="pf-global-currency">[\s\S]*?</script>'
    if re.search(pattern,html): html=re.sub(pattern,lambda _:block,html)
    else:
        point=html.lower().rfind('</body>')
        if point<0: raise ValueError('Página sem body.')
        html=html[:point]+block+'\n'+html[point:]
    def csp(match):
        tag=match.group(0)
        if 'https://api.bcb.gov.br https://olinda.bcb.gov.br' not in tag:
            tag=tag.replace('https://api.bcb.gov.br','https://api.bcb.gov.br https://olinda.bcb.gov.br')
        return tag
    return re.sub(r'<meta\b[^>]*http-equiv="Content-Security-Policy"[^>]*>',csp,html,flags=re.I)

if __name__=='__main__':
    for rel in ['index.html','distribuicao/app.html','teste-gemini/app.html']:
        p=ROOT/rel;p.write_text(aplicar_moedas(p.read_text(encoding='utf-8-sig'),rel.startswith('distribuicao/')),encoding='utf-8')
