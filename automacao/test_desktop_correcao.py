import pathlib, subprocess, unittest
class DesktopCorrecaoTests(unittest.TestCase):
    def test_colunas_selecao_idempotente_e_menu_compacto(self):
        subprocess.run(['node',str(pathlib.Path(__file__).with_suffix('.cjs'))],check=True)
