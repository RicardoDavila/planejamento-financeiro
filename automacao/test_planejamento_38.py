import pathlib,subprocess,unittest
class Planejamento38Tests(unittest.TestCase):
 def test_navegacao_e_preservacao(self):
  subprocess.run(['node',str(pathlib.Path(__file__).with_suffix('.cjs'))],check=True)
