import pathlib,subprocess,unittest
class QuickCardsTests(unittest.TestCase):
 def test_filtros_restauracao_e_integracao(self):
  subprocess.run(['node',str(pathlib.Path(__file__).with_suffix('.cjs'))],check=True)
