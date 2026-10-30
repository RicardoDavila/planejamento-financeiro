import pathlib, subprocess, unittest

class FluxoCaixaTests(unittest.TestCase):
    def test_calculos_filtros_exportacoes(self):
        subprocess.run(['node',str(pathlib.Path(__file__).with_suffix('.cjs'))],check=True)
