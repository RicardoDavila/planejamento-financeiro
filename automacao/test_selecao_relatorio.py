import pathlib
import subprocess
import unittest

class SelecaoRelatorioTests(unittest.TestCase):
    def test_bootstrap_e_integracao_das_exportacoes(self):
        subprocess.run(['node', str(pathlib.Path(__file__).with_suffix('.cjs'))], check=True)
