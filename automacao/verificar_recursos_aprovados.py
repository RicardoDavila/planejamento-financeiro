"""Impede publicar uma versão que perdeu recursos aprovados de layout/relatórios."""
from html.parser import HTMLParser
from pathlib import Path
import json
from aplicar_modo_claro import aplicar_modo_claro
from aplicar_dimensoes import aplicar_dimensoes
from aplicar_notas_pessoais import aplicar_notas_pessoais

ROOT=Path(__file__).resolve().parents[1]

class Blocks(HTMLParser):
    def __init__(self):
        super().__init__();self.blocks={};self.current=None
    def handle_starttag(self,tag,attrs):
        if tag not in ['script','style']:return
        key=dict(attrs).get('id');self.current=(tag,key) if key else None
        if key:
            if key in self.blocks:raise ValueError('Bloco duplicado: '+key)
            self.blocks[key]=[]
    def handle_data(self,data):
        if self.current:self.blocks[self.current[1]].append(data)
    def handle_endtag(self,tag):
        if self.current and tag==self.current[0]:self.current=None

def contract():
    return json.loads((ROOT/'automacao/recursos_aprovados.json').read_text(encoding='utf-8'))

def validate_html(html,name,charts=False,approved=None):
    approved=approved or contract()
    parser=Blocks();parser.feed(html)
    requirements={} if charts else dict(approved['blocos_aplicativo'])
    requirements[approved['bloco_relatorios']]=approved['recursos_relatorios']
    for key,tokens in requirements.items():
        if key not in parser.blocks:raise ValueError(f'Publicação bloqueada: {name} perdeu o recurso aprovado {key}. Use a base mais recente e restaure a alteração antes de publicar.')
        code=''.join(parser.blocks[key])
        for token in tokens:
            if token not in code:raise ValueError(f'Publicação bloqueada: {name}, recurso {key}, está incompleto; falta {token}.')

def validate_tree(root,restore_light=False):
    root=Path(root);approved=contract()
    for name in approved['aplicativos']:
        path=root/name
        if name.startswith('teste-gemini/') and not (root/'teste-gemini').exists():continue
        html=path.read_text(encoding='utf-8-sig')
        # The generator restores this canonical CSS automatically, without altering data.
        if restore_light:html=aplicar_notas_pessoais(aplicar_dimensoes(aplicar_modo_claro(html)),name.startswith('distribuicao/'))
        validate_html(html,name,approved=approved)
    for name in approved['graficos']:
        if name.startswith('teste-gemini/') and not (root/'teste-gemini').exists():continue
        validate_html((root/name).read_text(encoding='utf-8-sig'),name,charts=True,approved=approved)

if __name__=='__main__':
    validate_tree(ROOT,restore_light=True)
    print('Recursos aprovados preservados: modo claro/escuro, margens, rolagem e relatórios Resumido/Completo.')
