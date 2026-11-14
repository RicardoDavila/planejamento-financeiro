import unittest, subprocess
from pathlib import Path
class AnalysisStabilityTests(unittest.TestCase):
 def test_preserva_dom_sem_ignorar_atualizacoes(self):
  subprocess.run(['node',str(Path(__file__).with_suffix('.cjs'))],check=True)
