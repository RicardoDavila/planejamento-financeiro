/* Conversão exclusivamente visual. Os registros e cálculos permanecem em BRL. */
(() => {
'use strict';
function bootCurrency(options={}){
 if(window.PFCurrency)return window.PFCurrency;
 const codes=['BRL','USD','EUR'], originals=new WeakMap(), key='pf:currency:v1',cacheKey='pf:ptax:v1';
 let selected=options.snapshot?.currency||'BRL',quotes={},store,observer,scheduled=false,button,menu,busy=false,problem='',sequence=0;
 const valid=(q,c)=>!!q&&q.currency===c&&q.provider==='BCB PTAX'&&Number.isFinite(q.brlPerUnit)&&q.brlPerUnit>0&&/^\d{4}-\d\d-\d\d[ T]\d\d:\d\d/.test(q.sourceTimestamp)&&Number.isFinite(Date.parse(q.fetchedAt));
 if(!options.snapshot)try{store=window.pfdLocal||window.localStorage;const c=store.getItem(key);if(codes.includes(c))selected=c;const saved=JSON.parse(store.getItem(cacheKey)||'{}');for(const c of codes)if(valid(saved[c],c))quotes[c]=saved[c];}catch(_){}
 if(options.snapshot?.quote)quotes[selected]=options.snapshot.quote;
 const locale=()=>({en:'en-US',es:'es-ES'}[window.PFI18n?.getLanguage?.()]||options.locale||'pt-BR');
 const snapshot=()=>{const q=quotes[selected];return {currency:selected,quote:selected==='BRL'?null:valid(q,selected)?{...q}:null,createdAt:new Date().toISOString()};};
 function value(brl,context=snapshot()){if(context.currency==='BRL')return brl;if(!valid(context.quote,context.currency))throw Error('Cotação indisponível.');return brl/context.quote.brlPerUnit;}
 function format(brl,context=snapshot()){const currency=context.currency==='BRL'||valid(context.quote,context.currency)?context.currency:'BRL';return new Intl.NumberFormat(locale(),{style:'currency',currency}).format(currency==='BRL'?brl:value(brl,context));}
 function originalText(node){if(!node)return '';if(node.nodeType===3){const p=originals.get(node);if(p&&node.nodeValue===p.last)return p.source;const saved=node.parentElement?.getAttribute('data-pf-currency-brl');return saved&&node.parentElement.childNodes.length===1&&!/R\$/.test(node.nodeValue)?saved:node.nodeValue;}return [...node.childNodes].map(originalText).join('');}
 function note(context=snapshot()){
  if(context.currency==='BRL')return 'Moeda-base: BRL (R$). Valores originais, sem conversão.';
  if(!valid(context.quote,context.currency))return 'Cotação indisponível: valores exibidos em BRL (R$).';
  const q=context.quote;return 'Consulta em '+context.currency+' · Base: BRL (R$) · 1 '+context.currency+' = R$ '+q.brlPerUnit.toLocaleString('pt-BR',{minimumFractionDigits:4,maximumFractionDigits:6})+' · BCB PTAX, venda/fechamento: '+q.sourceTimestamp+' (Brasília) · Consulta: '+new Date(q.fetchedAt).toLocaleString(locale())+'.';
 }
 function eligible(parent){
  if(parent.closest('input,textarea,select,button,script,style,[contenteditable],#pfCurrencyMenu,#pfCurrencyButton,[data-pf-currency-note]'))return false;
  if(options.snapshot)return !parent.closest('[data-pf-report-controls]');
  return !!parent.closest('#cardPrevReceita,#cardRecRecebidas,#cardDespesas,#cardPendente,#cardInvestimento,#cardSaldo,.g-metric .number,.analysis-amount,.pf-heat-value,.pf-bar-row strong,.pfce-alt,.g-chart,.chart,.lcm-value,.lcm-valor,.dashboard-v40-grid,#dashboardV40Alerta,#tabelaLancamentosWrapper td.text-right,#desktopGraphics .num');
 }
 function apply(){
  observer?.disconnect();
  const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let n;
  while(n=walker.nextNode()){
   if(!eligible(n.parentElement))continue;
   const p=originals.get(n),source=p&&n.nodeValue===p.last?p.source:originalText(n);
   // Only complete currency labels: never descriptions, quantities, dates or inputs.
   if(!/^\s*-?\s*R\$\s*-?\s*\d[\d.]*,\d{2}\s*$/.test(source))continue;
   const brl=Number(source.replace(/[^\d,-]/g,'').replace(',','.'));if(!Number.isFinite(brl))continue;
   const last=selected==='BRL'?source:format(brl);if(n.nodeValue!==last)n.nodeValue=last;
   originals.set(n,{source,last});if(n.parentElement.childNodes.length===1)n.parentElement.setAttribute('data-pf-currency-brl',source);n.parentElement.setAttribute('data-pfce-ui','true');
  }
  if(button)button.textContent=({en:'Currency',es:'Moneda'}[window.PFI18n?.getLanguage?.()]||'Moeda')+' '+selected+' ▾';
  const status=document.getElementById('pfCurrencyStatus');if(status)status.textContent=(busy?'Consultando Banco Central… ':problem?problem+' ':'')+note();
  observer?.observe(document.body,{subtree:true,childList:true,characterData:true});
 }
 function updateCharts(){if(typeof Chart!=='undefined')for(const chart of Object.values(Chart.instances||{}))chart.update('none');}
 const schedule=()=>{if(!scheduled){scheduled=true;requestAnimationFrame(()=>{scheduled=false;apply();place();});}};
 function place(){if(!button)return;const host=document.body.classList.contains('pf-mobile-layout')?document.querySelector('#pm-app .bar'):document.getElementById('pfMenuTopo');if(host&&button.parentElement!==host)host.append(button);}
 function close(){if(menu)menu.hidden=true;button?.setAttribute('aria-expanded','false');}
 function addMenu(){
  button=document.createElement('button');button.id='pfCurrencyButton';button.setAttribute('data-pf-i18n-skip','');button.setAttribute('data-pfce-ui','true');button.setAttribute('aria-controls','pfCurrencyMenu');button.type='button';button.className='pf-menu-categoria';button.setAttribute('aria-haspopup','menu');button.setAttribute('aria-expanded','false');
  menu=document.createElement('div');menu.id='pfCurrencyMenu';menu.setAttribute('data-pf-i18n-skip','');menu.setAttribute('data-pfce-ui','true');menu.hidden=true;menu.setAttribute('role','menu');menu.style.cssText='position:fixed;z-index:2200;width:310px;max-width:calc(100vw - 16px);max-height:70vh;overflow:auto;padding:10px;border:1px solid #94a3b8;border-radius:10px;box-shadow:0 10px 28px #0003;background:white;color:#243247';
  codes.forEach(c=>{const b=document.createElement('button');b.type='button';b.textContent=({BRL:'Real brasileiro (BRL — R$)',USD:'US Dollar (USD — US$)',EUR:'Euro (EUR — €)'})[c];b.setAttribute('role','menuitemradio');b.dataset.currency=c;b.style.cssText='display:block;width:100%;padding:12px;text-align:left;background:transparent;color:inherit;border:0;cursor:pointer';b.onclick=()=>{setCurrency(c);close();};menu.append(b);});
  const status=document.createElement('p');status.id='pfCurrencyStatus';status.style.cssText='font-size:12px;line-height:1.5;padding:8px';menu.append(status);
  const refresh=document.createElement('button');refresh.type='button';refresh.textContent='Atualizar cotação / Refresh / Actualizar';refresh.onclick=()=>load();menu.append(refresh);document.body.append(menu);const style=document.createElement('style');style.id='pf-global-currency-style';style.textContent='#pfCurrencyButton{display:inline-flex!important;align-items:center;white-space:nowrap;flex-shrink:0}#pfCurrencyMenu[hidden]{display:none!important}#pfCurrencyMenu button{min-height:44px;font:inherit}#pfCurrencyMenu button:focus-visible{outline:2px solid #818cf8}#pfCurrencyMenu button[aria-checked="true"]:after{content:" ✓"}@media print{#pfCurrencyMenu,#pfCurrencyButton{display:none!important}}';document.head.append(style);place();
  button.onclick=()=>{if(!menu.hidden){close();return;}const r=button.getBoundingClientRect(),sample=document.getElementById('desktop-dropdown');if(sample){const s=getComputedStyle(sample);menu.style.background=s.backgroundColor;menu.style.color=s.color;}
   menu.style.left=Math.max(8,Math.min(r.left,innerWidth-326))+'px';menu.style.top=(r.bottom+5)+'px';menu.hidden=false;button.setAttribute('aria-expanded','true');for(const b of menu.querySelectorAll('[data-currency]'))b.setAttribute('aria-checked',String(b.dataset.currency===selected));menu.querySelector('button').focus();};
  document.addEventListener('click',e=>{if(!menu.contains(e.target)&&!button.contains(e.target))close();});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!menu.hidden){close();button.focus();}if(!menu.hidden&&['ArrowDown','ArrowUp'].includes(e.key)){e.preventDefault();const items=[...menu.querySelectorAll('button')],i=items.indexOf(document.activeElement);items[(i+(e.key==='ArrowDown'?1:items.length-1))%items.length].focus();}});window.addEventListener('resize',close);
 }
 async function load(){
  if(selected==='BRL'||options.snapshot)return;const code=selected,run=++sequence;busy=true;problem='';apply();const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),18000);
  try{let quote;for(const days of [30,365]){const end=new Date(),start=new Date(end);start.setDate(start.getDate()-days);const date=d=>String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')+'-'+d.getFullYear();
   const url=new URL('https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/CotacaoMoedaPeriodo(moeda=@moeda,dataInicial=@dataInicial,dataFinalCotacao=@dataFinalCotacao)');url.search=new URLSearchParams({'@moeda':"'"+code+"'",'@dataInicial':"'"+date(start)+"'",'@dataFinalCotacao':"'"+date(end)+"'",'$select':'cotacaoVenda,dataHoraCotacao,tipoBoletim','$format':'json'});
   const response=await fetch(url,{signal:controller.signal,cache:'no-store',credentials:'omit',referrerPolicy:'no-referrer'});if(!response.ok)throw Error('BCB '+response.status);const data=await response.json();const row=(data.value||[]).filter(r=>r.tipoBoletim==='Fechamento'&&Number.isFinite(r.cotacaoVenda)&&r.cotacaoVenda>0&&/^\d{4}-\d\d-\d\d[ T]\d\d:\d\d/.test(r.dataHoraCotacao)).sort((a,b)=>b.dataHoraCotacao.localeCompare(a.dataHoraCotacao))[0];if(row){quote={currency:code,brlPerUnit:row.cotacaoVenda,sourceTimestamp:row.dataHoraCotacao,fetchedAt:new Date().toISOString(),provider:'BCB PTAX'};break;}}
   if(!valid(quote,code))throw Error('Sem fechamento PTAX.');if(run!==sequence)return;quotes[code]=quote;try{store?.setItem(cacheKey,JSON.stringify(quotes));}catch(_){}
  }catch(_){if(run===sequence)problem='Sem atualização. '+(valid(quotes[code],code)?'Usando a cotação salva, confira a data.':'Exibição em R$.');}
  finally{clearTimeout(timer);if(run===sequence){busy=false;updateCharts();apply();window.dispatchEvent(new Event('pf-currency-change'));}}
 }
 function setCurrency(c){if(!codes.includes(c)||options.snapshot)return;sequence++;busy=false;selected=c;updateCharts();window.dispatchEvent(new Event('pf-currency-change'));try{store?.setItem(key,c);}catch(_){}apply();if(c!=='BRL')load();}
 function requireSnapshot(){const s=snapshot();if(s.currency!=='BRL'&&!valid(s.quote,s.currency)){alert('Aguarde uma cotação válida ou selecione BRL antes de gerar o relatório.');throw Error('Cotação indisponível.');}return JSON.parse(JSON.stringify(s));}
 function decorate(html,s=requireSnapshot()){
  const code='('+bootCurrency.toString()+')('+JSON.stringify({snapshot:s,locale:locale()}).replace(/</g,'\\u003c')+');';return html.replace(/<\/body>/i,'<script>'+code+'<\/script></body>');
 }
 const api={installView:target=>{const s=requireSnapshot();if(target.PFCurrency)target.PFCurrency.setSnapshot(s);else target.eval('('+bootCurrency.toString()+')('+JSON.stringify({snapshot:s,locale:locale()})+')');},setSnapshot:s=>{if(!options.snapshot)return;options.snapshot=s;selected=s.currency;quotes={};if(s.quote)quotes[selected]=s.quote;const n=document.querySelector('[data-pf-currency-note]');if(n)n.textContent=note(s);apply();},getCurrency:()=>selected,snapshot:requireSnapshot,value,format,valid,originalText,setCurrency,refresh:load,decorate,note};window.PFCurrency=api;
 function install(){
  if(options.snapshot){const p=document.createElement('p');p.setAttribute('data-pf-currency-note','');p.textContent=note(options.snapshot);p.style.cssText='font:12px/1.5 system-ui;border-bottom:1px solid #cbd5e1;padding:8px 0;color:inherit';const header=document.querySelector('header');(header||document.body).append(p);}
  else addMenu();
  if(typeof Chart!=='undefined'&&Chart.register){const wrapped=new WeakSet();Chart.register({id:'pfCurrencyLabels',beforeUpdate(chart){const convert=text=>typeof text==='string'?text.replace(/-?R\$\s*-?\s*\d[\d.]*,\d{2}/g,s=>format(Number(s.replace(/[^\d,-]/g,'').replace(',','.')))):Array.isArray(text)?text.map(convert):text;const wrap=(obj,key)=>{const f=obj?.[key];if(typeof f!=='function'||wrapped.has(f))return;const g=function(...args){return convert(f.apply(this,args));};wrapped.add(g);obj[key]=g;};for(const scale of Object.values(chart.options.scales||{}))wrap(scale.ticks,'callback');const callbacks=chart.options.plugins?.tooltip?.callbacks;for(const k of ['label','afterLabel','footer'])wrap(callbacks,k);}});updateCharts();}
  observer=new MutationObserver(schedule);apply();window.addEventListener('pf-language-change',schedule);
  const selection=window.PFReportSelection;if(selection&&!selection.pfCurrencyWrapped){selection.pfCurrencyWrapped=true;const dec=selection.decorate.bind(selection),ins=selection.install.bind(selection);selection.decorate=html=>{const s=requireSnapshot();return decorate(dec(html),s);};selection.install=target=>{const s=requireSnapshot();ins(target);target.eval('('+bootCurrency.toString()+')('+JSON.stringify({snapshot:s,locale:locale()})+')');};}
  if(!options.snapshot&&selected!=='BRL')load();
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();return api;
}
bootCurrency();
})();
