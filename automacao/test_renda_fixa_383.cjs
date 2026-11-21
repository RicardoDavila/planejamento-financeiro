const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),path=require('path');
const env={window:{},console};vm.createContext(env);
for(const name of ['analise_financeira_core.js','renda_fixa.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,name),'utf8'),env);
const C=env.window.PFAnalysisMath,R=env.window.PFFixedIncome;
const base={initial:'1000',deposit:'100',months:'12',products:['cdi100','cdi120','selic','ipca','fixed','savings'],cdi:'14',selic:'11.75',ipca:'5',spread:'6',fixed:'10',savings:'7',confirm:true};
const before=JSON.stringify(base),calc=R.calculate(base,C);assert.equal(JSON.stringify(base),before);assert.equal(calc.rows.length,6);
const close=(actual,expected)=>assert(Math.abs(actual-expected)<1e-9,`${actual} != ${expected}`);
close(R.annualRate('cdi100',calc.config.rates),14);
close(R.annualRate('cdi120',calc.config.rates),(Math.pow(1+(Math.pow(1.14,1/252)-1)*1.2,252)-1)*100);
close(R.annualRate('ipca',calc.config.rates),11.3);
const fixed=calc.rows.find(r=>r.id==='fixed'),monthly=Math.pow(1.1,1/12)-1;
assert.equal(fixed.value,Math.round(100000*Math.pow(1+monthly,12)+10000*(Math.pow(1+monthly,12)-1)/monthly));
assert.equal(fixed.deposits,220000);assert.equal(fixed.interest,fixed.value-220000);
assert.equal(fixed.real,Math.round(fixed.value/1.05));
const zero=R.calculate({...base,initial:'0',deposit:'0',cdi:'0',selic:'0',ipca:'0',spread:'0',fixed:'0',savings:'0'},C);
assert(zero.rows.every(r=>r.value===0&&r.deposits===0&&r.interest===0&&r.real===0));
const one=R.calculate({...base,initial:'100',deposit:'10',products:['fixed'],fixed:'0',ipca:'',cdi:'',selic:'',spread:'',savings:''},C);
assert.equal(one.rows[0].value,22000);assert.equal(one.rows[0].real,null);
assert.throws(()=>R.calculate({...base,initial:''},C));assert.throws(()=>R.calculate({...base,deposit:''},C));
assert.throws(()=>R.calculate({...base,cdi:''},C));assert.throws(()=>R.calculate({...base,ipca:''},C));
for(const change of [{confirm:false},{products:[]},{products:['unknown']},{months:'0'},{months:'1.5'},{months:'601'},{fixed:'-1'},{initial:'Infinity'},{deposit:'1000000001'},{ipca:'101'},{fixed:'NaN'}])assert.throws(()=>R.calculate({...base,...change},C));
assert.throws(()=>R.calculate({...base,months:'600',initial:'1000000000',deposit:'1000000000',fixed:'100'},C));
assert.equal(R.calculate({...base,months:'240'},C).rows.length,6);
const source=fs.readFileSync(path.join(__dirname,'aplicar_dashboard.py'),'utf8');assert(source.indexOf("'renda_fixa.js'")<source.indexOf("'analise_financeira.js'"));
for(const name of ['index.html','distribuicao/app.html','teste-gemini/app.html']){
 const html=fs.readFileSync(path.join(__dirname,'..',name),'utf8');assert(html.includes('<script id="pf-fixed-income-script">'));assert(html.includes('function annualRate('));
}
console.log('PASS38.3: equivalência anual/mensal, CDI diário hipotético, IPCA composto, bruto/real, aportes no fim do mês, zero/vazio, confirmação, limites e módulos publicados.');

// Exact new UI labels remain translatable; user values and product names stay canonical.
for(const lang of ['en','es']){
 const w={localStorage:{getItem:()=>lang}},ctx={window:w,document:{readyState:'loading',addEventListener(){}},console};vm.createContext(ctx);vm.runInContext(fs.readFileSync(path.join(__dirname,'idiomas.js'),'utf8'),ctx);
 for(const label of ['Taxas anuais confirmadas','Inflação IPCA hipotética (% ao ano; exigida no IPCA+)','Comparação bruta de renda fixa','Confirme as premissas antes de calcular a renda fixa.','Mês 2'])assert.notEqual(w.PFI18n.translate(label),label,label);
}
