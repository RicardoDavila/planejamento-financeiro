const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),path=require('path');
const code=fs.readFileSync(path.join(__dirname,'filtros_dinamicos.js'),'utf8'),a=code.indexOf(' function activate(event){'),b=code.indexOf(' let pending=',a);
for(const name of ['index.html','distribuicao/app.html','teste-gemini/app.html']){
 const html=fs.readFileSync(path.join(__dirname,'..',name),'utf8');let start=html.indexOf('function categoryBreakdownBars('),end=html.indexOf('function install(){',start);
 const ctx={};vm.createContext(ctx);vm.runInContext(html.slice(start,end)+';globalThis.bars=categoryBreakdownBars;',ctx);
 const expanded=new Set(),branch={open:false,dispatchEvent(e){assert.equal(e.type,'toggle');if(this.open)expanded.add('EMPRESA');else expanded.delete('EMPRESA');}},node={parentElement:branch,dataset:{pfDynamicField:'categoria',pfDynamicValue:'EMPRESA'},matches:selector=>selector==='summary'};
 let prevent=0,stop=0,renders=0,lastHTML='';
 const env={scopeFor:()=> 'page',Event:class{constructor(type){this.type=type;}},api:()=>({field(field,value){assert.equal(field,'categoria');assert.equal(value,'EMPRESA');renders++;lastHTML=ctx.bars([['EMPRESA',150]],new Map([['EMPRESA',new Map([['Salário',100],['Bônus',50]])]]),String,String,expanded);}}),schedule(){}};
 vm.createContext(env);vm.runInContext(code.slice(a,b)+';globalThis.click=activate;',env);
 const event=type=>({type,target:{closest:selector=>selector==='[data-pf-dynamic-field]'?node:null},preventDefault(){prevent++;},stopImmediatePropagation(){stop++;}});
 env.click(event('click'));assert(branch.open);assert(expanded.has('EMPRESA'));assert(lastHTML.includes(' open>'));assert(lastHTML.includes('Salário'));assert(lastHTML.includes('Bônus'));assert(lastHTML.includes('analysis-description-row'));assert.equal(renders,1);
 env.click(event('click'));assert(!branch.open);assert(!expanded.has('EMPRESA'));assert(!lastHTML.includes(' open>'));assert.equal(renders,2);assert.equal(prevent,2);assert.equal(stop,2);
 // Keyboard activation must use the native summary click, without a second toggle.
 env.click(event('keydown'));assert.equal(renders,2);
 const explorer=fs.readFileSync(path.join(__dirname,'graficos_interativos.js'),'utf8');assert(explorer.includes('state.descriptionSelection=overrideRows'));assert(explorer.includes('else if(description)'));assert(explorer.includes('rows,true)'));
 console.log('PASS: '+name+' árvore aberta/recolhida e estado salvo antes do filtro redesenhar as barras.');
}
