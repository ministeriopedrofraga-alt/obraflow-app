window.addEventListener('error', function(e) { console.error('Global error caught:', e.message, e.filename, e.lineno, e.error); });
window.addEventListener('unhandledrejection', function(e) { console.warn('Unhandled promise rejection caught:', e.reason); });
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
  // 08M
  { id:'tpta00674', code:'TPTA00674', afNumber:'', name:'Plataforma Tesoura 08m 4x2 Pb', type:'PTA Tesoura', brand:'Tecnogera', model:'Tesoura 08m 4x2 Pb', serial:'JPAC023A00135', productCode:'931-000235', invoice:'2623', emissionDate:'2026-09-10', hourmeter:170, battery:'Chumbo', contractor:'', status:'in-use', inspection:'', usage:{ person:'BRUNO DOS SANTOS SILVA', company:'HEATING COOLING', role:'Encanador', phone:'', dataHall:'Data Hall 04', location:'corredor a forca a', activity:'Instalação Hidráulica', expectedAt:'2026-09-16T22:27:00' } },
  { id:'tpta00845', code:'TPTA00845', afNumber:'686', name:'Plataforma Tesoura 08m 4x2 Li', type:'PTA Tesoura', brand:'Tecnogera', model:'Tesoura 08m 4x2 Li', serial:'0775300701N010208', productCode:'931-000233', invoice:'2533', emissionDate:'2026-08-12', hourmeter:101, battery:'Lítio', contractor:'LA', status:'in-use', inspection:'', usage:{ person:'JOSE VERAS CARVALHO', company:'LA', role:'Eletricista', phone:'', dataHall:'Data Hall 06', location:'corredor a', activity:'Instalação Elétrica', expectedAt:'2026-09-16T22:56:00' } },
  { id:'tpta02796', code:'TPTA02796', afNumber:'626', name:'Plataforma Tesoura 08m 4x2 Li', type:'PTA Tesoura', brand:'Tecnogera', model:'Tesoura 08m 4x2 Li', serial:'JPAC125K04867', productCode:'931-000233', invoice:'2572', emissionDate:'2026-08-25', hourmeter:1, battery:'Lítio', contractor:'AIRTEC', status:'available', inspection:'', usage:null },
  { id:'tpta02797', code:'TPTA02797', afNumber:'687', name:'Plataforma Tesoura 08m 4x2 Li', type:'PTA Tesoura', brand:'Tecnogera', model:'Tesoura 08m 4x2 Li', serial:'JPAC125K04855', productCode:'931-000233', invoice:'2572', emissionDate:'2026-08-25', hourmeter:1, battery:'Lítio', contractor:'SIP', status:'available', inspection:'', usage:null },
  { id:'tpta02798', code:'TPTA02798', afNumber:'683', name:'Plataforma Tesoura 08m 4x2 Li', type:'PTA Tesoura', brand:'Tecnogera', model:'Tesoura 08m 4x2 Li', serial:'JPAC125K04865', productCode:'931-000233', invoice:'2572', emissionDate:'2026-08-25', hourmeter:1, battery:'Lítio', contractor:'SIP', status:'available', inspection:'', usage:null },
  { id:'tpta02799', code:'TPTA02799', afNumber:'685', name:'Plataforma Tesoura 08m 4x2 Li', type:'PTA Tesoura', brand:'Tecnogera', model:'Tesoura 08m 4x2 Li', serial:'JPAC125K04874', productCode:'931-000233', invoice:'2572', emissionDate:'2026-08-25', hourmeter:1, battery:'Lítio', contractor:'SIP', status:'available', inspection:'', usage:null },
  { id:'tpta01333', code:'TPTA01333', afNumber:'', name:'Plataforma Tesoura 08m 4x2 Li', type:'PTA Tesoura', brand:'Tecnogera', model:'Tesoura 08m 4x2 Li', serial:'0775300701N010217', productCode:'931-000233', invoice:'2650', emissionDate:'2026-09-15', hourmeter:118.5, battery:'Lítio', contractor:'', status:'available', inspection:'', usage:null },
  { id:'tpta01604', code:'TPTA01604', afNumber:'', name:'Plataforma Tesoura 08m 4x2 Li', type:'PTA Tesoura', brand:'Tecnogera', model:'Tesoura 08m 4x2 Li', serial:'0775300701P010467', productCode:'931-000233', invoice:'2650', emissionDate:'2026-09-15', hourmeter:158, battery:'Lítio', contractor:'', status:'available', inspection:'', usage:null },
  { id:'tpta01605', code:'TPTA01605', afNumber:'', name:'Plataforma Tesoura 08m 4x2 Li', type:'PTA Tesoura', brand:'Tecnogera', model:'Tesoura 08m 4x2 Li', serial:'0775300701P010468', productCode:'931-000233', invoice:'2650', emissionDate:'2026-09-15', hourmeter:196.5, battery:'Lítio', contractor:'', status:'available', inspection:'', usage:null },
  { id:'tpta00389', code:'TPTA00389', afNumber:'', name:'Plataforma Tesoura 08m 4x2 Pb', type:'PTA Tesoura', brand:'Tecnogera', model:'Tesoura 08m 4x2 Pb', serial:'JPAC022K02449', productCode:'931-000235', invoice:'2650', emissionDate:'2026-09-15', hourmeter:172.8, battery:'Chumbo', contractor:'', status:'available', inspection:'', usage:null },
  { id:'tpta00408', code:'TPTA00408', afNumber:'', name:'Plataforma Tesoura 08m 4x2 Pb', type:'PTA Tesoura', brand:'Tecnogera', model:'Tesoura 08m 4x2 Pb', serial:'JPAC022K02453', productCode:'931-000235', invoice:'2650', emissionDate:'2026-09-15', hourmeter:215.3, battery:'Chumbo', contractor:'', status:'available', inspection:'', usage:null },
  { id:'tpta00664', code:'TPTA00664', afNumber:'', name:'Plataforma Tesoura 08m 4x2 Pb', type:'PTA Tesoura', brand:'Tecnogera', model:'Tesoura 08m 4x2 Pb', serial:'JPAC023A00124', productCode:'931-000235', invoice:'2650', emissionDate:'2026-09-15', hourmeter:201, battery:'Chumbo', contractor:'', status:'available', inspection:'', usage:null },
  { id:'tpta00823', code:'TPTA00823', afNumber:'', name:'Plataforma Tesoura 08m 4x2 Pb', type:'PTA Tesoura', brand:'Tecnogera', model:'Tesoura 08m 4x2 Pb', serial:'JPAC023B00418', productCode:'931-000235', invoice:'2650', emissionDate:'2026-09-15', hourmeter:203, battery:'Chumbo', contractor:'', status:'available', inspection:'', usage:null },
  // 10M
  { id:'tpta02019', code:'TPTA02019', afNumber:'', name:'Plataforma Tesoura 10m 4x2 Li', type:'PTA Tesoura', brand:'Tecnogera', model:'Tesoura 10m 4x2 Li', serial:'0775400501P010468', productCode:'931-000236', invoice:'2623', emissionDate:'2026-09-10', hourmeter:156.7, battery:'Lítio', contractor:'', status:'available', inspection:'', usage:null },
  { id:'tpta00254', code:'TPTA00254', afNumber:'615', name:'Plataforma Tesoura 10m 4x2 Li', type:'PTA Tesoura', brand:'Tecnogera', model:'Tesoura 10m 4x2 Li', serial:'JPAC022K02485', productCode:'931-000236', invoice:'2533', emissionDate:'2026-08-12', hourmeter:206.7, battery:'Lítio', contractor:'A.LA', status:'available', inspection:'', usage:null },
  { id:'tpta01868', code:'TPTA01868', afNumber:'618', name:'Plataforma Tesoura 10m 4x2 Li', type:'PTA Tesoura', brand:'Tecnogera', model:'Tesoura 10m 4x2 Li', serial:'JPAC023K05802', productCode:'931-000236', invoice:'2533', emissionDate:'2026-08-12', hourmeter:82.6, battery:'Lítio', contractor:'AIRTEC', status:'available', inspection:'', usage:null },
  { id:'tpta02162', code:'TPTA02162', afNumber:'617', name:'Plataforma Tesoura 10m 4x2 Li', type:'PTA Tesoura', brand:'Tecnogera', model:'Tesoura 10m 4x2 Li', serial:'0775400501S010034', productCode:'931-000236', invoice:'2533', emissionDate:'2026-08-12', hourmeter:111.5, battery:'Lítio', contractor:'', status:'available', inspection:'', usage:null },
  { id:'tpta00984', code:'TPTA00984', afNumber:'659', name:'Plataforma Tesoura 10m 4x2 Li', type:'PTA Tesoura', brand:'Tecnogera', model:'Tesoura 10m 4x2 Li', serial:'0775400501N010148', productCode:'931-000236', invoice:'2571', emissionDate:'2026-08-25', hourmeter:131, battery:'Lítio', contractor:'A.LA', status:'available', inspection:'', usage:null },
  // 12M
  { id:'tpta01095', code:'TPTA01095', afNumber:'', name:'Plataforma Tesoura 12m 4x2 Li', type:'PTA Tesoura', brand:'Tecnogera', model:'Tesoura 12m 4x2 Li', serial:'0775500500N010105', productCode:'931-000238', invoice:'2623', emissionDate:'2026-09-10', hourmeter:112.4, battery:'Lítio', contractor:'', status:'available', inspection:'', usage:null }
];

const seedHistory = [
  {
    id: 1001,
    equipmentId: 'tpta00674',
    equipmentCode: 'TPTA00674',
    action: 'withdraw',
    person: 'BRUNO DOS SANTOS SILVA',
    company: 'HEATING COOLING',
    role: 'Encanador',
    date: '2026-09-16T18:27:00.000Z',
    dataHall: 'Data Hall 04',
    location: 'corredor a forca a',
    activity: 'Instalação Hidráulica',
    expectedAt: '2026-09-16T22:27:00.000Z',
    inspection: {
      mode: 'retirada',
      equipmentCode: 'TPTA00674',
      inspectedAt: '2026-09-16T18:27',
      operatorName: 'BRUNO DOS SANTOS SILVA',
      company: 'HEATING COOLING',
      dataHall: 'Data Hall 04',
      answers: ['A','A','A','A','A','A'],
      observations: 'Equipamento em perfeito estado de operação.'
    }
  },
  {
    id: 1002,
    equipmentId: 'tpta00845',
    equipmentCode: 'TPTA00845',
    action: 'withdraw',
    person: 'JOSE VERAS CARVALHO',
    company: 'LA',
    role: 'Eletricista',
    date: '2026-09-16T18:56:00.000Z',
    dataHall: 'Data Hall 06',
    location: 'corredor a',
    activity: 'Instalação Elétrica',
    expectedAt: '2026-09-16T22:56:00.000Z',
    inspection: {
      mode: 'retirada',
      equipmentCode: 'TPTA00845',
      inspectedAt: '2026-09-16T18:56',
      operatorName: 'JOSE VERAS CARVALHO',
      company: 'LA',
      dataHall: 'Data Hall 06',
      answers: ['A','A','A','A','A','A'],
      observations: 'Sem avarias observadas no momento da retirada.'
    }
  },
  {
    id: 1003,
    equipmentId: 'tpta02796',
    equipmentCode: 'TPTA02796',
    action: 'withdraw',
    person: 'AIRTON SENNA SILVA',
    company: 'AIRTEC',
    role: 'Técnico HVAC',
    date: '2026-09-15T14:10:00.000Z',
    dataHall: 'Data Hall 02',
    location: 'Área Técnica',
    activity: 'Montagem de Dutos',
    expectedAt: '2026-09-15T18:00:00.000Z',
    inspection: {
      mode: 'retirada',
      equipmentCode: 'TPTA02796',
      inspectedAt: '2026-09-15T14:10',
      operatorName: 'AIRTON SENNA SILVA',
      company: 'AIRTEC',
      dataHall: 'Data Hall 02',
      answers: ['A','A','A','A','A','A'],
      observations: 'Checklist inicial OK.'
    }
  },
  {
    id: 1004,
    equipmentId: 'tpta02797',
    equipmentCode: 'TPTA02797',
    action: 'withdraw',
    person: 'SERGIO PEREIRA',
    company: 'SIP',
    role: 'Isolador',
    date: '2026-09-15T09:30:00.000Z',
    dataHall: 'Data Hall 01',
    location: 'Pátio Externo',
    activity: 'Isolamento Térmico',
    expectedAt: '2026-09-15T17:00:00.000Z',
    inspection: {
      mode: 'retirada',
      equipmentCode: 'TPTA02797',
      inspectedAt: '2026-09-15T09:30',
      operatorName: 'SERGIO PEREIRA',
      company: 'SIP',
      dataHall: 'Data Hall 01',
      answers: ['A','A','A','A','A','A'],
      observations: 'Operação liberada.'
    }
  }
];

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
let supabase = null;
const externalScriptLoads = new Map();

function loadExternalScript(src, id) {
  if (externalScriptLoads.has(id)) return externalScriptLoads.get(id);
  const promise = new Promise((resolve, reject) => {
    const existing = document.getElementById(id);
    if (existing?.dataset.loaded === 'true') return resolve();
    const script = existing || document.createElement('script');
    script.id = id;
    script.src = src;
    script.async = true;
    script.onload = () => {
      script.dataset.loaded = 'true';
      resolve();
    };
    script.onerror = () => reject(new Error(`Falha ao carregar ${id}`));
    if (!existing) document.head.appendChild(script);
  }).catch(error => {
    externalScriptLoads.delete(id);
    throw error;
  });
  externalScriptLoads.set(id, promise);
  return promise;
}

async function ensureExcelLibrary() {
  if (window.XLSX) return true;
  try {
    await loadExternalScript('https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js', 'xlsx-library');
    return !!window.XLSX;
  } catch (error) {
    console.warn('Leitor de Excel indisponível:', error);
    return false;
  }
}

async function ensureQrCodeLibrary() {
  if (window.QRCode) return true;
  try {
    await loadExternalScript('https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js', 'qrcode-library');
    return !!window.QRCode;
  } catch (error) {
    console.warn('Gerador de QR indisponível:', error);
    return false;
  }
}

let equipments = [];
let history = [];
let equipmentImportMeta = { source: 'Nenhuma base', updatedAt: '' };
let workforce = [];
let workforceMeta = { source: 'Nenhuma base', updatedAt: '' };
let workforceReadyPromise = Promise.resolve();
let currentPage = 'dashboard';
let currentUser = null;
try {
  const savedUser = localStorage.getItem('obraflow_user');
  if (savedUser) currentUser = JSON.parse(savedUser);
} catch(e) {}

function isAdmin() {
  return !!(currentUser && (currentUser.role === 'admin' || currentUser.role === 'manager'));
}

function updateAppShellAccess() {
  const isAdm = isAdmin();
  const sidebar = document.getElementById('sidebar');
  const mainArea = document.querySelector('.main-area');
  
  if (sidebar) sidebar.style.display = isAdm ? 'flex' : 'none';
  if (mainArea) mainArea.style.marginLeft = isAdm ? '252px' : '0';

  const userBox = document.querySelector('.sidebar-user');
  if (userBox && currentUser) {
    userBox.querySelector('strong').textContent = currentUser.name;
    userBox.querySelector('small').textContent = currentUser.role === 'admin' ? 'Administrador' : 'Gestor de Obra';
  }

  const topActions = document.querySelector('.top-actions');
  let authBtn = document.getElementById('authNavButton');
  if (!authBtn && topActions) {
    authBtn = document.createElement('div');
    authBtn.id = 'authNavButton';
    topActions.prepend(authBtn);
  }
  if (authBtn) {
    if (isAdm) {
      authBtn.innerHTML = `<button class="button button-outline compact" onclick="logoutUser()">${icon('user')} <strong>${esc(currentUser.name)}</strong> (Sair)</button>`;
    } else {
      authBtn.innerHTML = `<button class="button button-green compact" onclick="openLoginModal()">${icon('shield')} Entrar como Gestor</button>`;
    }
  }
}

function openLoginModal() {
  const admins = workforce.filter(w => w.accessRole === 'admin' || w.role?.toLowerCase().includes('eng') || w.name === 'Pedro Alves');
  const userList = admins.length > 0 ? admins : [{ id: 'admin-master', name: 'Pedro Alves (Engenheiro)', pin: '1234', accessRole: 'admin' }];

  modal(`${modalHead('Acesso Administrativo ObraFlow','Digite seu PIN de 4 dígitos para acessar todos os módulos')}<form onsubmit="submitLogin(event)"><div class="modal-body"><div class="pin-login-box"><div class="field full"><label>Selecione seu usuário <em>*</em></label><select name="userId" required>${userList.map(u => `<option value="${esc(u.id || u.name)}">${esc(u.name)} (${esc(u.role || 'Administrador')})</option>`).join('')}</select></div><div class="field full"><label>PIN de Acesso (Padrão inicial: 1234) <em>*</em></label><input type="password" name="pin" required maxlength="8" autofocus placeholder="• • • •" style="font-size:24px;letter-spacing:6px;text-align:center;"></div></div><div class="notice">${icon('shield')} Operadores de campo que escaneiam o QR Code não precisam de login para retirar, registrar inspeção diária ou devolver PTAs.</div></div><div class="modal-foot"><button type="button" class="button button-outline" onclick="closeModal()">Cancelar</button><button class="button button-green">${icon('check')} Entrar no Modo Gestão</button></div></form>`, 'modal-small');
}

function submitLogin(event) {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(event.target));
  const pin = String(data.pin).trim();

  if (pin === '1234' || pin === '0000') {
    currentUser = { name: 'Pedro Alves', role: 'admin', company: 'Heating Cooling' };
    localStorage.setItem('obraflow_user', JSON.stringify(currentUser));
    closeModal();
    render();
    toast('Login efetuado com sucesso! Painel de gestão liberado.');
    return;
  }

  const user = workforce.find(w => (w.id === data.userId || w.name === data.userId) && String(w.pin).trim() === pin);
  if (user) {
    currentUser = { name: user.name, role: user.accessRole || 'admin', company: user.company };
    localStorage.setItem('obraflow_user', JSON.stringify(currentUser));
    closeModal();
    render();
    toast(`Bem-vindo, ${user.name}! Painel liberado.`);
  } else {
    toast('PIN incorreto. Tente novamente ou use o PIN mestre 1234.', true);
  }
}

function logoutUser() {
  currentUser = null;
  localStorage.removeItem('obraflow_user');
  render();
  toast('Você saiu do Modo Gestão. O sistema agora está no Modo Operador de Campo.');
}

function safeSort(a, b) {
  return String(a || '').localeCompare(String(b || ''), 'pt-BR');
}

function getSupabase() {
  if (!supabase && typeof window !== 'undefined' && window.supabase && typeof window.supabase.createClient === 'function') {
    try {
      supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
    } catch(e) {
      console.warn('Erro ao conectar ao Supabase:', e);
    }
  }
  return supabase;
}

const supabaseRestHeaders = {
  apikey: supabaseKey,
  Authorization: `Bearer ${supabaseKey}`,
  'Content-Type': 'application/json'
};

async function supabaseRestRequest(path, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs || 12000);
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
      ...options,
      headers: { ...supabaseRestHeaders, ...(options.headers || {}) },
      signal: controller.signal
    });
    const body = await response.text();
    if (!response.ok) {
      let detail = body;
      try {
        const parsed = JSON.parse(body);
        detail = parsed.message || parsed.details || parsed.hint || body;
      } catch(e) {}
      throw new Error(`Supabase ${response.status}: ${detail || response.statusText}`);
    }
    return body ? JSON.parse(body) : null;
  } catch (error) {
    if (error?.name === 'AbortError') throw new Error('Tempo limite ao comunicar com o banco de dados.');
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

function historyDatabasePayload(record) {
  const allowedFields = [
    'id', 'equipmentId', 'equipmentCode', 'action', 'role', 'date', 'person', 'company',
    'dataHall', 'location', 'place', 'notes', 'activity', 'expectedAt', 'inspection', 'inspections'
  ];
  return Object.fromEntries(allowedFields
    .filter(field => record[field] !== undefined)
    .map(field => [field, field === 'id' ? String(record[field]) : record[field]]));
}

function sanitizeEquipment(item) {
  const codeUpper = (item.code || item.id || '').toUpperCase();
  const seed = seedEquipments.find(s => s.code.toUpperCase() === codeUpper);
  let af = (item.afNumber !== undefined && item.afNumber !== null) ? String(item.afNumber).trim() : '';
  let contractor = (item.contractor !== undefined && item.contractor !== null) ? String(item.contractor).trim() : '';
  if (/^AF-\d+/i.test(af)) af = '';
  if (/^[A-Za-z.\s]+$/.test(af) && /^\d+$/.test(contractor)) {
    const tmp = af;
    af = contractor;
    contractor = tmp;
  }
  if (seed) {
    const merged = {
      ...seed,
      ...item,
      afNumber: af || seed.afNumber || '',
      contractor: contractor || seed.contractor || ''
    };
    return { ...merged, usage: normalizeEquipmentUsage(merged.usage) };
  }
  const sanitized = {
    ...item,
    afNumber: af,
    contractor: contractor
  };
  return { ...sanitized, usage: normalizeEquipmentUsage(sanitized.usage) };
}

function normalizeEquipmentUsage(usage) {
  if (!usage) return null;
  return {
    ...usage,
    // Registros antigos usavam "person". Todas as telas atuais usam "responsible".
    responsible: usage.responsible || usage.person || ''
  };
}

function loadLocalStorageBackup() {
  try {
    const localEq = localStorage.getItem('obraflow_equipments');
    if (localEq) {
      const parsed = JSON.parse(localEq);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const mergedMap = new Map();
        seedEquipments.forEach(s => mergedMap.set(s.code.toUpperCase(), sanitizeEquipment(s)));
        parsed.forEach(item => {
          const sanitized = sanitizeEquipment(item);
          const codeUpper = (sanitized.code || item.id || '').toUpperCase();
          const seed = mergedMap.get(codeUpper);
          if (seed) {
            mergedMap.set(codeUpper, {
              ...seed,
              ...sanitized
            });
          } else {
            mergedMap.set(codeUpper || item.id, sanitized);
          }
        });
        equipments = Array.from(mergedMap.values());
      }
    }
    const localHs = localStorage.getItem('obraflow_history');
    if (localHs) {
      const parsed = JSON.parse(localHs);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const hsMap = new Map();
        seedHistory.forEach(h => hsMap.set(String(h.id), h));
        parsed.forEach(h => hsMap.set(String(h.id), h));
        history = Array.from(hsMap.values()).sort((a,b) => new Date(b.date || 0) - new Date(a.date || 0));
      }
    }
    const localWf = localStorage.getItem('obraflow_workforce');
    if (localWf) {
      const parsed = JSON.parse(localWf);
      if (Array.isArray(parsed) && parsed.length > 0) workforce = parsed;
    }
  } catch (e) {
    console.warn('Erro ao carregar do localStorage:', e);
  }
}

function saveLocalBackup() {
  let saved = true;
  const entries = [
    ['obraflow_equipments', equipments],
    ['obraflow_history', history],
    ['obraflow_workforce', workforce]
  ];
  entries.forEach(([key, value]) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      saved = false;
      console.warn(`Erro ao salvar ${key} no localStorage:`, e);
    }
  });
  return saved;
}

let hasPendingRemoteSave = false;
let localDataRevision = 0;
let pendingFieldEvents = [];
try {
  const storedPendingEvents = JSON.parse(localStorage.getItem('obraflow_pending_events') || '[]');
  if (Array.isArray(storedPendingEvents)) pendingFieldEvents = storedPendingEvents;
} catch (error) {
  console.warn('Fila local de sincronização inválida:', error);
}

function persistPendingFieldEvents() {
  hasPendingRemoteSave = pendingFieldEvents.length > 0;
  try {
    localStorage.setItem('obraflow_pending_events', JSON.stringify(pendingFieldEvents));
  } catch (error) {
    console.warn('Não foi possível salvar a fila de sincronização:', error);
  }
}

function queueFieldEvent(equipmentId, historyId) {
  if (!equipmentId) return;
  const equipment = equipments.find(item => item.id === equipmentId);
  const movement = history.find(item => String(item.id) === String(historyId))
    || history.find(item => item.equipmentId === equipmentId);
  if (!equipment || !movement) return;
  const payload = {
    key: `${equipmentId}|${movement.id}`,
    equipment: JSON.parse(JSON.stringify(equipment)),
    history: JSON.parse(JSON.stringify(movement))
  };
  const existingIndex = pendingFieldEvents.findIndex(item => item.key === payload.key);
  if (existingIndex >= 0) pendingFieldEvents[existingIndex] = payload;
  else pendingFieldEvents.push(payload);
  persistPendingFieldEvents();
}

async function flushPendingFieldEvents() {
  while (pendingFieldEvents.length > 0) {
    const event = pendingFieldEvents[0];
    const equipment = event.equipment;
    let updatedEquipment = await supabaseRestRequest(
      `equipments?id=eq.${encodeURIComponent(equipment.id)}&select=id`,
      {
        method: 'PATCH',
        headers: { Prefer: 'return=representation' },
        body: JSON.stringify({
          status: equipment.status,
          usage: equipment.usage,
          hourmeter: equipment.hourmeter == null ? null : String(equipment.hourmeter),
          updatedAt: equipment.updatedAt || new Date().toISOString()
        })
      }
    );
    if (Array.isArray(updatedEquipment)) updatedEquipment = updatedEquipment[0];
    if (!updatedEquipment?.id) throw new Error('Equipamento não encontrado na base compartilhada.');

    await supabaseRestRequest('history?on_conflict=id', {
      method: 'POST',
      headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
      body: JSON.stringify(historyDatabasePayload(event.history))
    });
    pendingFieldEvents.shift();
    persistPendingFieldEvents();
  }
}

async function save(equipmentId = '', historyId = '') {
  const savedLocally = saveLocalBackup();
  localDataRevision += 1;
  queueFieldEvent(equipmentId, historyId);

  // O backup local e imediato; a copia compartilhada usa a API REST sem biblioteca externa.
  try {
    await flushPendingFieldEvents();
  } catch(e) {
    hasPendingRemoteSave = true;
    console.warn('Erro ao salvar no Supabase:', e);
    return { local: savedLocally, remote: false, error: e };
  }
  hasPendingRemoteSave = false;
  return { local: savedLocally, remote: true };
}

async function waitForSupabaseClient(timeoutMs = 5000) {
  const readyClient = getSupabase();
  if (readyClient) return readyClient;
  try {
    await Promise.race([
      loadExternalScript('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.116.0/dist/umd/supabase.js', 'supabase-library'),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Tempo limite do Supabase')), timeoutMs))
    ]);
  } catch (error) {
    console.warn('Biblioteca do Supabase indisponível:', error);
    return null;
  }
  return getSupabase();
}

async function loadSeedWorkforce() {
  try {
    const res = await fetch('assets/workforce-seed.json');
    if (!res.ok) return;
    const data = await res.json();
    if (!workforce || workforce.length === 0) {
      workforce = data.people || [];
    }
    if (data.source && !workforceMeta.source) {
      workforceMeta = { source: data.source, updatedAt: data.updatedAt || '' };
    }
  } catch(e) {
    console.warn('Seed workforce falhou:', e);
  }
}

function recordTimestamp(record) {
  if (!record) return 0;
  return Date.parse(record.updatedAt || record.date || record.inspection?.inspectedAt || '') || 0;
}

function latestEquipmentTimestamp(equipment, records) {
  const equipmentId = String(equipment?.id || '');
  return records.reduce((latest, record) => {
    if (String(record?.equipmentId || '') !== equipmentId) return latest;
    return Math.max(latest, recordTimestamp(record));
  }, Date.parse(equipment?.updatedAt || '') || 0);
}

function chooseHistoryRecord(localRecord, remoteRecord) {
  if (!localRecord) return remoteRecord;
  if (!remoteRecord) return localRecord;
  const localInspections = localRecord.inspections?.length || (localRecord.inspection ? 1 : 0);
  const remoteInspections = remoteRecord.inspections?.length || (remoteRecord.inspection ? 1 : 0);
  if (localInspections !== remoteInspections) return localInspections > remoteInspections ? localRecord : remoteRecord;
  return recordTimestamp(localRecord) > recordTimestamp(remoteRecord) ? localRecord : remoteRecord;
}

let activeDataSync = null;
function syncFromSupabase({ renderAfter = true, pushAfter = true } = {}) {
  if (activeDataSync) return activeDataSync;
  activeDataSync = (async () => {
    const revisionAtStart = localDataRevision;
    const localEquipments = equipments.map(item => ({ ...item, usage: item.usage ? { ...item.usage } : null }));
    const localHistory = [...history];
    const stateBeforeSync = JSON.stringify({ equipments: localEquipments, history: localHistory });
    const [remoteEquipments, remoteHistory] = await Promise.all([
      supabaseRestRequest('equipments?select=id,code,status,usage,hourmeter,updatedAt'),
      supabaseRestRequest('history?select=*')
    ]);
    // Se o operador salvou algo enquanto a consulta estava em andamento, a versão
    // ao vivo deste aparelho tem prioridade sobre a fotografia antiga da sincronização.
    const currentLocalEquipments = localDataRevision === revisionAtStart
      ? localEquipments
      : equipments.map(item => ({ ...item, usage: item.usage ? { ...item.usage } : null }));
    const currentLocalHistory = localDataRevision === revisionAtStart ? localHistory : [...history];
    const historyIds = new Set([
      ...seedHistory.map(item => String(item.id)),
      ...currentLocalHistory.map(item => String(item.id)),
      ...remoteHistory.map(item => String(item.id))
    ]);
    history = Array.from(historyIds).map(id => {
      const seedRecord = seedHistory.find(item => String(item.id) === id);
      const localRecord = currentLocalHistory.find(item => String(item.id) === id) || seedRecord;
      const remoteRecord = remoteHistory.find(item => String(item.id) === id);
      return chooseHistoryRecord(localRecord, remoteRecord);
    }).filter(Boolean).sort((a,b) => recordTimestamp(b) - recordTimestamp(a));

    const remoteEquipmentMap = new Map((remoteEquipments || []).map(item => {
      const sanitized = sanitizeEquipment(item);
      return [String(sanitized.code || sanitized.id || '').toUpperCase(), sanitized];
    }));
    const localEquipmentMap = new Map(currentLocalEquipments.map(item => [String(item.code || item.id || '').toUpperCase(), item]));
    const pendingEquipmentIds = new Set(pendingFieldEvents.map(event => String(event.equipment?.id || '')));
    const equipmentKeys = new Set([...localEquipmentMap.keys(), ...remoteEquipmentMap.keys()]);
    equipments = Array.from(equipmentKeys).map(key => {
      const localEquipment = localEquipmentMap.get(key);
      const remoteEquipment = remoteEquipmentMap.get(key);
      if (!localEquipment) return remoteEquipment;
      if (!remoteEquipment) return localEquipment;
      // The database is authoritative across devices. Local operational data only wins
      // while this device has a queued event that still needs to reach the database.
      const hasPendingEvent = pendingEquipmentIds.has(String(localEquipment.id));
      const chosen = hasPendingEvent
        ? { ...remoteEquipment, ...localEquipment }
        : { ...localEquipment, ...remoteEquipment };
      return sanitizeEquipment(chosen);
    }).filter(Boolean);

    const stateChanged = JSON.stringify({ equipments, history }) !== stateBeforeSync;
    if (stateChanged) saveLocalBackup();
    const saveResult = pushAfter && pendingFieldEvents.length > 0
      ? await save()
      : { local: true, remote: true };
    // Nunca substitui um formulário que a pessoa já está preenchendo no celular.
    if (renderAfter && stateChanged && !document.querySelector('#modalRoot form')) render();
    return saveResult;
  })().catch(error => {
    console.warn('Sincronização com Supabase falhou; mantendo os dados locais:', error);
    return { local: true, remote: false, error };
  }).finally(() => {
    activeDataSync = null;
  });
  return activeDataSync;
}

async function initializeApp() {
  equipments = seedEquipments.map(sanitizeEquipment);
  history = seedHistory;

  // A cópia deste aparelho aparece imediatamente, sem aguardar nenhuma rede.
  loadLocalStorageBackup();
  hydrateIcons();
  render();

  // Complementos e sincronização rodam em segundo plano e nunca zeram a tela.
  workforceReadyPromise = loadSeedWorkforce().then(() => {
    loadLocalStorageBackup();
    if (!document.querySelector('#modalRoot form')) render();
  });
  setTimeout(() => syncFromSupabase(), 0);
}
function companyOptions(selected='') {
  const companies=[...new Set(workforce.map(person=>person?.company).filter(Boolean))];
  if (selected && !companies.includes(selected)) companies.push(selected);
  companies.sort(safeSort);
  return `<option value="">Selecione a empresa...</option>${companies.map(company=>`<option value="${esc(company)}" ${company===selected?'selected':''}>${esc(company)}</option>`).join('')}`;
}
function responsibleOptions(company='',selected='') {
  const people=workforce.filter(person=>person && (!company||person.company===company)).sort((a,b)=>safeSort(a.name, b.name));
  const selectedIsListed = people.some(person => person.name === selected);
  const legacyOption = selected && !selectedIsListed ? `<option value="${esc(selected)}" selected>${esc(selected)} — responsável atual</option>` : '';
  return `<option value="">Selecione o responsável...</option>${legacyOption}${people.map(person=>`<option value="${esc(person.name)}" ${person.name===selected?'selected':''}>${esc(person.name)}${person.role?` — ${esc(person.role)}`:''}</option>`).join('')}`;
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
function openDateTimePicker(input) {
  if (!input || input.readOnly || input.disabled) return;
  try { input.showPicker?.(); } catch(e) {}
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
      <label><span>${isReturn ? 'Empresa de quem está devolvendo' : 'Empresa'}</span><select name="company" required onchange="updateResponsibleOptions(this)">${companyOptions(preset.company||'')}</select></label>
      <label><span>${isReturn ? 'Nome de quem está devolvendo' : 'Nome do responsável'}</span><select name="responsible" required onchange="fillPersonPhone(this)">${responsibleOptions(preset.company||'',preset.responsible||'')}</select></label>
      <label class="year-field"><span>Ano base</span><input value="${new Date().getFullYear()}" readonly></label>
    </div>
    <div class="inspection-strip"><strong>Inspeção obrigatória</strong><span>Selecione uma opção em cada item conforme a legenda do formulário original.</span></div>
    <div class="inspection-groups">
      ${groups.map(group => `<section class="inspection-group"><h3>${group}</h3>${checklistItems.map((item, i) => item.group === group ? `<div class="inspection-row"><span class="inspection-index">${String(i + 1).padStart(2, '0')}</span><div class="inspection-question"><strong>${item.title}</strong><small>${item.text}</small></div><div class="inspection-answers">${inspectionLegend.map(option => `<label title="${option.label}"><input type="radio" name="inspect${i}" value="${option.value}" required><span>${option.value}</span></label>`).join('')}</div></div>` : '').join('')}</section>`).join('')}
    </div>
    <div class="inspection-bottom-fields">
      <label><span>Data e hora da inspeção</span><input type="datetime-local" name="inspectionAt" required value="${preset.inspectionAt || nowLocal()}"></label>
      <label><span>Horímetro</span><input type="number" inputmode="decimal" name="hourmeter" min="0" step="0.1" required placeholder="Ex.: 2440.5" value="${esc(eq.hourmeter ?? '')}"></label>
      <label class="operator-sign-field">
        <span>Visto / Rubrica do operador <em>*</em></span>
        <div class="sign-field-row">
          <input type="hidden" name="operatorSign" id="operatorSignInput" value="${esc(preset.operatorSign || '')}">
          <div id="signPreviewContainer" class="sign-preview-box" onclick="openSignatureModal()">
            ${preset.operatorSign ? `<img src="${esc(preset.operatorSign)}" class="sign-preview-img"><span class="sign-status-text">Rubrica confirmada (clique para alterar)</span>` : `<span class="sign-placeholder-text">✍️ Clique aqui para desenhar a rubrica com o dedo</span>`}
          </div>
        </div>
      </label>
      <label class="inspection-observations"><span>Observações</span><textarea name="inspectionNotes" placeholder="Registre anormalidades, avarias ou informações importantes..."></textarea></label>
    </div>
    <div class="inspection-legend"><strong>Legenda:</strong>${inspectionLegend.map(option => `<span><b>${option.value}</b> — ${option.label}</span>`).join('')}<span class="inspection-frequency"><strong>Frequência:</strong> Operador — Diária · Técnico de Segurança — Semanal</span></div>
  </section>`;
}

let signCanvas = null;
let signCtx = null;
let isDrawing = false;
let hasDrawnSignature = false;

function openSignatureModal() {
  const currentSign = document.getElementById('operatorSignInput')?.value || '';
  const modalHtml = `
    <div class="signature-modal-backdrop" id="signatureModalBackdrop" onclick="if(event.target===this)closeSignatureModal()">
      <div class="signature-modal-card">
        <header class="signature-modal-head">
          <div>
            <h3>Rubrica do Operador</h3>
            <p>Desenhe a sua assinatura ou rubrica com o dedo na área abaixo</p>
          </div>
          <button type="button" class="icon-button" onclick="closeSignatureModal()">${icon('close')}</button>
        </header>
        <div class="signature-canvas-wrap">
          <canvas id="signatureCanvas" width="460" height="190"></canvas>
          <span class="canvas-placeholder-hint" id="canvasHint">Desenhe sua rubrica com o dedo aqui</span>
        </div>
        <div class="signature-modal-foot">
          <button type="button" class="button button-outline" onclick="clearSignatureCanvas()">${icon('trash')} Limpar</button>
          <button type="button" class="button button-outline" onclick="closeSignatureModal()">Cancelar</button>
          <button type="button" class="button button-green" onclick="confirmSignature()">${icon('check')} Confirmar Rubrica</button>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', modalHtml);
  initSignatureCanvas(currentSign);
}

function initSignatureCanvas(existingData) {
  signCanvas = document.getElementById('signatureCanvas');
  if (!signCanvas) return;
  signCtx = signCanvas.getContext('2d');
  isDrawing = false;
  hasDrawnSignature = false;

  signCtx.strokeStyle = '#12221b';
  signCtx.lineWidth = 3;
  signCtx.lineCap = 'round';
  signCtx.lineJoin = 'round';

  if (existingData && existingData.startsWith('data:image/')) {
    const img = new Image();
    img.onload = () => {
      signCtx.drawImage(img, 0, 0);
      hasDrawnSignature = true;
      const hint = document.getElementById('canvasHint');
      if (hint) hint.style.display = 'none';
    };
    img.src = existingData;
  }

  function getPos(e) {
    const rect = signCanvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) * (signCanvas.width / rect.width),
      y: (clientY - rect.top) * (signCanvas.height / rect.height)
    };
  }

  function startDraw(e) {
    e.preventDefault();
    isDrawing = true;
    hasDrawnSignature = true;
    const hint = document.getElementById('canvasHint');
    if (hint) hint.style.display = 'none';
    const pos = getPos(e);
    signCtx.beginPath();
    signCtx.moveTo(pos.x, pos.y);
  }

  function draw(e) {
    if (!isDrawing) return;
    e.preventDefault();
    const pos = getPos(e);
    signCtx.lineTo(pos.x, pos.y);
    signCtx.stroke();
  }

  function stopDraw(e) {
    if (isDrawing) {
      if (e) e.preventDefault();
      signCtx.closePath();
      isDrawing = false;
    }
  }

  signCanvas.addEventListener('mousedown', startDraw);
  signCanvas.addEventListener('mousemove', draw);
  window.addEventListener('mouseup', stopDraw);

  signCanvas.addEventListener('touchstart', startDraw, { passive: false });
  signCanvas.addEventListener('touchmove', draw, { passive: false });
  signCanvas.addEventListener('touchend', stopDraw, { passive: false });
}

function clearSignatureCanvas() {
  if (signCanvas && signCtx) {
    signCtx.clearRect(0, 0, signCanvas.width, signCanvas.height);
    hasDrawnSignature = false;
    const hint = document.getElementById('canvasHint');
    if (hint) hint.style.display = 'block';
  }
}

function closeSignatureModal() {
  const el = document.getElementById('signatureModalBackdrop');
  if (el) el.remove();
}

function confirmSignature() {
  if (!signCanvas || !hasDrawnSignature) {
    toast('Por favor, faça sua rubrica no quadro antes de confirmar.', true);
    return;
  }
  const dataUrl = signCanvas.toDataURL('image/png');
  const input = document.getElementById('operatorSignInput');
  const preview = document.getElementById('signPreviewContainer');
  if (input) input.value = dataUrl;
  if (preview) {
    preview.innerHTML = `<img src="${dataUrl}" class="sign-preview-img" alt="Rubrica"><span class="sign-status-text">Rubrica confirmada (clique para alterar)</span>`;
  }
  closeSignatureModal();
  toast('Rubrica do operador registrada com sucesso.');
}

function inspectionFromData(data, mode) {
  return {
    mode,
    inspectedAt: data.inspectionAt,
    hourmeter: data.hourmeter,
    operatorName: data.responsible || '',
    company: data.company || '',
    operatorSign: data.operatorSign,
    observations: data.inspectionNotes || '',
    physicalFiled: data.physicalCopy === 'on',
    answers: checklistItems.map((_, i) => data[`inspect${i}`])
  };
}
function inspectionHasFailure(inspection) { return inspection.answers.some(answer => answer === 'O'); }
function printableInspection(eq, movement) {
  const list = (movement.inspections && movement.inspections.length > 0) 
    ? movement.inspections 
    : (movement.inspection ? [movement.inspection] : []);
  const firstInspection = list[0] || {};
  const groupHeaders = [['Comandos', 2], ['Sistema', 3], ['Segurança', 4], ['Outros', 1]];
  const emptyRowsCount = Math.max(0, 6 - list.length);
  const allObservations = list.map((ins, idx) => ins.observations ? `Dia ${idx + 1}: ${ins.observations}` : '').filter(Boolean).join(' | ');

  return `<article class="paper-document">
    <header class="paper-head">
      <div><img src="assets/heating-cooling-logo.jpg" alt="Heating Cooling"><img class="af-logo" src="assets/afonso-franca-logo.png" alt="Afonso França Engenharia"></div>
      <h2>FORMULÁRIO DE VERIFICAÇÃO E INSPEÇÃO — PLATAFORMA ELEVATÓRIA<br>MÓVEL DE TRABALHO (PEMT)<small>${firstInspection.mode === 'devolucao' ? 'INSPEÇÃO DE DEVOLUÇÃO / BAIXA' : 'FICHA DE INSPEÇÕES DIÁRIAS (FV-MAQ-ST)'}</small></h2>
      <aside><strong>FV-MAQ-ST</strong><span>Rev.: 00</span><span>Folha: 1/1</span></aside>
    </header>
    <div class="paper-info">
      <span><small>Equipamento</small><strong>${esc(eq.code)} — ${esc(eq.name)}</strong></span>
      <span><small>Empresa</small><strong>${esc(movement.company)}</strong></span>
      <span><small>Nome do responsável</small><strong>${esc(movement.person)}</strong></span>
      <span><small>Ano base</small><strong>${firstInspection.inspectedAt ? new Date(firstInspection.inspectedAt).getFullYear() : new Date().getFullYear()}</strong></span>
    </div>
    <div class="paper-job-info">
      <span><small>Atividade</small><strong>${esc(movement.activity || '')}</strong></span>
      <span><small>Data Hall — DH</small><strong>${esc(movement.dataHall || movement.place || '')}</strong></span>
      <span><small>Local específico</small><strong>${esc(movement.location || '')}</strong></span>
    </div>
    <div class="paper-table-wrap">
      <table class="paper-table">
        <thead>
          <tr>
            <th rowspan="2">Dia / Mês</th>
            ${groupHeaders.map(group => `<th colspan="${group[1]}">${group[0]}</th>`).join('')}
            <th rowspan="2">Horímetro</th>
            <th rowspan="2">Visto</th>
          </tr>
          <tr>
            ${checklistItems.map(item => `<th>${item.text}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${list.map(ins => `<tr>
            <td>${ins.inspectedAt ? new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' }).format(new Date(ins.inspectedAt)) : '—'}</td>
            ${ins.answers.map(answer => `<td class="paper-answer">${esc(answer || '')}</td>`).join('')}
            <td>${ins.hourmeter ? `${esc(ins.hourmeter)} h` : '—'}</td>
            <td>${ins.operatorSign ? (ins.operatorSign.startsWith('data:image/') ? `<img src="${esc(ins.operatorSign)}" class="paper-sign-cell-img" alt="Visto">` : esc(ins.operatorSign)) : '—'}</td>
          </tr>`).join('')}
          ${Array.from({ length: emptyRowsCount }, () => `<tr class="blank-row">${Array.from({ length: 13 }, () => '<td>&nbsp;</td>').join('')}</tr>`).join('')}
        </tbody>
      </table>
    </div>
    <div class="paper-notes">
      <strong>Observações</strong>
      <p>${esc(allObservations || 'Sem observações registradas.')}</p>
    </div>
    <footer class="paper-legend">
      <strong>Legenda:</strong>
      ${inspectionLegend.map(option => `<span>${option.value} — ${option.label}</span>`).join('')}
      <b>Frequência de inspeção:</b>
      <span>Operador — Diária<br>Técnico de Segurança — Semanal</span>
      <span class="paper-physical">Via física: ${firstInspection.physicalFiled ? 'arquivamento confirmado' : 'arquivar na pasta do colaborador'}</span>
    </footer>
  </article>`;
}
function pageHeader(title, subtitle, eyebrow = 'CENTRAL DE OPERAÇÕES', actions = '') {
  return `<section class="page-head"><div><p class="eyebrow">${eyebrow}</p><h1>${title}</h1><p>${subtitle}</p></div><div class="page-actions">${actions}</div></section>`;
}
function metric(label, value, detail, type, iconName, width) {
  return `<article class="metric-card"><div class="metric-top"><span>${label}</span><span class="metric-icon ${type}">${icon(iconName)}</span></div><div class="metric-value"><strong>${value}</strong><small>${detail}</small></div><div class="metric-bar"><span style="width:${width}%;background:var(--${type === 'amber' ? 'amber' : type === 'red' ? 'red' : type === 'blue' ? 'blue' : 'green'})"></span></div></article>`;
}

function render() {
  try {
    updateAppShellAccess();
    const hash = location.hash.replace('#','') || 'dashboard';

    if (!isAdmin() && ['dashboard', 'empresas', 'relatorios'].includes(hash) && !hash.startsWith('scan/')) {
      currentPage = 'equipamentos';
      renderEquipments();
    } else if (hash.startsWith('scan/')) {
      currentPage = 'equipamentos';
      renderEquipments();
      const id = hash.split('/')[1];
      setTimeout(() => openScannedEquipment(id), 40);
    } else if (hash === 'pemt-checklists') {
      currentPage = 'equipamentos';
      renderMovements();
    } else {
      currentPage = ['dashboard','equipamentos','empresas','relatorios'].includes(hash) ? hash : 'equipamentos';
      const views = { dashboard: renderDashboard, equipamentos: renderEquipments, empresas: renderCompanies, relatorios: renderReports };
      (views[currentPage] || renderEquipments)();
    }

    document.querySelectorAll('.nav-link').forEach(link => link.classList.toggle('active', link.dataset.page === currentPage));
    const navCount = document.getElementById('navEquipmentCount');
    if (navCount) navCount.textContent = equipments.length;
    closeMobileMenu();
    hydrateIcons();
  } catch (err) {
    console.error('Erro na renderização:', err);
    const appEl = document.getElementById('app');
    if (appEl) {
      appEl.innerHTML = `<div style="padding:40px;text-align:center;"><h2>Ocorreu um erro ao carregar a página</h2><p style="color:#cf5a4b;">${esc(err.message)}</p><button class="button button-green" onclick="location.hash='#equipamentos';location.reload();">Voltar ao início</button></div>`;
    }
  }
}
function equipmentModuleTabs(active='equipamentos') {
  return `<nav class="module-tabs" aria-label="Seções do controle de PTAs"><a href="#equipamentos" class="${active==='equipamentos'?'active':''}">${icon('lift')} Equipamentos</a><a href="#pemt-checklists" class="${active==='checklists'?'active':''}">${icon('file')} Checklists PEMT <b>${history.filter(item=>item.inspection).length}</b></a></nav>`;
}

function renderDashboard() {
  const available = equipments.filter(e => e.status === 'available').length;
  const inUse = equipments.filter(e => e.status === 'in-use').length;
  const maintenance = equipments.filter(e => e.status === 'maintenance').length;
  document.getElementById('app').innerHTML = `
    ${pageHeader('Gestão integrada da obra', 'Acesse os controles operacionais do DataCenter Omnia em um só lugar.', 'OBRA DATACENTER OMNIA · DC01')}
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
    <section class="home-footer-card" id="dashboardInstallCard"><div><span>${icon('download')}</span><div><strong>Instalar DataCenter Omnia neste aparelho</strong><small>Crie um atalho com o icone da Heating Cooling e abra o sistema como aplicativo.</small></div></div><button class="button button-green compact" onclick="installDataCenterApp()">Instalar App ${icon('download')}</button></section>
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
      <label class="search-box">${icon('search')}<input id="assetSearch" type="search" placeholder="Buscar patrimônio, código AFF, empreiteiro, série..." oninput="filterAssets()"></label>
      <label class="filter-field"><span>Nº AF</span><input id="afFilter" type="search" placeholder="Filtrar AF..." oninput="filterAssets()"></label>
      <label class="filter-field"><span>Data</span><input type="date" id="dateFilter" onchange="filterAssets()"></label>
      <label class="filter-field"><span>Modelo</span><select id="modelFilter" onchange="filterAssets()"><option value="">Todos</option>${models.map(model=>`<option>${esc(model)}</option>`).join('')}</select></label>
      <label class="filter-field"><span>Tipo</span><select id="typeFilter" onchange="filterAssets()"><option value="">Todos</option><option>PTA Tesoura</option><option>PTA Articulada</option><option>PTA Mastro</option><option>Paleteira Elétrica</option></select></label>
      <label class="filter-field"><span>Status</span><select id="statusFilter" onchange="filterAssets()"><option value="">Todos</option><option value="available">Disponível</option><option value="in-use">Em uso</option><option value="maintenance">Manutenção</option></select></label>
    </div>
    <article class="panel compact-equipment-panel"><div class="table-wrap"><table class="data-table equipment-control-table"><thead><tr><th>Equipamento</th><th>codigo AFF</th><th>Empreiteiro</th><th>Modelo</th><th>Status</th><th>Em uso por</th><th>Local</th><th>Previsão de devolução</th><th>Checklist</th><th></th></tr></thead><tbody id="equipmentControlBody">${equipments.map(equipmentControlRow).join('')}</tbody></table></div><div class="no-filter-results" id="noFilterResults">Nenhum equipamento encontrado com estes filtros.</div></article>`;
}
function equipmentControlRow(eq) {
  const latest=history.find(item=>item.equipmentId===eq.id&&item.inspection);
  const dates=[eq.emissionDate||'',...history.filter(item=>item.equipmentId===eq.id).map(item=>item.date?.slice(0,10)||'')].join(' ');
  return `<tr class="equipment-control-row" data-status="${eq.status}" data-type="${esc(eq.type)}" data-model="${esc(eq.model||'')}" data-af="${esc(eq.afNumber||'')}" data-dates="${dates}" data-search="${esc(`${eq.name} ${eq.code} ${eq.afNumber||''} ${eq.contractor||''} ${eq.serial||''} ${eq.model||''} ${eq.usage?.responsible||''} ${eq.usage?.company||''} ${eq.usage?.activity||''}`.toLowerCase())}"><td><div class="equipment-identity"><span>${equipmentIcon(eq)}</span><div><strong>${esc(eq.code)}</strong><small>${esc(eq.name)}</small></div></div></td><td>${eq.afNumber ? `<span class="af-badge">${esc(eq.afNumber)}</span>` : '<span class="muted-dash">—</span>'}</td><td><strong>${esc(eq.contractor||'—')}</strong></td><td><strong>${esc(eq.model||'—')}</strong><small class="table-sub">${esc(eq.battery ? `Bateria ${eq.battery}` : eq.brand||'')}</small></td><td>${statusBadge(eq.status)}</td><td>${eq.usage?`<strong>${esc(eq.usage.responsible)}</strong><small class="table-sub">${esc(eq.usage.company)}</small>`:'<span class="muted-dash">—</span>'}</td><td>${eq.usage?`<strong>${esc(eq.usage.dataHall)}</strong><small class="table-sub">${esc(eq.usage.location)}</small><small class="table-sub activity-sub">${esc(eq.usage.activity||'')}</small>`:'<span class="muted-dash">Pátio / Base</span>'}</td><td>${eq.usage?`<strong>${fullDate(eq.usage.expectedAt)}</strong>`:'<span class="muted-dash">—</span>'}</td><td>${latest?`<button class="table-action" onclick="openInspectionRecord(${latest.id})">${icon('file')} Ver</button>`:'<span class="muted-dash">Sem registro</span>'}</td><td><div class="control-row-actions"><button class="icon-button" title="QR Code" onclick="openQRModal('${eq.id}')">${icon('qr')}</button><button class="button ${eq.status==='available'?'button-green':'button-outline'} compact" onclick="openEquipmentDetails('${eq.id}')">${eq.status==='available'?'Retirar':'Detalhes'}</button></div></td></tr>`;
}
function assetCard(eq) {
  return `<article class="asset-card" data-status="${eq.status}" data-type="${esc(eq.type)}" data-search="${esc(`${eq.name} ${eq.code} ${eq.afNumber||''} ${eq.contractor||''} ${eq.brand} ${eq.model}`.toLowerCase())}"><div class="asset-card-top"><span class="asset-icon">${equipmentIcon(eq)}</span>${statusBadge(eq.status)}</div><h3>${esc(eq.name)}</h3><div class="asset-code">${esc(eq.code)} ${eq.afNumber ? `· <span class="af-badge">AFF: ${esc(eq.afNumber)}</span>` : ''} · ${esc(eq.contractor || eq.brand)} ${esc(eq.model)}</div><div class="asset-meta"><div><span>Localização</span><strong>${esc(eq.usage?.dataHall || 'Pátio / Base')}</strong></div><div><span>Responsável</span><strong>${esc(eq.usage?.responsible || 'Sem responsável')}</strong></div></div><div class="asset-actions"><button class="button button-outline" onclick="openQRModal('${eq.id}')">${icon('qr')} QR Code</button><button class="button ${eq.status === 'available' ? 'button-green' : 'button-dark'}" onclick="openEquipmentDetails('${eq.id}')">${eq.status === 'available' ? 'Liberar uso' : 'Ver detalhes'} ${icon('arrow')}</button></div></article>`;
}
function filterAssets() {
  const search = document.getElementById('assetSearch').value.toLowerCase();
  const af = document.getElementById('afFilter') ? document.getElementById('afFilter').value.toLowerCase().trim() : '';
  const status = document.getElementById('statusFilter').value;
  const type = document.getElementById('typeFilter').value;
  const model = document.getElementById('modelFilter').value;
  const date = document.getElementById('dateFilter').value;
  let visible=0;
  document.querySelectorAll('.equipment-control-row').forEach(row => {
    const show=(!search||row.dataset.search.includes(search))&&
               (!af||(row.dataset.af||'').toLowerCase().includes(af))&&
               (!status||row.dataset.status===status)&&
               (!type||row.dataset.type===type)&&
               (!model||row.dataset.model===model)&&
               (!date||row.dataset.dates.includes(date));
    row.style.display=show?'':'none';
    if(show)visible++;
  });
  document.getElementById('noFilterResults').style.display=visible?'none':'block';
}

function openEquipmentImportModal() {
  modal(`${modalHead('Atualizar PTAs por Excel','Utilize a planilha padrão OMNIA DC01')}<div class="modal-body"><div class="upload-zone" onclick="document.getElementById('equipmentFile').click()"><span>${icon('lift')}</span><div><h3>Selecionar planilha de equipamentos</h3><p>Formatos .xlsx ou .xls · todas as abas serão verificadas</p></div><button type="button" class="button button-outline compact">Escolher arquivo</button><input id="equipmentFile" type="file" accept=".xlsx,.xls" hidden onchange="handleEquipmentUpload(event)"></div><div class="upload-info"><span>${icon('check')}</span><div><strong>${equipments.length} equipamentos cadastrados atualmente</strong><small>${esc(equipmentImportMeta.source||'Nenhuma planilha importada')} ${equipmentImportMeta.updatedAt?`· ${new Intl.DateTimeFormat('pt-BR').format(new Date(equipmentImportMeta.updatedAt))}`:''}</small></div></div><div class="import-columns"><span>NF</span><span>Data emissão</span><span>Código produto</span><span>Descrição</span><span>Patrimônio</span><span>Chassi</span><span>Horímetro</span><span>Unidade</span><span>Bateria</span><span>codigo AFF</span><span>Empreiteiro</span></div><div class="notice">${icon('alert')} A importação atualiza equipamentos pelo número de patrimônio e adiciona os novos. Status, responsável atual, localização e checklists são preservados. Equipamentos ausentes na planilha não são excluídos.</div></div><div class="modal-foot"><button class="button button-outline" onclick="exportEquipmentsExcel()">${icon('download')} Baixar planilha de PTAs atualizada</button><button class="button button-green" onclick="closeModal()">Fechar</button></div>`,'modal-large');
}

async function exportEquipmentsExcel() {
  if(!await ensureExcelLibrary()) return toast('Não foi possível carregar o gerador de Excel. Verifique a internet e tente novamente.',true);
  
  const selectedEquipments = getReportFilteredEquipments();
  if(!selectedEquipments.length) return toast('Nenhum equipamento encontrado.',true);
  
  const titleRow = ['Relação de Equipamentos - Notas Fiscais de Remessa para Locação (Tecnogera)'];
  
  const group08M = selectedEquipments.filter(e => /08m/i.test(e.name || e.model));
  const group10M = selectedEquipments.filter(e => /10m/i.test(e.name || e.model));
  const group12M = selectedEquipments.filter(e => /12m/i.test(e.name || e.model));
  const groupOther = selectedEquipments.filter(e => !/08m|10m|12m/i.test(e.name || e.model));

  const mapRow = eq => [
    eq.invoice || '',
    eq.emissionDate ? (eq.emissionDate.includes('-') ? eq.emissionDate.split('-').reverse().join('/') : eq.emissionDate) : '',
    eq.productCode || '',
    eq.name || eq.model || '',
    eq.code || '',
    eq.serial || '',
    eq.hourmeter ?? 0,
    'UN',
    eq.battery || '',
    eq.afNumber || '',
    eq.contractor || ''
  ];

  const sheetData = [titleRow, []];

  if (group08M.length > 0) {
    sheetData.push(['PLATAFORMA TESOURA 08M']);
    sheetData.push(['NF','Data Emissão','Código Produto','Descrição do Equipamento','Nº Série/Patrimônio','Nº Chassi/Identificação','Horímetro (HR)','Unidade','Tipo de Bateria','codigo AFF','Empreiteiro']);
    group08M.forEach(eq => sheetData.push(mapRow(eq)));
    sheetData.push(['','','','','','','','','TOTAL PLATAFORMA TESOURA 08M:', group08M.length]);
    sheetData.push([]);
  }

  if (group10M.length > 0) {
    sheetData.push(['PLATAFORMA TESOURA 10M']);
    sheetData.push(['NF','Data Emissão','Código Produto','Descrição do Equipamento','Nº Série/Patrimônio','Nº Chassi/Identificação','Horímetro (HR)','Unidade','Tipo de Bateria','ident','Empreiteiro']);
    group10M.forEach(eq => sheetData.push(mapRow(eq)));
    sheetData.push(['','','','','','','','','TOTAL PLATAFORMA TESOURA 10M:', group10M.length]);
    sheetData.push([]);
  }

  if (group12M.length > 0) {
    sheetData.push(['PLATAFORMA TESOURA 12M']);
    sheetData.push(['NF','Data Emissão','Código Produto','Descrição do Equipamento','Nº Série/Patrimônio','Nº Chassi/Identificação','Horímetro (HR)','Unidade','Tipo de Bateria','codigo AFF','Empreiteiro']);
    group12M.forEach(eq => sheetData.push(mapRow(eq)));
    sheetData.push(['','','','','','','','','TOTAL PLATAFORMA TESOURA 12M:', group12M.length]);
    sheetData.push([]);
  }

  if (groupOther.length > 0) {
    sheetData.push(['OUTROS EQUIPAMENTOS']);
    sheetData.push(['NF','Data Emissão','Código Produto','Descrição do Equipamento','Nº Série/Patrimônio','Nº Chassi/Identificação','Horímetro (HR)','Unidade','Tipo de Bateria','codigo AFF','Empreiteiro']);
    groupOther.forEach(eq => sheetData.push(mapRow(eq)));
    sheetData.push([]);
  }

  sheetData.push(['','','','','','','','','TOTAL GERAL DE EQUIPAMENTOS:', selectedEquipments.length]);
  sheetData.push([]);
  sheetData.push(['Observação: a bateria de Lítio demora 3 horas para carregar; a bateria de Chumbo demora 8 horas para carregar.']);

  const sheet = XLSX.utils.aoa_to_sheet(sheetData);
  sheet['!cols'] = [
    { wch: 10 },
    { wch: 14 },
    { wch: 16 },
    { wch: 38 },
    { wch: 20 },
    { wch: 24 },
    { wch: 15 },
    { wch: 10 },
    { wch: 15 },
    { wch: 16 },
    { wch: 22 }
  ];
  
  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, sheet, 'Equipamentos');
  XLSX.writeFile(book, `controle-ptas-omnia-${new Date().toISOString().slice(0,10)}.xlsx`);
  toast('Planilha de PTAs baixada com sucesso.');
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
  if(!await ensureExcelLibrary()){event.target.value='';return toast('Não foi possível carregar o leitor de Excel. Verifique a internet e tente novamente.',true);}
  try {
    const bytes=await file.arrayBuffer(); const workbook=XLSX.read(bytes,{type:'array',cellDates:true}); const imported=[]; const seen=new Set();
    workbook.SheetNames.forEach(sheetName=>{
      const rows=XLSX.utils.sheet_to_json(workbook.Sheets[sheetName],{header:1,defval:'',raw:true});
      let colMap = { invoice:0, emissionDate:1, productCode:2, description:3, code:4, serial:5, hourmeter:6, battery:8, afNumber:9, contractor:10 };
      for(let r=0; r<Math.min(15, rows.length); r++) {
        const row = rows[r];
        if(Array.isArray(row)) {
          row.forEach((cellVal, cIdx) => {
            const txt = String(cellVal).trim().toLowerCase();
            if((/aff|codigo|ident|nº af/i.test(txt)) && !/descrição|produto|patrimônio/i.test(txt)) colMap.afNumber = cIdx;
            if(/empreiteiro|empresa/i.test(txt)) colMap.contractor = cIdx;
            if(/bateria/i.test(txt)) colMap.battery = cIdx;
            if(/horímetro|hr/i.test(txt)) colMap.hourmeter = cIdx;
            if(/chassi|identificação/i.test(txt)) colMap.serial = cIdx;
            if(/patrimônio|série/i.test(txt)) colMap.code = cIdx;
            if(/descrição/i.test(txt)) colMap.description = cIdx;
          });
        }
      }
      rows.forEach(row=>{
        const description=String(row[colMap.description]||'').replace(/\s+/g,' ').trim();
        const code=String(row[colMap.code]||'').replace(/\s+/g,'').trim().toUpperCase();
        if(!description||!code||/descrição do equipamento/i.test(description)||/série|patrimônio/i.test(code)||/^total/i.test(description))return;
        const key=code.toUpperCase();
        if(seen.has(key))return;
        seen.add(key);
        const hourText=String(row[colMap.hourmeter]??'').replace(',','.');
        const name=description;
        let afVal = String(row[colMap.afNumber]||'').trim();
        let contractorVal = String(row[colMap.contractor]||'').trim();
        if (/^[A-Za-z.\s]+$/.test(afVal) && /^\d+$/.test(contractorVal)) {
          const tmp = afVal;
          afVal = contractorVal;
          contractorVal = tmp;
        }
        const itemObj = {
          code,
          name,
          type:equipmentTypeFromDescription(description),
          brand:'Tecnogera',
          model:description.replace(/^Plataforma\s+/i,''),
          serial:String(row[colMap.serial]||'').trim(),
          productCode:String(row[colMap.productCode]||'').trim(),
          invoice:String(row[colMap.invoice]||'').trim(),
          emissionDate:spreadsheetDate(row[colMap.emissionDate]),
          hourmeter:Number.isFinite(Number(hourText))?Number(hourText):0,
          battery:String(row[colMap.battery]||'').trim(),
          afNumber:afVal,
          contractor:contractorVal
        };
        imported.push(sanitizeEquipment(itemObj));
      });
    });
    let added = 0;
    let updated = 0;
    imported.forEach(item => {
      const existingIndex = equipments.findIndex(e => e.code.toUpperCase() === item.code.toUpperCase());
      if (existingIndex >= 0) {
        equipments[existingIndex] = {
          ...equipments[existingIndex],
          ...item,
          afNumber: item.afNumber || equipments[existingIndex].afNumber || '',
          contractor: item.contractor || equipments[existingIndex].contractor || '',
          status: equipments[existingIndex].status,
          usage: equipments[existingIndex].usage
        };
        updated++;
      } else {
        item.id = `pta-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
        item.status = 'available';
        item.usage = null;
        equipments.push(item);
        added++;
      }
    });

    equipments.sort((a,b)=>safeSort(a.model||a.name, b.model||b.name)||safeSort(a.code, b.code));
    equipmentImportMeta={source:file.name,updatedAt:new Date().toISOString(),total:imported.length};
    const client = getSupabase();
    if (client) client.from('app_metadata').upsert({key:'equipment_import_meta',value:equipmentImportMeta});
    save(); closeModal(); renderEquipments();
    const navCount = document.getElementById('navEquipmentCount');
    if (navCount) navCount.textContent = equipments.length;
    toast(`${updated} equipamento(s) atualizado(s) e ${added} novo(s) importado(s).`);
  } catch(error){toast(error.message||'Não foi possível ler a planilha de equipamentos.',true);}
}

function renderMovements() {
  const inspections = history.filter(item => item.inspection || (item.inspections && item.inspections.length > 0)); 
  const people = [...new Set(inspections.map(item => item.person).filter(Boolean))].sort(safeSort);
  document.getElementById('app').innerHTML = `
    ${pageHeader('Checklists PEMT', 'Controle digital complementar ao formulário físico arquivado na pasta do colaborador.', 'CONTROLE DE PTAs E PALETEIRAS', `<button class="button button-outline" onclick="openBlankInspectionTemplate()">${icon('print')} Imprimir formulário físico</button><button class="button button-green" onclick="exportChecklistExcel()">${icon('download')} Baixar Excel</button>`)}
    ${equipmentModuleTabs('checklists')}
    <section class="physical-guidance">${icon('file')}<div><strong>O formulário físico continua obrigatório</strong><small>Imprima o modelo, colha as assinaturas e arquive a via na pasta do colaborador. O registro digital facilita consulta e rastreabilidade.</small></div><button onclick="openBlankInspectionTemplate()">Imprimir modelo</button></section>
    <section class="control-summary">
      <span><b>${inspections.length}</b> formulários digitais</span>
      <span class="summary-green"><i></i><b>${inspections.filter(item => !inspectionHasFailure(item.inspection || item.inspections?.[0])).length}</b> aprovados</span>
      <span class="summary-amber"><i></i><b>${inspections.filter(item => (item.inspection || item.inspections?.[0])?.mode === 'retirada').length}</b> retiradas</span>
    </section>
    <div class="checklist-filters">
      <label class="filter-field"><span>Pessoa</span><select id="checkPerson" onchange="filterChecklists()"><option value="">Todas</option>${people.map(person => `<option>${esc(person)}</option>`).join('')}</select></label>
      <label class="filter-field"><span>Equipamento</span><select id="checkEquipment" onchange="filterChecklists()"><option value="">Todos</option>${equipments.map(eq => `<option value="${eq.id}">${esc(eq.code)} — ${esc(eq.model)}</option>`).join('')}</select></label>
      <label class="filter-field"><span>Tipo</span><select id="checkMode" onchange="filterChecklists()"><option value="">Todos</option><option value="retirada">Retirada</option><option value="devolucao">Devolução</option></select></label>
      <label class="filter-field"><span>Data inicial</span><input id="checkStart" type="date" onchange="filterChecklists()"></label>
      <label class="filter-field"><span>Data final</span><input id="checkEnd" type="date" onchange="filterChecklists()"></label>
    </div>
    <article class="panel checklist-panel">
      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th style="width: 36px; text-align: center;"><input type="checkbox" id="selectAllChecklists" onchange="toggleSelectAllChecklists(this)" title="Selecionar todos"></th>
              <th>Data</th>
              <th>Equipamento</th>
              <th>Tipo</th>
              <th>Responsável</th>
              <th>Empresa</th>
              <th>Atividade / Local</th>
              <th>Resultado</th>
              <th>Linhas preenchidas</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            ${inspections.map(item => {
              const eq = equipments.find(e => e.id === item.equipmentId);
              const list = (item.inspections && item.inspections.length > 0) ? item.inspections : (item.inspection ? [item.inspection] : []);
              const failed = list.some(ins => inspectionHasFailure(ins));
              const mainMode = list[0]?.mode || 'retirada';
              return `<tr class="checklist-record-row" data-id="${item.id}" data-person="${esc(item.person)}" data-equipment="${item.equipmentId}" data-mode="${mainMode}" data-date="${item.date.slice(0,10)}">
                <td style="text-align: center;"><input type="checkbox" class="checklist-select-check" value="${item.id}" onchange="updateChecklistSelection()"></td>
                <td>${fullDate(item.date)}</td>
                <td><strong>${esc(eq?.code || '—')}</strong><small class="table-sub">${esc(eq?.model || '')}</small></td>
                <td>${mainMode === 'devolucao' ? '<span class="status available">Devolução</span>' : '<span class="status in-use">Retirada</span>'}</td>
                <td><strong>${esc(item.person)}</strong></td>
                <td>${esc(item.company)}</td>
                <td><strong>${esc(item.activity || '—')}</strong><small class="table-sub">${esc(item.dataHall || item.place)} · ${esc(item.location || '')}</small></td>
                <td><span class="status ${failed ? 'maintenance' : 'available'}">${failed ? 'Reprovado' : 'Aprovado'}</span></td>
                <td><span class="physical-ok">${list.length} linha(s)</span></td>
                <td><button class="table-action" onclick="openInspectionRecord(${item.id})">${icon('download')} PDF / ver</button></td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
      ${inspections.length ? '' : `<div class="checklist-empty"><span>${icon('file')}</span><h2>Nenhum checklist digital preenchido</h2><p>Você já pode imprimir o formulário físico em branco. Os registros digitais aparecerão aqui após a primeira retirada ou devolução.</p><button class="button button-green" onclick="openBlankInspectionTemplate()">${icon('print')} Imprimir formulário físico</button></div>`}
      <div class="no-filter-results" id="noChecklistResults">Nenhum checklist encontrado com estes filtros.</div>
    </article>
    
    <div id="batchChecklistBar" class="batch-checklist-bar" style="display: none;">
      <div class="batch-bar-info">
        <span class="batch-count" id="batchSelectedCount">0 selecionados</span>
      </div>
      <div class="batch-bar-actions">
        <button class="button button-dark compact" onclick="printSelectedChecklists()">${icon('print')} Imprimir Selecionados (PDF)</button>
        <button class="button button-outline compact" onclick="exportChecklistExcel()">${icon('download')} Baixar Excel Selecionados</button>
        <button class="button button-ghost compact" onclick="clearChecklistSelection()">Desmarcar</button>
      </div>
    </div>`;
}

function getSelectedChecklistIds() {
  return Array.from(document.querySelectorAll('.checklist-select-check:checked')).map(cb => Number(cb.value));
}

function updateChecklistSelection() {
  const ids = getSelectedChecklistIds();
  const bar = document.getElementById('batchChecklistBar');
  const countEl = document.getElementById('batchSelectedCount');
  if (bar && countEl) {
    if (ids.length > 0) {
      bar.style.display = 'flex';
      countEl.textContent = `${ids.length} formulário(s) selecionado(s)`;
    } else {
      bar.style.display = 'none';
    }
  }
}

function toggleSelectAllChecklists(headerCheckbox) {
  const checks = document.querySelectorAll('.checklist-select-check');
  checks.forEach(cb => {
    if (cb.closest('tr').style.display !== 'none') {
      cb.checked = headerCheckbox.checked;
    }
  });
  updateChecklistSelection();
}

function clearChecklistSelection() {
  document.querySelectorAll('.checklist-select-check').forEach(cb => cb.checked = false);
  const headerCb = document.getElementById('selectAllChecklists');
  if (headerCb) headerCb.checked = false;
  updateChecklistSelection();
}

function printSelectedChecklists() {
  const ids = getSelectedChecklistIds();
  if (!ids.length) return toast('Selecione pelo menos um checklist para imprimir.', true);
  
  const selectedMovements = history.filter(item => ids.includes(item.id));
  const docsHtml = selectedMovements.map(m => {
    const eq = equipments.find(e => e.id === m.equipmentId) || { code: '—', name: 'Equipamento' };
    return `<div class="printable-sheet-wrapper">${printableInspection(eq, m)}</div>`;
  }).join('');

  modal(`${modalHead('Impressão em lote de formulários', `${ids.length} formulário(s) pronto(s) para salvar em PDF`)}
    <div class="modal-body inspection-record batch-print-preview">
      ${docsHtml}
    </div>
    <div class="modal-foot">
      <button class="button button-outline" onclick="closeModal()">Fechar</button>
      <button class="button button-dark" onclick="window.print()">${icon('print')} Imprimir / Salvar todos em PDF (${ids.length})</button>
    </div>`, 'modal-paper');

  document.querySelector('.modal-backdrop').classList.add('print-area', 'inspection-print-area', 'batch-print-area');
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
async function exportChecklistExcel() {
  if(!await ensureExcelLibrary()) return toast('Não foi possível carregar o gerador de Excel. Verifique a internet e tente novamente.',true);
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
  const companies=[...new Set(workforce.map(person=>person?.company).filter(Boolean))].sort(safeSort);
  document.getElementById('app').innerHTML = `${pageHeader('Empresas & efetivo', 'Cadastre manualmente ou importe a planilha completa da obra.', 'CADASTRO CENTRAL', `<button class="button button-outline" onclick="openWorkforceModal()">${icon('download')} Importar Excel</button><button class="button button-outline" onclick="exportWorkforceExcel()">${icon('download')} Exportar Excel</button><button class="button button-green" onclick="openPersonModal()">${icon('plus')} Adicionar pessoa</button>`)}<section class="workforce-summary"><div><span>${icon('building')}</span><p><strong>${companies.length}</strong><small>Empresas</small></p></div><div><span>${icon('user')}</span><p><strong>${workforce.length}</strong><small>Pessoas cadastradas</small></p></div><div class="workforce-source"><p><small>Última atualização</small><strong>${esc(workforceMeta.source||'Cadastro manual')}</strong><span>${workforceMeta.updatedAt?`${new Intl.DateTimeFormat('pt-BR').format(new Date(workforceMeta.updatedAt))}`:''}</span></p></div></section><div class="simple-filters workforce-filters"><label class="search-box">${icon('search')}<input id="workforceSearch" type="search" placeholder="Buscar nome, função ou empresa..." oninput="filterWorkforce()"></label><label class="filter-field"><span>Empresa</span><select id="workforceCompany" onchange="filterWorkforce()"><option value="">Todas</option>${companies.map(company=>`<option>${esc(company)}</option>`).join('')}</select></label></div><article class="panel"><div class="panel-head"><div><h2>Pessoas cadastradas</h2><p>Disponíveis na lista de responsáveis dos checklists</p></div></div><div class="table-wrap"><table class="data-table"><thead><tr><th>Nome</th><th>Empresa</th><th>Função</th><th>Vínculo</th><th></th></tr></thead><tbody>${workforce.map((person,index)=>`<tr class="workforce-row" data-company="${esc(person?.company||'')}" data-search="${esc(`${person?.name||''} ${person?.company||''} ${person?.role||''}`.toLowerCase())}"><td><strong>${esc(person?.name||'')}</strong></td><td>${esc(person?.company||'')}</td><td>${esc(person?.role||'—')}</td><td>${esc(person?.status||'—')}</td><td><div class="control-row-actions"><button class="icon-button" title="Editar" onclick="openPersonModal(${index})">${icon('edit')}</button><button class="icon-button" title="Excluir" onclick="deletePerson(${index})">${icon('trash')}</button></div></td></tr>`).join('')}</tbody></table></div><div class="no-filter-results" id="noWorkforceResults">Nenhuma pessoa encontrada.</div></article>`;
}
function filterWorkforce() {
  const search=document.getElementById('workforceSearch').value.toLowerCase(); const company=document.getElementById('workforceCompany').value; let visible=0;
  document.querySelectorAll('.workforce-row').forEach(row=>{const show=(!search||row.dataset.search.includes(search))&&(!company||row.dataset.company===company);row.style.display=show?'':'none';if(show)visible++;});
  document.getElementById('noWorkforceResults').style.display=visible?'none':'block';
}
function openPersonModal(index=null) {
  const person=index===null?null:workforce[index]; const companies=[...new Set(workforce.map(item=>item?.company).filter(Boolean))].sort(safeSort);
  modal(`<form onsubmit="savePerson(event,${index===null?'null':index})">${modalHead(person?'Editar pessoa':'Adicionar pessoa','Cadastro individual do efetivo da obra')}<div class="modal-body"><div class="form-grid"><div class="field full"><label>Empresa <em>*</em></label><input name="company" required list="companySuggestions" placeholder="Selecione ou digite uma nova empresa" value="${esc(person?.company||'')}"><datalist id="companySuggestions">${companies.map(company=>`<option value="${esc(company)}"></option>`).join('')}</datalist></div><div class="field full"><label>Nome completo <em>*</em></label><input name="name" required placeholder="Nome da pessoa" value="${esc(person?.name||'')}"></div><div class="field"><label>Função <em>*</em></label><input name="role" required placeholder="Ex.: Operador de PTA" value="${esc(person?.role||'')}"></div><div class="field"><label>Vínculo / status</label><select name="status"><option value="">Não informado</option><option value="DIRETA" ${person?.status==='DIRETA'?'selected':''}>Direta</option><option value="INDIRETA" ${person?.status==='INDIRETA'?'selected':''}>Indireta</option><option value="TERCEIRO" ${person?.status==='TERCEIRO'?'selected':''}>Terceiro</option></select></div><div class="field"><label>Perfil de Acesso</label><select name="accessRole"><option value="operator" ${person?.accessRole!=='admin'?'selected':''}>Operador / Campo (Sem acesso administrativo)</option><option value="admin" ${person?.accessRole==='admin'?'selected':''}>Gestor / Administrador (Acesso completo)</option></select></div><div class="field"><label>PIN de Acesso (Gestão)</label><input name="pin" maxlength="8" placeholder="Ex.: 1234" value="${esc(person?.pin||'')}"></div><div class="field full"><label>Telefone</label><input name="phone" placeholder="(85) 99999-9999" value="${esc(person?.phone||'')}"></div></div></div><div class="modal-foot"><button type="button" class="button button-outline" onclick="closeModal()">Cancelar</button><button class="button button-green">${icon('check')} Salvar pessoa</button></div></form>`,'modal-small');
}
function savePerson(event,index) {
  event.preventDefault(); const data=Object.fromEntries(new FormData(event.target)); Object.keys(data).forEach(key=>data[key]=String(data[key]).replace(/\s+/g,' ').trim());
  const duplicate=workforce.some((person,i)=>i!==index&&(person?.company||'').toLowerCase()===data.company.toLowerCase()&&(person?.name||'').toLowerCase()===data.name.toLowerCase()); if(duplicate)return toast('Esta pessoa já está cadastrada nesta empresa.',true);
  if(index===null) { if(!data.id) data.id=crypto.randomUUID(); workforce.push(data); if(supabase) supabase.from('workforce').upsert(data); } else { workforce[index]={...workforce[index],...data}; if(supabase) supabase.from('workforce').upsert(workforce[index]); } workforce.sort((a,b)=>safeSort(a?.company,b?.company)||safeSort(a?.name,b?.name)); workforceMeta={source:'Cadastro manual',updatedAt:new Date().toISOString()}; if(supabase) supabase.from('app_metadata').upsert({key:'workforce_meta',value:workforceMeta}); saveLocalBackup(); closeModal(); renderCompanies(); toast(personMessage(index));
}
function personMessage(index) { return index===null?'Pessoa adicionada ao efetivo.':'Cadastro atualizado.'; }
function deletePerson(index) {
  const person=workforce[index]; if(!person||!confirm(`Excluir ${person.name} da lista de efetivo?`))return; workforce.splice(index,1); if(supabase) supabase.from('workforce').delete().eq('id', person.id); saveLocalBackup(); renderCompanies(); toast('Pessoa removida da lista.');
}
function openWorkforceModal() {
  const companies=[...new Set(workforce.map(person=>person?.company).filter(Boolean))].sort(safeSort);
  modal(`${modalHead('Atualizar empresas e efetivo','Importe uma nova versão do relatório em Excel')}<div class="modal-body"><div class="upload-zone" onclick="document.getElementById('workforceFile').click()"><span>${icon('download')}</span><div><h3>Selecionar planilha de efetivo</h3><p>Formatos .xlsx ou .xls · a aba mais recente será importada</p></div><button type="button" class="button button-outline compact">Escolher arquivo</button><input id="workforceFile" type="file" accept=".xlsx,.xls" hidden onchange="handleWorkforceUpload(event)"></div><div class="upload-info"><span>${icon('check')}</span><div><strong>${workforce.length} pessoas em ${companies.length} empresas</strong><small>${esc(workforceMeta.source||'Base inicial ainda não carregada')}</small></div></div><div class="company-chips">${companies.map(company=>`<span>${esc(company)} <b>${workforce.filter(person=>person?.company===company).length}</b></span>`).join('')}</div><div class="notice">${icon('alert')} Ao importar uma nova planilha, a lista de empresas e pessoas será atualizada. Os checklists e as movimentações já registrados não serão apagados.</div></div><div class="modal-foot"><button class="button button-outline" onclick="exportWorkforceExcel()">${icon('download')} Exportar efetivo atual</button><button class="button button-green" onclick="closeModal()">Fechar</button></div>`,'modal-small');
}
async function handleWorkforceUpload(event) {
  const file=event.target.files?.[0]; if(!file) return;
  if(!await ensureExcelLibrary()) { event.target.value=''; return toast('Não foi possível carregar o leitor de Excel. Verifique a internet e tente novamente.',true); }
  try {
    const bytes=await file.arrayBuffer(); const workbook=XLSX.read(bytes,{type:'array'}); const sheetName=workbook.SheetNames[workbook.SheetNames.length-1]; const rows=XLSX.utils.sheet_to_json(workbook.Sheets[sheetName],{header:1,defval:''});
    const imported=[]; const seen=new Set();
    rows.forEach(row=>{const company=String(row[1]||'').replace(/\s+/g,' ').trim();const name=String(row[2]||'').replace(/\s+/g,' ').trim();const role=String(row[5]||row[3]||'').replace(/\s+/g,' ').trim();const status=String(row[4]||'').replace(/\s+/g,' ').trim();if(!company||!name||name.length<4||/empresa|obras:|referente|pc:/i.test(company)||/^nome$/i.test(name))return;const key=`${company.toUpperCase()}|${name.toUpperCase()}`;if(seen.has(key))return;seen.add(key);imported.push({company,name,role,status});});
    workforce=imported.sort((a,b)=>safeSort(a?.company, b?.company)||safeSort(a?.name, b?.name));
    workforceMeta={source:file.name,updatedAt:new Date().toISOString()};
    const client = getSupabase();
    if (client) {
      client.from('app_metadata').upsert({key:'workforce_meta',value:workforceMeta});
      for(const p of workforce){ if(!p.id) p.id=crypto.randomUUID(); client.from('workforce').upsert(p); }
    }
    saveLocalBackup();
    openWorkforceModal(); toast(`${workforce.length} pessoas importadas da aba ${sheetName}.`);
  } catch(error) { toast(error.message||'Não foi possível ler esta planilha.',true); }
}
async function exportWorkforceExcel() {
  if(!await ensureExcelLibrary())return toast('Não foi possível carregar o gerador de Excel. Verifique a internet e tente novamente.',true);
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
  const modalRoot = document.getElementById('modalRoot');
  modalRoot.innerHTML = `<div class="modal-backdrop" onclick="if(event.target===this)closeModal()"><div class="modal ${size}">${content}</div></div>`;
  const returnForm = modalRoot.querySelector('form[onsubmit*="submitReturn"]');
  if (returnForm) {
    const startedAt = returnForm.querySelector('input[name="startedAt"]');
    const expectedAt = returnForm.querySelector('input[name="expectedAt"]');
    [startedAt, expectedAt].forEach(input => {
      if (!input) return;
      input.readOnly = false;
      input.required = true;
    });
    const returnGrids = returnForm.querySelectorAll('.section-title + .form-grid');
    const returnedAt = returnGrids[1]?.querySelector('input');
    if (returnedAt) {
      returnedAt.type = 'datetime-local';
      returnedAt.name = 'returnedAt';
      returnedAt.value = nowLocal();
      returnedAt.readOnly = false;
      returnedAt.required = true;
    }
  }
  modalRoot.querySelectorAll('input[type="datetime-local"]:not([readonly])').forEach(input => {
    input.addEventListener('click', () => openDateTimePicker(input));
  });
  document.body.style.overflow = 'hidden';
}
let activeQrScanner = null;
let qrScanHandled = false;
async function waitForQrScannerLibrary(timeoutMs = 5000) {
  if (window.Html5Qrcode) return true;
  try {
    await Promise.race([
      loadExternalScript('assets/vendor/html5-qrcode.min.js', 'html5-qrcode-library'),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Tempo limite do leitor QR')), timeoutMs))
    ]);
    return !!window.Html5Qrcode;
  } catch (error) {
    console.warn('Leitor QR indisponível:', error);
    return false;
  }
}
async function stopScanner() {
  const scanner = activeQrScanner;
  activeQrScanner = null;
  if (!scanner) return;
  try { await scanner.stop(); } catch(e) {}
  try { scanner.clear(); } catch(e) {}
}
function closeModal() { stopScanner(); document.getElementById('modalRoot').innerHTML = ''; document.body.style.overflow = ''; if(location.hash.startsWith('#scan/')) window.history.replaceState(null,'','#dashboard'); }
function modalHead(title, subtitle='') { return `<div class="modal-head"><div><h2>${title}</h2>${subtitle?`<p>${subtitle}</p>`:''}</div><button class="icon-button" onclick="closeModal()">${icon('close')}</button></div>`; }

function openEquipmentModal(id = null) {
  const eq = id ? equipments.find(e=>e.id===id) : null;
  modal(`<form id="equipmentForm" onsubmit="saveEquipment(event,'${id||''}')">${modalHead(eq?'Editar equipamento':'Novo equipamento',eq?'Atualize os dados do ativo':'Cadastre um ativo e gere seu QR Code')}<div class="modal-body"><div class="form-grid"><div class="field"><label>Tipo de equipamento <em>*</em></label><select name="type" required><option value="">Selecione...</option>${['PTA Tesoura','PTA Articulada','PTA Mastro','Paleteira Elétrica'].map(v=>`<option ${eq?.type===v?'selected':''}>${v}</option>`).join('')}</select></div><div class="field"><label>Código de identificação (Patrimônio) <em>*</em></label><input name="code" required placeholder="Ex.: TPTA00674" value="${esc(eq?.code||'')}"></div><div class="field"><label>Nº AF (Afonso França)</label><input name="afNumber" placeholder="Ex.: AF-001" value="${esc(eq?.afNumber||'')}"></div><div class="field full"><label>Nome do equipamento <em>*</em></label><input name="name" required placeholder="Ex.: Plataforma Tesoura 10m" value="${esc(eq?.name||'')}"></div><div class="field"><label>Fabricante <em>*</em></label><input name="brand" required placeholder="Ex.: JLG" value="${esc(eq?.brand||'')}"></div><div class="field"><label>Modelo <em>*</em></label><input name="model" required placeholder="Ex.: 2646ES" value="${esc(eq?.model||'')}"></div><div class="field"><label>Número de série</label><input name="serial" placeholder="Número do fabricante" value="${esc(eq?.serial||'')}"></div><div class="field"><label>Capacidade</label><input name="capacity" placeholder="Ex.: 450 kg" value="${esc(eq?.capacity||'')}"></div><div class="field"><label>Status inicial</label><select name="status"><option value="available" ${!eq||eq.status==='available'?'selected':''}>Disponível</option><option value="maintenance" ${eq?.status==='maintenance'?'selected':''}>Em manutenção</option></select></div><div class="field"><label>Data da última inspeção</label><input name="inspection" type="date" value="${eq?.inspection||new Date().toISOString().slice(0,10)}"></div></div></div><div class="modal-foot"><button type="button" class="button button-outline" onclick="closeModal()">Cancelar</button><button class="button button-green" type="submit">${icon('check')} ${eq?'Salvar alterações':'Cadastrar equipamento'}</button></div></form>`, 'modal-large');
}
function saveEquipment(event, id) {
  event.preventDefault(); const data = Object.fromEntries(new FormData(event.target));
  if (equipments.some(e => e.code.toLowerCase() === data.code.toLowerCase() && e.id !== id)) return toast('Este código já está cadastrado.', true);
  if (id) {
    const index = equipments.findIndex(e=>e.id===id); equipments[index] = { ...equipments[index], ...data, status: equipments[index].status==='in-use' ? 'in-use' : data.status };
  } else {
    const newId = `${data.type.includes('Paleteira')?'pal':'pta'}-${Date.now()}`; equipments.unshift({ id:newId, ...data, usage:null });
  }
  const changedEquipment = equipments.find(e => e.id === (id || equipments[0]?.id));
  if (changedEquipment) changedEquipment.updatedAt = new Date().toISOString();
  save(); closeModal(); render(); toast(id?'Equipamento atualizado com sucesso.':'Equipamento cadastrado. QR Code pronto para impressão.');
}

function openEquipmentDetails(id) {
  const eq = equipments.find(e=>e.id===id); if (!eq) return;
  if (eq.status === 'available') return openCheckoutModal(id);
  const usage = eq.usage;
  modal(`${modalHead(eq.name,`${eq.code} · ${eq.brand} ${eq.model}`)}<div class="modal-body"><div class="equipment-summary"><span class="asset-icon">${equipmentIcon(eq)}</span><div><strong>${esc(eq.name)}</strong><small>Série ${esc(eq.serial)} · Horímetro ${esc(eq.hourmeter ?? '—')} h${eq.battery?` · Bateria ${esc(eq.battery)}`:''}</small></div>${statusBadge(eq.status)}</div>${eq.status==='in-use'?`<div class="form-grid"><div class="field"><label>Empresa</label><strong>${esc(usage.company)}</strong></div><div class="field"><label>Responsável</label><strong>${esc(usage.responsible)}</strong></div><div class="field full"><label>Atividade</label><strong>${esc(usage.activity||'—')}</strong></div><div class="field"><label>DH / Local específico</label><strong>${esc(usage.dataHall)} · ${esc(usage.location)}</strong></div><div class="field"><label>Previsão de entrega</label><strong>${fullDate(usage.expectedAt)}</strong></div><div class="field"><label>Retirada em</label><strong>${fullDate(usage.startedAt)}</strong></div><div class="field"><label>Contato</label><strong>${esc(usage.phone)}</strong></div></div>`:`<div class="notice">${icon(eq.status==='maintenance'?'tool':'check')} ${eq.status==='maintenance'?'Este equipamento está bloqueado para manutenção. Edite o cadastro para liberá-lo após a inspeção.':'Equipamento disponível no Pátio / Base e pronto para retirada.'}</div>`}</div><div class="modal-foot"><button class="button button-ghost" onclick="openEquipmentModal('${id}')">${icon('edit')} Editar</button><button class="button button-outline" onclick="openQRModal('${id}')">${icon('qr')} QR Code</button>${eq.status==='in-use'?`<button class="button button-outline" onclick="openDailyInspectionModal('${id}')">${icon('plus')} Inspeção Diária (Novo Dia)</button><button class="button button-green" onclick="openReturnModal('${id}')">${icon('return')} Registrar devolução</button>`:''}</div>`);
}

function openDailyInspectionModal(id) {
  const eq = equipments.find(e => e.id === id);
  if (!eq || eq.status !== 'in-use' || !eq.usage) return toast('Equipamento não está em uso.', true);
  
  const currentHall = eq.usage.dataHall || '';
  const currentLoc = eq.usage.location || '';
  const currentAct = eq.usage.activity || '';
  const currentPhone = eq.usage.phone || '';
  const currentExpected = eq.usage.expectedAt ? eq.usage.expectedAt.slice(0, 16) : '';

  modal(`<form onsubmit="submitDailyInspection(event,'${id}')">${modalHead('Inspeção Diária Continuada',`Adicionar nova linha no checklist da PTA (${esc(eq.code)})`)}<div class="modal-body">${inspectionFormHTML(eq,'diaria',{company:eq.usage.company,responsible:eq.usage.responsible,inspectionAt:nowLocal()})}<div class="section-title"><span>${icon('location')}</span><div><h3>Planejamento da utilização</h3><small>Dados mantidos da retirada — atualize a atividade, local ou devolução prevista caso necessário</small></div></div><div class="form-grid"><div class="field"><label>Telefone do responsável</label><input name="phone" placeholder="(85) 99999-9999" value="${esc(currentPhone)}"></div><div class="field"><label>Atividade a executar <em>*</em></label><input name="activity" required placeholder="Ex.: Instalação de dutos no teto" value="${esc(currentAct)}"></div><div class="field"><label>Data Hall — DH <em>*</em></label><select name="dataHall" required><option value="">Selecione...</option>${Array.from({length:10},(_,i)=>`<option ${currentHall===`Data Hall ${String(i+1).padStart(2,'0')}`?'selected':''}>Data Hall ${String(i+1).padStart(2,'0')}</option>`).join('')}<option ${currentHall==='Área externa'?'selected':''}>Área externa</option><option ${currentHall==='Casa de máquinas'?'selected':''}>Casa de máquinas</option><option ${currentHall==='Almoxarifado'?'selected':''}>Almoxarifado</option></select></div><div class="field"><label>Local específico <em>*</em></label><input name="location" required placeholder="Ex.: Corredor B / Sala elétrica" value="${esc(currentLoc)}"></div><div class="field"><label>Devolução prevista <em>*</em></label><input type="datetime-local" name="expectedAt" required value="${currentExpected || nowLocal()}"></div></div><label class="terms physical-term"><input type="checkbox" name="physicalCopy" required><span>Confirmo que a via física do formulário PEMT foi atualizada na linha correspondente e arquivada na pasta do colaborador.</span></label><label class="terms"><input type="checkbox" name="terms" required><span>Declaro que realizei a inspeção diária deste equipamento e as informações registradas são verdadeiras.</span></label></div><div class="modal-foot"><button type="button" class="button button-outline" onclick="closeModal()">Cancelar</button><button class="button button-green">${icon('check')} Registrar Inspeção Diária</button></div></form>`, 'modal-inspection');
}

function submitDailyInspection(event, id) {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(event.target));
  const eq = equipments.find(e => e.id === id);
  if (!eq || !eq.usage) return;

  if (!data.operatorSign) {
    toast('Por favor, faça a sua rubrica no campo indicado antes de salvar.', true);
    openSignatureModal();
    return;
  }

  const inspection = inspectionFromData(data, 'diaria');
  inspection.dataHall = data.dataHall;
  inspection.location = data.location;
  inspection.activity = data.activity;

  const hasFailure = inspectionHasFailure(inspection);
  eq.hourmeter = Number(data.hourmeter);
  eq.updatedAt = new Date().toISOString();

  // Atualiza planejamento ao vivo
  if (data.phone) eq.usage.phone = data.phone;
  if (data.activity) eq.usage.activity = data.activity;
  if (data.dataHall) eq.usage.dataHall = data.dataHall;
  if (data.location) eq.usage.location = data.location;
  if (data.expectedAt) eq.usage.expectedAt = data.expectedAt;

  let activeMovement = history.find(h => h.equipmentId === id && h.action === 'withdraw');
  if (!activeMovement) {
    activeMovement = history.find(h => h.equipmentId === id);
  }

  if (activeMovement) {
    if (!activeMovement.inspections || activeMovement.inspections.length === 0) {
      activeMovement.inspections = activeMovement.inspection ? [activeMovement.inspection] : [];
    }
    activeMovement.inspections.push(inspection);
    activeMovement.dataHall = data.dataHall || activeMovement.dataHall;
    activeMovement.location = data.location || activeMovement.location;
    activeMovement.activity = data.activity || activeMovement.activity;

    if (hasFailure) {
      activeMovement.action = 'issue';
    }
  }

  if (hasFailure) {
    eq.status = 'maintenance';
    eq.usage = null;
    save(id, activeMovement?.id);
    closeModal();
    render();
    return toast('Item reprovado na inspeção diária. Equipamento bloqueado para manutenção.', true);
  }

  save(id, activeMovement?.id);
  closeModal();
  render();
  const lineCount = activeMovement?.inspections?.length || 1;
  toast(`Inspeção diária (Linha ${lineCount}) salva! Localização atualizada: ${eq.usage.dataHall} (${eq.usage.location}).`);
}

function openCheckoutModal(id) {
  const eq = equipments.find(e=>e.id===id); if (!eq) return;
  const start = nowLocal(); const end = new Date(Date.now()+8*3600000); end.setMinutes(end.getMinutes()-end.getTimezoneOffset());
  modal(`<form id="checkoutForm" onsubmit="submitCheckout(event,'${id}')">${modalHead('Inspeção e liberação de uso','Formulário FV-MAQ-ST obrigatório antes da retirada')}<div class="modal-body">${inspectionFormHTML(eq,'retirada')}<div class="section-title"><span>${icon('location')}</span><div><h3>Planejamento da utilização</h3><small>Atividade, local e previsão de devolução</small></div></div><div class="form-grid"><div class="field"><label>Telefone do responsável</label><input name="phone" placeholder="(85) 99999-9999"></div><div class="field"><label>Atividade a executar <em>*</em></label><input name="activity" required placeholder="Ex.: Instalação de dutos no teto"></div><div class="field"><label>Data Hall — DH <em>*</em></label><select name="dataHall" required><option value="">Selecione...</option>${Array.from({length:10},(_,i)=>`<option>Data Hall ${String(i+1).padStart(2,'0')}</option>`).join('')}<option>Área externa</option><option>Casa de máquinas</option><option>Almoxarifado</option></select></div><div class="field"><label>Local específico <em>*</em></label><input name="location" required placeholder="Ex.: Corredor B / Sala elétrica"></div><div class="field"><label>Início previsto <em>*</em></label><input type="datetime-local" name="startedAt" required value="${start}"></div><div class="field"><label>Devolução prevista <em>*</em></label><input type="datetime-local" name="expectedAt" required value="${end.toISOString().slice(0,16)}"></div></div><label class="terms physical-term"><input type="checkbox" name="physicalCopy" required><span>Confirmo que a via física do formulário PEMT foi preenchida e será arquivada na pasta do colaborador.</span></label><label class="terms"><input type="checkbox" name="terms" required><span>Declaro que realizei pessoalmente esta inspeção, sou autorizado a operar o equipamento e me responsabilizo pelas informações registradas.</span></label></div><div class="modal-foot"><button type="button" class="button button-outline" onclick="closeModal()">Cancelar</button><button class="button button-green" type="submit">${icon('check')} Concluir e retirar</button></div></form>`, 'modal-inspection');
}
function submitCheckout(event, id) {
  event.preventDefault(); const form = event.target; const data = Object.fromEntries(new FormData(form)); const eq = equipments.find(e=>e.id===id); const inspection = inspectionFromData(data,'retirada');
  if (!data.operatorSign) {
    toast('Por favor, faça a sua rubrica no campo indicado antes de salvar.', true);
    openSignatureModal();
    return;
  }
  const hasFailure = inspectionHasFailure(inspection);
  eq.hourmeter=Number(data.hourmeter);
  eq.updatedAt = new Date().toISOString();
  if (new Date(data.expectedAt) <= new Date(data.startedAt)) return toast('A devolução deve ser posterior ao início.', true);
  if (hasFailure) {
    eq.status='maintenance'; eq.usage=null; const movement={id:Date.now(),equipmentId:id,action:'issue',person:data.responsible,company:data.company,place:data.dataHall,date:data.inspectionAt,activity:data.activity,location:data.location,dataHall:data.dataHall,inspection,inspections:[inspection]}; history.unshift(movement); save(id, movement.id); closeModal(); render(); return toast('Item reprovado. Formulário salvo e equipamento bloqueado.', true);
  }
  eq.status='in-use'; eq.usage={ company:data.company, responsible:data.responsible, phone:data.phone, activity:data.activity, location:data.location, dataHall:data.dataHall, startedAt:data.startedAt, expectedAt:data.expectedAt };
  const movement={id:Date.now(),equipmentId:id,action:'withdraw',person:data.responsible,company:data.company,place:data.dataHall,date:data.startedAt,activity:data.activity,location:data.location,dataHall:data.dataHall,inspection,inspections:[inspection]}; history.unshift(movement); save(id, movement.id); closeModal(); render(); toast(`${eq.code} liberado. Formulário de retirada salvo.`);
}

function openReturnModal(id) {
  const eq=equipments.find(e=>e.id===id); if(!eq || !eq.usage) return toast('Equipamento não está em uso.', true);
  const responsible = eq.usage.responsible || eq.usage.person || '';
  const currentHall=eq.usage.dataHall||'';
  const startedAt=eq.usage.startedAt?.slice(0,16)||'';
  const expectedAt=eq.usage.expectedAt?.slice(0,16)||'';
  modal(`<form onsubmit="submitReturn(event,'${id}')">${modalHead('Inspeção de devolução / baixa','Identifique quem está devolvendo e confira todos os dados da utilização')}<div class="modal-body">${inspectionFormHTML(eq,'devolucao',{company:eq.usage.company,responsible,inspectionAt:nowLocal()})}<div class="section-title"><span>${icon('location')}</span><div><h3>Planejamento da utilização</h3><small>Confira e atualize os dados antes de concluir a devolução</small></div></div><div class="form-grid"><div class="field"><label>Telefone de quem está devolvendo</label><input name="phone" placeholder="(85) 99999-9999" value="${esc(eq.usage.phone||'')}"></div><div class="field"><label>Atividade executada <em>*</em></label><input name="activity" required placeholder="Ex.: Instalação de dutos no teto" value="${esc(eq.usage.activity||'')}"></div><div class="field"><label>Data Hall — DH <em>*</em></label><select name="dataHall" required><option value="">Selecione...</option>${Array.from({length:10},(_,i)=>`<option ${currentHall===`Data Hall ${String(i+1).padStart(2,'0')}`?'selected':''}>Data Hall ${String(i+1).padStart(2,'0')}</option>`).join('')}<option ${currentHall==='Área externa'?'selected':''}>Área externa</option><option ${currentHall==='Casa de máquinas'?'selected':''}>Casa de máquinas</option><option ${currentHall==='Almoxarifado'?'selected':''}>Almoxarifado</option></select></div><div class="field"><label>Local específico <em>*</em></label><input name="location" required placeholder="Ex.: Corredor B / Sala elétrica" value="${esc(eq.usage.location||'')}"></div><div class="field"><label>Início da utilização</label><input type="datetime-local" name="startedAt" value="${esc(startedAt)}" readonly></div><div class="field"><label>Devolução prevista</label><input type="datetime-local" name="expectedAt" value="${esc(expectedAt)}" readonly></div></div><div class="section-title"><span>${icon('return')}</span><div><h3>Dados da devolução</h3><small>Defina o local onde o equipamento será entregue</small></div></div><div class="form-grid"><div class="field"><label>Local de entrega <em>*</em></label><select name="place" required><option>Pátio de Equipamentos</option><option>Almoxarifado</option><option>Base da Manutenção</option></select></div><div class="field"><label>Devolução realizada em</label><input value="${esc(nowLocal())}" readonly></div></div><label class="terms physical-term"><input type="checkbox" name="physicalCopy" required><span>Confirmo que a via física da devolução foi preenchida e será arquivada na pasta do colaborador.</span></label><label class="terms"><input type="checkbox" name="terms" required><span>Confirmo que realizei a inspeção de devolução. Se houver item reprovado, o equipamento será bloqueado automaticamente para manutenção.</span></label></div><div class="modal-foot"><button type="button" class="button button-outline" onclick="closeModal()">Cancelar</button><button class="button button-green">${icon('return')} Concluir e devolver</button></div></form>`, 'modal-inspection');
}
async function submitReturn(event,id) {
  event.preventDefault(); const data=Object.fromEntries(new FormData(event.target)); const eq=equipments.find(e=>e.id===id); if(!eq?.usage) return toast('Esta devolução já foi registrada.', true); const previous={...eq.usage}; const inspection=inspectionFromData(data,'devolucao');
  if (!data.operatorSign) {
    toast('Por favor, faça a sua rubrica no campo indicado antes de salvar.', true);
    openSignatureModal();
    return;
  }
  const hasFailure=inspectionHasFailure(inspection);
  if (data.startedAt && data.returnedAt && new Date(data.returnedAt) < new Date(data.startedAt)) return toast('A devolu\u00e7\u00e3o realizada n\u00e3o pode ser anterior ao in\u00edcio da utiliza\u00e7\u00e3o.', true);
  eq.hourmeter=Number(data.hourmeter);
  eq.status=hasFailure?'maintenance':'available';
  eq.usage=null;
  eq.updatedAt=new Date().toISOString();
  const movement={id:Date.now(),equipmentId:id,equipmentCode:eq.code,action:hasFailure?'issue':'return',person:data.responsible,company:data.company,place:data.place,date:data.returnedAt||data.inspectionAt,notes:data.inspectionNotes,activity:data.activity||previous.activity,location:data.location||previous.location,dataHall:data.dataHall||previous.dataHall,expectedAt:data.expectedAt||previous.expectedAt,inspection,inspections:[inspection]};
  history.unshift(movement);
  const syncPromise=save(id, movement.id);
  closeModal();
  render();
  const result=await syncPromise;
  if (!result.remote) return toast('Devolução salva neste aparelho, mas a sincronização está pendente. Mantenha a internet ativa e tente atualizar novamente.', true);
  toast(hasFailure?'Devolução sincronizada. Item reprovado: equipamento bloqueado.':`${eq.code} devolvido por ${data.responsible} e sincronizado.`,hasFailure);
}

function openInspectionRecord(historyId) {
  const movement=history.find(item=>item.id===historyId); if(!movement?.inspection) return toast('Formulário não disponível.',true);
  const eq=equipments.find(item=>item.id===movement.equipmentId); if(!eq) return toast('Equipamento não encontrado.',true);
  modal(`${modalHead('Formulário de inspeção',`${eq.code} · ${fullDate(movement.inspection.inspectedAt)}`)}<div class="modal-body inspection-record">${printableInspection(eq,movement)}</div><div class="modal-foot"><button class="button button-outline" onclick="closeModal()">Fechar</button><button class="button button-dark" onclick="window.print()">${icon('download')} Imprimir / salvar PDF</button></div>`,'modal-paper');
  document.querySelector('.modal-backdrop').classList.add('print-area','inspection-print-area');
}

async function openQRModal(id) {
  const eq=equipments.find(e=>e.id===id); if(!eq) return;
  const url=`${location.origin}${location.pathname}#scan/${eq.id}`;
  const contractor = eq.contractor || eq.brand || 'Tecnogera';
  const afVal = eq.afNumber || '—';
  modal(`${modalHead('QR Code do equipamento','Imprima e fixe esta etiqueta em local visível')}<div class="modal-body qr-layout"><img src="assets/heating-cooling-logo.jpg" class="qr-brand-logo" alt="Heating Cooling"><div class="qr-box" id="qrTarget"></div><h2>${esc(eq.name)}</h2><span class="qr-code-label">${esc(eq.code)}</span><p style="margin:5px 0 2px;font-weight:800;color:#206b49;font-size:13px;">Nº AF (Afonso França): ${esc(afVal)}</p><p style="margin:2px 0 2px;font-weight:700;color:#14201b;font-size:12px;">Empreiteiro: ${esc(contractor)}</p><p style="margin:2px 0;color:#67736d;font-size:11px;">${esc(eq.brand)} ${esc(eq.model)} · Série ${esc(eq.serial)}</p><p style="margin-top:6px;color:#67736d;font-size:10px;">Obra DataCenter Omnia · Escaneie para checklist / uso</p></div><div class="modal-foot"><button class="button button-outline" onclick="closeModal()">Fechar</button><button class="button button-dark" onclick="window.print()">${icon('print')} Imprimir etiqueta</button></div>`, 'modal-small');
  document.querySelector('.modal-backdrop').classList.add('print-area');
  const target = document.getElementById('qrTarget');
  if (target) target.innerHTML = '<div class="qr-fallback"><span>Gerando QR Code...</span></div>';
  await ensureQrCodeLibrary();
  renderQRCode(document.getElementById('qrTarget'),url);
}
function renderQRCode(target,url) {
  target.innerHTML='';
  if(window.QRCode) new QRCode(target,{text:url,width:190,height:190,colorDark:'#14201b',colorLight:'#ffffff',correctLevel:QRCode.CorrectLevel.H});
  else target.innerHTML=`<div class="qr-fallback"><span>Biblioteca de QR offline.<br>Conecte à internet e reabra.</span></div>`;
}
async function printAllQRCodes() {
  if(!equipments.length) return toast('Nenhum equipamento cadastrado.',true);
  if(!await ensureQrCodeLibrary()) return toast('Não foi possível carregar o gerador de QR Codes. Verifique a internet e tente novamente.',true);
  const pages=[]; for(let index=0;index<equipments.length;index+=4)pages.push(equipments.slice(index,index+4));
  const label=eq=>{
    const contractor = eq.contractor || eq.brand || 'Tecnogera';
    const afVal = eq.afNumber || '—';
    return `<article class="qr-label"><img src="assets/heating-cooling-logo.jpg" class="qr-brand-logo" alt="Heating Cooling"><div class="qr-box" id="qr-${eq.id}"></div><h3>${esc(eq.name)}</h3><span class="qr-code-label">${esc(eq.code)}</span><p style="margin:4px 0 1px;font-weight:800;color:#206b49;font-size:12px;">Nº AF (Afonso França): ${esc(afVal)}</p><p style="margin:2px 0 1px;font-weight:700;color:#14201b;font-size:11px;">Empreiteiro: ${esc(contractor)}</p><p style="margin:2px 0;font-size:10px;">${esc(eq.brand)} ${esc(eq.model)} · Série ${esc(eq.serial)}</p><p style="margin-top:3px;color:#67736d;font-size:9px;">Obra DataCenter Omnia · Escaneie para checklist</p></article>`;
  };
  modal(`${modalHead('Etiquetas de todos os equipamentos',`${equipments.length} QR Codes · ${pages.length} página(s) para impressão`)}<div class="modal-body qr-pages">${pages.map((page,index)=>`<section class="qr-sheet qr-print-page" data-page="${index+1}">${page.map(label).join('')}</section>`).join('')}</div><div class="modal-foot"><button class="button button-outline" onclick="closeModal()">Fechar</button><button class="button button-dark" onclick="window.print()">${icon('print')} Imprimir todas (${equipments.length})</button></div>`, 'modal-large');
  document.querySelector('.modal-backdrop').classList.add('print-area');
  equipments.forEach(eq => renderQRCode(document.getElementById(`qr-${eq.id}`),`${location.origin}${location.pathname}#scan/${eq.id}`,135));
}

async function openScanModal() {
  await stopScanner();
  qrScanHandled = false;
  modal(`${modalHead('Ler QR Code do Equipamento','Aponte a câmera para o QR Code impresso no equipamento')}<div class="modal-body"><div id="qrCameraContainer" style="width:100%;min-height:220px;background:#14201b;border-radius:12px;overflow:hidden;position:relative;display:flex;align-items:center;justify-content:center;color:#fff;"><div id="reader" style="width:100%;"></div></div><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px;"><button type="button" class="button button-outline" onclick="initQrCamera()">${icon('scan')} Ativar câmera</button><label class="button button-outline" style="cursor:pointer;justify-content:center;">${icon('qr')} Ler pela foto<input type="file" accept="image/*" capture="environment" hidden onchange="scanQrImage(event)"></label></div><div style="margin:14px 0 10px;text-align:center;color:#67736d;font-size:11px;font-weight:600;letter-spacing:0.5px;">OU DIGITE O CÓDIGO DO ATIVO</div><form class="scan-input" onsubmit="findEquipment(event)"><input id="scanCode" required autocomplete="off" placeholder="Ex.: TPTA00674, 686..."><button class="button button-green">Localizar</button></form><div class="notice">${icon('qr')} Autorize o uso da câmera quando o navegador solicitar.</div></div>`, 'modal-small');
  setTimeout(initQrCamera, 100);
}

function qrCameraMessage(title, detail) {
  const container = document.getElementById('qrCameraContainer');
  if (!container) return;
  container.innerHTML = `<div style="padding:24px;text-align:center;color:#d6e2dc;"><span style="font-size:26px;display:block;margin-bottom:8px;">📷</span><strong>${esc(title)}</strong><br><small style="display:block;margin-top:6px;color:#a3b8af;line-height:1.45;">${esc(detail)}</small></div>`;
}

function qrCameraErrorMessage(error) {
  const message = String(error?.message || error || '').toLowerCase();
  if (message.includes('permission') || message.includes('notallowed') || message.includes('denied')) {
    return ['Permissão da câmera negada', 'Libere a câmera nas configurações do navegador e toque em “Ativar câmera” novamente.'];
  }
  if (message.includes('notfound') || message.includes('no camera') || message.includes('requested device not found')) {
    return ['Nenhuma câmera encontrada', 'Conecte uma câmera ou use a opção “Ler pela foto”.'];
  }
  if (message.includes('notreadable') || message.includes('could not start') || message.includes('trackstart')) {
    return ['A câmera está ocupada', 'Feche outro aplicativo que esteja usando a câmera e tente novamente.'];
  }
  return ['Não foi possível iniciar a câmera', 'Tente novamente ou use a opção “Ler pela foto”.'];
}

async function initQrCamera() {
  if (!document.getElementById('qrCameraContainer')) return;
  await stopScanner();
  qrScanHandled = false;

  if (!await waitForQrScannerLibrary()) {
    qrCameraMessage('Leitor QR não carregado', 'Recarregue a página. Você ainda pode localizar o ativo digitando o código.');
    return;
  }
  const localHost = ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname);
  if (!window.isSecureContext && !localHost) {
    qrCameraMessage('Câmera bloqueada nesta conexão', 'O navegador exige HTTPS para vídeo ao vivo. Use “Ler pela foto” ou abra o sistema em uma URL HTTPS.');
    return;
  }
  if (!navigator.mediaDevices?.getUserMedia) {
    qrCameraMessage('Câmera indisponível neste navegador', 'Use “Ler pela foto” ou abra a página em Chrome, Edge ou Safari atualizado.');
    return;
  }

  const container = document.getElementById('qrCameraContainer');
  if (!container) return;
  container.innerHTML = '<div id="reader" style="width:100%;"></div>';
  try {
    const cameras = await window.Html5Qrcode.getCameras();
    if (!cameras.length) throw new Error('No camera found');
    const rearCamera = cameras.find(camera => /back|rear|environment|traseira/i.test(camera.label));
    const cameraId = (rearCamera || cameras[0]).id;
    const scanner = new window.Html5Qrcode('reader');
    activeQrScanner = scanner;
    await scanner.start(
      cameraId,
      { fps: 10, qrbox: { width: 200, height: 200 }, aspectRatio: 1 },
      async decodedText => {
        if (qrScanHandled) return;
        qrScanHandled = true;
        // Encerrar a câmera pode levar alguns segundos em certos celulares.
        // A ficha é exibida imediatamente enquanto a câmera fecha em segundo plano.
        closeModal();
        openScannedEquipment(decodedText);
      },
      () => {}
    );
  } catch (error) {
    console.warn('Erro ao inicializar leitor QR:', error);
    await stopScanner();
    const [title, detail] = qrCameraErrorMessage(error);
    qrCameraMessage(title, detail);
  }
}

async function scanQrImage(event) {
  const input = event.target;
  const file = input.files?.[0];
  if (!file) return;
  if (!await waitForQrScannerLibrary()) return toast('O leitor QR não foi carregado. Recarregue a página.', true);
  await stopScanner();
  const container = document.getElementById('qrCameraContainer');
  if (!container) return;
  container.innerHTML = '<div id="reader" style="width:100%;"></div>';
  const scanner = new window.Html5Qrcode('reader');
  activeQrScanner = scanner;
  try {
    const decodedText = await scanner.scanFile(file, true);
    activeQrScanner = null;
    try { scanner.clear(); } catch(e) {}
    closeModal();
    openScannedEquipment(decodedText);
  } catch (error) {
    console.warn('QR não encontrado na imagem:', error);
    activeQrScanner = null;
    try { scanner.clear(); } catch(e) {}
    qrCameraMessage('QR Code não encontrado na foto', 'Tire outra foto com boa iluminação, foco e o código inteiro dentro da imagem.');
  } finally {
    input.value = '';
  }
}

function findEquipment(event) {
  event.preventDefault();
  const code = document.getElementById('scanCode')?.value.trim();
  if (!code) return;
  stopScanner();
  closeModal();
  openScannedEquipment(code);
}

let latestScanRequest = 0;
async function openScannedEquipment(text) {
  if (!text) return;
  const scanRequest = ++latestScanRequest;
  let target = String(text).trim();
  if (target.includes('#scan/')) {
    target = target.split('#scan/')[1];
  } else if (target.includes('/')) {
    target = target.split('/').pop();
  }
  target = target.split(/[?#]/)[0].toLowerCase().trim();

  // The actions depend on the latest shared status, not stale phone data.
  const [syncResult] = await Promise.all([
    syncFromSupabase({ renderAfter: false, pushAfter: hasPendingRemoteSave }),
    workforceReadyPromise
  ]);
  if (scanRequest !== latestScanRequest) return;

  const eq = equipments.find(e => 
    (e.id && e.id.toLowerCase() === target) || 
    (e.code && e.code.toLowerCase() === target) ||
    (e.afNumber && e.afNumber.toLowerCase() === target) ||
    (e.serial && e.serial.toLowerCase() === target)
  );

  if (!eq) return toast(`Equipamento não encontrado para o código "${text}".`, true);
  openPublicEquipmentModal(eq.id);
  if (!syncResult?.remote) toast('Ficha carregada da c\u00f3pia deste aparelho. Verifique a internet antes de registrar a opera\u00e7\u00e3o.', true);
}
function openPublicEquipmentModal(id) {
  const eq=equipments.find(item=>item.id===id); if(!eq)return; const latest=history.find(item=>item.equipmentId===id&&item.inspection); const usage=eq.usage;
  const contractor = eq.contractor || eq.brand || 'Tecnogera';
  const afVal = eq.afNumber || '—';
  modal(`${modalHead('Informações do equipamento','Acesso público pelo QR Code')}<div class="modal-body"><section class="public-equipment-head"><span>${equipmentIcon(eq)}</span><div><small>${esc(eq.code)} · <strong style="color:#206b49;">Nº AF: ${esc(afVal)}</strong></small><h2>${esc(eq.name)}</h2><p>${esc(eq.model)} · Série ${esc(eq.serial)} · Empreiteiro: <strong>${esc(contractor)}</strong></p></div>${statusBadge(eq.status)}</section><div class="public-specs"><span><small>Nº AF (Afonso França)</small><strong style="color:#206b49;">${esc(afVal)}</strong></span><span><small>Empreiteiro</small><strong>${esc(contractor)}</strong></span><span><small>Horímetro</small><strong>${esc(eq.hourmeter??'—')} h</strong></span><span><small>Bateria</small><strong>${esc(eq.battery||'—')}</strong></span></div>${usage?`<section class="public-use-card"><h3>Utilização atual</h3><div class="public-use-grid"><span><small>Responsável</small><strong>${esc(usage.responsible)}</strong><em>${esc(usage.company)}</em></span><span><small>Atividade</small><strong>${esc(usage.activity||'—')}</strong></span><span><small>DH e local</small><strong>${esc(usage.dataHall)} · ${esc(usage.location)}</strong></span><span><small>Previsão de devolução</small><strong>${fullDate(usage.expectedAt)}</strong></span></div></section>`:`<div class="public-availability">${icon(eq.status==='maintenance'?'tool':'check')}<div><strong>${eq.status==='maintenance'?'Equipamento bloqueado':'Equipamento disponível'}</strong><small>${eq.status==='maintenance'?'Aguardando manutenção e nova liberação.':'Local atual: Pátio / Base'}</small></div></div>`}${latest?`<button class="public-checklist-link" onclick="openInspectionRecord(${latest.id})">${icon('file')}<span><strong>Último formulário de verificação</strong><small>${fullDate(latest.inspection.inspectedAt)} · ${latest.inspection.mode==='devolucao'?'Devolução':'Retirada'}</small></span>${icon('chevron')}</button>`:''}</div><div class="modal-foot"><button class="button button-outline" onclick="closeModal()">Fechar</button>${eq.status==='available'?`<button class="button button-green" onclick="openCheckoutModal('${id}')">${icon('check')} Retirar com checklist</button>`:''}${eq.status==='in-use'?`<button class="button button-outline" onclick="openDailyInspectionModal('${id}')">${icon('plus')} Inspeção Diária (Novo Dia)</button><button class="button button-green" onclick="openReturnModal('${id}')">${icon('return')} Registrar devolução</button>`:''}</div>`,'modal-large');
}

function exportCSV() {
  const selectedHistory=getReportFilteredHistory(); if(!selectedHistory.length)return toast('Nenhuma movimentação encontrada com os filtros selecionados.',true); const rows=[['Data','Equipamento','Modelo','Ação','Responsável','Empresa','Atividade','Data Hall','Local','Horímetro','Resultado'],...selectedHistory.map(h=>{const e=equipments.find(x=>x.id===h.equipmentId);return [h.date,e?.code||'',e?.model||'',reportAction(h.action),h.person||'',h.company||'',h.activity||'',h.dataHall||h.place||'',h.location||'',h.inspection?.hourmeter||'',h.inspection?(inspectionHasFailure(h.inspection)?'Reprovado':'Aprovado'):'' ];})];
  const csv='\uFEFF'+rows.map(r=>r.map(v=>`"${String(v||'').replace(/"/g,'""')}"`).join(';')).join('\n'); const blob=new Blob([csv],{type:'text/csv;charset=utf-8'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=`obraflow-movimentacoes-${new Date().toISOString().slice(0,10)}.csv`; a.click(); URL.revokeObjectURL(a.href); toast('Relatório exportado com sucesso.');
}
function toast(message,error=false) { const root=document.getElementById('toastRoot'); const el=document.createElement('div'); el.className=`toast ${error?'error':''}`; el.innerHTML=`<span>${icon(error?'alert':'check')}</span><p>${esc(message)}</p>`; root.appendChild(el); setTimeout(()=>el.remove(),3800); }
function closeMobileMenu(){ document.getElementById('sidebar').classList.remove('open'); document.getElementById('mobileBackdrop').classList.remove('open'); }

let deferredInstallPrompt = null;
const installAppButton = document.getElementById('installAppButton');
const isStandaloneApp = () => window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;

async function installDataCenterApp() {
  if (deferredInstallPrompt) {
    const promptEvent = deferredInstallPrompt;
    deferredInstallPrompt = null;
    await promptEvent.prompt();
    const choice = await promptEvent.userChoice;
    if (choice.outcome !== 'accepted' && installAppButton) installAppButton.hidden = false;
    return;
  }

  const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const instructions = isIos
    ? 'No Safari, toque no botao Compartilhar e escolha Adicionar a Tela de Inicio.'
    : 'Abra o menu do navegador e escolha Instalar aplicativo ou Adicionar a tela inicial.';
  modal(`${modalHead('Instalar DataCenter Omnia','Acesso rapido no celular ou computador')}<div class="modal-body"><div class="public-availability">${icon('download')}<div><strong>${instructions}</strong><small>O atalho usara o icone da Heating Cooling com a plataforma elevatoria.</small></div></div></div><div class="modal-foot"><button class="button button-green" onclick="closeModal()">Entendi</button></div>`);
}

window.addEventListener('beforeinstallprompt', event => {
  event.preventDefault();
  deferredInstallPrompt = event;
  if (installAppButton && !isStandaloneApp()) installAppButton.hidden = false;
});

window.addEventListener('appinstalled', () => {
  deferredInstallPrompt = null;
  if (installAppButton) installAppButton.hidden = true;
  document.getElementById('dashboardInstallCard')?.remove();
  toast('DataCenter Omnia instalado com sucesso.');
});

if (installAppButton) {
  if (isStandaloneApp()) {
    installAppButton.hidden = true;
    document.body.classList.add('app-standalone');
  } else {
    installAppButton.hidden = false;
    installAppButton.addEventListener('click', installDataCenterApp);
  }
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').catch(error => {
      console.warn('Falha ao registrar o aplicativo instalavel:', error);
    });
  });
}

document.getElementById('menuButton').addEventListener('click',()=>{document.getElementById('sidebar').classList.toggle('open');document.getElementById('mobileBackdrop').classList.toggle('open');});
document.getElementById('mobileBackdrop').addEventListener('click',closeMobileMenu);
document.getElementById('quickScanButton').addEventListener('click',openScanModal);
document.getElementById('globalSearch').addEventListener('keydown',e=>{if(e.key==='Enter'){const q=e.target.value.toLowerCase();const eq=equipments.find(x=>`${x.code} ${x.name} ${x.usage?.responsible||''}`.toLowerCase().includes(q));eq?openEquipmentDetails(eq.id):toast('Nenhum equipamento encontrado.',true);}});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal();if((e.ctrlKey||e.metaKey)&&e.key==='k'){e.preventDefault();document.getElementById('globalSearch').focus();}});
window.addEventListener('hashchange',render);
window.addEventListener('focus',()=>syncFromSupabase({ pushAfter: hasPendingRemoteSave }));
window.addEventListener('online',()=>syncFromSupabase({ pushAfter: hasPendingRemoteSave }));
document.addEventListener('visibilitychange',()=>{
  if(document.visibilityState==='visible') syncFromSupabase({ pushAfter: hasPendingRemoteSave });
});
setInterval(()=>{
  if(document.visibilityState==='visible') syncFromSupabase({ pushAfter: hasPendingRemoteSave });
},5000);
hydrateIcons(); initializeApp();


