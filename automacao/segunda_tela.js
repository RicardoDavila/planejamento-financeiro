/* pf-desktop-only-v511 */
(function(){if(typeof matchMedia==='function'&&matchMedia('(max-width:900px), (pointer:coarse)').matches)return;
(()=>{'use strict';
const choices=[['dashboard','📊','Dashboard'],['entries','📋','Painel de Lançamentos'],['new','📝','Cadastro'],['charts','📈','Gráficos'],['analysis','🔎','Análise Financeira'],['tools','🛠️','Ações e Ferramentas'],['security','🛡️','Segurança'],['help','❓','Ajuda e Informações']];
function secondaryURL(href,key){if(!choices.some(c=>c[0]===key))throw Error('Área inválida.');const url=new URL(href);url.searchParams.delete('assistente');url.searchParams.delete('canal');url.searchParams.set('pf-secondary',key);url.hash='';return url.href;}
if(typeof module!=='undefined'&&module.exports)module.exports={choices,secondaryURL};
if(typeof document==='undefined')return;
let dialog,secondary=null,secondaryHref='',handled=false,wasAuthorized=false,inherited=false;
const $=id=>document.getElementById(id);
function authorized(){try{window.pfdAssert?.();return typeof protecaoAutenticada!=='undefined'&&protecaoAutenticada===true&&!document.body.classList.contains('auth-pendente');}catch{return false;}}
// Apenas a janela aberta por este botão pode reutilizar a sessão local viva.
// Não armazena nem transmite senha, hash, token da nuvem ou dados financeiros.
function grant(requester,href){try{return authorized()&&requester===secondary&&!secondary.closed&&href===secondaryHref;}catch{return false;}}
window.PFSecondScreenSession={authorize:grant};
function parentGrant(){try{const opener=window.opener;if(!opener||opener.closed)return false;const here=new URL(location.href),parent=new URL(opener.location.href);if(here.origin!==parent.origin||here.pathname!==parent.pathname||!choices.some(c=>c[0]===here.searchParams.get('pf-secondary')))return false;return opener.PFSecondScreenSession?.authorize(window,location.href)===true;}catch{return false;}}
function inheritSession(){if(authorized()||!parentGrant()||typeof iniciarAplicacao!=='function')return;try{window.pfdAssert?.();protecaoAutenticada=true;document.body.classList.remove('auth-pendente','auth-saiu');$('telaProtecaoAcesso')?.classList.add('hidden');inherited=true;iniciarAplicacao();}catch{protecaoAutenticada=false;document.body.classList.add('auth-pendente');$('telaProtecaoAcesso')?.classList.remove('hidden');inherited=false;}}
function revokeInherited(){if(!inherited||parentGrant())return;inherited=false;protecaoAutenticada=false;document.body.classList.add('auth-pendente');$('telaProtecaoAcesso')?.classList.remove('hidden');try{window.close();}catch{}}
function ensure(){if(dialog)return;dialog=document.createElement('dialog');dialog.id='pfSecondScreenDialog';dialog.setAttribute('aria-labelledby','pfSecondScreenTitle');
dialog.innerHTML='<header><h2 id="pfSecondScreenTitle">🖥️ Escolher segunda tela</h2><button type="button" data-second-close aria-label="Fechar escolha da segunda tela">✕</button></header><p>Escolha a área que deseja abrir em outra janela. Depois, arraste a janela para o segundo monitor.</p><div class="pf-second-grid">'+choices.map(([key,icon,title])=>'<button type="button" class="pf-area-card" data-second-view="'+key+'"><span aria-hidden="true">'+icon+'</span><strong>'+title+'</strong></button>').join('')+'</div><p id="pfSecondScreenStatus" role="status"></p><footer><button type="button" data-second-close>Cancelar</button></footer>';
document.body.append(dialog);dialog.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.hasAttribute('data-second-close')){dialog.close();return;}const key=b.dataset.secondView;if(!key||!authorized())return;
const href=secondaryURL(location.href,key),next=window.open(href,'pf-secondary-screen','popup,width=1280,height=900,resizable=yes,scrollbars=yes');
if(!next){$('pfSecondScreenStatus').textContent='O navegador bloqueou a segunda janela. Permita pop-ups deste aplicativo e tente novamente.';return;}
secondary=next;secondaryHref=href;dialog.close();secondary.focus();});
dialog.addEventListener('close',()=>$('pf-dois-monitores')?.focus());}
function chooser(event){if(!event.target.closest?.('#pf-dois-monitores'))return;event.preventDefault();event.stopImmediatePropagation();if(!authorized())return;ensure();$('pfSecondScreenStatus').textContent='';dialog.showModal();}
function route(){revokeInherited();inheritSession();const auth=authorized();if(wasAuthorized&&!auth){if(dialog?.open)dialog.close();if(secondary&&!secondary.closed)secondary.close();secondary=null;secondaryHref='';}wasAuthorized=auth;
if(handled||!auth)return;const key=new URL(location.href).searchParams.get('pf-secondary');if(!choices.some(c=>c[0]===key)){handled=true;return;}
const target=document.querySelector('#pfDashboardHome [data-dash-action="'+key+'"]');if(!target||!window.PFDashboard||!window.PFAreaCards||!window.PFCadastroPage||!window.PFPersonalAnalysis)return;
handled=true;target.click();}
function install(){const originalProtection=window.inicializarProtecaoAcesso;if(typeof originalProtection==='function')window.inicializarProtecaoAcesso=function(...args){if(parentGrant()){inheritSession();if(authorized())return;}return originalProtection.apply(this,args);};document.addEventListener('click',chooser,true);const b=$('pf-dois-monitores');if(b){b.title='Escolher uma área para abrir no segundo monitor';b.setAttribute('aria-haspopup','dialog');b.removeAttribute('aria-pressed');}
new MutationObserver(route).observe(document.body,{attributes:true,attributeFilter:['class']});setInterval(route,500);route();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
})();
