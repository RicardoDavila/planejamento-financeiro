(() => {
 'use strict';
 const bar=document.getElementById('pfIndicadores');
 const restore=document.getElementById('pfMostrarIndicadores');
 if(!bar||!restore)return;
 const root=document.documentElement;
 function layoutMarket(){
  if(!document.body.classList.contains('pf-mobile-layout'))return;
  const total=document.querySelector('#pfMobileShell .total');
  const nav=document.querySelector('#pfMobileShell .nav');
  const control=[total,nav].find(el=>el&&getComputedStyle(el).display!=='none'&&el.getBoundingClientRect().height>0);
  const bottom=control?Math.max(0,Math.ceil(innerHeight-control.getBoundingClientRect().top)):104;
  root.style.setProperty('--pf-market-bottom',bottom+'px');
  root.style.setProperty('--pf-market-space',(!bar.hidden||!restore.hidden)?'44px':'0px');
 }
 const viewport=document.getElementById('pfIndViewport');
 if(viewport)viewport.setAttribute('aria-label','Indicadores econômicos. Use Pausar para interromper o movimento e ler os valores e as datas de referência.');
 window.addEventListener('resize',layoutMarket);
 window.addEventListener('orientationchange',layoutMarket);
 window.visualViewport?.addEventListener('resize',layoutMarket);
 if(window.ResizeObserver){
  const resize=new ResizeObserver(layoutMarket);
  for(const el of document.querySelectorAll('#pfMobileShell .total,#pfMobileShell .nav'))resize.observe(el);
 }
 const observer=new MutationObserver(layoutMarket);
 observer.observe(document.body,{attributes:true,attributeFilter:['class']});
 observer.observe(bar,{attributes:true,attributeFilter:['hidden']});
 observer.observe(restore,{attributes:true,attributeFilter:['hidden']});
 layoutMarket();
})();
