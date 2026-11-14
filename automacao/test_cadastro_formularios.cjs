const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict');
for(const name of ['index.html','distribuicao/app.html','teste-gemini/app.html']){
 const html=fs.readFileSync(path.join(__dirname,'..',name),'utf8'),messages=[],map=new Map(),rows=[{id:1,valor:10,categoria:'EXISTENTE',dataPg:'2026-01-02'}],original=JSON.stringify(rows);
 const funcs=['adicionarNovaRubricaPrompt','adicionarNovoSubItemPrompt'].map(n=>html.match(new RegExp('        function '+n+'\\([^)]*\\) \\{[\\s\\S]*?^        \\}','m'))[0]).join('\n');
 const context=vm.createContext({alert:()=>{throw Error('alert nativo indevido')},prompt:()=>{throw Error('prompt nativo indevido')},transacoes:rows,localStorage:{getItem:k=>map.get(k)||null,setItem:(k,v)=>map.set(k,v)},getRubricasCadastradas:()=>JSON.parse(map.get('rubricas_extras')||'[]'),getSubItensCadastrados:()=>JSON.parse(map.get('subitens_extras')||'[]'),corrigirOrtografiaLancamento:s=>s,popularSelectsDinamicos:()=>{},avisar:s=>messages.push(s)});
 context.pfdLocal=context.localStorage;vm.runInContext(funcs,context);
 assert.equal(vm.runInContext("adicionarNovaRubricaPrompt(' nova rubrica ',avisar)",context),'NOVA RUBRICA');
 assert.deepEqual(JSON.parse(map.get('rubricas_extras')),['NOVA RUBRICA']);
 vm.runInContext("adicionarNovaRubricaPrompt('NOVA RUBRICA',avisar);adicionarNovaRubricaPrompt(' ',avisar);adicionarNovaRubricaPrompt(null,avisar)",context);
 assert.deepEqual(JSON.parse(map.get('rubricas_extras')),['NOVA RUBRICA']);
 assert.equal(vm.runInContext("adicionarNovoSubItemPrompt('Internet',avisar)",context),'Internet');
 assert.deepEqual(JSON.parse(map.get('subitens_extras')),['Internet']);
 assert.equal(JSON.stringify(rows),original);
 const rename=html.match(/function gcRenomear\([^)]*\)\{[^\n]+\}/)[0];
 context.document={getElementById:()=>({value:'ORIGEM'})};context.gcAplicar=(action,from,to)=>{assert.equal(action,'renomear');assert.equal(from,'ORIGEM');if(!to.trim())throw Error('Nome obrigatório');return 0;};
 vm.runInContext(rename,context);assert.equal(vm.runInContext("gcRenomear('DESTINO',avisar)",context),0);assert.equal(vm.runInContext("gcRenomear('',avisar)",context),null);
 assert.equal(messages.at(-1),'Nome obrigatório');
 console.log('PASS '+name+': validações originais, duplicidade, cancelamento, renomeação sem prompt e lançamentos intactos.');
}

