import json
import subprocess
import tempfile
import unittest
from pathlib import Path
import gerar


class AvisosAtualizacaoTests(unittest.TestCase):
    def test_avisos_e_retentativas(self):
        subprocess.run(['node',str(gerar.ROOT/'automacao/test_avisos_atualizacao.cjs')],check=True)

    def test_publicacoes_com_identificacao_crescente(self):
        for version in ['V4.12.40','V4.12.41']:
            with tempfile.TemporaryDirectory() as temp:
                site=Path(temp)/'site'
                gerar.build(site,version)
                for channel in ['', 'distribuicao']:
                    folder=site/channel
                    html=gerar.read(folder/('app.html' if channel else 'index.html'))
                    self.assertIn("CURRENT_VERSION='"+version+"'",html)
                    self.assertEqual(json.loads(gerar.read(folder/'version.json'))['version'],version)
                    self.assertIsInstance(json.loads(gerar.read(folder/'version.json'))['notes'],list)
                    self.assertIn('O que foi atualizado nesta versão:',html)
                    self.assertIn('pfUpdateBanner',html)
                    self.assertIn('version.json?t=',html)
                    self.assertNotIn('__PF_UPDATE_',html)
                self.assertIn('planejamento-financeiro-'+version.lower().replace('.','-'),gerar.read(site/'service-worker.js'))
