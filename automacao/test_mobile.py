import pathlib, subprocess, unittest
class MobileTests(unittest.TestCase):
    def test_privacidade_do_resumo_nas_duas_versoes(self):
        subprocess.run(['node',str(pathlib.Path(__file__).with_name('test_mobile.cjs'))],check=True)
