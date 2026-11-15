import unittest,subprocess,re
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
class GraphicsComparisonTests(unittest.TestCase):
 def test_calculos_tipos_e_composicao(self):
  subprocess.run(['node',str(Path(__file__).with_suffix('.cjs'))],check=True)
 def test_integracao_nas_duas_paginas_e_tres_apps(self):
  for name in ['index.html','distribuicao/app.html','teste-gemini/app.html']:
   html=(ROOT/name).read_text(encoding='utf-8')
   script=re.search(r'<script id="pf-graphics-comparison-script">([\s\S]*?)</script>',html)
   self.assertIsNotNone(script)
   self.assertEqual(script[1],(ROOT/'automacao/graficos_comparativos.js').read_text(encoding='utf-8'))
  page=(ROOT/'automacao/graficos_visao_geral.js').read_text(encoding='utf-8')
  self.assertEqual(page.count('+filters()+comparisons()'),2)
  self.assertIn("pick.section==='comparison'",page)
  self.assertIn("section==='comparison'?['padrao','areas','colunas','linhas','barras','rosca']",page)
