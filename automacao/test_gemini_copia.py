import unittest
import gerar

class GeminiCopyTests(unittest.TestCase):
    def test_copia_separada_tem_entrada_de_conta(self):
        folder=gerar.ROOT/'teste-gemini'
        if not folder.exists(): self.skipTest('Cópia opcional não instalada.')
        gerar.validate_distribution_entry(gerar.read(folder/'index.html'))
        self.assertIn("storageKey:'pf-gemini-teste-auth-v1'",gerar.read(folder/'conta.js'))
        self.assertIn('pfd:gemini-teste:v1:',gerar.read(folder/'isolamento.js'))
        app=gerar.read(folder/'app.html')
        self.assertIn('pf-gemini-transport',app)
        self.assertIn('id="pf-correcao-salvar-celular"',app)
        self.assertNotIn('id="categoria" required',app)
        self.assertNotIn('id="subItem" required',app)
        self.assertIn('Envio à nuvem bloqueado nesta cópia de testes.',app)
