const assert=require('assert/strict'),fs=require('fs'),path=require('path');const {repository,KEY}=require('./notas_privadas.js');
const map=new Map(),calls=[];const store={getItem:k=>(calls.push(['read',k]),map.get(k)||null),setItem:(k,v)=>(calls.push(['write',k]),map.set(k,v))};
const r=repository(store);let n=r.create('2026-11');n=r.save({...n,title:'Viagem',text:'Revisar orçamento <script>sem execução</script>',tags:['orçamento','viagem'],pinned:true},n.updatedAt);
assert.equal(r.read()[0].text,n.text);assert.equal(r.search(r.read(),'2026-11','orcamento').length,1);assert.equal(r.search(r.read(),'2026-12').length,0);
const stale={...n};n=r.save({...n,text:'Nova observação'},n.updatedAt);assert.throws(()=>r.save({...stale,text:'Sobrescrever'},stale.updatedAt));assert.throws(()=>r.remove(n.id,stale.updatedAt));assert.equal(r.read()[0].text,'Nova observação');
let other=r.create('2026-11');assert.equal(r.search(r.read(),'2026-11')[0].id,n.id);const exported=r.exportNotes();r.importNotes(exported);assert.equal(r.read().length,4);assert.equal(new Set(r.read().map(n=>n.id)).size,4);
const before=map.get(KEY);assert.throws(()=>r.importNotes(JSON.stringify({version:1,notes:[{...n,text:42}]})));assert.equal(map.get(KEY),before);assert.throws(()=>r.importNotes('{'));assert.equal(map.get(KEY),before);assert.throws(()=>r.create('2026-99'));
const blocked=repository({getItem:store.getItem,setItem(){throw Error('Quota')}});assert.throws(()=>blocked.save({...n,title:'Não salvo'},n.updatedAt));assert.equal(map.get(KEY),before);
assert.equal(repository({getItem:()=>null,setItem(){}}).read().length,0);assert(calls.every(c=>c[1]===KEY));r.remove(n.id,n.updatedAt);assert.equal(r.read().length,3);
const src=fs.readFileSync(path.join(__dirname,'notas_privadas.js'),'utf8');for(const forbidden of ['fetch(', 'PFGemini','pfIaQuestion','transacoes','innerHTML=note'])assert(!src.includes(forbidden));
console.log('PASS: mês, busca/etiquetas, fixação, persistência, conflito entre abas, quota, importação atômica, IDs únicos, exclusão e nenhum acesso financeiro/rede/IA.');

// Aggregate import must not save a file that exceeds the readable size limit.
{let raw=JSON.stringify({version:1,notes:Array.from({length:80},(_,i)=>({...n,id:'large-'+i,text:'x'.repeat(20000)}))});const large=repository({getItem:()=>raw,setItem:(k,v)=>raw=v});const before=raw;assert.throws(()=>large.importNotes(before));assert.equal(raw,before);assert.equal(large.read().length,80);}
