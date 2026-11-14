from pathlib import Path
import unittest,subprocess,re
ROOT=Path(__file__).resolve().parents[1]
class DashboardSourceTests(unittest.TestCase):
    def test_sources_and_filters(self):
        subprocess.run(['node',str(Path(__file__).with_suffix('.cjs'))],check=True)
    def test_source_module_and_page_exports(self):
        source=(ROOT/'automacao/dashboard_fonte.js').read_text(encoding='utf-8-sig')
        for name in ['index.html','distribuicao/app.html','teste-gemini/app.html']:
            html=(ROOT/name).read_text(encoding='utf-8')
            self.assertIn('name="rubric"',html)
            self.assertIn('name="subItem"',html)
            self.assertIn('data-pdp-document="pdf"',html)
            self.assertIn('data-pdp-document="print"',html)
            block=re.search(r'<script id="pf-dashboard-source-script">([\s\S]*?)</script>',html)
            self.assertIsNotNone(block)
            self.assertEqual(block[1],source)
            self.assertLess(html.index('id="pf-dashboard-source-script"'),html.index('id="pf-dashboard-personal-script"'))
