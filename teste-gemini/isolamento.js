/* Cada instância mantém uma identidade fixa. Não migra dados do aplicativo pessoal. */
(() => {
 'use strict';
 const owner=window.parent!==window?window.parent.pfdUser:null;
 if(!owner?.id||!window.parent.pfdClient){location.replace('./index.html');throw Error('Entre na sua conta.');}
 const ownerId=owner.id;
 window.pfdAssert=()=>{
  if(window.parent.pfdUser?.id!==ownerId)throw Error('A conta foi alterada. Entre novamente antes de continuar.');
  return ownerId;
 };
 const makeStore=(raw,kind)=>({
  getItem(key){window.pfdAssert();return raw.getItem('pfd:gemini-teste:v1:'+ownerId+':'+kind+':'+String(key));},
  setItem(key,value){window.pfdAssert();raw.setItem('pfd:gemini-teste:v1:'+ownerId+':'+kind+':'+String(key),String(value));},
  removeItem(key){window.pfdAssert();raw.removeItem('pfd:gemini-teste:v1:'+ownerId+':'+kind+':'+String(key));}
 });
 window.pfdLocal=makeStore(window.localStorage,'local');
 window.pfdSession=makeStore(window.sessionStorage,'session');
 const subscriptions=[];
 const auth=new Proxy(window.parent.pfdClient.auth,{
  get(target,key){
   if(key==='onAuthStateChange')return callback=>{const result=target.onAuthStateChange(callback);subscriptions.push(result.data.subscription);return result;};
   const value=Reflect.get(target,key,target);return typeof value==='function'?value.bind(target):value;
  }
 });
 window.pfdClient=new Proxy(window.parent.pfdClient,{get(target,key){if(key==='auth')return auth;const value=Reflect.get(target,key,target);return typeof value==='function'?value.bind(target):value;}});
 addEventListener('pagehide',()=>subscriptions.forEach(s=>s.unsubscribe()),{once:true});
})();
