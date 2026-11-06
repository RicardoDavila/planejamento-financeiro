const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict');
const root=path.resolve(__dirname,'..');
for(const file of ['index.html','distribuicao/app.html','teste-gemini/app.html']){
 const source=fs.readFileSync(path.join(root,file),'utf8');let count=0;
 for(const match of source.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)){
  if(/type=["'](?:application\/ld\+json|application\/json|module)["']/i.test(match[1]))continue;
  new vm.Script(match[2],{filename:file+':script'+count++});
 }
 const code=source.match(/<script id="pf-report-selection-module">([\s\S]*?)<\/script>/)[1];
 const ctx={window:{}};vm.createContext(ctx);vm.runInContext(code,ctx);
 const input='<html><head></head><body onload="setTimeout(function(){window.focus();window.print();},350)"><h2>Teste</h2></body></html>';
 const output=ctx.window.PFReportSelection.decorate(input);
 assert(!output.includes(' onload='));assert(output.includes('pf-report-selection-bootstrap'));
 assert.equal(ctx.window.PFReportSelection.decorate(output),output);
 const bootstrap=output.match(/<script[^>]*>([\s\S]*?)<\/script>/)[1];new vm.Script(bootstrap);
 assert(source.includes('window.PFReportSelection.decorate(relatorioHtml)'));
 assert(source.includes("window.PFReportSelection.decorate(window.PFChartExplorer?"));
 if(file==='index.html')assert(source.includes('window.PFReportSelection.install(popup);popup.document.close()'));
 console.log('PASS',file,count+' scripts válidos; bootstrap, idempotência e integração nas exportações');
}
