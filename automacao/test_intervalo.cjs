const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
(async()=>{
for(const file of ['index.html','teste-gemini/app.html']){
 const html=fs.readFileSync(path.resolve(__dirname,'..',file),'utf8');
 const script=id=>html.match(new RegExp('<script id="'+id+'">([\\s\\S]*?)</script>'))[1];
 const ctx={window:{},Date,Intl,AbortController};vm.createContext(ctx);vm.runInContext(script('pf-assistente-local-core'),ctx);vm.runInContext(script('pf-gemini-transport'),ctx);
 const core=ctx.window.PFAssistenteCore;
 const row=(date,value,extra={})=>({tipo:'despesa',vencimento:date,valor:value,categoria:'Categoria privada',descricao:'Descrição privada',...extra});
 const rows=[row('2026-10-19',1000),row('2026-10-20',10),row('2026-10-31',20),row('2026-11-01',30),row('2026-11-05',40),row('2026-11-06',2000)];
 const period={start:'2026-10-20',end:'2026-11-05'},now=new Date(2026,9,28);
 const s=core.summarize(rows,period,now);
 assert.equal(s.atual.despesas,10000);assert.equal(s.atual.quantidade,4);
 assert.equal(s.anterior.despesas,100000);assert.equal(s.intervalo.inicioAnterior,'2026-10-03');assert.equal(s.intervalo.fimAnterior,'2026-10-19');
 assert.equal(s.vencimentos.vencido,1000);assert.equal(s.vencimentos.proximos30,9000);
 assert.equal(core.summarize(rows,'2026-10',now).atual.despesas,103000);
 const text=core.answer('Quanto falta pagar?',rows,period,now);assert(text.includes('20/10/2026 a 05/11/2026'));assert(text.includes('4 lançamento(s)'));assert(!text.includes('19/10/2026'));
 const comparison=core.answer('Compare com o período anterior',rows,period,now);assert(comparison.includes('03/10/2026 a 19/10/2026'));
 assert.equal(core.periodBounds({start:'2024-02-29',end:'2024-02-29'}).previousEnd,'2024-02-28');
 assert.equal(core.periodBounds({start:'2026-01-01',end:'2026-01-01'}).previousStart,'2025-12-31');
 for(const bad of [{start:'2026-02-29',end:'2026-03-01'},{start:'2026-11-10',end:'2026-11-01'},{start:'',end:'2026-01-01'}])assert.throws(()=>core.summarize(rows,bad,now));
 const income=[row('2026-10-20',50,{tipo:'receita'}),row('2026-11-06',500,{tipo:'receita'})];assert(core.answer('Quanto falta receber?',income,period,now).includes('1 lançamento(s)'));
 let body;
 await ctx.window.PFGemini.query({question:'Resumo',summary:s,session:{access_token:'ficticio',user:{id:'teste'}},ownerId:'teste',baseUrl:'https://example.invalid',publicKey:'teste',fetcher:async(url,args)=>{body=JSON.parse(args.body);return {ok:true,json:async()=>({resposta:'Resumo de teste'})};}});
 assert.equal(body.resumo.intervalo.inicio,period.start);assert.equal(body.resumo.atual.despesas,10000);assert(body.pergunta.includes(period.end));assert(!JSON.stringify(body).includes('Categoria privada'));assert(!JSON.stringify(body).includes('Descrição privada'));assert(body.pergunta.length<=600);
 assert(html.includes('id="pfIaStart"'));assert(html.includes('id="pfIaEnd"'));assert(html.includes('id="pfIaPeriodMode"'));
 console.log('PASS: intervalo inclusivo, comparação, virada de mês/ano, ano bissexto, validação, receitas, vencimentos e payload Gemini em '+file);
}
})().catch(e=>{console.error(e);process.exitCode=1;});
