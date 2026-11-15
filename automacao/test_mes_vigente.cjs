const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const read=name=>fs.readFileSync(__dirname+'/'+name,'utf8');
const files=['dashboard_pessoal.js','graficos_visao_geral.js','analise_financeira.js'];
const mathCtx=vm.createContext({window:{}});vm.runInContext(read('analise_financeira_core.js'),mathCtx);const C=mathCtx.window.PFAnalysisMath;
for(const [date,end] of [['2026-11-15','2026-11-30'],['2026-12-31','2026-12-31'],['2027-01-01','2027-01-31'],['2024-02-10','2024-02-29'],['2025-02-28','2025-02-28']]){
 for(const file of files){const source=read(file),name=file==='dashboard_pessoal.js'?'initFilter':'defaults',line=source.split('\n').find(s=>s.startsWith('function '+name+'('));assert(line);const env={today:()=>date,Date,C,$:id=>({value:id==='desktop-person'?'PJ':'1999-12-31'})};vm.createContext(env);vm.runInContext(line,env);const f=name==='initFilter'?env.initFilter():env.defaults(1999,true);assert.equal(f.from,date.slice(0,7)+'-01',file);assert.equal(f.to,end,file);assert.equal(f.year,Number(date.slice(0,4)),file);assert.equal(f.person,'PJ');
 if(name==='defaults'){const manual=env.defaults(2023);assert.equal(manual.from,'2023-01-01');assert.equal(manual.to,'2023-12-31');assert.equal(manual.year,2023,'ano escolhido manualmente preservado');}
 }
}
// O relógio local pode ainda estar em dezembro quando UTC já está em janeiro.
class LocalDate extends Date{constructor(...args){super(...(args.length?args:['2027-01-01T01:30:00Z']));}getFullYear(){return 2026}getMonth(){return 11}getDate(){return 31}}
for(const file of files){const line=read(file).split('\n').find(s=>s.startsWith('const today='));const env={Date:LocalDate};vm.createContext(env);vm.runInContext(line+';globalThis.result=today();',env);assert.equal(env.result,'2026-12-31',file);}
const html=fs.readFileSync(__dirname+'/../index.html','utf8'),native=html.slice(html.indexOf('function definirMesCorrentePadrao()'),html.indexOf('function atualizarCabecalhoMesAno('));let fields={};const context={Date:LocalDate,document:{getElementById:id=>fields[id]||(fields[id]={})},atualizarCabecalhoMesAno(){}};vm.createContext(context);vm.runInContext(native,context);context.definirMesCorrentePadrao();assert.equal(fields.filtroDataInicio.value,'2026-12-01');assert.equal(fields.filtroDataFim.value,'2026-12-31');
console.log('PASS: mês vigente nas páginas, calendário local, virada de ano, fevereiro bissexto, ano manual preservado e campos do Painel de Lançamentos.');
