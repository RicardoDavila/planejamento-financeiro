const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8').replace(/^\uFEFF/,'');
for(const file of ['index.html','distribuicao/app.html','teste-gemini/app.html']){
 const html=read(file),shared=html.match(/<script id="pf-desktop-clean-layout">([\s\S]*?)<\/script>/)[1];
 const ha=shared.indexOf('function monthAnalysisData('),hb=shared.indexOf('function install(){',ha);
 const ra=shared.indexOf(' const fmt='),rb=shared.indexOf(' function labelMonth()',ra);
 const oa=shared.indexOf(" if($('dashboardMobileV40'))new MutationObserver"),ob=shared.indexOf('\n polish();',oa);assert(oa>0&&ob>oa);
 let hidden=true,authPending=false,captures=0;const nodes={},observers=[];
 function node(id){return nodes[id]||(nodes[id]={id,innerHTML:'',textContent:'',hidden:true,children:[],value:id==='filtroDataFim'?'2026-11-30':'',disabled:false,classList:{contains:k=>id==='dashboardMobileV40'&&k==='pf-resumo-oculto'&&hidden},setAttribute(){},replaceChildren(...children){this.innerHTML='';this.children=children},append(...children){this.children.push(...children)}})}
 const data=[{id:1,tipo:'Receita',categoria:'EMPRESA',subItem:'Receita',descricao:'Cliente',valor:27000,vencimento:'2026-11-20'},{id:2,tipo:'Despesa',categoria:'EMPRESA',subItem:'Honorários',descricao:'Contador',valor:1190,vencimento:'2026-11-10'}];
 const env={Date,Map,Set,protecaoAutenticada:true,transacoes:data,getFilteredTransactions:()=>data,formatarMoeda:v=>Number(v).toFixed(2),document:{getElementById:node,createElement:()=>({textContent:''}),body:{classList:{contains:k=>k==='pf-mobile-layout'||k==='auth-pendente'&&authPending}}},window:{PFChartExplorer:{capture(name,payload){assert.equal(name,'monthly');assert.equal(payload.rows.length,2);captures++},schedule(){}}},MutationObserver:class{constructor(cb){this.cb=cb}observe(target,options){assert.deepEqual(Array.from(options.attributeFilter),['class']);observers.push({target,cb:this.cb})}}};
 vm.createContext(env);vm.runInContext("const $=id=>document.getElementById(id);const panel=$('painelGerencial'),totals=$('clean-analysis-totals'),expandedRevenue=new Set(),expandedExpense=new Set();"+shared.slice(ha,hb)+shared.slice(ra,rb)+shared.slice(oa,ob),env);
 env.redraw();assert.equal(node('clean-revenue-history-bars').innerHTML,'');assert.equal(node('clean-revenue-category-bars').innerHTML,'');
 hidden=false;assert.equal(observers.length,1);assert.equal(observers[0].target.id,'dashboardMobileV40');observers[0].cb();
 assert(node('clean-revenue-history-bars').innerHTML.includes('27000.00'));assert(node('clean-history-bars').innerHTML.includes('1190.00'));assert(node('clean-revenue-category-bars').innerHTML.includes('Cliente'));assert(node('clean-category-bars').innerHTML.includes('Contador'));assert.equal(captures,1);
 hidden=true;observers[0].cb();for(const id of ['clean-revenue-history-bars','clean-history-bars','clean-revenue-category-bars','clean-category-bars'])assert.equal(node(id).innerHTML,'');
 hidden=false;observers[0].cb();assert.equal(captures,2);
 // A proteção de autenticação permanece superior à visibilidade do resumo.
 authPending=true;observers[0].cb();assert.equal(node('clean-revenue-history-bars').innerHTML,'');
 console.log('PASS:',file,'renderer real: oculto → mostrar → quatro séries preenchidas → ocultar limpa → mostrar recompõe → saída limpa.');
}
const css=read('automacao/layout_aprovado.css'),scope='body.pf-mobile-layout #pm-app>#clean-month-analysis.layout-mobile-charts ';
for(const fragment of ['.analysis-grid{display:grid','.analysis-bars{display:grid','.analysis-row{display:grid','.analysis-track{display:block;height:9px','.analysis-fill{display:block;height:100%'])assert(css.includes(scope+fragment));
assert(css.includes(scope+'#clean-analysis-content[hidden]{display:none!important}'));
console.log('PASS: CSS estrutural dos gráficos disponível no celular/tablet, sem depender da mídia de PC.');
