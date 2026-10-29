const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),path=require('path');
const code=fs.readFileSync(path.join(__dirname,'recuperacao_nuvem.js'),'utf8');
async function run({cancel=false,downloadCancelled=false,changedRemote=false,changedLocal=false,failSave=false}={}){
 const map=new Map([['base','old-confirmed']]),events=[],alerts=[];let reads=0,confirms=0,saves=0;
 const local={transacoes:[{id:1,valor:1},{id:2,valor:2}],historico:[],lixeira:[]};
 const ctx={window:{pfdAssert:()=> 'luciane',confirm:()=>{confirms++;events.push('confirm');return confirms===1?!cancel:!downloadCancelled;}},clearTimeout(){},setTimeout(){},sincronizacaoNuvemTimer:null,pfFilaEnvio:Promise.resolve(),carregarPacoteNuvem:async()=>{reads++;return {updated_at:changedRemote&&reads>1?'changed':'remote-version',payload:{transacoes:[{id:1,valor:3}]}};},coletarPacoteNuvem:()=>({...local,transacoes:changedLocal&&reads>1?[{id:7}]:local.transacoes,atualizado_localmente_em:Date.now()}),URL:{createObjectURL(){return 'blob:test';},revokeObjectURL(){}},Blob,document:{createElement(){return {click(){events.push('download');},remove(){}};},body:{appendChild(){}}},pfMesmaVersao:(a,b)=>a===b,pfdLocal:{getItem:k=>map.get(k),setItem:(k,v)=>map.set(k,v),removeItem:k=>map.delete(k)},CHAVE_ULTIMA_SINCRONIZACAO:'base',salvarPacoteNuvem:async()=>{saves++;events.push('save');assert.equal(map.get('base'),'remote-version');if(failSave)throw Error('concurrent update');map.set('base','new-confirmed');},atualizarStatusNuvem(){},alert:x=>alerts.push(x)};
 vm.createContext(ctx);vm.runInContext(code,ctx);await ctx.resolverConflitoNuvem();
 return {map,events,alerts,saves};
}
(async()=>{
 let r=await run();assert.equal(r.saves,1);assert.equal(r.map.get('base'),'new-confirmed');assert(r.events.indexOf('download')<r.events.indexOf('save'));
 for(const opts of [{cancel:true},{downloadCancelled:true},{changedRemote:true},{changedLocal:true}]){r=await run(opts);assert.equal(r.saves,0);assert.equal(r.map.get('base'),'old-confirmed');}
 r=await run({failSave:true});assert.equal(r.saves,1);assert.equal(r.map.get('base'),'old-confirmed');assert(r.alerts.some(x=>x.includes('concurrent update')));
 console.log('PASS: recuperação com backup, cancelamento, alteração remota/local e restauração da confirmação após falha.');
})().catch(e=>{console.error(e);process.exitCode=1;});
