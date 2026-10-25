const fs=require('fs'),vm=require('vm'),assert=require('assert'),path=require('path');
const root=path.resolve(__dirname,'..');
async function test(file){
 const html=fs.readFileSync(path.join(root,file),'utf8');
 assert(html.includes('class="dashboard-v40 pf-resumo-oculto"'));
 assert(html.includes('aria-expanded="false" aria-controls="pfResumoMobileValores dashboardV40Alerta"'));
 assert(/#dashboardMobileV40\.pf-resumo-oculto \.dashboard-v40-grid,[\s\S]*?#dashboardMobileV40\.pf-resumo-oculto #dashboardV40Alerta\{display:none!important\}/.test(html));
 let valid=false,pending=null;const listeners={},classes=new Map();
 function el(id){if(!classes.has(id))classes.set(id,new Set(id==='dashboardMobileV40'?['pf-resumo-oculto']:[]));const set=classes.get(id);return {value:'',textContent:'',disabled:false,attrs:{},classList:{contains:x=>set.has(x),toggle:(x,v)=>v?set.add(x):set.delete(x)},setAttribute(k,v){this.attrs[k]=v},querySelector(s){return this[s]??=el(id+s)},focus(){},addEventListener(name,fn){this[name+'Listener']=fn},open:false,showModal(){this.open=true},close(){this.open=false;this.closeListener?.()}};}
 const elements={};for(const id of ['painelGerencial','dashboardMobileV40','btnAlternarPainelGerencial','btnAlternarResumoMobile','pfSenhaPainelDialog','pfSenhaPainelInput','pfSenhaPainelErro','pfSenhaPainelTitulo','pfSenhaPainelConfirmar'])elements[id]=el(id);
 const doc={hidden:false,getElementById:id=>elements[id],addEventListener:(name,fn)=>listeners[name]=fn};
 const verify=async()=>pending?await pending:valid;
 const c={document:doc,obterConfigProtecao:()=>({ativo:true}),validarSenha:verify,window:{pfdAssert(){},parent:{pfdUser:{id:'luciane'},pfdConfirmPassword:verify},addEventListener:(name,fn)=>listeners[name]=fn}};
 vm.createContext(c);vm.runInContext(html.match(/<script id="pf-visibilidade-painel-gerencial-logic">([\s\S]*?)<\/script>/)[1],c);
 const hidden=()=>classes.get('dashboardMobileV40').has('pf-resumo-oculto');const submit=()=>c.confirmarSenhaPainelGerencial({preventDefault(){}});
 assert(hidden());c.alternarVisibilidadeResumoMobile();assert(hidden());assert(elements.pfSenhaPainelDialog.open);await submit();assert(hidden());assert(elements.pfSenhaPainelErro.textContent.includes('incorreta'));
 elements.pfSenhaPainelDialog.close();assert(hidden());
 c.alternarVisibilidadeResumoMobile();valid=true;await submit();assert(!hidden());assert.equal(elements.btnAlternarResumoMobile.attrs['aria-expanded'],'true');assert.equal(elements.btnAlternarResumoMobile.querySelector('span').textContent,'Ocultar resumo');
 doc.hidden=true;listeners.visibilitychange();assert(hidden());doc.hidden=false;
 c.alternarVisibilidadeResumoMobile();await submit();assert(!hidden());c.alternarVisibilidadeResumoMobile();assert(hidden());
 // Revealing the desktop panel never reveals the mobile summary.
 c.alternarVisibilidadePainelGerencial();assert(classes.get('painelGerencial').has('pf-painel-oculto'));c.alternarVisibilidadePainelGerencial();await submit();assert(hidden());assert(!classes.get('painelGerencial').has('pf-painel-oculto'));
 // Late validation must not reveal values after cancel/reopen or app switch.
 let resolve;pending=new Promise(r=>resolve=r);c.alternarVisibilidadeResumoMobile();const promise=submit();elements.pfSenhaPainelDialog.close();c.alternarVisibilidadeResumoMobile();resolve(true);await promise;assert(hidden());pending=null;
 elements.pfSenhaPainelDialog.close();c.alternarVisibilidadeResumoMobile();await submit();assert(!hidden());listeners.pagehide();assert(hidden());listeners.pageshow();assert(hidden());
}
(async()=>{await test('index.html');await test('distribuicao/app.html');console.log('PASS: mobile oculto inicialmente, senha correta/incorreta, cancelamento, desbloqueio independente, troca de aplicativo, retorno e resposta tardia.');})().catch(e=>{console.error(e);process.exitCode=1});
