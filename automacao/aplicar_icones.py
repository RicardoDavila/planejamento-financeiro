"""Atualiza somente a camada visual de ícones; mantém os rótulos originais."""
from pathlib import Path
import re
ROOT=Path(__file__).resolve().parents[1]
def aplicar(html):
    css=(ROOT/'automacao/icones_interface.css').read_text(encoding='utf-8')
    js=(ROOT/'automacao/icones_interface.js').read_text(encoding='utf-8')
    html=re.sub(r'<style id="pf-financial-icons-style">[\s\S]*?</style>\s*','',html)
    html=re.sub(r'<script id="pf-financial-icons">[\s\S]*?</script>\s*','',html)
    position=html.lower().rfind('</body>')
    if position<0: raise ValueError('Não foi encontrado o fechamento da página')
    return html[:position]+'<style id="pf-financial-icons-style">\n'+css+'\n</style>\n<script id="pf-financial-icons">\n'+js+'\n</script>\n'+html[position:]
if __name__=='__main__':
    for name in ['index.html','distribuicao/app.html','teste-gemini/app.html']:
        path=ROOT/name
        path.write_text(aplicar(path.read_text(encoding='utf-8')),encoding='utf-8')
    print('Ícones aplicados sem alterar nomes ou lógica financeira.')
