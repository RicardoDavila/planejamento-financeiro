import pathlib,subprocess,unittest
class GraficosPercentuaisTests(unittest.TestCase):
 def test_variacao_e_participacao_mensais(self):
  subprocess.run(['node',str(pathlib.Path(__file__).with_suffix('.cjs'))],check=True)
 def test_integracao_das_fontes(self):
  root=pathlib.Path(__file__).resolve().parent
  for name in ['dashboard_pessoal.js','graficos_visao_geral.js','graficos_evolucoes.js','graficos_interativos.js','analise_financeira.js','desktop_aprovado.js','relatorios_pessoais.js']:
   self.assertIn('PFChartPercentages',(root/name).read_text(encoding='utf-8-sig'),name)
