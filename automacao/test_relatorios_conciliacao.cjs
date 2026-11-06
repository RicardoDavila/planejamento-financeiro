(async()=>{
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),path=require('path');
const root=path.resolve(__dirname,'..');
const tx=(date,valor,tipo='Despesa',extra={})=>({vencimento:date,valor,tipo,status:tipo==='Receita'?'Não Recebido':'A Vencer',categoria:'Teste',subItem:'Teste',descricao:'Registro de teste',...extra});
for(const name of ['index.html','distribuicao/app.html','teste-gemini/app.html']){
 const html=fs.readFileSync(path.join(root,name),'utf8'),ctx={window:{},document:{readyState:'loading',addEventListener(){}},Date,Map};
 vm.createContext(ctx);vm.runInContext(html.match(/<script id="pf-cashflow-report">([\s\S]*?)<\/script>/)[1],ctx);
 const api=ctx.window.PFCashFlow;
 const rows=[tx('2026-10-01',33819.67,'Despesa',{status:'Pago',dataPg:'2026-10-01'}),tx('2026-10-20',12930,'Receita'),tx('2026-11-01',992.75,'Despesa',{status:'Pago',dataPg:'2026-11-03'}),tx('2026-11-05',3256.97),tx('2026-11-06',160),tx('2026-11-08',194.32),tx('2026-11-09',2652.83),tx('2026-11-10',1190,'Despesa',{descricao:'Conferir repetição'}),tx('2026-11-10',1190,'Despesa',{descricao:'Conferir repetição'}),tx('2026-11-10',1721.77),tx('2026-11-20',27000,'Receita')];
 const chosen=rows.filter(t=>t.vencimento>='2026-11-01');
 const m=api.calculate(rows,chosen,'2026-11-01','2026-11-30','2026-11-04');
 assert.equal(m.opening,-2088967);assert.equal(m.revenue-m.expense,1564136);assert.equal(m.closing,-524831);
 assert.equal(m.cutScheduled,-2188242);assert.equal(m.cutUnreceived,1293000);assert.equal(m.current,-3481242);
 assert.equal(m.cutScheduled-m.cutUnreceived+m.cutUnpaid+m.cutTiming,m.current);assert.equal(m.projection.at(-1).balance,-1817831);
 const i=api.reportInsights(m);assert.equal(i.min.balance,-4517831);assert.equal(i.min.date,'2026-11-10');assert.equal(i.largestDay[1],410177);assert.equal(i.duplicates.length,1);assert.equal(i.next.vencimento,'2026-11-20');
 const body=api.reportBody(m,{filters:'<filtro>',issued:'04/11/2026'});assert(body.includes('Conciliação das bases'));assert(body.includes('Em aberto'));assert(body.includes('Maior saída diária'));assert(body.includes('&lt;filtro&gt;'));assert(!body.includes('Semestre atual alterado'));
 const managerial=api.managerialAnalysis(m,{filters:'Teste',issued:'04/11/2026'});assert(managerial.includes('Resultado líquido previsto do período'));assert(managerial.includes('5.248,31'));assert(managerial.includes('100.0%'));
 const partial=api.managerialAnalysis(m,{filters:'Teste',issued:'04/11',balance:false});assert(!partial.includes('Saldo final calculado'));
 // Effective-date reconciliation, including future payment and a payment without due date.
 const cases=[tx('2026-10-02',300,'Receita',{status:'Recebido',dataPg:'2026-12-01'}),tx('2026-12-02',20,'Despesa',{status:'Pago',dataPg:'2026-11-02'}),tx('',40,'Receita',{status:'Recebido',dataPg:'2026-11-01'}),tx('2026-11-01',5)];
 const edge=api.calculate(cases,[],'2026-11-01','2026-11-30','2026-11-04');
 assert.equal(edge.current,2000);assert.equal(edge.cutScheduled-edge.cutUnreceived+edge.cutUnpaid+edge.cutTiming,edge.current);
 const empty=api.calculate([],[],'','','2026-11-04');assert.equal(api.reportInsights(empty).min.balance,0);assert(api.reconciliation(empty).includes('0,00'));
 const hostile=api.calculate([tx('2026-11-05',1,'Despesa',{descricao:'<script>alert(1)</script>'}),tx('2026-11-05',1,'Despesa',{descricao:'<script>alert(1)</script>'})],[], '', '', '2026-11-04');
 assert(!api.riskSummary({...hostile,rows:hostile.future}).includes('<script>'));

 // Generate the actual managerial HTML, exercising its connection to the shared model.
 let emitted;const values={filtroTipo:'Todos',filtroRubrica:'Todas',filtroSubItem:'Todos',filtroBuscaRubrica:'',filtroBuscaSubItem:'',filtroDescricao:'',filtroDataInicio:'2026-11-01',filtroDataFim:'2026-11-30'};
 const NativeDate=Date;ctx.Date=class extends NativeDate{constructor(...args){super(...(args.length?args:[2026,10,4,14,33,34]));}};
 ctx.document.getElementById=id=>values[id]===undefined?null:{value:values[id],tagName:'INPUT'};
 ctx.window.open=()=>({location:{replace(){}},close(){}});ctx.window.addEventListener=()=>{};
 ctx.URL={createObjectURL:b=>{emitted=b;return 'blob:teste'},revokeObjectURL(){}};ctx.Blob=Blob;ctx.setTimeout=()=>{};ctx.alert=()=>{};
 ctx.atualizarPainelGerencial=()=>{};ctx.obterPeriodoFiltroPainel=()=> 'Período de referência: 01/11/2026 a 30/11/2026';
 ctx.getFilteredTransactions=o=>(o?.ignorarPeriodo?rows:chosen).filter(t=>values.filtroTipo==='Todos'||t.tipo===values.filtroTipo);
 vm.runInContext(html.match(/<script id="pf-report-selection-module">([\s\S]*?)<\/script>/)[1],ctx);
 vm.runInContext(html.match(/<script id="pf-report-theme">([\s\S]*?)<\/script>/)[1],ctx);
 const begin=html.indexOf('        function abrirRelatorioGerencial('),end=html.indexOf("        document.addEventListener('DOMContentLoaded'",begin);
 vm.runInContext(html.slice(begin,end),ctx);ctx.abrirRelatorioGerencial(false);
 const generated=await emitted.text();assert(generated.includes('Resultado líquido previsto'));assert(generated.includes('5.248,31'));assert(generated.includes('Trajetória do saldo'));assert(generated.includes('Composição financeira do período'));assert(generated.includes('Vencimento'));assert(generated.includes('Em aberto'));assert(!generated.includes('⚖ Saldo projetado'));
 values.filtroTipo='Despesa';ctx.abrirRelatorioGerencial(false);const onlyExpense=await emitted.text();assert(!onlyExpense.includes('Saldo final calculado'));assert(onlyExpense.includes('Recorte de um único tipo'));
 values.filtroTipo='Receita';ctx.abrirRelatorioGerencial(false);const onlyIncome=await emitted.text();assert(!onlyIncome.includes('Saldo final calculado'));assert(onlyIncome.includes('27.000,00'));
 console.log('PASS:',name,'ponte de saldos, corte, datas efetivas, liquidez, duplicidades, filtros e recortes parciais.');
}

})().catch(error=>{console.error(error);process.exitCode=1});
