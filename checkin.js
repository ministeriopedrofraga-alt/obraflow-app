const CHECKIN_STORE_KEY = 'obraflow_daily_work_reports_v1';
const CHECKIN_TABLE = 'daily_work_reports';
const CHECKIN_STATUS = ['Concluído', 'Parcial', 'Não iniciado', 'Suspenso', 'Iniciado'];
const CHECKIN_EXTRA_LEGACY_STATUS = 'Extra (não programada)';
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
let checkinShiftFilter = '';
let checkinEngineerFilter = '';
let checkinDhFilter = '';
let checkinAreaFilter = '';
let checkinCompanyFilter = '';
let checkinPlanStart = checkinToday();
let checkinPlanEnd = checkinDateOffset(checkinToday(), 6);
let checkinPlanDisciplineFilter = '';
let checkinPlanShiftFilter = '';
let checkinPlanEngineerFilter = '';
let checkinPlanCompanyFilter = '';
let checkinPlanSearch = '';
let checkinCurveStart = checkinDateOffset(checkinToday(), -29);
let checkinCurveEnd = checkinToday();
let checkinCurveEngineer = '';
let checkinCurveDh = '';
let checkinCurveArea = '';
let checkinCurveLocationSearch = '';
let checkinCurveDiscipline = '';
let checkinCurveShift = '';
let checkinCurveCompany = '';
let checkinCurveWeekday = '';
let checkinCurveMetric = 'tasks';
let checkinCurveDeviationOnly = false;
let checkinCurveBreakdownMode = 'task';
let checkinCurvePendingOnly = false;
let checkinSummaryStart = checkinWeekBounds(checkinToday()).start;
let checkinSummaryEnd = checkinWeekBounds(checkinToday()).end;
let checkinSummaryDh = '';
let checkinSummaryArea = '';
let checkinSummarySearch = '';
let checkinSummaryDiscipline = '';
let checkinSummaryEngineer = '';
let checkinSummaryCompany = '';
let checkinSummaryRepeatedOnly = false;
const CHECKIN_WEEKDAYS = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];

function checkinWeekBounds(dateStr) {
  const base = /^\d{4}-\d{2}-\d{2}$/.test(String(dateStr || '').slice(0, 10))
    ? String(dateStr).slice(0, 10)
    : checkinToday();
  const date = new Date(`${base}T12:00:00`);
  const day = date.getDay(); // 0=Dom, 1=Seg ... 6=Sab
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const start = checkinDateOffset(base, diffToMonday);
  const end = checkinDateOffset(start, 6);
  return { start, end };
}

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

function checkinIsTestReport(report) {
  if (!report) return false;
  const eng = String(report.engineer || '').trim().toUpperCase();
  if (eng === CHECKIN_TEST_ENGINEER || eng === 'TESTE DO SISTEMA') return true;
  if (String(report.id || '').includes('-teste-do-sistema')) return true;
  return Array.isArray(report.activities) && report.activities.length > 0
    && report.activities.every(a => String(a?.id || '').includes('-test-room-'));
}

function checkinLoadLocal() {
  try {
    const saved = JSON.parse(localStorage.getItem(CHECKIN_STORE_KEY) || '[]');
    if (!Array.isArray(saved)) return [];
    const migrated = saved.filter(r => !checkinIsTestReport(r)).map(checkinMigrateReportTaskTimes);
    return checkinReconcileCagReports(migrated).reports;
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

function checkinTimeInputValue(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return '';
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function checkinIsoFromTimeInput(workDate, timeStr, fallbackIso = '') {
  const clean = String(timeStr || '').trim();
  if (!clean) return '';
  const match = clean.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return fallbackIso;
  const dateBase = /^\d{4}-\d{2}-\d{2}$/.test(String(workDate || '').slice(0, 10))
    ? String(workDate).slice(0, 10)
    : checkinToday();
  const parsed = new Date(`${dateBase}T${match[1].padStart(2, '0')}:${match[2]}:00`);
  return Number.isNaN(parsed.getTime()) ? fallbackIso : parsed.toISOString();
}

function checkinResolveSectionDiscipline(text) {
  const norm = checkinNormalizeHeader(text);
  if (!norm || /interferencia/.test(norm)) return '';
  // Prioriza Duto quando o cabeçalho/seção for de dutos (mesmo que cite isolamento de duto)
  if (/\bdutos?\b|\bduct|\bdamper|\bventil/.test(norm) && !/^isolament/.test(norm)) return 'Duto';
  if (/^dutos?\b/.test(norm)) return 'Duto';
  if (/^isolament/.test(norm)) return 'Isolamento';
  if (/^hidraul|^tubul/.test(norm)) return 'Hidráulica';
  if (/^logist/.test(norm)) return 'Logística';
  if (/\bdutos?\b|\bduct|\bdamper|\bventil/.test(norm)) return 'Duto';
  if (/hidraul|hidrante|tubul|dreno|esgoto|agua|bomba|sprinkler/.test(norm)) return 'Hidráulica';
  if (/isolamento|isolante|armaflex|cladding|manta/.test(norm)) return 'Isolamento';
  if (/logistica|recebimento|movimentacao|transporte|descarga/.test(norm)) return 'Logística';
  return '';
}

function checkinIsGarbageActivity(activity) {
  if (!activity) return true;
  const pst = checkinNormalizeHeader(activity.pstItem);
  const sched = checkinNormalizeHeader(activity.scheduleId);
  const loc = checkinNormalizeHeader(activity.location);
  const act = checkinNormalizeHeader(activity.activity);
  const unit = checkinNormalizeHeader(activity.unit);

  // Cabeçalhos de tabela de atividades ou interferências ou metadados do bloco
  if (/^(?:item|item pst|n|no|num|numero)$/.test(pst) && /id cronograma|tipo codigo|descricao da interferencia/.test(`${sched} ${loc} ${act}`)) return true;
  if (/descricao da interferencia|tipo codigo|acao encaminhamento|responsavel causador/.test(`${loc} ${act}`)) return true;
  if (/^(?:empreiteira|empreiteira s|clima condicao da frente|efetivo hidraulica|efetivo dutos|efetivo isolamento|efetivo logistica|eng responsavel hc|supervisor|turno)$/.test(act)) return true;
  if (/^(?:efetivo hidraulica|efetivo dutos|efetivo isolamento|efetivo logistica|empreiteira s|clima condicao da frente)$/.test(pst)) return true;
  if (/inicio h|termino h|duracao h/.test(unit)) return true;
  return false;
}

function checkinIsExtraActivity(activity) {
  if (!activity) return false;
  return Boolean(
    activity.isExtra
    || activity.status === CHECKIN_EXTRA_LEGACY_STATUS
    || String(activity.id || '').includes('-extra-')
  );
}

function checkinIsCarryoverActivity(activity) {
  if (!activity) return false;
  return Boolean(
    activity.isCarryover
    || activity.carryoverSourceId
    || String(activity.id || '').includes('-carry-')
  );
}

function checkinNormalizeSearchText(value) {
  return checkinNormalizeHeader(value)
    .replace(/\bcag\s*0?(\d{1,2})\b/g, 'cag $1')
    .replace(/\bdh\s*0?(\d{1,2})\b/g, 'dh $1');
}

function checkinExtractAreaLabel(report, activity) {
  const loc = String(activity?.location || '').trim();
  const idStr = String(activity?.id || '');
  const cagLocMatch = loc.match(/\bCAG\s*0?(\d{1,2})\b/i);
  if (cagLocMatch) return `CAG ${Number(cagLocMatch[1])}`;
  const cagIdMatch = idStr.match(/-task-cag-0?(\d{1,2})-/i);
  if (cagIdMatch) return `CAG ${Number(cagIdMatch[1])}`;
  return String(report?.dh || '').trim() || 'Sem área';
}

function checkinExtractLocationLabel(report, activity) {
  const loc = String(activity?.location || '').trim();
  return loc || checkinExtractAreaLabel(report, activity);
}

function checkinDetectSubItemTemplate(activityText) {
  const text = String(activityText || '');
  const match = text.match(/\b(\d{1,2})\s*x?\s*(crah'?s?|maquinas?|máquinas?|equipamentos?|pecas?|peças?|chillers?|bombas?|fcu'?s?|fan\s*walls?|unidades?|salas?)\b/i);
  if (!match) return null;
  const count = Number(match[1]);
  if (count < 2 || count > 20) return null;
  const rawName = match[2].toUpperCase().replace(/'S$/i, '').replace(/S$/i, '');
  const labelMap = {
    'CRAH': 'CRAH',
    'MAQUINA': 'Máquina',
    'MÁQUINA': 'Máquina',
    'EQUIPAMENTO': 'Equip.',
    'PECA': 'Peça',
    'PEÇA': 'Peça',
    'CHILLER': 'Chiller',
    'BOMBA': 'Bomba',
    'FCU': 'FCU',
    'FAN WALL': 'Fan Wall',
    'UNIDADE': 'Unid.',
    'SALA': 'Sala'
  };
  return { count, prefix: labelMap[rawName] || rawName };
}

function checkinSubItemsSummary(subItems) {
  if (!Array.isArray(subItems) || !subItems.length) return null;
  const done = subItems.filter(item => item && item.done).length;
  const pendingLabels = subItems.filter(item => item && !item.done).map(item => item.label).filter(Boolean);
  return { total: subItems.length, done, pendingCount: subItems.length - done, pendingLabels };
}

function checkinAllAreas() {
  const areas = [];
  (Array.isArray(checkinReports) ? checkinReports : []).forEach(report => {
    if (report?.dh) areas.push(report.dh);
    (report?.activities || []).forEach(activity => {
      areas.push(checkinExtractAreaLabel(report, activity));
    });
  });
  return checkinUniqueOptions(areas).sort((a, b) => {
    const aCag = /^CAG\s+/i.test(a) ? 0 : 1;
    const bCag = /^CAG\s+/i.test(b) ? 0 : 1;
    if (aCag !== bCag) return aCag - bCag;
    return a.localeCompare(b, 'pt-BR', { numeric: true });
  });
}

function checkinActivityRecurrenceKey(dh, activity) {
  if (!activity) return '';
  const dhKey = checkinSlug(dh || '');
  const sid = String(activity.scheduleId || '').trim();
  const pst = String(activity.pstItem || '').trim();
  const loc = String(activity.location || '').trim();
  const act = String(activity.activity || '').trim();
  const cagMatch = loc.match(/\bCAG\s*0?(\d{1,2})\b/i);
  const areaKey = cagMatch ? `cag-${Number(cagMatch[1])}` : '';
  if (sid) {
    return `${dhKey}|${areaKey}|sid:${checkinSlug(sid)}`;
  }
  if (pst) {
    return `${dhKey}|${areaKey}|pst:${checkinSlug(pst)}|loc:${checkinSlug(loc)}|act:${checkinSlug(act)}`;
  }
  return `${dhKey}|${areaKey}|loc:${checkinSlug(loc)}|act:${checkinSlug(act)}`;
}

function checkinActivityOriginalPlannedMeters(activity) {
  if (!activity) return 0;
  if (checkinIsCarryoverActivity(activity)) return 0;
  const planned = checkinParseNumber(activity.plannedMeters);
  const carried = checkinParseNumber(activity.carryoverAddedMeters);
  if (carried > 0) {
    if (activity.basePlannedMeters !== undefined && activity.basePlannedMeters !== null) {
      return checkinParseNumber(activity.basePlannedMeters);
    }
    return Math.max(0, Math.round((planned - carried) * 100) / 100);
  }
  return planned;
}

function checkinBuildWeeklyRecurrenceIndex(anchorDate) {
  const { start, end } = checkinWeekBounds(anchorDate);
  const byKey = new Map();
  checkinReports
    .filter(r => r.workDate >= start && r.workDate <= end)
    .forEach(report => {
      (report.activities || []).forEach(activity => {
        const key = checkinActivityRecurrenceKey(report.dh, activity);
        if (!key) return;
        const entry = byKey.get(key) || {
          key,
          dates: new Set(),
          plannedTotal: 0,
          executedTotal: 0,
          unit: activity.unit || 'm',
          weekStart: start,
          weekEnd: end
        };
        entry.dates.add(report.workDate);
        entry.plannedTotal = Math.round((entry.plannedTotal + checkinActivityOriginalPlannedMeters(activity)) * 100) / 100;
        entry.executedTotal = Math.round((entry.executedTotal + checkinParseNumber(activity.executedMeters)) * 100) / 100;
        if (!entry.unit && activity.unit) entry.unit = activity.unit;
        byKey.set(key, entry);
      });
    });

  const result = new Map();
  byKey.forEach((entry, key) => {
    const remainingTotal = Math.max(0, Math.round((entry.plannedTotal - entry.executedTotal) * 100) / 100);
    const pct = entry.plannedTotal > 0
      ? Math.round((entry.executedTotal / entry.plannedTotal) * 100)
      : (entry.executedTotal > 0 ? 100 : 0);
    result.set(key, {
      daysCount: entry.dates.size,
      plannedTotal: entry.plannedTotal,
      executedTotal: entry.executedTotal,
      remainingTotal,
      unit: entry.unit || 'm',
      pct,
      weekStart: entry.weekStart,
      weekEnd: entry.weekEnd
    });
  });
  return result;
}

function checkinActivityRemainingMeters(activity) {
  if (!activity || activity.carryoverDismissed) return 0;
  const status = checkinResolveMigratedStatus(activity, activity.checkinAt, activity.checkoutAt);
  if (status === 'Concluído') return 0;
  const planned = checkinParseNumber(activity.plannedMeters);
  const executed = checkinParseNumber(activity.executedMeters);
  if (planned <= 0) return 0;
  const remaining = Math.round((planned - executed) * 100) / 100;
  return remaining > 0 ? remaining : 0;
}

function checkinShouldAutoCarryoverActivity(report, activity, { includeUnstartedPast = false } = {}) {
  const remaining = checkinActivityRemainingMeters(activity);
  if (remaining <= 0) return false;
  const executed = checkinParseNumber(activity.executedMeters);
  const status = checkinResolveMigratedStatus(activity, activity.checkinAt, activity.checkoutAt);
  if (executed > 0 || activity.checkoutAt || status === 'Parcial' || status === 'Suspenso') return true;
  if (includeUnstartedPast && report?.workDate && report.workDate < checkinToday()) return true;
  return false;
}

function checkinSyncCarryoverForReport(sourceReport, { includeUnstartedPast = false } = {}) {
  if (!sourceReport || !sourceReport.workDate || !sourceReport.dh || !sourceReport.engineer) return null;
  const nextDate = checkinDateOffset(sourceReport.workDate, 1);
  if (!nextDate) return null;
  const nextReportId = checkinReportId(nextDate, sourceReport.dh, sourceReport.engineer);
  const existingNextReport = checkinGetReport(nextReportId);
  let nextReport = existingNextReport ? structuredClone(existingNextReport) : null;
  let changed = false;
  let addedCount = 0;
  let updatedCount = 0;
  let removedCount = 0;

  (sourceReport.activities || []).forEach(activity => {
    if (!activity || !activity.id) return;
    const remaining = checkinActivityRemainingMeters(activity);
    const shouldCarry = checkinShouldAutoCarryoverActivity(sourceReport, activity, { includeUnstartedPast });
    const srcKey = checkinActivityRecurrenceKey(sourceReport.dh, activity);
    const carryIdx = nextReport
      ? (nextReport.activities || []).findIndex(item => item.carryoverSourceId === activity.id)
      : -1;
    const mergedTargetIdx = nextReport
      ? (nextReport.activities || []).findIndex(item =>
        !checkinIsCarryoverActivity(item)
        && (item.carryoverMergedFromId === activity.id
          || (srcKey && checkinActivityRecurrenceKey(nextReport.dh, item) === srcKey))
      )
      : -1;

    if (shouldCarry && remaining > 0) {
      if (mergedTargetIdx >= 0 && nextReport) {
        // A atividade já está programada no dia seguinte: consolida o saldo em uma única linha!
        const target = nextReport.activities[mergedTargetIdx];
        const basePlanned = (target.basePlannedMeters !== undefined && target.basePlannedMeters !== null)
          ? checkinParseNumber(target.basePlannedMeters)
          : checkinParseNumber(target.plannedMeters);
        const newPlanned = Math.round((basePlanned + remaining) * 100) / 100;
        if (
          target.carryoverMergedFromId !== activity.id
          || checkinParseNumber(target.carryoverAddedMeters) !== remaining
          || checkinParseNumber(target.plannedMeters) !== newPlanned
        ) {
          target.basePlannedMeters = basePlanned;
          target.carryoverAddedMeters = remaining;
          target.carryoverMergedFromId = activity.id;
          target.carryoverFromDate = sourceReport.workDate;
          target.carryoverOriginDate = activity.carryoverOriginDate || sourceReport.workDate;
          target.plannedMeters = newPlanned;
          changed = true;
          updatedCount += 1;
        }
        // Se existia uma linha duplicada de carryover antigo sem apontamento, remove a duplicata
        if (carryIdx >= 0 && carryIdx !== mergedTargetIdx) {
          const dupCarry = nextReport.activities[carryIdx];
          const untouched = !dupCarry.checkinAt && !dupCarry.checkoutAt && !checkinParseNumber(dupCarry.executedMeters);
          if (untouched) {
            nextReport.activities.splice(carryIdx, 1);
            changed = true;
            removedCount += 1;
          }
        }
      } else {
        if (!nextReport) {
          nextReport = checkinCreateReport({
            workDate: nextDate,
            dh: sourceReport.dh,
            engineer: sourceReport.engineer,
            discipline: checkinGetActivityDiscipline(sourceReport, activity) || sourceReport.discipline || '',
            stage: sourceReport.stage || '',
            front: sourceReport.front || '',
            contractor: activity.contractor || sourceReport.contractor || '',
            hcEngineer: sourceReport.hcEngineer || sourceReport.engineer || '',
            supervisor: sourceReport.supervisor || '',
            shift: checkinGetActivityShift(sourceReport, activity) || sourceReport.shift || ''
          });
        }
        if (carryIdx < 0) {
          const carryId = `${nextReport.id}-carry-${checkinSlug(activity.id)}`;
          nextReport.activities.push({
            id: carryId,
            pstItem: activity.pstItem || '',
            scheduleId: activity.scheduleId || '',
            discipline: checkinGetActivityDiscipline(sourceReport, activity) || sourceReport.discipline || '',
            shift: checkinGetActivityShift(sourceReport, activity),
            contractor: activity.contractor || '',
            actualCrew: null,
            ptaCount: null,
            forkliftCount: null,
            location: activity.location || '',
            activity: activity.activity || '',
            unit: activity.unit || 'm',
            plannedMeters: remaining,
            executedMeters: 0,
            status: 'Não iniciado',
            problemCode: '',
            problemOther: '',
            notes: '',
            checkinAt: '',
            checkoutAt: '',
            isCarryover: true,
            carryoverFromDate: sourceReport.workDate,
            carryoverOriginDate: activity.carryoverOriginDate || sourceReport.workDate,
            carryoverSourceId: activity.id,
            carryoverOriginalPlanned: checkinParseNumber(activity.carryoverOriginalPlanned || activity.plannedMeters)
          });
          changed = true;
          addedCount += 1;
        } else {
          const existingCarry = nextReport.activities[carryIdx];
          const untouched = !existingCarry.checkinAt && !existingCarry.checkoutAt && !checkinParseNumber(existingCarry.executedMeters);
          if (untouched && checkinParseNumber(existingCarry.plannedMeters) !== remaining) {
            existingCarry.plannedMeters = remaining;
            existingCarry.unit = activity.unit || existingCarry.unit || 'm';
            changed = true;
            updatedCount += 1;
          }
        }
      }
    } else if (nextReport) {
      // Sem saldo pendente: reverte saldo consolidado ou remove linha de carryover se ainda não apontada
      if (mergedTargetIdx >= 0) {
        const target = nextReport.activities[mergedTargetIdx];
        if (target.carryoverMergedFromId === activity.id && checkinParseNumber(target.carryoverAddedMeters) > 0) {
          const basePlanned = (target.basePlannedMeters !== undefined && target.basePlannedMeters !== null)
            ? checkinParseNumber(target.basePlannedMeters)
            : Math.max(0, Math.round((checkinParseNumber(target.plannedMeters) - checkinParseNumber(target.carryoverAddedMeters)) * 100) / 100);
          target.plannedMeters = basePlanned;
          delete target.basePlannedMeters;
          delete target.carryoverAddedMeters;
          delete target.carryoverMergedFromId;
          delete target.carryoverFromDate;
          delete target.carryoverOriginDate;
          changed = true;
          removedCount += 1;
        }
      }
      if (carryIdx >= 0) {
        const existingCarry = nextReport.activities[carryIdx];
        const untouched = !existingCarry.checkinAt && !existingCarry.checkoutAt && !checkinParseNumber(existingCarry.executedMeters);
        if (untouched) {
          nextReport.activities.splice(carryIdx, 1);
          changed = true;
          removedCount += 1;
        }
      }
    }
  });

  // Limpeza adicional: consolida qualquer linha antiga de carryover isolada que duplique uma tarefa já programada no mesmo diário
  if (nextReport && Array.isArray(nextReport.activities) && nextReport.activities.length > 1) {
    const scheduledByKey = new Map();
    nextReport.activities.forEach(item => {
      if (!checkinIsCarryoverActivity(item)) {
        const key = checkinActivityRecurrenceKey(nextReport.dh, item);
        if (key && !scheduledByKey.has(key)) scheduledByKey.set(key, item);
      }
    });
    for (let idx = nextReport.activities.length - 1; idx >= 0; idx -= 1) {
      const item = nextReport.activities[idx];
      if (!checkinIsCarryoverActivity(item)) continue;
      const untouched = !item.checkinAt && !item.checkoutAt && !checkinParseNumber(item.executedMeters);
      if (!untouched) continue;
      const key = checkinActivityRecurrenceKey(nextReport.dh, item);
      const target = key ? scheduledByKey.get(key) : null;
      if (target) {
        if (!target.carryoverMergedFromId && checkinParseNumber(item.plannedMeters) > 0) {
          const basePlanned = (target.basePlannedMeters !== undefined && target.basePlannedMeters !== null)
            ? checkinParseNumber(target.basePlannedMeters)
            : checkinParseNumber(target.plannedMeters);
          const added = checkinParseNumber(item.plannedMeters);
          target.basePlannedMeters = basePlanned;
          target.carryoverAddedMeters = added;
          target.carryoverMergedFromId = item.carryoverSourceId || item.id;
          target.carryoverFromDate = item.carryoverFromDate || sourceReport.workDate;
          target.carryoverOriginDate = item.carryoverOriginDate || item.carryoverFromDate || sourceReport.workDate;
          target.plannedMeters = Math.round((basePlanned + added) * 100) / 100;
        }
        nextReport.activities.splice(idx, 1);
        changed = true;
        removedCount += 1;
      }
    }
  }

  if (!changed || !nextReport) return null;
  if (!nextReport.activities.length) {
    return {
      nextReport: null,
      deletedReportId: nextReport.id,
      nextDate,
      addedCount,
      updatedCount,
      removedCount
    };
  }
  const checkedIn = nextReport.activities.filter(item => item.checkinAt);
  const checkedOut = nextReport.activities.filter(item => item.checkoutAt);
  nextReport.checkinAt = checkedIn.map(item => item.checkinAt).sort()[0] || '';
  nextReport.checkoutAt = nextReport.activities.length && checkedOut.length === nextReport.activities.length
    ? checkedOut.map(item => item.checkoutAt).sort().at(-1) : '';
  nextReport.status = nextReport.checkoutAt ? 'fechado' : nextReport.checkinAt ? 'iniciado' : 'planejado';
  nextReport.contractor = checkinUniqueContractors([
    ...nextReport.activities.map(a => a.contractor),
    nextReport.contractor
  ]).join(', ');
  return { nextReport, deletedReportId: '', nextDate, addedCount, updatedCount, removedCount };
}

async function checkinDeleteReportById(reportId) {
  if (!reportId) return false;
  checkinReports = checkinReports.filter(item => item.id !== reportId);
  checkinSaveLocal();
  if (typeof supabaseRestRequest === 'function' && navigator.onLine !== false) {
    try {
      await supabaseRestRequest(`${CHECKIN_TABLE}?id=eq.${encodeURIComponent(reportId)}`, {
        method: 'DELETE',
        queueOffline: false
      });
    } catch (error) {
      console.warn('Não foi possível remover diário vazio no banco:', error);
    }
  }
  return true;
}

async function checkinPersistWithCarryover(report, carryResult, { silent = true } = {}) {
  const toPersist = carryResult?.nextReport ? [report, carryResult.nextReport] : report;
  const saved = await checkinPersistReports(toPersist, { silent });
  if (carryResult?.deletedReportId) {
    await checkinDeleteReportById(carryResult.deletedReportId);
  }
  return saved;
}

async function checkinSyncCarryoverFromPreviousDay(targetDate, { persist = true, forceIncludeUnstarted = false } = {}) {
  if (!targetDate || !/^\d{4}-\d{2}-\d{2}$/.test(String(targetDate))) {
    return { totalAdded: 0, totalUpdated: 0, totalRemoved: 0, changedReports: [], deletedReportIds: [] };
  }
  const prevDate = checkinDateOffset(targetDate, -1);
  const prevReports = checkinReports.filter(report => report.workDate === prevDate);
  const includeUnstartedPast = forceIncludeUnstarted || prevDate < checkinToday();
  const changedReports = [];
  const deletedReportIds = [];
  let totalAdded = 0;
  let totalUpdated = 0;
  let totalRemoved = 0;

  prevReports.forEach(report => {
    const result = checkinSyncCarryoverForReport(report, { includeUnstartedPast });
    if (result?.nextReport) {
      changedReports.push(result.nextReport);
      totalAdded += result.addedCount;
      totalUpdated += result.updatedCount;
      totalRemoved += result.removedCount;
    } else if (result?.deletedReportId) {
      deletedReportIds.push(result.deletedReportId);
      totalRemoved += result.removedCount;
    }
  });

  if (changedReports.length && persist) {
    await checkinPersistReports(changedReports, { silent: true });
  }
  if (deletedReportIds.length && persist) {
    for (const delId of deletedReportIds) {
      await checkinDeleteReportById(delId);
    }
  }
  return { prevDate, totalAdded, totalUpdated, totalRemoved, changedReports, deletedReportIds };
}

function checkinResolveMigratedStatus(activity, checkinAt, checkoutAt) {
  const rawStatus = String(activity?.status || '').trim();
  const planned = checkinParseNumber(activity?.plannedMeters);
  const executed = checkinParseNumber(activity?.executedMeters);
  if (rawStatus && rawStatus !== CHECKIN_EXTRA_LEGACY_STATUS && CHECKIN_STATUS.includes(rawStatus)) {
    // Se já tem check-in ativo mas o status ficou travado em "Não iniciado", corrige para "Iniciado"
    if (rawStatus === 'Não iniciado' && checkinAt && !checkoutAt) return 'Iniciado';
    return rawStatus;
  }
  if (checkoutAt) {
    if (planned > 0 && executed > 0 && executed < planned) return 'Parcial';
    return 'Concluído';
  }
  if (checkinAt) return 'Iniciado';
  if (planned > 0 && executed >= planned) return 'Concluído';
  if (executed > 0) return 'Parcial';
  return 'Não iniciado';
}

function checkinMigrateReportTaskTimes(report) {
  const rawActivities = Array.isArray(report.activities) ? report.activities : [];
  const filteredActivities = rawActivities.filter(activity => !checkinIsGarbageActivity(activity));
  const hasTaskLevelTimes = filteredActivities.some(activity => activity.checkinAt || activity.checkoutAt);
  let cleanedContractors = false;
  const migratedActivities = filteredActivities.map(activity => {
    const isGeneric = !activity.discipline || checkinNormalizeHeader(activity.discipline).includes('geral') || checkinNormalizeHeader(activity.discipline).includes('varias');
    const descNorm = checkinNormalizeHeader([activity.pstItem, activity.scheduleId, activity.location, activity.activity].filter(Boolean).join(' '));
    // Corrige tarefas de duto que mencionam "isolamento de duto" mas tinham sido classificadas como Isolamento
    const isDuctWithInsulation = activity.discipline === 'Isolamento'
      && /\bdutos?\b|\bduct|\bdamper|\bventil/.test(descNorm)
      && (checkinNormalizeHeader(report.discipline).includes('duto') || /\bdutos?\b/.test(descNorm));
    const resolvedDiscipline = (isGeneric || isDuctWithInsulation) ? checkinGetActivityDiscipline(report, { ...activity, discipline: isDuctWithInsulation ? '' : activity.discipline }) : activity.discipline;
    const rawContractor = String(activity.contractor || '').trim();
    const parts = checkinUniqueContractors([rawContractor]);
    const cleanedTaskContractor = parts.length > 1 ? (!activity.checkinAt && !activity.checkoutAt ? '' : parts[0]) : (parts[0] || '');
    if (cleanedTaskContractor !== rawContractor) cleanedContractors = true;
    const resolvedShift = checkinGetActivityShift(report, activity);
    const resolvedCheckinAt = activity.checkinAt || (!hasTaskLevelTimes ? report.checkinAt : '') || '';
    const resolvedCheckoutAt = activity.checkoutAt || (!hasTaskLevelTimes ? report.checkoutAt : '') || '';
    const isExtra = checkinIsExtraActivity(activity);
    const resolvedStatus = checkinResolveMigratedStatus(activity, resolvedCheckinAt, resolvedCheckoutAt);
    if (resolvedStatus !== activity.status || Boolean(activity.isExtra) !== isExtra) {
      cleanedContractors = true;
    }
    return {
      ...activity,
      isExtra,
      status: resolvedStatus,
      contractor: cleanedTaskContractor,
      discipline: resolvedDiscipline || activity.discipline || '',
      shift: resolvedShift,
      checkinAt: resolvedCheckinAt,
      checkoutAt: resolvedCheckoutAt
    };
  });
  const rawReportContractor = String(report.contractor || '').trim();
  const cleanReportContractor = checkinUniqueContractors([
    ...migratedActivities.map(a => a.contractor),
    rawReportContractor
  ]).join(', ');
  if (cleanReportContractor !== rawReportContractor) cleanedContractors = true;
  return {
    ...report,
    contractor: cleanReportContractor,
    _cleanedGarbage: filteredActivities.length !== rawActivities.length || cleanedContractors,
    activities: migratedActivities
  };
}

function checkinActivityTargetCagDh(activity) {
  if (!activity) return '';
  const idStr = String(activity.id || '');
  const idMatch = idStr.match(/-task-cag-0?(\d{1,2})-/i);
  if (idMatch) {
    const num = Number(idMatch[1]);
    if (num >= 1 && num <= 10) return `DH ${String(num).padStart(2, '0')}`;
  }
  const locStr = String(activity.location || '').trim();
  const locMatch = locStr.match(/^CAG\s*0?(\d{1,2})\b/i);
  if (locMatch) {
    const num = Number(locMatch[1]);
    if (num >= 1 && num <= 10) return `DH ${String(num).padStart(2, '0')}`;
  }
  return '';
}

function checkinIsGenericEngineerName(value) {
  const eng = String(value || '').trim();
  return !eng || /^respons[aá]vel\s+a\s+definir$/i.test(eng) || /^selecione/i.test(eng) || eng === '—' || eng === '-';
}

function checkinMergeActivitiesIntoReport(sourceReport, targetReport, movedActivities) {
  movedActivities.forEach(act => {
    const oldPrefix = `${sourceReport.id}-`;
    const newActId = String(act.id || '').startsWith(oldPrefix)
      ? `${targetReport.id}-${String(act.id).slice(oldPrefix.length)}`
      : `${targetReport.id}-task-${checkinSlug(act.scheduleId || act.pstItem || `${act.location}-${act.activity}`)}`;
    const updatedAct = { ...act, id: newActId };
    const dupIdx = targetReport.activities.findIndex(existing =>
      existing.id === newActId
      || (existing.pstItem === updatedAct.pstItem && existing.scheduleId === updatedAct.scheduleId && existing.location === updatedAct.location && existing.activity === updatedAct.activity)
    );
    if (dupIdx >= 0) {
      const saved = targetReport.activities[dupIdx];
      targetReport.activities[dupIdx] = {
        ...updatedAct,
        id: saved.id || updatedAct.id,
        shift: saved.shift || updatedAct.shift || 'Diurno',
        checkinAt: saved.checkinAt || updatedAct.checkinAt || '',
        checkoutAt: saved.checkoutAt || updatedAct.checkoutAt || '',
        contractor: saved.contractor || updatedAct.contractor || '',
        actualCrew: saved.actualCrew ?? updatedAct.actualCrew,
        ptaCount: saved.ptaCount ?? updatedAct.ptaCount,
        forkliftCount: saved.forkliftCount ?? updatedAct.forkliftCount,
        executedMeters: saved.executedMeters || updatedAct.executedMeters || 0,
        status: (saved.status && saved.status !== 'Não iniciado') ? saved.status : updatedAct.status,
        problemCode: saved.problemCode || updatedAct.problemCode || '',
        problemOther: saved.problemOther || updatedAct.problemOther || '',
        notes: saved.notes || updatedAct.notes || ''
      };
    } else {
      targetReport.activities.push(updatedAct);
    }
  });
  targetReport.actualCrew = checkinActualCrewTotal(targetReport);
  targetReport.actualPtaCount = checkinActualPtaTotal(targetReport);
  targetReport.forkliftCount = checkinActualForkliftTotal(targetReport);
  targetReport.contractor = checkinUniqueContractors([
    ...targetReport.activities.map(a => a.contractor),
    targetReport.contractor
  ]).join(', ');
  const checkedIn = targetReport.activities.filter(item => item.checkinAt);
  const checkedOut = targetReport.activities.filter(item => item.checkoutAt);
  targetReport.checkinAt = checkedIn.map(item => item.checkinAt).sort()[0] || targetReport.checkinAt || '';
  targetReport.checkoutAt = targetReport.activities.length && checkedOut.length === targetReport.activities.length
    ? checkedOut.map(item => item.checkoutAt).sort().at(-1) : '';
  targetReport.status = targetReport.checkoutAt ? 'fechado' : targetReport.checkinAt ? 'iniciado' : 'planejado';
  targetReport._cleanedGarbage = true;
}

function checkinReconcileCagReports(reportsList) {
  const list = Array.isArray(reportsList) ? reportsList.map(r => ({ ...r, activities: Array.isArray(r.activities) ? [...r.activities] : [] })) : [];
  const byId = new Map(list.map(r => [r.id, r]));
  const knownEngineerByDh = new Map();
  const knownEngineerByDateDh = new Map();
  list.forEach(r => {
    const eng = String(r.engineer || '').trim();
    if (r.dh && !checkinIsGenericEngineerName(eng)) {
      if (!knownEngineerByDh.has(r.dh)) knownEngineerByDh.set(r.dh, eng);
      if (r.workDate && !knownEngineerByDateDh.has(`${r.workDate}|${r.dh}`)) {
        knownEngineerByDateDh.set(`${r.workDate}|${r.dh}`, eng);
      }
    }
  });

  const removedReportIds = [];
  list.forEach(report => {
    if (!byId.has(report.id)) return;
    const kept = [];
    const movedByDh = new Map();
    (report.activities || []).forEach(activity => {
      const targetDh = checkinActivityTargetCagDh(activity);
      if (targetDh && targetDh !== report.dh) {
        const group = movedByDh.get(targetDh) || [];
        group.push(activity);
        movedByDh.set(targetDh, group);
      } else {
        kept.push(activity);
      }
    });
    if (movedByDh.size) {
      report.activities = kept;
      report.actualCrew = checkinActualCrewTotal(report);
      report.actualPtaCount = checkinActualPtaTotal(report);
      report.forkliftCount = checkinActualForkliftTotal(report);
      report.contractor = checkinUniqueContractors(kept.map(a => a.contractor)).join(', ');
      report._cleanedGarbage = true;

      movedByDh.forEach((movedActivities, targetDh) => {
        let targetReport = [...byId.values()].find(r => r.id !== report.id && r.workDate === report.workDate && r.dh === targetDh && !checkinIsGenericEngineerName(r.engineer))
          || [...byId.values()].find(r => r.id !== report.id && r.workDate === report.workDate && r.dh === targetDh);
        if (!targetReport) {
          const fallbackEng = knownEngineerByDateDh.get(`${report.workDate}|${targetDh}`) || knownEngineerByDh.get(targetDh) || 'Responsável a definir';
          const targetId = checkinReportId(report.workDate, targetDh, fallbackEng);
          targetReport = byId.get(targetId) || checkinCreateReport({
            workDate: report.workDate,
            dh: targetDh,
            engineer: fallbackEng,
            discipline: movedActivities[0]?.discipline || report.discipline || '',
            hcEngineer: fallbackEng,
            shift: report.shift || ''
          });
          byId.set(targetReport.id, targetReport);
        }
        checkinMergeActivitiesIntoReport(report, targetReport, movedActivities);
      });

      if (!report.activities.length) {
        byId.delete(report.id);
        if (report.id) removedReportIds.push(report.id);
        return;
      }
    }

    // Se o relatório ficou com "Responsável a definir" (ex.: vindo de CAG 3 ou CAG 4) e existe engenheiro conhecido para o DH, unifica no diário principal do DH
    if (checkinIsGenericEngineerName(report.engineer) && report.dh) {
      const siblingReport = [...byId.values()].find(r =>
        r.id !== report.id && r.workDate === report.workDate && r.dh === report.dh && !checkinIsGenericEngineerName(r.engineer)
      );
      if (siblingReport) {
        checkinMergeActivitiesIntoReport(report, siblingReport, report.activities || []);
        byId.delete(report.id);
        if (report.id) removedReportIds.push(report.id);
      } else {
        const resolvedEng = knownEngineerByDateDh.get(`${report.workDate}|${report.dh}`) || knownEngineerByDh.get(report.dh);
        if (resolvedEng) {
          const newId = checkinReportId(report.workDate, report.dh, resolvedEng);
          const existingTarget = byId.get(newId);
          if (existingTarget && existingTarget.id !== report.id) {
            checkinMergeActivitiesIntoReport(report, existingTarget, report.activities || []);
            byId.delete(report.id);
            if (report.id) removedReportIds.push(report.id);
          } else if (newId !== report.id) {
            const oldId = report.id;
            byId.delete(oldId);
            if (oldId) removedReportIds.push(oldId);
            report.id = newId;
            report.engineer = resolvedEng;
            report.hcEngineer = resolvedEng;
            report.activities = (report.activities || []).map(act => {
              const oldPrefix = `${oldId}-`;
              return String(act.id || '').startsWith(oldPrefix)
                ? { ...act, id: `${newId}-${String(act.id).slice(oldPrefix.length)}` }
                : act;
            });
            report._cleanedGarbage = true;
            byId.set(newId, report);
          }
        }
      }
    }
  });

  return { reports: [...byId.values()], removedReportIds };
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
    const testRowIds = [];
    const cleanedRemote = [];
    const rawRemoteList = [];
    (Array.isArray(rows) ? rows : []).forEach(row => {
      const record = checkinFromRow(row);
      if (checkinIsTestReport(record)) {
        if (record.id) testRowIds.push(record.id);
        return;
      }
      rawRemoteList.push(record);
    });
    const { reports: reconciledRemoteList, removedReportIds } = checkinReconcileCagReports(rawRemoteList);
    testRowIds.push(...removedReportIds);
    const remote = new Map();
    reconciledRemoteList.forEach(record => {
      if (record._cleanedGarbage) {
        delete record._cleanedGarbage;
        record.updatedAt = new Date().toISOString();
        cleanedRemote.push(record);
      }
      remote.set(record.id, record);
    });
    if (testRowIds.length) {
      Promise.allSettled(testRowIds.map(id =>
        supabaseRestRequest(`${CHECKIN_TABLE}?id=eq.${encodeURIComponent(id)}`, { method: 'DELETE', queueOffline: false })
      )).catch(() => { });
    }
    const pending = [...cleanedRemote];
    checkinReports.forEach(local => {
      delete local._cleanedGarbage;
      const remoteRecord = remote.get(local.id);
      if (!remoteRecord || Date.parse(local.updatedAt || 0) > Date.parse(remoteRecord.updatedAt || 0)) {
        if (!pending.some(p => p.id === local.id)) pending.push(local);
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

function checkinUniqueContractors(values) {
  const list = Array.isArray(values) ? values : [values];
  const seen = new Map();
  list.forEach(item => {
    String(item || '')
      .split(',')
      .map(part => part.trim())
      .filter(part => part && part !== '—' && part !== '-')
      .forEach(part => {
        const key = checkinNormalizeHeader(part);
        if (key && !seen.has(key)) seen.set(key, part);
      });
  });
  return [...seen.values()].sort((a, b) => a.localeCompare(b, 'pt-BR'));
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
  const companies = checkinUniqueContractors([
    ...(report.activities || []).map(a => a.contractor),
    report.contractor
  ]);
  return companies.length > 0 ? companies.join(', ') : '—';
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

function checkinNormalizeShift(value) {
  const norm = checkinNormalizeHeader(value);
  if (!norm) return '';
  if (/^noturn|^noite|\bnoturn|\bnoite/.test(norm)) return 'Noturno';
  if (/^diurn|^dia\b|\bdiurn/.test(norm)) return 'Diurno';
  return '';
}

function checkinGetActivityShift(report, activity) {
  const taskShift = checkinNormalizeShift(activity?.shift);
  if (taskShift) return taskShift;
  const reportShift = checkinNormalizeShift(report?.shift);
  return reportShift || 'Diurno';
}

function checkinShiftSelectOptions(selected = '', allLabel = 'Todos') {
  return `<option value="">${allLabel}</option>
    <option value="Diurno" ${selected === 'Diurno' ? 'selected' : ''}>☀️ Diurno</option>
    <option value="Noturno" ${selected === 'Noturno' ? 'selected' : ''}>🌙 Noturno</option>`;
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
  // Verifica Duto antes de Isolamento para que "isolamento de duto" em frentes de duto não vire Isolamento
  if (/\bdutos?\b|\bduct|\bdamper|\bventil/.test(description)) return 'Duto';
  if (/tubul|hidraul|hidrante|dreno|esgoto|agua|bomba|sprinkler/.test(description)) return 'Hidráulica';
  if (/isolamento|isolante|armaflex|cladding|manta/.test(description)) return 'Isolamento';
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
  return checkinUniqueContractors([...fromWorkforce, ...fromReports]);
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

const CHECKIN_DEFAULT_SUBAREAS = [
  { id: 'corredor-pdu', name: 'CORREDOR PDU' },
  { id: 'salas-eletricas', name: 'SALAS ELÉTRICAS' }
];

function checkinExtraSectors() {
  const sectors = [];
  const seenKeys = new Set();
  const pushSector = (sector) => {
    const id = String(sector?.id || '').trim();
    const name = String(sector?.name || '').trim();
    if (!id || !name) return;
    const nameKey = checkinSlug(name);
    const idKey = checkinSlug(id);
    if (seenKeys.has(idKey) || seenKeys.has(nameKey)) return;
    seenKeys.add(idKey);
    seenKeys.add(nameKey);
    sectors.push({ ...sector, id, name });
  };
  if (typeof spoolGetAvailableSectors === 'function') {
    const items = typeof spoolGetAllControlItems === 'function'
      ? spoolGetAllControlItems()
      : (typeof spoolDb !== 'undefined' ? spoolDb : []);
    spoolGetAvailableSectors(items).forEach(pushSector);
  }
  CHECKIN_DEFAULT_SUBAREAS.forEach(pushSector);
  return sectors;
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

function checkinExtraSubAreas() {
  const subAreas = [];
  const seenKeys = new Set();
  const pushSubArea = (subArea) => {
    const id = String(subArea?.id || '').trim();
    const name = String(subArea?.name || '').trim();
    if (!id || !name) return;
    const nameKey = checkinSlug(name);
    const idKey = checkinSlug(id);
    if (seenKeys.has(idKey) || seenKeys.has(nameKey)) return;
    seenKeys.add(idKey);
    seenKeys.add(nameKey);
    subAreas.push({ id, name });
  };
  if (typeof spoolGetAvailableSubAreas === 'function') {
    const items = typeof spoolGetAllControlItems === 'function'
      ? spoolGetAllControlItems()
      : (typeof spoolDb !== 'undefined' ? spoolDb : []);
    spoolGetAvailableSubAreas(items, 'all').forEach(pushSubArea);
  }
  CHECKIN_DEFAULT_SUBAREAS.forEach(pushSubArea);
  return subAreas;
}

function checkinExtraSubAreaOptions(selected = '') {
  const subAreas = checkinExtraSubAreas();
  return `<option value="">Selecione uma subárea</option>${subAreas.map(subArea =>
    `<option value="${esc(subArea.id)}" ${selected === subArea.id ? 'selected' : ''}>${esc(subArea.name)}</option>`
  ).join('')}`;
}

function checkinExtraSubAreaFromForm(value) {
  return checkinExtraSubAreas().find(subArea => subArea.id === String(value || '')) || null;
}

function checkinComposeExtraLocation(rawLocation, subArea, sector) {
  const parts = [];
  const seen = new Set();
  [rawLocation, subArea?.name, sector?.name].forEach(value => {
    const clean = String(value || '').trim();
    if (!clean) return;
    const key = checkinSlug(clean);
    if (seen.has(key)) return;
    seen.add(key);
    parts.push(clean);
  });
  return parts.join(' - ');
}

function checkinNormalizeDataHall(value) {
  const raw = String(value || '').trim();
  const cagMatch = raw.match(/^CAG\s*0?(\d{1,2})\b/i);
  if (cagMatch) {
    const cagNumber = Number(cagMatch[1]);
    return cagNumber >= 1 && cagNumber <= 10 ? `DH ${String(cagNumber).padStart(2, '0')}` : '';
  }
  const match = raw.match(/^(?:DH|DATA\s*HALL)?\s*0?(\d{1,2})$/i);
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

function checkinSyncFiltersFromDom() {
  const isIsoDate = val => typeof val === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(val.trim());
  const dailyDateEl = document.querySelector('[data-checkin-daily-date]');
  if (dailyDateEl && isIsoDate(dailyDateEl.value)) {
    checkinSelectedDate = dailyDateEl.value.trim();
  }
  const planStartEl = document.querySelector('[data-checkin-plan-start]');
  if (planStartEl && isIsoDate(planStartEl.value)) {
    checkinPlanStart = planStartEl.value.trim();
  }
  const planEndEl = document.querySelector('[data-checkin-plan-end]');
  if (planEndEl && isIsoDate(planEndEl.value)) {
    checkinPlanEnd = planEndEl.value.trim();
  }
  const curveStartEl = document.querySelector('[data-checkin-curve-start]');
  if (curveStartEl && isIsoDate(curveStartEl.value)) {
    checkinCurveStart = curveStartEl.value.trim();
  }
  const curveEndEl = document.querySelector('[data-checkin-curve-end]');
  if (curveEndEl && isIsoDate(curveEndEl.value)) {
    checkinCurveEnd = curveEndEl.value.trim();
  }
  const summaryStartEl = document.querySelector('[data-checkin-summary-start]');
  if (summaryStartEl && isIsoDate(summaryStartEl.value)) {
    checkinSummaryStart = summaryStartEl.value.trim();
  }
  const summaryEndEl = document.querySelector('[data-checkin-summary-end]');
  if (summaryEndEl && isIsoDate(summaryEndEl.value)) {
    checkinSummaryEnd = summaryEndEl.value.trim();
  }
}

function checkinComputeDailyView() {
  const dayReports = checkinReports.filter(report => report.workDate === checkinSelectedDate);
  const companies = checkinCompanies();
  const visibleReports = dayReports
    .map(report => {
      if (!checkinDisciplineFilter && !checkinShiftFilter && !checkinAreaFilter) return report;
      const filteredActivities = (report.activities || []).filter(activity =>
        (!checkinDisciplineFilter || checkinGetActivityDiscipline(report, activity) === checkinDisciplineFilter)
        && (!checkinShiftFilter || checkinGetActivityShift(report, activity) === checkinShiftFilter)
        && (!checkinAreaFilter || checkinExtractAreaLabel(report, activity) === checkinAreaFilter)
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
  const totalRemaining = Math.max(0, Math.round((totalPlanned - totalExecuted) * 100) / 100);
  const openReports = visibleReports.filter(report => !report.checkoutAt).length;
  const recurrenceIndex = checkinBuildWeeklyRecurrenceIndex(checkinSelectedDate);

  // Resumo acumulado da semana para o recorte atual (ex.: CAG 4, DH 04, ou tudo)
  const { start: weekStart, end: weekEnd } = checkinWeekBounds(checkinSelectedDate);
  let weekPlanned = 0;
  let weekExecuted = 0;
  const weekUniqueKeys = new Set();
  checkinReports
    .filter(r => r.workDate >= weekStart && r.workDate <= weekEnd)
    .filter(r => (!checkinEngineerFilter || r.engineer === checkinEngineerFilter) && (!checkinDhFilter || r.dh === checkinDhFilter))
    .forEach(r => {
      (r.activities || []).forEach(a => {
        if (checkinDisciplineFilter && checkinGetActivityDiscipline(r, a) !== checkinDisciplineFilter) return;
        if (checkinShiftFilter && checkinGetActivityShift(r, a) !== checkinShiftFilter) return;
        if (checkinAreaFilter && checkinExtractAreaLabel(r, a) !== checkinAreaFilter) return;
        if (checkinCompanyFilter && (a.contractor ? a.contractor !== checkinCompanyFilter : r.contractor !== checkinCompanyFilter)) return;
        weekPlanned += checkinActivityOriginalPlannedMeters(a);
        weekExecuted += checkinParseNumber(a.executedMeters);
        const key = checkinActivityRecurrenceKey(r.dh, a);
        if (key) weekUniqueKeys.add(key);
      });
    });
  weekPlanned = Math.round(weekPlanned * 100) / 100;
  weekExecuted = Math.round(weekExecuted * 100) / 100;
  const weekRemaining = Math.max(0, Math.round((weekPlanned - weekExecuted) * 100) / 100);
  const weekPct = weekPlanned > 0 ? Math.round((weekExecuted / weekPlanned) * 100) : (weekExecuted > 0 ? 100 : 0);
  const weekSummary = {
    start: weekStart,
    end: weekEnd,
    planned: weekPlanned,
    executed: weekExecuted,
    remaining: weekRemaining,
    pct: weekPct,
    uniqueCount: weekUniqueKeys.size
  };

  return { visibleReports, companies, totalPlanned, totalExecuted, totalRemaining, openReports, recurrenceIndex, weekSummary };
}

async function renderCheckIn() {
  const app = document.getElementById('app');
  if (!app) return;
  checkinSyncFiltersFromDom();
  if (!checkinLoadedRemote) {
    app.innerHTML = '<div class="checkin-loading">Carregando planejamento diário…</div>';
  }
  await checkinLoadReports();
  if (checkinActiveTab === 'diario') {
    await checkinSyncCarryoverFromPreviousDay(checkinSelectedDate, { persist: true });
  }

  const engineers = checkinUniqueOptions(checkinReports.map(report => report.engineer));
  const dataHalls = CHECKIN_DATA_HALLS;
  const areas = checkinAllAreas();
  const disciplines = checkinAllDisciplines();
  const { visibleReports, companies, totalPlanned, totalExecuted, totalRemaining, openReports, recurrenceIndex, weekSummary } = checkinComputeDailyView();
  const canManagePlanning = checkinCanManagePlanning();

  app.innerHTML = `
    ${pageHeader('Check-in e Check-out Diário', 'Planeje as frentes por engenheiro e acompanhe o executado, desvios e Curva S.', 'PRODUÇÃO DE CAMPO', `<button class="button button-dark" onclick="checkinOpenReportPDF()">${icon('print')} Relatório PDF + Curva S</button><button class="button button-outline" onclick="checkinDownloadTemplate()">${icon('download')} Modelo semanal</button>${canManagePlanning ? `<button class="button button-green" onclick="checkinOpenImport()">${icon('upload')} Importar semana</button>` : ''}`)}
    <nav class="checkin-tabs" aria-label="Seções de check-in">
      <button class="${checkinActiveTab === 'diario' ? 'active' : ''}" onclick="checkinSetTab('diario')">Diário de campo</button>
      <button class="${checkinActiveTab === 'resumo' ? 'active' : ''}" onclick="checkinSetTab('resumo')">Acumulado (Semana / Áreas)</button>
      <button class="${checkinActiveTab === 'planejamento' ? 'active' : ''}" onclick="checkinSetTab('planejamento')">Planejamento</button>
      <button class="${checkinActiveTab === 'curva' ? 'active' : ''}" onclick="checkinSetTab('curva')">Curva S</button>
    </nav>
    ${checkinActiveTab === 'diario' ? checkinRenderDaily(visibleReports, engineers, dataHalls, areas, disciplines, companies, totalPlanned, totalExecuted, totalRemaining, openReports, recurrenceIndex, weekSummary) : ''}
    ${checkinActiveTab === 'resumo' ? checkinRenderSummary(engineers, dataHalls, areas, disciplines, companies) : ''}
    ${checkinActiveTab === 'planejamento' ? checkinRenderPlanning(engineers, dataHalls, disciplines, companies) : ''}
    ${checkinActiveTab === 'curva' ? checkinRenderCurve(engineers, dataHalls, disciplines, companies) : ''}
  `;
  document.querySelectorAll('.checkin-note-input, .checkin-inline-textarea').forEach(checkinResizeNote);
  if (typeof hydrateIcons === 'function') hydrateIcons();
}

function checkinRenderDailyResults(reports, companies, planned, executed, openReports, totalRemaining = Math.max(0, Math.round((planned - executed) * 100) / 100), recurrenceIndex = null, weekSummary = null) {
  const recIndex = recurrenceIndex || checkinBuildWeeklyRecurrenceIndex(checkinSelectedDate);
  const scopeLabel = [checkinAreaFilter, checkinDhFilter, checkinDisciplineFilter, checkinEngineerFilter].filter(Boolean).join(' · ') || 'Obra geral';
  const weekBannerHtml = weekSummary && (weekSummary.planned > 0 || weekSummary.executed > 0)
    ? `<section class="checkin-week-banner">
        <div class="checkin-week-banner-stats">
          <span><strong>📅 Acumulado da semana (${checkinFormatDate(weekSummary.start)} a ${checkinFormatDate(weekSummary.end)}) — ${esc(scopeLabel)}:</strong></span>
          <span>Programado: <strong>${checkinNumber(weekSummary.planned)} m</strong></span>
          <span>Instalado: <strong style="color:#15803d;">${checkinNumber(weekSummary.executed)} m (${weekSummary.pct}%)</strong></span>
          <span>Falta: <strong style="color:${weekSummary.remaining > 0 ? '#b45309' : '#15803d'};">${checkinNumber(weekSummary.remaining)} m</strong></span>
        </div>
        <button class="button button-outline compact" onclick="checkinOpenSummaryFromDaily()">Ver detalhamento por atividade / área</button>
      </section>`
    : '';
  return `
    <section class="checkin-metrics">
      <article><small>ATIVIDADES DO DIA</small><strong>${reports.reduce((sum, report) => sum + report.activities.length, 0)}</strong></article>
      <article><small>PLANEJADO (DIA)</small><strong>${checkinNumber(planned)} m</strong></article>
      <article><small>EXECUTADO (DIA)</small><strong>${checkinNumber(executed)} m</strong></article>
      <article><small>FALTA (DIA)</small><strong style="color:${totalRemaining > 0 ? '#b45309' : '#15803d'}">${checkinNumber(totalRemaining)} m</strong></article>
      <article><small>DIÁRIOS EM ABERTO</small><strong>${openReports}</strong></article>
    </section>
    ${weekBannerHtml}
    ${reports.length ? reports.map(report => checkinRenderDailyReport(report, companies, recIndex)).join('') : `<section class="checkin-empty"><span>${icon('calendar')}</span><h2>Nenhuma atividade planejada para ${checkinFormatDate(checkinSelectedDate)}</h2><p>Importe a planilha semanal ou cadastre uma atividade planejada para abrir o diário de campo.</p><button class="button button-green" onclick="checkinSetTab('planejamento')">Abrir planejamento</button></section>`}
  `;
}

function checkinRenderDaily(reports, engineers, dataHalls, areas, disciplines, companies, planned, executed, totalRemaining, openReports, recurrenceIndex, weekSummary) {
  return `
    <section class="checkin-filter-panel">
      <label><span>Data do diário</span><input type="date" data-checkin-daily-date value="${checkinSelectedDate}" oninput="checkinSetDay(this.value)" onchange="checkinSetDay(this.value)"></label>
      <label><span>Turno</span><select onchange="checkinSetDailyFilter('shift', this.value)">${checkinShiftSelectOptions(checkinShiftFilter, 'Todos')}</select></label>
      <label><span>Disciplina</span><select onchange="checkinSetDailyFilter('discipline', this.value)">${checkinSelectOptions(disciplines, checkinDisciplineFilter, 'Todas')}</select></label>
      <label><span>Empresa</span><select onchange="checkinSetDailyFilter('company', this.value)">${checkinSelectOptions(companies, checkinCompanyFilter, 'Todas')}</select></label>
      <label><span>Engenheiro</span><select onchange="checkinSetDailyFilter('engineer', this.value)">${checkinSelectOptions(engineers, checkinEngineerFilter, 'Todos')}</select></label>
      <label><span>Data Hall</span><select onchange="checkinSetDailyFilter('dh', this.value)">${checkinSelectOptions(dataHalls, checkinDhFilter, 'Todos')}</select></label>
      <label><span>Área / CAG</span><select onchange="checkinSetDailyFilter('area', this.value)">${checkinSelectOptions(areas, checkinAreaFilter, 'Todas')}</select></label>
      <button class="button button-outline" onclick="checkinOpenStandaloneExtra()">Planejar atividade extra</button>
      <button class="button button-outline" onclick="checkinLoadReports({force:true}).then(renderCheckIn)">${icon('refresh')} Atualizar</button>
      <button class="button button-outline" onclick="checkinCopyDayWhatsApp('checkin')">Copiar check-ins do dia</button>
      <button class="button button-outline" onclick="checkinCopyDayWhatsApp('checkout')">Copiar checkouts do dia</button>
      <button class="button button-dark" onclick="checkinOpenReportPDF('daily')">${icon('print')} Extrair PDF do dia</button>
    </section>
    <div id="checkinDailyResults">
      ${checkinRenderDailyResults(reports, companies, planned, executed, openReports, totalRemaining, recurrenceIndex, weekSummary)}
    </div>
  `;
}

function checkinRenderDailyReport(report, companies = checkinCompanies(), recurrenceIndex = null) {
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
      <span><small>Supervisor</small><input class="checkin-meta-input" data-report-id="${esc(report.id)}" data-header-field="supervisor" type="text" value="${esc(report.supervisor || '')}" placeholder="Nome do supervisor" onchange="checkinAutoSaveReport('${esc(report.id)}')"></span>
      <span><small>Atividades com entrada / saida</small><strong>${checkinCount} / ${checkoutCount} de ${report.activities.length}</strong></span>
    </div>
    <div class="checkin-activity-table-wrap"><table class="checkin-activity-table">
      <thead><tr><th>Item / cronograma</th><th>Local e atividade</th><th>Un.</th><th>Prev. dia</th><th>Exec. dia</th><th>%</th><th>Status</th><th>Cod. problema</th><th>Observacao</th><th>Efetivo / Check-in por tarefa</th>${checkinCanDeletePlanning() ? '<th>Excluir</th>' : ''}</tr></thead>
      <tbody>${report.activities.map(activity => checkinRenderActivityRow(report, activity, companies, recurrenceIndex)).join('')}</tbody>
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

function checkinRenderActivityRow(report, activity, companies = checkinCompanies(), recurrenceIndex = null) {
  const planned = checkinParseNumber(activity.plannedMeters);
  const executed = checkinParseNumber(activity.executedMeters);
  const unit = activity.unit || 'm';
  const isExtra = checkinIsExtraActivity(activity);
  const isCarryover = checkinIsCarryoverActivity(activity);
  const mergedCarryMeters = checkinParseNumber(activity.carryoverAddedMeters);
  const hasMergedCarry = !isCarryover && mergedCarryMeters > 0;
  const basePlanned = checkinActivityOriginalPlannedMeters(activity);
  const percent = planned > 0 ? `${checkinNumber(executed / planned * 100, 0)}%` : executed ? '100%' : '—';
  const currentStatus = checkinResolveMigratedStatus(activity, activity.checkinAt, activity.checkoutAt);
  const isClosed = Boolean(activity.checkoutAt || currentStatus === 'Concluído');
  const isRunning = Boolean(activity.checkinAt && !isClosed);
  const isSuspended = currentStatus === 'Suspenso';
  const isPartial = currentStatus === 'Parcial';
  const actShift = checkinGetActivityShift(report, activity);
  const isNightShift = actShift === 'Noturno';
  const rowStateClass = `${isRunning ? 'is-running' : isClosed ? 'is-closed' : 'is-pending'} ${isSuspended ? 'is-suspended' : isPartial ? 'is-partial' : ''} ${isNightShift ? 'is-night-shift' : 'is-day-shift'} ${isExtra ? 'is-extra-task' : ''} ${isCarryover || hasMergedCarry ? 'is-carryover-task' : ''}`;
  const actDiscipline = checkinGetActivityDiscipline(report, activity);
  const rawTaskContractors = checkinUniqueContractors([activity.contractor]);
  const fallbackReportContractors = checkinUniqueContractors([report.contractor]);
  const taskContractor = rawTaskContractors[0] || (fallbackReportContractors.length === 1 ? fallbackReportContractors[0] : '');
  const disciplineOptions = checkinUniqueOptions([...CHECKIN_DISCIPLINES, actDiscipline].filter(Boolean));
  const checkinTimeVal = checkinTimeInputValue(activity.checkinAt);
  const checkoutTimeVal = checkinTimeInputValue(activity.checkoutAt);

  const timeSpanLabel = activity.checkinAt && activity.checkoutAt
    ? `${checkinFormatTime(activity.checkinAt)} → ${checkinFormatTime(activity.checkoutAt)}`
    : activity.checkinAt
      ? checkinFormatTime(activity.checkinAt)
      : activity.checkoutAt
        ? checkinFormatTime(activity.checkoutAt)
        : '';

  let statusPill = '';
  if (isSuspended) {
    statusPill = `<span class="checkin-status-pill suspended">⏸ Suspensa${timeSpanLabel ? ` (${timeSpanLabel})` : ''}</span>`;
  } else if (isClosed) {
    if (isPartial) {
      statusPill = `<span class="checkin-status-pill partial">◐ Parcial · Finalizada${timeSpanLabel ? ` (${timeSpanLabel})` : ''}</span>`;
    } else {
      statusPill = `<span class="checkin-status-pill closed">✓ Finalizada${timeSpanLabel ? ` (${timeSpanLabel})` : ''}</span>`;
    }
  } else if (isRunning) {
    if (isPartial) {
      statusPill = `<span class="checkin-status-pill partial"><span class="pulse-dot"></span> Parcial (${checkinFormatTime(activity.checkinAt)})</span>`;
    } else {
      statusPill = `<span class="checkin-status-pill running"><span class="pulse-dot"></span> Em andamento (${checkinFormatTime(activity.checkinAt)})</span>`;
    }
  } else if (isPartial) {
    statusPill = `<span class="checkin-status-pill partial">◐ Parcial</span>`;
  } else {
    statusPill = `<span class="checkin-status-pill pending">${isNightShift ? '🌙 Aguardando Noturno' : 'Não iniciada'}</span>`;
  }

  const extraPill = `<span class="checkin-extra-pill" data-extra-pill style="${isExtra ? '' : 'display:none'}">➕ Extra (não programada)</span>`;
  const carryoverPill = isCarryover
    ? `<span class="checkin-carryover-pill" title="Saldo não cumprido puxado automaticamente do dia ${esc(checkinFormatDate(activity.carryoverFromDate))}">↩️ Saldo de ${esc(checkinFormatDate(activity.carryoverFromDate))}</span><button type="button" class="checkin-carryover-dismiss" onclick="checkinDismissCarryover('${esc(report.id)}','${esc(activity.id)}')" title="Excluir este saldo deste dia">✕ Remover saldo</button>`
    : hasMergedCarry
      ? `<span class="checkin-carryover-pill" title="Saldo de ${checkinNumber(mergedCarryMeters)} ${esc(unit)} puxado de ${esc(checkinFormatDate(activity.carryoverFromDate))} e somado à programação de hoje (${checkinNumber(basePlanned)} ${esc(unit)})">↩️ +${checkinNumber(mergedCarryMeters)} ${esc(unit)} saldo de ${esc(checkinFormatDate(activity.carryoverFromDate))} (prog. dia: ${checkinNumber(basePlanned)} ${esc(unit)})</span><button type="button" class="checkin-carryover-dismiss" onclick="checkinDismissCarryover('${esc(report.id)}','${esc(activity.id)}')" title="Remover apenas o saldo somado e manter a metragem original de hoje">✕ Remover saldo</button>`
      : '';

  const recKey = checkinActivityRecurrenceKey(report.dh, activity);
  const recInfo = recurrenceIndex && recKey ? recurrenceIndex.get(recKey) : null;
  const recExcess = recInfo && recInfo.plannedTotal > 0 && recInfo.executedTotal > recInfo.plannedTotal
    ? Math.round((recInfo.executedTotal - recInfo.plannedTotal) * 100) / 100
    : 0;
  const recBarClass = recExcess > 0 ? 'is-warn' : recInfo && recInfo.pct >= 100 ? '' : recInfo && recInfo.pct >= 50 ? 'is-warn' : 'is-low';
  const recurrenceBadge = recInfo && recInfo.daysCount > 1
    ? `<div class="checkin-recurrence-badge ${recExcess > 0 ? 'is-over' : ''}" title="Total acumulado desta atividade na semana (${checkinFormatDate(recInfo.weekStart)} a ${checkinFormatDate(recInfo.weekEnd)})">
        <div>📅 <strong>Semana (${recInfo.daysCount} dias):</strong> Prog. <strong>${checkinNumber(recInfo.plannedTotal)} ${esc(recInfo.unit)}</strong> · Inst. <strong>${checkinNumber(recInfo.executedTotal)} ${esc(recInfo.unit)}</strong> · ${recExcess > 0 ? `<strong style="color:#b91c1c;">⚠️ Excedeu +${checkinNumber(recExcess)} ${esc(recInfo.unit)} (conferir)</strong>` : `Falta <strong>${checkinNumber(recInfo.remainingTotal)} ${esc(recInfo.unit)}</strong>`} (${recInfo.pct}%)</div>
        <div class="checkin-mini-bar"><div class="checkin-mini-bar-fill ${recBarClass}" style="width:${Math.min(100, Math.max(0, recInfo.pct))}%"></div></div>
      </div>`
    : '';

  const subItems = Array.isArray(activity.subItems) ? activity.subItems : [];
  const subSummary = checkinSubItemsSummary(subItems);
  const detectedTpl = !subItems.length ? checkinDetectSubItemTemplate(activity.activity) : null;
  const subItemsHtml = subItems.length
    ? `<div class="checkin-subitems-box">
        <div class="checkin-subitems-head">
          <span>🔧 <strong>${subSummary.done}/${subSummary.total}</strong>${subSummary.pendingLabels.length ? ` · Falta: <strong>${esc(subSummary.pendingLabels.join(', '))}</strong>` : ' · <strong>Todas concluídas</strong>'}</span>
          <button type="button" class="checkin-subitem-add" onclick="checkinEditSubItems('${esc(report.id)}','${esc(activity.id)}')" title="Editar ou limpar checklist de máquinas/itens">Editar</button>
        </div>
        <div class="checkin-subitems-list">
          ${subItems.map((si, idx) => `<button type="button" class="checkin-subitem-pill ${si.done ? 'is-done' : 'is-pending'}" onclick="checkinToggleSubItem('${esc(report.id)}','${esc(activity.id)}',${idx})">${si.done ? '✓' : '○'} ${esc(si.label)}</button>`).join('')}
        </div>
      </div>`
    : `<div class="checkin-subitems-actions">
        ${detectedTpl
    ? `<button type="button" class="checkin-subitem-add" onclick="checkinCreateSubItems('${esc(report.id)}','${esc(activity.id)}',${detectedTpl.count},'${esc(detectedTpl.prefix)}')">+ Checklist (${detectedTpl.count}x ${esc(detectedTpl.prefix)})</button>`
    : `<button type="button" class="checkin-subitem-add" onclick="checkinCreateSubItems('${esc(report.id)}','${esc(activity.id)}',0,'')">+ Checklist máquinas / itens</button>`}
      </div>`;

  const unitOptions = checkinUniqueOptions([...CHECKIN_UNITS, unit].filter(Boolean));

  return `<tr class="checkin-activity-row ${rowStateClass}" data-report-id="${esc(report.id)}" data-activity-id="${esc(activity.id)}">
    <td>${statusPill}${extraPill}${carryoverPill}<strong>${esc(activity.pstItem || (isExtra ? 'EXTRA' : '—'))}</strong><small>${esc(activity.scheduleId || (isExtra ? 'Atividade não programada' : 'Sem ID de cronograma'))}</small></td>
    <td>
      <input class="checkin-inline-text strong" type="text" data-activity-field="location" value="${esc(activity.location || '')}" placeholder="Local / sala" onchange="checkinAutoSaveReport('${esc(report.id)}')">
      <textarea class="checkin-inline-textarea" rows="2" data-activity-field="activity" placeholder="Descrição da atividade" oninput="checkinResizeNote(this)" onchange="checkinAutoSaveReport('${esc(report.id)}')">${esc(activity.activity || '')}</textarea>
      <div class="checkin-task-inline-meta">
        <select class="checkin-discipline-select" data-activity-field="discipline" onchange="checkinOnTaskDisciplineChange(this, '${esc(report.id)}')">${checkinSelectOptions(disciplineOptions, actDiscipline, 'Disciplina')}</select>
        <select class="checkin-shift-select ${isNightShift ? 'is-night' : 'is-day'}" data-activity-field="shift" onchange="checkinOnTaskShiftChange(this, '${esc(report.id)}')" title="Turno da tarefa (Diurno ou Noturno)">
          <option value="Diurno" ${!isNightShift ? 'selected' : ''}>☀️ Diurno</option>
          <option value="Noturno" ${isNightShift ? 'selected' : ''}>🌙 Noturno</option>
        </select>
      </div>
      ${subItemsHtml}
      ${recurrenceBadge}
    </td>
    <td><select class="checkin-unit-select" data-activity-field="unit" onchange="checkinAutoSaveReport('${esc(report.id)}').then(() => checkinRefreshDailyDom())">${unitOptions.map(u => `<option value="${esc(u)}" ${unit === u ? 'selected' : ''}>${esc(u)}</option>`).join('')}</select></td>
    <td><div class="checkin-planned-wrap"><input class="checkin-number-input" type="number" min="0" step="0.1" data-activity-field="plannedMeters" value="${esc(planned)}" oninput="checkinUpdatePercent(this)" onchange="checkinAutoSaveReport('${esc(report.id)}')"> <span>${esc(unit)}</span></div></td>
    <td><input class="checkin-number-input" type="number" min="0" step="0.1" data-activity-field="executedMeters" value="${esc(executed)}" oninput="checkinUpdatePercent(this)" onchange="checkinOnExecutedChange(this, '${esc(report.id)}', '${esc(activity.id)}')"></td>
    <td class="checkin-percent-cell">${percent}</td>
    <td><select data-activity-field="status" onchange="checkinOnTaskStatusChange(this, '${esc(report.id)}', '${esc(activity.id)}')">${CHECKIN_STATUS.map(status => `<option ${currentStatus === status ? 'selected' : ''}>${status}</option>`).join('')}</select></td>
    <td><select data-activity-field="problemCode" onchange="checkinToggleOther(this); checkinAutoSaveReport('${esc(report.id)}')"><option value="">—</option>${CHECKIN_PROBLEMS.map(([code, label]) => `<option value="${code}" ${activity.problemCode === code ? 'selected' : ''}>${code} - ${label}</option>`).join('')}</select><input class="checkin-problem-other" data-activity-field="problemOther" placeholder="Descreva outro motivo" value="${esc(activity.problemOther || '')}" style="${activity.problemCode === 'OUTRO' ? '' : 'display:none'}" onchange="checkinAutoSaveReport('${esc(report.id)}')"></td>
    <td><textarea class="checkin-note-input" data-activity-field="notes" rows="2" oninput="checkinResizeNote(this)" onchange="checkinAutoSaveReport('${esc(report.id)}')" placeholder="${isExtra ? 'Observação / motivo da atividade extra (opcional)' : 'Observação'}" maxlength="500">${esc(activity.notes || '')}</textarea></td>
    <td class="checkin-task-actions">
      <label class="checkin-task-field-label"><span>Empresa</span><select data-activity-field="contractor" onchange="checkinUpdateCardTotals(this); checkinAutoSaveReport('${esc(report.id)}')">${checkinSelectOptions(companies, taskContractor, 'Selecione a empresa')}</select></label>
      <label class="checkin-task-field-label"><span data-crew-label>${esc(checkinActualCrewLabel(actDiscipline || report.discipline))}</span><input type="number" min="0" step="1" data-activity-field="actualCrew" value="${activity.actualCrew ?? ''}" placeholder="Pessoas" style="${isRunning ? 'border-color:#16a34a;' : ''}" oninput="checkinUpdateCardTotals(this)" onchange="checkinAutoSaveReport('${esc(report.id)}')"></label>
      <div class="checkin-task-equip-grid">
        <label class="checkin-task-field-label"><span>Qtd PTA</span><input type="number" min="0" step="1" data-activity-field="ptaCount" value="${activity.ptaCount ?? ''}" placeholder="0" oninput="checkinUpdateCardTotals(this)" onchange="checkinAutoSaveReport('${esc(report.id)}')"></label>
        <label class="checkin-task-field-label"><span>Empilhadeira</span><input type="number" min="0" step="1" data-activity-field="forkliftCount" value="${activity.forkliftCount ?? ''}" placeholder="0" oninput="checkinUpdateCardTotals(this)" onchange="checkinAutoSaveReport('${esc(report.id)}')"></label>
      </div>
      <div class="checkin-task-time-grid">
        <label class="checkin-task-field-label"><span>Início</span><input type="time" data-activity-field="checkinTime" value="${esc(checkinTimeVal)}"></label>
        <label class="checkin-task-field-label"><span>Término</span><input type="time" data-activity-field="checkoutTime" value="${esc(checkoutTimeVal)}"></label>
      </div>
      ${isRunning ? `
        <div class="checkin-time-box running"><strong>● Entrada: ${checkinFormatTime(activity.checkinAt)}</strong><small>Check-in ativo — ajuste os horários acima e clique nos botões abaixo para salvar</small></div>
        <button class="button button-green compact" onclick="checkinRegister('${esc(report.id)}','checkout','${esc(activity.id)}')">Registrar saída</button>
        <button class="button button-outline compact" onclick="checkinRegister('${esc(report.id)}','checkin','${esc(activity.id)}')">Salvar / atualizar entrada</button>
      ` : isClosed ? `
        <div class="checkin-time-box closed"><strong>✓ Finalizada</strong><small>${activity.checkinAt && activity.checkoutAt ? `${checkinFormatTime(activity.checkinAt)} às ${checkinFormatTime(activity.checkoutAt)}` : timeSpanLabel || 'Concluída'}</small></div>
        <button class="button button-outline compact" onclick="checkinRegister('${esc(report.id)}','checkout','${esc(activity.id)}')">Salvar / atualizar saída</button>
        <button class="button button-outline compact" onclick="checkinRegister('${esc(report.id)}','checkin','${esc(activity.id)}')">Salvar / atualizar entrada</button>
        <button class="button button-outline compact" onclick="checkinReopenTask('${esc(report.id)}','${esc(activity.id)}')">Reabrir tarefa</button>
      ` : `
        <small>Defina o horário ou clique para abrir</small>
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
  const plannedInput = row.querySelector('[data-activity-field="plannedMeters"]');
  const executedInput = row.querySelector('[data-activity-field="executedMeters"]');
  const planned = plannedInput ? checkinParseNumber(plannedInput.value) : checkinParseNumber(activity.plannedMeters);
  const executed = executedInput ? checkinParseNumber(executedInput.value) : checkinParseNumber(activity.executedMeters);
  const cell = row.querySelector('.checkin-percent-cell');
  if (cell) cell.textContent = planned > 0 ? `${checkinNumber(executed / planned * 100, 0)}%` : executed ? '100%' : '—';
}

function checkinToggleOther(select) {
  const input = select.closest('td')?.querySelector('.checkin-problem-other');
  if (input) input.style.display = select.value === 'OUTRO' ? '' : 'none';
}

function checkinToggleExtraReason(select) {
  const row = select.closest('tr');
  const input = row?.querySelector('[data-activity-field="notes"]');
  const extraCheckbox = row?.querySelector('[data-activity-field="isExtra"]');
  const isExtra = Boolean(extraCheckbox?.checked);
  if (input) {
    input.required = false;
    input.placeholder = isExtra ? 'Observação / motivo da atividade extra (opcional)' : 'Observação';
  }
}

async function checkinOnTaskExtraChange(checkbox, reportId) {
  const isExtra = Boolean(checkbox.checked);
  const label = checkbox.closest('.checkin-extra-toggle');
  if (label) label.classList.toggle('is-extra', isExtra);
  const row = checkbox.closest('tr');
  if (row) {
    row.classList.toggle('is-extra-task', isExtra);
    const pill = row.querySelector('[data-extra-pill]');
    if (pill) pill.style.display = isExtra ? '' : 'none';
    const notesInput = row.querySelector('[data-activity-field="notes"]');
    if (notesInput) {
      notesInput.placeholder = isExtra ? 'Observação / motivo da atividade extra (opcional)' : 'Observação';
    }
  }
  await checkinAutoSaveReport(reportId);
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
      if (field === 'checkinTime' || field === 'checkoutTime') {
        // Horários só são aplicados ao clicar nos botões de Registrar/Salvar entrada ou saída
        return;
      } else if (field === 'isExtra') {
        activity.isExtra = Boolean(input.checked);
      } else if (field === 'plannedMeters') {
        const nextPlanned = checkinParseNumber(input.value);
        activity.plannedMeters = nextPlanned;
        const carried = checkinParseNumber(activity.carryoverAddedMeters);
        if (carried > 0 && !checkinIsCarryoverActivity(activity)) {
          activity.basePlannedMeters = Math.max(0, Math.round((nextPlanned - carried) * 100) / 100);
        }
      } else if (field === 'executedMeters') {
        activity.executedMeters = checkinParseNumber(input.value);
      } else if (field === 'actualCrew' || field === 'ptaCount' || field === 'forkliftCount') {
        activity[field] = input.value === '' ? null : checkinParseNumber(input.value);
      } else {
        activity[field] = typeof input.value === 'string' ? input.value.trim() : input.value;
      }
    });
    if (activity.contractor && !next.contractor) {
      next.contractor = activity.contractor;
    }
  });
  next.actualCrew = checkinActualCrewTotal(next);
  next.actualPtaCount = checkinActualPtaTotal(next);
  next.forkliftCount = checkinActualForkliftTotal(next);
  const taskCompanies = checkinUniqueContractors([
    ...(next.activities || []).map(a => a.contractor),
    next.contractor
  ]);
  next.contractor = taskCompanies.join(', ');
  const checkedIn = next.activities.filter(item => item.checkinAt);
  const checkedOut = next.activities.filter(item => item.checkoutAt);
  next.checkinAt = checkedIn.map(item => item.checkinAt).sort()[0] || '';
  next.checkoutAt = next.activities.length && checkedOut.length === next.activities.length
    ? checkedOut.map(item => item.checkoutAt).sort().at(-1) : '';
  next.status = next.checkoutAt ? 'fechado' : next.checkinAt ? 'iniciado' : 'planejado';
  return next;
}

async function checkinAutoSaveReport(reportId) {
  const report = checkinCaptureReport(reportId);
  if (!report) return;
  const carryResult = checkinSyncCarryoverForReport(report);
  await checkinPersistWithCarryover(report, carryResult, { silent: true });
}

function checkinRefreshDailyDom() {
  const resultsEl = document.getElementById('checkinDailyResults');
  if (resultsEl && checkinActiveTab === 'diario') {
    const { visibleReports, companies, totalPlanned, totalExecuted, totalRemaining, openReports, recurrenceIndex, weekSummary } = checkinComputeDailyView();
    resultsEl.innerHTML = checkinRenderDailyResults(visibleReports, companies, totalPlanned, totalExecuted, openReports, totalRemaining, recurrenceIndex, weekSummary);
    resultsEl.querySelectorAll('.checkin-note-input, .checkin-inline-textarea').forEach(checkinResizeNote);
    if (typeof hydrateIcons === 'function') hydrateIcons();
    return true;
  }
  return false;
}

async function checkinOnExecutedChange(input, reportId, activityId) {
  const report = checkinCaptureReport(reportId);
  if (!report) return;
  const activity = report.activities.find(item => item.id === activityId);
  if (!activity) return;

  // Ao alterar a metragem executada, reabilita o cálculo dinâmico de saldo
  activity.carryoverDismissed = false;
  const planned = checkinParseNumber(activity.plannedMeters);
  const executed = checkinParseNumber(activity.executedMeters);
  const now = new Date().toISOString();

  if (planned > 0 && executed > 0 && executed < planned) {
    if (!activity.status || ['Não iniciado', 'Iniciado', 'Concluído'].includes(activity.status)) {
      activity.status = 'Parcial';
    }
  } else if (planned > 0 && executed >= planned) {
    if (!activity.status || ['Não iniciado', 'Iniciado', 'Parcial'].includes(activity.status)) {
      activity.status = 'Concluído';
      if (activity.checkinAt && !activity.checkoutAt) {
        activity.checkoutAt = now;
      }
    }
  }

  const checkedIn = report.activities.filter(item => item.checkinAt);
  const checkedOut = report.activities.filter(item => item.checkoutAt);
  report.checkinAt = checkedIn.map(item => item.checkinAt).sort()[0] || '';
  report.checkoutAt = report.activities.length && checkedOut.length === report.activities.length
    ? checkedOut.map(item => item.checkoutAt).sort().at(-1) : '';
  report.status = report.checkoutAt ? 'fechado' : report.checkinAt ? 'iniciado' : 'planejado';

  const carryResult = checkinSyncCarryoverForReport(report);
  await checkinPersistWithCarryover(report, carryResult, { silent: true });

  // Verifica se o acumulado semanal desta atividade ultrapassou o total programado
  const recIdx = checkinBuildWeeklyRecurrenceIndex(report.workDate);
  const recKey = checkinActivityRecurrenceKey(report.dh, activity);
  const recInfo = recKey ? recIdx.get(recKey) : null;
  if (recInfo && recInfo.plannedTotal > 0 && recInfo.executedTotal > recInfo.plannedTotal) {
    const excess = Math.round((recInfo.executedTotal - recInfo.plannedTotal) * 100) / 100;
    toast(`⚠️ Atenção: o acumulado semanal desta tarefa (${checkinNumber(recInfo.executedTotal)} ${recInfo.unit}) ultrapassou o programado (${checkinNumber(recInfo.plannedTotal)} ${recInfo.unit}) em +${checkinNumber(excess)} ${recInfo.unit}. Confira se não foi lançado acumulado.`, true);
  } else if (carryResult) {
    const remaining = checkinActivityRemainingMeters(activity);
    if (remaining > 0 && (carryResult.addedCount > 0 || carryResult.updatedCount > 0)) {
      toast(`Saldo restante (${checkinNumber(remaining)} ${activity.unit || 'm'}) atualizado para ${checkinFormatDate(carryResult.nextDate)}.`);
    } else if (carryResult.deletedReportId || carryResult.removedCount > 0) {
      toast(`Saldo pendente de ${checkinFormatDate(carryResult.nextDate)} removido automaticamente.`);
    }
  }
  if (!checkinRefreshDailyDom()) renderCheckIn();
}

async function checkinCreateSubItems(reportId, activityId, presetCount = 0, presetPrefix = '') {
  const report = checkinCaptureReport(reportId) || checkinGetReport(reportId);
  if (!report) return;
  const activity = (report.activities || []).find(item => item.id === activityId);
  if (!activity) return;

  let count = Number(presetCount) || 0;
  let prefix = String(presetPrefix || '').trim();
  if (count < 1) {
    const rawCount = prompt('Quantas máquinas / pontos / itens existem nesta tarefa? (ex.: 3)', '3');
    if (rawCount === null) return;
    count = Math.min(20, Math.max(1, parseInt(rawCount, 10) || 0));
    if (!count) return;
    const rawPrefix = prompt('Nome do item / máquina? (ex.: CRAH, Máquina, Peça)', 'CRAH');
    if (rawPrefix === null) return;
    prefix = String(rawPrefix || 'Item').trim() || 'Item';
  }

  activity.subItems = Array.from({ length: count }, (_, i) => ({
    label: `${prefix} ${i + 1}`,
    done: false
  }));
  await checkinPersistReports(report, { silent: true });
  toast(`Checklist com ${count}x ${prefix} criado na tarefa.`);
  if (!checkinRefreshDailyDom()) renderCheckIn();
}

async function checkinEditSubItems(reportId, activityId) {
  const report = checkinCaptureReport(reportId) || checkinGetReport(reportId);
  if (!report) return;
  const activity = (report.activities || []).find(item => item.id === activityId);
  if (!activity) return;

  const currentLabels = (Array.isArray(activity.subItems) ? activity.subItems : []).map(i => i.label).join(', ');
  const edited = prompt('Edite os itens separados por vírgula (deixe vazio para remover o checklist):', currentLabels);
  if (edited === null) return;
  const parts = edited.split(',').map(s => s.trim()).filter(Boolean);
  if (!parts.length) {
    delete activity.subItems;
  } else {
    const prevDone = new Map((activity.subItems || []).map(i => [checkinNormalizeHeader(i.label), Boolean(i.done)]));
    activity.subItems = parts.map(label => ({
      label,
      done: prevDone.get(checkinNormalizeHeader(label)) || false
    }));
  }
  await checkinPersistReports(report, { silent: true });
  if (!checkinRefreshDailyDom()) renderCheckIn();
}

async function checkinToggleSubItem(reportId, activityId, index) {
  const report = checkinCaptureReport(reportId) || checkinGetReport(reportId);
  if (!report) return;
  const activity = (report.activities || []).find(item => item.id === activityId);
  if (!activity || !Array.isArray(activity.subItems) || !activity.subItems[index]) return;

  activity.subItems[index].done = !activity.subItems[index].done;
  const summary = checkinSubItemsSummary(activity.subItems);
  // Se a unidade for "un", sincroniza automaticamente executado/planejado com o checklist
  if (activity.unit === 'un') {
    if (!checkinParseNumber(activity.plannedMeters)) {
      activity.plannedMeters = summary.total;
    }
    activity.executedMeters = summary.done;
    if (summary.done === summary.total) {
      activity.status = 'Concluído';
    } else if (summary.done > 0) {
      activity.status = 'Parcial';
    }
  }
  const carryResult = checkinSyncCarryoverForReport(report);
  await checkinPersistWithCarryover(report, carryResult, { silent: true });
  if (!checkinRefreshDailyDom()) renderCheckIn();
}

function checkinJumpToDay(workDate, dh = '', area = '') {
  if (!workDate) return;
  checkinSelectedDate = workDate;
  if (dh) checkinDhFilter = dh;
  if (area && /^CAG\s+/i.test(area)) checkinAreaFilter = area;
  else checkinAreaFilter = '';
  checkinActiveTab = 'diario';
  renderCheckIn();
}

async function checkinOnTaskStatusChange(select, reportId, activityId) {
  const report = checkinCaptureReport(reportId);
  if (!report) return;
  const activity = report.activities.find(item => item.id === activityId);
  if (!activity) return;

  const newStatus = String(select.value || '').trim();
  activity.status = newStatus;

  const row = select.closest('tr');
  const checkinTimeInput = row?.querySelector('input[data-activity-field="checkinTime"]');
  const checkoutTimeInput = row?.querySelector('input[data-activity-field="checkoutTime"]');
  const typedCheckinTime = checkinTimeInput ? String(checkinTimeInput.value || '').trim() : '';
  const typedCheckoutTime = checkoutTimeInput ? String(checkoutTimeInput.value || '').trim() : '';
  const now = new Date().toISOString();

  if (newStatus === 'Concluído') {
    const planned = checkinParseNumber(activity.plannedMeters);
    const executed = checkinParseNumber(activity.executedMeters);
    if (planned > 0 && executed < planned) {
      activity.executedMeters = planned;
    }
    activity.carryoverDismissed = false;
    if (!activity.checkinAt) {
      activity.checkinAt = typedCheckinTime ? checkinIsoFromTimeInput(report.workDate, typedCheckinTime, now) : now;
    }
    if (!activity.checkoutAt) {
      activity.checkoutAt = typedCheckoutTime ? checkinIsoFromTimeInput(report.workDate, typedCheckoutTime, now) : now;
    }
  } else if (newStatus === 'Iniciado') {
    activity.checkoutAt = '';
    if (!activity.checkinAt) {
      activity.checkinAt = typedCheckinTime ? checkinIsoFromTimeInput(report.workDate, typedCheckinTime, now) : now;
    }
  } else if (newStatus === 'Não iniciado') {
    activity.checkinAt = '';
    activity.checkoutAt = '';
  } else if (newStatus === 'Parcial' || newStatus === 'Suspenso') {
    activity.carryoverDismissed = false;
  }

  const checkedIn = report.activities.filter(item => item.checkinAt);
  const checkedOut = report.activities.filter(item => item.checkoutAt);
  report.checkinAt = checkedIn.map(item => item.checkinAt).sort()[0] || '';
  report.checkoutAt = report.activities.length && checkedOut.length === report.activities.length
    ? checkedOut.map(item => item.checkoutAt).sort().at(-1) : '';
  report.status = report.checkoutAt ? 'fechado' : report.checkinAt ? 'iniciado' : 'planejado';

  const carryResult = checkinSyncCarryoverForReport(report);
  await checkinPersistWithCarryover(report, carryResult, { silent: true });

  if (newStatus === 'Concluído') {
    toast(carryResult?.deletedReportId || carryResult?.removedCount > 0
      ? `Atividade concluída e saldo de ${checkinFormatDate(carryResult.nextDate)} removido automaticamente.`
      : 'Atividade marcada como Concluída e finalizada.');
  } else if (carryResult && (carryResult.addedCount > 0 || carryResult.updatedCount > 0)) {
    const remaining = checkinActivityRemainingMeters(activity);
    if (remaining > 0) {
      toast(`Saldo restante (${checkinNumber(remaining)} ${activity.unit || 'm'}) puxado para ${checkinFormatDate(carryResult.nextDate)}.`);
    }
  }
  if (!checkinRefreshDailyDom()) renderCheckIn();
}

async function checkinDismissCarryover(reportId, activityId) {
  const report = checkinCaptureReport(reportId) || checkinGetReport(reportId);
  if (!report) return;
  const activity = (report.activities || []).find(item => item.id === activityId);
  if (!activity) return;

  const isStandaloneCarry = checkinIsCarryoverActivity(activity);
  const hasMergedCarry = !isStandaloneCarry && checkinParseNumber(activity.carryoverAddedMeters) > 0;
  if (!isStandaloneCarry && !hasMergedCarry) return;

  const confirmMsg = isStandaloneCarry
    ? `Remover o saldo "${activity.activity || activity.pstItem || 'atividade'}" deste dia (${checkinFormatDate(report.workDate)})?`
    : `Remover o saldo somado (+${checkinNumber(activity.carryoverAddedMeters)} ${activity.unit || 'm'}) e manter apenas a programação original deste dia (${checkinNumber(checkinActivityOriginalPlannedMeters(activity))} ${activity.unit || 'm'})?`;
  if (!confirm(confirmMsg)) return;

  // Marca na origem para o saldo não voltar automaticamente (a menos que editem o dia anterior novamente)
  let dismissedSourceReport = null;
  const sourceId = isStandaloneCarry ? activity.carryoverSourceId : activity.carryoverMergedFromId;
  if (sourceId && activity.carryoverFromDate) {
    const srcReportId = checkinReportId(activity.carryoverFromDate, report.dh, report.engineer);
    const srcReport = checkinGetReport(srcReportId);
    if (srcReport) {
      const clonedSrc = structuredClone(srcReport);
      const srcAct = (clonedSrc.activities || []).find(item => item.id === sourceId);
      if (srcAct) {
        srcAct.carryoverDismissed = true;
        dismissedSourceReport = clonedSrc;
      }
    }
  }

  if (isStandaloneCarry) {
    report.activities = report.activities.filter(item => item.id !== activityId);
    if (!report.activities.length) {
      await checkinDeleteReportById(report.id);
      if (dismissedSourceReport) {
        await checkinPersistReports(dismissedSourceReport, { silent: true });
      }
      toast('Saldo removido e diário vazio excluído.');
      if (!checkinRefreshDailyDom()) renderCheckIn();
      return;
    }
  } else {
    const basePlanned = checkinActivityOriginalPlannedMeters(activity);
    activity.plannedMeters = basePlanned;
    delete activity.basePlannedMeters;
    delete activity.carryoverAddedMeters;
    delete activity.carryoverMergedFromId;
    delete activity.carryoverFromDate;
    delete activity.carryoverOriginDate;
  }

  const checkedIn = report.activities.filter(item => item.checkinAt);
  const checkedOut = report.activities.filter(item => item.checkoutAt);
  report.checkinAt = checkedIn.map(item => item.checkinAt).sort()[0] || '';
  report.checkoutAt = report.activities.length && checkedOut.length === report.activities.length
    ? checkedOut.map(item => item.checkoutAt).sort().at(-1) : '';
  report.status = report.checkoutAt ? 'fechado' : report.checkinAt ? 'iniciado' : 'planejado';

  const toSave = dismissedSourceReport ? [report, dismissedSourceReport] : report;
  await checkinPersistReports(toSave, { silent: true });
  toast(isStandaloneCarry ? 'Saldo removido deste dia.' : 'Saldo somado removido; programação original mantida.');
  if (!checkinRefreshDailyDom()) renderCheckIn();
}

async function checkinOnTaskDisciplineChange(select, reportId) {
  const row = select.closest('tr');
  const crewLabel = row?.querySelector('[data-crew-label]');
  if (crewLabel) crewLabel.textContent = checkinActualCrewLabel(select.value);
  await checkinAutoSaveReport(reportId);
  if (checkinDisciplineFilter) {
    checkinSetDailyFilter('discipline', checkinDisciplineFilter);
  }
}

async function checkinOnTaskShiftChange(select, reportId) {
  const isNight = select.value === 'Noturno';
  select.classList.toggle('is-night', isNight);
  select.classList.toggle('is-day', !isNight);
  const row = select.closest('tr');
  if (row) {
    row.classList.toggle('is-night-shift', isNight);
    row.classList.toggle('is-day-shift', !isNight);
    const pendingPill = row.querySelector('.checkin-status-pill.pending');
    if (pendingPill) {
      pendingPill.textContent = isNight ? '🌙 Aguardando Noturno' : 'Não iniciada';
    }
  }
  await checkinAutoSaveReport(reportId);
  if (checkinShiftFilter) {
    checkinSetDailyFilter('shift', checkinShiftFilter);
  }
}

async function checkinUpdateTaskTime(reportId, activityId, which, timeValue) {
  const report = checkinCaptureReport(reportId);
  if (!report) return;
  const activity = report.activities.find(item => item.id === activityId);
  if (!activity) return;
  if (which === 'checkin') {
    activity.checkinAt = timeValue ? checkinIsoFromTimeInput(report.workDate, timeValue, activity.checkinAt) : '';
    if (activity.checkinAt && (!activity.status || activity.status === 'Não iniciado' || activity.status === CHECKIN_EXTRA_LEGACY_STATUS)) {
      activity.status = 'Iniciado';
    }
  } else if (which === 'checkout') {
    if (timeValue && !activity.checkinAt) {
      activity.checkinAt = checkinIsoFromTimeInput(report.workDate, timeValue, '');
    }
    activity.checkoutAt = timeValue ? checkinIsoFromTimeInput(report.workDate, timeValue, activity.checkoutAt) : '';
  }
  const checkedIn = report.activities.filter(item => item.checkinAt);
  const checkedOut = report.activities.filter(item => item.checkoutAt);
  report.checkinAt = checkedIn.map(item => item.checkinAt).sort()[0] || '';
  report.checkoutAt = report.activities.length && checkedOut.length === report.activities.length
    ? checkedOut.map(item => item.checkoutAt).sort().at(-1) : '';
  report.status = report.checkoutAt ? 'fechado' : report.checkinAt ? 'iniciado' : 'planejado';
  await checkinPersistReports(report, { silent: true });
  toast('Horário da atividade atualizado.');
  renderCheckIn();
}

async function checkinReopenTask(reportId, activityId) {
  const report = checkinCaptureReport(reportId);
  if (!report) return;
  const activity = report.activities.find(item => item.id === activityId);
  if (!activity) return;
  activity.checkoutAt = '';
  if (activity.status === 'Concluído') activity.status = 'Iniciado';
  report.checkoutAt = '';
  report.status = report.activities.some(item => item.checkinAt) ? 'iniciado' : 'planejado';
  await checkinPersistReports(report, { silent: true });
  toast('Tarefa reaberta para edição.');
  renderCheckIn();
}

async function checkinSaveDraft(reportId) {
  const report = checkinCaptureReport(reportId);
  if (!report) return;
  const carryResult = checkinSyncCarryoverForReport(report);
  await checkinPersistWithCarryover(report, carryResult, { silent: false });
  if (carryResult && (carryResult.addedCount > 0 || carryResult.updatedCount > 0)) {
    toast(`Saldo não cumprido puxado automaticamente para ${checkinFormatDate(carryResult.nextDate)}.`);
  } else if (carryResult && (carryResult.deletedReportId || carryResult.removedCount > 0)) {
    toast(`Saldo de ${checkinFormatDate(carryResult.nextDate)} removido automaticamente.`);
  }
  renderCheckIn();
}

async function checkinRegister(reportId, action, activityId) {
  const report = checkinCaptureReport(reportId);
  if (!report) return;
  const activity = report.activities.find(item => item.id === activityId);
  if (!activity) return toast('Selecione uma tarefa para registrar o horario.', true);

  const row = document.querySelector(`[data-report-card="${CSS.escape(reportId)}"] [data-activity-id="${CSS.escape(activityId)}"]`);
  const checkinTimeInput = row?.querySelector('input[data-activity-field="checkinTime"]');
  const checkoutTimeInput = row?.querySelector('input[data-activity-field="checkoutTime"]');
  const typedCheckinTime = checkinTimeInput ? String(checkinTimeInput.value || '').trim() : '';
  const typedCheckoutTime = checkoutTimeInput ? String(checkoutTimeInput.value || '').trim() : '';

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

  if (action === 'checkout' && !activity.checkinAt && !typedCheckinTime) {
    return toast('Registre a entrada desta tarefa antes da saida.', true);
  }
  if (action === 'checkout' && activity.problemCode === 'OUTRO' && !String(activity.problemOther || '').trim()) {
    return toast('Descreva o outro motivo do imprevisto ou limpe o campo de código do problema.', true);
  }

  const now = new Date().toISOString();
  if (action === 'checkin') {
    activity.checkinAt = typedCheckinTime
      ? checkinIsoFromTimeInput(report.workDate, typedCheckinTime, now)
      : now;
    if (!activity.status || activity.status === 'Não iniciado' || activity.status === CHECKIN_EXTRA_LEGACY_STATUS) {
      activity.status = 'Iniciado';
    }
  } else {
    if (!activity.checkinAt && typedCheckinTime) {
      activity.checkinAt = checkinIsoFromTimeInput(report.workDate, typedCheckinTime, now);
    }
    activity.checkoutAt = typedCheckoutTime
      ? checkinIsoFromTimeInput(report.workDate, typedCheckoutTime, now)
      : now;
    if (!activity.status || activity.status === 'Iniciado' || activity.status === 'Não iniciado' || activity.status === CHECKIN_EXTRA_LEGACY_STATUS) {
      const planned = checkinParseNumber(activity.plannedMeters);
      const executed = checkinParseNumber(activity.executedMeters);
      if (planned > 0 && executed > 0 && executed < planned) {
        activity.status = 'Parcial';
      } else if (executed > 0 || planned === 0) {
        activity.status = 'Concluído';
      }
    }
  }

  const checkedIn = report.activities.filter(item => item.checkinAt);
  const checkedOut = report.activities.filter(item => item.checkoutAt);
  report.checkinAt = checkedIn.map(item => item.checkinAt).sort()[0] || '';
  report.checkoutAt = report.activities.length && checkedOut.length === report.activities.length
    ? checkedOut.map(item => item.checkoutAt).sort().at(-1) : '';
  report.status = report.checkoutAt ? 'fechado' : report.checkinAt ? 'iniciado' : 'planejado';
  const carryResult = action === 'checkout' ? checkinSyncCarryoverForReport(report) : null;
  await checkinPersistWithCarryover(report, carryResult, { silent: false });
  if (carryResult && (carryResult.addedCount > 0 || carryResult.updatedCount > 0)) {
    const remaining = checkinActivityRemainingMeters(activity);
    toast(remaining > 0
      ? `Saldo não cumprido (${checkinNumber(remaining)} ${activity.unit || 'm'}) puxado automaticamente para ${checkinFormatDate(carryResult.nextDate)}.`
      : `Saldo pendente atualizado para ${checkinFormatDate(carryResult.nextDate)}.`);
  } else if (carryResult && (carryResult.deletedReportId || carryResult.removedCount > 0)) {
    toast(`Saldo de ${checkinFormatDate(carryResult.nextDate)} removido automaticamente.`);
  }
  renderCheckIn();
}

function checkinProblemLabel(code, other = '') {
  if (code === 'OUTRO') return `Outro${other ? `: ${other}` : ''}`;
  const item = CHECKIN_PROBLEMS.find(([value]) => value === code);
  return item ? `${item[0]} - ${item[1]}` : '';
}

function checkinExtraReasonFields() {
  return `<label class="wide"><span>Motivo / imprevisto (opcional)</span><select name="extraReasonCode" onchange="checkinToggleExtraReasonOther(this)"><option value="">Sem imprevisto / opcional</option>${CHECKIN_PROBLEMS.map(([code, label]) => `<option value="${code}">${code === 'OUTRO' ? 'Outro' : `${code} - ${label}`}</option>`).join('')}</select></label>
    <label class="wide" data-extra-reason-other style="display:none"><span>Descreva o motivo</span><input name="extraReasonOther" maxlength="500" placeholder="Descreva o motivo"></label>
    <label class="wide"><span>Observação da atividade extra (opcional)</span><input name="extraNotes" maxlength="500" placeholder="Observações ou detalhes adicionais"></label>`;
}

function checkinToggleExtraReasonOther(select) {
  const field = select.closest('form')?.querySelector('[data-extra-reason-other]');
  const input = field?.querySelector('input[name="extraReasonOther"]');
  const show = select.value === 'OUTRO';
  if (field) field.style.display = show ? '' : 'none';
  if (input) input.required = false;
}

function checkinExtraReasonFromForm(data) {
  const parts = [];
  if (data.extraReasonCode === 'OUTRO') {
    const other = String(data.extraReasonOther || '').trim();
    parts.push(other ? checkinProblemLabel('OUTRO', other) : 'Outro motivo');
  } else if (data.extraReasonCode) {
    const label = checkinProblemLabel(String(data.extraReasonCode || '').trim());
    if (label) parts.push(label);
  }
  const extraNotes = String(data.extraNotes || '').trim();
  if (extraNotes) parts.push(extraNotes);
  return parts.join(' · ');
}

function checkinFormatWhatsAppActivity(report, activity, index, { isCheckout, isCheckedInSection, isScheduledSection = false }) {
  const plannedNum = checkinParseNumber(activity.plannedMeters);
  const executedNum = checkinParseNumber(activity.executedMeters);
  const planned = checkinNumber(plannedNum);
  const executed = checkinNumber(executedNum);
  const pct = plannedNum > 0 ? `${checkinNumber((executedNum / plannedNum) * 100, 0)}%` : '';
  const unit = activity.unit || 'm';
  const actDiscipline = checkinGetActivityDiscipline(report, activity) || report.discipline || '';
  const actShift = checkinGetActivityShift(report, activity);
  const shiftBadge = actShift === 'Noturno' ? '🌙 *Noturno*' : '☀️ *Diurno*';
  const actContractor = checkinUniqueContractors([activity.contractor]).join(', ');
  const statusLabel = checkinResolveMigratedStatus(activity, activity.checkinAt, activity.checkoutAt);
  const codeTag = [activity.pstItem, activity.scheduleId].filter(Boolean).join(' · ');
  const title = codeTag ? `[${codeTag}] ${activity.activity || 'Atividade'}` : (activity.activity || 'Atividade');

  const block = [];
  block.push(`*${index + 1}. ${title}*`);
  block.push(`📍 *Local:* ${activity.location || 'Local não informado'}${actDiscipline ? ` _(${actDiscipline})_` : ''} · ${shiftBadge}`);

  if (isCheckedInSection || Number(activity.actualCrew) > 0 || actContractor) {
    const crewParts = [];
    if (actContractor) crewParts.push(`*Empresa:* ${actContractor}`);
    if (isCheckedInSection || Number(activity.actualCrew) > 0) {
      crewParts.push(`*Efetivo:* ${Number(activity.actualCrew || 0)} pessoa(s)`);
    }
    if (crewParts.length) block.push(`👷 ${crewParts.join(' · ')}`);
  }

  if (Number(activity.ptaCount) || Number(activity.forkliftCount)) {
    block.push(`🚜 *Equipamentos:* ${Number(activity.ptaCount || 0)} PTA · ${Number(activity.forkliftCount || 0)} empilhadeira(s)`);
  }

  if (isScheduledSection) {
    block.push(`📏 *Previsto:* ${planned} ${unit} · *Status:* Programada para o Turno Noturno`);
  } else if (isCheckout) {
    block.push(`📏 *Volume:* Previsto ${planned} ${unit} → Executado ${executed} ${unit}${pct ? ` (${pct})` : ''}`);
    block.push(`📌 *Status:* ${statusLabel}${!isCheckedInSection ? ' _(Sem check-in)_' : ''}`);
  } else {
    block.push(`📏 *Previsto:* ${planned} ${unit}${!isCheckedInSection ? ` · *Status:* ${statusLabel} _(Sem check-in)_` : ''}`);
  }

  if (isCheckedInSection) {
    block.push(`🕒 *Horário:* Entrada ${checkinFormatTime(activity.checkinAt)}${isCheckout ? ` · Saída ${checkinFormatTime(activity.checkoutAt)}` : ''}`);
  }

  if (checkinIsExtraActivity(activity)) {
    block.push('➕ *Informação:* Atividade extra (não programada)');
  }

  if (checkinIsCarryoverActivity(activity) && activity.carryoverFromDate) {
    block.push(`↩️ *Saldo pendente:* Puxado de ${checkinFormatDate(activity.carryoverFromDate)}`);
  } else if (checkinParseNumber(activity.carryoverAddedMeters) > 0 && activity.carryoverFromDate) {
    block.push(`↩️ *Saldo somado:* +${checkinNumber(activity.carryoverAddedMeters)} ${unit} de ${checkinFormatDate(activity.carryoverFromDate)} (prog. dia: ${checkinNumber(checkinActivityOriginalPlannedMeters(activity))} ${unit})`);
  }

  if (activity.problemCode || activity.problemOther) {
    block.push(`⚠️ *Motivo / Desvio:* ${checkinProblemLabel(activity.problemCode, activity.problemOther) || activity.problemOther}`);
  }

  if (activity.notes) {
    block.push(`💬 *Explanação / Obs.:* ${activity.notes}`);
  }

  return block.join('\n');
}

function checkinBuildWhatsApp(report, action) {
  const isCheckout = action === 'checkout';
  const rawActivities = Array.isArray(report.activities) ? report.activities : [];
  const allActivities = rawActivities.filter(activity =>
    (!checkinDisciplineFilter || checkinGetActivityDiscipline(report, activity) === checkinDisciplineFilter)
    && (!checkinShiftFilter || checkinGetActivityShift(report, activity) === checkinShiftFilter)
  );
  const checkedInActivities = allActivities.filter(activity => Boolean(activity.checkinAt || activity.checkoutAt));
  const isPendingNightShift = activity =>
    !checkinShiftFilter
    && checkinGetActivityShift(report, activity) === 'Noturno'
    && !activity.checkinAt
    && !activity.checkoutAt
    && !activity.problemCode
    && !activity.problemOther
    && !Number(activity.executedMeters);

  const nightScheduledActivities = allActivities.filter(isPendingNightShift);
  const notCheckedInActivities = allActivities.filter(
    activity => !activity.checkinAt && !activity.checkoutAt && !isPendingNightShift(activity)
  );

  const activeContractors = checkinUniqueContractors(
    (checkedInActivities.length ? checkedInActivities : allActivities).map(activity => activity.contractor)
  );
  const headerContractors = (activeContractors.length ? activeContractors : checkinUniqueContractors([
    ...allActivities.map(activity => activity.contractor),
    report.contractor
  ])).join(', ') || '—';

  const checkoutTimes = allActivities.map(a => a.checkoutAt).filter(Boolean).sort();
  const checkinTimes = allActivities.map(a => a.checkinAt).filter(Boolean).sort();
  const headerExitTime = report.checkoutAt || checkoutTimes.at(-1) || new Date().toISOString();
  const headerEntryTime = report.checkinAt || checkinTimes[0] || new Date().toISOString();
  const totalCrew = allActivities.reduce((sum, activity) => sum + (Number(activity.actualCrew) || 0), 0);
  const totalPta = allActivities.reduce((sum, activity) => sum + (Number(activity.ptaCount) || 0), 0);
  const totalForklift = allActivities.reduce((sum, activity) => sum + (Number(activity.forkliftCount) || 0), 0);
  const withoutCheckinCount = Math.max(0, allActivities.length - checkedInActivities.length - nightScheduledActivities.length);
  const shiftHeaderLabel = checkinShiftFilter
    ? ` · *Turno:* ${checkinShiftFilter === 'Noturno' ? '🌙 Noturno' : '☀️ Diurno'}`
    : '';

  const lines = [
    `📋 *${isCheckout ? 'CHECK-OUT' : 'CHECK-IN'} DIÁRIO — ${report.dh}*`,
    '━━━━━━━━━━━━━━━━━━━━',
    `📅 *Data:* ${checkinFormatDate(report.workDate)}${shiftHeaderLabel}${isCheckout ? ` · *Saída:* ${checkinFormatTime(headerExitTime)}` : ` · *Entrada:* ${checkinFormatTime(headerEntryTime)}`}`,
    `👷 *Engenheiro:* ${report.engineer}`,
    `🏢 *Empreiteira:* ${headerContractors}`,
    `🛡️ *Eng. responsável HC:* ${report.hcEngineer || report.engineer}`,
    `🚜 *Equipamentos:* ${totalPta} PTA · ${totalForklift} empilhadeira(s)`,
    `👥 *Efetivo real em campo:* ${totalCrew} pessoa(s)`,
    `📊 *Resumo:* ${checkedInActivities.length} com check-in · ${withoutCheckinCount} sem check-in${nightScheduledActivities.length ? ` · ${nightScheduledActivities.length} turno noturno` : ''} (Total: ${allActivities.length})`
  ];

  if (checkedInActivities.length) {
    lines.push(
      '',
      '━━━━━━━━━━━━━━━━━━━━',
      `✅ *ATIVIDADES COM CHECK-IN${isCheckout ? ' / EXECUTADAS' : ' (INICIADAS)'} (${checkedInActivities.length})*`,
      '━━━━━━━━━━━━━━━━━━━━',
      '',
      checkedInActivities
        .map((activity, index) => checkinFormatWhatsAppActivity(report, activity, index, { isCheckout, isCheckedInSection: true }))
        .join('\n\n────────────────────\n\n')
    );
  }

  if (notCheckedInActivities.length) {
    lines.push(
      '',
      '━━━━━━━━━━━━━━━━━━━━',
      `⚠️ *ATIVIDADES SEM CHECK-IN / JUSTIFICATIVAS (${notCheckedInActivities.length})*`,
      '━━━━━━━━━━━━━━━━━━━━',
      '',
      notCheckedInActivities
        .map((activity, index) => checkinFormatWhatsAppActivity(report, activity, index, { isCheckout, isCheckedInSection: false }))
        .join('\n\n────────────────────\n\n')
    );
  }

  if (nightScheduledActivities.length) {
    lines.push(
      '',
      '━━━━━━━━━━━━━━━━━━━━',
      `🌙 *PROGRAMADAS PARA O TURNO NOTURNO (${nightScheduledActivities.length})*`,
      '━━━━━━━━━━━━━━━━━━━━',
      '',
      nightScheduledActivities
        .map((activity, index) => checkinFormatWhatsAppActivity(report, activity, index, { isCheckout, isCheckedInSection: false, isScheduledSection: true }))
        .join('\n\n────────────────────\n\n')
    );
  }

  return lines.join('\n');
}

function checkinCopyWhatsApp(reportId, action) {
  const report = checkinCaptureReport(reportId) || checkinGetReport(reportId);
  if (!report) return;
  checkinPersistReports(report, { silent: true });
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
  checkinSyncFiltersFromDom();
  const isCheckout = action === 'checkout';
  document.querySelectorAll('[data-report-card]').forEach(card => {
    const repId = card.dataset.reportCard;
    const captured = checkinCaptureReport(repId);
    if (captured) {
      const idx = checkinReports.findIndex(r => r.id === repId);
      if (idx >= 0) checkinReports[idx] = captured;
    }
  });
  const dayReports = checkinReports.filter(report => report.workDate === checkinSelectedDate
    && (!checkinEngineerFilter || report.engineer === checkinEngineerFilter)
    && (!checkinDhFilter || report.dh === checkinDhFilter)
    && (report.activities || []).some(activity =>
      (!checkinDisciplineFilter || checkinGetActivityDiscipline(report, activity) === checkinDisciplineFilter)
      && (!checkinShiftFilter || checkinGetActivityShift(report, activity) === checkinShiftFilter)
      && (isCheckout
        ? (activity.checkoutAt || activity.checkinAt || activity.problemCode || activity.problemOther || activity.notes || Number(activity.executedMeters) > 0 || (activity.status && activity.status !== 'Não iniciado'))
        : activity.checkinAt)));
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
  checkinSyncFiltersFromDom();
  checkinActiveTab = ['diario', 'resumo', 'planejamento', 'curva'].includes(tab) ? tab : 'diario';
  renderCheckIn();
}

function checkinOpenSummaryFromDaily() {
  const bounds = checkinWeekBounds(checkinSelectedDate);
  checkinSummaryStart = bounds.start;
  checkinSummaryEnd = bounds.end;
  checkinSummaryDh = checkinDhFilter || '';
  checkinSummaryArea = checkinAreaFilter || '';
  checkinSummaryDiscipline = checkinDisciplineFilter || '';
  checkinSummaryEngineer = checkinEngineerFilter || '';
  checkinSummaryCompany = checkinCompanyFilter || '';
  checkinActiveTab = 'resumo';
  renderCheckIn();
}

async function checkinSetDay(value) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(String(value).trim())) return;
  checkinSelectedDate = String(value).trim();
  await checkinSyncCarryoverFromPreviousDay(checkinSelectedDate, { persist: true });
  if (checkinRefreshDailyDom()) return;
  renderCheckIn();
}

function checkinSetDailyFilter(key, value) {
  checkinSyncFiltersFromDom();
  if (key === 'discipline') checkinDisciplineFilter = value;
  if (key === 'shift') checkinShiftFilter = value;
  if (key === 'engineer') checkinEngineerFilter = value;
  if (key === 'dh') checkinDhFilter = value;
  if (key === 'area') checkinAreaFilter = value;
  if (key === 'company') checkinCompanyFilter = value;
  if (checkinRefreshDailyDom()) return;
  renderCheckIn();
}

function checkinRenderSummaryResults() {
  const searchNorm = checkinNormalizeSearchText(checkinSummarySearch);
  const reports = checkinReports.filter(report =>
    (!checkinSummaryStart || report.workDate >= checkinSummaryStart)
    && (!checkinSummaryEnd || report.workDate <= checkinSummaryEnd)
    && (!checkinSummaryDh || report.dh === checkinSummaryDh)
    && (!checkinSummaryEngineer || report.engineer === checkinSummaryEngineer)
  );

  const areaMap = new Map();
  const activityMap = new Map();
  let totalPlanned = 0;
  let totalExecuted = 0;
  let totalEntries = 0;

  reports.forEach(report => {
    (report.activities || []).forEach(activity => {
      const discipline = checkinGetActivityDiscipline(report, activity) || 'Sem disciplina';
      const company = activity.contractor || report.contractor || '';
      const areaLabel = checkinExtractAreaLabel(report, activity);

      if (checkinSummaryDiscipline && discipline !== checkinSummaryDiscipline) return;
      if (checkinSummaryCompany && company !== checkinSummaryCompany) return;
      if (checkinSummaryArea && areaLabel !== checkinSummaryArea) return;
      if (searchNorm) {
        const haystack = checkinNormalizeSearchText([
          areaLabel, report.dh, report.engineer, company, discipline,
          activity.pstItem, activity.scheduleId, activity.location, activity.activity
        ].filter(Boolean).join(' '));
        if (!haystack.includes(searchNorm)) return;
      }

      const origPlanned = checkinActivityOriginalPlannedMeters(activity);
      const executed = checkinParseNumber(activity.executedMeters);
      const unit = activity.unit || 'm';
      const recKey = checkinActivityRecurrenceKey(report.dh, activity) || `${report.dh}|${activity.id}`;

      totalPlanned += origPlanned;
      totalExecuted += executed;
      totalEntries += 1;

      // Agrupamento por Área / Frente (ex.: CAG 4, CAG 3, DH 04...)
      const areaEntry = areaMap.get(areaLabel) || {
        area: areaLabel,
        dh: report.dh,
        uniqueKeys: new Set(),
        entries: 0,
        planned: 0,
        executed: 0
      };
      areaEntry.uniqueKeys.add(recKey);
      areaEntry.entries += 1;
      areaEntry.planned = Math.round((areaEntry.planned + origPlanned) * 100) / 100;
      areaEntry.executed = Math.round((areaEntry.executed + executed) * 100) / 100;
      areaMap.set(areaLabel, areaEntry);

      // Agrupamento por Atividade recorrente
      const actEntry = activityMap.get(recKey) || {
        key: recKey,
        dh: report.dh,
        area: areaLabel,
        discipline,
        pstItem: activity.pstItem || '',
        scheduleId: activity.scheduleId || '',
        location: activity.location || '',
        activity: activity.activity || '',
        unit,
        engineers: new Set(),
        days: new Map(),
        planned: 0,
        executed: 0
      };
      if (report.engineer) actEntry.engineers.add(report.engineer);
      if (!actEntry.pstItem && activity.pstItem) actEntry.pstItem = activity.pstItem;
      if (!actEntry.scheduleId && activity.scheduleId) actEntry.scheduleId = activity.scheduleId;
      if (!actEntry.location && activity.location) actEntry.location = activity.location;
      if (!actEntry.activity && activity.activity) actEntry.activity = activity.activity;
      if (Array.isArray(activity.subItems) && activity.subItems.length) actEntry.subItems = activity.subItems;
      actEntry.planned = Math.round((actEntry.planned + origPlanned) * 100) / 100;
      actEntry.executed = Math.round((actEntry.executed + executed) * 100) / 100;

      const dayRow = actEntry.days.get(report.workDate) || { date: report.workDate, planned: 0, executed: 0, carryOnly: true };
      dayRow.planned = Math.round((dayRow.planned + origPlanned) * 100) / 100;
      dayRow.executed = Math.round((dayRow.executed + executed) * 100) / 100;
      if (!checkinIsCarryoverActivity(activity)) dayRow.carryOnly = false;
      actEntry.days.set(report.workDate, dayRow);

      activityMap.set(recKey, actEntry);
    });
  });

  totalPlanned = Math.round(totalPlanned * 100) / 100;
  totalExecuted = Math.round(totalExecuted * 100) / 100;
  const totalRemaining = Math.max(0, Math.round((totalPlanned - totalExecuted) * 100) / 100);
  const totalPct = totalPlanned > 0 ? Math.round((totalExecuted / totalPlanned) * 100) : (totalExecuted > 0 ? 100 : 0);

  const areaRows = [...areaMap.values()].sort((a, b) => {
    const aCag = /^CAG\s+/i.test(a.area) ? 0 : 1;
    const bCag = /^CAG\s+/i.test(b.area) ? 0 : 1;
    if (aCag !== bCag) return aCag - bCag;
    return a.area.localeCompare(b.area, 'pt-BR', { numeric: true });
  });

  const allActivityRows = [...activityMap.values()]
    .map(item => {
      const sortedDays = [...item.days.values()].sort((a, b) => a.date.localeCompare(b.date));
      const remaining = Math.max(0, Math.round((item.planned - item.executed) * 100) / 100);
      const excess = item.executed > item.planned ? Math.round((item.executed - item.planned) * 100) / 100 : 0;
      const pct = item.planned > 0 ? Math.round((item.executed / item.planned) * 100) : (item.executed > 0 ? 100 : 0);
      return { ...item, sortedDays, daysCount: sortedDays.length, remaining, excess, pct };
    })
    .sort((a, b) => b.daysCount - a.daysCount || a.area.localeCompare(b.area, 'pt-BR', { numeric: true }) || b.planned - a.planned);

  const visibleActivityRows = checkinSummaryRepeatedOnly
    ? allActivityRows.filter(item => item.daysCount > 1)
    : allActivityRows;
  const repeatedCount = allActivityRows.filter(item => item.daysCount > 1).length;

  const periodText = checkinSummaryStart && checkinSummaryEnd
    ? `${checkinFormatDate(checkinSummaryStart)} a ${checkinFormatDate(checkinSummaryEnd)}`
    : 'Todo o período';

  return `
    <section class="checkin-metrics">
      <article><small>TOTAL PROGRAMADO</small><strong>${checkinNumber(totalPlanned)} m</strong></article>
      <article><small>TOTAL INSTALADO</small><strong style="color:${totalPct >= 100 ? '#15803d' : '#0f172a'}">${checkinNumber(totalExecuted)} m (${totalPct}%)</strong></article>
      <article><small>FALTA INSTALAR (SALDO)</small><strong style="color:${totalRemaining > 0 ? '#b45309' : '#15803d'}">${checkinNumber(totalRemaining)} m</strong></article>
      <article><small>ATIVIDADES ÚNICAS</small><strong>${allActivityRows.length}</strong><small style="display:block;margin-top:2px;font-size:10px;color:#475569;font-weight:700;">${repeatedCount} repetida(s) · ${totalEntries} apontamento(s)</small></article>
    </section>

    <article class="checkin-report-card">
      <header class="checkin-report-head">
        <div>
          <p class="eyebrow">VISÃO POR FRENTE / ÁREA (CAG E DATA HALL)</p>
          <h2>Resumo por Área (${areaRows.length})</h2>
          <p>Clique em uma área (ex.: CAG 4) para filtrar o detalhamento abaixo · Período: ${esc(periodText)}</p>
        </div>
        ${checkinSummaryArea ? `<button class="button button-outline compact" onclick="checkinSetSummaryFilter('area', '')">Limpar filtro de área (${esc(checkinSummaryArea)})</button>` : ''}
      </header>
      ${areaRows.length ? `<div class="checkin-activity-table-wrap"><table class="checkin-activity-table checkin-plan-table">
        <thead><tr>
          <th>Área / Frente</th>
          <th>Atividades únicas</th>
          <th>Total Programado</th>
          <th>Já Instalado</th>
          <th>Falta (Saldo)</th>
          <th>% Avanço</th>
        </tr></thead>
        <tbody>
          ${areaRows.map(row => {
    const remaining = Math.max(0, Math.round((row.planned - row.executed) * 100) / 100);
    const pct = row.planned > 0 ? Math.round((row.executed / row.planned) * 100) : (row.executed > 0 ? 100 : 0);
    const barClass = pct >= 100 ? '' : pct >= 50 ? 'is-warn' : 'is-low';
    const isActive = checkinSummaryArea === row.area;
    return `<tr>
              <td><button type="button" class="checkin-area-row-btn ${isActive ? 'is-active' : ''}" onclick="checkinSetSummaryFilter('area', '${esc(isActive ? '' : row.area)}')">${esc(row.area)}${row.area !== row.dh ? ` <small style="color:#64748b;font-weight:600;">(${esc(row.dh)})</small>` : ''}</button></td>
              <td><strong>${row.uniqueKeys.size}</strong> <small>(${row.entries} dia/apont.)</small></td>
              <td><strong>${checkinNumber(row.planned)} m</strong></td>
              <td style="color:#15803d;font-weight:800;">${checkinNumber(row.executed)} m</td>
              <td style="color:${remaining > 0 ? '#b45309' : '#15803d'};font-weight:800;">${checkinNumber(remaining)} m</td>
              <td style="min-width:130px;">
                <strong>${pct}%</strong>
                <div class="checkin-mini-bar" style="margin-top:4px;"><div class="checkin-mini-bar-fill ${barClass}" style="width:${Math.min(100, Math.max(0, pct))}%"></div></div>
              </td>
            </tr>`;
  }).join('')}
        </tbody>
      </table></div>` : `<div class="checkin-empty"><p>Nenhuma área encontrada para o período e filtros selecionados.</p></div>`}
    </article>

    <article class="checkin-report-card">
      <header class="checkin-report-head">
        <div>
          <p class="eyebrow">CONSOLIDADO DE ATIVIDADES RECORRENTES</p>
          <h2>Total Programado x Instalado por Atividade (${visibleActivityRows.length})</h2>
          <p>Soma automática dos dias em que a mesma atividade foi programada no período (sem duplicar saldo remanejado).</p>
        </div>
        <label style="display:flex;align-items:center;gap:6px;font-size:12px;font-weight:700;cursor:pointer;">
          <input type="checkbox" ${checkinSummaryRepeatedOnly ? 'checked' : ''} onchange="checkinSetSummaryFilter('repeatedOnly', this.checked)">
          Mostrar apenas atividades repetidas (2+ dias)
        </label>
      </header>
      ${visibleActivityRows.length ? `<div class="checkin-activity-table-wrap"><table class="checkin-activity-table checkin-plan-table">
        <thead><tr>
          <th>Área / Disciplina</th>
          <th>Item / Cronograma</th>
          <th>Local e Atividade</th>
          <th>Programação por dia</th>
          <th>Total Programado</th>
          <th>Total Instalado</th>
          <th>Falta (Saldo)</th>
          <th>% Avanço</th>
          <th>Ação</th>
        </tr></thead>
        <tbody>
          ${visibleActivityRows.map(item => {
    const isOver = item.excess > 0 && item.planned > 0;
    const barClass = isOver ? 'is-warn' : item.pct >= 100 ? '' : item.pct >= 50 ? 'is-warn' : 'is-low';
    const subSum = checkinSubItemsSummary(item.subItems);
    const dayChips = item.sortedDays.map(d => {
      const shortDate = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' }).format(new Date(`${d.date}T12:00:00`));
      const isCarryChip = d.carryOnly && d.planned === 0 && d.executed === 0;
      const chipClass = isCarryChip ? '' : d.planned > 0 && d.executed > d.planned ? 'is-over' : d.planned > 0 && d.executed >= d.planned ? 'is-done' : d.executed > 0 ? 'is-partial' : '';
      const label = isCarryChip ? `${shortDate}: saldo` : `${shortDate}: ${checkinNumber(d.executed)}/${checkinNumber(d.planned)} ${esc(item.unit)}`;
      return `<button type="button" class="checkin-day-chip ${chipClass}" onclick="checkinJumpToDay('${esc(d.date)}','${esc(item.dh)}','${esc(item.area)}')" title="Clique para abrir ${checkinFormatDate(d.date)} no Diário e conferir/corrigir">${label}</button>`;
    }).join('');
    return `<tr>
              <td><strong>${esc(item.area)}</strong><small>${esc(item.discipline)}</small></td>
              <td><strong>${esc(item.pstItem || '—')}</strong><small>${esc(item.scheduleId || '—')}</small></td>
              <td><strong>${esc(item.location || '—')}</strong><small>${esc(item.activity || '—')}</small>${subSum ? `<small style="display:block;margin-top:3px;color:#0369a1;font-weight:700;">🔧 ${subSum.done}/${subSum.total}${subSum.pendingLabels.length ? ` · Falta: ${esc(subSum.pendingLabels.join(', '))}` : ' · Concluídas'}</small>` : ''}</td>
              <td style="min-width:210px;">
                <small style="font-weight:700;color:#334155;">${item.daysCount} dia(s) <span style="font-weight:500;color:#64748b;">(clique no dia para editar)</span></small>
                <div class="checkin-day-chips">${dayChips}</div>
              </td>
              <td><strong>${checkinNumber(item.planned)} ${esc(item.unit)}</strong></td>
              <td style="color:${isOver ? '#b45309' : '#15803d'};font-weight:800;">${checkinNumber(item.executed)} ${esc(item.unit)}</td>
              <td style="color:${isOver ? '#b91c1c' : item.remaining > 0 ? '#b45309' : '#15803d'};font-weight:800;">${isOver ? `⚠️ Excedeu +${checkinNumber(item.excess)} ${esc(item.unit)}` : item.remaining > 0 ? `${checkinNumber(item.remaining)} ${esc(item.unit)}` : `0 ${esc(item.unit)}`}</td>
              <td style="min-width:120px;">
                <strong style="color:${isOver ? '#b91c1c' : 'inherit'}">${item.pct}%</strong>
                <div class="checkin-mini-bar" style="margin-top:4px;"><div class="checkin-mini-bar-fill ${barClass}" style="width:${Math.min(100, Math.max(0, item.pct))}%"></div></div>
              </td>
              <td><button type="button" class="button button-outline compact" onclick="checkinOpenTaskEditor('${esc(item.key)}','${esc(checkinSummaryStart)}','${esc(checkinSummaryEnd)}')">✏️ Editar</button></td>
            </tr>`;
  }).join('')}
        </tbody>
      </table></div>` : `<div class="checkin-empty"><p>Nenhuma atividade encontrada para os filtros selecionados.</p></div>`}
    </article>
  `;
}

function checkinRenderSummary(engineers, dataHalls, areas, disciplines, companies) {
  return `
    <div class="checkin-summary-quick-periods">
      <button type="button" class="button button-outline compact" onclick="checkinSetSummaryPeriod('thisWeek')">Semana atual</button>
      <button type="button" class="button button-outline compact" onclick="checkinSetSummaryPeriod('prevWeek')">Semana anterior</button>
      <button type="button" class="button button-outline compact" onclick="checkinSetSummaryPeriod('thisMonth')">Mês atual</button>
      <button type="button" class="button button-outline compact" onclick="checkinSetSummaryPeriod('all')">Todo o histórico</button>
    </div>
    <section class="checkin-filter-panel">
      <label><span>De</span><input type="date" data-checkin-summary-start value="${checkinSummaryStart}" oninput="checkinSetSummaryRange('start', this.value)" onchange="checkinSetSummaryRange('start', this.value)"></label>
      <label><span>Até</span><input type="date" data-checkin-summary-end value="${checkinSummaryEnd}" oninput="checkinSetSummaryRange('end', this.value)" onchange="checkinSetSummaryRange('end', this.value)"></label>
      <label><span>Área / CAG</span><select onchange="checkinSetSummaryFilter('area', this.value)">${checkinSelectOptions(areas, checkinSummaryArea, 'Todas')}</select></label>
      <label><span>Data Hall</span><select onchange="checkinSetSummaryFilter('dh', this.value)">${checkinSelectOptions(dataHalls, checkinSummaryDh, 'Todos')}</select></label>
      <label><span>Disciplina</span><select onchange="checkinSetSummaryFilter('discipline', this.value)">${checkinSelectOptions(disciplines, checkinSummaryDiscipline, 'Todas')}</select></label>
      <label><span>Engenheiro</span><select onchange="checkinSetSummaryFilter('engineer', this.value)">${checkinSelectOptions(engineers, checkinSummaryEngineer, 'Todos')}</select></label>
      <label><span>Empresa</span><select onchange="checkinSetSummaryFilter('company', this.value)">${checkinSelectOptions(companies, checkinSummaryCompany, 'Todas')}</select></label>
      <label><span>Buscar área / atividade</span><input type="search" value="${esc(checkinSummarySearch)}" placeholder="Ex.: CAG 4, tubulação, duto..." oninput="checkinSetSummaryFilter('search', this.value)"></label>
    </section>
    <div id="checkinSummaryResults">
      ${checkinRenderSummaryResults()}
    </div>
  `;
}

function checkinSetSummaryPeriod(mode) {
  const today = checkinToday();
  if (mode === 'thisWeek') {
    const b = checkinWeekBounds(checkinSelectedDate || today);
    checkinSummaryStart = b.start;
    checkinSummaryEnd = b.end;
  } else if (mode === 'prevWeek') {
    const b = checkinWeekBounds(checkinDateOffset(checkinSelectedDate || today, -7));
    checkinSummaryStart = b.start;
    checkinSummaryEnd = b.end;
  } else if (mode === 'thisMonth') {
    const base = today.slice(0, 7);
    const [y, m] = base.split('-').map(Number);
    const lastDay = new Date(y, m, 0).getDate();
    checkinSummaryStart = `${base}-01`;
    checkinSummaryEnd = `${base}-${String(lastDay).padStart(2, '0')}`;
  } else if (mode === 'all') {
    checkinSummaryStart = '';
    checkinSummaryEnd = '';
  }
  renderCheckIn();
}

function checkinSetSummaryRange(which, value) {
  const clean = String(value || '').trim();
  if (clean && !/^\d{4}-\d{2}-\d{2}$/.test(clean)) return;
  if (which === 'start') checkinSummaryStart = clean;
  else checkinSummaryEnd = clean;
  const resultsEl = document.getElementById('checkinSummaryResults');
  if (resultsEl && checkinActiveTab === 'resumo') {
    resultsEl.innerHTML = checkinRenderSummaryResults();
    if (typeof hydrateIcons === 'function') hydrateIcons();
    return;
  }
  renderCheckIn();
}

function checkinSetSummaryFilter(which, value) {
  checkinSyncFiltersFromDom();
  if (which === 'dh') checkinSummaryDh = value;
  else if (which === 'area') checkinSummaryArea = value;
  else if (which === 'search') checkinSummarySearch = value;
  else if (which === 'discipline') checkinSummaryDiscipline = value;
  else if (which === 'engineer') checkinSummaryEngineer = value;
  else if (which === 'company') checkinSummaryCompany = value;
  else if (which === 'repeatedOnly') checkinSummaryRepeatedOnly = Boolean(value);
  const resultsEl = document.getElementById('checkinSummaryResults');
  if (resultsEl && checkinActiveTab === 'resumo') {
    resultsEl.innerHTML = checkinRenderSummaryResults();
    // Atualiza o select de Área se foi alterado via clique na tabela
    if (which === 'area') {
      const areaSelect = document.querySelector('.checkin-filter-panel select[onchange*="\'area\'"]');
      if (areaSelect) areaSelect.value = checkinSummaryArea;
    }
    if (typeof hydrateIcons === 'function') hydrateIcons();
    return;
  }
  renderCheckIn();
}

function checkinRenderPlanningResults() {
  const searchNorm = checkinNormalizeSearchText(checkinPlanSearch);
  const reports = checkinReports.filter(report => report.workDate >= checkinPlanStart && report.workDate <= checkinPlanEnd
    && (!checkinPlanEngineerFilter || report.engineer === checkinPlanEngineerFilter)
    && (!checkinPlanCompanyFilter || (report.contractor === checkinPlanCompanyFilter || (report.activities || []).some(a => a.contractor === checkinPlanCompanyFilter))));

  const rows = reports.flatMap(report =>
    (report.activities || [])
      .filter(activity => !checkinPlanDisciplineFilter || checkinGetActivityDiscipline(report, activity) === checkinPlanDisciplineFilter)
      .filter(activity => !checkinPlanShiftFilter || checkinGetActivityShift(report, activity) === checkinPlanShiftFilter)
      .filter(activity => !checkinPlanCompanyFilter || (activity.contractor ? activity.contractor === checkinPlanCompanyFilter : report.contractor === checkinPlanCompanyFilter))
      .filter(activity => {
        if (!searchNorm) return true;
        const area = checkinExtractAreaLabel(report, activity);
        const hay = checkinNormalizeSearchText([
          area, report.dh, report.engineer, activity.pstItem, activity.scheduleId, activity.location, activity.activity
        ].filter(Boolean).join(' '));
        return hay.includes(searchNorm);
      })
      .map(activity => ({ report, activity }))
  ).sort((a, b) => a.report.workDate.localeCompare(b.report.workDate) || a.report.dh.localeCompare(b.report.dh) || a.report.engineer.localeCompare(b.report.engineer));
  const planned = rows.reduce((sum, item) => sum + checkinActivityOriginalPlannedMeters(item.activity), 0);
  const executed = rows.reduce((sum, item) => sum + checkinParseNumber(item.activity.executedMeters), 0);
  const remaining = Math.max(0, Math.round((planned - executed) * 100) / 100);

  return `<section class="checkin-plan-summary"><strong>${rows.length}</strong> atividade(s) · <strong>${checkinNumber(planned)} m</strong> planejados · <strong style="color:#15803d;">${checkinNumber(executed)} m</strong> executados · <strong style="color:${remaining > 0 ? '#b45309' : '#15803d'};">${checkinNumber(remaining)} m</strong> faltando · ${reports.length} diário(s)</section>
  ${rows.length ? `<article class="checkin-report-card"><div class="checkin-activity-table-wrap"><table class="checkin-activity-table checkin-plan-table"><thead><tr><th>Data / DH</th><th>Engenheiro / empreiteira</th><th>Disciplina / turno</th><th>Item / cronograma</th><th>Local / atividade</th><th>Planejado</th><th>Executado</th><th>Status</th><th>Editar</th></tr></thead><tbody>${rows.map(({ report, activity }) => {
    const shift = checkinGetActivityShift(report, activity);
    const recKey = checkinActivityRecurrenceKey(report.dh, activity) || `${report.dh}|${activity.id}`;
    const currentStatus = checkinResolveMigratedStatus(activity, activity.checkinAt, activity.checkoutAt);
    const unit = activity.unit || 'm';
    return `<tr><td>${checkinFormatDate(report.workDate)}<small>${esc(report.dh)}</small></td><td>${esc(report.engineer)}<small>${esc(activity.contractor || report.contractor || '—')}</small></td><td><strong>${esc(checkinGetActivityDiscipline(report, activity) || report.discipline || '—')}</strong><small>${shift === 'Noturno' ? '🌙 Noturno' : '☀️ Diurno'}${activity.stage || report.stage ? ` · ${esc(activity.stage || report.stage)}` : ''}</small></td><td><strong>${esc(activity.pstItem || '—')}</strong><small>${esc(activity.scheduleId || unit)}</small></td><td><strong>${esc(activity.location || '—')}</strong><small>${esc(activity.activity || '')}</small></td><td>${checkinNumber(activity.plannedMeters)} ${esc(unit)}</td><td style="color:#15803d;font-weight:700;">${checkinNumber(activity.executedMeters)} ${esc(unit)}</td><td><span class="checkin-status-pill ${currentStatus === 'Concluído' ? 'closed' : currentStatus === 'Iniciado' ? 'running' : currentStatus === 'Parcial' ? 'partial' : currentStatus === 'Suspenso' ? 'suspended' : 'pending'}">${esc(currentStatus)}</span></td><td><button type="button" class="button button-outline compact" onclick="checkinOpenTaskEditor('${esc(recKey)}','${esc(checkinPlanStart)}','${esc(checkinPlanEnd)}')">✏️ Editar</button></td></tr>`;
  }).join('')}</tbody></table></div></article>` : `<section class="checkin-empty"><h2>Nenhum planejamento neste período</h2><p>Importe uma planilha semanal ou ajuste os filtros acima.</p></section>`}`;
}

function checkinRenderPlanning(engineers, dataHalls, disciplines = checkinAllDisciplines(), companies = checkinCompanies()) {
  return `<section class="checkin-filter-panel checkin-plan-filter">
    <label><span>De</span><input type="date" data-checkin-plan-start value="${checkinPlanStart}" oninput="checkinSetPlanRange('start',this.value)" onchange="checkinSetPlanRange('start',this.value)"></label>
    <label><span>Até</span><input type="date" data-checkin-plan-end value="${checkinPlanEnd}" oninput="checkinSetPlanRange('end',this.value)" onchange="checkinSetPlanRange('end',this.value)"></label>
    <label><span>Turno</span><select onchange="checkinSetPlanShiftFilter(this.value)">${checkinShiftSelectOptions(checkinPlanShiftFilter, 'Todos')}</select></label>
    <label><span>Disciplina</span><select onchange="checkinSetPlanDisciplineFilter(this.value)">${checkinSelectOptions(disciplines, checkinPlanDisciplineFilter, 'Todas')}</select></label>
    <label><span>Empresa</span><select onchange="checkinSetPlanCompanyFilter(this.value)">${checkinSelectOptions(companies, checkinPlanCompanyFilter, 'Todas')}</select></label>
    <label><span>Engenheiro</span><select onchange="checkinSetPlanEngineerFilter(this.value)">${checkinSelectOptions(engineers, checkinPlanEngineerFilter, 'Todos')}</select></label>
    <label><span>Buscar tarefa / local / código</span><input type="search" value="${esc(checkinPlanSearch)}" placeholder="Ex.: MAIN RING, CAG 4, 04-RO..." oninput="checkinSetPlanSearch(this.value)"></label>
    ${checkinCanManagePlanning() ? `<button class="button button-outline" onclick="checkinOpenImport()">${icon('upload')} Importar planilha semanal</button>` : ''}
    <button class="button button-outline" onclick="checkinDownloadTemplate()">${icon('download')} Baixar modelo XLSX</button>
  </section>
  <div id="checkinPlanResults">
    ${checkinRenderPlanningResults()}
  </div>`;
}

function checkinSetPlanSearch(value) {
  checkinSyncFiltersFromDom();
  checkinPlanSearch = value;
  const resultsEl = document.getElementById('checkinPlanResults');
  if (resultsEl && checkinActiveTab === 'planejamento') {
    resultsEl.innerHTML = checkinRenderPlanningResults();
    if (typeof hydrateIcons === 'function') hydrateIcons();
    return;
  }
  renderCheckIn();
}

function checkinOpenTaskEditor(recKey, startDate = '', endDate = '') {
  if (!recKey) return;
  const entries = [];
  checkinReports
    .filter(r => (!startDate || r.workDate >= startDate) && (!endDate || r.workDate <= endDate))
    .forEach(report => {
      (report.activities || []).forEach(activity => {
        const key = checkinActivityRecurrenceKey(report.dh, activity) || `${report.dh}|${activity.id}`;
        if (key === recKey) {
          entries.push({ report, activity });
        }
      });
    });

  if (!entries.length) {
    return toast('Nenhum apontamento encontrado para esta tarefa no período.', true);
  }

  entries.sort((a, b) => a.report.workDate.localeCompare(b.report.workDate));
  const sample = entries[0].activity;
  const sampleReport = entries[0].report;
  const area = checkinExtractAreaLabel(sampleReport, sample);
  const titleCode = [sample.pstItem ? `Item ${sample.pstItem}` : '', sample.scheduleId].filter(Boolean).join(' · ');
  const periodLabel = startDate && endDate ? `${checkinFormatDate(startDate)} a ${checkinFormatDate(endDate)}` : 'Todo o período';

  const rowsHtml = entries.map(({ report, activity }, idx) => {
    const unit = activity.unit || 'm';
    const unitOptions = checkinUniqueOptions([...CHECKIN_UNITS, unit].filter(Boolean));
    const currentStatus = checkinResolveMigratedStatus(activity, activity.checkinAt, activity.checkoutAt);
    const isCarry = checkinIsCarryoverActivity(activity);
    return `<tr data-editor-row data-report-id="${esc(report.id)}" data-activity-id="${esc(activity.id)}" data-is-carry="${isCarry ? '1' : '0'}">
      <td><strong>${checkinFormatDate(report.workDate)}</strong><small>${esc(report.dh)} · ${esc(report.engineer)}</small>${isCarry ? '<span class="checkin-carryover-pill">↩️ Saldo</span>' : ''}</td>
      <td><select data-ed-field="unit" class="checkin-unit-select" onchange="checkinUpdateTaskEditorTotals()">${unitOptions.map(u => `<option value="${esc(u)}" ${unit === u ? 'selected' : ''}>${esc(u)}</option>`).join('')}</select></td>
      <td><input type="number" min="0" step="0.1" class="checkin-number-input" data-ed-field="plannedMeters" value="${esc(checkinParseNumber(activity.plannedMeters))}" oninput="checkinUpdateTaskEditorTotals()"></td>
      <td><input type="number" min="0" step="0.1" class="checkin-number-input" data-ed-field="executedMeters" value="${esc(checkinParseNumber(activity.executedMeters))}" oninput="checkinOnTaskEditorExecInput(this)"></td>
      <td><select data-ed-field="status" onchange="checkinOnTaskEditorStatusChange(this)">${CHECKIN_STATUS.map(st => `<option ${currentStatus === st ? 'selected' : ''}>${st}</option>`).join('')}</select></td>
      <td><input type="text" class="checkin-inline-text" style="margin:0;min-width:160px;" data-ed-field="notes" value="${esc(activity.notes || '')}" placeholder="Observação"></td>
    </tr>`;
  }).join('');

  modal(`${modalHead(`Editar tarefa: ${sample.location || area}`, `${titleCode ? `${titleCode} · ` : ''}${sample.activity || 'Tarefa'} · Período: ${periodLabel}`)}
    <form class="checkin-task-editor-form" onsubmit="checkinSaveTaskEditor(event)">
      <div class="modal-body">
        <section class="checkin-metrics" data-task-editor-summary style="margin-bottom:14px;"></section>
        <div class="checkin-activity-table-wrap">
          <table class="checkin-activity-table checkin-plan-table" style="min-width:760px;">
            <thead><tr>
              <th>Data / DH / Eng.</th>
              <th>Un.</th>
              <th>Prev. dia</th>
              <th>Exec. dia</th>
              <th>Status</th>
              <th>Observação</th>
            </tr></thead>
            <tbody>${rowsHtml}</tbody>
          </table>
        </div>
      </div>
      <div class="modal-foot">
        <button type="button" class="button button-outline" onclick="closeModal()">Cancelar</button>
        <button type="submit" class="button button-green">Salvar alterações</button>
      </div>
    </form>`, 'modal-large');

  checkinUpdateTaskEditorTotals();
}

function checkinOnTaskEditorExecInput(input) {
  const row = input.closest('[data-editor-row]');
  if (row) {
    const planned = checkinParseNumber(row.querySelector('[data-ed-field="plannedMeters"]')?.value);
    const executed = checkinParseNumber(input.value);
    const statusSel = row.querySelector('[data-ed-field="status"]');
    if (statusSel && planned > 0) {
      if (executed >= planned && ['Não iniciado', 'Iniciado', 'Parcial'].includes(statusSel.value)) {
        statusSel.value = 'Concluído';
      } else if (executed > 0 && executed < planned && ['Não iniciado', 'Iniciado', 'Concluído'].includes(statusSel.value)) {
        statusSel.value = 'Parcial';
      }
    }
  }
  checkinUpdateTaskEditorTotals();
}

function checkinOnTaskEditorStatusChange(select) {
  const row = select.closest('[data-editor-row]');
  if (row && select.value === 'Concluído') {
    const plannedEl = row.querySelector('[data-ed-field="plannedMeters"]');
    const execEl = row.querySelector('[data-ed-field="executedMeters"]');
    const planned = checkinParseNumber(plannedEl?.value);
    const executed = checkinParseNumber(execEl?.value);
    if (planned > 0 && executed < planned && execEl) {
      execEl.value = planned;
    }
  }
  checkinUpdateTaskEditorTotals();
}

function checkinUpdateTaskEditorTotals() {
  const summaryEl = document.querySelector('[data-task-editor-summary]');
  if (!summaryEl) return;
  let totalPlanned = 0;
  let totalExecuted = 0;
  let unit = 'm';
  document.querySelectorAll('[data-editor-row]').forEach(row => {
    const isCarry = row.dataset.isCarry === '1';
    const p = checkinParseNumber(row.querySelector('[data-ed-field="plannedMeters"]')?.value);
    const e = checkinParseNumber(row.querySelector('[data-ed-field="executedMeters"]')?.value);
    const u = row.querySelector('[data-ed-field="unit"]')?.value;
    if (u) unit = u;
    if (!isCarry) totalPlanned += p;
    totalExecuted += e;
  });
  totalPlanned = Math.round(totalPlanned * 100) / 100;
  totalExecuted = Math.round(totalExecuted * 100) / 100;
  const remaining = Math.max(0, Math.round((totalPlanned - totalExecuted) * 100) / 100);
  const excess = totalPlanned > 0 && totalExecuted > totalPlanned ? Math.round((totalExecuted - totalPlanned) * 100) / 100 : 0;
  const pct = totalPlanned > 0 ? Math.round((totalExecuted / totalPlanned) * 100) : (totalExecuted > 0 ? 100 : 0);

  summaryEl.innerHTML = `
    <article><small>TOTAL PROGRAMADO</small><strong>${checkinNumber(totalPlanned)} ${esc(unit)}</strong></article>
    <article><small>TOTAL EXECUTADO</small><strong style="color:${excess > 0 ? '#b45309' : '#15803d'}">${checkinNumber(totalExecuted)} ${esc(unit)}</strong></article>
    <article><small>${excess > 0 ? 'EXCEDENTE (CONFERIR)' : 'FALTA (SALDO)'}</small><strong style="color:${excess > 0 ? '#b91c1c' : remaining > 0 ? '#b45309' : '#15803d'}">${excess > 0 ? `⚠️ +${checkinNumber(excess)} ${esc(unit)}` : `${checkinNumber(remaining)} ${esc(unit)}`}</strong></article>
    <article><small>% AVANÇO</small><strong style="color:${excess > 0 ? '#b91c1c' : pct >= 100 ? '#15803d' : '#0f172a'}">${pct}%</strong></article>
  `;
}

async function checkinSaveTaskEditor(event) {
  event.preventDefault();
  const rows = [...document.querySelectorAll('[data-editor-row]')];
  if (!rows.length) return closeModal();

  const modifiedById = new Map();
  const now = new Date().toISOString();

  rows.forEach(row => {
    const reportId = row.dataset.reportId;
    const activityId = row.dataset.activityId;
    let report = modifiedById.get(reportId);
    if (!report) {
      const original = checkinGetReport(reportId);
      if (!original) return;
      report = structuredClone(original);
      modifiedById.set(reportId, report);
    }
    const activity = (report.activities || []).find(item => item.id === activityId);
    if (!activity) return;

    const newUnit = String(row.querySelector('[data-ed-field="unit"]')?.value || activity.unit || 'm').trim();
    const newPlanned = checkinParseNumber(row.querySelector('[data-ed-field="plannedMeters"]')?.value);
    const newExecuted = checkinParseNumber(row.querySelector('[data-ed-field="executedMeters"]')?.value);
    const newStatus = String(row.querySelector('[data-ed-field="status"]')?.value || activity.status || 'Não iniciado').trim();
    const newNotes = String(row.querySelector('[data-ed-field="notes"]')?.value || '').trim();

    activity.unit = newUnit;
    activity.plannedMeters = newPlanned;
    const carried = checkinParseNumber(activity.carryoverAddedMeters);
    if (carried > 0 && !checkinIsCarryoverActivity(activity)) {
      activity.basePlannedMeters = Math.max(0, Math.round((newPlanned - carried) * 100) / 100);
    }
    activity.executedMeters = newExecuted;
    activity.status = newStatus;
    activity.notes = newNotes;

    if (newStatus === 'Concluído') {
      if (!activity.checkinAt) activity.checkinAt = now;
      if (!activity.checkoutAt) activity.checkoutAt = now;
    } else if (newStatus === 'Não iniciado') {
      activity.checkinAt = '';
      activity.checkoutAt = '';
    } else if (newStatus === 'Iniciado') {
      activity.checkoutAt = '';
    }
  });

  const toPersist = [];
  modifiedById.forEach(report => {
    const checkedIn = report.activities.filter(item => item.checkinAt);
    const checkedOut = report.activities.filter(item => item.checkoutAt);
    report.checkinAt = checkedIn.map(item => item.checkinAt).sort()[0] || '';
    report.checkoutAt = report.activities.length && checkedOut.length === report.activities.length
      ? checkedOut.map(item => item.checkoutAt).sort().at(-1) : '';
    report.status = report.checkoutAt ? 'fechado' : report.checkinAt ? 'iniciado' : 'planejado';
    toPersist.push(report);
  });

  if (toPersist.length) {
    await checkinPersistReports(toPersist, { silent: false });
  }
  closeModal();
  renderCheckIn();
}

function checkinSetPlanRange(which, value) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(String(value).trim())) return;
  if (which === 'start') checkinPlanStart = String(value).trim();
  else checkinPlanEnd = String(value).trim();
  const resultsEl = document.getElementById('checkinPlanResults');
  if (resultsEl && checkinActiveTab === 'planejamento') {
    resultsEl.innerHTML = checkinRenderPlanningResults();
    if (typeof hydrateIcons === 'function') hydrateIcons();
    return;
  }
  renderCheckIn();
}

function checkinSetPlanEngineerFilter(value) {
  checkinSyncFiltersFromDom();
  checkinPlanEngineerFilter = value;
  const resultsEl = document.getElementById('checkinPlanResults');
  if (resultsEl && checkinActiveTab === 'planejamento') {
    resultsEl.innerHTML = checkinRenderPlanningResults();
    if (typeof hydrateIcons === 'function') hydrateIcons();
    return;
  }
  renderCheckIn();
}

function checkinSetPlanCompanyFilter(value) {
  checkinSyncFiltersFromDom();
  checkinPlanCompanyFilter = value;
  const resultsEl = document.getElementById('checkinPlanResults');
  if (resultsEl && checkinActiveTab === 'planejamento') {
    resultsEl.innerHTML = checkinRenderPlanningResults();
    if (typeof hydrateIcons === 'function') hydrateIcons();
    return;
  }
  renderCheckIn();
}

function checkinSetPlanDisciplineFilter(value) {
  checkinSyncFiltersFromDom();
  checkinPlanDisciplineFilter = value;
  const resultsEl = document.getElementById('checkinPlanResults');
  if (resultsEl && checkinActiveTab === 'planejamento') {
    resultsEl.innerHTML = checkinRenderPlanningResults();
    if (typeof hydrateIcons === 'function') hydrateIcons();
    return;
  }
  renderCheckIn();
}

function checkinSetPlanShiftFilter(value) {
  checkinSyncFiltersFromDom();
  checkinPlanShiftFilter = value;
  const resultsEl = document.getElementById('checkinPlanResults');
  if (resultsEl && checkinActiveTab === 'planejamento') {
    resultsEl.innerHTML = checkinRenderPlanningResults();
    if (typeof hydrateIcons === 'function') hydrateIcons();
    return;
  }
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

function checkinExtractRowDate(row) {
  for (const cell of row) {
    if (cell === undefined || cell === null || cell === '') continue;
    const direct = checkinParseDate(cell);
    if (direct) return direct;
    const text = String(cell);
    let m = text.match(/\b(\d{4})-(\d{2})-(\d{2})\b/);
    if (m) return `${m[1]}-${m[2]}-${m[3]}`;
    m = text.match(/\b(\d{2})[/.\-](\d{2})[/.\-](\d{4})\b/);
    if (m) return `${m[3]}-${m[2]}-${m[1]}`;
  }
  return '';
}

function checkinReadDhWorkbook(workbook) {
  const sheets = workbook.SheetNames
    .map(name => {
      const cleanName = String(name || '').trim();
      const dhMatch = cleanName.match(/^DH\s*0?(\d{1,2})\b/i);
      if (dhMatch && Number(dhMatch[1]) >= 1 && Number(dhMatch[1]) <= 10) {
        return { name, dh: `DH ${String(Number(dhMatch[1])).padStart(2, '0')}`, areaPrefix: '' };
      }
      const cagMatch = cleanName.match(/^CAG\s*0?(\d{1,2})\b/i);
      if (cagMatch && Number(cagMatch[1]) >= 1 && Number(cagMatch[1]) <= 10) {
        const cagNum = Number(cagMatch[1]);
        return { name, dh: `DH ${String(cagNum).padStart(2, '0')}`, areaPrefix: `CAG ${cagNum}` };
      }
      return null;
    })
    .filter(Boolean)
    .sort((a, b) => Number(Boolean(a.areaPrefix)) - Number(Boolean(b.areaPrefix)));
  if (!sheets.length) return null;

  // Pré-carrega o engenheiro de cada DH para usar como fallback na aba CAG correspondente (ex.: CAG 3 -> DH 03, CAG 4 -> DH 04)
  const dhDefaultEngineers = new Map();
  const dhEngineerByDate = new Map();
  sheets.filter(s => !s.areaPrefix).forEach(s => {
    if (!workbook.Sheets[s.name]) return;
    const dhRows = XLSX.utils.sheet_to_json(workbook.Sheets[s.name], { header: 1, defval: '', raw: true });
    const eng = String(dhRows[2]?.[2] || '').trim();
    if (!checkinIsGenericEngineerName(eng)) {
      dhDefaultEngineers.set(s.dh, eng);
    }
  });

  const grouped = new Map();
  const rejectionReasons = [];
  let rejected = 0;
  let missingEngineers = 0;
  sheets.forEach(({ name, dh, areaPrefix }) => {
    const sheet = workbook.Sheets[name];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '', raw: true });
    const rawSheetEng = String(rows[2]?.[2] || '').trim();
    const isGenericEng = checkinIsGenericEngineerName(rawSheetEng);
    const fallbackDhEngineer = areaPrefix ? (dhDefaultEngineers.get(dh) || '') : '';
    let currentBlockEngineer = !isGenericEng
      ? rawSheetEng
      : (fallbackDhEngineer || 'Responsável a definir');
    if (currentBlockEngineer === 'Responsável a definir') missingEngineers += 1;
    let activeDiscipline = '';
    let currentBlockDate = '';
    let currentBlockShift = String(rows[2]?.[10] || '').trim();

    rows.forEach((row, rowIndex) => {
      const metadataCell = [row[12], row[11], row[13], row[14]].find(val => String(val || '').includes('|')) || row[12] || '';
      const metadata = String(metadataCell).split('|');
      const metaDate = checkinParseDate(metadata[0]);
      if (metaDate) currentBlockDate = metaDate;

      const rowJoined = checkinNormalizeHeader(row.filter(cell => cell !== undefined && cell !== null).join(' '));
      const firstCellsJoined = checkinNormalizeHeader([row[0], row[1], row[2]].filter(Boolean).join(' '));

      // Se a linha é um cabeçalho de bloco de data/responsável (sem tarefa na col D)
      if (!String(row[3] || '').trim() || /item\s*pst/.test(firstCellsJoined)) {
        const scannedDate = checkinExtractRowDate(row);
        if (scannedDate) currentBlockDate = scannedDate;
        // Verifica se a linha tem indicação de responsável / engenheiro
        for (let c = 0; c < row.length - 1; c += 1) {
          const labelNorm = checkinNormalizeHeader(row[c]);
          if (/^(?:engenheiro|responsavel|eng\s+responsavel)/.test(labelNorm)) {
            const candidate = String(row[c + 1] || row[c + 2] || '').trim();
            if (!checkinIsGenericEngineerName(candidate)) {
              currentBlockEngineer = candidate;
            }
          }
        }
      }

      const workDate = metaDate || currentBlockDate;
      if (!areaPrefix && !checkinIsGenericEngineerName(currentBlockEngineer)) {
        if (!dhDefaultEngineers.has(dh)) dhDefaultEngineers.set(dh, currentBlockEngineer);
        if (workDate) dhEngineerByDate.set(`${dh}|${workDate}`, currentBlockEngineer);
      }
      const engineer = areaPrefix
        ? (dhEngineerByDate.get(`${dh}|${workDate}`) || (!checkinIsGenericEngineerName(currentBlockEngineer) ? currentBlockEngineer : '') || dhDefaultEngineers.get(dh) || 'Responsável a definir')
        : currentBlockEngineer;

      if (/interferencia/.test(rowJoined)) {
        activeDiscipline = '';
      } else {
        const hasSectionPattern = /atividade.*programad|programad|disciplina|frente/.test(rowJoined) || /^(?:isolamento|dutos?|hidraulica|logistica)\b/.test(firstCellsJoined || rowJoined);
        if (hasSectionPattern && (!row[3] || /atividade.*programad|programad/.test(rowJoined))) {
          const detectedSection = checkinResolveSectionDiscipline(firstCellsJoined) || checkinResolveSectionDiscipline(rowJoined);
          if (detectedSection) activeDiscipline = detectedSection;
        }
      }

      const pstItem = String(row[0] || '').trim();
      const scheduleId = String(row[1] || '').trim();
      const rawLocation = String(row[2] || '').trim();
      const activityText = String(row[3] || '').trim();
      const unit = String(row[4] || '').trim() || 'm';
      const plannedValue = row[5];

      // Ignora cabeçalhos de tabela, linhas de interferência e linhas de cabeçalho de efetivo/clima/empreiteira
      if (
        /^item(?:\s+pst)?$/i.test(pstItem)
        || /^id\s+cronograma$/i.test(scheduleId)
        || /^atividade$/i.test(activityText)
        || checkinIsGarbageActivity({ pstItem, scheduleId, location: rawLocation, activity: activityText, unit })
      ) {
        return;
      }

      const location = areaPrefix
        ? (rawLocation ? (checkinNormalizeHeader(rawLocation).includes(checkinNormalizeHeader(areaPrefix)) ? rawLocation : `${areaPrefix} - ${rawLocation}`) : areaPrefix)
        : rawLocation;
      if (!workDate && !activityText) return;

      const metaDiscipline = checkinResolveSectionDiscipline(metadata[1] || '');
      const fallbackDiscipline = activityText ? checkinGetActivityDiscipline({ discipline: activeDiscipline || metaDiscipline }, {
        pstItem, scheduleId, location, activity: activityText
      }) : '';
      const discipline = String(activeDiscipline || metaDiscipline || fallbackDiscipline || metadata[1] || '').trim();
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
          shift: currentBlockShift
        });
      }
      if (report.discipline && discipline && report.discipline !== discipline) report.discipline = 'Geral / varias';
      const baseSlug = checkinSlug(scheduleId || pstItem || `${rawLocation}-${activityText}`);
      const activityId = areaPrefix ? `${id}-task-${checkinSlug(areaPrefix)}-${baseSlug}` : `${id}-task-${baseSlug}`;
      const currentStatus = String(row[8] || '').trim();
      const executedValue = row[6];
      const executedMeters = executedValue === '' || executedValue === undefined || executedValue === null
        ? 0 : checkinParseNumber(executedValue);
      const plannedMeters = (plannedValue === '' || plannedValue === undefined || plannedValue === null)
        ? 0 : checkinParseNumber(plannedValue);
      const status = CHECKIN_STATUS.includes(currentStatus)
        ? currentStatus
        : executedMeters > 0 && executedMeters >= plannedMeters ? CHECKIN_STATUS[0]
          : executedMeters > 0 ? CHECKIN_STATUS[1] : CHECKIN_STATUS[2];
      const rawProblem = String(row[9] || '').trim();
      const problemMatch = rawProblem.match(/^\s*(\d{1,2})(?:\s*[-:].*)?$/);
      const problemCode = problemMatch ? problemMatch[1].padStart(2, '0') : rawProblem ? 'OUTRO' : '';
      const activity = {
        id: activityId, pstItem, scheduleId, location, activity: activityText,
        discipline, shift: checkinNormalizeShift(currentBlockShift) || 'Diurno',
        actualCrew: null, unit, plannedMeters, executedMeters, status,
        isExtra: currentStatus === CHECKIN_EXTRA_LEGACY_STATUS,
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
        shift: checkinNormalizeShift(data.shift || existing?.shift || report.shift) || 'Diurno',
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
          if (!saved) return activity;
          const carriedMeters = checkinParseNumber(saved.carryoverAddedMeters);
          const mergedPlanned = carriedMeters > 0
            ? Math.round((checkinParseNumber(activity.plannedMeters) + carriedMeters) * 100) / 100
            : activity.plannedMeters;
          return {
            ...activity,
            plannedMeters: mergedPlanned,
            ...(carriedMeters > 0 ? {
              basePlannedMeters: checkinParseNumber(activity.plannedMeters),
              carryoverAddedMeters: carriedMeters,
              carryoverMergedFromId: saved.carryoverMergedFromId || '',
              carryoverFromDate: saved.carryoverFromDate || '',
              carryoverOriginDate: saved.carryoverOriginDate || ''
            } : {}),
            shift: saved.shift || activity.shift || 'Diurno',
            status: saved.status || activity.status,
            checkinAt: saved.checkinAt || activity.checkinAt || '',
            checkoutAt: saved.checkoutAt || activity.checkoutAt || '',
            contractor: saved.contractor || activity.contractor || '',
            actualCrew: saved.actualCrew ?? activity.actualCrew,
            ptaCount: saved.ptaCount ?? activity.ptaCount,
            forkliftCount: saved.forkliftCount ?? activity.forkliftCount,
            executedMeters: saved.executedMeters ?? activity.executedMeters,
            subItems: Array.isArray(saved.subItems) ? saved.subItems : activity.subItems,
            problemCode: saved.problemCode || activity.problemCode,
            problemOther: saved.problemOther || activity.problemOther,
            notes: saved.notes || activity.notes
          };
        });
        // Atividades extras foram lançadas no diário, não na planilha semanal.
        imported.activities.push(...current.activities.filter(activity =>
          checkinIsExtraActivity(activity) && !imported.activities.some(item => item.id === activity.id)
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
  checkinSyncFiltersFromDom();
  if (!checkinCompanies().length && typeof workforceReadyPromise !== 'undefined') await workforceReadyPromise;
  if (typeof syncUserApprovalsFromSupabase === 'function') await syncUserApprovalsFromSupabase();
  const engineers = checkinAvailableEngineers();
  const companies = checkinCompanies();
  const defaultShift = checkinShiftFilter || 'Diurno';
  modal(`${modalHead('Planejar atividade extra', 'Registre uma tarefa fora da planilha semanal. Ela ficará identificada com a informação de Atividade Extra e seguirá o fluxo normal de check-in / check-out.')}
    <form class="checkin-manual-form" onsubmit="checkinAddStandaloneExtra(event)">
      <label><span>Data</span><input name="workDate" type="date" required value="${checkinSelectedDate}"></label>
      <label><span>DH</span><select name="dh" required>${checkinSelectOptions(CHECKIN_DATA_HALLS, checkinDhFilter || '', 'Selecione')}</select></label>
      <label><span>Disciplina</span><select name="discipline" required>${checkinSelectOptions(CHECKIN_DISCIPLINES, checkinDisciplineFilter || '', 'Selecione')}</select></label>
      <label><span>Turno</span><select name="shift" required><option value="Diurno" ${defaultShift === 'Diurno' ? 'selected' : ''}>☀️ Diurno</option><option value="Noturno" ${defaultShift === 'Noturno' ? 'selected' : ''}>🌙 Noturno</option></select></label>
      <label><span>Engenheiro</span><input name="engineer" list="checkinEngineersDatalist" required value="${esc(checkinEngineerFilter || (typeof currentUser !== 'undefined' && currentUser?.name ? currentUser.name : ''))}" placeholder="Selecione ou digite o engenheiro"><datalist id="checkinEngineersDatalist">${engineers.map(eng => `<option value="${esc(eng)}">`).join('')}</datalist></label>
      <label><span>Empreiteira</span><input name="contractor" list="checkinCompaniesDatalist" value="${esc(checkinCompanyFilter || '')}" placeholder="Selecione ou digite a empresa"><datalist id="checkinCompaniesDatalist">${companies.map(comp => `<option value="${esc(comp)}">`).join('')}</datalist></label>
      <label><span>Local / sala</span><input name="location" list="checkinStandaloneSubAreasList" placeholder="Ex.: CORREDOR PDU, SALAS ELÉTRICAS, Sala RMU 4.4"><datalist id="checkinStandaloneSubAreasList">${checkinExtraSubAreas().map(sub => `<option value="${esc(sub.name)}">`).join('')}</datalist></label>
      <label><span>Setor (opcional)</span><select name="sector">${checkinExtraSectorOptions()}</select></label>
      <label><span>Subárea (opcional)</span><select name="subArea">${checkinExtraSubAreaOptions()}</select></label>
      <label class="wide"><span>Atividade / serviço</span><input name="activity" required placeholder="Descreva o serviço fora do planejamento"></label>
      ${checkinExtraReasonFields()}
      <label><span>Unidade</span><select name="unit">${CHECKIN_UNITS.map((value, index) => `<option value="${value}" ${index === 0 ? 'selected' : ''}>${value}</option>`).join('')}</select></label>
      <label><span>Quantidade estimada no dia</span><input name="plannedMeters" type="number" min="0" step="0.1" value="0" required></label>
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
  if (!workDate || !dh || !engineer) return toast('Confira a data, o DH e o nome do engenheiro.', true);
  if (data.extraReasonCode === 'OUTRO' && !String(data.extraReasonOther || '').trim()) {
    return toast('Descreva o motivo quando escolher Outro.', true);
  }
  const sector = checkinExtraSectorFromForm(data.sector);
  const subArea = checkinExtraSubAreaFromForm(data.subArea);
  const id = checkinReportId(workDate, dh, engineer);
  const selectedShift = checkinNormalizeShift(data.shift) || 'Diurno';
  let report = checkinGetReport(id);
  if (!report) {
    report = checkinCreateReport({
      workDate, dh, engineer, discipline: data.discipline,
      stage: 'Atividade extra', contractor: data.contractor, hcEngineer: engineer,
      shift: selectedShift, weather: data.weather || ''
    });
  } else {
    if (selectedShift && !report.shift) report.shift = selectedShift;
    if (data.weather && !report.weather) report.weather = data.weather;
    if (data.contractor && !report.contractor) report.contractor = data.contractor;
  }
  const taskId = `${id}-extra-${Date.now().toString(36)}`;
  report.activities.push({
    id: taskId, pstItem: '', scheduleId: '', location: checkinComposeExtraLocation(data.location, subArea, sector),
    sector: sector?.id || '', sectorName: sector?.name || '', subArea: subArea?.name || '', discipline: data.discipline,
    shift: selectedShift,
    contractor: String(data.contractor || report.contractor || '').trim(),
    actualCrew: null,
    activity: String(data.activity || '').trim(), unit: String(data.unit || 'm').trim() || 'm',
    plannedMeters: checkinParseNumber(data.plannedMeters), executedMeters: 0,
    isExtra: true,
    status: 'Não iniciado',
    problemCode: data.extraReasonCode || '', problemOther: String(data.extraReasonOther || '').trim(), notes: extraReason
  });
  report.checkoutAt = '';
  report.status = report.activities.some(item => item.checkinAt) ? 'iniciado' : 'planejado';
  await checkinPersistReports(report, { silent: true });
  closeModal();
  checkinSelectedDate = workDate;
  checkinEngineerFilter = engineer;
  checkinDhFilter = dh;
  checkinActiveTab = 'diario';
  toast('Atividade extra adicionada ao diário. Registre a entrada para iniciar.');
  renderCheckIn();
}

async function checkinOpenManualActivity(reportId = '', isExtra = false) {
  if (!isExtra) return toast('A agenda enviada é somente leitura. Cadastre tarefas pelo modelo semanal.', true);
  const current = checkinCaptureReport(reportId) || checkinGetReport(reportId);
  if (!current) return toast('Diário não encontrado. Atualize a página e tente novamente.', true);
  await checkinPersistReports(current, { silent: true });
  const date = current.workDate;
  const engineers = checkinAvailableEngineers();
  const companies = checkinCompanies();
  const defaultShift = checkinShiftFilter || checkinNormalizeShift(current.shift) || 'Diurno';
  modal(`${modalHead('Adicionar atividade extra', current.checkoutAt ? 'O diário fechado será reaberto para registrar esta atividade.' : 'Registre a atividade extra neste diário. Ela ficará identificada como Extra e seguirá o fluxo normal de check-in.')}
    <form class="checkin-manual-form" onsubmit="checkinAddManualActivity(event)">
      <input type="hidden" name="reportId" value="${esc(current.id)}">
      <input type="hidden" name="taskType" value="extra">
      <label><span>Data</span><input name="workDate" type="date" required value="${date}" readonly></label>
      <label><span>DH</span><select name="dh" required>${checkinSelectOptions(CHECKIN_DATA_HALLS, current.dh, 'Selecione')}</select></label>
      <label><span>Disciplina</span><select name="discipline" required>${checkinSelectOptions(CHECKIN_DISCIPLINES, CHECKIN_DISCIPLINES.includes(current.discipline) ? current.discipline : 'Duto', 'Selecione')}</select></label>
      <label><span>Turno</span><select name="shift" required><option value="Diurno" ${defaultShift === 'Diurno' ? 'selected' : ''}>☀️ Diurno</option><option value="Noturno" ${defaultShift === 'Noturno' ? 'selected' : ''}>🌙 Noturno</option></select></label>
      <label><span>Engenheiro</span><input name="engineer" list="checkinManualEngineersList" required value="${esc(current.engineer)}"><datalist id="checkinManualEngineersList">${engineers.map(eng => `<option value="${esc(eng)}">`).join('')}</datalist></label>
      <label><span>Empreiteira</span><input name="contractor" list="checkinManualCompaniesList" value="${esc(current.contractor || '')}" placeholder="Empresa"><datalist id="checkinManualCompaniesList">${companies.map(comp => `<option value="${esc(comp)}">`).join('')}</datalist></label>
      <label><span>Local / sala</span><input name="location" list="checkinManualSubAreasList" placeholder="Ex.: CORREDOR PDU, SALAS ELÉTRICAS, Sala RMU"><datalist id="checkinManualSubAreasList">${checkinExtraSubAreas().map(sub => `<option value="${esc(sub.name)}">`).join('')}</datalist></label>
      <label><span>Setor (opcional)</span><select name="sector">${checkinExtraSectorOptions()}</select></label>
      <label><span>Subárea (opcional)</span><select name="subArea">${checkinExtraSubAreaOptions()}</select></label>
      <label class="wide"><span>Atividade / serviço (texto livre)</span><input name="activity" required placeholder="Digite a descrição da atividade extra"></label>
      ${checkinExtraReasonFields()}
      <label><span>Unidade</span><select name="unit">${CHECKIN_UNITS.map((value, index) => `<option value="${value}" ${index === 0 ? 'selected' : ''}>${value}</option>`).join('')}</select></label>
      <label><span>Quantidade estimada no dia</span><input name="plannedMeters" type="number" min="0" step="0.1" value="0" required></label>
      <div class="modal-foot"><button type="button" class="button button-outline" onclick="closeModal()">Cancelar</button><button class="button button-green" type="submit">Salvar atividade extra</button></div>
    </form>`, 'modal-large');
}

async function checkinAddManualActivity(event) {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(event.currentTarget).entries());
  if (data.taskType !== 'extra') return toast('Tarefas programadas devem ser incluídas pela coordenação na agenda.', true);
  const sourceReport = checkinGetReport(data.reportId);
  if (!sourceReport) return toast('Diário não encontrado. Atualize a página e tente novamente.', true);
  if (data.extraReasonCode === 'OUTRO' && !String(data.extraReasonOther || '').trim()) {
    return toast('Descreva o motivo quando escolher Outro.', true);
  }
  const extraReason = checkinExtraReasonFromForm(data);
  const date = sourceReport.workDate;
  const dh = checkinNormalizeDataHall(data.dh);
  const engineer = String(data.engineer || '').trim();
  if (!dh || !engineer) return toast('Selecione um DH e informe o engenheiro.', true);
  const sector = checkinExtraSectorFromForm(data.sector);
  const subArea = checkinExtraSubAreaFromForm(data.subArea);
  const selectedShift = checkinNormalizeShift(data.shift) || 'Diurno';
  const targetReportId = checkinReportId(date, dh, engineer);
  let report = checkinGetReport(targetReportId);
  if (!report) {
    report = checkinCreateReport({
      workDate: date, dh, engineer, discipline: data.discipline || sourceReport.discipline,
      stage: sourceReport.stage, contractor: data.contractor || sourceReport.contractor,
      hcEngineer: sourceReport.hcEngineer || engineer, supervisor: sourceReport.supervisor,
      shift: selectedShift || sourceReport.shift, weather: sourceReport.weather
    });
  }
  const taskId = `${report.id}-extra-${Date.now().toString(36)}`;
  report.activities.push({
    id: taskId, pstItem: '', scheduleId: '',
    sector: sector?.id || '', sectorName: sector?.name || '', subArea: subArea?.name || '',
    discipline: String(data.discipline || report.discipline || '').trim(),
    shift: selectedShift,
    contractor: String(data.contractor || report.contractor || '').trim(),
    actualCrew: null,
    location: checkinComposeExtraLocation(data.location, subArea, sector), activity: data.activity.trim(), unit: data.unit.trim() || 'm',
    plannedMeters: checkinParseNumber(data.plannedMeters), executedMeters: 0,
    isExtra: data.taskType === 'extra',
    status: 'Não iniciado',
    problemCode: data.extraReasonCode || '', problemOther: String(data.extraReasonOther || '').trim(), notes: extraReason
  });
  report.checkoutAt = '';
  report.status = report.activities.some(item => item.checkinAt) ? 'iniciado' : 'planejado';
  await checkinPersistReports(report, { silent: true });
  closeModal();
  checkinSelectedDate = date;
  checkinEngineerFilter = engineer;
  checkinDhFilter = dh;
  checkinActiveTab = 'diario';
  toast('Atividade extra adicionada ao diário. Registre a entrada para iniciar.');
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
  let dismissedSourceReport = null;
  if (checkinIsCarryoverActivity(activity) && activity.carryoverSourceId && activity.carryoverFromDate) {
    const srcId = checkinReportId(activity.carryoverFromDate, report.dh, report.engineer);
    const srcReport = checkinGetReport(srcId);
    if (srcReport) {
      const clonedSrc = structuredClone(srcReport);
      const srcAct = (clonedSrc.activities || []).find(item => item.id === activity.carryoverSourceId);
      if (srcAct) {
        srcAct.carryoverDismissed = true;
        dismissedSourceReport = clonedSrc;
      }
    }
  }
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
      if (dismissedSourceReport) {
        await checkinPersistReports(dismissedSourceReport, { silent: true });
      }
    } catch (error) {
      console.warn('Falha ao excluir o planejamento compartilhado:', error);
      return toast('A atividade nao foi excluida do banco. Verifique a conexao e tente novamente.', true);
    }
  } else {
    report.activities = remainingActivities;
    const toSave = dismissedSourceReport ? [report, dismissedSourceReport] : report;
    const synced = await checkinPersistReports(toSave, { silent: true });
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
  return checkinGetActivityDiscipline(report, activity);
}

function checkinActivityBucket(activity) {
  const status = checkinResolveMigratedStatus(activity, activity?.checkinAt, activity?.checkoutAt);
  const planned = checkinParseNumber(activity?.plannedMeters);
  const executed = checkinParseNumber(activity?.executedMeters);
  if (status === 'Concluído') return 'completed';
  if (status === 'Parcial') return 'partial';
  if (status === 'Iniciado') {
    if (planned > 0 && executed >= planned) return 'completed';
    if (executed > 0) return 'partial';
    return 'notStarted';
  }
  if (status === 'Suspenso' || status === 'Não iniciado') return 'notStarted';
  // Caso sem status definido, usa a proporção executada
  if (planned > 0 && executed >= planned) return 'completed';
  if (executed > 0) return 'partial';
  return 'notStarted';
}

function checkinActivityTaskProgress(activity) {
  if (!activity) return { isExtra: false, isCarryover: false, plannedTask: 0, executedTask: 0, progressPct: 0 };
  const isExtra = checkinIsExtraActivity(activity);
  const isCarryover = checkinIsCarryoverActivity(activity);
  const planned = checkinParseNumber(activity.plannedMeters);
  const executed = checkinParseNumber(activity.executedMeters);
  const status = checkinResolveMigratedStatus(activity, activity.checkinAt, activity.checkoutAt);
  const taskDenominator = isCarryover
    ? (checkinParseNumber(activity.carryoverOriginalPlanned) || planned)
    : planned;

  let executedTask = 0;
  if (taskDenominator > 0) {
    if (executed > 0) {
      // Limita o avanço físico da tarefa a 1,0 (100%) para que excedentes não mascarem outras tarefas atrasadas
      executedTask = Math.min(1, executed / taskDenominator);
    } else if (status === 'Concluído' && !isCarryover) {
      executedTask = 1;
    }
  } else {
    if (status === 'Concluído' || executed > 0) {
      executedTask = 1;
    } else if (status === 'Parcial') {
      executedTask = 0.5;
    }
  }

  return {
    isExtra,
    isCarryover,
    plannedTask: (isExtra || isCarryover) ? 0 : 1,
    executedTask,
    progressPct: executedTask * 100
  };
}

function checkinIsActivityCompleted(activity) {
  return checkinActivityBucket(activity) === 'completed';
}

function checkinIsActivityDeviation(activity) {
  const bucket = checkinActivityBucket(activity);
  const planned = checkinParseNumber(activity.plannedMeters);
  const executed = checkinParseNumber(activity.executedMeters);
  const isExtra = checkinIsExtraActivity(activity);
  if (activity.problemCode && !isExtra) return true;
  if (isExtra) return bucket !== 'completed' && Boolean(activity.problemCode);
  if (bucket !== 'completed') return true;
  if (planned > 0 && executed < planned) return true;
  return false;
}

function checkinRenderCurveResults() {
  const locationSearchNorm = checkinNormalizeSearchText(checkinCurveLocationSearch);
  const reports = checkinReports.filter(report =>
    report.workDate >= checkinCurveStart && report.workDate <= checkinCurveEnd
    && (!checkinCurveEngineer || report.engineer === checkinCurveEngineer)
    && (!checkinCurveDh || report.dh === checkinCurveDh)
    && (!checkinCurveWeekday || String(new Date(`${report.workDate}T12:00:00`).getDay()) === checkinCurveWeekday)
  );

  const matchedActivities = [];
  const byDate = new Map();
  reports.forEach(report => {
    const row = byDate.get(report.workDate) || { plannedTasks: 0, completedTasks: 0, deviationTasks: 0, plannedMeters: 0, executedMeters: 0 };
    (report.activities || []).forEach(activity => {
      const actDiscipline = checkinCurveActivityDiscipline(report, activity) || 'Sem disciplina';
      const actShift = checkinGetActivityShift(report, activity);
      const actCompany = activity.contractor || report.contractor || '';
      const actArea = checkinExtractAreaLabel(report, activity);
      const actLocation = checkinExtractLocationLabel(report, activity);
      if (checkinCurveDiscipline && actDiscipline !== checkinCurveDiscipline) return;
      if (checkinCurveShift && actShift !== checkinCurveShift) return;
      if (checkinCurveCompany && actCompany !== checkinCurveCompany) return;
      if (checkinCurveArea && actArea !== checkinCurveArea) return;
      if (locationSearchNorm) {
        const locHaystack = checkinNormalizeSearchText([actArea, report.dh, actLocation, activity.activity].filter(Boolean).join(' '));
        if (!locHaystack.includes(locationSearchNorm)) return;
      }

      const plannedM = checkinParseNumber(activity.plannedMeters);
      const origPlannedM = checkinActivityOriginalPlannedMeters(activity);
      const executedM = checkinParseNumber(activity.executedMeters);
      const isCompleted = checkinIsActivityCompleted(activity);
      const isDeviation = checkinIsActivityDeviation(activity);
      const { isExtra, isCarryover, plannedTask, executedTask, progressPct } = checkinActivityTaskProgress(activity);

      row.plannedTasks += plannedTask;
      row.completedTasks += executedTask;
      if (isDeviation) row.deviationTasks += 1;
      row.plannedMeters += isExtra ? 0 : origPlannedM;
      row.executedMeters += executedM;

      matchedActivities.push({
        report,
        activity,
        area: actArea,
        location: actLocation,
        discipline: actDiscipline,
        shift: actShift,
        company: actCompany,
        isExtra,
        isCarryover,
        plannedTask,
        executedTask,
        progressPct,
        plannedM,
        origPlannedM,
        executedM,
        diffM: executedM - (isExtra ? 0 : origPlannedM),
        isCompleted,
        isDeviation
      });
    });
    byDate.set(report.workDate, row);
  });

  const isTasksMetric = checkinCurveMetric === 'tasks';
  const dates = [];
  if (checkinCurveStart && checkinCurveEnd && checkinCurveEnd >= checkinCurveStart) {
    for (let date = checkinCurveStart; date <= checkinCurveEnd; date = checkinDateOffset(date, 1)) dates.push(date);
  }
  let cumulativePlanned = 0;
  let cumulativeExecuted = 0;
  const points = dates.map(date => {
    const daily = byDate.get(date) || { plannedTasks: 0, completedTasks: 0, plannedMeters: 0, executedMeters: 0 };
    cumulativePlanned += isTasksMetric ? daily.plannedTasks : daily.plannedMeters;
    cumulativeExecuted += isTasksMetric ? daily.completedTasks : daily.executedMeters;
    return { date, planned: cumulativePlanned, executed: cumulativeExecuted };
  });

  const maxValue = Math.max(1, ...points.map(point => Math.max(point.planned, point.executed)));
  const tickDigits = isTasksMetric && maxValue < 10 ? 1 : 0;
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

  const totalPlannedTasks = matchedActivities.reduce((s, item) => s + item.plannedTask, 0);
  const totalExtraTasks = matchedActivities.filter(item => item.isExtra).length;
  const totalExecutedTasks = matchedActivities.reduce((s, item) => s + item.executedTask, 0);
  const totalCompletedTasks = matchedActivities.filter(item => item.isCompleted).length;
  const totalPartialTasks = matchedActivities.filter(item => checkinActivityBucket(item.activity) === 'partial').length;
  const totalDeviationTasks = matchedActivities.filter(item => item.isDeviation).length;
  const totalPlannedM = matchedActivities.reduce((s, item) => s + (item.isExtra ? 0 : item.origPlannedM), 0);
  const totalExecutedM = matchedActivities.reduce((s, item) => s + item.executedM, 0);
  const overallTaskPct = totalPlannedTasks > 0
    ? Math.round((totalExecutedTasks / totalPlannedTasks) * 100)
    : (totalExecutedTasks > 0 ? 100 : 0);

  // Agrupamento por disciplina
  const discOrder = checkinUniqueOptions([...CHECKIN_DISCIPLINES, ...matchedActivities.map(m => m.discipline)]);
  const byDiscipline = discOrder.map(disc => {
    const items = matchedActivities.filter(m => m.discipline === disc);
    if (!items.length) return null;
    const plannedTasks = items.reduce((s, m) => s + m.plannedTask, 0);
    const extraCount = items.filter(m => m.isExtra).length;
    const executedTasks = items.reduce((s, m) => s + m.executedTask, 0);
    const completed = items.filter(m => checkinActivityBucket(m.activity) === 'completed').length;
    const partial = items.filter(m => checkinActivityBucket(m.activity) === 'partial').length;
    const notStarted = items.filter(m => checkinActivityBucket(m.activity) === 'notStarted').length;
    const withProblem = items.filter(m => m.activity.problemCode).length;
    const deviations = items.filter(m => m.isDeviation).length;
    const plannedM = items.reduce((s, m) => s + (m.isExtra ? 0 : m.origPlannedM), 0);
    const executedM = items.reduce((s, m) => s + m.executedM, 0);
    const topProblems = new Map();
    items.forEach(m => {
      if (!m.activity.problemCode) return;
      const label = checkinProblemLabel(m.activity.problemCode, m.activity.problemOther);
      topProblems.set(label, (topProblems.get(label) || 0) + 1);
    });
    const topProblemStr = [...topProblems.entries()].sort((a, b) => b[1] - a[1]).slice(0, 2).map(([k, v]) => `${k} (${v})`).join(', ') || '—';
    const adherencePct = plannedTasks > 0 ? Math.round((executedTasks / plannedTasks) * 100) : (executedTasks > 0 ? 100 : 0);
    return {
      discipline: disc,
      total: plannedTasks,
      extraCount,
      executedTasks,
      completed,
      partial,
      notStarted,
      withProblem,
      deviations,
      adherencePct,
      plannedM,
      executedM,
      diffM: executedM - plannedM,
      topProblemStr
    };
  }).filter(Boolean);

  // Agrupamento consolidado por Tarefa (soma todos os dias em que a mesma tarefa apareceu no período)
  const taskGroupMap = new Map();
  matchedActivities.forEach(item => {
    const recKey = checkinActivityRecurrenceKey(item.report.dh, item.activity) || `${item.report.dh}|${item.activity.id}`;
    const entry = taskGroupMap.get(recKey) || {
      key: recKey,
      area: item.area,
      dh: item.report.dh,
      location: item.location,
      discipline: item.discipline,
      pstItem: item.activity.pstItem || '',
      scheduleId: item.activity.scheduleId || '',
      activityText: item.activity.activity || '',
      isExtra: item.isExtra,
      unit: item.activity.unit || 'm',
      engineers: new Set(),
      days: new Map(),
      plannedM: 0,
      executedM: 0
    };
    if (item.report.engineer) entry.engineers.add(item.report.engineer);
    if (!entry.pstItem && item.activity.pstItem) entry.pstItem = item.activity.pstItem;
    if (!entry.scheduleId && item.activity.scheduleId) entry.scheduleId = item.activity.scheduleId;
    if (!entry.activityText && item.activity.activity) entry.activityText = item.activity.activity;
    if (Array.isArray(item.activity.subItems) && item.activity.subItems.length) entry.subItems = item.activity.subItems;
    const origP = item.isExtra ? checkinParseNumber(item.activity.plannedMeters) : item.origPlannedM;
    entry.plannedM = Math.round((entry.plannedM + origP) * 100) / 100;
    entry.executedM = Math.round((entry.executedM + item.executedM) * 100) / 100;
    const dRow = entry.days.get(item.report.workDate) || { date: item.report.workDate, planned: 0, executed: 0, carryOnly: true };
    dRow.planned = Math.round((dRow.planned + origP) * 100) / 100;
    dRow.executed = Math.round((dRow.executed + item.executedM) * 100) / 100;
    if (!item.isCarryover) dRow.carryOnly = false;
    entry.days.set(item.report.workDate, dRow);
    taskGroupMap.set(recKey, entry);
  });
  const byTaskConsolidated = [...taskGroupMap.values()]
    .map(entry => {
      const sortedDays = [...entry.days.values()].sort((a, b) => a.date.localeCompare(b.date));
      const remainingM = Math.max(0, Math.round((entry.plannedM - entry.executedM) * 100) / 100);
      const excessM = entry.executedM > entry.plannedM ? Math.round((entry.executedM - entry.plannedM) * 100) / 100 : 0;
      const pct = entry.plannedM > 0 ? Math.round((entry.executedM / entry.plannedM) * 100) : (entry.executedM > 0 ? 100 : 0);
      return { ...entry, sortedDays, daysCount: sortedDays.length, engineersLabel: [...entry.engineers].join(', '), remainingM, excessM, pct };
    })
    .sort((a, b) => {
      const aCag = /^CAG\s+/i.test(a.area) ? 0 : 1;
      const bCag = /^CAG\s+/i.test(b.area) ? 0 : 1;
      if (aCag !== bCag) return aCag - bCag;
      return b.remainingM - a.remainingM || a.area.localeCompare(b.area, 'pt-BR', { numeric: true }) || a.location.localeCompare(b.location, 'pt-BR');
    });

  // Agrupamento por Área e Local (CAG, Sala Elétrica, Corredor PDU, etc.)
  const locMap = new Map();
  matchedActivities.forEach(item => {
    const locKey = `${checkinSlug(item.area)}|${checkinSlug(item.location)}`;
    const entry = locMap.get(locKey) || {
      area: item.area,
      dh: item.report.dh,
      location: item.location,
      disciplines: new Set(),
      plannedTasks: 0,
      completed: 0,
      partial: 0,
      plannedM: 0,
      executedM: 0,
      unit: item.activity.unit || 'm'
    };
    entry.disciplines.add(item.discipline);
    entry.plannedTasks += item.plannedTask;
    if (checkinActivityBucket(item.activity) === 'completed') entry.completed += 1;
    else if (checkinActivityBucket(item.activity) === 'partial') entry.partial += 1;
    entry.plannedM = Math.round((entry.plannedM + (item.isExtra ? 0 : item.origPlannedM)) * 100) / 100;
    entry.executedM = Math.round((entry.executedM + item.executedM) * 100) / 100;
    locMap.set(locKey, entry);
  });
  const byAreaLocation = [...locMap.values()]
    .map(entry => {
      const remainingM = Math.max(0, Math.round((entry.plannedM - entry.executedM) * 100) / 100);
      const excessM = entry.executedM > entry.plannedM ? Math.round((entry.executedM - entry.plannedM) * 100) / 100 : 0;
      const pct = entry.plannedM > 0 ? Math.round((entry.executedM / entry.plannedM) * 100) : (entry.executedM > 0 ? 100 : 0);
      return { ...entry, disciplinesLabel: [...entry.disciplines].join(', '), remainingM, excessM, pct };
    })
    .sort((a, b) => {
      const aCag = /^CAG\s+/i.test(a.area) ? 0 : 1;
      const bCag = /^CAG\s+/i.test(b.area) ? 0 : 1;
      if (aCag !== bCag) return aCag - bCag;
      return b.remainingM - a.remainingM || a.area.localeCompare(b.area, 'pt-BR', { numeric: true }) || a.location.localeCompare(b.location, 'pt-BR');
    });

  const visibleByTask = checkinCurvePendingOnly
    ? byTaskConsolidated.filter(t => t.remainingM > 0)
    : byTaskConsolidated;
  const visibleByAreaLocation = checkinCurvePendingOnly
    ? byAreaLocation.filter(loc => loc.remainingM > 0)
    : byAreaLocation;

  // Lista detalhada de tarefas e desvios
  const taskRows = matchedActivities
    .filter(item => !checkinCurveDeviationOnly || item.isDeviation)
    .sort((a, b) => b.report.workDate.localeCompare(a.report.workDate) || a.discipline.localeCompare(b.discipline) || a.report.dh.localeCompare(b.report.dh));

  const totalRemainingM = Math.max(0, Math.round((totalPlannedM - totalExecutedM) * 100) / 100);
  const filterText = [checkinCurveArea || 'Todas as áreas', checkinCurveLocationSearch ? `Local: "${checkinCurveLocationSearch}"` : '', checkinCurveDh || 'Todos os DHs', checkinCurveShift ? `Turno ${checkinCurveShift}` : 'Todos os turnos', checkinCurveDiscipline || 'Todas as disciplinas', checkinCurveCompany || 'Todas as empresas', checkinCurveEngineer || 'Todos os engenheiros', checkinCurveWeekday ? CHECKIN_WEEKDAYS[Number(checkinCurveWeekday)] : 'Todos os dias'].filter(Boolean).join(' · ');

  return `<section class="checkin-metrics">
    <article><small>TAREFAS PLANEJADAS</small><strong>${totalPlannedTasks}${totalExtraTasks ? ` <span style="font-size:12px;color:#6d28d9;font-weight:700;">(+${totalExtraTasks} extra)</span>` : ''}</strong></article>
    <article><small>AVANÇO EM TAREFAS (EXEC.)</small><strong style="color:${overallTaskPct >= 100 ? '#15803d' : '#0f172a'}">${checkinNumber(totalExecutedTasks, 2)} (${overallTaskPct}%)</strong><small style="display:block;margin-top:2px;font-size:10px;color:#475569;font-weight:700;">${totalCompletedTasks} concluída(s) · ${totalPartialTasks} parcial(is)</small></article>
    <article><small>TAREFAS COM DESVIO</small><strong style="color:${totalDeviationTasks ? '#b91c1c' : '#143d2b'}">${totalDeviationTasks}</strong></article>
    <article><small>VOLUME (PREV. / EXEC.)</small><strong>${checkinNumber(totalPlannedM)} / ${checkinNumber(totalExecutedM)}</strong><small style="display:block;margin-top:2px;font-size:10px;color:${totalRemainingM > 0 ? '#b45309' : '#15803d'};font-weight:800;">Falta: ${checkinNumber(totalRemainingM)} m</small></article>
  </section>

  <article class="checkin-report-card">
    <header class="checkin-report-head">
      <div><p class="eyebrow">ANÁLISE POR DISCIPLINA</p><h2>Desempenho e Desvios por Disciplina</h2><p>Comparativo de tarefas planejadas, avanço proporcional executado e desvios no período · ${esc(filterText)}</p></div>
    </header>
    ${byDiscipline.length ? `<div class="checkin-activity-table-wrap"><table class="checkin-activity-table checkin-plan-table">
      <thead><tr>
        <th>Disciplina</th>
        <th>Tarefas Planejadas</th>
        <th>Concluídas (100%+)</th>
        <th>Parciais</th>
        <th>Não inic. / Susp.</th>
        <th>Tarefas c/ Desvio</th>
        <th>Avanço Físico (Tarefas)</th>
        <th>Qtd Prev. / Exec.</th>
        <th>Saldo (Desvio Qtd)</th>
        <th>Principais Motivos de Desvio</th>
      </tr></thead>
      <tbody>
        ${byDiscipline.map(d => `<tr>
          <td><strong>${esc(d.discipline)}</strong></td>
          <td><strong>${d.total}</strong>${d.extraCount ? `<small style="color:#6d28d9;font-weight:700;">+${d.extraCount} extra(s)</small>` : ''}</td>
          <td style="color:#15803d;font-weight:700">${d.completed}</td>
          <td style="color:#b45309;font-weight:700">${d.partial}</td>
          <td style="color:#64748b;font-weight:700">${d.notStarted}</td>
          <td style="color:${d.deviations ? '#b91c1c' : '#15803d'};font-weight:800">${d.deviations}</td>
          <td style="color:${d.adherencePct >= 100 ? '#15803d' : '#0f172a'};font-weight:800"><strong>${checkinNumber(d.executedTasks, 2)} (${d.adherencePct}%)</strong></td>
          <td>${checkinNumber(d.plannedM)} / ${checkinNumber(d.executedM)}</td>
          <td style="color:${d.diffM < 0 ? '#b91c1c' : '#15803d'};font-weight:700">${d.diffM > 0 ? '+' : ''}${checkinNumber(d.diffM)}</td>
          <td><small>${esc(d.topProblemStr)}</small></td>
        </tr>`).join('')}
      </tbody>
    </table></div>` : `<div class="checkin-empty"><p>Nenhuma tarefa encontrada para este filtro.</p></div>`}
  </article>

  <article class="checkin-report-card">
    <header class="checkin-report-head">
      <div>
        <p class="eyebrow">${checkinCurveBreakdownMode === 'task' ? 'CONSOLIDADO POR TAREFA NO PERÍODO' : 'ANÁLISE POR ÁREA E LOCAL'}</p>
        <h2>${checkinCurveBreakdownMode === 'task'
    ? `Total Programado, Executado e Falta por Tarefa (${byTaskConsolidated.length})`
    : `Programado, Executado e Saldo (Falta) por Área / Local (${byAreaLocation.length})`}</h2>
        <p>${checkinCurveBreakdownMode === 'task'
    ? 'Cada tarefa importada da planilha ou criada no sistema, consolidando os dias do período (CAG, Sala Elétrica, Corredores, etc.).'
    : 'Veja exatamente o que falta em cada CAG, Sala Elétrica, Corredor ou Data Hall. Clique em uma área ou local para filtrar a Curva S.'}</p>
      </div>
      <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
        <label style="display:flex;align-items:center;gap:5px;font-size:11.5px;font-weight:700;cursor:pointer;color:#b91c1c;">
          <input type="checkbox" ${checkinCurvePendingOnly ? 'checked' : ''} onchange="checkinSetCurveFilter('pendingOnly', this.checked)">
          Apenas com saldo faltando (&gt; 0)
        </label>
        <button type="button" class="button compact ${checkinCurveBreakdownMode === 'task' ? 'button-dark' : 'button-outline'}" onclick="checkinSetCurveFilter('breakdownMode', 'task')">Por Tarefa (${visibleByTask.length})</button>
        <button type="button" class="button compact ${checkinCurveBreakdownMode === 'area' ? 'button-dark' : 'button-outline'}" onclick="checkinSetCurveFilter('breakdownMode', 'area')">Por Área / Local (${visibleByAreaLocation.length})</button>
        ${(checkinCurveArea || checkinCurveLocationSearch) ? `<button type="button" class="button button-outline compact" onclick="checkinClearCurveAreaLocation()">Limpar filtro</button>` : ''}
      </div>
    </header>
    ${checkinCurveBreakdownMode === 'task'
    ? (visibleByTask.length ? `<div class="checkin-activity-table-wrap"><table class="checkin-activity-table checkin-plan-table">
        <thead><tr>
          <th>Área / Local</th>
          <th>Tarefa (Planilha / Sistema)</th>
          <th>Disciplina / Eng.</th>
          <th>Programação por dia</th>
          <th>Total Previsto</th>
          <th>Total Executado</th>
          <th>Falta (Saldo)</th>
          <th>% Avanço</th>
          <th>Ação</th>
        </tr></thead>
        <tbody>
          ${visibleByTask.map(t => {
      const isOver = t.excessM > 0 && t.plannedM > 0;
      const barClass = isOver ? 'is-warn' : t.pct >= 100 ? '' : t.pct >= 50 ? 'is-warn' : 'is-low';
      const isAreaActive = checkinCurveArea === t.area;
      const subSum = checkinSubItemsSummary(t.subItems);
      const dayChips = t.sortedDays.map(d => {
        const shortDate = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' }).format(new Date(`${d.date}T12:00:00`));
        const isCarryChip = d.carryOnly && d.planned === 0 && d.executed === 0;
        const chipClass = isCarryChip ? '' : d.planned > 0 && d.executed > d.planned ? 'is-over' : d.planned > 0 && d.executed >= d.planned ? 'is-done' : d.executed > 0 ? 'is-partial' : '';
        const label = isCarryChip ? `${shortDate}: saldo` : `${shortDate}: ${checkinNumber(d.executed)}/${checkinNumber(d.planned)} ${esc(t.unit)}`;
        return `<button type="button" class="checkin-day-chip ${chipClass}" onclick="checkinJumpToDay('${esc(d.date)}','${esc(t.dh)}','${esc(t.area)}')" title="Clique para abrir ${checkinFormatDate(d.date)} no Diário e conferir/corrigir">${label}</button>`;
      }).join('');
      return `<tr>
              <td>
                <button type="button" class="checkin-area-row-btn ${isAreaActive ? 'is-active' : ''}" onclick="checkinSetCurveFilter('area', '${esc(isAreaActive ? '' : t.area)}')">${esc(t.area)}${t.area !== t.dh ? ` <small style="color:#64748b;font-weight:600;">(${esc(t.dh)})</small>` : ''}</button>
                <small style="display:block;margin-top:3px;font-weight:700;color:#334155;">${esc(t.location)}</small>
              </td>
              <td>
                ${t.isExtra ? `<span class="checkin-extra-pill">➕ Extra</span>` : ''}
                <strong>${esc(t.activityText || '—')}</strong>
                <small>${esc([t.pstItem ? `Item ${t.pstItem}` : '', t.scheduleId].filter(Boolean).join(' · ') || 'Criada no sistema')}</small>
                ${subSum ? `<small style="display:block;margin-top:3px;color:#0369a1;font-weight:700;">🔧 ${subSum.done}/${subSum.total}${subSum.pendingLabels.length ? ` · Falta: ${esc(subSum.pendingLabels.join(', '))}` : ' · Concluídas'}</small>` : ''}
              </td>
              <td><span class="checkin-discipline-tag">${esc(t.discipline)}</span><small>${esc(t.engineersLabel || '—')}</small></td>
              <td style="min-width:190px;">
                <small style="font-weight:700;color:#334155;">${t.daysCount} dia(s)</small>
                <div class="checkin-day-chips">${dayChips}</div>
              </td>
              <td><strong>${checkinNumber(t.plannedM)} ${esc(t.unit)}</strong></td>
              <td style="color:${isOver ? '#b45309' : '#15803d'};font-weight:800;">${checkinNumber(t.executedM)} ${esc(t.unit)}</td>
              <td style="color:${isOver ? '#b91c1c' : t.remainingM > 0 ? '#b91c1c' : '#15803d'};font-weight:800;">${isOver ? `⚠️ Excedeu +${checkinNumber(t.excessM)} ${esc(t.unit)}` : t.remainingM > 0 ? `${checkinNumber(t.remainingM)} ${esc(t.unit)}` : `0 ${esc(t.unit)}`}</td>
              <td style="min-width:115px;">
                <strong style="color:${isOver ? '#b91c1c' : 'inherit'}">${t.pct}%</strong>
                <div class="checkin-mini-bar" style="margin-top:4px;"><div class="checkin-mini-bar-fill ${barClass}" style="width:${Math.min(100, Math.max(0, t.pct))}%"></div></div>
              </td>
              <td><button type="button" class="button button-outline compact" onclick="checkinOpenTaskEditor('${esc(t.key)}','${esc(checkinCurveStart)}','${esc(checkinCurveEnd)}')">✏️ Editar</button></td>
            </tr>`;
    }).join('')}
        </tbody>
      </table></div>` : `<div class="checkin-empty"><p>Nenhuma tarefa encontrada para este filtro.</p></div>`)
    : (visibleByAreaLocation.length ? `<div class="checkin-activity-table-wrap"><table class="checkin-activity-table checkin-plan-table">
        <thead><tr>
          <th>Área / DH</th>
          <th>Local / Sala</th>
          <th>Disciplina(s)</th>
          <th>Tarefas (Plan. / Concl.)</th>
          <th>Previsto</th>
          <th>Executado</th>
          <th>Falta (Saldo)</th>
          <th>% Avanço</th>
        </tr></thead>
        <tbody>
          ${visibleByAreaLocation.map(loc => {
      const barClass = loc.pct >= 100 ? '' : loc.pct >= 50 ? 'is-warn' : 'is-low';
      const isAreaActive = checkinCurveArea === loc.area;
      const isLocActive = checkinNormalizeSearchText(checkinCurveLocationSearch) === checkinNormalizeSearchText(loc.location) && Boolean(checkinCurveLocationSearch);
      return `<tr>
              <td><button type="button" class="checkin-area-row-btn ${isAreaActive ? 'is-active' : ''}" onclick="checkinSetCurveFilter('area', '${esc(isAreaActive ? '' : loc.area)}')">${esc(loc.area)}${loc.area !== loc.dh ? ` <small style="color:#64748b;font-weight:600;">(${esc(loc.dh)})</small>` : ''}</button></td>
              <td><button type="button" class="checkin-area-row-btn ${isLocActive ? 'is-active' : ''}" onclick="checkinSetCurveFilter('locationSearch', '${esc(isLocActive ? '' : loc.location)}')">${esc(loc.location)}</button></td>
              <td><small>${esc(loc.disciplinesLabel)}</small></td>
              <td><strong>${loc.plannedTasks}</strong> <small>(${loc.completed} concl.${loc.partial ? ` · ${loc.partial} parc.` : ''})</small></td>
              <td><strong>${checkinNumber(loc.plannedM)} ${esc(loc.unit)}</strong></td>
              <td style="color:#15803d;font-weight:800;">${checkinNumber(loc.executedM)} ${esc(loc.unit)}</td>
              <td style="color:${loc.remainingM > 0 ? '#b91c1c' : '#15803d'};font-weight:800;">${loc.remainingM > 0 ? `${checkinNumber(loc.remainingM)} ${esc(loc.unit)}` : loc.excessM > 0 ? `0 (+${checkinNumber(loc.excessM)} ${esc(loc.unit)})` : `0 ${esc(loc.unit)}`}</td>
              <td style="min-width:120px;">
                <strong>${loc.pct}%</strong>
                <div class="checkin-mini-bar" style="margin-top:4px;"><div class="checkin-mini-bar-fill ${barClass}" style="width:${Math.min(100, Math.max(0, loc.pct))}%"></div></div>
              </td>
            </tr>`;
    }).join('')}
        </tbody>
      </table></div>` : `<div class="checkin-empty"><p>Nenhum local encontrado para este filtro.</p></div>`)}
  </article>

  <article class="checkin-curve-card"><header><div><p class="eyebrow">ACOMPANHAMENTO FÍSICO</p><h2>Curva S — ${isTasksMetric ? 'Tarefas Planejadas x Avanço Executado (Proporcional)' : 'Quantidade Planejada x Executada'}</h2><p>Acumulado diário (${isTasksMetric ? 'peso 1,0 por tarefa planejada · avanço proporcional ao volume executado' : 'em quantidade/metros'}) · ${checkinFormatDate(checkinCurveStart)} a ${checkinFormatDate(checkinCurveEnd)}</p></div><div class="checkin-curve-legend"><span class="planned">${isTasksMetric ? `Tarefas planejadas (${checkinNumber(points.at(-1)?.planned || 0, 2)})` : `Planejado (${checkinNumber(points.at(-1)?.planned || 0, 1)})`}</span><span class="executed">${isTasksMetric ? `Avanço executado (${checkinNumber(points.at(-1)?.executed || 0, 2)})` : `Executado (${checkinNumber(points.at(-1)?.executed || 0, 1)})`}</span></div></header>
    ${points.length ? `<div class="checkin-chart-scroll"><svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Curva S acumulada">
      ${ticks.map(value => `<g><line x1="${left}" y1="${y(value)}" x2="${width - right}" y2="${y(value)}"/><text x="${left - 8}" y="${y(value) + 4}" text-anchor="end">${checkinNumber(value, tickDigits)}</text></g>`).join('')}
      <path class="curve-planned" d="${pathFor('planned')}"/><path class="curve-executed" d="${pathFor('executed')}"/>
      ${points.map((point, index) => `<g><circle class="point-planned" cx="${x(index)}" cy="${y(point.planned)}" r="3"><title>${checkinFormatDate(point.date)} — Planejado: ${checkinNumber(point.planned, 2)}</title></circle><circle class="point-executed" cx="${x(index)}" cy="${y(point.executed)}" r="3"><title>${checkinFormatDate(point.date)} — Executado: ${checkinNumber(point.executed, 2)}</title></circle>${dateLabelIndices.has(index) ? `<text class="curve-date" x="${x(index)}" y="${height - 16}" text-anchor="middle">${new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' }).format(new Date(`${point.date}T12:00:00`))}</text>` : ''}</g>`).join('')}
    </svg></div>` : `<div class="checkin-empty"><h2>Selecione um intervalo válido</h2></div>`}
    ${matchedActivities.length ? '' : `<p class="checkin-curve-empty">Ainda não há planejamento ou executado no recorte escolhido.</p>`}
  </article>

  <article class="checkin-report-card">
    <header class="checkin-report-head">
      <div><p class="eyebrow">DETALHAMENTO POR TAREFA E DISCIPLINA</p><h2>Análise de Desvios por Tarefa (${taskRows.length})</h2><p>Visualize cada atividade, a diferença entre previsto e executado, status e causa do desvio.</p></div>
      <label style="display:flex;align-items:center;gap:6px;font-size:12px;font-weight:700;cursor:pointer;">
        <input type="checkbox" ${checkinCurveDeviationOnly ? 'checked' : ''} onchange="checkinSetCurveFilter('deviationOnly', this.checked)">
        Mostrar apenas tarefas com desvio
      </label>
    </header>
    ${taskRows.length ? `<div class="checkin-activity-table-wrap"><table class="checkin-activity-table checkin-plan-table">
      <thead><tr>
        <th>Data / DH</th>
        <th>Disciplina / Turno</th>
        <th>Engenheiro / Empresa</th>
        <th>Item / Local / Tarefa</th>
        <th>Previsto</th>
        <th>Executado</th>
        <th>Desvio (Saldo)</th>
        <th>% (Peso Tarefa)</th>
        <th>Status</th>
        <th>Cód. Problema / Imprevisto</th>
        <th>Observações</th>
      </tr></thead>
      <tbody>
        ${taskRows.map(({ report, activity, discipline, shift, company, isExtra, isCarryover, executedTask, plannedM, executedM, diffM, isDeviation }) => {
    const pct = plannedM > 0 ? `${checkinNumber(executedM / plannedM * 100, 0)}%` : executedM > 0 ? '100%' : '0%';
    const probLabel = activity.problemCode ? checkinProblemLabel(activity.problemCode, activity.problemOther) : '—';
    const currentStatus = checkinResolveMigratedStatus(activity, activity.checkinAt, activity.checkoutAt);
    return `<tr style="${isDeviation ? 'background:#fff5f5;' : ''}">
            <td><strong>${checkinFormatDate(report.workDate)}</strong><small>${esc(report.dh)}</small></td>
            <td><span class="checkin-discipline-tag">${esc(discipline)}</span><small>${shift === 'Noturno' ? '🌙 Noturno' : '☀️ Diurno'}</small></td>
            <td><strong>${esc(report.engineer)}</strong><small>${esc(company || '—')}</small></td>
            <td>${isExtra ? `<span class="checkin-extra-pill">➕ Extra (não programada)</span>` : ''}${isCarryover ? `<span class="checkin-carryover-pill">↩️ Saldo de ${esc(checkinFormatDate(activity.carryoverFromDate))}</span>` : ''}<strong>${esc(activity.location || '—')}</strong><small>${esc([activity.pstItem, activity.scheduleId, activity.activity].filter(Boolean).join(' · '))}</small></td>
            <td>${checkinNumber(plannedM)} ${esc(activity.unit || 'm')}${isExtra ? '<small style="color:#6d28d9;font-weight:700;">Estimado (Extra)</small>' : isCarryover ? '<small style="color:#b45309;font-weight:700;">Saldo reprogramado</small>' : ''}</td>
            <td><strong>${checkinNumber(executedM)} ${esc(activity.unit || 'm')}</strong></td>
            <td style="color:${diffM < 0 ? '#b91c1c' : '#15803d'};font-weight:800">${diffM > 0 ? '+' : ''}${checkinNumber(diffM)} ${esc(activity.unit || 'm')}</td>
            <td><strong>${pct}</strong><small>${checkinNumber(executedTask, 2)} tarefa</small></td>
            <td><span class="checkin-status-pill ${currentStatus === 'Concluído' ? 'closed' : currentStatus === 'Iniciado' ? 'running' : 'pending'}">${esc(currentStatus)}</span></td>
            <td style="color:${activity.problemCode ? '#b91c1c' : 'inherit'};font-weight:${activity.problemCode ? '700' : '400'}">${esc(probLabel)}</td>
            <td><small>${esc(activity.notes || '—')}</small></td>
          </tr>`;
  }).join('')}
      </tbody>
    </table></div>` : `<div class="checkin-empty"><p>Nenhuma tarefa com desvio no recorte selecionado.</p></div>`}
  </article>`;
}

function checkinRenderCurve(engineers, dataHalls, disciplines, companies) {
  const isTasksMetric = checkinCurveMetric === 'tasks';
  const areas = checkinAllAreas();
  return `<section class="checkin-filter-panel checkin-curve-filters">
    <label><span>Data inicial</span><input type="date" data-checkin-curve-start value="${checkinCurveStart}" oninput="checkinSetCurveRange('start',this.value)" onchange="checkinSetCurveRange('start',this.value)"></label>
    <label><span>Data final</span><input type="date" data-checkin-curve-end value="${checkinCurveEnd}" oninput="checkinSetCurveRange('end',this.value)" onchange="checkinSetCurveRange('end',this.value)"></label>
    <label><span>Turno</span><select onchange="checkinSetCurveFilter('shift',this.value)">${checkinShiftSelectOptions(checkinCurveShift, 'Todos')}</select></label>
    <label><span>Disciplina</span><select onchange="checkinSetCurveFilter('discipline',this.value)">${checkinSelectOptions(disciplines, checkinCurveDiscipline, 'Todas')}</select></label>
    <label><span>Empresa</span><select onchange="checkinSetCurveFilter('company',this.value)">${checkinSelectOptions(companies, checkinCurveCompany, 'Todas')}</select></label>
    <label><span>Engenheiro</span><select onchange="checkinSetCurveFilter('engineer',this.value)">${checkinSelectOptions(engineers, checkinCurveEngineer, 'Todos')}</select></label>
    <label><span>Data Hall</span><select onchange="checkinSetCurveFilter('dh',this.value)">${checkinSelectOptions(dataHalls, checkinCurveDh, 'Todos')}</select></label>
    <label><span>Área / CAG</span><select data-checkin-curve-area onchange="checkinSetCurveFilter('area',this.value)">${checkinSelectOptions(areas, checkinCurveArea, 'Todas')}</select></label>
    <label><span>Buscar local / tarefa</span><input type="search" data-checkin-curve-loc-search value="${esc(checkinCurveLocationSearch)}" placeholder="Ex.: CAG 4, Sala Elétrica, tubulação..." oninput="checkinSetCurveFilter('locationSearch',this.value)"></label>
    <label><span>Dia da semana</span><select onchange="checkinSetCurveFilter('weekday',this.value)"><option value="">Todos</option>${CHECKIN_WEEKDAYS.map((day, index) => `<option value="${index}" ${checkinCurveWeekday === String(index) ? 'selected' : ''}>${day}</option>`).join('')}</select></label>
    <label><span>Unidade do gráfico</span><select onchange="checkinSetCurveFilter('metric',this.value)">
      <option value="tasks" ${isTasksMetric ? 'selected' : ''}>Por tarefas (Avanço proporcional x Planejadas)</option>
      <option value="meters" ${!isTasksMetric ? 'selected' : ''}>Por quantidade / metros</option>
    </select></label>
    <button class="button button-dark" onclick="checkinOpenReportPDF('curve')">${icon('print')} Extrair Relatório PDF</button>
  </section>
  <div id="checkinCurveResults">
    ${checkinRenderCurveResults()}
  </div>`;
}

function checkinClearCurveAreaLocation() {
  checkinCurveArea = '';
  checkinCurveLocationSearch = '';
  const areaSelect = document.querySelector('[data-checkin-curve-area]');
  if (areaSelect) areaSelect.value = '';
  const locInput = document.querySelector('[data-checkin-curve-loc-search]');
  if (locInput) locInput.value = '';
  const resultsEl = document.getElementById('checkinCurveResults');
  if (resultsEl && checkinActiveTab === 'curva') {
    resultsEl.innerHTML = checkinRenderCurveResults();
    if (typeof hydrateIcons === 'function') hydrateIcons();
    return;
  }
  renderCheckIn();
}

function checkinSetCurveRange(which, value) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(String(value).trim())) return;
  if (which === 'start') checkinCurveStart = String(value).trim();
  else checkinCurveEnd = String(value).trim();
  const resultsEl = document.getElementById('checkinCurveResults');
  if (resultsEl && checkinActiveTab === 'curva') {
    resultsEl.innerHTML = checkinRenderCurveResults();
    if (typeof hydrateIcons === 'function') hydrateIcons();
    return;
  }
  renderCheckIn();
}

function checkinSetCurveFilter(which, value) {
  checkinSyncFiltersFromDom();
  if (which === 'engineer') checkinCurveEngineer = value;
  else if (which === 'discipline') checkinCurveDiscipline = value;
  else if (which === 'shift') checkinCurveShift = value;
  else if (which === 'company') checkinCurveCompany = value;
  else if (which === 'area') checkinCurveArea = value;
  else if (which === 'locationSearch') checkinCurveLocationSearch = value;
  else if (which === 'weekday') checkinCurveWeekday = value;
  else if (which === 'metric') checkinCurveMetric = value;
  else if (which === 'breakdownMode') checkinCurveBreakdownMode = value === 'area' ? 'area' : 'task';
  else if (which === 'pendingOnly') checkinCurvePendingOnly = Boolean(value);
  else if (which === 'deviationOnly') checkinCurveDeviationOnly = Boolean(value);
  else checkinCurveDh = value;
  const resultsEl = document.getElementById('checkinCurveResults');
  if (resultsEl && checkinActiveTab === 'curva') {
    resultsEl.innerHTML = checkinRenderCurveResults();
    if (which === 'area') {
      const areaSelect = document.querySelector('[data-checkin-curve-area]');
      if (areaSelect) areaSelect.value = checkinCurveArea;
    }
    if (which === 'locationSearch') {
      const locInput = document.querySelector('[data-checkin-curve-loc-search]');
      if (locInput && locInput.value !== checkinCurveLocationSearch) locInput.value = checkinCurveLocationSearch;
    }
    if (typeof hydrateIcons === 'function') hydrateIcons();
    return;
  }
  renderCheckIn();
}

function checkinOpenReportPDF(initialScope = '') {
  checkinSyncFiltersFromDom();
  const scope = initialScope || (checkinActiveTab === 'curva' ? 'curve' : 'daily');
  const isDaily = scope === 'daily';

  const startDate = isDaily ? checkinSelectedDate : checkinCurveStart;
  const endDate = isDaily ? checkinSelectedDate : checkinCurveEnd;
  const filterDh = isDaily ? checkinDhFilter : checkinCurveDh;
  const filterArea = isDaily ? checkinAreaFilter : checkinCurveArea;
  const filterLocationNorm = isDaily ? '' : checkinNormalizeSearchText(checkinCurveLocationSearch);
  const filterDisc = isDaily ? checkinDisciplineFilter : checkinCurveDiscipline;
  const filterShift = isDaily ? checkinShiftFilter : checkinCurveShift;
  const filterCompany = isDaily ? checkinCompanyFilter : checkinCurveCompany;
  const filterEng = isDaily ? checkinEngineerFilter : checkinCurveEngineer;
  const filterWeekday = isDaily ? '' : checkinCurveWeekday;
  const isTasksMetric = checkinCurveMetric === 'tasks';

  // Captura rascunhos visíveis na tela se estiver no diário
  document.querySelectorAll('[data-report-card]').forEach(card => {
    const repId = card.dataset.reportCard;
    const captured = checkinCaptureReport(repId);
    if (captured) {
      const idx = checkinReports.findIndex(r => r.id === repId);
      if (idx >= 0) checkinReports[idx] = captured;
    }
  });

  // Dados para a tabela e indicadores do escopo selecionado
  const scopeReports = checkinReports.filter(report =>
    report.workDate >= startDate && report.workDate <= endDate
    && (!filterEng || report.engineer === filterEng)
    && (!filterDh || report.dh === filterDh)
    && (!filterWeekday || String(new Date(`${report.workDate}T12:00:00`).getDay()) === filterWeekday)
  );

  const matchedActivities = [];
  scopeReports.forEach(report => {
    (report.activities || []).forEach(activity => {
      const actDiscipline = checkinCurveActivityDiscipline(report, activity) || 'Sem disciplina';
      const actShift = checkinGetActivityShift(report, activity);
      const actCompany = activity.contractor || report.contractor || '';
      if (filterDisc && actDiscipline !== filterDisc) return;
      if (filterShift && actShift !== filterShift) return;
      if (filterCompany && actCompany !== filterCompany) return;
      const actArea = checkinExtractAreaLabel(report, activity);
      const actLocation = checkinExtractLocationLabel(report, activity);
      if (filterArea && actArea !== filterArea) return;
      if (filterLocationNorm && !checkinNormalizeSearchText([actArea, report.dh, actLocation, activity.activity].filter(Boolean).join(' ')).includes(filterLocationNorm)) return;

      const plannedM = checkinParseNumber(activity.plannedMeters);
      const origPlannedM = checkinActivityOriginalPlannedMeters(activity);
      const executedM = checkinParseNumber(activity.executedMeters);
      const isCompleted = checkinIsActivityCompleted(activity);
      const isDeviation = checkinIsActivityDeviation(activity);
      const { isExtra, plannedTask, executedTask, progressPct } = checkinActivityTaskProgress(activity);

      matchedActivities.push({
        report,
        activity,
        discipline: actDiscipline,
        shift: actShift,
        company: actCompany,
        isExtra,
        plannedTask,
        executedTask,
        progressPct,
        plannedM,
        origPlannedM,
        executedM,
        diffM: executedM - (isExtra ? 0 : origPlannedM),
        isCompleted,
        isDeviation
      });
    });
  });

  // Dados acumulados para o gráfico da Curva S (no modo diário, mostra últimos 14 dias até a data do diário para ter curva evolutiva)
  const chartStart = isDaily ? checkinDateOffset(checkinSelectedDate, -13) : checkinCurveStart;
  const chartEnd = isDaily ? checkinSelectedDate : checkinCurveEnd;
  const chartReports = checkinReports.filter(report =>
    report.workDate >= chartStart && report.workDate <= chartEnd
    && (!filterEng || report.engineer === filterEng)
    && (!filterDh || report.dh === filterDh)
    && (!filterWeekday || String(new Date(`${report.workDate}T12:00:00`).getDay()) === filterWeekday)
  );

  const byDate = new Map();
  chartReports.forEach(report => {
    const row = byDate.get(report.workDate) || { plannedTasks: 0, completedTasks: 0, plannedMeters: 0, executedMeters: 0 };
    (report.activities || []).forEach(activity => {
      const actDiscipline = checkinCurveActivityDiscipline(report, activity) || 'Sem disciplina';
      const actShift = checkinGetActivityShift(report, activity);
      const actCompany = activity.contractor || report.contractor || '';
      if (filterDisc && actDiscipline !== filterDisc) return;
      if (filterShift && actShift !== filterShift) return;
      if (filterCompany && actCompany !== filterCompany) return;
      const actArea = checkinExtractAreaLabel(report, activity);
      const actLocation = checkinExtractLocationLabel(report, activity);
      if (filterArea && actArea !== filterArea) return;
      if (filterLocationNorm && !checkinNormalizeSearchText([actArea, report.dh, actLocation, activity.activity].filter(Boolean).join(' ')).includes(filterLocationNorm)) return;
      const { isExtra, plannedTask, executedTask } = checkinActivityTaskProgress(activity);
      row.plannedTasks += plannedTask;
      row.completedTasks += executedTask;
      row.plannedMeters += isExtra ? 0 : checkinActivityOriginalPlannedMeters(activity);
      row.executedMeters += checkinParseNumber(activity.executedMeters);
    });
    byDate.set(report.workDate, row);
  });

  const dates = [];
  if (chartStart && chartEnd && chartEnd >= chartStart) {
    for (let d = chartStart; d <= chartEnd; d = checkinDateOffset(d, 1)) dates.push(d);
  }
  let cumPlanned = 0;
  let cumExecuted = 0;
  const points = dates.map(date => {
    const daily = byDate.get(date) || { plannedTasks: 0, completedTasks: 0, plannedMeters: 0, executedMeters: 0 };
    cumPlanned += isTasksMetric ? daily.plannedTasks : daily.plannedMeters;
    cumExecuted += isTasksMetric ? daily.completedTasks : daily.executedMeters;
    return { date, planned: cumPlanned, executed: cumExecuted };
  });

  const maxValue = Math.max(1, ...points.map(p => Math.max(p.planned, p.executed)));
  const tickDigits = isTasksMetric && maxValue < 10 ? 1 : 0;
  const width = 880, height = 230, left = 48, right = 20, top = 18, bottom = 38;
  const chartWidth = width - left - right, chartHeight = height - top - bottom;
  const x = index => left + (points.length <= 1 ? chartWidth / 2 : index * chartWidth / (points.length - 1));
  const y = value => top + chartHeight - value / maxValue * chartHeight;
  const dateLabelCount = Math.min(10, points.length);
  const dateLabelIndices = new Set(Array.from({ length: dateLabelCount }, (_, index) =>
    dateLabelCount <= 1 ? 0 : Math.round(index * (points.length - 1) / (dateLabelCount - 1))
  ));
  const pathFor = key => points.map((p, index) => `${index ? 'L' : 'M'}${x(index).toFixed(1)},${y(p[key]).toFixed(1)}`).join(' ');
  const ticks = [0, maxValue / 2, maxValue];

  // KPIs
  const totalPlannedTasks = matchedActivities.reduce((s, item) => s + item.plannedTask, 0);
  const totalExtraTasks = matchedActivities.filter(item => item.isExtra).length;
  const totalExecutedTasks = matchedActivities.reduce((s, item) => s + item.executedTask, 0);
  const totalCompletedTasks = matchedActivities.filter(item => item.isCompleted).length;
  const totalPartialTasks = matchedActivities.filter(item => checkinActivityBucket(item.activity) === 'partial').length;
  const totalDeviationTasks = matchedActivities.filter(item => item.isDeviation).length;
  const totalPlannedM = matchedActivities.reduce((s, item) => s + (item.isExtra ? 0 : item.origPlannedM), 0);
  const totalExecutedM = matchedActivities.reduce((s, item) => s + item.executedM, 0);
  const totalCrew = matchedActivities.reduce((s, item) => s + (Number(item.activity.actualCrew) || 0), 0);
  const totalPta = matchedActivities.reduce((s, item) => s + (Number(item.activity.ptaCount) || 0), 0);
  const totalForklift = matchedActivities.reduce((s, item) => s + (Number(item.activity.forkliftCount) || 0), 0);
  const adherencePct = totalPlannedTasks > 0 ? Math.round((totalExecutedTasks / totalPlannedTasks) * 100) : (totalExecutedTasks > 0 ? 100 : 0);

  // Resumo por disciplina
  const discOrder = checkinUniqueOptions([...CHECKIN_DISCIPLINES, ...matchedActivities.map(m => m.discipline)]);
  const byDiscipline = discOrder.map(disc => {
    const items = matchedActivities.filter(m => m.discipline === disc);
    if (!items.length) return null;
    const plannedTasks = items.reduce((s, m) => s + m.plannedTask, 0);
    const extraCount = items.filter(m => m.isExtra).length;
    const executedTasks = items.reduce((s, m) => s + m.executedTask, 0);
    const completed = items.filter(m => checkinActivityBucket(m.activity) === 'completed').length;
    const partial = items.filter(m => checkinActivityBucket(m.activity) === 'partial').length;
    const notStarted = items.filter(m => checkinActivityBucket(m.activity) === 'notStarted').length;
    const deviations = items.filter(m => m.isDeviation).length;
    const plannedM = items.reduce((s, m) => s + (m.isExtra ? 0 : m.origPlannedM), 0);
    const executedM = items.reduce((s, m) => s + m.executedM, 0);
    const crew = items.reduce((s, m) => s + (Number(m.activity.actualCrew) || 0), 0);
    const topProblems = new Map();
    items.forEach(m => {
      if (!m.activity.problemCode) return;
      const label = checkinProblemLabel(m.activity.problemCode, m.activity.problemOther);
      topProblems.set(label, (topProblems.get(label) || 0) + 1);
    });
    const topProblemStr = [...topProblems.entries()].sort((a, b) => b[1] - a[1]).slice(0, 2).map(([k, v]) => `${k} (${v})`).join(', ') || '—';
    return {
      discipline: disc,
      total: plannedTasks,
      extraCount,
      executedTasks,
      completed,
      partial,
      notStarted,
      deviations,
      adherencePct: plannedTasks > 0 ? Math.round((executedTasks / plannedTasks) * 100) : (executedTasks > 0 ? 100 : 0),
      plannedM,
      executedM,
      diffM: executedM - plannedM,
      crew,
      topProblemStr
    };
  }).filter(Boolean);

  const sortedTasks = [...matchedActivities].sort((a, b) =>
    a.report.workDate.localeCompare(b.report.workDate)
    || a.report.dh.localeCompare(b.report.dh)
    || a.discipline.localeCompare(b.discipline)
    || a.report.engineer.localeCompare(b.report.engineer, 'pt-BR')
  );

  const nowFormatted = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date());
  const reportTitle = isDaily
    ? `RELATÓRIO DE FECHAMENTO DIÁRIO E CURVA S — ${checkinFormatDate(checkinSelectedDate)}`
    : `RELATÓRIO CONSOLIDADO DE PRODUÇÃO, DESVIOS E CURVA S`;
  const filterSummary = [
    isDaily ? `Data: ${checkinFormatDate(checkinSelectedDate)}` : `Período: ${checkinFormatDate(startDate)} a ${checkinFormatDate(endDate)}`,
    filterDh || 'Todos os DHs',
    filterShift ? `Turno ${filterShift}` : 'Todos os turnos',
    filterDisc || 'Todas as disciplinas',
    filterCompany || 'Todas as empresas',
    filterEng || 'Todos os engenheiros'
  ].join(' · ');

  const pdfFileName = isDaily
    ? `Relatorio-Checkin-Checkout-${startDate}`
    : `Relatorio-CurvaS-Checkin-${startDate}-a-${endDate}`;

  const content = `
    <div class="no-print" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; margin-bottom:16px; padding:10px 14px; background:#f8fafc; border:1.5px solid #cbd5e1; border-radius:8px;">
      <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
        <span style="font-size:12px; font-weight:800; color:#334155;">MODELO DO RELATÓRIO:</span>
        <button type="button" class="button compact ${isDaily ? 'button-dark' : 'button-outline'}" onclick="checkinOpenReportPDF('daily')" style="font-size:11px; font-weight:800;">
          📅 Fechamento do Dia (${checkinFormatDate(checkinSelectedDate)})
        </button>
        <button type="button" class="button compact ${!isDaily ? 'button-dark' : 'button-outline'}" onclick="checkinOpenReportPDF('curve')" style="font-size:11px; font-weight:800;">
          📈 Período da Curva S (${checkinFormatDate(checkinCurveStart)} a ${checkinFormatDate(checkinCurveEnd)})
        </button>
      </div>
      <div style="font-size:11px; color:#64748b; font-weight:600;">
        💡 Clique em <strong>Imprimir / Salvar em PDF</strong> para baixar o relatório timbrado.
      </div>
    </div>

    <article class="checkin-pdf-document">
      <header class="checkin-pdf-head">
        <div class="checkin-pdf-logos">
          <img src="assets/heating-cooling-logo.jpg" alt="Heating Cooling">
          <div class="checkin-pdf-logo-sep"></div>
          <img src="assets/afonso-franca-logo.png" alt="Afonso França Engenharia">
        </div>
        <div class="checkin-pdf-title-wrap">
          <small>HEATING COOLING TECNOLOGIA &amp; AFONSO FRANÇA ENGENHARIA</small>
          <h1>${esc(reportTitle)}</h1>
          <p>${esc(filterSummary)}</p>
        </div>
        <aside class="checkin-pdf-meta">
          <strong>DATA CENTER OMNIA</strong>
          <span>Check-in / Check-out HVAC</span>
          <span>Emissão: ${esc(nowFormatted)}</span>
        </aside>
      </header>

      <!-- KPIS -->
      <div class="checkin-pdf-summary">
        <div class="checkin-pdf-kpi">
          <b>${totalPlannedTasks}${totalExtraTasks ? ` <small class="checkin-pdf-extra-tag">(+${totalExtraTasks} extra)</small>` : ''}</b>
          <small>Tarefas Planejadas</small>
        </div>
        <div class="checkin-pdf-kpi is-green">
          <b>${checkinNumber(totalExecutedTasks, 2)} (${adherencePct}%)</b>
          <small>Avanço Tarefas (${totalCompletedTasks} concl. · ${totalPartialTasks} parc.)</small>
        </div>
        <div class="checkin-pdf-kpi is-red">
          <b>${totalDeviationTasks}</b>
          <small>Tarefas c/ Desvio</small>
        </div>
        <div class="checkin-pdf-kpi is-blue">
          <b>${checkinNumber(totalPlannedM)} / ${checkinNumber(totalExecutedM)}</b>
          <small>Volume Prev. / Exec.</small>
        </div>
        <div class="checkin-pdf-kpi">
          <b>${totalCrew} pessoas</b>
          <small>Efetivo Apontado</small>
        </div>
        <div class="checkin-pdf-kpi">
          <b>${totalPta} PTA · ${totalForklift} Emp.</b>
          <small>Equipamentos</small>
        </div>
      </div>

      <!-- GRÁFICO CURVA S -->
      <section class="checkin-pdf-section checkin-pdf-chart-section">
        <div class="checkin-pdf-chart-head">
          <h2 class="checkin-pdf-h2 is-green">
            Curva S — ${isTasksMetric ? 'Tarefas Planejadas x Avanço Executado (Proporcional)' : 'Volume Planejado x Executado'} (${checkinFormatDate(chartStart)} a ${checkinFormatDate(chartEnd)})
          </h2>
          <div class="checkin-pdf-chart-legend">
            <span style="color:#2777c7;">● Planejado (${checkinNumber(points.at(-1)?.planned || 0, isTasksMetric ? 2 : 1)})</span>
            <span style="color:#24a269;">● Avanço Executado (${checkinNumber(points.at(-1)?.executed || 0, isTasksMetric ? 2 : 1)})</span>
          </div>
        </div>
        <svg class="checkin-pdf-svg" viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid meet">
          ${ticks.map(val => `<g><line x1="${left}" y1="${y(val)}" x2="${width - right}" y2="${y(val)}" stroke="#e2e8f0" stroke-width="1"/><text x="${left - 6}" y="${y(val) + 4}" text-anchor="end" fill="#64748b" font-size="9.5" font-family="Arial">${checkinNumber(val, tickDigits)}</text></g>`).join('')}
          <path d="${pathFor('planned')}" fill="none" stroke="#2777c7" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="${pathFor('executed')}" fill="none" stroke="#24a269" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>
          ${points.map((pt, idx) => `<g>
            <circle cx="${x(idx)}" cy="${y(pt.planned)}" r="2.8" fill="#2777c7"/>
            <circle cx="${x(idx)}" cy="${y(pt.executed)}" r="2.8" fill="#24a269"/>
            ${dateLabelIndices.has(idx) ? `<text x="${x(idx)}" y="${height - 10}" text-anchor="middle" fill="#64748b" font-size="8.5" font-family="Arial">${new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' }).format(new Date(`${pt.date}T12:00:00`))}</text>` : ''}
          </g>`).join('')}
        </svg>
      </section>

      <!-- RESUMO POR DISCIPLINA -->
      <section class="checkin-pdf-section checkin-pdf-disc-section">
        <h2 class="checkin-pdf-h2 is-blue">
          Desempenho e Desvios por Disciplina
        </h2>
        ${byDiscipline.length ? `
          <table class="checkin-pdf-table checkin-pdf-table-disc">
            <colgroup>
              <col style="width:10%;">
              <col style="width:8%;">
              <col style="width:6%;">
              <col style="width:6%;">
              <col style="width:7%;">
              <col style="width:6.5%;">
              <col style="width:9.5%;">
              <col style="width:10%;">
              <col style="width:7.5%;">
              <col style="width:6.5%;">
              <col style="width:23%;">
            </colgroup>
            <thead>
              <tr>
                <th class="col-left">DISCIPLINA</th>
                <th class="col-center">TAREFAS PLAN.</th>
                <th class="col-center">CONCL.</th>
                <th class="col-center">PARC.</th>
                <th class="col-center">NÃO INIC. / SUSP.</th>
                <th class="col-center">C/ DESVIO</th>
                <th class="col-center">AVANÇO (TAREFAS)</th>
                <th class="col-center">QTD PREV. / EXEC.</th>
                <th class="col-center">SALDO QTD</th>
                <th class="col-center">EFETIVO</th>
                <th class="col-left">PRINCIPAIS MOTIVOS DE DESVIO</th>
              </tr>
            </thead>
            <tbody>
              ${byDiscipline.map(d => `
                <tr>
                  <td class="col-left" style="font-weight:800;">${esc(d.discipline)}</td>
                  <td class="col-center" style="font-weight:700;">${d.total}${d.extraCount ? ` (+${d.extraCount})` : ''}</td>
                  <td class="col-center" style="color:#15803d; font-weight:800;">${d.completed}</td>
                  <td class="col-center" style="color:#b45309; font-weight:700;">${d.partial}</td>
                  <td class="col-center" style="color:#64748b;">${d.notStarted}</td>
                  <td class="col-center" style="color:${d.deviations ? '#b91c1c' : '#15803d'}; font-weight:800;">${d.deviations}</td>
                  <td class="col-center" style="font-weight:800; color:${d.adherencePct >= 100 ? '#15803d' : '#0f172a'};">${checkinNumber(d.executedTasks, 2)} (${d.adherencePct}%)</td>
                  <td class="col-center">${checkinNumber(d.plannedM)} / ${checkinNumber(d.executedM)}</td>
                  <td class="col-center" style="font-weight:700; color:${d.diffM < 0 ? '#b91c1c' : '#15803d'};">${d.diffM > 0 ? '+' : ''}${checkinNumber(d.diffM)}</td>
                  <td class="col-center">${d.crew}</td>
                  <td class="col-left">${esc(d.topProblemStr)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        ` : `<p style="font-size:11px; color:#64748b;">Nenhuma atividade registrada neste período.</p>`}
      </section>

      <!-- RELAÇÃO DE TAREFAS E DESVIOS -->
      <section class="checkin-pdf-section checkin-pdf-tasks-section">
        <h2 class="checkin-pdf-h2 is-dark">
          Detalhamento de Atividades, Horários e Desvios (${sortedTasks.length} tarefas)
        </h2>
        ${sortedTasks.length ? `
          <table class="checkin-pdf-table checkin-pdf-table-tasks">
            <colgroup>
              <col style="width:7.5%;">
              <col style="width:8.5%;">
              <col style="width:11%;">
              <col style="width:24%;">
              <col style="width:7.5%;">
              <col style="width:4%;">
              <col style="width:5.5%;">
              <col style="width:5.5%;">
              <col style="width:5%;">
              <col style="width:7.5%;">
              <col style="width:14%;">
            </colgroup>
            <thead>
              <tr>
                <th class="col-center">DATA / DH</th>
                <th class="col-left">DISCIPLINA / TURNO</th>
                <th class="col-left">ENG. / EMPRESA</th>
                <th class="col-left">LOCAL / ATIVIDADE</th>
                <th class="col-center">INÍCIO / FIM</th>
                <th class="col-center">EFET.</th>
                <th class="col-center">PREV.</th>
                <th class="col-center">EXEC.</th>
                <th class="col-center">SALDO</th>
                <th class="col-center">STATUS</th>
                <th class="col-left">DESVIO / OBSERVAÇÕES</th>
              </tr>
            </thead>
            <tbody>
              ${sortedTasks.map(({ report, activity, discipline, shift, company, isExtra, plannedM, executedM, diffM, isDeviation }) => {
    const prob = activity.problemCode ? checkinProblemLabel(activity.problemCode, activity.problemOther) : '';
    const obs = [prob ? `[${prob}]` : '', activity.notes || ''].filter(Boolean).join(' ') || '—';
    const startTimeStr = checkinFormatTime(activity.checkinAt);
    const endTimeStr = checkinFormatTime(activity.checkoutAt);
    const currentStatus = checkinResolveMigratedStatus(activity, activity.checkinAt, activity.checkoutAt);
    return `
                  <tr class="${isDeviation ? 'is-deviation' : ''}">
                    <td class="col-center" style="font-weight:700;">${checkinFormatDate(report.workDate)}<br><small style="color:#475569;">${esc(report.dh)}</small></td>
                    <td class="col-left" style="font-weight:800;">${esc(discipline)}<br><small style="color:${shift === 'Noturno' ? '#1e3a8a' : '#b45309'}; font-weight:700;">${shift === 'Noturno' ? 'Noturno' : 'Diurno'}</small></td>
                    <td class="col-left"><strong>${esc(report.engineer)}</strong><br><small style="color:#475569;">${esc(company || '—')}</small></td>
                    <td class="col-left">${isExtra ? `<span class="checkin-pdf-badge-extra">EXTRA</span> ` : ''}<strong>${esc(activity.location || '—')}</strong><br><span style="color:#334155;">${esc([activity.pstItem, activity.scheduleId, activity.activity].filter(Boolean).join(' · '))}</span></td>
                    <td class="col-center">${esc(startTimeStr)}<br><small style="color:#475569;">→ ${esc(endTimeStr)}</small></td>
                    <td class="col-center">${Number(activity.actualCrew || 0) || '—'}</td>
                    <td class="col-center">${checkinNumber(plannedM)} ${esc(activity.unit || 'm')}</td>
                    <td class="col-center" style="font-weight:800;">${checkinNumber(executedM)} ${esc(activity.unit || 'm')}</td>
                    <td class="col-center" style="font-weight:800; color:${diffM < 0 ? '#b91c1c' : '#15803d'};">${diffM > 0 ? '+' : ''}${checkinNumber(diffM)}</td>
                    <td class="col-center" style="font-weight:700;">${esc(currentStatus)}</td>
                    <td class="col-left" style="color:${prob ? '#b91c1c' : '#334155'}; font-weight:${prob ? '700' : '400'};">${esc(obs)}</td>
                  </tr>
                `;
  }).join('')}
            </tbody>
          </table>
        ` : `<div style="padding:20px; text-align:center; color:#64748b; border:1px dashed #cbd5e1; border-radius:6px;">Nenhuma tarefa encontrada para este filtro.</div>`}
      </section>

      <!-- ASSINATURAS -->
      <div class="checkin-pdf-signatures">
        <div>
          <div class="checkin-pdf-sig-line"></div>
          <strong>HEATING COOLING TECNOLOGIA</strong>
          <span>Engenharia de Campo / Produção HVAC</span>
        </div>
        <div>
          <div class="checkin-pdf-sig-line"></div>
          <strong>COORDENAÇÃO / FISCALIZAÇÃO</strong>
          <span>Acompanhamento e Controle de Planejamento</span>
        </div>
      </div>

      <footer class="checkin-pdf-footer">
        <span>Heating Cooling Tecnologia · Data Center Omnia (DC01) · Check-in &amp; Curva S</span>
        <span>Emitido em ${esc(nowFormatted)}</span>
      </footer>
    </article>
  `;

  modal(`
    <div style="padding:0;">
      <div class="modal-head no-print" style="padding:14px 20px; background:#0f172a; color:#ffffff; display:flex; justify-content:space-between; align-items:center;">
        <div>
          <h3 style="margin:0; font-size:15px; font-weight:900; color:#ffffff;">
            📄 Relatório em PDF · Fechamento Diário, Desvios &amp; Curva S
          </h3>
          <p style="margin:2px 0 0; font-size:11px; color:#94a3b8;">
            Escolha "Fechamento do Dia" ou "Período da Curva S" abaixo e clique em "Imprimir / Salvar em PDF".
          </p>
        </div>
        <div style="display:flex; gap:8px;">
          <button type="button" class="button button-green" onclick="checkinPrintReportPDF('${esc(pdfFileName)}')" style="font-weight:800; font-size:12px; padding:8px 16px;">
            🖨️ Imprimir / Salvar em PDF
          </button>
          <button type="button" class="button button-outline" onclick="closeModal()" style="color:#ffffff; border-color:#475569; font-size:12px; padding:8px 14px;">
            ✕ Fechar
          </button>
        </div>
      </div>
      <div class="modal-body report-preview" style="padding:20px; background:#e2e8f0; max-height:calc(85vh - 70px); overflow:auto;">
        ${content}
      </div>
      <div class="modal-foot no-print" style="padding:12px 20px; background:#ffffff; border-top:1px solid #cbd5e1; display:flex; justify-content:space-between; align-items:center;">
        <span style="font-size:11px; color:#64748b; font-weight:600;">
          Dica: Na janela de impressão, selecione <strong>"Salvar como PDF"</strong> em orientação <strong>Paisagem (Landscape)</strong>.
        </span>
        <div style="display:flex; gap:8px;">
          <button type="button" class="button button-outline" onclick="closeModal()">Fechar</button>
          <button type="button" class="button button-green" onclick="checkinPrintReportPDF('${esc(pdfFileName)}')" style="font-weight:800;">
            🖨️ Imprimir / Salvar em PDF
          </button>
        </div>
      </div>
    </div>
  `, 'modal-paper');

  const backdrop = document.querySelector('.modal-backdrop');
  if (backdrop) {
    backdrop.classList.add('print-area', 'checkin-print-area');
  }
}

function checkinPrintReportPDF(filename = 'Relatorio-Checkin-Checkout') {
  const prevTitle = document.title;
  document.title = filename;
  const restore = () => {
    document.title = prevTitle;
  };
  window.addEventListener('afterprint', restore, { once: true });
  setTimeout(restore, 15000);
  window.print();
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
window.checkinSetPlanShiftFilter = checkinSetPlanShiftFilter;
window.checkinSetPlanSearch = checkinSetPlanSearch;
window.checkinOpenTaskEditor = checkinOpenTaskEditor;
window.checkinOnTaskEditorExecInput = checkinOnTaskEditorExecInput;
window.checkinOnTaskEditorStatusChange = checkinOnTaskEditorStatusChange;
window.checkinUpdateTaskEditorTotals = checkinUpdateTaskEditorTotals;
window.checkinSaveTaskEditor = checkinSaveTaskEditor;
window.checkinGetActivityDiscipline = checkinGetActivityDiscipline;
window.checkinGetActivityShift = checkinGetActivityShift;
window.checkinUpdateContractor = checkinUpdateContractor;
window.checkinUpdateCardTotals = checkinUpdateCardTotals;
window.checkinReportContractorsDisplay = checkinReportContractorsDisplay;
window.checkinLoadTestTasks = checkinLoadTestTasks;
window.checkinSetCurveRange = checkinSetCurveRange;
window.checkinSetCurveFilter = checkinSetCurveFilter;
window.checkinClearCurveAreaLocation = checkinClearCurveAreaLocation;
window.checkinUpdatePercent = checkinUpdatePercent;
window.checkinToggleOther = checkinToggleOther;
window.checkinToggleExtraReason = checkinToggleExtraReason;
window.checkinToggleExtraReasonOther = checkinToggleExtraReasonOther;
window.checkinAutoSaveReport = checkinAutoSaveReport;
window.checkinOnExecutedChange = checkinOnExecutedChange;
window.checkinOnTaskStatusChange = checkinOnTaskStatusChange;
window.checkinDismissCarryover = checkinDismissCarryover;
window.checkinCreateSubItems = checkinCreateSubItems;
window.checkinEditSubItems = checkinEditSubItems;
window.checkinToggleSubItem = checkinToggleSubItem;
window.checkinJumpToDay = checkinJumpToDay;
window.checkinOnTaskDisciplineChange = checkinOnTaskDisciplineChange;
window.checkinOnTaskShiftChange = checkinOnTaskShiftChange;
window.checkinOnTaskExtraChange = checkinOnTaskExtraChange;
window.checkinUpdateTaskTime = checkinUpdateTaskTime;
window.checkinReopenTask = checkinReopenTask;
window.checkinOpenSummaryFromDaily = checkinOpenSummaryFromDaily;
window.checkinSetSummaryPeriod = checkinSetSummaryPeriod;
window.checkinSetSummaryRange = checkinSetSummaryRange;
window.checkinSetSummaryFilter = checkinSetSummaryFilter;
window.checkinOpenReportPDF = checkinOpenReportPDF;
window.checkinPrintReportPDF = checkinPrintReportPDF;
