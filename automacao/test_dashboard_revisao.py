from pathlib import Path
import unittest,subprocess,re
ROOT=Path(__file__).resolve().parents[1]
class DashboardReviewTests(unittest.TestCase):
    def test_review_math_and_data(self):
        subprocess.run(['node',str(Path(__file__).with_suffix('.cjs'))],check=True)
    def test_module_synchronization_and_order(self):
        source=(ROOT/'automacao/dashboard_revisao.js').read_text(encoding='utf-8-sig')
        for name in ['index.html','distribuicao/app.html','teste-gemini/app.html']:
            html=(ROOT/name).read_text(encoding='utf-8')
            block=re.search(r'<script id="pf-dashboard-review-script">([\s\S]*?)</script>',html)
            self.assertIsNotNone(block,name)
            self.assertEqual(block[1],source)
            self.assertLess(html.index('id="pf-dashboard-review-script"'),html.index('id="pf-dashboard-personal-script"'))
