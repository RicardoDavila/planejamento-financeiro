const fs=require('fs'),vm=require('vm'),assert=require('assert'),path=require('path');
const root=path.join(__dirname,'..');
for(const name of ['index.html','distribuicao/app.html','teste-gemini/app.html']){
 const html=fs.readFileSync(path.join(root,name),'utf8'),script=html.match(/<script id="pf-auto-script">([\s\S]*?)<\/script>/)[1];
 const env={window:{},document:{readyState:'loading',addEventListener(){}},Map,Set,Date};vm.createContext(env);vm.runInContext(script,env);
 const api=env.window.PFAutoFilter,rows=[{id:1,categoria:'A',tipo:'Receita',valor:10,dataPg:''},{id:2,categoria:'B',tipo:'Receita',valor:20,dataPg:'2026-11-01'},{id:3,categoria:'B',tipo:'Despesa',valor:30,dataPg:'2026-11-02'}],before=JSON.stringify(rows);
 let filters=new Map([['categoria',new Set(['A','B'])],['tipo',new Set(['Receita'])]]);
 assert.equal(api.apply(rows,filters).map(t=>t.id).join(','),'1,2');
 filters.set('dataPg',new Set(['']));assert.equal(api.apply(rows,filters).map(t=>t.id).join(','),'1');
 filters.set('categoria',new Set());assert.equal(api.apply(rows,filters).length,0);
 assert.equal(api.apply(rows,filters,'categoria').length,1);
 assert.equal(api.value({},'tipoPessoa'),'Não classificado');
 env.window.PFDesktopApproved={};env.obterDataLocalISO=()=> '2026-11-13';
 assert.equal(api.value({tipo:'Receita',vencimento:'2026-11-20'},'status'),'A receber');
 assert.equal(api.value({tipo:'Despesa',vencimento:'2026-11-01'},'status'),'Vencido');
 assert.equal(api.value({tipo:'Receita',dataPg:'2026-11-01'},'status'),'Recebido');
 assert.equal(JSON.stringify(rows),before);
 assert(html.includes('data-pdp-metric="\'+esc(name)'));
 assert(html.includes('function metricDetail(name,card)'));
 assert(html.includes('#formLancamento .pf-auto-dates'));
 assert(!script.includes('salvarLocalStorage('));
 console.log('PASS '+name+': seleção múltipla, interseção, vazio, limpar coluna, datas, pessoa, status exibido, imutabilidade, KPI e DT PG.');
}
