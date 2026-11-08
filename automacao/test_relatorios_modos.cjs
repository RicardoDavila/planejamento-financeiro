const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),path=require('path');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const window={localStorage:{getItem:()=>null,setItem(){throw Error('Não deve gravar')} }};
const c={window,document:{readyState:'loading',addEventListener(){}},Date,console,alert(){}};
vm.createContext(c);vm.runInContext(read('automacao/relatorios_modos.js'),c);
vm.runInContext(read('automacao/idiomas.js'),c);vm.runInContext(read('automacao/moedas.js'),c);
vm.runInContext(read('index.html').match(/<script id="pf-cashflow-report">([\s\S]*?)<\/script>/)[1],c);
const api=window.PFReportSelection,C=window.PFCashFlow;
let id=0;const tx=(date,value,type='Despesa',extra={})=>({id:++id,vencimento:date,valor:value,tipo:type,status:'Pendente',descricao:'Registro '+id,...extra});
const base=[tx('2026-10-01',20000,'Receita',{status:'Recebido',dataPg:'2026-10-01'}),tx('2026-10-20',3930,'Receita'),tx('2026-10-20',9000,'Receita'),tx('2026-11-01',100,'Despesa',{status:'Pago',dataPg:'2026-11-02'}),tx('2026-11-19',25000),tx('2026-11-20',27000,'Receita'),tx('2026-11-07',0.1),tx('2026-11-07',0.2),tx('2026-11-21',60,'Investimentos')];
const rows=base.filter(t=>t.vencimento>='2026-11-01'),before=JSON.stringify(base),context={rows,base,start:'2026-11-01',end:'2026-11-30',today:'2026-11-08',balanceAvailable:true,filters:'Todos'};
const m=api.model(context),old=C.calculate(base,rows,context.start,context.end,context.today);
assert.equal(m.opening,old.opening);assert.equal(m.closing,old.closing);assert.equal(m.current,old.current);
assert.equal(m.minimum.balance,Math.min(...old.projection.map(p=>p.balance)));
assert.equal(m.minimumScheduled.balance-m.minimum.balance,1293000-30);
assert.equal(m.stats.pastReceivable,1293000);assert.equal(m.stats.overdueExpense,30);assert.equal(m.stats.due,2500000);assert.equal(m.stats.investment,6000);
assert.equal(m.stats.received,0);assert.equal(m.stats.receivable,2700000);assert.equal(m.top[0].valor,2500000);
assert.equal(m.projection.length,30);assert.equal(m.futureLabel,'2026-11-08 a 2026-12-07');assert.equal(JSON.stringify(base),before);
const filtered=api.model({...context,rows:rows.filter(t=>t.tipo==='Despesa'),balanceAvailable:false});assert.equal(filtered.opening,null);assert.equal(filtered.minimum,null);assert.equal(filtered.projection.length,0);
const empty=api.model({...context,rows:[],base:[]});assert.equal(empty.stats.revenue,0);assert.equal(empty.closing,0);
const unavailable=api.model({...context,rows:undefined,balanceAvailable:false});assert.equal(unavailable.stats,null);
assert.throws(()=>api.model({...context,start:'2026-02-30'}));assert.throws(()=>api.model({...context,rows:[tx('2026-11-10',NaN)]}));
const malicious=api.prepare({...context,title:'<script>bad</script>',rows:[tx('2026-11-10',1,'Despesa',{descricao:'<img src=x onerror=bad()>'})]});assert(!malicious.html.includes('<img src=x'));assert(malicious.html.includes('&lt;img'));assert(malicious.html.includes('Despesas vencidas no período'));assert(malicious.html.includes('cinco maiores'));
const raw='<html><head></head><body><h2>Teste</h2><script>const fechamento="</body>";</script><p>Final</p></body></html>';
api.setContext(context);let html=api.decorate(raw);html=window.PFI18n.decorate(html);html=window.PFCurrency.decorate(html);
let scripts=[...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)];assert.equal(scripts.length,4);scripts.forEach((m,i)=>new vm.Script(m[1],{filename:'serializado-'+i}));
assert.equal(html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,''),'<html><head></head><body><h2>Teste</h2><p>Final</p></body></html>');
assert.equal(api.decorate(html),html);
// Repeated exports consume their own immutable snapshot, without using the previous filters.
api.setContext({...context,title:'Primeiro'});const first=api.decorate(raw);api.setContext({...context,title:'Segundo',rows:[]});const second=api.decorate(raw);assert(first.includes('Primeiro'));assert(second.includes('Segundo'));assert(!second.includes('Primeiro'));
for(const file of ['index.html','distribuicao/app.html','teste-gemini/app.html','graficos.html','distribuicao/graficos.html','teste-gemini/graficos.html']){
 const source=read(file);assert(source.includes('pf-report-selection-module'));for(const match of source.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)){if(!/application\/(?:ld\+)?json|type="module"/.test(match[1]))new vm.Script(match[2]);}
}
console.log('PASS: dois modos, centavos, bases reconciliadas, filtros, vazios, datas, escape, imutabilidade, seis telas e composição idioma/moeda sem código fora de script.');
