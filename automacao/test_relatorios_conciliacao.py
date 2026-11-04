import pathlib, subprocess, unittest
class ConciliacaoRelatoriosTests(unittest.TestCase):
    def test_conciliacao_liquidez_e_recortes(self):
        subprocess.run(['node', str(pathlib.Path(__file__).with_suffix('.cjs'))], check=True)
