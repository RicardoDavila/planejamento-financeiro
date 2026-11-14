import unittest,subprocess,re
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
class GraphicsEvolutionTests(unittest.TestCase):
    def test_conectores_nao_interceptam_os_pontos(self):
        css=(ROOT/'automacao/graficos_visao_geral.css').read_text(encoding='utf-8')
        self.assertIn('.pfgo-svg polyline,.pfgo-svg polygon{pointer-events:none}',css)
    def test_calculos_detalhes_e_renderer(self):
        subprocess.run(['node',str(Path(__file__).with_suffix('.cjs'))],check=True)
    def test_modulo_sincronizado_antes_da_pagina(self):
        code=(ROOT/'automacao/graficos_evolucoes.js').read_text(encoding='utf-8')
        for name in ['index.html','distribuicao/app.html','teste-gemini/app.html']:
            html=(ROOT/name).read_text(encoding='utf-8')
            block=re.search('<script id="pf-graphics-evolution-script">([\s\S]*?)</script>',html)
            self.assertIsNotNone(block,name)
            self.assertEqual(block[1],code)
            self.assertLess(html.index('id="pf-graphics-evolution-script"'),html.index('id="pf-graphics-overview-script"'))
            self.assertTrue("view='evolutions'" in html)
            self.assertTrue('data-go-legacy-tools' in html)
