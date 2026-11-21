const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),path=require('path');
const env={window:{},console};vm.createContext(env);for(const f of ['analise_financeira_core.js','renda_fixa.js','assistente_planejamento.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,f),'utf8'),env);
const C=env.window.PFAnalysisMath,F=env.window.PFFixedIncome,G=env.window.PFPlanningGuide;
const data={income:'5000',stability:'variable',fixedExpenses:'2000',variableExpenses:'1000',hasDebt:'yes',debt0name:'Dívida pessoal',debt0balance:'10000',debt0installment:'500',debt0rate:'2',debt0late:'yes',initial:'1000',deposit:'1000',months:'12',reserve:'2000',essential:'2500',reserveMonths:'6',goal0name:'Viagem',goal0target:'12000',goal0current:'0',goal0monthly:'600',goal0months:'12',goal1name:'Meta 2',goal1target:'6000',goal1current:'0',goal1monthly:'500',goal1months:'12',liquidity:'anytime',experience:'new',risk:'low',dependents:'2',largeExpense:'500',context:'Contexto livre',projectionMode:'none',confirm:true};
const before=JSON.stringify(data),m=G.analyze(data,C,F);assert.equal(JSON.stringify(data),before);assert.equal(m.costs,350000);assert.equal(m.surplus,150000);assert.equal(m.target,1500000);assert.equal(m.gap,1300000);assert.equal(m.coverage,.8);assert.equal(m.allocated,110000);assert.equal(m.projection,null);assert(m.flags.some(t=>t.includes('atraso')));assert(m.flags.some(t=>t.includes('supera o aporte mensal')));assert(m.flags.some(t=>t.includes('variável')));
assert.throws(()=>G.analyze({...data,confirm:false},C,F));assert.throws(()=>G.profile({...data,income:'-1'}));assert.throws(()=>G.profile({...data,months:'1.5'}));assert.throws(()=>G.profile({...data,goal0months:'0'}));
const absent=G.analyze({confirm:true},C,F);assert.equal(absent.surplus,null);assert.equal(absent.installments,null);assert.equal(absent.projection,null);assert(absent.missing.length>10);assert(!absent.flags.some(t=>t.includes('despesas informadas superam')));
const zero=G.analyze({income:'0',fixedExpenses:'0',variableExpenses:'0',hasDebt:'no',initial:'0',deposit:'0',months:'12',reserve:'0',essential:'0',reserveMonths:'6',confirm:true,projectionMode:'compare',products:['fixed'],fixed:'0'},C,F);assert.equal(zero.surplus,0);assert.equal(zero.coverage,null);assert.equal(zero.projection.rows[0].value,0);
assert.equal(G.analyze({...data,debt0installment:''},C,F).surplus,null);
const projected=G.analyze({...data,deposit:'100',projectionMode:'compare',products:['fixed'],fixed:'0',ipca:'5'},C,F);assert.equal(projected.projection.rows[0].value,220000);assert.equal(projected.projection.rows[0].real,Math.round(220000/1.05));
assert.throws(()=>G.analyze({...data,projectionMode:'compare',products:['fixed'],fixed:''},C,F));
env.FormData=class{constructor(f){this.values=f.values;}getAll(k){const v=this.values[k];return v===undefined?[]:Array.isArray(v)?v:[v];}has(k){return Object.hasOwn(this.values,k);}*[Symbol.iterator](){yield*Object.entries(this.values);}};
let form;const root={querySelector:s=>s==='#pa-guide-form'?form:null},guide=G.create(),context={head:()=>'',plot:()=>'<svg></svg>',core:C,fixed:F};
const make=values=>({id:'pa-guide-form',values,querySelector:s=>s==='[name="projectionMode"]'&&Object.hasOwn(values,'projectionMode')?{}:null});
form=make({income:'5000',stability:'stable'});guide.submit(form,root,C,F);assert(guide.section(context).includes('Despesas mensais'));
form=make({fixedExpenses:'2000',variableExpenses:'1000'});guide.submit(form,root,C,F);
form=make({hasDebt:'no'});guide.submit(form,root,C,F);
form=make({initial:'1000',deposit:'100',months:'12'});guide.submit(form,root,C,F);
form=make({reserve:'2000',essential:'2000',reserveMonths:'6'});guide.submit(form,root,C,F);
form=make({goal0name:'<img src=x onerror=alert(1)>',goal0target:'12000',goal0current:'0',goal0monthly:'100',goal0months:'12'});guide.submit(form,root,C,F);
form=make({liquidity:'anytime'});guide.submit(form,root,C,F);
form=make({experience:'new',risk:'low'});guide.submit(form,root,C,F);
form=make({dependents:'0',largeExpense:'0',context:'Texto livre preservado'});guide.submit(form,root,C,F);
assert(guide.section(context).includes('Revisão e confirmação'));assert(!guide.section(context).includes('Seu resumo de planejamento'));
form=make({projectionMode:'compare',product:['fixed'],fixed:'0',ipca:'5',confirm:'on'});guide.submit(form,root,C,F);const html=guide.section(context);assert(html.includes('Seu resumo de planejamento'));assert.equal((html.match(/<h4>[1-8]\./g)||[]).length,8);assert(html.includes('R$ 2.200,00'));assert(html.includes('&lt;img'));assert(!html.includes('<img src=x'));assert(html.includes('data-pf-i18n-skip'));assert(html.includes('não substitui orientação profissional individualizada'));
guide.reset();form=null;assert(!guide.section(context).includes('Texto livre preservado'));assert(!guide.section(context).includes('Seu resumo de planejamento'));
const source=fs.readFileSync(path.join(__dirname,'assistente_planejamento.js'),'utf8');assert(!/\b(fetch|localStorage|indexedDB|sendBeacon)\s*[.(]/.test(source));
console.log('PASS38.4: etapas, confirmação, dados ausentes/zero, parcelas sem duplicação, reserva, metas simultâneas, mesmo motor, escape e limpeza sem persistência.');

// Validation belongs to the visible step, so Back can recover an invalid draft.
const recovery=G.create();for(const values of [{income:'1000'},{fixedExpenses:'100',variableExpenses:'100'},{hasDebt:'no'}]){form=make(values);recovery.submit(form,root,C,F);}
form=make({initial:'0',deposit:'0',months:'-1'});recovery.submit(form,root,C,F);assert(recovery.section(context).includes('Capacidade de investimento'));
recovery.click({dataset:{paGuide:'back'}},root,null);form=make({hasDebt:'no'});recovery.submit(form,root,C,F);assert(recovery.section(context).includes('Capacidade de investimento'));
form=make({initial:'0',deposit:'0',months:'12'});recovery.submit(form,root,C,F);assert(recovery.section(context).includes('Reserva de emergência'));
for(const language of ['en','es']){
 const w={localStorage:{getItem:()=>language}},ctx={window:w,document:{readyState:'loading',addEventListener(){}},console};vm.createContext(ctx);vm.runInContext(fs.readFileSync(path.join(__dirname,'idiomas.js'),'utf8'),ctx);
 for(const title of [...G.steps,'Assistente de planejamento financeiro','Confirmei minhas respostas, os dados ausentes e as premissas acima.','1. Resumo da situação','8. Próximas ações práticas','Valor futuro bruto com metade do aporte','Iniciante','Experiente','Passo'])if(!(language==='es'&&title==='Contexto adicional'))assert.notEqual(w.PFI18n.translate(title),title,title);
}

assert(fs.readFileSync(path.join(__dirname,'analise_financeira.js'),'utf8').includes('.pa-guide-facts{display:grid;grid-template-columns:repeat(3,minmax(0,1fr))'));
