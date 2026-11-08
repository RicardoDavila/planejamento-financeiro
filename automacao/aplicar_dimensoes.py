"""Aplica o ajuste aprovado de largura sem modificar dados ou scripts do app."""
from pathlib import Path
import re
ROOT=Path(__file__).resolve().parents[1]

def aplicar_dimensoes(html):
    css=(ROOT/'automacao/dimensoes_colunas.css').read_text(encoding='utf-8-sig')
    block='<style id="pf-dimensoes-colunas">\n'+css+'\n</style>'
    pattern=r'<style id="pf-dimensoes-colunas">[\s\S]*?</style>'
    if re.search(pattern,html):return re.sub(pattern,lambda _:block,html)
    position=html.lower().rfind('</body>')
    if position<0:raise ValueError('Página sem fechamento do body para o ajuste das colunas.')
    return html[:position]+block+'\n'+html[position:]

if __name__=='__main__':
    for name in ['index.html','distribuicao/app.html','teste-gemini/app.html']:
        p=ROOT/name;p.write_text(aplicar_dimensoes(p.read_text(encoding='utf-8-sig')),encoding='utf-8')
