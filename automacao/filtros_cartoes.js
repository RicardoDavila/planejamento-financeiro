(() => {
 'use strict';
 function matches(row,key){
  const norm=value=>String(value??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const paid=()=>Boolean(row.dataPg)||['pago','recebido','paga','recebida','liquidado','feito'].includes(norm(row.status));
  const late=()=>{const d=new Date(),today=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');return row.tipo==='Despesa'&&!paid()&&row.vencimento&&row.vencimento<today;};
  switch(key){
   case 'recebidoMobile':return row.tipo==='Receita'&&paid();
   case 'vencidoMobile':return Boolean(late());
   case 'vencerMobile':return row.tipo==='Despesa'&&!paid()&&!late();
   case 'receitas':return row.tipo==='Receita';
   case 'recebido':return row.tipo==='Receita'&&row.status!=='Não Recebido';
   case 'despesas':return row.tipo==='Despesa';
   case 'vencer':return row.status==='A Vencer';
   case 'vencido':return row.status==='Vencido';
   case 'investimentos':return row.tipo==='Investimentos'||row.categoria==='INVESTIMENTOS';
   case 'saldo':return ['Receita','Despesa','Investimentos'].includes(row.tipo)||row.categoria==='INVESTIMENTOS';
   default:return true;
  }
 }
 let active='',selected='',saved=null,originalGet,focus=null;
 const labels={receitas:'Receitas',recebido:'Recebido',despesas:'Despesas',vencer:'A vencer',vencido:'Vencido',saldo:'Saldo previsto',investimentos:'Investimentos',situacao:'Situação'};
 Object.assign(labels,{recebidoMobile:'Recebido',vencidoMobile:'Vencidas',vencerMobile:'A vencer'});
 const ids=['filtroTipo','filtroRubrica','filtroSubItem','filtroBuscaRubrica','filtroBuscaSubItem','filtroDescricao','filtroDataInicio','filtroDataFim'];
 const $=id=>document.getElementById(id);
 const fields={categoria:'Rubrica',subItem:'Subitem',descricao:'Descrição'};
 const api={matches,apply:rows=>focus?rows.filter(r=>String(r[focus.field]??'')===focus.value):active?rows.filter(r=>matches(r,active)):rows, get active(){return focus?'item':active;},get focus(){return focus?{...focus}:null;},select:choose,clear(){restore();refresh();},field(field,value){
  if(!allowed()||!Object.hasOwn(fields,field)||value==null)return;
  const next={field,value:String(value),label:fields[field]+': '+(String(value)||'(vazio)')};
  if(focus?.field===field&&focus.value===next.value){restore();refresh();return;}
  if(!saved)saved=snapshot();active='';selected='';focus=next;refresh();
 }};
 window.PFQuickCards=api;
 function allowed(){return !document.body.classList.contains('auth-pendente')&&(typeof protecaoAutenticada==='undefined'||protecaoAutenticada!==false);}
 function snapshot(){return {values:Object.fromEntries(ids.map(id=>[id,$(id)?.value])),special:typeof filtroRapidoEspecial!=='undefined'?filtroRapidoEspecial:'',user:typeof filtrosPainelAtivadosPeloUsuario!=='undefined'?filtrosPainelAtivadosPeloUsuario:false};}
 function restore(){
  if(saved){for(const [id,value]of Object.entries(saved.values))if($(id)&&value!==undefined)$(id).value=value;
   if(typeof filtroRapidoEspecial!=='undefined')filtroRapidoEspecial=saved.special;
   if(typeof filtrosPainelAtivadosPeloUsuario!=='undefined')filtrosPainelAtivadosPeloUsuario=saved.user;
  }
  active='';selected='';saved=null;focus=null;
 }
 function refresh(){window.renderTable?.();const modal=$('modalGraficos');if(modal&&!modal.classList.contains('hidden')&&getComputedStyle(modal).display!=='none')window.atualizarGraficos?.();sync();}
 function choose(key){
  if(!allowed())return;
  if(selected===key){restore();refresh();return;}
  if(!saved)saved=snapshot();
  selected=key;active=key;focus=null;
  if(key==='situacao'){
   const rows=originalGet();
   const total=status=>rows.filter(r=>r.status===status).reduce((sum,r)=>sum+(Number(r.valor)||0),0);
   active=total('Vencido')>0?'vencido':total('A Vencer')>0?'vencer':'saldo';
  }
  refresh();
 }
 function sync(){
  document.querySelectorAll('[data-pf-quick-card]').forEach(card=>card.setAttribute('aria-pressed',String(selected===card.dataset.pfQuickCard)));
  document.querySelectorAll('.pf-quick-cards-notice').forEach(box=>{
   box.hidden=(!active&&!focus)||!allowed();const text=box.querySelector('span');
   const message='Filtro rápido: '+(focus?.label||labels[selected]||'')+(selected==='situacao'?' — '+(active==='saldo'?'todos os lançamentos':labels[active]):'')+'. Aplicado ao período e aos demais filtros atuais.';
   if(text.textContent!==message)text.textContent=message;
  });
 }
 function mount(){
  originalGet=window.getFilteredTransactions;if(typeof originalGet!=='function')return;
  window.getFilteredTransactions=function(...args){const rows=originalGet.apply(this,args);return api.apply(rows);};
  const cards={pgReceitas:'receitas',pgRecebido:'recebido',pgDespesas:'despesas',pgAVencer:'vencer',pgVencido:'vencido',pgSaldo:'saldo',pgInvestimentos:'investimentos',pgSituacao:'situacao',d40Receitas:'receitas',d40Recebido:'recebido',d40Despesas:'despesas',d40Vencer:'vencer',d40Vencido:'vencido',d40Saldo:'saldo','pm-kRec':'receitas','pm-kReceived':'recebidoMobile','pm-kDes':'despesas','pm-kVen':'vencerMobile','pm-kOverdue':'vencidoMobile','pm-kInv':'investimentos','pm-kSaldo':'saldo'};
  for(const [id,key]of Object.entries(cards)){
   const card=$(id)?.parentElement;if(!card)continue;
   card.dataset.pfQuickCard=key;card.setAttribute('role','button');card.tabIndex=0;card.setAttribute('aria-pressed','false');card.title='Filtrar por '+labels[key]+'. Clique novamente para limpar o filtro.';
   card.addEventListener('click',()=>choose(key));card.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();choose(key);}});
  }
  for(const grid of [$('painelResumoGerencial'),$('pfResumoMobileValores'),$('pm-kRec')?.parentElement?.parentElement]){
   if(!grid)continue;const box=document.createElement('div');box.className='pf-quick-cards-notice';box.hidden=true;box.setAttribute('role','status');
   const text=document.createElement('span'),button=document.createElement('button');button.type='button';button.textContent='Limpar filtro';button.addEventListener('click',()=>{restore();refresh();});box.append(text,button);grid.before(box);
  }
  const clear=window.limparFiltros;if(typeof clear==='function')window.limparFiltros=function(...args){active='';selected='';saved=null;focus=null;const result=clear.apply(this,args);sync();return result;};
  const render=window.renderTable;if(typeof render==='function')window.renderTable=function(...args){const result=render.apply(this,args);sync();return result;};
  new MutationObserver(()=>{if(!allowed()&&(active||focus)){restore();sync();window.PFChartExplorer?.refresh?.();}}).observe(document.body,{attributes:true,attributeFilter:['class']});
  sync();
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();
