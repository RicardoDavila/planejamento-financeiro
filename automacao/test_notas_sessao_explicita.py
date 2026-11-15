import pathlib,subprocess,unittest
class NotasSessaoExplicitaTests(unittest.TestCase):
 def test_identidade_e_transporte_autenticado(self):
  subprocess.run(['node',str(pathlib.Path(__file__).with_suffix('.cjs'))],check=True)
