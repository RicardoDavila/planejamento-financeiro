import unittest,subprocess,re
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
class CurrentMonthTests(unittest.TestCase):
 def test_periodos_e_relogio_local(self):
  subprocess.run(['node',str(Path(__file__).with_suffix('.cjs'))],check=True)
 def test_inicializacao_e_modulos_nos_tres_apps(self):
  for name in ['index.html','distribuicao/app.html','teste-gemini/app.html']:
   html=(ROOT/name).read_text(encoding='utf-8')
   for file,ident in [('dashboard_pessoal.js','pf-dashboard-personal-script'),('analise_financeira.js','pf-analysis-page-script'),('graficos_visao_geral.js','pf-graphics-overview-script')]:
    source=(ROOT/'automacao'/file).read_text(encoding='utf-8')
    self.assertEqual(re.search(r'<script id="'+ident+r'">([\s\S]*?)</script>',html)[1],source)
    if file!='dashboard_pessoal.js':
     install=source[source.index('function install('):]
     self.assertIn('filter=defaults(Number(today().slice(0,4)),true)',install)
   self.assertIn('definirMesCorrentePadrao();',html)
