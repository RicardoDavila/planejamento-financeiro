import re, subprocess, unittest
from pathlib import Path
from cadastro_aparencia import aplicar_cadastro_aparencia
ROOT=Path(__file__).resolve().parents[1]

class CadastroFormulariosTests(unittest.TestCase):
    def test_preserva_campos_e_modulos_nos_tres_aplicativos(self):
        for name in ['index.html','distribuicao/app.html','teste-gemini/app.html']:
            html=(ROOT/name).read_text(encoding='utf-8')
            self.assertEqual(html,aplicar_cadastro_aparencia(html))
            for field in ['editId','vencimento','dataPg','tipo','categoria','subItem','descricao','valor','status','observacao','gcTipo','gcOrigem','gcUso','gcDestino']:
                self.assertEqual(len(re.findall(r'id="'+field+'"',html)),1,field)
            for tag,file,ident in [('script','cadastro_formularios.js','pf-cadastro-forms-script'),('style','cadastro_formularios.css','pf-cadastro-forms-style')]:
                self.assertEqual(re.search('<'+tag+' id="'+ident+'">([\s\S]*?)</'+tag+'>',html)[1],(ROOT/'automacao'/file).read_text(encoding='utf-8'))
            if name!='teste-gemini/app.html':
                self.assertTrue('desktop-edit-person' in html)
                self.assertTrue('desktop-edit-recurring' in html)

    def test_validacoes_reais_sem_prompt_e_sem_alterar_lancamentos(self):
        subprocess.run(['node',str(Path(__file__).with_suffix('.cjs'))],check=True)

    def test_rolagem_externa_do_cadastro_supera_trava_modal_sem_mudar_mobile(self):
        css=(ROOT/'automacao/cadastro_formularios.css').read_text(encoding='utf-8')
        self.assertTrue(css.startswith('@media screen and (min-width:901px)'))
        # O bloqueio deve continuar existindo para modais reais; a exceção exige formulário inline ativo.
        for name in ['index.html','distribuicao/app.html','teste-gemini/app.html']:
            html=(ROOT/name).read_text(encoding='utf-8')
            self.assertTrue('body.pf-edicao-lancamento {overflow:hidden!important}' in html)
            self.assertTrue('body.pf-dashboard-shell[data-pf-dash-view=cadastro][data-pf-cadastro-editor]{height:auto!important;max-height:none!important;overflow-y:auto!important;' in html)
        self.assertTrue('#formLancamento>div:last-child{position:static!important' in css)
