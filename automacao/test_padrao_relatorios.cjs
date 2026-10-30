const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict');
const root=path.resolve(__dirname,'..');
for(const rel of ['index.html','distribuicao/app.html','teste-gemini/app.html']){
 const html=fs.readFileSync(path.join(root,rel),'utf8'),code=html.match(/<script id="pf-report-theme">([\s\S]*?)<\/script>/)[1];
 const c={window:{addEventListener(){}},document:{readyState:'loading',addEventListener(){},body:{classList:{contains:()=>false}}}};vm.createContext(c);vm.runInContext(code,c);
 const t=c.window.PFReportTheme;assert.equal(t.palette.navy,'#203c64');assert.equal(t.palette.green,'#047857');assert.equal(t.palette.red,'#bd2b20');
 assert.equal(t.logo,'data:image/png;base64,'+fs.readFileSync(path.join(root,'icon-192.png')).toString('base64'));
 const brandImages=[...html.matchAll(/<img class="pf-project-logo" src="([^"]+)"[^>]*>/g)];assert.equal(brandImages.length,2);brandImages.forEach(m=>assert.equal(m[1],t.logo));assert(!html.includes('<span class="pf-menu-marca"><i class="fa-solid fa-chart-pie">'));assert(html.includes('id="pf-project-brand-css"'));
 const report=t.decorate('<html><head></head><body><div class="marca"><h1>Relatório</h1></div></body></html>');assert(report.includes('pf-report-logo'));assert(report.includes('pf-report-shared-style'));assert.equal(t.decorate(report),report);
 let registrations=0;const FakeChart={defaults:{font:{}},register:p=>{assert.equal(p.id,'pfReportValueLabels');registrations++;}};t.installCharts(FakeChart);t.installCharts(FakeChart);assert.equal(registrations,1);assert.equal(FakeChart.defaults.font.family,t.font);
 const labels=[],translations=[],rotations=[];let depth=0;
 const ctx={save(){depth++;},restore(){depth--;},translate:(...x)=>translations.push(x),rotate:x=>rotations.push(x),strokeText(){},fillText:s=>labels.push(s)};
 const nums=[1500,-20,0,{y:15},null,Infinity];
 const chart={config:{type:'bar'},data:{labels:['Receita','Despesa','Zero','Outro','Sem valor','Inválido'],datasets:[{data:nums}]},options:{},width:450,ctx,isDatasetVisible:()=>true,getDataVisibility:()=>true,getDatasetMeta:()=>({type:'bar',data:nums.map((_,i)=>({x:40+i*30,y:100,base:160}))})};
 const dataBefore=JSON.stringify(nums);t.valueLabels.beforeUpdate(chart);assert.equal(JSON.stringify(nums),dataBefore);assert.equal(chart.data.datasets[0].backgroundColor[0],t.palette.green);assert.equal(chart.data.datasets[0].backgroundColor[1],t.palette.red);assert(chart.options.layout.padding.top>=100);
 t.valueLabels.afterDatasetsDraw(chart);assert(labels.some(x=>x.includes('1.500,00')));assert(labels.some(x=>x.includes('-R$')));assert(labels.some(x=>x.includes('0,00')));assert(rotations.length>0);assert.equal(depth,0);
 chart.options.indexAxis='y';labels.length=0;translations.length=0;rotations.length=0;chart.data.datasets[0].data=[{x:123}];t.valueLabels.beforeUpdate(chart);t.valueLabels.afterDatasetsDraw(chart);assert.equal(labels.length,1);assert(labels[0].includes('123,00'));assert(translations.some(x=>x[0]===6));assert.equal(rotations.length,0);
 labels.length=0;chart.isDatasetVisible=()=>false;t.valueLabels.afterDatasetsDraw(chart);assert.equal(labels.length,0);
 assert(html.includes('relatorioHtml = window.PFReportTheme.decorate(relatorioHtml);'));assert(html.includes('window.PFReportTheme.preparePrintCharts();'));
 console.log('PASS:',rel,'identidade compartilhada, logotipo incorporado, paleta, fontes, rótulos verticais/horizontais, negativos, zeros e séries ocultas');
}
