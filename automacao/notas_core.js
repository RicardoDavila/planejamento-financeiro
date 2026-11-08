/* Notas independentes dos lançamentos. Gravação transacional e revisão do servidor. */
(() => {
 'use strict';
 const COLORS=['#94a3b8','#2563eb','#16a34a','#f59e0b','#dc2626','#7c3aed'];
 const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
 const clone=value=>JSON.parse(JSON.stringify(value));
 const content=n=>JSON.stringify([n.titulo,n.texto,n.cor,!!n.fixa,!!n.deleted]);
 const titleCopy=s=>(String(s||'Sem título').slice(0,179)+' (cópia de conflito)').slice(0,200);
 function fields(n){
  const titulo=String(n.titulo??''),texto=String(n.texto??'');
  if(titulo.length>200||texto.length>100000)throw Error('Título ou texto excedeu o limite da nota.');
  return {titulo,texto,cor:COLORS.includes(n.cor)?n.cor:COLORS[1],fixa:!!n.fixa,deleted:!!n.deleted};
 }
 function remote(raw,owner){
  if(!UUID.test(raw.id)||raw.user_id!==owner||!Number.isSafeInteger(Number(raw.versao))||Number(raw.versao)<1||!UUID.test(raw.mutacao))throw Error('Resposta inválida do servidor de notas.');
  return {owner,id:raw.id,...fields(raw),serverVersion:Number(raw.versao),serverMutation:raw.mutacao,op:raw.mutacao,localToken:raw.mutacao,dirty:false,edit:Date.parse(raw.updated_at)||0};
 }
 function indexedStore(factory){
  let opening;
  const open=()=>opening||(opening=new Promise((resolve,reject)=>{
   if(!factory)return reject(Error('Este navegador não disponibilizou o armazenamento de notas.'));
   const request=factory.open('pf-notas-v3',1);
   request.onupgradeneeded=()=>{const db=request.result;const s=db.createObjectStore('notes',{keyPath:['owner','id']});s.createIndex('owner','owner');};
   request.onerror=()=>{opening=null;reject(request.error||Error('Não foi possível abrir as notas.'));};
   request.onblocked=()=>{opening=null;reject(Error('Feche outras abas antigas para atualizar o armazenamento de notas.'));};
   request.onsuccess=()=>{request.result.onversionchange=()=>{request.result.close();opening=null;};resolve(request.result);};
  }));
  async function transact(owner,update){
   const db=await open();
   return new Promise((resolve,reject)=>{
    const tx=db.transaction('notes',update?'readwrite':'readonly'),store=tx.objectStore('notes'),get=store.index('owner').getAll(owner);let result,failure;
    get.onsuccess=()=>{
     try{
      const initial=get.result,rows=clone(initial);
      if(!update){result=rows;return;}
      const outcome=update(rows),next=outcome.rows||rows;result=clone(outcome.result??null);
      const old=new Map(initial.map(n=>[n.id,JSON.stringify(n)])),keep=new Set();
      for(const row of next){if(row.owner!==owner||!UUID.test(row.id))throw Error('Identidade inválida no armazenamento de notas.');keep.add(row.id);if(old.get(row.id)!==JSON.stringify(row))store.put(row);}
      for(const row of initial)if(!keep.has(row.id))store.delete([owner,row.id]);
     }catch(error){failure=error;tx.abort();}
    };
    tx.oncomplete=()=>resolve(result);
    tx.onabort=tx.onerror=()=>reject(failure||tx.error||Error('Não foi possível gravar as notas neste dispositivo.'));
   });
  }
  return {read:owner=>transact(owner),transact};
 }
 function create(options){
  const store=options.store,uuid=options.uuid||(()=>crypto.randomUUID()),now=options.now||Date.now;
  let owner=null,epoch=0,active=null;
  const notify=(kind,extra={})=>{try{options.changed?.({kind,owner,...extra});}catch(_){/* A UI notification cannot undo an already committed transaction. */}};
  const checkOwner=()=>{if(!owner)throw Error('A identificação da conta ainda não terminou.');return owner;};
  const make=(who,id,data,base=0)=>({owner:who,id,...fields(data),serverVersion:base,serverMutation:null,op:uuid(),localToken:uuid(),dirty:true,edit:now()});
  function fork(rows,n){
   if(n.deleted)return null;
   // The mutation UUID gives retries a stable identity for the recovery copy.
   const id=n.op;
   let copy=rows.find(r=>r.id===id);
   if(!copy){copy=make(n.owner,id,{...n,titulo:titleCopy(n.titulo)});rows.push(copy);}
   return copy;
  }
  async function save(id,data,expectedToken,forOwner){
   const who=forOwner||checkOwner();if(who!=='local'&&!UUID.test(who))throw Error('Conta inválida.');if(!UUID.test(id))throw Error('Identificador inválido da nota.');
   const result=await store.transact(who,rows=>{
    const current=rows.find(n=>n.id===id);let saved,conflict=false;
    if(current&&current.localToken!==expectedToken){
     saved=make(who,uuid(),{...data,titulo:titleCopy(data.titulo),deleted:false});rows.push(saved);conflict=true;
    }else if(current){
     Object.assign(current,fields(data),{op:uuid(),localToken:uuid(),dirty:true,edit:now()});saved=current;
    }else{saved=make(who,id,data);rows.push(saved);}
    return {rows,result:{note:saved,conflict}};
   });
   if(owner===who)notify('saved',{conflict:result.conflict});return result;
  }
  async function applyRemote(who,raw,expectedEpoch){
   const r=remote(raw,who);
   return store.transact(who,rows=>{
    if(epoch!==expectedEpoch||owner!==who)return {rows,result:{stale:true}};
    const current=rows.find(n=>n.id===r.id);let conflict=false;
    if(!current){rows.push(r);return {rows,result:{}};}
    if(current.serverVersion>r.serverVersion)return {rows,result:{}};
    if(current.dirty&&current.op===r.serverMutation){
     current.serverVersion=r.serverVersion;current.serverMutation=r.serverMutation;current.dirty=false;
    }else if(r.serverVersion>current.serverVersion){
     if(current.dirty&&content(current)!==content(r)){fork(rows,current);conflict=true;}
     Object.assign(current,r);
    }
    return {rows,result:{conflict}};
   });
  }
  async function acknowledge(who,snapshot,raw,expectedEpoch){
   const r=remote(raw,who);
   if(r.id!==snapshot.id||r.serverMutation!==snapshot.op||content(r)!==content(snapshot))throw Error('O servidor não confirmou a versão enviada da nota.');
   return store.transact(who,rows=>{
    if(epoch!==expectedEpoch||owner!==who)return {rows,result:{stale:true}};
    const current=rows.find(n=>n.id===snapshot.id);if(!current)return {rows,result:{}};
    if(current.op===snapshot.op){
     // Metadata-only acknowledgement: keep the editor token and local contents.
     current.serverVersion=r.serverVersion;current.serverMutation=r.serverMutation;current.dirty=false;
    }else if(current.serverVersion<=r.serverVersion){
     // A newer local edit remains pending and starts from the acknowledged revision.
     current.serverVersion=r.serverVersion;current.serverMutation=r.serverMutation;
    }
    return {rows,result:{}};
   });
  }
  async function synchronize(client,who,generation){
   const current=()=>owner===who&&epoch===generation;
   let conflicts=0;
   // Pull every page, even if this device has no changes. Never infer deletion from absence.
   for(let offset=0;current();offset+=500){
    const {data,error}=await client.from('pf_notas_v3').select('id,user_id,titulo,texto,cor,fixa,deleted,versao,mutacao,updated_at').eq('user_id',who).order('id').range(offset,offset+499);
    if(error)throw error;if(!current())return {stale:true};
    if(!Array.isArray(data))throw Error('Lista de notas inválida.');
    for(const row of data){const merged=await applyRemote(who,row,generation);if(merged.conflict)conflicts++;}
    if(data.length<500)break;
   }
   if(!current())return {stale:true};
   const pending=(await store.read(who)).filter(n=>n.dirty);
   for(const snapshot of pending){
    if(!current())return {stale:true};
    const {data,error}=await client.rpc('pf_notas_gravar_v3',{p_dono:who,p_id:snapshot.id,p_base:snapshot.serverVersion,p_mutacao:snapshot.op,p_titulo:snapshot.titulo,p_texto:snapshot.texto,p_cor:snapshot.cor,p_fixa:snapshot.fixa,p_excluida:snapshot.deleted});
    if(error)throw error;if(!current())return {stale:true};
    if(!data||!['aplicada','conflito'].includes(data.status)||!data.nota)throw Error('Confirmação inválida do servidor de notas.');
    if(data.status==='aplicada')await acknowledge(who,snapshot,data.nota,generation);
    else{const merged=await applyRemote(who,data.nota,generation);if(merged.conflict)conflicts++;}
   }
   if(current())notify('synced',{conflicts});
   return {conflicts,pending:current()?(await store.read(who)).filter(n=>n.dirty).length:0};
  }
  return {
   owner:()=>owner,setOwner(who){if(who!==null&&who!=='local'&&!UUID.test(who))throw Error('Conta inválida.');owner=who;epoch++;active=null;notify('account');},
   list:()=>owner?store.read(owner):Promise.resolve([]),save,
   async remove(id,token){const who=checkOwner(),rows=await store.read(who),n=rows.find(r=>r.id===id);if(!n)return;return save(id,{...n,titulo:'',texto:'',deleted:true},token,who);},
   async clearClean(who){return store.transact(who,rows=>({rows:rows.filter(n=>n.dirty),result:null}));},
   async importLegacy(raw){
    const who=checkOwner();const input=JSON.parse(raw);if(!Array.isArray(input))throw Error('Formato de notas antigas inválido.');
    const result=await store.transact(who,rows=>{
     const imported=[];
     input.forEach((n,index)=>{
      const signature=JSON.stringify([index,String(n.id||''),String(n.titulo||''),String(n.texto||''),String(n.cor||''),!!n.fixa]);
      const found=rows.find(r=>r.legacy===signature);if(found){imported.push(found.id);return;}
      const note=make(who,uuid(),fields(n));note.legacy=signature;rows.push(note);imported.push(note.id);
     });return {rows,result:imported};
    });
    const persisted=await store.read(who);if(!result.every(id=>persisted.some(n=>n.id===id)))throw Error('Migração não confirmada no dispositivo.');
    if(owner===who)notify('imported');return result.length;
   },
   sync(client){
    const who=owner,generation=epoch;if(!who||who==='local'||!client)return Promise.resolve({local:true});
    if(active&&active.generation===generation)return active.promise;
    const task={generation,promise:null};task.promise=synchronize(client,who,generation).finally(()=>{if(active===task)active=null;});active=task;return task.promise;
   }
  };
 }
 const api={create,indexedStore,colors:COLORS,fields};
 if(typeof window!=='undefined')window.PFNotasCore=api;
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
})();
