const fs=require('fs'),vm=require('vm'),assert=require('assert');
const source=fs.readFileSync(__dirname+'/dashboard_referencia.js','utf8');
function run(mobile=false){const nodes={},calls=[];class E{constructor(id){this.id=id;this.dataset={};this.classList={add(){},contains(){return true}};this.buttons=[]}setAttribute(){}removeAttribute(){}append(){}focus(){}before(...a){a.forEach(n=>nodes[n.id]=n)}querySelector(){return null}querySelectorAll(){return this.buttons}addEventListener(k,f){this[k]=f}set innerHTML(v){this.markup=v;for(const id of v.matchAll(/id="([^"]+)"/g))nodes[id[1]]=new E(id[1]);this.buttons=[...v.matchAll(/data-dash-action="([^"]+)"/g)].map(m=>Object.assign(new E(),{dataset:{dashAction:m[1]}}))}}
const workspace=nodes['layout-workspace']=new E();const table=nodes.tabelaLancamentosWrapper=new E();table.parentElement=new E();const body=new E();const doc={readyState:'complete',body,getElementById:id=>nodes[id],createElement:()=>new E(),querySelector:s=>({click:()=>calls.push(s)})};const env={document:doc,matchMedia:()=>({matches:mobile}),MutationObserver:class{observe(){}},window:{openModal:()=>calls.push('new'),PFDesktopApproved:{openGraphics:()=>calls.push('charts')}}};vm.runInNewContext(source,env);return{nodes,body,calls,env}}
const m=run(true);assert(!m.nodes.pfDashboardHome);
const s=run();assert.equal(s.body.dataset.pfDashView,'home');assert.equal(s.nodes.pfDashboardHome.buttons.length,8);
function click(key){s.nodes.pfDashboardHome.click({target:{closest:()=>({dataset:{dashAction:key}})}})}
click('entries');assert.equal(s.body.dataset.pfDashView,'entries');assert(s.nodes.pfDashboardHome.hidden);
click('dashboard');assert.equal(s.body.dataset.pfDashView,'dashboard');click('home');assert(!s.nodes.pfDashboardHome.hidden);
click('new');click('charts');click('security');click('tools');click('help');assert.deepEqual(s.calls,['new','charts','#pfMenuTopo [data-pf-categoria="seguranca"]','#pfMenuTopo [data-pf-categoria="acoes"]','#pfMenuTopo [data-pf-categoria="ajuda"]']);console.log('PASS: navegação, ações originais, segurança pelo menu autorizado e isolamento móvel.');

let cadastroRoute=0;s.env.window.PFCadastroPage={show(){cadastroRoute++}};click("new");assert.equal(cadastroRoute,1);
