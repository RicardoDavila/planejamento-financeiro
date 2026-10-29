"""Gera as duas versões públicas sem ler bancos, sessões ou senhas de usuários."""
from correcao_distribuicao import corrigir_distribuicao
from correcao_sincronizacao import corrigir_sincronizacao
from correcao_atualizacoes import corrigir_atualizacoes
import argparse, hashlib, json, os, pathlib, re, shutil, subprocess, tempfile
from html.parser import HTMLParser
ROOT = pathlib.Path(__file__).resolve().parents[1]

def normalize(text):
    text = text.replace('\r\n', '\n').lstrip('\ufeff')
    text = text.replace('localStorage', 'pfdLocal').replace('sessionStorage', 'pfdSession')
    text = re.sub(r"const CURRENT_VERSION='V[0-9.]+';", "const CURRENT_VERSION='__PF_VERSION__';", text)
    return re.sub(r'<!-- Distribuição V[0-9.]+:.*?-->', '<!-- Distribuição: versão gerada automaticamente. -->', text)

def read(path):
    return path.read_text(encoding='utf-8-sig')

def validate_distribution_entry(html):
    class Entry(HTMLParser):
        def __init__(self):
            super().__init__(); self.ids={}; self.scripts=[]
        def handle_starttag(self,tag,attrs):
            attrs=dict(attrs)
            if attrs.get('id'): self.ids[attrs['id']]=(tag,attrs)
            if tag=='script': self.scripts.append(attrs.get('src','').split('?')[0])
    entry=Entry(); entry.feed(html)
    if 'telaProtecaoAcesso' in entry.ids or 'authSetupView' in entry.ids:
        raise ValueError('Publicação bloqueada: distribuicao/index.html contém a versão pessoal. Restaure a tela de entrada com e-mail e senha; o index.html pessoal pertence à raiz.')
    for field,tag,kind in [('pfdForm','form',None),('pfdEmail','input','email'),('pfdPassword','input','password')]:
        actual,attrs=entry.ids.get(field,('',{}))
        if actual!=tag or (kind and attrs.get('type')!=kind):
            raise ValueError('Publicação bloqueada: tela de entrada da distribuição inválida; falta '+field+'.')
    if './conta.js' not in entry.scripts and 'conta.js' not in entry.scripts:
        raise ValueError('Publicação bloqueada: a tela de entrada da distribuição não carrega conta.js.')

def generate(source, config, version):
    source = normalize(source)
    if not re.search(r'const dadosPadraoCompletos\s*=\s*\[\s*\]\s*;', source):
        raise ValueError('Publicação bloqueada: a base embutida precisa estar vazia. Não publique lançamentos pessoais no HTML.')
    for region in config['protectedRegions']:
        start = source.find(region['start'])
        end = source.find(region['end'], start)
        if start < 0 or end < 0 or hashlib.sha256(source[start:end].encode()).hexdigest() != region['sha256']:
            raise ValueError('Publicação bloqueada: mudou a região protegida '+region['start'].strip()+'. Revise a adaptação de acesso/dados antes de publicar.')
    patches = config['patches']
    for patch in patches:
        if source.count(patch['context']) != 1:
            raise ValueError('Publicação bloqueada: conflito no adaptador próximo da linha '+str(patch['line'])+'. A versão publicada será mantida.')
    for patch in patches:
        source = source.replace(patch['context'], patch['replacement'], 1)
    source = corrigir_distribuicao(source)
    source = corrigir_sincronizacao(source, distribuicao=True)
    source = corrigir_atualizacoes(source, distribuicao=True)
    source = source.replace('__PF_VERSION__', version)
    if re.search(r'\b(?:localStorage|sessionStorage)\b', source):
        raise ValueError('Publicação bloqueada: acesso direto ao armazenamento no painel distribuído.')
    for required in ['<script src="./isolamento.js"></script>', 'window.parent.pfdConfirmPassword(senha)', 'window.parent.pfdUser', 'pfdLocal.getItem', 'user_id=eq.', "setTimeout(() => { if(typeof window.pfCheckUpdates"]:
        if required not in source:
            raise ValueError('Verificação de distribuição falhou: '+required)
    return source

class InlineScripts(HTMLParser):
    def __init__(self):
        super().__init__(); self.scripts=[]; self.current=None
    def handle_starttag(self, tag, attrs):
        if tag=='script':
            attrs=dict(attrs)
            self.current=[] if not attrs.get('src') and attrs.get('type','') not in ['application/json','application/ld+json'] else None
    def handle_data(self,data):
        if self.current is not None: self.current.append(data)
    def handle_endtag(self,tag):
        if tag=='script' and self.current is not None:
            self.scripts.append(''.join(self.current)); self.current=None

def check_scripts(html, directory):
    parser=InlineScripts(); parser.feed(html)
    data={'inline':parser.scripts, 'files':[str(directory/name) for name in ['conta.js','isolamento.js','service-worker.js']]}
    command="const fs=require('fs'),vm=require('vm');const x=JSON.parse(fs.readFileSync(0,'utf8'));for(const [i,s] of x.inline.entries())new vm.Script(s,{filename:'app-inline-'+i});for(const p of x.files)new vm.Script(fs.readFileSync(p,'utf8'),{filename:p});"
    subprocess.run(['node','-e',command],input=json.dumps(data),text=True,check=True)

def build(output, version):
    if not re.fullmatch(r'V\d+\.\d+\.\d+',version): raise ValueError('Versão inválida.')
    validate_distribution_entry(read(ROOT/'distribuicao/index.html'))
    config=json.loads(read(ROOT/'automacao/adaptacoes.json'))
    for name,expected in config['protectedFiles'].items():
        if hashlib.sha256(read(ROOT/'distribuicao'/name).replace('\r\n','\n').encode()).hexdigest()!=expected:
            raise ValueError('Arquivo de acesso alterado: '+name+'. Revise as verificações antes de publicar.')
    app=generate(read(ROOT/'index.html'), config, version)
    with tempfile.TemporaryDirectory() as temporary:
        staging=pathlib.Path(temporary)/'site'; staging.mkdir()
        for name in ['index.html','version.json','manifest.webmanifest','service-worker.js','sw.js','icon-192.png','icon-512.png']:
            path=ROOT/name
            if path.exists(): shutil.copy2(path,staging/name)
        pessoal=corrigir_atualizacoes(corrigir_sincronizacao(read(ROOT/'index.html')))
        pessoal=re.sub(r"const CURRENT_VERSION='V[0-9.]+';","const CURRENT_VERSION='"+version+"';",pessoal)
        (staging/'index.html').write_text(pessoal,encoding='utf-8')
        (staging/'version.json').write_text(json.dumps({'version':version,'name':version,'channel':'pessoal','notes':['Verifica novas versões ao abrir e retornar ao aplicativo e avisa quando uma atualização já foi carregada.']},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
        for worker_name in ['service-worker.js','sw.js']:
            worker_path=staging/worker_name
            if worker_path.exists():
                worker_path.write_text(re.sub(r'planejamento-financeiro-v[0-9-]+', 'planejamento-financeiro-'+version.lower().replace('.','-'),read(worker_path)),encoding='utf-8')
        if (ROOT/'CNAME').exists(): shutil.copy2(ROOT/'CNAME',staging/'CNAME')
        (staging/'.nojekyll').write_text('')
        dist=staging/'distribuicao';dist.mkdir()
        for name in ['index.html','conta.js','isolamento.js','manifest.webmanifest','service-worker.js','icon-192.png','icon-512.png']:
            shutil.copy2(ROOT/'distribuicao'/name,dist/name)
        (dist/'app.html').write_text(app,encoding='utf-8')
        index=re.sub(r'Versão de distribuição V[0-9.]+', 'Versão de distribuição '+version, read(dist/'index.html'))
        (dist/'index.html').write_text(index,encoding='utf-8')
        worker=re.sub(r"const CACHE='pf-distribuicao-v[^']+';", "const CACHE='pf-distribuicao-"+version.lower().replace('.','-')+"';", read(dist/'service-worker.js'))
        (dist/'service-worker.js').write_text(worker,encoding='utf-8')
        (dist/'version.json').write_text(json.dumps({'version':version,'name':version,'channel':'distribuicao'},indent=2)+'\n',encoding='utf-8')
        check_scripts(app,dist)
        check_scripts(pessoal,dist)
        # Publica somente os arquivos estáticos conhecidos da cópia opcional.
        gemini_source=ROOT/'teste-gemini'
        if gemini_source.exists():
            validate_distribution_entry(read(gemini_source/'index.html'))
            gemini_target=staging/'teste-gemini';gemini_target.mkdir()
            for name in ['index.html','app.html','conta.js','isolamento.js','teste-guard.js','demonstracao.html','preview-celular.html','icon-192.png','icon-512.png']:
                shutil.copy2(gemini_source/name,gemini_target/name)
            check_scripts(read(gemini_target/'app.html'),dist)

        # Nada é alterado no repositório nem em armazenamento do navegador.
        if output.exists() and any(output.iterdir()): raise ValueError('Escolha uma pasta de saída vazia.')
        shutil.copytree(staging,output,dirs_exist_ok=True)
    print('Geração concluída: '+version+' em '+str(output))

if __name__=='__main__':
    parser=argparse.ArgumentParser()
    parser.add_argument('--output',type=pathlib.Path,default=ROOT/'build/site')
    parser.add_argument('--version',default='V4.12.'+str(2+int(os.environ.get('GITHUB_RUN_NUMBER','1'))))
    args=parser.parse_args()
    build(args.output,args.version)
