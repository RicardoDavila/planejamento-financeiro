const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
for(const file of ['index.html','teste-gemini/app.html']){
 const html=fs.readFileSync(path.resolve(__dirname,'..',file),'utf8');
 const code=html.match(/function atualizarStatusDespesasAutomaticamente\(lista\) \{[\s\S]*?return alterou;\s*\}/)[0];
 let current='2026-10-28';const ctx={obterDataLocalISO:()=>current,gerarIdTexto:(prefix,x)=>prefix+':'+x,DATA_ABERTURA_PROJETO:'2026-10-01'};vm.createContext(ctx);vm.runInContext(code,ctx);
 const rows=[{id:1,tipo:'Despesa',vencimento:'2026-10-16',status:'A Vencer',valor:1415.50},{id:2,tipo:'Despesa',vencimento:'2026-10-28',status:'A Vencer'},{id:3,tipo:'Despesa',vencimento:'2026-10-30',status:'Vencido'},{id:4,tipo:'Despesa',vencimento:'2026-10-16',status:'Pago'},{id:5,tipo:'Despesa',vencimento:'2026-10-16',status:'A Vencer',dataPg:'2026-10-17'},{id:6,tipo:'Receita',vencimento:'2026-10-16',status:'Não Recebido'},{id:7,tipo:'Investimentos',vencimento:'2026-10-16',status:'Pendente'},{id:8,tipo:'Despesa',vencimento:'',status:'Pendente'}];
 assert(ctx.atualizarStatusDespesasAutomaticamente(rows));assert.equal(rows[0].status,'Vencido');assert.equal(rows[0].valor,1415.50);assert.equal(rows[0].id,1);assert.equal(rows[1].status,'Pendente');assert.equal(rows[2].status,'A Vencer');assert.equal(rows[3].status,'Pago');assert.equal(rows[4].status,'A Vencer');assert.equal(rows[5].status,'Não Recebido');assert.equal(rows[6].status,'Pendente');assert.equal(rows[7].status,'Pendente');assert(!ctx.atualizarStatusDespesasAutomaticamente(rows));
 current='2026-10-31';assert(ctx.atualizarStatusDespesasAutomaticamente(rows));assert.equal(rows[1].status,'Vencido');assert.equal(rows[2].status,'Vencido');assert.equal(rows[3].status,'Pago');
 assert(!html.includes('vencimentoVal < DATA_ABERTURA_PROJETO'));assert(!html.includes('vencimentoNovo < DATA_ABERTURA_PROJETO'));
 console.log('PASS: vencimento 16/10, hoje, futuro, virada do dia, pagos e receitas preservados em '+file);
}
