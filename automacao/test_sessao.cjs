const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const code=fs.readFileSync(path.resolve(__dirname,'../distribuicao/conta.js'),'utf8');
const a={user:{id:'conta-A',email:'a@example.invalid'},access_token:'token-ficticio-A',refresh_token:'refresh-ficticio-A'};
const b={user:{id:'conta-B',email:'b@example.invalid'},access_token:'token-ficticio-B',refresh_token:'refresh-ficticio-B'};
function setup(){
 const elements=new Map(),frames=[],timers=[],listeners={};let callback,session=a,reads=0,refreshes=0,verify=0;
 const el=id=>{if(!elements.has(id))elements.set(id,{value:'',hidden:false,disabled:false,textContent:'',querySelectorAll:()=>[],querySelector:()=>({disabled:false}),reportValidity:()=>true,showModal(){this.open=true;},close(){this.open=false;},select(){}});return elements.get(id);};
 const auth={getSession:async()=>{reads++;return {data:{session},error:null};},getUser:async token=>{verify++;const selected=token===b.access_token?b:a;return {data:{user:selected.user},error:null};},refreshSession:async()=>{refreshes++;return {data:{session:a},error:null};},onAuthStateChange:fn=>{callback=fn;return {data:{subscription:{unsubscribe(){}}}};},signOut:async()=>{callback('SIGNED_OUT',null);return {error:null};}};
 const client={auth};const window={supabase:{createClient:(_u,_k,cfg)=>{assert.equal(cfg.auth.storageKey,'pf-distribuicao-auth-v1');return client;}}};
 const document={hidden:false,getElementById:el,querySelectorAll:()=>[],createElement:()=>{const frame={removed:false,remove(){this.removed=true;}};frames.push(frame);return frame;},body:{append(){}},addEventListener:(name,fn)=>listeners[name]=fn};
 const ctx={window,document,URL,location:{href:'https://example.invalid/distribuicao/',protocol:'https:'},navigator:{},setTimeout:(fn,ms)=>{const timer={fn,ms};timers.push(timer);return timer;},clearTimeout:t=>{if(t)t.cancelled=true;},addEventListener:(name,fn)=>listeners[name]=fn,matchMedia:()=>({matches:false}),fetch:()=>{throw Error('Rede não permitida no teste');},AbortSignal};
 vm.createContext(ctx);vm.runInContext(code,ctx);
 async function flush(){for(let n=0;n<20;n++){const zero=timers.filter(t=>!t.cancelled&&!t.done&&t.ms===0);for(const t of zero){t.done=true;t.fn();}await new Promise(setImmediate);}}
 return {window,document,auth,frames,elements,listeners,timers,event:(e,s)=>callback(e,s),flush,setSession:s=>session=s,counts:()=>({reads,refreshes,verify})};
}
(async()=>{
 let checks=0;const ok=(v,msg)=>{assert.ok(v,msg);checks++;};
 const x=setup();x.event('SIGNED_IN',a);await x.flush();ok(x.window.pfdUser?.id===a.user.id,'login validado');const frame=x.frames.at(-1);
 x.listeners.visibilitychange();await x.flush();ok(x.frames.at(-1)===frame&&!frame.removed,'trocar de aba não recria painel');
 x.setSession(null);x.listeners.visibilitychange();await x.flush();ok(x.window.pfdUser?.id===a.user.id&&!frame.removed,'retorno vazio recupera sessão');ok(x.counts().refreshes===1,'renovação usa sessão anterior');
 x.auth.getSession=async()=>({data:{session:null},error:{status:0,message:'offline'}});x.listeners.visibilitychange();await x.flush();ok(x.window.pfdUser?.id===a.user.id&&!frame.removed,'falha de rede não desloga');ok(x.timers.some(t=>t.ms===3000&&!t.cancelled),'reconexão agendada');
 x.event('SIGNED_OUT',null);await x.flush();ok(!x.window.pfdUser&&frame.removed,'logout confirmado remove painel');
 const y=setup();y.event('INITIAL_SESSION',null);y.event('SIGNED_IN',a);await y.flush();ok(y.window.pfdUser?.id===a.user.id,'evento inicial antigo não desfaz login');
 const old=y.frames.at(-1);y.setSession(b);y.event('SIGNED_IN',b);ok(old.removed,'troca de conta bloqueia painel antigo imediatamente');await y.flush();ok(y.window.pfdUser?.id===b.user.id,'nova conta validada');
 let resolve;const z=setup();z.event('SIGNED_IN',a);await z.flush();z.auth.getSession=()=>new Promise(r=>resolve=r);z.listeners.visibilitychange();await z.flush();z.event('SIGNED_OUT',null);resolve({data:{session:a},error:null});await z.flush();ok(!z.window.pfdUser,'resposta tardia não reabre conta após sair');
 const w=setup();w.event('SIGNED_IN',a);await w.flush();w.setSession(null);w.auth.refreshSession=async()=>({data:{session:null},error:{status:400,code:'refresh_token_not_found'}});w.listeners.visibilitychange();await w.flush();ok(!w.window.pfdUser,'sessão inválida exige novo login');
 const p=setup();p.event('SIGNED_IN',a);await p.flush();let finish;p.auth.getSession=()=>new Promise(r=>finish=r);p.listeners.visibilitychange();await p.flush();p.listeners.visibilitychange();p.listeners.visibilitychange();finish({data:{session:a},error:null});await p.flush();ok(p.frames.length===1,'verificações concorrentes não recriam o aplicativo');
 const r=setup();r.event('PASSWORD_RECOVERY',a);r.listeners.visibilitychange();await r.flush();ok(!r.window.pfdUser&&r.elements.get('pfdRecovery').hidden===false,'recuperação de senha não abre painel');
 console.log(`PASS: ${checks} verificações de sessão: retorno à aba, renovação, rede, concorrência, conta diferente, logout e respostas tardias.`);
})().catch(error=>{console.error(error);process.exitCode=1;});
