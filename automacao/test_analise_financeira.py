import unittest, subprocess, re
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
class PersonalAnalysisTests(unittest.TestCase):
    def test_calculos_e_preservacao(self):
        subprocess.run(['node',str(Path(__file__).with_suffix('.cjs'))],check=True)
    def test_modulos_sincronizados(self):
        blocks=[('style','analise_financeira.css','pf-analysis-style'),('script','analise_financeira_core.js','pf-analysis-core-script'),('script','planejamento_pessoal_store.js','pf-planning-store-script'),('script','analise_financeira.js','pf-analysis-page-script')]
        for name in ['index.html','distribuicao/app.html','teste-gemini/app.html']:
            html=(ROOT/name).read_text(encoding='utf-8')
            for tag,file,ident in blocks:
                found=re.findall('<'+tag+' id="'+ident+'">([\s\S]*?)</'+tag+'>',html)
                self.assertEqual(len(found),1,name)
                self.assertEqual(found[0],(ROOT/'automacao'/file).read_text(encoding='utf-8'))
                if tag=='script':subprocess.run(['node','--check'],input=found[0],encoding='utf-8',check=True,capture_output=True)
            self.assertLess(html.index('id="pf-analysis-core-script"'),html.index('id="pf-analysis-page-script"'))
    def test_escopo_sem_gravacao_financeira(self):
        code=(ROOT/'automacao/analise_financeira.js').read_text(encoding='utf-8')
        store=(ROOT/'automacao/planejamento_pessoal_store.js').read_text(encoding='utf-8')
        for mutation in ['transacoes.push','transacoes.splice','localStorage.setItem','salvarTransacoes','from(\'transacoes\')','fetch(']:
            self.assertNotIn(mutation,code+store)
        self.assertIn("pf-planejamento-pessoal-v1",store)
        self.assertIn("failedOwner!==who",code)
        self.assertIn("owner()!==who",code)
        self.assertIn("if(!revealed())return",code)
        self.assertIn('data-pa-edit-entry',code)
    def test_identidade_e_concorrencia_da_pagina(self):
        subprocess.run(['node',str(ROOT/'automacao/test_analise_guardas.cjs')],check=True)
    def test_entrada_sem_ciclo_de_mutacoes(self):
        subprocess.run(['node',str(ROOT/'automacao/test_analise_login.cjs')],check=True)
