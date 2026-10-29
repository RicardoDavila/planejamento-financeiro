import pathlib,subprocess,unittest
class CloudRefreshTests(unittest.TestCase):
    def test_renovacao_e_retry_com_identidade_preservada(self):
        subprocess.run(['node',str(pathlib.Path(__file__).with_suffix('.cjs'))],check=True)
