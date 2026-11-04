import pathlib, subprocess, unittest
class DesktopAprovadoTests(unittest.TestCase):
    def test_runtime_pc_pessoal_e_distribuicao(self):
        script=pathlib.Path(__file__).with_suffix('.cjs')
        subprocess.run(['node',str(script)],check=True)
        subprocess.run(['node',str(script),'--personal'],check=True)
