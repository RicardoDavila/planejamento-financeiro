import pathlib, subprocess, tempfile, unittest
import gerar
from correcao_sincronizacao import corrigir_sincronizacao

class SincronizacaoCelularTests(unittest.TestCase):
    def test_recebimento_seguro_e_login(self):
        html=corrigir_sincronizacao(gerar.read(gerar.ROOT/'index.html'))
        self.assertIn('receberDadosNuvemComBackup()',html)
        self.assertIn('if (session) await pfSincronizarConta();',html)
        a=html.index('        async function entrarNuvem()');b=html.index('        async function criarContaNuvem()',a)
        self.assertNotIn('auth.signOut',html[a:b])
        self.assertIn('pfDetalheFalhaLoginNuvem(e)',html[a:b])
        with tempfile.TemporaryDirectory() as temp:
            file=pathlib.Path(temp)/'pessoal.html';file.write_text(html,encoding='utf-8')
            subprocess.run(['node',str(gerar.ROOT/'automacao/test_sync_celular.cjs'),str(file)],check=True)
