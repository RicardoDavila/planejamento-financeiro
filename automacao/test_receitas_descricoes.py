import pathlib,subprocess,unittest
class RevenueDescriptionTests(unittest.TestCase):
 def test_description_breakdown(self):
  subprocess.run(['node',str(pathlib.Path(__file__).with_suffix('.cjs'))],check=True)
