import subprocess
import unittest
import gerar
from correcao_sincronizacao import corrigir_sincronizacao


class SincronizacaoAutomaticaTests(unittest.TestCase):
    def test_comportamento_e_retornos(self):
        subprocess.run(['node',str(gerar.ROOT/'automacao/test_sincronizacao_automatica.cjs')],check=True)

    def test_atualizacao_pessoal(self):
        html=corrigir_sincronizacao(gerar.read(gerar.ROOT/'index.html'))
        self.assertIn('await pfConfirmarCopiasIguais(remote)',html)
        self.assertIn("window.addEventListener('online',pfVerificarNuvemAoRetornar)",html)
        self.assertNotIn("el('cloud').classList.toggle('online',sessionConnected)",html)
