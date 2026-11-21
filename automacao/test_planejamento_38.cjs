const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),path=require('path');
(async()=>{
 const nodes={},timers=[];let body;
 class E{constructor(){this.dataset={};this.events={};this.hidden=false;this.classList={contains:()=>false,add(){},remove(){}};}set innerHTML(v){this.html=v;}get innerHTML(){return this.html||'';}setAttribute(){}addEventListener(k,f){this.events[k]=f;}querySelectorAll(){return [];}querySelector(s){return s==='h1'?{focus(){}}:null;}before(e){nodes[e.id]=e;e.parentElement=body;}append(e){nodes[e.id]=e;e.parentElement=this;}focus(){}}
 body=new E();body.dataset.pfDashView='home';nodes['layout-workspace']=new E();
 const window={PFAnalysisConfig:{owner:()=> 'fixture'},PFDashboard:{show:v=>body.dataset.pfDashView=v}};
 const env={window,document:{readyState:'complete',body,getElementById:id=>nodes[id]||null,createElement:()=>new E(),addEventListener(){}},matchMedia:()=>({matches:false}),MutationObserver:class{observe(){}},setInterval:f=>timers.push(f),setTimeout:f=>f(),protecaoAutenticada:true,obterDataLocalISO:()=> '2026-11-15',transacoes:[{id:1,tipo:'Receita',valor:1000,vencimento:'2026-11-01',dataPg:'2026-11-01',status:'Recebido',tipoPessoa:'PF',categoria:'Renda'},{id:2,tipo:'Despesa',valor:100,vencimento:'2026-11-05',dataPg:'2026-11-05',status:'Pago',tipoPessoa:'PF',categoria:'Moradia'}],console};vm.createContext(env);
 for(const f of ['analise_financeira_core.js','planejamento_pessoal_store.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,f),'utf8'),env);
 const C=window.PFAnalysisMath,S=window.PFPlanningStore,store=S.memory(),scope={account:'Todas',person:'Todas'};
 await store.change('fixture',p=>{p.snapshots=[{...scope,id:'pos',date:'2026-11-01',assets:500000,liabilities:100000,invested:null,reason:'Bens fictícios'}];p.goals=[{...scope,id:'goal',date:'2026-11-01',name:'Meta preservada',kind:'goal',current:10000,target:20000,deadline:'2027-11-01'}];return p;});window.PFAnalysisConfig.store=store;
 const saved=JSON.stringify(await store.read('fixture')),financial=JSON.stringify(env.transacoes);
 vm.runInContext(fs.readFileSync(path.join(__dirname,'analise_financeira.js'),'utf8'),env);
 const api=window.PFPersonalAnalysis;api.show();await new Promise(setImmediate);const root=nodes.pfAnalysisPage;
 assert(root.innerHTML.includes('data-pa-my-planning'));for(const id of ['wealth','debts','goals','savings'])assert(!root.innerHTML.includes('id="pa-'+id+'"'),id);
 assert(root.innerHTML.includes('id="pa-cash"'));assert(root.innerHTML.includes('data-pa-form="budgets"'));assert(!root.innerHTML.includes('data-pa-form="snapshots"'));
 api.showPlanning();for(const id of ['wealth','debts','goals','savings'])assert(root.innerHTML.includes('id="pa-'+id+'"'),id);assert(!root.innerHTML.includes('id="pa-cash"'));assert(root.innerHTML.includes('Meu Planejamento Financeiro'));assert(root.innerHTML.includes('Meta preservada'));assert(root.innerHTML.includes('4.000,00'));assert(root.innerHTML.includes('data-pa-analysis'));
 for(const n of ['01','02','03','04'])assert(root.innerHTML.includes('<b>'+n+'</b>'));assert(root.innerHTML.includes('data-pa-form="snapshots"'));assert(!root.innerHTML.includes('data-pa-form="budgets"'));
 api.showAnalysis();assert(!root.innerHTML.includes('id="pa-wealth"'));assert(root.innerHTML.includes('id="pa-cash"'));api.showPlanning();assert(root.innerHTML.includes('Meta preservada'));
 assert.equal(JSON.stringify(await store.read('fixture')),saved);assert.equal(JSON.stringify(env.transacoes),financial);
 env.protecaoAutenticada=false;timers[0]();assert(!root.innerHTML.includes('Meta preservada'));assert(!root.innerHTML.includes('4.000,00'));
 console.log('PASS Etapa38.1: navegação, quatro seções transferidas/renumeradas, formulários por página, fichas e banco intactos, limpeza no bloqueio.');
})().catch(e=>{console.error(e);process.exitCode=1;});
