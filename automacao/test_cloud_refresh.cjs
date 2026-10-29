const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const stale={user:{id:'A'},access_token:'old',refresh_token:'refresh-old',expires_at:1};const fresh={user:{id:'A'},access_token:'new',refresh_token:'refresh-new',expires_at:Date.now()/1000+3600};
function setup(code,{initial=stale,fail=false,switchOwner=false,statuses=[],onRefresh}={}){
 let session={...initial},count=0,callback,saved=[],requests=[];
 const badge={textContent:'Online'};
 const auth={onAuthStateChange(fn){callback=fn},getSession:async()=>({data:{session}}),refreshSession:async()=>{count++;await new Promise(setImmediate);if(onRefresh)onRefresh(()=>callback('SIGNED_OUT',null));if(fail)return {error:Error('refresh failed')};session=switchOwner?{...fresh,user:{id:'B'}}:{...fresh};return {data:{session}};}};
 const window={obterSessaoNuvem:async()=>session,fetch:async(input,options)=>{requests.push({input,options});return {status:statuses.shift()??200}},parent:null};window.parent=window;
 const ctx={window,supabaseCliente:{auth},SUPABASE_URL:'https://example.invalid',document:{getElementById:()=>badge},location:{href:'https://app.example.invalid/'},URL,Headers,Date,Error,JSON,atob:x=>Buffer.from(x,'base64').toString('utf8'),salvarSessaoNuvemManual:s=>saved.push({...s})};vm.createContext(ctx);vm.runInContext(code,ctx);
 return {window,badge,requests,saved,count:()=>count};
}
(async()=>{
for(const file of ['index.html','teste-gemini/app.html']){
 const html=fs.readFileSync(path.resolve(__dirname,'..',file),'utf8'),code=html.match(/<script id="pf-cloud-session-renewal">([\s\S]*?)<\/script>/)[1];
 let x=setup(code,{initial:fresh});assert.equal((await x.window.obterSessaoNuvem()).access_token,'new');assert.equal(x.count(),0);assert.equal(x.saved.at(-1).refresh_token,'refresh-new');
 x=setup(code);const pair=await Promise.all([x.window.obterSessaoNuvem(),x.window.obterSessaoNuvem()]);assert.equal(x.count(),1);assert(pair.every(s=>s.access_token==='new'));assert.equal(x.saved.at(-1).refresh_token,'refresh-new');
 x=setup(code,{fail:true});await assert.rejects(()=>x.window.obterSessaoNuvem(),/dados locais foram preservados/);assert.equal(x.saved.length,0);assert.equal(x.badge.textContent,'Sessão expirada');
 x=setup(code,{statuses:[401,200]});const payload=JSON.stringify({user_id:'A',payload:{sample:1}});const response=await x.window.fetch('https://example.invalid/rest/v1/planejamento_financeiro_sync?user_id=eq.A',{method:'PATCH',headers:{Authorization:'Bearer old'},body:payload});assert.equal(response.status,200);assert.equal(x.requests.length,2);assert.equal(x.requests[1].options.headers.get('Authorization'),'Bearer new');assert.equal(x.requests[1].options.body,payload);assert.equal(x.requests[1].options.method,'PATCH');
 x=setup(code,{statuses:[401,401,200]});await assert.rejects(()=>x.window.fetch('https://example.invalid/rest/v1/planejamento_financeiro_sync?user_id=eq.A',{}),/não foi aceita/);assert.equal(x.requests.length,2);
 x=setup(code,{statuses:[401],initial:{...stale,user:{id:'B'}}});await assert.rejects(()=>x.window.fetch('https://example.invalid/rest/v1/planejamento_financeiro_sync?user_id=eq.A',{}),/conta da nuvem mudou/);assert.equal(x.count(),0);
 x=setup(code,{switchOwner:true});await assert.rejects(()=>x.window.obterSessaoNuvem(),/conta da nuvem mudou/);assert.equal(x.saved.length,0);
 x=setup(code,{onRefresh:logout=>logout()});await assert.rejects(()=>x.window.obterSessaoNuvem(),/conta da nuvem mudou/);assert.equal(x.saved.length,0);
 x=setup(code,{statuses:[401]});await x.window.fetch('https://other.invalid/path',{});assert.equal(x.count(),0);assert.equal(x.requests.length,1);
 console.log('PASS: expiração, renovação única concorrente, rotação dos tokens, retry 401 limitado, falha sem apagar dados, troca de conta e logout em '+file);
}
})().catch(e=>{console.error(e);process.exitCode=1});
