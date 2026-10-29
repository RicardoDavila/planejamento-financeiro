const fs=require('fs'),vm=require('vm'),path=require('path'),assert=require('assert/strict');
const code=fs.readFileSync(path.join(__dirname,'sincronizacao_automatica.js'),'utf8');
function setup(fail=false){
 const local={transacoes:[{id:1,vencimento:'2026-10-30',status:'A Vencer'}],historico:[{data:'2026-10-29',acao:'LOCAL'}],lixeira:[],data_abertura_projeto:'2026-01-01'};
 const map=new Map([['base','old']]),listeners={};let sends=0;
 const ctx={localStorage:{getItem:k=>map.get(k)||null,setItem:(k,v)=>map.set(k,v),removeItem:k=>map.delete(k)},CHAVE_HISTORICO:'historico',CHAVE_ULTIMA_SINCRONIZACAO:'base',coletarPacoteNuvem:()=>local,salvarPacoteNuvem:async()=>{sends++;if(fail)throw Error('conflito');map.set('base','new-confirmed');},document:{hidden:false,body:{classList:{contains:()=>false}},addEventListener:(k,v)=>listeners[k]=v},window:{addEventListener:(k,v)=>listeners[k]=v},pfSincronizarConta:async()=>{sends++;},popularSelectsDinamicos(){},renderTable(){},atualizarPainelGerencial(){},atualizarInfoBanco(){},verificarContasVencendoHoje(){},atualizarStatusNuvem(){}};
 vm.createContext(ctx);vm.runInContext(code,ctx);return {ctx,map,local,listeners,sends:()=>sends};
}
(async()=>{
 let x=setup(),remote={updated_at:'remote',payload:{...x.local,historico:[{data:'2026-10-28',acao:'REMOTO'}]}};
 assert(x.ctx.pfDadosFinanceirosIguais(x.local,remote.payload));assert(await x.ctx.pfConfirmarCopiasIguais(remote));assert.equal(x.sends(),1);assert.equal(JSON.parse(x.map.get('historico')).length,2);
 x=setup();remote={updated_at:'remote',payload:{...x.local,transacoes:[{id:1,vencimento:'2026-10-16',status:'Vencido'}]}};assert.equal(await x.ctx.pfConfirmarCopiasIguais(remote),false);assert.equal(x.sends(),0);assert.equal(x.map.get('base'),'old');
 remote.payload={...x.local,lixeira:[{item:{id:2}}]};assert.equal(await x.ctx.pfConfirmarCopiasIguais(remote),false);
 x=setup(true);remote={updated_at:'remote',payload:{...x.local}};await assert.rejects(x.ctx.pfConfirmarCopiasIguais(remote));assert.equal(x.map.get('base'),'old');
 x=setup();x.ctx.document.hidden=true;await x.listeners.visibilitychange();assert.equal(x.sends(),0);x.ctx.document.hidden=false;await Promise.all([x.listeners.visibilitychange(),x.listeners.online(),x.listeners.focus()]);assert.equal(x.sends(),1);
 console.log('PASS: cópias equivalentes, histórico preservado, divergência real bloqueada, lixeira protegida, falha sem confirmação falsa e retorno ao app sem duplicar requisições.');
})().catch(e=>{console.error(e);process.exitCode=1;});
