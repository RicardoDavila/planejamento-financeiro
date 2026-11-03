import pathlib,subprocess,unittest
class LayoutAprovadoTests(unittest.TestCase):
 def test_graficos_mobile_monitores_e_isolamento(self):
  subprocess.run(['node',str(pathlib.Path(__file__).with_suffix('.cjs'))],check=True)
