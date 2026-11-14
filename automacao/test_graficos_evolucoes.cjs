const assert=require('assert/strict'),fs=require('fs'),vm=require('vm'),path=require('path');
const ctx=vm.createContext({window:{},console});for(const file of ['graficos_visao_geral.js','graficos_evolucoes.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,file),'utf8'),ctx);
const M=ctx.window.PFGraphicsMath,E=ctx.window.PFGraphicsEvolution,filter={year:2026,from:'2026-01-01',to:'2026-12-31',person:'Todas',basis:'realizado',dateMode:'efetiva',auto:{}};
const rows=[{id:1,tipo:'Receita',categoria:'EMPRESA',descricao:'Cliente A',valor:1000.11,vencimento:'2026-01-05',dataPg:'2026-02-05',status:'Recebido',tipoPessoa:'PF'},
 {id:2,tipo:'Receita',categoria:'SERVIÇOS',descricao:'Cliente B',valor:500,vencimento:'2026-11-05',dataPg:'2026-11-05',status:'Recebido',tipoPessoa:'PJ'},
 {id:3,tipo:'Receita',categoria:'EMPRESA',descricao:'Receita pendente',valor:900,vencimento:'2026-11-20',dataPg:'',status:'Não Recebido',tipoPessoa:'PF'},
 {id:4,tipo:'Despesa',categoria:'MORADIA',subItem:'Aluguel',descricao:'Aluguel',valor:100.05,vencimento:'2026-01-10',dataPg:'2026-01-10',status:'Pago',tipoPessoa:'PF'},
 {id:5,tipo:'Despesa',categoria:'SAÚDE',descricao:'Plano',valor:200,vencimento:'2026-11-07',dataPg:'2026-11-07',status:'Pago',tipoPessoa:'PF'},
 {id:6,tipo:'Despesa',categoria:'MORADIA',descricao:'Pendente',valor:50,vencimento:'2026-11-30',dataPg:'',status:'Pendente',tipoPessoa:'PF'},
 {id:7,tipo:'Investimentos',categoria:'Carteira',descricao:'Aporte',valor:700,vencimento:'2026-01-01',dataPg:'2026-01-01',status:'Pago',tipoPessoa:'PF'}];
const original=JSON.stringify(rows),make=f=>E.model(M.model(rows,f,'2026-11-13'),f),m=make(filter);
assert.equal(m.monthly.length,12);assert.equal(m.incomeTotal,150011);assert.equal(m.expenseTotal,30005);assert.equal(m.income.length,2);assert.equal(m.expense.length,2);assert.equal(m.monthly[0].income,0);assert.equal(m.monthly[1].income,100011);assert.equal(m.monthly[10].income,50000);assert.equal(m.monthly[0].expense,10005);assert.equal(m.monthly[10].expense,20000);assert.equal(m.monthly[11].expense,0);
assert.equal(m.income.reduce((n,g)=>n+g.value,0),m.incomeTotal);assert.equal(m.expense.reduce((n,g)=>n+g.value,0),m.expenseTotal);
for(const g of [...m.income,...m.expense])assert.equal(g.rows.reduce((n,t)=>n+Math.round(t.valor*100),0),g.value);
for(const month of m.monthly){assert.equal(month.incomeRows.reduce((n,t)=>n+Math.round(t.valor*100),0),month.income);assert.equal(month.expenseRows.reduce((n,t)=>n+Math.round(t.valor*100),0),month.expense);}
const due=make({...filter,dateMode:'vencimento'});assert.equal(due.monthly[0].income,100011);assert.equal(due.monthly[1].income,0);
const nov=make({...filter,from:'2026-11-01',to:'2026-11-30'});assert.equal(nov.annual,false);assert.equal(nov.incomeTotal,50000);assert.equal(nov.monthly.filter(k=>k.inScope).length,1);
const all=make({...filter,basis:'previsto'});assert.equal(all.incomeTotal,240011);assert.equal(all.expenseTotal,35005);
assert.equal(make({...filter,person:'PJ'}).expenseTotal,0);assert.equal(make({...filter,person:'PJ'}).incomeTotal,50000);
const picked=make({...filter,auto:{rubric:'EMPRESA'}});assert.equal(picked.incomeTotal,100011);assert.equal(picked.expenseTotal,0);assert.equal(picked.monthly[10].income,0); // não usa a renda do denominador da Visão Geral
assert.equal(make({...filter,auto:{month:'2026-11'}}).incomeTotal,50000);
const empty=make({...filter,from:'2026-12-01',to:'2026-12-31'});assert.equal(empty.incomeTotal,0);assert.equal(empty.expenseTotal,0);
assert.equal(make({...filter,rubric:'MORADIA',subItem:'Aluguel',min:100,max:101,status:'Pago',search:'Aluguel'}).expenseTotal,10005);
const escaped=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),calls=[];
const u={types:{revenueMonthly:'padrao',expenseMonthly:'padrao',revenueRubrics:'padrao',expenseRubrics:'padrao'},controls:id=>'<select data-test="'+id+'"></select>',plot:(series,id,percent,type)=>{calls.push([id,type]);return '<svg></svg>';},bars:()=>'<div>Barras</div>',hit:()=>'',detail:id=>'<aside>'+id+'</aside>',esc:escaped,money:n=>String(n),pct:n=>n==null?'N/D':String(n)+'%'};
const html=E.render(M.model(rows,filter,'2026-11-13'),filter,u);assert(html.includes('revenueMonthly'));assert(html.includes('expenseMonthly'));assert(html.includes('revenueRubrics'));assert(html.includes('expenseRubrics'));assert.deepEqual(calls,[['revenueMonthly','areas'],['expenseMonthly','colunas'],['expenseRubrics','colunas']]);assert(html.includes('Composição por rubrica'));
const unsafe=[{...rows[0],categoria:'<img src=x onerror=alert(1)>'}];const safeHTML=E.render(M.model(unsafe,filter,'2026-11-13'),filter,u);assert(!safeHTML.includes('<img'));assert(safeHTML.includes('&lt;img'));
const refund=[{...rows[4],valor:-10}];u.types.expenseRubrics='rosca';assert(E.render(M.model(refund,filter,'2026-11-13'),filter,u).includes('Rosca indisponível'));
assert.equal(JSON.stringify(rows),original);console.log('PASS Gráficos e Evoluções: quatro gráficos, cores/tipos padrão, soma exata dos detalhes, DT PG/vencimento, 12 meses, novembro/dezembro, previsão, filtros e autofiltros, escape e dados intactos.');
const source=fs.readFileSync(path.join(__dirname,'graficos_visao_geral.js'),'utf8'),keyboard=source.match(/function keyboardPick\(e\)\{[^\n]*\}/)[0];
const events=[],keyctx=vm.createContext({MouseEvent:class{constructor(type,options){this.type=type;Object.assign(this,options);}}});vm.runInContext(keyboard,keyctx);
let prevented=0;const target={matches:s=>s==='[data-go-pick]',dispatchEvent:e=>events.push(e)}; // SVG não precisa de HTMLElement.click()
for(const key of ['Enter',' ','Escape'])keyctx.keyboardPick({key,target,preventDefault:()=>prevented++});assert.equal(events.length,2);assert.equal(prevented,2);assert(events.every(e=>e.type==='click'&&e.bubbles));
const plotCode=source.slice(source.indexOf('function plot('),source.indexOf('function donut(')),plotctx=vm.createContext({types:{test:'colunas'},palette:['#00DE99'],esc:escaped,money:String,pct:String,hit:()=>''});vm.runInContext(plotCode,plotctx);
for(const value of [0,-100,100]){const svg=plotctx.plot([{label:'Série',values:[{label:'Janeiro',value,auto:{month:'2026-01'}}]}],'test');for(const [,y]of svg.matchAll(/(?:y|y1|y2|cy)="(-?[\d.]+)"/g))assert(Number(y)>=0&&Number(y)<=330,'Coordenada fora do gráfico: '+y);}
assert(E.render(M.model([],filter,'2026-11-13'),filter,u).includes('Sem registros para o período'));
