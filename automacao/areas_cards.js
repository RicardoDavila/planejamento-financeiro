/* pf-desktop-only-v511 */
(function(){if(typeof matchMedia==='function'&&matchMedia('(max-width:900px), (pointer:coarse)').matches)return;
/* Etapa 14: navegação em cards; as ações continuam nos controles originais. */
(()=>{'use strict';
const definitions={
 acoes:{title:'Ações e Ferramentas',icon:'🛠️',view:'tools',description:'Escolha uma ferramenta para continuar.',items:[
  ['abrirCalendarioFinanceiro','📅','Calendário','Consultar os compromissos no calendário financeiro.'],
  ['abrirCalculadora','🧮','Calculadora','Abrir a calculadora do projeto.'],
  ['Lixeira','🗑️','Lixeira','Consultar os itens enviados para a lixeira.','text'],
  ['btnInstalarDesktop','📲','Instalar Aplicativo','Escolher onde instalar o Planejamento Financeiro.','id'],
  ['Histórico','🕘','Histórico','Consultar o histórico disponível no aplicativo.','text'],
  ['abrirConfiguracaoNomeUsuario','👤','Nome do usuário','Personalizar a saudação do projeto.']
 ]},
 seguranca:{title:'Segurança',icon:'🛡️',view:'security',description:'Recursos de proteção, cópia de segurança e acesso.',selector:'#pf493Actions .pf-seguranca-dropdown button',items:[
  ['exportToExcel','📗',null,'Exportar o banco completo para uma planilha Excel.'],
  ['inputImportExcel','📥',null,'Selecionar uma planilha para a importação existente.'],
  ['exportToCSV','📃',null,'Exportar os lançamentos para um arquivo CSV.'],
  ['fazerBackup','💾',null,'Criar uma cópia de segurança dos dados.'],
  ['abrirAlertaPreRestauracao','♻️',null,'Abrir a restauração de uma cópia de segurança.'],
  ['sincronizarAgoraNuvem','☁️',null,'Abrir a sincronização existente com a nuvem.'],
  ['verificarEabrirSegurancaAcesso','🔐',null,'Configurar a proteção e a recuperação de acesso.']
 ]},
 ajuda:{title:'Ajuda e Informações',icon:'❓',view:'help',description:'Consulte os manuais e as informações do projeto.',selector:'#pfHelpMenu .pf-help-dropdown button',items:[
  ['pfPesquisarManuais','🔎',null,'Pesquisar orientações nos manuais do projeto.'],
  ['pfOpenManuals','📚',null,'Consultar o manual de operação.'],
  ['pfShowCurrentVersion','🏷️',null,'Consultar a versão instalada do projeto.'],
  ['pfCheckUpdates','🔄',null,'Verificar as versões disponíveis pelo recurso existente.'],
  ['pfShowAbout','ℹ️',null,'Conhecer as informações do Planejamento Financeiro.']
 ]}
};
if(typeof module!=='undefined'&&module.exports)module.exports=definitions;
if(typeof document==='undefined')return;
let page,current=null,returnFocus=null,epoch=0;
const body=document.body,$=id=>document.getElementById(id);
function authorized(){try{window.pfdAssert?.();return typeof protecaoAutenticada!=='undefined'&&protecaoAutenticada===true&&!body.classList.contains('auth-pendente');}catch{return false;}}
function source(def){const [key,,,,kind]=def;
 if(kind==='id')return $(key);
 const originals=[...document.querySelectorAll('#pf493Actions button,#pfMobileMaisPanel .pf-mobile-mais-grid button')];
 if(kind==='text')return originals.find(n=>n.textContent.includes(key));
 return originals.find(n=>(n.getAttribute('onclick')||'').includes(key))||[...document.querySelectorAll('[onclick]')].find(n=>(n.getAttribute('onclick')||'').includes(key));
}
function actions(category){const config=definitions[category];
 if(config.selector)return [...document.querySelectorAll(config.selector)].map(node=>{const def=config.items.find(d=>(node.getAttribute('onclick')||'').includes(d[0]));return {node,icon:def?.[1]||config.icon,title:node.textContent.replace(/\s+/g,' ').trim(),description:def?.[3]||node.title||'Abrir este recurso do projeto.'};});
 return config.items.map(def=>({node:source(def),icon:def[1],title:def[2],description:def[3],run:def[4]==='function'?()=>window[def[0]]?.():null,available:def[4]==='function'&&typeof window[def[0]]==='function'})).filter(a=>a.node||a.available);
}
function hide(){if(!page)return;page.hidden=true;current=null;if(body.classList.contains('pf-area-open'))body.classList.remove('pf-area-open');}
function home(){++epoch;hide();if(window.PFDashboard)window.PFDashboard.show('home');returnFocus?.focus();}
function ensure(){if(page)return;page=document.createElement('section');page.id='pfAreaCardsPage';page.hidden=true;page.setAttribute('aria-labelledby','pfAreaCardsTitle');
 page.innerHTML='<nav aria-label="Navegação da área"><button type="button" data-area-home>← Voltar Página Inicial</button></nav><header><h1 id="pfAreaCardsTitle" tabindex="-1"></h1><p id="pfAreaCardsDescription"></p></header><div class="pf-area-grid"></div><p class="pf-area-empty" hidden>Nenhum recurso disponível nesta área.</p>';
 const anchor=$('layout-workspace');if(anchor)anchor.before(page);else ($('appConteudo')||body).append(page);
 page.querySelector('[data-area-home]').addEventListener('click',home);
 new MutationObserver(()=>{if(!current)return;if(!authorized()||(window.PFDashboard&&body.dataset.pfDashView!==definitions[current].view))hide();}).observe(body,{attributes:true,attributeFilter:['class','data-pf-dash-view']});
}
async function open(category,trigger){const config=definitions[category];if(!config||!authorized())return;const ticket=++epoch;
 if(category==='seguranca'){
  const admin=typeof window.ehAdministrador==='function'&&await window.ehAdministrador();
  if(ticket!==epoch||!authorized())return;
  if(!admin){alert('Acesso permitido somente para usuários com perfil de Administrador.');return;}
 }
 if(ticket!==epoch||!authorized())return;
 ensure();returnFocus=trigger||returnFocus;
 if(typeof fecharAcoesMobile==='function')fecharAcoesMobile();
 // Fechar menus anteriores, sem abrir o menu lateral nem copiar seus eventos.
 $('pfMenuFechar')?.click();const dropdown=$('desktop-dropdown');if(dropdown)dropdown.hidden=true;
 for(const b of document.querySelectorAll('#pfMenuTopo [aria-expanded="true"]'))b.setAttribute('aria-expanded','false');
 const grid=page.querySelector('.pf-area-grid');grid.replaceChildren();
 for(const action of actions(category)){
  const card=document.createElement('button');card.type='button';card.className='pf-area-card';
  const icon=document.createElement('span');icon.className='pf-area-icon';icon.setAttribute('aria-hidden','true');icon.textContent=action.icon;
  const title=document.createElement('strong');title.textContent=action.title;
  const description=document.createElement('span');description.className='pf-area-description';description.textContent=action.description;
  card.append(icon,title,description);card.disabled=Boolean(action.node?.disabled);
  card.addEventListener('click',()=>{if(!authorized())return;if(action.node)action.node.click();else action.run?.();});
  grid.append(card);
 }
 $('pfAreaCardsTitle').textContent=config.icon+' '+config.title;$('pfAreaCardsDescription').textContent=config.description;
 page.querySelector('.pf-area-empty').hidden=grid.children.length>0;
 if(window.PFDashboard)window.PFDashboard.show(config.view);
 current=category;page.hidden=false;if(!body.classList.contains('pf-area-open'))body.classList.add('pf-area-open');
 window.PFButtonAppearance?.refresh?.();$('pfAreaCardsTitle').focus();page.scrollIntoView({block:'start',behavior:'auto'});
}
// Captura antes dos menus antigos: cada comando continua no controle original.
window.addEventListener('click',event=>{
 const trigger=event.target.closest?.('[data-dash-action],#pfMenuTopo [data-pf-categoria]');if(!trigger)return;
 const category={tools:'acoes',security:'seguranca',help:'ajuda'}[trigger.dataset.dashAction]||trigger.dataset.pfCategoria;
 if(!definitions[category]){++epoch;return;}
 event.preventDefault();event.stopImmediatePropagation();open(category,trigger);
},true);
window.PFAreaCards={open,hide,definitions};
})();

})();