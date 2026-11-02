/* Atalhos financeiros em tabelas, detalhes e gráficos. Não grava transações. */
(() => {
 'use strict';
 const $=id=>document.getElementById(id),api=()=>window.PFQuickCards;
 const scopeFor=node=>node?.closest('#modalGraficos')?'charts':'page';
 const labels={categoria:'rubrica',subItem:'subitem',descricao:'descrição'};
 function annotate(node,field,value){
  if(!node||value==null||!labels[field]||node.matches('input,select,textarea,button,a')||node.querySelector('input,select,textarea,button,a')||node.getAttribute('onclick'))return;
  const text=String(value);node.dataset.pfDynamicField=field;node.dataset.pfDynamicValue=text;node.title='Filtrar por '+labels[field]+': '+(text||'(vazio)')+'. Clique novamente ou use Limpar filtro para retornar.';
  node.classList.add('pf-dynamic-item');
  if(!node.closest('button')){node.setAttribute('role','button');node.tabIndex=0;}
 }
 function table(id,fields){
  const host=$(id);if(!host)return;
  for(const row of host.querySelectorAll('tr')){
   if(!row.querySelector('td')||row.querySelector('td[colspan]'))continue;
   const action=row.querySelector('button[onclick*="editarLancamento"]')?.getAttribute('onclick')||'',idMatch=action.match(/editarLancamento\(([^)]+)\)/),idValue=idMatch?.[1].replace(/['"\s]/g,'');
   const record=idValue!=null&&typeof transacoes!=='undefined'?transacoes.find(r=>String(r.id)===idValue):null;
   fields.forEach((field,index)=>{if(!field)return;const cell=row.children[index];if(!cell)return;
    const value=record?record[field]??'':cell.textContent.trim();if(!record&&value==='—')return;annotate(cell,field,value);
   });
  }
 }
 function mobile(){
  if(typeof transacoes==='undefined')return;
  const records=new Map(transacoes.map(r=>[String(r.id),r]));
  for(const item of document.querySelectorAll('#pm-list .item[data-id]')){
   const r=records.get(item.dataset.id);if(!r)continue;
   annotate(item.querySelector('.row>div:first-child>b'),'descricao',r.descricao??'');
   const small=item.querySelector('.row>div:first-child>small');
   if(small&&!small.querySelector('[data-pf-dynamic-field]')){
    const category=document.createElement('span'),subitem=document.createElement('span');category.textContent=r.categoria||'Sem rubrica';subitem.textContent=r.subItem||'Sem subitem';
    small.replaceChildren(category,document.createTextNode(' · '),subitem);annotate(category,'categoria',r.categoria||'');annotate(subitem,'subItem',r.subItem||'');
   }
   const detail=item.querySelector('.detail');if(!detail||detail.querySelector('.pf-dynamic-shortcuts'))continue;
   const shortcuts=document.createElement('div');shortcuts.className='pf-dynamic-shortcuts';
   for(const field of ['categoria','subItem','descricao']){const b=document.createElement('button');b.type='button';b.dataset.pfDynamicField=field;b.dataset.pfDynamicValue=String(r[field]??'');b.textContent='Filtrar '+labels[field];shortcuts.append(b);}
   detail.append(shortcuts);
  }
 }
 function notices(){
  for(const host of [$('tabelaLancamentosWrapper'),$('modalGraficos')?.querySelector('.graficos-controles')]){
   if(!host||host.querySelector(':scope>.pf-dynamic-notice'))continue;
   const scope=scopeFor(host),box=document.createElement('div');box.className='pf-quick-cards-notice pf-dynamic-notice';box.dataset.pfQuickScope=scope;box.hidden=!api()?.status(scope).active;box.setAttribute('role','status');
   const text=document.createElement('span'),b=document.createElement('button');b.type='button';b.textContent='Limpar filtro';b.onclick=()=>api()?.clear(scope);box.append(text,b);host.prepend(box);
  }
 }
 function decorate(){
  if(!api())return;notices();
  table('tabelaCorpo',[null,null,null,'categoria','subItem','descricao']);
  table('pfDrilldown',[null,null,'categoria','descricao']);
  table('tabelaPrevisao30',[null,'descricao']);
  document.querySelectorAll('.pfce-detail tbody').forEach((body,index)=>{if(!body.id)body.id='pf-dynamic-chart-rows-'+index;table(body.id,[null,null,'categoria','descricao']);});
  mobile();
  for(const summary of document.querySelectorAll('#clean-month-analysis details.analysis-rubric>summary')){summary.dataset.pfDynamicField='categoria';summary.dataset.pfDynamicValue=summary.parentElement.dataset.rubric;summary.classList.add('pf-dynamic-item');summary.title='Abrir descrições e filtrar esta rubrica. Use Limpar filtro para retornar.';}
  for(const box of document.querySelectorAll('.pf-dynamic-notice')){const state=api().status(box.dataset.pfQuickScope||'page');box.hidden=!state.active;const text=box.querySelector('span'),value=state.focus?.label||'cartão selecionado';const next='Filtro rápido: '+value+'.';if(text.textContent!==next)text.textContent=next;}
 }
 function activate(event){
  const node=event.target.closest('[data-pf-dynamic-field]');if(!node)return;
  if(event.target.closest('input,select,textarea,a,[contenteditable=true]'))return;
  if(node.matches('summary')){
   if(event.type!=='click')return;
   event.preventDefault();event.stopImmediatePropagation();
   const branch=node.parentElement;branch.open=!branch.open;
   // Save the tree state before the quick filter replaces the rendered bars.
   // Native toggle events are queued, so relying on their timing loses expansion.
   branch.dispatchEvent(new Event('toggle'));
   api()?.field(node.dataset.pfDynamicField,node.dataset.pfDynamicValue,scopeFor(node));schedule();return;
  }
  event.preventDefault();event.stopImmediatePropagation();api()?.field(node.dataset.pfDynamicField,node.dataset.pfDynamicValue,scopeFor(node));schedule();
 }
 let pending=false;
 function schedule(){if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;decorate();});}
 function install(){
  decorate();document.addEventListener('click',activate,true);document.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.matches('[data-pf-dynamic-field]'))activate(e);},true);
  document.addEventListener('pf-item-focus',e=>{if(Object.hasOwn(labels,e.detail?.field||'')){api()?.field(e.detail.field,e.detail.value,e.detail.scope||'page');schedule();}});
  new MutationObserver(records=>{if(records.some(r=>[...r.addedNodes,...r.removedNodes].some(n=>n.nodeType===1&&!n.matches('.pf-dynamic-shortcuts,.pf-dynamic-notice')&&!n.closest?.('.pf-dynamic-shortcuts,.pf-dynamic-notice'))))schedule();}).observe(document.body,{childList:true,subtree:true});
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
