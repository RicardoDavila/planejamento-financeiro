import pathlib, subprocess, unittest

class PreservacaoRelatorioTests(unittest.TestCase):
    def test_paineis_e_calculos_originais(self):
        subprocess.run(['node',str(pathlib.Path(__file__).with_suffix('.cjs'))],check=True)
