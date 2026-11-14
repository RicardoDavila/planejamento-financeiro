import unittest,subprocess,re
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
class SecondScreenTransitionTests(unittest.TestCase):
 def test_transicao_sem_conceder_autenticacao(self):
  subprocess.run(['node',str(Path(__file__).with_suffix('.cjs'))],check=True)
 def test_carrega_antes_do_formulario(self):
  for name in ['index.html','distribuicao/app.html','teste-gemini/app.html']:
   html=(ROOT/name).read_text(encoding='utf-8')
   for tag,file,ident in [('script','segunda_tela_boot.js','pf-second-screen-boot-script'),('style','segunda_tela_boot.css','pf-second-screen-boot-style')]:
    self.assertEqual(re.search('<'+tag+' id="'+ident+'">([\\s\\S]*?)</'+tag+'>',html).group(1),(ROOT/'automacao'/file).read_text(encoding='utf-8'))
    self.assertLess(html.index('id="'+ident+'"'),html.index('<body'))
   self.assertLess(html.lower().index('charset'),1024)
