import unittest
from pathlib import Path
from aplicar_dashboard import aplicar_dashboard
ROOT=Path(__file__).resolve().parents[1]
class DashboardTests(unittest.TestCase):
    def test_application_is_idempotent_and_preserves_existing_body(self):
        original='<html><body><section id="painelGerencial">Valores protegidos</section></body></html>'
        result=aplicar_dashboard(original)
        self.assertEqual(result,aplicar_dashboard(result))
        self.assertIn('<section id="painelGerencial">Valores protegidos</section>',result)
    def test_all_apps_have_same_module(self):
        import re
        for name in ['index.html','distribuicao/app.html','teste-gemini/app.html']:
            html=(ROOT/name).read_text(encoding='utf-8')
            for tag,file in [('style','dashboard_referencia.css'),('script','dashboard_referencia.js')]:
                embedded=re.search('<'+tag+' id="pf-dashboard-'+tag+'">([\s\S]*?)</'+tag+'>',html).group(1)
                self.assertEqual(embedded,(ROOT/'automacao'/file).read_text(encoding='utf-8'))

    def test_navigation_uses_original_actions_and_preserves_mobile(self):
        import subprocess
        subprocess.run(['node',str(Path(__file__).with_suffix('.cjs'))],check=True)
