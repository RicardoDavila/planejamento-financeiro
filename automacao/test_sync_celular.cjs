const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict');
const root=__dirname,helper=fs.readFileSync(path.join(root,'sincronizacao_automatica.js'),'utf8'),recovery=fs.readFileSync(path.join(root,'recuperacao_celular.js'),'utf8');
const copy=x=>JSON.parse(JSON.stringify(x));
function setup(o={}){
 const initial={transacoes:[{id:1,tipo:'Despesa',valor:10,status:'A Vencer',idStatus:'antigo',vencimento:'2026-10-20',dataPg:''}],historico:[{acao:'LOCAL'}],lixeira:[]};
 let local=copy(initial),owner='A',reads=0,confirmations=0,applies=0,downloads=0,signouts=0;
 const remote={updated_at:'remote',payload:{transacoes:[{id:1,tipo:'Despesa',valor:20,status:'Pago',dataPg:'2026-10-20'},{id:2,tipo:'Receita',valor:30,status:'Recebido'}],historico:[],lixeira:[]}};
 const values=new Map([['known','old'],['localTime','local-time'],['pf_alteracao_token','t1'],['pf_alteracao_confirmada','t0']]),events=[],alerts=[];
 const storage={getItem:k=>values.get(k)??null,setItem(k,v){if(o.backupFailure&&k.startsWith('pf_backup_'))throw Error('quota');values.set(k,v);},removeItem:k=>values.delete(k)};
 const session=()=>o.noSession?null:{access_token:'token-ficticio',user:{id:owner}};
 const ctx={console,JSON,Date,Blob,Map,URL:{createObjectURL:()=> 'blob:test',revokeObjectURL(){}},localStorage:storage,CHAVE_ULTIMA_SINCRONIZACAO:'known',CHAVE_ULTIMA_ALTERACAO_LOCAL:'localTime',CHAVE_HISTORICO:'history',pfFilaEnvio:Promise.resolve(),sincronizacaoNuvemTimer:null,setTimeout(){},clearTimeout(){},
 window:{addEventListener(){},confirm(){confirmations++;return !(o.cancel&&confirmations===1||o.cancelDownload&&confirmations===2);}},
 document:{hidden:false,body:{classList:{contains:()=>false},appendChild(){}},addEventListener(){},createElement:()=>({click(){downloads++;events.push('download');},remove(){}})},
 obterSessaoNuvemManual:session,obterSessaoNuvem:async()=>session(),
 carregarPacoteNuvem:async()=>{reads++;if(o.accountChanged&&reads===2)owner='B';if(o.localChanged&&reads===2)local.transacoes[0].valor=99;if(o.noRemote)return null;return {...copy(remote),updated_at:o.remoteChanged&&reads===2?'changed':'remote'};},
 coletarPacoteNuvem:()=>copy(local),aplicarPacoteNuvem:p=>{applies++;local=copy(p);events.push('apply');if(o.applyFailure&&applies===1)throw Error('storage failure');},
 validarBackup:p=>{assert(Array.isArray(p.transacoes));},pfMesmaVersao:(a,b)=>a===b,
 salvarPacoteNuvem:async()=>{throw Error('O recebimento nunca deve gravar na nuvem');},pfSincronizarConta:async()=>{},popularSelectsDinamicos(){},renderTable(){},atualizarPainelGerencial(){},atualizarInfoBanco(){},verificarContasVencendoHoje(){},atualizarStatusNuvem(){},alert:x=>alerts.push(x),resumirErroSupabase:e=>e.message};
 vm.createContext(ctx);vm.runInContext(helper+'\n'+recovery,ctx);
 return {ctx,values,events,alerts,initial,remote,local:()=>local,counts:()=>({applies,downloads,reads,signouts}),setOwner:v=>owner=v,setLocal:v=>local=copy(v)};
}
(async()=>{
 let x=setup();assert(await x.ctx.receberDadosNuvemComBackup());assert.equal(x.counts().applies,1);assert.equal(x.counts().downloads,1);assert(x.events.indexOf('download')<x.events.indexOf('apply'));assert.equal(x.values.get('known'),'remote');assert.deepEqual(x.local(),x.remote.payload);const backup=JSON.parse(x.values.get('pf_backup_antes_receber_nuvem_A'));assert.deepEqual(backup.local,x.initial);assert.deepEqual(backup.nuvem,x.remote);assert(x.ctx.pfLerBaseFinanceiraConfirmada());
 for(const options of [{cancel:true},{cancelDownload:true},{remoteChanged:true},{localChanged:true},{accountChanged:true},{backupFailure:true},{noSession:true},{noRemote:true}]){x=setup(options);assert.equal(await x.ctx.receberDadosNuvemComBackup(),false,JSON.stringify(options));assert.equal(x.counts().applies,0);assert.equal(x.values.get('known'),'old');assert.equal(x.values.get('pf_alteracao_confirmada'),'t0');}
 x=setup({applyFailure:true});assert.equal(await x.ctx.receberDadosNuvemComBackup(),false);assert.deepEqual(x.local(),x.initial);assert.equal(x.values.get('known'),'old');assert.equal(x.counts().applies,2);
 x=setup();const concurrent=await Promise.all([x.ctx.receberDadosNuvemComBackup(),x.ctx.receberDadosNuvemComBackup()]);assert.equal(concurrent.filter(Boolean).length,1);assert.equal(x.counts().applies,1);assert.equal(x.counts().downloads,1);
 x=setup();x.values.set('known','confirmed');assert(x.ctx.pfSalvarBaseFinanceiraConfirmada(x.initial,'A','confirmed'));let local=copy(x.initial);local.transacoes[0].status='Vencido';local.transacoes[0].idStatus='calculado';assert(x.ctx.pfDadosFinanceirosIguais(local,x.ctx.pfLerBaseFinanceiraConfirmada().financeiro));assert.deepEqual(x.initial.transacoes[0].status,'A Vencer');
 local.transacoes[0].status='Pago';assert(!x.ctx.pfDadosFinanceirosIguais(local,x.initial));local=copy(x.initial);local.transacoes[0].valor=11;assert(!x.ctx.pfDadosFinanceirosIguais(local,x.initial));local=copy(x.initial);local.lixeira=[{item:{id:7}}];assert(!x.ctx.pfDadosFinanceirosIguais(local,x.initial));
 x.setOwner('B');assert.equal(x.ctx.pfLerBaseFinanceiraConfirmada(),null);assert.equal(x.ctx.pfSalvarBaseFinanceiraConfirmada(x.initial,'A','confirmed'),false);x.setOwner('A');x.values.set('known','another-version');assert.equal(x.ctx.pfLerBaseFinanceiraConfirmada(),null);
 // Executa a rotina real de login da versão pessoal gerada, com credenciais fictícias.
 if(process.argv[2]){const html=fs.readFileSync(process.argv[2],'utf8'),a=html.indexOf('        async function entrarNuvem()'),b=html.indexOf('        async function criarContaNuvem()',a);assert(a>=0&&b>a);
 x=setup();x.values.set('known','confirmed');x.ctx.pfSalvarBaseFinanceiraConfirmada(x.initial,'A','confirmed');const t=html.indexOf('        function pfTemAlteracoesLocais(){'),end=html.indexOf('        async function salvarPacoteNuvem()',t);vm.runInContext(html.slice(t,end),x.ctx);local=copy(x.initial);local.transacoes[0].status='Vencido';local.transacoes[0].idStatus='calculado';x.setLocal(local);assert.equal(x.ctx.pfTemAlteracoesLocais(),false);local.transacoes[0].valor=12;x.setLocal(local);assert.equal(x.ctx.pfTemAlteracoesLocais(),true);
 x=setup();const elements={nuvemEmail:{value:'teste@example.invalid'},nuvemSenha:{value:'senha-ficticia'},statusNuvemBadge:{textContent:'Online'}};const button={disabled:false,innerHTML:''};let signouts=0;
 x.ctx.document.getElementById=id=>elements[id]||null;x.ctx.document.querySelector=()=>button;x.ctx.supabaseCliente={auth:{signOut:async()=>{signouts++;},signInWithPassword:async()=>({error:{code:'invalid_credentials',message:'Invalid login credentials'}})}};
 vm.runInContext(html.slice(a,b),x.ctx);await x.ctx.entrarNuvem();assert.equal(signouts,0);assert.equal(x.ctx.obterSessaoNuvemManual().user.id,'A');assert(x.alerts.some(s=>s.includes('senha da conta de sincronização')));assert.equal(button.disabled,false);
 }
 console.log('PASS: recebimento com backup e confirmação, cancelamento, conflitos, troca de conta, falha de armazenamento, status calculados e login recusado sem logout');
})().catch(e=>{console.error(e);process.exitCode=1});
