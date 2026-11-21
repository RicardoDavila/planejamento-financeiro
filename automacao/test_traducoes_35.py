import pathlib, subprocess, unittest
class Traducoes35Tests(unittest.TestCase):
 def test_interface_e_preservacao_de_dados(self):
  subprocess.run(['node',str(pathlib.Path(__file__).with_suffix('.cjs'))],check=True)
