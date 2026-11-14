/* pf-desktop-only-v511 */
(function(){if(typeof matchMedia==='function'&&matchMedia('(max-width:900px), (pointer:coarse)').matches)return;
/* Etapa 03: avisos e composição no fluxo da página; calendários completos. */
(()=>{'use strict';
const shortMonth=key=>['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'][Number(key.slice(5,7))-1]+'/'+key.slice(2,4);
const months=year=>Array.from({length:12},(_,i)=>year+'-'+String(i+1).padStart(2,'0'));
const range=key=>[key+'-01',new Date(Date.UTC(Number(key.slice(0,4)),Number(key.slice(5)),0,12)).toISOString().slice(0,10)];
window.PFCalendar={months,range,label:shortMonth};
if(typeof document==='undefined')return;
const $=id=>document.getElementById(id),dialogs=new Map();let clicked=null;
function authorized(){try{if(window.pfdAssert)window.pfdAssert();return typeof protecaoAutenticada!=='undefined'&&protecaoAutenticada===true&&!document.body.classList.contains('auth-pendente')}catch{return false}}
function enhance(node){if(!node||dialogs.has(node))return node;dialogs.set(node,{nativeClose:node.close.bind(node)});node.classList.add('pf-inline-detail');node.hidden=true;node.setAttribute('role','region');node.removeAttribute('aria-modal');node.showModal=()=>open(node);node.close=()=>{if(node.open)dialogs.get(node).nativeClose();node.hidden=true;const button=dialogs.get(node).trigger;if(button)button.setAttribute('aria-expanded','false')};return node}
function open(node,anchor,key){if(!authorized())return;enhance(node);let target=anchor||clicked?.closest('[data-pdp-chart],.panel,.restored-grid>section,.analysis-card,details.analysis-rubric')||$('clean-month-analysis')||$('pfPersonalDashboard');if(target&&!node.contains(target)&&target!==node)target.after(node);node.hidden=false;node.setAttribute('open','');const trigger=clicked;if(trigger){dialogs.get(node).trigger=trigger;trigger.setAttribute('aria-expanded','true')}if(key)node.dataset.inlineKey=key;}
window.PFInlineDetails={open,enhance};
function install(){
 const mobile=matchMedia('(max-width:900px), (pointer:coarse)').matches;
 const notice=$('pfDashboardNotices'),box=$('pfAvisosDia'),toolbar=$('pfDashboardToolbar');
 if(notice&&box&&toolbar){toolbar.after(box);box.hidden=true;box.classList.add('pf-inline-notices');notice.setAttribute('aria-controls','pfAvisosDia');notice.setAttribute('aria-expanded','false');notice.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();if(!authorized())return;const opening=box.hidden;if(opening){if(typeof pfAvisosOcultos!=='undefined')pfAvisosOcultos=false;if(typeof pfAtualizarAvisosDia==='function')pfAtualizarAvisosDia();const content=$('pfAvisosConteudo');if(content)content.hidden=false}box.hidden=!opening;notice.setAttribute('aria-expanded',String(opening));},true)}
 for(const id of ['pdp-detail','compositionDialog'])enhance($(id));
 document.addEventListener('click',e=>{const trigger=e.target.closest('[data-pdp-point],[data-pdp-detail],[data-restored-point],[data-restored-detail],.pfce-point,.pfce-hit,#clean-month-analysis canvas,#desktopGraphics canvas');if(!trigger)return;clicked=trigger;const composition=$('compositionDialog');if(trigger.tagName!=='CANVAS'&&composition?.open&&composition.dataset.triggerKey===trigger.outerHTML){composition.close();e.preventDefault();e.stopImmediatePropagation();return}if(composition)composition.dataset.triggerKey=trigger.outerHTML;},true);
 let lastRoute=document.body.dataset.pfDashView;
 function synchronize(){
  for(const id of ['pdp-detail','compositionDialog']){const node=$(id);if(node)enhance(node)}
  const route=document.body.dataset.pfDashView,locked=!authorized()||$('painelGerencial')?.classList.contains('pf-painel-oculto');
  for(const [node] of dialogs){if(!node.isConnected){node.close();document.body.append(node)}if(locked||route!==lastRoute)node.close()}lastRoute=route;
  if(!authorized()&&box){box.hidden=true;notice?.setAttribute('aria-expanded','false')}
 }
 new MutationObserver(synchronize).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class','data-pf-dash-view']});
 if(!mobile){calendar('pfInlineMainPeriods',$('clean-periodbar'),'filtroDataInicio','filtroDataFim',()=>window.renderTable?.());calendar('pfInlineChartPeriods',$('gQuickPeriods')?.parentElement,'gFrom','gTo',()=>$('gApply')?.click())}
 setInterval(synchronize,700);
}
function calendar(id,host,fromId,toId,apply){if(!host||$(id))return;const bar=document.createElement('div');bar.id=id;bar.className='pf-full-year-periods';bar.setAttribute('aria-label','Período anual e meses');host.append(bar);let signature='';
 function draw(){const from=$(fromId)?.value||new Date().toISOString().slice(0,10),to=$(toId)?.value||'',year=Number(from.slice(0,4));const sig=from+'|'+to;if(sig===signature)return;signature=sig;const selected=from.slice(0,7);bar.innerHTML='<label>Ano <select aria-label="Ano do período">'+[year-1,year,year+1].map(y=>'<option'+(y===year?' selected':'')+'>'+y+'</option>').join('')+'</select></label><button type="button" data-calendar-month="year" aria-pressed="'+(from===year+'-01-01'&&to===year+'-12-31')+'">Ano completo</button>'+months(year).map(key=>'<button type="button" data-calendar-month="'+key+'" aria-pressed="'+(from===key+'-01'&&to.startsWith(key))+'">'+shortMonth(key)+'</button>').join('');}
 function set(from,to){if(!authorized())return;$(fromId).value=from;$(toId).value=to;apply();draw()}
 bar.addEventListener('click',e=>{const b=e.target.closest('[data-calendar-month]');if(!b)return;const key=b.dataset.calendarMonth,year=bar.querySelector('select').value;if(key==='year')set(year+'-01-01',year+'-12-31');else set(...range(key))});bar.addEventListener('change',e=>{if(e.target.tagName==='SELECT')set(e.target.value+'-01-01',e.target.value+'-12-31')});draw();setInterval(draw,700);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();

})();