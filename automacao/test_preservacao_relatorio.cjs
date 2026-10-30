const fs=require('fs'),path=require('path'),vm=require('vm'),crypto=require('crypto'),assert=require('assert/strict');
const root=path.resolve(__dirname,'..'),pins=JSON.parse(fs.readFileSync(path.join(__dirname,'relatorio_original_hashes.json'),'utf8'));
for(const rel of ['index.html','distribuicao/app.html','teste-gemini/app.html']){
 const html=fs.readFileSync(path.join(root,rel),'utf8').replace(/\r\n/g,'\n');const blocks={};
 for(const [name,pin]of Object.entries(pins)){const a=html.indexOf(pin.start),b=html.indexOf(pin.end,a);assert(a>=0&&b>a);blocks[name]=html.slice(a,b).trim();assert.equal(crypto.createHash('sha256').update(blocks[name]).digest('hex'),pin.sha256,rel+': cálculo original alterado em '+name);}
 const ids=['painelExecutivoGraficos','kpiGrafReceitas','kpiGrafRecebidas','kpiGrafDespesas','kpiGrafSaldo','kpiGrafVencidas','kpiGrafPoupanca','kpiGrafComprometimento','pfWaterfall','pfRanking','pfAtrasos','pfHeatmap','pfDozeMeses','pfDrilldown','chartEvolucao','chartRubricas','comparacaoTotaisGraficos'];
 ids.forEach(id=>assert(html.includes('id="'+id+'"'),id));
 const nodes={};function node(id){return nodes[id]??(nodes[id]={value:({graficoTipo:'Todos',graficoDataFim:'2026-10-31',graficoDataInicio:'2026-10-01'}[id]||''),innerHTML:'',textContent:'',className:''});}
 class FixedDate extends Date{constructor(...args){super(...(args.length?args:[2026,9,30,12]));}}
 const c={Date:FixedDate,document:{getElementById:node},pfOrdemDespesas:null,pfLancamentosFiltrados:[]};vm.createContext(c);
 const a=html.indexOf('        function pfFmt('),b=html.indexOf('        function atalhoPeriodoGraficos(',a);vm.runInContext(html.slice(a,b)+blocks.painel_executivo+blocks.analises_avancadas,c);
 const rows=[{tipo:'Receita',valor:14050,status:'Recebido',vencimento:'2026-10-20'},{tipo:'Receita',valor:3930,status:'Não Recebido',vencimento:'2026-10-20'},{tipo:'Receita',valor:9000,status:'Não Recebido',vencimento:'2026-10-20'},...Array.from({length:30},(_,i)=>({tipo:'Despesa',valor:i===29?5029.14:500,status:'Pago',vencimento:'2026-10-'+String(i+1).padStart(2,'0'),categoria:i%2?'Grupo B':'Grupo A',descricao:'Despesa fictícia '+i})),{tipo:'Investimentos',valor:0,status:'Pendente'}];
 const before=JSON.stringify(rows);c.atualizarPainelExecutivoGraficos(rows,'2026-10-01','2026-10-31');c.renderizarPainelAvancadoGraficos(rows);assert.equal(JSON.stringify(rows),before);
 for(const [id,value]of Object.entries({kpiGrafReceitas:'26.980,00',kpiGrafRecebidas:'14.050,00',kpiGrafDespesas:'19.529,14',kpiGrafSaldo:'7.450,86',kpiGrafVencidas:'0,00',kpiGrafPoupanca:'27,6%',kpiGrafComprometimento:'72,4%'}))assert(node(id).textContent.includes(value),id);
 assert(node('painelExecutivoPeriodo').textContent.includes('34 lançamento(s)'));
 assert(node('pfWaterfall').innerHTML.includes('26.980,00'));assert(node('pfRanking').innerHTML.includes('%'));assert(node('pfAtrasos').innerHTML.includes('Mais de 30 dias'));assert.equal((node('pfHeatmap').innerHTML.match(/class="pf-heat-cell"/g)||[]).length,31);
 assert.equal((node('pfDozeMeses').innerHTML.match(/title="Receitas /g)||[]).length,12);assert.equal((node('pfDrilldown').innerHTML.match(/<tr>/g)||[]).length,35);assert(node('pfDrilldown').innerHTML.includes('Investimentos'));
 console.log('PASS:',rel,'todos os painéis originais, cálculos idênticos ao ZIP, 34 lançamentos, 31 dias e 12 meses preservados');
}
