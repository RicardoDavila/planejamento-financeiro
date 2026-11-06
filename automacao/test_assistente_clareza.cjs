const fs=require('fs'),vm=require('vm'),path=require('path'),assert=require('assert/strict');
class Node {
 constructor(tag='div',id=''){this.tagName=tag.toUpperCase();this.id=id;this.children=[];this.dataset={};this.style={setProperty(){}};this.events={};this.className='';this.value='';this.hidden=false;this.disabled=false;this.checked=false;this.classList={contains:()=>false};}
 set textContent(v){this.text=String(v);this.children=[]}get textContent(){return (this.text||'')+this.children.map(c=>c.textContent).join('')}
 append(...nodes){for(const n of nodes){n.parent=this;this.children.push(n)}}appendChild(n){this.append(n);return n}
 replaceChildren(...nodes){this.children=[];this.text='';this.append(...nodes)}
 setAttribute(k,v){this[k]=v}addEventListener(k,fn){this.events[k]=fn}remove(){if(this.parent)this.parent.children=this.parent.children.filter(n=>n!==this)}
 querySelector(q){if(q==='.ia-chips button:nth-child(3)')return this.chips?.[2];return this.find(n=>n.className===q.slice(1))}
 find(fn){for(const n of this.children){if(fn(n))return n;const x=n.find?.(fn);if(x)return x}return null}
 focus(){this.focused=true}showModal(){this.open=true}close(){this.open=false;this.events.close?.()}checkValidity(){return !!this.value}reportValidity(){return true}
}
function setup(file){
 const source=fs.readFileSync(path.join(__dirname,'..',file),'utf8'),script=id=>source.match(new RegExp('<script id="'+id+'">([\\s\\S]*?)</script>'))[1];
 const nodes=new Map(),chips=[],observers=[];let queryCount=0,authCallback,query=async()=> 'Resposta simulada';
 const doc={body:new Node('body'),getElementById:id=>nodes.get(id),createTextNode:text=>({textContent:String(text)}),querySelectorAll:()=>chips,createElement(tag){const n=new Node(tag);Object.defineProperty(n,'innerHTML',{set(html){for(const m of html.matchAll(/<([a-z][\w-]*)\b([^>]*)>/gi)){const id=m[2].match(/\bid="([^"]+)"/),data=m[2].match(/\bdata-q="([^"]+)"/);if(id){const field=new Node(m[1],id[1]);nodes.set(id[1],field);if(id[1]==='pfIaPeriodMode')field.value='month';if(id[1]==='pfIaMode')field.value='local';}if(data){const button=new Node('button');button.dataset.q=data[1];chips.push(button)}}nodes.get('pfIaDialog').chips=chips;}});return n;}};
 class FixedDate extends Date{constructor(...args){super(...(args.length?args:[2026,10,6,12]))}}
 const rows=[{tipo:'Despesa',valor:50,vencimento:'2026-11-05',categoria:'Mercado',descricao:'<img src=x onerror=alert(1)>',status:'Pago'},{tipo:'Receita',valor:100,vencimento:'2026-11-06',categoria:'Renda',descricao:'Salário',status:'Recebido'},{tipo:'Despesa',valor:10,vencimento:'2026-10-05',categoria:'Mercado',descricao:'Anterior'}];
 const window={innerWidth:900,innerHeight:850,addEventListener(){},PFGemini:{query:async args=>{queryCount++;return query(args)}},supabaseCliente:{auth:{onAuthStateChange:fn=>authCallback=fn}}};window.parent=window;
 const ctx={window,document:doc,Date:FixedDate,URL,URLSearchParams,Intl,AbortController,DOMException,setTimeout,clearTimeout,requestAnimationFrame:fn=>fn(),MutationObserver:class{constructor(fn){observers.push(fn)}observe(){}},location:{origin:'https://ricardodavila.github.io',search:''},protecaoAutenticada:true,transacoes:rows,obterSessaoNuvem:async()=>({user:{id:'teste'},access_token:'token-ficticio'}),SUPABASE_URL:'https://example.invalid',SUPABASE_PUBLISHABLE_KEY:'ficticio'};
 vm.createContext(ctx);vm.runInContext(script('pf-assistente-local-core'),ctx);vm.runInContext(script('pf-assistente-local-ui'),ctx);
 return {nodes,chips,ctx,rows,source,queries:()=>queryCount,setQuery:fn=>query=fn,auth:(e,s)=>authCallback(e,s),submit:()=>nodes.get('pfIaForm').onsubmit({preventDefault(){}})};
}
const flush=()=>new Promise(setImmediate);
(async()=>{
for(const file of ['index.html','distribuicao/app.html','teste-gemini/app.html']){
 const t=setup(file),$=id=>t.nodes.get(id),messages=$('pfIaMessages'),before=JSON.stringify(t.rows);
 assert($('pfIaPeriodSummary').textContent.includes('1 de novembro de 2026 a 30 de novembro de 2026'));
 let welcome=messages.querySelector('.ia-welcome');assert(welcome);assert.equal(welcome.find(n=>n.className==='ia-examples').children.length,6);
 welcome.find(n=>n.className==='ia-examples').children[1].onclick();assert.equal($('pfIaQuestion').value,'Quanto gastei?');assert.equal(t.queries(),0);assert.equal(messages.children.length,1);
 t.submit();await flush();assert.equal(t.queries(),0);assert(!messages.querySelector('.ia-welcome'));assert(messages.textContent.includes('R$'));assert.equal(JSON.stringify(t.rows),before);
 const records=messages.find(n=>n.className==='ia-records');assert(records);assert(records.textContent.includes('(2)'));records.open=true;records.events.toggle();assert(records.textContent.includes('<img src=x onerror=alert(1)>'));assert(!records.textContent.includes('Anterior'));
 $('pfIaClear').onclick();assert(messages.querySelector('.ia-welcome'));assert.equal($('pfIaQuestion').value,'');assert(!$('pfIaAccept').checked);
 $('pfIaPeriodMode').value='range';$('pfIaStart').value='2026-11-05';$('pfIaEnd').value='2026-11-06';$('pfIaPeriodMode').onchange();assert($('pfIaPeriodSummary').textContent.includes('5 de novembro de 2026 a 6 de novembro de 2026'));assert.equal(t.chips[2].dataset.q,'Compare com o período anterior');assert.equal($('pfIaQuestion').maxLength,300);
 $('pfIaMode').value='gemini';$('pfIaMode').onchange();assert.equal($('pfIaConsent').style.display,'block');assert(!$('pfIaAccept').checked);assert(messages.querySelector('.ia-welcome').textContent.includes('autorização'));
 t.chips[0].onclick();assert.equal(t.queries(),0);t.submit();await flush();assert.equal(t.queries(),0);assert(messages.textContent.includes('Marque a autorização'));
 $('pfIaAccept').checked=true;$('pfIaQuestion').value='Faça um resumo';t.submit();await flush();await flush();assert.equal(t.queries(),1);assert(messages.textContent.includes('Resposta simulada'));assert(messages.textContent.includes('Confira os valores'));
 let finish;t.setQuery(()=>new Promise(resolve=>finish=resolve));$('pfIaQuestion').value='Compare com o período anterior';t.submit();await flush();assert.equal(t.queries(),2);$('pfIaClear').onclick();finish('RESPOSTA ANTIGA');await flush();assert(!messages.textContent.includes('RESPOSTA ANTIGA'));assert(!$('pfIaAccept').checked);
 t.auth('SIGNED_OUT',null);assert.equal(messages.children.length,0);assert.equal(JSON.stringify(t.rows),before);
 assert(t.source.includes('Cálculo local · sem envio à IA'));assert(t.source.includes('id="pf-assistente-clarity"'));
 console.log('PASS',file,'exemplos sem envio, Enter, período exato, registros de referência, consentimento, cancelamento, logout e dados preservados');
}
})().catch(e=>{console.error(e);process.exitCode=1});

