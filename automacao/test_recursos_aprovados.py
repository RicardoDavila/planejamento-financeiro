import re,unittest
from verificar_recursos_aprovados import ROOT,contract,validate_html,validate_tree
from aplicar_modo_claro import aplicar_modo_claro

class RecursosAprovadosTests(unittest.TestCase):
    def setUp(self):
        self.html=(ROOT/'index.html').read_text(encoding='utf-8-sig')

    def test_todas_as_versoes_mantem_os_recursos(self):
        validate_tree(ROOT,restore_light=True)

    def test_perder_uma_correcao_anterior_bloqueia_publicacao(self):
        blocks=list(contract()['blocos_aplicativo'])+[contract()['bloco_relatorios']]
        for key in blocks:
            with self.subTest(recurso=key):
                old=re.sub(r'<(script|style) id="'+re.escape(key)+r'">[\s\S]*?</\1>','',self.html)
                with self.assertRaisesRegex(ValueError,'Publicação bloqueada'):
                    validate_html(old,'versao-antiga.html')

    def test_css_claro_recuperavel_sem_duplicacao(self):
        missing=re.sub(r'<style id="pf-modo-claro-legibilidade">[\s\S]*?</style>','',self.html)
        recovered=aplicar_modo_claro(missing)
        validate_html(recovered,'restaurada.html')
        self.assertEqual(aplicar_modo_claro(recovered),recovered)

    def test_modulo_antigo_e_marcador_falso_nao_passam(self):
        broken=self.html.replace('function financialModel','function modeloAntigo')
        with self.assertRaisesRegex(ValueError,'incompleto'):
            validate_html(broken,'relatorio-antigo.html')
        missing=re.sub(r'<style id="pf-rodape-lancamento-modo-escuro">[\s\S]*?</style>','',self.html)
        fake='<script>const exemplo=\'<style id="pf-rodape-lancamento-modo-escuro">body.dark-mode #formLancamento</style>\';</script>'
        with self.assertRaisesRegex(ValueError,'perdeu o recurso'):
            validate_html(missing.replace('</body>',fake+'</body>'),'marcador-falso.html')
