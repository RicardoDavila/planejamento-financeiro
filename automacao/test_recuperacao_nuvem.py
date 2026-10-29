import subprocess
import unittest
import gerar


class RecuperacaoTests(unittest.TestCase):
    def test_recuperacao_com_copias_e_controle_de_concorrencia(self):
        subprocess.run(['node',str(gerar.ROOT/'automacao/test_recuperacao_nuvem.cjs')],check=True)
