import pathlib, subprocess, unittest
class IntervaloTests(unittest.TestCase):
    def test_intervalo_local_e_payload_gemini(self):
        subprocess.run(['node',str(pathlib.Path(__file__).with_suffix('.cjs'))],check=True)
