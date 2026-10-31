const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict');
const luminance=hex=>{const c=hex.replace('#','').match(/../g).map(x=>parseInt(x,16)/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);return c[0]*.2126+c[1]*.7152+c[2]*.0722;};
for(const file of ['index.html','distribuicao/app.html','teste-gemini/app.html']){
 const html=fs.readFileSync(path.join(__dirname,'..',file),'utf8');
 const css=html.match(/<style id="pf-dark-controls-fix">([\s\S]*?)<\/style>/)[1]+html.match(/<style id="pf-heatmap-contrast-fix">([\s\S]*?)<\/style>/)[1];
 for(const rule of css.matchAll(/\{background:(#[0-9a-f]{6})!important;color:(#[0-9a-f]{6})!important/g)){
  const a=luminance(rule[1]),b=luminance(rule[2]);assert((Math.max(a,b)+.05)/(Math.min(a,b)+.05)>=4.5,'Contraste insuficiente: '+rule[0]);
 }
 const doc={readyState:'loading',addEventListener(){},body:{classList:{contains:()=>true}}},ctx={window:{addEventListener(){}},document:doc,matchMedia:()=>({matches:false})};vm.createContext(ctx);
 vm.runInContext(html.match(/<script id="pf-report-theme">([\s\S]*?)<\/script>/)[1],ctx);
 const chart={config:{type:'line'},data:{datasets:[]},options:{scales:{x:{ticks:{},title:{},grid:{}}},plugins:{legend:{labels:{}},title:{}}}};
 ctx.window.PFReportTheme.valueLabels.beforeUpdate(chart);assert.equal(chart.options.scales.x.ticks.color,'#dbe5f3');assert.equal(chart.options.plugins.legend.labels.color,'#dbe5f3');
 doc.body.classList.contains=()=>false;ctx.window.PFReportTheme.valueLabels.beforeUpdate(chart);assert.equal(chart.options.scales.x.ticks.color,'#526176');
 const report=html.slice(html.indexOf('function openReport(){'),html.indexOf('function refresh(){',html.indexOf('function openReport(){')));
 assert(report.includes('popup.location.replace(reportUrl)'));assert(!report.includes('document.write'));assert(report.includes('safeCell.toString()'));assert(report.includes("+'</main><script>'+actions"));
 console.log('PASS:',file,'contraste WCAG AA dos controles, texto dos gráficos nos dois temas e navegação do relatório.');
}
