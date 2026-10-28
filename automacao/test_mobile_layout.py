import hashlib,json,pathlib,re,subprocess,unittest
ROOT=pathlib.Path(__file__).resolve().parents[1]
class MobileLayoutTests(unittest.TestCase):
    def test_layout_comportamento_e_isolamento_do_pc(self):
        subprocess.run(['node',str(pathlib.Path(__file__).with_suffix('.cjs'))],check=True)
    def test_layout_desktop_preservado(self):
        pins=json.loads((ROOT/'automacao/desktop_layout_hashes.json').read_text(encoding='utf-8'))
        for name in ['index.html','teste-gemini/app.html']:
            html=(ROOT/name).read_text(encoding='utf-8')
            for key,(tag,expected) in pins.items():
                block=re.search(r'<'+tag+' id="'+key+r'">(.*?)</'+tag+'>',html,re.S).group(1)
                self.assertEqual(hashlib.sha256(block.encode()).hexdigest(),expected,name+': '+key)
