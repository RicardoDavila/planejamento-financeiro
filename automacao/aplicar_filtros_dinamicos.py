from pathlib import Path
import re
ROOT=Path(__file__).resolve().parent.parent
def apply(html):
 for tag,id in [('style','pf-dynamic-filters-style'),('script','pf-dynamic-filters')]:
  html=re.sub(r'<'+tag+' id="'+id+r'">[\s\S]*?</'+tag+'>\s*','',html)
 css=(ROOT/'automacao/filtros_dinamicos.css').read_text(encoding='utf8');js=(ROOT/'automacao/filtros_dinamicos.js').read_text(encoding='utf8')
 pos=html.lower().rfind('</body>');return html[:pos]+'<style id="pf-dynamic-filters-style">\n'+css+'\n</style>\n<script id="pf-dynamic-filters">\n'+js+'\n</script>\n'+html[pos:]
if __name__=='__main__':
 for name in ['index.html','distribuicao/app.html','teste-gemini/app.html']:
  p=ROOT/name;p.write_text(apply(p.read_text(encoding='utf8')),encoding='utf8')
 print('Filtros dinâmicos integrados nas três telas.')
