import pathlib,subprocess,unittest
class NotasPessoaisTests(unittest.TestCase):
    def test_persistencia_conflitos_e_contas(self):
        subprocess.run(['node',str(pathlib.Path(__file__).with_suffix('.cjs'))],check=True)
