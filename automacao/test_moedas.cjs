const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),path=require('path');
const source=fs.readFileSync(path.join(__dirname,'moedas.js'),'utf8');new vm.Script(source);
const quote={currency:'USD',provider:'BCB PTAX',brlPerUnit:5,sourceTimestamp:'2026-11-05 13:00:00',fetchedAt:'2026-11-06T12:00:00Z'};
function load(currency='BRL',q=quote,scoped=false){const reads=[],writes=[];const store={getItem:k=>(reads.push(k),k==='pf:currency:v1'?currency:JSON.stringify({USD:q})),setItem:(...x)=>writes.push(x)};const window=scoped?{pfdLocal:store,localStorage:{getItem(){throw Error('Unscoped access')}}}:{localStorage:store};const c={window,document:{readyState:'loading',addEventListener(){}},console,Intl,Date,alert(){}};vm.createContext(c);vm.runInContext(source,c);return {api:window.PFCurrency,reads,writes};}
let x=load('USD');assert(Math.abs(x.api.value(1234.56)-246.912)<1e-10);assert.equal(x.api.format(100),'US$\u00a020,00');assert.equal(x.writes.length,0);assert.deepEqual(x.reads,['pf:currency:v1','pf:ptax:v1']);assert.equal(load('USD',quote,true).api.getCurrency(),'USD');
for(const n of [0,0.01,-3.47,1234.56,9999999.99])assert.equal(load().api.value(n),n);
assert.equal(load('USD',{...quote,brlPerUnit:0}).api.format(100),'R$\u00a0100,00');assert.throws(()=>load('EUR').api.snapshot());assert.throws(()=>load('USD',{...quote,brlPerUnit:NaN}).api.value(100));
const snapshot=x.api.snapshot();snapshot.quote.brlPerUnit=1;assert.equal(x.api.value(100),20);
const html=x.api.decorate('<html><body><p>R$ 100,00</p></body></html>');const script=html.match(/<script>([\s\S]*?)<\/script>/)[1];new vm.Script(script);assert(html.includes('2026-11-05 13:00:00'));assert(html.includes('BCB PTAX'));assert(!html.includes('<script id="pfCurrencyButton"'));
assert(!source.includes('transacoes'));assert(!source.includes('registrarHistorico'));assert(source.includes('credentials:\'omit\''));
console.log('PASS: BRL original, conversão unidirecional, negativos/zero, cotação inválida, cache isolado e snapshot independente.');

const parent={childNodes:[{}],getAttribute:()=> 'R$ 1.234,56'};assert.equal(x.api.originalText({nodeType:3,nodeValue:'US$ 246,91',parentElement:parent}),'R$ 1.234,56');assert.equal(x.api.originalText({nodeType:3,nodeValue:'R$ 2.000,00',parentElement:parent}),'R$ 2.000,00');
