import pathlib,subprocess,unittest
class GeminiSessionTests(unittest.TestCase):
    def test_sessao_compartilhada_do_chat(self):
        root=pathlib.Path(__file__).resolve().parents[1]
        if not (root/'teste-gemini').exists():self.skipTest('Cópia Gemini opcional não instalada.')
        subprocess.run(['node',str(pathlib.Path(__file__).with_name('test_gemini_sessao.cjs'))],check=True)
