import subprocess,unittest
from pathlib import Path
class CloudNeonTests(unittest.TestCase):
 def test_online_and_other_states(self):
  subprocess.run(['node',str(Path(__file__).with_suffix('.cjs'))],check=True)
