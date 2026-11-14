/* pf-desktop-only-v511 */
(function(){if(typeof matchMedia==='function'&&matchMedia('(max-width:900px), (pointer:coarse)').matches)return;
(()=>{'use strict';
function install(){
 if(matchMedia('(max-width:900px), (pointer:coarse)').matches||document.getElementById('pfDashboardHome'))return;
 const $=id=>document.getElementById(id),workspace=$('layout-workspace');
 if(!workspace)return;
 const home=document.createElement('section');home.id='pfDashboardHome';home.setAttribute('aria-labelledby','pfDashboardTitle');
 const cards=[['dashboard','📊','Dashboard','KPIs, receitas vs despesas e resultado por período em uma única tela.'],['entries','📋','Painel de Lançamentos','Visualizar, editar e excluir os lançamentos já cadastrados.'],['new','📝','Cadastro','Novo lançamento, rubricas e sub-itens.'],['charts','📈','Gráficos','Evolução mensal de receitas, despesas e saldo.'],['analysis','🔎','Análise Financeira','Situação financeira, alertas e projeção do período.'],['tools','🛠️','Ações e Ferramentas','Calendário, calculadora, lixeira, instalação do app e histórico.'],['security','🛡️','Segurança','Exportar/importar, backup, restauração e controle de acesso.'],['help','❓','Ajuda e Informações','Manuais, versão do sistema e informações do projeto.']];
 home.innerHTML='<h1 id="pfDashboardTitle" tabindex="-1">Painel Financeiro</h1><p>Escolha uma área para começar.</p><div class="pf-dash-grid">'+cards.map(([key,icon,title,desc])=>'<button type="button" class="pf-dash-card" data-dash-action="'+key+'"><span class="pf-dash-icon" aria-hidden="true">'+icon+'</span><strong>'+title+'</strong><span>'+desc+'</span></button>').join('')+'</div>';
 const masthead=document.createElement('header');masthead.id='pfDashboardHeader';
 masthead.innerHTML='<div><h2><img id="pfDashboardProjectIcon" src="./icon-192.png" alt="" width="28" height="28">Planejamento Financeiro</h2><p id="pfDashboardSource">Base financeira · Período selecionado no painel</p></div><div id="pfDashboardIdentity"><span id="pfDashboardAvatar" aria-hidden="true">R</span><div id="pfDashboardUser"></div></div>';
 const projectLogo=document.querySelector('.pf-project-logo');const projectIcon=$('pfDashboardProjectIcon');if(projectIcon)projectIcon.src=projectLogo?.getAttribute?.('src')||'./icon-192.png';
 const toolbar=document.createElement('div');toolbar.id='pfDashboardToolbar';toolbar.setAttribute('aria-label','Ações rápidas');
 const person=document.createElement('div');person.id='pfDashboardPerson';
 const nav=document.createElement('nav');nav.id='pfDashboardNavigation';nav.setAttribute('aria-label','Áreas do painel financeiro');
 nav.innerHTML=[['home','← Voltar Página Inicial'],['dashboard','Dashboard'],['entries','Lançamentos'],['charts','Gráficos']].map(([key,label])=>'<button type="button" data-dash-action="'+key+'">'+label+'</button>').join('');
 workspace.before(masthead,person,nav,home);
 const toolbarPlace=document.createElement('div');toolbarPlace.id='pfDashboardToolbarPlace';home.querySelector('.pf-dash-grid')?.before(toolbarPlace);toolbarPlace.append(toolbar);
 const greeting=$('pf495Greeting');if(greeting)$('pfDashboardUser').append(greeting);
 const exit=$('pfSairBarraTopo');if(exit)$('pfDashboardIdentity').append(exit);const periodChip=document.createElement('span');periodChip.id='pfDashboardPeriod';$('pfDashboardIdentity').append(periodChip);const syncPeriod=()=>{const period=$('clean-month')?.textContent?.trim()||'';periodChip.textContent=period;periodChip.hidden=!period;$('pfDashboardSource').textContent='Base financeira'+(period?' · '+period:' · Período selecionado no painel');};syncPeriod();if($('clean-month'))new MutationObserver(syncPeriod).observe($('clean-month'),{childList:true,characterData:true,subtree:true});
 // Restaurar o acesso ao assistente original no cabeçalho persistente.
 const assistant=$('pfIaLaunch');if(assistant){assistant.title='Assistente financeiro — cálculos locais e Gemini online';$('pfDashboardIdentity').append(assistant);}
 const personLabel=$('desktop-person-label');if(personLabel)person.append(personLabel);
 const originalActions=$('clean-top-actions');
 const theme=$('reference-theme'),notice=originalActions?Array.from(originalActions.querySelectorAll('button')).find(b=>b!==theme&&b.id!=='pf-dois-monitores'&&b.id!=='pf-cloud-status'):null;
 if(notice){notice.id='pfDashboardNotices';const label=document.createElement('span');label.textContent='🔔 Avisos';const count=document.createElement('span');count.id='pfDashboardNoticeCount';count.hidden=true;notice.replaceChildren(label,count);const source=$('pfAvisosConteudo');if(source){const update=()=>{const n=Array.from(source.children).filter(el=>!el.hidden&&el.style.display!=='none'&&!el.classList.contains('hidden')).length;count.textContent=String(n);count.hidden=!n;};new MutationObserver(update).observe(source,{childList:true,subtree:true,attributes:true,attributeFilter:['hidden','class','style']});update();}}
 for(const node of [theme,notice,$('pf-dois-monitores'),$('pf-cloud-status'),$('pfNotasBtn')])if(node)toolbar.append(node);
 // Emoji presentation matches the reference; retain original controls and event handlers.
 if(theme){const syncThemeIcon=()=>{const label=theme.textContent.replace(/^☀(?:\uFE0F)?\s*/, '☀️ ').replace(/^◐\s*/, '🌙 ');if(theme.textContent!==label)theme.textContent=label;};syncThemeIcon();new MutationObserver(syncThemeIcon).observe(theme,{childList:true,characterData:true,subtree:true});}
 const cloudIcon=$('pf-cloud-status')?.querySelector('i');if(cloudIcon){cloudIcon.className='pf-dash-cloud-icon';cloudIcon.textContent='☁️';cloudIcon.setAttribute('aria-hidden','true');}
 // Reuse the original controls and their event handlers; cloud and notes keep their authorization.
 if(!document.body.classList.contains('dark-mode'))$('pf-theme-toggle')?.click();
 const syncIdentity=()=>{const text=$('pf495GreetingTitle')?.textContent||'';const name=text.replace(/^Olá,?\s*/i,'').trim();$('pfDashboardAvatar').textContent=name.charAt(0).toUpperCase()||'•';};
 syncIdentity();if($('pf495GreetingTitle'))new MutationObserver(syncIdentity).observe($('pf495GreetingTitle'),{childList:true,subtree:true,characterData:true});

 const table=$('tabelaLancamentosWrapper');if(table?.parentElement&&table.parentElement!==$('layout-left'))table.parentElement.classList.add('pf-dash-entries');
 function show(view){document.body.dataset.pfDashView=view;window.PFPersonalDashboard?.show(view==='dashboard');home.hidden=view!=='home';nav.hidden=view==='home';nav.querySelectorAll('button').forEach(b=>{if(b.dataset.dashAction===view)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current')});window.PFChartExplorer?.schedule();}
 function act(key){
  if(['home','dashboard','entries'].includes(key)){show(key);(key==='home'?$('pfDashboardTitle'):nav.querySelector('[aria-current]'))?.focus();return}
  if(key==='new'){if(window.PFCadastroPage)window.PFCadastroPage.show();else window.openModal?.();return}
  if(key==='charts'){window.PFDesktopApproved?.openGraphics?.();return}
  if(key==='analysis'){show('analysis');$('painelGerencial')?.scrollIntoView({block:'start'});return}
  const category={help:'ajuda',security:'seguranca',tools:'acoes'}[key];
  if(category)document.querySelector('#pfMenuTopo [data-pf-categoria="'+category+'"]')?.click();
 }
 [home,nav].forEach(el=>el.addEventListener('click',e=>{const b=e.target.closest('[data-dash-action]');if(b)act(b.dataset.dashAction)}));
 document.body.classList.add('pf-dashboard-shell');show('home');window.PFDashboard={show};
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();

})();