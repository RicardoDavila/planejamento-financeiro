const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const html=fs.readFileSync(process.argv[2] || require('path').resolve(__dirname,'../distribuicao/app.html'),'utf8');
const take=name=>html.slice(html.indexOf('function '+name),html.indexOf('\n        }',html.indexOf('function '+name))+10);
let owner='luciane',session={user:{id:owner},access_token:'teste'},assertions=0;
const badge={textContent:''},mobile={dataset:{}},txt={},button={style:{setProperty(k,v){this[k]=v;}}};
const ctx={window:{pfdAssert(){assertions++;},parent:{pfdUser:{id:owner},pfdGetSession:async()=>session}},inicializarSupabaseCliente(){},document:{getElementById:id=>({statusNuvemBadge:badge,btnNuvemMobile:mobile,statusNuvemMobile:txt}[id]),querySelectorAll:()=>[button]},pfdLocal:{getItem:()=>null},CHAVE_ULTIMA_SINCRONIZACAO:'last',formatarHoraSincronizacao:()=>''};
vm.createContext(ctx);
vm.runInContext(html.match(/async function obterSessaoNuvem\(\)\{[^\n]+/)[0],ctx);
vm.runInContext(take('atualizarStatusNuvem'),ctx);
vm.runInContext(take('espelharStatusNuvemMobile'),ctx);
(async()=>{
assert.equal(await ctx.obterSessaoNuvem(),session);assert.equal(assertions,2);
session={user:{id:'outra-conta'}};await assert.rejects(ctx.obterSessaoNuvem(),/outra conta/);
for(const [message,ok,state,color] of [['Conectar',false,'local','#64748b'],['Falha na sincronização: sessão indisponível',false,'erro','#b91c1c'],['Dados enviados',true,'online','#047857']]){
ctx.atualizarStatusNuvem(message,ok);ctx.espelharStatusNuvemMobile();assert.equal(mobile.dataset.status,state);assert.equal(button.style['background-color'],color);
}
assert(html.includes("'Backup dos meus dados'"));
// Todos os scripts inline devem continuar sintaticamente válidos.
let scripts=0;for(const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)){if(!/type=["']application\//.test(m[1])){new vm.Script(m[2]);scripts++;}}
console.log('PASS: sessão recuperada, conta diferente recusada, cores e estados, backup acessível e '+scripts+' scripts válidos.');
})().catch(e=>{console.error(e);process.exitCode=1;});

