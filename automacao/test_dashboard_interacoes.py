from pathlib import Path
import unittest,subprocess,re
ROOT=Path(__file__).resolve().parents[1]
class InlineDashboardTests(unittest.TestCase):
    def test_calendar_inline_and_november(self):
        subprocess.run(['node',str(Path(__file__).with_suffix('.cjs'))],check=True)
    def test_module_in_all_apps(self):
        source=(ROOT/'automacao/dashboard_interacoes.js').read_text(encoding='utf-8-sig')
        for name in ['index.html','distribuicao/app.html','teste-gemini/app.html']:
            html=(ROOT/name).read_text(encoding='utf-8')
            block=re.search(r'<script id="pf-dashboard-inline-script">([\s\S]*?)</script>',html)
            self.assertIsNotNone(block,name)
            self.assertEqual(block[1],source)
