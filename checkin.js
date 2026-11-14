const CHECKIN_STORE_KEY = 'obraflow_daily_work_reports_v1';
const CHECKIN_TABLE = 'daily_work_reports';
const CHECKIN_STATUS = ['Concluído', 'Parcial', 'Não iniciado', 'Extra (não programada)', 'Suspenso', 'Iniciado'];
const CHECKIN_DISCIPLINES = ['Hidráulica', 'Isolamento', 'Duto', 'Logística'];
const CHECKIN_SHIFTS = ['Diurno', 'Noturno'];
const CHECKIN_WEATHER = ['Ensolarado', 'Nublado', 'Chuva leve', 'Chuva forte'];
const CHECKIN_UNITS = ['m', 'm²', 'un', 'kg', 'h'];
const CHECKIN_DATA_HALLS = Array.from({ length: 10 }, (_, index) => `DH ${String(index + 1).padStart(2, '0')}`);
const CHECKIN_TEST_ENGINEER = 'TESTE DO SISTEMA';
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
let checkinDisciplineFilter = '';
let checkinEngineerFilter = '';
let checkinDhFilter = '';
let checkinCompanyFilter = '';
let checkinPlanStart = checkinToday();
let checkinPlanEnd = checkinDateOffset(checkinToday(), 6);
let checkinPlanDisciplineFilter = '';
let checkinPlanEngineerFilter = '';
let checkinPlanCompanyFilter = '';
let checkinCurveStart = checkinDateOffset(checkinToday(), -29);
let checkinCurveEnd = checkinToday();
let checkinCurveEngineer = '';
let checkinCurveDh = '';
let checkinCurveDiscipline = '';
let checkinCurveCompany = '';
let checkinCurveWeekday = '';
const CHECKIN_WEEKDAYS = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];

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
    return Array.isArray(saved) ? saved.map(checkinMigrateReportTaskTimes) : [];
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
  return checkinMigrateReportTaskTimes({
    ...data,
    id: String(row?.id || data.id || ''),
    workDate: String(row?.work_date || data.workDate || ''),
    dh: String(row?.dh || data.dh || ''),
    engineer: String(row?.engineer_name || data.engineer || ''),
    updatedAt: row?.updated_at || data.updatedAt || new Date(0).toISOString(),
    activities: Array.isArray(data.activities) ? data.activities : []
  });
}

function checkinMigrateReportTaskTimes(report) {
  const hasTaskLevelTimes = (Array.isArray(report.activities) ? report.activities : []).some(activity => activity.checkinAt || activity.checkoutAt);
  return {
    ...report,
    activities: (Array.isArray(report.activities) ? report.activities : []).map(activity => {
      const isGeneric = !activity.discipline || checkinNormalizeHeader(activity.discipline).includes('geral') || checkinNormalizeHeader(activity.discipline).includes('varias');
      const resolvedDiscipline = isGeneric ? checkinGetActivityDiscipline(report, activity) : activity.discipline;
      return {
        ...activity,
        discipline: resolvedDiscipline || activity.discipline || '',
        checkinAt: activity.checkinAt || (!hasTaskLevelTimes ? report.checkinAt : '') || '',
        checkoutAt: activity.checkoutAt || (!hasTaskLevelTimes ? report.checkoutAt : '') || ''
      };
    })
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
    logisticsCrew: Number(fields.logisticsCrew) || 0,
    actualCrew: Number(fields.actualCrew) || 0,
    actualPtaCount: Number(fields.actualPtaCount) || 0,
    forkliftCount: Number(fields.forkliftCount) || 0,
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

function checkinActualCrewTotal(report) {
  return (Array.isArray(report.activities) ? report.activities : []).reduce((sum, activity) => sum + (Number(activity.actualCrew) || 0), 0);
}

function checkinActualPtaTotal(report) {
  return (Array.isArray(report.activities) ? report.activities : []).reduce((sum, a) => sum + (Number(a.ptaCount) || 0), 0);
}

function checkinActualForkliftTotal(report) {
  return (Array.isArray(report.activities) ? report.activities : []).reduce((sum, a) => sum + (Number(a.forkliftCount) || 0), 0);
}

function checkinReportContractorsDisplay(report) {
  const taskCompanies = checkinUniqueOptions((report.activities || []).map(a => a.contractor).filter(Boolean));
  if (taskCompanies.length > 0) return taskCompanies.join(', ');
  return report.contractor || '—';
}

function checkinUpdateCardTotals(input) {
  const card = input.closest('[data-report-card]');
  if (!card) return;
  const reportId = card.dataset.reportCard;
  const report = checkinCaptureReport(reportId);
  if (!report) return;

  const crewEl = card.querySelector(`[data-meta-crew="${CSS.escape(reportId)}"]`);
  if (crewEl) crewEl.textContent = `${checkinActualCrewTotal(report)} pessoas`;

  const equipEl = card.querySelector(`[data-meta-equip="${CSS.escape(reportId)}"]`);
  if (equipEl) equipEl.textContent = `${checkinActualPtaTotal(report)} PTA · ${checkinActualForkliftTotal(report)} empilhadeira(s)`;

  const contractorEl = card.querySelector(`[data-meta-contractor="${CSS.escape(reportId)}"]`);
  if (contractorEl) contractorEl.textContent = checkinReportContractorsDisplay(report);
}

function checkinGetActivityDiscipline(report, activity) {
  if (!activity) return report?.discipline || '';
  const taskDiscipline = String(activity.discipline || '').trim();
  const reportDiscipline = String(report?.discipline || '').trim();
  const isGeneric = value => !value || checkinNormalizeHeader(value).includes('geral') || checkinNormalizeHeader(value).includes('varias');
  if (!isGeneric(taskDiscipline)) return taskDiscipline;
  if (!isGeneric(reportDiscipline)) return reportDiscipline;

  const description = checkinNormalizeHeader([
    activity.pstItem, activity.scheduleId, activity.location, activity.activity
  ].filter(Boolean).join(' '));
  if (/isolamento|isolante|armaflex|cladding|manta/.test(description)) return 'Isolamento';
  if (/tubul|hidraul|hidrante|dreno|esgoto|agua|bomba|sprinkler/.test(description)) return 'Hidráulica';
  if (/duto|duct|damper|ventil/.test(description)) return 'Duto';
  if (/logistica|recebimento|movimentacao|transporte|descarga/.test(description)) return 'Logística';
  return taskDiscipline || reportDiscipline || '';
}

function checkinAllDisciplines() {
  const found = (Array.isArray(checkinReports) ? checkinReports : []).flatMap(report =>
    (report.activities || []).map(activity => checkinGetActivityDiscipline(report, activity))
  ).filter(Boolean);
  return checkinUniqueOptions([...CHECKIN_DISCIPLINES, ...found]);
}

function checkinCompanies() {
  const fromWorkforce = (typeof workforce !== 'undefined' && Array.isArray(workforce))
    ? workforce.map(person => person?.company)
    : [];
  const fromReports = (Array.isArray(checkinReports))
    ? checkinReports.flatMap(report => [
        report?.contractor,
        ...(Array.isArray(report?.activities) ? report.activities.map(a => a?.contractor) : [])
      ])
    : [];
  return checkinUniqueOptions([...fromWorkforce, ...fromReports]);
}

function checkinEngineers() {
  const activeUsers = typeof userApprovals !== 'undefined' && Array.isArray(userApprovals)
    ? userApprovals
      .filter(user => ['approved', 'active'].includes(String(user?.status || '').toLowerCase()))
      .filter(user => {
        const role = typeof normalizeAccessRole === 'function'
          ? normalizeAccessRole(user.role || user.accessRole || user.access_role)
          : checkinNormalizeHeader(user.role || user.accessRole || user.access_role);
        return role === 'engenheiro';
      })
      .map(user => user?.name)
    : [];
  const signedIn = typeof currentUser !== 'undefined' && currentUser ? currentUser.name : '';
  return checkinUniqueOptions([...activeUsers, signedIn]);
}

function checkinAvailableEngineers() {
  return checkinUniqueOptions([
    ...checkinEngineers(),
    ...(Array.isArray(checkinReports) ? checkinReports.map(report => report.engineer) : [])
  ]);
}

function checkinExtraSectors() {
  if (typeof spoolGetAvailableSectors !== 'function') return [];
  const items = typeof spoolGetAllControlItems === 'function'
    ? spoolGetAllControlItems()
    : (typeof spoolDb !== 'undefined' ? spoolDb : []);
  return spoolGetAvailableSectors(items);
}

function checkinExtraSectorOptions(selected = '') {
  const sectors = checkinExtraSectors();
  return `<option value="">Selecione um setor</option>${sectors.map(sector =>
    `<option value="${esc(sector.id)}" ${selected === sector.id ? 'selected' : ''}>${esc(sector.name)}</option>`
  ).join('')}`;
}

function checkinExtraSectorFromForm(value) {
  return checkinExtraSectors().find(sector => sector.id === String(value || '')) || null;
}

function checkinNormalizeDataHall(value) {
  const match = String(value || '').trim().match(/^(?:DH|DATA\s*HALL)?\s*0?(\d{1,2})$/i);
  const number = match ? Number(match[1]) : 0;
  return number >= 1 && number <= 10 ? `DH ${String(number).padStart(2, '0')}` : '';
}

function checkinSelectOptions(values, selected, allLabel) {
  return `<option value="">${allLabel}</option>${values.map(value => `<option value="${esc(value)}" ${selected === value ? 'selected' : ''}>${esc(value)}</option>`).join('')}`;
}

function checkinStatusClass(status) {
  return status === 'Concluído' ? 'complete' : status === 'Iniciado' ? 'running' : status === 'Parcial' ? 'partial' : status === 'Suspenso' ? 'suspended' : status === 'Extra (não programada)' ? 'extra' : 'not-started';
}

function checkinCanManagePlanning() {
  return typeof isAdmin === 'function' && isAdmin();
}

function checkinCanDeletePlanning() {
  return typeof isMasterUser === 'function' && isMasterUser();
}

async function renderCheckIn() {
  const app = document.getElementById('app');
  if (!app) return;
  app.innerHTML = '<div class="checkin-loading">Carregando planejamento diário…</div>';
  await checkinLoadReports();

  const dayReports = checkinReports.filter(report => report.workDate === checkinSelectedDate);
  const engineers = checkinUniqueOptions(checkinReports.map(report => report.engineer));
  const dataHalls = CHECKIN_DATA_HALLS;
  const disciplines = checkinAllDisciplines();
  const companies = checkinCompanies();
  const canManagePlanning = checkinCanManagePlanning();
  const visibleReports = dayReports
    .map(report => {
      if (!checkinDisciplineFilter) return report;
      const filteredActivities = (report.activities || []).filter(activity =>
        checkinGetActivityDiscipline(report, activity) === checkinDisciplineFilter
      );
      if (!filteredActivities.length) return null;
      return { ...report, activities: filteredActivities };
    })
    .filter(Boolean)
    .filter(report =>
      (!checkinEngineerFilter || report.engineer === checkinEngineerFilter)
      && (!checkinDhFilter || report.dh === checkinDhFilter)
      && (!checkinCompanyFilter || (report.contractor === checkinCompanyFilter || (report.activities || []).some(a => a.contractor === checkinCompanyFilter)))
    );
  const totalPlanned = visibleReports.reduce((sum, report) => sum + report.activities.reduce((total, activity) => total + checkinParseNumber(activity.plannedMeters), 0), 0);
  const totalExecuted = visibleReports.reduce((sum, report) => sum + report.activities.reduce((total, activity) => total + checkinParseNumber(activity.executedMeters), 0), 0);
  const openReports = visibleReports.filter(report => !report.checkoutAt).length;

  app.innerHTML = `
    ${pageHeader('Check-in e Check-out Diário', 'Planeje as frentes por engenheiro e acompanhe o executado, desvios e Curva S.', 'PRODUÇÃO DE CAMPO', `<button class="button button-outline" onclick="checkinDownloadTemplate()">${icon('download')} Modelo semanal</button>${canManagePlanning ? `<button class="button button-green" onclick="checkinOpenImport()">${icon('upload')} Importar semana</button>` : ''}`)}
    <nav class="checkin-tabs" aria-label="Seções de check-in">
      <button class="${checkinActiveTab === 'diario' ? 'active' : ''}" onclick="checkinSetTab('diario')">Diário de campo</button>
      <button class="${checkinActiveTab === 'planejamento' ? 'active' : ''}" onclick="checkinSetTab('planejamento')">Planejamento</button>
      <button class="${checkinActiveTab === 'curva' ? 'active' : ''}" onclick="checkinSetTab('curva')">Curva S</button>
    </nav>
    ${checkinActiveTab === 'diario' ? checkinRenderDaily(visibleReports, engineers, dataHalls, disciplines, companies, totalPlanned, totalExecuted, openReports) : ''}
    ${checkinActiveTab === 'planejamento' ? checkinRenderPlanning(engineers, dataHalls, disciplines, companies) : ''}
    ${checkinActiveTab === 'curva' ? checkinRenderCurve(engineers, dataHalls, disciplines, companies) : ''}
  `;
  document.querySelectorAll('.checkin-note-input').forEach(checkinResizeNote);
  if (typeof hydrateIcons === 'function') hydrateIcons();
}

function checkinRenderDaily(reports, engineers, dataHalls, disciplines, companies, planned, executed, openReports) {
  return `
    <section class="checkin-filter-panel">
      <label><span>Data do diário</span><input type="date" value="${checkinSelectedDate}" onchange="checkinSetDay(this.value)"></label>
      <label><span>Disciplina</span><select onchange="checkinSetDailyFilter('discipline', this.value)">${checkinSelectOptions(disciplines, checkinDisciplineFilter, 'Todas')}</select></label>
      <label><span>Empresa</span><select onchange="checkinSetDailyFilter('company', this.value)">${checkinSelectOptions(companies, checkinCompanyFilter, 'Todas')}</select></label>
      <label><span>Engenheiro</span><select onchange="checkinSetDailyFilter('engineer', this.value)">${checkinSelectOptions(engineers, checkinEngineerFilter, 'Todos')}</select></label>
      <label><span>Data Hall</span><select onchange="checkinSetDailyFilter('dh', this.value)">${checkinSelectOptions(dataHalls, checkinDhFilter, 'Todos')}</select></label>
      <button class="button button-outline" onclick="checkinOpenStandaloneExtra()">Planejar atividade extra</button>
      <button class="button button-outline" onclick="checkinLoadReports({force:true}).then(renderCheckIn)">${icon('refresh')} Atualizar</button>
      <button class="button button-outline" onclick="checkinCopyDayWhatsApp('checkin')">Copiar check-ins do dia</button>
      <button class="button button-outline" onclick="checkinCopyDayWhatsApp('checkout')">Copiar checkouts do dia</button>
    </section>
    <section class="checkin-metrics">
      <article><small>ATIVIDADES DO DIA</small><strong>${reports.reduce((sum, report) => sum + report.activities.length, 0)}</strong></article>
      <article><small>PLANEJADO</small><strong>${checkinNumber(planned)} m</strong></article>
      <article><small>EXECUTADO</small><strong>${checkinNumber(executed)} m</strong></article>
      <article><small>DIÁRIOS EM ABERTO</small><strong>${openReports}</strong></article>
    </section>
    ${reports.length ? reports.map(report => checkinRenderDailyReport(report, companies)).join('') : `<section class="checkin-empty"><span>${icon('calendar')}</span><h2>Nenhuma atividade planejada para ${checkinFormatDate(checkinSelectedDate)}</h2><p>Importe a planilha semanal ou cadastre uma atividade planejada para abrir o diário de campo.</p><button class="button button-green" onclick="checkinSetTab('planejamento')">Abrir planejamento</button></section>`}
  `;
}

function checkinRenderDailyReport(report, companies = checkinCompanies()) {
  const totalPlanned = report.activities.reduce((sum, activity) => sum + checkinParseNumber(activity.plannedMeters), 0);
  const totalExecuted = report.activities.reduce((sum, activity) => sum + checkinParseNumber(activity.executedMeters), 0);
  const checkinCount = report.activities.filter(activity => activity.checkinAt).length;
  const checkoutCount = report.activities.filter(activity => activity.checkoutAt).length;
  const allCheckedOut = report.activities.length > 0 && checkoutCount === report.activities.length;
  const overallStatus = allCheckedOut ? 'Fechado' : checkinCount ? `Iniciado ${checkinCount}/${report.activities.length}` : 'Planejado';
  const uniqueCardDisciplines = checkinUniqueOptions(report.activities.map(a => checkinGetActivityDiscipline(report, a)).filter(Boolean));
  const displayDiscipline = uniqueCardDisciplines.length === 1 ? uniqueCardDisciplines[0] : (report.discipline || 'Geral / várias');

  return `<article class="checkin-report-card" data-report-card="${esc(report.id)}">
    <header class="checkin-report-head">
      <div><div class="checkin-report-eyebrow">${esc(report.dh)} · ${esc(displayDiscipline)}</div><h2>${esc(report.engineer)}</h2><p>${esc(report.stage || 'Etapa não informada')}</p></div>
      <span class="checkin-report-state ${allCheckedOut ? 'closed' : checkinCount ? 'running' : ''}">${overallStatus}</span>
    </header>
    <div class="checkin-report-meta">
      <span><small>Empreiteira</small><strong data-meta-contractor="${esc(report.id)}">${esc(checkinReportContractorsDisplay(report))}</strong></span>
      <span><small>Responsável HC</small><strong>${esc(report.hcEngineer || report.engineer)}</strong></span>
      <span><small>Efetivo total</small><strong data-meta-crew="${esc(report.id)}">${checkinActualCrewTotal(report)} pessoas</strong></span>
      <span><small>Equipamentos (total)</small><strong data-meta-equip="${esc(report.id)}">${checkinActualPtaTotal(report)} PTA · ${checkinActualForkliftTotal(report)} empilhadeira(s)</strong></span>
      <span><small>Turno / clima</small><strong>${esc(report.shift || '—')} · ${esc(report.weather || '—')}</strong></span>
      <span><small>Supervisor</small><strong>${esc(report.supervisor || '—')}</strong></span>
      <span><small>Atividades com entrada / saida</small><strong>${checkinCount} / ${checkoutCount} de ${report.activities.length}</strong></span>
    </div>
    <div class="checkin-activity-table-wrap"><table class="checkin-activity-table">
      <thead><tr><th>Item / cronograma</th><th>Local e atividade</th><th>Un.</th><th>Prev. dia</th><th>Exec. dia</th><th>%</th><th>Status</th><th>Cod. problema</th><th>Observacao</th><th>Efetivo / Check-in por tarefa</th>${checkinCanDeletePlanning() ? '<th>Excluir</th>' : ''}</tr></thead>
      <tbody>${report.activities.map(activity => checkinRenderActivityRow(report, activity, companies)).join('')}</tbody>
      <tfoot><tr><th colspan="3">Total do diário</th><th>${checkinNumber(totalPlanned)} m</th><th>${checkinNumber(totalExecuted)} m</th><th>${totalPlanned ? `${checkinNumber(totalExecuted / totalPlanned * 100, 0)}%` : '—'}</th><th colspan="${checkinCanDeletePlanning() ? 5 : 4}"></th></tr></tfoot>
    </table></div>
    <footer class="checkin-report-actions">
      <span>Entradas registradas: ${checkinCount}/${report.activities.length} · saidas registradas: ${checkoutCount}/${report.activities.length}</span>
      <div>
        <button class="button button-outline compact" data-extra-button onclick="checkinOpenManualActivity('${esc(report.id)}',true)">Adicionar extra</button>
        <button class="button button-outline compact" onclick="checkinSaveDraft('${esc(report.id)}')">Salvar diário</button>
        <button class="button button-outline compact" onclick="checkinCopyWhatsApp('${esc(report.id)}','checkin')">Copiar check-in para WhatsApp</button>
        <button class="button button-outline compact" onclick="checkinCopyWhatsApp('${esc(report.id)}','checkout')">Copiar checkout para WhatsApp</button>
        ${checkinCanDeletePlanning() ? `<button class="button button-outline compact" onclick="checkinDeleteReport('${esc(report.id)}')">${report.activities.length ? 'Apagar planejamento / check-in / checkout' : 'Apagar diário vazio / check-in / checkout'}</button>` : ''}
      </div>
    </footer>
  </article>`;
}

function checkinHeaderInput(report, field, label, type = 'text') {
  const value = report[field] ?? (field === 'actualPtaCount' || field === 'forkliftCount' ? 0 : '');
  return `<label><span>${label}</span><input data-report-id="${esc(report.id)}" data-header-field="${field}" type="${type}" value="${esc(value)}" ${type === 'number' ? 'min="0" step="1"' : ''}></label>`;
}

function checkinActualCrewLabel(discipline) {
  const normalized = checkinNormalizeHeader(discipline);
  if (normalized.includes('hidraul')) return 'Efetivo real - Hidráulica';
  if (normalized.includes('isol')) return 'Efetivo real - Isolamento';
  if (normalized.includes('duto')) return 'Efetivo real - Dutos';
  if (normalized.includes('logist')) return 'Efetivo real - Logística';
  return 'Efetivo real da disciplina';
}

function checkinRenderActivityRow(report, activity, companies = checkinCompanies()) {
  const planned = checkinParseNumber(activity.plannedMeters);
  const executed = checkinParseNumber(activity.executedMeters);
  const percent = planned > 0 ? `${checkinNumber(executed / planned * 100, 0)}%` : executed ? 'Extra' : '—';
  const isClosed = Boolean(activity.checkoutAt);
  const isRunning = Boolean(activity.checkinAt && !activity.checkoutAt);
  const rowStateClass = isRunning ? 'is-running' : isClosed ? 'is-closed' : 'is-pending';
  const actDiscipline = checkinGetActivityDiscipline(report, activity);
  const taskContractor = activity.contractor || report.contractor || '';

  const statusPill = isRunning
    ? `<span class="checkin-status-pill running"><span class="pulse-dot"></span> Em andamento (${checkinFormatTime(activity.checkinAt)})</span>`
    : isClosed
      ? `<span class="checkin-status-pill closed">✓ Finalizada (${checkinFormatTime(activity.checkinAt)} → ${checkinFormatTime(activity.checkoutAt)})</span>`
      : `<span class="checkin-status-pill pending">Não iniciada</span>`;

  return `<tr class="checkin-activity-row ${rowStateClass}" data-report-id="${esc(report.id)}" data-activity-id="${esc(activity.id)}">
    <td>${statusPill}<strong>${esc(activity.pstItem || '—')}</strong><small>${esc(activity.scheduleId || 'Sem ID de cronograma')}</small></td>
    <td><strong>${esc(activity.location || '—')}</strong><small>${esc(activity.activity || '')}</small>${actDiscipline ? `<span class="checkin-discipline-tag">${esc(actDiscipline)}</span>` : ''}</td>
    <td>${esc(activity.unit || 'm')}</td>
    <td>${checkinNumber(planned)} ${esc(activity.unit || 'm')}</td>
    <td><input class="checkin-number-input" type="number" min="0" step="0.1" data-activity-field="executedMeters" value="${esc(executed)}" oninput="checkinUpdatePercent(this)"></td>
    <td class="checkin-percent-cell">${percent}</td>
    <td><select data-activity-field="status" onchange="checkinToggleExtraReason(this)">${CHECKIN_STATUS.map(status => `<option ${activity.status === status ? 'selected' : ''}>${status}</option>`).join('')}</select></td>
    <td><select data-activity-field="problemCode" onchange="checkinToggleOther(this)"><option value="">—</option>${CHECKIN_PROBLEMS.map(([code, label]) => `<option value="${code}" ${activity.problemCode === code ? 'selected' : ''}>${code} - ${label}</option>`).join('')}</select><input class="checkin-problem-other" data-activity-field="problemOther" placeholder="Descreva outro motivo" value="${esc(activity.problemOther || '')}" style="${activity.problemCode === 'OUTRO' ? '' : 'display:none'}"></td>
    <td><textarea class="checkin-note-input" data-activity-field="notes" rows="2" oninput="checkinResizeNote(this)" placeholder="${activity.status === CHECKIN_STATUS[3] ? 'Motivo da atividade extra' : 'Observacao'}" ${activity.status === CHECKIN_STATUS[3] ? 'required' : ''} maxlength="500">${esc(activity.notes || '')}</textarea></td>
    <td class="checkin-task-actions">
      <label class="checkin-task-field-label"><span>Empresa</span><select data-activity-field="contractor" onchange="checkinUpdateCardTotals(this)">${checkinSelectOptions(companies, taskContractor, 'Selecione a empresa')}</select></label>
      <label class="checkin-task-field-label"><span>${esc(checkinActualCrewLabel(actDiscipline || report.discipline))}</span><input type="number" min="0" step="1" data-activity-field="actualCrew" value="${activity.actualCrew ?? ''}" placeholder="Pessoas" style="${isRunning ? 'border-color:#16a34a;' : ''}" oninput="checkinUpdateCardTotals(this)"></label>
      <div class="checkin-task-equip-grid">
        <label class="checkin-task-field-label"><span>Qtd PTA</span><input type="number" min="0" step="1" data-activity-field="ptaCount" value="${activity.ptaCount ?? ''}" placeholder="0" oninput="checkinUpdateCardTotals(this)"></label>
        <label class="checkin-task-field-label"><span>Empilhadeira</span><input type="number" min="0" step="1" data-activity-field="forkliftCount" value="${activity.forkliftCount ?? ''}" placeholder="0" oninput="checkinUpdateCardTotals(this)"></label>
      </div>
      ${isRunning ? `
        <div class="checkin-time-box running"><strong>● Entrada: ${checkinFormatTime(activity.checkinAt)}</strong><small>Check-in ativo</small></div>
        <button class="button button-green compact" onclick="checkinRegister('${esc(report.id)}','checkout','${esc(activity.id)}')">Registrar saída</button>
        <button class="button button-outline compact" onclick="checkinRegister('${esc(report.id)}','checkin','${esc(activity.id)}')">Alterar entrada</button>
      ` : isClosed ? `
        <div class="checkin-time-box closed"><strong>✓ Finalizada</strong><small>${checkinFormatTime(activity.checkinAt)} às ${checkinFormatTime(activity.checkoutAt)}</small></div>
        <button class="button button-outline compact" onclick="checkinRegister('${esc(report.id)}','checkout','${esc(activity.id)}')">Alterar saída</button>
        <button class="button button-outline compact" onclick="checkinRegister('${esc(report.id)}','checkin','${esc(activity.id)}')">Alterar entrada</button>
      ` : `
        <small>Sem registro de horário</small>
        <button class="button button-green compact" onclick="checkinRegister('${esc(report.id)}','checkin','${esc(activity.id)}')">Registrar entrada</button>
        <button class="button button-outline compact" disabled>Registrar saída</button>
      `}
    </td>
    ${checkinCanDeletePlanning() ? `<td><button class="button button-outline compact" onclick="checkinDeleteActivity('${esc(report.id)}','${esc(activity.id)}')">Excluir</button></td>` : ''}
  </tr>`;
}

function checkinResizeNote(textarea) {
  textarea.style.height = 'auto';
  textarea.style.height = `${Math.max(textarea.scrollHeight, 52)}px`;
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

function checkinToggleExtraReason(select) {
  const input = select.closest('tr')?.querySelector('[data-activity-field="notes"]');
  const isExtra = select.value === CHECKIN_STATUS[3];
  if (input) {
    input.required = isExtra;
    input.placeholder = isExtra ? 'Motivo da atividade extra' : 'Observação';
  }
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
      activity[field] = field === 'executedMeters' ? checkinParseNumber(input.value)
        : (field === 'actualCrew' || field === 'ptaCount' || field === 'forkliftCount') ? (input.value === '' ? null : checkinParseNumber(input.value))
          : typeof input.value === 'string' ? input.value.trim() : input.value;
    });
    if (activity.contractor && !next.contractor) {
      next.contractor = activity.contractor;
    }
  });
  next.actualCrew = checkinActualCrewTotal(next);
  next.actualPtaCount = checkinActualPtaTotal(next);
  next.forkliftCount = checkinActualForkliftTotal(next);
  const taskCompanies = checkinUniqueOptions((next.activities || []).map(a => a.contractor).filter(Boolean));
  if (taskCompanies.length === 1) next.contractor = taskCompanies[0];
  else if (taskCompanies.length > 1) next.contractor = taskCompanies.join(', ');
  return next;
}

async function checkinSaveDraft(reportId) {
  const report = checkinCaptureReport(reportId);
  if (!report) return;
  await checkinPersistReports(report);
  renderCheckIn();
}

async function checkinRegister(reportId, action, activityId) {
  const report = checkinCaptureReport(reportId);
  if (!report) return;
  const activity = report.activities.find(item => item.id === activityId);
  if (!activity) return toast('Selecione uma tarefa para registrar o horario.', true);

  if (action === 'checkin') {
    const taskContractor = activity.contractor || report.contractor;
    const availableCompanies = checkinCompanies();
    if (!taskContractor && availableCompanies.length) {
      const selectEl = document.querySelector(`[data-activity-id="${CSS.escape(activityId)}"] select[data-activity-field="contractor"]`)
        || document.querySelector(`[data-report-card="${CSS.escape(reportId)}"] select[data-header-field="contractor"]`);
      if (selectEl) selectEl.focus();
      return toast('Selecione a empresa / empreiteira da tarefa antes de fazer o check-in.', true);
    }
    if (activity.actualCrew === null || activity.actualCrew === undefined || activity.actualCrew === '') return toast('Informe o efetivo real desta tarefa antes do check-in.', true);
    if (Number(activity.actualCrew) < 1) return toast('Informe ao menos uma pessoa nesta tarefa antes do check-in.', true);
    report.actualCrew = checkinActualCrewTotal(report);
  } else if (action !== 'checkout') {
    return;
  }

  if (action === 'checkout' && !activity.checkinAt) return toast('Registre a entrada desta tarefa antes da saida.', true);
  if (action === 'checkout' && activity.status === CHECKIN_STATUS[3] && !String(activity.notes || '').trim()) {
    return toast('Informe o motivo da atividade extra antes do checkout.', true);
  }
  if (action === 'checkout' && ['Parcial', CHECKIN_STATUS[2], 'Suspenso'].includes(activity.status)
    && (!activity.problemCode || (activity.problemCode === 'OUTRO' && !String(activity.problemOther || '').trim()))) {
    return toast('Selecione o codigo do motivo para esta tarefa antes do checkout.', true);
  }

  const now = new Date().toISOString();
  if (action === 'checkin') {
    activity.checkinAt = now;
    if (!activity.status || activity.status === CHECKIN_STATUS[2]) activity.status = 'Iniciado';
  } else {
    activity.checkoutAt = now;
  }

  const checkedIn = report.activities.filter(item => item.checkinAt);
  const checkedOut = report.activities.filter(item => item.checkoutAt);
  report.checkinAt = checkedIn.map(item => item.checkinAt).sort()[0] || '';
  report.checkoutAt = report.activities.length && checkedOut.length === report.activities.length
    ? checkedOut.map(item => item.checkoutAt).sort().at(-1) : '';
  report.status = report.checkoutAt ? 'fechado' : report.checkinAt ? 'iniciado' : 'planejado';
  await checkinPersistReports(report);
  renderCheckIn();
}

function checkinProblemLabel(code, other = '') {
  if (code === 'OUTRO') return `Outro${other ? `: ${other}` : ''}`;
  const item = CHECKIN_PROBLEMS.find(([value]) => value === code);
  return item ? `${item[0]} - ${item[1]}` : '';
}

function checkinExtraReasonFields() {
  return `<label class="wide"><span>Motivo do imprevisto <em>*</em></span><select name="extraReasonCode" required onchange="checkinToggleExtraReasonOther(this)"><option value="">Selecione um motivo</option>${CHECKIN_PROBLEMS.map(([code, label]) => `<option value="${code}">${code === 'OUTRO' ? 'Outro' : `${code} - ${label}`}</option>`).join('')}</select></label>
    <label class="wide" data-extra-reason-other style="display:none"><span>Descreva o imprevisto <em>*</em></span><input name="extraReasonOther" maxlength="500" placeholder="Descreva o motivo"></label>`;
}

function checkinToggleExtraReasonOther(select) {
  const field = select.closest('form')?.querySelector('[data-extra-reason-other]');
  const input = field?.querySelector('input[name="extraReasonOther"]');
  const show = select.value === 'OUTRO';
  if (field) field.style.display = show ? '' : 'none';
  if (input) input.required = show;
}

function checkinExtraReasonFromForm(data) {
  if (data.extraReasonCode === 'OUTRO') {
    const other = String(data.extraReasonOther || '').trim();
    return other ? checkinProblemLabel('OUTRO', other) : '';
  }
  return checkinProblemLabel(String(data.extraReasonCode || '').trim());
}

function checkinBuildWhatsApp(report, action) {
  const isCheckout = action === 'checkout';
  const reportActivities = report.activities.filter(activity => isCheckout ? activity.checkoutAt : activity.checkinAt);
  const lines = [
    `*${isCheckout ? 'CHECK-OUT' : 'CHECK-IN'} DIÁRIO — ${report.dh}*`,
    `Data: ${checkinFormatDate(report.workDate)}${isCheckout ? ` · Saída: ${checkinFormatTime(report.checkoutAt || new Date().toISOString())}` : ` · Entrada: ${checkinFormatTime(report.checkinAt || new Date().toISOString())}`}`,
    `Engenheiro: ${report.engineer}`,
    `Disciplina: ${report.discipline || '—'} · Etapa: ${report.stage || '—'}`,
    `Turno: ${report.shift || '—'}`,
    `Empreiteira: ${report.contractor || '—'}`,
    `Eng. responsável HC: ${report.hcEngineer || report.engineer}`,
    `Equipamentos: ${checkinActualPtaTotal(report)} PTA · ${checkinActualForkliftTotal(report)} empilhadeira(s)`,
    '',
    `Efetivo real informado nas tarefas: ${reportActivities.reduce((sum, activity) => sum + (Number(activity.actualCrew) || 0), 0)} pessoas`,
    '*Atividades do dia*'
  ];
  reportActivities.forEach((activity, index) => {
    const planned = checkinNumber(activity.plannedMeters);
    const executed = checkinNumber(activity.executedMeters);
    const actDiscipline = checkinGetActivityDiscipline(report, activity);
    lines.push(`${index + 1}. ${[activity.pstItem, activity.scheduleId, activity.activity].filter(Boolean).join(' · ')}`);
    lines.push(`   Efetivo real: ${Number(activity.actualCrew || 0)} pessoas - ${checkinActualCrewLabel(actDiscipline || activity.discipline || report.discipline)}`);
    if (activity.contractor && activity.contractor !== report.contractor) lines.push(`   Empresa: ${activity.contractor}`);
    if (Number(activity.ptaCount) || Number(activity.forkliftCount)) {
      lines.push(`   Equipamentos: ${Number(activity.ptaCount || 0)} PTA · ${Number(activity.forkliftCount || 0)} empilhadeira(s)`);
    }
    lines.push(`   ${activity.location || 'Local não informado'} · Previsto ${planned} ${activity.unit || 'm'}${isCheckout ? ` · Executado ${executed} ${activity.unit || 'm'} · ${activity.status || 'Não iniciado'}` : ''}`);
    lines.push(`   Entrada: ${checkinFormatTime(activity.checkinAt)}${isCheckout ? ` · Saida: ${checkinFormatTime(activity.checkoutAt)}` : ''}`);
    if (!isCheckout && activity.status === CHECKIN_STATUS[3]) lines.push('   Tipo: Atividade extra (não programada)');
    if (isCheckout && activity.problemCode) lines.push(`   Desvio: ${checkinProblemLabel(activity.problemCode, activity.problemOther)}`);
    if (isCheckout && activity.notes) lines.push(`   Obs.: ${activity.notes}`);
  });
  if (report.weather) lines.push('', `Clima: ${report.weather}`);
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

function checkinCopyDayWhatsApp(action) {
  const isCheckout = action === 'checkout';
  const dayReports = checkinReports.filter(report => report.workDate === checkinSelectedDate
    && report.activities.some(activity => isCheckout ? activity.checkoutAt : activity.checkinAt));
  if (!dayReports.length) return toast(`Nenhum ${isCheckout ? 'checkout' : 'check-in'} registrado em ${checkinFormatDate(checkinSelectedDate)}.`, true);
  const text = dayReports
    .sort((a, b) => a.dh.localeCompare(b.dh) || a.engineer.localeCompare(b.engineer, 'pt-BR'))
    .map(report => checkinBuildWhatsApp(report, action))
    .join('\n\n--------------------\n\n');
  checkinCopyText(text, `Todos os ${isCheckout ? 'checkouts' : 'check-ins'} do dia foram copiados.`);
}

function checkinCopyText(text, successMessage) {
  const fallbackCopy = () => {
    const area = document.createElement('textarea');
    area.value = text;
    area.style.position = 'fixed'; area.style.opacity = '0';
    document.body.appendChild(area); area.select();
    const copied = document.execCommand('copy'); area.remove();
    if (copied) toast(successMessage);
    else toast('NÃ£o foi possÃ­vel copiar o resumo.', true);
  };
  if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).then(() => toast(successMessage)).catch(fallbackCopy);
  else fallbackCopy();
}

function checkinSetTab(tab) {
  checkinActiveTab = ['diario', 'planejamento', 'curva'].includes(tab) ? tab : 'diario';
  renderCheckIn();
}

function checkinSetDay(value) {
  if (!value) return;
  checkinSelectedDate = value;
  checkinDisciplineFilter = '';
  checkinEngineerFilter = '';
  checkinDhFilter = '';
  checkinCompanyFilter = '';
  renderCheckIn();
}

function checkinSetDailyFilter(key, value) {
  if (key === 'discipline') checkinDisciplineFilter = value;
  if (key === 'engineer') checkinEngineerFilter = value;
  if (key === 'dh') checkinDhFilter = value;
  if (key === 'company') checkinCompanyFilter = value;
  renderCheckIn();
}

function checkinRenderPlanning(engineers, dataHalls, disciplines = checkinAllDisciplines(), companies = checkinCompanies()) {
  const reports = checkinReports.filter(report => report.workDate >= checkinPlanStart && report.workDate <= checkinPlanEnd
    && (!checkinPlanEngineerFilter || report.engineer === checkinPlanEngineerFilter)
    && (!checkinPlanCompanyFilter || (report.contractor === checkinPlanCompanyFilter || (report.activities || []).some(a => a.contractor === checkinPlanCompanyFilter))));

  const rows = reports.flatMap(report =>
    (report.activities || [])
      .filter(activity => !checkinPlanDisciplineFilter || checkinGetActivityDiscipline(report, activity) === checkinPlanDisciplineFilter)
      .filter(activity => !checkinPlanCompanyFilter || (activity.contractor ? activity.contractor === checkinPlanCompanyFilter : report.contractor === checkinPlanCompanyFilter))
      .map(activity => ({ report, activity }))
  ).sort((a, b) => a.report.workDate.localeCompare(b.report.workDate) || a.report.dh.localeCompare(b.report.dh) || a.report.engineer.localeCompare(b.report.engineer));
  const planned = rows.reduce((sum, item) => sum + checkinParseNumber(item.activity.plannedMeters), 0);

  return `<section class="checkin-filter-panel checkin-plan-filter">
    <label><span>De</span><input type="date" value="${checkinPlanStart}" onchange="checkinSetPlanRange('start',this.value)"></label>
    <label><span>Até</span><input type="date" value="${checkinPlanEnd}" onchange="checkinSetPlanRange('end',this.value)"></label>
    <label><span>Disciplina</span><select onchange="checkinSetPlanDisciplineFilter(this.value)">${checkinSelectOptions(disciplines, checkinPlanDisciplineFilter, 'Todas')}</select></label>
    <label><span>Empresa</span><select onchange="checkinSetPlanCompanyFilter(this.value)">${checkinSelectOptions(companies, checkinPlanCompanyFilter, 'Todas')}</select></label>
    <label><span>Engenheiro</span><select onchange="checkinSetPlanEngineerFilter(this.value)">${checkinSelectOptions(engineers, checkinPlanEngineerFilter, 'Todos')}</select></label>
    ${checkinCanManagePlanning() ? `<button class="button button-outline" onclick="checkinOpenImport()">${icon('upload')} Importar planilha semanal</button>` : ''}
    <button class="button button-outline" onclick="checkinDownloadTemplate()">${icon('download')} Baixar modelo XLSX</button>
  </section>
  <section class="checkin-plan-summary"><strong>${rows.length}</strong> atividade(s) · <strong>${checkinNumber(planned)} m</strong> planejados · ${reports.length} diário(s) por engenheiro e DH</section>
  ${rows.length ? `<article class="checkin-report-card"><div class="checkin-activity-table-wrap"><table class="checkin-activity-table checkin-plan-table"><thead><tr><th>Data / DH</th><th>Engenheiro / empreiteira</th><th>Disciplina / etapa</th><th>Item / cronograma</th><th>Local / atividade</th><th>Planejado</th></tr></thead><tbody>${rows.map(({ report, activity }) => `<tr><td>${checkinFormatDate(report.workDate)}<small>${esc(report.dh)}</small></td><td>${esc(report.engineer)}<small>${esc(activity.contractor || report.contractor || '—')}</small></td><td><strong>${esc(checkinGetActivityDiscipline(report, activity) || report.discipline || '—')}</strong><small>${esc(activity.stage || report.stage || '—')}</small></td><td><strong>${esc(activity.pstItem || '—')}</strong><small>${esc(activity.scheduleId || activity.unit || '')}</small></td><td><strong>${esc(activity.location || '—')}</strong><small>${esc(activity.activity || '')}</small></td><td>${checkinNumber(activity.plannedMeters)} ${esc(activity.unit || 'm')}</td></tr>`).join('')}</tbody></table></div></article>` : `<section class="checkin-empty"><h2>Nenhum planejamento neste período</h2><p>Importe uma planilha semanal para abrir a agenda de atividades.</p></section>`}`;
}

function checkinSetPlanRange(which, value) {
  if (which === 'start') checkinPlanStart = value;
  else checkinPlanEnd = value;
  renderCheckIn();
}

function checkinSetPlanEngineerFilter(value) {
  checkinPlanEngineerFilter = value;
  renderCheckIn();
}

function checkinSetPlanCompanyFilter(value) {
  checkinPlanCompanyFilter = value;
  renderCheckIn();
}

function checkinSetPlanDisciplineFilter(value) {
  checkinPlanDisciplineFilter = value;
  renderCheckIn();
}

async function checkinUpdateContractor(reportId, company) {
  const report = checkinGetReport(reportId);
  if (!report) return;
  report.contractor = company;
  const metaEl = document.querySelector(`[data-meta-contractor="${CSS.escape(reportId)}"]`);
  if (metaEl) metaEl.textContent = company || '—';
  await checkinPersistReports(report, { silent: true });
  if (checkinCompanyFilter && checkinCompanyFilter !== company) {
    renderCheckIn();
  }
}

async function checkinLoadTestTasks({ silent = false, testDate = checkinToday(), engineer = CHECKIN_TEST_ENGINEER } = {}) {
  const contractor = checkinCompanies()[0] || '';
  const samples = [
    { dh: 'DH 01', discipline: 'Hidráulica', location: 'Sala Elétrica DH 01', activity: 'Teste: montagem de tubulação', unit: 'm', plannedMeters: 12 },
    { dh: 'DH 04', discipline: 'Isolamento', location: 'Sala RMU 4.4', activity: 'Teste: isolamento térmico', unit: 'm²', plannedMeters: 8 },
    { dh: 'DH 07', discipline: 'Duto', location: 'Sala de Máquinas DH 07', activity: 'Teste: instalação de dutos', unit: 'm', plannedMeters: 10 },
    { dh: 'DH 10', discipline: 'Logística', location: 'Sala de Apoio DH 10', activity: 'Teste: recebimento e distribuição de materiais', unit: 'un', plannedMeters: 5 }
  ];
  const changed = [];
  samples.forEach((sample, index) => {
    const id = checkinReportId(testDate, sample.dh, engineer);
    const report = checkinGetReport(id) || checkinCreateReport({
      workDate: testDate, dh: sample.dh, engineer, discipline: sample.discipline,
      stage: 'TESTE', contractor, hcEngineer: engineer, shift: 'Diurno', weather: 'Ensolarado', actualCrew: 1
    });
    const activityId = `${id}-test-room-${String(index + 1).padStart(2, '0')}`;
    if (!report.activities.some(activity => activity.id === activityId)) {
      report.activities.push({
        id: activityId, pstItem: `TESTE-${String(index + 1).padStart(2, '0')}`,
        scheduleId: `TESTE-${sample.dh.replace(' ', '')}-${String(index + 1).padStart(3, '0')}`,
        location: sample.location, activity: sample.activity, discipline: sample.discipline, actualCrew: 1, unit: sample.unit,
        plannedMeters: sample.plannedMeters, executedMeters: 0, status: 'Não iniciado',
        problemCode: '', problemOther: '', notes: 'Dado fictício para teste'
      });
      changed.push(report);
    }
  });
  if (!changed.length) return false;
  await checkinPersistReports(changed, { silent });
  if (!silent) {
    checkinActiveTab = 'planejamento';
    checkinPlanStart = testDate;
    checkinPlanEnd = testDate;
    renderCheckIn();
  }
  return true;
}

async function checkinEnsureTestTasks() {
  const existingTests = checkinReports.filter(report => report.activities.some(activity => String(activity.id || '').includes('-test-room-')));
  const testDate = checkinToday();
  const registeredCompany = checkinCompanies()[0] || '';
  const updates = existingTests.filter(report => (!report.contractor && registeredCompany) || report.activities.some(activity => activity.actualCrew === null || activity.actualCrew === undefined));
  updates.forEach(report => {
    if (!report.contractor && registeredCompany) report.contractor = registeredCompany;
    report.activities.forEach(activity => { if (activity.actualCrew === null || activity.actualCrew === undefined) activity.actualCrew = 1; });
    report.actualCrew = checkinActualCrewTotal(report);
  });
  if (updates.length) await checkinPersistReports(updates, { silent: true });
  await checkinLoadTestTasks({ silent: true, testDate });
}

function checkinOpenImport() {
  if (!checkinCanManagePlanning()) return toast('Somente coordenação pode alterar a agenda enviada aos engenheiros.', true);
  modal(`${modalHead('Importar planejamento semanal', 'Uma linha por atividade. Os registros existentes preservam check-in e executado.')}
    <div class="modal-body checkin-import-body">
      <div class="notice">Importe o modelo semanal ou a planilha de check-out com abas por DH. A data de cada bloco, o responsavel e as atividades programadas serao lidos automaticamente.</div>
      <label class="checkin-upload-box"><span>${icon('upload')} Selecione um arquivo XLSX, XLS ou CSV</span><input type="file" accept=".xlsx,.xls,.csv" onchange="checkinImportWeekly(event)"></label>
      <p>Nas abas por DH, o sistema tambem importa executado, status, codigo do problema e observacoes. Se o responsavel estiver vazio, o diario fica marcado como "Responsavel a definir".</p>
    </div>
    <div class="modal-foot"><button class="button button-outline" onclick="closeModal()">Fechar</button><button class="button button-outline" onclick="checkinDownloadTemplate()">Baixar modelo</button></div>`, 'modal-small');
  if (typeof hydrateIcons === 'function') hydrateIcons();
}

async function checkinDownloadTemplate() {
  if (!window.ExcelJS) return toast('O gerador de planilhas ainda está carregando.', true);
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Heating Cooling';
  const sheet = workbook.addWorksheet('PLANEJAMENTO');
  const companies = checkinCompanies();
  const engineers = checkinEngineers();
  const headers = ['Data', 'DH', 'Disciplina', 'Etapa', 'Empreiteira', 'Engenheiro', 'Eng. Responsável HC', 'Supervisor', 'Turno', 'Clima', 'Qtd pessoas', 'Efetivo Hidráulica', 'Efetivo Dutos', 'Efetivo Isolamento', 'Efetivo Logística', 'Item PST', 'ID Cronograma', 'Local', 'Atividade', 'Unidade', 'Previsto Dia'];
  sheet.addRow(headers);
  sheet.addRow([checkinToday(), 'DH 02', 'Hidráulica', 'Corredor Fan Wall B', companies[0] || '', engineers[0] || '', engineers[0] || '', '', 'Diurno', 'Ensolarado', 6, 6, 0, 0, 0, '85', '04-SR-MO-2100', 'CORREDOR SUPERCORE', 'Montagem da tubulação', 'm', 10]);
  sheet.columns = headers.map((header, index) => ({ header, width: [30, 12, 18, 25, 24, 24, 24, 20, 14, 18, 14, 20, 18, 22, 20, 12, 22, 24, 42, 14, 16][index] }));
  sheet.getRow(1).height = 30;
  sheet.getRow(1).eachCell(cell => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF213F91' } };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
  });
  sheet.views = [{ state: 'frozen', ySplit: 1 }];
  sheet.autoFilter = { from: 'A1', to: `U2` };
  const validationLists = [
    ['B2:B500', CHECKIN_DATA_HALLS, 'Selecione um DH entre DH 01 e DH 10.'],
    ['C2:C500', CHECKIN_DISCIPLINES, 'Selecione uma disciplina da lista.'],
    ['I2:I500', CHECKIN_SHIFTS, 'Selecione Diurno ou Noturno.'],
    ['J2:J500', CHECKIN_WEATHER, 'Selecione uma condição climática da lista.'],
    ['T2:T500', CHECKIN_UNITS, 'Selecione uma unidade da lista.']
  ];
  validationLists.forEach(([range, values, error]) => sheet.dataValidations.add(range, {
    type: 'list', allowBlank: true, formulae: [`"${values.join(',')}"`],
    showErrorMessage: true, errorTitle: 'Valor inválido', error
  }));
  if (companies.length || engineers.length) {
    const lists = workbook.addWorksheet('LISTAS');
    companies.forEach((company, index) => { lists.getCell(`A${index + 1}`).value = company; });
    engineers.forEach((engineer, index) => { lists.getCell(`B${index + 1}`).value = engineer; });
    lists.state = 'hidden';
    if (companies.length) workbook.definedNames.add(`LISTAS!$A$1:$A$${companies.length}`, 'EMPRESAS_CADASTRADAS');
    if (engineers.length) workbook.definedNames.add(`LISTAS!$B$1:$B$${engineers.length}`, 'ENGENHEIROS_CADASTRADOS');
    if (companies.length) sheet.dataValidations.add('E2:E500', {
      type: 'list', allowBlank: true, formulae: ['EMPRESAS_CADASTRADAS'],
      showErrorMessage: true, errorTitle: 'Empresa não cadastrada',
      error: 'Selecione uma empresa cadastrada no Efetivo.'
    });
  }
  if (engineers.length) sheet.dataValidations.add('F2:F500', {
    type: 'list', allowBlank: false, formulae: ['ENGENHEIROS_CADASTRADOS'],
    showErrorMessage: true, errorTitle: 'Engenheiro não cadastrado',
    error: 'Selecione um engenheiro cadastrado no Efetivo.'
  });
  const guide = workbook.addWorksheet('INSTRUCOES');
  guide.addRows([
    ['MODELO SEMANAL DE PLANEJAMENTO — CHECK-IN / CHECK-OUT'],
    ['Preencha uma linha por atividade e repita os dados do diário nas linhas correspondentes.'],
    ['Campos obrigatórios: Data, DH, Engenheiro, Atividade e Previsto Dia.'],
    ['DH, Empreiteira, Engenheiro, Disciplina, Turno, Clima e Unidade usam listas suspensas.'],
    ['A lista de empreiteiras vem das empresas cadastradas no Efetivo no momento do download.'],
    ['A lista de engenheiros vem das funções de engenharia cadastradas no Efetivo.'],
    ['Atividade e Local são campos livres: digite o serviço e a sala mesmo quando forem novos.'],
    ['A data aceita AAAA-MM-DD ou DD/MM/AAAA. A quantidade planejada pode usar vírgula decimal.'],
    ['A importação atualiza o planejamento e preserva valores executados, check-in/out e desvios já registrados.']
  ]);
  guide.getColumn(1).width = 120;
  const buffer = await workbook.xlsx.writeBuffer();
  const url = URL.createObjectURL(new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
  const link = document.createElement('a'); link.href = url; link.download = 'Modelo_Semanal_Checkin_Checkout.xlsx'; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
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

function checkinReadDhWorkbook(workbook) {
  const sheets = workbook.SheetNames
    .map(name => ({ name, match: String(name).match(/^DH\s*0?(\d{1,2})$/i) }))
    .filter(item => item.match && Number(item.match[1]) >= 1 && Number(item.match[1]) <= 10);
  if (!sheets.length) return null;

  const grouped = new Map();
  const rejectionReasons = [];
  let rejected = 0;
  let missingEngineers = 0;
  sheets.forEach(({ name, match }) => {
    const dh = `DH ${String(Number(match[1])).padStart(2, '0')}`;
    const sheet = workbook.Sheets[name];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '', raw: true });
    const engineer = String(rows[2]?.[2] || '').trim() || 'Responsável a definir';
    if (engineer === 'Responsável a definir') missingEngineers += 1;
    let activeDiscipline = '';

    rows.forEach((row, rowIndex) => {
      const metadata = String(row[12] || '').split('|');
      const workDate = checkinParseDate(metadata[0]);
      
      // Detecção de linhas de seção como linha 161 ("ISOLAMENTO — 3 atividade(s) programada(s)") ou 169 ("DUTOS — 1 atividade(s) programada(s)")
      const rowJoined = checkinNormalizeHeader(row.filter(cell => cell !== undefined && cell !== null).join(' '));
      if (/interferencia/.test(rowJoined)) {
        activeDiscipline = '';
      } else {
        const hasSectionPattern = /atividade.*programad|programad|disciplina|frente/.test(rowJoined) || /^(?:isolamento|dutos?|hidraulica|logistica)\b/.test(rowJoined);
        if (hasSectionPattern) {
          if (/isolament/.test(rowJoined)) activeDiscipline = 'Isolamento';
          else if (/hidraul|hidrante|tubul/.test(rowJoined)) activeDiscipline = 'Hidráulica';
          else if (/duto/.test(rowJoined)) activeDiscipline = 'Duto';
          else if (/logist/.test(rowJoined)) activeDiscipline = 'Logística';
        }
      }

      const pstItem = String(row[0] || '').trim();
      const scheduleId = String(row[1] || '').trim();
      const location = String(row[2] || '').trim();
      const activityText = String(row[3] || '').trim();
      const unit = String(row[4] || '').trim() || 'm';
      const plannedValue = row[5];
      if (!workDate && !activityText) return;

      const fallbackDiscipline = activityText ? checkinGetActivityDiscipline({ discipline: activeDiscipline }, {
        pstItem, scheduleId, location, activity: activityText
      }) : '';
      const discipline = String(activeDiscipline || fallbackDiscipline || metadata[1] || '').trim();
      if (!activityText) {
        if (!workDate) return;
        const blankReportId = checkinReportId(workDate, dh, engineer);
        const blankReport = grouped.get(blankReportId) || checkinCreateReport({
          workDate, dh, engineer, discipline, hcEngineer: engineer
        });
        if (blankReport.discipline && discipline && blankReport.discipline !== discipline) blankReport.discipline = 'Geral / varias';
        grouped.set(blankReportId, blankReport);
        return;
      }

      const reasons = [];
      if (!workDate) reasons.push('data não identificada no bloco do DH');
      if (plannedValue === '' || plannedValue === undefined || plannedValue === null) reasons.push('Prev. dia vazio');
      if (reasons.length) {
        rejected += 1;
        rejectionReasons.push(`Aba ${name}, linha ${rowIndex + 1}: ${reasons.join('; ')}`);
        return;
      }

      const id = checkinReportId(workDate, dh, engineer);
      let report = grouped.get(id);
      if (!report) {
        report = checkinCreateReport({
          workDate, dh, engineer, discipline,
          hcEngineer: engineer,
          contractor: '',
          shift: String(rows[2]?.[10] || '').trim()
        });
      }
      if (report.discipline && discipline && report.discipline !== discipline) report.discipline = 'Geral / varias';
      const activityId = `${id}-task-${checkinSlug(scheduleId || pstItem || `${location}-${activityText}`)}`;
      const currentStatus = String(row[8] || '').trim();
      const executedValue = row[6];
      const executedMeters = executedValue === '' || executedValue === undefined || executedValue === null
        ? 0 : checkinParseNumber(executedValue);
      const plannedMeters = checkinParseNumber(plannedValue);
      const status = CHECKIN_STATUS.includes(currentStatus)
        ? currentStatus
        : executedMeters > 0 && executedMeters >= plannedMeters ? CHECKIN_STATUS[0]
          : executedMeters > 0 ? CHECKIN_STATUS[1] : CHECKIN_STATUS[2];
      const rawProblem = String(row[9] || '').trim();
      const problemMatch = rawProblem.match(/^\s*(\d{1,2})(?:\s*[-:].*)?$/);
      const problemCode = problemMatch ? problemMatch[1].padStart(2, '0') : rawProblem ? 'OUTRO' : '';
      const activity = {
        id: activityId, pstItem, scheduleId, location, activity: activityText,
        discipline, actualCrew: null, unit, plannedMeters, executedMeters, status,
        problemCode, problemOther: problemCode === 'OUTRO' ? rawProblem : '',
        notes: String(row[10] || '').trim()
      };
      const existingIndex = report.activities.findIndex(item => item.id === activityId);
      if (existingIndex >= 0) report.activities[existingIndex] = activity;
      else report.activities.push(activity);
      grouped.set(id, report);
    });
  });
  return { grouped, rejected, rejectionReasons, missingEngineers };
}

async function checkinImportWeekly(event) {
  if (!checkinCanManagePlanning()) return toast('Somente coordenação pode alterar a agenda enviada aos engenheiros.', true);
  const file = event.target.files?.[0];
  if (!file) return;
  if (!window.XLSX) return toast('A biblioteca de planilhas ainda está carregando.', true);
  try {
    const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array', cellDates: true });
    const dhImport = checkinReadDhWorkbook(workbook);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = dhImport ? [] : XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '', raw: true });
    if (!dhImport && rows.length < 2) throw new Error('A planilha não contém linhas de atividades.');
    const headers = dhImport ? [] : rows[0].map(checkinNormalizeHeader);
    const indexByHeader = new Map(headers.map((header, index) => [header, index]));
    const aliases = {
      date: ['data', 'dia', 'data atividade', 'work date'],
      dh: ['dh', 'data hall'],
      engineer: ['engenheiro', 'engenheiro designado', 'responsavel da atividade'],
      discipline: ['disciplina'], stage: ['etapa'], front: ['frente'], contractor: ['empreiteira', 'empreiteira s', 'contratada'], weather: ['clima', 'clima condicao da frente'],
      hcEngineer: ['eng responsavel hc', 'engenheiro responsavel hc'], supervisor: ['supervisor'], shift: ['turno'],
      teamSize: ['qtd pessoas', 'qtd de pessoas', 'quantidade de pessoas'], hydraulicCrew: ['efetivo hidraulica', 'qtd pessoas hidraulica'], ductCrew: ['efetivo dutos'], isolationCrew: ['efetivo isolamento'], logisticsCrew: ['efetivo logistica'],
      pstItem: ['item pst', 'item'], scheduleId: ['id cronograma', 'cronograma', 'id atividade'], location: ['local', 'localizacao'],
      activity: ['atividade', 'descricao atividade', 'servico'], unit: ['unidade', 'und', 'un'], plannedMeters: ['previsto dia', 'previsto dia m', 'prev dia m', 'prev dia', 'planejado dia', 'planejado dia m', 'metros planejados', 'quantidade planejada']
    };
    const grouped = dhImport?.grouped || new Map();
    const registeredCompanies = checkinCompanies();
    const registeredEngineers = checkinEngineers();
    let rejected = dhImport?.rejected || 0;
    const rejectionReasons = dhImport?.rejectionReasons || [];
    for (let rowIndex = 1; !dhImport && rowIndex < rows.length; rowIndex += 1) {
      const row = rows[rowIndex];
      if (!row.some(cell => String(cell).trim())) continue;
      const data = Object.fromEntries(Object.entries(aliases).map(([key, names]) => [key, checkinImportValue(row, indexByHeader, names)]));
      const workDate = checkinParseDate(data.date);
      const dh = checkinNormalizeDataHall(data.dh);
      const engineer = String(data.engineer || data.hcEngineer || '').trim();
      const activityText = String(data.activity || '').trim();
      const contractor = String(data.contractor || '').trim();
      const reasons = [];
      if (!workDate) reasons.push('Data inválida ou vazia');
      if (!dh) reasons.push('DH inválido ou vazio (use DH 01 a DH 10)');
      if (!engineer) reasons.push('Engenheiro vazio');
      else if (!registeredEngineers.includes(engineer)) reasons.push(`Engenheiro "${engineer}" não está cadastrado/ativo`);
      if (!activityText) reasons.push('Atividade vazia');
      if (data.plannedMeters === '') reasons.push('Previsto Dia vazio');
      if (contractor && !registeredCompanies.includes(contractor)) reasons.push(`Empreiteira "${contractor}" não está cadastrada`);
      if (reasons.length) {
        rejected += 1;
        rejectionReasons.push(`Linha ${rowIndex + 1}: ${reasons.join('; ')}`);
        continue;
      }
      const id = checkinReportId(workDate, dh, engineer);
      let report = grouped.get(id);
      if (!report) report = checkinCreateReport({ workDate, dh, engineer, ...data });
      else {
        for (const key of ['discipline', 'stage', 'front', 'contractor', 'hcEngineer', 'supervisor', 'shift', 'teamSize', 'hydraulicCrew', 'ductCrew', 'isolationCrew', 'logisticsCrew', 'weather']) {
          if (data[key] !== '' && data[key] !== undefined) report[key] = data[key];
        }
      }
      const scheduleId = String(data.scheduleId || '').trim();
      const pstItem = String(data.pstItem || '').trim();
      const activityId = `${id}-task-${checkinSlug(scheduleId || pstItem || `${data.location}-${activityText}`)}`;
      const existing = report.activities.find(item => item.id === activityId);
      const activity = {
        ...(existing || {}), id: activityId, pstItem, scheduleId,
        discipline: String(data.discipline || existing?.discipline || report.discipline || '').trim(),
        actualCrew: existing?.actualCrew ?? null,
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
    if (!grouped.size) {
      const details = rejectionReasons.slice(0, 3).join(' | ');
      throw new Error(`Nenhuma linha válida. ${details || 'Confira os cabeçalhos do modelo e preencha Data, DH, Engenheiro, Atividade e Previsto Dia.'}`);
    }

    const merged = [];
    grouped.forEach(imported => {
      const current = checkinGetReport(imported.id);
      if (current) {
        const currentActivities = new Map(current.activities.map(activity => [activity.id, activity]));
        imported.activities = imported.activities.map(activity => {
          const saved = currentActivities.get(activity.id);
          return saved ? {
            ...activity,
            status: saved.status || activity.status,
            checkinAt: saved.checkinAt || activity.checkinAt || '',
            checkoutAt: saved.checkoutAt || activity.checkoutAt || '',
            actualCrew: saved.actualCrew ?? activity.actualCrew,
            executedMeters: saved.executedMeters ?? activity.executedMeters,
            problemCode: saved.problemCode || activity.problemCode,
            problemOther: saved.problemOther || activity.problemOther,
            notes: saved.notes || activity.notes
          } : activity;
        });
        // Atividades extras foram lançadas no diário, não na planilha semanal.
        imported.activities.push(...current.activities.filter(activity =>
          activity.status === CHECKIN_STATUS[3] && !imported.activities.some(item => item.id === activity.id)
        ));
        for (const key of ['checkinAt', 'checkoutAt', 'status', 'updatedAt']) imported[key] = current[key] || imported[key];
        imported.actualCrew = Number(current.actualCrew) || imported.actualCrew || 0;
        imported.activities.forEach(activity => {
          const saved = current.activities.find(item => item.id === activity.id);
          if (saved) activity.actualCrew = saved.actualCrew ?? activity.actualCrew;
        });
        imported.actualCrew = checkinActualCrewTotal(imported) || Number(current.actualCrew) || 0;
        imported.actualPtaCount = Number(current.actualPtaCount) || imported.actualPtaCount || 0;
        imported.forkliftCount = Number(current.forkliftCount) || imported.forkliftCount || 0;
        for (const key of ['discipline', 'stage', 'front', 'contractor', 'hcEngineer', 'supervisor', 'shift', 'teamSize', 'hydraulicCrew', 'ductCrew', 'isolationCrew', 'logisticsCrew', 'weather']) {
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

async function checkinOpenStandaloneExtra() {
  if (!checkinCompanies().length && typeof workforceReadyPromise !== 'undefined') await workforceReadyPromise;
  if (typeof syncUserApprovalsFromSupabase === 'function') await syncUserApprovalsFromSupabase();
  const engineers = checkinEngineers();
  const companies = checkinCompanies();
  if (!engineers.length) return toast('Cadastre um engenheiro no Efetivo antes de planejar a atividade extra.', true);
  modal(`${modalHead('Planejar atividade extra', 'Registre uma tarefa fora da planilha semanal. Ela ficará marcada como não programada.')}
    <form class="checkin-manual-form" onsubmit="checkinAddStandaloneExtra(event)">
      <label><span>Data</span><input name="workDate" type="date" required value="${checkinSelectedDate}"></label>
      <label><span>DH</span><select name="dh" required>${checkinSelectOptions(CHECKIN_DATA_HALLS, '', 'Selecione')}</select></label>
      <label><span>Disciplina</span><select name="discipline" required>${checkinSelectOptions(CHECKIN_DISCIPLINES, '', 'Selecione')}</select></label>
      <label><span>Engenheiro</span><select name="engineer" required>${checkinSelectOptions(engineers, '', 'Selecione')}</select></label>
      <label><span>Empreiteira</span><select name="contractor">${checkinSelectOptions(companies, '', 'Selecione')}</select></label>
      <label><span>Local / sala</span><input name="location" placeholder="Ex.: Sala RMU 4.4"></label>
      <label><span>Setor</span><select name="sector">${checkinExtraSectorOptions()}</select></label>
      <label class="wide"><span>Atividade / serviço</span><input name="activity" required placeholder="Descreva o serviço fora do planejamento"></label>
      ${checkinExtraReasonFields()}
      <label><span>Unidade</span><select name="unit">${CHECKIN_UNITS.map((value, index) => `<option value="${value}" ${index === 0 ? 'selected' : ''}>${value}</option>`).join('')}</select></label>
      <label><span>Quantidade prevista</span><input name="plannedMeters" type="number" min="0" step="0.1" required></label>
      <div class="modal-foot"><button type="button" class="button button-outline" onclick="closeModal()">Cancelar</button><button class="button button-green" type="submit">Salvar atividade extra</button></div>
    </form>`, 'modal-large');
}

async function checkinAddStandaloneExtra(event) {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(event.currentTarget).entries());
  const workDate = checkinParseDate(data.workDate);
  const dh = checkinNormalizeDataHall(data.dh);
  const engineer = String(data.engineer || '').trim();
  const extraReason = checkinExtraReasonFromForm(data);
  if (!workDate || !dh || !checkinEngineers().includes(engineer)) return toast('Confira a data, o DH e o engenheiro cadastrado.', true);
  if (!extraReason) return toast('Selecione o motivo do imprevisto e descreva quando escolher Outro.', true);
  const sector = checkinExtraSectorFromForm(data.sector);
  const id = checkinReportId(workDate, dh, engineer);
  let report = checkinGetReport(id);
  if (!report) report = checkinCreateReport({ workDate, dh, engineer, discipline: data.discipline, stage: 'Atividade extra', contractor: data.contractor, hcEngineer: engineer });
  const taskId = `${id}-extra-${Date.now().toString(36)}`;
  report.activities.push({
    id: taskId, pstItem: '', scheduleId: '', location: [String(data.location || '').trim(), sector?.name].filter(Boolean).join(' - '),
    sector: sector?.id || '', sectorName: sector?.name || '', discipline: data.discipline, actualCrew: null,
    activity: String(data.activity || '').trim(), unit: String(data.unit || 'm').trim() || 'm',
    plannedMeters: checkinParseNumber(data.plannedMeters), executedMeters: 0,
    status: CHECKIN_STATUS[3], problemCode: '', problemOther: '', notes: extraReason
  });
  report.checkoutAt = '';
  report.status = 'iniciado';
  await checkinPersistReports(report, { silent: true });
  closeModal();
  checkinSelectedDate = workDate;
  checkinEngineerFilter = engineer;
  checkinDhFilter = dh;
  checkinActiveTab = 'diario';
  toast('Atividade extra planejada no diário.');
  renderCheckIn();
}

async function checkinOpenManualActivity(reportId = '', isExtra = false) {
  if (!isExtra) return toast('A agenda enviada é somente leitura. Cadastre tarefas pelo modelo semanal.', true);
  const current = checkinCaptureReport(reportId) || checkinGetReport(reportId);
  if (!current) return toast('Diário não encontrado. Atualize a página e tente novamente.', true);
  await checkinPersistReports(current, { silent: true });
  const date = current.workDate;
  const engineers = checkinAvailableEngineers();
  modal(`${modalHead('Adicionar atividade extra', current.checkoutAt ? 'O diário fechado será reaberto para registrar esta atividade.' : 'Registre o imprevisto sem alterar as tarefas que vieram da agenda.')}
    <form class="checkin-manual-form" onsubmit="checkinAddManualActivity(event)">
      <input type="hidden" name="reportId" value="${esc(current.id)}">
      <input type="hidden" name="taskType" value="extra">
      <label><span>Data</span><input name="workDate" type="date" required value="${date}" readonly></label>
      <label><span>DH</span><select name="dh" required>${checkinSelectOptions(CHECKIN_DATA_HALLS, current.dh, 'Selecione')}</select></label>
      <label><span>Engenheiro</span><select name="engineer" required>${checkinSelectOptions(engineers, current.engineer, 'Selecione')}</select></label>
      <label><span>Local</span><input name="location"></label>
      <label><span>Setor</span><select name="sector">${checkinExtraSectorOptions()}</select></label>
      <label class="wide"><span>Atividade / serviço (texto livre)</span><input name="activity" required placeholder="Digite também atividades que não estejam em uma lista"></label>
      ${checkinExtraReasonFields()}
      <label><span>Unidade</span><select name="unit">${CHECKIN_UNITS.map((value, index) => `<option value="${value}" ${index === 0 ? 'selected' : ''}>${value}</option>`).join('')}</select></label>
      <label><span>Quantidade estimada no dia</span><input name="plannedMeters" type="number" min="0" step="0.1" required></label>
      <div class="modal-foot"><button type="button" class="button button-outline" onclick="closeModal()">Cancelar</button><button class="button button-green" type="submit">Salvar atividade extra</button></div>
    </form>`, 'modal-large');
}

async function checkinAddManualActivity(event) {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(event.currentTarget).entries());
  if (data.taskType !== 'extra') return toast('Tarefas programadas devem ser incluídas pela coordenação na agenda.', true);
  const sourceReport = checkinGetReport(data.reportId);
  if (!sourceReport) return toast('Diário não encontrado. Atualize a página e tente novamente.', true);
  const extraReason = checkinExtraReasonFromForm(data);
  if (!extraReason) return toast('Selecione o motivo do imprevisto e descreva quando escolher Outro.', true);
  const date = sourceReport.workDate;
  const dh = checkinNormalizeDataHall(data.dh);
  const engineer = String(data.engineer || '').trim();
  if (!dh || !checkinAvailableEngineers().includes(engineer)) return toast('Selecione um DH e um engenheiro válidos.', true);
  const sector = checkinExtraSectorFromForm(data.sector);
  const targetReportId = checkinReportId(date, dh, engineer);
  let report = checkinGetReport(targetReportId);
  if (!report) {
    report = checkinCreateReport({
      workDate: date, dh, engineer, discipline: sourceReport.discipline,
      stage: sourceReport.stage, contractor: sourceReport.contractor,
      hcEngineer: sourceReport.hcEngineer || engineer, supervisor: sourceReport.supervisor,
      shift: sourceReport.shift, weather: sourceReport.weather
    });
  }
  const taskId = `${report.id}-extra-${Date.now().toString(36)}`;
  report.activities.push({
    id: taskId, pstItem: '', scheduleId: '',
    sector: sector?.id || '', sectorName: sector?.name || '', discipline: report.discipline, actualCrew: null,
    location: [data.location.trim(), sector?.name].filter(Boolean).join(' - '), activity: data.activity.trim(), unit: data.unit.trim() || 'm',
    plannedMeters: checkinParseNumber(data.plannedMeters), executedMeters: 0,
    status: data.taskType === 'extra' ? CHECKIN_STATUS[3] : 'Não iniciado',
    problemCode: '', problemOther: '', notes: extraReason
  });
  report.checkoutAt = '';
  report.status = 'iniciado';
  await checkinPersistReports(report, { silent: true });
  closeModal();
  checkinSelectedDate = date;
  checkinEngineerFilter = engineer;
  checkinDhFilter = dh;
  checkinActiveTab = 'diario';
  toast('Atividade extra adicionada ao diário.');
  renderCheckIn();
}

async function checkinDeleteActivity(reportId, activityId) {
  if (!checkinCanDeletePlanning()) return toast('Somente o perfil Master pode excluir atividades do planejamento.', true);
  const report = checkinGetReport(reportId);
  if (!report) return;
  const activity = report.activities.find(item => item.id === activityId);
  const deleteReportToo = report.activities.length === 1;
  const warning = deleteReportToo ? ' Esta e a ultima atividade; excluir tambem apagara o diario e os registros de check-in/check-out.' : '';
  if (!activity || !confirm(`Excluir a atividade "${activity.activity || activity.pstItem || 'sem descricao'}" do diario de ${report.engineer} em ${checkinFormatDate(report.workDate)}?${warning}`)) return;
  const remainingActivities = report.activities.filter(item => item.id !== activityId);
  if (!remainingActivities.length) {
    if (typeof supabaseRestRequest === 'function' && navigator.onLine === false) {
      return toast('Conecte-se a internet para excluir este planejamento compartilhado.', true);
    }
    try {
      if (typeof supabaseRestRequest === 'function') {
        const deleted = await supabaseRestRequest(`${CHECKIN_TABLE}?id=eq.${encodeURIComponent(reportId)}&select=id`, {
          method: 'DELETE', queueOffline: false, headers: { Prefer: 'return=representation' }
        });
        if (Array.isArray(deleted) && !deleted.some(item => item.id === reportId)) throw new Error('Nenhum diario foi removido do banco.');
      }
      checkinReports = checkinReports.filter(item => item.id !== reportId);
      checkinSaveLocal();
    } catch (error) {
      console.warn('Falha ao excluir o planejamento compartilhado:', error);
      return toast('A atividade nao foi excluida do banco. Verifique a conexao e tente novamente.', true);
    }
  } else {
    report.activities = remainingActivities;
    const synced = await checkinPersistReports(report, { silent: true });
    if (!synced) {
      toast('Atividade removida neste aparelho; sincronizacao com o banco pendente.', true);
      renderCheckIn();
      return;
    }
  }
  toast('Atividade removida do planejamento.');
  renderCheckIn();
}

async function checkinDeleteReport(reportId) {
  if (!checkinCanDeletePlanning()) return toast('Somente o perfil Master pode apagar o diario.', true);
  const report = checkinGetReport(reportId);
  if (!report) return;
  const message = `Apagar todo o planejamento e o diário de ${report.engineer} (${report.dh}) em ${checkinFormatDate(report.workDate)}? Esta ação também remove os registros de check-in, check-out, atividades executadas e observações.`;
  if (!confirm(message)) return;
  if (typeof supabaseRestRequest === 'function' && navigator.onLine === false) {
    return toast('Conecte-se à internet para apagar o diário compartilhado.', true);
  }
  try {
    if (typeof supabaseRestRequest === 'function') {
      const deleted = await supabaseRestRequest(`${CHECKIN_TABLE}?id=eq.${encodeURIComponent(reportId)}&select=id`, { method: 'DELETE', queueOffline: false, headers: { Prefer: 'return=representation' } });
      if (Array.isArray(deleted) && !deleted.some(item => item.id === reportId)) throw new Error('Nenhum di?rio foi removido. Confirme a permissao DELETE da tabela daily_work_reports.');
    }
    checkinReports = checkinReports.filter(item => item.id !== reportId);
    checkinSaveLocal();
    toast('Planejamento e diário apagados.');
    renderCheckIn();
  } catch (error) {
    console.warn('Falha ao apagar diÃ¡rio compartilhado:', error);
    toast('NÃ£o foi possÃ­vel apagar o diÃ¡rio compartilhado. Tente novamente.', true);
  }
}

function checkinCurveActivityDiscipline(report, activity) {
  const taskDiscipline = String(activity.discipline || '').trim();
  const reportDiscipline = String(report.discipline || '').trim();
  const isGeneric = value => !value || checkinNormalizeHeader(value).includes('geral') || checkinNormalizeHeader(value).includes('varias');
  if (!isGeneric(taskDiscipline)) return taskDiscipline;
  if (!isGeneric(reportDiscipline)) return reportDiscipline;

  const description = checkinNormalizeHeader([
    activity.pstItem, activity.scheduleId, activity.location, activity.activity
  ].filter(Boolean).join(' '));
  if (/isolamento|isolante|armaflex|cladding|manta/.test(description)) return 'Isolamento';
  if (/tubul|hidraul|hidrante|dreno|esgoto|agua|bomba|sprinkler/.test(description)) return 'Hidráulica';
  if (/duto|duct|damper|ventil/.test(description)) return 'Duto';
  if (/logistica|recebimento|movimentacao|transporte|descarga/.test(description)) return 'Logística';
  return '';
}

function checkinRenderCurve(engineers, dataHalls, disciplines, companies) {
  const reports = checkinReports.filter(report =>
    report.workDate >= checkinCurveStart && report.workDate <= checkinCurveEnd
    && (!checkinCurveEngineer || report.engineer === checkinCurveEngineer)
    && (!checkinCurveDh || report.dh === checkinCurveDh)
    && (!checkinCurveCompany || report.contractor === checkinCurveCompany)
    && (!checkinCurveWeekday || String(new Date(`${report.workDate}T12:00:00`).getDay()) === checkinCurveWeekday)
  );
  const byDate = new Map();
  reports.forEach(report => {
    const row = byDate.get(report.workDate) || { planned: 0, executed: 0 };
    report.activities
      .filter(activity => !checkinCurveDiscipline
        || checkinCurveActivityDiscipline(report, activity) === checkinCurveDiscipline)
      .forEach(activity => {
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
  const dateLabelCount = Math.min(8, points.length);
  const dateLabelIndices = new Set(Array.from({ length: dateLabelCount }, (_, index) =>
    dateLabelCount <= 1 ? 0 : Math.round(index * (points.length - 1) / (dateLabelCount - 1))
  ));
  const pathFor = key => points.map((point, index) => `${index ? 'L' : 'M'}${x(index).toFixed(1)},${y(point[key]).toFixed(1)}`).join(' ');
  const ticks = [0, maxValue / 2, maxValue];
  const plannedTotal = points.at(-1)?.planned || 0;
  const executedTotal = points.at(-1)?.executed || 0;
  const filterText = [checkinCurveDh || 'Todos os DHs', checkinCurveDiscipline || 'Todas as disciplinas', checkinCurveCompany || 'Todas as empresas', checkinCurveEngineer || 'Todos os engenheiros', checkinCurveWeekday ? CHECKIN_WEEKDAYS[Number(checkinCurveWeekday)] : 'Todos os dias'].join(' · ');
  return `<section class="checkin-filter-panel checkin-curve-filters">
    <label><span>Data inicial</span><input type="date" value="${checkinCurveStart}" onchange="checkinSetCurveRange('start',this.value)"></label>
    <label><span>Data final</span><input type="date" value="${checkinCurveEnd}" onchange="checkinSetCurveRange('end',this.value)"></label>
    <label><span>Disciplina</span><select onchange="checkinSetCurveFilter('discipline',this.value)">${checkinSelectOptions(disciplines, checkinCurveDiscipline, 'Todas')}</select></label>
    <label><span>Empresa</span><select onchange="checkinSetCurveFilter('company',this.value)">${checkinSelectOptions(companies, checkinCurveCompany, 'Todas')}</select></label>
    <label><span>Engenheiro</span><select onchange="checkinSetCurveFilter('engineer',this.value)">${checkinSelectOptions(engineers, checkinCurveEngineer, 'Todos')}</select></label>
    <label><span>Data Hall</span><select onchange="checkinSetCurveFilter('dh',this.value)">${checkinSelectOptions(dataHalls, checkinCurveDh, 'Todos')}</select></label>
    <label><span>Dia da semana</span><select onchange="checkinSetCurveFilter('weekday',this.value)"><option value="">Todos</option>${CHECKIN_WEEKDAYS.map((day, index) => `<option value="${index}" ${checkinCurveWeekday === String(index) ? 'selected' : ''}>${day}</option>`).join('')}</select></label>
  </section>
  <section class="checkin-curve-summary"><div><small>PLANEJADO ACUMULADO</small><strong>${checkinNumber(plannedTotal)} m</strong></div><div><small>EXECUTADO ACUMULADO</small><strong>${checkinNumber(executedTotal)} m</strong></div><div><small>RECORTE</small><strong>${esc(filterText)}</strong></div></section>
  <article class="checkin-curve-card"><header><div><p class="eyebrow">ACOMPANHAMENTO FÍSICO</p><h2>Curva S — Planejado x Executado</h2><p>Acumulado diário em metros · ${checkinFormatDate(checkinCurveStart)} a ${checkinFormatDate(checkinCurveEnd)}</p></div><div class="checkin-curve-legend"><span class="planned">Planejado</span><span class="executed">Executado</span></div></header>
    ${points.length ? `<div class="checkin-chart-scroll"><svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Curva S acumulada de metros planejados e executados">
      ${ticks.map(value => `<g><line x1="${left}" y1="${y(value)}" x2="${width - right}" y2="${y(value)}"/><text x="${left - 8}" y="${y(value) + 4}" text-anchor="end">${checkinNumber(value, 0)}</text></g>`).join('')}
      <path class="curve-planned" d="${pathFor('planned')}"/><path class="curve-executed" d="${pathFor('executed')}"/>
      ${points.map((point, index) => `<g><circle class="point-planned" cx="${x(index)}" cy="${y(point.planned)}" r="3"/><circle class="point-executed" cx="${x(index)}" cy="${y(point.executed)}" r="3"/>${dateLabelIndices.has(index) ? `<text class="curve-date" x="${x(index)}" y="${height - 16}" text-anchor="middle">${new Intl.DateTimeFormat('pt-BR',{day:'2-digit',month:'2-digit'}).format(new Date(`${point.date}T12:00:00`))}</text>` : ''}</g>`).join('')}
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
  else if (which === 'discipline') checkinCurveDiscipline = value;
  else if (which === 'company') checkinCurveCompany = value;
  else if (which === 'weekday') checkinCurveWeekday = value;
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
window.checkinCopyDayWhatsApp = checkinCopyDayWhatsApp;
window.checkinOpenImport = checkinOpenImport;
window.checkinDownloadTemplate = checkinDownloadTemplate;
window.checkinImportWeekly = checkinImportWeekly;
window.checkinOpenStandaloneExtra = checkinOpenStandaloneExtra;
window.checkinAddStandaloneExtra = checkinAddStandaloneExtra;
window.checkinOpenManualActivity = checkinOpenManualActivity;
window.checkinAddManualActivity = checkinAddManualActivity;
window.checkinDeleteActivity = checkinDeleteActivity;
window.checkinDeleteReport = checkinDeleteReport;
window.checkinSetPlanRange = checkinSetPlanRange;
window.checkinSetPlanEngineerFilter = checkinSetPlanEngineerFilter;
window.checkinSetPlanCompanyFilter = checkinSetPlanCompanyFilter;
window.checkinSetPlanDisciplineFilter = checkinSetPlanDisciplineFilter;
window.checkinGetActivityDiscipline = checkinGetActivityDiscipline;
window.checkinUpdateContractor = checkinUpdateContractor;
window.checkinUpdateCardTotals = checkinUpdateCardTotals;
window.checkinReportContractorsDisplay = checkinReportContractorsDisplay;
window.checkinLoadTestTasks = checkinLoadTestTasks;
window.checkinSetCurveRange = checkinSetCurveRange;
window.checkinSetCurveFilter = checkinSetCurveFilter;
window.checkinUpdatePercent = checkinUpdatePercent;
window.checkinToggleOther = checkinToggleOther;
window.checkinToggleExtraReason = checkinToggleExtraReason;
window.checkinToggleExtraReasonOther = checkinToggleExtraReasonOther;
