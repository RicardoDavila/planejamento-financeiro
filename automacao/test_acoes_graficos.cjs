const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),path=require('path');
for(const file of ['index.html','distribuicao/app.html','teste-gemini/app.html']){
 const html=fs.readFileSync(path.join(__dirname,'..',file),'utf8'),nodes={};
 const values={graficoTipo:'Despesa',graficoRubrica:'Todas',graficoSubItem:'Todos',graficoDataInicio:'2026-01-01',graficoDataFim:'2026-01-31',graficoStatusAvancado:'Pago',graficoValorMin:'20',graficoValorMax:'200'};
 let scrolled=0,updates=0;
 const node=id=>nodes[id]||(nodes[id]={value:values[id]||'',classList:{add(){},remove(){}},getContext(){return {};},scrollIntoView(){scrolled++;}});
 const row=(vencimento,valor,extra={})=>({vencimento,valor,tipo:'Despesa',categoria:'Casa',subItem:'Conta',descricao:'Luz',status:'Pago',...extra});
 const rows=[row('2025-12-31',100),row('2026-01-01',150),row('2026-01-05',10),row('2026-01-06',250),row('2026-01-07',40,{status:'A Vencer'}),row('2026-01-08',99,{tipo:'Receita'}),row('2026-02-01',90)];
 const before=JSON.stringify(rows),ctx={window:{},document:{getElementById:node},Date,transacoes:rows,abaAtivaGrafico:'totalDespesas',comparativoReceitasDespesasAtivo:true,comparacaoRubricaMesAtiva:false,chartEvolucaoInstance:null,chartRubricasInstance:null,validarPeriodoGraficos:()=>true,validarValoresGraficos:()=>true,atualizarVisibilidadeTipoGrafico(){},mudarAbaGrafico(a){ctx.abaAtivaGrafico=a;updates++;},pfOrdemDespesas:'asc',formatarMoeda:String,Chart:class{constructor(c,config){this.data=config.data;this.options=config.options;}destroy(){}}};
 vm.createContext(ctx);
 const a=html.indexOf('        function mostrarResultadoGrafico()'),b=html.indexOf('        let chartEvolucaoInstance',a);
 vm.runInContext(html.slice(a,b),ctx);
 const c=html.indexOf('        function compararRubricaMesAnteriorAtual()'),d=html.indexOf('        function atualizarPainelExecutivoGraficos',c);
 vm.runInContext(html.slice(c,d),ctx);
 ctx.compararRubricaMesAnteriorAtual();
 assert.deepEqual(Array.from(ctx.chartRubricasInstance.data.datasets,x=>x.data[0]),[100,150]);
 assert.equal(ctx.chartRubricasInstance.options.scales.y.beginAtZero,true);assert.equal(scrolled,1);
 node('graficoRubrica').value='Casa';node('graficoDescricao').value='  LUZ  ';ctx.compararRubricaMesAnteriorAtual();
 assert.deepEqual(Array.from(ctx.chartRubricasInstance.data.datasets,x=>x.data[0]),[100,150]);
 node('graficoDataInicio').value='2024-02-01';node('graficoDataFim').value='2024-02-29';ctx.compararRubricaMesAnteriorAtual();assert.equal(ctx.chartEvolucaoInstance.data.labels.length,31);
 ctx.limparFiltrosGraficos();const now=new Date(),iso=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
 assert.equal(node('graficoDataInicio').value,iso(new Date(now.getFullYear(),now.getMonth(),1)));assert.equal(node('graficoDataFim').value,iso(new Date(now.getFullYear(),now.getMonth()+1,0)));
 assert.equal(node('graficoStatusAvancado').value,'Todos');assert.equal(node('graficoValorMin').value,'');assert.equal(ctx.comparacaoRubricaMesAtiva,false);
 ctx.comparativoReceitasDespesasAtivo=true;ctx.comparacaoRubricaMesAtiva=true;ctx.abaAtivaGrafico='comparativo';ctx.gerarGraficoAnalise();assert.equal(ctx.comparativoReceitasDespesasAtivo,false);assert.equal(ctx.comparacaoRubricaMesAtiva,false);assert.equal(ctx.abaAtivaGrafico,'prevReceita');assert(updates>=2);
 const prev=updates;ctx.validarValoresGraficos=()=>false;ctx.gerarGraficoAnalise();assert.equal(updates,prev);assert.equal(JSON.stringify(rows),before);
 assert(html.includes('onclick="gerarGraficoAnalise()"'));
 console.log('PASS:',file,'ações, mês vigente, filtros, comparação de janeiro/dezembro, fevereiro bissexto, escala e dados preservados.');
}
