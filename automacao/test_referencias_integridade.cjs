const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
function extract(source,name){const start=source.indexOf('        function '+name+'(');assert(start>=0,name);const end=/^        \}\r?$/m.exec(source.slice(start));assert(end,name);return source.slice(start,start+end.index+end[0].length);}
function environment(relative){
 const source=fs.readFileSync(path.join(root,relative),'utf8');
 const map=new Map(),alerts=[];
 const storage={getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,String(v))};
 const context=vm.createContext({console,crypto,window:{pfdAssert:()=>{}},localStorage:storage,pfdLocal:storage,alert:m=>alerts.push(m),obterDataLocalISO:()=> '2026-11-07',getChaveStorageAtual:()=> 'mensal',agendarSincronizacaoNuvem:()=>{},popularSelectsDinamicos:()=>{},renderTable:()=>{},obterLixeira:()=>[],obterHistorico:()=>[],XLSX:{utils:{sheet_to_json:rows=>rows}}});
 const names=['gerarIdTexto','pfLerCatalogoReferencias','pfGuardarCatalogoReferencias','obterTabelasReferencia','pfLerLinhasExcel','corrigirOrtografiaLancamento','corrigirSubItemLancamento','corrigirRubricaLancamento','corrigirCamposLancamento','normalizarTransacoes','atualizarStatusDespesasAutomaticamente','validarBackup','executarRestauracaoBackup','salvarLocalStorage','getRubricasCadastradas','getSubItensCadastrados','montarBackupCompleto','coletarPacoteNuvem','aplicarPacoteNuvem'];
 vm.runInContext(`let transacoes=[];let DATA_ABERTURA_PROJETO='2026-01-01';const CHAVE_DATA_ABERTURA='abertura',CHAVE_BANCO_MESTRE='mestre',CHAVE_ULTIMA_ALTERACAO_LOCAL='alteracao',CHAVE_LIXEIRA='lixeira',CHAVE_HISTORICO='historico';${names.map(n=>extract(source,n)).join('\n')}`,context);
 return {context,map,alerts,run:code=>JSON.parse(JSON.stringify(vm.runInContext(code,context)))};
}
const schema=[['tipos','idTipo','tipo','ID_Tipo','Tipo'],['rubricas','idRubrica','categoria','ID_Rubrica','Rubrica'],['subItens','idSubItem','subItem','ID_SubItem','SubItem'],['descricoes','idDescricao','descricao','ID_Descricao','Descricao'],['status','idStatus','status','ID_Status','Status']];
function check(data){for(const [key,id,name,idcol,namecol] of schema){const table=data.tabelas[key],map=new Map(table.map(r=>[r[idcol],r[namecol]]));assert.equal(map.size,table.length);for(const t of data.transacoes)assert.equal(map.get(t[id]),t[name]);}}
for(const relative of ['index.html','distribuicao/app.html','teste-gemini/app.html']){
 const a=environment(relative);
 const fixture={sistema:'Planejamento Financeiro',transacoes:[{id:1234567890123,tipo:'Receita',categoria:'EMPRESA',subItem:'Receita',descricao:'Cadastro de teste',valor:12.34,vencimento:'2026-12-20',dataPg:'',status:'Não Recebido',observacao:'Observação preservada',tipoPessoa:'PJ',tipoPessoaManual:true,recorrente:true}],tabelas:{rubricas:[{ID_Rubrica:'RUB-999',Rubrica:'Cadastro sem movimento'}]},rubricas_ocultas:['EMPRESA'],subitens_ocultos:[],rubricas_extras:[],subitens_extras:[]};
 a.context.input=fixture;vm.runInContext('executarRestauracaoBackup(input)',a.context);
 assert(a.alerts.at(-1).includes('Banco restaurado com sucesso'));
 const normalized=a.run('transacoes');
 for(const [key,val] of Object.entries(fixture.transacoes[0]))assert.deepEqual(normalized[0][key],val);
 const saved=a.run('montarBackupCompleto()');check(saved);
 assert(saved.tabelas.rubricas.some(r=>r.Rubrica==='EMPRESA'));
 assert(saved.tabelas.rubricas.some(r=>r.Rubrica==='Cadastro sem movimento'));
 assert.deepEqual(a.run('normalizarTransacoes(transacoes)'),normalized);
 // Muitos nomes, inclusive caixa distinta, não podem compartilhar um ID.
 a.context.labels=Array.from({length:2000},(_,i)=>'Cadastro de teste '+i).concat(['Gás','GÁS','𐀀']);
 const ids=a.run("labels.map(s=>gerarIdTexto('DSC',s))");assert.equal(new Set(ids).size,ids.length);
 const payload=a.run('coletarPacoteNuvem()');assert.equal(payload.versao_referencias,3);
 const b=environment(relative);b.context.payload=payload;vm.runInContext('aplicarPacoteNuvem(payload)',b.context);
 const restored=b.run('montarBackupCompleto()');check(restored);
 assert.deepEqual(restored.transacoes,normalized);
 assert(restored.tabelas.rubricas.some(r=>r.Rubrica==='Cadastro sem movimento'));
 assert.deepEqual(restored.rubricas_ocultas,['EMPRESA']);
 const legacy={...payload};delete legacy.tabelas_referencia;delete legacy.versao_referencias;
 b.context.payload=legacy;vm.runInContext('aplicarPacoteNuvem(payload)',b.context);assert.deepEqual(b.run('transacoes'),normalized);
 const wb={Sheets:{Lancamentos_DB:[{ID_Item:1,ID_Tipo:'TIP-937',ID_Descricao:'DSC-1'}],Tabela_Tipos:[{ID_Tipo:'TIP-937',Tipo:'Receita'}],Tabela_Descricoes:[{ID_Descricao:'DSC-1',Descricao:'Nome de teste'}]}};
 b.context.wb=wb;assert.equal(b.run("pfLerLinhasExcel(wb,'Lancamentos_DB')")[0].Descricao,'Nome de teste');
 wb.Sheets.Lancamentos_DB.push({...wb.Sheets.Lancamentos_DB[0]});assert.throws(()=>b.run("pfLerLinhasExcel(wb,'Lancamentos_DB')"),/duplicado/);
 wb.Sheets.Lancamentos_DB.pop();wb.Sheets.Tabela_Descricoes.push({ID_Descricao:'DSC-1',Descricao:'Outro nome'});assert.throws(()=>b.run("pfLerLinhasExcel(wb,'Lancamentos_DB')"),/ambígua/);
 console.log('PASS: '+relative+' referências, backup, pacote de sincronização e rejeição de ambiguidades.');
}
