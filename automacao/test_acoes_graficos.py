import pathlib
import subprocess
import unittest

class AcoesGraficosTests(unittest.TestCase):
    def test_gerar_limpar_e_comparar(self):
        subprocess.run(['node', str(pathlib.Path(__file__).with_suffix('.cjs'))], check=True)
