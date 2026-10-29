 const pfUpdateBase=new URL('__PF_UPDATE_BASE__');
 const pfUpdateKey='pf_ultima_versao_aberta_v1';
 const pfUpdateHost=__PF_UPDATE_HOST__;
 const pfUpdateLocal=pfUpdateHost.location.origin!==pfUpdateBase.origin||![pfUpdateBase.pathname,pfUpdateBase.pathname+'index.html'].includes(pfUpdateHost.location.pathname);
 let pfUpdatePending=null,pfUpdateLastCheck=0,pfUpdateNotified='',pfUpdateOpened=false;
 function pfUpdateRead(){try{return __PF_UPDATE_STORAGE__.getItem(pfUpdateKey)||'';}catch{return '';}}
 function pfUpdateRemember(){try{__PF_UPDATE_STORAGE__.setItem(pfUpdateKey,CURRENT_VERSION);}catch{}}
 function pfUpdateAppendNotes(body,release){
  const heading=document.createElement('strong');heading.textContent='O que foi atualizado nesta versão:';heading.style.cssText='display:block;margin:12px 0 6px';body.append(heading);
  const notes=Array.isArray(release?.notes)?release.notes.filter(n=>typeof n==='string'&&n.trim()).map(n=>n.trim()):[];
  if(!notes.length){const text=document.createElement('p');text.textContent='Os detalhes desta publicação não foram informados.';body.append(text);return;}
  const list=document.createElement('ul');list.style.cssText='margin:6px 0 12px;padding-left:22px;list-style:disc;line-height:1.5';
  for(const note of notes){const item=document.createElement('li');item.textContent=note;item.style.marginBottom='6px';list.append(item);}
  body.append(list);
 }
 function pfUpdateBanner(title,message,latest='',release=null){
  document.getElementById('pfUpdateNotice')?.remove();
  const box=document.createElement('section');box.id='pfUpdateNotice';box.setAttribute('role','status');box.setAttribute('aria-live','polite');
  box.style.cssText='position:fixed;bottom:88px;left:12px;right:12px;max-width:560px;margin:0 auto;z-index:15000;background:#fff;color:#1e293b;border:2px solid #2563eb;border-radius:14px;padding:16px;box-shadow:0 8px 30px #0f172a44;font:14px system-ui;max-height:45dvh;overflow:auto';
  const heading=document.createElement('strong');heading.textContent=title;box.append(heading);
  const text=document.createElement('p');text.textContent=message;text.style.cssText='margin:8px 0;line-height:1.5';box.append(text);
  pfUpdateAppendNotes(box,release);
  if(latest){const update=pfUpdateButton(latest,box);box.append(update);}
  const close=document.createElement('button');close.type='button';close.textContent=latest?'Agora não':'Fechar';close.style.cssText='padding:9px 14px;border-radius:8px;border:1px solid #94a3b8;background:#f1f5f9;color:#1e293b;margin:4px';close.onclick=()=>box.remove();box.append(close);
  document.body.append(box);
 }
 async function pfUpdateActivate(latest){
  if('serviceWorker' in navigator){
   const reg=await navigator.serviceWorker.getRegistration(pfUpdateBase.href);
   if(reg){
    await reg.update();
    if(reg.installing)await new Promise((resolve,reject)=>{
     const worker=reg.installing;
     const finish=error=>{clearTimeout(timer);worker.removeEventListener('statechange',check);error?reject(error):resolve();};
     const check=()=>{if(worker.state==='installed'||worker.state==='activated')finish();else if(worker.state==='redundant')finish(Error('Não foi possível baixar a atualização. Tente novamente.'));};
     const timer=setTimeout(()=>finish(Error('O download da atualização demorou. Tente novamente.')),20000);
     worker.addEventListener('statechange',check);check();
    });
    if(reg.waiting)await new Promise((resolve,reject)=>{
     const done=()=>{clearTimeout(timer);navigator.serviceWorker.removeEventListener('controllerchange',done);resolve();};
     const timer=setTimeout(()=>{navigator.serviceWorker.removeEventListener('controllerchange',done);reject(Error('Feche as janelas do aplicativo e abra novamente para concluir a atualização.'));},12000);
     navigator.serviceWorker.addEventListener('controllerchange',done);
     reg.waiting.postMessage({type:'SKIP_WAITING'});
    });
   }
  }
  const url=new URL(pfUpdateBase.href);url.searchParams.set('pf_update',latest);
  pfUpdateHost.location.replace(url.href);
 }
 function pfUpdateButton(latest,body){
  const button=document.createElement('button');button.type='button';button.textContent='Atualizar agora';button.style.cssText='padding:10px 14px;border:0;border-radius:8px;background:#1d4ed8;color:white;margin:4px';
  button.onclick=async()=>{
   if(!window.confirm('Salve qualquer edição em andamento antes de atualizar. Deseja carregar a nova versão agora?'))return;
   button.disabled=true;button.textContent='Preparando atualização…';
   try{await pfUpdateActivate(latest);}catch(error){button.disabled=false;button.textContent='Tentar novamente';const text=document.createElement('p');text.textContent=error.message;body.append(text);}
  };
  return button;
 }
 window.pfCheckUpdates=async function(automatica=false){
  automatica=automatica===true;
  if(automatica&&(document.hidden||pfUpdateLocal))return;
  if(pfUpdatePending){await pfUpdatePending;if(automatica)return;}
  if(automatica&&Date.now()-pfUpdateLastCheck<30000)return;
  const operation=(async()=>{
   pfUpdateLastCheck=Date.now();
   if(!automatica){closeMenu();show('Verificar atualizações','<p>Consultando a versão publicada…</p>');}
   try{
    const response=await fetch(new URL('version.json?t='+Date.now(),pfUpdateBase),{cache:'no-store',signal:AbortSignal.timeout(15000)});
    if(!response.ok)throw Error('Não foi possível consultar a versão publicada.');
    const release=await response.json();
    if(!/^v?\d+(\.\d+){1,3}$/i.test(release.version||''))throw Error('O arquivo de versão publicado está inválido.');
    const latest=release.version,cmp=compareVersions(latest,CURRENT_VERSION);
    const previous=pfUpdateRead();
    if(!pfUpdateLocal)pfUpdateRemember();
    if(automatica){
     if(cmp>0&&latest!==pfUpdateNotified){
      pfUpdateNotified=latest;
      pfUpdateBanner('Nova versão disponível','Você está na '+CURRENT_VERSION+'. A versão '+latest+' já pode ser instalada. Seus dados serão mantidos.',latest,release);
     }else if(cmp===0&&!pfUpdateOpened&&(!previous||compareVersions(CURRENT_VERSION,previous)>0)){
      pfUpdateBanner(previous?'Aplicativo atualizado':'Versão atual do aplicativo','A versão '+CURRENT_VERSION+' foi carregada. Seus dados foram mantidos.','',release);
     }
     pfUpdateOpened=true;return;
    }
    show(cmp>0?'Nova versão disponível':'Verificação de versão','');
    const body=document.getElementById('pfHelpModalBody'),text=document.createElement('p');
    text.textContent='Versão desta cópia: '+CURRENT_VERSION+'. Versão publicada: '+latest+'.';body.append(text);
    const explanation=document.createElement('p');explanation.textContent=pfUpdateLocal?'Esta cópia local ou de teste não será substituída.':cmp>0?'Salve qualquer edição em andamento antes de atualizar.':cmp===0?'Você está usando a versão publicada mais recente.':'Esta cópia tem uma versão superior à publicada.';body.append(explanation);
    pfUpdateAppendNotes(body,release);
    if(!pfUpdateLocal&&cmp>0)body.append(pfUpdateButton(latest,body));
   }catch(error){
    pfUpdateLastCheck=0;
    if(!automatica){show('Não foi possível verificar','');const text=document.createElement('p');text.textContent=error.message+' Tente novamente quando a conexão estiver disponível.';document.getElementById('pfHelpModalBody').append(text);}
   }
  })();
  pfUpdatePending=operation;
  try{await operation;}finally{if(pfUpdatePending===operation)pfUpdatePending=null;}
 };
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)return window.pfCheckUpdates(true);});
 window.addEventListener('focus',()=>window.pfCheckUpdates(true));
 window.addEventListener('online',()=>window.pfCheckUpdates(true));
 setInterval(()=>window.pfCheckUpdates(true),120000);

