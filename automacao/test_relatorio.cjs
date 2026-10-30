const fs=require('fs'),vm=require('vm'),assert=require('assert'),path=require('path');
const r=path.resolve(__dirname,'..');
async function generate(file,tipo='Todos',print=false,blocked=false){
 const source=fs.readFileSync(path.join(r,file),'utf8'),start=source.indexOf('        function abrirRelatorioGerencial('),end=source.indexOf("        document.addEventListener('DOMContentLoaded'",start);let blob,url,timers=[];
 const transactions=[{vencimento:'2026-10-25',descricao:'Receita de teste',tipo:'Receita',valor:26980,status:'Recebido'},{vencimento:'2026-10-25',descricao:'Teste <img src=x>',tipo:'Despesa',valor:15321.25,status:'Pago'},{vencimento:'2026-10-26',descricao:'Conta pendente',tipo:'Despesa',valor:4202.89,status:'A Vencer'}].filter(t=>tipo==='Todos'||t.tipo===tipo);
 const c={Date,Map,Blob,URL:{createObjectURL:b=>{blob=b;return 'blob:relatorio-teste'},revokeObjectURL(){}},window:{open:()=>blocked?null:{location:{replace:u=>url=u},close(){}}},alert(){},atualizarPainelGerencial(){},getFilteredTransactions:()=>transactions,obterPeriodoFiltroPainel:()=> 'Período de referência: 01/10/2026 a 31/10/2026',document:{getElementById:id=>({value:id==='filtroTipo'?tipo:'Todas'})},setTimeout:(fn,ms)=>timers.push({fn,ms})};
 c.window.addEventListener=()=>{};c.document.readyState='loading';c.document.addEventListener=()=>{};
 vm.createContext(c);vm.runInContext(source.match(/<script id="pf-report-theme">([\s\S]*?)<\/script>/)[1],c);vm.runInContext(source.slice(start,end),c);c.abrirRelatorioGerencial(print);
 if(blocked){assert(!blob);return;}
 assert.equal(url,'blob:relatorio-teste');const html=await blob.text();
 assert(html.includes('width=device-width, initial-scale=1, viewport-fit=cover'));
 assert(!html.includes('style="grid-template-columns:repeat('));
 assert(html.includes('grid-template-columns:repeat(2,minmax(0,1fr))'));
 assert(html.includes('overflow-wrap:anywhere'));
 assert(html.includes('.bloco-corpo{max-width:100%;overflow-x:auto}'));
 assert(html.includes('id="pf-report-shared-style"'));assert(html.includes('alt="Logotipo do Planejamento Financeiro"'));assert(html.includes('system-ui, -apple-system, "Segoe UI", sans-serif'));
 assert.equal((html.match(/<article class="kpi /g)||[]).length,tipo==='Todos'?4:tipo==='Despesa'?3:1);
 assert.equal(html.includes('onload="setTimeout(function(){window.focus();window.print();},350)"'),print);
 assert(!html.includes('Teste <img src=x>'));
 if(tipo!=='Receita')assert(html.includes('Teste &lt;img src=x&gt;'));
 assert(timers.some(t=>t.ms===60000));
 if(tipo==='Todos'){assert(html.includes('26.980,00'));assert(html.includes('7.455,86'));}
}
(async()=>{for(const f of ['index.html','distribuicao/app.html']){for(const t of ['Todos','Receita','Despesa'])await generate(f,t);await generate(f,'Todos',true);await generate(f,'Todos',false,true);}console.log('PASS: geração do relatório nas duas versões, filtros, totais, escape de texto, viewport, cartões responsivos, impressão e popup bloqueado.');})().catch(e=>{console.error(e);process.exitCode=1});
