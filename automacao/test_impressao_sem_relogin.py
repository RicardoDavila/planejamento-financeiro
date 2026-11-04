import pathlib, subprocess, unittest
class ImpressaoSemReloginTests(unittest.TestCase):
    def test_transicao_impressao_nao_recarrega_aplicativo(self):
        subprocess.run(['node',str(pathlib.Path(__file__).with_suffix('.cjs'))],check=True)
