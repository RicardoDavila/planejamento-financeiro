/* Percentuais de gráficos: leitura pura, sem acesso a banco, autenticação ou rede. */
(()=>{'use strict';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pct=v=>v==null?'—':v.toLocaleString('pt-BR',{maximumFractionDigits:2})+'%';
const palette=['#00DE99','#FF4D6A','#00D7E8','#FFD166','#B49AFF','#FF8C42'];
function monthKey(value){
 const s=String(value||'').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
 if(/^\d{4}-(0[1-9]|1[0-2])$/.test(s))return s;
 const m=s.match(/^(jan(?:eiro|uary)?|fev(?:ereiro)?|feb(?:ruary|rero)?|mar(?:co|ch|zo)?|abr(?:il)?|apr(?:il)?|mai(?:o)?|may(?:o)?|jun(?:ho|e|io)?|jul(?:ho|y|io)?|ago(?:sto)?|aug(?:ust)?|set(?:embro)?|sep(?:tember|tiembre)?|out(?:ubro)?|oct(?:ober|ubre)?|nov(?:embro|ember|iembre)?|dez(?:embro)?|dec(?:ember)?|dic(?:iembre)?)[.\s/\-]+(?:de\s+)?(\d{4}|\d{2})$/);
 if(!m)return null;const index={jan:1,fev:2,feb:2,mar:3,abr:4,apr:4,mai:5,may:5,jun:6,jul:7,ago:8,aug:8,set:9,sep:9,out:10,oct:10,nov:11,dez:12,dec:12,dic:12}[m[1].slice(0,3)];return (m[2].length===2?'20':'')+m[2]+'-'+String(index).padStart(2,'0');
}
const ordinal=k=>k.startsWith('@')?Number(k.slice(1)):Number(k.slice(0,4))*12+Number(k.slice(5));
const display=k=>k.startsWith('@')?'Mês '+k.slice(1):k;
const pointKey=v=>Number.isSafeInteger(v.period)&&v.period>0?'@'+v.period:monthKey(v.month||v.key||v.auto?.month||v.label);
function variation(values,keys){return values.map((v,i)=>{
 const label=display(keys[i]),prev=values[i-1];let reason=i===0?'Primeiro mês: sem comparação':v==null||prev==null?'Valor não informado':ordinal(keys[i])-ordinal(keys[i-1])!==1?'Mês anterior fora do recorte':prev===0?'Percentual não calculável — mês anterior igual a zero':null;
 const value=reason?null:(v-prev)/prev*100;if(value!==null&&!Number.isFinite(value))reason='Percentual fora do limite numérico';
 const delta=v-prev,direction=reason?'':delta>0?'Aumento':delta<0?'Diminuição':'Estabilidade';
 return {label,value:reason?null:value,direction,reason};
});}
function monthly(series){
 if(!series.length)return null;const keys=series[0].values.map(pointKey);
 if(!keys.length||keys.some(k=>!k)||new Set(keys).size!==keys.length)return null;
 if(series.some(s=>s.values.length!==keys.length||s.values.some((v,i)=>pointKey(v)!==keys[i])))return null;
 return series.map((s,j)=>({label:s.label,color:s.color||palette[j%palette.length],keys,points:variation(s.values.map(v=>typeof v.value==='number'&&Number.isFinite(v.value)?v.value:null),keys)}));
}
function renderLines(data,{W=1100,H=300,L=85,R=20,T=24,B=42,x,scale=1}={}){
 const all=data.flatMap(s=>s.points.map(v=>v.value).filter(v=>v!==null)),lo=Math.min(0,...all),hi=Math.max(0,...all),span=hi-lo||1,min=lo===hi?-1:lo,max=lo===hi?1:hi;
 const y=v=>T+(max-v)/(max-min)*(H-T-B),right=(W-R)*scale+10,xx=x||((i)=>scale*(L+(i+.5)*(W-L-R)/data[0].keys.length));
 let svg='<g class="pfpct-axis" data-pf-percent="true"><text x="'+right+'" y="'+Math.max(12,T-10)+'">Variação (%)</text><line x1="'+right+'" x2="'+right+'" y1="'+T+'" y2="'+(H-B)+'" stroke="currentColor" opacity=".5"/>';
 for(let i=0;i<5;i++){const v=min+(max-min)*i/4;svg+='<text x="'+(right+6)+'" y="'+(y(v)+4)+'">'+esc(pct(v))+'</text>';}
 for(const s of data){let run=[];const flush=()=>{if(run.length>1)svg+='<polyline points="'+run.join(' ')+'" fill="none" stroke="'+esc(s.color)+'" stroke-width="2.5" stroke-dasharray="7 5" pointer-events="none"/>';run=[];};
  s.points.forEach((p,i)=>{if(p.value===null){flush();return;}run.push(xx(i)+','+y(p.value));const title=s.label+' · '+p.label+' · '+p.direction+' · '+pct(p.value);svg+='<circle class="pfpct-point" tabindex="0" role="img" aria-label="'+esc(title)+'" cx="'+xx(i)+'" cy="'+y(p.value)+'" r="4.5" fill="var(--dash-card,var(--pa-card,#17202c))" stroke="'+esc(s.color)+'" stroke-width="2"><title>'+esc(title)+'</title></circle>';});flush();
 }return svg+'</g>';
}
function enhance(html,series,options={}){
 const data=monthly(series);if(!data)return html;
 const legend='<div class="pfpct-legend" data-pf-percent="true">'+data.map(s=>'<span><i style="border-color:'+esc(s.color)+'"></i>'+esc(s.label)+' · variação mensal</span>').join('')+'</div>';
 let graphic=html;const g=options.geometry;
 if(g&&options.cartesian!==false&&/<svg\b/.test(html)){
  const scale=(g.W-135)/(g.W-g.R),overlay=renderLines(data,{...g,scale});
  graphic=html.replace(/(<svg\b[^>]*>)([\s\S]*?)(<\/svg>)/,(_,start,inner,end)=>start+'<g transform="scale('+scale+' 1)">'+inner+'</g>'+overlay+end);
 }else{
  const W=1100,H=250,L=85,R=135,T=30,B=35,n=data[0].keys.length;
  graphic+='<svg class="pfpct-svg" style="width:100%;height:auto" viewBox="0 0 1100 250" role="group" aria-label="Variação percentual mensal — escala própria">'+data[0].keys.map((k,i)=>'<text x="'+(L+(i+.5)*(W-L-R)/n)+'" y="240" text-anchor="middle">'+k+'</text>').join('')+renderLines(data,{W,H,L,R:20,T,B,scale:(W-135)/(W-20),x:i=>L+(i+.5)*(W-L-R)/n})+'</svg>';
 }
 const rows=data.flatMap(s=>s.points.map(p=>'<tr><td>'+esc(s.label)+'</td><td>'+p.label+'</td><td>'+esc(pct(p.value))+'</td><td>'+esc(p.reason||p.direction)+'</td></tr>')).join('');
 return graphic+legend+'<p class="pfpct-note" data-pf-percent="true">Linha pontilhada: variação relativa ao mês anterior, na escala percentual à direita. Primeiro mês e base anterior zero não geram ponto; lacunas não são ligadas. Períodos parciais podem não ser equivalentes. Zeros seguem os valores exibidos, inclusive meses sem registros; não comprovam mês completo. Em séries percentuais, a variação é relativa, não em pontos percentuais.</p><details class="pfpct-data" data-pf-percent="true"><summary>Variação mensal — valores e casos não calculáveis</summary><div class="pfpct-scroll"><table><thead><tr><th>Indicador</th><th>Mês</th><th>Variação</th><th>Leitura</th></tr></thead><tbody>'+rows+'</tbody></table></div></details>';
}
const validDay=d=>/^\d{4}-\d{2}-\d{2}$/.test(d||'')&&Number.isFinite(Date.parse(d+'T12:00:00Z'))&&new Date(d+'T12:00:00Z').toISOString().slice(0,10)===d;
function shares(rows,options={}){
 const groups=new Map(),totals=new Map();
 for(const t of rows||[]){if(!['Receita','Despesa'].includes(t.tipo)||!Number.isFinite(Number(t.valor)))continue;
  const date=options.dateMode==='vencimento'?t.vencimento:validDay(t.dataPg)?t.dataPg:t.vencimento;
  if(!validDay(date))continue;
  const month=date.slice(0,7),rubric=String(t.categoria||'Sem rubrica'),sub=String(t.subItem||'Sem subitem'),value=Math.round(Number(t.valor)*100),scope=JSON.stringify([month,t.tipo]);
  totals.set(scope,(totals.get(scope)||0)+value);
  for(const child of [false,true]){const key=JSON.stringify([month,t.tipo,rubric,child?sub:null]);const g=groups.get(key)||{month,type:t.tipo,rubric,sub:child?sub:null,value:0,scope};g.value+=value;groups.set(key,g);}
 }
 return [...groups.values()].map(g=>({...g,total:totals.get(g.scope),percent:totals.get(g.scope)===0||!Number.isSafeInteger(totals.get(g.scope))||!Number.isSafeInteger(g.value)?null:g.value/totals.get(g.scope)*100})).sort((a,b)=>a.month.localeCompare(b.month)||a.type.localeCompare(b.type)||a.rubric.localeCompare(b.rubric)||(a.sub===null?-1:b.sub===null?1:a.sub.localeCompare(b.sub)));
}
function participation(rows,options={}){
 const data=shares(rows,options);if(!data.length)return '';
 const money=v=>(v/100).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
 return '<details class="pfpct-shares" data-pf-percent="true"'+(options.open?' open':'')+'><summary>Participação mensal de rubricas e subitens</summary><p class="pfpct-note">Rubrica ou subitem ÷ total do mesmo mês e tipo no recorte filtrado. Receitas e despesas têm totais separados; subitens também usam o total do tipo, não o da rubrica. Total mensal zero: percentual não exibido. Não some rubricas e seus subitens, pois representam os mesmos lançamentos.</p><div class="pfpct-scroll"><table><thead><tr><th>Mês</th><th>Tipo</th><th>Rubrica / subitem</th><th>Valor · participação no mês</th><th>Total mensal do tipo</th></tr></thead><tbody>'+data.map(v=>'<tr><td>'+v.month+'</td><td>'+v.type+'</td><td>'+esc(v.rubric)+(v.sub===null?'':' / '+esc(v.sub))+'</td><td>'+esc(money(v.value))+(v.percent===null?'':' · '+esc(pct(v.percent)))+'</td><td>'+esc(money(v.total))+'</td></tr>').join('')+'</tbody></table></div></details>';
}
const api={monthKey,variation,monthly,enhance,shares,participation};if(typeof window!=='undefined')window.PFChartPercentages=api;if(typeof module!=='undefined')module.exports=api;
})();
