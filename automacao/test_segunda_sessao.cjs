const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');const source=fs.readFileSync(__dirname+'/segunda_tela.js','utf8');
function scenario(href){let serial=0,queue=[],child,parent;const origin=new URL(href).origin;
function make(url,initialAuth,opener=null){let auth=initialAuth,started=0,clicked=[],timer;const handlers={},nodes={},classes=new Set(initialAuth?[]:['auth-pendente']);
class E{constructor(){this.dataset={};this.open=false;this.events={};this.classList={add(){},remove(){}};}setAttribute(){}removeAttribute(){}addEventListener(k,f){this.events[k]=f;}showModal(){this.open=true;}close(){this.open=false;}focus(){}set innerHTML(s){this.html=s;}}
const win={closed:false,opener,close(){win.closed=true},focus(){},addEventListener(k,f){handlers[k]=f;},PFDashboard:{},PFAreaCards:{},PFCadastroPage:{},PFPersonalAnalysis:{},inicializarProtecaoAcesso(){classes.add('auth-pendente');},open(next,name){assert(name.startsWith('pf-secondary-screen-nonce-'));child=make(next,false,win);return child.win;}};
Object.defineProperty(win,'location',{get(){throw Error('SecurityError: file origin opaca');}});
nodes['pf-dois-monitores']=new E();nodes.pfSecondScreenStatus=new E();nodes.telaProtecaoAcesso=new E();
const env={URL,crypto:{randomUUID:()=> 'nonce-'+(++serial)},location:{href:url},get protecaoAutenticada(){return auth},set protecaoAutenticada(v){auth=v},iniciarAplicacao(){started++},matchMedia:()=>({matches:false}),window:win,setInterval(f){timer=f},MutationObserver:class{observe(){}},document:{readyState:'complete',body:{classList:{contains:k=>classes.has(k),add(...ks){ks.forEach(k=>classes.add(k))},remove(...ks){ks.forEach(k=>classes.delete(k))}},append(n){nodes[n.id]=n}},getElementById:id=>nodes[id],createElement:()=>new E(),addEventListener(k,f){handlers[k]=f},querySelector:s=>({click:()=>clicked.push(s)})}};
win.postMessage=(data,target)=>{assert.equal(target,origin==='null'?'*':origin);queue.push(()=>handlers.message?.({data,source:opener||child?.win,origin}));};
vm.runInNewContext(source,env);return{win,env,nodes,handlers,clicked,classes,tick:()=>timer(),get auth(){return auth},set auth(v){auth=v},get started(){return started}};}
parent=make(href,true);parent.handlers.click({target:{closest:()=>true},preventDefault(){},stopImmediatePropagation(){}});parent.nodes.pfSecondScreenDialog.events.click({target:{closest:()=>({dataset:{secondView:'new'},hasAttribute:()=>false})}});
child.win.inicializarProtecaoAcesso();assert(!child.auth);
const url=new URL(child.env.location.href),channel=url.searchParams.get('pf-secondary-channel');assert(channel);
const forged={type:'pf-secondary-session',channel,proof:'nonce-2',authorized:true};
child.handlers.message({source:{},origin,data:forged});assert(!child.auth);
child.handlers.message({source:parent.win,origin:'https://other.invalid',data:forged});assert(!child.auth);
child.handlers.message({source:parent.win,origin,data:{...forged,channel:'wrong'}});assert(!child.auth);
child.handlers.message({source:parent.win,origin,data:{...forged,proof:'wrong'}});assert(!child.auth);
const before=queue.length;parent.handlers.message({source:{},origin,data:{type:'pf-secondary-request',channel,proof:'forged',href:child.env.location.href}});assert.equal(queue.length,before);
function flush(){let count=0;while(queue.length){assert(++count<30,'respostas não devem criar ciclo de mensagens');queue.shift()();}}
flush();assert(child.auth);assert.equal(child.started,1);assert.equal(child.clicked.length,1);assert(child.clicked[0].includes('"new"'));assert(!child.classes.has('auth-pendente'));
for(let n=0;n<10;n++){child.tick();flush();}assert.equal(child.started,1);assert.equal(child.clicked.length,1);
const previousChild=child;parent.handlers.click({target:{closest:()=>true},preventDefault(){},stopImmediatePropagation(){}});parent.nodes.pfSecondScreenDialog.events.click({target:{closest:()=>({dataset:{secondView:'new'},hasAttribute:()=>false})}});flush();assert(previousChild.win.closed);assert.notEqual(child.win,previousChild.win);assert(child.auth);
parent.auth=false;child.tick();flush();assert(!child.auth);assert(child.win.closed);assert(child.classes.has('auth-pendente'));
const independent=make(child.env.location.href,false);independent.win.inicializarProtecaoAcesso();independent.tick();assert(!independent.auth);assert.equal(independent.started,0);
}
scenario('file:///C:/projeto/index.html');scenario('https://example.invalid/projeto/index.html');
assert(!source.includes('opener.location'),'não pode consultar localização entre origens opacas');
console.log('PASS: arquivo local e HTTPS por mensagens; origem opaca reproduzida; janela/origem/canal/prova falsos negados; sem ciclo; logout revoga; abertura independente continua bloqueada.');
