const fs=require('fs'),vm=require('vm'),path=require('path'),assert=require('assert/strict');
function setup({current='V4.12.40',latest='V4.12.41',previous='',distribution=false,offline=false,local=false,notes=['Exemplo de melhoria da versão']}={}){
 const base='https://ricardodavila.github.io/planejamento-financeiro/'+(distribution?'distribuicao/':'');
 const script=fs.readFileSync(path.join(__dirname,'avisos_atualizacao.js'),'utf8').replaceAll('__PF_UPDATE_BASE__',base).replaceAll('__PF_UPDATE_HOST__',distribution?'window.parent':'window').replaceAll('__PF_UPDATE_STORAGE__',distribution?'pfdLocal':'localStorage');
 const elements=new Map(),data=new Map(previous?[['pf_ultima_versao_aberta_v1',previous]]:[]),events={},timers=[],fetches=[],navigation=[];let failure=offline;
 const make=tag=>({tag,children:[],style:{},setAttribute(){},append(...items){for(const x of items){this.children.push(x);if(x.id)elements.set(x.id,x);}},remove(){elements.delete(this.id);},textContent:'',disabled:false});
 const body=make('body');elements.set('pfHelpModalBody',make('div'));
 const location=new URL(local?'file:///C:/teste/index.html':base);location.replace=url=>navigation.push(url);
 const host={location},window={parent:host,location,confirm:()=>true,addEventListener:(name,fn)=>events[name]=fn};
 if(!distribution)window.parent=window;
 const storage={getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v)};
 const document={hidden:false,body,getElementById:id=>elements.get(id)||null,createElement:make,addEventListener:(name,fn)=>events[name]=fn};
 const ctx={window,document,location,navigator:{},localStorage:storage,pfdLocal:storage,CURRENT_VERSION:current,URL,Date,AbortSignal,fetch:async(url,opts)=>{fetches.push({url:String(url),opts});if(failure)throw Error('offline');return {ok:true,json:async()=>({version:latest,notes})};},compareVersions:(a,b)=>{const p=s=>s.replace(/^v/i,'').split('.').map(Number);a=p(a);b=p(b);for(let i=0;i<Math.max(a.length,b.length);i++){if((a[i]||0)!==(b[i]||0))return (a[i]||0)-(b[i]||0);}return 0;},closeMenu(){},show(title){elements.set('pfHelpModalBody',make('div'));},setInterval:(fn,ms)=>{timers.push({fn,ms});},setTimeout,clearTimeout};
 vm.createContext(ctx);vm.runInContext(script,ctx);
 return {window,ctx,events,timers,fetches,navigation,elements,data,setOffline:v=>failure=v,notice:()=>elements.get('pfUpdateNotice'),resetDelay:()=>vm.runInContext('pfUpdateLastCheck=0',ctx)};
}
(async()=>{
 let x=setup();await Promise.all([x.window.pfCheckUpdates(true),x.window.pfCheckUpdates(true)]);assert.equal(x.fetches.length,1);assert.equal(x.notice().children[0].textContent,'Nova versão disponível');assert.equal(x.navigation.length,0);assert.equal(x.fetches[0].opts.cache,'no-store');assert(x.fetches[0].url.includes('/planejamento-financeiro/version.json?'));
 const button=x.notice().children.find(e=>e.textContent==='Atualizar agora');await button.onclick();assert(x.navigation[0].includes('pf_update=V4.12.41'));
 x=setup();let workerListener,activated=false,scope='';x.ctx.navigator.serviceWorker={getRegistration:async url=>{scope=url;return {update:async()=>{},waiting:{postMessage:message=>{assert.equal(message.type,'SKIP_WAITING');activated=true;workerListener();}}};},addEventListener:(_name,fn)=>workerListener=fn,removeEventListener(){}};await x.window.pfCheckUpdates(true);await x.notice().children.find(e=>e.textContent==='Atualizar agora').onclick();assert(activated);assert(scope.endsWith('/planejamento-financeiro/'));assert.equal(x.navigation.length,1);
 x=setup();x.window.confirm=()=>false;await x.window.pfCheckUpdates(true);await x.notice().children.find(e=>e.textContent==='Atualizar agora').onclick();assert.equal(x.navigation.length,0);
 x=setup({distribution:true});await x.window.pfCheckUpdates(true);assert(x.fetches[0].url.includes('/distribuicao/version.json?'));await x.notice().children.find(e=>e.textContent==='Atualizar agora').onclick();assert(x.navigation[0].includes('/distribuicao/?pf_update='));
 x=setup({current:'V4.12.41',latest:'V4.12.41',previous:'V4.12.40'});await x.window.pfCheckUpdates(true);assert.equal(x.notice().children[0].textContent,'Aplicativo atualizado');assert.equal(x.data.get('pf_ultima_versao_aberta_v1'),'V4.12.41');
 x=setup({current:'V4.12.41',latest:'V4.12.41',previous:'V4.12.41'});await x.window.pfCheckUpdates(true);assert.equal(x.notice(),undefined);
 x=setup({current:'V4.12.41',latest:'V4.12.41'});await x.window.pfCheckUpdates(true);assert.equal(x.notice().children[0].textContent,'Versão atual do aplicativo');
 x=setup({offline:true});await x.window.pfCheckUpdates(true);assert(!x.notice());x.setOffline(false);await x.events.online();assert.equal(x.fetches.length,2);assert(x.notice());
 x=setup();x.ctx.document.hidden=true;await x.events.visibilitychange();assert.equal(x.fetches.length,0);x.ctx.document.hidden=false;await x.events.visibilitychange();assert.equal(x.fetches.length,1);assert.equal(x.timers[0].ms,120000);x.resetDelay();await x.timers[0].fn();assert.equal(x.fetches.length,2);
 x=setup({local:true});await x.window.pfCheckUpdates(true);assert.equal(x.fetches.length,0);assert.equal(x.navigation.length,0);
 x=setup({notes:['Ajuste de sincronização','<img src=x onerror=alert(1)>',null,'']});await x.window.pfCheckUpdates(true);assert(x.notice().children.some(e=>e.textContent==='O que foi atualizado nesta versão:'));let list=x.notice().children.find(e=>e.tag==='ul');assert.equal(list.children.length,2);assert.equal(list.children[1].textContent,'<img src=x onerror=alert(1)>');assert.equal(list.children[1].innerHTML,undefined);
 x=setup({current:'V4.12.41',latest:'V4.12.41',previous:'V4.12.40',notes:['Resumo da versão instalada']});await x.window.pfCheckUpdates(true);assert.equal(x.notice().children.find(e=>e.tag==='ul').children[0].textContent,'Resumo da versão instalada');
 x=setup({notes:[]});await x.window.pfCheckUpdates(true);assert(x.notice().children.some(e=>e.textContent==='Os detalhes desta publicação não foram informados.'));
 x=setup({notes:['Consulta manual']});await x.window.pfCheckUpdates();assert.equal(x.elements.get('pfHelpModalBody').children.find(e=>e.tag==='ul').children[0].textContent,'Consulta manual');
 console.log('PASS: versão nova, já atualizada, primeira abertura, ausência de repetição, canal pessoal/distribuição, retorno à aba, modo offline, concorrência e atualização sem recarga automática.');
})().catch(error=>{console.error(error);process.exitCode=1;});
