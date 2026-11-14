import unittest,subprocess,re
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
class ProjectPaletteTests(unittest.TestCase):
 def test_reference_actions_and_states(self):
  subprocess.run(['node','-e',r'''
const assert=require('node:assert/strict'),t=require('./automacao/paleta_projeto.js');
for(const [text,kind] of Object.entries({'Sair':'exit','Voltar Página Inicial':'nav','Ir para cadastro':'cadastro','Ir para Painel de Lançamentos':'nav','Salvar Rubrica':'primary','Salvar Sub-Item':'saveBlue','Salvar em PDF':'pdf','Imprimir':'print','Baixar seleção':'positive','Excluir seleção':'danger','Simulações e recorrência':'analysis','Ver pontos e lançamentos':'analysis','Todos':'allFilter','Receitas':'incomeFilter','Despesas':'expenseFilter','Pendentes':'pendingFilter','Atrasados':'expenseFilter','Filtros avançados':'advanced','Recolher filtros avançados':'advanced','Limpar filtros':'clear','Aplicar filtros':'primary','Ano completo':'annual','1º semestre':'annual','1º trimestre':'nav','Semestre':'nav','jan/26':'month','fev/27':'month','Hoje':'cadastro','Este mês':'cadastro','7 dias':'nav'}))assert.equal(t.actionKind(text),kind,text);
for(const [s,k] of Object.entries({'Pago':'paid','Pagamento':'paid','Vencido':'overdue','Atrasado':'overdue','À vencer':'pending','Pendente':'pending','Recebido':'received','À receber':'receivable','Não Recebido':'receivable'}))assert.equal(t.statusKind(s),k,s);
assert.equal(t.statusKind('Situação não informada'),null);
assert.deepEqual(t.activeStyles.month,['primaryInk','primary','primaryHover']);
'''],cwd=ROOT,check=True)
 def test_theme_in_every_html_with_single_refresh_owner(self):
  for p in ROOT.rglob('*.html'):
   if any(k in p.parts for k in ['.git','build']):continue
   s=p.read_text(encoding='utf-8')
   for tag,f,id in [('style','paleta_projeto.css','pf-project-theme-style'),('script','paleta_projeto.js','pf-project-theme-script')]:
    self.assertEqual(re.findall('<'+tag+' id="'+id+'">([\s\S]*?)</'+tag+'>',s),[(ROOT/'automacao'/f).read_text(encoding='utf-8')],str(p))
   self.assertLess(s.index('id="pf-project-theme-script"'),s.index('id="pf-white-buttons-script"'))
  self.assertIn('window.PFProjectTheme.refresh();return;', (ROOT/'automacao/botoes_brancos.js').read_text(encoding='utf-8'))
 def test_visual_only_and_print_cleanup(self):
  s=(ROOT/'automacao/paleta_projeto.js').read_text(encoding='utf-8')
  for forbidden in ['localStorage','sessionStorage','indexedDB','fetch(','transacoes','addEventListener','innerHTML','textContent=','onclick=']:
   self.assertNotIn(forbidden,s)
  self.assertIn('window.PFProjectTheme?.cleanClone(copy)',(ROOT/'automacao/paleta_semantica.js').read_text(encoding='utf-8'))
  self.assertIn('@media screen{',(ROOT/'automacao/paleta_projeto.css').read_text(encoding='utf-8'))
