import subprocess
import unittest
from pathlib import Path

class ConferenciaBancoTests(unittest.TestCase):
    def test_comparacao_e_preservacao(self):
        subprocess.run(['node',str(Path(__file__).with_suffix('.cjs'))],check=True)
