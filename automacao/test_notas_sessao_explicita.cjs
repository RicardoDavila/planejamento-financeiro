const assert=require('node:assert/strict'),crypto=require('node:crypto');
const Core=require('./notas_core.js');
const owner=crypto.randomUUID(),other=crypto.randomUUID();
const session={access_token:'jwt-ficticio',user:{id:owner},expires_at:Date.now()/1000+3600};
function fixture(extra={}){let active=true;const requests=[];const cfg={url:'https://example.supabase.co',publicKey:'sb_publishable_ficticia',owner,isCurrent:()=>active,
 client:{supabaseUrl:'https://example.supabase.co',auth:{getUser:async token=>{assert.equal(token,session.access_token);return {data:{user:{id:owner}},error:null};}}},
 getSession:async()=>session,fetch:async(url,options)=>{requests.push({url,options});return {ok:true,status:200,json:async()=>[]};},...extra};return {cfg,requests,logout:()=>active=false};}
const read=t=>t.from('pf_notas_v3').select('id,user_id,titulo,texto,cor,fixa,deleted,versao,mutacao,updated_at').eq('user_id',owner).order('id').range(500,999);
(async()=>{
 let f=fixture(),t=await Core.authenticatedClient(f.cfg);await read(t);
 let r=f.requests[0],u=new URL(r.url);assert.equal(u.origin,'https://example.supabase.co');assert.equal(u.pathname,'/rest/v1/pf_notas_v3');assert.equal(u.searchParams.get('user_id'),'eq.'+owner);assert.equal(u.searchParams.get('offset'),'500');assert.equal(u.searchParams.get('limit'),'500');assert.equal(r.options.headers.Authorization,'Bearer jwt-ficticio');assert.equal(r.options.headers.apikey,'sb_publishable_ficticia');assert.equal(r.options.credentials,'omit');assert.equal(r.options.redirect,'error');
 await t.rpc('pf_notas_gravar_v3',{p_dono:owner,p_id:crypto.randomUUID(),p_texto:'texto fictício'});r=f.requests[1];assert.equal(r.options.method,'POST');assert.equal(new URL(r.url).pathname,'/rest/v1/rpc/pf_notas_gravar_v3');assert.equal(r.options.headers.Authorization,'Bearer jwt-ficticio');assert(!r.url.includes('texto'));
 assert.throws(()=>t.from('financeiro'));assert.throws(()=>t.rpc('outra',{}));assert.throws(()=>t.from('pf_notas_v3').eq('user_id',other));
 for(const getSession of [async()=>null,async()=>({...session,user:{id:other}}),async()=>({...session,expires_at:1})]){f=fixture({getSession});await assert.rejects(Core.authenticatedClient(f.cfg),e=>e.code==='401');assert.equal(f.requests.length,0);}
 f=fixture({client:{supabaseUrl:'https://other.supabase.co'}});await assert.rejects(Core.authenticatedClient(f.cfg));assert.equal(f.requests.length,0);
 f=fixture({client:{auth:{getUser:async()=>({data:{user:{id:other}}})}}});await assert.rejects(Core.authenticatedClient(f.cfg));assert.equal(f.requests.length,0);
 f=fixture();t=await Core.authenticatedClient(f.cfg);f.logout();await assert.rejects(read(t));assert.equal(f.requests.length,0);
 f=fixture();f.cfg.fetch=async()=>{f.logout();return {ok:true,json:async()=>[{texto:'não aplicar após logout'}]}};t=await Core.authenticatedClient(f.cfg);await assert.rejects(read(t));
 f=fixture({fetch:async()=>({ok:false,status:403,json:async()=>({code:'42501',message:'permission denied for table pf_notas_v3',details:'conteúdo privado'})})});t=await Core.authenticatedClient(f.cfg);r=await read(t);assert.equal(r.error.code,'42501');assert(!JSON.stringify(r).includes('privado'));assert.equal(Core.diagnose(r.error).target,'tabela de notas');
 assert.equal(Core.diagnose({code:'42501',message:'permission denied for schema auth'}).target,'schema auth');
 const safe=Core.diagnose({code:'42501',message:'permission denied for table segredo_privado',details:session.access_token});assert.equal(safe.target,'outra dependência do servidor');assert(!JSON.stringify(safe).includes('segredo'));assert(!JSON.stringify(safe).includes(session.access_token));
 console.log('PASS: JWT explícito, validação remota da conta, leitura paginada, RPC exclusiva, recusa sem sessão/conta trocada, logout, diagnóstico sem conteúdo privado.');
})().catch(e=>{console.error(e);process.exitCode=1});
