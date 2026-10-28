import pathlib, subprocess, unittest
class DesktopLayoutTests(unittest.TestCase):
    def test_layout_desktop_nao_inicializa_no_celular(self):
        subprocess.run(['node',str(pathlib.Path(__file__).with_suffix('.cjs'))],check=True)
