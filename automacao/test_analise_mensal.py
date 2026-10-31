import pathlib
import subprocess
import unittest


class AnaliseMensalTests(unittest.TestCase):
    def test_quatro_graficos_e_totais_mensais(self):
        subprocess.run(
            ['node', str(pathlib.Path(__file__).with_suffix('.cjs'))], check=True
        )
