import pathlib,re,subprocess,unittest
from aplicar_notas import aplicar_notas,ROOT
class NotasPrivadasTests(unittest.TestCase):
    def test_persistencia_privacidade_e_integracao(self):
        subprocess.run(['node',str(pathlib.Path(__file__).with_suffix('.cjs'))],check=True)
        for rel in ['index.html','distribuicao/app.html','teste-gemini/app.html']:
            html=(ROOT/rel).read_text(encoding='utf-8-sig')
            self.assertEqual(aplicar_notas(html,rel.startswith('distribuicao/')),html)
            self.assertEqual(html.count('id="pf-private-notes"'),1)
            if rel.startswith('distribuicao/'):
                self.assertNotIn('localStorage',re.search(r'<script id="pf-private-notes">([\s\S]*?)</script>',html)[1])
