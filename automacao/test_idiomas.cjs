const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),path=require('path');
const root=path.resolve(__dirname,'..'),source=fs.readFileSync(path.join(root,'automacao/idiomas.js'),'utf8');new vm.Script(source);
function load(language,adapter){const reads=[];const storage={getItem:k=>(reads.push(k),language),setItem(){throw Error('Não deve escrever durante a inicialização')}};const window={localStorage:storage,...(adapter?{pfdLocal:adapter}:{})};const c={window,document:{readyState:'loading',addEventListener(){}},console};vm.createContext(c);vm.runInContext(source,c);return {api:window.PFI18n,reads,c};}
let a=load('en');assert.equal(a.api.getLanguage(),'en');assert.deepEqual(a.reads,['pf_ui_language_v1']);assert.equal(a.api.translate('Novo lançamento'),'New transaction');assert.equal(a.api.translate('Salvar'),'Save');assert.equal(a.api.translate('Menu principal ▾'),'Main menu ▾');assert.equal(a.api.translate('R$ 1.234,56'),'R$ 1.234,56');assert.equal(a.api.canonical('Expenses'),'Despesas');assert.equal(a.api.question('How much did I spend?'),'Quanto gastei?');assert.equal(a.api.question('How much did I spend in category Mercado?'),'Quanto gastei? na categoria Mercado');
assert.equal(a.api.translate('• Receitas previstas: R$ 100,00'),'• Planned income: R$ 100,00');assert(a.api.translate('Despesas em aberto em 11/2026: R$ 25,00 em 1 lançamento(s).').startsWith('Unpaid expenses'));
a=load('es');assert.equal(a.api.translate('Novo lançamento'),'Nuevo movimiento');assert.equal(a.api.question('¿Cuánto queda por pagar?'),'Quanto falta pagar?');assert.equal(a.api.translate('Imprimir'),'Imprimir');
assert.equal(load('fr').api.getLanguage(),'pt-BR');assert.equal(load('pt-BR').api.translate(' Novo lançamento '),' Novo lançamento ');
const scoped=load('pt-BR',{getItem:k=>{assert.equal(k,'pf_ui_language_v1');return 'es'}});assert.equal(scoped.api.getLanguage(),'es');assert.equal(scoped.reads.length,0);
const html=a.api.decorate('<html><body><h1>Relatório</h1></body></html>');assert(html.includes('pf-global-language-report'));assert.equal(a.api.decorate(html),html);new vm.Script(html.match(/<script[^>]*>([\s\S]*?)<\/script>/)[1]);
// Existing styles are untouched; new CSS is scoped to the added menu only.
const css=source.match(/style\.textContent='([^']+)'/)[1];assert(css.includes('#pfLanguageButton'));assert(css.includes('#pfLanguageMenu'));assert(!/(?:^|\})(?:body|html|main|\.pf-menu-categoria|#pfMenuTopo)[{ ]/.test(css));assert(source.includes("option.setAttribute('value',option.value)"));assert(source.includes("tbody,tfoot"));
for(const file of ['index.html','distribuicao/app.html','teste-gemini/app.html','graficos.html','distribuicao/graficos.html','teste-gemini/graficos.html']){const html=fs.readFileSync(path.join(root,file),'utf8');assert.equal((html.match(/id="pf-global-language"/g)||[]).length,1,file);new vm.Script(html.match(/<script id="pf-global-language">([\s\S]*?)<\/script>/)[1]);if(file==='distribuicao/app.html')assert(!html.match(/<script id="pf-global-language">([\s\S]*?)<\/script>/)[1].includes('localStorage'));}
console.log('PASS: idiomas globais, armazenamento isolado, códigos/valores preservados, estilos restritos ao menu, relatórios e seis pontos de entrada.');

// The chart window keeps its original isolation: language comes from its opener only.
{
 const viewer=fs.readFileSync(path.join(root,'automacao/idiomas_graficos.js'),'utf8');
 for(const forbidden of ['localStorage','sessionStorage','supabase','layout2026','sandbox.js'])assert(!viewer.includes(forbidden));
 const parent=load('en').api;let ready,changed;
 const document={readyState:'loading',body:{},documentElement:{},addEventListener:(name,fn)=>ready=fn,createTreeWalker:()=>({nextNode:()=>null}),querySelectorAll:()=>[]};
 const window={opener:{closed:false,PFI18n:parent,addEventListener:(name,fn)=>changed=fn,removeEventListener(){}},addEventListener(){}};
 const env={window,document,NodeFilter:{SHOW_TEXT:4},MutationObserver:class{observe(){}disconnect(){}},requestAnimationFrame:fn=>fn()};vm.createContext(env);vm.runInContext(viewer,env);ready();assert.equal(document.documentElement.lang,'en');assert.equal(window.PFI18n.canonical('Income'),'Receita');parent.setLanguage('es',false);changed();assert.equal(document.documentElement.lang,'es');
 console.log('PASS: janela de gráficos recebe o idioma sem acesso a armazenamento, sessão ou banco.');
}

{
 const account=load('en');let selected;
 account.c.window.parent={PFI18n:{setLanguage:(value,persist)=>selected={value,persist}}};
 account.api.setLanguage('es',false);assert.equal(selected.value,'es');assert.equal(selected.persist,false);
 console.log('PASS: idioma compartilhado com a página de conta sem criar outro seletor ou persistir outra preferência.');
}

{
 const explorer=fs.readFileSync(path.join(root,'automacao/graficos_interativos.js'),'utf8'),start=explorer.indexOf(' function chartData(){'),end=explorer.indexOf(' function boot(',start),ctx={window:{PFI18n:load('en').api}};
 vm.createContext(ctx);vm.runInContext(explorer.slice(start,end)+';globalThis.D=chartData()',ctx);
 const input={label:'Receitas',values:[100]},m=ctx.D.model('Receitas',['Receitas'],[input],()=>[]);
 assert.equal(m.title,'Income');assert.equal(m.series[0].label,'Income');assert.equal(m.labels[0],'Receitas');assert.equal(input.label,'Receitas');assert.equal(m.series[0].values[0],100);
 assert.equal(ctx.D.typeRows([{tipo:'Receita',valor:100},{tipo:'Despesa',valor:25}],'Income').length,1);
 console.log('PASS: legendas dos gráficos traduzidas; nomes do cadastro, séries de origem e valores numéricos preservados.');
}
// Regression cases from the English-language screenshots, including notices and profile.
{
 const en=load('en').api,es=load('es').api;
 for(const text of ['Ocultar fluxo de caixa','Agrupar por','Dia','Ocultar dias sem movimento','Todas as Rubricas','Todos os Sub-Itens','Tipo de pessoa da análise','Modo de análise','Análise do período','Mapa de calor — saídas por dia','Receitas previstas por vencimento','Receitas previstas por descrição','Comprometimento','Saídas ÷ receitas','Sem data ou com valor zero','Pagamentos antes dos recebimentos','Dedução das saídas','Avisos do dia','Importante: faça um backup','Editar perfil','Como gostaria de ser chamado?'])assert.notEqual(en.translate(text),text,text);
 assert.equal(en.translate('Olá, Ricardo Dávila!'),'Hello, Ricardo Dávila!');assert.equal(es.translate('Olá, Ricardo Dávila!'),'¡Hola, Ricardo Dávila!');
 assert.equal(en.translate('Tipo de pessoa: Todas'),'Person type: All');assert.equal(en.translate('Perfil: Administrador'),'Role: Administrator');
 assert.equal(en.translate('Rubrica: EMPRESA'),'Category: EMPRESA');assert.equal(en.translate('Descrição: Receitas'),'Description: Receitas');
 assert(en.translate('Seu último backup registrado neste dispositivo foi há 7 dias. É importante fazer um novo backup e guardar o arquivo em local seguro.').startsWith('Your last backup'));
 assert.equal(en.translate('3 documento(s) com vencimento em 06/11/2026.'),'3 document(s) due on 06/11/2026.');
 assert.equal(en.translate('Modo: Análise do período. Tipo de pessoa: Todas. Critério: vencimento.'),'Mode: Period analysis. Person type: All. Based on due date.');
 assert(en.translate('Saldo inicial calculado: -R$ 18.727,92 · Saldo final projetado: -R$ 2.721,08. Não conciliado com extrato bancário.').startsWith('Calculated opening balance: -R$ 18.727,92'));
 assert(en.translate('Período: 1 de novembro de 2026 a 30 de novembro de 2026 · Critério: data de vencimento.').startsWith('Period: November 1, 2026'));
 // Exercise actual DOM translation and returning to Portuguese. User categories remain canonical.
 const window={localStorage:{getItem:()=> 'en'}},c={window,document:{readyState:'loading',addEventListener(){}},console};vm.createContext(c);vm.runInContext(source.replace('const api={','const api={_node:applyNode,'),c);
 const make=(text,selectId,defaultValue)=>{const attrs={};const parent={dataset:{},parentElement:selectId?{id:selectId}:null,value:defaultValue,closest:q=>q==='option'&&selectId?parent:null,hasAttribute:k=>Object.hasOwn(attrs,k),setAttribute:(k,v)=>attrs[k]=v};return {node:{data:text,parentElement:parent},attrs};};
 const option=make('Todas as Rubricas','filtroCategoria','Todos');c.window.PFI18n._node(option.node);assert.equal(option.node.data,'All categories');assert.equal(option.attrs.value,'Todos');
 const custom=make('Receitas','filtroCategoria','Receitas');c.window.PFI18n._node(custom.node);assert.equal(custom.node.data,'Receitas');
 const greeting=make('Olá, Ricardo Dávila!');c.window.PFI18n._node(greeting.node);assert.equal(greeting.node.data,'Hello, Ricardo Dávila!');c.window.PFI18n.setLanguage('pt-BR',false);c.window.PFI18n._node(greeting.node);assert.equal(greeting.node.data,'Olá, Ricardo Dávila!');
 console.log('PASS: inglês/espanhol, avisos, perfil, nomes preservados, filtros padrão com valor original, mensagens compostas e retorno a português.');
}

assert.equal(load('en').api.translate('Meta Selic: 13,75 % a.a. · referência 06/11/2026'),'Selic target: 13,75 % p.a. · reference 06/11/2026');
// Remaining English strings reported on 2026-11-06.
{
 const en=load('en').api;
 assert.equal(en.translate('Menor saldo calculado: -R$ 29.721,08 em 19/11/2026. Próxima entrada prevista: 20/11/2026.'),'Lowest calculated balance: -R$ 29.721,08 on 19/11/2026. Next expected income: 20/11/2026.');
 assert.equal(en.translate('Próxima entrada prevista: 20/11/2026.'),'Next expected income: 20/11/2026.');
 assert.equal(en.translate('Vencimento ▴'),'Due date ▴');
 assert.equal(en.translate('Vencimento ▾'),'Due date ▾');
 assert.equal(en.translate('Resumo atualizado com os dados atuais do aplicativo.'),'Summary updated with the current app data.');
 assert.equal(en.translate('Período de referência: 01/11/2026 a 30/11/2026'),'Reference period: 01/11/2026 to 30/11/2026');
 assert.equal(en.translate('nov. de 26'),'Nov 26');
 assert.equal(en.translate('13,5 mil'),'13.5k');
 assert.equal(en.translate('N/D'),'N/A');
 for(const caption of ['Resultado, composição e caixa • filtros independentes; pessoa inicial herdada do painel','Verde: receitas · Rosa: saídas (despesas e investimentos). Percentual = (mês atual − anterior) ÷ |anterior| × 100. N/D para base zero, mês parcial ou histórico insuficiente; não há linha ligando intervalos sem base.'])assert.notEqual(en.translate(caption),caption);
 const portuguese=load('pt-BR').api;assert.equal(portuguese.translate('nov. de 26'),'nov. de 26');assert.equal(portuguese.translate('13,5 mil'),'13,5 mil');
 console.log('PASS: saldo mínimo e próxima entrada, legenda completa, subtítulo, ordenação, relatório mensal, meses e escala.');
}
