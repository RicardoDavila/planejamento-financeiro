import pathlib,subprocess,unittest
from aplicar_moedas import aplicar_moedas,ROOT
class MoedasTests(unittest.TestCase):
    def test_base_cotacoes_e_relatorios(self):
        subprocess.run(['node',str(pathlib.Path(__file__).with_suffix('.cjs'))],check=True)
        for rel in ['index.html','distribuicao/app.html','teste-gemini/app.html']:
            html=(ROOT/rel).read_text(encoding='utf-8-sig')
            self.assertEqual(aplicar_moedas(html,rel.startswith('distribuicao/')),html)
            self.assertEqual(html.count('id="pf-global-currency"'),1)
