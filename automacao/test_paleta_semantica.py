import unittest,subprocess,re
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
class SemanticPaletteTests(unittest.TestCase):
    def test_assuntos_e_vencimentos_visuais(self):
        subprocess.run(['node',str(Path(__file__).with_suffix('.cjs'))],check=True)
    def test_modulo_em_todos_html_e_sem_gravacao(self):
        source=(ROOT/'automacao/paleta_semantica.js').read_text(encoding='utf-8')
        for mutation in ['localStorage','indexedDB','transacoes','fetch(','innerHTML=','replaceChildren','addEventListener']:
            self.assertNotIn(mutation,source)
        for path in ROOT.rglob('*.html'):
            if any(k in path.parts for k in ['.git','build']):continue
            html=path.read_text(encoding='utf-8')
            block=re.findall('<script id="pf-semantic-palette-script">([\s\S]*?)</script>',html)
            self.assertEqual(block,[source],str(path))
            self.assertLess(html.index('id="pf-semantic-palette-script"'),html.index('id="pf-white-buttons-script"'))
