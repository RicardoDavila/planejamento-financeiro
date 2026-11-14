import subprocess
import unittest
from pathlib import Path

class BotoesBrancosTests(unittest.TestCase):
    def test_contraste_e_restauracao(self):
        subprocess.run(['node',str(Path(__file__).with_suffix('.cjs'))],check=True)
