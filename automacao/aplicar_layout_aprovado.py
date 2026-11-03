"""Atualiza os blocos visuais nas três telas sem alterar acesso ou armazenamento."""
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]

def apply():
    for tag, key, asset in [('style', 'pf-layout-aprovado-css', 'layout_aprovado.css'),
                             ('script', 'pf-layout-aprovado', 'layout_aprovado.js')]:
        content = (ROOT / 'automacao' / asset).read_text(encoding='utf-8-sig')
        replacement = '<' + tag + ' id="' + key + '">' + content + '</' + tag + '>'
        pattern = r'<' + tag + ' id="' + key + r'">[\s\S]*?</' + tag + '>'
        for name in ['index.html', 'distribuicao/app.html', 'teste-gemini/app.html']:
            path = ROOT / name
            html = path.read_text(encoding='utf-8-sig')
            if len(re.findall(pattern, html)) != 1:
                raise ValueError('Bloco visual ausente ou duplicado: ' + name + ': ' + key)
            path.write_text(re.sub(pattern, lambda _: replacement, html), encoding='utf-8')

if __name__ == '__main__':
    apply()
