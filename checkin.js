const CHECKIN_STORE_KEY = 'obraflow_daily_work_reports_v1';
const CHECKIN_TABLE = 'daily_work_reports';
const CHECKIN_STATUS = ['Concluído', 'Parcial', 'Não iniciado', 'Extra (não programada)', 'Suspenso'];
const CHECKIN_PROBLEMS = [
  ['01', 'Frente não liberada'],
  ['02', 'Falta de material'],
  ['03', 'Falta / revisão de projeto'],
  ['04', 'Interferência com outra disciplina'],
  ['05', 'Clima / chuva'],
  ['06', 'Falta de mão de obra'],
  ['07', 'Equipamento / ferramenta / PTA'],
  ['08', 'Segurança / paralisação'],
  ['OUTRO', 'Outro motivo']
];

let checkinReports = checkinLoadLocal();
let checkinLoadedRemote = false;
let checkinActiveTab = 'diario';
let checkinSelectedDate = checkinToday();
let checkinEngineerFilter = '';
let checkinDhFilter = '';
let checkinPlanStart = checkinToday();
let checkinPlanEnd = checkinDateOffset(checkinToday(), 6);
let checkinCurveStart = checkinDateOffset(checkinToday(), -29);
let checkinCurveEnd = checkinToday();
let checkinCurveEngineer = '';
let checkinCurveDh = '';

function checkinToday() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function checkinDateOffset(date, offset) {
  const value = new Date(`${date}T12:00:00`);
  value.setDate(value.getDate() + offset);
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`;
}

function checkinFormatDate(value) {
  if (!value) return '—';
  const date = new Date(`${String(value).slice(0, 10)}T12:00:00`);
  return Number.isNaN(date.getTime()) ? '—' : new Intl.DateTimeFormat('pt-BR').format(date);
}

function checkinFormatTime(value) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(new Date(value));
}

function checkinSlug(value) {
  return String(value || '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'sem-nome';
}

function checkinReportId(date, dh, engineer) {
  return `daily-${date}-${checkinSlug(dh)}-${checkinSlug(engineer)}`;
}

function checkinLoadLocal() {
  try {
    const saved = JSON.parse(localStorage.getItem(CHECKIN_STORE_KEY) || '[]');
    return Array.isArray(saved) ? saved : [];
  } catch (error) {
    console.warn('Cópia local do check-in inválida:', error);
    return [];
  }
}

function checkinSaveLocal() {
  try { localStorage.setItem(CHECKIN_STORE_KEY, JSON.stringify(checkinReports)); }
  catch (error) { console.warn('Não foi possível salvar o check-in neste aparelho:', error); }
}

function checkinFromRow(row) {
  const data = row?.data && typeof row.data === 'object' ? row.data : {};
  return {
    ...data,
    id: String(row?.id || data.id || ''),
    workDate: String(row?.work_date || data.workDate || ''),
    dh: String(row?.dh || data.dh || ''),
    engineer: String(row?.engineer_name || data.engineer || ''),
    updatedAt: row?.updated_at || data.updatedAt || new Date(0).toISOString(),
    activities: Array.isArray(data.activities) ? data.activities : []
  };
}

function checkinToRow(report) {
  return {
    id: String(report.id),
    work_date: report.workDate,
    dh: report.dh,
    engineer_name: report.engineer,
    data: { ...report, updatedAt: report.updatedAt },
    updated_at: report.updatedAt
  };
}

async function checkinLoadReports({ force = false } = {}) {
  if (checkinLoadedRemote && !force) return checkinReports;
  checkinReports = checkinLoadLocal();
  if (typeof supabaseRestRequest !== 'function' || navigator.onLine === false) {
    checkinLoadedRemote = true;
    return checkinReports;
  }

  try {
    const rows = [];
    let offset = 0;
    while (true) {
      const batch = await supabaseRestRequest(`${CHECKIN_TABLE}?select=*&order=work_date.desc`, {
        flushPending: false,
        headers: { Range: `${offset}-${offset + 999}`, 'Range-Unit': 'items' }
      });
      rows.push(...(Array.isArray(batch) ? batch : []));
      if (!Array.isArray(batch) || batch.length < 1000) break;
      offset += batch.length;
    }
    const remote = new Map((Array.isArray(rows) ? rows : []).map(row => {
      const record = checkinFromRow(row);
      return [record.id, record];
    }));
    const pending = [];
    checkinReports.forEach(local => {
      const remoteRecord = remote.get(local.id);
      if (!remoteRecord || Date.parse(local.updatedAt || 0) > Date.parse(remoteRecord.updatedAt || 0)) {
        pending.push(local);
        remote.set(local.id, local);
      }
    });
    checkinReports = [...remote.values()].sort((a, b) => b.workDate.localeCompare(a.workDate) || a.engineer.localeCompare(b.engineer, 'pt-BR'));
    checkinSaveLocal();
    if (pending.length) {
      try {
        await supabaseRestRequest(`${CHECKIN_TABLE}?on_conflict=id`, {
          method: 'POST',
          headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
          body: JSON.stringify(pending.map(checkinToRow))
        });
      } catch (error) {
        console.warn('HÃ¡ diÃ¡rios locais aguardando sincronizaÃ§Ã£o:', error);
      }
    }
  } catch (error) {
    console.warn('Planejamento diário compartilhado indisponível; usando dados locais:', error);
  }
  checkinLoadedRemote = true;
  return checkinReports;
}

async function checkinSyncFromSupabase() {
  checkinLoadedRemote = false;
  await checkinLoadReports({ force: true });
  if (typeof currentPage !== 'undefined' && currentPage === 'checkin') renderCheckIn();
}

async function checkinPersistReports(reports, { silent = false } = {}) {
  const changed = Array.isArray(reports) ? reports : [reports];
  const now = new Date().toISOString();
  const changedById = new Map(changed.map(report => [report.id, { ...report, updatedAt: now }]));
  checkinReports = checkinReports.map(report => changedById.get(report.id) || report);
  changedById.forEach((report, id) => {
    if (!checkinReports.some(item => item.id === id)) checkinReports.push(report);
  });
  checkinReports.sort((a, b) => b.workDate.localeCompare(a.workDate) || a.engineer.localeCompare(b.engineer, 'pt-BR'));
  checkinSaveLocal();

  try {
    if (typeof supabaseRestRequest !== 'function') throw new Error('Supabase ainda não está pronto.');
    await supabaseRestRequest(`${CHECKIN_TABLE}?on_conflict=id`, {
      method: 'POST',
      headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
      body: JSON.stringify([...changedById.values()].map(checkinToRow))
    });
    if (!silent) toast('Diário salvo e sincronizado.');
    return true;
  } catch (error) {
    console.warn('Diário salvo localmente; sincronização pendente:', error);
    if (!silent) toast('Diário salvo neste aparelho. A sincronização será retomada quando houver conexão.', true);
    return false;
  }
}

function checkinGetReport(id) {
  return checkinReports.find(report => report.id === id);
}

function checkinParseNumber(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  const normalized = String(value ?? '').trim().replace(/\s/g, '').replace(/\.(?=\d{3}(?:\D|$))/g, '').replace(',', '.');
  const number = Number(normalized);
  return Number.isFinite(number) ? number : 0;
}

function checkinNumber(value, digits = 1) {
  return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: digits }).format(Number(value) || 0);
}

function checkinCreateReport({ workDate, dh, engineer, ...fields }) {
  const id = checkinReportId(workDate, dh, engineer);
  return {
    id, workDate, dh, engineer,
    discipline: fields.discipline || '',
    stage: fields.stage || '',
    front: fields.front || '',
    contractor: fields.contractor || '',
    hcEngineer: fields.hcEngineer || engineer || '',
    supervisor: fields.supervisor || '',
    shift: fields.shift || '',
    hydraulicCrew: Number(fields.hydraulicCrew) || 0,
    ductCrew: Number(fields.ductCrew) || 0,
    isolationCrew: Number(fields.isolationCrew) || 0,
    teamSize: Number(fields.teamSize) || 0,
    ptaCount: Number(fields.ptaCount) || 0,
    weather: fields.weather || '',
    checkinAt: '', checkoutAt: '', status: 'planejado',
    activities: [], updatedAt: new Date().toISOString()
  };
}

function checkinUniqueOptions(values) {
  return [...new Set(values.map(value => String(value || '').trim()).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b, 'pt-BR'));
}

function checkinSelectOptions(values, selected, allLabel) {
  return `<option value="">${allLabel}</option>${values.map(value => `<option value="${esc(value)}" ${selected === value ? 'selected' : ''}>${esc(value)}</option>`).join('')}`;
}

function checkinStatusClass(status) {
  return status === 'Concluído' ? 'complete' : status === 'Parcial' ? 'partial' : status === 'Suspenso' ? 'suspended' : status === 'Extra (não programada)' ? 'extra' : 'not-started';
}

async function renderCheckIn() {
  const app = document.getElementById('app');
  if (!app) return;
  app.innerHTML = '<div class="checkin-loading">Carregando planejamento diário…</div>';
  await checkinLoadReports();

  const dayReports = checkinReports.filter(report => report.workDate === checkinSelectedDate);
  const engineers = checkinUniqueOptions(checkinReports.map(report => report.engineer));
  const dataHalls = checkinUniqueOptions(checkinReports.map(report => report.dh));
  const visibleReports = dayReports.filter(report =>
    (!checkinEngineerFilter || report.engineer === checkinEngineerFilter)
    && (!checkinDhFilter || report.dh === checkinDhFilter)
  );
  const totalPlanned = visibleReports.reduce((sum, report) => sum + report.activities.reduce((total, activity) => total + checkinParseNumber(activity.plannedMeters), 0), 0);
  const totalExecuted = visibleReports.reduce((sum, report) => sum + report.activities.reduce((total, activity) => total + checkinParseNumber(activity.executedMeters), 0), 0);
  const openReports = visibleReports.filter(report => !report.checkoutAt).length;

  app.innerHTML = `
    ${pageHeader('Check-in e Check-out Diário', 'Planeje as frentes por engenheiro e acompanhe o executado, desvios e Curva S.', 'PRODUÇÃO DE CAMPO', `<button class="button button-outline" onclick="checkinDownloadTemplate()">${icon('download')} Modelo semanal</button><button class="button button-outline" onclick="checkinOpenManualActivity()">${icon('plus')} Nova atividade</button><button class="button button-green" onclick="checkinOpenImport()">${icon('upload')} Importar semana</button>`)}
    <nav class="checkin-tabs" aria-label="Seções de check-in">
      <button class="${checkinActiveTab === 'diario' ? 'active' : ''}" onclick="checkinSetTab('diario')">Diário de campo</button>
      <button class="${checkinActiveTab === 'planejamento' ? 'active' : ''}" onclick="checkinSetTab('planejamento')">Planejamento</button>
      <button class="${checkinActiveTab === 'curva' ? 'active' : ''}" onclick="checkinSetTab('curva')">Curva S</button>
    </nav>
    ${checkinActiveTab === 'diario' ? checkinRenderDaily(visibleReports, engineers, dataHalls, totalPlanned, totalExecuted, openReports) : ''}
    ${checkinActiveTab === 'planejamento' ? checkinRenderPlanning(engineers, dataHalls) : ''}
    ${checkinActiveTab === 'curva' ? checkinRenderCurve(engineers, dataHalls) : ''}
  `;
  if (typeof hydrateIcons === 'function') hydrateIcons();
}

function checkinRenderDaily(reports, engineers, dataHalls, planned, executed, openReports) {
  return `
    <section class="checkin-filter-panel">
      <label><span>Data do diário</span><input type="date" value="${checkinSelectedDate}" onchange="checkinSetDay(this.value)"></label>
      <label><span>Engenheiro</span><select onchange="checkinSetDailyFilter('engineer', this.value)">${checkinSelectOptions(engineers, checkinEngineerFilter, 'Todos')}</select></label>
      <label><span>Data Hall</span><select onchange="checkinSetDailyFilter('dh', this.value)">${checkinSelectOptions(dataHalls, checkinDhFilter, 'Todos')}</select></label>
      <button class="button button-outline" onclick="checkinLoadReports({force:true}).then(renderCheckIn)">${icon('refresh')} Atualizar</button>
    </section>
    <section class="checkin-metrics">
      <article><small>ATIVIDADES DO DIA</small><strong>${reports.reduce((sum, report) => sum + report.activities.length, 0)}</strong></article>
      <article><small>PLANEJADO</small><strong>${checkinNumber(planned)} m</strong></article>
      <article><small>EXECUTADO</small><strong>${checkinNumber(executed)} m</strong></article>
      <article><small>DIÁRIOS EM ABERTO</small><strong>${openReports}</strong></article>
    </section>
    ${reports.length ? reports.map(checkinRenderDailyReport).join('') : `<section class="checkin-empty"><span>${icon('calendar')}</span><h2>Nenhuma atividade planejada para ${checkinFormatDate(checkinSelectedDate)}</h2><p>Importe a planilha semanal ou cadastre uma atividade planejada para abrir o diário de campo.</p><button class="button button-green" onclick="checkinSetTab('planejamento')">Abrir planejamento</button></section>`}
  `;
}

function checkinRenderDailyReport(report) {
  const totalPlanned = report.activities.reduce((sum, activity) => sum + checkinParseNumber(activity.plannedMeters), 0);
  const totalExecuted = report.activities.reduce((sum, activity) => sum + checkinParseNumber(activity.executedMeters), 0);
  const overallStatus = report.checkoutAt ? 'Fechado' : report.checkinAt ? 'Em andamento' : 'Planejado';
  return `<article class="checkin-report-card" data-report-card="${esc(report.id)}">
    <header class="checkin-report-head">
      <div><div class="checkin-report-eyebrow">${esc(report.dh)} · ${esc(report.discipline || 'Disciplina não informada')}</div><h2>${esc(report.engineer)}</h2><p>${esc(report.stage || 'Etapa não informada')} · ${esc(report.front || 'Frente não informada')}</p></div>
      <span class="checkin-report-state ${report.checkoutAt ? 'closed' : report.checkinAt ? 'running' : ''}">${overallStatus}</span>
    </header>
    <div class="checkin-report-meta">
      <span><small>Empreiteira</small><strong>${esc(report.contractor || '—')}</strong></span>
      <span><small>Responsável HC</small><strong>${esc(report.hcEngineer || report.engineer)}</strong></span>
      <span><small>Equipe</small><strong>${Number(report.teamSize || 0) || Number(report.hydraulicCrew || 0) + Number(report.ductCrew || 0) + Number(report.isolationCrew || 0)} pessoas · ${Number(report.ptaCount || 0)} PTA</strong></span>
      <span><small>Check-in / Check-out</small><strong>${checkinFormatTime(report.checkinAt)} / ${checkinFormatTime(report.checkoutAt)}</strong></span>
    </div>
    <div class="checkin-header-fields">
      ${checkinHeaderInput(report, 'discipline', 'Disciplina')}
      ${checkinHeaderInput(report, 'stage', 'Etapa')}
      ${checkinHeaderInput(report, 'front', 'Frente')}
      ${checkinHeaderInput(report, 'contractor', 'Empreiteira(s)')}
      ${checkinHeaderInput(report, 'hcEngineer', 'Eng. responsável HC')}
      ${checkinHeaderInput(report, 'supervisor', 'Supervisor')}
      ${checkinHeaderInput(report, 'shift', 'Turno')}
      ${checkinHeaderInput(report, 'hydraulicCrew', 'Efetivo hidráulica', 'number')}
      ${checkinHeaderInput(report, 'ductCrew', 'Efetivo dutos', 'number')}
      ${checkinHeaderInput(report, 'isolationCrew', 'Efetivo isolamento', 'number')}
      ${checkinHeaderInput(report, 'teamSize', 'Qtd. pessoas', 'number')}
      ${checkinHeaderInput(report, 'ptaCount', 'Qtd. PTA', 'number')}
      ${checkinHeaderInput(report, 'weather', 'Clima / condição da frente')}
    </div>
    <div class="checkin-activity-table-wrap"><table class="checkin-activity-table">
      <thead><tr><th>Item / cronograma</th><th>Local e atividade</th><th>Un.</th><th>Prev. dia</th><th>Exec. dia</th><th>%</th><th>Status</th><th>Cód. problema</th><th>Observação</th></tr></thead>
      <tbody>${report.activities.map(activity => checkinRenderActivityRow(report, activity)).join('')}</tbody>
      <tfoot><tr><th colspan="3">Total do diário</th><th>${checkinNumber(totalPlanned)} m</th><th>${checkinNumber(totalExecuted)} m</th><th>${totalPlanned ? `${checkinNumber(totalExecuted / totalPlanned * 100, 0)}%` : '—'}</th><th colspan="3"></th></tr></tfoot>
    </table></div>
    <footer class="checkin-report-actions">
      <span>${report.checkinAt ? `Entrada registrada às ${checkinFormatTime(report.checkinAt)}` : 'Ainda não foi feito check-in'}${report.checkoutAt ? ` · Saída às ${checkinFormatTime(report.checkoutAt)}` : ''}</span>
      <div>
        <button class="button button-outline compact" onclick="checkinSaveDraft('${esc(report.id)}')">Salvar diário</button>
        <button class="button button-outline compact" onclick="checkinCopyWhatsApp('${esc(report.id)}','checkin')">Copiar check-in</button>
        <button class="button button-outline compact" onclick="checkinCopyWhatsApp('${esc(report.id)}','checkout')">Copiar checkout</button>
        <button class="button ${report.checkinAt ? 'button-outline' : 'button-green'} compact" onclick="checkinRegister('${esc(report.id)}','checkin')">${report.checkinAt ? 'Atualizar check-in' : 'Registrar check-in'}</button>
        <button class="button ${report.checkoutAt ? 'button-dark' : 'button-green'} compact" ${report.checkinAt ? '' : 'disabled'} onclick="checkinRegister('${esc(report.id)}','checkout')">${report.checkoutAt ? 'Atualizar checkout' : 'Registrar checkout'}</button>
      </div>
    </footer>
  </article>`;
}

function checkinHeaderInput(report, field, label, type = 'text') {
  const value = report[field] ?? '';
  return `<label><span>${label}</span><input data-report-id="${esc(report.id)}" data-header-field="${field}" type="${type}" value="${esc(value)}" ${type === 'number' ? 'min="0" step="1"' : ''}></label>`;
}

function checkinRenderActivityRow(report, activity) {
  const planned = checkinParseNumber(activity.plannedMeters);
  const executed = checkinParseNumber(activity.executedMeters);
  const percent = planned > 0 ? `${checkinNumber(executed / planned * 100, 0)}%` : executed ? 'Extra' : '—';
  return `<tr data-report-id="${esc(report.id)}" data-activity-id="${esc(activity.id)}">
    <td><strong>${esc(activity.pstItem || '—')}</strong><small>${esc(activity.scheduleId || 'Sem ID de cronograma')}</small></td>
    <td><strong>${esc(activity.location || '—')}</strong><small>${esc(activity.activity || '')}</small></td>
    <td>${esc(activity.unit || 'm')}</td>
    <td>${checkinNumber(planned)} ${esc(activity.unit || 'm')}</td>
    <td><input class="checkin-number-input" type="number" min="0" step="0.1" data-activity-field="executedMeters" value="${esc(executed)}" oninput="checkinUpdatePercent(this)"></td>
    <td class="checkin-percent-cell">${percent}</td>
    <td><select data-activity-field="status">${CHECKIN_STATUS.map(status => `<option ${activity.status === status ? 'selected' : ''}>${status}</option>`).join('')}</select></td>
    <td><select data-activity-field="problemCode" onchange="checkinToggleOther(this)"><option value="">—</option>${CHECKIN_PROBLEMS.map(([code, label]) => `<option value="${code}" ${activity.problemCode === code ? 'selected' : ''}>${code} - ${label}</option>`).join('')}</select><input class="checkin-problem-other" data-activity-field="problemOther" placeholder="Descreva outro motivo" value="${esc(activity.problemOther || '')}" style="${activity.problemCode === 'OUTRO' ? '' : 'display:none'}"></td>
    <td><input data-activity-field="notes" value="${esc(activity.notes || '')}" placeholder="Observação" maxlength="500"></td>
  </tr>`;
}

function checkinUpdatePercent(input) {
  const row = input.closest('tr');
  if (!row) return;
  const report = checkinGetReport(row.dataset.reportId);
  const activity = report?.activities.find(item => item.id === row.dataset.activityId);
  if (!activity) return;
  const planned = checkinParseNumber(activity.plannedMeters);
  const executed = checkinParseNumber(input.value);
  const cell = row.querySelector('.checkin-percent-cell');
  if (cell) cell.textContent = planned > 0 ? `${checkinNumber(executed / planned * 100, 0)}%` : executed ? 'Extra' : '—';
}

function checkinToggleOther(select) {
  const input = select.closest('td')?.querySelector('.checkin-problem-other');
  if (input) input.style.display = select.value === 'OUTRO' ? '' : 'none';
}

function checkinCaptureReport(reportId) {
  const report = checkinGetReport(reportId);
  const card = document.querySelector(`[data-report-card="${CSS.escape(reportId)}"]`);
  if (!report || !card) return report;
  const next = structuredClone(report);
  card.querySelectorAll('[data-header-field]').forEach(input => {
    const field = input.dataset.headerField;
    next[field] = input.type === 'number' ? Number(input.value || 0) : input.value.trim();
  });
  card.querySelectorAll('[data-activity-id]').forEach(row => {
    const activity = next.activities.find(item => item.id === row.dataset.activityId);
    if (!activity) return;
    row.querySelectorAll('[data-activity-field]').forEach(input => {
      const field = input.dataset.activityField;
      activity[field] = field === 'executedMeters' ? checkinParseNumber(input.value) : input.value;
    });
  });
  return next;
}

async function checkinSaveDraft(reportId) {
  const report = checkinCaptureReport(reportId);
  if (!report) return;
  await checkinPersistReports(report);
  renderCheckIn();
}

async function checkinRegister(reportId, action) {
  const report = checkinCaptureReport(reportId);
  if (!report) return;
  if (action === 'checkout') {
    const incomplete = report.activities.filter(activity =>
      ['Parcial', 'Não iniciado', 'Suspenso'].includes(activity.status)
      && (!activity.problemCode || (activity.problemCode === 'OUTRO' && !String(activity.problemOther || '').trim()))
    );
    if (incomplete.length) return toast('Selecione o código do motivo para cada atividade parcial, não iniciada ou suspensa.', true);
    if (!report.activities.length) return toast('O diário precisa ter ao menos uma atividade.', true);
  }
  const now = new Date().toISOString();
  if (action === 'checkin') {
    report.checkinAt = report.checkinAt || now;
    report.status = report.checkoutAt ? 'fechado' : 'em andamento';
  } else {
    if (!report.checkinAt) return toast('Registre o check-in antes do checkout.', true);
    report.checkoutAt = now;
    report.status = 'fechado';
  }
  await checkinPersistReports(report);
  renderCheckIn();
}

function checkinProblemLabel(code, other = '') {
  if (code === 'OUTRO') return `Outro${other ? `: ${other}` : ''}`;
  const item = CHECKIN_PROBLEMS.find(([value]) => value === code);
  return item ? `${item[0]} - ${item[1]}` : '';
}

function checkinBuildWhatsApp(report, action) {
  const isCheckout = action === 'checkout';
  const lines = [
    `*${isCheckout ? 'CHECK-OUT' : 'CHECK-IN'} DIÁRIO — ${report.dh}*`,
    `Data: ${checkinFormatDate(report.workDate)}${isCheckout ? ` · Saída: ${checkinFormatTime(report.checkoutAt || new Date().toISOString())}` : ` · Entrada: ${checkinFormatTime(report.checkinAt || new Date().toISOString())}`}`,
    `Engenheiro: ${report.engineer}`,
    `Disciplina: ${report.discipline || '—'} · Etapa: ${report.stage || '—'}`,
    `Frente: ${report.front || '—'}`,
    `Empreiteira: ${report.contractor || '—'}`,
    `Eng. responsável HC: ${report.hcEngineer || report.engineer}`,
    `Equipe: ${Number(report.teamSize || 0) || Number(report.hydraulicCrew || 0) + Number(report.ductCrew || 0) + Number(report.isolationCrew || 0)} pessoas · ${Number(report.ptaCount || 0)} PTA`,
    '',
    '*Atividades do dia*'
  ];
  report.activities.forEach((activity, index) => {
    const planned = checkinNumber(activity.plannedMeters);
    const executed = checkinNumber(activity.executedMeters);
    lines.push(`${index + 1}. ${[activity.pstItem, activity.scheduleId, activity.activity].filter(Boolean).join(' · ')}`);
    lines.push(`   ${activity.location || 'Local não informado'} · Previsto ${planned} ${activity.unit || 'm'}${isCheckout ? ` · Executado ${executed} ${activity.unit || 'm'} · ${activity.status || 'Não iniciado'}` : ''}`);
    if (isCheckout && activity.problemCode) lines.push(`   Desvio: ${checkinProblemLabel(activity.problemCode, activity.problemOther)}`);
    if (isCheckout && activity.notes) lines.push(`   Obs.: ${activity.notes}`);
  });
  if (report.weather) lines.push('', `Condição da frente: ${report.weather}`);
  return lines.join('\n');
}

function checkinCopyWhatsApp(reportId, action) {
  const report = checkinCaptureReport(reportId) || checkinGetReport(reportId);
  if (!report) return;
  const text = checkinBuildWhatsApp(report, action);
  const fallbackCopy = () => {
    const area = document.createElement('textarea');
    area.value = text;
    area.style.position = 'fixed'; area.style.opacity = '0';
    document.body.appendChild(area); area.select();
    const copied = document.execCommand('copy'); area.remove();
    if (copied) toast('Resumo copiado. Cole no WhatsApp.');
    else toast('Não foi possível copiar o resumo.', true);
  };
  if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).then(() => toast('Resumo copiado. Cole no WhatsApp.')).catch(fallbackCopy);
  else fallbackCopy();
}

function checkinSetTab(tab) {
  checkinActiveTab = ['diario', 'planejamento', 'curva'].includes(tab) ? tab : 'diario';
  renderCheckIn();
}

function checkinSetDay(value) {
  if (!value) return;
  checkinSelectedDate = value;
  checkinEngineerFilter = '';
  checkinDhFilter = '';
  renderCheckIn();
}

function checkinSetDailyFilter(key, value) {
  if (key === 'engineer') checkinEngineerFilter = value;
  if (key === 'dh') checkinDhFilter = value;
  renderCheckIn();
}

function checkinRenderPlanning(engineers, dataHalls) {
  const reports = checkinReports.filter(report => report.workDate >= checkinPlanStart && report.workDate <= checkinPlanEnd);
  const planned = reports.reduce((sum, report) => sum + report.activities.reduce((total, activity) => total + checkinParseNumber(activity.plannedMeters), 0), 0);
  const rows = reports.flatMap(report => report.activities.map(activity => ({ report, activity })))
    .sort((a, b) => a.report.workDate.localeCompare(b.report.workDate) || a.report.dh.localeCompare(b.report.dh) || a.report.engineer.localeCompare(b.report.engineer));
  return `<section class="checkin-filter-panel checkin-plan-filter">
    <label><span>De</span><input type="date" value="${checkinPlanStart}" onchange="checkinSetPlanRange('start',this.value)"></label>
    <label><span>Até</span><input type="date" value="${checkinPlanEnd}" onchange="checkinSetPlanRange('end',this.value)"></label>
    <button class="button button-outline" onclick="checkinOpenImport()">${icon('upload')} Importar planilha semanal</button>
    <button class="button button-outline" onclick="checkinDownloadTemplate()">${icon('download')} Baixar modelo XLSX</button>
    <button class="button button-green" onclick="checkinOpenManualActivity()">${icon('plus')} Adicionar atividade</button>
  </section>
  <section class="checkin-plan-summary"><strong>${rows.length}</strong> atividade(s) · <strong>${checkinNumber(planned)} m</strong> planejados · ${reports.length} diário(s) por engenheiro e DH</section>
  ${rows.length ? `<article class="checkin-report-card"><div class="checkin-activity-table-wrap"><table class="checkin-activity-table checkin-plan-table"><thead><tr><th>Data / DH</th><th>Engenheiro / empreiteira</th><th>Disciplina / etapa</th><th>Item / cronograma</th><th>Local / frente</th><th>Planejado</th><th></th></tr></thead><tbody>${rows.map(({ report, activity }) => `<tr><td>${checkinFormatDate(report.workDate)}<small>${esc(report.dh)}</small></td><td>${esc(report.engineer)}<small>${esc(report.contractor || '—')}</small></td><td>${esc(report.discipline || '—')}<small>${esc(report.stage || '—')}</small></td><td><strong>${esc(activity.pstItem || '—')}</strong><small>${esc(activity.scheduleId || activity.unit || '')}</small></td><td><strong>${esc(activity.location || report.front || '—')}</strong><small>${esc(activity.activity || '')}</small></td><td>${checkinNumber(activity.plannedMeters)} ${esc(activity.unit || 'm')}</td><td><button class="icon-button" title="Excluir atividade planejada" onclick="checkinDeleteActivity('${esc(report.id)}','${esc(activity.id)}')">${icon('trash')}</button></td></tr>`).join('')}</tbody></table></div></article>` : `<section class="checkin-empty"><h2>Nenhum planejamento neste período</h2><p>Importe uma planilha semanal ou adicione a primeira atividade.</p></section>`}`;
}

function checkinSetPlanRange(which, value) {
  if (which === 'start') checkinPlanStart = value;
  else checkinPlanEnd = value;
  renderCheckIn();
}

function checkinOpenImport() {
  modal(`${modalHead('Importar planejamento semanal', 'Uma linha por atividade. Os registros existentes preservam check-in e executado.')}
    <div class="modal-body checkin-import-body">
      <div class="notice">Use as colunas do modelo: Data, DH, Engenheiro, Disciplina, Etapa, Frente, Empreiteira, Atividade, Previsto dia (m) e os demais dados do cabeçalho.</div>
      <label class="checkin-upload-box"><span>${icon('upload')} Selecione um arquivo XLSX, XLS ou CSV</span><input type="file" accept=".xlsx,.xls,.csv" onchange="checkinImportWeekly(event)"></label>
      <p>O sistema atualiza o planejamento por data, DH, engenheiro e ID de cronograma. Os metros executados e os motivos já lançados ficam preservados.</p>
    </div>
    <div class="modal-foot"><button class="button button-outline" onclick="closeModal()">Fechar</button><button class="button button-outline" onclick="checkinDownloadTemplate()">Baixar modelo</button></div>`, 'modal-small');
  if (typeof hydrateIcons === 'function') hydrateIcons();
}

function checkinDownloadTemplate() {
  if (!window.XLSX) return toast('A biblioteca de planilhas ainda está carregando.', true);
  const headers = ['Data', 'DH', 'Disciplina', 'Etapa', 'Frente', 'Empreiteira', 'Eng. Responsável HC', 'Supervisor', 'Turno', 'Clima / condição da frente', 'Qtd pessoas', 'Efetivo Hidráulica', 'Efetivo Dutos', 'Efetivo Isolamento', 'Qtd PTA', 'Item PST', 'ID Cronograma', 'Local', 'Atividade', 'Unidade', 'Previsto Dia (m)'];
  const example = [checkinToday(), 'DH 02', 'HIDRÁULICA', 'Corredor Fan Wall B', 'Instalação Spools (7012, 7224; 7064, 7216) 10 in', 'LA', 'Silas Miranda', '', '', '', 6, 6, 0, 0, 2, '85', '04-SR-MO-2100', 'CORREDOR SUPERCORE', 'Montagem da tubulação', 'm', 10];
  const workbook = XLSX.utils.book_new();
  const plan = XLSX.utils.aoa_to_sheet([headers, example]);
  plan['!cols'] = headers.map(header => ({ wch: Math.max(14, Math.min(38, header.length + 4)) }));
  XLSX.utils.book_append_sheet(workbook, plan, 'PLANEJAMENTO');
  const guide = XLSX.utils.aoa_to_sheet([
    ['MODELO SEMANAL DE PLANEJAMENTO — CHECK-IN / CHECK-OUT'],
    ['Preencha uma linha por atividade. Repita Data, DH, Engenheiro e dados do cabeçalho nas linhas do mesmo diário.'],
    ['Campos obrigatórios: Data, DH, Engenheiro, Atividade e Previsto Dia (m).'],
    ['A data aceita AAAA-MM-DD ou DD/MM/AAAA. A quantidade planejada pode usar vírgula decimal.'],
    ['A importação atualiza o planejamento e preserva valores executados, check-in/out e desvios já registrados.'],
    ['Os códigos de desvio são selecionados no checkout: 01 frente; 02 material; 03 projeto; 04 interferência; 05 clima; 06 efetivo; 07 equipamento; 08 segurança; OUTRO.']
  ]);
  guide['!cols'] = [{ wch: 120 }];
  XLSX.utils.book_append_sheet(workbook, guide, 'INSTRUCOES');
  XLSX.writeFile(workbook, 'Modelo_Semanal_Checkin_Checkout.xlsx');
}

function checkinNormalizeHeader(value) {
  return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function checkinParseDate(value) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`;
  if (typeof value === 'number' && window.XLSX?.SSF) {
    const date = XLSX.SSF.parse_date_code(value);
    if (date) return `${date.y}-${String(date.m).padStart(2, '0')}-${String(date.d).padStart(2, '0')}`;
  }
  const text = String(value || '').trim();
  let match = text.match(/^(\d{1,2})[/.\-](\d{1,2})[/.\-](\d{4})$/);
  if (match) return `${match[3]}-${match[2].padStart(2, '0')}-${match[1].padStart(2, '0')}`;
  match = text.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (match) return `${match[1]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}`;
  return '';
}

function checkinImportValue(row, indexByHeader, aliases) {
  for (const alias of aliases) {
    const index = indexByHeader.get(checkinNormalizeHeader(alias));
    if (index !== undefined && row[index] !== undefined && String(row[index]).trim() !== '') return row[index];
  }
  return '';
}

async function checkinImportWeekly(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  if (!window.XLSX) return toast('A biblioteca de planilhas ainda está carregando.', true);
  try {
    const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array', cellDates: true });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '', raw: true });
    if (rows.length < 2) throw new Error('A planilha não contém linhas de atividades.');
    const headers = rows[0].map(checkinNormalizeHeader);
    const indexByHeader = new Map(headers.map((header, index) => [header, index]));
    const aliases = {
      date: ['data', 'dia', 'data atividade', 'work date'],
      dh: ['dh', 'data hall'],
      engineer: ['engenheiro', 'engenheiro responsavel', 'eng responsavel hc', 'engenheiro resp', 'responsavel hc'],
      discipline: ['disciplina'], stage: ['etapa'], front: ['frente'], contractor: ['empreiteira', 'empreiteira s', 'contratada'], weather: ['clima', 'clima condicao da frente'],
      hcEngineer: ['eng responsavel hc', 'engenheiro responsavel hc'], supervisor: ['supervisor'], shift: ['turno'],
      teamSize: ['qtd pessoas', 'qtd de pessoas', 'quantidade de pessoas'], hydraulicCrew: ['efetivo hidraulica', 'qtd pessoas hidraulica'], ductCrew: ['efetivo dutos'], isolationCrew: ['efetivo isolamento'], ptaCount: ['qtd pta', 'quantidade pta'],
      pstItem: ['item pst', 'item'], scheduleId: ['id cronograma', 'cronograma', 'id atividade'], location: ['local', 'localizacao'],
      activity: ['atividade', 'descricao atividade', 'servico'], unit: ['unidade', 'und', 'un'], plannedMeters: ['previsto dia m', 'prev dia m', 'prev dia', 'planejado dia m', 'metros planejados', 'quantidade planejada']
    };
    const grouped = new Map();
    let rejected = 0;
    for (const row of rows.slice(1)) {
      if (!row.some(cell => String(cell).trim())) continue;
      const data = Object.fromEntries(Object.entries(aliases).map(([key, names]) => [key, checkinImportValue(row, indexByHeader, names)]));
      const workDate = checkinParseDate(data.date);
      const dh = String(data.dh || '').trim().toUpperCase().replace(/^DH\s*/, 'DH ');
      const engineer = String(data.engineer || data.hcEngineer || '').trim();
      const activityText = String(data.activity || '').trim();
      if (!workDate || !dh || !engineer || !activityText || data.plannedMeters === '') { rejected += 1; continue; }
      const id = checkinReportId(workDate, dh, engineer);
      let report = grouped.get(id);
      if (!report) report = checkinCreateReport({ workDate, dh, engineer, ...data });
      else {
        for (const key of ['discipline', 'stage', 'front', 'contractor', 'hcEngineer', 'supervisor', 'shift', 'teamSize', 'hydraulicCrew', 'ductCrew', 'isolationCrew', 'ptaCount', 'weather']) {
          if (data[key] !== '' && data[key] !== undefined) report[key] = data[key];
        }
      }
      const scheduleId = String(data.scheduleId || '').trim();
      const pstItem = String(data.pstItem || '').trim();
      const activityId = `${id}-task-${checkinSlug(scheduleId || pstItem || `${data.location}-${activityText}`)}`;
      const existing = report.activities.find(item => item.id === activityId);
      const activity = {
        ...(existing || {}), id: activityId, pstItem, scheduleId,
        location: String(data.location || '').trim(), activity: activityText,
        unit: String(data.unit || 'm').trim(), plannedMeters: checkinParseNumber(data.plannedMeters),
        status: existing?.status || 'Não iniciado', executedMeters: existing?.executedMeters || 0,
        problemCode: existing?.problemCode || '', problemOther: existing?.problemOther || '', notes: existing?.notes || ''
      };
      const activityIndex = report.activities.findIndex(item => item.id === activityId);
      if (activityIndex >= 0) report.activities[activityIndex] = activity;
      else report.activities.push(activity);
      grouped.set(id, report);
    }
    if (!grouped.size) throw new Error('Nenhuma linha válida. Confira as colunas Data, DH, Engenheiro, Atividade e Previsto Dia (m).');

    const merged = [];
    grouped.forEach(imported => {
      const current = checkinGetReport(imported.id);
      if (current) {
        const importedIds = new Set(imported.activities.map(activity => activity.id));
        imported.activities.push(...current.activities.filter(activity => !importedIds.has(activity.id)));
        for (const key of ['checkinAt', 'checkoutAt', 'status', 'updatedAt']) imported[key] = current[key] || imported[key];
        for (const key of ['discipline', 'stage', 'front', 'contractor', 'hcEngineer', 'supervisor', 'shift', 'teamSize', 'hydraulicCrew', 'ductCrew', 'isolationCrew', 'ptaCount', 'weather']) {
          if (!imported[key]) imported[key] = current[key];
        }
      }
      merged.push(imported);
    });
    await checkinPersistReports(merged, { silent: true });
    closeModal();
    checkinActiveTab = 'planejamento';
    checkinPlanStart = [...grouped.values()].map(report => report.workDate).sort()[0];
    checkinPlanEnd = [...grouped.values()].map(report => report.workDate).sort().at(-1);
    toast(`${merged.length} diário(s) importado(s), ${merged.reduce((sum, report) => sum + report.activities.length, 0)} atividade(s)${rejected ? ` · ${rejected} linha(s) ignorada(s)` : ''}.`);
    renderCheckIn();
  } catch (error) {
    console.warn('Falha ao importar o planejamento:', error);
    toast(error.message || 'Não foi possível ler a planilha selecionada.', true);
  } finally {
    event.target.value = '';
  }
}

function checkinOpenManualActivity() {
  const current = checkinGetReport(checkinReportId(checkinSelectedDate, checkinDhFilter || 'DH 02', checkinEngineerFilter || currentUser?.name || ''));
  const date = checkinActiveTab === 'planejamento' ? checkinPlanStart : checkinSelectedDate;
  modal(`${modalHead('Nova atividade planejada', 'Cadastre uma atividade para um engenheiro, DH e dia.')}
    <form class="checkin-manual-form" onsubmit="checkinAddManualActivity(event)">
      <label><span>Data</span><input name="workDate" type="date" required value="${date}"></label>
      <label><span>DH</span><input name="dh" required value="${esc(current?.dh || checkinDhFilter || 'DH 02')}" placeholder="DH 02"></label>
      <label><span>Engenheiro</span><input name="engineer" required value="${esc(current?.engineer || checkinEngineerFilter || currentUser?.name || '')}"></label>
      <label><span>Disciplina</span><input name="discipline" value="HIDRÁULICA"></label>
      <label><span>Etapa</span><input name="stage"></label>
      <label class="wide"><span>Frente</span><input name="front" required></label>
      <label><span>Empreiteira</span><input name="contractor"></label>
      <label><span>Eng. responsável HC</span><input name="hcEngineer" value="${esc(current?.hcEngineer || currentUser?.name || '')}"></label>
      <label><span>Item PST</span><input name="pstItem"></label>
      <label><span>ID Cronograma</span><input name="scheduleId"></label>
      <label><span>Local</span><input name="location"></label>
      <label class="wide"><span>Atividade</span><input name="activity" required></label>
      <label><span>Unidade</span><input name="unit" value="m"></label>
      <label><span>Metros planejados no dia</span><input name="plannedMeters" type="number" min="0" step="0.1" required></label>
      <label><span>Qtd. pessoas</span><input name="teamSize" type="number" min="0" value="0"></label>
      <label><span>Qtd. PTA</span><input name="ptaCount" type="number" min="0" value="0"></label>
      <div class="modal-foot"><button type="button" class="button button-outline" onclick="closeModal()">Cancelar</button><button class="button button-green" type="submit">Salvar planejamento</button></div>
    </form>`, 'modal-large');
}

async function checkinAddManualActivity(event) {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(event.currentTarget).entries());
  const date = checkinParseDate(data.workDate);
  const dh = data.dh.trim().toUpperCase().replace(/^DH\s*/, 'DH ');
  const engineer = data.engineer.trim();
  const id = checkinReportId(date, dh, engineer);
  const report = checkinGetReport(id) || checkinCreateReport({ ...data, workDate: date, dh, engineer });
  const taskId = `${id}-task-${checkinSlug(data.scheduleId || data.pstItem || `${data.location}-${data.activity}`)}-${Date.now().toString(36)}`;
  report.discipline = data.discipline || report.discipline;
  report.stage = data.stage || report.stage;
  report.front = data.front || report.front;
  report.contractor = data.contractor || report.contractor;
  report.hcEngineer = data.hcEngineer || report.hcEngineer;
  report.teamSize = Number(data.teamSize) || report.teamSize;
  report.ptaCount = Number(data.ptaCount) || report.ptaCount;
  report.activities.push({
    id: taskId, pstItem: data.pstItem.trim(), scheduleId: data.scheduleId.trim(),
    location: data.location.trim(), activity: data.activity.trim(), unit: data.unit.trim() || 'm',
    plannedMeters: checkinParseNumber(data.plannedMeters), executedMeters: 0,
    status: 'Não iniciado', problemCode: '', problemOther: '', notes: ''
  });
  await checkinPersistReports(report, { silent: true });
  closeModal();
  checkinSelectedDate = date;
  checkinEngineerFilter = engineer;
  checkinDhFilter = dh;
  checkinActiveTab = 'diario';
  toast('Atividade planejada. O diário já está disponível para check-in.');
  renderCheckIn();
}

async function checkinDeleteActivity(reportId, activityId) {
  const report = checkinGetReport(reportId);
  if (!report) return;
  report.activities = report.activities.filter(activity => activity.id !== activityId);
  if (!report.activities.length && !report.checkinAt && !report.checkoutAt) {
    checkinReports = checkinReports.filter(item => item.id !== reportId);
    checkinSaveLocal();
    try { await supabaseRestRequest(`${CHECKIN_TABLE}?id=eq.${encodeURIComponent(reportId)}`, { method: 'DELETE' }); } catch (error) { console.warn('Exclusão local pendente:', error); }
  } else {
    await checkinPersistReports(report, { silent: true });
  }
  toast('Atividade removida do planejamento.');
  renderCheckIn();
}

function checkinRenderCurve(engineers, dataHalls) {
  const reports = checkinReports.filter(report =>
    report.workDate >= checkinCurveStart && report.workDate <= checkinCurveEnd
    && (!checkinCurveEngineer || report.engineer === checkinCurveEngineer)
    && (!checkinCurveDh || report.dh === checkinCurveDh)
  );
  const byDate = new Map();
  reports.forEach(report => {
    const row = byDate.get(report.workDate) || { planned: 0, executed: 0 };
    report.activities.forEach(activity => {
      row.planned += checkinParseNumber(activity.plannedMeters);
      row.executed += checkinParseNumber(activity.executedMeters);
    });
    byDate.set(report.workDate, row);
  });
  const dates = [];
  if (checkinCurveStart && checkinCurveEnd && checkinCurveEnd >= checkinCurveStart) {
    for (let date = checkinCurveStart; date <= checkinCurveEnd; date = checkinDateOffset(date, 1)) dates.push(date);
  }
  let cumulativePlanned = 0;
  let cumulativeExecuted = 0;
  const points = dates.map(date => {
    const daily = byDate.get(date) || { planned: 0, executed: 0 };
    cumulativePlanned += daily.planned;
    cumulativeExecuted += daily.executed;
    return { date, planned: cumulativePlanned, executed: cumulativeExecuted };
  });
  const maxValue = Math.max(1, ...points.map(point => Math.max(point.planned, point.executed)));
  const width = 900, height = 310, left = 54, right = 22, top = 20, bottom = 48;
  const chartWidth = width - left - right, chartHeight = height - top - bottom;
  const x = index => left + (points.length <= 1 ? chartWidth / 2 : index * chartWidth / (points.length - 1));
  const y = value => top + chartHeight - value / maxValue * chartHeight;
  const pathFor = key => points.map((point, index) => `${index ? 'L' : 'M'}${x(index).toFixed(1)},${y(point[key]).toFixed(1)}`).join(' ');
  const ticks = [0, maxValue / 2, maxValue];
  const plannedTotal = points.at(-1)?.planned || 0;
  const executedTotal = points.at(-1)?.executed || 0;
  const filterText = [checkinCurveEngineer || 'Todos os engenheiros', checkinCurveDh || 'Todos os DHs'].join(' · ');
  return `<section class="checkin-filter-panel checkin-curve-filters">
    <label><span>Data inicial</span><input type="date" value="${checkinCurveStart}" onchange="checkinSetCurveRange('start',this.value)"></label>
    <label><span>Data final</span><input type="date" value="${checkinCurveEnd}" onchange="checkinSetCurveRange('end',this.value)"></label>
    <label><span>Engenheiro</span><select onchange="checkinSetCurveFilter('engineer',this.value)">${checkinSelectOptions(engineers, checkinCurveEngineer, 'Todos')}</select></label>
    <label><span>Data Hall</span><select onchange="checkinSetCurveFilter('dh',this.value)">${checkinSelectOptions(dataHalls, checkinCurveDh, 'Todos')}</select></label>
  </section>
  <section class="checkin-curve-summary"><div><small>PLANEJADO ACUMULADO</small><strong>${checkinNumber(plannedTotal)} m</strong></div><div><small>EXECUTADO ACUMULADO</small><strong>${checkinNumber(executedTotal)} m</strong></div><div><small>RECORTE</small><strong>${esc(filterText)}</strong></div></section>
  <article class="checkin-curve-card"><header><div><p class="eyebrow">ACOMPANHAMENTO FÍSICO</p><h2>Curva S — Planejado x Executado</h2><p>Acumulado diário em metros · ${checkinFormatDate(checkinCurveStart)} a ${checkinFormatDate(checkinCurveEnd)}</p></div><div class="checkin-curve-legend"><span class="planned">Planejado</span><span class="executed">Executado</span></div></header>
    ${points.length ? `<div class="checkin-chart-scroll"><svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Curva S acumulada de metros planejados e executados">
      ${ticks.map(value => `<g><line x1="${left}" y1="${y(value)}" x2="${width - right}" y2="${y(value)}"/><text x="${left - 8}" y="${y(value) + 4}" text-anchor="end">${checkinNumber(value, 0)}</text></g>`).join('')}
      <path class="curve-planned" d="${pathFor('planned')}"/><path class="curve-executed" d="${pathFor('executed')}"/>
      ${points.map((point, index) => `<g><circle class="point-planned" cx="${x(index)}" cy="${y(point.planned)}" r="3"/><circle class="point-executed" cx="${x(index)}" cy="${y(point.executed)}" r="3"/><text class="curve-date" x="${x(index)}" y="${height - 16}" text-anchor="middle">${new Intl.DateTimeFormat('pt-BR',{day:'2-digit',month:'2-digit'}).format(new Date(`${point.date}T12:00:00`))}</text></g>`).join('')}
    </svg></div>` : `<div class="checkin-empty"><h2>Selecione um intervalo válido</h2></div>`}
    ${reports.length ? '' : `<p class="checkin-curve-empty">Ainda não há planejamento ou executado no recorte escolhido.</p>`}
  </article>`;
}

function checkinSetCurveRange(which, value) {
  if (which === 'start') checkinCurveStart = value;
  else checkinCurveEnd = value;
  renderCheckIn();
}

function checkinSetCurveFilter(which, value) {
  if (which === 'engineer') checkinCurveEngineer = value;
  else checkinCurveDh = value;
  renderCheckIn();
}

window.renderCheckIn = renderCheckIn;
window.syncDailyWorkReportsFromSupabase = checkinSyncFromSupabase;
window.checkinSetTab = checkinSetTab;
window.checkinSetDay = checkinSetDay;
window.checkinSetDailyFilter = checkinSetDailyFilter;
window.checkinSaveDraft = checkinSaveDraft;
window.checkinRegister = checkinRegister;
window.checkinCopyWhatsApp = checkinCopyWhatsApp;
window.checkinOpenImport = checkinOpenImport;
window.checkinDownloadTemplate = checkinDownloadTemplate;
window.checkinImportWeekly = checkinImportWeekly;
window.checkinOpenManualActivity = checkinOpenManualActivity;
window.checkinAddManualActivity = checkinAddManualActivity;
window.checkinDeleteActivity = checkinDeleteActivity;
window.checkinSetPlanRange = checkinSetPlanRange;
window.checkinSetCurveRange = checkinSetCurveRange;
window.checkinSetCurveFilter = checkinSetCurveFilter;
window.checkinUpdatePercent = checkinUpdatePercent;
window.checkinToggleOther = checkinToggleOther;
