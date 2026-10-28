const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.resolve(__dirname,'..');
for(const name of ['index.html','teste-gemini/app.html']){
 const html=fs.readFileSync(path.join(root,name),'utf8');
 for(const id of ['pf-desktop-clean-layout','pf-desktop-clean-menu']){
  const code=html.match(new RegExp('<script id="'+id+'">([\\s\\S]*?)</script>'))[1];
  // A phone must return before reading or mutating any DOM or original function.
  vm.runInNewContext(code,{matchMedia:q=>{assert.equal(q,'(min-width:901px) and (pointer:fine)');return {matches:false};}});
 }
 for(const prohibited of ['mobile-preview-switch','mobile-experience','preview-isolation','preview-bootstrap','teste123','DADOS FICTÍCIOS'])assert(!html.includes(prohibited),name+': conteúdo exclusivo da prévia');
 assert(html.includes('id="pf-desktop-clean-css">@media (min-width:901px) and (pointer:fine)'));
 assert(html.includes('const dadosPadraoCompletos = [];'));
 assert(html.includes("new MutationObserver(redraw).observe(panel"));
 assert(html.includes("const unlocked=!panel.classList.contains('pf-painel-oculto')"));
 console.log('PASS: layout restrito ao desktop, interface mobile não modificada e ausência de dados/credenciais de teste em '+name);
}
