const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),http=require('http'),path=require('path');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..')+path.sep;
const moduleSource=fs.readFileSync(root+'index.html','utf8').match(/<script id="pf-report-selection-module">([\s\S]*?)<\/script>/)[1];
async function managerial(file){
 const source=fs.readFileSync(root+file,'utf8');let blob;
 const transactions=[{vencimento:'2026-10-25',descricao:'Receita de teste',tipo:'Receita',valor:26980,status:'Recebido'},{vencimento:'2026-10-25',descricao:'Despesa de teste',tipo:'Despesa',valor:15321.25,status:'Pago'}];
 const before=JSON.stringify(transactions);
 const context={Date,Map,Blob,URL:{createObjectURL:b=>(blob=b,'blob:test'),revokeObjectURL(){}},window:{open:()=>({location:{replace(){}},close(){}}),addEventListener(){}},alert(){},atualizarPainelGerencial(){},getFilteredTransactions:()=>transactions,obterPeriodoFiltroPainel:()=> '01/10/2026 a 31/10/2026',document:{getElementById:id=>({value:id==='filtroTipo'?'Todos':'Todas'}),readyState:'loading',addEventListener(){}},setTimeout(){}};
 vm.createContext(context);vm.runInContext(moduleSource,context);
 vm.runInContext(source.match(/<script id="pf-report-theme">([\s\S]*?)<\/script>/)[1],context);
 const start=source.indexOf('        function abrirRelatorioGerencial('),end=source.indexOf("        document.addEventListener('DOMContentLoaded'",start);
 vm.runInContext(source.slice(start,end),context);context.abrirRelatorioGerencial(true);
 assert.equal(JSON.stringify(transactions),before);
 return blob.text();
}
(async()=>{
 let html='';const server=http.createServer((req,res)=>{res.setHeader('Content-Type','text/html;charset=utf-8');res.end(html)});await new Promise(r=>server.listen(0,'127.0.0.1',r));
 let browser;
 try{ browser=await chromium.launch({executablePath:process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 for(const file of ['index.html','distribuicao/app.html','teste-gemini/app.html']){
  html=await managerial(file);
  assert(!html.includes('onload="setTimeout(function(){window.focus();window.print();}'));
  const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:'+server.address().port);await page.evaluate(()=>{window.printCalls=0;window.print=()=>window.printCalls++});
  const options=page.locator('.pf-options input');assert(await options.count()>10);
  assert.equal(await options.count(),await page.locator('.pf-options input:checked').count());
  assert(await page.locator('#pf-pdf').isDisabled());assert(!await page.locator('#pf-report-content').isVisible());
  await page.getByRole('button',{name:'Pré-visualizar',exact:true}).click();assert(await page.locator('#pf-report-content').isVisible());
  const field=page.locator('.pf-option').filter({hasText:'Campo:'}).first();await field.locator('input').uncheck();
  assert(await page.locator('#pf-pdf').isDisabled());
  await page.getByRole('button',{name:'Pré-visualizar',exact:true}).click();
  assert(await page.locator('#pf-report-content .pf-report-excluded').count()>0);
  await page.emulateMedia({media:'print'});assert(!await page.locator('#pf-report-selection').isVisible());
  assert.equal(await page.locator('.pf-report-excluded').first().isVisible(),false);
  const pdf=await page.pdf({format:'A4'});assert(pdf.length>1000);await page.emulateMedia({media:'screen'});
  await page.locator('#pf-pdf').click();assert.equal(await page.evaluate(()=>window.printCalls),1);
  await page.getByRole('button',{name:'Desmarcar tudo',exact:true}).click();await page.locator('#pf-preview').click();assert(await page.locator('#pf-print').isDisabled());
  await page.getByRole('button',{name:'Selecionar tudo',exact:true}).click();await options.first().uncheck();await page.locator('#pf-remember').check();
  await page.reload();assert(await page.locator('#pf-remember').isChecked());assert(!await page.locator('.pf-options input').first().isChecked());
  await page.locator('#pf-remember').uncheck();await page.reload();assert.equal(await options.count(),await page.locator('.pf-options input:checked').count());
  await page.setViewportSize({width:390,height:844});
  assert(await page.locator('#pf-report-selection').evaluate(el=>el.scrollWidth<=el.clientWidth));
  // Mobile panel must not overflow horizontally.
  assert.deepEqual(errors,[]);await page.close();console.log('PASS',file,'defaults, columns, preview, PDF, empty selection, preferences, mobile, unchanged financial data');
 }
 }finally{if(browser)await browser.close();server.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
