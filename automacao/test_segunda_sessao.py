import unittest,subprocess
from pathlib import Path
class SecondScreenSessionTests(unittest.TestCase):
 def test_autorizacao_da_janela_principal(self):
  subprocess.run(['node',str(Path(__file__).with_suffix('.cjs'))],check=True)
