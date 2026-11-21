import pathlib,subprocess,unittest
class Investimentos382Tests(unittest.TestCase):
 def test_simulador_unico_e_dados(self):
  subprocess.run(['node',str(pathlib.Path(__file__).with_suffix('.cjs'))],check=True)
