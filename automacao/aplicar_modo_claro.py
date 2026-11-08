"""Mantém a paleta e a legibilidade aprovadas nas páginas publicadas."""
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]

def aplicar_modo_claro(html):
    css = (ROOT / 'automacao/modo_claro_legivel.css').read_text(encoding='utf-8-sig')
    block = '<style id="pf-modo-claro-legibilidade">\n' + css + '\n</style>'
    pattern = r'<style id="pf-modo-claro-legibilidade">[\s\S]*?</style>'
    if re.search(pattern, html):
        return re.sub(pattern, lambda _: block, html)
    position = html.lower().rfind('</body>')
    if position < 0:
        raise ValueError('Página sem fechamento do body para os estilos do modo claro.')
    return html[:position] + block + '\n' + html[position:]

if __name__ == '__main__':
    for name in ['index.html', 'distribuicao/app.html', 'teste-gemini/app.html']:
        path = ROOT / name
        path.write_text(aplicar_modo_claro(path.read_text(encoding='utf-8-sig')), encoding='utf-8')
