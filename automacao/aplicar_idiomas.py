"""Embeds the shared language module without changing existing layout or data code."""
from pathlib import Path
import re
ROOT = Path(__file__).resolve().parents[1]

def aplicar_idiomas(html, distribuicao=False, graficos=False, container=False):
    code = (ROOT / ('automacao/idiomas_graficos.js' if graficos else 'automacao/idiomas.js')).read_text(encoding='utf-8-sig')
    if container:
        code = code.replace('bootFinancialLanguage(catalogue);', 'bootFinancialLanguage(catalogue,{noMenu:true});')
    if distribuicao:
        code = code.replace('localStorage', 'pfdLocal').replace('sessionStorage', 'pfdSession')
    block = '<script id="pf-global-language">\n' + code + '\n</script>'
    pattern = r'<script id="pf-global-language">[\s\S]*?</script>'
    current = re.search(pattern, html)
    if current:
        if current.group(0) == block:
            return html
        return html[:current.start()] + block + html[current.end():]
    point = html.lower().rfind('</body>')
    if point < 0:
        raise ValueError('Página sem fechamento do body para o módulo de idiomas.')
    return html[:point] + block + '\n' + html[point:]

if __name__ == '__main__':
    for rel in ['index.html', 'distribuicao/app.html', 'teste-gemini/app.html', 'graficos.html', 'distribuicao/graficos.html', 'teste-gemini/graficos.html', 'distribuicao/index.html', 'teste-gemini/index.html']:
        path = ROOT / rel
        path.write_text(aplicar_idiomas(path.read_text(encoding='utf-8-sig'), rel == 'distribuicao/app.html', rel.endswith('graficos.html'), rel in ['distribuicao/index.html','teste-gemini/index.html']), encoding='utf-8')
