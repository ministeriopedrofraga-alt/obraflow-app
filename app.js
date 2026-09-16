const icons = {
  grid: '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>',
  lift: '<svg viewBox="0 0 24 24"><path d="M4 20h16M7 17h10M9 17v-4l3-2 3 2v4M12 11V7M9 7h6M6 4h12"/></svg>',
  pallet: '<svg viewBox="0 0 24 24"><path d="M3 17h18M5 17v3M19 17v3M7 20h2m6 0h2M5 13h12l2 4H5v-4Zm3 0V7h7v6M7 7h9"/></svg>',
  swap: '<svg viewBox="0 0 24 24"><path d="m16 3 4 4-4 4M4 7h16M8 21l-4-4 4-4m12 4H4"/></svg>',
  building: '<svg viewBox="0 0 24 24"><path d="M4 21V5l8-3v19M12 8h8v13M8 7v1m0 3v1m0 3v1m8-4v1m0 3v1M2 21h20"/></svg>',
  map: '<svg viewBox="0 0 24 24"><path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3V6Zm6-3v15m6-12v15"/></svg>',
  chart: '<svg viewBox="0 0 24 24"><path d="M4 20V10m6 10V4m6 16v-7m5 7H2"/></svg>',
  shield: '<svg viewBox="0 0 24 24"><path d="M12 22s8-3 8-10V5l-8-3-8 3v7c0 7 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/></svg>',
  more: '<svg viewBox="0 0 24 24"><circle cx="5" cy="12" r="1" fill="currentColor"/><circle cx="12" cy="12" r="1" fill="currentColor"/><circle cx="19" cy="12" r="1" fill="currentColor"/></svg>',
  chevron: '<svg viewBox="0 0 24 24"><path d="m9 18 6-6-6-6"/></svg>',
  search: '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>',
  bell: '<svg viewBox="0 0 24 24"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/></svg>',
  scan: '<svg viewBox="0 0 24 24"><path d="M3 8V5a2 2 0 0 1 2-2h3m8 0h3a2 2 0 0 1 2 2v3m0 8v3a2 2 0 0 1-2 2h-3M8 21H5a2 2 0 0 1-2-2v-3M7 12h10"/></svg>',
  menu: '<svg viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
  plus: '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>',
  download: '<svg viewBox="0 0 24 24"><path d="M12 3v12m-5-5 5 5 5-5M5 21h14"/></svg>',
  check: '<svg viewBox="0 0 24 24"><path d="m5 12 4 4L19 6"/></svg>',
  clock: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  tool: '<svg viewBox="0 0 24 24"><path d="M14 7a4 4 0 0 0-5-4l2 3-3 3-3-2a4 4 0 0 0 5 5l7 8 3-3-8-7"/></svg>',
  qr: '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><path d="M14 14h3v3h-3zm3 3h4v4h-4zm-3 3h3"/></svg>',
  arrow: '<svg viewBox="0 0 24 24"><path d="M5 12h14m-5-5 5 5-5 5"/></svg>',
  return: '<svg viewBox="0 0 24 24"><path d="m9 10-4 4 4 4M5 14h9a5 5 0 0 0 5-5V5"/></svg>',
  close: '<svg viewBox="0 0 24 24"><path d="m6 6 12 12M18 6 6 18"/></svg>',
  user: '<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>',
  calendar: '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></svg>',
  alert: '<svg viewBox="0 0 24 24"><path d="M12 3 2 21h20L12 3Z"/><path d="M12 9v5m0 3h.01"/></svg>',
  print: '<svg viewBox="0 0 24 24"><path d="M6 9V3h12v6M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v7H6z"/></svg>',
  edit: '<svg viewBox="0 0 24 24"><path d="m4 20 4-1 11-11-3-3L5 16l-1 4ZM14 7l3 3"/></svg>',
  trash: '<svg viewBox="0 0 24 24"><path d="M4 7h16M9 7V4h6v3m3 0-1 14H7L6 7m4 4v6m4-6v6"/></svg>',
  file: '<svg viewBox="0 0 24 24"><path d="M6 2h8l4 4v16H6zM14 2v5h5M9 13h6m-6 4h6"/></svg>',
  location: '<svg viewBox="0 0 24 24"><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg>'
};

const seedEquipments = [
  { id:'tpta00674', code:'TPTA00674', name:'Plataforma Tesoura 08m 4x2 Pb', type:'PTA Tesoura', brand:'Tecnogera', model:'Tesoura 08m 4x2 Pb', serial:'JPAC023A00135', productCode:'931-000235', invoice:'2623', emissionDate:'2026-09-10', hourmeter:170, battery:'Chumbo', status:'available', inspection:'', usage:null },
  { id:'tpta00845', code:'TPTA00845', name:'Plataforma Tesoura 08m 4x2 Li', type:'PTA Tesoura', brand:'Tecnogera', model:'Tesoura 08m 4x2 Li', serial:'0775300701N010208', productCode:'931-000233', invoice:'2533', emissionDate:'2026-08-12', hourmeter:101, battery:'Lítio', status:'available', inspection:'', usage:null },
  { id:'tpta02796', code:'TPTA02796', name:'Plataforma Tesoura 08m 4x2 Li', type:'PTA Tesoura', brand:'Tecnogera', model:'Tesoura 08m 4x2 Li', serial:'JPAC125K04867', productCode:'931-000233', invoice:'2572', emissionDate:'2026-08-25', hourmeter:1, battery:'Lítio', status:'available', inspection:'', usage:null },
  { id:'tpta02797', code:'TPTA02797', name:'Plataforma Tesoura 08m 4x2 Li', type:'PTA Tesoura', brand:'Tecnogera', model:'Tesoura 08m 4x2 Li', serial:'JPAC125K04855', productCode:'931-000233', invoice:'2572', emissionDate:'2026-08-25', hourmeter:1, battery:'Lítio', status:'available', inspection:'', usage:null },
  { id:'tpta02798', code:'TPTA02798', name:'Plataforma Tesoura 08m 4x2 Li', type:'PTA Tesoura', brand:'Tecnogera', model:'Tesoura 08m 4x2 Li', serial:'JPAC125K04865', productCode:'931-000233', invoice:'2572', emissionDate:'2026-08-25', hourmeter:1, battery:'Lítio', status:'available', inspection:'', usage:null },
  { id:'tpta02799', code:'TPTA02799', name:'Plataforma Tesoura 08m 4x2 Li', type:'PTA Tesoura', brand:'Tecnogera', model:'Tesoura 08m 4x2 Li', serial:'JPAC125K04874', productCode:'931-000233', invoice:'2572', emissionDate:'2026-08-25', hourmeter:1, battery:'Lítio', status:'available', inspection:'', usage:null },
  { id:'tpta02019', code:'TPTA02019', name:'Plataforma Tesoura 10m 4x2 Li', type:'PTA Tesoura', brand:'Tecnogera', model:'Tesoura 10m 4x2 Li', serial:'0775400501P010468', productCode:'931-000236', invoice:'2623', emissionDate:'2026-09-10', hourmeter:156.7, battery:'Lítio', status:'available', inspection:'', usage:null },
  { id:'tpta00254', code:'TPTA00254', name:'Plataforma Tesoura 10m 4x2 Li', type:'PTA Tesoura', brand:'Tecnogera', model:'Tesoura 10m 4x2 Li', serial:'JPAC022K02485', productCode:'931-000236', invoice:'2533', emissionDate:'2026-08-12', hourmeter:206.7, battery:'Lítio', status:'available', inspection:'', usage:null },
  { id:'tpta01868', code:'TPTA01868', name:'Plataforma Tesoura 10m 4x2 Li', type:'PTA Tesoura', brand:'Tecnogera', model:'Tesoura 10m 4x2 Li', serial:'JPAC023K05802', productCode:'931-000236', invoice:'2533', emissionDate:'2026-08-12', hourmeter:82.6, battery:'Lítio', status:'available', inspection:'', usage:null },
  { id:'tpta02162', code:'TPTA02162', name:'Plataforma Tesoura 10m 4x2 Li', type:'PTA Tesoura', brand:'Tecnogera', model:'Tesoura 10m 4x2 Li', serial:'0775400501S010034', productCode:'931-000236', invoice:'2533', emissionDate:'2026-08-12', hourmeter:111.5, battery:'Lítio', status:'available', inspection:'', usage:null },
  { id:'tpta00984', code:'TPTA00984', name:'Plataforma Tesoura 10m 4x2 Li', type:'PTA Tesoura', brand:'Tecnogera', model:'Tesoura 10m 4x2 Li', serial:'0775400501N010148', productCode:'931-000236', invoice:'2571', emissionDate:'2026-08-25', hourmeter:131, battery:'Lítio', status:'available', inspection:'', usage:null },
  { id:'tpta01095', code:'TPTA01095', name:'Plataforma Tesoura 12m 4x2 Li', type:'PTA Tesoura', brand:'Tecnogera', model:'Tesoura 12m 4x2 Li', serial:'0775500500N010105', productCode:'931-000238', invoice:'2623', emissionDate:'2026-09-10', hourmeter:112.4, battery:'Lítio', status:'available', inspection:'', usage:null }
];

const seedHistory = [];

const checklistItems = [
  { group: 'Comandos', title: 'Comandos e controles', text: 'Os comandos e controles estão funcionando perfeitamente.' },
  { group: 'Comandos', title: 'Descida e parada de emergência', text: 'O sistema de descida e parada de emergência está funcionando perfeitamente.' },
  { group: 'Sistema', title: 'Sinalização sonora e luminosa', text: 'O sistema sonoro e luminoso está funcionando perfeitamente durante a subida e a descida.' },
  { group: 'Sistema', title: 'Manual de operação', text: 'Está disponível o manual de operação do equipamento junto ao equipamento.' },
  { group: 'Sistema', title: 'Manutenção preventiva', text: 'A manutenção preventiva do equipamento está em dia.' },
  { group: 'Segurança', title: 'Extintor de incêndio', text: 'Há extintor de incêndio junto ao cesto ou à plataforma de elevação.' },
  { group: 'Segurança', title: 'Proteção contra queda', text: 'O cesto ou a plataforma dispõe de sistema de proteção contra queda.' },
  { group: 'Segurança', title: 'Sistema de nivelamento', text: 'O sistema impede a ascensão ou descensão quando o equipamento está desnivelado.' },
  { group: 'Segurança', title: 'Treinamento do operador', text: 'O operador recebeu treinamento específico para operação do equipamento.' },
  { group: 'Outros', title: 'Liberação do SESMT', text: 'A placa de liberação do SESMT está com a devida identificação do equipamento.' }
];

const inspectionLegend = [
  { value: 'A', label: 'Aprovado' },
  { value: 'O', label: 'Reprovado' },
  { value: 'R', label: 'Reinspecionado e aprovado' },
  { value: 'NA', label: 'Não aplicável' }
];

const supabaseUrl = 'https://qjopbdkobxotynyrqsgk.supabase.co';
const supabaseKey = 'sb_publishable_jN3kq2T7E7Dl26Kux3mXbg_3Dx4P7Zq';
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

let equipments = [];
let history = [];
let equipmentImportMeta = { source: 'Nenhuma base', updatedAt: '' };
let workforce = [];
let workforceMeta = { source: 'Nenhuma base', updatedAt: '' };
let currentPage = 'dashboard';

async function save() {
  for (const eq of equipments) await supabase.from('equipments').upsert(eq);
  for (const h of history) await supabase.from('history').upsert(h);
}

async function initializeApp() {
  const { data: eqData } = await supabase.from('equipments').select('*');
  if (eqData && eqData.length > 0) equipments = eqData;
  else {
    equipments = seedEquipments;
    history = seedHistory;
    await save();
  }

  const { data: hsData } = await supabase.from('history').select('*');
  if (hsData) history = hsData;

  const { data: wfData } = await supabase.from('workforce').select('*');
  if (wfData && wfData.length > 0) workforce = wfData;
  else {
    try {
      const res = await fetch('assets/workforce-seed.json');
      const data = await res.json();
      workforce = data.people || [];
      for(const p of workforce) {
          if (!p.id) p.id = crypto.randomUUID();
          await supabase.from('workforce').upsert(p);
      }
    } catch {}
  }
  
  const { data: appMeta } = await supabase.from('app_metadata').select('*');
  if (appMeta) {
    const eqMeta = appMeta.find(m => m.key === 'equipment_import_meta');
    if (eqMeta) equipmentImportMeta = eqMeta.value;
    const wfMeta = appMeta.find(m => m.key === 'workforce_meta');
    if (wfMeta) workforceMeta = wfMeta.value;
  }

  hydrateIcons();
  render();
}
function companyOptions(selected='') {
  const companies=[...new Set(workforce.map(person=>person.company))].sort((a,b)=>a.localeCompare(b,'pt-BR'));
  return `<option value="">Selecione a empresa...</option>${companies.map(company=>`<option value="${esc(company)}" ${company===selected?'selected':''}>${esc(company)}</option>`).join('')}`;
}
function responsibleOptions(company='',selected='') {
  const people=workforce.filter(person=>!company||person.company===company).sort((a,b)=>a.name.localeCompare(b.name,'pt-BR'));
  return `<option value="">Selecione o responsável...</option>${people.map(person=>`<option value="${esc(person.name)}" ${person.name===selected?'selected':''}>${esc(person.name)}${person.role?` — ${esc(person.role)}`:''}</option>`).join('')}`;
}
function updateResponsibleOptions(companySelect) {
  const responsible=companySelect.closest('form').querySelector('select[name="responsible"]');
  if(responsible) responsible.innerHTML=responsibleOptions(companySelect.value);
}
function fillPersonPhone(responsibleSelect) {
  const form=responsibleSelect.closest('form'); const company=form.querySelector('[name="company"]')?.value; const person=workforce.find(item=>item.company===company&&item.name===responsibleSelect.value); const phone=form.querySelector('[name="phone"]'); if(phone&&person?.phone)phone.value=person.phone;
}
function esc(value = '') {
  return String(value).replace(/[&<>'"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' }[c]));
}
function icon(name) { return icons[name] || ''; }
function hydrateIcons(root = document) {
  root.querySelectorAll('[data-icon]').forEach(el => { el.innerHTML = icon(el.dataset.icon); });
}
function equipmentIcon(eq) { return eq.type.includes('Paleteira') ? icon('pallet') : icon('lift'); }
function statusLabel(status) { return ({ available: 'Disponível', 'in-use': 'Em uso', maintenance: 'Manutenção' })[status]; }
function statusBadge(status) { return `<span class="status ${status}">${statusLabel(status)}</span>`; }
function dateTime(value) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('pt-BR', { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' }).format(new Date(value));
}
function fullDate(value) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('pt-BR', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' }).format(new Date(value));
}
function nowLocal() {
  const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0,16);
}
function inspectionFormHTML(eq, mode, preset = {}) {
  const isReturn = mode === 'devolucao';
  const groups = [...new Set(checklistItems.map(item => item.group))];
  return `<section class="inspection-sheet">
    <header class="inspection-form-head">
      <div class="inspection-logo"><img src="assets/heating-cooling-logo.jpg" alt="Heating Cooling"><img class="af-logo" src="assets/afonso-franca-logo.png" alt="Afonso França Engenharia"></div>
      <div class="inspection-title">FORMULÁRIO DE VERIFICAÇÃO E INSPEÇÃO<br>PLATAFORMA ELEVATÓRIA MÓVEL DE TRABALHO (PEMT)<small>${isReturn ? 'INSPEÇÃO DE DEVOLUÇÃO / BAIXA' : 'INSPEÇÃO DE RETIRADA / PRÉ-USO'}</small></div>
      <div class="inspection-code"><strong>FV-MAQ-ST</strong><span>Rev.: 00</span><span>Folha: 1/1</span></div>
    </header>
    <div class="inspection-identification">
      <label><span>Equipamento</span><input value="${esc(eq.code)} — ${esc(eq.name)}" readonly></label>
      <label><span>Empresa</span>${isReturn?`<input name="company" required value="${esc(preset.company||'')}" readonly>`:`<select name="company" required onchange="updateResponsibleOptions(this)">${companyOptions(preset.company||'')}</select>`}</label>
      <label><span>Nome do responsável</span>${isReturn?`<input name="responsible" required value="${esc(preset.responsible||'')}" readonly>`:`<select name="responsible" required onchange="fillPersonPhone(this)">${responsibleOptions(preset.company||'',preset.responsible||'')}</select>`}</label>
      <label class="year-field"><span>Ano base</span><input value="${new Date().getFullYear()}" readonly></label>
    </div>
    <div class="inspection-strip"><strong>Inspeção obrigatória</strong><span>Selecione uma opção em cada item conforme a legenda do formulário original.</span></div>
    <div class="inspection-groups">
      ${groups.map(group => `<section class="inspection-group"><h3>${group}</h3>${checklistItems.map((item, i) => item.group === group ? `<div class="inspection-row"><span class="inspection-index">${String(i + 1).padStart(2, '0')}</span><div class="inspection-question"><strong>${item.title}</strong><small>${item.text}</small></div><div class="inspection-answers">${inspectionLegend.map(option => `<label title="${option.label}"><input type="radio" name="inspect${i}" value="${option.value}" required><span>${option.value}</span></label>`).join('')}</div></div>` : '').join('')}</section>`).join('')}
    </div>
    <div class="inspection-bottom-fields">
      <label><span>Data e hora da inspeção</span><input type="datetime-local" name="inspectionAt" required value="${preset.inspectionAt || nowLocal()}"></label>
      <label><span>Horímetro</span><input type="number" inputmode="decimal" name="hourmeter" min="0" step="0.1" required placeholder="Ex.: 2440.5" value="${esc(eq.hourmeter ?? '')}"></label>
      <label><span>Visto do operador</span><input name="operatorSign" required maxlength="30" placeholder="Digite suas iniciais"></label>
      <label class="inspection-observations"><span>Observações</span><textarea name="inspectionNotes" placeholder="Registre anormalidades, avarias ou informações importantes..."></textarea></label>
    </div>
    <div class="inspection-legend"><strong>Legenda:</strong>${inspectionLegend.map(option => `<span><b>${option.value}</b> — ${option.label}</span>`).join('')}<span class="inspection-frequency"><strong>Frequência:</strong> Operador — Diária · Técnico de Segurança — Semanal</span></div>
  </section>`;
}
function inspectionFromData(data, mode) {
  return {
    mode,
    inspectedAt: data.inspectionAt,
    hourmeter: data.hourmeter,
    operatorSign: data.operatorSign,
    observations: data.inspectionNotes || '',
    physicalFiled: data.physicalCopy === 'on',
    answers: checklistItems.map((_, i) => data[`inspect${i}`])
  };
}
function inspectionHasFailure(inspection) { return inspection.answers.some(answer => answer === 'O'); }
function printableInspection(eq, movement) {
  const inspection = movement.inspection;
  const groupHeaders = [['Comandos', 2], ['Sistema', 3], ['Segurança', 4], ['Outros', 1]];
  return `<article class="paper-document">
    <header class="paper-head"><div><img src="assets/heating-cooling-logo.jpg" alt="Heating Cooling"><img class="af-logo" src="assets/afonso-franca-logo.png" alt="Afonso França Engenharia"></div><h2>FORMULÁRIO DE VERIFICAÇÃO E INSPEÇÃO — PLATAFORMA ELEVATÓRIA<br>MÓVEL DE TRABALHO (PEMT)<small>${inspection.mode === 'devolucao' ? 'INSPEÇÃO DE DEVOLUÇÃO / BAIXA' : 'INSPEÇÃO DE RETIRADA / PRÉ-USO'}</small></h2><aside><strong>FV-MAQ-ST</strong><span>Rev.: 00</span><span>Folha: 1/1</span></aside></header>
    <div class="paper-info"><span><small>Equipamento</small><strong>${esc(eq.code)} — ${esc(eq.name)}</strong></span><span><small>Empresa</small><strong>${esc(movement.company)}</strong></span><span><small>Nome do responsável</small><strong>${esc(movement.person)}</strong></span><span><small>Ano base</small><strong>${inspection.inspectedAt?new Date(inspection.inspectedAt).getFullYear():new Date().getFullYear()}</strong></span></div>
    <div class="paper-job-info"><span><small>Atividade</small><strong>${esc(movement.activity||'')}</strong></span><span><small>Data Hall — DH</small><strong>${esc(movement.dataHall||movement.place||'')}</strong></span><span><small>Local específico</small><strong>${esc(movement.location||'')}</strong></span></div>
    <div class="paper-table-wrap"><table class="paper-table"><thead><tr><th rowspan="2">Dia / Mês</th>${groupHeaders.map(group => `<th colspan="${group[1]}">${group[0]}</th>`).join('')}<th rowspan="2">Horímetro</th><th rowspan="2">Visto</th></tr><tr>${checklistItems.map(item => `<th>${item.text}</th>`).join('')}</tr></thead><tbody><tr><td>${inspection.inspectedAt?new Intl.DateTimeFormat('pt-BR',{day:'2-digit',month:'2-digit'}).format(new Date(inspection.inspectedAt)):''}</td>${inspection.answers.map(answer => `<td class="paper-answer">${esc(answer||'')}</td>`).join('')}<td>${inspection.hourmeter?`${esc(inspection.hourmeter)} h`:''}</td><td>${esc(inspection.operatorSign||'')}</td></tr>${Array.from({length:5},()=>`<tr class="blank-row">${Array.from({length:13},()=>'<td>&nbsp;</td>').join('')}</tr>`).join('')}</tbody></table></div>
    <div class="paper-notes"><strong>Observações</strong><p>${esc(inspection.observations || 'Sem observações registradas.')}</p></div>
    <footer class="paper-legend"><strong>Legenda:</strong>${inspectionLegend.map(option => `<span>${option.value} — ${option.label}</span>`).join('')}<b>Frequência de inspeção:</b><span>Operador — Diária<br>Técnico de Segurança — Semanal</span><span class="paper-physical">Via física: ${inspection.physicalFiled?'arquivamento confirmado':'arquivar na pasta do colaborador'}</span></footer>
  </article>`;
}
function pageHeader(title, subtitle, eyebrow = 'CENTRAL DE OPERAÇÕES', actions = '') {
  return `<section class="page-head"><div><p class="eyebrow">${eyebrow}</p><h1>${title}</h1><p>${subtitle}</p></div><div class="page-actions">${actions}</div></section>`;
}
function metric(label, value, detail, type, iconName, width) {
  return `<article class="metric-card"><div class="metric-top"><span>${label}</span><span class="metric-icon ${type}">${icon(iconName)}</span></div><div class="metric-value"><strong>${value}</strong><small>${detail}</small></div><div class="metric-bar"><span style="width:${width}%;background:var(--${type === 'amber' ? 'amber' : type === 'red' ? 'red' : type === 'blue' ? 'blue' : 'green'})"></span></div></article>`;
}

function render() {
  const hash = location.hash.replace('#','') || 'dashboard';
  if (hash.startsWith('scan/')) {
    currentPage = 'dashboard';
    renderDashboard();
    const id = hash.split('/')[1];
    setTimeout(() => openScannedEquipment(id), 40);
  } else if(hash==='pemt-checklists') {
    currentPage='equipamentos'; renderMovements();
  } else {
    currentPage = ['dashboard','equipamentos','empresas','relatorios'].includes(hash) ? hash : 'dashboard';
    ({ dashboard: renderDashboard, equipamentos: renderEquipments, empresas: renderCompanies, relatorios: renderReports })[currentPage]();
  }
  document.querySelectorAll('.nav-link').forEach(link => link.classList.toggle('active', link.dataset.page === currentPage));
  document.getElementById('navEquipmentCount').textContent = equipments.length;
  closeMobileMenu();
}
function equipmentModuleTabs(active='equipamentos') {
  return `<nav class="module-tabs" aria-label="Seções do controle de PTAs"><a href="#equipamentos" class="${active==='equipamentos'?'active':''}">${icon('lift')} Equipamentos</a><a href="#pemt-checklists" class="${active==='checklists'?'active':''}">${icon('file')} Checklists PEMT <b>${history.filter(item=>item.inspection).length}</b></a></nav>`;
}

function renderDashboard() {
  const available = equipments.filter(e => e.status === 'available').length;
  const inUse = equipments.filter(e => e.status === 'in-use').length;
  const maintenance = equipments.filter(e => e.status === 'maintenance').length;
  document.getElementById('app').innerHTML = `
    ${pageHeader('Gestão integrada da obra', 'Acesse os controles operacionais do Data Center Fortaleza em um só lugar.', 'OBRAFLOW · OMNIA DC01')}
    <section class="workspace-grid">
      <article class="module-feature">
        <div class="module-feature-top"><span class="module-big-icon">${icon('lift')}</span><span class="module-active">Módulo ativo</span></div>
        <div><p class="eyebrow">EQUIPAMENTOS DE ELEVAÇÃO</p><h2>Controle de PTAs e paleteiras</h2><p class="module-description">Disponibilidade, localização, responsável, previsão de devolução e checklist pelo QR Code.</p></div>
        <div class="module-stats"><span><strong>${equipments.length}</strong><small>Cadastradas</small></span><span><strong>${available}</strong><small>Disponíveis</small></span><span><strong>${inUse}</strong><small>Em uso</small></span><span><strong>${maintenance}</strong><small>Manutenção</small></span></div>
        <div class="module-actions"><button class="button button-green" onclick="location.hash='equipamentos'">Abrir controle ${icon('arrow')}</button><button class="button button-outline" onclick="openScanModal()">${icon('scan')} Ler QR Code</button></div>
      </article>
      <aside class="future-modules panel">
        <div class="panel-head"><div><h2>Outros módulos</h2><p>A estrutura está pronta para crescer</p></div></div>
        <div class="future-module"><span>${icon('file')}</span><div><strong>Diário de obra</strong><small>RDO, atividades e evidências</small></div><b>Em breve</b></div>
        <div class="future-module"><span>${icon('shield')}</span><div><strong>Segurança</strong><small>Inspeções e permissões</small></div><b>Em breve</b></div>
        <div class="future-module"><span>${icon('building')}</span><div><strong>Empreiteiros</strong><small>Equipes e documentos</small></div><b>Em breve</b></div>
      </aside>
    </section>
    <section class="home-footer-card"><div><span>${icon('file')}</span><div><strong>${history.length} formulários registrados</strong><small>Consulte os registros digitais e imprima a via física PEMT.</small></div></div><button class="button button-outline compact" onclick="location.hash='pemt-checklists'">Checklists PEMT ${icon('arrow')}</button></section>`;
}

function equipmentRow(eq) {
  return `<div class="equipment-row"><span class="equipment-thumb">${equipmentIcon(eq)}</span><span class="primary-text"><strong>${esc(eq.name)}</strong><small>${esc(eq.code)} · ${esc(eq.brand)}</small></span><span class="data-cell optional-cell"><span class="cell-label">Local atual</span><strong>${esc(eq.usage?.dataHall || 'Pátio / Base')}</strong></span><span class="data-cell optional-cell"><span class="cell-label">Responsável</span><strong>${esc(eq.usage?.responsible || '—')}</strong></span><span class="data-cell optional-cell"><span class="cell-label">Previsão de entrega</span><strong>${eq.usage ? dateTime(eq.usage.expectedAt) : '—'}</strong></span>${statusBadge(eq.status)}<button class="icon-button row-action" onclick="openEquipmentDetails('${eq.id}')">${icon('chevron')}</button></div>`;
}
function activityItem(item) {
  const eq = equipments.find(e => e.id === item.equipmentId);
  const config = item.action === 'withdraw' ? ['arrow','amber','retirou'] : item.action === 'return' ? ['return','green','devolveu'] : ['alert','blue','reportou avaria em'];
  return `<div class="activity-item"><span class="activity-icon ${config[1]}">${icon(config[0])}</span><div class="activity-content"><p><strong>${esc(item.person)}</strong> ${config[2]} <strong>${esc(eq?.code || 'equipamento')}</strong></p><small>${esc(item.company)} · ${dateTime(item.date)}</small></div></div>`;
}

function renderEquipments() {
  const models=[...new Set(equipments.map(e=>e.model).filter(Boolean))].sort();
  document.getElementById('app').innerHTML = `
    ${pageHeader('Controle de PTAs e paleteiras', 'Consulte rapidamente quem está usando, onde está e quando será devolvida.', 'MÓDULO DE EQUIPAMENTOS', `<button class="button button-outline" onclick="openScanModal()">${icon('scan')} Ler QR</button><button class="button button-green" onclick="openEquipmentModal()">${icon('plus')} Cadastrar</button>`)}
    ${equipmentModuleTabs('equipamentos')}
    <section class="control-summary"><span><b>${equipments.length}</b> equipamentos</span><span class="summary-green"><i></i><b>${equipments.filter(e=>e.status==='available').length}</b> disponíveis</span><span class="summary-amber"><i></i><b>${equipments.filter(e=>e.status==='in-use').length}</b> em uso</span><div class="summary-actions"><button onclick="openEquipmentImportModal()">${icon('download')} Atualizar PTAs</button><button onclick="printAllQRCodes()">${icon('print')} QR Codes</button></div></section>
    <div class="simple-filters">
      <label class="search-box">${icon('search')}<input id="assetSearch" type="search" placeholder="Buscar patrimônio, série ou responsável..." oninput="filterAssets()"></label>
      <label class="filter-field"><span>Data</span><input type="date" id="dateFilter" onchange="filterAssets()"></label>
      <label class="filter-field"><span>Modelo</span><select id="modelFilter" onchange="filterAssets()"><option value="">Todos</option>${models.map(model=>`<option>${esc(model)}</option>`).join('')}</select></label>
      <label class="filter-field"><span>Tipo</span><select id="typeFilter" onchange="filterAssets()"><option value="">Todos</option><option>PTA Tesoura</option><option>PTA Articulada</option><option>PTA Mastro</option><option>Paleteira Elétrica</option></select></label>
      <label class="filter-field"><span>Status</span><select id="statusFilter" onchange="filterAssets()"><option value="">Todos</option><option value="available">Disponível</option><option value="in-use">Em uso</option><option value="maintenance">Manutenção</option></select></label>
    </div>
    <article class="panel compact-equipment-panel"><div class="table-wrap"><table class="data-table equipment-control-table"><thead><tr><th>Equipamento</th><th>Modelo</th><th>Status</th><th>Em uso por</th><th>Local</th><th>Previsão de devolução</th><th>Checklist</th><th></th></tr></thead><tbody id="equipmentControlBody">${equipments.map(equipmentControlRow).join('')}</tbody></table></div><div class="no-filter-results" id="noFilterResults">Nenhum equipamento encontrado com estes filtros.</div></article>`;
}
function equipmentControlRow(eq) {
  const latest=history.find(item=>item.equipmentId===eq.id&&item.inspection);
  const dates=[eq.emissionDate||'',...history.filter(item=>item.equipmentId===eq.id).map(item=>item.date?.slice(0,10)||'')].join(' ');
  return `<tr class="equipment-control-row" data-status="${eq.status}" data-type="${esc(eq.type)}" data-model="${esc(eq.model||'')}" data-dates="${dates}" data-search="${esc(`${eq.name} ${eq.code} ${eq.serial||''} ${eq.model||''} ${eq.usage?.responsible||''} ${eq.usage?.company||''} ${eq.usage?.activity||''}`.toLowerCase())}"><td><div class="equipment-identity"><span>${equipmentIcon(eq)}</span><div><strong>${esc(eq.code)}</strong><small>${esc(eq.name)}</small></div></div></td><td><strong>${esc(eq.model||'—')}</strong><small class="table-sub">${esc(eq.battery ? `Bateria ${eq.battery}` : eq.brand||'')}</small></td><td>${statusBadge(eq.status)}</td><td>${eq.usage?`<strong>${esc(eq.usage.responsible)}</strong><small class="table-sub">${esc(eq.usage.company)}</small>`:'<span class="muted-dash">—</span>'}</td><td>${eq.usage?`<strong>${esc(eq.usage.dataHall)}</strong><small class="table-sub">${esc(eq.usage.location)}</small><small class="table-sub activity-sub">${esc(eq.usage.activity||'')}</small>`:'<span class="muted-dash">Pátio / Base</span>'}</td><td>${eq.usage?`<strong>${fullDate(eq.usage.expectedAt)}</strong>`:'<span class="muted-dash">—</span>'}</td><td>${latest?`<button class="table-action" onclick="openInspectionRecord(${latest.id})">${icon('file')} Ver</button>`:'<span class="muted-dash">Sem registro</span>'}</td><td><div class="control-row-actions"><button class="icon-button" title="QR Code" onclick="openQRModal('${eq.id}')">${icon('qr')}</button><button class="button ${eq.status==='available'?'button-green':'button-outline'} compact" onclick="openEquipmentDetails('${eq.id}')">${eq.status==='available'?'Retirar':'Detalhes'}</button></div></td></tr>`;
}
function assetCard(eq) {
  return `<article class="asset-card" data-status="${eq.status}" data-type="${esc(eq.type)}" data-search="${esc(`${eq.name} ${eq.code} ${eq.brand} ${eq.model}`.toLowerCase())}"><div class="asset-card-top"><span class="asset-icon">${equipmentIcon(eq)}</span>${statusBadge(eq.status)}</div><h3>${esc(eq.name)}</h3><div class="asset-code">${esc(eq.code)} · ${esc(eq.brand)} ${esc(eq.model)}</div><div class="asset-meta"><div><span>Localização</span><strong>${esc(eq.usage?.dataHall || 'Pátio / Base')}</strong></div><div><span>Responsável</span><strong>${esc(eq.usage?.responsible || 'Sem responsável')}</strong></div></div><div class="asset-actions"><button class="button button-outline" onclick="openQRModal('${eq.id}')">${icon('qr')} QR Code</button><button class="button ${eq.status === 'available' ? 'button-green' : 'button-dark'}" onclick="openEquipmentDetails('${eq.id}')">${eq.status === 'available' ? 'Liberar uso' : 'Ver detalhes'} ${icon('arrow')}</button></div></article>`;
}
function filterAssets() {
  const search = document.getElementById('assetSearch').value.toLowerCase();
  const status = document.getElementById('statusFilter').value;
  const type = document.getElementById('typeFilter').value;
  const model = document.getElementById('modelFilter').value;
  const date = document.getElementById('dateFilter').value;
  let visible=0;
  document.querySelectorAll('.equipment-control-row').forEach(row => { const show=(!search||row.dataset.search.includes(search))&&(!status||row.dataset.status===status)&&(!type||row.dataset.type===type)&&(!model||row.dataset.model===model)&&(!date||row.dataset.dates.includes(date)); row.style.display=show?'':'none'; if(show)visible++; });
  document.getElementById('noFilterResults').style.display=visible?'none':'block';
}

function openEquipmentImportModal() {
  modal(`${modalHead('Atualizar PTAs por Excel','Utilize o mesmo modelo da planilha OMNIA DC01')}<div class="modal-body"><div class="upload-zone" onclick="document.getElementById('equipmentFile').click()"><span>${icon('lift')}</span><div><h3>Selecionar planilha de equipamentos</h3><p>Formatos .xlsx ou .xls · todas as abas serão verificadas</p></div><button type="button" class="button button-outline compact">Escolher arquivo</button><input id="equipmentFile" type="file" accept=".xlsx,.xls" hidden onchange="handleEquipmentUpload(event)"></div><div class="upload-info"><span>${icon('check')}</span><div><strong>${equipments.length} equipamentos cadastrados atualmente</strong><small>${esc(equipmentImportMeta.source||'Nenhuma planilha importada')} ${equipmentImportMeta.updatedAt?`· ${new Intl.DateTimeFormat('pt-BR').format(new Date(equipmentImportMeta.updatedAt))}`:''}</small></div></div><div class="import-columns"><span>NF</span><span>Data emissão</span><span>Código produto</span><span>Descrição</span><span>Patrimônio</span><span>Chassi</span><span>Horímetro</span><span>Bateria</span><span>Empreiteiro</span></div><div class="notice">${icon('alert')} A importação atualiza equipamentos pelo número de patrimônio e adiciona os novos. Status, responsável atual, localização e checklists são preservados. Equipamentos ausentes na planilha não são excluídos.</div></div><div class="modal-foot"><a class="button button-outline" href="assets/controle-ptas-omnia-dc01.xlsx" download="MODELO - PLANILHA DE CONTROLE DE PTAs.xlsx">${icon('download')} Baixar modelo</a><button class="button button-outline" onclick="exportEquipmentsExcel()">${icon('download')} Exportar PTAs atuais</button><button class="button button-green" onclick="closeModal()">Fechar</button></div>`,'modal-large');
}

function exportEquipmentsExcel() {
  if(!window.XLSX)return toast('O gerador de Excel ainda está carregando. Tente novamente em alguns segundos.',true);
  const headers=['NF','DATA EMISSÃO','COD. PRODUTO','DESCRIÇÃO DO EQUIPAMENTO','PATRIMÔNIO','CHASSI','HORÍMETRO','','BATERIA','EMPREITEIRO','STATUS','RESPONSÁVEL ATUAL','EMPRESA ATUAL','ATIVIDADE','DATA HALL','LOCAL','DEVOLUÇÃO PREVISTA'];
  const selectedEquipments=getReportFilteredEquipments(); if(!selectedEquipments.length)return toast('Nenhum equipamento encontrado com os filtros selecionados.',true); const rows=selectedEquipments.map(eq=>[eq.invoice||'',eq.emissionDate||'',eq.productCode||'',eq.name||eq.model||'',eq.code||'',eq.serial||'',eq.hourmeter??'','',eq.battery||'',eq.contractor||'',eq.status==='in-use'?'EM USO':eq.status==='maintenance'?'MANUTENÇÃO':'DISPONÍVEL',eq.usage?.responsible||'',eq.usage?.company||'',eq.usage?.activity||'',eq.usage?.dataHall||'',eq.usage?.location||'',eq.usage?.expectedAt||'']);
  const sheet=XLSX.utils.aoa_to_sheet([headers,...rows]);
  sheet['!cols']=[{wch:12},{wch:14},{wch:16},{wch:38},{wch:16},{wch:20},{wch:12},{wch:3},{wch:14},{wch:24},{wch:15},{wch:28},{wch:28},{wch:32},{wch:16},{wch:25},{wch:22}];
  const book=XLSX.utils.book_new(); XLSX.utils.book_append_sheet(book,sheet,'Controle de PTAs');
  XLSX.writeFile(book,`controle-ptas-atual-${new Date().toISOString().slice(0,10)}.xlsx`); toast('Planilha atual de PTAs exportada.');
}
function spreadsheetDate(value) {
  if(!value)return ''; if(value instanceof Date&&!isNaN(value))return value.toISOString().slice(0,10);
  if(typeof value==='number'){const date=new Date(Math.round((value-25569)*86400*1000));return isNaN(date)?'':date.toISOString().slice(0,10);}
  const text=String(value).trim(); const match=text.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{2,4})$/); if(match){const year=match[3].length===2?`20${match[3]}`:match[3];return `${year}-${match[2].padStart(2,'0')}-${match[1].padStart(2,'0')}`;} return /^\d{4}-\d{2}-\d{2}/.test(text)?text.slice(0,10):'';
}
function equipmentTypeFromDescription(description) {
  if(/paleteira/i.test(description))return 'Paleteira Elétrica'; if(/articulada/i.test(description))return 'PTA Articulada'; if(/mastro/i.test(description))return 'PTA Mastro'; return 'PTA Tesoura';
}
async function handleEquipmentUpload(event) {
  const file=event.target.files?.[0]; if(!file)return;
  if(!window.XLSX){event.target.value='';return toast('O leitor de Excel ainda está carregando. Tente novamente em alguns segundos.',true);}
  try {
    const bytes=await file.arrayBuffer(); const workbook=XLSX.read(bytes,{type:'array',cellDates:true}); const imported=[]; const seen=new Set();
    workbook.SheetNames.forEach(sheetName=>{const rows=XLSX.utils.sheet_to_json(workbook.Sheets[sheetName],{header:1,defval:'',raw:true});rows.forEach(row=>{const description=String(row[3]||'').replace(/\s+/g,' ').trim();const code=String(row[4]||'').replace(/\s+/g,'').trim().toUpperCase();if(!description||!code||/descrição do equipamento/i.test(description)||/série|patrimônio/i.test(code)||/^total/i.test(description))return;const key=code.toUpperCase();if(seen.has(key))return;seen.add(key);const hourText=String(row[6]??'').replace(',','.');const name=description;imported.push({code,name,type:equipmentTypeFromDescription(description),brand:'Tecnogera',model:description.replace(/^Plataforma\s+/i,''),serial:String(row[5]||'').trim(),productCode:String(row[2]||'').trim(),invoice:String(row[0]||'').trim(),emissionDate:spreadsheetDate(row[1]),hourmeter:Number.isFinite(Number(hourText))?Number(hourText):0,battery:String(row[8]||'').trim(),contractor:String(row[9]||'').trim()});});});
    if(!imported.length)throw new Error('Nenhum equipamento foi identificado. Verifique se a planilha segue o modelo enviado.');
    let added=0;let updated=0; imported.forEach(item=>{const index=equipments.findIndex(eq=>eq.code.toUpperCase()===item.code.toUpperCase());if(index>=0){const current=equipments[index];equipments[index]={...current,...item,id:current.id,status:current.status,usage:current.usage,inspection:current.inspection};updated++;}else{const baseId=item.code.toLowerCase().replace(/[^a-z0-9]+/g,'-');equipments.push({id:baseId,...item,status:'available',inspection:'',usage:null});added++;}}); equipments.sort((a,b)=>(a.model||a.name).localeCompare(b.model||b.name,'pt-BR')||a.code.localeCompare(b.code,'pt-BR')); equipmentImportMeta={source:file.name,updatedAt:new Date().toISOString(),total:imported.length}; supabase.from('app_metadata').upsert({key:'equipment_import_meta',value:equipmentImportMeta}); save(); closeModal(); renderEquipments(); document.getElementById('navEquipmentCount').textContent=equipments.length; toast(`${updated} atualizado(s) e ${added} novo(s) equipamento(s) importados.`);
  } catch(error){toast(error.message||'Não foi possível ler a planilha de equipamentos.',true);}
}

function renderMovements() {
  const inspections=history.filter(item=>item.inspection); const people=[...new Set(inspections.map(item=>item.person))].sort((a,b)=>a.localeCompare(b,'pt-BR'));
  document.getElementById('app').innerHTML = `${pageHeader('Checklists PEMT', 'Controle digital complementar ao formulário físico arquivado na pasta do colaborador.', 'CONTROLE DE PTAs E PALETEIRAS', `<button class="button button-outline" onclick="openBlankInspectionTemplate()">${icon('print')} Imprimir formulário físico</button><button class="button button-green" onclick="exportChecklistExcel()">${icon('download')} Baixar Excel</button>`)}${equipmentModuleTabs('checklists')}<section class="physical-guidance">${icon('file')}<div><strong>O formulário físico continua obrigatório</strong><small>Imprima o modelo, colha as assinaturas e arquive a via na pasta do colaborador. O registro digital facilita consulta e rastreabilidade.</small></div><button onclick="openBlankInspectionTemplate()">Imprimir modelo</button></section><section class="control-summary"><span><b>${inspections.length}</b> formulários digitais</span><span class="summary-green"><i></i><b>${inspections.filter(item=>!inspectionHasFailure(item.inspection)).length}</b> aprovados</span><span class="summary-amber"><i></i><b>${inspections.filter(item=>item.inspection.mode==='retirada').length}</b> retiradas</span></section><div class="checklist-filters"><label class="filter-field"><span>Pessoa</span><select id="checkPerson" onchange="filterChecklists()"><option value="">Todas</option>${people.map(person=>`<option>${esc(person)}</option>`).join('')}</select></label><label class="filter-field"><span>Equipamento</span><select id="checkEquipment" onchange="filterChecklists()"><option value="">Todos</option>${equipments.map(eq=>`<option value="${eq.id}">${esc(eq.code)} — ${esc(eq.model)}</option>`).join('')}</select></label><label class="filter-field"><span>Tipo</span><select id="checkMode" onchange="filterChecklists()"><option value="">Todos</option><option value="retirada">Retirada</option><option value="devolucao">Devolução</option></select></label><label class="filter-field"><span>Data inicial</span><input id="checkStart" type="date" onchange="filterChecklists()"></label><label class="filter-field"><span>Data final</span><input id="checkEnd" type="date" onchange="filterChecklists()"></label></div><article class="panel checklist-panel"><div class="table-wrap"><table class="data-table"><thead><tr><th>Data</th><th>Equipamento</th><th>Tipo</th><th>Responsável</th><th>Empresa</th><th>Atividade / Local</th><th>Resultado</th><th>Via física</th><th></th></tr></thead><tbody>${inspections.map(item=>{const eq=equipments.find(e=>e.id===item.equipmentId);const failed=inspectionHasFailure(item.inspection);return `<tr class="checklist-record-row" data-id="${item.id}" data-person="${esc(item.person)}" data-equipment="${item.equipmentId}" data-mode="${item.inspection.mode}" data-date="${item.date.slice(0,10)}"><td>${fullDate(item.date)}</td><td><strong>${esc(eq?.code||'—')}</strong><small class="table-sub">${esc(eq?.model||'')}</small></td><td>${item.inspection.mode==='devolucao'?'<span class="status available">Devolução</span>':'<span class="status in-use">Retirada</span>'}</td><td><strong>${esc(item.person)}</strong></td><td>${esc(item.company)}</td><td><strong>${esc(item.activity||'—')}</strong><small class="table-sub">${esc(item.dataHall||item.place)} · ${esc(item.location||'')}</small></td><td><span class="status ${failed?'maintenance':'available'}">${failed?'Reprovado':'Aprovado'}</span></td><td>${item.inspection.physicalFiled?'<span class="physical-ok">✓ Confirmada</span>':'<span class="muted-dash">Pendente</span>'}</td><td><button class="table-action" onclick="openInspectionRecord(${item.id})">${icon('download')} PDF / visualizar</button></td></tr>`;}).join('')}</tbody></table></div>${inspections.length?'':`<div class="checklist-empty"><span>${icon('file')}</span><h2>Nenhum checklist digital preenchido</h2><p>Você já pode imprimir o formulário físico em branco. Os registros digitais aparecerão aqui após a primeira retirada ou devolução.</p><button class="button button-green" onclick="openBlankInspectionTemplate()">${icon('print')} Imprimir formulário físico</button></div>`}<div class="no-filter-results" id="noChecklistResults">Nenhum checklist encontrado com estes filtros.</div></article>`;
}
function filterChecklists() {
  const person=document.getElementById('checkPerson').value; const equipment=document.getElementById('checkEquipment').value; const mode=document.getElementById('checkMode').value; const start=document.getElementById('checkStart').value; const end=document.getElementById('checkEnd').value; let visible=0;
  document.querySelectorAll('.checklist-record-row').forEach(row=>{const show=(!person||row.dataset.person===person)&&(!equipment||row.dataset.equipment===equipment)&&(!mode||row.dataset.mode===mode)&&(!start||row.dataset.date>=start)&&(!end||row.dataset.date<=end);row.style.display=show?'':'none';if(show)visible++;});
  const empty=document.getElementById('noChecklistResults'); if(empty)empty.style.display=document.querySelectorAll('.checklist-record-row').length&&!visible?'block':'none';
}
function getFilteredInspections() {
  const rows=[...document.querySelectorAll('.checklist-record-row')];
  if(!rows.length)return getReportFilteredHistory(true);
  const visibleIds=rows.filter(row=>row.style.display!=='none').map(row=>Number(row.dataset.id)); return history.filter(item=>visibleIds.includes(item.id)&&item.inspection);
}
function exportChecklistExcel() {
  if(!window.XLSX) return toast('O gerador de Excel ainda está carregando. Tente novamente em alguns segundos.',true);
  const records=getFilteredInspections(); if(!records.length)return toast('Nenhum checklist selecionado pelos filtros.',true);
  const headers=['Data','Tipo','Patrimônio','Modelo','Responsável','Empresa','Atividade','Data Hall','Local','Horímetro','Resultado','Via física arquivada',...checklistItems.map(item=>item.title),'Observações'];
  const rows=records.map(item=>{const eq=equipments.find(e=>e.id===item.equipmentId);return [fullDate(item.date),item.inspection.mode==='devolucao'?'Devolução':'Retirada',eq?.code||'',eq?.model||'',item.person,item.company,item.activity||'',item.dataHall||item.place||'',item.location||'',item.inspection.hourmeter,inspectionHasFailure(item.inspection)?'Reprovado':'Aprovado',item.inspection.physicalFiled?'Sim':'Não',...item.inspection.answers,item.inspection.observations||''];});
  const sheet=XLSX.utils.aoa_to_sheet([headers,...rows]); sheet['!cols']=headers.map((header,index)=>({wch:index>=11?18:Math.min(32,Math.max(12,header.length+2))})); const book=XLSX.utils.book_new(); XLSX.utils.book_append_sheet(book,sheet,'Checklists'); XLSX.writeFile(book,`checklists-obraflow-${new Date().toISOString().slice(0,10)}.xlsx`); toast(`${records.length} checklist(s) exportado(s) para Excel.`);
}
function openBlankInspectionTemplate() {
  const eq={code:'',name:'',model:'',serial:''}; const movement={company:'',person:'',activity:'',dataHall:'',location:'',inspection:{mode:'retirada',inspectedAt:'',hourmeter:'',operatorSign:'',observations:'',answers:Array(checklistItems.length).fill('')}};
  modal(`${modalHead('Modelo do formulário de verificação','FV-MAQ-ST · modelo em branco')}<div class="modal-body inspection-record">${printableInspection(eq,movement)}</div><div class="modal-foot"><button class="button button-outline" onclick="closeModal()">Fechar</button><button class="button button-dark" onclick="window.print()">${icon('download')} Imprimir / salvar PDF</button></div>`,'modal-paper'); document.querySelector('.modal-backdrop').classList.add('print-area','inspection-print-area');
}

function renderCompanies() {
  const companies=[...new Set(workforce.map(person=>person.company))].sort((a,b)=>a.localeCompare(b,'pt-BR'));
  document.getElementById('app').innerHTML = `${pageHeader('Empresas & efetivo', 'Cadastre manualmente ou importe a planilha completa da obra.', 'CADASTRO CENTRAL', `<button class="button button-outline" onclick="openWorkforceModal()">${icon('download')} Importar Excel</button><button class="button button-outline" onclick="exportWorkforceExcel()">${icon('download')} Exportar Excel</button><button class="button button-green" onclick="openPersonModal()">${icon('plus')} Adicionar pessoa</button>`)}<section class="workforce-summary"><div><span>${icon('building')}</span><p><strong>${companies.length}</strong><small>Empresas</small></p></div><div><span>${icon('user')}</span><p><strong>${workforce.length}</strong><small>Pessoas cadastradas</small></p></div><div class="workforce-source"><p><small>Última atualização</small><strong>${esc(workforceMeta.source||'Cadastro manual')}</strong><span>${workforceMeta.updatedAt?`${new Intl.DateTimeFormat('pt-BR').format(new Date(workforceMeta.updatedAt))}`:''}</span></p></div></section><div class="simple-filters workforce-filters"><label class="search-box">${icon('search')}<input id="workforceSearch" type="search" placeholder="Buscar nome, função ou empresa..." oninput="filterWorkforce()"></label><label class="filter-field"><span>Empresa</span><select id="workforceCompany" onchange="filterWorkforce()"><option value="">Todas</option>${companies.map(company=>`<option>${esc(company)}</option>`).join('')}</select></label></div><article class="panel"><div class="panel-head"><div><h2>Pessoas cadastradas</h2><p>Disponíveis na lista de responsáveis dos checklists</p></div></div><div class="table-wrap"><table class="data-table"><thead><tr><th>Nome</th><th>Empresa</th><th>Função</th><th>Vínculo</th><th></th></tr></thead><tbody>${workforce.map((person,index)=>`<tr class="workforce-row" data-company="${esc(person.company)}" data-search="${esc(`${person.name} ${person.company} ${person.role||''}`.toLowerCase())}"><td><strong>${esc(person.name)}</strong></td><td>${esc(person.company)}</td><td>${esc(person.role||'—')}</td><td>${esc(person.status||'—')}</td><td><div class="control-row-actions"><button class="icon-button" title="Editar" onclick="openPersonModal(${index})">${icon('edit')}</button><button class="icon-button" title="Excluir" onclick="deletePerson(${index})">${icon('trash')}</button></div></td></tr>`).join('')}</tbody></table></div><div class="no-filter-results" id="noWorkforceResults">Nenhuma pessoa encontrada.</div></article>`;
}
function filterWorkforce() {
  const search=document.getElementById('workforceSearch').value.toLowerCase(); const company=document.getElementById('workforceCompany').value; let visible=0;
  document.querySelectorAll('.workforce-row').forEach(row=>{const show=(!search||row.dataset.search.includes(search))&&(!company||row.dataset.company===company);row.style.display=show?'':'none';if(show)visible++;});
  document.getElementById('noWorkforceResults').style.display=visible?'none':'block';
}
function openPersonModal(index=null) {
  const person=index===null?null:workforce[index]; const companies=[...new Set(workforce.map(item=>item.company))].sort((a,b)=>a.localeCompare(b,'pt-BR'));
  modal(`<form onsubmit="savePerson(event,${index===null?'null':index})">${modalHead(person?'Editar pessoa':'Adicionar pessoa','Cadastro individual do efetivo da obra')}<div class="modal-body"><div class="form-grid"><div class="field full"><label>Empresa <em>*</em></label><input name="company" required list="companySuggestions" placeholder="Selecione ou digite uma nova empresa" value="${esc(person?.company||'')}"><datalist id="companySuggestions">${companies.map(company=>`<option value="${esc(company)}"></option>`).join('')}</datalist></div><div class="field full"><label>Nome completo <em>*</em></label><input name="name" required placeholder="Nome da pessoa" value="${esc(person?.name||'')}"></div><div class="field"><label>Função <em>*</em></label><input name="role" required placeholder="Ex.: Operador de PTA" value="${esc(person?.role||'')}"></div><div class="field"><label>Vínculo / status</label><select name="status"><option value="">Não informado</option><option value="DIRETA" ${person?.status==='DIRETA'?'selected':''}>Direta</option><option value="INDIRETA" ${person?.status==='INDIRETA'?'selected':''}>Indireta</option><option value="TERCEIRO" ${person?.status==='TERCEIRO'?'selected':''}>Terceiro</option></select></div><div class="field full"><label>Telefone</label><input name="phone" placeholder="(85) 99999-9999" value="${esc(person?.phone||'')}"></div></div></div><div class="modal-foot"><button type="button" class="button button-outline" onclick="closeModal()">Cancelar</button><button class="button button-green">${icon('check')} Salvar pessoa</button></div></form>`,'modal-small');
}
function savePerson(event,index) {
  event.preventDefault(); const data=Object.fromEntries(new FormData(event.target)); Object.keys(data).forEach(key=>data[key]=String(data[key]).replace(/\s+/g,' ').trim());
  const duplicate=workforce.some((person,i)=>i!==index&&person.company.toLowerCase()===data.company.toLowerCase()&&person.name.toLowerCase()===data.name.toLowerCase()); if(duplicate)return toast('Esta pessoa já está cadastrada nesta empresa.',true);
  if(index===null) { if(!data.id) data.id=crypto.randomUUID(); workforce.push(data); supabase.from('workforce').upsert(data); } else { workforce[index]={...workforce[index],...data}; supabase.from('workforce').upsert(workforce[index]); } workforce.sort((a,b)=>a.company.localeCompare(b.company,'pt-BR')||a.name.localeCompare(b.name,'pt-BR')); workforceMeta={source:'Cadastro manual',updatedAt:new Date().toISOString()}; supabase.from('app_metadata').upsert({key:'workforce_meta',value:workforceMeta}); closeModal(); renderCompanies(); toast(personMessage(index));
}
function personMessage(index) { return index===null?'Pessoa adicionada ao efetivo.':'Cadastro atualizado.'; }
function deletePerson(index) {
  const person=workforce[index]; if(!person||!confirm(`Excluir ${person.name} da lista de efetivo?`))return; workforce.splice(index,1); supabase.from('workforce').delete().eq('id', person.id); renderCompanies(); toast('Pessoa removida da lista.');
}
function openWorkforceModal() {
  const companies=[...new Set(workforce.map(person=>person.company))].sort((a,b)=>a.localeCompare(b,'pt-BR'));
  modal(`${modalHead('Atualizar empresas e efetivo','Importe uma nova versão do relatório em Excel')}<div class="modal-body"><div class="upload-zone" onclick="document.getElementById('workforceFile').click()"><span>${icon('download')}</span><div><h3>Selecionar planilha de efetivo</h3><p>Formatos .xlsx ou .xls · a aba mais recente será importada</p></div><button type="button" class="button button-outline compact">Escolher arquivo</button><input id="workforceFile" type="file" accept=".xlsx,.xls" hidden onchange="handleWorkforceUpload(event)"></div><div class="upload-info"><span>${icon('check')}</span><div><strong>${workforce.length} pessoas em ${companies.length} empresas</strong><small>${esc(workforceMeta.source||'Base inicial ainda não carregada')}</small></div></div><div class="company-chips">${companies.map(company=>`<span>${esc(company)} <b>${workforce.filter(person=>person.company===company).length}</b></span>`).join('')}</div><div class="notice">${icon('alert')} Ao importar uma nova planilha, a lista de empresas e pessoas será atualizada. Os checklists e as movimentações já registrados não serão apagados.</div></div><div class="modal-foot"><button class="button button-outline" onclick="exportWorkforceExcel()">${icon('download')} Exportar efetivo atual</button><button class="button button-green" onclick="closeModal()">Fechar</button></div>`,'modal-small');
}
async function handleWorkforceUpload(event) {
  const file=event.target.files?.[0]; if(!file) return;
  if(!window.XLSX) { event.target.value=''; return toast('Leitor de Excel ainda carregando. Tente novamente em alguns segundos.',true); }
  try {
    const bytes=await file.arrayBuffer(); const workbook=XLSX.read(bytes,{type:'array'}); const sheetName=workbook.SheetNames[workbook.SheetNames.length-1]; const rows=XLSX.utils.sheet_to_json(workbook.Sheets[sheetName],{header:1,defval:''});
    const imported=[]; const seen=new Set();
    rows.forEach(row=>{const company=String(row[1]||'').replace(/\s+/g,' ').trim();const name=String(row[2]||'').replace(/\s+/g,' ').trim();const role=String(row[5]||row[3]||'').replace(/\s+/g,' ').trim();const status=String(row[4]||'').replace(/\s+/g,' ').trim();if(!company||!name||name.length<4||/empresa|obras:|referente|pc:/i.test(company)||/^nome$/i.test(name))return;const key=`${company.toUpperCase()}|${name.toUpperCase()}`;if(seen.has(key))return;seen.add(key);imported.push({company,name,role,status});});
    if(!imported.length) throw new Error('Nenhuma pessoa foi identificada nas colunas Empresa e Nome.');
    workforce=imported.sort((a,b)=>a.company.localeCompare(b.company,'pt-BR')||a.name.localeCompare(b.name,'pt-BR')); workforceMeta={source:file.name,updatedAt:new Date().toISOString()}; supabase.from('app_metadata').upsert({key:'workforce_meta',value:workforceMeta}); for(const p of workforce){ if(!p.id) p.id=crypto.randomUUID(); supabase.from('workforce').upsert(p); } openWorkforceModal(); toast(`${workforce.length} pessoas importadas da aba ${sheetName}.`);
  } catch(error) { toast(error.message||'Não foi possível ler esta planilha.',true); }
}
function exportWorkforceExcel() {
  if(!window.XLSX)return toast('O gerador de Excel ainda está carregando. Tente novamente em alguns segundos.',true);
  const selectedWorkforce=getReportFilteredWorkforce(); if(!selectedWorkforce.length)return toast('Nenhuma pessoa encontrada com os filtros selecionados.',true); const rows=[['ITEM','EMPRESA','NOME','FUNÇÃO AUXILIAR','VÍNCULO / STATUS','FUNÇÃO','TELEFONE'],...selectedWorkforce.map((person,index)=>[index+1,person.company||'',person.name||'','',person.status||'',person.role||'',person.phone||''])];
  const sheet=XLSX.utils.aoa_to_sheet(rows); sheet['!cols']=[{wch:8},{wch:32},{wch:36},{wch:18},{wch:20},{wch:28},{wch:18}];
  const book=XLSX.utils.book_new(); XLSX.utils.book_append_sheet(book,sheet,'Efetivo atualizado');
  XLSX.writeFile(book,`efetivo-atual-${new Date().toISOString().slice(0,10)}.xlsx`); toast('Planilha atual do efetivo exportada.');
}
function renderLocations() {
  const halls = Array.from({length:10},(_,i)=>`Data Hall ${String(i+1).padStart(2,'0')}`);
  document.getElementById('app').innerHTML = `${pageHeader('Locais & Data Halls', 'Visão da distribuição de equipamentos por área da obra.', 'MAPA OPERACIONAL')}<section class="equipment-cards">${halls.map(h=>{const items=equipments.filter(e=>e.usage?.dataHall===h);return `<article class="asset-card"><div class="asset-card-top"><span class="asset-icon">${icon('location')}</span><span class="status ${items.length?'in-use':'available'}">${items.length?`${items.length} ativo${items.length>1?'s':''}`:'Livre'}</span></div><h3>${h}</h3><div class="asset-code">Área operacional monitorada</div><div class="asset-meta"><div><span>Em operação</span><strong>${items.length}</strong></div><div><span>Empresas</span><strong>${new Set(items.map(e=>e.usage?.company)).size}</strong></div></div>${items.map(e=>`<div class="primary-text"><strong>${esc(e.code)} · ${esc(e.name)}</strong><small>${esc(e.usage.responsible)}</small></div>`).join('')}</article>`;}).join('')}</section>`;
}
function renderReports() {
  const totalUses = history.filter(h=>h.action==='withdraw').length;
  document.getElementById('app').innerHTML = `${pageHeader('Relatórios', 'Baixe documentos completos em PDF ou planilhas para conferência.', 'CENTRAL DE DOCUMENTOS')}<section class="metrics-grid">${metric('RETIRADAS REGISTRADAS',totalUses,'no histórico','blue','swap',100)}${metric('CHECKLISTS CONCLUÍDOS',history.filter(h=>h.inspection).length,'formulários digitais','green','check',100)}${metric('TAXA DE DISPONIBILIDADE',`${Math.round(equipments.filter(e=>e.status==='available').length/Math.max(1,equipments.length)*100)}%`,'da frota','green','chart',Math.round(equipments.filter(e=>e.status==='available').length/Math.max(1,equipments.length)*100))}${metric('EM USO',equipments.filter(e=>e.status==='in-use').length,'equipamentos agora','amber','lift',Math.round(equipments.filter(e=>e.status==='in-use').length/Math.max(1,equipments.length)*100))}</section><section class="report-grid"><article class="report-card"><span>${icon('swap')}</span><div><h2>Uso e movimentações das PTAs</h2><p>Quem está usando, empresa, atividade, Data Hall, local, retirada, previsão de devolução e histórico.</p></div><div class="report-actions"><button class="button button-dark" onclick="openReportPDF('usage')">${icon('download')} Baixar PDF</button><button class="button button-outline" onclick="exportCSV()">${icon('download')} Baixar planilha</button></div></article><article class="report-card"><span>${icon('file')}</span><div><h2>Checklists PEMT</h2><p>Relação de inspeções, resultado, via física, equipamento, responsável, empresa e localização.</p></div><div class="report-actions"><button class="button button-dark" onclick="openReportPDF('checklists')">${icon('download')} Baixar PDF</button><button class="button button-outline" onclick="exportChecklistExcel()">${icon('download')} Baixar Excel</button></div></article><article class="report-card"><span>${icon('lift')}</span><div><h2>Cadastro de PTAs e paleteiras</h2><p>Inventário completo com patrimônio, modelo, chassi, horímetro, bateria, empreiteiro e status.</p></div><div class="report-actions"><button class="button button-dark" onclick="openReportPDF('equipment')">${icon('download')} Baixar PDF</button><button class="button button-outline" onclick="exportEquipmentsExcel()">${icon('download')} Baixar Excel</button></div></article><article class="report-card"><span>${icon('user')}</span><div><h2>Empresas e efetivo</h2><p>Lista completa de colaboradores com empresa, função, vínculo e telefone cadastrado.</p></div><div class="report-actions"><button class="button button-dark" onclick="openReportPDF('workforce')">${icon('download')} Baixar PDF</button><button class="button button-outline" onclick="exportWorkforceExcel()">${icon('download')} Baixar Excel</button></div></article></section><div class="report-tip">${icon('file')} Ao clicar em <strong>Baixar PDF</strong>, use a opção <strong>Salvar como PDF</strong> na janela de impressão do navegador.</div>`;
  document.querySelector('.report-grid').insertAdjacentHTML('beforebegin',reportFiltersHTML());
  updateReportFilterSummary();
}

function reportFiltersHTML() {
  const unique=values=>[...new Set(values.filter(Boolean))].sort((a,b)=>a.localeCompare(b,'pt-BR'));
  const companies=unique([...workforce.map(person=>person.company),...history.map(item=>item.company),...equipments.map(eq=>eq.usage?.company)]);
  const people=unique([...workforce.map(person=>person.name),...history.map(item=>item.person),...equipments.map(eq=>eq.usage?.responsible)]);
  const types=unique(equipments.map(eq=>eq.type));
  const halls=unique([...history.map(item=>item.dataHall||item.place),...equipments.map(eq=>eq.usage?.dataHall)]);
  const options=items=>items.map(item=>`<option value="${esc(item)}">${esc(item)}</option>`).join('');
  return `<section class="report-filter-panel"><div class="report-filter-head"><div><span>${icon('search')}</span><div><h2>Filtrar antes de baixar</h2><p>Os filtros abaixo serão aplicados aos PDFs e às planilhas.</p></div></div><button class="button button-outline compact" onclick="clearReportFilters()">Limpar filtros</button></div><div class="report-filter-grid"><label class="filter-field"><span>Empresa</span><select id="reportCompany" onchange="updateReportFilterSummary()"><option value="">Todas</option>${options(companies)}</select></label><label class="filter-field"><span>Pessoa / responsável</span><select id="reportPerson" onchange="updateReportFilterSummary()"><option value="">Todas</option>${options(people)}</select></label><label class="filter-field"><span>Equipamento</span><select id="reportEquipment" onchange="updateReportFilterSummary()"><option value="">Todos</option>${equipments.map(eq=>`<option value="${eq.id}">${esc(eq.code)} — ${esc(eq.model||eq.name)}</option>`).join('')}</select></label><label class="filter-field"><span>Status atual</span><select id="reportStatus" onchange="updateReportFilterSummary()"><option value="">Todos</option><option value="in-use">Em uso</option><option value="available">Disponível</option><option value="maintenance">Em manutenção</option></select></label><label class="filter-field"><span>Tipo de equipamento</span><select id="reportType" onchange="updateReportFilterSummary()"><option value="">Todos</option>${options(types)}</select></label><label class="filter-field"><span>Data Hall / área</span><select id="reportHall" onchange="updateReportFilterSummary()"><option value="">Todos</option>${options(halls)}</select></label><label class="filter-field"><span>Resultado do checklist</span><select id="reportResult" onchange="updateReportFilterSummary()"><option value="">Todos</option><option value="approved">Aprovado</option><option value="failed">Reprovado</option></select></label><label class="filter-field"><span>Data inicial</span><input id="reportStart" type="date" onchange="updateReportFilterSummary()"></label><label class="filter-field"><span>Data final</span><input id="reportEnd" type="date" onchange="updateReportFilterSummary()"></label></div><div class="report-filter-summary" id="reportFilterSummary"></div></section>`;
}
function reportFilterValues() {
  const value=id=>document.getElementById(id)?.value||'';
  return {company:value('reportCompany'),person:value('reportPerson'),equipment:value('reportEquipment'),status:value('reportStatus'),type:value('reportType'),hall:value('reportHall'),result:value('reportResult'),start:value('reportStart'),end:value('reportEnd')};
}
function reportDateMatches(value,start,end) {
  if(!start&&!end)return true; if(!value)return false; const date=String(value).slice(0,10); return (!start||date>=start)&&(!end||date<=end);
}
function getReportFilteredEquipments() {
  const f=reportFilterValues();
  return equipments.filter(eq=>(!f.equipment||eq.id===f.equipment)&&(!f.status||eq.status===f.status)&&(!f.type||eq.type===f.type)&&(!f.company||eq.usage?.company===f.company)&&(!f.person||eq.usage?.responsible===f.person)&&(!f.hall||eq.usage?.dataHall===f.hall));
}
function getReportFilteredHistory(inspectionOnly=false) {
  const f=reportFilterValues();
  return history.filter(item=>{const eq=equipments.find(e=>e.id===item.equipmentId);return (!inspectionOnly||item.inspection)&&(!f.company||item.company===f.company)&&(!f.person||item.person===f.person)&&(!f.equipment||item.equipmentId===f.equipment)&&(!f.status||eq?.status===f.status)&&(!f.type||eq?.type===f.type)&&(!f.hall||(item.dataHall||item.place)===f.hall)&&reportDateMatches(item.date,f.start,f.end)&&(!f.result||(item.inspection&&(f.result==='failed')===inspectionHasFailure(item.inspection)));});
}
function getReportFilteredWorkforce() {
  const f=reportFilterValues(); return workforce.filter(person=>(!f.company||person.company===f.company)&&(!f.person||person.name===f.person));
}
function reportFilterCaption() {
  const f=reportFilterValues(); const parts=[];
  const selected=(id,value)=>document.querySelector(`#${id} option[value="${CSS.escape(value)}"]`)?.textContent||value;
  if(f.company)parts.push(`Empresa: ${f.company}`); if(f.person)parts.push(`Pessoa: ${f.person}`); if(f.equipment)parts.push(`Equipamento: ${selected('reportEquipment',f.equipment)}`); if(f.status)parts.push(`Status: ${selected('reportStatus',f.status)}`); if(f.type)parts.push(`Tipo: ${f.type}`); if(f.hall)parts.push(`Local: ${f.hall}`); if(f.result)parts.push(`Checklist: ${selected('reportResult',f.result)}`); if(f.start)parts.push(`De: ${new Intl.DateTimeFormat('pt-BR',{timeZone:'UTC'}).format(new Date(`${f.start}T00:00:00Z`))}`); if(f.end)parts.push(`Até: ${new Intl.DateTimeFormat('pt-BR',{timeZone:'UTC'}).format(new Date(`${f.end}T00:00:00Z`))}`);
  return parts.join(' · ');
}
function updateReportFilterSummary() {
  const target=document.getElementById('reportFilterSummary'); if(!target)return;
  const equipmentCount=getReportFilteredEquipments().length; const movements=getReportFilteredHistory().length; const checklists=getReportFilteredHistory(true).length; const people=getReportFilteredWorkforce().length; const caption=reportFilterCaption();
  target.innerHTML=`<span>${icon('check')} <strong>${caption?'Filtros aplicados':'Sem filtros: todos os registros'}</strong></span><span>${equipmentCount} equipamento(s) · ${movements} movimentação(ões) · ${checklists} checklist(s) · ${people} pessoa(s)</span>`;
}
function clearReportFilters() {
  document.querySelectorAll('.report-filter-grid select,.report-filter-grid input').forEach(field=>field.value=''); updateReportFilterSummary();
}

function reportStatus(eq) {
  return eq.status==='in-use'?'EM USO':eq.status==='maintenance'?'MANUTENÇÃO':'DISPONÍVEL';
}
function reportAction(action) {
  return action==='withdraw'?'RETIRADA':action==='return'?'DEVOLUÇÃO':'OCORRÊNCIA / AVARIA';
}
function reportTable(headers, rows, emptyText='Nenhum registro encontrado.') {
  if(!rows.length)return `<div class="report-empty">${esc(emptyText)}</div>`;
  return `<table class="report-table"><thead><tr>${headers.map(header=>`<th>${esc(header)}</th>`).join('')}</tr></thead><tbody>${rows.map(row=>`<tr>${row.map(value=>`<td>${esc(value??'')}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
}
function reportDocument(title, subtitle, content, summary='') {
  const issued=new Intl.DateTimeFormat('pt-BR',{dateStyle:'long',timeStyle:'short'}).format(new Date());
  return `<article class="report-document"><header class="report-document-head"><div class="report-logos"><img src="assets/heating-cooling-logo.jpg" alt="Heating Cooling"><img src="assets/afonso-franca-logo.png" alt="Afonso França Engenharia"></div><div><small>OBRAFLOW · DATA CENTER FORTALEZA</small><h1>${esc(title)}</h1><p>${esc(subtitle)}</p></div><aside><strong>Emitido em</strong><span>${esc(issued)}</span></aside></header>${summary?`<div class="report-summary">${summary}</div>`:''}${content}<footer class="report-footer">Documento gerado pelo ObraFlow · Gestão HVAC · ${esc(issued)}</footer></article>`;
}
function openReportPDF(type, filtered=false) {
  let title='Relatório'; let subtitle=''; let content=''; let summary='';
  if(type==='usage') {
    title='Utilização e movimentações de PTAs'; subtitle='Situação atual da frota e histórico operacional';
    const selectedEquipments=getReportFilteredEquipments(); const selectedHistory=getReportFilteredHistory();
    const currentRows=selectedEquipments.map(eq=>[eq.code,eq.model||eq.name,reportStatus(eq),eq.usage?.responsible||'—',eq.usage?.company||'—',eq.usage?.activity||'—',eq.usage?`${eq.usage.dataHall||''} · ${eq.usage.location||''}`:'Pátio / Base',eq.usage?.startedAt?fullDate(eq.usage.startedAt):'—',eq.usage?.expectedAt?fullDate(eq.usage.expectedAt):'—']);
    const historyRows=selectedHistory.map(item=>{const eq=equipments.find(e=>e.id===item.equipmentId);return [fullDate(item.date),eq?.code||'—',reportAction(item.action),item.person||'—',item.company||'—',item.activity||'—',`${item.dataHall||item.place||'—'}${item.location?` · ${item.location}`:''}`];});
    summary=`<span><b>${selectedEquipments.length}</b> equipamentos</span><span><b>${selectedEquipments.filter(e=>e.status==='in-use').length}</b> em uso</span><span><b>${selectedEquipments.filter(e=>e.status==='available').length}</b> disponíveis</span><span><b>${selectedHistory.length}</b> movimentações</span>`;
    content=`<section class="report-section"><h2>Situação atual</h2>${reportTable(['Patrimônio','Modelo','Status','Responsável','Empresa','Atividade','DH / Local','Retirada','Devolução prevista'],currentRows)}</section><section class="report-section"><h2>Histórico operacional</h2>${reportTable(['Data e hora','Equipamento','Movimentação','Responsável','Empresa','Atividade','DH / Local'],historyRows,'Ainda não existem movimentações registradas.')}</section>`;
  } else if(type==='checklists') {
    title='Relatório de checklists PEMT'; subtitle=filtered?'Registros selecionados pelos filtros da tela':'Todos os formulários digitais registrados';
    const records=filtered?getFilteredInspections():getReportFilteredHistory(true);
    const rows=records.map(item=>{const eq=equipments.find(e=>e.id===item.equipmentId);return [fullDate(item.date),eq?.code||'—',item.inspection.mode==='devolucao'?'Devolução':'Retirada',item.person||'—',item.company||'—',item.activity||'—',`${item.dataHall||item.place||'—'}${item.location?` · ${item.location}`:''}`,inspectionHasFailure(item.inspection)?'REPROVADO':'APROVADO',item.inspection.physicalFiled?'Confirmada':'Pendente',item.inspection.hourmeter?`${item.inspection.hourmeter} h`:'—'];});
    summary=`<span><b>${records.length}</b> formulários</span><span><b>${records.filter(item=>!inspectionHasFailure(item.inspection)).length}</b> aprovados</span><span><b>${records.filter(item=>inspectionHasFailure(item.inspection)).length}</b> reprovados</span><span><b>${records.filter(item=>item.inspection.physicalFiled).length}</b> vias físicas confirmadas</span>`;
    content=`<section class="report-section"><h2>Formulários registrados</h2>${reportTable(['Data','Equipamento','Tipo','Responsável','Empresa','Atividade','DH / Local','Resultado','Via física','Horímetro'],rows,'Nenhum checklist encontrado.')}</section>`;
  } else if(type==='equipment') {
    title='Cadastro de PTAs e paleteiras'; subtitle='Inventário atualizado de equipamentos';
    const selectedEquipments=getReportFilteredEquipments(); const rows=selectedEquipments.map(eq=>[eq.code,eq.type||'—',eq.model||eq.name,eq.serial||'—',eq.hourmeter??'—',eq.battery||'—',eq.contractor||'—',eq.invoice||'—',reportStatus(eq)]);
    summary=`<span><b>${selectedEquipments.length}</b> equipamentos</span><span><b>${selectedEquipments.filter(e=>e.status==='available').length}</b> disponíveis</span><span><b>${selectedEquipments.filter(e=>e.status==='in-use').length}</b> em uso</span><span><b>${selectedEquipments.filter(e=>e.status==='maintenance').length}</b> em manutenção</span>`;
    content=`<section class="report-section"><h2>Inventário da frota</h2>${reportTable(['Patrimônio','Tipo','Modelo / descrição','Chassi','Horímetro','Bateria','Empreiteiro','NF','Status'],rows)}</section>`;
  } else if(type==='workforce') {
    title='Empresas e efetivo'; subtitle='Relação atualizada de colaboradores da obra';
    const selectedWorkforce=getReportFilteredWorkforce(); const companies=[...new Set(selectedWorkforce.map(person=>person.company))]; const rows=selectedWorkforce.map(person=>[person.name||'—',person.company||'—',person.role||'—',person.status||'—',person.phone||'—']);
    summary=`<span><b>${selectedWorkforce.length}</b> colaboradores</span><span><b>${companies.length}</b> empresas</span><span><b>${workforceMeta.source?'Planilha':'Manual'}</b> origem da base</span>`;
    content=`<section class="report-section"><h2>Efetivo cadastrado</h2>${reportTable(['Nome','Empresa','Função','Vínculo / Status','Telefone'],rows,'Nenhum colaborador cadastrado.')}</section>`;
  } else return;
  const filterCaption=reportFilterCaption(); if(filterCaption)content=`<div class="report-filter-caption"><strong>Filtros aplicados:</strong> ${esc(filterCaption)}</div>${content}`;
  modal(`${modalHead(title,'Visualize antes de imprimir ou salvar')}<div class="modal-body report-preview">${reportDocument(title,subtitle,content,summary)}</div><div class="modal-foot"><button class="button button-outline" onclick="closeModal()">Fechar</button><button class="button button-dark" onclick="window.print()">${icon('download')} Imprimir / salvar PDF</button></div>`,'modal-paper');
  document.querySelector('.modal-backdrop').classList.add('print-area','report-print-area');
}

function modal(content, size = '') {
  document.getElementById('modalRoot').innerHTML = `<div class="modal-backdrop" onclick="if(event.target===this)closeModal()"><div class="modal ${size}">${content}</div></div>`;
  document.body.style.overflow = 'hidden';
}
function closeModal() { document.getElementById('modalRoot').innerHTML = ''; document.body.style.overflow = ''; if(location.hash.startsWith('#scan/')) window.history.replaceState(null,'','#dashboard'); }
function modalHead(title, subtitle='') { return `<div class="modal-head"><div><h2>${title}</h2>${subtitle?`<p>${subtitle}</p>`:''}</div><button class="icon-button" onclick="closeModal()">${icon('close')}</button></div>`; }

function openEquipmentModal(id = null) {
  const eq = id ? equipments.find(e=>e.id===id) : null;
  modal(`<form id="equipmentForm" onsubmit="saveEquipment(event,'${id||''}')">${modalHead(eq?'Editar equipamento':'Novo equipamento',eq?'Atualize os dados do ativo':'Cadastre um ativo e gere seu QR Code')}<div class="modal-body"><div class="form-grid"><div class="field"><label>Tipo de equipamento <em>*</em></label><select name="type" required><option value="">Selecione...</option>${['PTA Tesoura','PTA Articulada','PTA Mastro','Paleteira Elétrica'].map(v=>`<option ${eq?.type===v?'selected':''}>${v}</option>`).join('')}</select></div><div class="field"><label>Código de identificação <em>*</em></label><input name="code" required placeholder="Ex.: PTA-007" value="${esc(eq?.code||'')}"></div><div class="field full"><label>Nome do equipamento <em>*</em></label><input name="name" required placeholder="Ex.: Plataforma Tesoura 10m" value="${esc(eq?.name||'')}"></div><div class="field"><label>Fabricante <em>*</em></label><input name="brand" required placeholder="Ex.: JLG" value="${esc(eq?.brand||'')}"></div><div class="field"><label>Modelo <em>*</em></label><input name="model" required placeholder="Ex.: 2646ES" value="${esc(eq?.model||'')}"></div><div class="field"><label>Número de série</label><input name="serial" placeholder="Número do fabricante" value="${esc(eq?.serial||'')}"></div><div class="field"><label>Capacidade</label><input name="capacity" placeholder="Ex.: 450 kg" value="${esc(eq?.capacity||'')}"></div><div class="field"><label>Status inicial</label><select name="status"><option value="available" ${!eq||eq.status==='available'?'selected':''}>Disponível</option><option value="maintenance" ${eq?.status==='maintenance'?'selected':''}>Em manutenção</option></select></div><div class="field"><label>Data da última inspeção</label><input name="inspection" type="date" value="${eq?.inspection||new Date().toISOString().slice(0,10)}"></div></div></div><div class="modal-foot"><button type="button" class="button button-outline" onclick="closeModal()">Cancelar</button><button class="button button-green" type="submit">${icon('check')} ${eq?'Salvar alterações':'Cadastrar equipamento'}</button></div></form>`, 'modal-large');
}
function saveEquipment(event, id) {
  event.preventDefault(); const data = Object.fromEntries(new FormData(event.target));
  if (equipments.some(e => e.code.toLowerCase() === data.code.toLowerCase() && e.id !== id)) return toast('Este código já está cadastrado.', true);
  if (id) {
    const index = equipments.findIndex(e=>e.id===id); equipments[index] = { ...equipments[index], ...data, status: equipments[index].status==='in-use' ? 'in-use' : data.status };
  } else {
    const newId = `${data.type.includes('Paleteira')?'pal':'pta'}-${Date.now()}`; equipments.unshift({ id:newId, ...data, usage:null });
  }
  save(); closeModal(); render(); toast(id?'Equipamento atualizado com sucesso.':'Equipamento cadastrado. QR Code pronto para impressão.');
}

function openEquipmentDetails(id) {
  const eq = equipments.find(e=>e.id===id); if (!eq) return;
  if (eq.status === 'available') return openCheckoutModal(id);
  const usage = eq.usage;
  modal(`${modalHead(eq.name,`${eq.code} · ${eq.brand} ${eq.model}`)}<div class="modal-body"><div class="equipment-summary"><span class="asset-icon">${equipmentIcon(eq)}</span><div><strong>${esc(eq.name)}</strong><small>Série ${esc(eq.serial)} · Horímetro ${esc(eq.hourmeter ?? '—')} h${eq.battery?` · Bateria ${esc(eq.battery)}`:''}</small></div>${statusBadge(eq.status)}</div>${eq.status==='in-use'?`<div class="form-grid"><div class="field"><label>Empresa</label><strong>${esc(usage.company)}</strong></div><div class="field"><label>Responsável</label><strong>${esc(usage.responsible)}</strong></div><div class="field full"><label>Atividade</label><strong>${esc(usage.activity||'—')}</strong></div><div class="field"><label>DH / Local específico</label><strong>${esc(usage.dataHall)} · ${esc(usage.location)}</strong></div><div class="field"><label>Previsão de entrega</label><strong>${fullDate(usage.expectedAt)}</strong></div><div class="field"><label>Retirada em</label><strong>${fullDate(usage.startedAt)}</strong></div><div class="field"><label>Contato</label><strong>${esc(usage.phone)}</strong></div></div>`:`<div class="notice">${icon(eq.status==='maintenance'?'tool':'check')} ${eq.status==='maintenance'?'Este equipamento está bloqueado para manutenção. Edite o cadastro para liberá-lo após a inspeção.':'Equipamento disponível no Pátio / Base e pronto para retirada.'}</div>`}</div><div class="modal-foot"><button class="button button-ghost" onclick="openEquipmentModal('${id}')">${icon('edit')} Editar</button><button class="button button-outline" onclick="openQRModal('${id}')">${icon('qr')} QR Code</button>${eq.status==='in-use'?`<button class="button button-green" onclick="openReturnModal('${id}')">${icon('return')} Registrar devolução</button>`:''}</div>`);
}

function openCheckoutModal(id) {
  const eq = equipments.find(e=>e.id===id); if (!eq) return;
  const start = nowLocal(); const end = new Date(Date.now()+8*3600000); end.setMinutes(end.getMinutes()-end.getTimezoneOffset());
  modal(`<form id="checkoutForm" onsubmit="submitCheckout(event,'${id}')">${modalHead('Inspeção e liberação de uso','Formulário FV-MAQ-ST obrigatório antes da retirada')}<div class="modal-body">${inspectionFormHTML(eq,'retirada')}<div class="section-title"><span>${icon('location')}</span><div><h3>Planejamento da utilização</h3><small>Atividade, local e previsão de devolução</small></div></div><div class="form-grid"><div class="field"><label>Telefone do responsável</label><input name="phone" placeholder="(85) 99999-9999"></div><div class="field"><label>Atividade a executar <em>*</em></label><input name="activity" required placeholder="Ex.: Instalação de dutos no teto"></div><div class="field"><label>Data Hall — DH <em>*</em></label><select name="dataHall" required><option value="">Selecione...</option>${Array.from({length:10},(_,i)=>`<option>Data Hall ${String(i+1).padStart(2,'0')}</option>`).join('')}<option>Área externa</option><option>Casa de máquinas</option><option>Almoxarifado</option></select></div><div class="field"><label>Local específico <em>*</em></label><input name="location" required placeholder="Ex.: Corredor B / Sala elétrica"></div><div class="field"><label>Início previsto <em>*</em></label><input type="datetime-local" name="startedAt" required value="${start}"></div><div class="field"><label>Devolução prevista <em>*</em></label><input type="datetime-local" name="expectedAt" required value="${end.toISOString().slice(0,16)}"></div></div><label class="terms physical-term"><input type="checkbox" name="physicalCopy" required><span>Confirmo que a via física do formulário PEMT foi preenchida e será arquivada na pasta do colaborador.</span></label><label class="terms"><input type="checkbox" name="terms" required><span>Declaro que realizei pessoalmente esta inspeção, sou autorizado a operar o equipamento e me responsabilizo pelas informações registradas.</span></label></div><div class="modal-foot"><button type="button" class="button button-outline" onclick="closeModal()">Cancelar</button><button class="button button-green" type="submit">${icon('check')} Concluir e retirar</button></div></form>`, 'modal-inspection');
}
function submitCheckout(event, id) {
  event.preventDefault(); const form = event.target; const data = Object.fromEntries(new FormData(form)); const eq = equipments.find(e=>e.id===id); const inspection = inspectionFromData(data,'retirada');
  const hasFailure = inspectionHasFailure(inspection);
  eq.hourmeter=Number(data.hourmeter);
  if (new Date(data.expectedAt) <= new Date(data.startedAt)) return toast('A devolução deve ser posterior ao início.', true);
  if (hasFailure) {
    eq.status='maintenance'; eq.usage=null; history.unshift({id:Date.now(),equipmentId:id,action:'issue',person:data.responsible,company:data.company,place:data.dataHall,date:data.inspectionAt,activity:data.activity,location:data.location,dataHall:data.dataHall,inspection}); save(); closeModal(); render(); return toast('Item reprovado. Formulário salvo e equipamento bloqueado.', true);
  }
  eq.status='in-use'; eq.usage={ company:data.company, responsible:data.responsible, phone:data.phone, activity:data.activity, location:data.location, dataHall:data.dataHall, startedAt:data.startedAt, expectedAt:data.expectedAt };
  history.unshift({id:Date.now(),equipmentId:id,action:'withdraw',person:data.responsible,company:data.company,place:data.dataHall,date:data.startedAt,activity:data.activity,location:data.location,dataHall:data.dataHall,inspection}); save(); closeModal(); render(); toast(`${eq.code} liberado. Formulário de retirada salvo.`);
}

function openReturnModal(id) {
  const eq=equipments.find(e=>e.id===id); if(!eq) return;
  modal(`<form onsubmit="submitReturn(event,'${id}')">${modalHead('Inspeção de devolução / baixa','Preencha novamente o formulário FV-MAQ-ST')}<div class="modal-body">${inspectionFormHTML(eq,'devolucao',{company:eq.usage.company,responsible:eq.usage.responsible,inspectionAt:nowLocal()})}<div class="section-title"><span>${icon('return')}</span><div><h3>Dados da devolução</h3><small>Defina o local onde o equipamento será entregue</small></div></div><div class="form-grid"><div class="field"><label>Local de entrega <em>*</em></label><select name="place" required><option>Pátio de Equipamentos</option><option>Almoxarifado</option><option>Base da Manutenção</option></select></div><div class="field"><label>Data Hall de origem</label><input value="${esc(eq.usage.dataHall)}" readonly></div></div><label class="terms physical-term"><input type="checkbox" name="physicalCopy" required><span>Confirmo que a via física da devolução foi preenchida e será arquivada na pasta do colaborador.</span></label><label class="terms"><input type="checkbox" name="terms" required><span>Confirmo que realizei a inspeção de devolução. Se houver item reprovado, o equipamento será bloqueado automaticamente para manutenção.</span></label></div><div class="modal-foot"><button type="button" class="button button-outline" onclick="closeModal()">Cancelar</button><button class="button button-green">${icon('return')} Concluir e devolver</button></div></form>`, 'modal-inspection');
}
function submitReturn(event,id) {
  event.preventDefault(); const data=Object.fromEntries(new FormData(event.target)); const eq=equipments.find(e=>e.id===id); const previous={...eq.usage}; const inspection=inspectionFromData(data,'devolucao'); const hasFailure=inspectionHasFailure(inspection); eq.hourmeter=Number(data.hourmeter); eq.status=hasFailure?'maintenance':'available'; eq.usage=null; history.unshift({id:Date.now(),equipmentId:id,action:hasFailure?'issue':'return',person:previous.responsible,company:previous.company,place:data.place,date:data.inspectionAt,notes:data.inspectionNotes,activity:previous.activity,location:previous.location,dataHall:previous.dataHall,inspection}); save(); closeModal(); render(); toast(hasFailure?'Devolução salva. Item reprovado: equipamento bloqueado.':`${eq.code} devolvido e disponível. Formulário salvo.`,hasFailure);
}

function openInspectionRecord(historyId) {
  const movement=history.find(item=>item.id===historyId); if(!movement?.inspection) return toast('Formulário não disponível.',true);
  const eq=equipments.find(item=>item.id===movement.equipmentId); if(!eq) return toast('Equipamento não encontrado.',true);
  modal(`${modalHead('Formulário de inspeção',`${eq.code} · ${fullDate(movement.inspection.inspectedAt)}`)}<div class="modal-body inspection-record">${printableInspection(eq,movement)}</div><div class="modal-foot"><button class="button button-outline" onclick="closeModal()">Fechar</button><button class="button button-dark" onclick="window.print()">${icon('download')} Imprimir / salvar PDF</button></div>`,'modal-paper');
  document.querySelector('.modal-backdrop').classList.add('print-area','inspection-print-area');
}

function openQRModal(id) {
  const eq=equipments.find(e=>e.id===id); if(!eq) return;
  const url=`${location.origin}${location.pathname}#scan/${eq.id}`;
  modal(`${modalHead('QR Code do equipamento','Imprima e fixe esta etiqueta em local visível')}<div class="modal-body qr-layout"><div class="qr-box" id="qrTarget"></div><h2>${esc(eq.name)}</h2><span class="qr-code-label">${esc(eq.code)}</span><p>${esc(eq.brand)} ${esc(eq.model)} · Série ${esc(eq.serial)}</p><p>Escaneie para fazer checklist, retirar ou devolver</p></div><div class="modal-foot"><button class="button button-outline" onclick="closeModal()">Fechar</button><button class="button button-dark" onclick="window.print()">${icon('print')} Imprimir etiqueta</button></div>`, 'modal-small');
  document.querySelector('.modal-backdrop').classList.add('print-area'); renderQRCode(document.getElementById('qrTarget'),url);
}
function renderQRCode(target,url) {
  target.innerHTML='';
  if(window.QRCode) new QRCode(target,{text:url,width:190,height:190,colorDark:'#14201b',colorLight:'#ffffff',correctLevel:QRCode.CorrectLevel.H});
  else target.innerHTML=`<div class="qr-fallback"><span>Biblioteca de QR offline.<br>Conecte à internet e reabra.</span></div>`;
}
function printAllQRCodes() {
  if(!equipments.length) return toast('Nenhum equipamento cadastrado.',true);
  const pages=[]; for(let index=0;index<equipments.length;index+=4)pages.push(equipments.slice(index,index+4));
  const label=eq=>`<article class="qr-label"><div class="qr-box" id="qr-${eq.id}"></div><h3>${esc(eq.name)}</h3><span class="qr-code-label">${esc(eq.code)}</span><p>${esc(eq.brand)} ${esc(eq.model)} · Série ${esc(eq.serial)}</p><p>Escaneie antes de utilizar</p></article>`;
  modal(`${modalHead('Etiquetas de todos os equipamentos',`${equipments.length} QR Codes · ${pages.length} página(s) para impressão`)}<div class="modal-body qr-pages">${pages.map((page,index)=>`<section class="qr-sheet qr-print-page" data-page="${index+1}">${page.map(label).join('')}</section>`).join('')}</div><div class="modal-foot"><button class="button button-outline" onclick="closeModal()">Fechar</button><button class="button button-dark" onclick="window.print()">${icon('print')} Imprimir todas (${equipments.length})</button></div>`, 'modal-large');
  document.querySelector('.modal-backdrop').classList.add('print-area');
  equipments.forEach(eq => renderQRCode(document.getElementById(`qr-${eq.id}`),`${location.origin}${location.pathname}#scan/${eq.id}`,135));
}

function openScanModal() {
  modal(`${modalHead('Identificar equipamento','Use o código impresso abaixo do QR Code')}<div class="modal-body"><div class="section-title"><span>${icon('scan')}</span><div><h3>Leitura rápida</h3><small>Digite ou cole o código do ativo</small></div></div><form class="scan-input" onsubmit="findEquipment(event)"><input id="scanCode" required autofocus placeholder="Ex.: PTA-001"><button class="button button-green">Localizar</button></form><div class="notice">${icon('qr')} Em um celular, a câmera abre diretamente este sistema ao ler o QR Code impresso no equipamento.</div></div>`, 'modal-small'); setTimeout(()=>document.getElementById('scanCode')?.focus(),100);
}
function findEquipment(event) { event.preventDefault(); const code=document.getElementById('scanCode').value.trim().toLowerCase(); const eq=equipments.find(e=>e.code.toLowerCase()===code); if(!eq)return toast('Equipamento não encontrado.',true); closeModal(); openScannedEquipment(eq.id); }
function openScannedEquipment(id) { const eq=equipments.find(e=>e.id===id); if(!eq)return toast('Este equipamento não existe ou foi removido.',true); openPublicEquipmentModal(id); }
function openPublicEquipmentModal(id) {
  const eq=equipments.find(item=>item.id===id); if(!eq)return; const latest=history.find(item=>item.equipmentId===id&&item.inspection); const usage=eq.usage;
  modal(`${modalHead('Informações do equipamento','Acesso público pelo QR Code')}<div class="modal-body"><section class="public-equipment-head"><span>${equipmentIcon(eq)}</span><div><small>${esc(eq.code)}</small><h2>${esc(eq.name)}</h2><p>${esc(eq.model)} · Série ${esc(eq.serial)}</p></div>${statusBadge(eq.status)}</section><div class="public-specs"><span><small>Horímetro</small><strong>${esc(eq.hourmeter??'—')} h</strong></span><span><small>Bateria</small><strong>${esc(eq.battery||'—')}</strong></span><span><small>Fornecedor</small><strong>${esc(eq.brand||'—')}</strong></span></div>${usage?`<section class="public-use-card"><h3>Utilização atual</h3><div class="public-use-grid"><span><small>Responsável</small><strong>${esc(usage.responsible)}</strong><em>${esc(usage.company)}</em></span><span><small>Atividade</small><strong>${esc(usage.activity||'—')}</strong></span><span><small>DH e local</small><strong>${esc(usage.dataHall)} · ${esc(usage.location)}</strong></span><span><small>Previsão de devolução</small><strong>${fullDate(usage.expectedAt)}</strong></span></div></section>`:`<div class="public-availability">${icon(eq.status==='maintenance'?'tool':'check')}<div><strong>${eq.status==='maintenance'?'Equipamento bloqueado':'Equipamento disponível'}</strong><small>${eq.status==='maintenance'?'Aguardando manutenção e nova liberação.':'Local atual: Pátio / Base'}</small></div></div>`}${latest?`<button class="public-checklist-link" onclick="openInspectionRecord(${latest.id})">${icon('file')}<span><strong>Último formulário de verificação</strong><small>${fullDate(latest.inspection.inspectedAt)} · ${latest.inspection.mode==='devolucao'?'Devolução':'Retirada'}</small></span>${icon('chevron')}</button>`:''}</div><div class="modal-foot"><button class="button button-outline" onclick="closeModal()">Fechar</button>${eq.status==='available'?`<button class="button button-green" onclick="openCheckoutModal('${id}')">${icon('check')} Retirar com checklist</button>`:''}${eq.status==='in-use'?`<button class="button button-green" onclick="openReturnModal('${id}')">${icon('return')} Registrar devolução</button>`:''}</div>`,'modal-large');
}

function exportCSV() {
  const selectedHistory=getReportFilteredHistory(); if(!selectedHistory.length)return toast('Nenhuma movimentação encontrada com os filtros selecionados.',true); const rows=[['Data','Equipamento','Modelo','Ação','Responsável','Empresa','Atividade','Data Hall','Local','Horímetro','Resultado'],...selectedHistory.map(h=>{const e=equipments.find(x=>x.id===h.equipmentId);return [h.date,e?.code||'',e?.model||'',reportAction(h.action),h.person||'',h.company||'',h.activity||'',h.dataHall||h.place||'',h.location||'',h.inspection?.hourmeter||'',h.inspection?(inspectionHasFailure(h.inspection)?'Reprovado':'Aprovado'):'' ];})];
  const csv='\uFEFF'+rows.map(r=>r.map(v=>`"${String(v||'').replace(/"/g,'""')}"`).join(';')).join('\n'); const blob=new Blob([csv],{type:'text/csv;charset=utf-8'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=`obraflow-movimentacoes-${new Date().toISOString().slice(0,10)}.csv`; a.click(); URL.revokeObjectURL(a.href); toast('Relatório exportado com sucesso.');
}
function toast(message,error=false) { const root=document.getElementById('toastRoot'); const el=document.createElement('div'); el.className=`toast ${error?'error':''}`; el.innerHTML=`<span>${icon(error?'alert':'check')}</span><p>${esc(message)}</p>`; root.appendChild(el); setTimeout(()=>el.remove(),3800); }
function closeMobileMenu(){ document.getElementById('sidebar').classList.remove('open'); document.getElementById('mobileBackdrop').classList.remove('open'); }

document.getElementById('menuButton').addEventListener('click',()=>{document.getElementById('sidebar').classList.toggle('open');document.getElementById('mobileBackdrop').classList.toggle('open');});
document.getElementById('mobileBackdrop').addEventListener('click',closeMobileMenu);
document.getElementById('quickScanButton').addEventListener('click',openScanModal);
document.getElementById('globalSearch').addEventListener('keydown',e=>{if(e.key==='Enter'){const q=e.target.value.toLowerCase();const eq=equipments.find(x=>`${x.code} ${x.name} ${x.usage?.responsible||''}`.toLowerCase().includes(q));eq?openEquipmentDetails(eq.id):toast('Nenhum equipamento encontrado.',true);}});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal();if((e.ctrlKey||e.metaKey)&&e.key==='k'){e.preventDefault();document.getElementById('globalSearch').focus();}});
window.addEventListener('hashchange',render);
hydrateIcons(); render(); initializeWorkforce();
