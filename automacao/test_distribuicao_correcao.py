import json
import subprocess
import unittest
import tempfile
from pathlib import Path
import gerar


class DistribuicaoCorrecaoTests(unittest.TestCase):
    def test_correcao_preservada_na_publicacao(self):
        source = gerar.read(gerar.ROOT / 'index.html')
        config = json.loads(gerar.read(gerar.ROOT / 'automacao/adaptacoes.json'))
        html = gerar.generate(source, config, 'V4.12.27')
        self.assertIn('const session=await window.parent.pfdGetSession()', html)
        self.assertIn('Backup dos meus dados', html)
        self.assertNotIn("if (badge) badge.textContent = 'Online';", html)
        self.assertNotIn("indicator('Online');return fresh;", html)
        self.assertNotIn("estado.includes('conect')", html)

    def test_estados_e_identidade(self):
        source = gerar.read(gerar.ROOT / 'index.html')
        config = json.loads(gerar.read(gerar.ROOT / 'automacao/adaptacoes.json'))
        with tempfile.TemporaryDirectory() as tmp:
            html = Path(tmp) / 'app.html'
            html.write_text(gerar.generate(source, config, 'V4.12.27'), encoding='utf-8')
            subprocess.run(['node', str(gerar.ROOT / 'automacao/test_distribuicao_correcao.cjs'), str(html)], check=True)
