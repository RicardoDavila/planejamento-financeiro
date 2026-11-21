/* pf-desktop-only-v511 */
(function(){if(typeof matchMedia==='function'&&matchMedia('(max-width:900px), (pointer:coarse)').matches)return;
/* Etapa 16. Apresentação: nunca acessa dados financeiros ou armazenamento. */
(()=>{'use strict';
const fold=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/^[^a-z0-9]+/,'').replace(/\s+/g,' ').trim();
function actionKind(text,meta=''){
 const t=fold(text),m=fold(meta);
 if(/excluir|apagar|remover selecao|delete|trash/.test(t+' '+m))return 'danger';
 if(/\bsair\b|encerrar sessao|logout|sairaplicativo/.test(t+' '+m))return 'exit';
 if(/salvar.*sub.?item/.test(t))return 'saveBlue';
 if(/salvar.*rubrica|^salvar|^confirmar|aplicar filtros|^aplicar$|^calcular\b|^pesquisar$/.test(t)&&!(/pdf|arquivo|visao/.test(t)))return 'primary';
 if(/pdf|exportar excel|exportar csv/.test(t))return 'pdf';
 if(/imprimir|print/.test(t))return 'print';
 if(/baixar selecao|baixar selecion/.test(t))return 'positive';
 if(/limpar|redefinir|cancelar/.test(t))return 'clear';
 if(/ver pontos|simulac|recorren/.test(t))return 'analysis';
 if(/editar|editarlancamento/.test(t+' '+m))return 'edit';
 if(/ir para cadastro|voltar ao cadastro/.test(t))return 'cadastro';
 if(/voltar.*inicial|voltar.*capa|painel de lancamentos/.test(t))return 'nav';
 if(/filtros avancados|recolher filtros|expandir filtros/.test(t))return 'advanced';
 if(/^receitas?$/.test(t))return 'incomeFilter';
 if(/^despesas?$/.test(t))return 'expenseFilter';
 if(/^pendentes?$/.test(t))return 'pendingFilter';
 if(/^atrasados?$/.test(t))return 'expenseFilter';
 if(/^todos$|^todas$/.test(t))return 'allFilter';
 if(/^semestre$/.test(t))return 'nav';
 if(/ano completo|^ano$|semestre/.test(t))return 'annual';
 if(/trimestre|^7 dias$|^semestre$/.test(t))return 'nav';
 if(/^hoje$|^este mes$|^mes atual$/.test(t))return 'cadastro';
 if(/^(jan|fev|mar|abr|mai|jun|jul|ago|set|out|nov|dez)(\b|\/)/.test(t))return 'month';
 if(/mes anterior|proximo mes|mes posterior/.test(t))return 'neutral';
 return 'neutral';
}
function statusKind(text){const t=fold(text);if(/vencid|atrasad|overdue/.test(t))return 'overdue';if(/nao recebid|a receber|receita prevista|unreceived/.test(t))return 'receivable';if(/recebid|received/.test(t))return 'received';if(/^(pago|paga|pagamento|quitad|liquidad|concluid|paid|feito)/.test(t))return 'paid';if(/pendente|a vencer|hoje|pending/.test(t))return 'pending';return null;}
const styles={neutral:['muted','card','line'],exit:['muted','transparent','line'],nav:['blue','blueBg','border'],cadastro:['accent','cyanBg','cyanLine'],analysis:['purple','purpleBg','purpleLine'],primary:['primaryInk','primary','primary'],saveBlue:['onBlue','solidBlue','solidBlue'],pdf:['onBlue','solidBlue','blue'],print:['muted','card','line'],positive:['green','greenBg','greenLine'],danger:['red','redBg','redLine'],dangerIcon:['red','transparent','redLine'],clear:['muted','transparent','line'],edit:['accent','transparent','cyanLine'],advanced:['blue','blueBg','border'],incomeFilter:['green','greenBg','greenLine'],expenseFilter:['red','redBg','redLine'],pendingFilter:['amber','amberBg','amberLine'],allFilter:['muted','card','line'],annual:['purple','purpleBg','purpleLine'],month:['muted','card','line']};
const activeStyles={incomeFilter:['onGreen','greenSolid','greenLine'],expenseFilter:['onRed','redSolid','redLine'],pendingFilter:['onAmber','amberSolid','amberLine'],allFilter:['ink','selected','accent'],annual:['onPurple','purpleSolid','accent'],month:['primaryInk','primary','primaryHover'],advanced:['blueActive','selected','blue']};
function lightScheme(scheme,kind,active,dark,disabled=false){
 if(dark||disabled)return scheme;
 if(['primary','saveBlue','pdf'].includes(kind))return ['onBlue','solidBlue','solidBlue'];
 if(active)return ['blueActive','selected','solidBlue'];
 return [scheme[0],'secondary','secondaryLine'];
}
if(typeof module!=='undefined'&&module.exports)module.exports={actionKind,statusKind,styles,activeStyles,lightScheme};
if(typeof document==='undefined')return;
const touched=new Map();let running=false;
function set(node,property,value){if(!node?.style)return;if(!touched.has(node))touched.set(node,new Set());touched.get(node).add(property);if(node.style.getPropertyValue(property)!==value||node.style.getPropertyPriority(property)!=='important')node.style.setProperty(property,value,'important');}
const ink=(n,key='ink')=>set(n,'color','var(--pf16-'+key+')');
const bg=(n,key='card')=>set(n,'background-color',key==='transparent'?'transparent':'var(--pf16-'+key+')');
const border=(n,key='border')=>{const uniform=document.body.classList.contains('dark-mode')&&(n.matches?.('button,input[type="button"],input[type="submit"],input[type="reset"],a.pf-help-primary,.pf-help-manuals a')||n.matches?.(cards));set(n,'border-color','var(--pf16-hover-border,'+(uniform?'var(--pf18-contour)':'var(--pf16-'+key+')')+')');};
function mark(n,key,value){if(n?.dataset&&n.dataset[key]!==value)n.dataset[key]=value;}
function tree(node,key='ink'){ink(node,key);for(const child of node?.querySelectorAll('span,strong,small,b,p,label,i')||[])ink(child,key);}
function isActive(n){return n.matches('[aria-pressed="true"],[aria-selected="true"],[aria-current="page"]')||[...n.classList].some(c=>['active','selected','is-active','pdp-active','pa-active'].includes(c));}
const cards='.pf-dash-card,.pf-area-card,.pdp-card,.pdp-kpi,.pa-card,.pa-metric,.pfgo-card,.pfgo-metric,.fc-card,.g-metric,.dashboard-v40-card,.pdpx-audit article,.clean-profile-card,.desktop-balance-grid>div,.pf-help-modal-card,.pf-help-manuals a,.pf-auto-menu,.desktop-item-menu,.bg-white,.bg-gray-50,.bg-gray-100,.bg-slate-50,.bg-slate-100,.bg-gray-800,.bg-slate-800';
const panels='#pfLanguageMenu,#pfCurrencyMenu,#painelGerencial,#clean-periodbar,#clean-month-analysis,#pf-entries-panel,#pfAreaCardsPage,#pfCadastroEditor,#pf-bank-audit,#pfDashboardToolbar,.pdp-period,.pdp-filters,.pdp-advanced,.pfgo-period,.pfgo-filter-actions,.pa-filters,.panel,.pf-chart-card,.clean-menu-group,.analysis-card';
function surfaces(){
 bg(document.body,'bg');ink(document.body);
 for(const n of document.querySelectorAll(cards)){bg(n);border(n);ink(n);set(n,'box-shadow',document.body.classList.contains('dark-mode')?'var(--pf16-hover-shadow,none)':'var(--pf16-hover-shadow,var(--pf32-card-shadow))');mark(n,'pf16Surface','card');}
 for(const n of document.querySelectorAll(panels)){bg(n);border(n);ink(n);}
 for(const n of document.querySelectorAll('dialog,[role="dialog"],.modal-content,.modal-card,.cal45-card,.pf-help-modal-card,[id^="modal"]>div,#modalConfiguracaoNuvem>div,#modalRelatorioMensalMobile>div,#modalLancamento>div')){bg(n);border(n);ink(n);mark(n,'pf16Surface','dialog');}
 for(const n of document.querySelectorAll('#pfPersonalDashboard,#pfAnalysisPage,#pfGraphicsPage,#pfCadastroPage,#appConteudo')){set(n,'background-color','transparent');ink(n);}
 set(document.getElementById('pfAreaCardsPage'),'background-color','transparent');
 for(const n of document.querySelectorAll('h1,h2,h3,h4,h5,h6,label,.pdp-label,.pa-section-head,.pfgo-section,.lbl,.label,.pf-area-card strong,.pf-dash-card strong'))ink(n);
 for(const n of document.querySelectorAll('.pdp-note,.pa-note,.pfgo-note,.pf-area-description,.pf-dash-card>span:last-child,#pfAreaCardsDescription,#pfDashboardSource,#pfHelpModalBody p,#pfHelpModalBody li,.fc-card small,.pdpx-audit article p,small'))ink(n,'muted');
 for(const n of document.querySelectorAll('.pdp-label,.pa-metric>span:first-child,.pfgo-metric>small:first-child,.g-metric .label,.dashboard-v40-card .lbl'))tree(n);
 // Valores são neutros. Somente etiquetas/ícones e desenhos de gráficos usam estados.
 for(const n of document.querySelectorAll('.pdp-value,.pa-metric strong,.pa-card>strong,.pfgo-metric strong,.pfge-total strong,.analysis-amount,.dashboard-v40-card .val,.g-metric .number,.g-metric .value,.fc-card strong,.desktop-balance-grid strong,[id^="pgRece"],#pgDespesas,#pgInvestimentos,#pgVencido,#pgAVencer,#pgSaldo,#cardPrevReceita,#cardRecRecebidas,#cardDespesas,#cardInvestimento,#cardSaldo,#cardPendente'))tree(n);
 for(const n of document.querySelectorAll('strong,.valor,.value,.val,.amount,.number'))if(/R\$|\d[\d.,]*\s*%/.test(n.textContent))tree(n);
 for(const n of document.querySelectorAll('input:not([type="checkbox"]):not([type="radio"]):not([type="button"]):not([type="submit"]),select,textarea,option,optgroup')){bg(n,'field');border(n,'line');ink(n);}
 for(const n of document.querySelectorAll('table')){ink(n);border(n,'line');if(n.closest('#tabelaLancamentosWrapper')){set(n,'min-width','0px');set(n,'width','100%');}}
 for(const n of document.querySelectorAll('table th')){tree(n,'accent');bg(n,'selected');border(n,'line');}
 for(const n of document.querySelectorAll('table td')){tree(n);bg(n,'transparent');border(n,'line');}
}
function buttons(){for(const b of document.querySelectorAll('button,input[type="button"],input[type="submit"],input[type="reset"],a.pf-help-primary,.pf-help-manuals a')){
 if(b.closest('table th,table td')&&!b.matches('button,input'))continue;
 if(b.matches('.pf-dash-card,.pf-area-card,.pdp-kpi,.pa-metric,.pfgo-metric,.pa-click,.dashboard-v40-card'))continue;
 const label=(typeof window!=='undefined'&&window.PFI18n?.originalText(b))||b.textContent||b.value||b.getAttribute('aria-label')||b.title||'',meta=(b.getAttribute('onclick')||'')+' '+(b.getAttribute('aria-label')||'')+' '+b.title;
 if(b.closest('table th')||b.closest('table td')&&!/editar|excluir|apagar|edit|delete/.test(fold(meta+' '+label)))continue;
 // O estado vem do indicador original de sincronização; a paleta não altera a conexão.
 if(b.id==='pf-cloud-status'&&b.classList.contains('pf-cloud-online')&&!b.disabled&&b.getAttribute('aria-disabled')!=='true'){
  const neon=document.body.classList.contains('dark-mode')?'#00FF87':'#15803D';
  mark(b,'pf16Action','cloudOnline');mark(b,'pf16Active','true');
  for(const node of [b,...b.querySelectorAll('span,strong,small,b,p,label,i')])set(node,'color','var(--pf16-button-hover-ink,'+neon+')');
  set(b,'background-color','rgba(0,255,135,.12)');set(b,'border-color','var(--pf16-hover-border,'+neon+')');
  set(b,'box-shadow','var(--pf16-hover-shadow,0 0 12px rgba(0,255,135,.4))');set(b,'font-weight','700');set(b,'background-image','none');continue;
 }
 const classified=actionKind(label,meta),kind=classified==='danger'&&b.closest('table td')?'dangerIcon':classified,active=isActive(b)||kind==='advanced'&&b.getAttribute('aria-expanded')==='true';let scheme=active?(activeStyles[kind]||['ink','selected','accent']):styles[kind];
 if(kind==='danger'&&/excluir selecao/.test(fold(label))&&!document.querySelector('#tabelaCorpo input[type=checkbox]:checked'))scheme=['muted','transparent','line'];
 if(b.disabled||b.getAttribute('aria-disabled')==='true'||kind==='month'&&(b.dataset.hasData==='false'||b.dataset.hasRecords==='false'))scheme=['disabled','transparent','line'];
 set(b,'box-shadow','var(--pf16-hover-shadow,none)');if(kind==='edit'&&b.closest('#tabelaLancamentosWrapper td')&&!b.disabled&&b.getAttribute('aria-disabled')!=='true')scheme=['editOrange',scheme[1],scheme[2]];
 scheme=lightScheme(scheme,kind,active,document.body.classList.contains('dark-mode'),b.disabled||b.getAttribute('aria-disabled')==='true'||kind==='month'&&(b.dataset.hasData==='false'||b.dataset.hasRecords==='false'));
 mark(b,'pf16Action',kind);mark(b,'pf16Active',String(active));for(const node of [b,...b.querySelectorAll('span,strong,small,b,p,label,i')])set(node,'color','var(--pf16-button-hover-ink,var(--pf16-'+scheme[0]+'))');set(b,'background-color','var(--pf16-button-hover-bg,'+(scheme[1]==='transparent'?'transparent':'var(--pf16-'+scheme[1]+')')+')');border(b,scheme[2]);
 // Tirar gradientes legados que encobriam a nova cor sólida, sem alterar tamanho/posição.
 set(b,'background-image','none');
}}
function statuses(){for(const n of document.querySelectorAll('td[data-auto-cell="status"],.status-badge,.status-tag,.badge,.tag,.status,[data-status],.pf-entry-paid,.pf-entry-pending')){
 if(n.matches('tr'))continue;const text=(window.PFI18n?.originalText(n)||n.textContent).trim();if(text.length>55)continue;const kind=statusKind(text);if(!kind)continue;
 const target=n.matches('td')?(n.querySelector('span,button')||n):n;
 const tone={paid:'green',overdue:'red',pending:'amber',received:'accent',receivable:'blue'}[kind];
 tree(target,tone);if(!target.matches('td')){bg(target,tone==='accent'?'cyanBg':tone+'Bg');border(target,tone==='accent'?'cyanLine':tone==='blue'?'border':tone+'Line');}mark(target,'pf16Status',kind);
}}
function chartColors(){
 const dark=document.body.classList.contains('dark-mode'),map=dark?{'#00ff87':'#4ade80','#00de99':'#4ade80','#ff4d6a':'#fb7185','#00e5ff':'#22d3ee','#ffd166':'#fbbf24','#ad8cff':'#c4b5fd'}:{'#00ff87':'#15803d','#00de99':'#15803d','#ff4d6a':'#be123c','#00e5ff':'#0e7490','#ffd166':'#b45309','#ad8cff':'#7c3aed'};
 for(const n of document.querySelectorAll('svg [fill],svg [stroke]'))for(const prop of ['fill','stroke']){const original=n.getAttribute(prop)?.toLowerCase();if(map[original])set(n,prop,map[original]);}
 const colors=dark?['#4ade80','#fb7185','#22d3ee','#60a5fa','#c4b5fd','#fbbf24']:['#15803d','#be123c','#0e7490','#1d4ed8','#7c3aed','#b45309'];
 const ChartClass=typeof Chart!=='undefined'?Chart:window.Chart;
 for(const c of Object.values(ChartClass?.instances||{})){let changed=false;
  (c.data?.datasets||[]).forEach((d,i)=>{const label=fold(window.PFI18n?.canonical(d.label)||d.label),color=/despes|gasto|saida/.test(label)?colors[1]:/receit|renda|entrada/.test(label)?colors[0]:/saldo|resultado/.test(label)?colors[2]:/invest|aporte/.test(label)?colors[3]:colors[i%colors.length];
   const multi=Array.isArray(d.backgroundColor),next=multi?d.backgroundColor.map((_,k)=>colors[k%colors.length]):color;
   if(JSON.stringify(d.borderColor)!==JSON.stringify(multi?next:color)){d.borderColor=multi?next:color;changed=true;}
   const fill=multi?next:((d.type||c.config?.type)==='line'?color+'40':color);if(JSON.stringify(d.backgroundColor)!==JSON.stringify(fill)){d.backgroundColor=fill;changed=true;}
  });if(changed)c.update?.('none');
 }
}
function refresh(){if(running||!document.body)return;running=true;try{surfaces();buttons();statuses();chartColors();window.PFSurfaces34?.refresh();for(const n of touched.keys())if(!n.isConnected)touched.delete(n);}finally{running=false;}}
function cleanClone(copy){window.PFSurfaces34?.cleanClone(copy);for(const n of [copy,...copy.querySelectorAll('*')]){for(const p of ['color','background-color','border-color','background-image','fill','stroke'])if(n.style?.getPropertyValue(p).includes('--pf16-')||n.dataset?.pf16Action||n.dataset?.pf16Status)n.style?.removeProperty(p);for(const k of ['pf16Action','pf16Active','pf16Status','pf16Surface'])if(n.dataset?.[k])delete n.dataset[k];}return copy;}
window.PFProjectTheme={refresh,cleanClone,actionKind,statusKind};
})();

})();