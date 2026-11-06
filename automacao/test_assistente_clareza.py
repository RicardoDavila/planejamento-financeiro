import pathlib
import subprocess
import unittest

class AssistenteClarezaTests(unittest.TestCase):
    def test_consultas_periodo_consentimento_e_cancelamento(self):
        subprocess.run(['node', str(pathlib.Path(__file__).with_suffix('.cjs'))], check=True)
