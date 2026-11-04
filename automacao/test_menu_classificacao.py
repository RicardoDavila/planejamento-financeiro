import pathlib, subprocess, unittest
class MenuClassificacaoTests(unittest.TestCase):
    def test_menu_observacao_e_classificacao_editavel(self):
        subprocess.run(['node',str(pathlib.Path(__file__).with_suffix('.cjs'))],check=True)
