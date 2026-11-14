const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),path=require('path');
const file=fs.readFileSync(path.join(__dirname,'analise_financeira.js'),'utf8');
const sync=file.slice(file.indexOf('function sync(){'),file.indexOf('function install(){'));
// DOMTokenList.remove gera mutação mesmo quando a classe não existe.
// Reproduz a fila do MutationObserver sem depender da senha real do projeto.
for(const initiallyOpen of [false,true]){
 let mutations=0,pending=0,present=initiallyOpen;
 const body={classList:{contains:()=>present,remove:()=>{mutations++;pending++;present=false;}},dataset:{}};
 const context=vm.createContext({root:{hidden:false},document:{body},mount(){},bindAuth(){},allowed:()=>false,privateClear(){},opened:initiallyOpen});
 vm.runInContext(sync,context);vm.runInContext('sync()',context);
 for(let i=0;pending&&i<20;i++){pending--;vm.runInContext('sync()',context);}
 assert.equal(pending,0,'O observador entrou em repetição e bloqueou a digitação');
 assert.equal(mutations,initiallyOpen?1:0);
 for(let n=0;n<10;n++)vm.runInContext('sync()',context);
 assert.equal(mutations,initiallyOpen?1:0,'A tela bloqueada não deve alterar classes repetidamente');
 assert.equal(context.root.hidden,true);assert.equal(context.opened,false);
}
console.log('PASS Entrada: observador estabiliza antes da autenticação e no bloqueio; sem ciclo que impede digitação.');
