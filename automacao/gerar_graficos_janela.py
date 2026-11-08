"""Gera a janela pública de gráficos sem autenticação, banco ou rede próprios."""
from pathlib import Path
import re
ROOT=Path(__file__).resolve().parents[1]
def build():
 source=(ROOT/'index.html').read_text(encoding='utf-8-sig')
 a=source.index('function monthAnalysisData(');b=source.index('function install(){',a)
 helpers=source[a:b]
 selection=(ROOT/'automacao/relatorios_modos.js').read_text(encoding='utf-8-sig')
 explorer=(ROOT/'automacao/graficos_interativos.js').read_text(encoding='utf-8-sig')
 style=(ROOT/'automacao/graficos_interativos.css').read_text(encoding='utf-8-sig')
 cards=[('analysis-revenue','Evolução das Receitas','clean-revenue-history-bars'),('analysis-expense','Evolução das Despesas','clean-history-bars'),('analysis-revenue','Receitas por Rubrica','clean-revenue-category-bars'),('analysis-expense','Despesas por Rubrica','clean-category-bars')]
 markup=''.join('<section class="'+cls+'"><h2>'+title+'</h2><div id="'+id+'" class="analysis-bars"></div></section>' for cls,title,id in cards)
 runtime=r'''
 const $=id=>document.getElementById(id),channel=new URLSearchParams(location.search).get('canal');
 const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const money=n=>Number(n||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
 function render(state){
  const hidden=!!state.locked;document.body.classList.toggle('auth-pendente',hidden);document.body.classList.toggle('dark-mode',!!state.dark);
  if(state.font)document.body.style.fontFamily=state.font;
  const rows=hidden?[]:PFChartExplorer.data.rows(state.rows),allRows=hidden?[]:PFChartExplorer.data.rows(state.allRows),chosen=/^\d{4}-\d{2}-\d{2}$/.test(state.chosen||'')?state.chosen:new Date().toISOString().slice(0,10);
  const data=monthAnalysisData(rows,allRows,chosen);
  const bars=entries=>{const max=Math.max(1,...entries.map(x=>x[1]));return entries.map(([name,value])=>'<div class="analysis-row"><span>'+escape(name)+'</span><span class="analysis-track"><span class="analysis-fill" style="width:'+Math.max(0,value/max*100)+'%"></span></span><span class="analysis-amount">'+escape(money(value))+'</span></div>').join('')};
  $('clean-revenue-history-bars').innerHTML=hidden?'':bars(data.revenueHistory);
  $('clean-history-bars').innerHTML=hidden?'':bars(data.expenseHistory);
  $('clean-revenue-category-bars').innerHTML=hidden?'':categoryBreakdownBars(data.revenueCategories,data.revenueDescriptions,money,escape)||'<p>Sem receitas para os filtros selecionados.</p>';
  $('clean-category-bars').innerHTML=hidden?'':categoryBreakdownBars(data.expenseCategories,data.expenseDescriptions,money,escape)||'<p>Sem despesas para os filtros selecionados.</p>';
  PFChartExplorer.capture('monthly',{rows,allRows,chosen});
  $('status').textContent=hidden?'Valores protegidos na janela principal.':'Sincronizado com os dados e filtros da janela principal.';
  $('chart-grid').hidden=hidden;
 }
 const empty=()=>render({locked:true,rows:[],allRows:[]});
 $('join').onclick=()=>{if(window.opener&&!window.opener.closed)window.opener.postMessage({type:'pf-chart-join',channel},location.origin==='null'?'*':location.origin);else window.close()};
 window.addEventListener('message',event=>{if(event.source!==window.opener||event.origin!==location.origin||event.data?.channel!==channel||event.data?.type!=='pf-chart-state')return;const state=event.data.state;if(!state||!Array.isArray(state.rows)||!Array.isArray(state.allRows))return;render(state)});
 window.addEventListener('load',()=>{if(channel&&window.opener&&!window.opener.closed)window.opener.postMessage({type:'pf-chart-ready',channel},location.origin==='null'?'*':location.origin)});
 setInterval(()=>{if(!window.opener||window.opener.closed){empty();$('status').textContent='Janela principal fechada. Reabra os gráficos pelo aplicativo.'}},700);
 '''
 css='''
 *{box-sizing:border-box}body{margin:0;font-family:system-ui,-apple-system,"Segoe UI",sans-serif;background:#f3f5f9;color:#243247}header{position:sticky;top:0;z-index:10;display:flex;align-items:center;gap:14px;flex-wrap:wrap;background:#14263d;color:white;padding:12px 18px}header strong{margin-right:auto;font-size:14px}header small{font-size:11px}header button{font:500 12px system-ui;min-height:36px;padding:8px 12px;border:1px solid #43536b;border-radius:8px;background:#243650;color:#f1f5fc;cursor:pointer}main{padding:18px;max-width:1600px;margin:auto}.analysis-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:20px}.analysis-grid[hidden]{display:none}.analysis-grid>section{min-width:0;padding:20px;background:#fff;border:1px solid #e0e6ef;border-radius:12px}h2{font-size:15px;font-weight:650;margin:0 0 18px}.analysis-bars{display:grid;gap:14px}.analysis-row{display:grid;grid-template-columns:minmax(70px,110px) 1fr 100px;gap:10px;align-items:center;font-size:12px}.analysis-track{height:9px;background:#f1f3f8;border-radius:5px;overflow:hidden;display:block}.analysis-fill{display:block;height:100%;background:#5146cc;border-radius:5px}.analysis-amount{text-align:right;font-weight:600;font-variant-numeric:tabular-nums;white-space:nowrap}.analysis-revenue .analysis-fill{background:#16734b}.analysis-expense .analysis-fill{background:#bd2b20}.analysis-rubric summary{cursor:pointer}.analysis-description-bars{margin:10px 0 0 12px}.analysis-description-row{margin-bottom:8px}body.dark-mode{background:#101a28;color:#dce4f0}body.dark-mode .analysis-grid>section{background:#1c293b;border-color:#344158}body.dark-mode .analysis-track{background:#2d3a50}body.dark-mode .analysis-revenue .analysis-fill{background:#6ee7b7}body.dark-mode .analysis-expense .analysis-fill{background:#fca5a5}@media(max-width:760px){.analysis-grid{grid-template-columns:minmax(0,1fr)}.analysis-row{grid-template-columns:minmax(60px,.8fr) 1fr auto}}
 '''
 html='<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src \'none\'; script-src \'unsafe-inline\'; style-src \'unsafe-inline\'; img-src data:; connect-src \'none\'; form-action \'none\'; base-uri \'none\';"><title>Gráficos · Planejamento Financeiro</title><style>'+css+style+'</style></head><body class="auth-pendente"><header><strong>Planejamento Financeiro · Gráficos</strong><small id="status" role="status">Arraste esta janela para o segundo monitor.</small><button id="join" type="button">Reunir colunas</button></header><main id="clean-month-analysis"><div class="analysis-grid" id="chart-grid" hidden>'+markup+'</div></main><script id="pf-report-selection-module">'+selection+'</script><script>'+explorer+'</script><script>'+helpers+runtime+'</script></body></html>'
 for folder in [ROOT,ROOT/'distribuicao',ROOT/'teste-gemini']:(folder/'graficos.html').write_text(html,encoding='utf-8')
if __name__=='__main__':build()
