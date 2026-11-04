import pathlib, subprocess, unittest
class RelatorioGraficoMelhoradoTests(unittest.TestCase):
    def test_indicadores_historico_e_qualidade(self):
        subprocess.run(['node',str(pathlib.Path(__file__).with_suffix('.cjs'))],check=True)
