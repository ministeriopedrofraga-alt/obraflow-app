const fs = require('fs');
const vm = require('vm');
const { performance } = require('perf_hooks');

const store = new Map();
const rows = Array.from({ length: 4484 }, (_, index) => ({
  id: `spool-${index}`,
  number: String(index + 1),
  dh: 'DH 04',
  area: 'supercore',
  sectorName: 'SUPERCORE',
  type: 'straight',
  diameter: '10"',
  status: index < 232 ? 'installed' : 'not-started',
  installedDate: index < 232 ? '2026-10-31' : '',
  installedAt: index < 232 ? '2026-10-31T12:00:00.000Z' : '',
  updatedAt: '2026-10-31T12:00:00.000Z'
}));
store.set('obraflow_spools_v5', JSON.stringify(rows));

const app = { innerHTML: '' };
const nav = { textContent: '' };
const requests = [];
const context = {
  console,
  setTimeout,
  clearTimeout,
  Date,
  Math,
  JSON,
  Intl,
  URLSearchParams,
  localStorage: {
    getItem: key => store.get(key) || null,
    setItem: (key, value) => store.set(key, String(value)),
    removeItem: key => store.delete(key)
  },
  navigator: { onLine: true },
  location: { hash: '#spools' },
  document: {
    getElementById: id => id === 'app' ? app : id === 'navSpoolCount' ? nav : null,
    querySelectorAll: () => [],
    querySelector: () => null
  },
  requestAnimationFrame: callback => callback(),
  window: null,
  currentUser: { name: 'Teste' },
  pageHeader: (_title, _subtitle, _eyebrow, actions) => actions,
  icon: () => '',
  hydrateIcons: () => {},
  esc: value => String(value ?? '').replace(/[&<>"]/g, ''),
  toast: () => {},
  modal: () => {},
  closeModal: () => {},
  confirm: () => true
};
context.supabaseRestRequest = async (path, options = {}) => {
  requests.push({ path, options });
  return options.method === 'POST' ? null : [];
};
context.window = context;
context.window.innerWidth = 390;

vm.createContext(context);
vm.runInContext(fs.readFileSync('spools.js', 'utf8'), context, { filename: 'spools.js' });

const startedAt = performance.now();
context.window.renderSpools();
const renderMs = Math.round(performance.now() - startedAt);
const result = {
  records: rows.length,
  renderMs,
  htmlBytes: Buffer.byteLength(app.innerHTML),
  renderedRows: (app.innerHTML.match(/<tr /g) || []).length,
  renderedCards: (app.innerHTML.match(/spool-tube-card/g) || []).length,
  pagination: app.innerHTML.includes('Pagina 1/57')
};

async function run() {
  if (result.renderedCards !== 80 || !result.pagination) {
    throw new Error(`Falha na paginacao: ${JSON.stringify(result)}`);
  }

  // Reproduz o caso real do Corredor FW A: 64 trechos retos instalados e
  // 276 ramais ainda nao instalados. O mapa geral deve mostrar 19%, enquanto
  // o recorte "Trecho reto" precisa mostrar 100% (64/64).
  const fwAFixture = [
    ...Array.from({ length: 64 }, (_, index) => ({
      id: `fw-a-straight-${index}`,
      number: `R${index + 1}`,
      dh: 'DH 04',
      area: 'fw-a',
      sectorName: 'Corredor FW A',
      type: 'straight',
      diameter: '10"',
      status: 'installed'
    })),
    ...Array.from({ length: 276 }, (_, index) => ({
      id: `fw-a-branch-${index}`,
      number: `D${index + 1}`,
      dh: 'DH 04',
      area: 'fw-a',
      sectorName: 'Corredor FW A',
      type: 'branch',
      diameter: '2.1/2"',
      status: 'not-started'
    }))
  ];
  const fwASectors = [{ id: 'fw-a', name: 'Corredor FW A', icon: 'FW' }];

  vm.runInContext("spoolActiveDh='DH 04'; spoolActiveSector='fw-a'; spoolActiveSubArea='all'; spoolTypeFilter='all'; spoolDiameterFilter='all'; spoolListFilter='all'; spoolStatusFilter='all'; spoolDateFilterMode='all'; spoolSearchTerm='';", context);
  const generalMap = context.window.spoolRenderSectorMap(fwAFixture, fwASectors);
  result.generalProgressPreserved = generalMap.includes('64/340') && generalMap.includes('19% instalado');

  vm.runInContext("spoolTypeFilter='straight';", context);
  const straightMap = context.window.spoolRenderSectorMap(fwAFixture, fwASectors);
  result.straightProgressCorrect = straightMap.includes('64/64')
    && straightMap.includes('100% instalado')
    && straightMap.includes('Trechos retos');

  // Status e data filtram a relacao operacional, mas nao o denominador fisico.
  vm.runInContext("spoolTypeFilter='all'; spoolStatusFilter='installed'; spoolDateFilterMode='installed';", context);
  const statusMap = context.window.spoolRenderSectorMap(fwAFixture, fwASectors);
  result.statusDoesNotFakeProgress = statusMap.includes('64/340') && statusMap.includes('19% instalado');

  // O card rapido de classificacao usa spoolListFilter, entao deve produzir o
  // mesmo recorte do select avancado.
  vm.runInContext("spoolStatusFilter='all'; spoolDateFilterMode='all'; spoolListFilter='straight';", context);
  const quickStraightMap = context.window.spoolRenderSectorMap(fwAFixture, fwASectors);
  result.quickTypeProgressCorrect = quickStraightMap.includes('64/64') && quickStraightMap.includes('100% instalado');

  if (!result.generalProgressPreserved || !result.straightProgressCorrect || !result.statusDoesNotFakeProgress || !result.quickTypeProgressCorrect) {
    throw new Error(`Falha no escopo do mapa de progresso: ${JSON.stringify(result)}`);
  }

  vm.runInContext("spoolActiveDh='ALL'; spoolActiveSector='all'; spoolTypeFilter='all'; spoolListFilter='all'; spoolStatusFilter='all'; spoolDateFilterMode='all';", context);

  context.window.spoolSetItemStatus('spool-300', 'installed');
  context.window.spoolSetItemStatus('spool-301', 'installed');
  context.window.spoolSetItemStatus('spool-302', 'installed');
  await new Promise(resolve => setTimeout(resolve, 1600));

  const posts = requests.filter(request => request.options.method === 'POST');
  result.consolidatedPosts = posts.length;
  result.genericQueueDisabled = posts[0]?.options.queueOffline === false;
  result.postContainsAllChanges = posts.length === 1
    && ['spool-300', 'spool-301', 'spool-302'].every(id => {
      const payload = JSON.parse(posts[0].options.body);
      return payload.value.spools.some(item => item.id === id && item.status === 'installed');
    });

  if (result.consolidatedPosts !== 1 || !result.genericQueueDisabled || !result.postContainsAllChanges) {
    throw new Error(`Falha na consolidacao: ${JSON.stringify(result)}`);
  }

  const legacyRecord = {
    id: 'POST:app_metadata:spool_registry',
    table: 'app_metadata',
    resource: 'spool_registry',
    revision: 'legacy-1',
    body: JSON.stringify({
      key: 'spool_registry',
      value: {
        spools: [{ ...rows[400], status: 'installed', installedDate: '2026-10-31', installedAt: '2026-10-31T18:00:00.000Z', updatedAt: '2026-10-31T18:00:00.000Z' }]
      }
    })
  };
  let legacyQueue = [legacyRecord];
  context.window.ObraflowOfflineSync = {
    list: async () => legacyQueue.slice(),
    complete: async record => {
      legacyQueue = legacyQueue.filter(item => item.revision !== record.revision);
      return true;
    },
    refresh: async () => {}
  };
  result.recoveredLegacyRecords = await context.window.spoolRecoverLegacyOfflineMutation();
  const recoveredRows = JSON.parse(store.get('obraflow_spools_v5'));
  result.legacyInstalledPreserved = recoveredRows.some(item => item.id === 'spool-400' && item.status === 'installed');
  result.legacyQueueCleared = legacyQueue.length === 0;

  if (result.recoveredLegacyRecords !== 1 || !result.legacyInstalledPreserved || !result.legacyQueueCleared) {
    throw new Error(`Falha na recuperacao: ${JSON.stringify(result)}`);
  }

  const returnedBase = { ...rows[600], status: 'returned', returnedBy: 'Teste', returnedReason: 'Correcao' };
  context.window.spoolConfirmImport([{
    ...returnedBase,
    returnedDate: '2026-09-15',
    returnedAt: '2026-09-15T14:30:00.000Z'
  }]);
  context.window.spoolConfirmImport([{
    ...returnedBase,
    returnedDate: '',
    returnedAt: ''
  }]);
  const afterReimport = JSON.parse(store.get('obraflow_spools_v5'))
    .find(item => item.id === returnedBase.id);
  result.returnedDatePreserved = afterReimport?.returnedDate === '2026-09-15';
  result.returnedTimePreserved = afterReimport?.returnedAt === '2026-09-15T14:30:00.000Z';

  if (!result.returnedDatePreserved || !result.returnedTimePreserved) {
    throw new Error(`Falha no historico da importacao: ${JSON.stringify(result)}`);
  }
  console.log(JSON.stringify(result, null, 2));
}

run().catch(error => {
  console.error(error.message);
  process.exit(1);
});
