/* pf-desktop-only-v511 */
(function(){if(typeof matchMedia==='function'&&matchMedia('(max-width:900px), (pointer:coarse)').matches)return;
/* Botões azuis; cards da Página Inicial e, no escuro, do Cadastro com hierarquia neutra. */
(()=>{'use strict';let queued=false;
const homeLabel=text=>String(text).replace(/Voltar\s+(?:à|a|para\s+a)\s+capa/gi,'Voltar Página Inicial').replace(/^(\s*)capa(\s*)$/i,'$1Página Inicial$2');
function rename(button){const walker=document.createTreeWalker(button,NodeFilter.SHOW_TEXT);let node;while((node=walker.nextNode())){const next=homeLabel(node.nodeValue);if(next!==node.nodeValue)node.nodeValue=next;}for(const key of ['aria-label','title','value'])if(button.hasAttribute(key)){const old=button.getAttribute(key),next=homeLabel(old);if(next!==old)button.setAttribute(key,next);}}
/* Células autofiltráveis são dados, apesar de terem role=button. */
function entryDataInk(button,dark){
 if(!button.closest?.('#tabelaLancamentosWrapper'))return null;
 const neutral=dark?'rgb(232, 237, 242)':'rgb(23, 33, 43)',green=dark?'rgb(0, 222, 153)':'rgb(0, 115, 77)',amber=dark?'rgb(255, 209, 102)':'rgb(145, 99, 0)',red=dark?'rgb(255, 77, 106)':'rgb(180, 35, 64)';
 const cell=button.closest('td[data-auto-cell]');
 if(cell?.dataset.autoCell==='status'){
  const text=cell.textContent.trim().normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const tone=['pago','paga','recebido','recebida','pagamento','recebimento','feito','liquidado','liquidada','paid','received'].includes(text)?'paid':['vencido','vencida','atrasado','atrasada','overdue'].includes(text)?'overdue':['pendente','a vencer','a receber','nao recebido','nao recebida','pending','unpaid'].includes(text)?'pending':'neutral';
  if(cell.dataset.pfEntryTone!==tone)cell.dataset.pfEntryTone=tone;
  return tone==='paid'?green:tone==='overdue'?red:tone==='pending'?amber:neutral;
 }
 if(cell?.dataset.autoCell==='valor'){
  const row=cell.closest('tr'),type=row?.querySelector('[data-auto-cell="tipo"]')?.textContent.trim();
  if(row?.classList.contains('pf-entry-income')||type==='Receita')return green;
 }
 if((button.getAttribute('onclick')||'').includes('editarLancamento('))return amber;
 return neutral;
}
function refresh(){if(window.PFProjectTheme){for(const b of document.querySelectorAll('button,[role="button"]'))if(b.tagName!=='TD')rename(b);window.PFProjectTheme.refresh();return;}const dark=document.body.classList.contains('dark-mode'),color=dark?'rgb(0, 229, 255)':'rgb(0, 125, 145)';
 window.PFSemanticPalette?.beforeRefresh(dark);
 for(const button of document.querySelectorAll('button,[role="button"],input[type="button"],input[type="submit"],input[type="reset"]')){
  if(button.tagName!=='TD')rename(button);
  if(dark&&window.PFSemanticPalette?.owns(button))continue;
  const home=button.closest?.('#pfDashboardHome .pf-dash-card')||(dark&&button.closest?.('#pfCadastroPage .pf-dash-card'));
  const entry=entryDataInk(button,dark);
  for(const node of [button,...button.querySelectorAll('span,strong,small,b,p,label,i')]){
   if(dark&&node.hasAttribute?.('data-pf-dark-role'))continue;
   const title=node===button||node.tagName==='STRONG'||node.closest?.('strong')||node.classList?.contains('pf-dash-icon');
   const ink=entry|| (home?(dark?(title?'rgb(255, 255, 255)':'rgb(184, 194, 204)'):(title?'rgb(23, 33, 43)':'rgb(91, 101, 115)')):color);
   if(node.style.getPropertyValue('color')!==ink||node.style.getPropertyPriority('color')!=='important')node.style.setProperty('color',ink,'important');
  }
  if(dark&&!button.classList.contains('pf-white-light-bg')){const c=getComputedStyle(button).backgroundColor.match(/[\d.]+/g);if(c&&c.length>=3&&(c.length<4||Number(c[3])>.7)&&(.2126*Number(c[0])+.7152*Number(c[1])+.0722*Number(c[2]))>165)button.classList.add('pf-white-light-bg');}
  if(!dark&&button.classList.contains('pf-white-light-bg'))button.classList.remove('pf-white-light-bg');
 }
 window.PFSemanticPalette?.refresh(dark);
}
function schedule(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;refresh();});}
function install(){refresh();new MutationObserver(schedule).observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['class','style','aria-pressed','aria-current','aria-label','title','value']});window.PFWhiteButtons={refresh};window.PFButtonAppearance=window.PFWhiteButtons;}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();})();

})();