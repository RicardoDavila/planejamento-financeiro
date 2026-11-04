"""Integra exploração visual, sem substituir os cálculos dos gráficos originais."""
from pathlib import Path
import re
ROOT=Path(__file__).resolve().parents[1]
def aplicar(html):
    # Refresh only the explorer's own inline resources.
    html=re.sub(r'<style id="pf-chart-explorer-style">[\s\S]*?</style>\s*','',html)
    html=re.sub(r'<script id="pf-chart-explorer">[\s\S]*?</script>\s*','',html)
    html=re.sub(r'\n/\* PFCE bridge:start \*/\n[\s\S]*?\n/\* PFCE bridge:end \*/\n','',html)
    def bridge(code): return '\n/* PFCE bridge:start */\n'+code+'\n/* PFCE bridge:end */\n'
    capture="if(typeof window!=='undefined'&&window.PFChartExplorer)window.PFChartExplorer.capture('modal',{rows:arr});"
    html=html.replace('\n          '+capture,'')
    needle="function renderizarPainelAvancadoGraficos(lista){const arr=Array.isArray(lista)?lista:[],now=new Date(),today=new Date(now.getFullYear(),now.getMonth(),now.getDate()),money=pfFmt;pfLancamentosFiltrados=arr.slice();"
    if capture not in html:
        if needle not in html: raise ValueError('Painel avançado não encontrado')
        html=html.replace(needle,needle+bridge('          '+capture))
    monthly="if(typeof window!=='undefined'&&window.PFChartExplorer)window.PFChartExplorer.capture('monthly',{rows,allRows:transacoes,chosen});"
    html=html.replace('\n  '+monthly,'')
    needle="$('clean-history-bars').innerHTML=bars(data.expenseHistory);"
    if monthly not in html:
        if needle not in html: raise ValueError('Análise mensal não encontrada')
        html=html.replace(needle,needle+bridge('  '+monthly))
    # Attach the exact individual/context filters used by the two-month comparison.
    marker='        function atualizarPainelExecutivoGraficos('
    start=html.index('        function compararRubricaMesAnteriorAtual(')
    end=html.index(marker,start)
    region=html[start:end]
    region=re.sub(r"            if\(typeof window!=='undefined'&&window.PFChartExplorer\)\{\n[\s\S]*?window.PFChartExplorer.capture\('comparisonBars',\{[^\n]*\}\);\n            \}\n",'',region)
    html=html[:start]+region+html[end:];end=start+len(region)
    comparison="""            if(typeof window!=='undefined'&&window.PFChartExplorer){
                const detailRows=transacoes.filter(t=>passaFiltrosIndividuais(t)&&(
                    contexto==='filtro'||contexto==='comparativo'&&['Receita','Despesa'].includes(t.tipo)||contexto==='prevReceita'&&t.tipo==='Receita'||contexto==='recRecebidas'&&t.tipo==='Receita'&&t.status!=='Não Recebido'||contexto==='totalDespesas'&&t.tipo==='Despesa'));
                const months=[inicioMesAnterior,inicioMesAtual].map(d=>({key:d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0'),name:nomesMeses[d.getMonth()]}));
                window.PFChartExplorer.capture('comparison',{rows:detailRows,months,chart:chartEvolucaoInstance});
                window.PFChartExplorer.capture('comparisonBars',{rows:detailRows,months,chart:chartRubricasInstance});
            }
"""
    if "capture('comparison'," not in html[start:end]:
        region=html[start:end];last=region.rfind('        }')
        html=html[:start]+region[:last]+bridge(comparison.rstrip())+region[last:]+html[end:]
    # Only the forecast-revenue distribution changes grouping; totals stay intact.
    start=html.index('        function atualizarGraficos() {')
    end=html.index('        let calendarioV45Data =',start)
    region=html[start:end]
    needle="            const ctxRubricas = document.getElementById('chartRubricas').getContext('2d');"
    grouping="""            if(abaAtivaGrafico==='prevReceita'&&!comparativoReceitasDespesasAtivo){
                const descriptions=new Map();
                filtradas.filter(t=>t.tipo==='Receita'&&t.vencimento&&(Number(t.valor)||0)!==0).forEach(t=>{const key=String(t.descricao||'').trim()||'Sem descrição';descriptions.set(key,(descriptions.get(key)||0)+(Number(t.valor)||0));});
                Object.keys(rubricasMap).forEach(key=>delete rubricasMap[key]);
                descriptions.forEach((value,key)=>Object.defineProperty(rubricasMap,key,{value,enumerable:true,configurable:true,writable:true}));
            }"""
    assert needle in region
    region=region.replace(needle,bridge(grouping)+needle,1)
    last=region.rfind('        }')
    metadata="""            if(chartRubricasInstance)chartRubricasInstance.$pfGroupBy=abaAtivaGrafico==='prevReceita'&&!comparativoReceitasDespesasAtivo?'descricao':null;"""
    region=region[:last]+bridge(metadata)+region[last:]
    html=html[:start]+region+html[end:]
    needle='relatorioHtml = window.PFReportTheme.decorate(relatorioHtml);'
    addition="\n            if(window.PFChartExplorer)relatorioHtml=window.PFChartExplorer.decorate(relatorioHtml,{kind:'managerial',rows:lista,months:[...mesesComparativo].map(([key,m])=>({...m,key})),series:seriesMensais,descriptions:descricoesGrafico});"
    if "kind:'managerial',rows:lista" not in html:
        if needle not in html: raise ValueError('Relatório gerencial não encontrado')
        html=html.replace(needle,needle+addition)
    old="const reportUrl=URL.createObjectURL(new Blob([window.PFFinancialIcons?window.PFFinancialIcons.decorate(html):html],{type:'text/html;charset=utf-8'}));"
    new="const decorated=window.PFFinancialIcons?window.PFFinancialIcons.decorate(html):html;\n const reportUrl=URL.createObjectURL(new Blob([window.PFChartExplorer?window.PFChartExplorer.decorate(decorated,{kind:'cashflow',model:m,base:getFilteredTransactions({ignorarPeriodo:true,ignorarAtrasados:true})}):decorated],{type:'text/html;charset=utf-8'}));"
    if "kind:'cashflow',model:m" not in html:
        if old not in html: raise ValueError('Relatório de fluxo não encontrado')
        html=html.replace(old,new)
    css=(ROOT/'automacao/graficos_interativos.css').read_text(encoding='utf8')
    js=(ROOT/'automacao/graficos_interativos.js').read_text(encoding='utf8')
    html=html.replace('Clique em uma rubrica para filtrar a análise.','Clique em uma rubrica para abrir as descrições e os lançamentos.')
    position=html.lower().rfind('</body>')
    return html[:position]+'<style id="pf-chart-explorer-style">\n'+css+'\n</style>\n<script id="pf-chart-explorer">\n'+js+'\n</script>\n'+html[position:]
if __name__=='__main__':
    for name in ['index.html','distribuicao/app.html','teste-gemini/app.html']:
        p=ROOT/name;p.write_text(aplicar(p.read_text(encoding='utf8')),encoding='utf8')
    print('Seletores e detalhamento integrados nas três versões e nos relatórios.')
