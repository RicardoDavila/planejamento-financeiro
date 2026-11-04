const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),path=require('path');
const root=path.resolve(__dirname,'..');
for(const file of ['index.html','distribuicao/app.html','teste-gemini/app.html']){
 const html=fs.readFileSync(path.join(root,file),'utf8');
 const first=html.indexOf("  const layoutMedia = matchMedia('(max-width:900px), (pointer:coarse)');"),last=html.indexOf("  layoutMedia.addEventListener('change',verificarTrocaLayout);",first);
 assert(first>0&&last>first);
 const block=html.slice(first,last)+"  layoutMedia.addEventListener('change',verificarTrocaLayout);";
 let reloads=0,mobile=false,printing=false,screen=true,bodyPrinting=false,callback;const events={},timers=[];
 const media={matches:false,addEventListener:(type,fn)=>{assert.equal(type,'change');callback=fn;}};
 const env={matchMedia:q=>q==='print'?{matches:printing}:q==='screen'?{matches:screen}:media,mobile:()=>mobile,location:{reload(){reloads++;}},window:{addEventListener:(name,fn)=>events[name]=fn},document:{body:{classList:{contains:name=>name==='imprimir-graficos'&&bodyPrinting}}},setTimeout:fn=>timers.push(fn)};
 vm.runInNewContext(block,env);
 // Reproduz a condição do bug: a prévia muda a mídia, sem logout solicitado.
 printing=true;screen=false;media.matches=true;callback({matches:true});assert.equal(reloads,0);
 printing=false;screen=true;bodyPrinting=true;callback({matches:true});assert.equal(reloads,0);
 bodyPrinting=false;events.beforeprint();callback({matches:true});assert.equal(reloads,0);
 events.afterprint();callback({matches:true});assert.equal(reloads,0);
 media.matches=false;timers.splice(0).forEach(fn=>fn());callback({matches:true});assert.equal(reloads,0,'evento antigo não pode recarregar a versão pessoal');
 // Abrir e cancelar/salvar repetidamente deve manter a página atual.
 for(let i=0;i<3;i++){events.beforeprint();printing=true;screen=false;media.matches=true;callback({matches:true});events.afterprint();printing=false;screen=true;media.matches=false;callback({matches:false});timers.splice(0).forEach(fn=>fn());}
 assert.equal(reloads,0);
 // A transição real entre layouts continua funcionando fora da impressão.
 media.matches=true;callback({matches:true});assert.equal(reloads,1);mobile=true;callback({matches:true});assert.equal(reloads,1);media.matches=false;callback({matches:false});assert.equal(reloads,2);
 assert(!html.includes("addEventListener('change',()=>location.reload())"));
 // O defeito anterior recarregava inclusive na transição provocada pela impressão.
 let before=0;const old=()=>before++;old({matches:true});assert.equal(before,1);
 console.log('PASS:',file,'mídia de impressão, cancelamento, retorno, eventos atrasados e troca real de layout.');
}
