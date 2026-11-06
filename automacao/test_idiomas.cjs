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
