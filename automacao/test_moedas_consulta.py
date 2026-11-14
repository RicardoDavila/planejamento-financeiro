import subprocess,unittest
from pathlib import Path
class MoedasConsultaTests(unittest.TestCase):
 def test_roundtrip_sem_reconversao(self):
  subprocess.run(['node',str(Path(__file__).with_suffix('.cjs'))],check=True)
