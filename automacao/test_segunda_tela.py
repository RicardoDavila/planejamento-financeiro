import unittest,subprocess,re
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
class SecondScreenTests(unittest.TestCase):
 def test_escolha_e_protecao(self):
  subprocess.run(['node',str(Path(__file__).with_suffix('.cjs'))],check=True)
 def test_modulos_integrados(self):
  for name in ['index.html','distribuicao/app.html','teste-gemini/app.html']:
   html=(ROOT/name).read_text(encoding='utf-8')
   for tag,file,ident in [('script','segunda_tela.js','pf-second-screen-script'),('style','segunda_tela.css','pf-second-screen-style')]:
    self.assertEqual(re.search('<'+tag+' id="'+ident+'">([\\s\\S]*?)</'+tag+'>',html).group(1),(ROOT/'automacao'/file).read_text(encoding='utf-8'))
