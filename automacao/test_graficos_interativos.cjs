const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),path=require('path');
const code=fs.readFileSync(path.join(__dirname,'graficos_interativos.js'),'utf8');new vm.Script(code);
const start=code.indexOf(' function chartData(){'),end=code.indexOf(' function boot(',start),ctx={};vm.createContext(ctx);vm.runInContext(code.slice(start,end)+';globalThis.D=chartData();',ctx);const D=ctx.D;
assert.equal(D.number('R$ 27.000,00 (99,9%)'),27000);assert.equal(D.number('-R$ 1.234,56'),-1234.56);assert.equal(D.number('—'),0);assert.equal(D.number(Infinity),0);
const original=[{tipo:'Receita',categoria:'A',descricao:'<img src=x>',valor:1.25,secretToken:'NÃO COPIAR',vencimento:'2026-11-01'},{tipo:'Despesa',categoria:'A',descricao:'Conta',valor:3.50}];const snapshot=JSON.stringify(original),clean=D.rows(original);assert(!('secretToken' in clean[0]));assert.equal(clean[0].descricao,'<img src=x>');assert.equal(JSON.stringify(original),snapshot);
const labels=Array.from({length:12},(_,i)=>'Categoria '+i),values=labels.map((_,i)=>i+1),m=D.model('Composição',labels,[{label:'Total',values}],()=>clean);
assert.notEqual(m.labels,labels);assert.notEqual(m.series[0].values,values);
const pie=D.pie(m,0);assert.equal(pie.parts.length,8);assert.equal(pie.parts.reduce((s,p)=>s+p.value,0),values.reduce((s,v)=>s+v,0));assert.equal(pie.parts.at(-1).label,'Outros');assert.equal(new Set(pie.parts.flatMap(p=>Array.from(p.indices))).size,12);
assert(D.pie(D.model('Saldo',['A'],[{label:'Saldo',values:[-10]}],()=>[],false),0).error);
assert(D.pie(D.model('Negativo',['A'],[{label:'Total',values:[-10]}],()=>[]),0).error);
assert(D.pie(D.model('Zero',['A'],[{label:'Total',values:[0]}],()=>[]),0).error);
assert.equal(D.points(D.model('Par',['Jan','Fev'],[{label:'Receitas',values:[10,20]},{label:'Despesas',values:[4,7]}],()=>[])).length,4);
const groups=D.grouped([...clean,{...clean[0],valor:2.75}]);assert.equal(groups.find(x=>x.label.startsWith('Receita')).value,4);assert.equal(groups.find(x=>x.label.startsWith('Despesa')).value,3.5);
for(const name of ['index.html','distribuicao/app.html','teste-gemini/app.html']){
 const html=fs.readFileSync(path.join(__dirname,'..',name),'utf8');
 assert(html.includes("capture('modal',{rows:arr})"));assert(html.includes("capture('monthly',{rows,allRows:transacoes,chosen})"));
 assert(html.includes("kind:'managerial',rows:lista"));assert(html.includes("kind:'cashflow',model:m"));
 assert.equal((html.match(/<script id="pf-chart-explorer">/g)||[]).length,1);
}
console.log('PASS: leitura monetária, sanitização, imutabilidade, séries, composição, negativos, zeros, Outros e integração das três versões/relatórios.');
// Exercita a exportação mensal com um documento isolado, sem navegador ou rede.
{
 class ReportNode {
  constructor(tag,text=''){this.tag=tag;this.textContent=text;this.children=[];this.attributes=[];this.hidden=false;}
  append(...nodes){this.children.push(...nodes)}
  removeAttribute(){}
  getAttribute(){return null}
  querySelectorAll(){return []}
  clone(){const n=new ReportNode(this.tag,this.textContent);n.className=this.className;n.children=this.children.map(c=>c.clone());return n;}
  get outerHTML(){const esc=s=>String(s??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');return '<'+this.tag+['className','src','alt','name','content','lang'].filter(k=>this[k]).map(k=>' '+(k==='className'?'class':k)+'="'+esc(this[k])+'"').join('')+'>'+esc(this.textContent)+this.children.map(n=>n.outerHTML).join('')+'</'+this.tag+'>';}
 }
 const makeDoc=()=>{const d={createElement:t=>new ReportNode(t),importNode:n=>n.clone(),head:new ReportNode('head'),body:new ReportNode('body'),documentElement:new ReportNode('html')};d.documentElement.append(d.head,d.body);return d;};
 let output='',openCalls=0,blocked=false,denied=false,decorated=0,messages=[];
 const popup={document:{open(){},write:s=>output=s,close(){}},close(){}};
 const source=()=>({isConnected:true,closest:s=>s==='#clean-month-analysis'?{}:null});
 const first={source:source(),model:{title:'Receitas <teste>'},mode:'area',alt:new ReportNode('div','Gráfico de áreas selecionado'),displayNode:new ReportNode('div','Barras originais'),select:{selectedOptions:[{textContent:'Áreas'}]},seriesLabel:{hidden:true}};
 const second={...first,source:source(),model:{title:'Despesas'},alt:new ReportNode('div','Pizza selecionada'),mode:'pie',select:{selectedOptions:[{textContent:'Pizza (circular)'}]}};
 const c={states:new Map([[1,first],[2,second]]),contexts:{monthly:{chosen:'2026-11-01'}},protectedState:s=>!!s.locked,Date,alert:s=>messages.push(s),obterPeriodoFiltroPainel:()=> '01/11/2026 a 30/11/2026',document:{implementation:{createHTMLDocument:makeDoc},getElementById:()=>({textContent:'.pfce-svg{}'})},window:{pfdAssert(){if(denied)throw Error('Conta alterada')},open(){openCalls++;return blocked?null:popup},PFReportTheme:{logo:'data:image/png;base64,PROJETO',decorate:s=>s},PFReportSelection:{decorate:s=>{decorated++;return s}},PFCashFlow:{filters:()=> 'Tipo: Receita & Despesa'}}};
 vm.createContext(c);vm.runInContext(code.slice(code.indexOf('  function exportMonthlyChart('),code.indexOf('  function monthlyExportTools(')),c);
 c.exportMonthlyChart();assert.equal(openCalls,1);assert.equal(decorated,1);
 for(const value of ['Logotipo do Planejamento Financeiro','data:image/png;base64,PROJETO','Planejamento Financeiro','01/11/2026 a 30/11/2026','Tipo: Receita &amp; Despesa','Emitido em','Gráfico de áreas selecionado','Pizza selecionada'])assert(output.includes(value),value);
 assert(output.includes('Receitas &lt;teste&gt;'));assert(!output.includes('Barras originais'));
 c.exportMonthlyChart(first.source);assert(output.includes('Gráfico de áreas selecionado'));assert(!output.includes('Pizza selecionada'));
 first.alt.hidden=true;c.exportMonthlyChart(first.source);assert(output.includes('Barras originais'));first.alt.hidden=false;
 const before=openCalls;first.locked=true;c.exportMonthlyChart();assert.equal(openCalls,before);first.locked=false;denied=true;c.exportMonthlyChart();assert.equal(openCalls,before);denied=false;
 blocked=true;c.exportMonthlyChart();assert(messages.at(-1).includes('nova aba'));
 for(const file of ['index.html','distribuicao/app.html','teste-gemini/app.html']){const html=fs.readFileSync(path.join(__dirname,'..',file),'utf8');assert(html.includes('function exportMonthlyChart(source)'));assert(html.includes("['Salvar em PDF','Imprimir']"));assert(html.includes("logo.src=window.PFReportTheme.logo"));}
 console.log('PASS: exportação mensal completa/individual, cabeçalho, logotipo, período, filtros, tipo selecionado, bloqueio de acesso e popup bloqueado.');
}
