/* Área de Cadastro compartilhada pela capa e pelo Painel de Lançamentos. */
(()=>{'use strict';
function install(){if(matchMedia('(max-width:900px), (pointer:coarse)').matches)return;const workspace=document.getElementById('layout-workspace');if(!workspace)return;const allowed=()=>typeof protecaoAutenticada!=='undefined'&&protecaoAutenticada===true&&!document.body.classList.contains('auth-pendente');
const page=document.createElement('section');page.id='pfCadastroPage';page.hidden=true;page.innerHTML='<h1 tabindex="-1">Cadastro</h1><div class="pf-dash-grid">'+[['openModal','＋','Novo Lançamento','Cadastrar uma nova receita ou despesa.'],['abrirGerenciarCadastros','📁','Gerenciar Cadastro','Consultar rubricas cadastradas.'],['adicionarNovaRubricaPrompt','🏷️','Nova Rubrica','Cadastrar uma nova rubrica/categoria.'],['adicionarNovoSubItemPrompt','🔖','Novo Sub-Item','Cadastrar um sub-item vinculado a uma rubrica.']].map(([action,icon,title,description])=>'<button type="button" class="pf-dash-card" data-cadastro-open="'+action+'"><span class="pf-dash-icon">'+icon+'</span><strong>'+title+'</strong><span>'+description+'</span></button>').join('')+'</div>';workspace.before(page);
page.addEventListener('click',e=>{const b=e.target.closest('[data-cadastro-open]');if(b&&allowed())window[b.dataset.cadastroOpen]?.();});
window.PFCadastroPage={show(){if(!allowed())return;window.PFDashboard?.show('cadastro');page.hidden=false;page.querySelector('h1')?.focus();}};
new MutationObserver(()=>{page.hidden=document.body.dataset.pfDashView!=='cadastro'||!allowed();}).observe(document.body,{attributes:true,attributeFilter:['class','data-pf-dash-view']});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
