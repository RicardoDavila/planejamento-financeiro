import pathlib,subprocess,unittest
from aplicar_moedas import aplicar_moedas,ROOT
class MoedasTests(unittest.TestCase):
    def test_base_cotacoes_e_relatorios(self):
        subprocess.run(['node',str(pathlib.Path(__file__).with_suffix('.cjs'))],check=True)
        for rel in ['index.html','distribuicao/app.html','teste-gemini/app.html']:
            html=(ROOT/rel).read_text(encoding='utf-8-sig')
            self.assertEqual(aplicar_moedas(html,rel.startswith('distribuicao/')),html)
            self.assertEqual(html.count('id="pf-global-currency"'),1)

    def test_csp_preserva_endpoint_dos_indicadores(self):
        endpoint='https://api.bcb.gov.br/dados/serie/bcdata.sgs.432/dados'
        html='<html><head><meta http-equiv="Content-Security-Policy" content="connect-src https://api.bcb.gov.br;"></head><body><script>const url="'+endpoint+'";</script></body></html>'
        result=aplicar_moedas(html)
        self.assertIn(endpoint,result)
        self.assertIn('connect-src https://api.bcb.gov.br https://olinda.bcb.gov.br;',result)
        self.assertNotIn('https://olinda.bcb.gov.br/dados/',result)
        self.assertEqual(aplicar_moedas(result),result)
