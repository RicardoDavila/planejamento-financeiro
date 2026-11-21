import pathlib,subprocess,unittest,re
ROOT=pathlib.Path(__file__).resolve().parents[1]
class Surfaces34Tests(unittest.TestCase):
 def test_semantic_surfaces_preserve_data_and_mixed_totals(self):
  subprocess.run(['node','-e',r"""
const assert=require('node:assert/strict'),p=require('./automacao/superficies_34.js');
for(const [label,value,expected] of [['Receitas previstas','R$ 100,00','income'],['Despesas pagas','R$ 50,00','expense'],['Saldo','R$ 50,00','positive'],['Saldo','-R$ 50,00','expense'],['Saldo','R$ 0,00','neutral'],['Saldo','N/D','neutral'],['Receitas X Despesas','R$ 100,00','expense'],['Taxa de poupança','20%','indicator'],['Participação de receitas','50%','indicator'],['Patrimônio','R$ 100,00','indicator'],['Information','42','neutral'],['Income','100','income'],['Gastos','50','expense']])assert.equal(p.kind(label,value),expected,label);
"""],cwd=ROOT,check=True)
  source=(ROOT/'automacao/superficies_34.js').read_text(encoding='utf-8')
  for forbidden in ['localStorage','indexedDB','fetch(','innerHTML','addEventListener','MutationObserver','transacoes']:
   self.assertNotIn(forbidden,source)
 def test_sync_scope_and_no_layout_changes(self):
  css=(ROOT/'automacao/superficies_34.css').read_text(encoding='utf-8')
  self.assertIn('@media screen and (min-width:901px) and (pointer:fine)',css)
  for forbidden in ['overflow:', 'display:none','height:','width:','padding:','transform:','stroke:','fill:']:
   self.assertNotRegex(css,r'[;{]\s*'+re.escape(forbidden))
  for file in ['index.html','distribuicao/app.html','teste-gemini/app.html']:
   html=(ROOT/file).read_text(encoding='utf-8')
   for tag,name,ident in [('style','superficies_34.css','pf-surfaces-34-style'),('script','superficies_34.js','pf-surfaces-34-script')]:
    self.assertEqual(re.findall('<'+tag+' id="'+ident+'">([\s\S]*?)</'+tag+'>',html),[(ROOT/'automacao'/name).read_text(encoding='utf-8')])

 def test_text_contrast_of_defined_indicator_palette(self):
  def lum(h):
   values=[int(h[i:i+2],16)/255 for i in (1,3,5)]
   linear=[v/12.92 if v<=.04045 else ((v+.055)/1.055)**2.4 for v in values]
   return sum(v*w for v,w in zip(linear,[.2126,.7152,.0722]))
  for bg,ink in [('#EAF5FC','#166534'),('#FFF0F1','#BE123C'),('#EAF7F0','#166534'),('#F1EEFC','#6D28D9'),('#F2F5F8','#0F172A')]:
   a,b=sorted([lum(bg),lum(ink)]);self.assertGreaterEqual((b+.05)/(a+.05),4.5)
  for bg in ['#1C242B','#20252B','#222629','#1D2529','#1C252C','#242623','#232329','#20242A']:
   for ink in ['#F8FAFC','#A7B4C7','#00de99','#ff4d6a','#57b6ff','#ffd166','#b49aff']:
    a,b=sorted([lum(bg),lum(ink)]);self.assertGreaterEqual((b+.05)/(a+.05),4.5,(bg,ink))
