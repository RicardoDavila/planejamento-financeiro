import pathlib, subprocess, unittest
class RelatorioTests(unittest.TestCase):
    def test_relatorio_responsivo_e_impressao(self):
        subprocess.run(['node',str(pathlib.Path(__file__).with_name('test_relatorio.cjs'))],check=True)
