const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),path=require('path');
// A description that equals a rubric name must still resolve by description.
const explorer=fs.readFileSync(path.join(__dirname,'graficos_interativos.js'),'utf8'),ra=explorer.indexOf('     const resolve=(j,i)=>{'),rb=explorer.indexOf('     const m=D.model(',ra);
const collisionRows=[{id:1,tipo:'Receita',categoria:'EMPRESA',descricao:'Salário'},{id:2,tipo:'Receita',categoria:'OUTRA',descricao:'EMPRESA'},{id:3,tipo:'Despesa',categoria:'EMPRESA',descricao:'EMPRESA'}];
const collision={records:collisionRows,comparison:false,chart:{$pfGroupBy:'descricao'},series:[{label:'Valor (R$)'}],labels:['EMPRESA'],D:{typeRows:rows=>rows}};vm.createContext(collision);vm.runInContext(explorer.slice(ra,rb)+';globalThis.resolvePoint=resolve;',collision);assert.deepEqual(collision.resolvePoint(0,0).map(r=>r.id),[2]);
for(const name of ['index.html','distribuicao/app.html','teste-gemini/app.html']){
 const html=fs.readFileSync(path.join(__dirname,'..',name),'utf8'),start=html.indexOf('        function atualizarGraficos() {'),end=html.indexOf('        let calendarioV45Data =',start);
 const values={graficoTipo:'Todos',graficoRubrica:'Todas',graficoSubItem:'Todos',graficoDataInicio:'2026-11-01',graficoDataFim:'2026-11-30',graficoStatusAvancado:'Todos'},nodes={};
 const node=id=>nodes[id]||(nodes[id]={value:values[id]||'',innerText:'',textContent:'',classList:{add(){},remove(){}},getContext(){return {id};}});
 const rows=[['Salário',100,'EMPRESA'],['Salário',25,'OUTRA'],['Bônus',50,'EMPRESA'],[' ',10,'EMPRESA'],['__proto__',5,'EMPRESA'],['MORADIA',20,'EMPRESA']].map(([descricao,valor,categoria],i)=>({id:i,tipo:'Receita',descricao,valor,categoria,subItem:'Geral',status:i===0?'Recebido':'Não Recebido',vencimento:'2026-11-02'}));rows.push({id:9,tipo:'Despesa',descricao:'Conta',valor:30,categoria:'EMPRESA',subItem:'Geral',status:'Vencido',vencimento:'2026-11-02'});
 const before=JSON.stringify(rows),ctx={window:{},document:{getElementById:node},transacoes:rows,comparacaoRubricaMesAtiva:false,comparativoReceitasDespesasAtivo:false,abaAtivaGrafico:'prevReceita',chartEvolucaoInstance:null,chartRubricasInstance:null,validarPeriodoGraficos(){},validarValoresGraficos(){},atualizarVisibilidadeTipoGrafico(){},atualizarPainelExecutivoGraficos(){},renderizarPainelAvancadoGraficos(){},formatarMoeda:String,Chart:class{constructor(c,config){this.config=config;this.data=config.data;}destroy(){}}};
 vm.createContext(ctx);vm.runInContext(html.slice(start,end),ctx);ctx.atualizarGraficos();
 const chart=()=>ctx.chartRubricasInstance,labels=()=>Array.from(chart().data.labels),total=()=>chart().data.datasets[0].data.reduce((s,v)=>s+v,0);
 assert.deepEqual(labels(),['Salário','Bônus','Sem descrição','__proto__','MORADIA']);assert.equal(total(),210);assert.equal(chart().data.datasets[0].data[0],125);assert.equal(chart().$pfGroupBy,'descricao');
 node('graficoDescricao').value='sal';ctx.atualizarGraficos();assert.deepEqual(labels(),['Salário']);assert.equal(total(),125);
 node('graficoDescricao').value='';node('graficoRubrica').value='EMPRESA';ctx.atualizarGraficos();assert.equal(total(),185);assert.equal(chart().data.datasets[0].data[0],100);
 ctx.abaAtivaGrafico='totalDespesas';ctx.atualizarGraficos();assert.deepEqual(labels(),['EMPRESA']);assert.equal(total(),30);assert.equal(chart().$pfGroupBy,null);
 assert.equal(JSON.stringify(rows),before);
 console.log('PASS: '+name+' receitas por descrição, repetidas, rubrica, busca, vazio, nome especial, totais e despesas preservados.');
}
