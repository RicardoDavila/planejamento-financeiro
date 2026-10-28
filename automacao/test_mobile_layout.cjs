const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
for(const name of ['index.html','teste-gemini/app.html']){
 const html=fs.readFileSync(path.resolve(__dirname,'..',name),'utf8');
 const extract=id=>html.match(new RegExp('<script id="'+id+'">([\\s\\S]*?)</script>'))[1];
 for(const id of ['pf-mobile-approved-layout','pf-mobile-approved-menu']){
  vm.runInNewContext(extract(id),{matchMedia:q=>{assert.equal(q,'(max-width:900px), (pointer:coarse)');return {matches:false};}});
 }
 for(const forbidden of ['preview-bootstrap','preview-isolation','simular-celular','simular conexão','teste123','DADOS FICTÍCIOS','mobile-preview-switch'])assert(!html.includes(forbidden),forbidden);
 const js=extract('pf-mobile-approved-layout');
 const helper=js.slice(js.indexOf('const paid='),js.indexOf('const originalGet='));
 class FixedDate extends Date{constructor(...args){super(...(args.length?args:['2026-10-28T12:00:00']));}}
 const context={Date:FixedDate,norm:x=>String(x||'').toLowerCase()};vm.createContext(context);vm.runInContext(helper+';globalThis.test={paid,late};',context);
 const record={tipo:'Despesa',vencimento:'2026-10-27',status:'Pendente'};assert(context.test.late(record));assert(!context.test.late({...record,dataPg:'2026-10-27'}));assert(!context.test.late({...record,status:'Pago'}));assert(!context.test.late({...record,tipo:'Receita'}));assert(!context.test.late({...record,vencimento:'2026-10-30'}));assert(context.test.paid({status:'Recebido'}));
 // Execute the exact snapshot/notice handlers, ensuring the banner never restores the previous list.
 const fields={a:{value:'Receita'},b:{value:'2026-10-01'},q:{value:'água'},notices:{setAttribute(){},scrollIntoView(){}},list:{getBoundingClientRect:()=>({top:100})}},originalNodes={a:fields.a,b:fields.b};
 const button={getAttribute:()=>"aplicarFiltroRapido('esteMes')",classList:{toggle(){}}};
 const env={select:{value:'pago'},window:{scrollY:50,scrollTo(){}},document:{querySelector:selector=>selector.includes('button.ativo')?button:{offsetHeight:100},querySelectorAll:()=>[button]},original:id=>originalNodes[id],el:id=>fields[id]??(fields[id]={value:'',setAttribute(){},scrollIntoView(){}}),requestAnimationFrame(){},render(){},renderTable(){},limparFiltros(){fields.a.value='Todos';fields.b.value='';},aplicarFiltroRapido(){}};
 vm.createContext(env);
 let snippet=js.slice(js.indexOf('function snapshot(){'),js.indexOf("el('openFilters').onclick="));
 snippet+=js.slice(js.indexOf('function showNotices(){'),js.indexOf("el('toggleValues').onclick="));
 vm.runInContext("let statusFilter='pago',query='água',previousNotice=null,filtroRapidoEspecial=null;const stateIds=['a','b'];function syncPeriod(){};"+snippet+";globalThis.get=()=>({previousNotice,statusFilter,query});",env);
 fields.notices.onclick();assert(env.get().previousNotice);assert.equal(env.get().query,'');fields.alertBanner.onclick();assert(env.get().previousNotice);fields.notices.onclick();assert.equal(env.get().previousNotice,null);assert.equal(fields.a.value,'Receita');assert.equal(fields.b.value,'2026-10-01');assert.equal(env.get().query,'água');assert.equal(env.get().statusFilter,'pago');
 console.log('PASS: integração mobile inativa no PC, sem dados de teste; vencimentos e restauração dos avisos em '+name);
}
