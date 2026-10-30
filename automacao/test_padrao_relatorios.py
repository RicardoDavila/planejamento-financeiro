import pathlib, subprocess, unittest

class PadraoRelatoriosTests(unittest.TestCase):
    def test_identidade_e_rotulos_dos_graficos(self):
        subprocess.run(['node',str(pathlib.Path(__file__).with_suffix('.cjs'))],check=True)
