from pathlib import Path
import re
from cadastro_aparencia import aplicar_cadastro_aparencia
ROOT=Path(__file__).resolve().parents[1]

def aplicar_botoes(html):
    if '</body>' not in html: return html
    for tag,file,ident in [('style','paleta_semantica.css','pf-semantic-palette-style'),('script','paleta_semantica.js','pf-semantic-palette-script'),('style','botoes_brancos.css','pf-white-buttons-style'),('style','paleta_projeto.css','pf-project-theme-style'),('script','paleta_projeto.js','pf-project-theme-script'),('script','botoes_brancos.js','pf-white-buttons-script')]:
        html=re.sub(r'<'+tag+r' id="'+ident+r'">[\s\S]*?</'+tag+'>\n?','',html)
        head,tail=html.rsplit('</body>',1)
        html=head+'<'+tag+' id="'+ident+'">'+(ROOT/'automacao'/file).read_text(encoding='utf-8')+'</'+tag+'>\n</body>'+tail
    return html
def aplicar_dashboard(html):
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
    for tag,name,ident in [('style','ajuda_aparencia.css','pf-help-appearance-style'),('style','areas_cards.css','pf-area-cards-style'),('script','areas_cards.js','pf-area-cards-script'),('style','cadastro_formularios.css','pf-cadastro-forms-style'),('script','cadastro_formularios.js','pf-cadastro-forms-script'),('style','graficos_visao_geral.css','pf-graphics-overview-style'),('script','graficos_evolucoes.js','pf-graphics-evolution-script'),('script','graficos_visao_geral.js','pf-graphics-overview-script'),('style','analise_financeira.css','pf-analysis-style'),('script','analise_financeira_core.js','pf-analysis-core-script'),('script','planejamento_pessoal_store.js','pf-planning-store-script'),('script','analise_financeira.js','pf-analysis-page-script'),('style','relatorios_pessoais.css','pf-personal-reports-style'),('script','relatorios_pessoais.js','pf-personal-reports-script'),('style','segunda_tela.css','pf-second-screen-style'),('script','segunda_tela.js','pf-second-screen-script'),('style','botoes_brancos.css','pf-white-buttons-style'),('script','conferencia_banco.js','pf-bank-audit-script'),('style','paleta_projeto.css','pf-project-theme-style'),('script','paleta_projeto.js','pf-project-theme-script'),('script','botoes_brancos.js','pf-white-buttons-script')]:
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
        for tag,file,ident in [('style','botoes_brancos.css','pf-white-buttons-style'),('style','paleta_projeto.css','pf-project-theme-style'),('script','paleta_projeto.js','pf-project-theme-script'),('script','botoes_brancos.js','pf-white-buttons-script')]:
            html=re.sub(r'<'+tag+r' id="'+ident+r'">[\s\S]*?</'+tag+'>\n?','',html)
            head,tail=html.rsplit('</body>',1)
            html=head+'<'+tag+' id="'+ident+'">'+(ROOT/'automacao'/file).read_text(encoding='utf-8')+'</'+tag+'>\n</body>'+tail
        path.write_text(html,encoding='utf-8')
    for path in ROOT.rglob('*.html'):
        if not any(part in ['build','.git','__pycache__'] for part in path.parts):
            path.write_text(aplicar_botoes(path.read_text(encoding='utf-8-sig')),encoding='utf-8')

