/* pf-desktop-only-v511 */
(function(){if(typeof matchMedia==='function'&&matchMedia('(max-width:900px), (pointer:coarse)').matches)return;
/* Compara a base da tela com um arquivo local. Somente leitura, sem sincronização. */
(()=>{'use strict';const allowed=()=>typeof protecaoAutenticada!=='undefined'&&protecaoAutenticada===true&&!document.body.classList.contains('auth-pendente');
const fold=v=>String(v??'').normalize('NFC').trim();
const signature=t=>JSON.stringify([t.vencimento||'',t.dataPg||'',t.tipo||'',t.categoria||'',t.subItem||'',fold(t.descricao),Math.round(Number(t.valor||0)*100)]);
function compare(current,reference,year){const count=a=>{const m=new Map();for(const t of a){const key=signature(t);m.set(key,(m.get(key)||0)+1);}return m;},a=count(current),b=count(reference);let common=0;for(const [k,n]of a)common+=Math.min(n,b.get(k)||0);const months=Array.from({length:12},(_,i)=>{const key=year+'-'+String(i+1).padStart(2,'0');return {month:key,current:current.filter(t=>String(t.vencimento||'').startsWith(key)).length,reference:reference.filter(t=>String(t.vencimento||'').startsWith(key)).length};});return {current:current.length,reference:reference.length,common,onlyCurrent:current.length-common,onlyReference:reference.length-common,months};}
window.PFBankAudit={compare};
/* Interface de conferência retirada na Etapa 21. Comparador puro preservado para compatibilidade. */
})();

})();