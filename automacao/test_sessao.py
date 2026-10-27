import pathlib,subprocess,unittest
class SessionTests(unittest.TestCase):
    def test_sessao_ao_voltar_a_aba(self):
        subprocess.run(['node',str(pathlib.Path(__file__).with_name('test_sessao.cjs'))],check=True)
