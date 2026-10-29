from pathlib import Path


def corrigir_rodape(html):
    folder=Path(__file__).parent
    css=(folder/'rodape_mercado.css').read_text(encoding='utf-8')
    script=(folder/'rodape_mercado.js').read_text(encoding='utf-8')
    if 'id="pfIndicadores"' not in html or '</body>' not in html:
        raise ValueError('Rodapé de indicadores ou fim da página não encontrado.')
    patch='<style id="pf-rodape-mercado-ajustado">\n'+css+'\n</style>\n<script id="pf-rodape-mercado-layout">\n'+script+'\n</script>\n'
    before,closing,after=html.rpartition('</body>')
    return before+patch+closing+after
