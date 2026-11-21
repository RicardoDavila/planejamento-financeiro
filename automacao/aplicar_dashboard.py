from pathlib import Path
import re
from cadastro_aparencia import aplicar_cadastro_aparencia
ROOT=Path(__file__).resolve().parents[1]

def aplicar_percentuais(html):
    head=re.search(r'<head\b',html,re.I);body=re.search(r'<body\b',html,re.I)
    if not head or (body and head.start()>body.start()): return html
    for tag,file,ident in [('style','graficos_percentuais.css','pf-chart-percent-style'),('script','graficos_percentuais.js','pf-chart-percent-script')]:
        html=re.sub(r'<'+tag+r' id="'+ident+r'">[\s\S]*?</'+tag+'>\n?','',html)
        block='<'+tag+' id="'+ident+'">'+(ROOT/'automacao'/file).read_text(encoding='utf-8-sig')+'</'+tag+'>\n'
        html=re.sub(r'(<meta\b[^>]*charset[^>]*>)',lambda m:m.group(1)+block,html,count=1,flags=re.I) if re.search(r'<meta\b[^>]*charset',html,re.I) else re.sub(r'(<head\b[^>]*>)',lambda m:m.group(1)+block,html,count=1,flags=re.I)
    return html

def aplicar_botoes(html):
    html=aplicar_percentuais(html)
    if '</body>' not in html: return html
    for tag,file,ident in [('style','paleta_semantica.css','pf-semantic-palette-style'),('script','paleta_semantica.js','pf-semantic-palette-script'),('style','botoes_brancos.css','pf-white-buttons-style'),('style','paleta_projeto.css','pf-project-theme-style'),('script','paleta_projeto.js','pf-project-theme-script'),('style','superficies_34.css','pf-surfaces-34-style'),('script','superficies_34.js','pf-surfaces-34-script'),('script','botoes_brancos.js','pf-white-buttons-script'),('style','enquadramento_hubs.css','pf-hub-fit-style')]:
        html=re.sub(r'<'+tag+r' id="'+ident+r'">[\s\S]*?</'+tag+'>\n?','',html)
        head,tail=html.rsplit('</body>',1)
        html=head+'<'+tag+' id="'+ident+'">'+(ROOT/'automacao'/file).read_text(encoding='utf-8')+'</'+tag+'>\n</body>'+tail
    return html
def aplicar_segunda_tela_boot(html):
    head=re.search(r'<head\b[^>]*>',html,re.I)
    body=re.search(r'<body\b',html,re.I)
    if not head or (body and head.start()>body.start()):
        return html
    # A transição deve existir no head, antes de o formulário de senha ser pintado.
    for tag,file,ident in [('style','segunda_tela_boot.css','pf-second-screen-boot-style'),('script','segunda_tela_boot.js','pf-second-screen-boot-script')]:
        html=re.sub(r'<'+tag+r' id="'+ident+r'">[\s\S]*?</'+tag+'>\n?','',html)
        block='<'+tag+' id="'+ident+'">'+(ROOT/'automacao'/file).read_text(encoding='utf-8')+'</'+tag+'>\n'
        # Depois do charset, preservando a declaração UTF-8 no início do arquivo.
        anchor=r'(<meta\b[^>]*charset[^>]*>)' if re.search(r'<meta\b[^>]*charset[^>]*>',html,re.I) else r'(<head\b[^>]*>)'
        html=re.sub(anchor,lambda m:m.group(1)+block,html,count=1,flags=re.I)
    return html

def aplicar_dashboard(html):
    html=aplicar_segunda_tela_boot(html)
    if 'function adicionarNovaRubricaPrompt' in html:
        html=aplicar_cadastro_aparencia(html)
    for tag,name in [('style','dashboard_referencia.css'),('script','dashboard_referencia.js'),('style-personal','dashboard_pessoal.css'),('script-review','dashboard_revisao.js'),('script-source','dashboard_fonte.js'),('script-personal','dashboard_pessoal.js'),('script-inline','dashboard_interacoes.js')]:
        ident='pf-dashboard-source-script' if tag=='script-source' else 'pf-dashboard-inline-script' if tag=='script-inline' else 'pf-dashboard-review-script' if tag=='script-review' else ('pf-dashboard-'+tag if '-personal' not in tag else 'pf-dashboard-personal-'+tag.split('-')[0])
        tag=tag.split('-')[0]
        html=re.sub(r'<'+tag+r' id="'+ident+r'">[\s\S]*?</'+tag+'>\n?','',html)
        block='<'+tag+' id="'+ident+'">'+(ROOT/'automacao'/name).read_text(encoding='utf-8')+'</'+tag+'>\n'
        head,tail=html.rsplit('</body>',1);html=head+block+'</body>'+tail
    for tag,name,ident in [('style','autofiltros.css','pf-auto-style'),('script','autofiltros.js','pf-auto-script'),('style','painel_lancamentos.css','pf-entries-style'),('script','painel_lancamentos.js','pf-entries-script')]:
        html=re.sub(r'<'+tag+r' id="'+ident+r'">[\s\S]*?</'+tag+'>\n?','',html)
        head,tail=html.rsplit('</body>',1)
        html=head+'<'+tag+' id="'+ident+'">'+(ROOT/'automacao'/name).read_text(encoding='utf-8')+'</'+tag+'>\n</body>'+tail
    ident='pf-cadastro-page-script'
    html=re.sub(r'<script id="'+ident+r'">[\s\S]*?</script>\n?','',html)
    head,tail=html.rsplit('</body>',1)
    html=head+'<script id="'+ident+'">'+(ROOT/'automacao/cadastro_pagina.js').read_text(encoding='utf-8')+'</script>\n</body>'+tail
    for tag,name,ident in [('style','ajuda_aparencia.css','pf-help-appearance-style'),('style','areas_cards.css','pf-area-cards-style'),('script','areas_cards.js','pf-area-cards-script'),('style','cadastro_formularios.css','pf-cadastro-forms-style'),('script','cadastro_formularios.js','pf-cadastro-forms-script'),('script','graficos_comparativos.js','pf-graphics-comparison-script'),('style','graficos_visao_geral.css','pf-graphics-overview-style'),('script','graficos_evolucoes.js','pf-graphics-evolution-script'),('script','graficos_visao_geral.js','pf-graphics-overview-script'),('style','analise_financeira.css','pf-analysis-style'),('script','analise_financeira_core.js','pf-analysis-core-script'),('script','planejamento_pessoal_store.js','pf-planning-store-script'),('script','renda_fixa.js','pf-fixed-income-script'),('script','assistente_planejamento.js','pf-planning-guide-script'),('script','analise_financeira.js','pf-analysis-page-script'),('style','relatorios_pessoais.css','pf-personal-reports-style'),('script','relatorios_pessoais.js','pf-personal-reports-script'),('style','segunda_tela.css','pf-second-screen-style'),('script','segunda_tela.js','pf-second-screen-script'),('style','botoes_brancos.css','pf-white-buttons-style'),('script','conferencia_banco.js','pf-bank-audit-script'),('style','paleta_projeto.css','pf-project-theme-style'),('script','paleta_projeto.js','pf-project-theme-script'),('style','superficies_34.css','pf-surfaces-34-style'),('script','superficies_34.js','pf-surfaces-34-script'),('script','botoes_brancos.js','pf-white-buttons-script'),('style','enquadramento_hubs.css','pf-hub-fit-style')]:
        html=re.sub(r'<'+tag+r' id="'+ident+r'">[\s\S]*?</'+tag+'>\n?','',html)
        head,tail=html.rsplit('</body>',1)
        html=head+'<'+tag+' id="'+ident+'">'+(ROOT/'automacao'/name).read_text(encoding='utf-8')+'</'+tag+'>\n</body>'+tail
    return aplicar_botoes(html)
if __name__=='__main__':
    for name in ['index.html','distribuicao/app.html','teste-gemini/app.html']:
        path=ROOT/name;path.write_text(aplicar_dashboard(path.read_text(encoding='utf-8-sig')),encoding='utf-8')
    for name in ['graficos.html','distribuicao/graficos.html','teste-gemini/graficos.html']:
        path=ROOT/name
        html=path.read_text(encoding='utf-8-sig')
        for tag,file,ident in [('style','botoes_brancos.css','pf-white-buttons-style'),('style','paleta_projeto.css','pf-project-theme-style'),('script','paleta_projeto.js','pf-project-theme-script'),('style','superficies_34.css','pf-surfaces-34-style'),('script','superficies_34.js','pf-surfaces-34-script'),('script','botoes_brancos.js','pf-white-buttons-script'),('style','enquadramento_hubs.css','pf-hub-fit-style')]:
            html=re.sub(r'<'+tag+r' id="'+ident+r'">[\s\S]*?</'+tag+'>\n?','',html)
            head,tail=html.rsplit('</body>',1)
            html=head+'<'+tag+' id="'+ident+'">'+(ROOT/'automacao'/file).read_text(encoding='utf-8')+'</'+tag+'>\n</body>'+tail
        path.write_text(html,encoding='utf-8')
    for path in ROOT.rglob('*.html'):
        if not any(part in ['build','.git','__pycache__'] for part in path.parts):
            path.write_text(aplicar_botoes(path.read_text(encoding='utf-8-sig')),encoding='utf-8')

