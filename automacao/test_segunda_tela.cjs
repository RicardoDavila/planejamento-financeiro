const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const source=fs.readFileSync(__dirname+'/segunda_tela.js','utf8');
const {choices,secondaryURL}=require('./segunda_tela.js');
assert.equal(choices.length,8);
for(const [key] of choices){const u=new URL(secondaryURL('https://example.invalid/app.html?assistente=1&canal=old',key));assert.equal(u.pathname,'/app.html');assert.equal(u.searchParams.get('pf-secondary'),key);assert(!u.searchParams.has('assistente'));assert(!u.searchParams.has('canal'));}
assert.throws(()=>secondaryURL('https://example.invalid/','invalid'));
function run(key='',mobile=false){let auth=true,blocked=false,opened=[],closed=0,focused=0,clicked=[],interval;const nodes={},handlers={};
class E{constructor(){this.dataset={};this.open=false;this.events={};}setAttribute(){}removeAttribute(){}addEventListener(k,fn){this.events[k]=fn;}showModal(){this.open=true;}close(){this.open=false;}focus(){}set innerHTML(v){this.html=v;}get innerHTML(){return this.html;}}
const body={classList:{contains:k=>k==='auth-pendente'&&!auth},append(n){nodes[n.id]=n;}};
nodes['pf-dois-monitores']=new E();nodes.pfSecondScreenStatus=new E();
const env={URL,module:undefined,matchMedia:()=>({matches:mobile}),get protecaoAutenticada(){return auth},location:{href:'https://example.invalid/app.html'+(key?'?pf-secondary='+key:'')},document:{readyState:'complete',body,createElement:()=>new E(),getElementById:id=>nodes[id],addEventListener(k,f){handlers[k]=f;},querySelector:s=>({click:()=>clicked.push(s)})},MutationObserver:class{observe(){}},setInterval(fn){interval=fn;},window:{PFDashboard:{},PFAreaCards:{},PFCadastroPage:{},PFPersonalAnalysis:{},open(url){opened.push(url);return blocked?null:{closed:false,close(){closed++},focus(){focused++}};}}};vm.runInNewContext(source,env);
return {nodes,handlers,clicked,opened,get closed(){return closed},get focused(){return focused},auth(v){auth=v;},block(){blocked=true;},tick(){interval?.();},choose(key){nodes.pfSecondScreenDialog.events.click({target:{closest:()=>({dataset:{secondView:key},hasAttribute:()=>false})}});}};}
const mobile=run('',true);assert(!mobile.handlers.click);
const s=run();let stopped=0;const click={target:{closest:()=>true},preventDefault(){},stopImmediatePropagation(){stopped++}};
s.auth(false);s.handlers.click(click);assert(!s.nodes.pfSecondScreenDialog);s.auth(true);s.tick();s.handlers.click(click);assert(s.nodes.pfSecondScreenDialog.open);assert.equal(s.opened.length,0);
s.block();s.choose('dashboard');assert(s.nodes.pfSecondScreenStatus.textContent.includes('bloqueou'));assert(s.nodes.pfSecondScreenDialog.open);
const a=run();a.tick();a.handlers.click(click);a.choose('entries');assert.equal(a.opened.length,1);assert(a.opened[0].includes('pf-secondary=entries'));assert(!a.nodes.pfSecondScreenDialog.open);assert.equal(a.focused,1);a.auth(false);a.tick();assert.equal(a.closed,1);assert(stopped>=3);
for(const [key] of choices){const child=run(key);assert.equal(child.clicked.length,1);assert(child.clicked[0].includes('"'+key+'"'));child.tick();assert.equal(child.clicked.length,1);}
console.log('PASS: oito áreas, aplicativo original, autenticação, escolha antes de abrir, bloqueio de pop-up, rota única, encerramento na saída e celular preservado.');
