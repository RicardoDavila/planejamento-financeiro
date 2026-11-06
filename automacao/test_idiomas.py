import pathlib
import subprocess
import unittest
class IdiomasTests(unittest.TestCase):
    def test_menu_traducoes_e_preservacao(self):
        subprocess.run(['node', str(pathlib.Path(__file__).with_suffix('.cjs'))], check=True)
        from aplicar_idiomas import aplicar_idiomas, ROOT
        for rel in ['index.html','distribuicao/app.html','teste-gemini/app.html','graficos.html','distribuicao/graficos.html','teste-gemini/graficos.html','distribuicao/index.html','teste-gemini/index.html']:
            html = (ROOT / rel).read_text(encoding='utf-8-sig')
            self.assertEqual(aplicar_idiomas(html, rel == 'distribuicao/app.html', rel.endswith('graficos.html'), rel in ['distribuicao/index.html','teste-gemini/index.html']), html)
