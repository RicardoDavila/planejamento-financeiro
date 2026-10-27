import unittest
import gerar

class EntryTests(unittest.TestCase):
    def test_entrada_individual_aceita(self):
        gerar.validate_distribution_entry(gerar.read(gerar.ROOT/'distribuicao/index.html'))

    def test_bloqueia_index_pessoal_na_distribuicao(self):
        with self.assertRaisesRegex(ValueError,'versão pessoal'):
            gerar.validate_distribution_entry(gerar.read(gerar.ROOT/'index.html'))

    def test_bloqueia_pagina_sem_script_de_conta(self):
        text=gerar.read(gerar.ROOT/'distribuicao/index.html').replace('src="./conta.js"','src="./arquivo-errado.js"')
        with self.assertRaisesRegex(ValueError,'conta.js'):
            gerar.validate_distribution_entry(text)

    def test_bloqueia_pagina_sem_email(self):
        text=gerar.read(gerar.ROOT/'distribuicao/index.html').replace('id="pfdEmail"','id="campo-errado"')
        with self.assertRaisesRegex(ValueError,'pfdEmail'):
            gerar.validate_distribution_entry(text)
