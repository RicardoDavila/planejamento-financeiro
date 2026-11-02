from pathlib import Path
import re
ROOT=Path(__file__).resolve().parent.parent
def apply(html):
 html=re.sub(r'<style id="pf-quick-cards-style">[\s\S]*?</style>\s*','',html)
 html=re.sub(r'<script id="pf-quick-cards">[\s\S]*?</script>\s*','',html)
 html=re.sub(r'\n/\* PFQF bridge:start \*/\n[\s\S]*?\n/\* PFQF bridge:end \*/\n','',html)
 def bridge(code):return '\n/* PFQF bridge:start */\n'+code+'\n/* PFQF bridge:end */\n'
 marker='const passaFiltrosIndividuais = (t) => {'
 assert marker in html
 html=html.replace(marker,marker+bridge("                if(typeof window!=='undefined'&&window.PFQuickCards&&!window.PFQuickCards.apply([t],'charts').length)return false;"),1)
 start=html.index('function atualizarGraficos()');pos=html.index('const filtradas = transacoes.filter(t => {',start)+len('const filtradas = transacoes.filter(t => {')
 html=html[:pos]+bridge("                if(typeof window!=='undefined'&&window.PFQuickCards&&!window.PFQuickCards.apply([t],'charts').length)return false;")+html[pos:]
 start=html.index('function compararTotalReceitasDespesas()')
 needle='const filtradas = (Array.isArray(transacoes) ? transacoes : []).filter(t => {'
 pos=html.index(needle,start)+len(needle)
 html=html[:pos]+bridge("                if(typeof window!=='undefined'&&window.PFQuickCards&&!window.PFQuickCards.apply([t],'charts').length)return false;")+html[pos:]
 marker='function monthAnalysisData(rows,allRows,chosen){';assert marker in html
 html=html.replace(marker,marker+bridge(" if(typeof window!=='undefined'&&window.PFQuickCards)allRows=window.PFQuickCards.apply(allRows);"),1)
 css=(ROOT/'automacao/filtros_cartoes.css').read_text(encoding='utf8');js=(ROOT/'automacao/filtros_cartoes.js').read_text(encoding='utf8')
 pos=html.lower().rfind('</body>');return html[:pos]+'<style id="pf-quick-cards-style">\n'+css+'\n</style>\n<script id="pf-quick-cards">\n'+js+'\n</script>\n'+html[pos:]
if __name__=='__main__':
 for name in ['index.html','distribuicao/app.html','teste-gemini/app.html']:
  p=ROOT/name;p.write_text(apply(p.read_text(encoding='utf8')),encoding='utf8')
 print('Filtros dos cartões integrados nas três telas.')
