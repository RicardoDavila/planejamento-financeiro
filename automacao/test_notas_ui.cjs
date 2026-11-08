const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),crypto=require('crypto');
const Core=require('./notas_core.js'),ui=fs.readFileSync(__dirname+'/notas_ui.js','utf8'),clone=v=>JSON.parse(JSON.stringify(v));
global.crypto=crypto.webcrypto;
const drain=()=>new Promise(r=>setImmediate(r));
function store(){const data=new Map();let chain=Promise.resolve();const s={blocked:false,read:async owner=>{await chain;return clone(data.get(owner)||[])},transact(owner,fn){const job=chain.catch(()=>{}).then(()=>{const rows=clone(data.get(owner)||[]),out=fn(rows);if(s.blocked)throw Error('quota');data.set(owner,clone(out.rows||rows));return clone(out.result??null)});chain=job.catch(()=>{});return job}};return s;}
function fixture(options={}){
 const ids=new Map(),timeouts=new Map(),intervals=[],events={},docEvents={};let serial=0,allowed=true,lastBlob;
 class Node{
  constructor(tag){this.tagName=tag.toUpperCase();this.children=[];this.parentElement=null;this.hidden=false;this.shown=true;this.style={};this.attributes={};this.dataset={};this.value='';this.textContent='';this._html='';this.disabled=false;this.selectionStart=this.selectionEnd=0;this.classList={contains:()=>false};}
  set id(v){this._id=v;ids.set(v,this)}get id(){return this._id}
  setAttribute(k,v){this.attributes[k]=String(v);if(k==='id')this.id=v;if(k.startsWith('data-'))this.dataset[k.slice(5).replace(/-([a-z])/g,(_,c)=>c.toUpperCase())]=String(v)}
  getAttribute(k){return this.attributes[k]}
  append(...nodes){for(const n of nodes){if(n.parentElement)n.parentElement.children=n.parentElement.children.filter(x=>x!==n);n.parentElement=this;this.children.push(n)}}
  replaceChildren(...nodes){this.children=[];this.append(...nodes)}
  getClientRects(){return !this.hidden&&this.shown&&(!this.parentElement||this.parentElement.getClientRects().length)?[{}]:[]}
  focus(){document.activeElement=this}click(){this.onclick?.({target:this,stopPropagation(){}})}
  setRangeText(text,a,b){this.value=this.value.slice(0,a)+text+this.value.slice(b);this.selectionStart=this.selectionEnd=a+text.length}
  querySelectorAll(selector){const tags=selector.split(',').map(s=>s.trim().toUpperCase());return this.children.flatMap(n=>[...(tags.includes(n.tagName)?[n]:[]),...n.querySelectorAll(selector)])}
  closest(selector){if(selector==='[data-note]'&&this.dataset.note)return this;return this.parentElement?.closest(selector)||null}
  set innerHTML(value){this._html=value;this.children=[];
   const stack=[this];for(const match of value.matchAll(/<(\/)?([a-z][\w-]*)([^>]*)>/gi)){
    const tag=match[2].toLowerCase();if(match[1]){if(stack.length>1)stack.pop();continue;}
    const n=new Node(tag);for(const a of match[3].matchAll(/([\w-]+)(?:="([^"]*)")?/g)){if(a[1]==='hidden')n.hidden=true;else if(a[1]==='id')n.id=a[2];else n.setAttribute(a[1],a[2]||'')}
    stack.at(-1).append(n);if(!['input','br','img','hr','meta'].includes(tag))stack.push(n);
   }
  }get innerHTML(){return this._html}
 }
 const document={readyState:'complete',visibilityState:'visible',createElement:tag=>new Node(tag),getElementById:id=>ids.get(id)||null,querySelector:s=>s==='#pm-app .bar'?mobile:null,querySelectorAll:()=>[],addEventListener:(k,fn)=>{docEvents[k]=fn}};
 document.body=new Node('body');document.activeElement=document.body;
 const top=new Node('header');top.id='pfMenuTopo';top.shown=!options.mobile;document.body.append(top);const pm=new Node('main');pm.id='pm-app';const mobile=new Node('div');pm.append(mobile);mobile.shown=!!options.mobile;document.body.append(pm);
 const memory=store(),window={PFNotasCore:Core,PFNotasConfig:{store:memory,isAllowed:()=>allowed,getClient:()=>options.client||null},addEventListener:(k,fn)=>events[k]=fn,localStorage:{getItem:()=>null}};
 const c={window,document,crypto:{randomUUID:()=>crypto.randomUUID()},navigator:{onLine:true},URL:{createObjectURL:b=>{lastBlob=b;return 'blob:teste'},revokeObjectURL(){}},Blob,console,Date,confirm:()=>false,BroadcastChannel:class{postMessage(){}},MutationObserver:class{observe(){}},setTimeout:(fn,ms)=>{const i=++serial;timeouts.set(i,{fn,ms});return i},clearTimeout:i=>timeouts.delete(i),setInterval:fn=>intervals.push(fn)};
 vm.createContext(c);vm.runInContext(ui,c);
 return {window,document,memory,top,mobile,ids,timeouts,intervals,events,docEvents,get lastBlob(){return lastBlob},setAllowed:value=>allowed=value,async time(ms){const entries=[...timeouts].filter(([,t])=>t.ms===ms);for(const [id,t]of entries){timeouts.delete(id);t.fn()}await drain();await drain();},async ready(){await drain();await drain();}};
}
(async()=>{
 let f=fixture({mobile:true});await f.ready();assert.equal(f.window.PFNotas.conta(),'local');assert.equal(f.ids.get('pfNotasBtn').parentElement,f.mobile);assert.equal(f.ids.get('pfNotas').hidden,true);
 await f.window.PFNotas.abrir();await f.ids.get('pfnNew').onclick();f.ids.get('pfnHeading').value='Nota <teste>';f.ids.get('pfnText').value='<img src=x onerror=bad()> #teste';f.ids.get('pfnText').oninput();assert.equal((await f.memory.read('local')).length,0);assert.equal(f.ids.get('pfnSaved').textContent,'Salvando…');await f.time(600);assert.equal((await f.memory.read('local')).length,1,JSON.stringify({status:f.ids.get('pfnState').textContent,saved:f.ids.get('pfnSaved').textContent,owner:f.window.PFNotas.conta()}));assert.equal(f.ids.get('pfnSaved').textContent,'Salvo neste dispositivo.');
 f.memory.blocked=true;f.ids.get('pfnText').value='rascunho não salvo';f.ids.get('pfnText').oninput();await f.time(600);assert.equal((await f.memory.read('local'))[0].texto,'<img src=x onerror=bad()> #teste');assert(f.ids.get('pfnSaved').textContent.includes('Não foi possível salvar'));await f.ids.get('pfnClose').onclick();assert.equal(f.ids.get('pfNotas').hidden,false);await f.ids.get('pfnExport').onclick();assert((await f.lastBlob.text()).includes('rascunho não salvo'));
 f.memory.blocked=false;await f.ids.get('pfnBack').onclick();await f.time(40);assert.equal((await f.memory.read('local'))[0].texto,'rascunho não salvo');f.top.shown=true;f.mobile.shown=false;f.intervals[0]();assert.equal(f.ids.get('pfNotasBtn').parentElement,f.top);
 f.setAllowed(false);f.intervals[0]();assert(f.ids.get('pfNotas').hidden);assert(f.ids.get('pfNotasBtn').hidden);assert.equal(f.ids.get('pfnText').value,'');
 console.log('PASS notas UI: botão móvel/PC, 600ms, sucesso somente após gravação, quota, rascunho exportável, fechamento seguro e bloqueio de acesso.');
 const A=crypto.randomUUID(),B=crypto.randomUUID();let resolveSession,authCallback;const client={auth:{onAuthStateChange:fn=>{authCallback=fn;return {data:{subscription:{unsubscribe(){}}}}},getSession:()=>new Promise(r=>resolveSession=r)},from:()=>({select(){return this},eq(){return this},order(){return this},range:async()=>({data:[],error:null})})};
 f=fixture({client});await f.ready();assert.equal(f.window.PFNotas.conta(),null);authCallback('SIGNED_IN',{user:{id:B}});await f.time(0);resolveSession({data:{session:{user:{id:A}}}});await f.ready();assert.equal(f.window.PFNotas.conta(),B);assert(!f.ids.get('pfnAccount').textContent.includes(A));
 console.log('PASS notas UI: resposta antiga de getSession não substitui uma conta identificada mais recentemente.');
 authCallback('SIGNED_IN',{user:{id:A}});await f.time(0);await f.ready();await f.window.PFNotas.abrir();await f.ids.get('pfnNew').onclick();f.ids.get('pfnText').value='rascunho da conta A';f.memory.blocked=true;f.ids.get('pfnText').oninput();await f.time(600);assert(f.ids.get('pfnSaved').textContent.includes('Não foi possível salvar'));
 authCallback('SIGNED_IN',{user:{id:B}});await f.time(0);await f.ready();f.memory.blocked=false;await f.window.PFNotas.sync();assert.equal(f.window.PFNotas.conta(),B);assert.equal((await f.memory.read(B)).length,0);assert(f.ids.get('pfnState').textContent.includes('sincronizadas'));
 console.log('PASS notas UI: uma falha local da conta anterior não bloqueia a sincronização nem transfere rascunhos para a nova conta.');
})().catch(e=>{console.error(e);process.exitCode=1});

