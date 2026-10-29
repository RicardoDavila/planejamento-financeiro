import hashlib, json, pathlib, subprocess, tempfile, unittest
import gerar
from correcao_sincronizacao import corrigir_sincronizacao

class AutomacaoTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.source=gerar.read(gerar.ROOT/'index.html')
        cls.config=json.loads(gerar.read(gerar.ROOT/'automacao/adaptacoes.json'))

    def test_reproduz_distribuicao_atual(self):
        generated=gerar.generate(self.source,self.config,'V4.12.2')
        self.assertIn('window.parent.pfdConfirmPassword(senha)',generated)
        self.assertIn('pfdLocal.getItem',generated)
        self.assertNotIn('localStorage.getItem',generated)
        self.assertIn("CURRENT_VERSION='V4.12.2'",generated)

    def test_interface_e_calculo_compartilhados(self):
        source=self.source.replace('Painel Gerencial</h2>','Meu Painel Gerencial</h2>',1)
        source=source.replace('        function atualizarPainelGerencial() {', '        function calculoCompartilhadoTeste(valor){return valor * 1.05;}\n        function atualizarPainelGerencial() {')
        generated=gerar.generate(source,self.config,'V4.12.99')
        self.assertIn('Meu Painel Gerencial</h2>',generated)
        self.assertIn('function calculoCompartilhadoTeste(valor){return valor * 1.05;}',generated)
        self.assertIn("CURRENT_VERSION='V4.12.99'",generated)

    def test_mudanca_de_versao_original(self):
        import re
        source=re.sub(r"const CURRENT_VERSION='V[0-9.]+';","const CURRENT_VERSION='V9.99.99';",self.source)
        generated=gerar.generate(source,self.config,'V4.12.99')
        self.assertIn("CURRENT_VERSION='V4.12.99'",generated)

    def test_bloqueia_dados_pessoais_embutidos(self):
        source=self.source.replace('const dadosPadraoCompletos = [];','const dadosPadraoCompletos = [{descricao:"TESTE PRIVADO"}];')
        with self.assertRaisesRegex(ValueError,'base embutida'): gerar.generate(source,self.config,'V4.12.3')

    def test_bloqueia_mudanca_de_autenticacao(self):
        source=self.source.replace('let protecaoAutenticada = false;','let protecaoAutenticada = true;')
        with self.assertRaisesRegex(ValueError,'região protegida'): gerar.generate(source,self.config,'V4.12.3')

    def test_bloqueia_remocao_filtro_usuario(self):
        source=self.source.replace("'?select=payload,updated_at&user_id=eq.'","'?select=payload,updated_at&SEM_FILTRO='")
        with self.assertRaisesRegex(ValueError,'região protegida'): gerar.generate(source,self.config,'V4.12.3')

    def test_conflito_de_contexto_nao_aplica_parcialmente(self):
        source=self.source.replace('frame-src https:', 'frame-src https://NOVO ')
        with self.assertRaisesRegex(ValueError,'conflito'): gerar.generate(source,self.config,'V4.12.3')

    def test_isolamento_real_do_armazenamento_em_duas_contas(self):
        command=r'''
const fs=require('fs'),vm=require('vm'),assert=require('assert');
const code=fs.readFileSync(process.argv[1],'utf8');
const shared=new Map();const storage={getItem:k=>shared.get(k)??null,setItem:(k,v)=>shared.set(k,v),removeItem:k=>shared.delete(k)};
function make(id){const parent={pfdUser:{id},pfdClient:{auth:{}}};const window={parent,localStorage:storage,sessionStorage:storage};const c={window,location:{replace(){throw Error('Acesso negado')}},addEventListener(){}};vm.createContext(c);vm.runInContext(code,c);return window;}
const a=make('A'),b=make('B');a.pfdLocal.setItem('saldo','100');assert.equal(b.pfdLocal.getItem('saldo'),null);b.pfdLocal.setItem('saldo','200');assert.equal(a.pfdLocal.getItem('saldo'),'100');assert.equal(b.pfdLocal.getItem('saldo'),'200');a.pfdSession.setItem('sessao','A');assert.equal(b.pfdSession.getItem('sessao'),null);a.parent.pfdUser={id:'B'};assert.throws(()=>a.pfdLocal.getItem('saldo'));assert.throws(()=>a.pfdLocal.setItem('saldo','999'));assert.throws(()=>a.pfdLocal.removeItem('saldo'));assert.equal(b.pfdLocal.getItem('saldo'),'200');
'''
        subprocess.run(['node','-e',command,str(gerar.ROOT/'distribuicao/isolamento.js')],check=True)

    def test_build_nao_altera_original_e_somente_publica_estaticos(self):
        original=(gerar.ROOT/'index.html').read_bytes()
        with tempfile.TemporaryDirectory() as temp:
            output=pathlib.Path(temp)/'site'
            gerar.build(output,'V4.12.3')
            self.assertEqual(gerar.read(output/'index.html'),corrigir_sincronizacao(gerar.read(gerar.ROOT/'index.html')))
            self.assertEqual(json.loads(gerar.read(output/'distribuicao/version.json'))['version'],'V4.12.3')
            self.assertIn('pf-distribuicao-v4-12-3',gerar.read(output/'distribuicao/service-worker.js'))
            self.assertFalse((output/'automacao').exists())
            self.assertFalse((output/'.github').exists())
            self.assertFalse((output/'repositorio-original.zip').exists())
            self.assertEqual(hashlib.sha256((output/'distribuicao/conta.js').read_bytes()).digest(),hashlib.sha256((gerar.ROOT/'distribuicao/conta.js').read_bytes()).digest())
        self.assertEqual((gerar.ROOT/'index.html').read_bytes(),original)

if __name__=='__main__':unittest.main()
