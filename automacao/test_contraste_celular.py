import pathlib
import subprocess
import unittest


class ContrasteCelularTests(unittest.TestCase):
    def test_contraste_e_abertura_relatorio(self):
        subprocess.run(['node', str(pathlib.Path(__file__).with_suffix('.cjs'))], check=True)
