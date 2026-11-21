import pathlib,subprocess,unittest
class AssistentePlanejamento384Tests(unittest.TestCase):
 def test_modelo_e_questionario(self):
  subprocess.run(['node',str(pathlib.Path(__file__).with_suffix('.cjs'))],check=True)
 def test_integracao_e_isolamento(self):
  subprocess.run(['node',str(pathlib.Path(__file__).with_name('test_assistente_planejamento_fluxo_384.cjs'))],check=True)
