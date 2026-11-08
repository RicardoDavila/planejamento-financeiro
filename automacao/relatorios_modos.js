/* Relatórios: modelos explícitos, duas apresentações e exportação sem código visível. */
(function () {
  'use strict';
  function financialModel(input) {
    input = input || {};
    const validDate = value => /^\d{4}-\d{2}-\d{2}$/.test(String(value || '')) && !Number.isNaN(Date.parse(value + 'T12:00:00Z')) && new Date(value + 'T12:00:00Z').toISOString().slice(0,10) === value;
    const day = (value, n) => { const d = new Date(value + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
    const now = new Date(), today = input.today || now.getFullYear()+'-'+String(now.getMonth()+1).padStart(2,'0')+'-'+String(now.getDate()).padStart(2,'0');
    const rows = Array.isArray(input.rows) ? input.rows.map(t => ({ ...t })) : null;
    const base = Array.isArray(input.base) ? input.base.map(t => ({ ...t })) : rows || [];
    const dates = (rows || []).map(t => t.vencimento).filter(validDate).sort();
    const start = input.start || dates[0] || today, end = input.end || dates.at(-1) || today;
    if (!validDate(today) || !validDate(start) || !validDate(end) || start > end) throw Error('Período inválido para o relatório.');
    const cents = t => { const n = Number(t.valor); if (!Number.isFinite(n)) throw Error('Valor inválido no relatório.'); return Math.round(n * 100); };
    const paid = t => !!t.dataPg || ['Pago', 'Paga', 'Recebido', 'Recebida', 'Liquidado', 'Liquidada', 'feito'].includes(t.status);
    const incoming = t => t.tipo === 'Receita';
    const signed = t => incoming(t) ? cents(t) : -cents(t);
    const sum = (a, f = cents) => a.reduce((n, t) => n + f(t), 0);
    const active = (rows || []).filter(t => ['Receita', 'Despesa', 'Investimentos'].includes(t.tipo));
    const rec = active.filter(incoming), exp = active.filter(t => t.tipo === 'Despesa'), inv = active.filter(t => t.tipo === 'Investimentos');
    const overdue = t => !paid(t) && validDate(t.vencimento) && t.vencimento < today;
    const future = t => !paid(t) && validDate(t.vencimento) && t.vencimento >= today;
    const endHorizon = day(today, 29);
    const upcoming = base.filter(t => ['Receita', 'Despesa', 'Investimentos'].includes(t.tipo) && future(t) && t.vencimento <= endHorizon).sort((a, b) => a.vencimento.localeCompare(b.vencimento) || String(a.descricao).localeCompare(String(b.descricao)));
    const historic = base.filter(t => overdue(t) && t.vencimento < start);
    const available = rows !== null && input.balanceAvailable === true;
    let opening = null, closing = null, current = null, minimum = null, minimumScheduled = null, projection = [], daily = [];
    if (available) {
      opening = sum(base.filter(t => validDate(t.vencimento) && t.vencimento < start), signed);
      let acc = opening;
      const length = Math.round((Date.parse(end + 'T12:00:00Z') - Date.parse(start + 'T12:00:00Z')) / 86400000);
      if (length > 3660) throw Error('Período muito extenso para a trajetória diária.');
      const groups = new Map();
      for (const t of active) if (validDate(t.vencimento) && t.vencimento >= start && t.vencimento <= end) groups.set(t.vencimento, (groups.get(t.vencimento) || 0) + signed(t));
      for (let i = 0; i <= length; i++) { const date = day(start, i); acc += groups.get(date) || 0; daily.push({ date, balance: acc }); }
      closing = acc;
      minimumScheduled = daily.reduce((a, p) => !a || p.balance < a.balance ? p : a, null);
      current = sum(base.filter(t => paid(t) && validDate(t.dataPg || t.vencimento) && (t.dataPg || t.vencimento) <= today), signed);
      let projected = current;
      for (let i = 0; i < 30; i++) { const date = day(today, i); projected += sum(upcoming.filter(t => t.vencimento === date), signed); projection.push({ date, balance: projected }); }
      minimum = projection.reduce((a, p) => !a || p.balance < a.balance ? p : a, null);
    }
    const stats = rows === null ? null : {
      revenue: sum(rec), received: sum(rec.filter(paid)), receivable: sum(rec.filter(t => !paid(t))),
      receivableOnTime: sum(rec.filter(future)), overdueReceivable: sum(rec.filter(overdue)),
      expense: sum(exp), paidExpense: sum(exp.filter(paid)), due: sum(exp.filter(future)), overdueExpense: sum(exp.filter(overdue)),
      investment: sum(inv), result: sum(rec) - sum(exp) - sum(inv),
      pastReceivable: sum(historic.filter(incoming)), pastPayable: sum(historic.filter(t => !incoming(t)))
    };
    const clean = t => ({ id: t.id, descricao: String(t.descricao || 'Sem descrição'), vencimento: String(t.vencimento || ''), valor: cents(t), tipo: t.tipo });
    const payments = upcoming.filter(t => !incoming(t)), receipts = upcoming.filter(incoming);
    const groupUpcoming = a => [...a.reduce((m, t) => { const g = m.get(t.vencimento) || { date: t.vencimento, count: 0, total: 0, names: [] }; g.count++; g.total += cents(t); g.names.push(String(t.descricao || 'Sem descrição')); m.set(t.vencimento, g); return m; }, new Map()).values()];
    return {
      title: String(input.title || 'Relatório financeiro'), kind: String(input.kind || 'gerencial'), start, end, today,
      issued: String(input.issued || new Date().toLocaleString('pt-BR')), filters: String(input.filters || 'Filtros da exportação atual'), scopeNote: String(input.scopeNote || ''), demo: !!input.demo,
      available: rows !== null, balanceAvailable: available, stats, opening, closing, current, minimum, minimumScheduled, daily, projection,
      payments: groupUpcoming(payments).slice(0, 6), morePayments: Math.max(0, groupUpcoming(payments).length - 6),
      receipts: groupUpcoming(receipts).slice(0, 4), moreReceipts: Math.max(0, groupUpcoming(receipts).length - 4),
      top: exp.slice().sort((a, b) => cents(b) - cents(a) || String(a.descricao).localeCompare(String(b.descricao))).slice(0, 5).map(clean), count: active.length,
      undated: active.filter(t => !validDate(t.vencimento)).length,
      futureLabel: today + ' a ' + endHorizon
    };
  }

  function summaryHTML(m) {
    const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const br = s => /^\d{4}-\d{2}-\d{2}$/.test(s || '') ? s.split('-').reverse().join('/') : 'N/D';
    const money = n => n === null || n === undefined ? 'N/D' : (n / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const s = m.stats;
    const section = (key, html) => '<section data-summary="' + key + '">' + html + '</section>';
    const metric = (label, value, cls) => '<div class="pf-s-metric ' + (cls || '') + '"><span>' + esc(label) + '</span><strong>' + esc(money(value)) + '</strong></div>';
    let html = '<article class="pf-summary-page"><header class="pf-s-header"><span class="pf-s-eyebrow">RELATÓRIO RESUMIDO</span><h1>' + esc(m.title) + '</h1><p>' + br(m.start) + ' a ' + br(m.end) + ' · Emissão: ' + esc(m.issued) + '</p><p>Referência: ' + br(m.today) + ' · Critério do período: vencimento</p><p><b>Filtros:</b> ' + esc(m.filters) + '</p>' + (m.scopeNote ? '<p>' + esc(m.scopeNote) + '</p>' : '') + '</header>';
    html += section('indicators', '<h2>Visão geral do período</h2>' + (s ? '<div class="pf-s-metrics">' + metric('Receitas previstas', s.revenue) + metric('Receitas recebidas', s.received, 'positive') + metric('A receber — total em aberto', s.receivable) + metric('Despesas pagas', s.paidExpense) + metric('Despesas a vencer', s.due, 'warning') + metric('Despesas vencidas no período', s.overdueExpense, 'negative') + metric('Despesas totais', s.expense) + metric('Investimentos', s.investment) + metric('Resultado previsto', s.result, 'featured') + '</div><p class="pf-s-note">Resultado = receitas − despesas − investimentos. Estimativa por vencimento; não representa saldo bancário conciliado.</p>' : '<p>Esta exportação não forneceu lançamentos estruturados. Consulte os valores no modo completo; totais não foram inferidos da imagem do gráfico.</p>'));
    html += section('balances', '<h2>Saldos e bases de cálculo</h2>' + (m.balanceAvailable ? '<div class="pf-s-balance"><p><b>Por vencimento, no período:</b> abertura ' + money(m.opening) + ' · final ' + money(m.closing) + '.</p><p>Menor saldo por vencimento: <b>' + money(m.minimumScheduled?.balance) + '</b> em ' + br(m.minimumScheduled?.date) + '.</p><p><b>Próximos 30 dias, a partir do realizado:</b> menor saldo <b>' + money(m.minimum?.balance) + '</b> em ' + br(m.minimum?.date) + '.</p></div><p class="pf-s-note">Bases diferentes, não conciliadas com extrato. A projeção parte dos movimentos liquidados cadastrados até a referência e acrescenta os compromissos em aberto dos próximos 30 dias. Atrasados não são recebimentos presumidos.</p>' : '<p class="pf-s-note">Saldos inicial, final e trajetória: N/D. Este recorte de conteúdo não determina o caixa disponível. Os totais acima se referem somente aos filtros informados.</p>'));
    function upcoming(title, a, extra) {
      return '<h2>' + title + '</h2><p class="pf-s-note">Janela: ' + br(m.today) + ' a ' + br(m.futureLabel.split(' a ')[1]) + '; filtros de conteúdo mantidos.</p>' + (a.length ? '<table><thead><tr><th>Vencimento</th><th>Compromisso</th><th class="num">Valor</th></tr></thead><tbody>' + a.map(g => '<tr><td>' + br(g.date) + '</td><td>' + esc(g.count === 1 ? g.names[0] : g.count + ' lançamentos na data') + '</td><td class="num">' + money(g.total) + '</td></tr>').join('') + '</tbody></table>' : '<p class="pf-s-note">Nenhum compromisso cadastrado nessa janela.</p>') + (extra ? '<p class="pf-s-note">Mais ' + extra + ' data(s) de vencimento: consulte o modo completo.</p>' : '');
    }
    html += '<div class="pf-s-schedule">' + section('payments', upcoming('Próximas contas a pagar', m.payments, m.morePayments));
    html += section('receipts', upcoming('Recebimentos previstos', m.receipts, m.moreReceipts)) + '</div>';
    const alerts = [];
    if (s?.overdueReceivable) alerts.push('Receitas vencidas no período: ' + money(s.overdueReceivable) + '.');
    if (s?.pastReceivable) alerts.push('Receitas atrasadas de períodos anteriores: ' + money(s.pastReceivable) + '.');
    if (s?.pastPayable) alerts.push('Saídas atrasadas de períodos anteriores: ' + money(s.pastPayable) + '.');
    if (m.minimum && m.minimum.balance < 0) alerts.push('Déficit projetado, pela base realizada cadastrada: ' + money(-m.minimum.balance) + ' em ' + br(m.minimum.date) + '. Confirmar disponibilidade e recebimentos.');
    if (m.receipts.length === 1 && m.receipts[0].count > 1) alerts.push('Os próximos recebimentos cadastrados estão concentrados em ' + br(m.receipts[0].date) + '.');
    if (m.undated) alerts.push(m.undated + ' lançamento(s) sem vencimento válido; não incluídos nas trajetórias diárias.');
    html += section('alerts', '<h2>Alertas</h2>' + (alerts.length ? '<ul>' + alerts.map(t => '<li>' + esc(t) + '</li>').join('') + '</ul>' : '<p class="pf-s-note">Nenhum alerta adicional identificado nos dados fornecidos.</p>')) + '</article>';

    function stackChart() {
      if (!s) return '<p>N/D — lançamentos não fornecidos.</p>';
      const series = [[s.received, s.receivableOnTime, s.overdueReceivable], [s.paidExpense, s.due, s.overdueExpense]];
      const lo = Math.min(0, ...series.map(v => v.filter(n => n < 0).reduce((a, n) => a + n, 0))), hi = Math.max(1, ...series.map(v => v.filter(n => n >= 0).reduce((a, n) => a + n, 0)));
      const x = n => 75 + (n - lo) / (hi - lo) * 285, colors = ['#166534', '#92400e', '#b91c1c'];
      let out = '<svg viewBox="0 0 390 150" role="img" aria-label="Receitas e despesas: liquidado, em aberto no prazo e vencido. Valores detalhados na tabela acessível."><line x1="' + x(0) + '" y1="15" x2="' + x(0) + '" y2="120" stroke="#64748b"/>';
      series.forEach((parts, i) => { let pos = 0, neg = 0; out += '<text x="0" y="' + (43 + i * 57) + '" font-size="12">' + ['Receitas', 'Despesas'][i] + '</text>'; parts.forEach((v, k) => { const start = v >= 0 ? pos : neg; if (v >= 0) pos += v; else neg += v; out += '<rect x="' + Math.min(x(start), x(start + v)) + '" y="' + (23 + i * 57) + '" width="' + Math.abs(x(start + v) - x(start)) + '" height="25" fill="' + colors[k] + '"><title>' + esc(money(v)) + '</title></rect>'; }); out += '<text x="75" y="' + (64 + i * 57) + '" font-size="12">Total: ' + esc(money(parts.reduce((a, v) => a + v, 0))) + '</text>'; });
      return out + '</svg><p class="pf-s-legend">Verde: liquidado · Âmbar: em aberto no prazo · Vermelho: vencido</p><details class="pf-s-accessible"><summary>Tabela dos dados do gráfico</summary><table><thead><tr><th>Tipo</th><th>Liquidado</th><th>No prazo</th><th>Vencido</th></tr></thead><tbody>' + series.map((a, i) => '<tr><td>' + ['Receitas', 'Despesas'][i] + '</td>' + a.map(v => '<td>' + money(v) + '</td>').join('') + '</tr>').join('') + '</tbody></table></details>';
    }
    function trajectory() {
      if (!m.balanceAvailable || !m.projection.length) return '<p class="pf-s-note">N/D — o recorte não permite calcular disponibilidade de caixa.</p>';
      const points = m.projection, min = Math.min(0, ...points.map(p => p.balance)), max = Math.max(0, ...points.map(p => p.balance)), span = max - min || 1;
      const x = i => 65 + i / Math.max(1, points.length - 1) * 285, y = n => 125 - (n - min) / span * 100;
      const pointsHTML = points.map((p, i) => x(i) + ',' + y(p.balance)).join(' ');
      return '<svg viewBox="0 0 390 165" role="img" aria-label="Projeção de saldo a partir do realizado cadastrado. Menor saldo ' + esc(money(m.minimum.balance)) + ' em ' + br(m.minimum.date) + '"><text x="1" y="20" font-size="11">' + esc(money(max)) + '</text><text x="1" y="132" font-size="11">' + esc(money(min)) + '</text><line x1="65" y1="' + y(0) + '" x2="350" y2="' + y(0) + '" stroke="#94a3b8" stroke-dasharray="4 4"/><polyline points="' + pointsHTML + '" fill="none" stroke="#1d4ed8" stroke-width="2.5"/><text x="65" y="155" font-size="11">' + br(points[0].date) + '</text><text x="350" y="155" text-anchor="end" font-size="11">' + br(points.at(-1).date) + '</text></svg><p class="pf-s-note">Base realizada; mínimo ' + money(m.minimum.balance) + ' em ' + br(m.minimum.date) + '. Não conciliado.</p>';
    }
    const maxTop = Math.max(1, ...m.top.map(t => Math.abs(t.valor)));
    const topHTML = m.top.length ? m.top.map(t => '<div class="pf-s-top-row"><div><b>' + esc(t.descricao) + '</b><span>' + br(t.vencimento) + '</span></div><div class="pf-s-track"><i style="width:' + Math.abs(t.valor) / maxTop * 100 + '%"></i></div><strong>' + money(t.valor) + '</strong></div>').join('') : '<p class="pf-s-note">Nenhuma despesa no recorte.</p>';
    html += '<article class="pf-summary-page pf-summary-charts"><header class="pf-s-header"><h2>Gráficos do resumo</h2><p>' + br(m.start) + ' a ' + br(m.end) + ' · ' + esc(m.filters) + '</p></header><div class="pf-s-chart-grid">' + section('comparisonChart', '<h3>Receitas × despesas</h3>' + stackChart()) + section('balanceChart', '<h3>Trajetória dos próximos 30 dias</h3>' + trajectory()) + section('topChart', '<h3>Os cinco maiores lançamentos de despesa</h3><p class="pf-s-note">Lançamentos individuais do período; não agrupa categorias.</p>' + topHTML) + '</div><p class="pf-s-note">Valores e gráficos usam a mesma fotografia dos dados. Conteúdo detalhado disponível no modo completo.</p></article>';
    return html;
  }

  function installReportSelection(prepared) {
    function start() {
      if (document.getElementById('pf-report-selection')) return;
      document.body.removeAttribute('onload');
      const content = document.createElement('div'); content.id = 'pf-report-content';
      [...document.body.childNodes].forEach(node => content.append(node)); document.body.append(content);
      // Scripts já executados não pertencem ao documento que será impresso.
      content.querySelectorAll('script,noscript').forEach(node => node.remove());
      content.querySelectorAll('button').forEach(button => { if (/print\(|imprimir|salvar.*pdf/i.test(button.getAttribute('onclick') || button.textContent)) button.remove(); });
      const summary = document.createElement('main'); summary.id = 'pf-report-summary'; summary.innerHTML = prepared.html; document.body.append(summary);
      const items = [], occurrences = new Map();
      function add(label, nodes, kind) { label = label.trim().replace(/\s+/g, ' '); const key = kind + ':' + label, count = occurrences.get(key) || 0; occurrences.set(key, count + 1); items.push({ label, nodes, kind, key: key + ':' + count, checked: true }); }
      [...content.querySelectorAll('h2,h3')].reverse().forEach(heading => { if (heading.closest('table')) return; const section = document.createElement('div'); heading.before(section); const level = Number(heading.tagName.slice(1)); let node = heading; while (node) { if (node !== heading && (/^H[123]$/.test(node.nodeName) || node.dataset?.pfHeading) && Number(node.dataset?.pfHeading || node.nodeName.slice(1)) <= level) break; const next = node.nextSibling; section.append(node); node = next; } section.dataset.pfHeading = level; });
      content.querySelectorAll('[data-pf-heading],.kpi,.grafico,.bloco,.resumo,.grafico-print-bloco,.pf-chart-card').forEach(node => { const label = node.querySelector('h2,h3,h4,.rotulo,.grafico-titulo,.bloco-titulo')?.textContent; if (label) add(label, [node], 'Conteúdo'); });
      content.querySelectorAll('table').forEach((table, index) => { const title = table.closest('[data-pf-heading],.bloco')?.querySelector('h2,h3,.bloco-titulo')?.textContent || 'Tabela ' + (index + 1); add(title, [table.closest('.bloco,.tablewrap') || table], 'Tabela'); [...(table.tHead?.rows[0]?.cells || [])].forEach((header, column) => { if (header.colSpan !== 1) return; const cells = [...table.rows].flatMap(row => { let offset = 0; return [...row.cells].filter(cell => { const match = offset === column && cell.colSpan === 1; offset += cell.colSpan; return match; }); }); add(title + ' — ' + header.textContent, cells, 'Campo'); }); });
      content.querySelectorAll('.meta,.rodape').forEach(node => add(node.classList.contains('meta') ? 'Dados de emissão' : 'Rodapé', [node], 'Campo'));
      if (!items.length) add('Conteúdo do relatório', [...content.children], 'Conteúdo');
      const panel = document.createElement('section'); panel.id = 'pf-report-selection';
      panel.innerHTML = '<h2>Como deseja gerar o relatório?</h2><p>Escolha o modo antes de personalizar o conteúdo. Os dois modos usam os mesmos dados e filtros desta exportação.</p><div class="pf-mode-actions" role="group" aria-label="Modo do relatório"><button type="button" data-mode="summary" aria-pressed="true">Relatório resumido</button><button type="button" data-mode="full" aria-pressed="false">Relatório completo</button></div><details id="pf-summary-custom"><summary>Personalizar resumo</summary><div class="pf-options" id="pf-summary-options"></div></details><div id="pf-full-custom" hidden><h3>Incluir no relatório completo</h3><div class="pf-actions"><button type="button" data-all="1">Selecionar tudo</button><button type="button" data-all="0">Desmarcar tudo</button></div><div class="pf-options" id="pf-full-options"></div></div><div class="pf-page-controls"><label>Papel <select id="pf-paper"><option>A4</option></select></label><label>Orientação <select id="pf-orientation"><option value="portrait">Retrato</option><option value="landscape">Paisagem</option></select></label><label>Margem <select id="pf-margin"><option value="12">12 mm</option><option value="16">16 mm</option><option value="20">20 mm</option></select></label></div><label class="pf-option"><input type="checkbox" id="pf-remember"> Salvar preferências deste modo para este relatório</label><div class="pf-actions"><button type="button" id="pf-preview">Pré-visualizar</button><button type="button" id="pf-pdf" disabled>Gerar PDF</button><button type="button" id="pf-print" disabled>Imprimir</button></div><p role="status" aria-live="polite" id="pf-status"></p>';
      document.body.prepend(panel);
      const style = document.createElement('style'); style.textContent = prepared.css; document.head.append(style);
      const pageStyle = document.createElement('style'); document.head.append(pageStyle);
      const status = panel.querySelector('#pf-status'), remember = panel.querySelector('#pf-remember');
      const summaryLabels = { indicators: 'Visão geral', balances: 'Saldos e bases', payments: 'Próximas contas a pagar', receipts: 'Recebimentos previstos', alerts: 'Alertas', comparisonChart: 'Gráfico Receitas × despesas', balanceChart: 'Gráfico de saldo projetado', topChart: 'Cinco maiores despesas' };
      const summaryItems = [...summary.querySelectorAll('[data-summary]')].map(node => ({ key: node.dataset.summary, label: summaryLabels[node.dataset.summary], nodes: [node], checked: true }));
      function choices(list, target) { list.forEach(item => { const label = document.createElement('label'); label.className = 'pf-option'; const input = document.createElement('input'); input.type = 'checkbox'; input.checked = true; label.append(input, document.createTextNode((item.kind ? item.kind + ': ' : '') + item.label)); target.append(label); item.input = input; input.onchange = () => { item.checked = input.checked; update(false); }; }); }
      choices(items, panel.querySelector('#pf-full-options')); choices(summaryItems, panel.querySelector('#pf-summary-options'));
      let mode = 'summary';
      let preferenceStorage; try { if (!prepared.model.demo) preferenceStorage = (window.opener || window).PFReportPreferences?.(); } catch (_) {}
      const key = () => 'pf-report-selection-v2:' + document.title + ':' + mode;
      function save() { if (!preferenceStorage) return; try { if (remember.checked) preferenceStorage.setItem(key(), JSON.stringify(Object.fromEntries((mode === 'summary' ? summaryItems : items).map(item => [item.key, item.checked])))); else preferenceStorage.removeItem(key()); } catch (_) { status.textContent += ' Preferências não puderam ser salvas.'; } }
      function restore() { remember.checked = false; try { const saved = JSON.parse(preferenceStorage?.getItem(key()) || 'null'); if (saved) { remember.checked = true; (mode === 'summary' ? summaryItems : items).forEach(item => item.input.checked = item.checked = saved[item.key] !== false); } } catch (_) {} }
      function update(preview) {
        content.querySelectorAll('.pf-report-excluded').forEach(n => n.classList.remove('pf-report-excluded'));
        items.filter(i => !i.checked).forEach(i => i.nodes.forEach(n => n.classList.add('pf-report-excluded')));
        summaryItems.forEach(i => i.nodes.forEach(n => n.hidden = !i.checked));
        const any = mode === 'summary' ? summaryItems.some(i => i.checked) : items.some(i => i.checked && i.kind !== 'Campo' && i.nodes.some(n => !n.closest('.pf-report-excluded')));
        content.hidden = !preview || mode !== 'full' || !any; summary.hidden = !preview || mode !== 'summary' || !any;
        summary.querySelector('.pf-summary-charts').hidden = !summaryItems.some(i => /Chart$/.test(i.key) && i.checked);
        document.body.dataset.pfReportMode = mode;
        pageStyle.textContent = '@page{size:A4 ' + panel.querySelector('#pf-orientation').value + ';margin:' + panel.querySelector('#pf-margin').value + 'mm}';
        panel.querySelector('#pf-pdf').disabled = panel.querySelector('#pf-print').disabled = !preview || !any;
        status.textContent = !any ? 'Selecione ao menos um conteúdo.' : preview ? (mode === 'summary' ? 'Resumo preparado. Duas páginas são a meta com a configuração padrão; confirme na prévia de impressão.' : 'Relatório completo preparado com as seleções atuais.') + ' Gerar PDF abre a impressão do Chrome: escolha Salvar como PDF. Confira papel, orientação e margens na janela do navegador.' : 'Clique em Pré-visualizar para conferir o modo escolhido.';
        save();
      }
      panel.querySelectorAll('[data-mode]').forEach(button => button.onclick = () => { save(); mode = button.dataset.mode; panel.querySelectorAll('[data-mode]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.mode === mode))); panel.querySelector('#pf-full-custom').hidden = mode !== 'full'; panel.querySelector('#pf-summary-custom').hidden = mode !== 'summary'; panel.querySelector('#pf-orientation').value = mode === 'summary' ? 'portrait' : 'landscape'; restore(); update(false); });
      panel.querySelectorAll('[data-all]').forEach(button => button.onclick = () => { items.forEach(i => i.input.checked = i.checked = button.dataset.all === '1'); update(false); });
      panel.querySelectorAll('select').forEach(select => select.onchange = () => update(false));
      remember.onchange = () => update(false);
      panel.querySelector('#pf-preview').onclick = () => update(true);
      let images = [];
      function freezeCanvases() { const target = mode === 'summary' ? summary : content; target.querySelectorAll('canvas').forEach(canvas => { try { const image = document.createElement('img'); image.src = canvas.toDataURL('image/png'); image.style.cssText = 'max-width:100%;height:auto'; image.alt = canvas.getAttribute('aria-label') || 'Gráfico do relatório'; canvas.replaceWith(image); images.push([canvas, image]); } catch (_) { status.textContent = 'Um gráfico não pôde ser convertido. Confira sua prévia antes de salvar.'; } }); }
      window.addEventListener('beforeprint', () => { update(true); freezeCanvases(); });
      window.addEventListener('afterprint', () => { images.forEach(([canvas, image]) => image.replaceWith(canvas)); images = []; });
      panel.querySelector('#pf-pdf').onclick = panel.querySelector('#pf-print').onclick = () => { update(true); window.print(); };
      window.PFReportPreview = { model: prepared.model, mode: () => mode };
      restore(); update(false);
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true }); else start();
  }

  const css = `
html body #pf-report-content[hidden],html body #pf-report-summary[hidden],html body #pf-report-selection [hidden],html body #pf-report-summary [hidden],html body .pf-report-excluded{display:none!important}#pf-report-summary .pf-s-schedule{display:grid;grid-template-columns:1fr 1fr;gap:16px}#pf-report-summary .pf-s-schedule section{min-width:0}@media screen and (max-width:650px){#pf-report-summary .pf-s-schedule{grid-template-columns:1fr}}@media print{#pf-report-summary .pf-s-schedule{grid-template-columns:1fr 1fr}#pf-report-summary .pf-s-schedule th,#pf-report-summary .pf-s-schedule td{padding:4px;font-size:11px}}
html body #pf-report-selection{box-sizing:border-box;max-width:1000px;margin:16px auto;padding:22px;background:#fff;color:#17212b;border:1px solid #94a3b8;border-radius:12px;font:14px/1.5 Arial,sans-serif}#pf-report-selection h2{font-size:22px;margin:0 0 8px}#pf-report-selection h3{font-size:16px}#pf-report-selection button,#pf-report-selection select{font:inherit;min-height:42px;padding:9px 13px;border:1px solid #64748b;border-radius:7px;background:#fff;color:#17212b;cursor:pointer}#pf-report-selection button[aria-pressed=true]{background:#203c64;color:white;border-color:#203c64}#pf-report-selection button:disabled{opacity:.5;cursor:default}#pf-report-selection :focus-visible{outline:3px solid #1d4ed8;outline-offset:2px}.pf-mode-actions,.pf-actions,.pf-page-controls{display:flex;gap:10px;flex-wrap:wrap;margin:14px 0}.pf-page-controls label{display:flex;align-items:center;gap:6px}.pf-options{display:grid;grid-template-columns:1fr 1fr;gap:5px;max-height:45vh;overflow:auto;margin:12px 0}.pf-option{display:flex;align-items:center;gap:9px;min-height:40px;padding:5px;cursor:pointer;overflow-wrap:anywhere}.pf-option input{width:19px;height:19px;flex-shrink:0}#pf-summary-custom>summary{cursor:pointer;padding:10px 0;font-weight:600}html body .pf-report-excluded{display:none!important}html body #pf-report-summary[hidden],html body #pf-report-content[hidden],#pf-report-selection [hidden],#pf-report-summary [hidden]{display:none!important}
html body #pf-report-summary{box-sizing:border-box;max-width:820px;margin:18px auto;background:#fff;color:#17212b;font:13px/1.45 Arial,sans-serif;padding:0}#pf-report-summary .pf-summary-page{box-sizing:border-box;padding:24px;background:#fff;margin:0 0 20px;border:1px solid #cbd5e1;box-shadow:0 3px 12px #17212b0a}#pf-report-summary .pf-s-header{position:static!important;display:block!important;padding:0 0 12px!important;margin:0 0 14px!important;background:white!important;color:#17212b!important;border-bottom:2px solid #203c64}#pf-report-summary h1{font-size:23px;line-height:1.25;margin:5px 0 8px}#pf-report-summary h2{font-size:16px;line-height:1.35;margin:14px 0 7px;color:#203c64}#pf-report-summary h3{font-size:15px;margin:0 0 9px}#pf-report-summary p{margin:5px 0}#pf-report-summary .pf-s-eyebrow{font-size:11px;font-weight:700;letter-spacing:.8px;color:#526176}#pf-report-summary .pf-s-metrics{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}#pf-report-summary .pf-s-metric{padding:10px 12px;border:1px solid #cbd5e1;border-radius:7px;min-width:0}#pf-report-summary .pf-s-metric span{display:block;font-size:11px;color:#526176}#pf-report-summary .pf-s-metric strong{display:block;margin-top:5px;font-size:20px;line-height:1.2;font-variant-numeric:tabular-nums}#pf-report-summary .positive strong{color:#166534}#pf-report-summary .warning strong{color:#92400e}#pf-report-summary .negative strong{color:#b91c1c}#pf-report-summary .featured{background:#eff6ff;border-color:#1d4ed8}#pf-report-summary .pf-s-note{font-size:11px;color:#526176;line-height:1.5}#pf-report-summary .pf-s-balance{padding:8px 12px;background:#f3f5f7;border:1px solid #dbe2ea;border-radius:7px}#pf-report-summary table{width:100%;min-width:0;border-collapse:collapse;font-size:12px;table-layout:auto}#pf-report-summary th{background:#eef2f6;color:#17212b}#pf-report-summary th,#pf-report-summary td{padding:6px 8px;border-bottom:1px solid #dbe2ea;text-align:left}#pf-report-summary .num{text-align:right;white-space:nowrap}#pf-report-summary ul{padding-left:18px;margin:6px 0}#pf-report-summary li{margin:3px 0;font-size:12px}#pf-report-summary .pf-s-chart-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}#pf-report-summary [data-summary=topChart]{grid-column:1/-1}#pf-report-summary .pf-s-chart-grid section{min-width:0;border:1px solid #cbd5e1;border-radius:8px;padding:12px}#pf-report-summary svg{display:block;width:100%;height:auto;color:#17212b}#pf-report-summary svg text{fill:#17212b;font-family:Arial,sans-serif}#pf-report-summary .pf-s-legend{font-size:11px;color:#526176}#pf-report-summary .pf-s-accessible{font-size:11px;margin-top:8px}#pf-report-summary .pf-s-top-row{display:grid;grid-template-columns:minmax(120px,1.4fr) minmax(70px,1fr) auto;gap:10px;align-items:center;margin:12px 0;font-size:12px}#pf-report-summary .pf-s-top-row span{display:block;font-size:11px;color:#526176}#pf-report-summary .pf-s-track{display:block;height:12px;background:#eef2f6;border-radius:4px;overflow:hidden}#pf-report-summary .pf-s-track i{display:block;height:100%;background:#b91c1c}#pf-report-summary .pf-s-top-row strong{white-space:nowrap}html body #pf-report-content script{display:none!important}
@media(max-width:650px){.pf-options{grid-template-columns:1fr}#pf-report-selection{margin:8px!important;padding:14px!important}#pf-report-summary .pf-summary-page{padding:16px}#pf-report-summary .pf-s-metrics{grid-template-columns:1fr 1fr}#pf-report-summary .pf-s-chart-grid{grid-template-columns:1fr}#pf-report-summary .pf-s-metric strong{font-size:18px}}
@media print{html body #pf-report-selection{display:none!important}html body #pf-report-summary{max-width:none!important;margin:0!important;font-size:10pt!important}html body #pf-report-summary .pf-summary-page{margin:0!important;padding:0!important;border:0!important;box-shadow:none!important;break-before:auto;break-after:auto}html body #pf-report-summary .pf-summary-charts{break-before:page!important}#pf-report-summary h1{font-size:18pt}#pf-report-summary h2{font-size:12pt;break-after:avoid}#pf-report-summary .pf-s-metric strong{font-size:15pt}#pf-report-summary .pf-s-metrics{grid-template-columns:repeat(3,minmax(0,1fr))}#pf-report-summary .pf-s-chart-grid{grid-template-columns:1fr 1fr}#pf-report-summary .pf-s-chart-grid section{break-inside:avoid}#pf-report-summary .pf-s-accessible{display:none}#pf-report-summary section{break-inside:auto}html body[data-pf-report-mode=summary] #pf-report-content,html body[data-pf-report-mode=full] #pf-report-summary{display:none!important}body{print-color-adjust:exact;-webkit-print-color-adjust:exact}}
`;
  function appContext(overrides) {
    overrides = overrides || {};
    const get = id => typeof document !== 'undefined' ? document.getElementById(id)?.value || '' : '';
    let rows, base;
    try { if (typeof getFilteredTransactions === 'function') { rows = getFilteredTransactions(); base = getFilteredTransactions({ ignorarPeriodo: true, ignorarAtrasados: true }); } } catch (_) {}
    const filtered = [['filtroTipo', ['', 'Todos']], ['filtroRubrica', ['', 'Todas']], ['filtroSubItem', ['', 'Todos']], ['desktop-person', ['', 'Todas']]].some(([key, all]) => !all.includes(get(key))) || !!get('filtroDescricao') || !!get('filtroBuscaRubrica') || !!get('filtroBuscaSubItem');
    let quick = false; try { quick = !!window.PFQuickCards?.status?.().active; } catch (_) {}
    const desktop = window.PFDesktopApproved?.reportContext?.() || {};
    const dateField = id => /^\d{4}-\d{2}-\d{2}$/.test(get(id)) ? get(id) : undefined;
    const result = { rows, base, start: dateField('filtroDataInicio'), end: dateField('filtroDataFim'), today: typeof obterDataLocalISO === 'function' ? obterDataLocalISO() : undefined, filters: typeof window.PFCashFlow?.filters === 'function' ? window.PFCashFlow.filters() : 'Filtros atuais', balanceAvailable: !filtered && !quick, ...desktop, ...overrides };
    if (typeof result.filters !== 'string') result.filters = String(result.filters);
    return result;
  }
  const safeJSON = value => JSON.stringify(value).replace(/</g, () => String.fromCharCode(92) + 'u003c').replace(/\u2028/g, () => String.fromCharCode(92) + 'u2028').replace(/\u2029/g, () => String.fromCharCode(92) + 'u2029');
  function prepare(context) { const model = financialModel(context); return { model, html: summaryHTML(model), css }; }
  function scriptText(prepared) { return '(' + installReportSelection.toString() + ')(' + safeJSON(prepared) + ');'; }
  let pending = null;
  const api = {
    model: financialModel, summaryHTML, prepare, css, context: appContext,
    setContext(context) { pending = context; },
    decorate(html, context) {
      if (html.includes('id="pf-report-selection-bootstrap"')) return html;
      html = html.replace(/ onload="setTimeout\(function\(\)\{window.focus\(\);window.print\(\);\},350\)"/g, '');
      const prepared = prepare(context || pending || appContext()); pending = null;
      const script = '<script id="pf-report-selection-bootstrap">' + scriptText(prepared).replace(/<\/script/gi, '<\\/script') + '<' + '/script>';
      const point = html.toLowerCase().lastIndexOf('</body>');
      return point < 0 ? html + script : html.slice(0, point) + script + html.slice(point);
    },
    install(target, context) {
      const prepared = prepare(context || target.pfReportSnapshot || pending || appContext()); pending = null;
      target.eval(scriptText(prepared));
    }
  };
  window.PFReportSelection = api;
})();
