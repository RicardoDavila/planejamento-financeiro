/* Exploração visual: não escreve em contas, transações, armazenamento ou rede. */
(() => {
 'use strict';
 function chartData(){
  const norm=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
  const number=v=>{if(typeof v==='number')return Number.isFinite(v)?v:0;const match=String(v??'').match(/[-+]?\s*(?:R\$\s*)?\d[\d.]*(?:,\d+)?/);return Number((match?.[0]||'').replace(/[^\d,.-]/g,'').replace(/\.(?=\d{3}(?:\D|$))/g,'').replace(',','.'))||0;};
  const rows=arr=>(Array.isArray(arr)?arr:[]).map(r=>({id:r.id,tipo:String(r.tipo||''),categoria:String(r.categoria||''),subItem:String(r.subItem||''),descricao:String(r.descricao||'Sem descrição'),valor:Number(r.valor)||0,status:String(r.status||''),vencimento:String(r.vencimento||r.data||''),dataPg:String(r.dataPg||'')}));
  const sum=a=>a.reduce((s,r)=>s+r.valor,0);
  const month=(year,index)=>{const d=new Date(year,index,1);return {key:d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0'),label:d.toLocaleDateString('pt-BR',{month:'short',year:'2-digit'})};};
  const typeRows=(arr,label)=>{
   const n=norm(label);let out=arr;
   if(/saldo|balanco|filtro|valor|total \(r\$\)/.test(n)&&!/receit|despes/.test(n))return out;
   if(/receit|recebid|entrada/.test(n))out=out.filter(r=>r.tipo==='Receita');
   else if(/despes|pag[ao]|saida|vencid|vencer/.test(n))out=out.filter(r=>r.tipo==='Despesa');
   else if(/invest/.test(n))out=out.filter(r=>r.tipo==='Investimentos');
   if(/recebid/.test(n))out=out.filter(r=>!['Não Recebido','A Vencer','Pendente','Vencido'].includes(r.status));
   if(/pagas|pagos/.test(n))out=out.filter(r=>['Pago','Paga','Recebido','Recebida','Liquidado','Liquidada'].includes(r.status));
   if(/vencidas|vencidos|valores vencidos/.test(n))out=out.filter(r=>r.status==='Vencido');
   return out;
  };
  function model(title,labels,series,resolve,additive=true){
   return {title,labels:labels.map(String),series:series.map((s,j)=>({label:String(s.label||'Valor'),sourceIndex:s.sourceIndex??j,color:s.color||['#047857','#bd2b20','#2563eb','#7c3aed','#b45309'][j%5],values:s.values.map(v=>Number.isFinite(Number(v))?Number(v):0)})),resolve,additive};
  }
  function points(m){return m.series.flatMap((s,j)=>s.values.map((v,i)=>({key:j+':'+i,label:m.labels[i]||String(i+1),value:v,series:s.label,color:s.color,i,j})));}
  function pie(m,j){
   if(!m.additive&&!m.additiveSeries?.[j])return {error:'Saldos acumulados e indicadores derivados não representam partes de um total. O gráfico padrão foi mantido.'};
   const s=m.series[j];if(!s)return {error:'Selecione uma série válida.'};
   if(s.values.some(v=>v<0))return {error:'Pizza e rosca não representam valores negativos. O gráfico padrão foi mantido.'};
   const total=s.values.reduce((a,b)=>a+b,0);if(total<=0)return {error:'Não há um total positivo para compor as fatias. O gráfico padrão foi mantido.'};
   let parts=s.values.map((value,i)=>({label:m.labels[i],value,indices:[i]})).filter(p=>p.value>0).sort((a,b)=>b.value-a.value);
   if(parts.length>8)parts=[...parts.slice(0,7),{label:'Outros',value:parts.slice(7).reduce((s,p)=>s+p.value,0),indices:parts.slice(7).flatMap(p=>p.indices)}];
   return {total,parts};
  }
  const grouped=arr=>{const groups=new Map();for(const r of arr){const category=r.categoria||'Sem rubrica',description=r.descricao.trim()||'Sem descrição',k=JSON.stringify([r.tipo,category,description]);const g=groups.get(k)||{label:r.tipo+' · '+category+' · '+description,value:0};g.value+=r.valor;groups.set(k,g);}return [...groups.values()].sort((a,b)=>b.value-a.value);};
  return {norm,number,rows,sum,month,typeRows,model,points,pie,grouped};
 }
 function boot(factory,payload){
  const D=factory(),NS='http://www.w3.org/2000/svg',states=new Map(),contexts={},colors=['#047857','#bd2b20','#2563eb','#7c3aed','#b45309','#0e7490','#9d174d','#475569'];
  const money=v=>(Number(v)||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
  const color=c=>{if(!document.body.classList.contains('dark-mode')||window.matchMedia?.('print').matches)return c;return ({'#047857':'#6ee7b7','#16a34a':'#6ee7b7','#10b981':'#6ee7b7','#bd2b20':'#fda4af','#dc2626':'#fda4af','#2563eb':'#93c5fd','#7c3aed':'#d8b4fe','#b45309':'#fcd34d'})[c]||c;};
  let scheduled=false,serial=0;
  const element=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;};
  const svg=(tag,attrs={},text)=>{const n=document.createElementNS(NS,tag);for(const [k,v]of Object.entries(attrs))n.setAttribute(k,String(v));if(text!==undefined)n.textContent=text;return n;};
  const dateLabel=s=>/^\d{4}-\d{2}-\d{2}$/.test(s)?s.split('-').reverse().join('/'):s;
  function protectedState(state){
   if(payload)return false;
   if(document.body.classList.contains('auth-pendente'))return true;
   if(typeof protecaoAutenticada!=='undefined'&&!protecaoAutenticada)return true;
   return !!state.source.closest('#clean-month-analysis')&&!!document.getElementById('painelGerencial')?.classList.contains('pf-painel-oculto');
  }
  function exportMonthlyChart(source) {
   const selected=[...states.values()].filter(state=>state.source.closest('#clean-month-analysis')&&(!source||state.source===source)&&state.source.isConnected);
   if(!selected.length||selected.some(protectedState))return;
   if(typeof window.pfdAssert==='function')try{window.pfdAssert();}catch(_){return;}
   const popup=window.open('','_blank');
   if(!popup){alert('Permita a abertura de uma nova aba para visualizar e exportar os gráficos.');return;}
   try {
    const report=document.implementation.createHTMLDocument('Análise mensal — gráficos');
    report.documentElement.lang='pt-BR';
    const viewport=report.createElement('meta');viewport.name='viewport';viewport.content='width=device-width,initial-scale=1';report.head.append(viewport);
    const header=report.createElement('header');header.className='pf-monthly-report-header marca';
    const logo=report.createElement('img');logo.className='pf-report-logo';logo.src=window.PFReportTheme.logo;logo.alt='Logotipo do Planejamento Financeiro';logo.width=logo.height=52;header.append(logo);
    const heading=report.createElement('h1');heading.textContent='Planejamento Financeiro';header.append(heading);
    const subtitle=report.createElement('p');subtitle.textContent=source?selected[0].model.title:'Análise do mês de receitas e despesas por rubrica e evolução';header.append(subtitle);
    const period=report.createElement('p');period.textContent=typeof obterPeriodoFiltroPainel==='function'?obterPeriodoFiltroPainel():'Período de referência: '+String(contexts.monthly?.chosen||'');header.append(period);
    const filters=report.createElement('p');filters.textContent=window.PFCashFlow?.filters?.()||'Filtros atuais da análise mensal';header.append(filters);
    const issued=report.createElement('p');issued.textContent='Emitido em '+new Date().toLocaleString('pt-BR');header.append(issued);report.body.append(header);
    for(const state of selected){
     const section=report.createElement('section');section.className='pf-monthly-report-chart '+(state.source.closest('.analysis-expense')?'analysis-expense':'analysis-revenue');
     const title=report.createElement('h2');title.textContent=state.model.title;section.append(title);
     const caption=report.createElement('p');caption.textContent='Tipo de gráfico: '+(state.select.selectedOptions?.[0]?.textContent||state.mode)+(state.seriesLabel.hidden?'':' · Série: '+state.seriesSelect.selectedOptions?.[0]?.textContent);section.append(caption);
     const description=state.source.closest('.analysis-revenue,.analysis-expense')?.querySelector('h3 + p');if(description)section.append(report.importNode(description,true));
     const visible=state.alt.hidden?state.displayNode:state.alt,copy=report.importNode(visible,true);copy.removeAttribute('id');copy.hidden=false;
     copy.querySelectorAll('script,button,input,select,[hidden]').forEach(node=>node.remove());
     const palette={'#6ee7b7':'#047857','#fda4af':'#bd2b20','#93c5fd':'#2563eb','#c4b5fd':'#7c3aed','#d8b4fe':'#7c3aed','#fcd34d':'#b45309','#e2e8f0':'#243247'};
     for(const node of [copy,...copy.querySelectorAll('*')]){
      for(const attr of [...node.attributes])if(/^on/i.test(attr.name))node.removeAttribute(attr.name);
      for(const attr of ['fill','stroke']){const value=node.getAttribute(attr);if(palette[value])node.setAttribute(attr,palette[value]);}
     }
     section.append(copy);report.body.append(section);
    }
    const footer=report.createElement('footer');footer.textContent='Relatório de Planejamento Financeiro · Uso interno';report.body.append(footer);
    const style=report.createElement('style');style.textContent=(document.getElementById('pf-chart-explorer-style')?.textContent||'')+'body{margin:0 auto;padding:24px;max-width:1100px;background:white;color:#243247;font:13px/1.5 system-ui}.pf-monthly-report-header{position:relative;border-bottom:2px solid #203c64;padding:0 0 16px 70px;margin-bottom:24px}.pf-monthly-report-header .pf-report-logo{position:absolute;left:0;top:0;width:52px;height:52px}.pf-monthly-report-header h1{margin:0;font-size:24px}.pf-monthly-report-header p{margin:4px 0}.pf-monthly-report-chart{margin:0 0 28px;break-inside:avoid;min-width:0}.pf-monthly-report-chart h2{font-size:18px;break-after:avoid}.pfce-svg{min-width:0!important;max-width:100%;color:#243247!important}.pfce-alt{overflow:visible!important;--pfce-hole:white}.analysis-row{display:grid;grid-template-columns:minmax(90px,1fr) 2fr minmax(110px,auto);gap:10px;align-items:center;margin:12px 0}.analysis-track{display:block;height:10px;background:#edf2f8;border-radius:5px}.analysis-fill{display:block;height:100%;background:#047857}.analysis-expense .analysis-fill{background:#bd2b20}.analysis-amount{text-align:right;font-variant-numeric:tabular-nums}.analysis-rubric{margin:10px 0}.analysis-rubric summary{display:flex;justify-content:space-between;gap:16px}.analysis-description-row{display:flex;justify-content:space-between;padding:5px}footer{border-top:1px solid #cbd5e1;padding-top:12px;color:#526176}@page{size:A4 landscape;margin:12mm}@media print{body{padding:0;max-width:none}.pf-monthly-report-chart{break-inside:avoid}.pfce-svg{width:100%;height:auto;max-height:150mm}.pfce-point text{fill:#243247!important}}';report.head.append(style);
    let html='<!doctype html>'+report.documentElement.outerHTML;
    html=window.PFReportTheme.decorate(html);
    html=window.PFReportSelection.decorate(html);
    popup.document.open();popup.document.write(html);popup.document.close();
   } catch(error){popup.close();alert('Não foi possível preparar o relatório de gráficos. Tente novamente.');}
  }
  function monthlyExportTools(){
   const panel=document.getElementById('clean-month-analysis');if(!panel||document.getElementById('pf-monthly-export-actions'))return;
   const tools=element('div',undefined,'pfce-tools');tools.id='pf-monthly-export-actions';tools.dataset.pfceUi='true';tools.style.padding='0 16px';
   for(const label of ['Salvar em PDF','Imprimir']){const button=element('button',label);button.type='button';button.style.minHeight='44px';button.onclick=()=>exportMonthlyChart();tools.append(button);}
   const content=document.getElementById('clean-analysis-content');if(content)content.before(tools);
  }
  function pointRows(state,p){return D.rows(state.model.resolve?.(p.j,p.i)||[]);}
  function detail(state,point,overrideRows,passive=false){
   if(protectedState(state))return;
   if(state.selection===point.key){state.selection=null;state.detail.hidden=true;return;}
   state.selection=point.key;state.selectionIdentity=JSON.stringify([point.label,point.series]);state.detail.replaceChildren();state.detail.hidden=false;
   state.descriptionSelection=overrideRows&&point.key.startsWith('description:')?{point:{...point},category:overrideRows[0]?.categoria}:null;
   const close=element('button','Recolher detalhes','pfce-close');close.type='button';close.onclick=()=>{state.selection=null;state.detail.hidden=true;};state.detail.append(close);
   state.detail.append(element('h5',point.label+' · '+point.series+' · '+money(point.value)));
   const records=overrideRows||pointRows(state,point),groups=D.grouped(records),bars=element('div',undefined,'pfce-bars'),max=Math.max(1,...groups.map(g=>Math.abs(g.value)));
   for(const g of groups){const row=element('div',undefined,'pfce-bar'),track=element('span',undefined,'pfce-track'),fill=element('span',undefined,'pfce-fill');fill.style.width=Math.abs(g.value)/max*100+'%';fill.style.background=/^Receita/.test(g.label)?'#047857':'#bd2b20';track.append(fill);row.append(element('span',g.label),track,element('span',money(g.value),'pfce-amount'));bars.append(row);}state.detail.append(bars);
   if(!state.model.additive)state.detail.append(element('p','Indicador derivado: os lançamentos abaixo compõem o cálculo e não devem ser somados como saldos independentes.','pfce-message'));
   if(!records.length){state.detail.append(element('p','Sem lançamentos correspondentes a este ponto no recorte disponível.'));return;}
   state.detail.append(element('p',records.length+' lançamento(s) vinculados. Valores das descrições agrupados dentro de cada tipo e rubrica.'));
   const scroll=element('div',undefined,'pfce-scroll'),table=element('table'),head=element('thead'),hr=element('tr');for(const h of ['Vencimento','Tipo','Rubrica','Descrição','Status','Valor'])hr.append(element('th',h));head.append(hr);table.append(head);const body=element('tbody');
   for(const r of records){const tr=element('tr');for(const v of [dateLabel(r.vencimento),r.tipo,r.categoria||'Sem rubrica',r.descricao.trim()||'Sem descrição',r.status,money(r.valor)])tr.append(element('td',v));body.append(tr);}table.append(body);scroll.append(table);state.detail.append(scroll);
   if(!passive&&!payload&&window.PFQuickCards){
    const field=state.model.groupBy|| (overrideRows&&records.every(r=>r.descricao===point.label)?'descricao':/rubrica/.test(D.norm(state.model.title))?'categoria':/descri/.test(D.norm(state.model.title))?'descricao':null);
    if(field){const values=[...new Set(records.map(r=>String(r[field]??'')))];if(values.length===1)document.dispatchEvent(new CustomEvent('pf-item-focus',{detail:{field,value:values[0],scope:state.source.closest('#modalGraficos')?'charts':'page'}}));}
   }
  }
  function activate(node,state,p,rows){
   node.classList.add('pfce-point');node.setAttribute('role','button');node.setAttribute('tabindex','0');node.setAttribute('aria-label',p.label+' · '+p.series+' · '+money(p.value)+' — abrir lançamentos');
   node.addEventListener('click',event=>{event.preventDefault();event.stopPropagation();detail(state,p,rows);});
   node.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();event.stopPropagation();detail(state,p,rows);}});
  }
  function restore(state){
   if(state.hidden){state.displayNode.style.removeProperty('display');if(state.oldDisplay)state.displayNode.style.setProperty('display',state.oldDisplay.value,state.oldDisplay.priority);state.hidden=false;}
   state.alt.hidden=true;
  }
  function hideDefault(state){
   if(!state.hidden){state.oldDisplay=state.displayNode.style.getPropertyValue('display')?{value:state.displayNode.style.getPropertyValue('display'),priority:state.displayNode.style.getPropertyPriority('display')}:null;state.hidden=true;}
   state.displayNode.style.setProperty('display','none','important');state.alt.hidden=false;
  }
  function draw(state){
   const raw=state.model;if(!raw)return;const m={...raw,series:raw.series.map(s=>({...s,color:color(s.color)}))};
   state.alt.replaceChildren();state.message.textContent='';restore(state);
   state.seriesLabel.hidden=!['pie','doughnut'].includes(state.mode);state.xLabel.hidden=state.yLabel.hidden=state.mode!=='scatter';
   if(state.mode==='default'){state.message.textContent='Clique em uma barra, ponto ou fatia para abrir os lançamentos.';return;}
   if(!m.labels.length||!m.series.length){state.message.textContent='Sem dados para esta visualização.';return;}
   const points=D.points(m);
   if(state.mode==='pie'||state.mode==='doughnut'){
    const j=Number(state.seriesSelect.value)||0,result=D.pie(m,j);
    if(result.error){state.message.textContent=result.error;return;}
    hideDefault(state);state.message.textContent='Percentuais sobre os valores exibidos nesta série. Mais de oito partes são agrupadas em “Outros”.';
    const graph=svg('svg',{viewBox:'0 0 600 340',class:'pfce-svg',role:'img','aria-label':m.title+' — composição percentual'});let angle=-Math.PI/2;
    result.parts.forEach((part,k)=>{const next=angle+part.value/result.total*Math.PI*2,cx=170,cy=165,r=125;
     let shape;if(part.value===result.total)shape=svg('circle',{cx,cy,r,fill:colors[k%colors.length]});else shape=svg('path',{d:`M ${cx} ${cy} L ${cx+r*Math.cos(angle)} ${cy+r*Math.sin(angle)} A ${r} ${r} 0 ${next-angle>Math.PI?1:0} 1 ${cx+r*Math.cos(next)} ${cy+r*Math.sin(next)} Z`,fill:colors[k%colors.length]});
     const p={key:'pie:'+j+':'+part.indices.join(','),label:part.label,value:part.value,series:m.series[j].label,j,i:part.indices[0]};const records=part.indices.flatMap(i=>D.rows(m.resolve?.(j,i)||[]));activate(shape,state,p,records);shape.append(svg('title',{},part.label+': '+money(part.value)+' · '+(part.value/result.total*100).toFixed(1)+'%'));graph.append(shape);
     const legend=svg('text',{x:315,y:35+k*35},part.label.length>30?part.label.slice(0,29)+'…':part.label);graph.append(legend,svg('text',{x:315,y:50+k*35},(part.value/result.total*100).toLocaleString('pt-BR',{maximumFractionDigits:1})+'% · '+money(part.value)));angle=next;
    });
    if(state.mode==='doughnut')graph.append(svg('circle',{cx:170,cy:165,r:68,fill:'var(--pfce-hole, #fff)','pointer-events':'none'}));state.alt.append(graph);return;
   }
   if(state.mode==='bar'){
    hideDefault(state);const bars=element('div',undefined,'pfce-bars'),max=Math.max(1,...points.map(p=>Math.abs(p.value)));
    const diverging=points.some(p=>p.value<0);
    for(const p of points){const row=element('button',undefined,'pfce-bar');row.type='button';const track=element('span',undefined,'pfce-track'),fill=element('span',undefined,'pfce-fill');fill.style.width=Math.abs(p.value)/max*(diverging?50:100)+'%';fill.style.background=p.color;if(diverging){track.style.position='relative';fill.style.position='absolute';fill.style.left=(p.value<0?50-Math.abs(p.value)/max*50:50)+'%';const zero=element('span');zero.style.cssText='position:absolute;left:50%;height:100%;border-left:1px solid #64748b';track.append(zero);}track.append(fill);row.append(element('span',p.label+(m.series.length>1?' · '+p.series:'')),track,element('span',money(p.value),'pfce-amount'));row.onclick=()=>detail(state,p);bars.append(row);}state.alt.append(bars);return;
   }
   if(state.mode==='scatter'){
    if(m.series.length<2){state.message.textContent='Dispersão requer duas séries numéricas comparáveis no mesmo recorte. Este gráfico tem somente uma; o padrão foi mantido.';return;}
    const a=Number(state.xSelect.value)||0,b=Number(state.ySelect.value)||0;if(a===b){state.message.textContent='Escolha séries diferentes para os eixos X e Y.';return;}
    const sx=m.series[a],sy=m.series[b],xmin=Math.min(0,...sx.values),xmax=Math.max(1,...sx.values),ymin=Math.min(0,...sy.values),ymax=Math.max(1,...sy.values);
    hideDefault(state);state.message.textContent='X: '+sx.label+' · Y: '+sy.label+'. Cada ponto corresponde ao mesmo período/categoria nas duas séries; o desenho não comprova causalidade.';
    const g=svg('svg',{viewBox:'0 0 800 360',class:'pfce-svg',role:'img','aria-label':state.message.textContent});g.append(svg('line',{x1:90,y1:290,x2:760,y2:290,stroke:'#94a3b8'}),svg('line',{x1:90,y1:30,x2:90,y2:290,stroke:'#94a3b8'}));
    for(let i=0;i<3;i++){const xv=xmin+(xmax-xmin)*i/2,yv=ymin+(ymax-ymin)*i/2;g.append(svg('text',{x:90+670*i/2,y:315,'text-anchor':'middle'},money(xv)),svg('text',{x:80,y:290-260*i/2,'text-anchor':'end'},money(yv)));}
    m.labels.forEach((label,i)=>{const dot=svg('circle',{cx:90+(sx.values[i]-xmin)/(xmax-xmin||1)*670,cy:290-(sy.values[i]-ymin)/(ymax-ymin||1)*260,r:6,fill:'#6366f1'});dot.append(svg('title',{},label+' · X '+money(sx.values[i])+' · Y '+money(sy.values[i])));const p={key:'scatter:'+i,label,value:sy.values[i],series:sy.label,j:b,i};activate(dot,state,p,[...new Set([...(m.resolve?.(a,i)||[]),...(m.resolve?.(b,i)||[])])]);g.append(dot);});g.append(svg('text',{x:420,y:345,'text-anchor':'middle'},'X: '+sx.label),svg('text',{x:90,y:20},'Y: '+sy.label));state.alt.append(g);return;
   }
   hideDefault(state);
   const W=Math.max(800,m.labels.length*46),H=360,left=105,right=W-25,top=25,bottom=280,min=Math.min(0,...points.map(p=>p.value)),max=Math.max(1,...points.map(p=>p.value)),span=max-min||1;
   const x=i=>left+(right-left)*(m.labels.length===1?.5:i/(m.labels.length-1)),y=v=>bottom-(v-min)/span*(bottom-top),g=svg('svg',{viewBox:`0 0 ${W} ${H}`,class:'pfce-svg',role:'img','aria-label':m.title});
   for(let k=0;k<3;k++){const v=min+(max-min)*k/2;g.append(svg('line',{x1:left,y1:y(v),x2:right,y2:y(v),stroke:'#94a3b8','stroke-opacity':.4}),svg('text',{x:left-9,y:y(v)+4,'text-anchor':'end'},money(v)));}
   m.series.forEach((s,j)=>{
    if(state.mode==='column'){const band=(right-left)/Math.max(1,m.labels.length),bw=Math.max(2,band*.75/m.series.length);s.values.forEach((v,i)=>{const center=left+band*(i+.5),rect=svg('rect',{x:center-band*.375+j*bw,y:Math.min(y(0),y(v)),width:bw-1,height:Math.max(1,Math.abs(y(v)-y(0))),fill:s.color});rect.append(svg('title',{},m.labels[i]+' · '+s.label+' · '+money(v)));activate(rect,state,{key:j+':'+i,label:m.labels[i],value:v,series:s.label,color:s.color,j,i});g.append(rect);});}
    else {const coords=s.values.map((v,i)=>x(i)+','+y(v));if(state.mode==='area')g.append(svg('polygon',{points:x(0)+','+y(0)+' '+coords.join(' ')+' '+x(m.labels.length-1)+','+y(0),fill:s.color,'fill-opacity':.18}));g.append(svg('polyline',{points:coords.join(' '),fill:'none',stroke:s.color,'stroke-width':2.5}));s.values.forEach((v,i)=>{const dot=svg('circle',{cx:x(i),cy:y(v),r:4.5,fill:s.color});dot.append(svg('title',{},m.labels[i]+' · '+s.label+' · '+money(v)));activate(dot,state,{key:j+':'+i,label:m.labels[i],value:v,series:s.label,color:s.color,j,i});g.append(dot);});}
   });
   m.labels.forEach((label,i)=>{if(i%Math.max(1,Math.ceil(m.labels.length/10))&&i!==m.labels.length-1)return;const xx=state.mode==='column'?left+(right-left)/Math.max(1,m.labels.length)*(i+.5):x(i);g.append(svg('text',{x:xx,y:305,'text-anchor':'middle'},label.length>24?label.slice(0,23)+'…':label));});state.alt.append(g);
   const legend=element('div',undefined,'pfce-legend');for(const s of m.series){const item=element('span'),swatch=element('span',undefined,'pfce-swatch');swatch.style.background=s.color;item.append(swatch,document.createTextNode(s.label));legend.append(item);}state.alt.append(legend);
  }
  function refreshState(state,m){
   if(!state.source.isConnected){state.tools.remove();state.alt.remove();state.message.remove();state.detail.remove();state.points.remove();states.delete(state.source);return;}
   if(protectedState(state)){restore(state);state.tools.hidden=true;state.detail.hidden=true;state.points.hidden=true;state.model=null;state.selection=null;state.version='';return;}
   state.tools.hidden=false;
   const version=JSON.stringify([m.title,m.labels,m.series,m.additive,m.additiveSeries,m.groupBy,m.records||[],document.body.classList.contains('dark-mode')]);
   state.model=m;
   if(state.version===version)return;
   state.version=version;
   state.points.hidden=true;state.points.replaceChildren();
   state.select.setAttribute('aria-label',m.title+' — tipo de gráfico');
   for(const [select,text]of [[state.seriesSelect,'Série'],[state.xSelect,'Eixo X'],[state.ySelect,'Eixo Y']]){const value=select.value;select.replaceChildren(...m.series.map((s,i)=>{const o=element('option',s.label);o.value=String(i);return o;}));select.value=value!==''&&Number(value)<m.series.length?value:'0';select.setAttribute('aria-label',m.title+' — '+text);}
   if(state.ySelect.value===state.xSelect.value&&m.series.length>1)state.ySelect.value='1';
   draw(state);
   if(state.selection){
    const p=D.points(m).find(p=>JSON.stringify([p.label,p.series])===state.selectionIdentity),description=state.descriptionSelection;state.selection=null;
    if(p)detail(state,p,undefined,true);
    else if(description){const rows=D.rows(m.records).filter(r=>r.tipo===description.point.series&&r.categoria===description.category&&(r.descricao.trim()||'Sem descrição')===description.point.label);if(rows.length)detail(state,{...description.point,value:D.sum(rows)},rows,true);else state.detail.hidden=true;}
    else state.detail.hidden=true;
   }
  }
  function mount(source,m,options={}){
   if(!source)return;let state=states.get(source);
   if(!state){
    const anchor=options.displayNode||source,tools=element('div',undefined,'pfce-tools'),alt=element('div',undefined,'pfce-alt'),message=element('p','Clique em uma barra, ponto ou fatia para abrir os lançamentos.','pfce-message'),panel=element('section',undefined,'pfce-detail'),pointList=element('div',undefined,'pfce-points');
    for(const n of [tools,alt,message,panel,pointList])n.dataset.pfceUi='true';alt.hidden=panel.hidden=pointList.hidden=true;
    anchor.before(tools);anchor.after(alt,message,pointList,panel);
    const typeLabel=element('label','Tipo de gráfico '),select=element('select');select.setAttribute('aria-label',m.title+' — tipo de gráfico');
    for(const [value,label]of [['default','Padrão (original)'],['line','Linhas'],['area','Áreas'],['column','Colunas'],['bar','Barras horizontais'],['pie','Pizza (circular)'],['doughnut','Rosca'],['scatter','Dispersão']]){const o=element('option',label);o.value=value;select.append(o);}typeLabel.append(select);tools.append(typeLabel);
    const makeSeries=(text)=>{const label=element('label',text),s=element('select');s.setAttribute('aria-label',m.title+' — '+text);label.append(s);label.hidden=true;tools.append(label);return [label,s];};
    const [seriesLabel,seriesSelect]=makeSeries('Série'),[xLabel,xSelect]=makeSeries('Eixo X'),[yLabel,ySelect]=makeSeries('Eixo Y'),listButton=element('button','Ver pontos e lançamentos');listButton.type='button';tools.append(listButton);
    const initialMode=(!payload&&({'clean-revenue-history-bars':'area','clean-history-bars':'pie','clean-revenue-category-bars':'default','clean-category-bars':'column'})[source.id])||'default';
    select.value=initialMode;
    state={source,displayNode:anchor,tools,alt,message,detail:panel,points:pointList,mode:initialMode,seriesLabel,seriesSelect,xLabel,xSelect,yLabel,ySelect,select,selection:null,id:++serial};states.set(source,state);
    if(!payload&&source.closest('#clean-month-analysis'))for(const label of ['Salvar em PDF','Imprimir']){const button=element('button',label);button.type='button';button.style.minHeight='44px';button.onclick=()=>exportMonthlyChart(source);tools.append(button);}
    select.onchange=()=>{state.mode=select.value;state.selection=null;panel.hidden=true;pointList.hidden=true;draw(state);if(state.mode==='default'&&options.chart)options.chart()?.resize();};
    for(const s of [seriesSelect,xSelect,ySelect])s.onchange=()=>{state.selection=null;panel.hidden=true;draw(state);};
    listButton.onclick=()=>{if(protectedState(state)||!state.model)return;pointList.hidden=!pointList.hidden;pointList.replaceChildren();if(pointList.hidden)return;for(const p of D.points(state.model)){const b=element('button',p.label+' · '+p.series+' · '+money(p.value));b.type='button';b.onclick=()=>detail(state,p);pointList.append(b);}};
    if(options.chart)source.addEventListener('click',event=>{if(state.mode!=='default'||!state.model)return;const chart=options.chart();const hit=chart?.getElementsAtEventForMode(event,'nearest',{intersect:true},true)?.[0];if(hit){const j=state.model.series.findIndex(s=>s.sourceIndex===hit.datasetIndex),p=D.points(state.model).find(p=>p.j===j&&p.i===hit.index);if(p)detail(state,p);}});
    source.addEventListener('click',event=>{
     if(options.chart||state.mode!=='default'||!state.model)return;
     const hit=options.hit?.(event.target,state.model);if(!hit)return;
     event.preventDefault();event.stopImmediatePropagation();
     if(hit.point)detail(state,hit.point,hit.rows);else {const p=D.points(state.model).find(p=>p.j===hit.j&&p.i===hit.i);if(p)detail(state,p);}
    },true);
    source.addEventListener('keydown',event=>{if((event.key==='Enter'||event.key===' ')&&event.target.classList.contains('pfce-hit')){event.preventDefault();event.target.click();}});
   }
   refreshState(state,m);
   options.mark?.();return state;
  }
  function bindRows(source,selector){for(const n of source.querySelectorAll(selector)){if(n.classList.contains('pfce-hit'))continue;n.classList.add('pfce-hit');n.setAttribute('tabindex','0');n.setAttribute('role','button');n.setAttribute('aria-label',(n.getAttribute('title')||n.textContent)+' — abrir lançamentos');}}
  function domBars(id,title,rows,options={}){
   const source=document.getElementById(id);if(!source)return;
   const selector=options.selector||'.pf-bar-row',nodes=[...source.querySelectorAll(selector)],labels=nodes.map(n=>options.label?.(n)||n.querySelector('span')?.getAttribute('title')||n.querySelector('span')?.textContent||n.textContent),values=nodes.map(n=>options.value?.(n)??D.number(n.querySelector('strong,.analysis-amount')?.textContent));
   const m=D.model(title,labels,[{label:options.series||'Valor',values,color:options.color||'#047857'}],(j,i)=>options.resolve?options.resolve(labels[i],i):rows.filter(r=>(r.categoria||'Outros')===labels[i]),options.additive!==false);
   m.records=rows;
   mount(source,m,{mark:()=>bindRows(source,selector),hit:target=>{const node=target.closest(selector);return node&&source.contains(node)?{j:0,i:nodes.indexOf(node)}:null;}});
  }
  function rootModels(){
   const monthly=contexts.monthly;
   if(monthly){
    monthlyExportTools();
    const rows=D.rows(monthly.rows),all=D.rows(window.PFQuickCards?window.PFQuickCards.apply(monthly.allRows):monthly.allRows),ref=String(monthly.chosen||new Date().toISOString()).slice(0,7).split('-').map(Number),months=Array.from({length:6},(_,i)=>D.month(ref[0],ref[1]-6+i));
    for(const [id,type,key,color]of [['clean-revenue-history-bars','Receita','revenueHistory','#047857'],['clean-history-bars','Despesa','expenseHistory','#bd2b20']]){
     domBars(id,type==='Receita'?'Evolução das Receitas':'Evolução das Despesas',all,{selector:'.analysis-row',color,resolve:(label,i)=>all.filter(r=>r.tipo===type&&r.vencimento.startsWith(months[i]?.key||'invalid'))});
    }
    for(const [id,type,color]of [['clean-revenue-category-bars','Receita','#047857'],['clean-category-bars','Despesa','#bd2b20']]){
     const source=document.getElementById(id);if(!source)continue;
     const native=[...source.querySelectorAll('details.analysis-rubric')],labels=native.map(n=>n.dataset.rubric),values=native.map(n=>D.number(n.querySelector('summary .analysis-amount')?.textContent)),scoped=rows.filter(r=>r.tipo===type);
     const m=D.model(type+' por rubrica',labels,[{label:type,values,color}],(j,i)=>scoped.filter(r=>(r.categoria||'Sem rubrica')===labels[i]));m.records=scoped;
     mount(source,m,{hit:target=>{
      if(target.closest('summary'))return null;
      const row=target.closest('.analysis-description-row'),group=row?.closest('details.analysis-rubric');if(!row||!group)return null;
      const description=row.querySelector('span')?.textContent;
      return {point:{key:'description:'+group.dataset.rubric+':'+description,label:description,series:type,value:D.number(row.querySelector('.analysis-amount')?.textContent),j:0,i:labels.indexOf(group.dataset.rubric)},rows:scoped.filter(r=>(r.categoria||'Sem rubrica')===group.dataset.rubric&&(r.descricao.trim()||'Sem descrição')===description)};
     },mark:()=>bindRows(source,'.analysis-description-row')});
    }
   }
   const modal=contexts.modal;
   if(modal){
    const arr=D.rows(modal.rows).filter(r=>r.vencimento&&r.valor!==0),des=arr.filter(r=>r.tipo==='Despesa');
    domBars('pfWaterfall','Cascata financeira',arr,{additive:false,resolve:label=>D.typeRows(arr,label).filter(r=>r.tipo!=='Investimentos')});
    domBars('pfRanking','Ranking de rubricas — despesas',des,{color:'#bd2b20'});
    const today=new Date();today.setHours(0,0,0,0);
    const bucket=r=>{if(!r.vencimento)return 3;const days=Math.max(0,Math.floor((today-new Date(r.vencimento+'T00:00:00'))/86400000));return days<=7?0:days<=30?1:2;};
    domBars('pfAtrasos','Vencidos por faixa de atraso',des,{color:'#b45309',resolve:(label,i)=>des.filter(r=>r.status==='Vencido'&&bucket(r)===i)});
    const ref=document.getElementById('graficoDataFim')?.value||document.getElementById('graficoDataInicio')?.value||new Date().toISOString().slice(0,10),month=ref.slice(0,7);
    domBars('pfHeatmap','Mapa de calor — despesas por dia do mês',des,{selector:'.pf-heat-cell',color:'#bd2b20',label:n=>'Dia '+n.querySelector('.pf-heat-day')?.textContent,value:n=>D.number(n.querySelector('.pf-heat-value')?.textContent),resolve:(label,i)=>des.filter(r=>r.vencimento===month+'-'+String(i+1).padStart(2,'0'))});
    const source=document.getElementById('pfDozeMeses');
    if(source){
     const d=new Date(ref+'T12:00:00'),from=document.getElementById('graficoDataInicio')?.value||'',to=document.getElementById('graficoDataFim')?.value||'';
     const months=Array.from({length:12},(_,i)=>D.month(d.getFullYear(),d.getMonth()-11+i)).filter(m=>(!from||m.key>=from.slice(0,7))&&(!to||m.key<=to.slice(0,7))&&arr.some(r=>['Receita','Despesa'].includes(r.tipo)&&r.vencimento.startsWith(m.key)));
     const bars=[...source.querySelectorAll('[title^="Receitas "],[title^="Despesas "]')],types=document.getElementById('graficoTipo')?.value||'Todos';
     const series=['Receita','Despesa'].filter(type=>types==='Todos'||types===type).map(type=>({label:type,color:type==='Receita'?'#047857':'#bd2b20',values:months.map(month=>arr.filter(r=>r.tipo===type&&r.vencimento.startsWith(month.key)).reduce((sum,r)=>sum+r.valor,0))}));
     const m=D.model('Histórico no recorte — meses com lançamentos',months.map(m=>m.label),series,(j,i)=>arr.filter(r=>r.tipo===series[j]?.label&&r.vencimento.startsWith(months[i]?.key)));m.records=arr;
     mount(source,m,{mark:()=>bindRows(source,'[title^="Receitas "],[title^="Despesas "]'),hit:target=>{const node=target.closest('[title^="Receitas "],[title^="Despesas "]');const key=node?.closest('[data-pf-month]')?.getAttribute('data-pf-month');const i=months.findIndex(m=>m.key===key),index=bars.indexOf(node);return i<0||index<0?null:{i,j:series.findIndex(s=>s.label===(index%2?'Despesa':'Receita'))};}});
    }
   }
   if(typeof Chart!=='undefined'){
    if(!Chart.$pfChartExplorer){Chart.$pfChartExplorer=true;Chart.register({id:'pfChartExplorer',afterUpdate(){schedule();}});}
    for(const id of ['chartEvolucao','chartRubricas']){
     const canvas=document.getElementById(id),chart=canvas&&Chart.getChart?.(canvas);if(!chart)continue;
     const comparisonContext=[contexts.comparison,contexts.comparisonBars].find(c=>c?.chart===chart),comparison=!!comparisonContext,context=comparisonContext||contexts.modal||{},records=D.rows(context.rows),labels=(chart.data.labels||[]).map(String),series=(chart.data.datasets||[]).map((s,j)=>({label:s.label||'Valor',sourceIndex:j,values:(s.data||[]).map(v=>typeof v==='object'?v.y:v),color:typeof s.borderColor==='string'?s.borderColor:typeof s.backgroundColor==='string'&&!s.backgroundColor.startsWith('rgba')?s.backgroundColor:colors[j%colors.length]})).filter(s=>chart.isDatasetVisible?.(s.sourceIndex)!==false);
     const title=document.getElementById(id==='chartEvolucao'?'tituloGraficoEvolucao':'tituloGraficoRubricas')?.textContent||id;
     const resolve=(j,i)=>{
      let rows=D.typeRows(records,series[j]?.label||'');const label=labels[i]||'';
      if(comparison){
       const months=context.months||[],n=D.norm(series[j]?.label+' '+label),month=months.find(m=>n.includes(D.norm(m.name)))||months[j%months.length];
       if(month)rows=rows.filter(r=>r.vencimento.startsWith(month.key));
       if(id==='chartEvolucao')rows=rows.filter(r=>Number(r.vencimento.slice(8,10))===Number(label));
       else rows=D.typeRows(rows,label);
       return rows;
      }
      if(chart.$pfGroupBy==='descricao')return records.filter(r=>r.tipo==='Receita'&&(r.descricao.trim()||'Sem descrição')===label);
      if(/^\d{2}\/\d{2}\/\d{4}$/.test(label))return rows.filter(r=>r.vencimento===label.split('/').reverse().join('-'));
      if(records.some(r=>(r.categoria||'Outros')===label))return rows.filter(r=>(r.categoria||'Outros')===label);
      return D.typeRows(rows,label);
     };
     const m=D.model(title,labels,series,resolve,!/saldo|balanço/i.test(title+' '+series.map(s=>s.label).join(' ')));m.records=records;m.groupBy=chart.$pfGroupBy||null;
     if(id==='chartRubricas'){
      let note=document.getElementById('pf-revenue-description-note');const heading=document.getElementById('tituloGraficoRubricas');
      if(!note&&heading){note=element('p','Receitas agrupadas por descrição, conforme os filtros selecionados.','pfce-message');note.id='pf-revenue-description-note';heading.after(note);}
      if(note)note.hidden=chart.$pfGroupBy!=='descricao';
     }
     if(series.some(s=>/saldo/i.test(s.label)))m.additiveSeries=series.map(s=>!/saldo|balanço/i.test(s.label));
     mount(canvas,m,{displayNode:canvas.parentElement,chart:()=>Chart.getChart(canvas)});
    }
   }
  }
  function reportWrapper(parent,nodes){
   let wrapper=parent.querySelector(':scope>.pfce-original');if(wrapper)return wrapper;
   if(!nodes.length)return null;wrapper=element('div',undefined,'pfce-original');nodes[0].before(wrapper);for(const node of nodes)wrapper.append(node);return wrapper;
  }
  function reportModels(){
   if(payload?.kind==='managerial'){
    const rows=D.rows(payload.rows),months=payload.months||[],spec=payload.series||[];
    const charts=[...document.querySelectorAll('.grafico')];
    if(charts[0]){
     const source=charts[0].querySelector('.grafico-area'),series=spec.map(s=>({label:s.label,color:s.color,values:months.map(m=>m[s.key]||0)}));
     const m=D.model('Comparativo financeiro',months.map(m=>m.label),series,(j,i)=>{
      const key=spec[j]?.key;let arr=rows.filter(r=>r.vencimento.startsWith(months[i]?.key||'invalid'));
      if(['receitas','recebidas'].includes(key))arr=arr.filter(r=>r.tipo==='Receita');else arr=arr.filter(r=>r.tipo==='Despesa');
      if(key==='recebidas')arr=arr.filter(r=>!['Não Recebido','A Vencer','Pendente','Vencido'].includes(r.status));
      if(key==='pagas')arr=arr.filter(r=>['Pago','Paga','Recebido','Recebida','Liquidado','Liquidada'].includes(r.status));
      if(key==='vencer')arr=arr.filter(r=>['A Vencer','Pendente','Não Recebido','Vencido'].includes(r.status));return arr;
     });m.records=rows;
     if(source)mount(source,m,{mark:()=>bindRows(source,'.pf-report-series'),hit:target=>{const nodes=[...source.querySelectorAll('.pf-report-series')],index=nodes.indexOf(target.closest('.pf-report-series'));return index<0?null:{i:Math.floor(index/series.length),j:index%series.length};}});
    }
    if(charts[1]){
     const source=charts[1].querySelector('.grafico-area'),entries=payload.descriptions||[];
     const m=D.model('Despesas por Descrição',entries.map(x=>x[0]),[{label:'Despesas',values:entries.map(x=>x[1]),color:'#bd2b20'}],(j,i)=>rows.filter(r=>r.tipo==='Despesa'&&r.descricao.trim()===entries[i]?.[0]));m.records=rows;
     if(source)mount(source,m,{mark:()=>bindRows(source,'.pf-report-item'),hit:target=>{const nodes=[...source.querySelectorAll('.pf-report-item')],index=nodes.indexOf(target.closest('.pf-report-item'));return index<0?null:{j:0,i:index};}});
    }
   }
   if(payload?.kind==='cashflow'){
    const m=payload.model,records=D.rows(m.rows),future=D.rows(m.future),base=D.rows(payload.base),seriesRows=(arr,type)=>type==='Receita'?arr.filter(r=>r.tipo==='Receita'):arr.filter(r=>r.tipo!=='Receita');
    const charts=[...document.querySelectorAll('.fc-chart')];
    for(const chart of charts){
     const title=chart.querySelector('h3')?.textContent||'',nodes=[...chart.children].filter(n=>n.matches('svg,.fc-category-columns')),source=reportWrapper(chart,nodes);if(!source)continue;
     if(title==='Evolução do saldo acumulado'||title==='Evolução do saldo projetado'){
      const projected=title.includes('projetado'),points=projected?m.projection:[{date:m.start||m.daily[0]?.date,balance:m.opening,initial:true},...m.daily];
      const model=D.model(title,points.map(p=>(p.initial?'Saldo inicial · ':'')+dateLabel(p.date||'')),[{label:'Saldo',values:points.map(p=>p.balance/100),color:'#2563eb'}],(j,i)=>{
       const p=points[i];if(!p?.date)return [];
       if(projected)return [...base.filter(r=>(r.dataPg||r.status==='Pago'||r.status==='Recebido')&&(r.dataPg||r.vencimento)&&(r.dataPg||r.vencimento)<=m.today),...future.filter(r=>r.vencimento<=p.date)];
       let end=p.date;if(m.group==='semana'&&!p.initial){const d=new Date(end+'T12:00:00');d.setDate(d.getDate()+6);end=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}if(m.group==='mes'&&!p.initial){const d=new Date(end+'T12:00:00'),last=new Date(d.getFullYear(),d.getMonth()+1,0);end=last.getFullYear()+'-'+String(last.getMonth()+1).padStart(2,'0')+'-'+String(last.getDate()).padStart(2,'0');}
       return base.filter(r=>r.vencimento&&(p.initial?r.vencimento<p.date:r.vencimento<=end&&(!m.end||r.vencimento<=m.end)));
      },false);model.records=projected?future:base;
      mount(source,model,{mark:()=>bindRows(source,'svg circle'),hit:target=>{const index=[...source.querySelectorAll('svg circle')].indexOf(target.closest('circle'));return index<0?null:{j:0,i:index};}});
     }else if(title==='Receitas × saídas por semana'){
      const buckets=new Map();for(const day of m.daily){const date=new Date(day.date+'T12:00:00');date.setDate(date.getDate()-((date.getDay()+6)%7));const key=date.getFullYear()+'-'+String(date.getMonth()+1).padStart(2,'0')+'-'+String(date.getDate()).padStart(2,'0'),b=buckets.get(key)||{key,r:0,d:0};b.r+=day.r;b.d+=day.d;buckets.set(key,b);}const entries=[...buckets.values()];
      const model=D.model(title,entries.map(x=>dateLabel(x.key)),[{label:'Receitas',values:entries.map(x=>x.r/100),color:'#047857'},{label:'Saídas',values:entries.map(x=>x.d/100),color:'#bd2b20'}],(j,i)=>seriesRows(records,j===0?'Receita':'Despesa').filter(r=>{const date=new Date(r.vencimento+'T12:00:00');date.setDate(date.getDate()-((date.getDay()+6)%7));return date.getFullYear()+'-'+String(date.getMonth()+1).padStart(2,'0')+'-'+String(date.getDate()).padStart(2,'0')===entries[i]?.key;}));model.records=records;
      mount(source,model,{mark:()=>bindRows(source,'svg rect'),hit:target=>{const index=[...source.querySelectorAll('svg rect')].indexOf(target.closest('rect'));return index<0?null:{j:index%2,i:Math.floor(index/2)};}});
     }else if(chart.classList.contains('fc-category-chart')){
      const entries=m.categories,model=D.model(title,entries.map(x=>x[0]),[{label:'Saídas',values:entries.map(x=>x[1]/100),color:'#bd2b20'}],(j,i)=>records.filter(r=>r.tipo!=='Receita'&&(r.categoria||'Sem rúbrica')===entries[i]?.[0]));model.records=records;
      mount(source,model,{mark:()=>bindRows(source,'.fc-category'),hit:target=>{const index=[...source.querySelectorAll('.fc-category')].indexOf(target.closest('.fc-category'));return index<0?null:{j:0,i:index};}});
     }
    }
   }
  }
  function refresh(){
   for(const state of states.values())if(!state.source.isConnected)refreshState(state,state.model||D.model('',[],[],()=>[]));
   if(payload)reportModels();else rootModels();
  }
  function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;refresh();});}
  function install(){
   refresh();
   const observer=new MutationObserver(records=>{if(records.some(r=>{
    const node=r.target.nodeType===1?r.target:r.target.parentElement;
    if(node?.closest('[data-pfce-ui]'))return false;
    if(r.type==='attributes')return r.target===document.body||r.target.id==='painelGerencial';
    return [...r.addedNodes,...r.removedNodes].some(n=>n.nodeType!==1||(!n.matches('[data-pfce-ui],svg.pf-fin-icon')&&!n.closest?.('[data-pfce-ui]')));
   }))schedule();});observer.observe(document.body,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['class']});
   window.addEventListener('beforeprint',()=>{refresh();for(const state of states.values())if(state.mode!=='default')draw(state);});
   window.addEventListener('afterprint',()=>{for(const state of states.values())if(state.mode!=='default')draw(state);});
  }
  const api={data:D,refresh,schedule,mount,capture(name,value){
   if(name==='monthly')contexts.monthly={rows:D.rows(value.rows),allRows:D.rows(value.allRows),chosen:value.chosen};
   else if(name==='modal')contexts.modal={rows:D.rows(value.rows)};
   else if(name==='comparison'||name==='comparisonBars')contexts[name]={...value,rows:D.rows(value.rows)};
   schedule();
  }};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
  return api;
 }
 const api=boot(chartData,null);
 api.decorate=(html,payload)=>{
  const report=new DOMParser().parseFromString(html,'text/html');
  const style=document.getElementById('pf-chart-explorer-style');if(style&&!report.getElementById(style.id))report.head.append(style.cloneNode(true));
  if(!report.getElementById('pf-chart-explorer-runtime')){
   // Only transaction fields are embedded; never auth/session objects.
   const safe={kind:payload.kind,rows:api.data.rows(payload.rows),base:api.data.rows(payload.base),months:payload.months,series:payload.series,descriptions:payload.descriptions};
   if(payload.model)safe.model={...payload.model,rows:api.data.rows(payload.model.rows),future:api.data.rows(payload.model.future),paid:undefined,overdue:undefined,allOverdue:undefined,largest:undefined};
   const script=report.createElement('script');script.id='pf-chart-explorer-runtime';
   script.textContent='window.PFChartExplorer=('+boot.toString()+')('+chartData.toString()+','+JSON.stringify(safe).replace(/</g,()=>String.fromCharCode(92)+'u003c').replace(/\u2028/g,()=>String.fromCharCode(92)+'u2028').replace(/\u2029/g,()=>String.fromCharCode(92)+'u2029')+');';report.body.append(script);
  }
  return '<!doctype html>\n'+report.documentElement.outerHTML;
 };
 window.PFChartExplorer=api;
})();
