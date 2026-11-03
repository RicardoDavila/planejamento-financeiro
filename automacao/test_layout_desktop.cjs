const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.resolve(__dirname,'..');
for(const name of ['index.html','teste-gemini/app.html']){
 const html=fs.readFileSync(path.join(root,name),'utf8');
 for(const id of ['pf-desktop-clean-layout','pf-desktop-clean-menu']){
  const code=html.match(new RegExp('<script id="'+id+'">([\\s\\S]*?)</script>'))[1];
  let installed=false;
  const env={matchMedia:q=>{assert.equal(q,'(min-width:901px) and (pointer:fine)');return {matches:false};},document:{readyState:'loading',addEventListener(){installed=true;}},window:{}};
  vm.runInNewContext(code,env);
  assert.equal(installed,id==='pf-desktop-clean-layout','Somente o construtor compartilhado dos gráficos deve iniciar no celular.');
 }
 for(const prohibited of ['mobile-preview-switch','mobile-experience','preview-isolation','preview-bootstrap','teste123','DADOS FICTÍCIOS'])assert(!html.includes(prohibited),name+': conteúdo exclusivo da prévia');
 assert(html.includes('id="pf-desktop-clean-css">@media (min-width:901px) and (pointer:fine)'));
 assert(html.includes('const dadosPadraoCompletos = [];'));
 assert(html.includes("new MutationObserver(redraw).observe(panel"));
 assert(html.includes("const unlocked=!(document.body.classList.contains('pf-mobile-layout')"));
 console.log('PASS: menu desktop restrito ao PC, gráficos construídos no celular e interface mobile preservada e ausência de dados/credenciais de teste em '+name);
}
