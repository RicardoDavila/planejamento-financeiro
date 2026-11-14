import unittest,subprocess,re
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
class GraphicsOverviewTests(unittest.TestCase):
    def test_calculos_e_autofiltros(self):
        subprocess.run(['node',str(Path(__file__).with_suffix('.cjs'))],check=True)
    def test_tres_apps_sincronizados_e_acoes_anteriores_preservadas(self):
        for name in ['index.html','distribuicao/app.html','teste-gemini/app.html']:
            html=(ROOT/name).read_text(encoding='utf-8')
            for tag,file in [('style','graficos_visao_geral.css'),('script','graficos_visao_geral.js')]:
                block=re.search('<'+tag+' id="pf-graphics-overview-'+tag+'">([\s\S]*?)</'+tag+'>',html)
                self.assertIsNotNone(block,name)
                self.assertEqual(block[1],(ROOT/'automacao'/file).read_text(encoding='utf-8'))
            for field in ['id="formLancamento"','id="modalGerenciarCadastros"','PFCadastroForms','PFPersonalDashboard']:
                self.assertTrue(field in html,(name,field))
