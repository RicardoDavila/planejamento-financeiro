import subprocess
import unittest
from pathlib import Path

class AutofiltrosTests(unittest.TestCase):
    def test_filtros_e_integracao(self):
        subprocess.run(['node',str(Path(__file__).with_suffix('.cjs'))],check=True)
