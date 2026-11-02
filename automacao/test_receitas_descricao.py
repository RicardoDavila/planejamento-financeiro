import pathlib,subprocess,unittest
class RevenueDescriptionTests(unittest.TestCase):
 def test_distribuicao_real_por_descricao(self):
  subprocess.run(['node',str(pathlib.Path(__file__).with_suffix('.cjs'))],check=True)
