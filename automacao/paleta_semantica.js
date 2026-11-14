/* pf-desktop-only-v511 */
(function(){if(typeof matchMedia==='function'&&matchMedia('(max-width:900px), (pointer:coarse)').matches)return;
/* Etapa 13: apresentação semântica. Lê somente rótulos/valores já exibidos no DOM. */
(()=>{'use strict';
const palette={income:'#00de99',expense:'#ff4d6a',investment:'#57b6ff',overdue:'#ff4d6a',today:'#ffd166',upcoming:'#57b6ff',other:'#b49aff',title:'#ffffff',description:'#00e5ff',table:'#ffffff',header:'#00e5ff'};
const fold=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
function classify(label){const s=fold(label);if(/vencid|atrasad|overdue/.test(s))return 'overdue';if(/\bhoje\b|due today/.test(s))return 'today';if(/a vencer|a receber|proxim[oa]|upcoming/.test(s))return 'upcoming';if(/^(saldo|resultado|patrimonio|reserva|cobertura|meta|taxa|comprometimento|economia|objetivo|ativo)/.test(s.trim()))return 'other';if(/invest|aporte|aplicac|carteira|simulador.*poupanca|valor futuro/.test(s))return 'investment';const income=/receit|recebid|renda|recebive|entrada|revenue|income/.test(s),expense=/despes|gasto|custo|consumo|saida|orcamento|expense/.test(s);return income&&!expense?'income':expense&&!income?'expense':'other';}
function displayDate(v){const s=String(v||'').trim();if(/^\d{4}-\d{2}-\d{2}$/.test(s))return s;const m=s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);return m?m[3]+'-'+m[2]+'-'+m[1]:null;}
function statusKind(status,due,today){const s=fold(status);if(/vencid|atrasad|overdue/.test(s))return 'overdue';if(/hoje|due today/.test(s))return 'today';if(/a vencer|a receber|pendente|nao recebid|pending|unpaid/.test(s)){const d=displayDate(due);return d&&d===today?'today':d&&d<today?'overdue':d&&d>today?'upcoming':/a vencer|a receber/.test(s)?'upcoming':'other';}return /recebid|received/.test(s)?'income':'other';}
const originals=new Map(),desired=new Map();let active=false;
function applyPaint(node,role,tone){if(!node?.style)return;const hex=palette[tone||role]||palette.other,rgb='rgb('+hex.slice(1).match(/../g).map(v=>parseInt(v,16)).join(', ')+')';if(!originals.has(node))originals.set(node,{value:node.style.getPropertyValue('color'),priority:node.style.getPropertyPriority('color')});if(node.style.getPropertyValue('color')!==rgb||node.style.getPropertyPriority('color')!=='important')node.style.setProperty('color',rgb,'important');if(node.dataset){if(node.dataset.pfDarkRole!==role)node.dataset.pfDarkRole=role;if(tone&&node.dataset.pfFinanceKind!==tone)node.dataset.pfFinanceKind=tone;}}
function paint(node,role,tone){if(node?.style)desired.set(node,{role,tone});}
function tree(node,role,tone){paint(node,role,tone);for(const child of node?.querySelectorAll?.('span,strong,small,b,p,label,i,button,a')||[])paint(child,role,tone);}
function beforeRefresh(dark){if(dark){active=true;return;}if(!active)return;for(const [node,old]of originals){if(old.value)node.style.setProperty('color',old.value,old.priority);else node.style.removeProperty('color');}originals.clear();active=false;}
function owns(button){return Boolean(button.closest?.('table th,table td,.pdp-kpi,.pa-metric,.pfgo-metric,.pa-click,.dashboard-v40-card,.pf-area-card'));}
function titleOf(card){return card?.querySelector('.pdp-label,.lbl,.label,h2,h3,h4,small,summary')?.textContent||'';}
function directLabel(card){return [...(card?.childNodes||[])].filter(n=>n.nodeType===3).map(n=>n.textContent).join(' ').trim();}
function contextLabel(node){const card=node.closest('.pa-metric,.pdp-kpi,.pfgo-metric,.pa-click,.dashboard-v40-card,.g-metric,.fc-card');if(card)return directLabel(card)||titleOf(card);const section=node.closest('[data-pa-section],[data-go-section],.pdpx-section,.pdp-card,section,.panel');return section?.querySelector('.pa-section-head h2,.pfgo-section,h2,h3,summary,.pdp-label')?.textContent||'';}
function metric(card,titleSel,valueSel,descSel,kind){const title=card.querySelector(titleSel),label=title?.textContent||titleOf(card),tone=kind||classify(label);for(const n of card.querySelectorAll(titleSel))tree(n,'title');for(const n of card.querySelectorAll(descSel))if(!n.closest('button:not(.pa-metric):not(.pfgo-metric),form'))tree(n,'description');for(const n of card.querySelectorAll(valueSel))tree(n,'value',tone);}
function cards(){
 for(const card of document.querySelectorAll('.pf-area-card')){tree(card.querySelector('strong'),'title');tree(card.querySelector('.pf-area-description'),'description');}
 for(const card of document.querySelectorAll('.pdp-kpi'))metric(card,'.pdp-label','.pdp-value','.pdp-note');
 for(const card of document.querySelectorAll('.pa-metric'))metric(card,':scope>span',':scope>strong',':scope>small');
 for(const card of document.querySelectorAll('.pfgo-metric'))metric(card,':scope>small',':scope>strong',':scope>span',card.closest('[data-go-section="recurring"]')?'expense':undefined);
 for(const card of document.querySelectorAll('.pa-click'))metric(card,'h3','strong','p');
 for(const card of document.querySelectorAll('.dashboard-v40-card'))metric(card,'.lbl','.val','.note,small,p');
 for(const card of document.querySelectorAll('.g-metric'))metric(card,'.label,.lbl,h3,h4','.number,.value','.note,small,p');
 const native={pgReceitas:'income',pgRecebido:'income',pgDespesas:'expense',pgInvestimentos:'investment',pgAVencer:'upcoming',pgVencido:'overdue',pgSaldo:'other',cardPrevReceita:'income',cardRecRecebidas:'income',cardDespesas:'expense',cardInvestimento:'investment',cardSaldo:'other',cardPendente:'other'};
 for(const [id,kind]of Object.entries(native)){const value=document.getElementById(id);if(!value)continue;const card=value.parentElement;for(const label of card.querySelectorAll(':scope>p:not([id]),:scope>.lbl,:scope>.label'))tree(label,'title');tree(value,'value',kind);}
 for(const node of document.querySelectorAll('.pdp-card h2,.pdp-card h3,.pdp-card h4,.pa-card h2,.pa-card h3,.pfgo-card h2,.pfgo-card h3,.pdpx-audit article h4,.fc-card h3'))tree(node,'title');
 for(const node of document.querySelectorAll('.pdp-card .pdp-note,.pa-card .pa-note,.pfgo-card .pfgo-note,.fc-card small,.pdpx-audit article p'))if(!node.closest('table'))tree(node,'description');
 for(const value of document.querySelectorAll('#pfAnalysisPage .pa-grid3>div>strong,#pfAnalysisPage .pa-row>div>strong,.pdpx-audit article>strong,.fc-card>strong,.desktop-balance-grid strong')){const card=value.parentElement,label=card.querySelector('small,.pdp-label,h3,h4,p')||value.previousElementSibling;if(label&&label!==value)tree(label,'title');if(card.matches('.fc-card'))paint(card,'title');tree(value,'value',classify(directLabel(card)||label?.textContent||''));}
 for(const card of document.querySelectorAll('#pa-goals .pa-card')){const value=card.querySelector(':scope>strong');if(value){tree(value,'value','other');for(const p of card.querySelectorAll(':scope>p,:scope>small'))tree(p,'description');}}
 for(const value of document.querySelectorAll('.pdp-card .pdp-value:not(.pdp-kpi .pdp-value),.pfge-total strong,.analysis-amount')){const section=value.closest('[data-go-section],section,article,details');tree(value,'value',value.closest('.analysis-revenue')?'income':value.closest('.analysis-expense')?'expense':classify(section?.querySelector('h2,h3,.pdp-label')?.textContent||''));}
 for(const node of document.querySelectorAll('.pa-card>p,.pa-card>small,.pfgo-card>p,.pdp-card>p:not(.pdp-value)'))if(!node.closest('table'))tree(node,'description');
 for(const value of document.querySelectorAll('.pa-card strong,.pdp-card strong,.pfgo-card strong,.fc-card strong'))if(!value.closest('table')&&desired.get(value)?.role!=='value'&&/R\$|\d[\d.,]*\s*%|^\s*(Nao informado|Não informado|N\/D)\s*$/i.test(value.textContent))tree(value,'value',classify(contextLabel(value)));
 for(const card of document.querySelectorAll('.pfgo-week>button')){tree(card.querySelector('span'),'title');tree(card.querySelector('strong'),'value','expense');tree(card.querySelector('small'),'description');}
}
function tables(){const today=typeof obterDataLocalISO==='function'?obterDataLocalISO():new Date().toLocaleDateString('en-CA');for(const table of document.querySelectorAll('table')){
 const headings=[...(table.tHead?.rows[0]?.cells||[])].map(c=>fold(c.textContent));
 for(const row of table.tHead?.rows||[])for(const cell of row.cells)tree(cell,'header');
 for(const body of [...table.tBodies,...(table.tFoot?[table.tFoot]:[])])for(const row of body.rows){const cells=[...row.cells],typeCell=cells.find(c=>c.dataset.autoCell==='tipo')||cells.find((c,i)=>/^(tipo|type)\b/.test(headings[i]||'')),dueCell=cells.find(c=>c.dataset.autoCell==='vencimento')||cells.find((c,i)=>/vencimento|dt vcto/.test(headings[i]||'')),rowKind=classify(typeCell?.textContent||''),contextKind=classify(contextLabel(table));
 for(let i=0;i<cells.length;i++){const cell=cells[i],header=headings[i]||'',field=cell.dataset.autoCell,text=cell.textContent.trim();tree(cell,'table');
  if(field==='status'||/^(status|situacao)\b/.test(header)){const kind=statusKind(text,dueCell?.textContent,today);tree(cell,'value',kind);if(cell.dataset.pfEntryTone)cell.dataset.pfEntryTone=kind==='overdue'?'overdue':kind==='today'?'today':kind==='upcoming'?'upcoming':kind==='income'?'paid':'neutral';}
  else if(/R\$/.test(text)||field==='valor'||/^(valor|receitas?|despesas?|aportes?|investimentos?|saldo|resultado|total|juros)\b/.test(header)&&/\d/.test(text)){const kind=classify(header);tree(cell,'value',kind==='other'?(rowKind!=='other'?rowKind:contextKind):kind);}
 }
 }
}}
function refresh(dark){if(!dark)return;desired.clear();cards();tables();for(const [node,style]of desired)applyPaint(node,style.role,style.tone);for(const node of originals.keys())if(!node.isConnected)originals.delete(node);}
function cleanClone(copy){window.PFProjectTheme?.cleanClone(copy);for(const n of [copy,...copy.querySelectorAll('[data-pf-dark-role]')])if(n.dataset?.pfDarkRole){n.style.removeProperty('color');n.removeAttribute('data-pf-dark-role');n.removeAttribute('data-pf-finance-kind');}return copy;}
function printHTML(node){return cleanClone(node.cloneNode(true)).outerHTML;}
window.PFSemanticPalette={palette,classify,statusKind,displayDate,beforeRefresh,owns,refresh,cleanClone,printHTML};
})();

})();