const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict');
for(const file of ['index.html','distribuicao/app.html','teste-gemini/app.html']){
 const html=fs.readFileSync(path.join(__dirname,'..',file),'utf8');
 for(const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)){if(!/\bsrc=|application\/json|ld\+json/.test(match[1]))new vm.Script(match[2]);}
 const start=html.indexOf('function monthAnalysisData('),end=html.indexOf('function install(){',start),ctx={Date,Map};vm.createContext(ctx);vm.runInContext(html.slice(start,end),ctx);
 const rows=[{tipo:'Receita',categoria:'Salário',valor:100,vencimento:'2025-12-10'},{tipo:'Receita',categoria:'Salário',valor:200,vencimento:'2025-12-20'},{tipo:'Receita',categoria:'Extra',valor:50,vencimento:'2026-01-01'},{tipo:'Despesa',categoria:'Casa',valor:80,vencimento:'2025-12-10'},{tipo:'Despesa',categoria:'Casa',valor:20,vencimento:'2026-01-10'},{tipo:'Investimentos',categoria:'Casa',valor:999,vencimento:'2026-01-10'},{tipo:'Receita',categoria:'Antiga',valor:900,vencimento:'2025-01-01'}];
 const before=JSON.stringify(rows),data=ctx.monthAnalysisData(rows.slice(0,5),rows,'2026-01-31');
 assert.equal(JSON.stringify(rows),before);assert.equal(data.revenueHistory.length,6);assert.equal(data.expenseHistory.length,6);
 assert.deepEqual(Array.from(data.revenueHistory,x=>x[1]),[0,0,0,0,300,50]);assert.deepEqual(Array.from(data.expenseHistory,x=>x[1]),[0,0,0,0,80,20]);
 assert.equal(data.revenueCategories[0][0],'Salário');assert.equal(data.revenueCategories[0][1],300);assert.equal(data.expenseCategories[0][1],100);
 const empty=ctx.monthAnalysisData([],[],'2026-01-31');assert.equal(empty.revenueCategories.length,0);assert(empty.expenseHistory.every(x=>x[1]===0));
 const a=html.indexOf('analysis.innerHTML='),b=html.indexOf(';table.parentElement.after(analysis);',a),layout=html.slice(a,b);
 const ids=['clean-revenue-history-bars','clean-history-bars','clean-revenue-category-bars','clean-category-bars'];
 ids.forEach((id,i)=>{assert(layout.includes(id));if(i)assert(layout.indexOf(ids[i-1])<layout.indexOf(id));});
 assert(html.includes("['clean-category-bars','clean-history-bars','clean-revenue-category-bars','clean-revenue-history-bars'].forEach(id=>$(id).replaceChildren())"));
 console.log('PASS:',file,'quatro gráficos, totais mensais, virada de ano, rubricas, meses vazios, proteção e sintaxe.');
}
