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
  ,truck: '<svg viewBox="0 0 24 24"><path d="M3 6h11v11H3zM14 10h4l3 4v3h-7zM7 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm10 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/></svg>'
  ,clipboard: '<svg viewBox="0 0 24 24"><path d="M9 5H6a2 2 0 0 0-2 2v14h16V7a2 2 0 0 0-2-2h-3M9 3h6v4H9zM8 12h8m-8 4h6"/></svg>'
  ,radio: '<svg viewBox="0 0 24 24"><rect x="5" y="5" width="14" height="17" rx="2"/><path d="M9 2h6M12 2v3M8 9h8v5H8zM9 18h.01M12 18h.01M15 18h.01"/></svg>'
  ,eye: '<svg viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>'
  ,eyeOff: '<svg viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>'
  ,lock: '<svg viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>'
  ,mail: '<svg viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>'
  ,key: '<svg viewBox="0 0 24 24"><circle cx="7.5" cy="15.5" r="4.5"/><path d="m21 2-9.6 9.6M15.5 7.5l3 3M18 5l3 3"/></svg>'
};

const seedEquipments = [
  // 08M
  { id:'tpta00674', code:'TPTA00674', afNumber:'948', name:'Plataforma Tesoura 08m 4x2 Pb', type:'PTA Tesoura', brand:'Tecnogera', model:'Tesoura 08m 4x2 Pb', serial:'JPAC023A00135', productCode:'931-000235', invoice:'2623', emissionDate:'2026-09-10', hourmeter:170, battery:'Chumbo', contractor:'', status:'in-use', inspection:'', usage:{ person:'BRUNO DOS SANTOS SILVA', company:'HEATING COOLING', role:'Encanador', phone:'', dataHall:'Data Hall 04', location:'corredor a forca a', activity:'Instalação Hidráulica', expectedAt:'2026-09-16T22:27:00' } },
  { id:'tpta00845', code:'TPTA00845', afNumber:'626', name:'Plataforma Tesoura 08m 4x2 Li', type:'PTA Tesoura', brand:'Tecnogera', model:'Tesoura 08m 4x2 Li', serial:'0775300701N010208', productCode:'931-000233', invoice:'2533', emissionDate:'2026-08-12', hourmeter:101, battery:'Lítio', contractor:'LA', status:'in-use', inspection:'', usage:{ person:'JOSE VERAS CARVALHO', company:'LA', role:'Eletricista', phone:'', dataHall:'Data Hall 06', location:'corredor a', activity:'Instalação Elétrica', expectedAt:'2026-09-16T22:56:00' } },
  { id:'tpta02796', code:'TPTA02796', afNumber:'686', name:'Plataforma Tesoura 08m 4x2 Li', type:'PTA Tesoura', brand:'Tecnogera', model:'Tesoura 08m 4x2 Li', serial:'JPAC125K04867', productCode:'931-000233', invoice:'2572', emissionDate:'2026-08-25', hourmeter:1, battery:'Lítio', contractor:'AIRTEC', status:'available', inspection:'', usage:null },
  { id:'tpta02797', code:'TPTA02797', afNumber:'687', name:'Plataforma Tesoura 08m 4x2 Li', type:'PTA Tesoura', brand:'Tecnogera', model:'Tesoura 08m 4x2 Li', serial:'JPAC125K04855', productCode:'931-000233', invoice:'2572', emissionDate:'2026-08-25', hourmeter:1, battery:'Lítio', contractor:'SIP', status:'available', inspection:'', usage:null },
  { id:'tpta02798', code:'TPTA02798', afNumber:'683', name:'Plataforma Tesoura 08m 4x2 Li', type:'PTA Tesoura', brand:'Tecnogera', model:'Tesoura 08m 4x2 Li', serial:'JPAC125K04865', productCode:'931-000233', invoice:'2572', emissionDate:'2026-08-25', hourmeter:1, battery:'Lítio', contractor:'SIP', status:'available', inspection:'', usage:null },
  { id:'tpta02799', code:'TPTA02799', afNumber:'685', name:'Plataforma Tesoura 08m 4x2 Li', type:'PTA Tesoura', brand:'Tecnogera', model:'Tesoura 08m 4x2 Li', serial:'JPAC125K04874', productCode:'931-000233', invoice:'2572', emissionDate:'2026-08-25', hourmeter:1, battery:'Lítio', contractor:'SIP', status:'available', inspection:'', usage:null },
  { id:'tpta01333', code:'TPTA01333', afNumber:'', name:'Plataforma Tesoura 08m 4x2 Li', type:'PTA Tesoura', brand:'Tecnogera', model:'Tesoura 08m 4x2 Li', serial:'0775300701N010217', productCode:'931-000233', invoice:'2650', emissionDate:'2026-09-15', hourmeter:118.5, battery:'Lítio', contractor:'', status:'available', inspection:'', usage:null },
  { id:'tpta01604', code:'TPTA01604', afNumber:'', name:'Plataforma Tesoura 08m 4x2 Li', type:'PTA Tesoura', brand:'Tecnogera', model:'Tesoura 08m 4x2 Li', serial:'0775300701P010467', productCode:'931-000233', invoice:'2650', emissionDate:'2026-09-15', hourmeter:158, battery:'Lítio', contractor:'', status:'available', inspection:'', usage:null },
  { id:'tpta01605', code:'TPTA01605', afNumber:'', name:'Plataforma Tesoura 08m 4x2 Li', type:'PTA Tesoura', brand:'Tecnogera', model:'Tesoura 08m 4x2 Li', serial:'0775300701P010468', productCode:'931-000233', invoice:'2650', emissionDate:'2026-09-15', hourmeter:196.5, battery:'Lítio', contractor:'', status:'available', inspection:'', usage:null },
  { id:'tpta00389', code:'TPTA00389', afNumber:'955', name:'Plataforma Tesoura 08m 4x2 Pb', type:'PTA Tesoura', brand:'Tecnogera', model:'Tesoura 08m 4x2 Pb', serial:'JPAC022K02449', productCode:'931-000235', invoice:'2650', emissionDate:'2026-09-15', hourmeter:172.8, battery:'Chumbo', contractor:'', status:'available', inspection:'', usage:null },
  { id:'tpta00408', code:'TPTA00408', afNumber:'', name:'Plataforma Tesoura 08m 4x2 Pb', type:'PTA Tesoura', brand:'Tecnogera', model:'Tesoura 08m 4x2 Pb', serial:'JPAC022K02453', productCode:'931-000235', invoice:'2650', emissionDate:'2026-09-15', hourmeter:215.3, battery:'Chumbo', contractor:'', status:'available', inspection:'', usage:null },
  { id:'tpta00664', code:'TPTA00664', afNumber:'953', name:'Plataforma Tesoura 08m 4x2 Pb', type:'PTA Tesoura', brand:'Tecnogera', model:'Tesoura 08m 4x2 Pb', serial:'JPAC023A00124', productCode:'931-000235', invoice:'2650', emissionDate:'2026-09-15', hourmeter:201, battery:'Chumbo', contractor:'', status:'available', inspection:'', usage:null },
  { id:'tpta00823', code:'TPTA00823', afNumber:'954', name:'Plataforma Tesoura 08m 4x2 Pb', type:'PTA Tesoura', brand:'Tecnogera', model:'Tesoura 08m 4x2 Pb', serial:'JPAC023B00418', productCode:'931-000235', invoice:'2650', emissionDate:'2026-09-15', hourmeter:203, battery:'Chumbo', contractor:'', status:'available', inspection:'', usage:null },
  // 10M
  { id:'tpta02019', code:'TPTA02019', afNumber:'947', name:'Plataforma Tesoura 10m 4x2 Li', type:'PTA Tesoura', brand:'Tecnogera', model:'Tesoura 10m 4x2 Li', serial:'0775400501P010468', productCode:'931-000236', invoice:'2623', emissionDate:'2026-09-10', hourmeter:156.7, battery:'Lítio', contractor:'', status:'available', inspection:'', usage:null },
  { id:'tpta00254', code:'TPTA00254', afNumber:'615', name:'Plataforma Tesoura 10m 4x2 Li', type:'PTA Tesoura', brand:'Tecnogera', model:'Tesoura 10m 4x2 Li', serial:'JPAC022K02485', productCode:'931-000236', invoice:'2533', emissionDate:'2026-08-12', hourmeter:206.7, battery:'Lítio', contractor:'A.LA', status:'available', inspection:'', usage:null },
  { id:'tpta01868', code:'TPTA01868', afNumber:'618', name:'Plataforma Tesoura 10m 4x2 Li', type:'PTA Tesoura', brand:'Tecnogera', model:'Tesoura 10m 4x2 Li', serial:'JPAC023K05802', productCode:'931-000236', invoice:'2533', emissionDate:'2026-08-12', hourmeter:82.6, battery:'Lítio', contractor:'AIRTEC', status:'available', inspection:'', usage:null },
  { id:'tpta02162', code:'TPTA02162', afNumber:'617', name:'Plataforma Tesoura 10m 4x2 Li', type:'PTA Tesoura', brand:'Tecnogera', model:'Tesoura 10m 4x2 Li', serial:'0775400501S010034', productCode:'931-000236', invoice:'2533', emissionDate:'2026-08-12', hourmeter:111.5, battery:'Lítio', contractor:'', status:'available', inspection:'', usage:null },
  { id:'tpta00984', code:'TPTA00984', afNumber:'659', name:'Plataforma Tesoura 10m 4x2 Li', type:'PTA Tesoura', brand:'Tecnogera', model:'Tesoura 10m 4x2 Li', serial:'0775400501N010148', productCode:'931-000236', invoice:'2571', emissionDate:'2026-08-25', hourmeter:131, battery:'Lítio', contractor:'A.LA', status:'available', inspection:'', usage:null },
  // 12M
  { id:'tpta01095', code:'TPTA01095', afNumber:'949', name:'Plataforma Tesoura 12m 4x2 Li', type:'PTA Tesoura', brand:'Tecnogera', model:'Tesoura 12m 4x2 Li', serial:'0775500500N010105', productCode:'931-000238', invoice:'2623', emissionDate:'2026-09-10', hourmeter:112.4, battery:'Lítio', contractor:'', status:'available', inspection:'', usage:null }
];

const equipmentCatalogRevision = '2026-09-21-aff-1';
const verifiedAfNumbers = {
  TPTA00845:'626', TPTA02796:'686', TPTA02797:'687', TPTA02798:'683', TPTA02799:'685',
  TPTA00389:'955', TPTA00664:'953', TPTA00674:'948', TPTA00823:'954', TPTA00254:'615',
  TPTA00984:'659', TPTA01868:'618', TPTA02019:'947', TPTA02162:'617', TPTA01095:'949'
};

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

const equipmentReceivingChecklistItems = [
  { group: 'Sistema elétrico', title: 'Cabo de energia' },
  { group: 'Sistema elétrico', title: 'Display' },
  { group: 'Sistema elétrico', title: 'Sonda de corrente flexível iFl' },
  { group: 'Sistema elétrico', title: 'Terminais de teste' },
  { group: 'Sistema elétrico', title: 'Termopar Tipo K' },
  { group: 'Sistema elétrico', title: 'Bateria' },
  { group: 'Sistema hidráulico', title: 'Mangueiras' },
  { group: 'Sistema hidráulico', title: 'Vazamento de óleo' },
  { group: 'Sistema hidráulico', title: 'Tubo flexível sanfonado' },
  { group: 'Sistema hidráulico', title: 'Tubeira de aço inox' },
  { group: 'Sistema hidráulico', title: 'Pistola' },
  { group: 'Sistema hidráulico', title: 'Venture' },
  { group: 'Estrutura mecânica', title: 'Apresenta trincas' },
  { group: 'Estrutura mecânica', title: 'Apresenta deformação na estrutura' },
  { group: 'Motor', title: 'Vazamento no motor' },
  { group: 'Motor', title: 'Funcionamento do motor' }
];

const formLibrary = [
  { id: 'for-alm-5-1', code: 'FOR.ALM-5-1', revision: '01', issuedAt: '17/06/2026', category: 'Almoxarifado', title: 'Check List de Equipamentos', description: 'Vistoria de equipamento recebido, enviado ou retornado à obra.', format: 'XLSX', file: 'assets/formularios/FOR-ALM-5.1-check-list-de-equipamentos-rev01.xlsx', digital: 'recebimento' },
  { id: 'romaneio-materiais', code: 'ROM-OBRA', revision: 'Digital', issuedAt: '', category: 'Almoxarifado', title: 'Romaneio de Materiais', description: 'Controle dos materiais expedidos pelo almoxarifado para a obra.', format: 'DIGITAL', digital: 'romaneio' },
  { id: 'fv-maq-st', code: 'FV-MAQ-ST', revision: '00', issuedAt: '', category: 'Equipamentos', title: 'Inspeção PEMT', description: 'Verificação de retirada, uso diário e devolução de plataforma elevatória.', format: 'DIGITAL', digital: 'pemt' }
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

async function ensureExcelExportLibrary() {
  if (window.ExcelJS) return true;
  try {
    await loadExternalScript('https://cdn.jsdelivr.net/npm/exceljs@4.4.0/dist/exceljs.min.js', 'exceljs-library');
    return !!window.ExcelJS;
  } catch (error) {
    console.warn('Gerador avançado de Excel indisponível:', error);
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
let packingSlips = [];
let receivingInspections = [];
let equipmentImportMeta = { source: 'Nenhuma base', updatedAt: '' };
let workforce = [];
let workforceMeta = { source: 'Nenhuma base', updatedAt: '' };
let workforceAttendance = {};
let workforceControlMeta = { updatedAt: '' };
let workforceView = 'control';
let workforceControlMonth = new Date().toISOString().slice(0, 7);
let workforceSummaryDate = new Date().toISOString().slice(0, 10);
let workforceRemoteSaveTimer = null;
let workforceReadyPromise = Promise.resolve();
let currentPage = 'dashboard';
let currentUser = null;
try {
  const savedUser = localStorage.getItem('obraflow_user');
  if (savedUser) currentUser = JSON.parse(savedUser);
} catch(e) {}

let userApprovals = [];
try {
  const savedApprovals = localStorage.getItem('obraflow_user_approvals');
  if (savedApprovals) userApprovals = JSON.parse(savedApprovals);
} catch(e) {}

let inviteDraft = {
  email: '',
  name: '',
  company: '',
  role: 'operador',
  password: ''
};

function canSafelyAutoRender(relevantPages = null) {
  if (Array.isArray(relevantPages) && typeof currentPage !== 'undefined' && !relevantPages.includes(currentPage)) {
    return false;
  }
  if (document.querySelector('#modalRoot form')) return false;
  if (document.querySelector('form')) return false;
  const active = document.activeElement;
  if (active && ['INPUT', 'SELECT', 'TEXTAREA'].includes(active.tagName)) return false;
  return true;
}

async function syncUserApprovalsFromSupabase() {
  try {
    const rows = await supabaseRestRequest('user_approvals?select=*&order=created_at.desc');
    if (Array.isArray(rows)) {
      const map = new Map();
      userApprovals.forEach(u => u && u.email && map.set(u.email.toLowerCase(), u));
      rows.forEach(r => r && r.email && map.set(r.email.toLowerCase(), r));
      userApprovals = Array.from(map.values());
      localStorage.setItem('obraflow_user_approvals', JSON.stringify(userApprovals));
      updateAppShellAccess();
      // Não recria a tela se o gestor estiver na aba convidar ou preenchendo qualquer campo
      if (currentPage === 'usuarios' && userManagementTab !== 'convidar' && canSafelyAutoRender(['usuarios'])) {
        renderUserManagement();
      }
    }
  } catch(e) {
    console.warn('Supabase user_approvals sync indisponível:', e);
  }
}


async function saveUserApprovalToSupabase(record) {
  try {
    return await supabaseRestRequest('user_approvals?on_conflict=email', {
      method: 'POST',
      headers: { 'Prefer': 'resolution=merge-duplicates,return=representation' },
      body: JSON.stringify(record)
    });
  } catch(e) {
    console.warn('Erro ao salvar no Supabase:', e);
  }
}

function isAdmin() {
  return !!(currentUser && (currentUser.role === 'admin' || currentUser.role === 'manager' || currentUser.role === 'gestor'));
}

function updateAppShellAccess() {
  const isAuth = !!currentUser;
  const isAdm = isAdmin();
  const sidebar = document.getElementById('sidebar');
  const mainArea = document.querySelector('.main-area');
  
  if (sidebar) sidebar.style.display = isAuth ? 'flex' : 'none';
  if (mainArea) mainArea.style.marginLeft = (isAuth && window.innerWidth > 992) ? '252px' : '0';

  const userBox = document.getElementById('sidebarUserContainer') || document.querySelector('.sidebar-user');
  if (userBox) {
    const avatarEl = document.getElementById('sidebarUserAvatar') || userBox.querySelector('.avatar');
    const nameEl = document.getElementById('sidebarUserName') || userBox.querySelector('strong');
    const roleEl = document.getElementById('sidebarUserRole') || userBox.querySelector('small');
    
    if (currentUser) {
      const name = currentUser.name || currentUser.email || 'Usuário';
      const initials = name.split(' ').map(n=>n[0]).join('').substring(0, 2).toUpperCase() || 'US';
      if (avatarEl) {
        if (currentUser.photo) {
          avatarEl.innerHTML = `<img src="${currentUser.photo}" style="width:100%; height:100%; border-radius:50%; object-fit:cover;" />`;
          avatarEl.style.background = 'transparent';
        } else {
          avatarEl.textContent = initials;
          avatarEl.style.background = '';
        }
      }
      if (nameEl) nameEl.textContent = name;
      if (roleEl) roleEl.textContent = currentUser.role === 'admin' ? 'Administrador' : currentUser.role === 'manager' || currentUser.role === 'gestor' ? 'Gestor de Obra' : currentUser.role === 'engenheiro' ? 'Engenheiro' : 'Operador de Obra';
    } else {
      if (avatarEl) avatarEl.textContent = 'VIS';
      if (nameEl) nameEl.textContent = 'Visitante / Operador';
      if (roleEl) roleEl.textContent = 'Modo Consulta';
    }
  }

  const pendingCount = userApprovals.filter(u => u.status === 'pending').length;
  const badge = document.getElementById('navPendingUsersCount');
  if (badge) {
    badge.textContent = pendingCount;
    badge.style.display = (isAuth && pendingCount > 0) ? 'inline-block' : 'none';
  }

  const topActions = document.querySelector('.top-actions');
  let authBtn = document.getElementById('authNavButton');
  if (!authBtn && topActions) {
    authBtn = document.createElement('div');
    authBtn.id = 'authNavButton';
    topActions.prepend(authBtn);
  }
  if (authBtn) {
    if (isAuth) {
      authBtn.innerHTML = `<button class="button button-outline compact" onclick="logoutUser()">${icon('user')} <strong>${esc(currentUser.name || currentUser.email)}</strong> (Sair)</button>`;
    } else {
      authBtn.innerHTML = `<button class="button button-green compact" onclick="openLoginModal('login')">${icon('shield')} Entrar / Cadastrar</button>`;
    }
  }
}

function accessLinkParams() {
  const rawHash = location.hash.replace('#', '');
  const query = rawHash.includes('?') ? rawHash.slice(rawHash.indexOf('?') + 1) : '';
  return new URLSearchParams(query);
}

function openInviteFromLanding() {
  const params = accessLinkParams();
  openLoginModal(
    'invite',
    params.get('email') || '',
    params.get('token') || '',
    params.get('company') || '',
    params.get('name') || ''
  );
}

function openLoginFromLanding() {
  openLoginModal('login', accessLinkParams().get('email') || '');
}

function finishAuthenticationRoute() {
  const route = location.hash.replace('#', '').split('?')[0];
  if (['convite', 'invite', 'login', 'acesso'].includes(route)) {
    history.replaceState(null, '', `${location.pathname}${location.search}#dashboard`);
  }
}

function accessRoleLabel(role) {
  const labels = {
    admin: 'Administrador',
    manager: 'Gestor de obra',
    gestor: 'Gestor de obra',
    engenheiro: 'Engenheiro / Fiscal',
    operador: 'Operador de campo'
  };
  return labels[role] || 'Colaborador da obra';
}

function renderAccessLanding(mode, params) {
  const app = document.getElementById('app');
  if (!app) return;

  const isInvite = mode === 'invite';
  const email = params.get('email') || '';
  const company = params.get('company') || '';
  const name = params.get('name') || '';
  const role = accessRoleLabel(params.get('role') || '');
  const firstName = name.trim().split(/\s+/)[0] || '';
  const title = isInvite
    ? `${firstName ? `${esc(firstName)}, seu` : 'Seu'} acesso à obra está pronto`
    : 'Bem-vindo ao DataCenter Omnia';

  app.innerHTML = `
    <section class="access-landing">
      <div class="access-landing-glow access-landing-glow-one"></div>
      <div class="access-landing-glow access-landing-glow-two"></div>

      <header class="access-landing-header">
        <a class="access-landing-brand" href="#" aria-label="DataCenter Omnia">
          <img src="assets/heating-cooling-logo.png" alt="Heating Cooling" />
          <span><strong>DataCenter</strong> Omnia<small>GESTÃO HVAC</small></span>
        </a>
        <span class="access-secure-badge">${icon('shield')} Ambiente seguro</span>
      </header>

      <div class="access-landing-content">
        <div class="access-landing-copy">
          <span class="access-invite-pill">${icon(isInvite ? 'mail' : 'user')} ${isInvite ? 'CONVITE PESSOAL' : 'PORTAL DA OBRA'}</span>
          <h1>${title}</h1>
          <p>${isInvite
            ? 'Você foi convidado para acessar a plataforma de gestão da obra. Confirme seus dados, crie sua senha e comece a usar.'
            : 'Acesse a plataforma que conecta equipes, equipamentos, materiais e operações da obra em um só lugar.'}</p>

          <div class="access-landing-actions">
            ${currentUser
              ? `<a class="button button-green access-primary-button" href="#dashboard">${icon('arrow')} Ir para o painel</a>`
              : `<button type="button" class="button button-green access-primary-button" onclick="${isInvite ? 'openInviteFromLanding()' : 'openLoginFromLanding()'}">${icon(isInvite ? 'check' : 'user')} ${isInvite ? 'Ativar meu acesso' : 'Entrar na plataforma'}</button>`}
            ${!currentUser && isInvite ? `<button type="button" class="access-text-button" onclick="openLoginFromLanding()">Já tenho uma conta</button>` : ''}
          </div>

          <div class="access-trust-row">
            <span>${icon('check')} Acesso autorizado</span>
            <span>${icon('lock')} Dados protegidos</span>
            <span>${icon('tool')} Operação centralizada</span>
          </div>
        </div>

        <aside class="access-invite-card">
          <div class="access-card-icon">${icon(isInvite ? 'mail' : 'building')}</div>
          <p>${isInvite ? 'DETALHES DO CONVITE' : 'ACESSO À PLATAFORMA'}</p>
          <h2>${name ? esc(name) : (isInvite ? 'Convite para colaborador' : 'DataCenter Omnia')}</h2>
          <div class="access-invite-details">
            ${email ? `<span><small>E-mail</small><strong>${esc(email)}</strong></span>` : ''}
            ${company ? `<span><small>Empresa</small><strong>${esc(company)}</strong></span>` : ''}
            ${isInvite ? `<span><small>Perfil de acesso</small><strong>${esc(role)}</strong></span>` : ''}
            <span><small>Obra</small><strong>DataCenter Omnia (DC01)</strong></span>
          </div>
          <div class="access-card-note">${icon('shield')} <span>Este acesso foi enviado por um gestor autorizado da obra.</span></div>
        </aside>
      </div>

      <footer class="access-landing-footer">
        <span>Heating Cooling · Gestão de obra</span>
        <span>Precisa de ajuda? Fale com o gestor que enviou o convite.</span>
      </footer>
    </section>`;
  hydrateIcons();
}

function togglePasswordVisibility(inputId, btnEl) {
  const input = document.getElementById(inputId);
  if (!input) return;
  if (input.type === 'password') {
    input.type = 'text';
    btnEl.innerHTML = icon('eyeOff');
    btnEl.title = 'Ocultar senha';
  } else {
    input.type = 'password';
    btnEl.innerHTML = icon('eye');
    btnEl.title = 'Mostrar senha';
  }
}

function showLoginHelp() {
  modal(`
    ${modalHead('Dúvidas no Acesso / Esqueceu a Senha?', 'Saiba como se autenticar ou solicitar acesso à obra.')}
    <div class="modal-body" style="display:grid; gap:16px;">
      <div class="notice" style="background:#f0f7f3; border-color:#bce1cb; color:#0d4225;">
        <strong>🔑 PIN Master de Teste / Acesso Rápido:</strong><br/>
        Se você é administrador ou precisa testar o sistema rapidamente, pode digitar qualquer e-mail e a senha <code>1234</code> ou <code>0000</code>.
      </div>
      <div style="display:grid; gap:6px;">
        <h4 style="margin:0; font-size:13px; color:var(--ink);">Primeiro Acesso na Obra?</h4>
        <p style="margin:0; font-size:12px; color:var(--muted); line-height:1.4;">
          Se você ainda não tem um cadastro aprovado, clique na aba <strong>"Solicitar Cadastro"</strong> na tela de login. O gestor da obra receberá sua solicitação para autorizar seu login.
        </p>
      </div>
      <div style="display:grid; gap:6px;">
        <h4 style="margin:0; font-size:13px; color:var(--ink);">Recebeu um convite do gestor?</h4>
        <p style="margin:0; font-size:12px; color:var(--muted); line-height:1.4;">
          Acesse a aba <strong>"Ativar Convite"</strong> e informe o e-mail e o código recebidos para cadastrar sua senha pessoal.
        </p>
      </div>
    </div>
    <div class="modal-foot">
      <button type="button" class="button button-green" onclick="openLoginModal('login')">${icon('check')} Voltar ao Login</button>
    </div>
  `, 'modal-small');
}

function openLoginModal(tab = 'login', prefillEmail = '', prefillToken = '', prefillCompany = '', prefillName = '') {
  let modalBody = '';

  if (tab === 'login') {
    modalBody = `
      <form onsubmit="submitUserLogin(event)">
        <div class="modal-body">
          <div class="module-tabs" style="width:100%; margin-bottom:18px;">
            <a href="javascript:void(0)" class="active" onclick="openLoginModal('login')">${icon('user')} Entrar</a>
            <a href="javascript:void(0)" onclick="openLoginModal('signup')">${icon('plus')} Solicitar Cadastro</a>
            <a href="javascript:void(0)" onclick="openLoginModal('invite')">${icon('shield')} Ativar Convite</a>
          </div>

          <div class="field full" style="margin-bottom:14px;">
            <label style="display:flex; justify-content:space-between; align-items:center;">
              <span>E-mail cadastrado <em>*</em></span>
            </label>
            <div class="input-icon-wrapper">
              <span class="input-leading-icon">${icon('mail')}</span>
              <input type="email" id="loginEmailInput" name="email" value="${esc(prefillEmail)}" placeholder="seu.email@empresa.com" required autofocus />
            </div>
          </div>

          <div class="field full" style="margin-bottom:14px;">
            <label style="display:flex; justify-content:space-between; align-items:center;">
              <span>Senha ou PIN de Acesso <em>*</em></span>
              <a href="javascript:void(0)" onclick="showLoginHelp()" style="font-size:11px; font-weight:600; color:var(--green-dark); text-decoration:none;">Dúvidas ou PIN?</a>
            </label>
            <div class="input-icon-wrapper has-trailing-btn">
              <span class="input-leading-icon">${icon('lock')}</span>
              <input type="password" id="loginPasswordInput" name="password" placeholder="Digite sua senha ou PIN (ex: 1234)" required />
              <button type="button" class="input-trailing-btn" title="Mostrar senha" onclick="togglePasswordVisibility('loginPasswordInput', this)">
                ${icon('eye')}
              </button>
            </div>
          </div>

          <div class="auth-help-card">
            ${icon('key')}
            <div>
              <strong>🔑 PIN Master / Teste Rápido:</strong> Use <code>1234</code> ou <code>0000</code> para entrar imediatamente.<br/>
              Novo por aqui? <a href="javascript:void(0)" onclick="openLoginModal('signup', document.getElementById('loginEmailInput')?.value || '')" style="color:#0d4225; font-weight:700; text-decoration:underline;">Solicitar Cadastro de Usuário</a>
            </div>
          </div>
        </div>
        <div class="modal-foot">
          <button type="button" class="button button-outline" onclick="closeModal()">Cancelar</button>
          <button type="submit" class="button button-green">${icon('check')} Entrar no Sistema</button>
        </div>
      </form>`;
  } else if (tab === 'signup') {
    modalBody = `
      <form onsubmit="submitUserSignup(event)">
        <div class="modal-body">
          <div class="module-tabs" style="width:100%; margin-bottom:18px;">
            <a href="javascript:void(0)" onclick="openLoginModal('login')">${icon('user')} Entrar</a>
            <a href="javascript:void(0)" class="active" onclick="openLoginModal('signup')">${icon('plus')} Solicitar Cadastro</a>
            <a href="javascript:void(0)" onclick="openLoginModal('invite')">${icon('shield')} Ativar Convite</a>
          </div>

          <div class="field full" style="margin-bottom:12px;">
            <label>Nome Completo <em>*</em></label>
            <div class="input-icon-wrapper">
              <span class="input-leading-icon">${icon('user')}</span>
              <input type="text" name="name" placeholder="Ex: João da Silva" required />
            </div>
          </div>

          <div class="field full" style="margin-bottom:12px;">
            <label>E-mail Corporativo / Pessoal <em>*</em></label>
            <div class="input-icon-wrapper">
              <span class="input-leading-icon">${icon('mail')}</span>
              <input type="email" name="email" value="${esc(prefillEmail)}" placeholder="seu.email@empresa.com" required />
            </div>
          </div>

          <div class="field full" style="margin-bottom:12px;">
            <label>Empresa / Subempreiteira <em>*</em></label>
            <div class="input-icon-wrapper">
              <span class="input-leading-icon">${icon('building')}</span>
              <input type="text" name="company" placeholder="Ex: Heating Cooling, AIRTEC..." required />
            </div>
          </div>

          <div class="field full" style="margin-bottom:12px;">
            <label>Crie sua Senha <em>*</em></label>
            <div class="input-icon-wrapper has-trailing-btn">
              <span class="input-leading-icon">${icon('lock')}</span>
              <input type="password" id="signupPasswordInput" name="password" minlength="4" placeholder="Crie uma senha de acesso" required />
              <button type="button" class="input-trailing-btn" title="Mostrar senha" onclick="togglePasswordVisibility('signupPasswordInput', this)">
                ${icon('eye')}
              </button>
            </div>
          </div>

          <div class="field full" style="margin-bottom:12px;">
            <label>Função Desejada <em>*</em></label>
            <select name="role">
              <option value="operador">Operador de Campo / Técnico</option>
              <option value="engenheiro">Engenheiro / Fiscal de Obra</option>
              <option value="gestor">Gestor de Obra / Almoxarife</option>
            </select>
          </div>

          <div class="notice" style="margin-top:12px;">
            ${icon('clock')} Seu cadastro entrará na fila de **Aprovação do Gestor**.
          </div>
        </div>
        <div class="modal-foot">
          <button type="button" class="button button-outline" onclick="closeModal()">Cancelar</button>
          <button type="submit" class="button button-green">${icon('check')} Enviar Solicitação</button>
        </div>
      </form>`;
  } else if (tab === 'invite') {
    const existingApproval = userApprovals.find(u =>
      (prefillEmail && u.email && u.email.toLowerCase() === prefillEmail.toLowerCase())
      || (prefillToken && u.invite_token === prefillToken)
    );
    const resolvedCompany = prefillCompany || existingApproval?.company || '';
    const resolvedName = existingApproval?.name || prefillName || '';
    modalBody = `
      <form onsubmit="submitInviteActivation(event)">
        <div class="modal-body">
          <div class="module-tabs" style="width:100%; margin-bottom:18px;">
            <a href="javascript:void(0)" onclick="openLoginModal('login')">${icon('user')} Entrar</a>
            <a href="javascript:void(0)" onclick="openLoginModal('signup')">${icon('plus')} Solicitar Cadastro</a>
            <a href="javascript:void(0)" class="active" onclick="openLoginModal('invite')">${icon('shield')} Ativar Convite</a>
          </div>

          <div class="field full" style="margin-bottom:12px;">
            <label>E-mail do Convite <em>*</em></label>
            <div class="input-icon-wrapper">
              <span class="input-leading-icon">${icon('mail')}</span>
              <input type="email" name="email" value="${esc(prefillEmail)}" placeholder="seu.email@empresa.com" required />
            </div>
          </div>

          <div class="field full" style="margin-bottom:12px;">
            <label>Código / Token do Convite <em>*</em></label>
            <div class="input-icon-wrapper">
              <span class="input-leading-icon">${icon('key')}</span>
              <input type="text" name="token" value="${esc(prefillToken)}" placeholder="INV-XXXXXX" required />
            </div>
          </div>

          <div class="field full" style="margin-bottom:12px;">
            <label>Seu Nome Completo <em>*</em></label>
            <div class="input-icon-wrapper">
              <span class="input-leading-icon">${icon('user')}</span>
              <input type="text" name="name" value="${esc(resolvedName)}" placeholder="Confirme seu nome completo" required />
            </div>
          </div>

          <div class="field full" style="margin-bottom:12px;">
            <label>Empresa / Subempreiteira <em>*</em></label>
            <div class="input-icon-wrapper">
              <span class="input-leading-icon">${icon('building')}</span>
              <input type="text" name="company" value="${esc(resolvedCompany)}" placeholder="Nome da empresa" required />
            </div>
          </div>

          <div class="field full" style="margin-bottom:12px;">
            <label>Foto de Perfil (Opcional)</label>
            <div style="display:flex; align-items:center; gap:12px;">
              <div id="inviteAvatarPreview" style="width:48px; height:48px; border-radius:50%; background:#eaf3fb; border:1px solid var(--line); display:flex; align-items:center; justify-content:center; overflow:hidden;">
                ${icon('user')}
              </div>
              <input type="file" name="photo" accept="image/*" style="flex:1; font-size:13px;" onchange="
                const file = this.files[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = e => {
                    document.getElementById('inviteAvatarPreview').innerHTML = '<img src=\\'' + e.target.result + '\\' style=\\'width:100%; height:100%; object-fit:cover;\\'/>';
                    document.getElementById('invitePhotoBase64').value = e.target.result;
                  };
                  reader.readAsDataURL(file);
                } else {
                  document.getElementById('inviteAvatarPreview').innerHTML = '${icon('user')}';
                  document.getElementById('invitePhotoBase64').value = '';
                }
              " />
              <input type="hidden" name="photo_base64" id="invitePhotoBase64" />
            </div>
          </div>

          <div class="field full" style="margin-bottom:12px;">
            <label>Defina sua Senha de Acesso <em>*</em></label>
            <div class="input-icon-wrapper has-trailing-btn">
              <span class="input-leading-icon">${icon('lock')}</span>
              <input type="password" id="invitePasswordInput" name="password" minlength="4" placeholder="Crie sua nova senha" required />
              <button type="button" class="input-trailing-btn" title="Mostrar senha" onclick="togglePasswordVisibility('invitePasswordInput', this)">
                ${icon('eye')}
              </button>
            </div>
          </div>

          <div class="notice" style="margin-top:12px;">
            ${icon('check')} O convite enviado pelo gestor autoriza seu acesso imediato após definir a senha.
          </div>
        </div>
        <div class="modal-foot">
          <button type="button" class="button button-outline" onclick="closeModal()">Cancelar</button>
          <button type="submit" class="button button-green">${icon('check')} Ativar e Entrar</button>
        </div>
      </form>`;
  }

  modal(`${modalHead('Autenticação ObraFlow', 'Acesse o sistema por e-mail e senha, solicite liberação ao gestor ou ative seu convite.')}${modalBody}`, 'modal-medium');
}

async function submitUserLogin(event) {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(event.target));
  const email = (data.email || '').toLowerCase().trim();
  const password = String(data.password || '').trim();

  if (password === '1234' || password === '0000') {
    currentUser = { email: email || 'pedro.alves@heatingcooling.com.br', name: 'Pedro Alves', role: 'admin', company: 'Heating Cooling' };
    localStorage.setItem('obraflow_user', JSON.stringify(currentUser));
    closeModal();
    updateAppShellAccess();
    finishAuthenticationRoute();
    render();
    toast('Login master efetuado! Painel liberado.');
    return;
  }

  // Sincronizar usuários do Supabase antes de validar o login
  await syncUserApprovalsFromSupabase();

  const match = userApprovals.find(u => u.email && u.email.toLowerCase() === email);

  if (match) {
    if (match.status === 'pending') {
      toast('Sua solicitação de acesso está aguardando aprovação do Gestor da Obra.', true);
      return;
    }
    if (match.status === 'rejected') {
      toast('Sua solicitação de acesso foi recusada pelo gestor.', true);
      return;
    }
    if (match.status === 'approved' || match.status === 'active') {
      if (match.password && match.password !== password) {
        toast('Senha incorreta. Tente novamente.', true);
        return;
      }
      currentUser = {
        id: match.id,
        email: match.email,
        name: match.name,
        role: match.role || 'gestor',
        company: match.company || 'Obra'
      };
      localStorage.setItem('obraflow_user', JSON.stringify(currentUser));
      closeModal();
      updateAppShellAccess();
      finishAuthenticationRoute();
      render();
      toast(`Bem-vindo, ${currentUser.name}! Acesso liberado.`);
      return;
    }
  }

  const client = getSupabase();
  if (client && client.auth && typeof client.auth.signInWithPassword === 'function') {
    try {
      const { data: authData, error } = await client.auth.signInWithPassword({ email, password });
      if (authData && authData.user && !error) {
        currentUser = {
          id: authData.user.id,
          email: authData.user.email,
          name: authData.user.user_metadata?.name || email.split('@')[0],
          role: authData.user.user_metadata?.role || 'admin',
          company: authData.user.user_metadata?.company || 'Heating Cooling'
        };
        localStorage.setItem('obraflow_user', JSON.stringify(currentUser));
        closeModal();
        updateAppShellAccess();
        finishAuthenticationRoute();
        render();
        toast(`Bem-vindo, ${currentUser.name}! Acesso Supabase liberado.`);
        return;
      }
    } catch(e) {
      console.warn('Supabase Auth login falhou:', e);
    }
  }

  toast('E-mail não encontrado ou pendente de aprovação. Utilize a aba "Solicitar Cadastro".', true);
}

async function submitUserSignup(event) {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(event.target));
  const email = (data.email || '').toLowerCase().trim();
  const name = (data.name || '').trim();
  const password = String(data.password || '').trim();
  const company = (data.company || '').trim();
  const role = data.role || 'operador';

  const existing = userApprovals.find(u => u.email && u.email.toLowerCase() === email);
  if (existing) {
    if (existing.status === 'pending') {
      toast('Este e-mail já possui uma solicitação pendente de aprovação.', true);
    } else if (existing.status === 'approved') {
      toast('Este e-mail já está aprovado! Faça login na aba "Entrar".');
      openLoginModal('login', email);
    } else {
      toast('Este e-mail já está cadastrado.', true);
    }
    return;
  }

  const record = {
    id: crypto.randomUUID ? crypto.randomUUID() : 'usr_' + Date.now(),
    email: email,
    name: name,
    password: password,
    company: company,
    role: role,
    status: 'pending',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  userApprovals.unshift(record);
  localStorage.setItem('obraflow_user_approvals', JSON.stringify(userApprovals));
  await saveUserApprovalToSupabase(record);

  closeModal();
  updateAppShellAccess();
  toast('Solicitação de cadastro enviada! O Gestor da Obra liberará seu acesso em breve.');
}

async function submitInviteActivation(event) {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(event.target));
  const email = (data.email || '').toLowerCase().trim();
  const token = (data.token || '').trim();
  const name = (data.name || '').trim();
  const company = (data.company || '').trim();
  const password = String(data.password || '').trim();

  let match = userApprovals.find(u => (u.email && u.email.toLowerCase() === email) || (u.invite_token && u.invite_token === token));

  if (!match) {
    match = {
      id: crypto.randomUUID ? crypto.randomUUID() : 'usr_' + Date.now(),
      email: email,
      name: name,
      company: company || 'Obra',
      password: password,
      photo: data.photo_base64 || undefined,
      role: 'gestor',
      status: 'approved',
      invite_token: token,
      approved_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    userApprovals.unshift(match);
  } else {
    match.email = email;
    match.name = name || match.name;
    if (company) match.company = company;
    match.password = password;
    if (data.photo_base64) match.photo = data.photo_base64;
    match.status = 'approved';
    if (!match.role) match.role = 'gestor';
    match.approved_at = new Date().toISOString();
    match.updated_at = new Date().toISOString();
  }

  localStorage.setItem('obraflow_user_approvals', JSON.stringify(userApprovals));
  await saveUserApprovalToSupabase(match);

  currentUser = {
    id: match.id,
    email: match.email,
    name: match.name,
    role: match.role || 'gestor',
    company: match.company || 'Obra'
  };
  localStorage.setItem('obraflow_user', JSON.stringify(currentUser));

  closeModal();
  updateAppShellAccess();
  finishAuthenticationRoute();
  render();
  toast(`Convite ativado com sucesso! Bem-vindo(a), ${currentUser.name}. Acesso liberado.`);
}

function logoutUser() {
  currentUser = null;
  localStorage.removeItem('obraflow_user');
  updateAppShellAccess();
  render();
  toast('Sessão encerrada. O sistema agora está no Modo Operador de Campo.');
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

const equipmentCatalogFields = [
  'name', 'model', 'chassis', 'serial', 'patrimony', 'battery', 'contractor',
  'issuedate', 'inspection', 'type', 'brand', 'productCode', 'invoice',
  'emissionDate', 'afNumber', 'capacity'
];

function equipmentDatabasePayload(record, { catalogOnly = false } = {}) {
  const fields = catalogOnly
    ? ['id', 'code', ...equipmentCatalogFields, 'updatedAt']
    : ['id', 'code', ...equipmentCatalogFields, 'hourmeter', 'status', 'usage', 'updatedAt'];
  return Object.fromEntries(fields
    .filter(field => record[field] !== undefined)
    .map(field => [field,
      field === 'id' ? String(record[field])
        : field === 'hourmeter' && record[field] !== null ? String(record[field])
          : record[field]
    ]));
}

async function persistEquipmentRecords(records, options = {}) {
  if (!records?.length) return;
  const payloads = records.map(record => equipmentDatabasePayload(record, options));
  const invalid = payloads.findIndex(payload => !payload.id || !payload.code);
  if (invalid >= 0) throw new Error(`Equipamento sem identificação válida: ${records[invalid]?.code || invalid + 1}.`);

  // Uma única operação evita sincronizações parciais quando uma planilha
  // atualiza toda a frota. A representação retornada confirma cada gravação.
  const saved = await supabaseRestRequest('equipments?on_conflict=id&select=id,code,status,updatedAt', {
    method: 'POST',
    headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
    body: JSON.stringify(payloads),
    timeoutMs: 30000
  });
  const savedIds = new Set((Array.isArray(saved) ? saved : []).map(item => String(item.id)));
  const missing = payloads.filter(payload => !savedIds.has(String(payload.id)));
  if (missing.length) {
    throw new Error(`O banco não confirmou ${missing.length} equipamento(s): ${missing.slice(0, 3).map(item => item.code).join(', ')}.`);
  }
  return saved;
}

async function persistEquipmentCatalog(records) {
  await Promise.all((records || []).map(record => {
    const payload = equipmentDatabasePayload(record, { catalogOnly: true });
    delete payload.id;
    return supabaseRestRequest(`equipments?id=eq.${encodeURIComponent(record.id)}`, {
      method: 'PATCH',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify(payload),
      timeoutMs: 30000
    });
  }));
}

function remoteEquipmentRecord(record) {
  const nullableFields = new Set(['usage', 'inspection']);
  return Object.fromEntries(Object.entries(record || {}).filter(([field, value]) =>
    value !== undefined && (value !== null || nullableFields.has(field))
  ));
}

function mergeEquipmentSnapshots(localRecord, remoteRecord, localWins = false) {
  const remoteDefined = remoteEquipmentRecord(remoteRecord);
  if (!localRecord) return sanitizeEquipment(remoteDefined);
  if (!remoteRecord) return sanitizeEquipment(localRecord);
  const chosen = localWins
    ? { ...sanitizeEquipment(remoteDefined), ...localRecord }
    : { ...localRecord, ...remoteDefined };
  return sanitizeEquipment(chosen);
}

async function backfillLocalEquipmentCatalog(localRecords, remoteRecords) {
  const remoteByCode = new Map((remoteRecords || []).map(record => [String(record.code || record.id || '').toUpperCase(), record]));
  const missingCatalog = [];
  localRecords.forEach(local => {
    const remote = remoteByCode.get(String(local.code || local.id || '').toUpperCase());
    if (!remote) return;
    const hasMissingRemoteData = equipmentCatalogFields.some(field =>
      (remote[field] === null || remote[field] === undefined || remote[field] === '') &&
      local[field] !== null && local[field] !== undefined && local[field] !== ''
    );
    if (hasMissingRemoteData) {
      missingCatalog.push({ ...local, id: remote.id || local.id, code: remote.code || local.code, updatedAt: new Date().toISOString() });
    }
  });
  if (missingCatalog.length) await persistEquipmentCatalog(missingCatalog);
}

function sanitizeEquipment(item) {
  const codeUpper = (item.code || item.id || '').toUpperCase();
  const seed = seedEquipments.find(s => s.code.toUpperCase() === codeUpper);
  const hasContractor = Object.prototype.hasOwnProperty.call(item, 'contractor');
  let af = (item.afNumber !== undefined && item.afNumber !== null) ? String(item.afNumber).trim() : '';
  let contractor = hasContractor ? String(item.contractor ?? '').trim() : '';
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
      // An explicit empty cell is meaningful: the spreadsheet/database must be
      // able to remove an old contractor instead of restoring the seed value.
      contractor: hasContractor ? contractor : (seed.contractor || '')
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

function migrateVerifiedEquipmentCatalog() {
  if (localStorage.getItem('obraflow_equipment_catalog_revision') === equipmentCatalogRevision) return false;
  let changed = false;
  equipments = equipments.map(equipment => {
    const afNumber = verifiedAfNumbers[String(equipment.code || '').toUpperCase()];
    if (!afNumber || String(equipment.afNumber || '') === afNumber) return equipment;
    changed = true;
    return { ...equipment, afNumber };
  });
  localStorage.setItem('obraflow_equipment_catalog_revision', equipmentCatalogRevision);
  return changed;
}

function loadLocalStorageBackup() {
  try {
    const localEq = localStorage.getItem('obraflow_equipments');
    if (localEq) {
      const parsed = JSON.parse(localEq);
      if (Array.isArray(parsed)) {
        equipments = parsed.map(sanitizeEquipment);
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
    const localWorkforceMeta = localStorage.getItem('obraflow_workforce_meta');
    if (localWorkforceMeta) {
      const parsed = JSON.parse(localWorkforceMeta);
      if (parsed && typeof parsed === 'object') workforceMeta = parsed;
    }
    const localAttendance = localStorage.getItem('obraflow_workforce_attendance');
    if (localAttendance) {
      const parsed = JSON.parse(localAttendance);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) workforceAttendance = parsed;
    }
    const localWorkforceControlMeta = localStorage.getItem('obraflow_workforce_control_meta');
    if (localWorkforceControlMeta) {
      const parsed = JSON.parse(localWorkforceControlMeta);
      if (parsed && typeof parsed === 'object') workforceControlMeta = parsed;
    }
    const localWorkforceMonth = localStorage.getItem('obraflow_workforce_control_month');
    if (/^\d{4}-\d{2}$/.test(localWorkforceMonth || '')) workforceControlMonth = localWorkforceMonth;
    const localWorkforceSummaryDate = localStorage.getItem('obraflow_workforce_summary_date');
    if (/^\d{4}-\d{2}-\d{2}$/.test(localWorkforceSummaryDate || '')) workforceSummaryDate = localWorkforceSummaryDate;
    const localPackingSlips = localStorage.getItem('obraflow_packing_slips');
    if (localPackingSlips) {
      const parsed = JSON.parse(localPackingSlips);
      if (Array.isArray(parsed)) packingSlips = dedupePackingSlips(parsed);
    }
    const localReceivingInspections = localStorage.getItem('obraflow_receiving_inspections');
    if (localReceivingInspections) {
      const parsed = JSON.parse(localReceivingInspections);
      if (Array.isArray(parsed)) receivingInspections = parsed;
    }
  } catch (e) {
    console.warn('Erro ao carregar do localStorage:', e);
  }
  if (migrateVerifiedEquipmentCatalog()) saveLocalBackup();
}

function saveLocalBackup() {
  let saved = true;
  const entries = [
    ['obraflow_equipments', equipments],
    ['obraflow_history', history],
    ['obraflow_workforce', workforce],
    ['obraflow_workforce_meta', workforceMeta],
    ['obraflow_workforce_attendance', workforceAttendance],
    ['obraflow_workforce_control_meta', workforceControlMeta],
    ['obraflow_packing_slips', packingSlips],
    ['obraflow_receiving_inspections', receivingInspections]
  ];
  entries.forEach(([key, value]) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      saved = false;
      console.warn(`Erro ao salvar ${key} no localStorage:`, e);
    }
  });
  try {
    localStorage.setItem('obraflow_workforce_control_month', workforceControlMonth);
    localStorage.setItem('obraflow_workforce_summary_date', workforceSummaryDate);
  } catch (e) {
    saved = false;
    console.warn('Erro ao salvar o período do controle de efetivo:', e);
  }
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

let packingSlipRemoteAvailable = null;
function dedupePackingSlips(records = []) {
  const unique = new Map();
  records.filter(Boolean).forEach(record => {
    const key = String(record.number || record.id || '').trim().toUpperCase();
    if (!key) return;
    const current = unique.get(key);
    const recordTime = Date.parse(record.updatedAt || record.createdAt || record.issuedAt || 0) || 0;
    const currentTime = Date.parse(current?.updatedAt || current?.createdAt || current?.issuedAt || 0) || 0;
    if (!current || recordTime > currentTime || (recordTime === currentTime && JSON.stringify(record).length > JSON.stringify(current).length)) unique.set(key, record);
  });
  return Array.from(unique.values()).sort((a,b) => (Date.parse(b.issuedAt || b.createdAt || '') || 0) - (Date.parse(a.issuedAt || a.createdAt || '') || 0));
}

async function syncPackingSlipsFromSupabase() {
  try {
    const rows = await supabaseRestRequest('packing_slips?select=id,data,updated_at&order=updated_at.desc');
    const merged = new Map(packingSlips.map(item => [String(item.id), item]));
    (rows || []).forEach(row => {
      const remote = row.data && typeof row.data === 'object' ? row.data : null;
      if (!remote) return;
      const local = merged.get(String(remote.id));
      if (!local || Date.parse(remote.updatedAt || row.updated_at || 0) >= Date.parse(local.updatedAt || 0)) {
        merged.set(String(remote.id), remote);
      }
    });
    packingSlips = dedupePackingSlips(Array.from(merged.values()));
    packingSlipRemoteAvailable = true;
    saveLocalBackup();
    if (canSafelyAutoRender(['romaneios','formularios','materiais','notas-entrada','movimentacoes-materiais','cautelas'])) render();
  } catch (error) {
    packingSlipRemoteAvailable = false;
    console.warn('Sincronização de romaneios indisponível; mantendo os dados locais:', error);
  }
}

async function persistPackingSlip(slip) {
  slip.updatedAt = new Date().toISOString();
  saveLocalBackup();
  try {
    await supabaseRestRequest('packing_slips?on_conflict=id', {
      method: 'POST',
      headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
      body: JSON.stringify({ id: String(slip.id), number: slip.number, data: slip, updated_at: slip.updatedAt })
    });
    packingSlipRemoteAvailable = true;
    return true;
  } catch (error) {
    packingSlipRemoteAvailable = false;
    console.warn('Romaneio salvo somente neste aparelho:', error);
    return false;
  }
}

async function syncReceivingInspectionsFromSupabase() {
  try {
    const rows = await supabaseRestRequest('receiving_inspections?select=id,data,updated_at&order=updated_at.desc');
    const merged = new Map(receivingInspections.map(item => [String(item.id), item]));
    (rows || []).forEach(row => {
      const remote = row.data && typeof row.data === 'object' ? row.data : null;
      if (!remote) return;
      const local = merged.get(String(remote.id));
      if (!local || Date.parse(remote.updatedAt || row.updated_at || 0) >= Date.parse(local.updatedAt || 0)) merged.set(String(remote.id), remote);
    });
    receivingInspections = Array.from(merged.values()).sort((a,b) => (Date.parse(b.inspectedAt || b.entryDate || b.createdAt || '') || 0) - (Date.parse(a.inspectedAt || a.entryDate || a.createdAt || '') || 0));
    saveLocalBackup();
    if (canSafelyAutoRender(['formularios','materiais','notas-entrada','movimentacoes-materiais'])) render();
  } catch (error) {
    console.warn('Sincronização dos checklists de recebimento indisponível; mantendo os dados locais:', error);
  }
}

async function persistReceivingInspection(record) {
  record.updatedAt = new Date().toISOString();
  saveLocalBackup();
  try {
    await supabaseRestRequest('receiving_inspections?on_conflict=id', {
      method: 'POST',
      headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
      body: JSON.stringify({ id: String(record.id), number: record.number, data: record, updated_at: record.updatedAt })
    });
    return true;
  } catch (error) {
    console.warn('Checklist de recebimento salvo somente neste aparelho:', error);
    return false;
  }
}

async function deletePackingSlipRecord(id) {
  const slip = packingSlips.find(item => String(item.id) === String(id));
  if (!slip) return toast('Documento de saída não encontrado.', true);
  if (!confirm(`Excluir permanentemente o documento ${slip.number} (${slip.recordType === 'output' ? 'Saída' : 'Romaneio'})?\nIsso removerá a baixa do estoque.`)) return;

  packingSlips = packingSlips.filter(item => String(item.id) !== String(id));
  saveLocalBackup();
  closeModal();
  render();

  try {
    await supabaseRestRequest(`packing_slips?id=eq.${encodeURIComponent(id)}`, { method: 'DELETE' });
    toast(`Documento ${slip.number} excluído com sucesso.`);
  } catch (error) {
    console.warn('Erro ao excluir no Supabase:', error);
    toast(`Documento ${slip.number} excluído deste aparelho.`);
  }
}

async function deleteReceivingInspectionRecord(id) {
  const record = receivingInspections.find(item => String(item.id) === String(id));
  if (!record) return toast('Checklist / entrada não encontrado.', true);
  if (!confirm(`Excluir permanentemente o documento ${record.number} (${record.control || record.equipment || 'Entrada'})?\nIsso estornará as quantidades do estoque.`)) return;

  let attachmentRemoved = true;
  if (record.attachment?.localKey) {
    try {
      await deleteLocalMaterialInvoice(record.attachment.localKey);
    } catch (error) {
      attachmentRemoved = false;
      console.warn('Não foi possível remover o PDF deste aparelho:', error);
    }
  } else if (record.attachment?.path) {
    try {
      const client = await waitForSupabaseClient(8000);
      if (!client) throw new Error('Armazenamento indisponível.');
      const { error } = await client.storage.from(record.attachment.bucket || 'material-invoices').remove([record.attachment.path]);
      if (error) throw error;
    } catch (error) {
      attachmentRemoved = false;
      console.warn('Não foi possível remover o PDF vinculado:', error);
    }
  }

  receivingInspections = receivingInspections.filter(item => String(item.id) !== String(id));
  saveLocalBackup();
  closeModal();
  render();

  try {
    await supabaseRestRequest(`receiving_inspections?id=eq.${encodeURIComponent(id)}`, { method: 'DELETE' });
    toast(attachmentRemoved ? `Documento ${record.number} excluído com sucesso.` : `Documento ${record.number} excluído; o PDF não pôde ser removido do armazenamento.`, !attachmentRemoved);
  } catch (error) {
    console.warn('Erro ao excluir no Supabase:', error);
    toast(`Documento ${record.number} excluído deste aparelho.`);
  }
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

function workforcePersonKey(personOrCompany, name = '') {
  const company = typeof personOrCompany === 'object' ? personOrCompany?.company : personOrCompany;
  const personName = typeof personOrCompany === 'object' ? personOrCompany?.name : name;
  return `${String(company || '').replace(/\s+/g, ' ').trim().toLocaleUpperCase('pt-BR')}|${String(personName || '').replace(/\s+/g, ' ').trim().toLocaleUpperCase('pt-BR')}`;
}

function normalizeWorkforcePeople(people) {
  return (Array.isArray(people) ? people : [])
    .filter(person => person?.company && person?.name)
    .map(person => ({
      ...person,
      id: person.id || crypto.randomUUID(),
      company: String(person.company).replace(/\s+/g, ' ').trim(),
      name: String(person.name).replace(/\s+/g, ' ').trim(),
      auxRole: String(person.auxRole || '').replace(/\s+/g, ' ').trim(),
      role: String(person.role || '').replace(/\s+/g, ' ').trim(),
      status: String(person.status || '').replace(/\s+/g, ' ').trim()
    }))
    .sort((a, b) => safeSort(a?.company, b?.company) || safeSort(a?.name, b?.name));
}

function normalizeWorkforceAttendanceMap(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  const normalized = {};
  Object.entries(value).forEach(([personKey, dates]) => {
    if (!dates || typeof dates !== 'object' || Array.isArray(dates)) return;
    const entries = {};
    Object.entries(dates).forEach(([date, marker]) => {
      const clean = normalizeAttendanceValue(marker);
      if (/^\d{4}-\d{2}-\d{2}$/.test(date) && clean) entries[date] = clean;
    });
    if (Object.keys(entries).length) normalized[personKey] = entries;
  });
  return normalized;
}

function workforceSnapshot() {
  return {
    version: 2,
    updatedAt: workforceControlMeta.updatedAt || new Date().toISOString(),
    meta: workforceMeta,
    people: workforce,
    attendance: workforceAttendance
  };
}

async function persistWorkforceControlRemote() {
  try {
    const snapshot = workforceSnapshot();
    await supabaseRestRequest('app_metadata?on_conflict=key', {
      method: 'POST',
      body: JSON.stringify({ key: 'workforce_control', value: snapshot }),
      headers: { Prefer: 'resolution=merge-duplicates' }
    });
    const remotePeople = workforce.map(person => ({
      id: person.id || crypto.randomUUID(),
      company: person.company || '',
      name: person.name || '',
      role: person.role || '',
      status: person.status || '',
      phone: person.phone || '',
      accessRole: person.accessRole || 'operator',
      pin: person.pin || ''
    }));
    if (remotePeople.length) {
      await supabaseRestRequest('workforce?on_conflict=id', {
        method: 'POST',
        body: JSON.stringify(remotePeople),
        headers: { Prefer: 'resolution=merge-duplicates' }
      }).catch(err => console.warn('O retrato do efetivo foi salvo, mas o cadastro de workforce não foi atualizado:', err));
    }
    return true;
  } catch (error) {
    console.warn('Controle de efetivo salvo somente neste aparelho:', error);
    return false;
  }
}

function scheduleWorkforceRemoteSave(delay = 700) {
  clearTimeout(workforceRemoteSaveTimer);
  workforceRemoteSaveTimer = setTimeout(() => persistWorkforceControlRemote(), delay);
}

async function syncWorkforceFromSupabase() {
  try {
    const [controlRows, peopleRows, metadataRows] = await Promise.all([
      supabaseRestRequest('app_metadata?key=eq.workforce_control&select=value').catch(() => null),
      supabaseRestRequest('workforce?select=*').catch(() => null),
      supabaseRestRequest('app_metadata?key=eq.workforce_meta&select=value').catch(() => null)
    ]);
    const remoteSnapshot = Array.isArray(controlRows) && controlRows[0]?.value?.version >= 2 ? controlRows[0].value : null;
    if (remoteSnapshot) {
      const remoteTime = Date.parse(remoteSnapshot.updatedAt || '') || 0;
      const localTime = Date.parse(workforceControlMeta.updatedAt || '') || 0;
      const remoteAttendance = normalizeWorkforceAttendanceMap(remoteSnapshot.attendance);
      const localAttendance = workforceAttendance || {};

      // Combina as marcações remotas e locais de forma inteligente para que nenhuma seja perdida
      const mergedAttendance = { ...remoteAttendance };
      Object.entries(localAttendance).forEach(([personKey, dates]) => {
        if (!mergedAttendance[personKey]) {
          mergedAttendance[personKey] = { ...dates };
        } else {
          if (localTime >= remoteTime) {
            mergedAttendance[personKey] = { ...mergedAttendance[personKey], ...dates };
          } else {
            mergedAttendance[personKey] = { ...dates, ...mergedAttendance[personKey] };
          }
        }
      });

      const remotePeople = normalizeWorkforcePeople(remoteSnapshot.people);
      const mergedPeopleMap = new Map();

      if (!workforce.length || remoteTime >= localTime) {
        workforce.forEach(p => mergedPeopleMap.set(workforcePersonKey(p), p));
        remotePeople.forEach(p => mergedPeopleMap.set(workforcePersonKey(p), { ...mergedPeopleMap.get(workforcePersonKey(p)), ...p }));
        workforce = normalizeWorkforcePeople(Array.from(mergedPeopleMap.values()));
        workforceAttendance = mergedAttendance;
        workforceMeta = remoteSnapshot.meta || workforceMeta;
        workforceControlMeta = { updatedAt: remoteSnapshot.updatedAt || '' };
      } else {
        remotePeople.forEach(p => mergedPeopleMap.set(workforcePersonKey(p), p));
        workforce.forEach(p => mergedPeopleMap.set(workforcePersonKey(p), { ...mergedPeopleMap.get(workforcePersonKey(p)), ...p }));
        workforce = normalizeWorkforcePeople(Array.from(mergedPeopleMap.values()));
        workforceAttendance = mergedAttendance;
        scheduleWorkforceRemoteSave(0);
      }
      saveLocalBackup();
      return true;
    }
    if (Array.isArray(peopleRows) && peopleRows.length) {
      const merged = new Map(workforce.filter(person => person?.name).map(person => [workforcePersonKey(person), person]));
      peopleRows.filter(person => person?.name).forEach(person => {
        const key = workforcePersonKey(person);
        merged.set(key, { ...(merged.get(key) || {}), ...person });
      });
      workforce = normalizeWorkforcePeople(Array.from(merged.values()));
    }
    if (Array.isArray(metadataRows) && metadataRows[0]?.value) {
      workforceMeta = metadataRows[0].value;
    }
    saveLocalBackup();
    return true;
  } catch (error) {
    console.warn('Sincronização do cadastro de funcionários indisponível; mantendo a cópia local:', error);
    return false;
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

function equipmentSyncTimestamp(record) {
  return Date.parse(record?.updatedAt || '') || 0;
}

function pendingEquipmentIdSet() {
  return new Set(pendingFieldEvents
    .map(event => String(event?.equipment?.id || ''))
    .filter(Boolean));
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
      supabaseRestRequest('equipments?select=*'),
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

    try {
      await backfillLocalEquipmentCatalog(currentLocalEquipments, remoteEquipments || []);
    } catch (error) {
      console.warn('Não foi possível recuperar o cadastro local de equipamentos na base compartilhada:', error);
    }

    const remoteEquipmentMap = new Map((remoteEquipments || []).map(item => [
      String(item.code || item.id || '').toUpperCase(),
      item
    ]));
    const localEquipmentMap = new Map(currentLocalEquipments.map(item => [String(item.code || item.id || '').toUpperCase(), item]));
    const pendingEquipmentIds = pendingEquipmentIdSet();
    const recoverableLocalKeys = new Set(currentLocalEquipments
      .filter(localEquipment => {
        const key = String(localEquipment.code || localEquipment.id || '').toUpperCase();
        const remoteEquipment = remoteEquipmentMap.get(key);
        return pendingEquipmentIds.has(String(localEquipment.id))
          || equipmentSyncTimestamp(localEquipment) > equipmentSyncTimestamp(remoteEquipment);
      })
      .map(localEquipment => String(localEquipment.code || localEquipment.id || '').toUpperCase()));
    let equipmentKeys;
    if (Array.isArray(remoteEquipments)) {
      equipmentKeys = new Set([...remoteEquipmentMap.keys(), ...recoverableLocalKeys]);
    } else {
      equipmentKeys = new Set([...localEquipmentMap.keys()]);
    }
    const localRecordsToRecover = [];
    equipments = Array.from(equipmentKeys).map(key => {
      const localEquipment = localEquipmentMap.get(key);
      const remoteEquipment = remoteEquipmentMap.get(key);
      const hasPendingEvent = localEquipment && pendingEquipmentIds.has(String(localEquipment.id));
      const localIsNewer = localEquipment
        && equipmentSyncTimestamp(localEquipment) > equipmentSyncTimestamp(remoteEquipment);
      const localWins = hasPendingEvent || localIsNewer;
      const merged = mergeEquipmentSnapshots(localEquipment, remoteEquipment, localWins);
      if (localWins && merged) localRecordsToRecover.push(merged);
      return merged;
    }).filter(Boolean);

    const stateChanged = JSON.stringify({ equipments, history }) !== stateBeforeSync;
    if (stateChanged) saveLocalBackup();
    // Recupera automaticamente importações mais novas que ficaram somente
    // neste aparelho por falhas de sincronização em versões anteriores.
    if (pushAfter && localRecordsToRecover.length) {
      await persistEquipmentRecords(localRecordsToRecover);
    }
    const saveResult = pushAfter && pendingFieldEvents.length > 0
      ? await save()
      : { local: true, remote: true };
    // Nunca substitui um formulário que a pessoa já está preenchendo no celular ou na tela.
    if (renderAfter && stateChanged && canSafelyAutoRender(['dashboard', 'equipamentos', 'relatorios', 'formularios'])) render();
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
  packingSlips = [];
  receivingInspections = [];

  // A cópia deste aparelho aparece imediatamente, sem aguardar nenhuma rede.
  loadLocalStorageBackup();
  hydrateIcons();
  render();

  // Complementos e sincronização rodam em segundo plano e nunca zeram a tela.
  workforceReadyPromise = loadSeedWorkforce().then(async () => {
    loadLocalStorageBackup();
    await syncWorkforceFromSupabase();
    if (canSafelyAutoRender(['dashboard', 'equipamentos', 'empresas'])) render();
  });
  setTimeout(() => syncFromSupabase(), 0);
  setTimeout(() => syncPackingSlipsFromSupabase(), 100);
  setTimeout(() => syncReceivingInspectionsFromSupabase(), 200);
  if (typeof syncRadiosFromSupabase === 'function') setTimeout(() => syncRadiosFromSupabase(), 250);
  setTimeout(() => syncUserApprovalsFromSupabase(), 300);
  setInterval(() => syncUserApprovalsFromSupabase(), 15000);
  setInterval(() => {
    syncWorkforceFromSupabase().then(updated => {
      if (updated && currentPage === 'empresas' && canSafelyAutoRender(['empresas'])) renderCompanies();
    });
  }, 15000);
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
  const form = companySelect.closest('form');
  const responsible = form ? form.querySelector('select[name="responsible"]') : null;
  const currentVal = responsible ? responsible.value : '';
  if(responsible) {
    responsible.innerHTML = responsibleOptions(companySelect.value, currentVal);
    if (currentVal && [...responsible.options].some(opt => opt.value === currentVal)) {
      responsible.value = currentVal;
    }
  }
}
function handleInspectionPersonChange(responsibleSelect) {
  const personName = responsibleSelect ? responsibleSelect.value : '';
  if (!personName) return;
  const form = responsibleSelect.closest('form');
  const companySelect = form ? form.querySelector('select[name="company"]') : null;
  
  const people = typeof workforce !== 'undefined' && Array.isArray(workforce) ? workforce : [];
  const person = people.find(p => (p.name || '').trim().toLowerCase() === personName.trim().toLowerCase());
  
  if (person && person.company && companySelect) {
    const targetComp = person.company.trim();
    let optionFound = [...companySelect.options].find(opt => opt.value.trim().toLowerCase() === targetComp.toLowerCase());
    if (!optionFound) {
      const opt = new Option(targetComp, targetComp, true, true);
      companySelect.add(opt);
      companySelect.value = targetComp;
    } else {
      companySelect.value = optionFound.value;
    }
    updateResponsibleOptions(companySelect);
    responsibleSelect.value = person.name;
  }
  fillPersonPhone(responsibleSelect);
}
function fillPersonPhone(responsibleSelect) {
  const form=responsibleSelect.closest('form'); const company=form.querySelector('[name="company"]')?.value; const person=workforce.find(item=>item.name===responsibleSelect.value && (!company || item.company===company)); const phone=form.querySelector('[name="phone"]'); if(phone&&person?.phone)phone.value=person.phone;
}
function esc(value = '') {
  return String(value).replace(/[&<>'"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' }[c]));
}
function icon(name) { return icons[name] || ''; }
function hydrateIcons(root = document) {
  root.querySelectorAll('[data-icon]').forEach(el => { el.innerHTML = icon(el.dataset.icon); });
}
function equipmentIcon(eq) { return eq.type.includes('Paleteira') ? icon('pallet') : icon('lift'); }
function statusLabel(status) { return ({ available: 'Disponível', 'in-use': 'Em uso', maintenance: 'Indisponível' })[status]; }
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
      <label><span>${isReturn ? 'Nome de quem está devolvendo' : 'Nome do responsável'}</span><select name="responsible" required onchange="handleInspectionPersonChange(this)">${responsibleOptions(preset.company||'',preset.responsible||'')}</select></label>
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
  const signatureInput = document.getElementById('operatorSignInput');
  const currentSign = signatureInput?.value || '';
  const signatureLabel = signatureInput?.dataset.signatureLabel || 'Operador';
  const modalHtml = `
    <div class="signature-modal-backdrop" id="signatureModalBackdrop" onclick="if(event.target===this)closeSignatureModal()">
      <div class="signature-modal-card">
        <header class="signature-modal-head">
          <div>
            <h3>Assinatura — ${esc(signatureLabel)}</h3>
            <p>Desenhe a assinatura ou rubrica com o dedo na área abaixo</p>
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
    const rawHash = location.hash.replace('#','');
    const hash = rawHash.split('?')[0] || 'dashboard';
    const isInviteLanding = rawHash.startsWith('convite') || rawHash.startsWith('invite');
    const isLoginLanding = hash === 'login' || hash === 'acesso';
    const isPublicHome = !currentUser && hash === 'dashboard';
    document.body.classList.toggle('public-access-page', isInviteLanding || isLoginLanding || isPublicHome);
    updateAppShellAccess();

    if (isInviteLanding || isLoginLanding || isPublicHome) {
      const query = rawHash.includes('?') ? rawHash.split('?')[1] : '';
      const params = new URLSearchParams(query);
      currentPage = 'access';
      renderAccessLanding(isInviteLanding ? 'invite' : 'login', params);
      return;
    } else if (hash === 'signup' || hash === 'cadastrar') {
      setTimeout(() => openLoginModal('signup'), 50);
    }

    if (!currentUser && ['dashboard', 'empresas', 'relatorios', 'romaneios', 'formularios', 'materiais', 'notas-entrada', 'movimentacoes-materiais', 'cautelas', 'radios', 'usuarios'].includes(hash) && !hash.startsWith('scan/')) {
      currentPage = 'equipamentos';
      renderEquipments();
    } else if (hash === 'usuarios' && !isAdmin()) {
      toast('Acesso a Usuários & Aprovações é exclusivo de Gestores.', true);
      currentPage = 'dashboard';
      renderDashboard();
    } else if (hash.startsWith('scan/')) {
      currentPage = 'equipamentos';
      renderEquipments();
      const id = hash.split('/')[1];
      setTimeout(() => openScannedEquipment(id), 40);
    } else if (hash === 'pemt-checklists') {
      currentPage = 'equipamentos';
      renderMovements();
    } else {
      currentPage = ['dashboard','equipamentos','romaneios','formularios','empresas','relatorios','materiais','notas-entrada','movimentacoes-materiais','usuarios','cautelas','radios'].includes(hash) ? hash : 'equipamentos';
      const views = {
        dashboard: renderDashboard,
        equipamentos: renderEquipments,
        romaneios: renderPackingSlips,
        formularios: renderFormsHub,
        empresas: renderCompanies,
        relatorios: renderReports,
        cautelas: (typeof renderCautelas === 'function' ? renderCautelas : renderEquipments),
        radios: (typeof renderRadios === 'function' ? renderRadios : renderEquipments),
        materiais: typeof renderMaterials === 'function' ? renderMaterials : renderEquipments,
        'notas-entrada': typeof renderMaterialEntries === 'function' ? renderMaterialEntries : renderEquipments,
        'movimentacoes-materiais': typeof renderMaterialMovements === 'function' ? renderMaterialMovements : renderEquipments,
        usuarios: renderUserManagement
      };
      (views[currentPage] || renderEquipments)();
    }

    const activeNavPage = ['notas-entrada', 'movimentacoes-materiais', 'romaneios', 'cautelas'].includes(currentPage) ? 'materiais' : currentPage;
    document.querySelectorAll('.nav-link').forEach(link => link.classList.toggle('active', link.dataset.page === activeNavPage));
    const navCount = document.getElementById('navEquipmentCount');
    if (navCount) navCount.textContent = equipments.length;
    const packingSlipCount = document.getElementById('navPackingSlipCount');
    if (packingSlipCount) packingSlipCount.textContent = packingSlips.length;
    const matNavCount = document.getElementById('navMaterialCount');
    if (matNavCount && typeof inventorySnapshot === 'function') matNavCount.textContent = inventorySnapshot().length;
    const radioNavCount = document.getElementById('navRadioCount');
    if (radioNavCount && typeof radioAssets !== 'undefined') radioNavCount.textContent = radioAssets.length;
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

let userManagementTab = 'pendentes';
let lastUserSyncTime = 0;

function renderUserManagement() {
  if (!isAdmin()) {
    renderEquipments();
    return;
  }

  // Dispara sincronização em segundo plano se tiverem passado mais de 3 segundos desde a última
  if (Date.now() - lastUserSyncTime > 3000) {
    lastUserSyncTime = Date.now();
    syncUserApprovalsFromSupabase();
  }

  const pendingList = userApprovals.filter(u => u.status === 'pending');
  const approvedList = userApprovals.filter(u => u.status === 'approved' || u.status === 'active');
  const managersCount = userApprovals.filter(u => u.status === 'approved' && (u.role === 'admin' || u.role === 'gestor' || u.role === 'manager')).length + 1;
  const invitesCount = userApprovals.filter(u => u.invite_token).length;

  const appEl = document.getElementById('app');
  appEl.innerHTML = `
    ${pageHeader(
      'Gestão de Usuários & Aprovações',
      'Painel do Gestor para autorização de acessos por e-mail, convites diretos por link e controle de funções na obra.',
      'CONTROLE DE ACESSO',
      `<div style="display:flex; gap:8px;">
        <button class="button button-outline compact" onclick="syncUserApprovalsFromSupabase().then(() => toast('Lista de usuários atualizada com sucesso!'))">${icon('refresh')} Sincronizar Dados</button>
        <button class="button button-green compact" onclick="setUserManagementTab('convidar')">${icon('plus')} Enviar Convite por E-mail</button>
      </div>`
    )}

    <section class="metrics-grid">
      ${metric('Usuários Liberados', approvedList.length + 1, 'Com acesso ativo ao app', 'green', 'user', 100)}
      ${metric('Aprovações Pendentes', pendingList.length, 'Aguardando decisão do gestor', pendingList.length > 0 ? 'amber' : 'green', 'clock', pendingList.length > 0 ? 80 : 0)}
      ${metric('Gestores & Admins', managersCount, 'Com permissão administrativa', 'blue', 'shield', 100)}
      ${metric('Convites Enviados', invitesCount, 'Links de cadastro gerados', 'green', 'file', 50)}
    </section>

    <div class="module-tabs">
      <a href="javascript:void(0)" class="${userManagementTab === 'pendentes' ? 'active' : ''}" onclick="setUserManagementTab('pendentes')">${icon('clock')} Solicitações Pendentes <b>${pendingList.length}</b></a>
      <a href="javascript:void(0)" class="${userManagementTab === 'ativos' ? 'active' : ''}" onclick="setUserManagementTab('ativos')">${icon('user')} Usuários Ativos <b>${approvedList.length + 1}</b></a>
      <a href="javascript:void(0)" class="${userManagementTab === 'convidar' ? 'active' : ''}" onclick="setUserManagementTab('convidar')">${icon('plus')} Enviar Convite por E-mail</a>
    </div>

    ${renderUserManagementBody(pendingList, approvedList)}
  `;
}

function setUserManagementTab(tab) {
  userManagementTab = tab;
  renderUserManagement();
}

function renderUserManagementBody(pendingList, approvedList) {
  const uniqueCompanies = [...new Set(workforce.map(p => p?.company).filter(Boolean))].sort(safeSort);
  const uniquePeople = [...new Set(workforce.map(p => p?.name).filter(Boolean))].sort(safeSort);

  if (userManagementTab === 'pendentes') {
    if (pendingList.length === 0) {
      return `
        <div class="empty-state" style="padding:32px 24px; text-align:center; border:1px dashed var(--line); border-radius:12px; background:white;">
          <span style="font-size:32px; display:block; margin-bottom:8px;">✅</span>
          <h3 style="font-size:16px; margin-bottom:4px;">Nenhuma solicitação pendente no momento</h3>
          <p style="color:var(--muted); font-size:13px; margin-bottom:16px;">Todas as solicitações de e-mail e senha enviadas pelos colaboradores foram processadas.</p>
          <div style="margin:0 auto; padding:14px; background:#f7f9f8; border:1px solid var(--line); border-radius:8px; font-size:12px; text-align:left; color:#333; max-width:520px; line-height:1.6;">
            <strong>📌 Como funcionam as aprovações no sistema:</strong><br/>
            • <strong>Convites Enviados por Link/E-mail:</strong> O colaborador entra como <strong>Pré-aprovado</strong> e aparece diretamente na aba <a href="javascript:void(0)" onclick="setUserManagementTab('ativos')" style="color:var(--primary); font-weight:bold;">"Usuários Ativos"</a> assim que cria a senha.<br/>
            • <strong>Cadastro Direto ("Solicitar Cadastro"):</strong> Aparece nesta aba para você Aprovar ou Rejeitar.<br/>
            • <strong>Não vê o cadastro?</strong> Clique no botão <button class="button button-outline compact" style="padding:2px 8px; font-size:11px; margin-left:4px;" onclick="syncUserApprovalsFromSupabase().then(() => toast('Dados sincronizados com o Supabase!'))">🔄 Sincronizar Dados</button> para atualizar.
          </div>
        </div>`;
    }
    return `
      <section class="table-card" style="border:1px solid var(--line); border-radius:12px; background:white; overflow:hidden;">
        <table class="data-table" style="width:100%; border-collapse:collapse; font-size:13px;">
          <thead>
            <tr style="background:#f7f9f8; border-bottom:1px solid var(--line); text-align:left;">
              <th style="padding:12px 16px;">Colaborador</th>
              <th style="padding:12px 16px;">E-mail</th>
              <th style="padding:12px 16px;">Empresa</th>
              <th style="padding:12px 16px;">Função Solicitada</th>
              <th style="padding:12px 16px;">Data</th>
              <th style="padding:12px 16px; text-align:right;">Ações do Gestor</th>
            </tr>
          </thead>
          <tbody>
            ${pendingList.map(u => `
              <tr style="border-bottom:1px solid var(--line);">
                <td style="padding:14px 16px;"><strong>${esc(u.name)}</strong></td>
                <td style="padding:14px 16px; color:var(--muted);">${esc(u.email)}</td>
                <td style="padding:14px 16px;">${esc(u.company || '—')}</td>
                <td style="padding:14px 16px;">
                  <select onchange="updatePendingUserRole('${esc(u.id)}', this.value)" style="padding:4px 8px; border-radius:6px; border:1px solid var(--line); font-size:12px;">
                    <option value="operador" ${u.role === 'operador' ? 'selected' : ''}>Operador de Campo</option>
                    <option value="engenheiro" ${u.role === 'engenheiro' ? 'selected' : ''}>Engenheiro</option>
                    <option value="gestor" ${u.role === 'gestor' || u.role === 'admin' ? 'selected' : ''}>Gestor de Obra</option>
                  </select>
                </td>
                <td style="padding:14px 16px; color:var(--muted); font-size:12px;">${fullDate(u.created_at)}</td>
                <td style="padding:14px 16px; text-align:right;">
                  <button class="button button-green compact" onclick="approveUserAccess('${esc(u.id)}')">${icon('check')} Aprovar Acesso</button>
                  <button class="button button-outline compact" style="color:var(--red);" onclick="rejectUserAccess('${esc(u.id)}')">${icon('close')} Rejeitar</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </section>`;
  }

  if (userManagementTab === 'ativos') {
    return `
      <section class="table-card" style="border:1px solid var(--line); border-radius:12px; background:white; overflow:hidden;">
        <table class="data-table" style="width:100%; border-collapse:collapse; font-size:13px;">
          <thead>
            <tr style="background:#f7f9f8; border-bottom:1px solid var(--line); text-align:left;">
              <th style="padding:12px 16px;">Nome</th>
              <th style="padding:12px 16px;">E-mail</th>
              <th style="padding:12px 16px;">Empresa</th>
              <th style="padding:12px 16px;">Nível de Acesso</th>
              <th style="padding:12px 16px;">Aprovado Em</th>
              <th style="padding:12px 16px; text-align:right;">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom:1px solid var(--line); background:#fdfdfd;">
              <td style="padding:14px 16px;"><strong>Pedro Alves</strong> <span class="badge" style="background:#e7f5ee; color:#206b49; font-size:10px; padding:2px 6px; border-radius:6px; margin-left:6px;">Master</span></td>
              <td style="padding:14px 16px; color:var(--muted);">pedro.alves@heatingcooling.com.br</td>
              <td style="padding:14px 16px;">Heating Cooling</td>
              <td style="padding:14px 16px;"><strong>Administrador Master</strong></td>
              <td style="padding:14px 16px; color:var(--muted); font-size:12px;">Sistema Base</td>
              <td style="padding:14px 16px; text-align:right; color:var(--muted); font-size:12px;">Conta Principal</td>
            </tr>
            ${approvedList.map(u => `
              <tr style="border-bottom:1px solid var(--line);">
                <td style="padding:14px 16px;"><strong>${esc(u.name)}</strong></td>
                <td style="padding:14px 16px; color:var(--muted);">${esc(u.email)}</td>
                <td style="padding:14px 16px;">${esc(u.company || '—')}</td>
                <td style="padding:14px 16px;">
                  <span class="badge" style="background:${u.role==='gestor'||u.role==='admin'?'#e7f5ee':'#eaf3fb'}; color:${u.role==='gestor'||u.role==='admin'?'#206b49':'#3977b9'}; padding:3px 8px; border-radius:6px; font-weight:700; font-size:11px;">
                    ${u.role === 'gestor' || u.role === 'admin' ? 'Gestor de Obra' : u.role === 'engenheiro' ? 'Engenheiro' : 'Operador'}
                  </span>
                </td>
                <td style="padding:14px 16px; color:var(--muted); font-size:12px;">${fullDate(u.approved_at || u.created_at)}</td>
                <td style="padding:14px 16px; text-align:right;">
                  <button class="button button-outline compact" style="margin-right:6px;" onclick="copyUserAccessLink('${esc(u.id)}')">${icon('clipboard')} Copiar Convite/Acesso</button>
                  <button class="button button-outline compact" style="color:var(--red);" onclick="revokeUserAccess('${esc(u.id)}')">${icon('close')} Revogar</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </section>`;
  }

  if (userManagementTab === 'convidar') {
    return `
      <div style="max-width:640px; margin:0 auto; background:white; padding:28px; border:1px solid var(--line); border-radius:14px; box-shadow:var(--shadow);">
        <h3 style="margin-bottom:6px; font-size:18px;">Enviar Convite Direto por E-mail / Link</h3>
        <p style="color:var(--muted); font-size:13px; margin-bottom:20px;">Gere um link pré-aprovado para enviar via E-mail ou WhatsApp. Ao clicar, o colaborador define a senha e entra imediatamente.</p>
        
        <form id="userInviteForm" onsubmit="generateInviteLink(event)">
          <div class="field full" style="margin-bottom:14px;">
            <label style="display:block; font-weight:700; margin-bottom:4px;">E-mail do Colaborador (opcional se enviar via link)</label>
            <input type="email" name="email" value="${esc(inviteDraft.email || '')}" oninput="inviteDraft.email=this.value" placeholder="Deixe em branco para preenchimento pelo usuário" style="width:100%; padding:10px; border:1px solid var(--line); border-radius:8px;" />
          </div>
          <div class="field full" style="margin-bottom:14px;">
            <label style="display:block; font-weight:700; margin-bottom:4px;">Nome do Colaborador (opcional)</label>
            <input type="text" name="name" value="${esc(inviteDraft.name || '')}" list="invitePeopleList" placeholder="Ex: Carlos Eduardo" style="width:100%; padding:10px; border:1px solid var(--line); border-radius:8px;" oninput="inviteDraft.name=this.value; handleInvitePersonChange(this)" onchange="inviteDraft.name=this.value; handleInvitePersonChange(this)" />
            <datalist id="invitePeopleList">
              ${uniquePeople.map(p => `<option value="${esc(p)}"></option>`).join('')}
            </datalist>
          </div>
          <div class="field full" style="margin-bottom:14px;">
            <label style="display:block; font-weight:700; margin-bottom:4px;">Empresa / Subempreiteira</label>
            <select name="company" onchange="inviteDraft.company=this.value" style="width:100%; padding:10px; border:1px solid var(--line); border-radius:8px;">
              <option value="">Selecione ou deixe em branco...</option>
              ${uniqueCompanies.map(c => `<option value="${esc(c)}" ${(inviteDraft.company||'')===c ? 'selected' : ''}>${esc(c)}</option>`).join('')}
            </select>
          </div>
          <div class="field full" style="margin-bottom:14px;">
            <label style="display:block; font-weight:700; margin-bottom:4px;">Nível de Acesso Autorizado <em>*</em></label>
            <select name="role" onchange="inviteDraft.role=this.value" style="width:100%; padding:10px; border:1px solid var(--line); border-radius:8px;">
              <option value="operador" ${(inviteDraft.role||'operador')==='operador' ? 'selected' : ''}>Operador de Campo / Técnico</option>
              <option value="engenheiro" ${(inviteDraft.role||'')==='engenheiro' ? 'selected' : ''}>Engenheiro / Fiscal de Obra</option>
              <option value="gestor" ${(inviteDraft.role||'')==='gestor' ? 'selected' : ''}>Gestor de Obra (Acesso Total)</option>
            </select>
          </div>
          <div class="field full" style="margin-bottom:18px;">
            <label style="display:block; font-weight:700; margin-bottom:4px;">Definir Senha (Opcional)</label>
            <input type="text" name="password" value="${esc(inviteDraft.password || '')}" oninput="inviteDraft.password=this.value" placeholder="Se preenchida, o usuário não precisará criar senha" style="width:100%; padding:10px; border:1px solid var(--line); border-radius:8px;" />
          </div>
          <button type="submit" class="button button-green" style="width:100%; justify-content:center;">${icon('shield')} Gerar e Enviar Link de Convite</button>
        </form>

        <div id="inviteResultContainer" style="margin-top:20px; display:none;"></div>
      </div>`;
  }
}

function handleInvitePersonChange(input) {
  const nameVal = (input?.value || '').trim();
  if (typeof inviteDraft !== 'undefined') inviteDraft.name = nameVal;
  if (!nameVal) return;
  const form = input.closest('form');
  const companySelect = form?.querySelector('select[name="company"]');
  if (!companySelect) return;

  const people = typeof workforce !== 'undefined' && Array.isArray(workforce) ? workforce : [];
  const person = people.find(p => (p.name || '').trim().toLowerCase() === nameVal.toLowerCase());
  if (person && person.company) {
    const targetComp = person.company.trim();
    let optionFound = [...companySelect.options].find(opt => opt.value.trim().toLowerCase() === targetComp.toLowerCase());
    if (!optionFound) {
      const opt = new Option(targetComp, targetComp, true, true);
      companySelect.add(opt);
      companySelect.value = targetComp;
    } else {
      companySelect.value = optionFound.value;
    }
    if (typeof inviteDraft !== 'undefined') inviteDraft.company = targetComp;
  }
}

async function approveUserAccess(id) {
  const user = userApprovals.find(u => u.id === id);
  if (user) {
    user.status = 'approved';
    user.approved_at = new Date().toISOString();
    user.approved_by = currentUser?.name || 'Gestor Master';
    user.updated_at = new Date().toISOString();
    localStorage.setItem('obraflow_user_approvals', JSON.stringify(userApprovals));
    await saveUserApprovalToSupabase(user);
    toast(`Acesso de ${user.name} APROVADO com sucesso!`);
    updateAppShellAccess();
    renderUserManagement();
  }
}

async function rejectUserAccess(id) {
  const user = userApprovals.find(u => u.id === id);
  if (user) {
    user.status = 'rejected';
    user.updated_at = new Date().toISOString();
    localStorage.setItem('obraflow_user_approvals', JSON.stringify(userApprovals));
    await saveUserApprovalToSupabase(user);
    toast(`Solicitação de ${user.name} foi RECUSADA.`);
    updateAppShellAccess();
    renderUserManagement();
  }
}

async function revokeUserAccess(id) {
  const user = userApprovals.find(u => u.id === id);
  if (user) {
    user.status = 'rejected';
    user.updated_at = new Date().toISOString();
    localStorage.setItem('obraflow_user_approvals', JSON.stringify(userApprovals));
    await saveUserApprovalToSupabase(user);
    toast(`Acesso de ${user.name} revogado.`);
    updateAppShellAccess();
    renderUserManagement();
  }
}

function updatePendingUserRole(id, newRole) {
  const user = userApprovals.find(u => u.id === id);
  if (user) {
    user.role = newRole;
    user.updated_at = new Date().toISOString();
    localStorage.setItem('obraflow_user_approvals', JSON.stringify(userApprovals));
    saveUserApprovalToSupabase(user);
  }
}

function copyTextToClipboard(text, successMsg = 'Copiado para a área de transferência!') {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      toast(successMsg);
    }).catch(() => {
      fallbackCopyText(text, successMsg);
    });
  } else {
    fallbackCopyText(text, successMsg);
  }
}

function fallbackCopyText(text, successMsg) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.focus();
  ta.select();
  try {
    document.execCommand('copy');
    toast(successMsg);
  } catch (e) {
    toast('Não foi possível copiar automaticamente.');
  }
  document.body.removeChild(ta);
}

function showInviteSuccessModal(opts) {
  const { name, email, role, password, token, inviteUrl, fullMsg } = opts;
  const roleLabel = role === 'gestor' || role === 'admin' ? 'Gestor de Obra' : role === 'engenheiro' ? 'Engenheiro' : 'Operador de Campo';
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(fullMsg)}`;
  const mailtoUrl = email ? `mailto:${email}?subject=${encodeURIComponent('Acesso ObraFlow DataCenter')}&body=${encodeURIComponent(fullMsg)}` : '';

  const modalHtml = `
    ${modalHead('✅ Convite e Dados de Acesso', 'Copie o link ou as credenciais completas para enviar ao colaborador.')}
    <div class="modal-body" style="display:grid; gap:16px;">
      <div style="background:#e7f5ee; border:1px solid #72cda1; padding:14px; border-radius:10px;">
        <strong style="color:#206b49; font-size:14px; display:block; margin-bottom:4px;">Acesso Gerado com Sucesso!</strong>
        <p style="margin:0; font-size:12px; color:#2c3c35; line-height:1.5;">
          ${name ? `Colaborador: <strong>${esc(name)}</strong><br/>` : ''}
          ${email ? `E-mail: <strong>${esc(email)}</strong><br/>` : 'E-mail: <em>(Preenchimento pelo usuário no link)</em><br/>'}
          Nível de Acesso: <strong>${esc(roleLabel)}</strong>
        </p>
      </div>

      ${password ? `
        <div style="background:#f8f9fa; border:1px solid var(--line); padding:12px; border-radius:8px; font-size:13px;">
          <strong style="color:var(--ink);">🔑 Credenciais Cadastradas:</strong>
          <div style="margin-top:6px; font-family:monospace; background:white; padding:10px; border-radius:6px; border:1px solid var(--line);">
            E-mail: <strong>${esc(email)}</strong><br/>
            Senha: <strong>${esc(password)}</strong>
          </div>
        </div>
      ` : ''}

      <div>
        <label style="display:block; font-weight:700; font-size:12px; margin-bottom:6px;">Link Direto de Acesso / Convite:</label>
        <div style="display:flex; gap:8px;">
          <input type="text" readonly value="${esc(inviteUrl)}" style="flex:1; padding:10px; border:1px solid var(--line); border-radius:8px; font-size:12px; background:#f9f9f9;" onclick="this.select()" />
          <button type="button" class="button button-green compact" onclick="copyTextToClipboard('${esc(inviteUrl)}', 'Link copiado para a área de transferência!')">
            ${icon('clipboard')} Copiar Link
          </button>
        </div>
      </div>

      <div style="background:#f0f7f3; border:1px solid #bce1cb; padding:12px; border-radius:8px;">
        <strong style="display:block; font-size:12px; color:#0d4225; margin-bottom:6px;">💬 Mensagem Pronta para Envio:</strong>
        <textarea readonly style="width:100%; height:90px; padding:8px; font-size:12px; border:1px solid #bce1cb; border-radius:6px; background:white; resize:none;" onclick="this.select()">${esc(fullMsg)}</textarea>
        <div style="display:flex; gap:8px; margin-top:10px; flex-wrap:wrap;">
          <button type="button" class="button button-green compact" onclick="copyTextToClipboard('${esc(fullMsg)}', 'Dados e mensagem de acesso copiados!')">
            ${icon('clipboard')} Copiar Mensagem Completa
          </button>
          <a href="${whatsappUrl}" target="_blank" class="button button-outline compact" style="color:#1b5e20; text-decoration:none;">
            Enviar via WhatsApp
          </a>
          ${mailtoUrl ? `<a href="${mailtoUrl}" target="_blank" class="button button-outline compact" style="text-decoration:none;">
            Enviar por E-mail
          </a>` : ''}
        </div>
      </div>
    </div>
    <div class="modal-foot">
      <button type="button" class="button button-outline" onclick="closeModal()">Fechar</button>
    </div>
  `;

  modal(modalHtml, 'modal-medium');
}

function copyUserAccessLink(id) {
  const u = userApprovals.find(item => item.id === id);
  if (!u) return;
  const baseUrl = `${window.location.origin}${window.location.pathname}`;
  let inviteUrl = '';
  let fullMsg = '';

  if (u.invite_token && u.status !== 'active' && !u.password) {
    inviteUrl = `${baseUrl}#convite?email=${encodeURIComponent(u.email || '')}&company=${encodeURIComponent(u.company || '')}&name=${encodeURIComponent(u.name || '')}&role=${encodeURIComponent(u.role || '')}&token=${encodeURIComponent(u.invite_token)}`;
    fullMsg = `Olá ${u.name || 'colaborador'}!\nVocê foi convidado para acessar o ObraFlow DataCenter.\n\nClique no link abaixo para criar sua senha:\n${inviteUrl}\n\n(Código do Convite: ${u.invite_token})`;
  } else if (u.password) {
    inviteUrl = `${baseUrl}#login?email=${encodeURIComponent(u.email || '')}&name=${encodeURIComponent(u.name || '')}&company=${encodeURIComponent(u.company || '')}`;
    fullMsg = `Olá ${u.name || 'colaborador'}!\nSeu acesso ao ObraFlow DataCenter está liberado!\n\nE-mail: ${u.email}\nSenha: ${u.password}\n\nClique para acessar:\n${inviteUrl}`;
  } else {
    inviteUrl = `${baseUrl}#login?email=${encodeURIComponent(u.email || '')}&name=${encodeURIComponent(u.name || '')}&company=${encodeURIComponent(u.company || '')}`;
    fullMsg = `Olá ${u.name || 'colaborador'}!\nSeu acesso ao ObraFlow DataCenter está liberado.\n\nE-mail: ${u.email}\n\nLink para entrar:\n${inviteUrl}`;
  }

  showInviteSuccessModal({
    name: u.name,
    email: u.email,
    role: u.role,
    password: u.password,
    token: u.invite_token,
    inviteUrl: inviteUrl,
    fullMsg: fullMsg
  });
}

async function generateInviteLink(event) {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(event.target));
  let email = (data.email || '').toLowerCase().trim();
  const name = (data.name || (email ? email.split('@')[0] : '')).trim();
  let company = (data.company || '').trim();
  if (!company && name) {
    const people = typeof workforce !== 'undefined' && Array.isArray(workforce) ? workforce : [];
    const person = people.find(p => (p.name || '').trim().toLowerCase() === name.toLowerCase());
    if (person && person.company) company = person.company.trim();
  }
  const role = data.role || 'gestor';
  const password = data.password ? String(data.password).trim() : '';
  const token = 'INV-' + Math.random().toString(36).substring(2, 8).toUpperCase();

  const syntheticEmail = email || `convite_${token.toLowerCase()}@obraflow.link`;

  let match = email ? userApprovals.find(u => u.email && u.email.toLowerCase() === email) : null;
  if (!match) {
    match = {
      id: crypto.randomUUID ? crypto.randomUUID() : 'usr_' + Date.now(),
      email: syntheticEmail,
      name: name || (email ? email.split('@')[0] : 'Colaborador Convidado'),
      company: company,
      role: role,
      status: 'approved',
      invite_token: token,
      password: password || undefined,
      invited_by: currentUser?.name || 'Gestor Master',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    userApprovals.unshift(match);
  } else {
    match.invite_token = token;
    match.name = name || match.name;
    match.role = role;
    match.company = company || match.company;
    match.status = 'approved';
    if (password) {
      match.password = password;
    }
    match.updated_at = new Date().toISOString();
  }

  localStorage.setItem('obraflow_user_approvals', JSON.stringify(userApprovals));
  await saveUserApprovalToSupabase(match);

  const baseUrl = `${window.location.origin}${window.location.pathname}`;
  let inviteUrl = '';
  let fullMsg = '';

  if (password) {
    inviteUrl = `${baseUrl}#login?email=${encodeURIComponent(email || '')}&name=${encodeURIComponent(name || '')}&company=${encodeURIComponent(company || '')}`;
    fullMsg = `Olá ${name || 'colaborador'}!\nSeu acesso ao ObraFlow DataCenter foi criado!\n\nE-mail: ${email}\nSenha: ${password}\n\nClique no link abaixo para entrar:\n${inviteUrl}`;
  } else {
    inviteUrl = `${baseUrl}#convite?email=${encodeURIComponent(email || '')}&company=${encodeURIComponent(company)}&name=${encodeURIComponent(name || '')}&role=${encodeURIComponent(role)}&token=${encodeURIComponent(token)}`;
    fullMsg = `Olá ${name || 'colaborador'}!\nVocê foi convidado para acessar o ObraFlow DataCenter.\n\nClique no link para criar sua senha e entrar:\n${inviteUrl}\n\n(Código do Convite: ${token})`;
  }

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(fullMsg)}`;
  const mailtoUrl = email ? `mailto:${email}?subject=${encodeURIComponent('Convite / Acesso ObraFlow DataCenter')}&body=${encodeURIComponent(fullMsg)}` : '';

  const resContainer = document.getElementById('inviteResultContainer');
  if (resContainer) {
    resContainer.style.display = 'block';
    resContainer.innerHTML = `
      <div style="padding:18px; background:#e7f5ee; border:1px solid #72cda1; border-radius:12px; margin-top:16px;">
        <strong style="color:#206b49; display:block; font-size:15px; margin-bottom:6px;">✅ Link e Acesso Gerados com Sucesso!</strong>
        <p style="font-size:13px; margin-bottom:12px; color:#2c3c35;">
          ${email ? `Usuário: <strong>${esc(email)}</strong> | Nível: <strong>${esc(role)}</strong>` : `Link pré-aprovado gerado com sucesso para o nível <strong>${esc(role)}</strong>.`}
        </p>

        ${password ? `
          <div style="background:#fff; padding:10px 12px; border-radius:8px; border:1px solid #b3dfca; margin-bottom:12px; font-size:13px;">
            <strong>Acesso Cadastrado:</strong><br/>
            E-mail: <code>${esc(email)}</code><br/>
            Senha: <code>${esc(password)}</code>
          </div>
        ` : ''}

        <label style="display:block; font-weight:700; font-size:11px; margin-bottom:4px; color:#206b49;">LINK DIRETO DE ACESSO:</label>
        <div style="display:flex; gap:8px; margin-bottom:12px;">
          <input id="inviteUrlInput" type="text" readonly value="${esc(inviteUrl)}" style="flex:1; padding:8px 10px; border:1px solid #b3dfca; border-radius:6px; font-size:12px; background:white;" onclick="this.select()" />
          <button type="button" class="button button-green compact" onclick="copyTextToClipboard('${esc(inviteUrl)}', 'Link copiado para a área de transferência!')">
            ${icon('clipboard')} Copiar Link
          </button>
        </div>

        <div style="display:flex; gap:8px; flex-wrap:wrap;">
          <button type="button" class="button button-green compact" onclick="copyTextToClipboard('${esc(fullMsg)}', 'Dados e mensagem copiados!')">
            ${icon('clipboard')} Copiar Mensagem Completa
          </button>
          <a href="${whatsappUrl}" target="_blank" class="button button-outline compact" style="color:#1b5e20; text-decoration:none;">
            Enviar via WhatsApp
          </a>
          ${mailtoUrl ? `<a href="${mailtoUrl}" target="_blank" class="button button-outline compact" style="text-decoration:none;">
            Enviar por E-mail
          </a>` : ''}
        </div>
      </div>
    `;
    resContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  showInviteSuccessModal({
    name: name,
    email: email,
    role: role,
    password: password,
    token: token,
    inviteUrl: inviteUrl,
    fullMsg: fullMsg
  });

  inviteDraft = { email: '', name: '', company: '', role: 'operador', password: '' };
  toast('Convite e link gerados com sucesso!');
}

function getEquipmentHeightBreakdown() {
  const breakdown = {};
  equipments.forEach(eq => {
    let label = 'Outras / Paleteiras';
    const text = `${eq.name || ''} ${eq.model || ''} ${eq.type || ''}`;
    const match = text.match(/(\d+)\s*m\b/i);
    if (match) {
      const h = parseInt(match[1], 10);
      label = `${h} Metros`;
    }
    if (!breakdown[label]) {
      breakdown[label] = { total: 0, available: 0, inUse: 0, maintenance: 0 };
    }
    breakdown[label].total++;
    if (eq.status === 'available') breakdown[label].available++;
    else if (eq.status === 'in-use') breakdown[label].inUse++;
    else breakdown[label].maintenance++;
  });
  return breakdown;
}

function renderDashboard() {
  const availablePtas = equipments.filter(e => e.status === 'available').length;
  const inUsePtas = equipments.filter(e => e.status === 'in-use').length;
  const maintenancePtas = equipments.filter(e => e.status === 'maintenance').length;

  const totalRadios = typeof radioAssets !== 'undefined' ? radioAssets.length : 0;
  const availableRadios = typeof radioAssets !== 'undefined' ? radioAssets.filter(item => item.status !== 'in-use' && item.status !== 'maintenance').length : 0;
  const inUseRadios = typeof radioAssets !== 'undefined' ? radioAssets.filter(item => item.status === 'in-use').length : 0;
  const maintenanceRadios = typeof radioAssets !== 'undefined' ? radioAssets.filter(item => item.status === 'maintenance').length : 0;

  const stock = typeof inventorySnapshot === 'function' ? inventorySnapshot() : [];
  const stockedProducts = stock.filter(item => item.balance > 0).length;
  const formsCount = formsHubRecords().length;

  const companies = [...new Set(workforce.map(person => person?.company).filter(Boolean))].sort(safeSort);
  if (!workforceSummaryDate.startsWith(workforceControlMonth)) workforceSummaryDate = `${workforceControlMonth}-01`;
  const presentToday = workforce.filter(person => workforceAttendanceValue(person, workforceSummaryDate) === '1').length;

  const heightBreakdown = getEquipmentHeightBreakdown();

  document.getElementById('app').innerHTML = `
    ${pageHeader('Central da Obra', 'Visão geral e indicadores consolidados de PTAs, Efetivo, Rádios e Almoxarifado.', 'DATACENTER OMNIA · DC01')}
    
    <!-- GRID DE MÉTRICAS PRINCIPAIS (HERO CENTRAL) -->
    <section class="dashboard-central-hero">
      <div class="central-card card-ptas" onclick="location.hash='equipamentos'">
        <div class="central-card-head">
          <span class="icon-wrap">${icon('lift')}</span>
          <div>
            <small>FROTA DE PTAS</small>
            <h2>${equipments.length} <small>PTAs no total</small></h2>
          </div>
        </div>
        <div class="central-card-pills">
          <span class="pill-badge green"><b>${availablePtas}</b> Disponíveis</span>
          <span class="pill-badge amber"><b>${inUsePtas}</b> Em Uso</span>
          <span class="pill-badge red"><b>${maintenancePtas}</b> Indisponíveis</span>
        </div>
      </div>

      <div class="central-card card-radios" onclick="location.hash='radios'">
        <div class="central-card-head">
          <span class="icon-wrap purple">${icon('radio')}</span>
          <div>
            <small>COMUNICAÇÃO</small>
            <h2>${totalRadios} <small>Rádios cadastrados</small></h2>
          </div>
        </div>
        <div class="central-card-pills">
          <span class="pill-badge green"><b>${availableRadios}</b> Disponíveis</span>
          <span class="pill-badge amber"><b>${inUseRadios}</b> Em Uso</span>
          ${maintenanceRadios > 0 ? `<span class="pill-badge red"><b>${maintenanceRadios}</b> Manutenção</span>` : ''}
        </div>
      </div>

      <div class="central-card card-efetivo" onclick="location.hash='empresas'">
        <div class="central-card-head">
          <span class="icon-wrap green">${icon('user')}</span>
          <div>
            <small>EFETIVO & EQUIPE</small>
            <h2>${presentToday} <small>Presentes hoje (de ${workforce.length})</small></h2>
          </div>
        </div>
        <div class="central-card-pills">
          <span class="pill-badge blue"><b>${companies.length}</b> Empresas</span>
          <span class="pill-badge green"><b>${workforce.length}</b> Pessoas</span>
        </div>
      </div>

      <div class="central-card card-materiais" onclick="location.hash='materiais'">
        <div class="central-card-head">
          <span class="icon-wrap orange">${icon('pallet')}</span>
          <div>
            <small>ALMOXARIFADO</small>
            <h2>${stockedProducts} <small>Com saldo</small></h2>
          </div>
        </div>
        <div class="central-card-pills">
          <span class="pill-badge green"><b>${formsCount}</b> Registros</span>
        </div>
      </div>
    </section>

    <!-- SEÇÕES DA CENTRAL: PTAS POR ALTURA & QUADRO DE EFETIVO -->
    <div class="central-sections-grid">
      <!-- PAINEL PTAS POR ALTURA -->
      <section class="panel central-heights-panel">
        <div class="panel-head">
          <div>
            <h2>${icon('lift')} Frota de PTAs por Altura</h2>
            <p>Quantitativo de equipamentos por capacidade (8m, 10m, 14m, etc.)</p>
          </div>
          <button class="button button-outline compact" onclick="location.hash='equipamentos'">Ver PTAs ${icon('arrow')}</button>
        </div>
        <div class="heights-grid">
          ${Object.entries(heightBreakdown).sort((a,b) => a[0].localeCompare(b[0])).map(([heightLabel, stats]) => `
            <div class="height-card">
              <div class="height-card-title">
                <span class="height-tag">${heightLabel}</span>
                <strong>${stats.total} <small>PTAs</small></strong>
              </div>
              <div class="height-card-stats">
                <span class="stat-item green"><i class="dot"></i> <b>${stats.available}</b> disponíve${stats.available === 1 ? 'l' : 'is'}</span>
                <span class="stat-item amber"><i class="dot"></i> <b>${stats.inUse}</b> em uso</span>
                ${stats.maintenance > 0 ? `<span class="stat-item red"><i class="dot"></i> <b>${stats.maintenance}</b> indisponíve${stats.maintenance === 1 ? 'l' : 'is'}</span>` : ''}
              </div>
            </div>
          `).join('')}
        </div>
      </section>

      <!-- PAINEL QUADRO DE EFETIVO -->
      <section class="panel central-quadro-panel">
        <div class="panel-head">
          <div>
            <h2>${icon('building')} Quadro de Efetivo por Empresa</h2>
            <p>Efetivo Diário vs Geral cadastrado por empreiteiro</p>
          </div>
          <button class="button button-outline compact" onclick="location.hash='empresas'">Gerenciar efetivo ${icon('arrow')}</button>
        </div>
        <div class="panel-body" style="padding: 16px;">
          ${renderWorkforceQuadroTableHTML(workforceSummaryDate)}
        </div>
      </section>
    </div>

    <section class="home-footer-card" id="dashboardInstallCard" style="margin-top: 24px;"><div><span>${icon('download')}</span><div><strong>Instalar DataCenter Omnia neste aparelho</strong><small>Crie um atalho com o ícone da Heating Cooling e abra o sistema como aplicativo.</small></div></div><button class="button button-green compact" onclick="installDataCenterApp()">Instalar App ${icon('download')}</button></section>
  `;
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
      <label class="filter-field"><span>Status</span><select id="statusFilter" onchange="filterAssets()"><option value="">Todos</option><option value="available">Disponível</option><option value="in-use">Em uso</option><option value="maintenance">Indisponível</option></select></label>
    </div>
    <article class="panel compact-equipment-panel"><div class="table-wrap"><table class="data-table equipment-control-table"><thead><tr><th>Equipamento</th><th>codigo AFF</th><th>Empreiteiro</th><th>Modelo</th><th>Status</th><th>Em uso por</th><th>Local</th><th>Previsão de devolução</th><th>Checklist</th><th></th></tr></thead><tbody id="equipmentControlBody">${equipments.map(equipmentControlRow).join('')}</tbody></table></div><div class="no-filter-results" id="noFilterResults">Nenhum equipamento encontrado com estes filtros.</div></article>`;
}
function equipmentControlRow(eq) {
  const latest=history.find(item=>item.equipmentId===eq.id&&item.inspection);
  const dates=[eq.emissionDate||'',...history.filter(item=>item.equipmentId===eq.id).map(item=>item.date?.slice(0,10)||'')].join(' ');
  return `<tr class="equipment-control-row" data-status="${eq.status}" data-type="${esc(eq.type)}" data-model="${esc(eq.model||'')}" data-af="${esc(eq.afNumber||'')}" data-dates="${dates}" data-search="${esc(`${eq.name} ${eq.code} ${eq.afNumber||''} ${eq.contractor||''} ${eq.serial||''} ${eq.model||''} ${eq.usage?.responsible||''} ${eq.usage?.company||''} ${eq.usage?.activity||''}`.toLowerCase())}"><td><div class="equipment-identity"><span>${equipmentIcon(eq)}</span><div><strong>${esc(eq.code)}</strong><small>${esc(eq.name)}</small></div></div></td><td>${eq.afNumber ? `<span class="af-badge">${esc(eq.afNumber)}</span>` : '<span class="muted-dash">—</span>'}</td><td><strong>${esc(eq.contractor||'—')}</strong></td><td><strong>${esc(eq.model||'—')}</strong><small class="table-sub">${esc(eq.battery ? `Bateria ${eq.battery}` : eq.brand||'')}</small></td><td>${statusBadge(eq.status)}</td><td>${eq.usage?`<strong>${esc(eq.usage.responsible)}</strong><small class="table-sub">${esc(eq.usage.company)}</small>`:'<span class="muted-dash">—</span>'}</td><td>${eq.usage?`<strong>${esc(eq.usage.dataHall)}</strong><small class="table-sub">${esc(eq.usage.location)}</small><small class="table-sub activity-sub">${esc(eq.usage.activity||'')}</small>`:'<span class="muted-dash">Pátio / Base</span>'}</td><td>${eq.usage?`<strong>${fullDate(eq.usage.expectedAt)}</strong>`:'<span class="muted-dash">—</span>'}</td><td>${latest?`<button class="table-action" onclick="openInspectionRecord('${latest.id}')">${icon('file')} Ver</button>`:'<span class="muted-dash">Sem registro</span>'}</td><td><div class="control-row-actions"><button class="icon-button" title="QR Code" onclick="openQRModal('${eq.id}')">${icon('qr')}</button><button class="icon-button" title="Editar equipamento" onclick="openEquipmentModal('${eq.id}')">${icon('edit')}</button><button class="icon-button danger-icon" style="color:var(--red);" title="Excluir PTA do sistema" onclick="deleteEquipment('${eq.id}')">${icon('trash')}</button><button class="button ${eq.status==='available'?'button-green':'button-outline'} compact" onclick="openEquipmentDetails('${eq.id}')">${eq.status==='available'?'Retirar':'Detalhes'}</button></div></td></tr>`;
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

function openEquipmentImportModalLegacy() {
  modal(`${modalHead('Atualizar PTAs por Excel','Utilize a planilha padrão OMNIA DC01')}<div class="modal-body"><div class="upload-zone" onclick="document.getElementById('equipmentFile').click()"><span>${icon('lift')}</span><div><h3>Selecionar planilha de equipamentos</h3><p>Formatos .xlsx ou .xls · todas as abas serão verificadas</p></div><button type="button" class="button button-outline compact">Escolher arquivo</button><input id="equipmentFile" type="file" accept=".xlsx,.xls" hidden onchange="handleEquipmentUpload(event)"></div><div class="upload-info"><span>${icon('check')}</span><div><strong>${equipments.length} equipamentos cadastrados atualmente</strong><small>${esc(equipmentImportMeta.source||'Nenhuma planilha importada')} ${equipmentImportMeta.updatedAt?`· ${new Intl.DateTimeFormat('pt-BR').format(new Date(equipmentImportMeta.updatedAt))}`:''}</small></div></div><div class="import-columns"><span>NF</span><span>Data emissão</span><span>Código produto</span><span>Descrição</span><span>Patrimônio</span><span>Chassi</span><span>Horímetro</span><span>Unidade</span><span>Bateria</span><span>codigo AFF</span><span>Empreiteiro</span></div><div class="notice">${icon('alert')} A importação atualiza equipamentos pelo número de patrimônio e adiciona os novos. Status, responsável atual, localização e checklists são preservados. Equipamentos ausentes na planilha não são excluídos.</div></div><div class="modal-foot"><button class="button button-outline" onclick="exportEquipmentsExcel()">${icon('download')} Baixar planilha de PTAs atualizada</button><button class="button button-green" onclick="closeModal()">Fechar</button></div>`,'modal-large');
}

function openEquipmentImportModal() {
  modal(`${modalHead('Atualizar PTAs por Excel','Utilize sempre o modelo oficial OMNIA DC01')}<div class="modal-body"><div class="upload-zone" onclick="document.getElementById('equipmentFile').click()"><span>${icon('lift')}</span><div><h3>Selecionar planilha de equipamentos</h3><p>Formatos .xlsx ou .xls · título na linha 1 e cabeçalhos na linha 3</p></div><button type="button" class="button button-outline compact">Escolher arquivo</button><input id="equipmentFile" type="file" accept=".xlsx,.xls" hidden onchange="handleEquipmentUpload(event)"></div><div class="upload-info"><span>${icon('check')}</span><div><strong>${equipments.length} equipamentos cadastrados atualmente</strong><small>${esc(equipmentImportMeta.source||'Nenhuma planilha importada')} ${equipmentImportMeta.updatedAt?`· ${new Intl.DateTimeFormat('pt-BR').format(new Date(equipmentImportMeta.updatedAt))}`:''}</small></div></div><div class="import-columns"><span>NF</span><span>Data Emissão</span><span>Descrição do Equipamento</span><span>Nº Série/Patrimônio</span><span>codigo AFF</span><span>Empreiteiro</span><span>Status</span></div><div class="notice">${icon('alert')} A importação sincroniza a lista oficial: atualiza os existentes, cadastra os novos e remove automaticamente do sistema as PTAs que foram excluídas da planilha.</div></div><div class="modal-foot"><button class="button button-outline" onclick="exportEquipmentsExcel()">${icon('download')} Baixar modelo oficial atualizado</button><button class="button button-green" onclick="closeModal()">Fechar</button></div>`,'modal-large');
}

async function exportEquipmentsExcelLegacy() {
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

async function exportEquipmentsExcel() {
  if(!await ensureExcelLibrary()) return toast('Não foi possível carregar o gerador de Excel. Verifique a internet e tente novamente.',true);

  const selectedEquipments = [...getReportFilteredEquipments()].sort((a,b) =>
    safeSort(a.name || a.model, b.name || b.model) || safeSort(a.code, b.code)
  );
  if(!selectedEquipments.length) return toast('Nenhum equipamento encontrado.',true);

  const formatEmissionDate = value => {
    if(!value) return '';
    const normalized = spreadsheetDate(value);
    return normalized ? normalized.split('-').reverse().join('/') : String(value);
  };
  const sheetData = [
    ['Relação de Equipamentos - Notas Fiscais de Remessa para Locação (Tecnogera)'],
    [],
    ['NF','Data Emissão','Descrição do Equipamento','Nº Série/Patrimônio','codigo AFF','Empreiteiro','Status'],
    ...selectedEquipments.map(eq => [
      eq.invoice || '',
      formatEmissionDate(eq.emissionDate),
      eq.name || eq.model || '',
      eq.code || '',
      eq.afNumber || '',
      eq.contractor || '',
      equipmentSpreadsheetStatus(eq)
    ])
  ];

  const sheet = XLSX.utils.aoa_to_sheet(sheetData);
  sheet['!merges'] = [{ s:{ r:0, c:0 }, e:{ r:0, c:6 } }];
  sheet['!cols'] = [{wch:12},{wch:16},{wch:48},{wch:26},{wch:18},{wch:24},{wch:18}];
  sheet['!rows'] = [{hpt:22},{hpt:8},{hpt:21}];
  sheet['!autofilter'] = { ref:`A3:G${sheetData.length}` };

  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, sheet, 'Equipamentos');
  XLSX.writeFile(book, `controle-ptas-omnia-${new Date().toISOString().slice(0,10)}.xlsx`);
  toast('Planilha de PTAs baixada no modelo oficial.');
}

function spreadsheetDate(value) {
  if(!value)return ''; if(value instanceof Date&&!isNaN(value))return value.toISOString().slice(0,10);
  if(typeof value==='number'){const date=new Date(Math.round((value-25569)*86400*1000));return isNaN(date)?'':date.toISOString().slice(0,10);}
  const text=String(value).trim(); const match=text.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{2,4})$/); if(match){const year=match[3].length===2?`20${match[3]}`:match[3];return `${year}-${match[2].padStart(2,'0')}-${match[1].padStart(2,'0')}`;} return /^\d{4}-\d{2}-\d{2}/.test(text)?text.slice(0,10):'';
}
function normalizeSpreadsheetHeader(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .trim()
    .toLowerCase();
}
function officialEquipmentColumn(header) {
  const value = normalizeSpreadsheetHeader(header);
  if(value === 'nf' || value.includes('nota fiscal')) return 'invoice';
  if(value.includes('data') && value.includes('emissao')) return 'emissionDate';
  if(value.includes('descricao') && value.includes('equipamento')) return 'description';
  if(value.includes('patrimonio') || (value.includes('serie') && !value.includes('descricao'))) return 'code';
  if((value.includes('codigo') && (value.includes('aff') || value.includes('af'))) || value === 'aff' || value === 'af') return 'afNumber';
  if(value.includes('empreiteiro') || value === 'empresa') return 'contractor';
  if(value === 'status' || value === 'situacao') return 'status';
  return '';
}
function spreadsheetEquipmentStatus(value) {
  const status = normalizeSpreadsheetHeader(value);
  if(status.includes('indisponivel') || status.includes('manutencao') || status.includes('bloqueado')) return 'maintenance';
  if(status.includes('em uso') || status === 'uso') return 'in-use';
  return 'available';
}
function equipmentSpreadsheetStatus(equipment) {
  if(equipment?.usage || equipment?.status === 'in-use') return 'EM USO';
  return equipment?.status === 'maintenance' ? 'INDISPONÍVEL' : 'DISPONÍVEL';
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
      let colMap = { invoice:-1, emissionDate:-1, description:-1, code:-1, afNumber:-1, contractor:-1, status:-1, productCode:-1, serial:-1, hourmeter:-1, battery:-1 };
      let headerRowIndex = -1;
      for(let r=0; r<Math.min(15, rows.length); r++) {
        const candidate = {};
        (rows[r] || []).forEach((cellVal, cIdx) => {
          const field = officialEquipmentColumn(cellVal);
          if(field && candidate[field] === undefined) candidate[field] = cIdx;
        });
        const required = ['invoice','emissionDate','description','code','afNumber','contractor','status'];
        if(required.every(field => candidate[field] !== undefined)) {
          colMap = { ...colMap, ...candidate };
          headerRowIndex = r;
          break;
        }
      }
      if(headerRowIndex < 0) return;
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
      rows.slice(headerRowIndex + 1).forEach(row=>{
        const description=String(row[colMap.description]||'').replace(/\s+/g,' ').trim();
        const code=String(row[colMap.code]||'').replace(/\s+/g,'').trim().toUpperCase();
        if(!description||!code||/descrição do equipamento/i.test(description)||/série|patrimônio/i.test(code)||/^total/i.test(description))return;
        const key=code.toUpperCase();
        if(seen.has(key))return;
        seen.add(key);
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
          invoice:String(row[colMap.invoice]||'').trim(),
          emissionDate:spreadsheetDate(row[colMap.emissionDate]),
          afNumber:afVal,
          contractor:contractorVal,
          status:spreadsheetEquipmentStatus(row[colMap.status])
        };
        imported.push(sanitizeEquipment(itemObj));
      });
    });
    if(!imported.length) throw new Error('Planilha sem equipamentos válidos. Use o modelo oficial com os sete cabeçalhos na linha 3, incluindo Status.');
    let added = 0;
    let updated = 0;
    const importedAt = new Date().toISOString();
    const changedEquipments = [];
    
    // Identifica equipamentos que não estão mais na nova planilha e sincroniza
    const importedCodes = new Set(imported.map(item => item.code.toUpperCase()));
    const removedEquipments = equipments.filter(e => !importedCodes.has(e.code.toUpperCase()));
    if (removedEquipments.length > 0) {
      equipments = equipments.filter(e => importedCodes.has(e.code.toUpperCase()));
    }

    imported.forEach(item => {
      const existingIndex = equipments.findIndex(e => e.code.toUpperCase() === item.code.toUpperCase());
      if (existingIndex >= 0) {
        const existing = equipments[existingIndex];
        const preservedUsage = existing.usage || null;

        // Preserve 'in-use' if it was in-use in the app OR specified as 'in-use' in the spreadsheet.
        // Respect 'maintenance' if specified in spreadsheet or app. Otherwise default to 'available'.
        let finalStatus = 'available';
        if (preservedUsage || existing.status === 'in-use' || item.status === 'in-use') {
          finalStatus = 'in-use';
        } else if (item.status === 'maintenance' || existing.status === 'maintenance') {
          finalStatus = 'maintenance';
        }

        let finalUsage = preservedUsage;
        if (finalStatus === 'in-use' && !finalUsage) {
          finalUsage = {
            responsible: item.contractor || 'Em uso (Planilha)',
            company: item.contractor || '',
            activity: 'Em uso via planilha',
            dataHall: '—',
            location: '—',
            expectedAt: '',
            startedAt: new Date().toISOString(),
            phone: ''
          };
        } else if (finalStatus !== 'in-use') {
          finalUsage = null;
        }

        equipments[existingIndex] = {
          ...existing,
          ...item,
          afNumber: item.afNumber || existing.afNumber || '',
          // The imported spreadsheet is authoritative for Empreiteiro. Keep an
          // empty cell empty so stale SIP/A.L.A. values are actually cleared.
          contractor: item.contractor,
          status: finalStatus,
          usage: finalUsage,
          updatedAt: importedAt
        };
        changedEquipments.push(equipments[existingIndex]);
        updated++;
      } else {
        item.id = `pta-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
        let newStatus = 'available';
        if (item.status === 'in-use') {
          newStatus = 'in-use';
        } else if (item.status === 'maintenance') {
          newStatus = 'maintenance';
        }

        item.status = newStatus;
        item.usage = newStatus === 'in-use' ? {
          responsible: item.contractor || 'Em uso (Planilha)',
          company: item.contractor || '',
          activity: 'Em uso via planilha',
          dataHall: '—',
          location: '—',
          expectedAt: '',
          startedAt: new Date().toISOString(),
          phone: ''
        } : null;
        item.updatedAt = importedAt;
        equipments.push(item);
        changedEquipments.push(item);
        added++;
      }
    });

    equipments.sort((a,b)=>safeSort(a.model||a.name, b.model||b.name)||safeSort(a.code, b.code));
    equipmentImportMeta={source:file.name,updatedAt:new Date().toISOString(),total:imported.length};
    saveLocalBackup();
    localDataRevision += 1;
    let shared = true;
    try {
      await persistEquipmentRecords(changedEquipments);
      if (removedEquipments.length > 0) {
        const removedIds = removedEquipments.map(e => e.id);
        const client = getSupabase();
        if (client) {
          await client.from('equipments').delete().in('id', removedIds);
        } else {
          for (const reqId of removedIds) {
            await supabaseRestRequest(`equipments?id=eq.${encodeURIComponent(reqId)}`, { method: 'DELETE' });
          }
        }
      }
      const client = getSupabase();
      if (client) client.from('app_metadata').upsert({key:'equipment_import_meta',value:equipmentImportMeta});
    } catch (error) {
      shared = false;
      console.warn('A planilha foi salva localmente, mas não chegou à base compartilhada:', error);
    }
    closeModal(); renderEquipments();
    const navCount = document.getElementById('navEquipmentCount');
    if (navCount) navCount.textContent = equipments.length;
    const removedMsg = removedEquipments.length > 0 ? `, ${removedEquipments.length} removido(s)` : '';
    toast(shared
      ? `${updated} equipamento(s) atualizado(s), ${added} novo(s)${removedMsg} em todos os aparelhos.`
      : `${updated} equipamento(s) atualizado(s), ${added} novo(s)${removedMsg} salvos somente neste aparelho. Verifique a internet e importe novamente.`,
      !shared);
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
                <td><button class="table-action" onclick="openInspectionRecord('${item.id}')">${icon('download')} PDF / ver</button></td>
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

function packingSlipStatus(status) {
  const labels = { sent: 'Enviado', received: 'Arquivado', divergence: 'Cancelado' };
  const classes = { sent: 'in-use', received: 'available', divergence: 'maintenance' };
  return `<span class="status ${classes[status] || 'in-use'}">${labels[status] || 'Em trânsito'}</span>`;
}

function materialDocumentType(slip) {
  const isSimple = slip?.recordType === 'output';
  return `<span class="document-type ${isSimple ? 'simple' : 'formal'}">${isSimple ? 'Saída simples' : 'Romaneio'}</span>`;
}

function nextPackingSlipNumber() {
  const year = new Date().getFullYear();
  const highest = packingSlips.reduce((max, item) => {
    const match = String(item.number || '').match(/ROM-\d{4}-(\d+)/);
    return Math.max(max, match ? Number(match[1]) : 0);
  }, 0);
  return `ROM-${year}-${String(highest + 1).padStart(4, '0')}`;
}

function nextSimpleOutputNumber() {
  const year = new Date().getFullYear();
  const highest = packingSlips.reduce((max, item) => {
    const match = String(item.number || '').match(/SAI-\d{4}-(\d+)/);
    return Math.max(max, match ? Number(match[1]) : 0);
  }, 0);
  return `SAI-${year}-${String(highest + 1).padStart(4, '0')}`;
}

function packingPeopleOptions() {
  return [...new Map(workforce.filter(person => person?.name).map(person => [person.name, person])).values()]
    .sort((a,b) => safeSort(a.name,b.name))
    .map(person => `<option value="${esc(person.name)}">${esc([person.company, person.role].filter(Boolean).join(' · '))}</option>`)
    .join('');
}

function packingPersonSelect(name, selected = '', label = 'Pessoa') {
  const people = [...new Map(workforce.filter(person => person?.name).map(person => [String(person.name).trim().toLocaleUpperCase('pt-BR'), person])).values()]
    .sort((a,b) => safeSort(a.name,b.name));
  const selectedKey = String(selected || '').trim().toLocaleUpperCase('pt-BR');
  const hasSelected = people.some(person => String(person.name).trim().toLocaleUpperCase('pt-BR') === selectedKey);
  const legacy = selected && !hasSelected ? `<option value="${esc(selected)}" selected>${esc(selected)} — usuário atual</option>` : '';
  return `<div class="field"><label>${esc(label)} <em>*</em></label><select name="${esc(name)}" required><option value="">Selecione na lista...</option>${legacy}${people.map(person => `<option value="${esc(person.name)}" ${String(person.name).trim().toLocaleUpperCase('pt-BR') === selectedKey ? 'selected' : ''}>${esc(person.name)}${person.company ? ` — ${esc(person.company)}` : ''}</option>`).join('')}</select></div>`;
}

let materialOutputReturnPage = '';
function openMaterialActionMenu(type, returnPage = '') {
  materialOutputReturnPage = returnPage;
  const settings = {
    entry: {
      title: 'Nova entrada de materiais', subtitle: 'Escolha como deseja alimentar o estoque', iconName: 'download',
      manualTitle: 'Digitar / lançar por NF', manualText: 'Informe manualmente os materiais recebidos e os dados da nota fiscal.', manualAction: 'openReceivingInvoiceModal()',
      importTitle: 'Importar planilha de entrada', importText: 'Carregue vários materiais de uma vez para aumentar o saldo.', importAction: 'openMaterialSpreadsheetModal()'
    },
    output: {
      title: 'Nova saída simples', subtitle: 'Escolha como deseja informar os materiais retirados', iconName: 'swap',
      manualTitle: 'Preencher manualmente', manualText: 'Selecione ou digite cada material e quantidade da retirada.', manualAction: 'openSimpleOutputModal(false)',
      importTitle: 'Importar planilha de saída', importText: 'Carregue uma planilha com vários materiais e confira antes de baixar o estoque.', importAction: 'openSimpleOutputModal(true)'
    },
    packing_slip: {
      title: 'Novo romaneio', subtitle: 'Escolha como deseja preencher os materiais do documento', iconName: 'truck',
      manualTitle: 'Preencher manualmente', manualText: 'Inclua os materiais um a um e finalize com assinatura e foto.', manualAction: 'openPackingSlipModal(false)',
      importTitle: 'Importar planilha no romaneio', importText: 'Carregue vários materiais e depois complete assinatura, foto e transporte.', importAction: 'openPackingSlipModal(true)'
    }
  }[type];
  if (!settings) return;
  modal(`${modalHead(settings.title, settings.subtitle)}<div class="modal-body"><section class="material-method-grid">
    <button type="button" class="material-method-card" onclick="${settings.manualAction}"><span>${icon('edit')}</span><div><strong>${settings.manualTitle}</strong><small>${settings.manualText}</small></div><b>${icon('arrow')}</b></button>
    <button type="button" class="material-method-card import" onclick="${settings.importAction}"><span>${icon('download')}</span><div><strong>${settings.importTitle}</strong><small>${settings.importText}</small></div><b>${icon('arrow')}</b></button>
  </section><div class="notice">${icon('pallet')} Os dois métodos usam o mesmo estoque. Códigos cadastrados alteram o saldo; itens sem entrada podem ser registrados como avulsos.</div></div><div class="modal-foot"><button class="button button-outline" onclick="closeModal()">Cancelar</button></div>`, 'modal-small');
}

function collectMaterialOutputItems(form) {
  const grouped = new Map();
  form.querySelectorAll('.material-output-row').forEach((row, index) => {
    const select = row.querySelector('.item-select');
    const tracked = !!select?.value && select.value !== '__CUSTOM__';
    const code = tracked ? materialCode(select.value) : materialCode(row.querySelector('[name="itemCodeCustom"]')?.value || '');
    const description = String(row.querySelector('[name="itemDescription"]')?.value || '').trim();
    const unit = String(row.querySelector('[name="itemUnit"]')?.value || 'UN').trim().toUpperCase();
    const quantity = materialNumber(row.querySelector('[name="itemQuantity"]')?.value);
    const observation = String(row.querySelector('[name="itemObservation"]')?.value || '').trim();
    if (!description || quantity <= 0) return;
    const key = tracked ? `stock:${code}` : `custom:${code}:${description}:${unit}:${index}`;
    const previous = grouped.get(key) || { code, description, unit, quantity: 0, observation, tracked, isCustom: !tracked };
    previous.quantity += quantity;
    grouped.set(key, previous);
  });
  return Array.from(grouped.values());
}

function openSimpleOutputModal(importSpreadsheet = false) {
  modal(`<form onsubmit="submitSimpleOutput(event)">${modalHead('Registrar saída simples','Retirada interna rápida, sem necessidade de assinatura ou foto')}
    <div class="modal-body">
      <div class="section-title"><span>${icon('swap')}</span><div><h3>Dados da retirada</h3><small>Use o romaneio quando precisar de transporte, assinatura, foto e impressão formal</small></div></div>
      <div class="form-grid packing-header-grid">
        <div class="field"><label>Número da saída</label><input name="number" value="${nextSimpleOutputNumber()}" readonly></div>
        <div class="field"><label>Data e hora <em>*</em></label><input name="issuedAt" type="datetime-local" required value="${nowLocal()}"></div>
        ${packingPersonSelect('sentBy', currentUser?.name || '', 'Responsável pelo registro')}
        ${packingPersonSelect('requestedBy', '', 'Pessoa que retirou')}
        <div class="field full"><label>Destino / local de uso <em>*</em></label><input name="destination" required placeholder="Ex.: Data Hall 04 — Sala técnica"></div>
      </div>
      <div class="section-title packing-items-title"><span>${icon('pallet')}</span><div><h3>Materiais retirados</h3><small>Sem entrada cadastrada? Escolha “ITEM AVULSO / SEM ENTRADA DE ESTOQUE” e informe descrição, unidade e quantidade</small></div><label class="button button-outline compact output-import-button">${icon('download')} Importar planilha<input data-output-spreadsheet type="file" accept=".xlsx,.xls,.xlsm" hidden onchange="handleMaterialOutputSpreadsheet(event)"></label><button type="button" class="button button-outline compact" onclick="addMaterialOutputRow()">${icon('plus')} Adicionar item</button></div>
      <div id="packingItems" class="packing-items">${materialOutputRow({}, 0)}</div>
      <div id="packingSpreadsheetPreview"></div>
      <div class="field full packing-notes"><label>Observação</label><textarea name="notes" placeholder="Motivo, atividade ou informação complementar..."></textarea></div>
    </div>
    <div class="modal-foot"><button type="button" class="button button-outline" onclick="closeModal()">Cancelar</button><button class="button button-green">${icon('check')} Registrar saída</button></div>
  </form>`, 'modal-inspection');
  if (importSpreadsheet) document.querySelector('[data-output-spreadsheet]')?.click();
}

async function submitSimpleOutput(event) {
  event.preventDefault();
  const form = event.target;
  const data = new FormData(form);
  const items = collectMaterialOutputItems(form);
  if (!items.length) return toast('Adicione pelo menos um material com descrição e quantidade.', true);
  const slip = {
    id: crypto.randomUUID?.() || `sai-${Date.now()}`,
    recordType: 'output', number: data.get('number'), issuedAt: data.get('issuedAt'), origin: 'Almoxarifado',
    destination: data.get('destination'), sentBy: data.get('sentBy'), requestedBy: data.get('requestedBy'),
    carrier: '', vehicle: '', notes: data.get('notes') || '', items, signature: '', photos: [],
    status: 'sent', createdAt: new Date().toISOString(), createdBy: currentUser?.name || ''
  };
  packingSlips.unshift(slip);
  const synced = await persistPackingSlip(slip);
  const returnPage = materialOutputReturnPage || 'romaneios';
  materialOutputReturnPage = '';
  closeModal(); location.hash = returnPage; render();
  toast(synced ? `${slip.number} registrada e sincronizada.` : `${slip.number} registrada neste aparelho.`);
}

function packingItemFields(item = {}, index = 0) {
  return `<div class="packing-item-row">
    <span class="packing-item-index">${String(index + 1).padStart(2, '0')}</span>
    <label><span>Código</span><input name="itemCode" placeholder="Ex.: MAT-001" value="${esc(item.code || '')}"></label>
    <label class="packing-description"><span>Descrição do material <em>*</em></span><input name="itemDescription" required placeholder="Ex.: Tubo aço carbono 2 pol." value="${esc(item.description || '')}"></label>
    <label><span>Unidade</span><select name="itemUnit">${['un','pç','m','kg','cx','kit','rolo'].map(unit => `<option ${item.unit===unit?'selected':''}>${unit}</option>`).join('')}</select></label>
    <label><span>Quantidade <em>*</em></span><input name="itemQuantity" type="number" inputmode="decimal" min="0.01" step="0.01" required value="${esc(item.quantity || 1)}"></label>
    <label class="packing-observation"><span>Observação</span><input name="itemObservation" placeholder="Lote, marca ou referência" value="${esc(item.observation || '')}"></label>
    <button type="button" class="icon-button packing-remove" title="Remover item" onclick="removePackingItem(this)">${icon('trash')}</button>
  </div>`;
}

function addPackingItem(item = {}) {
  const list = document.getElementById('packingItems');
  if (!list) return;
  list.insertAdjacentHTML('beforeend', packingItemFields(item, list.children.length));
  renumberPackingItems();
}

function removePackingItem(button) {
  const list = document.getElementById('packingItems');
  if (!list || list.children.length <= 1) return toast('O romaneio precisa ter pelo menos um material.', true);
  button.closest('.packing-item-row')?.remove();
  renumberPackingItems();
}

function renumberPackingItems() {
  document.querySelectorAll('#packingItems .packing-item-index').forEach((element, index) => element.textContent = String(index + 1).padStart(2, '0'));
}

function openPackingSlipModal(importSpreadsheet = false) {
  modal(`<form onsubmit="submitPackingSlip(event)">${modalHead('Novo romaneio de materiais','Documento formal com assinatura, foto e dados de transporte')}
    <div class="modal-body">
      <div class="section-title"><span>${icon('truck')}</span><div><h3>Identificação e transporte</h3><small>Os nomes vêm do cadastro Empresas & Efetivo</small></div></div>
      <div class="form-grid packing-header-grid">
        <div class="field"><label>Número do romaneio</label><input name="number" value="${nextPackingSlipNumber()}" readonly></div>
        <div class="field"><label>Data e hora da saída <em>*</em></label><input name="issuedAt" type="datetime-local" required value="${nowLocal()}"></div>
        <div class="field"><label>Origem <em>*</em></label><input name="origin" required value="Almoxarifado"></div>
        <div class="field"><label>Destino / frente de serviço <em>*</em></label><input name="destination" required placeholder="Ex.: Data Hall 04 — Sala técnica"></div>
        ${packingPersonSelect('sentBy', currentUser?.name || '', 'Responsável pela saída')}
        ${packingPersonSelect('requestedBy', '', 'Solicitante / recebedor')}
        <div class="field"><label>Transportadora / motorista</label><input name="carrier" placeholder="Nome ou empresa"></div>
        <div class="field"><label>Veículo / placa</label><input name="vehicle" placeholder="Ex.: Hilux ABC1D23"></div>
      </div>
      <div class="section-title packing-items-title"><span>${icon('pallet')}</span><div><h3>Materiais retirados</h3><small>Sem entrada cadastrada? Escolha “ITEM AVULSO / SEM ENTRADA DE ESTOQUE” e informe descrição, unidade e quantidade</small></div><label class="button button-outline compact output-import-button">${icon('download')} Importar planilha<input data-output-spreadsheet type="file" accept=".xlsx,.xls,.xlsm" hidden onchange="handleMaterialOutputSpreadsheet(event)"></label><button type="button" class="button button-outline compact" onclick="addMaterialOutputRow()">${icon('plus')} Adicionar item</button></div>
      <div id="packingItems" class="packing-items">${materialOutputRow({}, 0)}</div>
      <div id="packingSpreadsheetPreview"></div>
      <div class="field full packing-notes"><label>Observações gerais</label><textarea name="notes" placeholder="Informações sobre acondicionamento, urgência ou instruções para recebimento..."></textarea></div>
      <div class="packing-evidence-grid">
        <label class="operator-sign-field"><span>Assinatura de quem retirou <em>*</em></span><input type="hidden" name="operatorSign" id="operatorSignInput" data-signature-label="Responsável pela retirada"><div id="signPreviewContainer" class="sign-preview-box" onclick="openSignatureModal()"><span class="sign-placeholder-text">✍️ Clique para assinar</span></div></label>
        ${formPhotoFieldHTML('packingPhotos', 'Fotos da retirada / material', { multiple: true, required: true })}
      </div>
    </div>
    <div class="modal-foot"><button type="button" class="button button-outline" onclick="closeModal()">Cancelar</button><button class="button button-green">${icon('check')} Emitir e baixar estoque</button></div>
  </form>`, 'modal-inspection');
  if (importSpreadsheet) document.querySelector('[data-output-spreadsheet]')?.click();
}

async function submitPackingSlip(event) {
  event.preventDefault();
  const form = event.target;
  const data = new FormData(form);
  if (!data.get('operatorSign')) {
    toast('Registre a assinatura de quem retirou o material.', true);
    return openSignatureModal();
  }
  let photos = [];
  try { photos = JSON.parse(data.get('packingPhotosData') || '[]'); } catch(e) {}
  if (!photos.length) return toast('Adicione pelo menos uma foto da retirada ou do material.', true);

  const items = collectMaterialOutputItems(form);
  if (!items.length) return toast('Adicione pelo menos um material com descrição e quantidade.', true);
  const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `rom-${Date.now()}`;
  const slip = {
    id, number: data.get('number'), issuedAt: data.get('issuedAt'), origin: data.get('origin'),
    destination: data.get('destination'), sentBy: data.get('sentBy'), requestedBy: data.get('requestedBy'),
    carrier: data.get('carrier') || '', vehicle: data.get('vehicle') || '', notes: data.get('notes') || '',
    recordType: 'packing_slip', items, signature: data.get('operatorSign'), photos, status: 'sent', createdAt: new Date().toISOString(), createdBy: currentUser?.name || ''
  };
  packingSlips.unshift(slip);
  const synced = await persistPackingSlip(slip);
  const returnPage = materialOutputReturnPage || 'romaneios';
  materialOutputReturnPage = '';
  closeModal();
  location.hash = returnPage;
  render();
  toast(synced ? `${slip.number} emitido e sincronizado.` : `${slip.number} emitido e salvo neste aparelho.`);
}

function renderPackingSlips() {
  const materialOptions = new Map();
  packingSlips.forEach(slip => (slip.items || []).forEach(item => {
    const code = materialCode(item.code);
    const description = String(item.description || '').trim();
    const value = code || description;
    if (value && !materialOptions.has(value)) materialOptions.set(value, { code, description });
  }));
  const people = [...new Set(packingSlips.flatMap(slip => [slip.sentBy, slip.requestedBy]).concat(workforce.map(person => person?.name)).filter(Boolean))].sort(safeSort);
  document.getElementById('app').innerHTML = `
    ${pageHeader('Documentos de saída', 'Consulte saídas rápidas e romaneios formais no mesmo histórico.', 'ALMOXARIFADO E LOGÍSTICA', `<button class="button button-outline" onclick="openPackingSlipModal(true)">${icon('download')} Importar romaneio</button><button class="button button-outline" onclick="exportFilteredPackingSlipsExcel()">${icon('download')} Exportar planilha</button><button class="button button-outline" onclick="printFilteredPackingSlips()">${icon('print')} Imprimir relatório</button><button class="button button-green" onclick="openUnifiedOutputMenu()">${icon('swap')} Nova saída</button>`)}
    ${typeof materialModuleTabs === 'function' ? materialModuleTabs('romaneios') : ''}
    <datalist id="packingPersonOptions">${people.map(value => `<option value="${esc(value)}"></option>`).join('')}</datalist>
    <div class="packing-filters">
      <label class="search-box">${icon('search')}<input id="packingSearch" type="search" placeholder="Buscar número, material, destino ou responsável..." oninput="filterPackingSlips()"></label>
      <label class="filter-field"><span>Tipo</span><select id="packingTypeFilter" onchange="filterPackingSlips()"><option value="">Todos</option><option value="output">Saída simples</option><option value="packing_slip">Romaneio</option></select></label>
      <label class="filter-field"><span>Produto no relatório</span><select id="packingMaterialFilter" onchange="filterPackingSlips()"><option value="">Todos os produtos</option>${[...materialOptions.values()].sort((a,b) => safeSort(a.code || a.description, b.code || b.description)).map(item => `<option value="${esc(item.code || item.description)}">${esc(item.code ? `${item.code} — ${item.description}` : item.description)}</option>`).join('')}</select></label>
      <label class="filter-field"><span>Pessoa</span><input id="packingPersonFilter" list="packingPersonOptions" oninput="filterPackingSlips()" placeholder="Todas"></label>
      <label class="filter-field"><span>Data inicial</span><input id="packingStart" type="date" onchange="filterPackingSlips()"></label>
      <label class="filter-field"><span>Data final</span><input id="packingEnd" type="date" onchange="filterPackingSlips()"></label>
    </div>
    <div class="packing-filter-hint">${icon('check')} Ao escolher um produto, a planilha e a impressão incluirão somente esse produto — mesmo que o documento tenha outros itens.</div>
    <article class="panel packing-panel"><div class="table-wrap"><table class="data-table"><thead><tr><th>Documento</th><th>Tipo</th><th>Data de saída</th><th>Origem → destino</th><th>Responsáveis</th><th>Material e quantidade</th><th>Status</th><th></th></tr></thead><tbody>
      ${packingSlips.map(slip => `<tr class="packing-record-row" data-id="${esc(slip.id)}" data-date="${String(slip.issuedAt || '').slice(0,10)}" data-search="${esc(`${slip.number} ${slip.origin} ${slip.destination} ${slip.sentBy} ${slip.requestedBy} ${(slip.items||[]).map(item=>`${item.code} ${item.description}`).join(' ')}`.toLowerCase())}"><td><strong class="document-number">${esc(slip.number)}</strong><small class="table-sub">${slip.recordType === 'output' ? 'Retirada interna' : esc(slip.vehicle || slip.carrier || 'Transporte não informado')}</small></td><td>${materialDocumentType(slip)}</td><td>${fullDate(slip.issuedAt)}</td><td><strong>${esc(slip.origin)}</strong><small class="table-sub">${icon('arrow')} ${esc(slip.destination)}</small></td><td><strong>${esc(slip.sentBy)}</strong><small class="table-sub">Retirou/recebeu: ${esc(slip.requestedBy)}</small></td><td><strong>${slip.items?.length || 0} item(ns)</strong><small class="table-sub packing-quantities">${(slip.items || []).map(item => `${esc(item.code || 'Avulso')} · ${esc(item.description)}: ${materialQuantity(item.quantity)} ${esc(item.unit || 'UN')}`).join('<br>')}</small></td><td>${slip.recordType === 'output' ? '<span class="status available">Registrado</span>' : packingSlipStatus(slip.status)}</td><td><div style="display:flex;gap:4px;"><button class="table-action" onclick="openPackingSlipRecord('${slip.id}')">${icon('file')} Abrir</button><button class="table-action" style="color:var(--red);" title="Excluir documento" onclick="deletePackingSlipRecord('${slip.id}')">${icon('trash')}</button></div></td></tr>`).join('')}
    </tbody></table></div>${packingSlips.length ? '' : `<div class="empty-state"><div><span>${icon('truck')}</span><h2>Nenhuma saída registrada</h2><p>Registre uma saída e escolha se será material, romaneio, ferramenta ou EPI.</p><button class="button button-green" onclick="openUnifiedOutputMenu()">${icon('plus')} Nova saída</button></div></div>`}<div class="no-filter-results" id="noPackingResults">Nenhum documento encontrado com estes filtros.</div></article>`;
}

function filterPackingSlips() {
  const visibleIds = new Set(getFilteredPackingSlips().map(slip => String(slip.id)));
  let visible = 0;
  document.querySelectorAll('.packing-record-row').forEach(row => {
    const show = visibleIds.has(String(row.dataset.id));
    row.style.display = show ? '' : 'none';
    if (show) visible++;
  });
  const empty = document.getElementById('noPackingResults');
  if (empty) empty.style.display = document.querySelectorAll('.packing-record-row').length && !visible ? 'block' : 'none';
}

function getFilteredPackingSlips() {
  const search = (document.getElementById('packingSearch')?.value || '').trim().toLocaleLowerCase('pt-BR');
  const type = document.getElementById('packingTypeFilter')?.value || '';
  const material = (document.getElementById('packingMaterialFilter')?.value || '').trim().toLocaleLowerCase('pt-BR');
  const person = (document.getElementById('packingPersonFilter')?.value || '').trim().toLocaleLowerCase('pt-BR');
  const start = document.getElementById('packingStart')?.value || '';
  const end = document.getElementById('packingEnd')?.value || '';
  return packingSlips.filter(slip => {
    const date = String(slip.issuedAt || '').slice(0,10);
    const materialText = (slip.items || []).map(item => `${item.code || ''} ${item.description || ''}`).join(' ').toLocaleLowerCase('pt-BR');
    const peopleText = `${slip.sentBy || ''} ${slip.requestedBy || ''} ${slip.createdBy || ''}`.toLocaleLowerCase('pt-BR');
    const allText = `${slip.number || ''} ${slip.origin || ''} ${slip.destination || ''} ${peopleText} ${materialText}`.toLocaleLowerCase('pt-BR');
    const recordType = slip.recordType === 'output' ? 'output' : 'packing_slip';
    return (!search || allText.includes(search)) && (!type || recordType === type) && (!material || (slip.items || []).some(item => packingItemMatchesMaterial(item, material))) && (!person || peopleText.includes(person)) && (!start || date >= start) && (!end || date <= end);
  });
}

function packingItemMatchesMaterial(item, filterValue = '') {
  const filter = String(filterValue || '').trim().toLocaleLowerCase('pt-BR');
  if (!filter) return true;
  const code = materialCode(item?.code).toLocaleLowerCase('pt-BR');
  const description = String(item?.description || '').trim().toLocaleLowerCase('pt-BR');
  return code === materialCode(filter).toLocaleLowerCase('pt-BR') || description === filter || `${code} ${description}`.includes(filter);
}

function getFilteredPackingItems() {
  const material = document.getElementById('packingMaterialFilter')?.value || '';
  return getFilteredPackingSlips().flatMap(slip => (slip.items || [])
    .filter(item => packingItemMatchesMaterial(item, material))
    .map(item => ({ slip, item })));
}

async function exportFilteredPackingSlipsExcel() {
  const slips = getFilteredPackingSlips();
  const entries = getFilteredPackingItems();
  if (!slips.length || !entries.length) return toast('Nenhum produto encontrado com os filtros selecionados.', true);
  if (!await ensureExcelLibrary()) return toast('Gerador de planilha indisponível. Verifique a conexão.', true);
  const rows = [['DOCUMENTO','TIPO','DATA DA SAÍDA','CÓDIGO','MATERIAL','QUANTIDADE','UNIDADE','RESPONSÁVEL PELO REGISTRO','PESSOA QUE RETIROU / RECEBEU','DESTINO','OBSERVAÇÃO']];
  entries.forEach(({ slip, item }) => rows.push([
    slip.number || '', slip.recordType === 'output' ? 'Saída simples' : 'Romaneio', slip.issuedAt ? new Date(slip.issuedAt) : '', item.code || 'AVULSO', item.description || '',
    materialNumber(item.quantity), item.unit || 'UN', slip.sentBy || '', slip.requestedBy || '', slip.destination || '', item.observation || ''
  ]));
  const sheet = XLSX.utils.aoa_to_sheet(rows);
  sheet['!cols'] = [18,16,21,18,42,14,12,28,28,32,34].map(wch => ({ wch }));
  for (let row = 2; row <= rows.length; row++) if (sheet[`C${row}`]?.v) sheet[`C${row}`].z = 'dd/mm/yyyy hh:mm';
  sheet['!autofilter'] = { ref: `A1:K${rows.length}` };
  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, sheet, 'Saídas filtradas');
  XLSX.writeFile(book, `saidas-filtradas-${new Date().toISOString().slice(0,10)}.xlsx`);
  toast(`${entries.length} item(ns) de ${slips.length} documento(s) exportado(s).`);
}

function packingFiltersCaption() {
  const parts = [];
  const type = document.getElementById('packingTypeFilter')?.value || '';
  const material = document.getElementById('packingMaterialFilter')?.value?.trim() || '';
  const person = document.getElementById('packingPersonFilter')?.value?.trim() || '';
  const start = document.getElementById('packingStart')?.value || '';
  const end = document.getElementById('packingEnd')?.value || '';
  if (type) parts.push(type === 'output' ? 'Somente saídas simples' : 'Somente romaneios');
  if (material) parts.push(`Material: ${material}`);
  if (person) parts.push(`Pessoa: ${person}`);
  if (start || end) parts.push(`Período: ${start ? new Intl.DateTimeFormat('pt-BR').format(new Date(`${start}T12:00:00`)) : 'início'} até ${end ? new Intl.DateTimeFormat('pt-BR').format(new Date(`${end}T12:00:00`)) : 'hoje'}`);
  return parts.length ? parts.join(' · ') : 'Todos os documentos de saída';
}

function printFilteredPackingSlips() {
  const slips = getFilteredPackingSlips();
  const entries = getFilteredPackingItems();
  if (!slips.length || !entries.length) return toast('Nenhum produto encontrado com os filtros selecionados.', true);
  const rows = entries.map(({ slip, item }) => [
    slip.issuedAt ? fullDate(slip.issuedAt) : '—',
    slip.number || '—',
    slip.recordType === 'output' ? 'Saída simples' : 'Romaneio',
    item.code || 'AVULSO',
    item.description || '—',
    materialQuantity(item.quantity),
    item.unit || 'UN',
    slip.requestedBy || slip.sentBy || '—',
    slip.destination || '—'
  ]);
  const totalQuantity = entries.reduce((total, entry) => total + materialNumber(entry.item.quantity), 0);
  const summary = `<span><b>${slips.length}</b> documento(s)</span><span><b>${rows.length}</b> linha(s) de material</span><span><b>${materialQuantity(totalQuantity)}</b> quantidade total</span>`;
  const content = `<section class="report-section"><h2>Saídas consolidadas</h2>${reportTable(['Data','Documento','Tipo','Código','Material','Quantidade','Un.','Pessoa','Destino'], rows, 'Nenhuma saída encontrada.')}</section>`;
  const report = reportDocument('Relatório consolidado de saídas e romaneios', packingFiltersCaption(), content, summary);
  modal(`${modalHead('Relatório consolidado', `${slips.length} documento(s) reunidos em um único relatório`)}<div class="modal-body report-preview">${report}</div><div class="modal-foot"><button class="button button-outline" onclick="closeModal()">Fechar</button><button class="button button-dark" onclick="window.print()">${icon('print')} Imprimir / salvar PDF</button></div>`, 'modal-paper');
  document.querySelector('.modal-backdrop')?.classList.add('print-area','report-print-area');
}

function printablePackingSlip(slip) {
  const isSimple = slip.recordType === 'output';
  const documentTitle = isSimple ? 'REGISTRO DE SAÍDA DE MATERIAL' : 'ROMANEIO DE MATERIAIS';
  const documentSubtitle = isSimple ? 'Retirada interna do almoxarifado' : 'Controle de expedição do almoxarifado para a obra';
  return `<article class="packing-document">
    <header class="packing-document-head"><div class="report-logos"><img src="assets/heating-cooling-logo.jpg" alt="Heating Cooling"><img src="assets/afonso-franca-logo.png" alt="Afonso França Engenharia"></div><div><small>CONTROLE DE MATERIAIS · DC01</small><h1>${documentTitle}</h1><p>${documentSubtitle}</p></div><aside><strong>${esc(slip.number)}</strong><span>${isSimple ? '<span class="status available">Registrado</span>' : packingSlipStatus(slip.status)}</span></aside></header>
    <section class="packing-document-meta"><span><small>Saída</small><strong>${fullDate(slip.issuedAt)}</strong></span><span><small>Origem</small><strong>${esc(slip.origin)}</strong></span><span><small>Destino</small><strong>${esc(slip.destination)}</strong></span><span><small>Tipo</small><strong>${isSimple ? 'Saída simples' : 'Romaneio'}</strong></span><span><small>Responsável pelo registro</small><strong>${esc(slip.sentBy)}</strong></span><span><small>${isSimple ? 'Pessoa que retirou' : 'Solicitante / recebedor'}</small><strong>${esc(slip.requestedBy)}</strong></span><span><small>${isSimple ? 'Registro' : 'Transportadora / motorista'}</small><strong>${isSimple ? 'Retirada interna' : esc(slip.carrier || '—')}</strong></span><span><small>${isSimple ? 'Emissor' : 'Veículo / placa'}</small><strong>${isSimple ? esc(slip.createdBy || slip.sentBy) : esc(slip.vehicle || '—')}</strong></span></section>
    <table class="packing-document-table"><thead><tr><th>Item</th><th>Código</th><th>Descrição do material</th><th>Un.</th><th>Qtd. retirada</th><th>Observação</th></tr></thead><tbody>${(slip.items || []).map((item,index)=>`<tr><td>${index+1}</td><td>${esc(item.code||'AVULSO')}</td><td>${esc(item.description)}</td><td>${esc(item.unit || 'UN')}</td><td><strong>${materialQuantity(item.quantity)}</strong></td><td>${esc(item.observation || '')}</td></tr>`).join('')}</tbody></table>
    ${slip.notes ? `<div class="packing-document-notes"><strong>Observações do envio</strong><p>${esc(slip.notes)}</p></div>` : ''}
    ${!isSimple && (slip.photos || []).length ? `<section class="packing-photo-record"><strong>Fotos da retirada</strong><div>${slip.photos.map((photo,index) => `<figure><img src="${esc(photo)}" alt="Foto ${index+1} da retirada"><figcaption>Foto ${index+1}</figcaption></figure>`).join('')}</div></section>` : ''}
    ${isSimple ? `<section class="packing-simple-auth"><span><small>Registrado por</small><strong>${esc(slip.sentBy)}</strong></span><span><small>Retirado por</small><strong>${esc(slip.requestedBy)}</strong></span></section>` : `<section class="packing-signatures"><span>${slip.signature ? `<img src="${esc(slip.signature)}" alt="Assinatura de quem retirou">` : '<br><br>________________________________'}<br>Responsável pela retirada</span><span><br><br>________________________________<br>Transportador</span><span><br><br>________________________________<br>Controle da obra</span></section>`}
    <footer class="report-footer">Documento gerado pelo ObraFlow · Gestão HVAC · ${fullDate(new Date().toISOString())}</footer>
  </article>`;
}

function openPackingSlipRecord(id) {
  const slip = packingSlips.find(item => String(item.id) === String(id));
  if (!slip) return toast('Documento de saída não encontrado.', true);
  const label = slip.recordType === 'output' ? 'Saída' : 'Romaneio';
  modal(`${modalHead(`${label} ${esc(slip.number)}`, `${slip.items?.length || 0} item(ns) · ${esc(slip.destination)}`)}<div class="modal-body report-preview">${printablePackingSlip(slip)}</div><div class="modal-foot"><button type="button" class="button button-outline danger-button" style="color:var(--red);border-color:var(--red-soft);" onclick="deletePackingSlipRecord('${slip.id}')">${icon('trash')} Excluir documento</button><button class="button button-outline" onclick="closeModal()">Fechar</button><button class="button button-dark" onclick="window.print()">${icon('print')} Imprimir / salvar PDF</button></div>`, 'modal-paper');
  document.querySelector('.modal-backdrop').classList.add('print-area','packing-slip-print-area');
}

function nextReceivingInspectionNumber() {
  const year = new Date().getFullYear();
  const highest = receivingInspections.reduce((max, item) => {
    const match = String(item.number || '').match(/REC-\d{4}-(\d+)/);
    return Math.max(max, match ? Number(match[1]) : 0);
  }, 0);
  return `REC-${year}-${String(highest + 1).padStart(4, '0')}`;
}

function equipmentChecklistRows(record = null, editable = true) {
  let currentGroup = '';
  return equipmentReceivingChecklistItems.map((item, index) => {
    const answer = record?.answers?.[index] || {};
    const groupRow = item.group !== currentGroup ? `<tr class="equipment-check-group"><th colspan="7">${esc(item.group)}</th></tr>` : '';
    currentGroup = item.group;
    const option = (value, label) => editable
      ? `<label><input type="radio" name="equipmentCheck${index}" value="${value}" required><span>${label}</span></label>`
      : (answer.result === value ? 'X' : '');
    return `${groupRow}<tr><td>${index + 1}</td><td>${esc(item.title)}</td><td>${option('good','BOM')}</td><td>${option('repair_yes','SIM')}</td><td>${option('repair_no','NÃO')}</td><td>${option('na','N.A')}</td><td>${editable?`<input name="equipmentNote${index}" placeholder="Observação">`:esc(answer.observation || '')}</td></tr>`;
  }).join('');
}

function openReceivingInspection() {
  modal(`<form onsubmit="submitReceivingInspection(event)">${modalHead('Preencher formulário oficial','FOR.ALM-5-1 · Check List de Equipamentos · Revisão 01')}<div class="modal-body receiving-official-wrap">
    <section class="equipment-receiving-sheet">
      <header class="equipment-receiving-head"><img src="assets/heating-cooling-logo.jpg" alt="Heating Cooling"><h2>CHECK LIST DE EQUIPAMENTOS</h2><div><strong>Doc: FOR.ALM-5-1</strong><span>Data: 17/06/2026</span><span>Revisão: 01</span><span>Página 1 de 1</span></div></header>
      <div class="equipment-receiving-fields">
        <label class="operation-field"><span>Operação</span><b><input type="radio" name="operation" value="envio" required> OBRA ENVIO</b><b><input type="radio" name="operation" value="retorno" required> OBRA RETORNO</b></label>
        <label><span>Centro de custo</span><input name="costCenter" required></label>
        <label><span>Controle</span><input name="control" required></label>
        <label><span>Equipamento</span><input name="equipment" required></label>
        <label class="wide-field"><span>Fabricante / modelo</span><input name="manufacturerModel" required></label>
        <label><span>Data e hora</span><input type="datetime-local" name="inspectedAt" required value="${nowLocal()}"></label>
        <label class="wide-field"><span>Inspecionado por</span><input name="inspectedBy" required value="${esc(currentUser?.name || '')}"></label>
      </div>
      <table class="equipment-check-table"><colgroup><col class="item-col"><col><col class="answer-col"><col class="answer-col"><col class="answer-col"><col class="answer-col"><col class="notes-col"></colgroup><thead><tr><th rowspan="2">Item</th><th rowspan="2">Itens vistoriados</th><th rowspan="2">Bom</th><th colspan="2">Reparo</th><th rowspan="2">N.A.</th><th rowspan="2">Observações</th></tr><tr><th>Sim</th><th>Não</th></tr></thead><tbody>${equipmentChecklistRows()}</tbody></table>
      <label class="equipment-comments"><span>Comentários</span><textarea name="comments"></textarea></label>
      <div class="equipment-receiving-footer">
        <label><span>Responsável pelo equipamento</span><input name="equipmentResponsible" required></label>
        <label class="conclusion-field"><span>Declaramos que o equipamento vistoriado encontra-se em:</span><b><input type="radio" name="conclusion" value="operational" required> Condições de operar sem risco</b><b><input type="radio" name="conclusion" value="blocked" required> Não tem condições de operar</b></label>
        <label class="operator-sign-field"><span>Assinatura do inspetor <em>*</em></span><input type="hidden" name="operatorSign" id="operatorSignInput" data-signature-label="Inspetor"><div id="signPreviewContainer" class="sign-preview-box" onclick="openSignatureModal()"><span class="sign-placeholder-text">✍️ Clique aqui para desenhar a assinatura</span></div></label>
        <label><span>Local</span><input name="location" required value="DataCenter Omnia — DC01"></label>
      </div>
    </section>
  </div><div class="modal-foot"><a class="button button-outline" href="assets/formularios/FOR-ALM-5.1-check-list-de-equipamentos-rev01.xlsx" download>${icon('download')} Baixar original</a><button type="button" class="button button-outline" onclick="closeModal()">Cancelar</button><button class="button button-green">${icon('check')} Salvar checklist</button></div></form>`, 'modal-inspection');
}

async function submitReceivingInspection(event) {
  event.preventDefault();
  const form = event.target;
  const data = Object.fromEntries(new FormData(form));
  if (!data.operatorSign) return toast('Registre a assinatura do inspetor.', true);
  const answers = equipmentReceivingChecklistItems.map((item,index) => ({ title: item.title, group: item.group, result: data[`equipmentCheck${index}`], observation: data[`equipmentNote${index}`] || '' }));
  const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `rec-${Date.now()}`;
  const record = {
    id, number: nextReceivingInspectionNumber(), templateCode: 'FOR.ALM-5-1', templateRevision: '01', templateDate: '17/06/2026',
    operation: data.operation, costCenter: data.costCenter, control: data.control, equipment: data.equipment,
    manufacturerModel: data.manufacturerModel, inspectedAt: data.inspectedAt, inspectedBy: data.inspectedBy,
    equipmentResponsible: data.equipmentResponsible, location: data.location, comments: data.comments || '',
    conclusion: data.conclusion, inspectorSignature: data.operatorSign, answers, photos: [], createdAt: new Date().toISOString()
  };
  receivingInspections.unshift(record);
  const synced = await persistReceivingInspection(record);
  closeModal(); location.hash = 'formularios'; render();
  toast(`${record.number} salvo${synced?' e sincronizado':' neste aparelho'}.`, record.conclusion === 'blocked');
}

function receivingResultLabel(value) {
  return ({ good: 'Bom', repair_yes: 'Reparo — Sim', repair_no: 'Reparo — Não', na: 'N.A.' })[value] || '—';
}

function printableReceivingInspection(record) {
  return `<article class="equipment-receiving-sheet printable-receiving">
    <header class="equipment-receiving-head"><img src="assets/heating-cooling-logo.jpg" alt="Heating Cooling"><h2>CHECK LIST DE EQUIPAMENTOS</h2><div><strong>Doc: ${esc(record.templateCode)}</strong><span>Data: ${esc(record.templateDate)}</span><span>Revisão: ${esc(record.templateRevision)}</span><span>Página 1 de 1</span></div></header>
    <div class="equipment-receiving-fields record-fields"><span><small>Operação</small><strong>${record.operation==='retorno'?'OBRA RETORNO':'OBRA ENVIO'}</strong></span><span><small>Centro de custo</small><strong>${esc(record.costCenter)}</strong></span><span><small>Controle</small><strong>${esc(record.control)}</strong></span><span><small>Equipamento</small><strong>${esc(record.equipment)}</strong></span><span class="wide-field"><small>Fabricante / modelo</small><strong>${esc(record.manufacturerModel)}</strong></span><span><small>Data e hora</small><strong>${fullDate(record.inspectedAt)}</strong></span><span class="wide-field"><small>Inspecionado por</small><strong>${esc(record.inspectedBy)}</strong></span></div>
    <table class="equipment-check-table"><colgroup><col class="item-col"><col><col class="answer-col"><col class="answer-col"><col class="answer-col"><col class="answer-col"><col class="notes-col"></colgroup><thead><tr><th rowspan="2">Item</th><th rowspan="2">Itens vistoriados</th><th rowspan="2">Bom</th><th colspan="2">Reparo</th><th rowspan="2">N.A.</th><th rowspan="2">Observações</th></tr><tr><th>Sim</th><th>Não</th></tr></thead><tbody>${record.answers.map((answer,index)=>`${index===0||record.answers[index-1].group!==answer.group?`<tr class="equipment-check-group"><th colspan="7">${esc(answer.group)}</th></tr>`:''}<tr><td>${index+1}</td><td>${esc(answer.title)}</td><td>${answer.result==='good'?'X':''}</td><td>${answer.result==='repair_yes'?'X':''}</td><td>${answer.result==='repair_no'?'X':''}</td><td>${answer.result==='na'?'X':''}</td><td>${esc(answer.observation || '')}</td></tr>`).join('')}</tbody></table>
    <div class="equipment-comments record-comments"><strong>Comentários</strong><p>${esc(record.comments || '—')}</p></div>
    <div class="receiving-record-footer"><span><small>Responsável pelo equipamento</small><strong>${esc(record.equipmentResponsible)}</strong></span><span><small>Condição final</small><strong>${record.conclusion==='operational'?'EM CONDIÇÕES DE OPERAR SEM RISCO':'NÃO TEM CONDIÇÕES DE OPERAR'}</strong></span><span><small>Local</small><strong>${esc(record.location)}</strong></span><span class="signature-record"><small>Assinatura do inspetor</small><img src="${record.inspectorSignature}" alt="Assinatura"></span></div>
  </article>`;
}

function openReceivingInspectionRecord(id) {
  const record = receivingInspections.find(item => String(item.id) === String(id));
  if (!record) return toast('Checklist não encontrado.', true);
  modal(`${modalHead(`${record.templateCode} · Revisão ${record.templateRevision}`, `${record.number} · ${esc(record.equipment || record.control || 'Recebimento')}`)}<div class="modal-body report-preview">${printableReceivingInspection(record)}</div><div class="modal-foot"><button type="button" class="button button-outline danger-button" style="color:var(--red);border-color:var(--red-soft);" onclick="deleteReceivingInspectionRecord('${record.id}')">${icon('trash')} Excluir lançamento</button><button class="button button-outline" onclick="closeModal()">Fechar</button><a class="button button-outline" href="assets/formularios/FOR-ALM-5.1-check-list-de-equipamentos-rev01.xlsx" download>${icon('download')} Modelo original</a><button class="button button-dark" onclick="window.print()">${icon('print')} Imprimir / salvar PDF</button></div>`, 'modal-paper');
  document.querySelector('.modal-backdrop').classList.add('print-area','receiving-print-area');
}

function formsHubRecords() {
  const records = [];
  packingSlips.forEach(slip => {
    records.push({ type: 'romaneio', recordType: slip.recordType || 'packing_slip', date: slip.issuedAt, number: slip.number, title: slip.recordType === 'output' ? 'Saída simples de materiais' : 'Romaneio de materiais', subtitle: `${slip.origin} → ${slip.destination}`, status: slip.status, id: slip.id });
  });
  receivingInspections
    .filter(record => !['entrada_nf', 'entrada_planilha', 'entrada_manual'].includes(record?.operation))
    .forEach(record => records.push({ type: 'recebimento', date: record.inspectedAt, number: record.number, title: `${record.templateCode} · Check List de Equipamentos`, subtitle: `${record.equipment} · ${record.inspectedBy}`, status: record.conclusion==='blocked'?'divergence':'received', id: record.id, revision: record.templateRevision }));
  history.filter(item => item.inspection).forEach(item => {
    const eq = equipments.find(equipment => equipment.id === item.equipmentId);
    records.push({ type: 'pemt', date: item.inspection.inspectedAt || item.date, number: eq?.code || item.equipmentCode || 'PEMT', title: 'Inspeção PEMT', subtitle: `${item.person || 'Responsável'} · ${item.company || ''}`, status: inspectionHasFailure(item.inspection)?'divergence':'received', id: item.id });
  });
  return records.sort((a,b) => Date.parse(b.date || 0) - Date.parse(a.date || 0));
}

function formTemplateCard(template) {
  const action = template.digital === 'recebimento'
    ? `<button class="button button-green" onclick="openReceivingInspection()">${icon('edit')} Preencher no app</button>`
    : template.digital === 'romaneio'
      ? `<button class="button button-green" onclick="openMaterialActionMenu('packing_slip')">${icon('plus')} Novo romaneio</button>`
      : `<button class="button button-outline" onclick="openBlankInspectionTemplate()">${icon('print')} Imprimir modelo</button>`;
  const download = template.file ? `<a class="button button-outline" href="${template.file}" download>${icon('download')} Baixar ${template.format}</a>` : '';
  return `<article class="form-template-card" data-template-search="${esc(`${template.code} ${template.title} ${template.category}`.toLowerCase())}"><div class="form-template-top"><span>${icon(template.digital==='romaneio'?'truck':template.digital==='pemt'?'lift':'clipboard')}</span><b>${esc(template.category)}</b></div><div><small>${esc(template.code)}</small><h2>${esc(template.title)}</h2><p>${esc(template.description)}</p><div class="form-version"><span>Revisão <strong>${esc(template.revision)}</strong></span>${template.issuedAt?`<span>Emissão <strong>${esc(template.issuedAt)}</strong></span>`:''}<span>Formato <strong>${esc(template.format)}</strong></span></div></div><div class="form-template-actions">${action}${download}</div></article>`;
}

function formPhotoFieldHTML(name, label, { multiple = true, required = false } = {}) {
  return `<section class="form-photo-field"><div><strong>${esc(label)}</strong><small>Use a câmera ou selecione ${multiple?'uma ou mais fotos':'uma foto'}.</small></div><label class="button button-outline">${icon('plus')} Adicionar foto<input type="file" name="${esc(name)}" accept="image/*" capture="environment" ${multiple?'multiple':''} ${required?'required':''} hidden onchange="prepareFormPhotos(this)"></label><input type="hidden" name="${esc(name)}Data"><div class="form-photo-preview"></div></section>`;
}

async function prepareFormPhotos(input) {
  const files = Array.from(input.files || []);
  const data = await Promise.all(files.map(file => compressFormPhoto(file)));
  const hidden = input.closest('.form-photo-field')?.querySelector(`input[name="${CSS.escape(input.name)}Data"]`);
  const preview = input.closest('.form-photo-field')?.querySelector('.form-photo-preview');
  if (hidden) hidden.value = JSON.stringify(data);
  if (preview) preview.innerHTML = data.map((source,index) => `<figure><img src="${source}" alt="Foto ${index+1}"><figcaption>Foto ${index+1}</figcaption></figure>`).join('');
}

function compressFormPhoto(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Não foi possível ler a foto.'));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error('Arquivo de imagem inválido.'));
      image.onload = () => {
        const scale = Math.min(1, 1600 / Math.max(image.width, image.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));
        canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', .78));
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

function renderFormsHub() {
  const records = formsHubRecords();
  document.getElementById('app').innerHTML = `
    ${pageHeader('Biblioteca de formulários', 'Modelos oficiais com código, revisão, preenchimento digital e arquivo original.', 'DOCUMENTOS CONTROLADOS')}
    <section class="library-guidance">${icon('shield')}<div><strong>Controle de revisão</strong><small>Cada modelo mantém o código e a revisão do documento oficial. Formulários com campo de foto permitem câmera ou arquivo durante o preenchimento.</small></div></section>
    <section class="form-catalog">${formLibrary.map(formTemplateCard).join('')}</section>
    <section class="forms-library-head"><div><h2>Formulários registrados</h2><p>${records.length} documento(s) disponíveis para consulta</p></div></section>
    <div class="forms-filters"><label class="search-box">${icon('search')}<input id="formsSearch" type="search" placeholder="Buscar documento, número ou responsável..." oninput="filterFormsHub()"></label><label class="filter-field"><span>Tipo</span><select id="formsType" onchange="filterFormsHub()"><option value="">Todos</option><option value="romaneio">Saídas / Romaneios</option><option value="recebimento">Inspeção de recebimento</option><option value="pemt">Inspeção PEMT</option></select></label><label class="filter-field"><span>Data inicial</span><input type="date" id="formsStart" onchange="filterFormsHub()"></label><label class="filter-field"><span>Data final</span><input type="date" id="formsEnd" onchange="filterFormsHub()"></label></div>
    <article class="panel"><div class="table-wrap"><table class="data-table"><thead><tr><th>Data</th><th>Formulário</th><th>Documento / ativo</th><th>Referência</th><th>Resultado</th><th></th></tr></thead><tbody>${records.map(record=>`<tr class="form-record-row" data-type="${record.type}" data-date="${String(record.date||'').slice(0,10)}" data-search="${esc(`${record.title} ${record.number} ${record.subtitle}`.toLowerCase())}"><td>${fullDate(record.date)}</td><td><strong>${esc(record.title)}</strong><small class="table-sub">${record.revision?`Revisão ${esc(record.revision)} · `:''}${record.type==='pemt'?'Equipamentos':record.type==='recebimento'?'Almoxarifado · Recebimento':'Almoxarifado · Expedição'}</small></td><td><strong class="document-number">${esc(record.number)}</strong></td><td>${esc(record.subtitle)}</td><td>${record.type==='romaneio'?(record.recordType==='output'?'<span class="status available">Registrado</span>':packingSlipStatus(record.status)):`<span class="status ${record.status==='divergence'?'maintenance':'available'}">${record.status==='divergence'?'Não liberado':'Conforme'}</span>`}</td><td><div style="display:flex;gap:4px;"><button class="table-action" onclick="${record.type==='pemt'?`openInspectionRecord('${record.id}')`:record.type==='recebimento'?`openReceivingInspectionRecord('${record.id}')`:`openPackingSlipRecord('${record.id}')`}">${icon('file')} Abrir</button>${record.type==='recebimento'?`<button class="table-action" style="color:var(--red);" title="Excluir" onclick="deleteReceivingInspectionRecord('${record.id}')">${icon('trash')}</button>`:record.type==='romaneio'?`<button class="table-action" style="color:var(--red);" title="Excluir" onclick="deletePackingSlipRecord('${record.id}')">${icon('trash')}</button>`:''}</div></td></tr>`).join('')}</tbody></table></div>${records.length?'':`<div class="empty-state"><div><span>${icon('clipboard')}</span><h2>Nenhum formulário registrado</h2><p>Os documentos emitidos aparecerão aqui automaticamente.</p></div></div>`}<div class="no-filter-results" id="noFormsResults">Nenhum formulário encontrado com estes filtros.</div></article>`;
}

function filterFormsHub() {
  const search = document.getElementById('formsSearch')?.value.toLowerCase() || '';
  const type = document.getElementById('formsType')?.value || '';
  const start = document.getElementById('formsStart')?.value || '';
  const end = document.getElementById('formsEnd')?.value || '';
  let visible = 0;
  document.querySelectorAll('.form-record-row').forEach(row => {
    const show = (!search || row.dataset.search.includes(search)) && (!type || row.dataset.type === type) && (!start || row.dataset.date >= start) && (!end || row.dataset.date <= end);
    row.style.display = show ? '' : 'none';
    if (show) visible++;
  });
  const empty = document.getElementById('noFormsResults');
  if (empty) empty.style.display = document.querySelectorAll('.form-record-row').length && !visible ? 'block' : 'none';
}

function workforceMonthDates(month = workforceControlMonth) {
  if (!/^\d{4}-\d{2}$/.test(month || '')) return [];
  const [year, monthNumber] = month.split('-').map(Number);
  const total = new Date(year, monthNumber, 0).getDate();
  return Array.from({ length: total }, (_, index) => `${month}-${String(index + 1).padStart(2, '0')}`);
}

function workforceMonthLabel(month = workforceControlMonth) {
  const date = /^\d{4}-\d{2}$/.test(month || '') ? new Date(`${month}-01T12:00:00`) : new Date();
  return new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(date);
}

function workforceDayLabel(date) {
  const parsed = new Date(`${date}T12:00:00`);
  return {
    day: String(parsed.getDate()).padStart(2, '0'),
    weekday: new Intl.DateTimeFormat('pt-BR', { weekday: 'short' }).format(parsed).replace('.', '').slice(0, 3)
  };
}

function normalizeAttendanceValue(value) {
  if (value === 1 || String(value).trim() === '1') return '1';
  if (value === 0 || String(value).trim() === '0') return '0';
  const normalized = normalizeSpreadsheetHeader(value);
  if (normalized === 'p' || normalized === 'presente') return '1';
  if (normalized === 'a' || normalized === 'ausente' || normalized === 'falta') return '0';
  if (normalized.includes('folga')) return 'FOLGA';
  return '';
}

function workforceAttendanceValue(person, date) {
  return workforceAttendance[workforcePersonKey(person)]?.[date] || '';
}

function workforceAttendanceCell(person, date) {
  const value = workforceAttendanceValue(person, date);
  const state = value === '1' ? 'present' : value === '0' ? 'absent' : value === 'FOLGA' ? 'off' : 'empty';
  const label = value === 'FOLGA' ? 'F' : value || '·';
  const title = value === '1' ? 'Presente' : value === '0' ? 'Ausente' : value === 'FOLGA' ? 'Folga' : 'Sem marcação';
  const encodedKey = encodeURIComponent(workforcePersonKey(person)).replace(/'/g, '%27');
  return `<button type="button" class="attendance-cell ${state}" data-value="${value}" data-date="${date}" title="${title} · clique para alterar" onclick="cycleWorkforceAttendance('${encodedKey}','${date}',this)">${label}</button>`;
}

function renderWorkforceQuadroTableHTML(date = workforceSummaryDate) {
  const companies = [...new Set(workforce.map(person => person?.company).filter(Boolean))].sort(safeSort);
  let totalDaily = 0;
  let totalGeral = 0;

  const rows = companies.map(company => {
    const people = workforce.filter(person => person?.company === company);
    const dailyCount = people.filter(person => workforceAttendanceValue(person, date) === '1').length;
    const geralCount = people.length;
    totalDaily += dailyCount;
    totalGeral += geralCount;

    return `
      <tr>
        <td class="quadro-col-company">${esc(company)}</td>
        <td class="quadro-col-daily">${dailyCount}</td>
        <td class="quadro-col-geral">${geralCount}</td>
      </tr>
    `;
  }).join('');

  return `
    <div class="quadro-efetivo-card">
      <div class="quadro-efetivo-table-wrap">
        <table class="quadro-efetivo-table">
          <thead>
            <tr>
              <th>EMPRESA</th>
              <th>TOTAL DE EFETIVOS DIÁRIO</th>
              <th>GERAL</th>
            </tr>
          </thead>
          <tbody>
            ${rows || '<tr><td colspan="3" style="text-align:center;">Nenhuma empresa cadastrada</td></tr>'}
          </tbody>
          <tfoot>
            <tr>
              <td class="quadro-col-company">TOTAL</td>
              <td class="quadro-col-daily">${totalDaily}</td>
              <td class="quadro-col-geral">${totalGeral}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  `;
}

function workforceDailySummaryHTML(date = workforceSummaryDate) {
  return renderWorkforceQuadroTableHTML(date);
}

function renderWorkforceControl(companies) {
  const dates = workforceMonthDates();
  const rows = workforce.map(person => `<tr class="workforce-control-row" data-company="${esc(person.company)}" data-search="${esc(`${person.name} ${person.company} ${person.role || ''}`.toLowerCase())}"><td class="workforce-sticky-company">${esc(person.company)}</td><td class="workforce-sticky-person"><strong>${esc(person.name)}</strong><small>${esc(person.role || '—')}</small></td><td>${esc(person.status || '—')}</td>${dates.map(date => `<td>${workforceAttendanceCell(person, date)}</td>`).join('')}</tr>`).join('');
  const totals = dates.map(date => `<td class="attendance-total" data-total-date="${date}">${workforce.filter(person => workforceAttendanceValue(person, date) === '1').length}</td>`).join('');
  return `<section class="workforce-control-panel">
    <div class="workforce-control-toolbar">
      <div class="month-switcher"><button class="icon-button" type="button" title="Mês anterior" onclick="shiftWorkforceMonth(-1)">${icon('chevron')}</button><label><span>Mês do controle</span><input id="workforceMonth" type="month" value="${workforceControlMonth}" onchange="changeWorkforceMonth(this.value)"></label><button class="icon-button next" type="button" title="Próximo mês" onclick="shiftWorkforceMonth(1)">${icon('chevron')}</button></div>
      <label class="search-box">${icon('search')}<input id="workforceControlSearch" type="search" placeholder="Buscar pessoa ou função..." oninput="filterWorkforceControl()"></label>
      <label class="filter-field"><span>Empresa</span><select id="workforceControlCompany" onchange="filterWorkforceControl()"><option value="">Todas</option>${companies.map(company => `<option value="${esc(company)}">${esc(company)}</option>`).join('')}</select></label>
    </div>
    <div class="attendance-guide"><span><i class="present">1</i> Presente</span><span><i class="absent">0</i> Ausente</span><span><i class="off">F</i> Folga</span><small>Clique em uma marcação para alternar. As alterações são salvas automaticamente.</small></div>
    <div class="workforce-daily-head"><div><strong>Resumo do dia</strong><small>Presentes / cadastrados por empresa</small></div><input type="date" id="workforceSummaryDate" value="${workforceSummaryDate}" onchange="changeWorkforceSummaryDate(this.value)"></div>
    <div class="workforce-daily-summary" id="workforceDailySummary">${workforceDailySummaryHTML()}</div>
    <div class="table-wrap workforce-control-table-wrap"><table class="data-table workforce-control-table"><thead><tr><th class="workforce-sticky-company">Empresa</th><th class="workforce-sticky-person">Nome / função</th><th>Vínculo</th>${dates.map(date => { const label = workforceDayLabel(date); return `<th class="${['sáb','dom'].includes(label.weekday) ? 'weekend' : ''}"><span>${label.day}</span><small>${label.weekday}</small></th>`; }).join('')}</tr></thead><tbody>${rows}</tbody><tfoot><tr><td class="workforce-sticky-company"></td><td class="workforce-sticky-person"><strong>Total presente</strong></td><td></td>${totals}</tr></tfoot></table></div>
    <div class="no-filter-results" id="noWorkforceControlResults">Nenhuma pessoa encontrada.</div>
  </section>`;
}

function renderWorkforceDirectory(companies) {
  return `<div class="simple-filters workforce-filters"><label class="search-box">${icon('search')}<input id="workforceSearch" type="search" placeholder="Buscar nome, função ou empresa..." oninput="filterWorkforce()"></label><label class="filter-field"><span>Empresa</span><select id="workforceCompany" onchange="filterWorkforce()"><option value="">Todas</option>${companies.map(company=>`<option>${esc(company)}</option>`).join('')}</select></label></div><article class="panel"><div class="panel-head"><div><h2>Pessoas cadastradas</h2><p>Disponíveis na lista de responsáveis dos checklists</p></div></div><div class="table-wrap"><table class="data-table"><thead><tr><th>Nome</th><th>Empresa</th><th>Função</th><th>Vínculo</th><th></th></tr></thead><tbody>${workforce.map((person,index)=>`<tr class="workforce-row" data-company="${esc(person?.company||'')}" data-search="${esc(`${person?.name||''} ${person?.company||''} ${person?.role||''}`.toLowerCase())}"><td><strong>${esc(person?.name||'')}</strong></td><td>${esc(person?.company||'')}</td><td>${esc(person?.role||'—')}</td><td>${esc(person?.status||'—')}</td><td><div class="control-row-actions"><button class="icon-button" title="Editar" onclick="openPersonModal(${index})">${icon('edit')}</button><button class="icon-button" title="Excluir" onclick="deletePerson(${index})">${icon('trash')}</button></div></td></tr>`).join('')}</tbody></table></div><div class="no-filter-results" id="noWorkforceResults">Nenhuma pessoa encontrada.</div></article>`;
}

function renderCompanies() {
  workforce = normalizeWorkforcePeople(workforce);
  const companies=[...new Set(workforce.map(person=>person?.company).filter(Boolean))].sort(safeSort);
  if (!workforceSummaryDate.startsWith(workforceControlMonth)) workforceSummaryDate = `${workforceControlMonth}-01`;
  const presentToday = workforce.filter(person => workforceAttendanceValue(person, workforceSummaryDate) === '1').length;
  const view = workforceView === 'directory' ? renderWorkforceDirectory(companies) : renderWorkforceControl(companies);
  document.getElementById('app').innerHTML = `${pageHeader('Empresas & efetivo', 'Controle o cadastro e a presença diária da equipe dentro do app.', 'CADASTRO CENTRAL', `<button class="button button-outline" onclick="openWorkforceModal()">${icon('download')} Importar Excel</button><button class="button button-outline" onclick="exportWorkforceExcel()">${icon('download')} Exportar modelo</button><button class="button button-green" onclick="openPersonModal()">${icon('plus')} Adicionar pessoa</button>`)}<section class="workforce-summary"><div><span>${icon('building')}</span><p><strong>${companies.length}</strong><small>Empresas</small></p></div><div><span>${icon('user')}</span><p><strong>${workforce.length}</strong><small>Pessoas cadastradas</small></p></div><div><span>${icon('check')}</span><p><strong>${presentToday}</strong><small>Presentes em ${new Intl.DateTimeFormat('pt-BR').format(new Date(`${workforceSummaryDate}T12:00:00`))}</small></p></div><div class="workforce-source"><p><small>Última atualização</small><strong>${esc(workforceMeta.source||'Cadastro manual')}</strong><span>${workforceMeta.updatedAt?`${new Intl.DateTimeFormat('pt-BR').format(new Date(workforceMeta.updatedAt))}`:''}</span></p></div></section><div class="workforce-tabs"><button class="${workforceView === 'control' ? 'active' : ''}" onclick="setWorkforceView('control')">${icon('chart')} Controle diário</button><button class="${workforceView === 'directory' ? 'active' : ''}" onclick="setWorkforceView('directory')">${icon('user')} Cadastro de pessoas</button></div>${view}`;
}

function setWorkforceView(view) {
  workforceView = view === 'directory' ? 'directory' : 'control';
  renderCompanies();
}

function filterWorkforce() {
  const search=document.getElementById('workforceSearch')?.value.toLowerCase() || ''; const company=document.getElementById('workforceCompany')?.value || ''; let visible=0;
  document.querySelectorAll('.workforce-row').forEach(row=>{const show=(!search||row.dataset.search.includes(search))&&(!company||row.dataset.company===company);row.style.display=show?'':'none';if(show)visible++;});
  const empty = document.getElementById('noWorkforceResults'); if (empty) empty.style.display=visible?'none':'block';
}

function filterWorkforceControl() {
  const search = document.getElementById('workforceControlSearch')?.value.toLowerCase() || '';
  const company = document.getElementById('workforceControlCompany')?.value || '';
  let visible = 0;
  document.querySelectorAll('.workforce-control-row').forEach(row => {
    const show = (!search || row.dataset.search.includes(search)) && (!company || row.dataset.company === company);
    row.style.display = show ? '' : 'none';
    if (show) visible++;
  });
  document.querySelectorAll('[data-total-date]').forEach(cell => {
    const date = cell.dataset.totalDate;
    cell.textContent = [...document.querySelectorAll('.workforce-control-row')].filter(row => row.style.display !== 'none' && row.querySelector(`[data-date="${date}"]`)?.dataset.value === '1').length;
  });
  const empty = document.getElementById('noWorkforceControlResults'); if (empty) empty.style.display = visible ? 'none' : 'block';
}

function changeWorkforceMonth(month) {
  if (!/^\d{4}-\d{2}$/.test(month || '')) return;
  workforceControlMonth = month;
  const today = new Date().toISOString().slice(0, 10);
  workforceSummaryDate = today.startsWith(month) ? today : `${month}-01`;
  saveLocalBackup();
  renderCompanies();
}

function shiftWorkforceMonth(delta) {
  const [year, month] = workforceControlMonth.split('-').map(Number);
  const shifted = new Date(year, month - 1 + delta, 1, 12);
  changeWorkforceMonth(`${shifted.getFullYear()}-${String(shifted.getMonth() + 1).padStart(2, '0')}`);
}

function changeWorkforceSummaryDate(date) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date || '')) return;
  workforceSummaryDate = date;
  saveLocalBackup();
  const summary = document.getElementById('workforceDailySummary');
  if (summary) summary.innerHTML = workforceDailySummaryHTML(date);
  const metric = document.querySelector('.workforce-summary > div:nth-child(3) p');
  if (metric) metric.innerHTML = `<strong>${workforce.filter(person => workforceAttendanceValue(person, date) === '1').length}</strong><small>Presentes em ${new Intl.DateTimeFormat('pt-BR').format(new Date(`${date}T12:00:00`))}</small>`;
}

function cycleWorkforceAttendance(encodedKey, date, button) {
  const key = decodeURIComponent(encodedKey);
  const current = workforceAttendance[key]?.[date] || '';
  const order = ['', '1', '0', 'FOLGA'];
  const next = order[(order.indexOf(current) + 1) % order.length];
  if (!workforceAttendance[key]) workforceAttendance[key] = {};
  if (next) workforceAttendance[key][date] = next;
  else delete workforceAttendance[key][date];
  if (!Object.keys(workforceAttendance[key]).length) delete workforceAttendance[key];
  workforceControlMeta = { updatedAt: new Date().toISOString() };
  saveLocalBackup();
  scheduleWorkforceRemoteSave();
  if (button) {
    button.dataset.value = next;
    button.className = `attendance-cell ${next === '1' ? 'present' : next === '0' ? 'absent' : next === 'FOLGA' ? 'off' : 'empty'}`;
    button.textContent = next === 'FOLGA' ? 'F' : next || '·';
    button.title = `${next === '1' ? 'Presente' : next === '0' ? 'Ausente' : next === 'FOLGA' ? 'Folga' : 'Sem marcação'} · clique para alterar`;
  }
  filterWorkforceControl();
  if (date === workforceSummaryDate) changeWorkforceSummaryDate(date);
}
function openPersonModal(index=null) {
  const person=index===null?null:workforce[index]; const companies=[...new Set(workforce.map(item=>item?.company).filter(Boolean))].sort(safeSort);
  modal(`<form onsubmit="savePerson(event,${index===null?'null':index})">${modalHead(person?'Editar pessoa':'Adicionar pessoa','Cadastro individual do efetivo da obra')}<div class="modal-body"><div class="form-grid"><div class="field full"><label>Empresa <em>*</em></label><input name="company" required list="companySuggestions" placeholder="Selecione ou digite uma nova empresa" value="${esc(person?.company||'')}"><datalist id="companySuggestions">${companies.map(company=>`<option value="${esc(company)}"></option>`).join('')}</datalist></div><div class="field full"><label>Nome completo <em>*</em></label><input name="name" required placeholder="Nome da pessoa" value="${esc(person?.name||'')}"></div><div class="field"><label>Função <em>*</em></label><input name="role" required placeholder="Ex.: Operador de PTA" value="${esc(person?.role||'')}"></div><div class="field"><label>Vínculo / status</label><select name="status"><option value="">Não informado</option><option value="DIRETA" ${person?.status==='DIRETA'?'selected':''}>Direta</option><option value="INDIRETA" ${person?.status==='INDIRETA'?'selected':''}>Indireta</option><option value="TERCEIRO" ${person?.status==='TERCEIRO'?'selected':''}>Terceiro</option></select></div><div class="field"><label>Perfil de Acesso</label><select name="accessRole"><option value="operator" ${person?.accessRole!=='admin'?'selected':''}>Operador / Campo (Sem acesso administrativo)</option><option value="admin" ${person?.accessRole==='admin'?'selected':''}>Gestor / Administrador (Acesso completo)</option></select></div><div class="field"><label>PIN de Acesso (Gestão)</label><input name="pin" maxlength="8" placeholder="Ex.: 1234" value="${esc(person?.pin||'')}"></div><div class="field full"><label>Telefone</label><input name="phone" placeholder="(85) 99999-9999" value="${esc(person?.phone||'')}"></div></div></div><div class="modal-foot"><button type="button" class="button button-outline" onclick="closeModal()">Cancelar</button><button class="button button-green">${icon('check')} Salvar pessoa</button></div></form>`,'modal-small');
}
function savePerson(event,index) {
  event.preventDefault(); const data=Object.fromEntries(new FormData(event.target)); Object.keys(data).forEach(key=>data[key]=String(data[key]).replace(/\s+/g,' ').trim());
  const duplicate=workforce.some((person,i)=>i!==index&&workforcePersonKey(person)===workforcePersonKey(data)); if(duplicate)return toast('Esta pessoa já está cadastrada nesta empresa.',true);
  const previous = index === null ? null : workforce[index];
  const previousKey = previous ? workforcePersonKey(previous) : '';
  if(index===null) { data.id=crypto.randomUUID(); workforce.push(data); } else { workforce[index]={...previous,...data}; }
  const nextPerson = index === null ? data : workforce[index];
  const nextKey = workforcePersonKey(nextPerson);
  if (previousKey && previousKey !== nextKey && workforceAttendance[previousKey]) {
    workforceAttendance[nextKey] = { ...(workforceAttendance[nextKey] || {}), ...workforceAttendance[previousKey] };
    delete workforceAttendance[previousKey];
  }
  workforce=normalizeWorkforcePeople(workforce); workforceMeta={source:'Cadastro manual',updatedAt:new Date().toISOString()}; workforceControlMeta={updatedAt:new Date().toISOString()}; saveLocalBackup(); scheduleWorkforceRemoteSave(0); closeModal(); renderCompanies(); toast(personMessage(index));
}
function personMessage(index) { return index===null?'Pessoa adicionada ao efetivo.':'Cadastro atualizado.'; }
function deletePerson(index) {
  const person=workforce[index]; if(!person||!confirm(`Excluir ${person.name} da lista de efetivo e suas marcações diárias?`))return; workforce.splice(index,1); delete workforceAttendance[workforcePersonKey(person)]; workforceMeta={source:'Cadastro manual',updatedAt:new Date().toISOString()}; workforceControlMeta={updatedAt:new Date().toISOString()}; if(supabase) supabase.from('workforce').delete().eq('id', person.id); saveLocalBackup(); scheduleWorkforceRemoteSave(0); renderCompanies(); toast('Pessoa removida da lista.');
}
function openWorkforceModal() {
  const companies=[...new Set(workforce.map(person=>person?.company).filter(Boolean))].sort(safeSort);
  modal(`${modalHead('Atualizar empresas e efetivo','Importe ou exporte o mesmo modelo de controle mensal')}<div class="modal-body"><div class="upload-zone" onclick="document.getElementById('workforceFile').click()"><span>${icon('download')}</span><div><h3>Selecionar planilha de efetivo</h3><p>Formatos .xlsx ou .xls · a aba mais recente será importada</p></div><button type="button" class="button button-outline compact">Escolher arquivo</button><input id="workforceFile" type="file" accept=".xlsx,.xls" hidden onchange="handleWorkforceUpload(event)"></div><div class="upload-info"><span>${icon('check')}</span><div><strong>${workforce.length} pessoas em ${companies.length} empresas</strong><small>${esc(workforceMeta.source||'Base inicial ainda não carregada')}</small></div></div><div class="company-chips">${companies.map(company=>`<span>${esc(company)} <b>${workforce.filter(person=>person?.company===company).length}</b></span>`).join('')}</div><div class="notice">${icon('alert')} O leitor identifica os cabeçalhos EMPRESA, NOME, FUNÇÃO e STATUS em qualquer coluna e também importa as marcações diárias 1, 0 e FOLGA. A exportação gera este mesmo modelo para o mês selecionado.</div></div><div class="modal-foot"><button class="button button-outline" onclick="exportWorkforceExcel()">${icon('download')} Exportar modelo de ${esc(workforceMonthLabel())}</button><button class="button button-green" onclick="closeModal()">Fechar</button></div>`,'modal-small');
}

function workforceSpreadsheetHeader(row) {
  const normalized = (Array.isArray(row) ? row : []).map(normalizeSpreadsheetHeader);
  const company = normalized.findIndex(value => value === 'empresa');
  const name = normalized.findIndex(value => value === 'nome');
  const status = normalized.findIndex(value => value === 'status' || value === 'vinculo status' || value === 'vinculo');
  const roles = normalized.map((value, index) => value === 'funcao' || value === 'funcao auxiliar' ? index : -1).filter(index => index >= 0);
  if (company < 0 || name < 0 || (status < 0 && !roles.length)) return null;
  return { company, name, status, roles, firstDailyColumn: Math.max(company, name, status, ...roles) + 1 };
}

function workforceSpreadsheetDateColumns(rows, headerIndex, firstDailyColumn) {
  const dates = new Map();
  for (let rowIndex = headerIndex; rowIndex >= Math.max(0, headerIndex - 5); rowIndex--) {
    const row = rows[rowIndex] || [];
    for (let column = firstDailyColumn; column < row.length; column++) {
      if (dates.has(column)) continue;
      const value = row[column];
      if (typeof value === 'number' && (value < 30000 || value > 80000)) continue;
      const date = spreadsheetDate(value);
      const year = Number(date.slice(0, 4));
      if (year < 2020 || year > 2100) continue;
      if (date) dates.set(column, date);
    }
  }
  return dates;
}

function parseWorkforceSpreadsheet(rows) {
  const headers = [];
  rows.forEach((row, index) => { const map = workforceSpreadsheetHeader(row); if (map) headers.push({ index, map }); });
  if (!headers.length) throw new Error('Não encontrei os cabeçalhos EMPRESA e NOME nesta aba.');
  const existingByKey = new Map(workforce.map(person => [workforcePersonKey(person), person]));
  const importedByKey = new Map();
  const importedAttendance = {};
  const importedDates = new Set();
  let inheritedDateColumns = new Map();
  headers.forEach((header, headerPosition) => {
    const end = headers[headerPosition + 1]?.index ?? rows.length;
    const localDateColumns = workforceSpreadsheetDateColumns(rows, header.index, header.map.firstDailyColumn);
    let dateColumns = new Map(inheritedDateColumns);
    localDateColumns.forEach((date, column) => dateColumns.set(column, date));
    if (dateColumns.size) inheritedDateColumns = new Map(dateColumns);
    for (let rowIndex = header.index + 1; rowIndex < end; rowIndex++) {
      const row = rows[rowIndex] || [];
      const company = String(row[header.map.company] || '').replace(/\s+/g, ' ').trim();
      const name = String(row[header.map.name] || '').replace(/\s+/g, ' ').trim();
      const companyHeader = normalizeSpreadsheetHeader(company);
      const nameHeader = normalizeSpreadsheetHeader(name);
      if (!company || !name || name.length < 4 || companyHeader === 'empresa' || companyHeader === 'total' || companyHeader.startsWith('total ') || nameHeader === 'nome' || nameHeader.startsWith('total de efetivos')) continue;
      const key = workforcePersonKey(company, name);
      const auxRole = String(row[header.map.roles[0]] || '').replace(/\s+/g, ' ').trim();
      const role = String(row[header.map.roles[1]] || row[header.map.roles[0]] || '').replace(/\s+/g, ' ').trim();
      const status = header.map.status >= 0 ? String(row[header.map.status] || '').replace(/\s+/g, ' ').trim() : '';
      const previous = importedByKey.get(key) || existingByKey.get(key) || {};
      importedByKey.set(key, { ...previous, id: previous.id || crypto.randomUUID(), company, name, auxRole: auxRole || previous.auxRole || '', role: role || previous.role || '', status: status || previous.status || '' });
      dateColumns.forEach((date, column) => {
        const marker = normalizeAttendanceValue(row[column]);
        if (!marker) return;
        importedDates.add(date);
        if (!importedAttendance[key]) importedAttendance[key] = {};
        importedAttendance[key][date] = marker;
      });
    }
  });
  if (!importedByKey.size) throw new Error('A planilha não possui pessoas válidas para importar.');
  return { people: normalizeWorkforcePeople([...importedByKey.values()]), attendance: importedAttendance, dates: [...importedDates].sort(), headers: headers.length };
}

async function handleWorkforceUpload(event) {
  const file=event.target.files?.[0]; if(!file) return;
  if(!await ensureExcelLibrary()) { event.target.value=''; return toast('Não foi possível carregar o leitor de Excel. Verifique a internet e tente novamente.',true); }
  try {
    const bytes=await file.arrayBuffer(); const workbook=XLSX.read(bytes,{type:'array',cellDates:true});
    let sheetName=''; let rows=[];
    for (const candidate of [...workbook.SheetNames].reverse()) {
      const candidateRows=XLSX.utils.sheet_to_json(workbook.Sheets[candidate],{header:1,defval:'',raw:true});
      if (candidateRows.some(row => workforceSpreadsheetHeader(row))) { sheetName=candidate; rows=candidateRows; break; }
    }
    if (!sheetName) throw new Error('Nenhuma aba possui os cabeçalhos EMPRESA e NOME do controle de efetivo.');
    const imported = parseWorkforceSpreadsheet(rows);
    workforce=imported.people;
    Object.entries(imported.attendance).forEach(([key, dates]) => { workforceAttendance[key] = { ...(workforceAttendance[key] || {}), ...dates }; });
    workforceMeta={source:file.name,updatedAt:new Date().toISOString()};
    workforceControlMeta={updatedAt:new Date().toISOString()};
    const latestDate = imported.dates[imported.dates.length - 1];
    if (latestDate) {
      workforceControlMonth = latestDate.slice(0, 7);
      workforceSummaryDate = latestDate;
    }
    saveLocalBackup();
    workforceView='control'; renderCompanies(); openWorkforceModal();
    const shared = await persistWorkforceControlRemote();
    toast(shared
      ? `${workforce.length} pessoas e ${imported.dates.length} dia(s) importados da aba ${sheetName} em todos os aparelhos.`
      : `${workforce.length} pessoas e ${imported.dates.length} dia(s) importados neste aparelho. A base compartilhada está indisponível.`, !shared);
  } catch(error) { toast(error.message||'Não foi possível ler esta planilha.',true); }
  finally { event.target.value=''; }
}

async function exportWorkforceExcel() {
  const exportPeople = currentPage === 'relatorios' ? getReportFilteredWorkforce() : workforce;
  if (!exportPeople.length) return toast('Nenhuma pessoa cadastrada para exportar.', true);
  if (!await ensureExcelExportLibrary()) return toast('Não foi possível carregar o gerador de Excel. Verifique a internet e tente novamente.', true);

  const dates = workforceMonthDates();
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Heating Cooling - DataCenter Omnia';
  workbook.created = new Date();

  // Load Heating Cooling Logo
  let logoId = null;
  try {
    const logoResp = await fetch('assets/heating-cooling-logo.png');
    if (logoResp.ok) {
      const logoBuffer = await logoResp.arrayBuffer();
      logoId = workbook.addImage({
        buffer: logoBuffer,
        extension: 'png',
      });
    }
  } catch (err) {
    console.warn('Não foi possível carregar a logo para a exportação de Excel:', err);
  }

  // Worksheet 1: CONTROLE MENSAL & QUADRO DE EFETIVOS
  const sheetName = workforceMonthLabel().split(' ')[0].toLocaleUpperCase('pt-BR').slice(0, 31);
  const worksheet = workbook.addWorksheet(sheetName, { views: [{ state: 'frozen', xSplit: 4, ySplit: 7 }] });

  // Add Logo at top left if loaded
  if (logoId !== null) {
    worksheet.addImage(logoId, {
      tl: { col: 0, row: 0 },
      ext: { width: 140, height: 42 }
    });
  }

  // Main Header Title
  worksheet.mergeCells(1, 1, 1, 4 + dates.length);
  const title = worksheet.getCell(1, 1);
  title.value = 'RELATÓRIO DE EFETIVO - HEATING COOLING (OBRA OMNIA-PÉCEM)';
  title.font = { bold: true, size: 14, color: { argb: 'FFFFFFFF' } };
  title.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF173C2C' } };
  title.alignment = { horizontal: 'center', vertical: 'middle' };
  worksheet.getRow(1).height = 34;

  worksheet.getCell('A2').value = 'PC: 131/24';
  worksheet.getCell('A3').value = 'Obras: 607 / DC OMNIA PÉCEM';
  worksheet.getCell('A4').value = 'Referente ao Mês:';
  worksheet.getCell('B4').value = workforceMonthLabel().toLocaleUpperCase('pt-BR');

  // Daily headers (dates)
  dates.forEach((date, index) => {
    const cell = worksheet.getCell(6, 5 + index);
    cell.value = new Date(`${date}T12:00:00`);
    cell.numFmt = 'dd/mm/yyyy';
    cell.alignment = { horizontal: 'center' };
  });

  const header = ['EMPRESA', 'NOME', 'FUNÇÃO', 'STATUS', ...dates.map(date => new Intl.DateTimeFormat('pt-BR', { weekday: 'long' }).format(new Date(`${date}T12:00:00`)).toLocaleUpperCase('pt-BR'))];
  const headerRow = worksheet.addRow(header);
  while (headerRow.number < 7) worksheet.insertRow(headerRow.number, []);
  
  const actualHeader = worksheet.getRow(7);
  actualHeader.values = header;
  actualHeader.height = 30;
  actualHeader.eachCell(cell => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 9 };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2F7D5B' } };
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
  });

  exportPeople.forEach(person => {
    const values = [
      person.company || '',
      person.name || '',
      person.role || person.auxRole || '',
      person.status || '',
      ...dates.map(date => {
        const value = workforceAttendanceValue(person, date);
        return value === '1' ? 1 : value === '0' ? 0 : value;
      })
    ];
    const row = worksheet.addRow(values);
    row.eachCell((cell, column) => {
      cell.alignment = { vertical: 'middle', horizontal: column > 4 ? 'center' : 'left', wrapText: column <= 4 };
      cell.border = { bottom: { style: 'hair', color: { argb: 'FFDCE6E0' } } };
      if (column > 4) {
        const value = String(cell.value ?? '');
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: value === '1' ? 'FFDDF3E7' : value === '0' ? 'FFFDE2E2' : value === 'FOLGA' ? 'FFFFF0C9' : 'FFFFFFFF' }
        };
      }
    });
  });

  const totalRow = worksheet.addRow(['TOTAL DE EFETIVOS DIÁRIO', '', '', '', ...dates.map(date => exportPeople.filter(person => workforceAttendanceValue(person, date) === '1').length)]);
  totalRow.font = { bold: true };
  totalRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEAF2ED' } };
  worksheet.mergeCells(totalRow.number, 1, totalRow.number, 4);
  totalRow.getCell(1).alignment = { horizontal: 'right' };

  // --- SEÇÃO QUADRO DE EFETIVOS (EMPRESA x DIÁRIO x GERAL) ---
  worksheet.addRow([]);
  const quadroHeaderTitle = worksheet.addRow(['QUADRO DE EFETIVO DIÁRIO X GERAL']);
  quadroHeaderTitle.font = { bold: true, size: 12, color: { argb: 'FF173C2C' } };
  
  const quadroHeader = worksheet.addRow(['EMPRESA', 'TOTAL DE EFETIVOS DIÁRIO', 'GERAL']);
  quadroHeader.height = 24;
  quadroHeader.eachCell(cell => {
    cell.font = { bold: true, color: { argb: 'FF000000' }, size: 10 };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFB4C6E7' } }; // Light blue grey matching screenshot
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
  });

  const companiesList = [...new Set(exportPeople.map(p => p.company).filter(Boolean))].sort(safeSort);
  let totalDailySum = 0;
  let totalGeralSum = 0;

  companiesList.forEach(company => {
    const people = exportPeople.filter(p => p.company === company);
    const dailyCount = people.filter(p => workforceAttendanceValue(p, workforceSummaryDate) === '1').length;
    const geralCount = people.length;
    totalDailySum += dailyCount;
    totalGeralSum += geralCount;

    const qRow = worksheet.addRow([company, dailyCount, geralCount]);
    qRow.eachCell((cell, colIndex) => {
      cell.alignment = { horizontal: colIndex === 1 ? 'left' : 'center', vertical: 'middle' };
      cell.font = { bold: colIndex > 1, size: 10 };
      cell.border = { top: { style: 'thin', color: { argb: 'FFCCCCCC' } }, left: { style: 'thin' }, bottom: { style: 'thin', color: { argb: 'FFCCCCCC' } }, right: { style: 'thin' } };
    });
  });

  const quadroTotalRow = worksheet.addRow(['TOTAL', totalDailySum, totalGeralSum]);
  quadroTotalRow.height = 22;
  quadroTotalRow.eachCell((cell, colIndex) => {
    cell.font = { bold: true, size: 11 };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE6E6E6' } };
    cell.alignment = { horizontal: colIndex === 1 ? 'left' : 'center', vertical: 'middle' };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FF000000' } },
      bottom: { style: 'double', color: { argb: 'FF000000' } },
      left: { style: 'thin' },
      right: { style: 'thin' }
    };
  });

  worksheet.columns.forEach((column, index) => {
    column.width = index === 0 ? 28 : index === 1 ? 38 : index === 2 ? 28 : index === 3 ? 14 : 11;
  });
  worksheet.autoFilter = { from: { row: 7, column: 1 }, to: { row: 7, column: 4 + dates.length } };
  worksheet.pageSetup = { orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0, paperSize: 9 };

  // Worksheet 2: QUADRO & RESUMO
  const summary = workbook.addWorksheet('RESUMO E QUADRO');
  if (logoId !== null) {
    summary.addImage(logoId, {
      tl: { col: 0, row: 0 },
      ext: { width: 140, height: 42 }
    });
  }
  summary.addRow([]);
  summary.addRow([]);
  
  const sumTitle = summary.addRow(['QUADRO RESUMO DE EFETIVOS POR EMPRESA']);
  sumTitle.font = { bold: true, size: 14, color: { argb: 'FF173C2C' } };
  summary.mergeCells(3, 1, 3, 3);
  
  const sumHeader = summary.addRow(['EMPRESA', 'TOTAL DE EFETIVOS DIÁRIO', 'GERAL']);
  sumHeader.height = 24;
  sumHeader.eachCell(cell => {
    cell.font = { bold: true, color: { argb: 'FF000000' }, size: 10 };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFB4C6E7' } };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
  });

  companiesList.forEach(company => {
    const people = exportPeople.filter(p => p.company === company);
    const dailyCount = people.filter(p => workforceAttendanceValue(p, workforceSummaryDate) === '1').length;
    const sRow = summary.addRow([company, dailyCount, people.length]);
    sRow.eachCell((cell, colIndex) => {
      cell.alignment = { horizontal: colIndex === 1 ? 'left' : 'center', vertical: 'middle' };
      cell.font = { bold: colIndex > 1, size: 10 };
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    });
  });

  const sTotalRow = summary.addRow(['TOTAL', totalDailySum, totalGeralSum]);
  sTotalRow.height = 22;
  sTotalRow.eachCell((cell, colIndex) => {
    cell.font = { bold: true, size: 11 };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE6E6E6' } };
    cell.alignment = { horizontal: colIndex === 1 ? 'left' : 'center', vertical: 'middle' };
    cell.border = { top: { style: 'thin' }, bottom: { style: 'double' }, left: { style: 'thin' }, right: { style: 'thin' } };
  });

  summary.columns = [
    { key: 'company', width: 32 },
    { key: 'daily', width: 28 },
    { key: 'geral', width: 16 }
  ];

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `relatorio-efetivo-omnia-${workforceControlMonth}.xlsx`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  toast(`Planilha com Quadro e Logo exportada com sucesso.`);
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
  return `<section class="report-filter-panel"><div class="report-filter-head"><div><span>${icon('search')}</span><div><h2>Filtrar antes de baixar</h2><p>Os filtros abaixo serão aplicados aos PDFs e às planilhas.</p></div></div><button class="button button-outline compact" onclick="clearReportFilters()">Limpar filtros</button></div><div class="report-filter-grid"><label class="filter-field"><span>Empresa</span><select id="reportCompany" onchange="updateReportFilterSummary()"><option value="">Todas</option>${options(companies)}</select></label><label class="filter-field"><span>Pessoa / responsável</span><select id="reportPerson" onchange="updateReportFilterSummary()"><option value="">Todas</option>${options(people)}</select></label><label class="filter-field"><span>Equipamento</span><select id="reportEquipment" onchange="updateReportFilterSummary()"><option value="">Todos</option>${equipments.map(eq=>`<option value="${eq.id}">${esc(eq.code)} — ${esc(eq.model||eq.name)}</option>`).join('')}</select></label><label class="filter-field"><span>Status atual</span><select id="reportStatus" onchange="updateReportFilterSummary()"><option value="">Todos</option><option value="in-use">Em uso</option><option value="available">Disponível</option><option value="maintenance">Indisponível</option></select></label><label class="filter-field"><span>Tipo de equipamento</span><select id="reportType" onchange="updateReportFilterSummary()"><option value="">Todos</option>${options(types)}</select></label><label class="filter-field"><span>Data Hall / área</span><select id="reportHall" onchange="updateReportFilterSummary()"><option value="">Todos</option>${options(halls)}</select></label><label class="filter-field"><span>Resultado do checklist</span><select id="reportResult" onchange="updateReportFilterSummary()"><option value="">Todos</option><option value="approved">Aprovado</option><option value="failed">Reprovado</option></select></label><label class="filter-field"><span>Data inicial</span><input id="reportStart" type="date" onchange="updateReportFilterSummary()"></label><label class="filter-field"><span>Data final</span><input id="reportEnd" type="date" onchange="updateReportFilterSummary()"></label></div><div class="report-filter-summary" id="reportFilterSummary"></div></section>`;
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
  return eq.status==='in-use'?'EM USO':eq.status==='maintenance'?'INDISPONÍVEL':'DISPONÍVEL';
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
    summary=`<span><b>${selectedEquipments.length}</b> equipamentos</span><span><b>${selectedEquipments.filter(e=>e.status==='available').length}</b> disponíveis</span><span><b>${selectedEquipments.filter(e=>e.status==='in-use').length}</b> em uso</span><span><b>${selectedEquipments.filter(e=>e.status==='maintenance').length}</b> indisponíveis</span>`;
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
  modal(`<form id="equipmentForm" onsubmit="saveEquipment(event,'${id||''}')">${modalHead(eq?'Editar equipamento':'Novo equipamento',eq?'Atualize os dados do ativo':'Cadastre um ativo e gere seu QR Code')}<div class="modal-body"><div class="form-grid"><div class="field"><label>Tipo de equipamento <em>*</em></label><select name="type" required><option value="">Selecione...</option>${['PTA Tesoura','PTA Articulada','PTA Mastro','Paleteira Elétrica'].map(v=>`<option ${eq?.type===v?'selected':''}>${v}</option>`).join('')}</select></div><div class="field"><label>Código de identificação (Patrimônio) <em>*</em></label><input name="code" required placeholder="Ex.: TPTA00674" value="${esc(eq?.code||'')}"></div><div class="field"><label>Nº AF (Afonso França)</label><input name="afNumber" placeholder="Ex.: AF-001" value="${esc(eq?.afNumber||'')}"></div><div class="field full"><label>Nome do equipamento <em>*</em></label><input name="name" required placeholder="Ex.: Plataforma Tesoura 10m" value="${esc(eq?.name||'')}"></div><div class="field"><label>Fabricante <em>*</em></label><input name="brand" required placeholder="Ex.: JLG" value="${esc(eq?.brand||'')}"></div><div class="field"><label>Modelo <em>*</em></label><input name="model" required placeholder="Ex.: 2646ES" value="${esc(eq?.model||'')}"></div><div class="field"><label>Número de série</label><input name="serial" placeholder="Número do fabricante" value="${esc(eq?.serial||'')}"></div><div class="field"><label>Capacidade</label><input name="capacity" placeholder="Ex.: 450 kg" value="${esc(eq?.capacity||'')}"></div><div class="field"><label>Status inicial</label><select name="status"><option value="available" ${!eq||eq.status==='available'?'selected':''}>Disponível</option><option value="maintenance" ${eq?.status==='maintenance'?'selected':''}>Indisponível</option></select></div><div class="field"><label>Data da última inspeção</label><input name="inspection" type="date" value="${eq?.inspection||new Date().toISOString().slice(0,10)}"></div></div></div><div class="modal-foot">${eq ? `<button type="button" class="button button-ghost" style="color:var(--danger,#ef4444);margin-right:auto;" onclick="deleteEquipment('${id}')">${icon('trash')} Excluir equipamento</button>` : ''}<button type="button" class="button button-outline" onclick="closeModal()">Cancelar</button><button class="button button-green" type="submit">${icon('check')} ${eq?'Salvar alterações':'Cadastrar equipamento'}</button></div></form>`, 'modal-large');
}
async function saveEquipment(event, id) {
  event.preventDefault(); const data = Object.fromEntries(new FormData(event.target));
  if (equipments.some(e => e.code.toLowerCase() === data.code.toLowerCase() && e.id !== id)) return toast('Este código já está cadastrado.', true);
  if (id) {
    const index = equipments.findIndex(e=>e.id===id); equipments[index] = { ...equipments[index], ...data, status: equipments[index].status==='in-use' ? 'in-use' : data.status };
  } else {
    const newId = `${data.type.includes('Paleteira')?'pal':'pta'}-${Date.now()}`; equipments.unshift({ id:newId, ...data, usage:null });
  }
  const changedEquipment = equipments.find(e => e.id === (id || equipments[0]?.id));
  if (changedEquipment) changedEquipment.updatedAt = new Date().toISOString();
  saveLocalBackup();
  localDataRevision += 1;
  let shared = true;
  try {
    if (changedEquipment) await persistEquipmentRecords([changedEquipment]);
  } catch (error) {
    shared = false;
    console.warn('Cadastro salvo somente neste aparelho:', error);
  }
  closeModal(); render();
  toast(shared
    ? (id?'Equipamento atualizado em todos os aparelhos.':'Equipamento cadastrado em todos os aparelhos. QR Code pronto para impressão.')
    : 'Cadastro salvo somente neste aparelho. Verifique a internet e tente novamente.',
    !shared);
}
async function deleteEquipment(id) {
  const eq = equipments.find(e => e.id === id);
  if (!eq) return;
  if (!confirm(`Tem certeza que deseja excluir a PTA / Equipamento ${eq.code} (${eq.name}) do sistema?`)) return;
  equipments = equipments.filter(e => e.id !== id);
  saveLocalBackup();
  localDataRevision += 1;
  let shared = true;
  try {
    const client = getSupabase();
    if (client) {
      const { error } = await client.from('equipments').delete().eq('id', id);
      if (error) throw error;
    } else {
      await supabaseRestRequest(`equipments?id=eq.${encodeURIComponent(id)}`, { method: 'DELETE' });
    }
  } catch (error) {
    shared = false;
    console.warn('Exclusão salva somente neste aparelho:', error);
  }
  closeModal();
  render();
  toast(shared ? `PTA ${eq.code} removida com sucesso em todos os aparelhos.` : `PTA ${eq.code} removida neste aparelho.`);
}

function openEquipmentDetails(id) {
  const eq = equipments.find(e=>e.id===id); if (!eq) return;
  if (eq.status === 'available') return openCheckoutModal(id);
  const usage = eq.usage || {
    company: eq.contractor || '—',
    responsible: eq.contractor || 'Em uso (Planilha)',
    activity: 'Em uso via planilha',
    dataHall: '—',
    location: '—',
    expectedAt: '',
    startedAt: '',
    phone: ''
  };
  modal(`${modalHead(eq.name,`${eq.code} · ${eq.brand} ${eq.model}`)}<div class="modal-body"><div class="equipment-summary"><span class="asset-icon">${equipmentIcon(eq)}</span><div><strong>${esc(eq.name)}</strong><small>Série ${esc(eq.serial)} · Horímetro ${esc(eq.hourmeter ?? '—')} h${eq.battery?` · Bateria ${esc(eq.battery)}`:''}</small></div>${statusBadge(eq.status)}</div>${eq.status==='in-use'?`<div class="form-grid"><div class="field"><label>Empresa</label><strong>${esc(usage.company)}</strong></div><div class="field"><label>Responsável</label><strong>${esc(usage.responsible)}</strong></div><div class="field full"><label>Atividade</label><strong>${esc(usage.activity||'—')}</strong></div><div class="field"><label>DH / Local específico</label><strong>${esc(usage.dataHall)} · ${esc(usage.location)}</strong></div><div class="field"><label>Previsão de entrega</label><strong>${fullDate(usage.expectedAt)}</strong></div><div class="field"><label>Retirada em</label><strong>${fullDate(usage.startedAt)}</strong></div><div class="field"><label>Contato</label><strong>${esc(usage.phone)}</strong></div></div>`:`<div class="notice">${icon(eq.status==='maintenance'?'tool':'check')} ${eq.status==='maintenance'?'Este equipamento está bloqueado para manutenção. Edite o cadastro para liberá-lo após a inspeção.':'Equipamento disponível no Pátio / Base e pronto para retirada.'}</div>`}</div><div class="modal-foot"><button class="button button-outline danger-button" style="color:var(--red);border-color:var(--red-soft);margin-right:auto;" onclick="deleteEquipment('${id}')">${icon('trash')} Excluir PTA</button><button class="button button-ghost" onclick="openEquipmentModal('${id}')">${icon('edit')} Editar</button><button class="button button-outline" onclick="openQRModal('${id}')">${icon('qr')} QR Code</button>${eq.status==='in-use'?`<button class="button button-outline" onclick="openDailyInspectionModal('${id}')">${icon('plus')} Inspeção Diária (Novo Dia)</button><button class="button button-green" onclick="openReturnModal('${id}')">${icon('return')} Registrar devolução</button>`:''}</div>`);
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
  const movement=history.find(item=>String(item.id)===String(historyId)); if(!movement?.inspection) return toast('Formulário não disponível.',true);
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
  modal(`${modalHead('Informações do equipamento','Acesso público pelo QR Code')}<div class="modal-body"><section class="public-equipment-head"><span>${equipmentIcon(eq)}</span><div><small>${esc(eq.code)} · <strong style="color:#206b49;">Nº AF: ${esc(afVal)}</strong></small><h2>${esc(eq.name)}</h2><p>${esc(eq.model)} · Série ${esc(eq.serial)} · Empreiteiro: <strong>${esc(contractor)}</strong></p></div>${statusBadge(eq.status)}</section><div class="public-specs"><span><small>Nº AF (Afonso França)</small><strong style="color:#206b49;">${esc(afVal)}</strong></span><span><small>Empreiteiro</small><strong>${esc(contractor)}</strong></span><span><small>Horímetro</small><strong>${esc(eq.hourmeter??'—')} h</strong></span><span><small>Bateria</small><strong>${esc(eq.battery||'—')}</strong></span></div>${usage?`<section class="public-use-card"><h3>Utilização atual</h3><div class="public-use-grid"><span><small>Responsável</small><strong>${esc(usage.responsible)}</strong><em>${esc(usage.company)}</em></span><span><small>Atividade</small><strong>${esc(usage.activity||'—')}</strong></span><span><small>DH e local</small><strong>${esc(usage.dataHall)} · ${esc(usage.location)}</strong></span><span><small>Previsão de devolução</small><strong>${fullDate(usage.expectedAt)}</strong></span></div></section>`:`<div class="public-availability">${icon(eq.status==='maintenance'?'tool':'check')}<div><strong>${eq.status==='maintenance'?'Equipamento bloqueado':'Equipamento disponível'}</strong><small>${eq.status==='maintenance'?'Aguardando manutenção e nova liberação.':'Local atual: Pátio / Base'}</small></div></div>`}${latest?`<button class="public-checklist-link" onclick="openInspectionRecord('${latest.id}')">${icon('file')}<span><strong>Último formulário de verificação</strong><small>${fullDate(latest.inspection.inspectedAt)} · ${latest.inspection.mode==='devolucao'?'Devolução':'Retirada'}</small></span>${icon('chevron')}</button>`:''}</div><div class="modal-foot"><button class="button button-outline" onclick="closeModal()">Fechar</button>${eq.status==='available'?`<button class="button button-green" onclick="openCheckoutModal('${id}')">${icon('check')} Retirar com checklist</button>`:''}${eq.status==='in-use'?`<button class="button button-outline" onclick="openDailyInspectionModal('${id}')">${icon('plus')} Inspeção Diária (Novo Dia)</button><button class="button button-green" onclick="openReturnModal('${id}')">${icon('return')} Registrar devolução</button>`:''}</div>`,'modal-large');
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
  const hadServiceWorkerController = Boolean(navigator.serviceWorker.controller);
  let reloadingForServiceWorker = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!hadServiceWorkerController || reloadingForServiceWorker) return;
    reloadingForServiceWorker = true;
    location.reload();
  });
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js', { updateViaCache: 'none' })
      .then(registration => registration.update())
      .catch(error => {
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


