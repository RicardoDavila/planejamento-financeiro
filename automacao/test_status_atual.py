import pathlib,subprocess,unittest
class StatusAtualTests(unittest.TestCase):
    def test_status_usa_data_local_atual_preservando_quitacao(self):
        subprocess.run(['node',str(pathlib.Path(__file__).with_suffix('.cjs'))],check=True)
