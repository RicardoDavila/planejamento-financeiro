const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict');
for(const name of ['index.html','distribuicao/app.html','teste-gemini/app.html']){
 const html=fs.readFileSync(path.join(__dirname,'..',name),'utf8');
 const start=html.indexOf('function monthAnalysisData('),end=html.indexOf('function install(){',start);
 const context={Date,Map};vm.createContext(context);vm.runInContext(html.slice(start,end),context);
 const rows=[
  {tipo:'Receita',categoria:'EMPRESA',descricao:'Salário',valor:100,vencimento:'2026-11-01'},
  {tipo:'Receita',categoria:'EMPRESA',descricao:'Salário',valor:150,vencimento:'2026-11-02'},
  {tipo:'Receita',categoria:'EMPRESA',descricao:'Bônus',valor:50,vencimento:'2026-11-03'},
  {tipo:'Receita',categoria:'EXTRA',descricao:'Salário',valor:30,vencimento:'2026-11-03'},
  {tipo:'Receita',categoria:'EXTRA',descricao:' ',valor:20,vencimento:'2026-11-03'},
  {tipo:'Despesa',categoria:'EMPRESA',descricao:'Salário',valor:999,vencimento:'2026-11-03'},
  {tipo:'Receita',categoria:'EXTRA',descricao:'<img src=x>',valor:10,vencimento:'2026-11-03'}
 ];
 const original=JSON.stringify(rows),data=context.monthAnalysisData(rows,rows,'2026-11-30');
 assert.equal(data.revenueCategories[0][1],300);
 assert.equal(data.revenueDescriptions.get('EMPRESA').get('Salário'),250);
 assert.equal(data.revenueDescriptions.get('EXTRA').get('Salário'),30);
 assert.equal(data.revenueDescriptions.get('EXTRA').get('Sem descrição'),20);
 const filtered=context.monthAnalysisData(rows.slice(0,1),rows,'2026-11-30');
 assert.equal(filtered.revenueDescriptions.get('EMPRESA').get('Salário'),100);
 assert.equal(filtered.revenueCategories.length,1);
 const escape=x=>String(x).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
 const bars=context.categoryBreakdownBars(data.revenueCategories,data.revenueDescriptions,String,escape);
 assert.equal((bars.match(/<details /g)||[]).length,2);
 assert.equal((bars.match(/analysis-row analysis-description-row/g)||[]).length,5);
 assert(!bars.includes(' open>'));
 const open=context.categoryBreakdownBars(data.revenueCategories,data.revenueDescriptions,String,escape,new Set(['EMPRESA']));
 assert.equal((open.match(/ open>/g)||[]).length,1);
 const expense=context.categoryBreakdownBars(data.expenseCategories,data.expenseDescriptions,String,escape);
 assert.equal((expense.match(/<details /g)||[]).length,1);assert(expense.includes('999'));
 assert.equal(data.expenseDescriptions.get('EMPRESA').get('Salário'),999);
 assert(bars.includes('&lt;img src=x&gt;'));assert(!bars.includes('<img'));
 assert(bars.includes('width:100%'));assert(bars.includes('width:83.33333333333334%'));
 assert.equal(context.categoryBreakdownBars([],new Map(),String,escape),'');
 assert.equal(JSON.stringify(rows),original);
 assert(html.includes('<h3>Receitas por Rubrica (clique na barra para abrir lançamentos)</h3>'));
 assert(html.includes('<h3>Despesas por Rubricas (clique na barra para abrir lançamentos)</h3>'));
 assert(html.includes('expandedRevenue.clear();expandedExpense.clear();'));
 console.log('PASS:',name,'rubrica e descrições, somas, filtros, nomes repetidos, dados vazios, escape e imutabilidade.');
}
