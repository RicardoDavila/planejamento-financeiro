const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8').replace(/\r\n/g,'\n').replace(/^\uFEFF/,'');
const main=read('automacao/layout_aprovado.js'),source=read('index.html');
for(const file of ['index.html','distribuicao/app.html','teste-gemini/app.html']){
 const html=read(file);assert(html.includes('<script id="pf-layout-aprovado">'+main));
 for(const forbidden of ['layout2026','sandbox.js','previewLocalStorage','DEMONSTRAÇÃO · dados fictícios'])assert(!html.includes(forbidden));
 const block=html.match(/<script id="pf-desktop-clean-layout">([\s\S]*?)<\/script>/)[1];let installed=false;
 vm.runInNewContext(block,{matchMedia:()=>({matches:false}),document:{readyState:'loading',addEventListener(){installed=true}},window:{}});assert(installed);
 new vm.Script(main);
}
const Dctx={};vm.createContext(Dctx);const explorer=read('automacao/graficos_interativos.js'),a=explorer.indexOf(' function chartData(){'),b=explorer.indexOf(' function boot(',a);vm.runInContext(explorer.slice(a,b)+';globalThis.D=chartData()',Dctx);
let auth=true,denied=false,hidden=false,blocked=false,closed=false,opened='',messages=[],alerts=0;
const classes=new Set(),nodes={},node=id=>nodes[id]||(nodes[id]={value:'',textContent:'',setAttribute(k,v){this[k]=v},classList:{contains:()=>hidden}});
const popup={get closed(){return closed},close(){closed=true},postMessage:m=>messages.push(m)};
const ctx={crypto:{randomUUID:()=> 'canal-123'},location:{origin:'https://example.invalid'},Date,JSON,getComputedStyle:()=>({fontFamily:'system-ui'}),Event:class{},alert(){alerts++},transacoes:[{id:1,tipo:'Receita',categoria:'Salário',valor:100,vencimento:'2026-11-01',access_token:'SEGREDO'}],getFilteredTransactions(){return this.transacoes},document:{getElementById:node,body:{classList:{contains:k=>k==='auth-pendente'?!auth:classes.has(k),add:k=>classes.add(k),remove:k=>classes.delete(k)}}},window:{pfdAssert(){if(denied)throw Error('Conta alterada')},PFChartExplorer:{data:Dctx.D},dispatchEvent(){},open(url){opened=url;return blocked?null:popup}}};
Object.defineProperty(ctx,'protecaoAutenticada',{get:()=>auth});vm.createContext(ctx);
vm.runInContext(main.slice(0,main.indexOf(' function install(){'))+'globalThis.test={snapshot,split,join,send,markReady(){ready=true},setup(){button=document.getElementById("button")}};})();',ctx);
ctx.test.setup();ctx.test.split();assert(opened.startsWith('graficos.html?canal='));assert(classes.has('layout-charts-detached'));ctx.test.markReady();ctx.test.send();assert.equal(messages.length,1);assert.equal(messages[0].channel,'canal-123');assert(!JSON.stringify(messages[0]).includes('SEGREDO'));ctx.test.send();assert.equal(messages.length,1);
hidden=true;ctx.test.send();assert.equal(messages.at(-1).state.rows.length,0);assert.equal(messages.at(-1).state.allRows.length,0);denied=true;ctx.test.send();assert(closed);assert(!classes.has('layout-charts-detached'));denied=false;blocked=true;closed=false;ctx.test.split();assert.equal(alerts,1);assert(!classes.has('layout-charts-detached'));
console.log('PASS: autorização pessoal/distribuição, sincronização, proteção de valores, troca de conta, reunião e pop-up bloqueado.');
const viewer=read('graficos.html');assert.equal(viewer,read('distribuicao/graficos.html'));assert.equal(viewer,read('teste-gemini/graficos.html'));
for(const forbidden of ['localStorage','sessionStorage','supabase','layout2026','sandbox.js'])assert(!viewer.includes(forbidden));
const scripts=Array.from(viewer.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g),m=>m[1]);scripts.forEach(s=>new vm.Script(s));
let received=0;const opener={closed:false,postMessage(){}},handlers={},viewNodes={},vn=id=>viewNodes[id]||(viewNodes[id]={innerHTML:'',textContent:'',hidden:true}),viewEnv={URLSearchParams,location:{search:'?canal=canal-123',origin:'https://example.invalid'},Date,Map,Set,document:{getElementById:vn,body:{style:{},classList:{toggle(){}}}},window:{opener,addEventListener:(k,f)=>handlers[k]=f},setInterval(){},PFChartExplorer:{data:Dctx.D,capture(){received++}}};viewEnv.window.PFChartExplorer=viewEnv.PFChartExplorer;vm.createContext(viewEnv);vm.runInContext(scripts.find(code=>code.includes("pf-chart-ready")&&code.includes("pf-chart-state")),viewEnv);
const state={locked:false,rows:[{tipo:'Receita',categoria:'Salário',descricao:'Salário',valor:100,vencimento:'2026-11-01'}],allRows:[{tipo:'Receita',valor:100,vencimento:'2026-11-01'}],chosen:'2026-11-30'};
handlers.message({source:{},origin:'https://example.invalid',data:{type:'pf-chart-state',channel:'canal-123',state}});assert.equal(received,0);
handlers.message({source:opener,origin:'https://outro.invalid',data:{type:'pf-chart-state',channel:'canal-123',state}});assert.equal(received,0);
handlers.message({source:opener,origin:'https://example.invalid',data:{type:'pf-chart-state',channel:'outro',state}});assert.equal(received,0);
handlers.message({source:opener,origin:'https://example.invalid',data:{type:'pf-chart-state',channel:'canal-123',state}});assert.equal(received,1);assert.equal(vn('chart-grid').hidden,false);assert(vn('clean-revenue-category-bars').innerHTML.includes('Salário'));
handlers.message({source:opener,origin:'https://example.invalid',data:{type:'pf-chart-state',channel:'canal-123',state:{...state,locked:true}}});assert.equal(vn('chart-grid').hidden,true);assert.equal(vn('clean-revenue-category-bars').innerHTML,'');
console.log('PASS: janela sem banco/sessão, mensagens vinculadas à origem + janela + canal, quatro gráficos e ocultação imediata.');
assert(main.includes("$('clean-top-actions').append(button)"));assert(source.indexOf('const dadosPadraoCompletos = [];')>=0);
console.log('PASS: botão junto a tema e avisos; nenhuma credencial ou base de teste na produção.');

