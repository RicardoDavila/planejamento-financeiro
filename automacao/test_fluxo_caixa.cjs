const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),path=require('path');
const root=path.resolve(__dirname,'..');
for(const file of ['index.html','distribuicao/app.html','teste-gemini/app.html']){
 const html=fs.readFileSync(path.join(root,file),'utf8');
 const script=html.match(/<script id="pf-cashflow-report">([\s\S]*?)<\/script>/)[1];
 const ctx={window:{},document:{readyState:'loading',addEventListener(){}},Date,Map,Blob,URL};vm.createContext(ctx);vm.runInContext(script,ctx);
 const api=ctx.window.PFCashFlow;
 const tx=(vencimento,valor,tipo='Despesa',extra={})=>({vencimento,valor,tipo,status:tipo==='Receita'?'Não Recebido':'A Vencer',categoria:'Operação',subItem:'Geral',descricao:'Teste',...extra});
 const base=[tx('2026-09-01',1000,'Receita',{status:'Recebido',dataPg:'2026-09-01'}),tx('2026-09-02',100,'Despesa',{status:'Pago',dataPg:'2026-09-02'}),tx('2026-10-01',300,'Despesa',{status:'Pago',dataPg:'2026-10-01'}),tx('2026-10-02',0.1,'Receita'),tx('2026-10-02',0.2,'Receita'),tx('2026-10-15',100,'Investimentos'),tx('2026-10-30',10),tx('2026-11-01',100,'Receita'),tx('2026-11-28',800),tx('2026-11-29',900)];
 const selected=base.filter(t=>t.vencimento>='2026-10-01'&&t.vencimento<='2026-10-31');
 const m=api.calculate(base,selected,'2026-10-01','2026-10-31','2026-10-30');
 assert.equal(m.opening,90000);assert.equal(m.revenue,30);assert.equal(m.expense,41000);assert.equal(m.closing,49030);assert.equal(m.daily.at(-1).balance,m.closing);
 assert.equal(m.current,60000);assert.equal(m.future.length,3);assert.equal(m.projection.length,30);assert.equal(m.projection.at(-1).date,'2026-11-28');assert.equal(m.projection.at(-1).balance,-11000);
 assert.equal(m.paid.length,1);assert.equal(m.overdue.length,3);assert.equal(m.largest.valor,300);assert(m.categories.some(x=>x[1]===41000));
 assert.equal(api.calculate(base,selected,'2026-10-01','2026-10-31','2026-10-30','mes').daily.length,1);
 const weekly=api.calculate(base,selected,'2026-10-01','2026-10-31','2026-10-30','semana');assert.equal(weekly.daily[0].date,'2026-09-28');assert.equal(weekly.closing,m.closing);
 assert.equal(api.calculate([],[],'','','2026-12-31').projection.at(-1).date,'2027-01-29');
 assert.equal(api.calculate([],[],'','','2024-02-01').projection.at(-1).date,'2024-03-01');
 assert(api.calculate([],[],'2026-11-01','2026-10-01','2026-10-30').invalid);
 const unsafe=api.calculate([], [tx('2026-10-01',5,'Despesa',{descricao:'<img src=x onerror=alert(1)>',categoria:'=SUM(A1)'})],'2026-10-01','2026-10-31','2026-10-30');
 const body=api.reportBody(unsafe,{filters:'<script>evil</script>',issued:'teste'});assert.equal((body.match(/<img\b/g)||[]).length,1);assert(!body.includes('<img src=x'));assert(body.includes('src="data:image/png;base64,'+fs.readFileSync(path.join(root,'icon-192.png')).toString('base64')+'"'));assert(body.includes('alt="Logotipo do Planejamento Financeiro"'));assert(!body.includes('<script>'));assert(body.includes('&lt;img'));assert(body.includes('fc-print'));
 // Rúbricas em duas colunas: preserva todos os registros, valores e ordem.
 const manyCategories={...unsafe,expense:30000,categories:Array.from({length:24},(_,i)=>['Rúbrica <'+i+'>',2400-i])};
 const categoryBody=api.reportBody(manyCategories,{filters:'Sem filtros',issued:'teste'});
 assert(categoryBody.includes('class="fc-chart fc-category-chart"'));
 assert(categoryBody.includes('class="fc-category-columns"'));
 assert.equal((categoryBody.match(/class="fc-category"/g)||[]).length,24);
 assert(categoryBody.indexOf('Rúbrica &lt;0&gt;')<categoryBody.indexOf('Rúbrica &lt;23&gt;'));
 assert(!api.reportBody({...unsafe,categories:[]},{filters:'Sem filtros',issued:'teste'}).includes('class="fc-category-columns"'));
 const csv=api.csv(api.exportRows(unsafe,{filters:'filtros',issued:'teste'}));assert(csv.startsWith('\ufeff'));assert(csv.includes("'=SUM(A1)"));assert.equal(api.csv([[-12.5]]),'\ufeff"-12,5"');assert(api.csv([['a;"b\nc']]).includes('"a;""b\nc"'));
 // Testa a função real de filtragem, inclusive leitura histórica sem alterar os controles.
 const start=html.indexOf('        function getFilteredTransactions('),end=html.indexOf('        function atualizarCampoInline',start);
 const values={filtroTipo:'Todos',filtroRubrica:'Todas',filtroSubItem:'Todos',filtroBuscaRubrica:'',filtroBuscaSubItem:'',filtroDescricao:'',filtroDataInicio:'2026-10-01',filtroDataFim:'2026-10-31'};
 const env={transacoes:base,filtroRapidoEspecial:null,Date,document:{getElementById:id=>({value:values[id]})}};vm.createContext(env);vm.runInContext(html.slice(start,end),env);
 assert.equal(env.getFilteredTransactions().length,selected.length);assert.equal(env.getFilteredTransactions({ignorarPeriodo:true}).length,base.length);values.filtroTipo='Receita';assert.equal(env.getFilteredTransactions({ignorarPeriodo:true}).length,4);assert.equal(values.filtroDataInicio,'2026-10-01');
 assert.equal((html.match(/\(\)=>window.abrirFluxoCaixa\(\)/g)||[]).length,2);
 // Exercita abertura, controles do relatório e o deslocamento sob o cabeçalho fixo.
 const controls={},downloads=[],messages=[];let reportHtml='',printed=false,scrolled;
 const doc={open(){},close(){},write:s=>reportHtml=s,getElementById:id=>controls[id]??(controls[id]={}),body:{append(){}},createElement:()=>({click(){downloads.push(this.download);},remove(){}})};
 const pop={document:doc,print(){printed=true;},location:{}};
 let expanded=false;
 const nodes={painelGerencial:{classList:{contains:()=>false}},filtroDataInicio:{value:'2026-10-01'},filtroDataFim:{value:'2026-10-31'},'clean-flow-toggle':{getAttribute:()=>String(expanded),click:()=>expanded=true},'clean-flow-details':{getBoundingClientRect:()=>({top:500}),setAttribute(){},focus:o=>assert(o.preventScroll)},pfMenuTopo:{getBoundingClientRect:()=>({bottom:58})}};
 ctx.document={getElementById:id=>nodes[id]||null,body:{classList:{contains:()=>false}}};ctx.getFilteredTransactions=o=>o?.ignorarPeriodo?base:selected;ctx.alert=s=>messages.push(s);ctx.setTimeout=()=>{};ctx.URL={createObjectURL:()=> 'blob:test',revokeObjectURL(){}};ctx.requestAnimationFrame=f=>f();ctx.window.open=()=>pop;ctx.window.scrollY=800;ctx.window.scrollTo=o=>scrolled=o;
 ctx.window.abrirRelatorioFluxoCaixa();assert(reportHtml.includes('Relatório de Fluxo de Caixa'));controls['fc-print'].onclick();assert(printed);controls['fc-csv'].onclick();assert.equal(downloads[0],'fluxo-de-caixa.csv');
 controls['fc-xlsx'].onclick();assert(messages.at(-1).includes('biblioteca de Excel'));
 ctx.window.XLSX={utils:{book_new:()=>({}),aoa_to_sheet:r=>{assert.equal(typeof r[4][1],'number');return {};},book_append_sheet(){}},write:(b,o)=>{assert.equal(o.bookType,'xlsx');return new Uint8Array([80,75]);}};
 controls['fc-xlsx'].onclick();assert.equal(downloads.at(-1),'fluxo-de-caixa.xlsx');controls['fc-email'].onclick();assert(pop.location.href.startsWith('mailto:'));
 ctx.window.open=()=>null;ctx.window.abrirRelatorioFluxoCaixa();assert(messages.at(-1).includes('nova aba'));
 ctx.window.abrirFluxoCaixa();assert(expanded);assert.equal(scrolled.top,1226);
 console.log('PASS:',file,'saldo inicial, centavos, investimentos, agrupamentos, filtros, status, projeção, datas e exportação segura');
}
