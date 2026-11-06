"""Integra notas locais sem modificar cálculo, lançamentos ou consultas de IA."""
from pathlib import Path
import re
ROOT=Path(__file__).resolve().parents[1]
def aplicar_notas(html,distribuicao=False):
    code=(ROOT/'automacao/notas_privadas.js').read_text(encoding='utf-8-sig')
    if distribuicao: code=code.replace('localStorage','pfdLocal')
    block='<script id="pf-private-notes">\n'+code+'\n</script>'
    pattern=r'<script id="pf-private-notes">[\s\S]*?</script>'
    if re.search(pattern,html): return re.sub(pattern,lambda _:block,html)
    point=html.lower().rfind('</body>')
    if point<0: raise ValueError('Página sem fechamento do body.')
    return html[:point]+block+'\n'+html[point:]
if __name__=='__main__':
    for rel in ['index.html','distribuicao/app.html','teste-gemini/app.html']:
        p=ROOT/rel;p.write_text(aplicar_notas(p.read_text(encoding='utf-8-sig'),rel.startswith('distribuicao/')),encoding='utf-8')
