import pathlib,subprocess,unittest
class GraficosMobileRenderTests(unittest.TestCase):
 def test_mostrar_valores_preenche_os_quatro_graficos_e_ocultar_limpa(self):
  subprocess.run(['node',str(pathlib.Path(__file__).with_suffix('.cjs'))],check=True)
