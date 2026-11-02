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
   case 'grafReceitas':return row.tipo==='Receita';
   case 'grafRecebidas':return row.tipo==='Receita'&&!['Não Recebido','A Vencer','Pendente','Vencido'].includes(row.status);
   case 'grafDespesas':case 'grafComprometimento':return row.tipo==='Despesa';
   case 'grafVencidas':return row.tipo==='Despesa'&&row.status==='Vencido';
   case 'grafSaldo':case 'grafPoupanca':return row.tipo==='Receita'||row.tipo==='Despesa';
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
 let active='',selected='',saved=null,originalGet,focus=null,currentScope='page';
 const banks={};
 const empty=()=>({active:'',selected:'',saved:null,focus:null});
 const stateFor=scope=>scope===currentScope?{active,selected,saved,focus}:banks[scope]||empty();
 function inScope(scope,fn){
  scope=scope==='charts'?'charts':'page';if(scope===currentScope)return fn();
  const previous=currentScope;banks[previous]={active,selected,saved,focus};({active,selected,saved,focus}=banks[scope]||empty());currentScope=scope;
  try{return fn();}finally{banks[scope]={active,selected,saved,focus};({active,selected,saved,focus}=banks[previous]);currentScope=previous;}
 }
 function resetScope(scope){inScope(scope,()=>{active='';selected='';saved=null;focus=null;});}
 const labels={receitas:'Receitas',recebido:'Recebido',despesas:'Despesas',vencer:'A vencer',vencido:'Vencido',saldo:'Saldo previsto',investimentos:'Investimentos',situacao:'Situação'};
 Object.assign(labels,{grafReceitas:'Receitas previstas',grafRecebidas:'Receitas recebidas',grafDespesas:'Despesas previstas',grafVencidas:'Despesas vencidas',grafSaldo:'Saldo previsto',grafPoupanca:'Taxa de poupança prevista',grafComprometimento:'Comprometimento',recebidoMobile:'Recebido',vencidoMobile:'Vencidas',vencerMobile:'A vencer'});
 const ids=['filtroTipo','filtroRubrica','filtroSubItem','filtroBuscaRubrica','filtroBuscaSubItem','filtroDescricao','filtroDataInicio','filtroDataFim'];
 const chartIds=['graficoTipo','graficoRubrica','graficoSubItem','graficoDescricao','graficoDataInicio','graficoDataFim','graficoStatusAvancado','graficoValorMin','graficoValorMax'];
 const $=id=>document.getElementById(id);
 const fields={categoria:'Rubrica',subItem:'Subitem',descricao:'Descrição'};
 const api={matches,apply(rows,scope='page'){return inScope(scope,()=>focus?rows.filter(r=>String(r[focus.field]??'')===focus.value):active?rows.filter(r=>matches(r,active)):rows);}, get active(){return api.status('page').active;},get focus(){return api.status('page').focus;},status(scope='page'){const state=stateFor(scope);return {active:state.focus?'item':state.active,focus:state.focus?{...state.focus}:null};},select:choose,clear(scope='page'){inScope(scope,()=>{restore();refresh();});},field(field,value,scope='page'){return inScope(scope,()=>{
  if(!allowed()||!Object.hasOwn(fields,field)||value==null)return;
  const next={field,value:String(value),label:fields[field]+': '+(String(value)||'(vazio)')};
  if(focus?.field===field&&focus.value===next.value){restore();refresh();return;}
  if(!saved)saved=snapshot();active='';selected='';focus=next;refresh();
 });}};
 window.PFQuickCards=api;
 function allowed(){return !document.body.classList.contains('auth-pendente')&&(typeof protecaoAutenticada==='undefined'||protecaoAutenticada!==false);}
 function snapshot(){return {values:Object.fromEntries((currentScope==='charts'?chartIds:ids).map(id=>[id,$(id)?.value])),special:typeof filtroRapidoEspecial!=='undefined'?filtroRapidoEspecial:'',user:typeof filtrosPainelAtivadosPeloUsuario!=='undefined'?filtrosPainelAtivadosPeloUsuario:false};}
 function restore(){
  if(saved){for(const [id,value]of Object.entries(saved.values))if($(id)&&value!==undefined)$(id).value=value;
   if(currentScope==='page'&&typeof filtroRapidoEspecial!=='undefined')filtroRapidoEspecial=saved.special;
   if(currentScope==='page'&&typeof filtrosPainelAtivadosPeloUsuario!=='undefined')filtrosPainelAtivadosPeloUsuario=saved.user;
  }
  active='';selected='';saved=null;focus=null;
 }
 function refresh(){if(currentScope==='charts'){
  if(typeof abaAtivaGrafico!=='undefined'&&abaAtivaGrafico==='totalReceitasDespesas'&&window.compararTotalReceitasDespesas)window.compararTotalReceitasDespesas();
  else if(typeof comparacaoRubricaMesAtiva!=='undefined'&&comparacaoRubricaMesAtiva&&window.compararRubricaMesAnteriorAtual)window.compararRubricaMesAnteriorAtual();
  else window.atualizarGraficos?.();
 }else window.renderTable?.();sync();}
 function choose(key,scope='page'){return inScope(scope,()=>{
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
 });}
 function sync(){
  document.querySelectorAll('[data-pf-quick-card]').forEach(card=>card.setAttribute('aria-pressed',String(stateFor(card.dataset.pfQuickScope||'page').selected===card.dataset.pfQuickCard)));
  document.querySelectorAll('.pf-quick-cards-notice').forEach(box=>{
   const state=stateFor(box.dataset.pfQuickScope||'page');box.hidden=(!state.active&&!state.focus)||!allowed();const text=box.querySelector('span');
   const message='Filtro rápido: '+(state.focus?.label||labels[state.selected]||'')+(state.selected==='situacao'?' — '+(state.active==='saldo'?'todos os lançamentos':labels[state.active]):'')+'. Aplicado ao período e aos demais filtros desta tela.';
   if(text.textContent!==message)text.textContent=message;
  });
 }
 function mount(){
  originalGet=window.getFilteredTransactions;if(typeof originalGet!=='function')return;
  window.getFilteredTransactions=function(...args){const rows=originalGet.apply(this,args);return api.apply(rows);};
  const cards={kpiGrafReceitas:'grafReceitas',kpiGrafRecebidas:'grafRecebidas',kpiGrafDespesas:'grafDespesas',kpiGrafSaldo:'grafSaldo',kpiGrafVencidas:'grafVencidas',kpiGrafPoupanca:'grafPoupanca',kpiGrafComprometimento:'grafComprometimento',pgReceitas:'receitas',pgRecebido:'recebido',pgDespesas:'despesas',pgAVencer:'vencer',pgVencido:'vencido',pgSaldo:'saldo',pgInvestimentos:'investimentos',pgSituacao:'situacao',d40Receitas:'receitas',d40Recebido:'recebido',d40Despesas:'despesas',d40Vencer:'vencer',d40Vencido:'vencido',d40Saldo:'saldo','pm-kRec':'receitas','pm-kReceived':'recebidoMobile','pm-kDes':'despesas','pm-kVen':'vencerMobile','pm-kOverdue':'vencidoMobile','pm-kInv':'investimentos','pm-kSaldo':'saldo'};
  for(const [id,key]of Object.entries(cards)){
   const card=$(id)?.parentElement;if(!card)continue;
   const scope=id.startsWith('kpiGraf')?'charts':'page';card.dataset.pfQuickScope=scope;card.dataset.pfQuickCard=key;card.setAttribute('role','button');card.tabIndex=0;card.setAttribute('aria-pressed','false');card.title='Filtrar por '+labels[key]+'. Clique novamente para limpar o filtro.';
   card.addEventListener('click',()=>choose(key,scope));card.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();choose(key,scope);}});
  }
  for(const grid of [$('painelResumoGerencial'),$('pfResumoMobileValores'),$('pm-kRec')?.parentElement?.parentElement,$('painelExecutivoGraficos')]){
   if(!grid)continue;const box=document.createElement('div');box.className='pf-quick-cards-notice';box.hidden=true;box.setAttribute('role','status');
   const scope=grid.id==='painelExecutivoGraficos'?'charts':'page';box.dataset.pfQuickScope=scope;
   const text=document.createElement('span'),button=document.createElement('button');button.type='button';button.textContent='Limpar filtro';button.addEventListener('click',()=>api.clear(scope));box.append(text,button);grid.before(box);
  }
  const clear=window.limparFiltros;if(typeof clear==='function')window.limparFiltros=function(...args){active='';selected='';saved=null;focus=null;const result=clear.apply(this,args);sync();return result;};
  const open=window.openGraficosModal;if(typeof open==='function')window.openGraficosModal=function(...args){resetScope('charts');for(const id of ['graficoDescricao','graficoValorMin','graficoValorMax'])if($(id))$(id).value='';if($('graficoStatusAvancado'))$('graficoStatusAvancado').value='Todos';const result=open.apply(this,args);sync();return result;};
  const clearCharts=window.limparFiltrosGraficos;if(typeof clearCharts==='function')window.limparFiltrosGraficos=function(...args){resetScope('charts');const result=clearCharts.apply(this,args);sync();return result;};
  const render=window.renderTable;if(typeof render==='function')window.renderTable=function(...args){const result=render.apply(this,args);sync();return result;};
  new MutationObserver(()=>{if(!allowed()){inScope('page',restore);inScope('charts',restore);sync();window.PFChartExplorer?.refresh?.();}}).observe(document.body,{attributes:true,attributeFilter:['class']});
  sync();
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();
