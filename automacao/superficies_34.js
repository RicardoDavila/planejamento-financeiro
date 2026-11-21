/* Etapa 34: decoração de componentes existentes, sem dados ou armazenamento. */
(()=>{'use strict';
const fold=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
function kind(label,value=''){
 const s=fold(label),negative=/[-−]\s*(?:R\$|US\$|[$€])?\s*\d/.test(value);
 if(/%/.test(value))return 'indicator';
 if(/saldo|resultado|balance|net result|superavit/.test(s))return !/[1-9]/.test(value)?'neutral':negative?'expense':'positive';
 if(/receit|recebid|renda|entrada|income|revenue|ingreso/.test(s)&&!/despes|expense|gasto|saida/.test(s))return 'income';
 if(/despes|gasto|custo|saida|expense|egreso|vencid|atrasad|overdue/.test(s))return 'expense';
 if(/taxa|percent|compromet|cobertura|meta|objetivo|invest|aporte|patrimonio|reserva|rate|goal|asset/.test(s)||/%/.test(value))return 'indicator';
 return 'neutral';
}
if(typeof module!=='undefined'&&module.exports)module.exports={kind};
if(typeof document==='undefined')return;
const enabled=()=>typeof matchMedia!=='function'||!matchMedia('(max-width:900px), (pointer:coarse)').matches;
function mark(n,key,v){if(n?.dataset&&n.dataset[key]!==v)n.dataset[key]=v;}
function decorate(card,label,value){if(!card||!value)return;mark(card,'pf34Kind',kind(label,value.textContent));mark(value,'pf34Value','true');mark(value,'pf34FinanceKind',window.PFSemanticPalette?.classify(label)||'other');}
function refresh(){
 if(!enabled())return;
 for(const card of document.querySelectorAll('.pdp-kpi,.pa-metric,.pfgo-metric,.pa-click,.dashboard-v40-card,.g-metric,.fc-card,.desktop-balance-grid>div')){
  const value=card.querySelector('.pdp-value,.val,.value,.number,strong');
  const title=card.querySelector('.pdp-label,.lbl,.label,h3,h4,small,:scope>span');
  const direct=[...card.childNodes].filter(n=>n.nodeType===3).map(n=>window.PFI18n?.originalText(n)||n.textContent).join(' ').trim();
  decorate(card,direct||(window.PFI18n?.originalText(title)||title?.textContent)||'',value);
 }
 const native={pgReceitas:'Receitas',pgRecebido:'Receita recebida',pgDespesas:'Despesas',pgInvestimentos:'Investimentos',pgAVencer:'A vencer',pgVencido:'Vencido',pgSaldo:'Saldo',cardPrevReceita:'Receitas previstas',cardRecRecebidas:'Receita recebida',cardDespesas:'Despesas',cardInvestimento:'Investimentos',cardSaldo:'Saldo',cardPendente:'Pendências'};
 for(const [id,label]of Object.entries(native)){const value=document.getElementById(id);if(value)decorate(value.parentElement,label,value);}
 for(const value of document.querySelectorAll('[data-pf-dark-role="value"],.pa-card>strong,.pa-grid3>div>strong,.pa-row>div>strong,.pdpx-audit article>strong,.pdp-card strong,.pfgo-card strong,.pfge-total strong,.analysis-amount')){
  if(value.closest('table')||value.parentElement?.closest('[data-pf34-kind]'))continue;
  if(!value.matches('[data-pf-dark-role="value"],.analysis-amount')&&!/(?:R\$|US\$|[$€]|\d[\d.,]*\s*%|N\/D|Nao informad|Não informad)/i.test(value.textContent))continue;
  const card=value.parentElement,title=card?.querySelector('.pdp-label,.lbl,.label,.analysis-rubric,h2,h3,h4,small,p');
  const label=value.closest('.analysis-revenue')?'Receitas':value.closest('.analysis-expense')?'Despesas':(window.PFI18n?.originalText(title)||title?.textContent)||'';
  mark(value,'pf34Kind',kind(label,value.textContent));mark(value,'pf34Value','true');mark(value,'pf34FinanceKind',window.PFSemanticPalette?.classify(label)||'other');
 }
}
function cleanClone(copy){for(const n of [copy,...copy.querySelectorAll('[data-pf34-kind],[data-pf34-value],[data-pf34-finance-kind]')]){n.removeAttribute('data-pf34-kind');n.removeAttribute('data-pf34-value');n.removeAttribute('data-pf34-finance-kind');}return copy;}
window.PFSurfaces34={refresh,cleanClone,kind};
})();
