import unittest,subprocess,re
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
class PersonalDashboardTests(unittest.TestCase):
    def test_model_and_runtime(self):
        subprocess.run(['node',str(Path(__file__).with_suffix('.cjs'))],check=True)
    def test_personal_modules_are_synchronized(self):
        for name in ['index.html','distribuicao/app.html','teste-gemini/app.html']:
            html=(ROOT/name).read_text(encoding='utf-8')
            for tag,filename in [('style','dashboard_pessoal.css'),('script','dashboard_pessoal.js')]:
                block=re.search('<'+tag+' id="pf-dashboard-personal-'+tag+'">([\\s\\S]*?)</'+tag+'>',html)
                self.assertIsNotNone(block,name)
                self.assertEqual(block[1],(ROOT/'automacao'/filename).read_text(encoding='utf-8-sig'))
