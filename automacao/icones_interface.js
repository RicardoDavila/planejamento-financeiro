/* Camada exclusivamente visual. Não lê nem grava contas, valores ou armazenamento. */
(() => {
 'use strict';
 const paths={
  income:'M12 20V4m-6 6 6-6 6 6',
  expense:'M12 4v16m-6-6 6 6 6-6',
  forecast:'M8 3v4m8-4v4M4 10h16M5 5h14a1 1 0 0 1 1 1v14H4V6a1 1 0 0 1 1-1m3 9h3m-3 3h6',
  received:'M8 12l3 3 5-6M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',
  paid:'M8 12l3 3 5-6M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',
  due:'M12 7v5l3 2M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',
  overdue:'M12 8v5m0 4h.01M12 3 2 21h20L12 3Z',
  investment:'M3 3v18h18M6 16l5-5 4 3 6-8m-6 0h6v6',
  balance:'M20 7H5a2 2 0 0 1 0-4h13v4m2 0H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h15V7Zm0 5h-6v5h6m-3-2.5h.01',
  home:'m3 11 9-8 9 8M5 10v11h5v-7h4v7h5V10',
  entries:'M8 4v16m-4-4 4 4 4-4M16 20V4m-4 4 4-4 4 4',
  list:'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',
  chart:'M4 3v18h17M8 17v-4m5 4V8m5 9V5',
  plus:'M12 4v16M4 12h16',
  more:'M5 12h.01M12 12h.01M19 12h.01',
  menu:'M3 6h18M3 12h18M3 18h18',
  sun:'M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0',
  moon:'M20 14A8 8 0 0 1 10 4a8 8 0 1 0 10 10Z',
  filter:'M3 5h18l-7 8v6l-4 2v-8L3 5Z',
  report:'M6 3h9l4 4v14H5V3h1m8 0v5h5M8 12h8m-8 4h8',
  categories:'m12 3 10 5-10 5L2 8l10-5Zm-10 9 10 5 10-5M2 16l10 5 10-5',
  percent:'M5 19 19 5M9 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0m12 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0',
  gauge:'M3 18a10 10 0 1 1 18 0M12 13l5-5M5 18h14'
 };
 const normalize=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().replace(/^[✓!◷▮▤▣⚖]\s*/,'').replace(/[¹²³]/g,'').trim().toLowerCase().replace(/\s+/g,' ');
 const names={
  'receita':'income','receitas':'income','receitas previstas':'forecast','prev de receita':'forecast',
  'receitas recebidas':'received','rec recebidas':'received','recebido':'received','recebidas':'received',
  'despesa':'expense','despesas':'expense','total de despesas':'expense',
  'a vencer':'due','despesas a vencer':'due','total pendente':'due','pendente':'due','a fazer':'due',
  'vencido':'overdue','vencidas':'overdue','despesas vencidas':'overdue','valores vencidos':'overdue',
  'pago':'paid','pagas':'paid','despesas pagas':'paid','feito':'paid','nao recebido':'forecast',
  'investimentos':'investment','investimento mes':'investment',
  'saldo':'balance','saldo final':'balance','saldo previsto':'balance','saldo projetado':'balance',
  'saldo liquido':'balance','saldo previsto do periodo':'balance',
  'dashboard':'home','inicio':'home','lancamentos':'entries','receitas e despesas':'entries',
  'cadastros e rubricas':'categories','relatorios':'report','graficos':'chart','graficos evolutivos':'chart'
 };
 Object.assign(names,{
  'despesas previstas':'expense','total de receitas':'income','total de receitas previstas':'forecast',
  'total de despesas':'expense','total de saidas':'expense','saidas':'expense','maior saida':'expense',
  'saldo do periodo':'balance','saldo inicial previsto':'balance','saldo acumulado final':'balance',
  'total da despesa no periodo':'expense','dia mais critico':'overdue','taxa de poupanca prevista':'percent','comprometimento':'gauge',
  'cascata financeira':'chart','ranking de rubricas — despesas':'expense','vencidos por faixa de atraso':'overdue',
  'mapa de calor — despesas por dia do mes':'forecast','ultimos 12 meses — receitas, despesas e saldo':'chart',
  'lancamentos do recorte (detalhamento)':'entries','evolucao temporal':'chart','distribuicao por rubrica':'categories',
  'evolucao das receitas':'income','evolucao das despesas':'expense','receitas por rubrica':'income','despesas por rubricas':'expense',
  'evolucao do saldo acumulado':'chart','evolucao do saldo projetado':'chart','fechamentos semanais':'forecast',
  'comparativo financeiro':'chart','resumo executivo':'report'
 });
 function svg(kind,doc=document){
  const el=doc.createElementNS('http://www.w3.org/2000/svg','svg');
  for(const [k,v]of Object.entries({viewBox:'0 0 24 24',fill:'none',stroke:'currentColor','stroke-width':'1.8','stroke-linecap':'round','stroke-linejoin':'round','aria-hidden':'true',focusable:'false',class:'pf-fin-icon','data-pf-kind':kind}))el.setAttribute(k,v);
  const p=doc.createElementNS('http://www.w3.org/2000/svg','path');p.setAttribute('d',paths[kind]||paths.list);el.append(p);return el;
 }
 function add(node,kind,replace=false){
  if(!node||!paths[kind])return;
  const own=node.querySelector(':scope > svg.pf-fin-icon');
  if(own?.getAttribute('data-pf-kind')===kind)return;
  if(own)own.remove();
  const old=node.querySelector(':scope > i[class*="fa-"]');
  if(old){if(!replace)return;old.replaceWith(svg(kind,node.ownerDocument));return;}
  node.prepend(svg(kind,node.ownerDocument));
 }
 function stripGlyph(node,pattern){
  for(const child of node.childNodes){if(child.nodeType!==3)continue;const next=child.data.replace(pattern,'');if(next!==child.data)child.data=next;break;}
 }
 function enhance(doc=document){
  const labels='#painelResumoGerencial>div>p:first-child,.dashboard-v40-card .lbl,#pfMobileShell .kpi small,#pfMobileShell .balance small,.pagina .kpi .rotulo,.pagina .kpi small,.pagina .kpi label,#comparacaoTotaisGraficos span.text-xs';
  doc.querySelectorAll(labels).forEach(node=>{
   const kind=names[normalize(node.textContent)];if(!kind)return;
   stripGlyph(node,/^\s*[▮▤▣⚖]\s*/);add(node,kind);
  });
  for(const [id,kind]of Object.entries({kpiGrafReceitas:'forecast',kpiGrafRecebidas:'received',kpiGrafDespesas:'expense',kpiGrafSaldo:'balance',kpiGrafVencidas:'overdue',kpiGrafPoupanca:'percent',kpiGrafComprometimento:'gauge'})){
   const value=doc.getElementById(id);if(value)add(value.previousElementSibling,kind);
  }
  doc.querySelectorAll('#modalGraficos h4,#clean-month-analysis h3,.pagina .grafico-titulo,.pagina .bloco-titulo,.pagina .resumo h2,.fc-chart h3,.fc-chart-grid h3').forEach(node=>{
   const kind=names[normalize(node.textContent)];if(!kind)return;
   stripGlyph(node,/^\s*[▮▤▣⚖]\s*/);add(node,kind);
  });
  doc.querySelectorAll('.fc-card').forEach(node=>{
   const title=[...node.childNodes].filter(n=>n.nodeType===3).map(n=>n.textContent).join('');
   add(node,names[normalize(title)]);
  });
  // Original desktop and alternate mobile cards; icons are added beside titles,
  // never inside the value nodes replaced by the financial rendering functions.
  for(const [id,kind]of Object.entries({cardPrevReceita:'forecast',cardRecRecebidas:'received',cardDespesas:'expense',cardPendente:'due',cardInvestimento:'investment',cardSaldo:'balance'})){
   const value=doc.getElementById(id);if(value)add(value.previousElementSibling,kind);
  }
  doc.querySelectorAll('.pf-nav a').forEach(node=>add(node,names[normalize(node.textContent)],true));
  doc.querySelectorAll('#tabelaCorpo tr,#corpoTabela tr,tbody tr').forEach(row=>{
   // Only existing badges or exact type/status cells, not descriptions or inputs.
   row.querySelectorAll('td>span').forEach(node=>add(node,names[normalize(node.textContent)]));
   if(doc!==document)row.querySelectorAll('td').forEach(node=>{if(node.children.length===0)add(node,names[normalize(node.textContent)]);});
  });
  doc.querySelectorAll('.badge-mobile').forEach(node=>add(node,names[normalize(node.textContent)]));
  doc.querySelectorAll('#pfMobileShell .badge').forEach(node=>{
   const kind=names[normalize(node.textContent)];if(!kind)return;
   stripGlyph(node,/^[✓!◷]\s*/);add(node,kind);
  });
  doc.querySelectorAll('#pfMobileShell .item').forEach(item=>{
   const type=[...item.querySelectorAll('dt')].find(node=>normalize(node.textContent)==='tipo')?.nextElementSibling;
   add(item.querySelector('.row>div:first-child>b'),names[normalize(type?.textContent)]);
  });
  const controls={'pm-home':'home','pm-entries':'entries','pm-new':'plus','pm-charts':'chart','pm-more':'more','pm-menu':'menu','pm-openFilters':'filter'};
  for(const [id,kind]of Object.entries(controls)){
   const node=doc.getElementById(id);if(!node)continue;
   stripGlyph(node,/^[⌂☷▥⋯☰+]\s*/);add(node,kind);
  }
  const theme=doc.getElementById('pm-theme');
  if(theme){stripGlyph(theme,/^[☀◐]\s*/);add(theme,normalize(theme.textContent)==='claro'?'sun':'moon');}
 }
 function decorate(html){
  const report=new DOMParser().parseFromString(html,'text/html');
  enhance(report);
  if(!report.getElementById('pf-financial-icons-style')){
   const style=document.getElementById('pf-financial-icons-style');if(style)report.head.append(style.cloneNode(true));
  }
  return '<!doctype html>\n'+report.documentElement.outerHTML;
 }
 window.PFFinancialIcons=Object.freeze({enhance,svg,decorate,kind:label=>names[normalize(label)]||null});
 function install(){
  enhance();
  let scheduled=false;
  const observer=new MutationObserver(records=>{
   // Ignore our own additions. New financial rows and controls are processed once
   // per frame; no attribute observation or writes to financial render functions.
   if(!records.some(r=>r.type==='characterData'||[...r.addedNodes].some(n=>n.nodeType===1&&!n.matches?.('svg.pf-fin-icon,path'))||r.removedNodes.length))return;
   if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;enhance();});
  });
  observer.observe(document.body,{childList:true,subtree:true,characterData:true});
  window.addEventListener('beforeprint',()=>enhance());
  const theme=window.PFReportTheme;
  if(theme?.decorate){
   window.PFReportTheme=Object.freeze({...theme,decorate(...args){
    return decorate(theme.decorate.apply(theme,args));
   }});
  }
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
