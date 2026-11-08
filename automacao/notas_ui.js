/* Painel de notas: não lê nem grava lançamentos; resumo somente por ação explícita. */
(() => {
 'use strict';
 function install(){
  if(window.PFNotas||!window.PFNotasCore)return;
  const CFG=window.PFNotasConfig||{},Core=window.PFNotasCore;
  const $=id=>document.getElementById(id),esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const uuid=()=>crypto.randomUUID();
  const client=()=>{try{return CFG.getClient?CFG.getClient():window.pfdClient||(typeof supabaseCliente!=='undefined'?supabaseCliente:null)||window.supabaseCliente||null;}catch(_){return null;}};
  function allowed(){try{if(CFG.isAllowed)return !!CFG.isAllowed();if(window.pfdAssert)window.pfdAssert();return typeof protecaoAutenticada!=='undefined'&&protecaoAutenticada===true&&!document.body.classList.contains('auth-pendente');}catch(_){return false;}}
  const legacyStore=()=>window.pfdLocal||window.localStorage;
  let draft=null,timer=null,writeChain=Promise.resolve(),rows=[],generation=0,filterTag='',restoreFocus=null,refreshTimer=null,syncTimer=null,busy=false,lastAttempt=0,authClient=null,authSubscription=null,authSerial=0,changing=false;
  const asked=new Set(),unsaved=new Map();let lastFailure=null;
  let channel;try{channel=typeof BroadcastChannel==='function'?new BroadcastChannel('pf-notas-v3'):null;}catch(_){}
  const panel=document.createElement('aside');panel.id='pfNotas';panel.hidden=true;panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');panel.setAttribute('aria-labelledby','pfnTitle');panel.setAttribute('data-pf-i18n-skip','');panel.setAttribute('data-pf-private','');
  panel.innerHTML='<header class="pfn-head"><h2 id="pfnTitle">Notas</h2><button id="pfnSync" type="button" title="Sincronizar notas">Sincronizar</button><button id="pfnNew" type="button">+ Nova</button><button id="pfnExport" type="button">Exportar</button><button id="pfnClose" type="button" aria-label="Fechar bloco de notas">✕</button></header><div class="pfn-sync" id="pfnState" role="status" aria-live="polite">Identificando conta…</div><section id="pfnListView" style="display:flex;flex:1;min-height:0;flex-direction:column"><div class="pfn-tools"><label class="pfn-field-label" for="pfnSearch">Buscar notas</label><input id="pfnSearch" type="search" placeholder="Texto ou #tag"><div class="pfn-tags" id="pfnTags"></div></div><div class="pfn-list" id="pfnList"></div></section><section id="pfnEditView" class="pfn-editor" hidden><div class="pfn-bar"><button type="button" id="pfnBack">← Voltar</button><button type="button" id="pfnPin" aria-pressed="false">Fixar</button><button type="button" id="pfnSummary">Resumo do painel</button><button type="button" id="pfnCheck">☐ Tarefa</button><button type="button" id="pfnDelete">Excluir</button></div><div class="pfn-bar" id="pfnColors" role="group" aria-label="Cor da nota"></div><label class="pfn-field-label" for="pfnHeading">Título</label><input id="pfnHeading" maxlength="200" placeholder="Título da nota"><label class="pfn-field-label" for="pfnText">Texto</label><textarea id="pfnText" maxlength="100000" placeholder="Escreva aqui. Use #tags, @20/11/2026 ou [ ] tarefa."></textarea><div class="pfn-editor-status" id="pfnSaved" role="status" aria-live="polite"></div></section><footer class="pfn-account" id="pfnAccount"></footer>';
  const diagnostic=document.createElement('details');diagnostic.id='pfnDiagnostic';diagnostic.hidden=true;diagnostic.innerHTML='<summary>Detalhes da sincronização</summary><pre id="pfnDiagnosticText"></pre>';panel.append(diagnostic);
  const backdrop=document.createElement('div');backdrop.id='pfNotasBackdrop';backdrop.hidden=true;backdrop.setAttribute('data-pf-private','');document.body.append(backdrop,panel);
  function status(message,state='info'){$('pfnState').textContent=message;$('pfnState').dataset.state=state;}
  const engine=Core.create({store:CFG.store||Core.indexedStore(window.indexedDB),changed:event=>{
   if(['saved','synced','imported'].includes(event.kind)){try{channel?.postMessage({owner:event.owner});}catch(_){}scheduleRefresh();}
  }});
  function project(){try{const url=client()?.supabaseUrl||(typeof SUPABASE_URL!=='undefined'?SUPABASE_URL:null);const host=new URL(url).hostname;return /^[a-z0-9-]+\.supabase\.co$/i.test(host)?host.split('.')[0]:'domínio personalizado';}catch(_){return 'não identificado';}}
  function fail(error){
   const info=Core.diagnose(error);lastFailure={diagnostico:'notas-v3.1',codigo:info.code,etapa:info.phase,tipo:info.kind,projeto:project()};
   $('pfnDiagnosticText').textContent=JSON.stringify(lastFailure,null,2);diagnostic.hidden=false;
   status(info.message+' Código: '+info.code+'.','error');
  }
  const tags=text=>[...new Set((String(text).match(/#[\p{L}\d_-]+/gu)||[]).map(s=>s.toLocaleLowerCase('pt-BR')))];
  function reminder(text){const m=String(text).match(/@(\d{2})\/(\d{2})(?:\/(\d{4}))?/);if(!m)return null;const year=Number(m[3]||new Date().getFullYear()),month=Number(m[2])-1,day=Number(m[1]),date=new Date(year,month,day);return date.getFullYear()===year&&date.getMonth()===month&&date.getDate()===day?date:null;}
  const late=n=>{const date=reminder(n.texto),today=new Date();today.setHours(0,0,0,0);return date&&date<=today;};
  function enable(){const ready=allowed()&&!!engine.owner()&&!changing;$('pfnNew').disabled=!ready;$('pfnSync').disabled=!ready;return ready;}
  function listView(){draft=null;$('pfnEditView').hidden=true;$('pfnListView').hidden=false;render();}
  function render(){
   const visible=rows.filter(n=>!n.deleted),query=$('pfnSearch').value.toLocaleLowerCase('pt-BR');
   const allTags=[...new Set(visible.flatMap(n=>tags(n.texto)))].sort();if(filterTag&&!allTags.includes(filterTag))filterTag='';
   $('pfnTags').innerHTML=allTags.map(t=>'<button type="button" data-tag="'+esc(t)+'" aria-pressed="'+(t===filterTag)+'">'+esc(t)+'</button>').join('');
   const selected=visible.filter(n=>(!query||(n.titulo+' '+n.texto).toLocaleLowerCase('pt-BR').includes(query))&&(!filterTag||tags(n.texto).includes(filterTag))).sort((a,b)=>Number(b.fixa)-Number(a.fixa)||b.edit-a.edit||a.id.localeCompare(b.id));
   $('pfnList').innerHTML=selected.length?selected.map(n=>{
    const tasks=(n.texto.match(/^\s*\[[ x]\]/gim)||[]).length,done=(n.texto.match(/^\s*\[x\]/gim)||[]).length;
    return '<button type="button" class="pfn-card" data-note="'+n.id+'" style="--pfn-color:'+n.cor+'"><strong>'+(n.fixa?'📌 ':'')+esc(n.titulo||'Sem título')+'</strong><small>'+esc(n.texto.slice(0,180))+'</small><small>'+esc(new Date(n.edit).toLocaleString('pt-BR'))+(tasks?' · '+done+'/'+tasks+' tarefas':'')+(late(n)?' · Lembrete para conferir':'')+(n.dirty&&engine.owner()!=='local'?' · Não enviada à nuvem':'')+'</small></button>';
   }).join(''):'<p>Nenhuma nota neste filtro.</p>';
   const badge=$('pfNotasBadge');if(badge)badge.textContent=String(visible.filter(late).length||'');
   const owner=engine.owner();$('pfnAccount').textContent=!owner?'Identificando conta…':owner==='local'?'Notas locais deste navegador. Não são transferidas automaticamente ao entrar.':'Notas da conta conectada. Ao sair, pendências locais são mantidas para evitar perda.';
   enable();
  }
  async function refresh(){const at=generation,owner=engine.owner();if(!owner||!allowed())return;try{const result=await engine.list();if(at!==generation||owner!==engine.owner()||!allowed())return;rows=result;render();}catch(e){if(at===generation)fail(e);}}
  function scheduleRefresh(){clearTimeout(refreshTimer);refreshTimer=setTimeout(refresh,40);}
  function colors(){
   const names=['Cinza','Azul','Verde','Âmbar','Vermelho','Roxo'];$('pfnColors').innerHTML=Core.colors.map((c,i)=>'<button type="button" data-color="'+c+'" aria-label="'+names[i]+'" aria-pressed="'+(draft?.cor===c)+'"><span style="display:inline-block;width:13px;height:13px;background:'+c+';border-radius:50%"></span></button>').join('');$('pfnPin').setAttribute('aria-pressed',String(!!draft?.fixa));
  }
  function openNote(n){if(!enable())return;draft=n?{...n,touched:false}:{id:uuid(),owner:engine.owner(),titulo:'',texto:'',cor:Core.colors[1],fixa:false,deleted:false,localToken:null,touched:false};$('pfnHeading').value=draft.titulo;$('pfnText').value=draft.texto;$('pfnSaved').textContent='';$('pfnListView').hidden=true;$('pfnEditView').hidden=false;colors();$('pfnHeading').focus();}
  function queue(){if(!draft||!enable())return;draft.touched=true;$('pfnSaved').textContent='Salvando…';clearTimeout(timer);timer=setTimeout(()=>{timer=null;flush().catch(()=>{});},600);}
  function flush(){
   clearTimeout(timer);timer=null;const note=draft,at=generation;
   if(!note||!note.touched)return writeChain;
   const data={titulo:$('pfnHeading').value,texto:$('pfnText').value,cor:note.cor,fixa:note.fixa,deleted:false};
   if(!note.localToken&&!data.titulo.trim()&&!data.texto.trim()){note.touched=false;return writeChain;}
   const who=note.owner;
   const task=writeChain.catch(()=>{}).then(()=>engine.save(note.id,data,note.localToken,who)).then(result=>{
    note.id=result.note.id;note.localToken=result.note.localToken;unsaved.delete(who);
    if(at===generation&&draft===note){
     if($('pfnHeading').value===data.titulo&&$('pfnText').value===data.texto&&note.cor===data.cor&&note.fixa===data.fixa)note.touched=false;
     $('pfnSaved').textContent=result.conflict?'Conflito preservado em uma nova cópia.':who==='local'?'Salvo neste dispositivo.':'Salvo neste dispositivo; aguardando a nuvem.';
     scheduleSync();
    }
    return result;
   }).catch(error=>{unsaved.set(who,{...data,id:note.id,localToken:note.localToken,owner:who});if(at===generation){$('pfnSaved').textContent='Não foi possível salvar. Mantenha esta janela aberta ou exporte o texto.';fail(error);}throw error;});
   writeChain=task;return task;
  }
  async function back(){const current=draft,at=generation;try{await flush();if(at===generation&&draft===current){listView();await refresh();}}catch(_){} }
  async function close(){const at=generation;try{await flush();if(at!==generation)return;panel.hidden=true;backdrop.hidden=true;restoreFocus?.focus?.();}catch(_){} }
  function forceClose(){panel.hidden=true;backdrop.hidden=true;draft=null;$('pfnHeading').value='';$('pfnText').value='';$('pfnSaved').textContent='';rows=[];filterTag='';lastFailure=null;diagnostic.hidden=true;$('pfnDiagnosticText').textContent='';$('pfnList').replaceChildren();$('pfnTags').replaceChildren();$('pfnSearch').value='';$('pfnEditView').hidden=true;$('pfnListView').hidden=false;const badge=$('pfNotasBadge');if(badge)badge.textContent='';}
  async function open(){if(!allowed())return;restoreFocus=document.activeElement;panel.hidden=false;backdrop.hidden=false;enable();await refresh();if(panel.hidden)return;const recovery=unsaved.get(engine.owner());if(!draft&&recovery&&enable()){openNote(recovery);draft.touched=true;status('Rascunho recuperado da memória desta aba. Exporte ou tente salvar novamente.','error');}else $('pfnSearch').focus();sync();}
  function scheduleSync(){clearTimeout(syncTimer);syncTimer=setTimeout(sync,1500);}
  async function sync(){
   if(!allowed()||changing||!engine.owner()||busy)return;
   const at=generation,owner=engine.owner();lastAttempt=Date.now();
   try{
    await flush();if(at!==generation||!allowed())return;
    if(owner==='local'||!client()){status('Salvamento local neste navegador. Entre na nuvem para sincronizar.');return;}
    if(!navigator.onLine){status('Offline. As alterações salvas serão enviadas quando houver conexão.');return;}
    busy=true;lastAttempt=Date.now();status('Sincronizando notas…');const result=await engine.sync(client());
    if(at!==generation||!allowed())return;
    status(result.conflicts?'Conflito detectado: o conteúdo foi preservado. Confira as cópias; exclusões concorrentes podem precisar de nova confirmação.':result.pending?'Salvo neste dispositivo; há notas aguardando envio.':'Notas sincronizadas às '+new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}));await refresh();if(result.pending)scheduleSync();
   }catch(error){if(at===generation&&allowed())fail(error);}finally{if(at===generation)busy=false;}
  }
  async function migrate(){
   const who=engine.owner();if(!who||asked.has(who)||!allowed())return;asked.add(who);
   try{
    const storage=legacyStore(),key=storage?.getItem('pf-notas-v1')?'pf-notas-v1':'pf-notas-v2:'+who,raw=storage?.getItem(key);if(!raw)return;
    const old=JSON.parse(raw);if(!Array.isArray(old))throw Error('Notas antigas ilegíveis; o original foi mantido.');
    if(!old.length)return;
    if(!confirm('Foram encontradas '+old.length+' notas antigas. Importar para '+(who==='local'?'este navegador':'a conta conectada')+'? Cancelar mantém o original.'))return;
    await flush();if(who!==engine.owner()||!allowed())return;
    await engine.importLegacy(raw);
    if(who===engine.owner()&&storage.getItem(key)===raw)storage.removeItem(key);
    status('Notas antigas importadas e conferidas no dispositivo.');await refresh();scheduleSync();
   }catch(e){fail(e);}
  }
  function switchOwner(uid){
   const next=uid||'local',old=engine.owner();if(next===old)return;
   const oldWrite=flush().catch(()=>{});writeChain=oldWrite;generation++;busy=false;lastAttempt=0;changing=true;clearTimeout(syncTimer);forceClose();engine.setOwner(next);const at=generation;
   oldWrite.then(async()=>{
    if(old&&old!=='local'&&engine.owner()!==old&&CFG.limparAoSair!==false)await engine.clearClean(old);
   }).catch(fail).finally(async()=>{if(at!==generation)return;changing=false;await refresh();if(!allowed())return;await migrate();sync();});
  }
  function bindClient(){
   const found=client();if(!found){if(!engine.owner())switchOwner(null);return;}
   if(found===authClient)return;authSubscription?.unsubscribe?.();authClient=found;const start=++authSerial;
   const sub=found.auth.onAuthStateChange((event,session)=>{const serial=++authSerial;setTimeout(()=>{if(serial===authSerial)switchOwner(session?.user?.id||null);},0);});authSubscription=sub?.data?.subscription;
   found.auth.getSession().then(({data,error})=>{if(error)throw error;if(authSerial===start)switchOwner(data?.session?.user?.id||null);}).catch(e=>{if(authSerial===start){switchOwner(null);fail(e);}});
  }
  function mount(){
   const normal=$('pfMenuTopo'),mobile=document.querySelector('#pfMobileShell > header.bar')||document.querySelector('#pm-app .bar'),mobileMode=document.body.classList.contains('pf-mobile-layout');const host=mobileMode?(mobile?.getClientRects().length?mobile:null):normal?.getClientRects().length?normal:mobile?.getClientRects().length?mobile:null;
   let button=$('pfNotasBtn');if(!button&&host){button=document.createElement('button');button.type='button';button.id='pfNotasBtn';button.className='pf-menu-categoria';button.setAttribute('data-pf-i18n-skip','');button.setAttribute('aria-controls','pfNotas');button.innerHTML='📝 Notas <span id="pfNotasBadge"></span>';button.onclick=()=>panel.hidden?open():close();}
   if(button){button.hidden=!allowed()||!host;if(host&&button.parentElement!==host)host.append(button);button.setAttribute('aria-expanded',String(!panel.hidden));}
   const menu=$('pfMenuItens');let more=$('pfNotasMaisBtn');
   if(menu&&mobile&&!more){more=document.createElement('button');more.id='pfNotasMaisBtn';more.type='button';more.setAttribute('data-pf-i18n-skip','');more.setAttribute('aria-controls','pfNotas');more.textContent='📝 Notas';more.onclick=e=>{e.stopPropagation();$('pfMenuFechar')?.click();open();};}
   if(more){more.hidden=!allowed()||!mobile?.getClientRects().length;if(menu&&more.parentElement!==menu)menu.append(more);}
  }
  function append(text){if(!draft)return;const area=$('pfnText');if(area.value.length-(area.selectionEnd-area.selectionStart)+text.length>100000)return status('O texto excederia o limite da nota.','error');area.setRangeText(text,area.selectionStart,area.selectionEnd,'end');area.focus();queue();}
  function download(text){const url=URL.createObjectURL(new Blob(['\ufeff'+text],{type:'text/plain;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download='notas-'+new Date().toLocaleDateString('sv-SE')+'.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),30000);}
  $('pfnNew').onclick=async()=>{const at=generation;if(draft){await back();if(draft)return;}if(at===generation)openNote(null);};
  $('pfnClose').onclick=backdrop.onclick=close;$('pfnBack').onclick=back;$('pfnSync').onclick=sync;
  $('pfnHeading').oninput=$('pfnText').oninput=queue;$('pfnSearch').oninput=render;
  $('pfnList').onclick=e=>{const id=e.target.closest('[data-note]')?.dataset.note;if(id)openNote(rows.find(n=>n.id===id));};
  $('pfnTags').onclick=e=>{const tag=e.target.closest('[data-tag]')?.dataset.tag;if(tag){filterTag=filterTag===tag?'':tag;render();}};
  $('pfnColors').onclick=e=>{const c=e.target.closest('[data-color]')?.dataset.color;if(draft&&Core.colors.includes(c)){draft.cor=c;colors();queue();}};
  $('pfnPin').onclick=()=>{if(draft){draft.fixa=!draft.fixa;colors();queue();}};$('pfnCheck').onclick=()=>append('\n[ ] ');
  $('pfnDelete').onclick=async()=>{if(!draft||!confirm('Excluir esta nota? A exclusão será sincronizada.'))return;const at=generation;try{await flush();if(at!==generation||!draft)return;await engine.remove(draft.id,draft.localToken);if(at!==generation)return;listView();await refresh();scheduleSync();}catch(e){fail(e);}};
  $('pfnSummary').onclick=()=>{
   const manager=$('painelGerencial');if(!allowed()||!manager||manager.classList.contains('pf-painel-oculto')||!manager.getClientRects().length)return status('Mostre o painel gerencial para inserir um resumo dos valores visíveis.');
   const visible=[...document.querySelectorAll('#painelResumoGerencial > div')].filter(n=>n.getClientRects().length).map(n=>n.innerText.trim().replace(/\s*\n\s*/g,': '));
   const period=typeof obterPeriodoFiltroPainel==='function'?obterPeriodoFiltroPainel():$('periodoPainelGerencial')?.textContent||'';
   append('\nResumo do painel — '+period+'\nRegistrado em '+new Date().toLocaleString('pt-BR')+'\n'+visible.join('\n')+'\n');
  };
  $('pfnExport').onclick=async()=>{
   if(!allowed())return;const at=generation,owner=engine.owner();try{await flush();if(at!==generation||!allowed())return;const saved=await engine.list();if(at!==generation||owner!==engine.owner()||!allowed())return;download(saved.filter(n=>!n.deleted).map(n=>'# '+(n.titulo||'Sem título')+'\n'+n.texto+'\n').join('\n---\n'));}
   catch(error){if(at!==generation||!allowed())return;if(draft)download('# Rascunho ainda não salvo\n'+$('pfnHeading').value+'\n'+$('pfnText').value);else fail(error);}
  };
  document.addEventListener('keydown',e=>{
   if(e.ctrlKey&&e.altKey&&e.key.toLowerCase()==='n'&&allowed()){e.preventDefault();panel.hidden?open():close();}
   if(panel.hidden)return;if(e.key==='Escape'){e.preventDefault();close();}
   if(e.key==='Tab'){const nodes=[...panel.querySelectorAll('button,input,textarea')].filter(n=>!n.disabled&&n.getClientRects().length),first=nodes[0],last=nodes.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}}
  });
  channel&&(channel.onmessage=e=>{if(e.data?.owner===engine.owner()){if(draft?.touched)flush().catch(()=>{});scheduleRefresh();}});
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')flush().catch(()=>{});else{bindClient();refresh();sync();}});
  window.addEventListener('online',sync);window.addEventListener('pagehide',()=>{flush().catch(()=>{});});
  window.addEventListener('pageshow',()=>{if(allowed()){bindClient();refresh();sync();}});
  let wasAllowed=allowed();
  setInterval(()=>{
   const access=allowed();if(wasAllowed&&!access){const pending=flush().catch(()=>{});writeChain=pending;generation++;busy=false;forceClose();const old=engine.owner();engine.setOwner(null);pending.then(()=>old&&old!=='local'&&engine.owner()!==old&&CFG.limparAoSair!==false?engine.clearClean(old):null).catch(()=>{});authClient=null;}
   wasAllowed=access;mount();if(!access)return;bindClient();if(!panel.hidden)refresh();
   if(Date.now()-lastAttempt>=60000&&document.visibilityState==='visible')sync();
  },1000);
  let mounting=false;new MutationObserver(()=>{if(mounting)return;mounting=true;setTimeout(()=>{mounting=false;mount();},100);}).observe(document.body,{childList:true,subtree:true});
  window.PFNotas={abrir:open,sync,conta:()=>engine.owner(),diagnostico:()=>lastFailure?{...lastFailure}:{diagnostico:'notas-v3.1',projeto:project(),situacao:'Nenhuma falha registrada'},estado:()=>({conta:engine.owner(),notas:rows.filter(n=>!n.deleted).length,pendentes:rows.filter(n=>n.dirty).length}),importarAntigas:()=>{asked.delete(engine.owner());return migrate();}};
  mount();if(allowed())bindClient();
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
