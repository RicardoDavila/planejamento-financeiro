import pathlib,subprocess,unittest
class ModosRelatoriosTests(unittest.TestCase):
    def test_modelos_e_serializacao_completa(self):
        subprocess.run(['node',str(pathlib.Path(__file__).with_suffix('.cjs'))],check=True)
