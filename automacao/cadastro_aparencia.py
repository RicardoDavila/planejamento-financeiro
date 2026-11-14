"""Permite que os formulários temáticos usem as validações atuais sem prompt nativo."""
import re

def aplicar_cadastro_aparencia(html):
    for name,var,text in [('adicionarNovaRubricaPrompt','nova','Digite o nome da Nova Rubrica:'),('adicionarNovoSubItemPrompt','novo','Digite o nome do Novo Sub-Item:')]:
        pattern=r'        function '+name+r'\([^)]*\) \{[\s\S]*?^        \}'
        match=re.search(pattern,html,re.M)
        if not match:raise ValueError('Função de cadastro não encontrada: '+name)
        block=match[0]
        if 'nomeInformado' not in block:
            block=block.replace('function '+name+'()', 'function '+name+'(nomeInformado, avisar = alert)')
            block=block.replace('const '+var+' = prompt("'+text+'");','const '+var+' = arguments.length ? (nomeInformado == null ? null : String(nomeInformado)) : prompt("'+text+'");')
            block=block.replace('alert(', 'avisar(')
            # Retorno usado apenas para confirmar o formulário novo; chamadas antigas preservadas.
            block=re.sub(r'(avisar\(`(?:Rubrica|Sub-Item) [^\n]+adicionad[ao] com sucesso!`\);)',r'\1\n                    return nomeFormatado;',block)
            html=html[:match.start()]+block+html[match.end():]
    old="function gcRenomear(){const origem=document.getElementById('gcOrigem').value;const nome=prompt('Novo nome:',origem);if(nome===null)return;try{const n=gcAplicar('renomear',origem,nome);alert(`Cadastro renomeado. ${n} lançamento(s) atualizado(s).`);}catch(e){alert(e.message);}}"
    new="function gcRenomear(nomeInformado,avisar=alert){const origem=document.getElementById('gcOrigem').value;const nome=arguments.length?nomeInformado:prompt('Novo nome:',origem);if(nome===null)return;try{const n=gcAplicar('renomear',origem,nome);avisar(`Cadastro renomeado. ${n} lançamento(s) atualizado(s).`);return n;}catch(e){avisar(e.message);return null;}}"
    if old in html:html=html.replace(old,new,1)
    elif new not in html:raise ValueError('Função de renomear mudou; revisar integração.')
    return html
