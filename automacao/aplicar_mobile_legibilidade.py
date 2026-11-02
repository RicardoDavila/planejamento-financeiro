from pathlib import Path
import re
ROOT=Path(__file__).resolve().parent.parent
def apply(html):
 html=re.sub(r'<style id="pf-mobile-large-type">[\s\S]*?</style>\s*','',html)
 css=(ROOT/'automacao/mobile_legibilidade.css').read_text(encoding='utf8');pos=html.lower().rfind('</body>')
 return html[:pos]+'<style id="pf-mobile-large-type">\n'+css+'\n</style>\n'+html[pos:]
if __name__=='__main__':
 for name in ['index.html','distribuicao/app.html','teste-gemini/app.html']:
  p=ROOT/name;p.write_text(apply(p.read_text(encoding='utf8')),encoding='utf8')
 print('Legibilidade móvel integrada nas três telas.')
