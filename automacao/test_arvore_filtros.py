import pathlib,subprocess,unittest
class TreeFilterRegressionTests(unittest.TestCase):
 def test_estado_da_arvore_antes_do_redesenho(self):
  subprocess.run(['node',str(pathlib.Path(__file__).with_suffix('.cjs'))],check=True)
