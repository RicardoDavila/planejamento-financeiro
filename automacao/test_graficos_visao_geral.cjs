const assert=require('assert/strict'),fs=require('fs'),vm=require('vm'),path=require('path');
const code=fs.readFileSync(path.join(__dirname,'graficos_visao_geral.js'),'utf8'),ctx=vm.createContext({window:{},console});vm.runInContext(code,ctx);const M=ctx.window.PFGraphicsMath;
const f={year:2026,from:'2026-01-01',to:'2026-12-31',person:'Todas',basis:'realizado',dateMode:'efetiva',auto:{}};
let id=0;const row=(date,value,category='MORADIA',other={})=>({id:++id,vencimento:date,dataPg:date,tipo:'Despesa',valor:value,categoria:category,subItem:'Aluguel',descricao:'Aluguel',status:'Pago',tipoPessoa:'PF',...other});
const data=[row('2026-01-02',100),row('2026-02-02',150),row('2026-01-03',200,'SAÚDE',{descricao:'Saúde',subItem:'Plano'}),row('2026-02-03',100,'SAÚDE',{descricao:'Saúde',subItem:'Plano'}),row('2026-01-04',1000,'EMPRESA',{tipo:'Receita',descricao:'Cliente',status:'Recebido'}),row('2026-02-04',1000,'EMPRESA',{tipo:'Receita',descricao:'Cliente',status:'Recebido'}),row('2026-02-05',30,'EMPRESA',{dataPg:'',status:'Pendente',descricao:'Pendente',tipoPessoa:'PJ'}),row('2026-01-06',5,'EXTRA',{descricao:'Uma vez'}),row('2026-01-06',7,'EXTRA',{descricao:'Uma vez'})];
const original=JSON.stringify(data),m=M.model(data,f,'2026-11-13');assert.equal(m.total,56200);assert.equal(m.monthly.length,12);assert.equal(m.monthly[0].expenses,31200);assert.equal(m.monthly[1].expenses,25000);assert.equal(m.meanMonths,2);assert.equal(m.growth[0].label,'MORADIA');assert.equal(m.growth[0].change,50);assert.equal(m.decrease[0].label,'EXTRA');assert.equal(m.monthly[0].categories.find(c=>c.label==='MORADIA').percent,10);assert.equal(m.monthly[11].categories[0].percent,null);assert.equal(m.commitments.length,2);assert.equal(m.recurringTotal,25000);assert(!m.commitments.some(c=>c.label==='Uma vez'));
const jan=M.model(data,{...f,from:'2026-01-01',to:'2026-01-31'},'2026-11-13');assert.equal(jan.weekly.reduce((n,w)=>n+w.days,0),31);assert.equal(jan.growth.length,0);assert.equal(jan.decrease.length,0);assert.equal(jan.monthly[11].expenses,0);
const cross=M.model(data,{...f,auto:{rubric:'MORADIA'}},'2026-11-13');assert.equal(cross.total,25000);assert.equal(cross.categories.length,1);assert.equal(cross.monthly[0].categories[0].percent,10); // renda de referência conservada
const point=M.model(data,{...f,auto:{rubric:'MORADIA',month:'2026-02'}},'2026-11-13');assert.equal(point.total,15000);assert.equal(point.active.length,1);assert.equal(point.monthly[1].categories[0].percent,15);
assert.equal(M.model(data,{...f,auto:{weekday:0}},'2026-11-13').expenses.length,1);
assert.equal(M.model(data,{...f,auto:{commitments:[m.commitments[0].key]}},'2026-11-13').categories.length,1);
assert.equal(M.model(data,{...f,basis:'previsto',person:'PJ',status:'Pendente',type:'Despesa',search:'pendente',rubric:'EMPRESA',subItem:'Aluguel',min:30,max:30},'2026-11-13').total,3000);
assert.equal(M.model(data,{...f,person:'PJ'},'2026-11-13').total,0);
assert.equal(M.model([row('2026-11-09',50)],f,'2026-11-13').monthly[10].expenses,5000);
const shifted=row('2026-01-01',10,'MORADIA',{dataPg:'2026-11-01'});assert.equal(M.model([shifted],f,'2026-11-13').monthly[10].expenses,1000);assert.equal(M.model([shifted],{...f,dateMode:'vencimento'},'2026-11-13').monthly[0].expenses,1000);
assert.equal(M.model([row('2026-02-30',10)],f,'2026-11-13').invalidDates,1);assert.equal(M.model([row('2026-01-01',NaN)],f,'2026-11-13').total,0);
assert.throws(()=>M.model([],{...f,from:'2026-02-30'},'2026-11-13'));assert.throws(()=>M.model([],{...f,to:'2027-01-01'},'2026-11-13'));
assert.equal(M.model([],{...f,from:'2026-12-01',to:'2026-12-31'},'2026-11-13').weekly.reduce((n,w)=>n+w.days,0),0);
assert.equal(M.model([],{...f,year:2024,from:'2024-02-01',to:'2024-02-29'},'2026-11-13').weekly.reduce((n,w)=>n+w.days,0),29);
assert.equal(M.model([row('2026-11-20',20)],f,'2026-11-13').weekly.reduce((n,w)=>n+w.total,0),0);
assert.equal(M.model([row('2026-11-20',20)],{...f,basis:'previsto'},'2026-11-13').weekly.reduce((n,w)=>n+w.total,0),2000);
assert.equal(m.referenceRevenue,200000);assert.equal(cross.referenceRevenue,200000);
assert.equal(JSON.stringify(data),original);console.log('PASS Visão Geral: centavos, 12 meses, janeiro/novembro, DT PG/vencimento, filtros combinados, autofiltros, percentuais N/D, ranking, semana sem futuro realizado, recorrência e imutabilidade.');

