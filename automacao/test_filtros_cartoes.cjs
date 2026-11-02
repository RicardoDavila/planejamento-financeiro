const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),path=require('path');
const js=fs.readFileSync(path.join(__dirname,'filtros_cartoes.js'),'utf8');
class Node{constructor(){this.value='';this.dataset={};this.attributes={};this.children=[];this.listeners={};this.classList={contains:()=>false};this.textContent='';}setAttribute(k,v){this.attributes[k]=v;}addEventListener(k,f){this.listeners[k]=f;}append(...xs){this.children.push(...xs);}before(x){notices.push(x);}querySelector(){return this.children[0];}}
const notices=[],nodes={},cardIds=['pgReceitas','pgRecebido','pgDespesas','pgAVencer','pgVencido','pgSaldo','pgInvestimentos','pgSituacao','pm-kRec','pm-kReceived','pm-kDes','pm-kVen','pm-kOverdue','pm-kInv','pm-kSaldo','kpiGrafReceitas','kpiGrafRecebidas','kpiGrafDespesas','kpiGrafSaldo','kpiGrafVencidas','kpiGrafPoupanca','kpiGrafComprometimento'];
const cardNodes=cardIds.map(id=>{const node=new Node();node.parentElement=new Node();nodes[id]=node;return node.parentElement;});
for(const id of ['painelResumoGerencial','filtroTipo','filtroRubrica','filtroSubItem','filtroBuscaRubrica','filtroBuscaSubItem','filtroDescricao','filtroDataInicio','filtroDataFim','painelExecutivoGraficos','graficoTipo','graficoRubrica','graficoSubItem','graficoDescricao','graficoDataInicio','graficoDataFim','graficoStatusAvancado','graficoValorMin','graficoValorMax'])nodes[id]=new Node();
nodes.painelExecutivoGraficos.id='painelExecutivoGraficos';
nodes.filtroTipo.value='Todos';nodes.filtroRubrica.value='Todas';nodes.filtroSubItem.value='Todos';nodes.filtroDataInicio.value='2026-11-01';nodes.filtroDataFim.value='2026-11-30';
const rows=[{id:1,tipo:'Receita',status:'Recebido',valor:100},{id:2,tipo:'Receita',status:'Não Recebido',valor:50},{id:3,tipo:'Despesa',status:'Pago',valor:20},{id:4,tipo:'Despesa',status:'Vencido',valor:30},{id:5,tipo:'Despesa',status:'A Vencer',valor:40},{id:6,tipo:'Investimentos',status:'Feito',valor:10},{id:7,tipo:'Despesa',categoria:'INVESTIMENTOS',status:'A Vencer',valor:5}];
const yesterday=new Date();yesterday.setDate(yesterday.getDate()-1);rows[3].vencimento=yesterday.getFullYear()+'-'+String(yesterday.getMonth()+1).padStart(2,'0')+'-'+String(yesterday.getDate()).padStart(2,'0');
nodes['pm-kRec'].parentElement.parentElement=new Node();
const before=JSON.stringify(rows);let rendered=[],chartRendered=[],clears=0,observer;
const c={window:null,protecaoAutenticada:true,filtroRapidoEspecial:'',filtrosPainelAtivadosPeloUsuario:false,getComputedStyle:()=>({display:'none'}),MutationObserver:class{constructor(f){observer=f;}observe(){}},document:{readyState:'complete',body:{classList:{contains:()=>false}},getElementById:id=>nodes[id],querySelectorAll:s=>s==='[data-pf-quick-card]'?cardNodes:s==='.pf-quick-cards-notice'?notices:[],createElement:()=>new Node()}};
c.window=c;c.getFilteredTransactions=()=>rows.filter(r=>nodes.filtroTipo.value==='Todos'||r.tipo===nodes.filtroTipo.value);c.renderTable=()=>rendered=c.getFilteredTransactions();c.limparFiltros=()=>{clears++;nodes.filtroTipo.value='Todos';c.renderTable();};
c.atualizarGraficos=()=>chartRendered=c.PFQuickCards.apply(rows,'charts');c.openGraficosModal=()=>c.atualizarGraficos();c.limparFiltrosGraficos=()=>c.atualizarGraficos();
vm.createContext(c);vm.runInContext(js,c);
const click=id=>nodes[id].parentElement.listeners.click();
for(const [id,expected]of [['pgReceitas',[1,2]],['pgRecebido',[1]],['pgDespesas',[3,4,5,7]],['pgAVencer',[5,7]],['pgVencido',[4]],['pgSaldo',[1,2,3,4,5,6,7]],['pgInvestimentos',[6,7]],['pgSituacao',[4]]]){click(id);assert.deepEqual(rendered.map(r=>r.id),expected,id);assert.equal(nodes[id].parentElement.attributes['aria-pressed'],'true');}
assert.equal(notices[0].children[1].textContent,'Limpar filtro');nodes.filtroDataFim.value='2027-01-01';notices[0].children[1].listeners.click();assert.equal(c.PFQuickCards.active,'');assert.equal(nodes.filtroDataFim.value,'2026-11-30');assert.equal(rendered.length,rows.length);
assert.equal(notices.length,3,'Aviso também deve existir junto aos cartões visíveis do celular');
for(const [id,expected]of [['pm-kRec',[1,2]],['pm-kReceived',[1]],['pm-kDes',[3,4,5,7]],['pm-kVen',[5,7]],['pm-kOverdue',[4]],['pm-kInv',[6,7]],['pm-kSaldo',[1,2,3,4,5,6,7]]]){click(id);assert.deepEqual(rendered.map(r=>r.id),expected,id);assert.equal(nodes[id].parentElement.attributes['aria-pressed'],'true');assert.equal(notices[1].hidden,false);}
notices[1].children[1].listeners.click();assert.equal(c.PFQuickCards.active,'');assert.equal(rendered.length,rows.length);
assert(c.PFQuickCards.matches({tipo:'Receita',status:'Pendente',dataPg:'2026-01-01'},'recebidoMobile'));
assert(!c.PFQuickCards.matches({tipo:'Receita',status:'Pendente'},'recebidoMobile'));
assert(!c.PFQuickCards.matches({tipo:'Despesa',status:'Vencido',vencimento:rows[3].vencimento,dataPg:'2026-01-01'},'vencidoMobile'));
for(const [field,value,expected]of [['categoria','INVESTIMENTOS',[7]],['subItem','',[1,2,3,4,5,6,7]],['descricao','<img onerror=teste>',[]]]){
 c.PFQuickCards.field(field,value);assert.deepEqual(rendered.map(r=>r.id),expected,'Filtro dinâmico: '+field);assert.equal(c.PFQuickCards.active,'item');
}
c.PFQuickCards.field('categoria','INVESTIMENTOS');c.PFQuickCards.field('categoria','INVESTIMENTOS');assert.equal(c.PFQuickCards.active,'');
for(const field of ['senha','tipo','status','valor','vencimento','dataPg','observacao']){c.PFQuickCards.field(field,'não usar');assert.equal(c.PFQuickCards.active,'');}
c.PFQuickCards.field('categoria','INVESTIMENTOS');click('pgReceitas');assert.deepEqual(rendered.map(r=>r.id),[1,2]);assert.equal(c.PFQuickCards.focus,null);c.PFQuickCards.clear();assert.equal(rendered.length,7);
c.PFQuickCards.field('categoria','INVESTIMENTOS');c.openGraficosModal();assert.equal(chartRendered.length,7);assert.equal(c.PFQuickCards.active,'item');
for(const [id,expected]of [['kpiGrafReceitas',[1,2]],['kpiGrafRecebidas',[1]],['kpiGrafDespesas',[3,4,5,7]],['kpiGrafSaldo',[1,2,3,4,5,7]],['kpiGrafVencidas',[4]],['kpiGrafPoupanca',[1,2,3,4,5,7]],['kpiGrafComprometimento',[3,4,5,7]]]){click(id);assert.deepEqual(chartRendered.map(r=>r.id),expected,id);assert.deepEqual(c.getFilteredTransactions().map(r=>r.id),[7],'Filtro da página deve permanecer independente');}
c.PFQuickCards.clear('charts');assert.equal(chartRendered.length,7);assert.equal(c.PFQuickCards.active,'item');
c.PFQuickCards.field('descricao','inexistente','charts');assert.equal(chartRendered.length,0);c.openGraficosModal();assert.equal(chartRendered.length,7);assert.equal(c.PFQuickCards.status('charts').active,'');
c.PFQuickCards.field('categoria','INVESTIMENTOS','charts');c.limparFiltrosGraficos();assert.equal(chartRendered.length,7);assert.equal(c.PFQuickCards.active,'item');c.PFQuickCards.clear();
assert(!c.PFQuickCards.matches({tipo:'Receita',status:'Pendente'},'grafRecebidas'));
click('pgReceitas');click('pgReceitas');assert.equal(c.PFQuickCards.active,'');
nodes.filtroTipo.value='Despesa';click('pgVencido');assert.equal(rendered.length,1);c.limparFiltros();assert.equal(clears,1);assert.equal(c.PFQuickCards.active,'');
nodes.pgInvestimentos.parentElement.listeners.keydown({key:'Enter',preventDefault(){}});assert.deepEqual(rendered.map(r=>r.id),[6,7]);c.protecaoAutenticada=false;observer();assert.equal(c.PFQuickCards.active,'');assert.equal(notices[0].hidden,true);click('pgReceitas');assert.equal(c.PFQuickCards.active,'');assert.equal(JSON.stringify(rows),before);
for(const name of ['index.html','distribuicao/app.html','teste-gemini/app.html']){
 const html=fs.readFileSync(path.join(__dirname,'..',name),'utf8');assert.equal((html.match(/id="pf-quick-cards"/g)||[]).length,1,name+': módulo dos cartões ausente ou duplicado; envie o HTML atualizado');assert.equal((html.match(/PFQF bridge:start/g)||[]).length,4,name+': integração dos filtros incompleta');
 assert.equal((html.match(/id="pf-dynamic-filters"/g)||[]).length,1,name+': módulo dinâmico ausente');assert(html.includes("new CustomEvent('pf-item-focus'"));assert(html.includes('detail(state,p,undefined,true)'));
 const start=html.indexOf('function monthAnalysisData('),end=html.indexOf('function categoryBreakdownBars(',start);const code=html.slice(start,end);const ctx={window:{PFQuickCards:{apply:rs=>rs.filter(r=>r.status==='Vencido')}}};vm.createContext(ctx);vm.runInContext(code+';globalThis.calc=monthAnalysisData;',ctx);
 const dated=rows.map(r=>({...r,categoria:r.categoria||'A',descricao:'Teste',vencimento:'2026-11-01'}));const result=ctx.calc(dated.filter(r=>r.status==='Vencido'),dated,'2026-11-30');assert.equal(result.revenueHistory.at(-1)[1],0);assert.equal(result.expenseHistory.at(-1)[1],30);
 // Exercise the real standard filter with the card wrapper, including period constraints.
 const a=html.indexOf('function getFilteredTransactions(opcoes = {})'),b=html.indexOf('function atualizarCampoInline',a);const fctx={document:c.document,transacoes:dated,filtroRapidoEspecial:''};vm.createContext(fctx);vm.runInContext(html.slice(a,b)+';globalThis.get=getFilteredTransactions;',fctx);assert.equal(fctx.get().length,7);nodes.filtroDataFim.value='2026-10-31';assert.equal(fctx.get().length,0);nodes.filtroDataFim.value='2026-11-30';
}
console.log('Cartões: oito recortes, alternância, teclado, restauração, bloqueio, datas e histórico aprovados nas três telas.');
