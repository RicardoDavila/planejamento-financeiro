from pathlib import Path
import unittest
ROOT=Path(__file__).resolve().parents[1]
class NotasAdiadasTests(unittest.TestCase):
    def test_bloco_de_notas_permanece_fora_da_atualizacao(self):
        for rel in ['index.html','distribuicao/app.html','teste-gemini/app.html']:
            self.assertNotIn('id="pf-private-notes"',(ROOT/rel).read_text(encoding='utf-8-sig'))
        self.assertNotIn('from aplicar_notas import',(ROOT/'automacao/gerar.py').read_text(encoding='utf-8-sig'))
