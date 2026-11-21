import pathlib,subprocess,unittest
class RendaFixa383Tests(unittest.TestCase):
 def test_calculos_e_publicacao(self):
  subprocess.run(['node',str(pathlib.Path(__file__).with_suffix('.cjs'))],check=True)
 def test_fluxo_integrado(self):
  subprocess.run(['node',str(pathlib.Path(__file__).with_name('test_renda_fixa_fluxo_383.cjs'))],check=True)
