const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),path=require('path');
const root=path.resolve(__dirname,'..');
for(const name of ['index.html','distribuicao/app.html','teste-gemini/app.html']){
 const html=fs.readFileSync(path.join(root,name),'utf8'),nodes={};
 const vals={graficoTipo:'Todos',graficoDataInicio:'2026-11-01',graficoDataFim:'2026-11-30'};
 const node=id=>nodes[id]??(nodes[id]={value:vals[id]||'',innerHTML:'',textContent:'',className:''});
 class FixedDate extends Date{constructor(...args){super(...(args.length?args:[2026,10,4,12]));}}
 const env={Date:FixedDate,Map,document:{getElementById:node},window:{},pfOrdemDespesas:null,pfLancamentosFiltrados:[]};vm.createContext(env);
 let a=html.indexOf('        function atualizarPainelExecutivoGraficos('),b=html.indexOf('        function filtrarRubricaGrafico(',a);vm.runInContext(html.slice(a,b),env);
 const tx=(vencimento,valor,tipo='Despesa',extra={})=>({vencimento,valor,tipo,categoria:'Teste',descricao:'Registro',status:tipo==='Receita'?'Não Recebido':'A Vencer',...extra});
 const data=[tx('2026-11-01',992.75,'Despesa',{status:'Pago'}),tx('2026-11-05',3256.97),tx('2026-11-06',160),tx('2026-11-08',194.32),tx('2026-11-09',2652.83),tx('2026-11-10',1190,'Despesa',{descricao:'Honorários'}),tx('2026-11-10',1190,'Despesa',{descricao:'Honorários'}),tx('2026-11-10',1721.77),tx('2026-11-20',27000,'Receita'),tx('',0,'Investimentos',{descricao:'Cadastro pendente'})];
 const before=JSON.stringify(data);env.atualizarPainelExecutivoGraficos(data,vals.graficoDataInicio,vals.graficoDataFim);env.renderizarPainelAvancadoGraficos(data);
 assert(node('kpiGrafSaldo').textContent.includes('15.641,36'));assert(node('kpiGrafPagas').textContent.includes('992,75'));assert(node('kpiGrafVencer').textContent.includes('10.365,89'));
 assert(node('pfGraphLiquidity').innerHTML.includes('10.365,89'));assert(node('pfGraphLiquidity').innerHTML.includes('20/11/2026'));assert(node('pfGraphLiquidity').innerHTML.includes('não informado'));
 assert(node('pfGraphQuality').innerHTML.includes('Não comprova duplicidade'));
 assert(node('pfDrilldown').innerHTML.includes('01/11/2026'));assert(!node('pfDrilldown').innerHTML.includes('2026-11-01'));assert(node('pfDrilldown').innerHTML.includes('Pendências de cadastro (1)'));assert(node('pfDrilldown').innerHTML.includes('Cadastro pendente'));
 assert.equal((node('pfDozeMeses').innerHTML.match(/data-pf-covered="false"/g)||[]).length,11);assert.equal((node('pfDozeMeses').innerHTML.match(/title="Receitas /g)||[]).length,1);assert(node('pfDozeMeses').innerHTML.includes('N/D'));
 node('graficoDataInicio').value='2025-12-01';env.renderizarPainelAvancadoGraficos(data);assert(!node('pfDozeMeses').innerHTML.includes('pf-history-nd'));assert(node('pfDozeMeses').innerHTML.includes('Sem lançamentos'));
 const hostile=[tx('2026-11-05',5,'Despesa',{descricao:'<script>evil</script>'}),tx('2026-11-05',5,'Despesa',{descricao:'<script>evil</script>'})];env.renderizarPainelAvancadoGraficos(hostile);assert(!node('pfGraphQuality').innerHTML.includes('<script>'));assert(!node('pfDrilldown').innerHTML.includes('<script>'));
 env.renderizarPainelAvancadoGraficos([]);assert(node('pfGraphLiquidity').innerHTML.includes('Não há receita futura'));assert(!node('pfDrilldown').innerHTML.includes('Cadastro pendente'));
 assert.equal(JSON.stringify(data),before);assert(html.includes('transicaoImpressao'));assert(html.includes('Receitas previstas por descrição'));assert(!html.includes('>Taxa de poupança prevista<'));
 console.log('PASS:',name,'indicadores, liquidez, histórico N/D, datas BR, pendências, duplicidades e dados imutáveis.');
}
