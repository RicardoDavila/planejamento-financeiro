const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),path=require('path');
const source=fs.readFileSync(path.join(__dirname,'idiomas.js'),'utf8');
function api(lang){let window={localStorage:{getItem:()=>lang}};let ctx={window,document:{readyState:'loading',addEventListener(){}}};vm.createContext(ctx);vm.runInContext(source,ctx);return window.PFI18n;}
for(const lang of ['en','es']){
 const a=api(lang);
 for(const text of ['Mensal','Semanal','Anual','Pessoa','Categoria','Resultado','Preencha este campo.','Informe um e-mail válido.','Não é confirmação de sincronização com a nuvem.','Detalhar Receitas','Fluxo de caixa Mensal','Hipótese editável de 0% ao mês; padrão sem rendimento. Aportes ao final de cada mês. Não há garantia de retorno, nem taxa de mercado presumida. Renda média dos meses completos com registros no recorte; meses sem registros não comprovam ausência de renda. Não é renda fixa garantida. Projeções não alteram objetivos, patrimônio ou lançamentos. Compare o aporte com o superávit efetivo antes de adotá-lo.']){
  const translated=a.translate(text);if(lang==='en'||!['Semanal','Anual','Categoria','Resultado'].includes(text))assert.notEqual(translated,text,lang+': '+text);
 }
 for(const name of ['Receitas','Moradia','Pagamento','Cliente A']){
  assert(a.translate('Filtrar por '+name).endsWith(name));
  assert(a.translate('Rubrica: '+name).endsWith(name));
  assert(a.translate('Olá, '+name+'!').includes(name));
  assert.equal(a.caption(name+' · 2026-11 · R$ 1.200,00',true).split(' · ')[0],name);
 }
 assert.equal(a.translate('R$ 1.234,56'),'R$ 1.234,56');
 assert(!/Não informado|renda média/.test(a.translate('10% da renda média · Não informado/mês')));
 assert(!/Não informado/.test(a.translate('Total potencial: Não informado/mês · Não informado/ano')));
 assert(!/Pessoa|Salvamento/.test(a.translate('Escopo das fichas: Conta: Todas · Pessoa: Todas. Salvamento local, separado do banco de lançamentos.')));
 assert.equal(a.shouldSkip({closest:s=>s==='[data-pf-i18n-skip]'?{}:null}),true);
 assert.equal(a.shouldSkip({closest:s=>s==='[data-pf-i18n-ui]'?{}:null}),false);
 let report=a.decorate('<html><body><h1>Receitas</h1></body></html>');assert(report.includes('"language":"'+lang+'"'));new vm.Script(report.match(/<script[^>]*>([\s\S]*?)<\/script>/)[1]);
}
assert.equal(api('pt-BR').translate('10% da renda média · Não informado/mês'),'10% da renda média · Não informado/mês');
assert.equal(api('en').translate('2026-11-01 a 2026-11-30'),'2026-11-01 to 2026-11-30');
assert.equal(api('en').translate('Mensal'),'Monthly');
for(const file of ['notas_ui.js','analise_financeira.js','graficos_visao_geral.js'])assert(fs.readFileSync(path.join(__dirname,file),'utf8').includes('data-pf-i18n-skip'),file);
for(const file of ['paleta_projeto.js','superficies_34.js','areas_cards.js'])assert(fs.readFileSync(path.join(__dirname,file),'utf8').includes('originalText'),file);
console.log('PASS: Etapa35, UI e mensagens compostas EN/ES, valores e nomes protegidos, relatório autônomo, paleta por texto original.');

// User options without IDs are identified by their form name, even if their text equals a UI label.
{
 const window={localStorage:{getItem:()=> 'en'}},document={readyState:'loading',addEventListener(){}};
 const ctx={window,document};vm.createContext(ctx);vm.runInContext(source.replace('return api;','api.testNode=applyNode;return api;'),ctx);
 for(const name of ['rubric','subItem','account']){
  const select={id:'',name},option={parentElement:select,closest:s=>s==='option'?option:null,hasAttribute:()=>true,dataset:{}};
  const node={parentElement:option,data:'Receitas'};window.PFI18n.testNode(node);assert.equal(node.data,'Receitas');
 }
 console.log('PASS: nomes de rubricas, subitens e contas preservados em seletores sem ID.');
}
