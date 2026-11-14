import subprocess
import unittest
from pathlib import Path

class PainelLancamentosTests(unittest.TestCase):
    def test_consulta_impressao_e_tema(self):
        subprocess.run(['node',str(Path(__file__).with_suffix('.cjs'))],check=True)
