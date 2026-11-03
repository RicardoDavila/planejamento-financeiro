/* Layout aprovado: apenas apresentação; autenticação e banco continuam originais. */
(() => {
 'use strict';
 const $=id=>document.getElementById(id);
 let popup=null,channel='',last='',button,ready=false,queued=false,firstOpen=false;
 const mobile=()=>document.body.classList.contains('pf-mobile-layout');
 function positionCloudButton(){
  if(mobile())return;
  const badge=$('statusNuvemBadge'),cloud=badge?.closest('button'),actions=$('clean-top-actions');
  if(!cloud||!actions)return;
  cloud.id='pf-cloud-status';actions.append(cloud);
  const update=()=>cloud.classList.toggle('pf-cloud-online',badge.textContent.trim()==='Online');
  new MutationObserver(update).observe(badge,{childList:true,characterData:true,subtree:true});update();
 }
 function authorized(){
  try{if(window.pfdAssert)window.pfdAssert();return typeof protecaoAutenticada!=='undefined'&&protecaoAutenticada&&!document.body.classList.contains('auth-pendente');}catch{return false}
 }
 function locked(){return !authorized()||(mobile()?$('dashboardMobileV40')?.classList.contains('pf-resumo-oculto'):$('painelGerencial')?.classList.contains('pf-painel-oculto'))}
 function snapshot(){
  const hidden=Boolean(locked()),D=window.PFChartExplorer.data;
  const all=hidden?[]:window.PFQuickCards?window.PFQuickCards.apply(transacoes):transacoes;
  return {locked:hidden,dark:document.body.classList.contains('dark-mode'),
   rows:hidden?[]:D.rows(getFilteredTransactions()),allRows:hidden?[]:D.rows(all),
   chosen:$('filtroDataFim')?.value||new Date().toISOString().slice(0,10),
   font:getComputedStyle(document.body).fontFamily};
 }
 function send(){
  if(!popup||popup.closed||!ready)return;
  if(!authorized()){join();return}
  const state=snapshot(),serialized=JSON.stringify(state);if(serialized===last)return;
  last=serialized;popup.postMessage({type:'pf-chart-state',channel,state},location.origin==='null'?'*':location.origin);
 }
 function join(){
  if(popup&&!popup.closed)popup.close();popup=null;ready=false;last='';channel='';
  document.body.classList.remove('layout-charts-detached');
  if(button){button.textContent='Dois monitores';button.setAttribute('aria-pressed','false');button.title='Abrir os gráficos em uma janela para o segundo monitor'}
  window.dispatchEvent(new Event('resize'));
 }
 function split(){
  if(popup&&!popup.closed){join();return}
  if(!authorized())return;
  channel=crypto.randomUUID();
  popup=window.open('graficos.html?canal='+encodeURIComponent(channel),'pf-graficos-'+channel,'popup,width=1100,height=850,resizable=yes,scrollbars=yes');
  if(!popup){channel='';alert('O navegador bloqueou a janela dos gráficos. Permita pop-ups deste aplicativo e tente novamente.');return}
  document.body.classList.add('layout-charts-detached');button.textContent='Reunir colunas';button.setAttribute('aria-pressed','true');
  button.title='Reunir dados e gráficos em um único monitor';window.dispatchEvent(new Event('resize'));
 }
 function mobileRefresh(){
  if(!mobile())return;const content=$('clean-analysis-content'),placeholder=$('layout-mobile-chart-placeholder');if(!content||!placeholder)return;
  const hidden=Boolean(locked());content.hidden=hidden;placeholder.hidden=!hidden;
  $('layout-mobile-chart-show').hidden=!hidden;
  $('clean-analysis-toggle').setAttribute('aria-expanded',String(!hidden));
  $('layout-mobile-chart-status').textContent=hidden?'Os gráficos acompanham a proteção dos valores. Toque em Mostrar para visualizar.':'Receitas e despesas por evolução e rubrica, conforme os filtros selecionados.';
  if(!hidden)window.PFChartExplorer?.schedule();
 }
 function refresh(){
  if(mobile()){mobileRefresh();if(popup)join()}
  else {
   const theme=$('reference-theme'),label=document.body.classList.contains('dark-mode')?'☀ Claro':'◐ Escuro';
   if(theme&&theme.textContent!==label)theme.textContent=label;
   if(!firstOpen&&!locked()&&$('clean-analysis-content')?.hidden){firstOpen=true;$('clean-analysis-toggle').click()}
  }
  if(!authorized()&&popup)join();else send();
 }
 function schedule(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;refresh()})}
 function install(){
  const analysis=$('clean-month-analysis'),panel=$('painelGerencial');if(!analysis||!panel)return;
  document.body.classList.add('layout-proposal');
  if(mobile()){
   const main=$('pm-app');if(!main)return;main.append(analysis);analysis.classList.add('layout-mobile-charts');
   const header=document.createElement('div');header.id='layout-mobile-chart-header';
   const title=document.createElement('h2');title.textContent='Gráficos do período';
   const status=document.createElement('p');status.id='layout-mobile-chart-status';
   const show=document.createElement('button');show.id='layout-mobile-chart-show';show.type='button';show.textContent='Mostrar gráficos';show.onclick=()=>$('pm-toggleValues')?.click();
   header.append(title,status,show);analysis.prepend(header);
   const placeholder=document.createElement('div');placeholder.id='layout-mobile-chart-placeholder';placeholder.className='analysis-grid';
   placeholder.innerHTML=['Evolução das Receitas','Evolução das Despesas','Receitas por Rubrica','Despesas por Rubrica'].map(label=>'<section><h3>'+label+'</h3><p>Valores protegidos · R$ ••••</p></section>').join('');
   $('clean-analysis-content').before(placeholder);
  }else{
   const period=$('clean-periodbar'),table=$('tabelaLancamentosWrapper').parentElement;
   const workspace=document.createElement('div');workspace.id='layout-workspace';
   const left=document.createElement('div');left.id='layout-left';const right=document.createElement('div');right.id='layout-right';
   right.tabIndex=0;right.setAttribute('role','region');right.setAttribute('aria-label','Gráficos financeiros com rolagem independente');
   period.before(workspace);workspace.append(left,right);left.append(period,panel,table);right.append(analysis);
   const top=$('pfMenuTopo'),greeting=$('pf495Greeting');
   if(top&&greeting)top.insertBefore(greeting,top.querySelector('.pf-menu-categoria')||$('clean-top-actions'));
   button=document.createElement('button');button.id='pf-dois-monitores';button.type='button';button.textContent='Dois monitores';button.setAttribute('aria-pressed','false');button.title='Abrir os gráficos em uma janela para o segundo monitor';button.onclick=split;
   $('clean-top-actions').append(button);
   positionCloudButton();
   const size=()=>document.documentElement.style.setProperty('--pf-layout-top',top.getBoundingClientRect().height+'px');
   if(window.ResizeObserver)new ResizeObserver(size).observe(top);size();
  }
  const render=window.renderTable;window.renderTable=function(...args){const result=render.apply(this,args);schedule();return result};
  for(const target of [document.body,panel,$('dashboardMobileV40')].filter(Boolean))new MutationObserver(schedule).observe(target,{attributes:true,attributeFilter:['class']});
  window.addEventListener('message',event=>{
   if(!popup||event.source!==popup||event.origin!==location.origin||event.data?.channel!==channel)return;
   if(event.data.type==='pf-chart-ready'){ready=true;last='';send()}
   if(event.data.type==='pf-chart-join')join();
  });
  setInterval(()=>{if(popup?.closed)join();else send()},700);
  window.addEventListener('pagehide',join);window.addEventListener('beforeunload',join);
  refresh();
  matchMedia('(max-width:900px), (pointer:coarse)').addEventListener('change',()=>location.reload());
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
