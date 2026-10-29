"""Vincula o resumo à publicação que o incluiu, sem reutilizar notas antigas."""
import json
import os
import subprocess


def carregar_notas(root):
    path=root/'automacao/notas_versao.json'
    data=json.loads(path.read_text(encoding='utf-8-sig'))
    notes={}
    for channel in ['pessoal','distribuicao']:
        values=data.get(channel)
        if not isinstance(values,list) or not values or any(not isinstance(x,str) or not x.strip() for x in values):
            raise ValueError('Informe um resumo válido para o canal '+channel+' em automacao/notas_versao.json.')
        notes[channel]=[x.strip() for x in values]
    revision=os.environ.get('GITHUB_SHA','')
    if revision:
        # Em Actions, somente usa as notas se foram incluídas na revisão publicada.
        result=subprocess.run(['git','log','-1','--format=%H','--','automacao/notas_versao.json'],cwd=root,capture_output=True,text=True,check=True)
        if result.stdout.strip()!=revision:
            return {'pessoal':[],'distribuicao':[]}
    return notes
