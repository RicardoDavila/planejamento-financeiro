import json
import os
import tempfile
import unittest
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import patch
from notas_publicacao import carregar_notas


class NotasPublicacaoTests(unittest.TestCase):
    def setUp(self):
        self.tmp=tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root=Path(self.tmp.name)
        (self.root/'automacao').mkdir()
        self.path=self.root/'automacao/notas_versao.json'
        self.path.write_text(json.dumps({'pessoal':['Mudança pessoal'],'distribuicao':['Mudança da distribuição']}),encoding='utf-8')

    def test_canais_independentes(self):
        with patch.dict(os.environ,{'GITHUB_SHA':''}):
            notes=carregar_notas(self.root)
        self.assertEqual(notes['pessoal'],['Mudança pessoal'])
        self.assertEqual(notes['distribuicao'],['Mudança da distribuição'])

    def test_resumo_da_revisao_atual(self):
        with patch.dict(os.environ,{'GITHUB_SHA':'atual'}),patch('notas_publicacao.subprocess.run',return_value=SimpleNamespace(stdout='atual\n')):
            self.assertEqual(carregar_notas(self.root)['pessoal'],['Mudança pessoal'])

    def test_nao_repete_notas_antigas_como_novas(self):
        with patch.dict(os.environ,{'GITHUB_SHA':'atual'}),patch('notas_publicacao.subprocess.run',return_value=SimpleNamespace(stdout='anterior\n')):
            self.assertEqual(carregar_notas(self.root),{'pessoal':[],'distribuicao':[]})

    def test_rejeita_resumo_invalido(self):
        self.path.write_text(json.dumps({'pessoal':'texto','distribuicao':[]}),encoding='utf-8')
        with self.assertRaisesRegex(ValueError,'resumo válido'):
            carregar_notas(self.root)
