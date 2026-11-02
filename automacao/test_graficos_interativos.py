import pathlib,subprocess,unittest
class ChartExplorerTests(unittest.TestCase):
 def test_chart_data_and_report_integration(self):
  subprocess.run(['node',str(pathlib.Path(__file__).with_suffix('.cjs'))],check=True)
