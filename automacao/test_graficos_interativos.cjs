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
