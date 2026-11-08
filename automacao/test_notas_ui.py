import pathlib,subprocess,unittest
class NotasUITests(unittest.TestCase):
    def test_salvamento_visibilidade_e_sessao(self):
        subprocess.run(['node',str(pathlib.Path(__file__).with_suffix('.cjs'))],check=True)
