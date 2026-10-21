/* ==========================================================================
   OBRAFLOW — CONTROLE OPERACIONAL DE SPOOLS & TUBULAÇÕES
   Setores Oficiais:
   1. Corredor FW A
   2. Corredor FW B
   3. Corredor Gerador
   4. Salas Elétricas
   5. CAG (Central de Água Gelada)
   6. SUPERCORE
   7. Salas RMUs
   Subir Planilha · Baixar Planilha Atualizada · Filtros Avançados · Campo DH
   ========================================================================== */

const SPOOL_STORE_KEY = 'obraflow_spools_v5';
try {
  localStorage.removeItem('obraflow_spools_v4');
  localStorage.removeItem('obraflow_spools_v3');
  localStorage.removeItem('obraflow_spools_v2');
} catch (e) {}
const SPOOL_LOG_KEY = 'obraflow_spool_daily_log_v4';

// Normalização universal de Data Hall (DH): 'DH 4', 'dh04', '4', 'DH-04' -> 'DH 04'
function normalizeDh(rawDh) {
  if (!rawDh) return 'DH 04';
  const str = String(rawDh).trim();
  const match = str.match(/(\d+)/);
  if (match) {
    const num = parseInt(match[1], 10);
    return `DH ${String(num).padStart(2, '0')}`;
  }
  if (/^dh/i.test(str)) {
    return str.toUpperCase();
  }
  return str || 'DH 04';
}

// Normalização inteligente de setores (reconhece variações de digitação na planilha)
function normalizeSector(rawSec) {
  if (!rawSec) return 'fw-a';
  const s = String(rawSec).toLowerCase().trim();
  if (/gerador/.test(s)) return 'gerador';
  if (/el[eé]tric/.test(s)) return 'eletricas';
  if (/cag|chiller|gelada|central.*[aá]gua/.test(s)) return 'cag';
  if (/fw.*a|fan.*wall.*a|cws|aag/.test(s)) return 'fw-a';
  if (/fw.*b|fan.*wall.*b|cwr|rag/.test(s)) return 'fw-b';
  if (/supercore/.test(s)) return 'supercore';
  if (/rmu/.test(s)) return 'rmus';
  return s;
}

// Setores Oficiais da Obra Atualizados com Corredor Gerador, Salas Elétricas e CAG
const SPOOL_SECTORS = {
  'fw-a': { id: 'fw-a', name: 'Corredor FW A', icon: '🏢', line: 'Alimentação AAG (Água Gelada CWS)' },
  'fw-b': { id: 'fw-b', name: 'Corredor FW B', icon: '🏢', line: 'Retorno RAG (Água Gelada CWR)' },
  'gerador': { id: 'gerador', name: 'Corredor Gerador', icon: '⚙️', line: 'Tubulações & Resfriamento dos Geradores' },
  'eletricas': { id: 'eletricas', name: 'Salas Elétricas', icon: '💡', line: 'Alimentação & Infra Elétrica' },
  'cag': { id: 'cag', name: 'CAG', icon: '❄️', line: 'Central de Água Gelada (Chillers & Bombas)' },
  'supercore': { id: 'supercore', name: 'SUPERCORE', icon: '⚡', line: 'Barramento Principal & Prumadas' },
  'rmus': { id: 'rmus', name: 'Salas RMUs', icon: '🔌', line: 'Distribuição Elétrica & Refrigeração' }
};

// Árvore Hierárquica de Áreas e Subtipos (Preparada para os ramos e sub-áreas da obra)
const SPOOL_AREA_TREE = {
  'cag': {
    id: 'cag',
    name: 'CAG (Central de Água Gelada)',
    icon: '❄️',
    subAreas: [
      { id: 'chillers', name: 'Chillers' },
      { id: 'bombas-primarias', name: 'Bombas Primárias (CWP/PCH)' },
      { id: 'bombas-secundarias', name: 'Bombas Secundárias (SCH)' },
      { id: 'torres', name: 'Torres de Resfriamento' },
      { id: 'barramento-cag', name: 'Barramento / Coletor CAG' },
      { id: 'geral-cag', name: 'Geral CAG' }
    ]
  },
  'supercore': {
    id: 'supercore',
    name: 'SUPERCORE',
    icon: '⚡',
    subAreas: [
      { id: 'prumadas', name: 'Prumadas Principais' },
      { id: 'barramento-sc', name: 'Barramento Supercore' },
      { id: 'fw-feeds', name: 'Alimentadores Fanwalls' }
    ]
  },
  'fw-a': {
    id: 'fw-a',
    name: 'Corredor FW A',
    icon: '🏢',
    subAreas: [
      { id: 'ramal-fw-a', name: 'Ramais FW A' },
      { id: 'linha-mestra-a', name: 'Linha Mestra FW A' }
    ]
  },
  'fw-b': {
    id: 'fw-b',
    name: 'Corredor FW B',
    icon: '🏢',
    subAreas: [
      { id: 'ramal-fw-b', name: 'Ramais FW B' },
      { id: 'linha-mestra-b', name: 'Linha Mestra FW B' }
    ]
  },
  'gerador': {
    id: 'gerador',
    name: 'Corredor Gerador',
    icon: '⚙️',
    subAreas: [
      { id: 'arrefecimento', name: 'Arrefecimento Geradores' },
      { id: 'combustivel', name: 'Combustível / Diesel' }
    ]
  },
  'eletricas': {
    id: 'eletricas',
    name: 'Salas Elétricas',
    icon: '💡',
    subAreas: [
      { id: 'infra-eletrica', name: 'Infraestrutura HVAC' }
    ]
  },
  'rmus': {
    id: 'rmus',
    name: 'Salas RMUs',
    icon: '🔌',
    subAreas: [
      { id: 'infra-rmus', name: 'Infraestrutura RMUs' }
    ]
  }
};

function spoolTextKey(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function spoolCanonicalSubArea(value, sectorId = '') {
  const valueKey = spoolTextKey(value);
  if (!valueKey) return '';

  const trees = sectorId && SPOOL_AREA_TREE[sectorId]
    ? [SPOOL_AREA_TREE[sectorId]]
    : Object.values(SPOOL_AREA_TREE);

  for (const tree of trees) {
    const match = (tree.subAreas || []).find(sub => {
      const idKey = spoolTextKey(sub.id);
      const nameKey = spoolTextKey(sub.name);
      return valueKey === idKey || valueKey === nameKey;
    });
    if (match) return match.id;
  }

  return valueKey;
}

function spoolDisplayNumber(spool) {
  if (!spool) return '';
  return `${spool.number || ''}${spool.part ? ` (${spool.part})` : ''}`;
}

function spoolBuildStableId(spool) {
  const parts = [
    'spool',
    normalizeDh(spool.dh),
    normalizeSector(spool.area),
    spool.number,
    spool.part || spool.seq || '',
    spool.circuit || '',
    spoolCanonicalSubArea(spool.subArea, normalizeSector(spool.area))
  ].map(spoolTextKey).filter(Boolean);
  return parts.join('-');
}

// 34 Spools Oficiais do SUPERCORE DH 04 (Identificados a partir do esquema do tablet)
// 45 Spools Oficiais do Projeto (34 SUPERCORE DH 04 + 11 Corredor FW A DH 08)
const DEFAULT_OFFICIAL_SPOOLS = [
  {
    "id": "spool-DH08-fw-a-3900",
    "number": "3900",
    "dh": "DH 08",
    "area": "fw-a",
    "type": "straight",
    "diameter": "10\"",
    "status": "not-started",
    "installedDate": "",
    "installedAt": "",
    "installedBy": "",
    "receivedDate": "",
    "receivedAt": "",
    "notes": ""
  },
  {
    "id": "spool-DH08-fw-a-3901",
    "number": "3901",
    "dh": "DH 08",
    "area": "fw-a",
    "type": "straight",
    "diameter": "10\"",
    "status": "not-started",
    "installedDate": "",
    "installedAt": "",
    "installedBy": "",
    "receivedDate": "",
    "receivedAt": "",
    "notes": ""
  },
  {
    "id": "spool-DH08-fw-a-3902",
    "number": "3902",
    "dh": "DH 08",
    "area": "fw-a",
    "type": "straight",
    "diameter": "10\"",
    "status": "not-started",
    "installedDate": "",
    "installedAt": "",
    "installedBy": "",
    "receivedDate": "",
    "receivedAt": "",
    "notes": ""
  },
  {
    "id": "spool-DH08-fw-a-3903",
    "number": "3903",
    "dh": "DH 08",
    "area": "fw-a",
    "type": "straight",
    "diameter": "10\"",
    "status": "installed",
    "installedDate": "2026-10-17",
    "installedAt": "2026-10-17T21:14:59.765Z",
    "installedBy": "Pedro Alves",
    "receivedDate": "2026-10-17",
    "receivedAt": "2026-10-17T21:14:58.068Z",
    "notes": ""
  },
  {
    "id": "spool-DH08-fw-a-3904",
    "number": "3904",
    "dh": "DH 08",
    "area": "fw-a",
    "type": "straight",
    "diameter": "10\"",
    "status": "not-started",
    "installedDate": "",
    "installedAt": "",
    "installedBy": "",
    "receivedDate": "",
    "receivedAt": "",
    "notes": ""
  },
  {
    "id": "spool-DH08-fw-a-3905",
    "number": "3905",
    "dh": "DH 08",
    "area": "fw-a",
    "type": "straight",
    "diameter": "10\"",
    "status": "not-started",
    "installedDate": "",
    "installedAt": "",
    "installedBy": "",
    "receivedDate": "",
    "receivedAt": "",
    "notes": ""
  },
  {
    "id": "spool-DH08-fw-a-3906",
    "number": "3906",
    "dh": "DH 08",
    "area": "fw-a",
    "type": "straight",
    "diameter": "10\"",
    "status": "not-started",
    "installedDate": "",
    "installedAt": "",
    "installedBy": "",
    "receivedDate": "",
    "receivedAt": "",
    "notes": ""
  },
  {
    "id": "spool-DH08-fw-a-3907",
    "number": "3907",
    "dh": "DH 08",
    "area": "fw-a",
    "type": "straight",
    "diameter": "10\"",
    "status": "not-started",
    "installedDate": "",
    "installedAt": "",
    "installedBy": "",
    "receivedDate": "",
    "receivedAt": "",
    "notes": ""
  },
  {
    "id": "spool-DH08-fw-a-3908",
    "number": "3908",
    "dh": "DH 08",
    "area": "fw-a",
    "type": "straight",
    "diameter": "10\"",
    "status": "not-started",
    "installedDate": "",
    "installedAt": "",
    "installedBy": "",
    "receivedDate": "",
    "receivedAt": "",
    "notes": ""
  },
  {
    "id": "spool-DH08-fw-a-3909",
    "number": "3909",
    "dh": "DH 08",
    "area": "fw-a",
    "type": "straight",
    "diameter": "10\"",
    "status": "not-started",
    "installedDate": "",
    "installedAt": "",
    "installedBy": "",
    "receivedDate": "",
    "receivedAt": "",
    "notes": ""
  },
  {
    "id": "spool-DH08-fw-a-3910",
    "number": "3910",
    "dh": "DH 08",
    "area": "fw-a",
    "type": "straight",
    "diameter": "10\"",
    "status": "not-started",
    "installedDate": "",
    "installedAt": "",
    "installedBy": "",
    "receivedDate": "",
    "receivedAt": "",
    "notes": ""
  },
  {
    "id": "spool-DH04-supercore-C1A1-1873",
    "number": "1873",
    "dh": "DH 04",
    "area": "supercore",
    "type": "straight",
    "diameter": "10\"",
    "status": "received",
    "installedDate": "",
    "installedAt": "",
    "installedBy": "",
    "receivedDate": "2026-10-17",
    "receivedAt": "2026-10-17T20:48:45.456Z",
    "notes": "Conjunto 1 - Alimentação (C1A1)",
    "circuit": "C1A1",
    "receivedBy": "Equipe SUPERCORE"
  },
  {
    "id": "spool-DH04-supercore-C1A2-1833",
    "number": "1833",
    "dh": "DH 04",
    "area": "supercore",
    "type": "straight",
    "diameter": "10\"",
    "status": "received",
    "installedDate": "",
    "installedAt": "",
    "installedBy": "",
    "receivedDate": "2026-10-17",
    "receivedAt": "2026-10-17T20:48:47.672Z",
    "notes": "Conjunto 1 - Alimentação (C1A2)",
    "circuit": "C1A2",
    "receivedBy": "Equipe SUPERCORE"
  },
  {
    "id": "spool-DH04-supercore-C1A3-1831",
    "number": "1831",
    "dh": "DH 04",
    "area": "supercore",
    "type": "straight",
    "diameter": "10\"",
    "status": "installed",
    "installedDate": "2026-10-17",
    "installedAt": "2026-10-17T21:07:51.284Z",
    "installedBy": "Pedro Alves",
    "receivedDate": "2026-10-17",
    "receivedAt": "2026-10-17T20:48:49.967Z",
    "notes": "Conjunto 1 - Alimentação (C1A3)",
    "circuit": "C1A3",
    "receivedBy": "Equipe SUPERCORE"
  },
  {
    "id": "spool-DH04-supercore-C1A4-1829",
    "number": "1829",
    "dh": "DH 04",
    "area": "supercore",
    "type": "straight",
    "diameter": "10\"",
    "status": "not-started",
    "installedDate": "",
    "installedAt": "",
    "installedBy": "",
    "receivedDate": "",
    "receivedAt": "",
    "notes": "Conjunto 1 - Alimentação (C1A4)",
    "circuit": "C1A4",
    "receivedBy": ""
  },
  {
    "id": "spool-DH04-supercore-C1A5-1865",
    "number": "1865",
    "dh": "DH 04",
    "area": "supercore",
    "type": "straight",
    "diameter": "10\"",
    "status": "not-started",
    "installedDate": "",
    "installedAt": "",
    "installedBy": "",
    "receivedDate": "",
    "receivedAt": "",
    "notes": "Conjunto 1 - Alimentação (C1A5)",
    "circuit": "C1A5",
    "receivedBy": ""
  },
  {
    "id": "spool-DH04-supercore-C1A6-1861",
    "number": "1861",
    "dh": "DH 04",
    "area": "supercore",
    "type": "straight",
    "diameter": "10\"",
    "status": "not-started",
    "installedDate": "",
    "installedAt": "",
    "installedBy": "",
    "receivedDate": "",
    "receivedAt": "",
    "notes": "Conjunto 1 - Alimentação (C1A6)",
    "circuit": "C1A6",
    "receivedBy": ""
  },
  {
    "id": "spool-DH04-supercore-C1A7-1867",
    "number": "1867",
    "dh": "DH 04",
    "area": "supercore",
    "type": "straight",
    "diameter": "10\"",
    "status": "not-started",
    "installedDate": "",
    "installedAt": "",
    "installedBy": "",
    "receivedDate": "",
    "receivedAt": "",
    "notes": "Conjunto 1 - Alimentação (C1A7)",
    "circuit": "C1A7",
    "receivedBy": ""
  },
  {
    "id": "spool-DH04-supercore-C1A8-1877",
    "number": "1877",
    "dh": "DH 04",
    "area": "supercore",
    "type": "straight",
    "diameter": "10\"",
    "status": "not-started",
    "installedDate": "",
    "installedAt": "",
    "installedBy": "",
    "receivedDate": "",
    "receivedAt": "",
    "notes": "Conjunto 1 - Alimentação (C1A8)",
    "circuit": "C1A8",
    "receivedBy": ""
  },
  {
    "id": "spool-DH04-supercore-C1A9-1879",
    "number": "1879",
    "dh": "DH 04",
    "area": "supercore",
    "type": "straight",
    "diameter": "10\"",
    "status": "not-started",
    "installedDate": "",
    "installedAt": "",
    "installedBy": "",
    "receivedDate": "",
    "receivedAt": "",
    "notes": "Conjunto 1 - Alimentação (C1A9)",
    "circuit": "C1A9",
    "receivedBy": ""
  },
  {
    "id": "spool-DH04-supercore-C1R1-1874",
    "number": "1874",
    "dh": "DH 04",
    "area": "supercore",
    "type": "straight",
    "diameter": "10\"",
    "status": "not-started",
    "installedDate": "",
    "installedAt": "",
    "installedBy": "",
    "receivedDate": "",
    "receivedAt": "",
    "notes": "Conjunto 1 - Retorno (C1R1)",
    "circuit": "C1R1",
    "receivedBy": ""
  },
  {
    "id": "spool-DH04-supercore-C1R2-1832",
    "number": "1832",
    "dh": "DH 04",
    "area": "supercore",
    "type": "straight",
    "diameter": "10\"",
    "status": "not-started",
    "installedDate": "",
    "installedAt": "",
    "installedBy": "",
    "receivedDate": "",
    "receivedAt": "",
    "notes": "Conjunto 1 - Retorno (C1R2)",
    "circuit": "C1R2",
    "receivedBy": ""
  },
  {
    "id": "spool-DH04-supercore-C1R3-1830",
    "number": "1830",
    "dh": "DH 04",
    "area": "supercore",
    "type": "straight",
    "diameter": "10\"",
    "status": "installed",
    "installedDate": "2026-10-17",
    "installedAt": "2026-10-17T20:47:57.201Z",
    "installedBy": "Pedro Alves",
    "receivedDate": "2026-10-17",
    "receivedAt": "2026-10-17T20:47:55.388Z",
    "notes": "Conjunto 1 - Retorno (C1R3)",
    "circuit": "C1R3",
    "receivedBy": "Equipe SUPERCORE"
  },
  {
    "id": "spool-DH04-supercore-C1R4-1828",
    "number": "1828",
    "dh": "DH 04",
    "area": "supercore",
    "type": "straight",
    "diameter": "10\"",
    "status": "not-started",
    "installedDate": "",
    "installedAt": "",
    "installedBy": "",
    "receivedDate": "",
    "receivedAt": "",
    "notes": "Conjunto 1 - Retorno (C1R4)",
    "circuit": "C1R4",
    "receivedBy": ""
  },
  {
    "id": "spool-DH04-supercore-C1R5-1863",
    "number": "1863",
    "dh": "DH 04",
    "area": "supercore",
    "type": "straight",
    "diameter": "10\"",
    "status": "not-started",
    "installedDate": "",
    "installedAt": "",
    "installedBy": "",
    "receivedDate": "",
    "receivedAt": "",
    "notes": "Conjunto 1 - Retorno (C1R5)",
    "circuit": "C1R5",
    "receivedBy": ""
  },
  {
    "id": "spool-DH04-supercore-C1R6-1870",
    "number": "1870",
    "dh": "DH 04",
    "area": "supercore",
    "type": "straight",
    "diameter": "10\"",
    "status": "not-started",
    "installedDate": "",
    "installedAt": "",
    "installedBy": "",
    "receivedDate": "",
    "receivedAt": "",
    "notes": "Conjunto 1 - Retorno (C1R6)",
    "circuit": "C1R6",
    "receivedBy": ""
  },
  {
    "id": "spool-DH04-supercore-C1R7-1868",
    "number": "1868",
    "dh": "DH 04",
    "area": "supercore",
    "type": "straight",
    "diameter": "10\"",
    "status": "not-started",
    "installedDate": "",
    "installedAt": "",
    "installedBy": "",
    "receivedDate": "",
    "receivedAt": "",
    "notes": "Conjunto 1 - Retorno (C1R7)",
    "circuit": "C1R7",
    "receivedBy": ""
  },
  {
    "id": "spool-DH04-supercore-C1R8-1878",
    "number": "1878",
    "dh": "DH 04",
    "area": "supercore",
    "type": "straight",
    "diameter": "10\"",
    "status": "not-started",
    "installedDate": "",
    "installedAt": "",
    "installedBy": "",
    "receivedDate": "",
    "receivedAt": "",
    "notes": "Conjunto 1 - Retorno (C1R8)",
    "circuit": "C1R8",
    "receivedBy": ""
  },
  {
    "id": "spool-DH04-supercore-C1R9-1879",
    "number": "1879",
    "dh": "DH 04",
    "area": "supercore",
    "type": "straight",
    "diameter": "10\"",
    "status": "not-started",
    "installedDate": "",
    "installedAt": "",
    "installedBy": "",
    "receivedDate": "",
    "receivedAt": "",
    "notes": "Conjunto 1 - Alimentação (C1A9)",
    "circuit": "C1R9",
    "receivedBy": ""
  },
  {
    "id": "spool-DH04-supercore-C2A1-1879",
    "number": "1879",
    "dh": "DH 04",
    "area": "supercore",
    "type": "straight",
    "diameter": "10\"",
    "status": "not-started",
    "installedDate": "",
    "installedAt": "",
    "installedBy": "",
    "receivedDate": "",
    "receivedAt": "",
    "notes": "Conjunto 1 - Alimentação (C1A9)",
    "circuit": "C2A1",
    "receivedBy": ""
  },
  {
    "id": "spool-DH04-supercore-C2A2-1876",
    "number": "1876",
    "dh": "DH 04",
    "area": "supercore",
    "type": "straight",
    "diameter": "10\"",
    "status": "not-started",
    "installedDate": "",
    "installedAt": "",
    "installedBy": "",
    "receivedDate": "",
    "receivedAt": "",
    "notes": "Conjunto 2 - Alimentação (C2A2)",
    "circuit": "C2A2",
    "receivedBy": ""
  },
  {
    "id": "spool-DH04-supercore-C2A3-1872",
    "number": "1872",
    "dh": "DH 04",
    "area": "supercore",
    "type": "straight",
    "diameter": "10\"",
    "status": "not-started",
    "installedDate": "",
    "installedAt": "",
    "installedBy": "",
    "receivedDate": "",
    "receivedAt": "",
    "notes": "Conjunto 2 - Alimentação (C2A3)",
    "circuit": "C2A3",
    "receivedBy": ""
  },
  {
    "id": "spool-DH04-supercore-C2A4-1871",
    "number": "1871",
    "dh": "DH 04",
    "area": "supercore",
    "type": "straight",
    "diameter": "10\"",
    "status": "not-started",
    "installedDate": "",
    "installedAt": "",
    "installedBy": "",
    "receivedDate": "",
    "receivedAt": "",
    "notes": "Conjunto 2 - Alimentação (C2A4)",
    "circuit": "C2A4",
    "receivedBy": ""
  },
  {
    "id": "spool-DH04-supercore-C2A5-1838",
    "number": "1838",
    "dh": "DH 04",
    "area": "supercore",
    "type": "straight",
    "diameter": "10\"",
    "status": "not-started",
    "installedDate": "",
    "installedAt": "",
    "installedBy": "",
    "receivedDate": "",
    "receivedAt": "",
    "notes": "Conjunto 2 - Alimentação (C2A5)",
    "circuit": "C2A5",
    "receivedBy": ""
  },
  {
    "id": "spool-DH04-supercore-C2A6-1836",
    "number": "1836",
    "dh": "DH 04",
    "area": "supercore",
    "type": "straight",
    "diameter": "10\"",
    "status": "not-started",
    "installedDate": "",
    "installedAt": "",
    "installedBy": "",
    "receivedDate": "",
    "receivedAt": "",
    "notes": "Conjunto 2 - Alimentação (C2A6)",
    "circuit": "C2A6",
    "receivedBy": ""
  },
  {
    "id": "spool-DH04-supercore-C2A7-1834",
    "number": "1834",
    "dh": "DH 04",
    "area": "supercore",
    "type": "straight",
    "diameter": "10\"",
    "status": "not-started",
    "installedDate": "",
    "installedAt": "",
    "installedBy": "",
    "receivedDate": "",
    "receivedAt": "",
    "notes": "Conjunto 2 - Alimentação (C2A7)",
    "circuit": "C2A7",
    "receivedBy": ""
  },
  {
    "id": "spool-DH04-supercore-C2A8-1869",
    "number": "1869",
    "dh": "DH 04",
    "area": "supercore",
    "type": "straight",
    "diameter": "10\"",
    "status": "not-started",
    "installedDate": "",
    "installedAt": "",
    "installedBy": "",
    "receivedDate": "",
    "receivedAt": "",
    "notes": "Conjunto 2 - Alimentação (C2A8)",
    "circuit": "C2A8",
    "receivedBy": ""
  },
  {
    "id": "spool-DH04-supercore-C2R1-1879",
    "number": "1879",
    "dh": "DH 04",
    "area": "supercore",
    "type": "straight",
    "diameter": "10\"",
    "status": "not-started",
    "installedDate": "",
    "installedAt": "",
    "installedBy": "",
    "receivedDate": "",
    "receivedAt": "",
    "notes": "Conjunto 1 - Alimentação (C1A9)",
    "circuit": "C2R1",
    "receivedBy": ""
  },
  {
    "id": "spool-DH04-supercore-C2R2-1875",
    "number": "1875",
    "dh": "DH 04",
    "area": "supercore",
    "type": "straight",
    "diameter": "10\"",
    "status": "not-started",
    "installedDate": "",
    "installedAt": "",
    "installedBy": "",
    "receivedDate": "",
    "receivedAt": "",
    "notes": "Conjunto 2 - Retorno (C2R2)",
    "circuit": "C2R2",
    "receivedBy": ""
  },
  {
    "id": "spool-DH04-supercore-C2R3-1864",
    "number": "1864",
    "dh": "DH 04",
    "area": "supercore",
    "type": "straight",
    "diameter": "10\"",
    "status": "not-started",
    "installedDate": "",
    "installedAt": "",
    "installedBy": "",
    "receivedDate": "",
    "receivedAt": "",
    "notes": "Conjunto 2 - Retorno (C2R3)",
    "circuit": "C2R3",
    "receivedBy": ""
  },
  {
    "id": "spool-DH04-supercore-C2R4-1862",
    "number": "1862",
    "dh": "DH 04",
    "area": "supercore",
    "type": "straight",
    "diameter": "10\"",
    "status": "not-started",
    "installedDate": "",
    "installedAt": "",
    "installedBy": "",
    "receivedDate": "",
    "receivedAt": "",
    "notes": "Conjunto 2 - Retorno (C2R4)",
    "circuit": "C2R4",
    "receivedBy": ""
  },
  {
    "id": "spool-DH04-supercore-C2R5-1839",
    "number": "1839",
    "dh": "DH 04",
    "area": "supercore",
    "type": "straight",
    "diameter": "10\"",
    "status": "not-started",
    "installedDate": "",
    "installedAt": "",
    "installedBy": "",
    "receivedDate": "",
    "receivedAt": "",
    "notes": "Conjunto 2 - Retorno (C2R5)",
    "circuit": "C2R5",
    "receivedBy": ""
  },
  {
    "id": "spool-DH04-supercore-C2R6-1837",
    "number": "1837",
    "dh": "DH 04",
    "area": "supercore",
    "type": "straight",
    "diameter": "10\"",
    "status": "not-started",
    "installedDate": "",
    "installedAt": "",
    "installedBy": "",
    "receivedDate": "",
    "receivedAt": "",
    "notes": "Conjunto 2 - Retorno (C2R6)",
    "circuit": "C2R6",
    "receivedBy": ""
  },
  {
    "id": "spool-DH04-supercore-C2R7-1835",
    "number": "1835",
    "dh": "DH 04",
    "area": "supercore",
    "type": "straight",
    "diameter": "10\"",
    "status": "not-started",
    "installedDate": "",
    "installedAt": "",
    "installedBy": "",
    "receivedDate": "",
    "receivedAt": "",
    "notes": "Conjunto 2 - Retorno (C2R7)",
    "circuit": "C2R7",
    "receivedBy": ""
  },
  {
    "id": "spool-DH04-supercore-C2R8-1866",
    "number": "1866",
    "dh": "DH 04",
    "area": "supercore",
    "type": "straight",
    "diameter": "10\"",
    "status": "not-started",
    "installedDate": "",
    "installedAt": "",
    "installedBy": "",
    "receivedDate": "",
    "receivedAt": "",
    "notes": "Conjunto 2 - Retorno (C2R8)",
    "circuit": "C2R8",
    "receivedBy": ""
  }
];
const SUPERCORE_DH04_INITIAL_SPOOLS = DEFAULT_OFFICIAL_SPOOLS.filter(s => s.area === 'supercore');

function spoolEnsureOfficialSpools(list) {
  DEFAULT_OFFICIAL_SPOOLS.forEach(def => {
    let match = list.find(s => s.id === def.id);
    if (!match) {
      match = list.find(s => s.number === def.number && normalizeDh(s.dh) === normalizeDh(def.dh) && normalizeSector(s.area) === normalizeSector(def.area));
    }
    if (!match) {
      list.push({ ...def });
    }
  });
  return true;
}

function spoolEnsureSupercoreDh04Spools(list) {
  return spoolEnsureOfficialSpools(list);
}

// Carregar Spools do LocalStorage com auto-cura e sanitização de DH e Setores
function spoolLoadAll() {
  let list = [];
  try {
    const raw = localStorage.getItem(SPOOL_STORE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        list = parsed.map(s => {
          s.dh = normalizeDh(s.dh);
          s.area = normalizeSector(s.area);
          s.number = String(s.number || '').trim();
          if (!s.status) s.status = 'not-started';
          if (!s.type) s.type = 'straight';
          return s;
        });
      }
    }
  } catch (e) {
    console.error('Erro ao ler spools:', e);
  }

  // Se a lista estiver vazia no primeiro carregamento, inicializa com os spools oficiais
  if (!list.length) {
    list = DEFAULT_OFFICIAL_SPOOLS.map(s => ({ ...s }));
  } else {
    list = spoolDeduplicateList(list);
  }

  try {
    localStorage.setItem(SPOOL_STORE_KEY, JSON.stringify(list));
  } catch (e) {}

  return list;
}

// Salvar Spools
function spoolSaveAll(spools) {
  try {
    localStorage.setItem(SPOOL_STORE_KEY, JSON.stringify(spools));
    const navCount = document.getElementById('navSpoolCount');
    if (navCount) navCount.textContent = spools.length;
    spoolSyncRemote(spools).catch(() => {});
  } catch (e) {
    console.error('Erro ao salvar spools:', e);
  }
}

// Deduplicação estrita de spools por DH, Setor, TAG e Parte/Sequência (ex: 1 de 2)
function spoolDeduplicateList(list) {
  const map = new Map();
  (list || []).forEach(s => {
    if (!s || !s.number) return;
    const normDh = normalizeDh(s.dh);
    const normSec = normalizeSector(s.area);
    const numberKey = spoolTextKey(s.number);
    const partKey = spoolTextKey(s.part || s.seq || '');
    const subKey = spoolCanonicalSubArea(s.subArea, normSec);
    const circuitKey = spoolTextKey(s.circuit || '');
    // O identificador lógico remove duplicatas reais, mas preserva partes e subáreas distintas.
    const key = `${normDh}_${normSec}_${numberKey}_${partKey}_${circuitKey}_${subKey}`;
    const existing = map.get(key);
    if (!existing) {
      map.set(key, { ...s, dh: normDh, area: normSec });
    } else {
      const t1 = new Date(s.installedAt || s.receivedAt || s.rejectedAt || 0).getTime();
      const t2 = new Date(existing.installedAt || existing.receivedAt || existing.rejectedAt || 0).getTime();
      if (t1 > t2 || (s.status === 'installed' && existing.status !== 'installed')) {
        map.set(key, { ...existing, ...s, dh: normDh, area: normSec });
      }
    }
  });
  return Array.from(map.values());
}

// Merge inteligente: Supabase tem prioridade total e sincroniza planilhas completas
function spoolMergeLists(localList, remoteList) {
  if (Array.isArray(remoteList) && remoteList.length > 0) {
    return spoolDeduplicateList(remoteList);
  }
  return spoolDeduplicateList(localList || []);
}

// Sync com Supabase (app_metadata - spool_registry)
async function spoolSyncRemote(spools) {
  try {
    const payload = {
      updatedAt: new Date().toISOString(),
      updatedBy: (window.currentUser?.name) || 'Pedro Alves',
      spools: spools,
      version: 5
    };
    if (typeof supabaseRestRequest === 'function') {
      await supabaseRestRequest('app_metadata?on_conflict=key', {
        method: 'POST',
        headers: { Prefer: 'resolution=merge-duplicates' },
        body: JSON.stringify({ key: 'spool_registry', value: payload })
      });
      spoolUpdateSyncIndicator(true);
      return true;
    }
  } catch (e) {
    console.warn('Falha no upload de spools para Supabase:', e);
    spoolUpdateSyncIndicator(false);
  }
  return false;
}

// Baixar spools do Supabase (compartilhado entre Netlify, localhost e mobile)
async function syncSpoolsFromSupabase(options = {}) {
  try {
    if (typeof supabaseRestRequest !== 'function') return false;
    const rows = await supabaseRestRequest('app_metadata?key=eq.spool_registry&select=value');
    if (Array.isArray(rows) && rows[0]?.value?.spools) {
      const remoteSpools = rows[0].value.spools;
      if (Array.isArray(remoteSpools) && remoteSpools.length > 0) {
        const merged = spoolMergeLists(spoolDb, remoteSpools);
        spoolDb = merged;
        try {
          localStorage.setItem(SPOOL_STORE_KEY, JSON.stringify(spoolDb));
        } catch(e) {}
        const navCount = document.getElementById('navSpoolCount');
        if (navCount) navCount.textContent = spoolDb.length;
        if (window.location.hash === '#spools') {
          renderSpools();
        }
        spoolUpdateSyncIndicator(true);
        return true;
      }
    }
  } catch (e) {
    console.warn('Falha ao baixar spools do Supabase:', e);
    spoolUpdateSyncIndicator(false);
  }
  return false;
}
window.syncSpoolsFromSupabase = syncSpoolsFromSupabase;
window.syncSpoolProjectsFromSupabase = syncSpoolsFromSupabase;

function spoolUpdateSyncIndicator(synced) {
  const badge = document.getElementById('spoolSyncBadge');
  if (!badge) return;
  if (synced) {
    badge.innerHTML = `<span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:#10b981; margin-right:4px;"></span> Online (${spoolDb.length} spools) • Supabase Sincronizado`;
    badge.style.color = '#065f46';
  } else {
    badge.innerHTML = `<span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:#f59e0b; margin-right:4px;"></span> Local (${spoolDb.length} spools)`;
  }
}

// Data local no formato YYYY-MM-DD (respeita fuso horário local e evita divergência após 21h em UTC-3)
function getLocalDateStr(d = new Date()) {
  if (typeof d === 'string') {
    if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
    d = new Date(d);
  }
  if (!(d instanceof Date) || isNaN(d.getTime())) return new Date().toISOString().slice(0, 10);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Hora atual no fuso local (HH:mm)
function getLocalTimeStr(d = new Date()) {
  if (typeof d === 'string' && d.includes('T')) d = new Date(d);
  if (!(d instanceof Date) || isNaN(d.getTime())) d = new Date();
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

// Formata timestamp/ISO para hora local do navegador (evita discrepâncias de fuso)
function formatSpoolTime(raw) {
  if (!raw) return '';
  const str = String(raw).trim();
  if (/^\d{2}:\d{2}$/.test(str)) return str;
  if (/^\d{2}:\d{2}:\d{2}/.test(str)) return str.slice(0, 5);
  try {
    const d = new Date(str);
    if (!isNaN(d.getTime())) {
      const hh = String(d.getHours()).padStart(2, '0');
      const mm = String(d.getMinutes()).padStart(2, '0');
      return `${hh}:${mm}`;
    }
  } catch (e) {}
  const m = str.match(/T?(\d{2}):(\d{2})/);
  return m ? `${m[1]}:${m[2]}` : '';
}

// Cria timestamp ISO combinando data local e hora local selecionada
// Extrai string YYYY-MM-DD no fuso local a partir de qualquer string de data/ISO
function formatSpoolLocalDate(raw) {
  if (!raw) return '';
  if (typeof raw === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  try {
    const d = new Date(raw);
    if (!isNaN(d.getTime())) return getLocalDateStr(d);
  } catch (e) {}
  return String(raw).slice(0, 10);
}

function buildIsoFromLocalDateAndTime(dateStr, timeStr) {
  if (!dateStr) return '';
  const time = timeStr && /^\d{2}:\d{2}/.test(timeStr) ? timeStr.slice(0, 5) : getLocalTimeStr();
  let year, month, day;
  if (dateStr.includes('-')) {
    [year, month, day] = dateStr.split('-').map(Number);
  } else if (dateStr.includes('/')) {
    [day, month, year] = dateStr.split('/').map(Number);
  } else {
    return '';
  }
  const [hours, minutes] = time.split(':').map(Number);
  const d = new Date(year, month - 1, day, hours || 0, minutes || 0, 0);
  return d.toISOString();
}

// Base principal de spools
let spoolDb = spoolLoadAll();

// Auto-salvar dados sanitizados
if (spoolDb.length > 0) {
  spoolEnsureSupercoreDh04Spools(spoolDb);
  try {
    localStorage.setItem(SPOOL_STORE_KEY, JSON.stringify(spoolDb));
  } catch (e) {}
}

// Estado da Aplicação
// Se o setor ou DH gravados estiverem vazios de dados enquanto houver spools, inicia com 'all' para garantir visualização imediata
let spoolActiveSector = localStorage.getItem('obraflow_spool_active_sector') || 'all';
let spoolActiveSubArea = localStorage.getItem('obraflow_spool_active_subarea') || 'all';
let spoolActiveDh = localStorage.getItem('obraflow_spool_active_dh') || 'ALL';
let spoolStatusFilter = 'all'; // 'all', 'not-started', 'received', 'installed', 'rejected'
let spoolTypeFilter = 'all'; // 'all', 'straight', 'valve', 'branch'
let spoolDiameterFilter = 'all';
let spoolListFilter = 'all';
let spoolSearchTerm = '';
let spoolSelectedDate = getLocalDateStr(); // YYYY-MM-DD no fuso local
let spoolDateFilterMode = 'all'; // 'all' (todas as datas), 'activity' (atividade no dia), 'installed' (instalados no dia), 'received' (recebidos no dia)
let spoolSafeTapMode = localStorage.getItem('obraflow_spool_safe_tap') !== 'false'; // Padrão: Modo Seguro (sem risco de desmarcar no tablet)
let spoolMapCollapsed = localStorage.getItem('obraflow_spool_map_collapsed') === 'true'; // Recolher mapa de spools
let spoolMultiSelectMode = false;
let spoolSelectedIds = new Set();

if (spoolActiveSector === 'all') {
  spoolActiveSubArea = 'all';
}

function formatSpoolDateDisplay(d) {
  if (!d) return '—';
  if (d.includes('T')) d = d.slice(0, 10);
  const parts = d.split('-');
  if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
  return d;
}

function formatSpoolDateShort(d) {
  if (!d) return '';
  if (d.includes('T')) d = d.slice(0, 10);
  const parts = d.split('-');
  if (parts.length === 3) return `${parts[2]}/${parts[1]}`;
  return d;
}

/* ==========================================================================
   FUNÇÃO CENTRAL DE FILTRAGEM (spoolFilterList)
   ========================================================================== */
function spoolFilterList(sourceList) {
  const targetDate = spoolSelectedDate || getLocalDateStr();

  return sourceList.filter(s => {
    // 1. Filtro por Setor
    if (spoolActiveSector !== 'all' && s.area !== spoolActiveSector) {
      return false;
    }

    // 1.1 Filtro por Subtipo de Área (Árvore Hierárquica)
    if (spoolActiveSubArea !== 'all') {
      const sSub = spoolCanonicalSubArea(s.subArea, s.area);
      const targetSub = spoolCanonicalSubArea(spoolActiveSubArea, spoolActiveSector);
      if (sSub !== targetSub) {
        return false;
      }
    }

    // 2. Filtro por Data Hall (DH) com normalização
    if (spoolActiveDh !== 'ALL') {
      if (normalizeDh(s.dh) !== normalizeDh(spoolActiveDh)) {
        return false;
      }
    }

    // 3. Filtro Ativo por Data (permite filtrar qualquer dia selecionado)
    if (spoolDateFilterMode !== 'all') {
      const isInstOnDate = s.status === 'installed' && (s.installedDate === targetDate || (s.installedAt && formatSpoolLocalDate(s.installedAt) === targetDate));
      const isRecOnDate = (s.status === 'received' || s.status === 'installed') && (s.receivedDate === targetDate || (s.receivedAt && formatSpoolLocalDate(s.receivedAt) === targetDate));
      const isRejOnDate = s.status === 'rejected' && (s.rejectedDate === targetDate || (s.rejectedAt && formatSpoolLocalDate(s.rejectedAt) === targetDate));

      if (spoolDateFilterMode === 'installed' && !isInstOnDate) return false;
      if (spoolDateFilterMode === 'received' && !isRecOnDate) return false;
      if (spoolDateFilterMode === 'rejected' && !isRejOnDate) return false;
      if (spoolDateFilterMode === 'activity' && !isInstOnDate && !isRecOnDate && !isRejOnDate) return false;
    }

    // 4. Filtro por Status e por Data do Apontamento
    if (spoolStatusFilter !== 'all') {
      if (spoolStatusFilter === 'pending' || spoolStatusFilter === 'not-started') {
        if (s.status !== 'not-started') return false;
      } else if (spoolStatusFilter === 'rejected') {
        if (s.status !== 'rejected') return false;
      } else if (spoolStatusFilter === 'installed_on_date') {
        const isInst = s.status === 'installed' && (s.installedDate === targetDate || (s.installedAt && formatSpoolLocalDate(s.installedAt) === targetDate));
        if (!isInst) return false;
      } else if (spoolStatusFilter === 'received_on_date') {
        const isRec = (s.status === 'received' || s.status === 'installed') && (s.receivedDate === targetDate || (s.receivedAt && formatSpoolLocalDate(s.receivedAt) === targetDate));
        if (!isRec) return false;
      } else if (spoolStatusFilter === 'rejected_on_date') {
        const isRej = s.status === 'rejected' && (s.rejectedDate === targetDate || (s.rejectedAt && formatSpoolLocalDate(s.rejectedAt) === targetDate));
        if (!isRej) return false;
      } else if (spoolStatusFilter === 'activity_on_date') {
        const isInst = s.status === 'installed' && (s.installedDate === targetDate || (s.installedAt && formatSpoolLocalDate(s.installedAt) === targetDate));
        const isRec = (s.status === 'received' || s.status === 'installed') && (s.receivedDate === targetDate || (s.receivedAt && formatSpoolLocalDate(s.receivedAt) === targetDate));
        const isRej = s.status === 'rejected' && (s.rejectedDate === targetDate || (s.rejectedAt && formatSpoolLocalDate(s.rejectedAt) === targetDate));
        if (!isInst && !isRec && !isRej) return false;
      } else if (s.status !== spoolStatusFilter) {
        return false;
      }
    }

    // 5. Filtro por Tipo / Classificação
    if (spoolTypeFilter !== 'all' && s.type !== spoolTypeFilter) {
      return false;
    }

    // 6. Filtro por Diâmetro
    if (spoolDiameterFilter !== 'all' && s.diameter !== spoolDiameterFilter) {
      return false;
    }

    // 7. Abas Rápidas / Botões de Fechamento
    if (spoolListFilter === 'straight' && s.type !== 'straight') return false;
    if (spoolListFilter === 'valve' && s.type !== 'valve') return false;
    if (spoolListFilter === 'branch' && s.type !== 'branch') return false;
    if (spoolListFilter === 'pending' && s.status !== 'not-started') return false;
    if (spoolListFilter === 'rejected' && s.status !== 'rejected') return false;
    if (spoolListFilter === 'installed_today') {
      const isInst = s.status === 'installed' && (s.installedDate === targetDate || (s.installedAt && formatSpoolLocalDate(s.installedAt) === targetDate));
      if (!isInst) return false;
    }
    if (spoolListFilter === 'received_today') {
      const isRec = (s.status === 'received' || s.status === 'installed') && (s.receivedDate === targetDate || (s.receivedAt && formatSpoolLocalDate(s.receivedAt) === targetDate));
      if (!isRec) return false;
    }

    // 8. Busca Textual por Tag, Parte, DH, Setor, Subárea, Diâmetro ou Observações
    if (spoolSearchTerm) {
      const q = spoolSearchTerm.toLowerCase().trim();
      const matchTag = (s.number || '').toLowerCase().includes(q);
      const matchPart = (s.part || s.seq || '').toLowerCase().includes(q);
      const matchSub = (s.subArea || '').toLowerCase().includes(q);
      const matchDh = (s.dh || '').toLowerCase().includes(q);
      const secName = (SPOOL_SECTORS[s.area]?.name || s.area || '').toLowerCase();
      const matchSec = secName.includes(q);
      const matchDia = (s.diameter || '').toLowerCase().includes(q);
      const matchNotes = (s.notes || '').toLowerCase().includes(q);
      if (!matchTag && !matchPart && !matchSub && !matchDh && !matchSec && !matchDia && !matchNotes) {
        return false;
      }
    }

    return true;
  });
}

// Ação rápida: se a tela estiver zerada por filtro, abre tudo para mostrar os spools
function spoolShowAllMySpools() {
  spoolActiveSector = 'all';
  spoolActiveSubArea = 'all';
  spoolActiveDh = 'ALL';
  spoolStatusFilter = 'all';
  spoolTypeFilter = 'all';
  spoolDiameterFilter = 'all';
  spoolListFilter = 'all';
  spoolDateFilterMode = 'all';
  spoolSearchTerm = '';
  localStorage.setItem('obraflow_spool_active_sector', 'all');
  localStorage.setItem('obraflow_spool_active_subarea', 'all');
  localStorage.setItem('obraflow_spool_active_dh', 'ALL');
  renderSpools();
  toast('Mostrando todos os spools cadastrados!');
}

/* ==========================================================================
   RENDERIZAÇÃO DA TELA PRINCIPAL (renderSpools)
   ========================================================================== */
function renderSpools() {
  const app = document.getElementById('app');
  if (!app) return;

  const todayStr = getLocalDateStr();
  const filterDate = spoolSelectedDate || todayStr;

  // Atualizar badge do menu lateral com o total de spools cadastrados
  const navCount = document.getElementById('navSpoolCount');
  if (navCount) navCount.textContent = spoolDb.length;

  // Lista com todos os filtros aplicados
  const filteredSpools = spoolFilterList(spoolDb);

  // Spools para cálculo dos KPIs superiores
  const baseSectorSpools = spoolDb.filter(s => {
    const matchSec = spoolActiveSector === 'all' || s.area === spoolActiveSector;
    const matchSub = spoolActiveSubArea === 'all' ||
      spoolCanonicalSubArea(s.subArea, s.area) === spoolCanonicalSubArea(spoolActiveSubArea, spoolActiveSector);
    const matchDh = spoolActiveDh === 'ALL' || normalizeDh(s.dh) === normalizeDh(spoolActiveDh);
    return matchSec && matchSub && matchDh;
  });

  // Métricas do Setor / DH Ativo
  const straightSpools = baseSectorSpools.filter(s => s.type === 'straight');
  const valveSpools = baseSectorSpools.filter(s => s.type === 'valve');
  const branchSpools = baseSectorSpools.filter(s => s.type === 'branch');

  const straightDone = straightSpools.filter(s => s.status === 'installed').length;
  const valveDone = valveSpools.filter(s => s.status === 'installed').length;
  const branchDone = branchSpools.filter(s => s.status === 'installed').length;

  const installedToday = baseSectorSpools.filter(s => s.status === 'installed' && (s.installedDate === filterDate || (s.installedAt && formatSpoolLocalDate(s.installedAt) === filterDate)));
  const receivedToday = baseSectorSpools.filter(s => (s.status === 'received' || s.status === 'installed') && (s.receivedDate === filterDate || (s.receivedAt && formatSpoolLocalDate(s.receivedAt) === filterDate)));
  const rejectedCount = baseSectorSpools.filter(s => s.status === 'rejected').length;
  const rejectedToday = baseSectorSpools.filter(s => s.status === 'rejected' && (s.rejectedDate === filterDate || (s.rejectedAt && formatSpoolLocalDate(s.rejectedAt) === filterDate)));
  const totalPending = baseSectorSpools.filter(s => s.status === 'not-started').length;
  const totalInstalled = baseSectorSpools.filter(s => s.status === 'installed').length;

  const sectorMeta = SPOOL_SECTORS[spoolActiveSector] || { name: 'Todos os Setores da Obra', icon: '🌐' };

  // Lista dinâmica de diâmetros presentes no banco
  const availableDiameters = [...new Set(spoolDb.map(s => s.diameter).filter(Boolean))].sort();

  app.innerHTML = `
    ${pageHeader(
      'Controle Operacional de Spools',
      'Acompanhamento diário de montagem por DH, trechos retos e derivações com apontamento em 1 clique.',
      'MÓDULO DE REFRIGERAÇÃO & TUBULAÇÃO',
      `<span id="spoolSyncBadge" class="spool-sync-badge">${icon('clock')} Online (${spoolDb.length} spools)</span>
       <button class="button ${spoolSafeTapMode ? 'button-green' : 'button-outline'}" onclick="spoolToggleSafeTapMode()" title="${spoolSafeTapMode ? 'Modo Seguro ATIVO: toque abre menu de ações deliberadas' : 'Modo Rápido: toque alterna status diretamente'}" style="font-size:12px;">${spoolSafeTapMode ? '🛡️ Modo Seguro' : '⚡ Modo Rápido'}</button>
       <button class="button ${spoolMultiSelectMode ? 'button-green' : 'button-outline'}" onclick="spoolToggleMultiSelectMode()" title="Selecionar vários spools e alterar status em lote" style="font-size:12px;">${spoolMultiSelectMode ? '☑️ Seleção Ativa' : '☑️ Selecionar Vários'}</button>
       ${spoolMultiSelectMode ? `<button class="button button-outline" onclick="spoolSelectAllVisible()" title="Selecionar os spools exibidos pelos filtros atuais" style="font-size:12px;">✓ Marcar Visíveis (${filteredSpools.length})</button>
       <button class="button button-outline" onclick="spoolClearSelection()" title="Limpar a seleção atual" style="font-size:12px;">✕ Desmarcar</button>` : ''}
       <button class="button button-green" onclick="spoolOpenExportModal()" title="Exportar planilha Excel (.xlsx)">${icon('download')} Baixar Planilha</button>
       <button class="button button-dark" onclick="spoolOpenReportPDF('daily')" title="Gerar relatório em PDF com logos Heating & Afonso França">${icon('print')} Relatório PDF</button>
       <button class="button button-outline" onclick="spoolOpenImportModal()" title="Subir planilha Excel (.xlsx) ou CSV">${icon('upload')} Subir Planilha</button>
       <button class="button button-green" onclick="spoolCopyFilteredReport()" title="Copiar spools com filtros atuais para WhatsApp">${icon('clipboard')} Copiar Filtrados (${filteredSpools.length})</button>
       <button class="button button-outline" onclick="spoolCopyDailyReport('${filterDate}')" title="Copiar fechamento do dia para o WhatsApp">${icon('calendar')} Fechamento do Dia</button>
       <button class="button button-outline" onclick="spoolOpenCopyModal()" title="Mais opções de cópia e compartilhamento">${icon('share')} Opções Copiar</button>
       <button class="button button-outline" onclick="spoolOpenManualEntryModal()" title="Escrever / colar tags manualmente">${icon('plus')} Escrever Spools</button>`
    )}

    <!-- BANNER DE AJUDA SE O FILTRO ATUAL ESTIVER VAZIO MAS EXISTIREM SPOOLS CADASTRADOS -->
    ${(filteredSpools.length === 0 && spoolDb.length > 0) ? `
      <div style="background:#eff6ff; border:1.5px solid #3b82f6; border-radius:12px; padding:16px 20px; margin-bottom:18px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; box-shadow:0 2px 10px rgba(59,130,246,0.12);">
        <div style="display:flex; align-items:center; gap:12px;">
          <span style="font-size:28px;">🔍</span>
          <div>
            <strong style="color:#1d4ed8; font-size:15px; font-weight:800; display:block;">
              Você possui ${spoolDb.length} spools cadastrados no sistema!
            </strong>
            <span style="color:#2563eb; font-size:13px; font-weight:600;">
              O filtro atual (${sectorMeta.name} · ${spoolActiveDh}) não possui spools. Clique ao lado para visualizar os seus spools imediatamente:
            </span>
          </div>
        </div>
        <div style="display:flex; gap:8px;">
          <button type="button" class="button button-green" onclick="spoolShowAllMySpools()" style="font-weight:800; padding:10px 18px; font-size:13px;">
            👁️ Mostrar Meus ${spoolDb.length} Spools Agora
          </button>
        </div>
      </div>
    ` : ''}

    <!-- 1. SELEÇÃO DE SETOR OFICIAL (FW A, FW B, GERADOR, SALAS ELÉTRICAS, CAG, SUPERCORE, RMUS) -->
    <div class="spool-sector-bar" aria-label="Setores da Obra">
      <button type="button" class="spool-sector-btn ${spoolActiveSector === 'all' ? 'active' : ''}" onclick="spoolSelectSector('all')">
        <span>🌐</span>
        <span>Todos os Setores</span>
        <span class="spool-sector-badge">${spoolDb.filter(s => s.status === 'installed' && (spoolActiveDh === 'ALL' || normalizeDh(s.dh) === normalizeDh(spoolActiveDh))).length}/${spoolDb.filter(s => (spoolActiveDh === 'ALL' || normalizeDh(s.dh) === normalizeDh(spoolActiveDh))).length}</span>
      </button>

      ${Object.values(SPOOL_SECTORS).map(sec => {
        const count = spoolDb.filter(s => s.area === sec.id && (spoolActiveDh === 'ALL' || normalizeDh(s.dh) === normalizeDh(spoolActiveDh))).length;
        const done = spoolDb.filter(s => s.area === sec.id && (spoolActiveDh === 'ALL' || normalizeDh(s.dh) === normalizeDh(spoolActiveDh)) && s.status === 'installed').length;
        return `
          <button type="button" class="spool-sector-btn ${spoolActiveSector === sec.id ? 'active' : ''}" onclick="spoolSelectSector('${sec.id}')">
            <span>${sec.icon}</span>
            <span>${sec.name}</span>
            <span class="spool-sector-badge">${done}/${count}</span>
          </button>
        `;
      }).join('')}
    </div>

    <!-- 2. SELETOR DE DATA HALL (DH 01 A DH 10) COM CONTAGEM REAL E BOTÃO DE LIMPEZA -->
    <div class="spool-dh-bar" style="margin-bottom:16px; display:flex; align-items:center; flex-wrap:wrap; gap:6px;">
      <span style="font-size:11px; font-weight:900; color:#475569; text-transform:uppercase; margin-right:6px;">PROJETO POR DATA HALL:</span>
      <button type="button" class="spool-dh-pill ${spoolActiveDh === 'ALL' ? 'active' : ''}" onclick="spoolSelectDh('ALL')" title="Ver todos os Data Halls juntos">
        Todos os DHs
        <span class="spool-dh-pill-badge">${spoolDb.filter(s => spoolActiveSector === 'all' || s.area === spoolActiveSector).length}</span>
      </button>
      ${Array.from({ length: 10 }, (_, i) => {
        const dhName = `DH ${String(i + 1).padStart(2, '0')}`;
        const isActive = normalizeDh(spoolActiveDh) === dhName;
        const count = spoolDb.filter(s => (spoolActiveSector === 'all' || s.area === spoolActiveSector) && normalizeDh(s.dh) === dhName).length;
        return `
          <button type="button" class="spool-dh-pill ${isActive ? 'active' : ''}" onclick="spoolSelectDh('${dhName}')">
            ${dhName}
            <span class="spool-dh-pill-badge">${count}</span>
          </button>
        `;
      }).join('')}
      ${(spoolActiveDh !== 'ALL' && spoolDb.some(s => normalizeDh(s.dh) === normalizeDh(spoolActiveDh))) ? `
        <button type="button" class="button compact" style="margin-left:auto; background:#fee2e2; color:#b91c1c; border:1px solid #fca5a5; font-size:11px; font-weight:800; padding:5px 12px; border-radius:6px; cursor:pointer;" onclick="spoolClearDh('${spoolActiveDh}')" title="Apagar todos os spools do ${spoolActiveDh}">
          ${icon('trash')} Limpar spools do ${spoolActiveDh} (${spoolDb.filter(s => normalizeDh(s.dh) === normalizeDh(spoolActiveDh)).length})
        </button>
      ` : ''}
    </div>

    <!-- 3. PAINEL DE FECHAMENTO DO DIA & METAS -->
    <section class="spool-daily-close">
      <div class="spool-kpi-card tone-installed ${spoolListFilter === 'installed_today' ? 'is-active-tab' : ''}" onclick="spoolSetFilter('installed_today')" title="Clique para ver os tubos instalados no dia">
        <span class="spool-kpi-label">INSTALADOS NO DIA <span class="spool-kpi-badge badge-good">VER LISTA 🟢</span></span>
        <div class="spool-kpi-val">+${installedToday.length}</div>
        <div class="spool-kpi-sub">${filterDate === todayStr ? 'Montados Hoje' : `Montados em ${new Date(filterDate + 'T12:00:00').toLocaleDateString('pt-BR')}`} · Clique p/ listar</div>
      </div>

      <div class="spool-kpi-card tone-received ${spoolListFilter === 'received_today' ? 'is-active-tab' : ''}" onclick="spoolSetFilter('received_today')" title="Clique para ver os tubos recebidos no dia">
        <span class="spool-kpi-label">RECEBIDOS NO DIA <span class="spool-kpi-badge badge-good">VER LISTA 🟡</span></span>
        <div class="spool-kpi-val">+${receivedToday.length}</div>
        <div class="spool-kpi-sub">Descarregados e conferidos · Clique p/ listar</div>
      </div>

      <div class="spool-kpi-card tone-straight ${spoolListFilter === 'straight' ? 'is-active-tab' : ''}" onclick="spoolSetFilter('straight')" title="Clique para filtrar trechos retos">
        <span class="spool-kpi-label">📏 TRECHOS RETOS (LINHA RETA)</span>
        <div class="spool-kpi-val">${straightDone} <small style="font-size:15px; color:#94a3b8;">/ ${straightSpools.length}</small></div>
        <div class="spool-kpi-sub">${straightSpools.length ? Math.round((straightDone / straightSpools.length) * 100) : 0}% montado · Restam ${straightSpools.length - straightDone} tubos</div>
      </div>

      <div class="spool-kpi-card ${spoolListFilter === 'branch' ? 'is-active-tab' : ''}" onclick="spoolSetFilter('branch')" title="Clique para filtrar derivações">
        <span class="spool-kpi-label">📐 DERIVAÇÕES (RAMAIS)</span>
        <div class="spool-kpi-val">${branchDone} <small style="font-size:15px; color:#94a3b8;">/ ${branchSpools.length}</small></div>
        <div class="spool-kpi-sub">${branchSpools.length ? Math.round((branchDone / branchSpools.length) * 100) : 0}% montado · Restam ${branchSpools.length - branchDone} ramais</div>
      </div>

      <div class="spool-kpi-card ${spoolListFilter === 'pending' ? 'is-active-tab' : ''}" onclick="spoolSetFilter('pending')" title="Clique para ver os tubos pendentes">
        <span class="spool-kpi-label">RESTANTE NO RECORTE</span>
        <div class="spool-kpi-val">${totalPending} <small style="font-size:14px; font-weight:700; color:#94a3b8;">pendentes</small></div>
        <div class="spool-kpi-sub">Total de ${baseSectorSpools.length} spools (${totalInstalled} montados)</div>
      </div>

      <div class="spool-kpi-card tone-rejected ${spoolListFilter === 'rejected' ? 'is-active-tab' : ''}" onclick="spoolSetFilter('rejected')" title="Clique para ver os tubos reprovados / em quarentena" style="border-left: 4px solid #ef4444; background: ${spoolListFilter === 'rejected' ? '#fee2e2' : '#fff5f5'};">
        <span class="spool-kpi-label" style="color:#b91c1c;">🔴 REPROVADOS / QUARENTENA <span class="spool-kpi-badge" style="background:#fee2e2; color:#b91c1c; border:1px solid #fca5a5;">VER LISTA</span></span>
        <div class="spool-kpi-val" style="color:#dc2626;">${rejectedCount} ${rejectedToday.length ? `<small style="font-size:14px; font-weight:800; color:#b91c1c;">(+${rejectedToday.length} hoje)</small>` : ''}</div>
        <div class="spool-kpi-sub" style="color:#991b1b;">Tubulações bloqueadas / retrabalho · Clique p/ listar</div>
      </div>
    </section>

    <!-- 4. BARRAMENTO PRINCIPAL DA LINHA: TRECHOS RETOS + VÁLVULAS (SE HOUVER) -->
    ${spoolRenderPipelineBar(baseSectorSpools, sectorMeta)}

    <!-- 5. BARRA DE FILTROS AVANÇADOS COMPLETA (SOLICITADA PELO USUÁRIO) -->
    <div class="spool-filters-bar" aria-label="Filtros de Spools">
      <!-- Filtro DH -->
      <div class="spool-filter-group">
        <label class="spool-filter-label" for="spoolFilterDhSelect">🏢 Data Hall (DH):</label>
        <select id="spoolFilterDhSelect" class="spool-filter-select" onchange="spoolSelectDh(this.value)">
          <option value="ALL" ${spoolActiveDh === 'ALL' ? 'selected' : ''}>Todos os DHs</option>
          ${Array.from({ length: 10 }, (_, i) => {
            const dh = `DH ${String(i + 1).padStart(2, '0')}`;
            return `<option value="${dh}" ${normalizeDh(spoolActiveDh) === dh && spoolActiveDh !== 'ALL' ? 'selected' : ''}>${dh}</option>`;
          }).join('')}
        </select>
      </div>

      <!-- Filtro Setor com todos os 7 setores -->
      <div class="spool-filter-group">
        <label class="spool-filter-label" for="spoolFilterSectorSelect">📍 Setor da Obra:</label>
        <select id="spoolFilterSectorSelect" class="spool-filter-select" onchange="spoolSelectSector(this.value)">
          <option value="all" ${spoolActiveSector === 'all' ? 'selected' : ''}>Todos os Setores</option>
          ${Object.values(SPOOL_SECTORS).map(sec => `
            <option value="${sec.id}" ${spoolActiveSector === sec.id ? 'selected' : ''}>${sec.icon} ${sec.name}</option>
          `).join('')}
        </select>
      </div>

      <!-- Filtro por Subtipo / Sub-área (aparece apenas quando o setor selecionado tem sub-áreas definidas) -->
      ${(() => {
        const sectorTree = SPOOL_AREA_TREE[spoolActiveSector];
        if (!sectorTree || !sectorTree.subAreas || !sectorTree.subAreas.length) return '';
        return `
          <div class="spool-filter-group">
            <label class="spool-filter-label" for="spoolFilterSubAreaSelect">🗂️ Sub-área:</label>
            <select id="spoolFilterSubAreaSelect" class="spool-filter-select" onchange="spoolSelectSubArea(this.value)">
              <option value="all" ${spoolActiveSubArea === 'all' ? 'selected' : ''}>Todas as Sub-áreas</option>
              ${sectorTree.subAreas.map(sub => `
                <option value="${sub.id}" ${spoolCanonicalSubArea(spoolActiveSubArea, spoolActiveSector) === sub.id ? 'selected' : ''}>${sub.name}</option>
              `).join('')}
            </select>
          </div>
        `;
      })()}

      <!-- Filtro Status -->
      <div class="spool-filter-group">
        <label class="spool-filter-label" for="spoolFilterStatusSelect">📊 Status:</label>
        <select id="spoolFilterStatusSelect" class="spool-filter-select" onchange="spoolSetStatusFilter(this.value)">
          <option value="all" ${spoolStatusFilter === 'all' ? 'selected' : ''}>Todos os Status</option>
          <option value="not-started" ${spoolStatusFilter === 'not-started' ? 'selected' : ''}>⚪ Pendente</option>
          <option value="received" ${spoolStatusFilter === 'received' ? 'selected' : ''}>🟡 Recebido (Geral)</option>
          <option value="installed" ${spoolStatusFilter === 'installed' ? 'selected' : ''}>🟢 Instalado (Geral)</option>
          <option value="rejected" ${spoolStatusFilter === 'rejected' ? 'selected' : ''}>🔴 Reprovado (Quarentena)</option>
          <option value="installed_on_date" ${spoolStatusFilter === 'installed_on_date' ? 'selected' : ''}>🟢 Instalados no Dia (${formatSpoolDateShort(filterDate)})</option>
          <option value="received_on_date" ${spoolStatusFilter === 'received_on_date' ? 'selected' : ''}>🟡 Recebidos no Dia (${formatSpoolDateShort(filterDate)})</option>
          <option value="rejected_on_date" ${spoolStatusFilter === 'rejected_on_date' ? 'selected' : ''}>🔴 Reprovados no Dia (${formatSpoolDateShort(filterDate)})</option>
          <option value="activity_on_date" ${spoolStatusFilter === 'activity_on_date' ? 'selected' : ''}>⚡ Atividade no Dia (${formatSpoolDateShort(filterDate)})</option>
        </select>
      </div>

      <!-- Filtro Classificação (Apenas Trecho Reto e Derivação) -->
      <div class="spool-filter-group">
        <label class="spool-filter-label" for="spoolFilterTypeSelect">📐 Classificação:</label>
        <select id="spoolFilterTypeSelect" class="spool-filter-select" onchange="spoolSetTypeFilter(this.value)">
          <option value="all" ${spoolTypeFilter === 'all' ? 'selected' : ''}>Todas as Peças</option>
          <option value="straight" ${spoolTypeFilter === 'straight' ? 'selected' : ''}>📏 Trecho Reto</option>
          <option value="branch" ${spoolTypeFilter === 'branch' ? 'selected' : ''}>📐 Derivação (Ramal)</option>
        </select>
      </div>

      <!-- Filtro Diâmetro -->
      <div class="spool-filter-group">
        <label class="spool-filter-label" for="spoolFilterDiaSelect">⭕ Diâmetro:</label>
        <select id="spoolFilterDiaSelect" class="spool-filter-select" onchange="spoolSetDiameterFilter(this.value)">
          <option value="all" ${spoolDiameterFilter === 'all' ? 'selected' : ''}>Todos os Diâmetros</option>
          ${availableDiameters.map(d => `
            <option value="${esc(d)}" ${spoolDiameterFilter === d ? 'selected' : ''}>${esc(d)}</option>
          `).join('')}
        </select>
      </div>

      <!-- Filtro por Dia do Fechamento / Apontamento com Modo Ativo -->
      <div class="spool-filter-group" style="min-width:300px;">
        <label class="spool-filter-label" for="spoolMainDateFilter" style="display:flex; justify-content:space-between; align-items:center;">
          <span>📅 Filtrar por Dia:</span>
          ${spoolDateFilterMode !== 'all' ? `
            <span style="font-size:10px; background:#dcfce7; color:#15803d; padding:1px 6px; border-radius:4px; font-weight:800;">
              ATIVO: ${spoolDateFilterMode === 'installed' ? 'Instalados' : (spoolDateFilterMode === 'received' ? 'Recebidos' : 'Atividade')}
            </span>
          ` : `
            <span style="font-size:10px; color:#64748b; font-weight:600;">(Todas as datas)</span>
          `}
        </label>
        <div style="display:flex; align-items:center; gap:4px; flex-wrap:wrap;">
          <select id="spoolDateModeSelect" class="spool-filter-select" onchange="spoolSetDateFilterMode(this.value)" style="height:36px; font-weight:700; width:125px; font-size:12px;" title="Modo do filtro de data">
            <option value="all" ${spoolDateFilterMode === 'all' ? 'selected' : ''}>🌐 Todas</option>
            <option value="activity" ${spoolDateFilterMode === 'activity' ? 'selected' : ''}>⚡ Atividade</option>
            <option value="installed" ${spoolDateFilterMode === 'installed' ? 'selected' : ''}>🟢 Instalados</option>
            <option value="received" ${spoolDateFilterMode === 'received' ? 'selected' : ''}>🟡 Recebidos</option>
            <option value="rejected" ${spoolDateFilterMode === 'rejected' ? 'selected' : ''}>🔴 Reprovados</option>
          </select>
          <input type="date" id="spoolMainDateFilter" class="spool-filter-input" value="${filterDate}" onchange="spoolSetSelectedDate(this.value, true)" style="height:36px; padding:0 6px; font-weight:700; background:#ffffff; border:1.5px solid #cbd5e1; border-radius:6px; cursor:pointer; width:125px; font-size:12px;" title="Clique para escolher a data">
          <button type="button" class="button compact ${spoolDateFilterMode !== 'all' && filterDate === todayStr ? 'button-green' : 'button-outline'}" onclick="spoolQuickFilterDay('${todayStr}')" style="height:36px; padding:0 8px; font-size:11px; font-weight:800;" title="Ver movimentações de hoje">
            Hoje
          </button>
          <button type="button" class="button compact button-outline" onclick="spoolQuickFilterDay('${new Date(Date.now() - 86400000).toISOString().slice(0, 10)}')" style="height:36px; padding:0 8px; font-size:11px; font-weight:800;" title="Ver movimentações de ontem">
            Ontem
          </button>
          ${spoolDateFilterMode !== 'all' ? `
            <button type="button" class="button compact" onclick="spoolClearDateFilter()" style="height:36px; padding:0 6px; font-size:11px; font-weight:800; background:#fee2e2; color:#b91c1c; border:1px solid #fca5a5;" title="Limpar filtro de data e ver todas">✕ Todas</button>
          ` : ''}
        </div>
      </div>

      <!-- Campo de Busca Textual -->
      <div class="spool-filter-group" style="flex:1; min-width:180px;">
        <label class="spool-filter-label" for="spoolSearchInput">🔍 Buscar por Tag / DH:</label>
        <input type="search" id="spoolSearchInput" class="spool-filter-input" placeholder="Buscar tag (ex: 1601), DH, setor..." value="${esc(spoolSearchTerm)}" oninput="spoolSearchTerm = this.value; renderSpools();" style="width:100%;">
      </div>

      <!-- Botão Limpar Filtros -->
      ${(spoolStatusFilter !== 'all' || spoolDateFilterMode !== 'all' || spoolTypeFilter !== 'all' || spoolDiameterFilter !== 'all' || spoolListFilter !== 'all' || spoolSearchTerm || spoolActiveSector !== 'all' || spoolActiveDh !== 'ALL' || spoolActiveSubArea !== 'all') ? `
        <div class="spool-filter-group">
          <button type="button" class="button button-outline compact" onclick="spoolClearAllFilters()" style="color:#ef4444; border-color:#fca5a5; font-weight:800; height:36px;">
            ✕ Limpar Filtros
          </button>
        </div>
      ` : ''}

      <!-- Botões de Ação Direta no Toolbar: Copiar Filtro, PDF com Logos e Excel -->
      <div class="spool-filter-group" style="margin-left:auto; display:flex; gap:8px; flex-wrap:wrap;">
        <button type="button" class="button button-outline compact" onclick="spoolCopyFilteredReport()" style="height:36px; font-weight:800; color:#0f172a; border-color:#cbd5e1; background:#ffffff;" title="Copiar os ${filteredSpools.length} spools filtrados na tela para WhatsApp">
          ${icon('clipboard')} Copiar Filtro (${filteredSpools.length})
        </button>
        <button type="button" class="button button-outline compact" onclick="spoolOpenReportPDF('daily')" style="height:36px; font-weight:800; color:#0f172a; border-color:#cbd5e1; background:#ffffff;" title="Gerar relatório executivo em PDF com as logos da Heating Cooling e Afonso França">
          ${icon('print')} Relatório PDF
        </button>
        <button type="button" class="button button-green compact" onclick="spoolOpenExportModal()" style="height:36px; font-weight:800;" title="Opções de download da planilha em Excel">
          ${icon('download')} Baixar Planilha
        </button>
      </div>
    </div>

    <!-- ABAS RÁPIDAS SECUNDÁRIAS -->
    <div class="spool-corte-toolbar" style="border-radius:10px; margin-bottom:14px; background:#f8fafc; border:1px solid #e2e8f0; padding:8px 12px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
      <div class="spool-corte-pills">
        <button type="button" class="spool-corte-btn ${spoolListFilter === 'all' ? 'active' : ''}" onclick="spoolSetFilter('all')">
          📋 Todos (${baseSectorSpools.length})
        </button>
        <button type="button" class="spool-corte-btn ${spoolListFilter === 'straight' ? 'active' : ''}" onclick="spoolSetFilter('straight')">
          📏 Trechos Retos (${straightSpools.length})
        </button>
        <button type="button" class="spool-corte-btn ${spoolListFilter === 'branch' ? 'active' : ''}" onclick="spoolSetFilter('branch')">
          📐 Derivações (${branchSpools.length})
        </button>
        <button type="button" class="spool-corte-btn ${spoolListFilter === 'installed_today' ? 'active' : ''}" onclick="spoolSetFilter('installed_today')">
          🟢 Instalados no Dia (${installedToday.length})
        </button>
        <button type="button" class="spool-corte-btn ${spoolListFilter === 'received_today' ? 'active' : ''}" onclick="spoolSetFilter('received_today')">
          🟡 Recebidos no Dia (${receivedToday.length})
        </button>
        <button type="button" class="spool-corte-btn ${spoolListFilter === 'pending' ? 'active' : ''}" onclick="spoolSetFilter('pending')">
          ⏳ Pendentes (${totalPending})
        </button>
      </div>

      <div style="font-size:12px; font-weight:800; color:#475569;">
        Mostrando <strong>${filteredSpools.length}</strong> de <strong>${spoolDb.length}</strong> spools cadastrados
      </div>
    </div>

    <!-- BANNER SE A ABA DE INSTALADOS HOJE ESTIVER ATIVA -->
    ${spoolListFilter === 'installed_today' ? `
      <div class="spool-installed-today-banner">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
          <div>
            <div style="display:flex; align-items:center; gap:8px;">
              <span class="spool-pulse-beacon"></span>
              <h3 style="margin:0; font-size:16px; font-weight:800; color:#10b981;">
                🟢 TUBOS INSTALADOS NO DIA (${installedToday.length} tubos)
              </h3>
            </div>
            <p style="margin:4px 0 0; font-size:12px; color:#94a3b8;">
              Avanço físico em <strong>${new Date(filterDate + 'T12:00:00').toLocaleDateString('pt-BR')}</strong> · ${sectorMeta.name} (${spoolActiveDh}).
            </p>
          </div>
          <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
            <label style="font-size:12px; font-weight:700; color:#cbd5e1; display:flex; align-items:center; gap:6px;">
              📅 Data:
              <input type="date" value="${filterDate}" onchange="spoolSetSelectedDate(this.value)" class="spool-date-input">
            </label>
            <button type="button" class="button button-outline compact" onclick="spoolQuickFilterDay('${todayStr}', 'installed')">Hoje</button>
            <button type="button" class="button button-outline compact" onclick="spoolQuickFilterDay('${new Date(Date.now() - 86400000).toISOString().slice(0, 10)}', 'installed')">Ontem</button>
            <button type="button" class="button button-green compact" onclick="spoolCopyDailyReport('${filterDate}')" title="Copiar fechamento de instalados">
              📋 Copiar Fechamento (${installedToday.length})
            </button>
            <button type="button" class="button button-outline compact" onclick="spoolCopyFilteredReport()" style="background:#ffffff; color:#065f46; border-color:#86efac; font-weight:700;" title="Copiar lista com os filtros atuais">
              📋 Copiar Filtro (${filteredSpools.length})
            </button>
            <button type="button" class="button button-dark compact" onclick="spoolOpenReportPDF('daily')" style="font-weight:800; display:inline-flex; align-items:center; gap:6px;">
              📄 Relatório PDF
            </button>
          </div>
        </div>
      </div>
    ` : ''}

    <!-- BANNER SE A ABA DE RECEBIDOS HOJE ESTIVER ATIVA -->
    ${spoolListFilter === 'received_today' ? `
      <div class="spool-installed-today-banner" style="background:linear-gradient(135deg, #fefce8, #fef08a); border:1.5px solid #ca8a04; color:#713f12; box-shadow:0 4px 15px rgba(202,138,4,0.15);">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
          <div>
            <div style="display:flex; align-items:center; gap:8px;">
              <span class="spool-pulse-beacon" style="background:#eab308; box-shadow:0 0 0 0 rgba(234,179,8,0.7);"></span>
              <h3 style="margin:0; font-size:16px; font-weight:800; color:#854d0e;">
                🟡 TUBOS RECEBIDOS NO DIA (${receivedToday.length} peças)
              </h3>
            </div>
            <p style="margin:4px 0 0; font-size:12px; color:#854d0e;">
              Peças descarregadas e conferidas em <strong>${formatSpoolDateDisplay(filterDate)}</strong> · ${sectorMeta.name} (${spoolActiveDh}).
            </p>
          </div>
          <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
            <label style="font-size:12px; font-weight:700; color:#854d0e; display:flex; align-items:center; gap:6px;">
              📅 Data:
              <input type="date" value="${filterDate}" onchange="spoolSetSelectedDate(this.value, true)" class="spool-date-input" style="background:#ffffff; color:#0f172a; border-color:#ca8a04;">
            </label>
            <button type="button" class="button button-outline compact" style="color:#854d0e; border-color:#ca8a04; background:#ffffff; font-weight:700;" onclick="spoolQuickFilterDay('${todayStr}', 'received')">Hoje</button>
            <button type="button" class="button button-outline compact" style="color:#854d0e; border-color:#ca8a04; background:#ffffff; font-weight:700;" onclick="spoolQuickFilterDay('${new Date(Date.now() - 86400000).toISOString().slice(0, 10)}', 'received')">Ontem</button>
            <button type="button" class="button compact" onclick="spoolCopyReceivedDailyReport('${filterDate}')" style="background:#ca8a04; color:#ffffff; font-weight:800; border:none;" title="Copiar relatório de recebidos do dia">
              📋 Copiar Recebidos (${receivedToday.length})
            </button>
            <button type="button" class="button button-outline compact" onclick="spoolCopyFilteredReport()" style="color:#854d0e; border-color:#ca8a04; background:#ffffff; font-weight:700;" title="Copiar lista com os filtros atuais">
              📋 Copiar Filtro (${filteredSpools.length})
            </button>
          </div>
        </div>
      </div>
    ` : ''}

    <!-- BANNER SE A ABA DE REPROVADOS ESTIVER ATIVA -->
    ${spoolListFilter === 'rejected' ? `
      <div class="spool-installed-today-banner" style="background:linear-gradient(135deg, #fef2f2, #fee2e2); border:1.5px solid #ef4444; color:#991b1b; box-shadow:0 4px 15px rgba(239,68,68,0.15);">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
          <div>
            <div style="display:flex; align-items:center; gap:8px;">
              <span class="spool-pulse-beacon" style="background:#dc2626; box-shadow:0 0 0 0 rgba(220,38,38,0.7);"></span>
              <h3 style="margin:0; font-size:16px; font-weight:800; color:#991b1b;">
                🔴 TUBULAÇÕES REPROVADAS / QUARENTENA (${rejectedCount} peças)
              </h3>
            </div>
            <p style="margin:4px 0 0; font-size:12px; color:#b91c1c;">
              Peças bloqueadas por duplicidade de fábrica, dimensional ou defeito de solda · ${sectorMeta.name} (${spoolActiveDh}).
            </p>
          </div>
          <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
            <button type="button" class="button button-outline compact" onclick="spoolClearAllFilters()" style="color:#991b1b; border-color:#fca5a5; background:#ffffff; font-weight:700;">
              ✕ Ver Todos os Spools
            </button>
            <button type="button" class="button button-green compact" onclick="spoolCopyFilteredReport()" title="Copiar lista de reprovados">
              📋 Copiar Lista (${filteredSpools.length})
            </button>
          </div>
        </div>
      </div>
    ` : ''}

    <!-- 6. QUADRADOS DOS TUBOS COM TODAS AS TAGS 100% VISÍVEIS -->
    <div class="spool-tube-grid-wrap">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; flex-wrap:wrap; gap:8px;">
        <div style="display:flex; align-items:center; gap:10px;">
          <strong style="color:#0f172a; font-size:15px; display:flex; align-items:center; gap:6px;">
            <span>${sectorMeta.icon}</span> MAPA DOS TUBOS · ${sectorMeta.name} (${spoolActiveDh === 'ALL' ? 'Todos os DHs' : spoolActiveDh})
          </strong>
          <button type="button" onclick="spoolToggleMapCollapse()" style="background:#f1f5f9; border:1px solid #cbd5e1; border-radius:6px; padding:4px 10px; cursor:pointer; font-size:12px; font-weight:700; color:#475569; display:flex; align-items:center; gap:4px;" title="${spoolMapCollapsed ? 'Expandir mapa visual' : 'Recolher mapa visual'}">
            ${spoolMapCollapsed ? '▼ Expandir Mapa' : '▲ Recolher Mapa'}
          </button>
        </div>
        <div style="display:flex; gap:12px; font-size:11px; font-weight:800; color:#475569; align-items:center;">
          <span style="display:flex; align-items:center; gap:4px;"><i style="width:12px; height:12px; border-radius:3px; background:#ffffff; border:2px solid #cbd5e1; display:inline-block;"></i> Pendente</span>
          <span style="display:flex; align-items:center; gap:4px;"><i style="width:12px; height:12px; border-radius:3px; background:#f0f9ff; border:2px solid #0284c7; display:inline-block;"></i> Recebido</span>
          <span style="display:flex; align-items:center; gap:4px;"><i style="width:12px; height:12px; border-radius:3px; background:#ecfdf5; border:2px solid #10b981; display:inline-block;"></i> Instalado</span>
          <span style="display:flex; align-items:center; gap:4px;"><i style="width:12px; height:12px; border-radius:3px; background:#fef2f2; border:2px solid #ef4444; display:inline-block;"></i> Reprovado</span>
        </div>
      </div>

      ${spoolMapCollapsed ? `
        <div class="spool-map-collapsed-banner" onclick="spoolToggleMapCollapse()" style="background:#f1f5f9; border:1.5px dashed #94a3b8; border-radius:10px; padding:14px 20px; text-align:center; cursor:pointer; color:#64748b; font-weight:700; font-size:13px;">
          📦 Mapa visual recolhido · ${filteredSpools.length} spools no filtro atual · <span style="color:#0284c7; text-decoration:underline;">Clique para expandir</span>
        </div>
      ` : spoolRenderTubeSquares(filteredSpools, filterDate)}
    </div>

    <!-- 7. TABELA OPERACIONAL COM TAGS EM ALTO CONTRASTE E COLUNA DATA HALL (DH) -->
    ${spoolRenderTubeTable(filteredSpools, filterDate)}

    <!-- BARRA FLUTUANTE DE AÇÕES EM MASSA (EXCLUSÃO E STATUS EM LOTE) -->
    <div id="spoolBatchBar" class="batch-checklist-bar" style="display:none;">
      <div class="batch-bar-info">
        <span id="spoolBatchCount">0 spool(s) selecionado(s)</span>
      </div>
      <div class="batch-bar-actions">
        <button type="button" class="button compact" style="background:#059669; color:#ffffff; font-weight:700; border:none; height:32px; padding:4px 12px; border-radius:6px; cursor:pointer;" onclick="spoolCopySelectedSpools()" title="Copiar spools selecionados para WhatsApp">
          📋 Copiar Marcados
        </button>
        <button type="button" class="button compact" style="background:#dc2626; color:#ffffff; font-weight:800; border:none; height:32px; padding:4px 14px; border-radius:6px; cursor:pointer;" onclick="spoolBulkDelete()">
          🗑️ Excluir Selecionados
        </button>
        <button type="button" class="button compact" onclick="spoolBulkReject()" style="background:#b91c1c; color:#ffffff; font-weight:800; border:none; height:32px; padding:4px 12px; border-radius:6px; cursor:pointer;">
          🔴 Reprovar
        </button>
        <button type="button" class="button button-outline compact" onclick="spoolBulkSetStatus('received')" style="color:#ffffff; border-color:rgba(255,255,255,0.4);">
          🟡 Recebido
        </button>
        <button type="button" class="button button-green compact" onclick="spoolBulkSetStatus('installed')">
          🟢 Instalado
        </button>
        <button type="button" class="button button-outline compact" onclick="spoolClearSelection()" style="color:#ffffff; border-color:rgba(255,255,255,0.3);">
          Desmarcar
        </button>
      </div>
    </div>
  `;

  hydrateIcons(app);
  spoolUpdateSelection();
}

/* ==========================================================================
   BARRAMENTO PRINCIPAL VISUAL (LINHA MESTRA)
   ========================================================================== */
function spoolRenderPipelineBar(sectorSpools, sectorMeta) {
  const lineItems = sectorSpools.filter(s => s.type === 'straight' || s.type === 'valve');
  if (!lineItems.length) return '';

  const valves = lineItems.filter(s => s.type === 'valve');
  const straightPipes = lineItems.filter(s => s.type === 'straight');
  const installedCount = lineItems.filter(s => s.status === 'installed').length;
  const progressPercent = Math.round((installedCount / lineItems.length) * 100);

  const v1 = valves[0];
  const v2 = valves[1];
  const ordered = [];
  if (v1) ordered.push({ item: v1, label: 'VÁLV. ENTRADA' });
  straightPipes.forEach((p, idx) => {
    ordered.push({ item: p, label: `RETO #${idx + 1}` });
  });
  if (v2) ordered.push({ item: v2, label: 'VÁLV. FIM' });

  return `
    <div class="spool-pipeline-container">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; flex-wrap:wrap; gap:8px;">
        <div style="display:flex; align-items:center; gap:8px;">
          <strong style="font-size:14px; font-weight:800; color:#38bdf8;">
            🚰 BARRAMENTO PRINCIPAL · LINHA MESTRA (${straightPipes.length} Tubos Retos + ${valves.length} Válvulas)
          </strong>
          <span style="font-size:11px; background:#1e293b; color:#cbd5e1; padding:2px 8px; border-radius:10px; border:1px solid #475569;">
            ${installedCount}/${lineItems.length} montados (${progressPercent}%)
          </span>
        </div>
        <div style="font-size:11px; color:#94a3b8;">
          👈 Arraste para os lados para percorrer a linha toda · Clique no tubo para mudar status 👉
        </div>
      </div>

      <div class="spool-pipeline-track">
        ${ordered.map((node, i) => {
          const s = node.item;
          const isValve = s.type === 'valve';
          const isInst = s.status === 'installed';
          const isRec = s.status === 'received';
          const isRej = s.status === 'rejected';
          const statusClass = isInst ? 'status-installed' : (isRec ? 'status-received' : (isRej ? 'status-rejected' : 'status-pending'));
          const valveClass = isValve ? 'is-valve' : '';
          const selectedClass = spoolSelectedIds.has(s.id) ? 'is-selected' : '';
          const segRecInfo = s.receivedDate ? `\n• Recebido: ${formatSpoolDateDisplay(s.receivedDate)}${s.receivedAt ? ` às ${formatSpoolTime(s.receivedAt)}` : ''}` : '';
          const segInstInfo = s.installedDate ? `\n• Instalado: ${formatSpoolDateDisplay(s.installedDate)}${s.installedAt ? ` às ${formatSpoolTime(s.installedAt)}` : ''}` : '';
          const segRejInfo = s.rejectedDate ? `\n• Reprovado: ${formatSpoolDateDisplay(s.rejectedDate)}${s.rejectedReason ? ` (${s.rejectedReason})` : ''}` : '';

          return `
            <div class="spool-pipe-seg ${valveClass} ${statusClass} ${selectedClass}" data-spool-id="${esc(s.id)}" onclick="spoolHandleTubeTap('${s.id}', event)" title="${isValve ? 'Válvula de Linha' : 'Tubo Reto'} ${esc(spoolDisplayNumber(s))} (${node.label})${segRecInfo}${segInstInfo}${segRejInfo}\nClique para ${spoolMultiSelectMode ? 'marcar/desmarcar' : (spoolSafeTapMode ? 'abrir menu de ações' : 'alternar status')}">
              <span class="seg-tag">${esc(spoolDisplayNumber(s))}</span>
              <span class="seg-idx">${node.label}</span>
            </div>
            ${i < ordered.length - 1 ? '<div class="spool-pipe-connector"></div>' : ''}
          `;
        }).join('')}
      </div>
    </div>
  `;
}

/* ==========================================================================
   RENDERIZAÇÃO DOS QUADRADOS DOS TUBOS
   ========================================================================== */
function spoolRenderTubeSquares(list, filterDate) {
  if (!list.length) {
    return `
      <div style="text-align:center; padding:36px 16px; background:#f8fafc; border-radius:10px; border:1px dashed #cbd5e1;">
        <span style="font-size:28px; display:block; margin-bottom:8px;">📦</span>
        <strong style="color:#0f172a; font-size:14px; display:block;">Nenhum spool encontrado com os filtros selecionados.</strong>
        <p style="color:#64748b; font-size:12px; margin:6px 0 14px;">Você possui ${spoolDb.length} spools cadastrados. Ajuste os filtros acima ou clique em "Mostrar Meus Spools".</p>
        <div style="display:flex; justify-content:center; gap:8px;">
          <button type="button" class="button button-green compact" onclick="spoolShowAllMySpools()">👁️ Mostrar Meus ${spoolDb.length} Spools</button>
          <button type="button" class="button button-outline compact" onclick="spoolClearAllFilters()">Limpar Filtros</button>
        </div>
      </div>
    `;
  }

  return `
    <div class="spool-tube-grid">
      ${list.map(spool => {
        const isStraight = spool.type === 'straight';
        const isValve = spool.type === 'valve';
        const isInst = spool.status === 'installed';
        const isRec = spool.status === 'received';
        const isRej = spool.status === 'rejected';
        const statusClass = isInst ? 'status-installed' : (isRec ? 'status-received' : (isRej ? 'status-rejected' : 'status-pending'));
        const typeClass = isValve ? 'is-valve' : (isStraight ? 'is-straight' : 'is-branch');

        const cardRecInfo = spool.receivedDate ? `\n• Recebido em: ${formatSpoolDateDisplay(spool.receivedDate)}${spool.receivedAt ? ` às ${formatSpoolTime(spool.receivedAt)}` : ''}${spool.receivedBy ? ` (${spool.receivedBy})` : ''}` : '';
        const cardInstInfo = spool.installedDate ? `\n• Instalado em: ${formatSpoolDateDisplay(spool.installedDate)}${spool.installedAt ? ` às ${formatSpoolTime(spool.installedAt)}` : ''}${spool.installedBy ? ` (${spool.installedBy})` : ''}` : '';
        const cardRejInfo = spool.rejectedDate ? `\n• Reprovado em: ${formatSpoolDateDisplay(spool.rejectedDate)}${spool.rejectedReason ? ` (Motivo: ${spool.rejectedReason})` : ''}${spool.rejectedBy ? ` por ${spool.rejectedBy}` : ''}` : '';

        const isSelected = spoolSelectedIds.has(spool.id);
        return `
          <div class="spool-tube-card ${typeClass} ${statusClass}${isSelected ? ' is-selected' : ''}" data-spool-id="${esc(spool.id)}" onclick="spoolHandleTubeTap('${spool.id}', event)" title="Spool ${esc(spoolDisplayNumber(spool))} (${esc(spool.dh || '')})${cardRecInfo}${cardInstInfo}${cardRejInfo}\nClique para ${spoolMultiSelectMode ? 'marcar/desmarcar' : (spoolSafeTapMode ? 'abrir menu de ações' : 'alternar status')} ou no 📅 para ver/editar datas">
            ${spoolMultiSelectMode ? `<input type="checkbox" class="spool-card-select-check" ${isSelected ? 'checked' : ''} onclick="event.stopPropagation(); spoolToggleCardSelection('${spool.id}')" aria-label="Selecionar spool ${esc(spoolDisplayNumber(spool))}">` : ''}
            <div class="tube-header">
              <span style="font-size:10px; font-weight:800; padding:2px 6px; border-radius:4px; ${isValve ? 'background:#fef3c7; color:#b45309;' : (isStraight ? 'background:#f3e8ff; color:#7e22ce;' : 'background:#e0f2fe; color:#0369a1;')}">
                ${isValve ? '🔘 VÁLVULA' : (isStraight ? '📏 RETO' : '📐 DERIV')}
              </span>
              <div style="display:flex; align-items:center; gap:6px;">
                <span style="font-size:11px; font-weight:800; color:#64748b;">${esc(spool.diameter || '')}</span>
                <button type="button" onclick="event.stopPropagation(); spoolOpenTrackingModal('${spool.id}')" title="Ver datas exatas de recebimento e montagem" style="background:#f1f5f9; border:1px solid #cbd5e1; border-radius:4px; cursor:pointer; font-size:10px; padding:2px 4px; line-height:1; display:flex; align-items:center;">
                  📅
                </button>
              </div>
            </div>

            <!-- NÚMERO DA TAG EM ALTO CONTRASTE TOTAL -->
            <span class="tube-tag">${esc(spool.number)}</span>
            ${spool.part ? `<span class="spool-part-badge" style="display:block; font-size:8px; font-weight:800; text-align:center; margin-top:2px; color:#7c3aed; background:#f3e8ff; border-radius:4px; padding:1px 4px;">${esc(spool.part)}</span>` : ''}
            ${spool.notes ? `<span style="display:block; font-size:8px; text-align:center; color:#64748b; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:100%; margin-top:1px;" title="${esc(spool.notes)}">📝</span>` : ''}

            <div class="tube-foot" style="display:flex; flex-direction:column; gap:2px; font-size:10px; line-height:1.2; width:100%; text-align:center;">
              ${isInst ? `
                <div style="color:#065f46; font-weight:800; display:flex; align-items:center; justify-content:center; gap:3px;">
                  <span>🟢 Inst:</span> <span>${formatSpoolDateShort(spool.installedDate)}${spool.installedAt ? ` ${formatSpoolTime(spool.installedAt)}` : ''}</span>
                </div>
                ${spool.receivedDate ? `
                  <div style="color:#0369a1; font-weight:700; font-size:9px; opacity:0.95;">
                    🟡 Rec: ${formatSpoolDateShort(spool.receivedDate)}${spool.receivedAt ? ` ${formatSpoolTime(spool.receivedAt)}` : ''}
                  </div>
                ` : ''}
              ` : (isRec ? `
                <div style="color:#0369a1; font-weight:800; display:flex; align-items:center; justify-content:center; gap:3px;">
                  <span>🟡 Rec:</span> <span>${formatSpoolDateShort(spool.receivedDate)}${spool.receivedAt ? ` ${formatSpoolTime(spool.receivedAt)}` : ''}</span>
                </div>
              ` : (isRej ? `
                <div style="color:#b91c1c; font-weight:900; display:flex; align-items:center; justify-content:center; gap:3px;">
                  <span>🔴 Reprov:</span> <span>${formatSpoolDateShort(spool.rejectedDate || spool.installedDate || spool.receivedDate)}</span>
                </div>
                ${spool.rejectedReason ? `<small style="font-size:9px; color:#ef4444; font-weight:700; display:block; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${esc(spool.rejectedReason)}">${esc(spool.rejectedReason)}</small>` : ''}
              ` : `
                <div style="color:#64748b; font-weight:700;">⚪ Pendente</div>
              `))}
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

/* ==========================================================================
   RENDERIZAÇÃO DA TABELA OPERACIONAL
   - Tags 100% visíveis com estilo pill contrastante (preto/azul/verde)
   - Campo Data Hall (DH) explícito em coluna dedicada
   ========================================================================== */
function spoolRenderTubeTable(list, filterDate) {
  return `
    <section class="panel" style="margin-top:16px; background:#ffffff; border:1.5px solid #cbd5e1; border-radius:12px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.04);">
      <div class="panel-head" style="justify-content:space-between; flex-wrap:wrap; gap:10px; background:#f8fafc; padding:14px 18px; border-bottom:1px solid #e2e8f0;">
        <div style="display:flex; align-items:center; gap:8px;">
          <strong style="font-size:15px; color:#0f172a; font-weight:800;">
            📋 Lista de Spools & Apontamento (${list.length} exibidos de ${spoolDb.length} totais)
          </strong>
        </div>
        <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
          <button type="button" class="button button-outline compact" onclick="spoolCopyFilteredReport()" style="font-weight:800; color:#0f172a; background:#ffffff;" title="Copiar todos os ${list.length} spools da lista para WhatsApp">
            ${icon('clipboard')} Copiar Lista (${list.length})
          </button>
          <button type="button" class="button button-green compact" onclick="spoolOpenExportModal()" style="font-weight:800;" title="Abrir opções de download da planilha">
            ${icon('download')} Baixar Planilha
          </button>
          ${(spoolStatusFilter !== 'all' || spoolDateFilterMode !== 'all' || spoolTypeFilter !== 'all' || spoolDiameterFilter !== 'all' || spoolListFilter !== 'all' || Boolean(spoolSearchTerm) || spoolActiveSector !== 'all' || spoolActiveSubArea !== 'all' || spoolActiveDh !== 'ALL') ? `
            <button type="button" class="button button-outline compact" onclick="spoolExportUpdatedSpreadsheet('filtered')" style="font-weight:800; color:#0f172a;" title="Baixar apenas os ${list.length} spools visíveis com os filtros atuais">
              ${icon('download')} Baixar Filtrados (${list.length})
            </button>
            <button type="button" class="button button-outline compact" onclick="spoolExportUpdatedSpreadsheet('all')" style="font-weight:800; color:#047857;" title="Baixar todos os ${spoolDb.length} spools sem nenhum filtro">
              ${icon('download')} Baixar Tudo (${spoolDb.length})
            </button>
          ` : `
            <button type="button" class="button button-outline compact" onclick="spoolExportUpdatedSpreadsheet('all')" style="font-weight:800; color:#0f172a;" title="Baixar todos os ${spoolDb.length} spools da obra em Excel">
              ${icon('download')} Baixar Completa (${spoolDb.length})
            </button>
          `}
          <span style="font-size:12px; color:#64748b;">
            Clique em <strong>[Recebido]</strong> ou <strong>[Instalado]</strong> para status, ou <strong>[🗑️]</strong> para excluir.
          </span>
        </div>
      </div>

      <!-- BANNER DE AÇÕES EM MASSA NA TABELA -->
      <div id="spoolTableBatchBanner" style="display:none; background:#fee2e2; border-bottom:1.5px solid #fca5a5; padding:10px 18px; align-items:center; justify-content:space-between; gap:12px; flex-wrap:wrap;">
        <div style="display:flex; align-items:center; gap:10px;">
          <span id="spoolBannerCount" style="font-weight:800; color:#991b1b; font-size:13px;">
            ✓ 0 spool(s) selecionado(s)
          </span>
          <button type="button" class="button button-outline compact" onclick="spoolClearSelection()" style="height:26px; font-size:11px; padding:2px 8px; color:#991b1b; border-color:#fca5a5; background:#ffffff;">
            Desmarcar todos
          </button>
        </div>
        <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
          <button type="button" class="button compact" onclick="spoolCopySelectedSpools()" style="background:#059669; color:#ffffff; font-weight:700; border:none; height:30px; padding:4px 12px; border-radius:6px; cursor:pointer; font-size:12px;" title="Copiar spools marcados para WhatsApp">
            📋 Copiar Marcados
          </button>
          <button type="button" class="button compact" onclick="spoolBulkDelete()" style="background:#dc2626; color:#ffffff; font-weight:800; border:none; height:30px; padding:4px 14px; border-radius:6px; cursor:pointer; font-size:12px;">
            🗑️ Excluir Selecionados
          </button>
          <button type="button" class="button compact" onclick="spoolBulkReject()" style="background:#dc2626; color:#ffffff; font-weight:800; border:none; height:30px; padding:4px 12px; border-radius:6px; cursor:pointer; font-size:12px;">
            🔴 Marcar Reprovado
          </button>
          <button type="button" class="button compact" onclick="spoolBulkSetStatus('received')" style="background:#0284c7; color:#ffffff; font-weight:700; border:none; height:30px; padding:4px 10px; border-radius:6px; cursor:pointer; font-size:12px;">
            🟡 Marcar Recebido
          </button>
          <button type="button" class="button compact" onclick="spoolBulkSetStatus('installed')" style="background:#059669; color:#ffffff; font-weight:700; border:none; height:30px; padding:4px 10px; border-radius:6px; cursor:pointer; font-size:12px;">
            🟢 Marcar Instalado
          </button>
        </div>
      </div>

      <div class="table-wrap">
        <table class="data-table" style="width:100%; border-collapse:collapse; background:#ffffff; color:#0f172a;">
          <thead>
            <tr style="background:#f1f5f9; border-bottom:2px solid #cbd5e1;">
              <th style="width:40px; text-align:center; padding:12px 6px;">
                <input type="checkbox" id="selectAllSpools" onchange="spoolToggleSelectAll(this)" title="Selecionar todos os spools da tabela" style="cursor:pointer; width:16px; height:16px;">
              </th>
              <th style="width:160px; padding:12px 14px; font-weight:800; color:#1e293b;">TAG / SPOOL</th>
              <th style="width:110px; padding:12px 14px; font-weight:800; color:#1e293b;">DATA HALL (DH)</th>
              <th style="width:160px; padding:12px 14px; font-weight:800; color:#1e293b;">SETOR</th>
              <th style="width:160px; padding:12px 14px; font-weight:800; color:#1e293b;">CLASSIFICAÇÃO</th>
              <th style="width:90px; padding:12px 14px; font-weight:800; color:#1e293b;">DIÂMETRO</th>
              <th style="width:110px; padding:12px 14px; font-weight:800; color:#1e293b;">STATUS</th>
              <th style="min-width:240px; text-align:center; padding:12px 14px; font-weight:800; color:#1e293b;">MUDAR STATUS (1 CLIQUE)</th>
              <th style="min-width:130px; padding:12px 14px; font-weight:800; color:#0369a1;">🟡 RECEBIDO EM</th>
              <th style="min-width:140px; padding:12px 14px; font-weight:800; color:#047857;">🟢 INSTALADO EM</th>
            </tr>
          </thead>
          <tbody>
            ${list.length ? list.map(s => {
              const isReceived = s.status === 'received';
              const isInstalled = s.status === 'installed';
              const isRejected = s.status === 'rejected';
              const sector = SPOOL_SECTORS[s.area] || { name: s.area || 'Geral' };

              // Estilização robusta inline para garantir 100% de visibilidade e contraste
              const pillBg = isInstalled ? '#059669' : (isReceived ? '#0284c7' : (isRejected ? '#dc2626' : '#0f172a'));
              const pillBorder = isInstalled ? '#047857' : (isReceived ? '#0369a1' : (isRejected ? '#b91c1c' : '#334155'));

              return `
                <tr style="border-bottom:1px solid #e2e8f0; ${isRejected ? 'background:#fff8f8;' : ''}">
                  <td style="text-align:center; padding:10px 6px;">
                    <input type="checkbox" class="spool-select-check" value="${esc(s.id)}" ${spoolSelectedIds.has(s.id) ? 'checked' : ''} onchange="spoolSetSelectionFromCheckbox(this)" style="cursor:pointer; width:16px; height:16px;" title="Selecionar este spool">
                  </td>
                  <td style="padding:10px 14px;">
                    <!-- TAG EM MÁXIMO CONTRASTE TOTAL GARANTIDO -->
                    <span class="spool-tag-pill status-${s.status === 'not-started' ? 'pending' : s.status}"
                          style="display:inline-flex; align-items:center; justify-content:center; font-family:monospace, ui-monospace, sans-serif; font-size:14px; font-weight:900; padding:6px 14px; border-radius:6px; letter-spacing:0.5px; background:${pillBg} !important; color:#ffffff !important; border:1.5px solid ${pillBorder} !important; box-shadow:0 1px 4px rgba(0,0,0,0.25);">
                      ${esc(s.number)}
                    </span>
                    ${s.part ? `<span class="spool-part-badge" style="margin-left:5px; vertical-align:middle;">${esc(s.part)}</span>` : ''}
                  </td>
                  <td style="padding:10px 14px;">
                    <!-- CAMPO DATA HALL (DH) EM DESTAQUE -->
                    <span style="display:inline-block; font-size:12px; font-weight:900; color:#0369a1; background:#e0f2fe; padding:4px 10px; border-radius:6px; border:1.5px solid #bae6fd;">
                      ${esc(normalizeDh(s.dh))}
                    </span>
                  </td>
                  <td style="padding:10px 14px;">
                    <span style="font-size:13px; font-weight:800; color:#0f172a;">${esc(sector.name)}</span>
                    ${s.subArea ? `<small style="display:block; margin-top:3px; color:#92400e; font-weight:700;">${esc(s.subArea)}</small>` : ''}
                  </td>
                  <td style="padding:10px 14px;">
                    ${s.type === 'valve'
                      ? '<span class="badge-valve">🔘 VÁLVULA DE PONTA</span>'
                      : (s.type === 'straight'
                        ? '<span class="badge-straight">📏 TRECHO RETO (LINHA)</span>'
                        : '<span class="badge-branch">📐 DERIVAÇÃO</span>')}
                  </td>
                  <td style="padding:10px 14px;">
                    <strong style="font-size:13px; font-weight:800; color:#0f172a;">${esc(s.diameter || '—')}</strong>
                  </td>
                  <td style="padding:10px 14px;">
                    ${isInstalled
                      ? '<span class="spool-status done"><i></i>Instalado</span>'
                      : (isReceived
                        ? '<span class="spool-status in-progress"><i></i>Recebido</span>'
                        : (isRejected
                          ? '<span class="spool-status rejected" style="background:#fee2e2; color:#b91c1c; border:1px solid #fca5a5;"><i></i>🔴 Reprovado</span>'
                          : '<span class="spool-status"><i></i>Pendente</span>'))}
                  </td>
                  <td style="text-align:center; padding:10px 14px;">
                    <div class="spool-action-group">
                      <button type="button" class="btn-spool-action btn-received ${isReceived ? 'is-active' : ''}" onclick="spoolSetItemStatus('${s.id}', 'received')" title="Marcar como Recebido na Obra">
                        🟡 Recebido
                      </button>
                      <button type="button" class="btn-spool-action btn-installed ${isInstalled ? 'is-active' : ''}" onclick="spoolSetItemStatus('${s.id}', 'installed')" title="Marcar como Instalado no Dia">
                        🟢 Instalado
                      </button>
                      <button type="button" class="btn-spool-action btn-rejected ${isRejected ? 'is-active' : ''}" onclick="spoolPromptRejectItem('${s.id}')" title="Marcar como Reprovado / Quarentena / Devolução" style="background:${isRejected ? '#dc2626' : '#fee2e2'}; color:${isRejected ? '#ffffff' : '#b91c1c'}; border:1px solid ${isRejected ? '#b91c1c' : '#fca5a5'}; font-weight:800;">
                        🔴 Reprovado
                      </button>
                      <button type="button" class="btn-spool-action btn-pending" onclick="spoolSetItemStatus('${s.id}', 'not-started')" title="Voltar para Pendente (Desfazer)">
                        ↩️
                      </button>
                      <button type="button" class="btn-spool-action btn-outline" onclick="spoolOpenTrackingModal('${s.id}')" title="Ver histórico completo e editar datas" style="background:#f1f5f9; border:1px solid #cbd5e1; color:#0f172a; padding:4px 6px;">
                        📅
                      </button>
                      <button type="button" class="btn-spool-action btn-delete" onclick="spoolDeleteItem('${s.id}')" title="Excluir este spool permanentemente">
                        🗑️
                      </button>
                    </div>
                  </td>
                  <td style="padding:10px 14px;">
                    ${isRejected ? `
                      <span style="display:inline-block; font-size:12px; font-weight:900; color:#b91c1c; background:#fee2e2; padding:3px 8px; border-radius:6px; border:1.5px solid #fca5a5;">
                        🔴 ${formatSpoolDateDisplay(s.rejectedDate || s.receivedDate)}${s.rejectedAt ? ` <small style="font-weight:700; color:#991b1b;">${formatSpoolTime(s.rejectedAt)}</small>` : ''}
                      </span>
                      ${s.rejectedReason ? `<small style="font-size:10px; color:#b91c1c; font-weight:800; display:block; margin-top:2px;" title="${esc(s.rejectedReason)}">Motivo: ${esc(s.rejectedReason)}</small>` : ''}
                      ${s.rejectedBy ? `<small style="font-size:9.5px; color:#64748b; display:block; margin-top:1px;">Por: ${esc(s.rejectedBy)}</small>` : ''}
                    ` : (s.receivedDate ? `
                      <span style="display:inline-block; font-size:12px; font-weight:800; color:#0369a1; background:#f0f9ff; padding:3px 8px; border-radius:6px; border:1px solid #bae6fd;">
                        🟡 ${formatSpoolDateDisplay(s.receivedDate)}${s.receivedAt ? ` <small style="font-weight:600; color:#0284c7;">${formatSpoolTime(s.receivedAt)}</small>` : ''}
                      </span>
                      ${s.receivedBy ? `<small style="font-size:10px; color:#64748b; display:block; margin-top:2px;">Por: ${esc(s.receivedBy)}</small>` : ''}
                    ` : `
                      <span style="font-size:11px; color:#94a3b8; font-weight:600;">—</span>
                    `)}
                  </td>
                  <td style="padding:10px 14px;">
                    ${isRejected ? `
                      <span style="display:inline-block; font-size:11px; font-weight:800; color:#b91c1c; background:#fef2f2; padding:3px 8px; border-radius:6px; border:1px dashed #f87171;">
                        ⛔ BLOQUEADO P/ MONTAGEM
                      </span>
                    ` : (s.installedDate ? `
                      <span style="display:inline-block; font-size:12px; font-weight:900; color:#047857; background:#f0fdf4; padding:3px 8px; border-radius:6px; border:1px solid #86efac;">
                        🟢 ${formatSpoolDateDisplay(s.installedDate)}${s.installedAt ? ` <small style="font-weight:700; color:#15803d;">${formatSpoolTime(s.installedAt)}</small>` : ''}
                      </span>
                      ${s.installedBy ? `<small style="font-size:10px; color:#166534; font-weight:700; display:block; margin-top:2px;">Por: ${esc(s.installedBy)}</small>` : ''}
                    ` : `
                      <span style="font-size:11px; color:#94a3b8; font-weight:600;">—</span>
                    `)}
                  </td>
                </tr>
              `;
            }).join('') : `
              <tr>
                <td colspan="10" style="text-align:center; padding:36px 16px; color:#64748b; font-size:13px; font-weight:700;">
                  Nenhum spool encontrado com estes filtros. <button type="button" class="button button-green compact" onclick="spoolShowAllMySpools()" style="margin-left:8px;">Ver Todos os ${spoolDb.length} Spools</button>
                </td>
              </tr>
            `}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

/* ==========================================================================
   AÇÕES DO USUÁRIO & MANIPULAÇÃO DE FILTROS
   ========================================================================== */

function spoolSelectSector(sectorId) {
  spoolActiveSector = sectorId;
  spoolActiveSubArea = 'all';
  localStorage.setItem('obraflow_spool_active_sector', sectorId);
  localStorage.setItem('obraflow_spool_active_subarea', 'all');
  renderSpools();
}

function spoolSelectDh(dhName) {
  spoolActiveDh = dhName;
  localStorage.setItem('obraflow_spool_active_dh', dhName);
  renderSpools();
}

function spoolSetFilter(filterKey) {
  spoolListFilter = filterKey;
  if (filterKey === 'installed_today') {
    spoolDateFilterMode = 'installed';
    spoolStatusFilter = 'all';
  } else if (filterKey === 'received_today') {
    spoolDateFilterMode = 'received';
    spoolStatusFilter = 'all';
  } else if (filterKey === 'rejected') {
    spoolStatusFilter = 'rejected';
    spoolDateFilterMode = 'all';
  } else if (filterKey === 'all') {
    spoolDateFilterMode = 'all';
    spoolStatusFilter = 'all';
  }
  renderSpools();
}

function spoolSetStatusFilter(statusVal) {
  spoolStatusFilter = statusVal;
  renderSpools();
}

function spoolSetTypeFilter(typeVal) {
  spoolTypeFilter = typeVal;
  renderSpools();
}

function spoolSetDiameterFilter(diaVal) {
  spoolDiameterFilter = diaVal;
  renderSpools();
}

function spoolSetDateFilterMode(mode) {
  spoolDateFilterMode = mode;
  renderSpools();
  if (mode === 'all') {
    toast('🌐 Exibindo todas as datas');
  } else if (mode === 'activity') {
    toast(`⚡ Filtrando atividade de ${formatSpoolDateDisplay(spoolSelectedDate || getLocalDateStr())}`);
  } else if (mode === 'installed') {
    toast(`🟢 Filtrando instalados de ${formatSpoolDateDisplay(spoolSelectedDate || getLocalDateStr())}`);
  } else if (mode === 'received') {
    toast(`🟡 Filtrando recebidos de ${formatSpoolDateDisplay(spoolSelectedDate || getLocalDateStr())}`);
  } else if (mode === 'rejected') {
    toast(`🔴 Filtrando reprovados de ${formatSpoolDateDisplay(spoolSelectedDate || getLocalDateStr())}`);
  }
}

function spoolQuickFilterDay(dateStr, mode = 'activity') {
  spoolSelectedDate = dateStr;
  spoolDateFilterMode = mode;
  renderSpools();
  toast(`📅 Filtrando por ${formatSpoolDateDisplay(dateStr)}`);
}

function spoolClearDateFilter() {
  spoolDateFilterMode = 'all';
  if (spoolListFilter === 'installed_today' || spoolListFilter === 'received_today' || spoolListFilter === 'rejected') {
    spoolListFilter = 'all';
  }
  renderSpools();
  toast('Filtro de data desativado (mostrando todas as datas)');
}

function spoolClearAllFilters() {
  spoolStatusFilter = 'all';
  spoolTypeFilter = 'all';
  spoolDiameterFilter = 'all';
  spoolListFilter = 'all';
  spoolDateFilterMode = 'all';
  spoolSearchTerm = '';
  spoolSelectedDate = getLocalDateStr();
  spoolActiveSector = 'all';
  spoolActiveSubArea = 'all';
  spoolActiveDh = 'ALL';
  localStorage.setItem('obraflow_spool_active_sector', 'all');
  localStorage.setItem('obraflow_spool_active_subarea', 'all');
  localStorage.setItem('obraflow_spool_active_dh', 'ALL');
  renderSpools();
  toast('Filtros redefinidos!');
}

function spoolSelectSubArea(subAreaId) {
  spoolActiveSubArea = subAreaId || 'all';
  localStorage.setItem('obraflow_spool_active_subarea', spoolActiveSubArea);
  renderSpools();
}

function spoolToggleSafeTapMode() {
  spoolSafeTapMode = !spoolSafeTapMode;
  localStorage.setItem('obraflow_spool_safe_tap', spoolSafeTapMode ? 'true' : 'false');
  renderSpools();
  if (spoolSafeTapMode) {
    toast('🛡️ Modo Seguro ativado: o toque abre o menu deliberado de ações (sem risco de desmarcar ao rolar no tablet).');
  } else {
    toast('⚡ Modo Rápido ativado: o toque alterna o status diretamente.');
  }
}

function spoolToggleMapCollapse() {
  spoolMapCollapsed = !spoolMapCollapsed;
  localStorage.setItem('obraflow_spool_map_collapsed', spoolMapCollapsed ? 'true' : 'false');
  renderSpools();
}

function spoolToggleMultiSelectMode() {
  spoolMultiSelectMode = !spoolMultiSelectMode;
  if (!spoolMultiSelectMode) {
    spoolSelectedIds.clear();
  }
  renderSpools();
  if (spoolMultiSelectMode) {
    toast('Modo Seleção em Lote ativado! Toque nos spools para marcar.');
  }
}

function spoolToggleCardSelection(spoolId) {
  if (spoolSelectedIds.has(spoolId)) {
    spoolSelectedIds.delete(spoolId);
  } else {
    spoolSelectedIds.add(spoolId);
  }
  spoolUpdateSelection();
}

function spoolSyncCardSelectionUI() {
  document.querySelectorAll('[data-spool-id]').forEach(card => {
    const id = card.dataset.spoolId || '';
    const isSel = spoolSelectedIds.has(id);
    card.classList.toggle('is-selected', isSel);
    const chk = card.querySelector('.spool-card-select-check');
    if (chk) chk.checked = isSel;
  });
}

function spoolSelectAllVisible() {
  const visible = spoolFilterList(spoolDb);
  visible.forEach(s => spoolSelectedIds.add(s.id));
  spoolUpdateSelection();
  toast(`✓ ${visible.length} spool(s) selecionado(s)!`);
}

function spoolHandleTubeTap(spoolId, event) {
  if (event) event.stopPropagation();

  // 1. Se estiver no Modo Seleção em Lote: apenas seleciona/desmarca o spool
  if (spoolMultiSelectMode) {
    spoolToggleCardSelection(spoolId);
    return;
  }

  // 2. Se estiver no Modo Seguro (padrão): abre modal com ações deliberadas
  if (spoolSafeTapMode) {
    spoolOpenQuickActionModal(spoolId);
    return;
  }

  // 3. Se estiver no Modo Toque Rápido:
  spoolToggleStatus(spoolId);
}

// Alternância deliberada com proteção contra toques acidentais
function spoolToggleStatus(spoolId) {
  const item = spoolDb.find(s => s.id === spoolId);
  if (!item) return;

  if (item.status === 'rejected') {
    if (confirm(`O Spool ${item.number} está marcado como REPROVADO (${item.rejectedReason || 'Quarentena'}).\nDeseja reverter para Pendente?`)) {
      spoolSetItemStatus(spoolId, 'not-started');
    }
    return;
  }

  if (item.status === 'not-started') {
    spoolSetItemStatus(spoolId, 'received');
  } else if (item.status === 'received') {
    spoolSetItemStatus(spoolId, 'installed');
  } else {
    // Confirmação para evitar desmarcar acidentalmente ao rolar a tela no tablet
    const partTxt = item.part ? ` (${item.part})` : '';
    if (confirm(`⚠️ O Spool ${item.number}${partTxt} já está marcado como INSTALADO.\nDeseja realmente desmarcá-lo e voltar para Pendente?`)) {
      spoolSetItemStatus(spoolId, 'not-started');
    }
  }
}

// Modal Rápido de Ação Deliberada (Proteção Total no Tablet)
function spoolOpenQuickActionModal(spoolId) {
  const spool = spoolDb.find(s => s.id === spoolId);
  if (!spool) return;

  const isInst = spool.status === 'installed';
  const isRec = spool.status === 'received';
  const isRej = spool.status === 'rejected';
  const sector = SPOOL_SECTORS[spool.area] || { name: spool.area || 'Setor' };

  modal(`
    <div style="background:#ffffff; color:#0f172a; padding:18px;">
      <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:14px; border-bottom:1px solid #e2e8f0; padding-bottom:12px;">
        <div>
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="font-size:26px; font-weight:900; font-family:monospace; color:#0f172a;">
              ${esc(spool.number)}
            </span>
            ${spool.part ? `<span class="spool-part-badge" style="font-size:13px; padding:3px 8px;">${esc(spool.part)}</span>` : ''}
            ${spool.subArea ? `<span class="spool-subarea-badge">${esc(spool.subArea)}</span>` : ''}
          </div>
          <small style="color:#64748b; font-weight:700; font-size:12px;">
            ${esc(normalizeDh(spool.dh))} · ${esc(sector.name)} · Ø ${esc(spool.diameter || '—')}
          </small>
        </div>
        <button type="button" class="icon-button" onclick="closeModal()" title="Fechar" style="color:#64748b;">
          ${icon('close')}
        </button>
      </div>

      <!-- STATUS ATUAL -->
      <div style="margin-bottom:16px;">
        <label style="font-size:11px; font-weight:800; color:#64748b; text-transform:uppercase; display:block; margin-bottom:8px;">
          ALTERAR STATUS DO SPOOL:
        </label>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
          <button type="button" class="button compact ${isInst ? 'button-green' : 'button-outline'}" style="font-weight:800; height:42px; justify-content:center;" onclick="spoolSetItemStatus('${spool.id}', 'installed'); closeModal();">
            🟢 ${isInst ? '✓ Instalado' : 'Marcar Instalado'}
          </button>
          <button type="button" class="button compact" style="background:${isRec ? '#0284c7' : '#f0f9ff'}; color:${isRec ? '#ffffff' : '#0369a1'}; border:1.5px solid #0284c7; font-weight:800; height:42px; justify-content:center;" onclick="spoolSetItemStatus('${spool.id}', 'received'); closeModal();">
            🟡 ${isRec ? '✓ Recebido' : 'Marcar Recebido'}
          </button>
          <button type="button" class="button compact" style="background:${isRej ? '#dc2626' : '#fef2f2'}; color:${isRej ? '#ffffff' : '#991b1b'}; border:1.5px solid #ef4444; font-weight:800; height:42px; justify-content:center;" onclick="closeModal(); spoolPromptRejectItem('${spool.id}');">
            🔴 ${isRej ? '✓ Reprovado' : 'Reprovar / Quarentena'}
          </button>
          <button type="button" class="button button-outline compact" style="color:#64748b; border-color:#cbd5e1; font-weight:800; height:42px; justify-content:center;" onclick="spoolSetItemStatus('${spool.id}', 'not-started'); closeModal();">
            ⚪ ${spool.status === 'not-started' ? '✓ Pendente' : 'Desmarcar (Pendente)'}
          </button>
        </div>
      </div>

      <!-- OBSERVAÇÃO RÁPIDA -->
      <div style="margin-bottom:16px; background:#f8fafc; padding:12px; border-radius:8px; border:1px solid #e2e8f0;">
        <label style="font-size:12px; font-weight:800; color:#0f172a; display:block; margin-bottom:6px;">
          📝 Observação / Notas do Spool:
        </label>
        <div style="display:flex; gap:8px;">
          <input type="text" id="spoolQuickNoteInput" value="${esc(spool.notes || '')}" placeholder="Adicionar observação..." style="flex:1; padding:8px 10px; border-radius:6px; border:1px solid #cbd5e1; font-weight:600; font-size:13px;">
          <button type="button" class="button button-green compact" onclick="spoolSaveQuickNote('${spool.id}')" style="font-weight:800;">
            Salvar
          </button>
        </div>
      </div>

      <!-- RODAPÉ COM DETALHES -->
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; border-top:1px solid #e2e8f0; padding-top:12px;">
        <button type="button" class="button button-outline compact" onclick="closeModal(); spoolOpenTrackingModal('${spool.id}');" style="font-weight:700; color:#0f172a; font-size:12px;">
          📅 Editar Datas & Sequência Completa
        </button>
        <button type="button" class="button compact" style="background:#dc2626; color:#ffffff; font-weight:700; font-size:12px; border:none;" onclick="closeModal(); spoolDeleteItem('${spool.id}');">
          🗑️ Excluir
        </button>
      </div>
    </div>
  `, 'modal-medium');
}

function spoolSaveQuickNote(spoolId) {
  const item = spoolDb.find(s => s.id === spoolId);
  if (!item) return;
  const val = (document.getElementById('spoolQuickNoteInput')?.value || '').trim();
  item.notes = val;
  spoolSaveAll(spoolDb);
  toast('Observação salva com sucesso!');
  closeModal();
  renderSpools();
}

function spoolSetSelectedDate(dateStr, autoActivate = false) {
  spoolSelectedDate = dateStr;
  if (autoActivate && spoolDateFilterMode === 'all') {
    spoolDateFilterMode = 'activity';
  }
  renderSpools();
}

// Modal Rápido de Reprovação (Com Motivos Prontos, Ex: Duplicidade da Fábrica)
function spoolPromptRejectItem(spoolId) {
  const item = spoolDb.find(s => s.id === spoolId);
  if (!item) return;

  const currentReason = item.rejectedReason || '';
  const today = getLocalDateStr();
  const userName = (window.currentUser?.name) || 'Pedro Alves';

  modal(`
    <form onsubmit="spoolConfirmRejectItem(event, '${item.id}')">
      ${modalHead('Reprovar Spool / Tubulação', `Spool ${esc(item.number)} · ${esc(item.dh || 'DH 04')} · ${esc(SPOOL_SECTORS[item.area]?.name || item.area)}`)}
      <div class="modal-body" style="display:grid; gap:14px; background:#ffffff; color:#0f172a;">
        <div style="background:#fef2f2; border:1.5px solid #f87171; border-radius:10px; padding:12px 14px; display:flex; align-items:flex-start; gap:10px;">
          <span style="font-size:24px; line-height:1;">⛔</span>
          <div>
            <strong style="color:#991b1b; font-size:13px; display:block;">Bloqueio de Tubulação para Montagem</strong>
            <small style="color:#b91c1c; font-size:11.5px; font-weight:600;">Ao reprovar, o spool é sinalizado em vermelho como não liberado/quarentena, prevenindo que a equipe instale uma peça duplicada ou defeituosa na linha.</small>
          </div>
        </div>

        <div>
          <label style="font-size:12px; font-weight:800; color:#0f172a; display:block; margin-bottom:6px;">
            SELECIONE O MOTIVO RÁPIDO:
          </label>
          <div style="display:flex; flex-wrap:wrap; gap:6px;">
            <button type="button" class="button button-outline compact" onclick="document.getElementById('spoolRejectReasonInput').value = 'Duplicidade enviada pela fábrica'; document.getElementById('spoolRejectReasonInput').focus();" style="border-color:#fca5a5; color:#991b1b; font-weight:700; font-size:11.5px;">
              🏭 Duplicidade da fábrica
            </button>
            <button type="button" class="button button-outline compact" onclick="document.getElementById('spoolRejectReasonInput').value = 'Defeito de solda / visual'; document.getElementById('spoolRejectReasonInput').focus();" style="border-color:#fca5a5; color:#991b1b; font-weight:700; font-size:11.5px;">
              🔍 Defeito de solda
            </button>
            <button type="button" class="button button-outline compact" onclick="document.getElementById('spoolRejectReasonInput').value = 'Dimensional / comprimento incorreto'; document.getElementById('spoolRejectReasonInput').focus();" style="border-color:#fca5a5; color:#991b1b; font-weight:700; font-size:11.5px;">
              📐 Dimensional incorreto
            </button>
            <button type="button" class="button button-outline compact" onclick="document.getElementById('spoolRejectReasonInput').value = 'Avaria / amassado no transporte'; document.getElementById('spoolRejectReasonInput').focus();" style="border-color:#fca5a5; color:#991b1b; font-weight:700; font-size:11.5px;">
              🚚 Avaria no transporte
            </button>
            <button type="button" class="button button-outline compact" onclick="document.getElementById('spoolRejectReasonInput').value = 'Furação / flange incompatível'; document.getElementById('spoolRejectReasonInput').focus();" style="border-color:#fca5a5; color:#991b1b; font-weight:700; font-size:11.5px;">
              ⭕ Flange incompatível
            </button>
          </div>
        </div>

        <div>
          <label style="font-size:12px; font-weight:800; color:#0f172a; display:block; margin-bottom:4px;">
            MOTIVO DA REPROVAÇÃO / RNC *
          </label>
          <input type="text" id="spoolRejectReasonInput" name="reason" required placeholder="Ex.: Duplicidade enviada pela fábrica, solda trincada..." value="${esc(currentReason || 'Duplicidade enviada pela fábrica')}" style="width:100%; padding:10px 12px; border-radius:8px; border:1.5px solid #cbd5e1; font-weight:700; font-size:13px; color:#0f172a;">
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
          <div>
            <label style="font-size:11px; font-weight:700; color:#475569; display:block; margin-bottom:4px;">Data:</label>
            <input type="date" name="date" value="${item.rejectedDate || today}" style="width:100%; padding:8px 10px; border-radius:6px; border:1px solid #cbd5e1; font-weight:700;">
          </div>
          <div>
            <label style="font-size:11px; font-weight:700; color:#475569; display:block; margin-bottom:4px;">Responsável pela Reprovação:</label>
            <input type="text" name="responsible" value="${esc(item.rejectedBy || userName)}" style="width:100%; padding:8px 10px; border-radius:6px; border:1px solid #cbd5e1; font-weight:700;">
          </div>
        </div>
      </div>
      <div class="modal-foot" style="background:#ffffff; border-top:1px solid #e2e8f0; display:flex; justify-content:space-between;">
        <button type="button" class="button button-outline" onclick="closeModal()">Cancelar</button>
        <button type="submit" class="button compact" style="background:#dc2626; color:#ffffff; font-weight:800; border:none; padding:8px 18px;">
          🔴 Confirmar Reprovação
        </button>
      </div>
    </form>
  `, 'modal-medium');
}

function spoolConfirmRejectItem(event, spoolId) {
  event.preventDefault();
  const form = event.target;
  const reason = form.elements.reason?.value.trim() || 'Reprovado na inspeção';
  const date = form.elements.date?.value || getLocalDateStr();
  const resp = form.elements.responsible?.value.trim() || (window.currentUser?.name || 'Pedro Alves');
  const now = new Date().toISOString();

  const item = spoolDb.find(s => s.id === spoolId);
  if (!item) return;

  item.status = 'rejected';
  item.rejectedDate = date;
  item.rejectedAt = now;
  item.rejectedBy = resp;
  item.rejectedReason = reason;

  spoolLogDailyAction(item.number, item.area, 'rejected', date);
  spoolSaveAll(spoolDb);
  closeModal();
  renderSpools();
  toast(`🔴 Spool ${item.number} marcado como REPROVADO (${reason})!`);
}

// Atualizar status diretamente
function spoolSetItemStatus(spoolId, newStatus) {
  const item = spoolDb.find(s => s.id === spoolId);
  if (!item) return;

  const today = getLocalDateStr();
  const now = new Date().toISOString();

  item.status = newStatus;
  const user = (window.currentUser?.name) || 'Pedro Alves';
  if (newStatus === 'installed') {
    // Se não tinha data de recebimento, ou se foi recebido hoje, garante horário idêntico
    if (!item.receivedDate || item.receivedDate === today) {
      item.receivedDate = today;
      item.receivedAt = now;
      item.receivedBy = item.receivedBy || user;
    }
    item.installedDate = today;
    item.installedAt = now;
    item.installedBy = user;
    item.rejectedDate = '';
    item.rejectedAt = '';
    item.rejectedBy = '';
    item.rejectedReason = '';
    toast(`🟢 Spool ${item.number} marcado como INSTALADO às ${formatSpoolTime(now)}!`);
  } else if (newStatus === 'received') {
    item.receivedDate = today;
    item.receivedAt = now;
    item.receivedBy = user;
    item.installedDate = '';
    item.installedAt = '';
    item.installedBy = '';
    item.rejectedDate = '';
    item.rejectedAt = '';
    item.rejectedBy = '';
    item.rejectedReason = '';
    toast(`🟡 Spool ${item.number} marcado como RECEBIDO às ${formatSpoolTime(now)}!`);
  } else if (newStatus === 'rejected') {
    item.rejectedDate = item.rejectedDate || today;
    item.rejectedAt = item.rejectedAt || now;
    item.rejectedBy = item.rejectedBy || user;
    item.rejectedReason = item.rejectedReason || 'Reprovado / Quarentena';
    item.installedDate = '';
    item.installedAt = '';
    item.installedBy = '';
    toast(`🔴 Spool ${item.number} marcado como REPROVADO!`);
  } else {
    item.installedDate = '';
    item.installedAt = '';
    item.installedBy = '';
    item.receivedDate = '';
    item.receivedAt = '';
    item.receivedBy = '';
    item.rejectedDate = '';
    item.rejectedAt = '';
    item.rejectedBy = '';
    item.rejectedReason = '';
    toast(`⚪ Spool ${item.number} voltou para Pendente.`);
  }

  spoolLogDailyAction(item.number, item.area, newStatus, today);
  spoolSaveAll(spoolDb);
  renderSpools();
}

function spoolLogDailyAction(number, area, status, date) {
  try {
    const logs = JSON.parse(localStorage.getItem(SPOOL_LOG_KEY) || '[]');
    logs.push({
      number,
      area,
      status,
      date,
      time: new Date().toLocaleTimeString('pt-BR'),
      at: new Date().toISOString()
    });
    localStorage.setItem(SPOOL_LOG_KEY, JSON.stringify(logs.slice(-500)));
  } catch (e) {}
}

/* ==========================================================================
   MODAL DE OPÇÕES DE EXPORTAÇÃO (CENTRAL DE DOWNLOAD)
   - Transparência total entre Baixar Tudo vs Baixar Filtrados
   ========================================================================== */

function spoolOpenExportModal() {
  const totalCount = spoolDb.length;
  const filteredList = spoolFilterList(spoolDb);
  const filteredCount = filteredList.length;

  const hasActiveFilters = (
    spoolStatusFilter !== 'all' ||
    spoolDateFilterMode !== 'all' ||
    spoolTypeFilter !== 'all' ||
    spoolDiameterFilter !== 'all' ||
    spoolListFilter !== 'all' ||
    Boolean(spoolSearchTerm) ||
    spoolActiveSector !== 'all' ||
    spoolActiveDh !== 'ALL'
  );

  const targetDate = spoolSelectedDate || getLocalDateStr();
  const formattedDate = new Date(targetDate + 'T12:00:00').toLocaleDateString('pt-BR');
  const installedTodayCount = spoolDb.filter(s => s.status === 'installed' && (s.installedDate === targetDate || (s.installedAt && formatSpoolLocalDate(s.installedAt) === targetDate))).length;

  const activeSectorName = spoolActiveSector === 'all' ? 'Todos os Setores' : (SPOOL_SECTORS[spoolActiveSector]?.name || spoolActiveSector);

  modal(`
    <div style="padding:18px;">
      ${modalHead('Exportar Spools (PDF & Excel .xlsx)', 'Baixe relatórios executivos em PDF com logos oficiais ou planilhas Excel')}
      
      <div class="modal-body" style="display:flex; flex-direction:column; gap:14px; margin-top:14px;">
        
        <!-- Status dos Filtros Atuais -->
        <div style="background:${hasActiveFilters ? '#f0f9ff' : '#f8fafc'}; border:1.5px solid ${hasActiveFilters ? '#0284c7' : '#cbd5e1'}; border-radius:10px; padding:12px 16px;">
          <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:8px;">
            <div style="font-size:13px; color:#0f172a; font-weight:700; display:flex; align-items:center; gap:6px;">
              <span>${hasActiveFilters ? '🔍' : '🌐'}</span>
              <span>${hasActiveFilters ? 'Filtros ativos na visualização da tela:' : 'Visualização sem filtros:'}</span>
            </div>
            ${hasActiveFilters ? `
              <button type="button" class="button button-outline compact" onclick="closeModal(); spoolClearAllFilters();" style="font-size:11px; height:26px; padding:2px 8px; color:#ef4444; border-color:#fca5a5;">
                ✕ Limpar Filtros da Tela
              </button>
            ` : ''}
          </div>
          <div style="font-size:12px; color:#475569; margin-top:6px; line-height:1.5;">
            ${hasActiveFilters ? `
              • <strong>Data Hall:</strong> ${spoolActiveDh} · 
              <strong>Setor:</strong> ${activeSectorName}
              ${spoolDateFilterMode !== 'all' ? ` · <strong>Data:</strong> ${spoolDateFilterMode === 'installed' ? 'Instalados no Dia' : (spoolDateFilterMode === 'received' ? 'Recebidos no Dia' : 'Atividade no Dia')} (${formattedDate})` : ''}
              ${spoolStatusFilter !== 'all' ? ` · <strong>Status:</strong> ${spoolStatusFilter}` : ''}
              ${spoolTypeFilter !== 'all' ? ` · <strong>Tipo:</strong> ${spoolTypeFilter}` : ''}
              ${spoolSearchTerm ? ` · <strong>Busca:</strong> "${esc(spoolSearchTerm)}"` : ''}
              <br><span style="color:#0284c7; font-weight:800;">👉 Exibindo ${filteredCount} de ${totalCount} spools na tela agora.</span>
            ` : `
              • Todos os <strong>${totalCount} spools</strong> da obra estão sendo exibidos (nenhum filtro ativo).
            `}
          </div>
        </div>

        <!-- NOVO DESTAQUE: Relatório Executivo em PDF com Logos Oficiais Heating Cooling & Afonso França -->
        <div style="border:2px solid #0284c7; background:linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-radius:10px; padding:16px; display:flex; justify-content:space-between; align-items:center; gap:14px; flex-wrap:wrap; box-shadow:0 2px 10px rgba(2,132,199,0.12);">
          <div style="flex:1; min-width:240px;">
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="font-size:24px;">📄</span>
              <div>
                <strong style="color:#0369a1; font-size:15px; display:block;">Relatório Executivo em PDF (Logos Oficiais)</strong>
                <span style="font-size:10px; font-weight:800; color:#0369a1; text-transform:uppercase; background:#bae6fd; padding:2px 6px; border-radius:4px; display:inline-block; margin-top:2px;">Heating Cooling & Afonso França Engenharia</span>
              </div>
            </div>
            <p style="margin:6px 0 0 32px; font-size:12px; color:#1e293b; line-height:1.45;">
              Gera documento timbrado oficial com as logos das duas empresas, indicadores de avanço físico diário/acumulado, tabela completa de spools e campos para assinatura e aceite técnico.
            </p>
          </div>
          <div style="display:flex; gap:8px; flex-wrap:wrap;">
            <button type="button" class="button button-dark" onclick="closeModal(); spoolOpenReportPDF('daily');" style="font-weight:800; padding:10px 16px; white-space:nowrap; box-shadow:0 2px 6px rgba(0,0,0,0.15);">
              📄 PDF Fechamento do Dia
            </button>
            <button type="button" class="button button-outline" onclick="closeModal(); spoolOpenReportPDF('filtered');" style="font-weight:800; padding:10px 16px; white-space:nowrap; border-color:#0284c7; color:#0369a1; background:#ffffff;">
              📄 PDF Itens da Tela (${filteredCount})
            </button>
          </div>
        </div>

        <!-- OPÇÃO 1: Obra Completa (Todos os DHs) -->
        <div style="border:2px solid #10b981; background:#f0fdf4; border-radius:10px; padding:14px; display:flex; justify-content:space-between; align-items:center; gap:14px; flex-wrap:wrap;">
          <div style="flex:1; min-width:240px;">
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="font-size:20px;">🌐</span>
              <div>
                <strong style="color:#065f46; font-size:14px; display:block;">1. Baixar Obra Completa (Sem Filtros)</strong>
                <span style="font-size:10px; font-weight:800; color:#047857; text-transform:uppercase; background:#d1fae5; padding:2px 6px; border-radius:4px; display:inline-block; margin-top:2px;">Recomendado p/ Backup & Edição Geral</span>
              </div>
            </div>
            <p style="margin:6px 0 0 28px; font-size:12px; color:#065f46; line-height:1.4;">
              Baixa <strong>todos os ${totalCount} spools</strong> de toda a obra, independente dos filtros da tela. Inclui aba consolidada + abas individuais para cada Data Hall (DH 01 a DH 10).
            </p>
          </div>
          <button type="button" class="button button-green" onclick="closeModal(); spoolExportUpdatedSpreadsheet('all');" style="font-weight:800; padding:10px 18px; white-space:nowrap;">
            ${icon('download')} Baixar Completa (${totalCount})
          </button>
        </div>

        <!-- OPÇÃO 2: Apenas a Seleção Filtrada -->
        <div style="border:1.5px solid ${hasActiveFilters ? '#3b82f6' : '#cbd5e1'}; background:#ffffff; border-radius:10px; padding:14px; display:flex; justify-content:space-between; align-items:center; gap:14px; flex-wrap:wrap;">
          <div style="flex:1; min-width:240px;">
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="font-size:20px;">🔍</span>
              <div>
                <strong style="color:#1e3a8a; font-size:14px; display:block;">2. Baixar Apenas os Itens Filtrados</strong>
                <small style="color:#64748b;">Gera planilha contendo exatamente os spools visíveis na tela</small>
              </div>
            </div>
            <p style="margin:6px 0 0 28px; font-size:12px; color:#475569; line-height:1.4;">
              Exporta somente os <strong>${filteredCount} spools</strong> que atendem ao filtro atual (${spoolActiveDh} · ${activeSectorName}).
            </p>
          </div>
          <button type="button" class="button button-outline" onclick="closeModal(); spoolExportUpdatedSpreadsheet('filtered');" style="font-weight:800; padding:10px 18px; white-space:nowrap; border-color:#3b82f6; color:#1e40af;" ${filteredCount === 0 ? 'disabled' : ''}>
            ${icon('download')} Baixar Filtrados (${filteredCount})
          </button>
        </div>

        <!-- OPÇÃO 3: Fechamento do Dia -->
        <div style="border:1.5px solid #cbd5e1; background:#ffffff; border-radius:10px; padding:14px; display:flex; justify-content:space-between; align-items:center; gap:14px; flex-wrap:wrap;">
          <div style="flex:1; min-width:240px;">
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="font-size:20px;">🟢</span>
              <div>
                <strong style="color:#0f172a; font-size:14px; display:block;">3. Baixar Fechamento Diário (${formattedDate})</strong>
                <small style="color:#64748b;">Relatório com o que foi montado na data selecionada</small>
              </div>
            </div>
            <p style="margin:6px 0 0 28px; font-size:12px; color:#475569; line-height:1.4;">
              Exporta os <strong>${installedTodayCount} spools instalados</strong> no dia para medição de equipe e comprovação.
            </p>
          </div>
          <button type="button" class="button button-outline" onclick="closeModal(); spoolExportUpdatedSpreadsheet('daily');" style="font-weight:700; padding:10px 18px; white-space:nowrap;" ${installedTodayCount === 0 ? 'disabled' : ''}>
            ${icon('download')} Baixar do Dia (${installedTodayCount})
          </button>
        </div>

        <!-- OPÇÃO 4: SUPERCORE DH 04 (34 Spools Cadastrados com Lista Suspensa) -->
        <div style="border:1.5px solid #0284c7; background:#f0f9ff; border-radius:10px; padding:14px; display:flex; justify-content:space-between; align-items:center; gap:14px; flex-wrap:wrap;">
          <div style="flex:1; min-width:240px;">
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="font-size:20px;">⚡</span>
              <div>
                <strong style="color:#0369a1; font-size:14px; display:block;">4. Baixar SUPERCORE DH 04 (34 Spools do Esquema)</strong>
                <small style="color:#64748b;">Planilha com os 34 tags cadastrados (26 Instalados, 8 Pendentes) + Circuitos</small>
              </div>
            </div>
            <p style="margin:6px 0 0 28px; font-size:12px; color:#475569; line-height:1.4;">
              Contém os circuitos C1A1-C1A9, C1R1-C1R9, C2A1-C2A8, C2R1-C2R8 com listas suspensas ativas nas células.
            </p>
          </div>
          <button type="button" class="button button-outline" onclick="closeModal(); spoolDownloadSupercoreSpreadsheet();" style="font-weight:800; padding:10px 18px; white-space:nowrap; border-color:#0284c7; color:#0369a1;">
            ${icon('download')} Baixar SUPERCORE DH 04
          </button>
        </div>

        <!-- OPÇÃO 5: Modelo em Branco com Lista Suspensa -->
        <div style="border:1.5px solid #cbd5e1; background:#ffffff; border-radius:10px; padding:14px; display:flex; justify-content:space-between; align-items:center; gap:14px; flex-wrap:wrap;">
          <div style="flex:1; min-width:240px;">
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="font-size:20px;">📄</span>
              <div>
                <strong style="color:#0f172a; font-size:14px; display:block;">5. Baixar Modelo em Branco (Com Listas Suspensas)</strong>
                <small style="color:#64748b;">Planilha padrão com dropdowns nativos dos 7 locais para preencher e importar</small>
              </div>
            </div>
            <p style="margin:6px 0 0 28px; font-size:12px; color:#475569; line-height:1.4;">
              Contém as colunas oficiais e validação de dados em cada linha (Data Hall, Setor, Tipo e Status).
            </p>
          </div>
          <button type="button" class="button button-outline" onclick="closeModal(); spoolDownloadSampleSpreadsheet();" style="font-weight:700; padding:10px 18px; white-space:nowrap;">
            ${icon('file')} Baixar Modelo
          </button>
        </div>

      </div>

      <div class="modal-foot" style="margin-top:16px;">
        <button type="button" class="button button-outline" onclick="closeModal()">Fechar</button>
      </div>
    </div>
  `, 'modal-medium');
}

/* ==========================================================================
   EXPORTAÇÃO: BAIXAR PLANILHA COM LISTAS SUSPENSAS (EXCEL .xlsx)
   - Validação de Dados nativa do Excel para:
     * Setores/Locais: Corredor FW A, Corredor FW B, Corredor Gerador, Salas Elétricas, CAG, SUPERCORE, Salas RMUs
     * Data Halls: DH 01 a DH 10
     * Classificação: Trecho Reto, Válvula de Ponta, Derivação (Ramal)
     * Status: Pendente, Recebido, Instalado
   ========================================================================== */

const SPOOL_DROPDOWN_SECTORS = [
  'Corredor FW A',
  'Corredor FW B',
  'Corredor Gerador',
  'Salas Elétricas',
  'CAG',
  'SUPERCORE',
  'Salas RMUs'
];

const SPOOL_DROPDOWN_DHS = Array.from({ length: 10 }, (_, i) => `DH ${String(i + 1).padStart(2, '0')}`);
const SPOOL_DROPDOWN_TYPES = ['Trecho Reto', 'Válvula de Ponta', 'Derivação (Ramal)'];
const SPOOL_DROPDOWN_STATUS = ['Pendente', 'Recebido', 'Instalado', 'Reprovado'];
const SPOOL_DROPDOWN_SUBAREAS = [...new Set(
  Object.values(SPOOL_AREA_TREE).flatMap(area => area.subAreas.map(sub => sub.name))
)];

async function ensureSpoolExcelLibrary() {
  if (window.ExcelJS) return true;
  if (typeof loadExternalScript === 'function') {
    try {
      await loadExternalScript('exceljs.min.js', 'exceljs-local');
      if (window.ExcelJS) return true;
    } catch (e) {}
  }
  if (typeof ensureExcelExportLibrary === 'function') {
    return await ensureExcelExportLibrary();
  }
  return !!window.ExcelJS;
}

function addSpoolHelperListSheet(workbook) {
  const listSheet = workbook.addWorksheet('Listas_Auxiliares', { state: 'hidden' });
  SPOOL_DROPDOWN_SECTORS.forEach((sec, idx) => { listSheet.getCell(`A${idx + 1}`).value = sec; });
  SPOOL_DROPDOWN_DHS.forEach((dh, idx) => { listSheet.getCell(`B${idx + 1}`).value = dh; });
  SPOOL_DROPDOWN_TYPES.forEach((t, idx) => { listSheet.getCell(`C${idx + 1}`).value = t; });
  SPOOL_DROPDOWN_STATUS.forEach((st, idx) => { listSheet.getCell(`D${idx + 1}`).value = st; });
  SPOOL_DROPDOWN_SUBAREAS.forEach((sub, idx) => { listSheet.getCell(`E${idx + 1}`).value = sub; });
  return listSheet;
}

function applySpoolExcelDataValidations(sheet, maxRow = 2500) {
  if (!sheet.dataValidations) return;

  // 1. Data Hall (DH) na Coluna C
  sheet.dataValidations.add(`C2:C${maxRow}`, {
    type: 'list',
    allowBlank: true,
    formulae: ['Listas_Auxiliares!$B$1:$B$10'],
    showErrorMessage: true,
    errorTitle: 'Data Hall Inválido',
    error: 'Selecione um Data Hall válido (DH 01 a DH 10) na lista suspensa.'
  });

  // 2. Setores / Locais na Coluna D (LISTA SUSPENSA COM OS 7 LOCAIS OFICIAIS)
  sheet.dataValidations.add(`D2:D${maxRow}`, {
    type: 'list',
    allowBlank: true,
    formulae: ['Listas_Auxiliares!$A$1:$A$7'],
    showErrorMessage: true,
    errorTitle: 'Setor / Local Inválido',
    error: 'Selecione um dos 7 locais oficiais da obra na lista suspensa.'
  });

  // 3. Subárea na Coluna E
  sheet.dataValidations.add(`E2:E${maxRow}`, {
    type: 'list',
    allowBlank: true,
    formulae: [`Listas_Auxiliares!$E$1:$E$${SPOOL_DROPDOWN_SUBAREAS.length}`],
    showErrorMessage: false
  });

  // 4. Classificação na Coluna F
  sheet.dataValidations.add(`F2:F${maxRow}`, {
    type: 'list',
    allowBlank: true,
    formulae: ['Listas_Auxiliares!$C$1:$C$3'],
    showErrorMessage: true,
    errorTitle: 'Classificação Inválida',
    error: 'Selecione Trecho Reto, Válvula de Ponta ou Derivação (Ramal).'
  });

  // 5. Status na Coluna H
  sheet.dataValidations.add(`H2:H${maxRow}`, {
    type: 'list',
    allowBlank: true,
    formulae: ['Listas_Auxiliares!$D$1:$D$4'],
    showErrorMessage: true,
    errorTitle: 'Status Inválido',
    error: 'Selecione Pendente, Recebido, Instalado ou Reprovado na lista suspensa.'
  });
}

function populateSpoolExcelSheet(sheet, items) {
  sheet.columns = [
    { header: 'TAG / Spool', key: 'tag', width: 16 },
    { header: 'Parte / Sequência', key: 'parte', width: 18 },
    { header: 'Data Hall (DH)', key: 'dh', width: 16 },
    { header: 'Setor', key: 'setor', width: 24 },
    { header: 'Subárea', key: 'subarea', width: 26 },
    { header: 'Classificação', key: 'tipo', width: 22 },
    { header: 'Diâmetro', key: 'diametro', width: 12 },
    { header: 'Status', key: 'status', width: 14 },
    { header: 'Data de Recebimento', key: 'recData', width: 18 },
    { header: 'Data de Instalação', key: 'instData', width: 18 },
    { header: 'Responsável', key: 'resp', width: 22 },
    { header: 'Observações', key: 'obs', width: 32 }
  ];

  // Estilização do cabeçalho
  const headerRow = sheet.getRow(1);
  headerRow.height = 26;
  headerRow.eachCell(cell => {
    cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0B2447' } };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
  });

  // Linhas de dados
  items.forEach(s => {
    const secName = SPOOL_SECTORS[s.area]?.name || s.area || 'Corredor FW A';
    let typeName = 'Trecho Reto';
    if (s.type === 'valve') typeName = 'Válvula de Ponta';
    else if (s.type === 'branch') typeName = 'Derivação (Ramal)';

    let statusName = 'Pendente';
    if (s.status === 'installed') statusName = 'Instalado';
    else if (s.status === 'received') statusName = 'Recebido';
    else if (s.status === 'rejected') statusName = 'Reprovado';

    const obsContent = s.status === 'rejected' && s.rejectedReason ? `[REPROVADO: ${s.rejectedReason}] ${s.notes || ''}` : (s.notes || '');

    const row = sheet.addRow({
      tag: s.number,
      parte: s.part || s.seq || '',
      dh: normalizeDh(s.dh),
      setor: secName,
      subarea: s.subArea || '',
      tipo: typeName,
      diametro: s.diameter || '',
      status: statusName,
      recData: s.receivedDate || '',
      instData: s.installedDate || '',
      resp: s.installedBy || s.rejectedBy || '',
      obs: obsContent
    });

    row.height = 20;
    row.alignment = { vertical: 'middle' };
    row.getCell(1).alignment = { vertical: 'middle', horizontal: 'center' };
    row.getCell(2).alignment = { vertical: 'middle', horizontal: 'center' };
    row.getCell(3).alignment = { vertical: 'middle', horizontal: 'center' };
    row.getCell(7).alignment = { vertical: 'middle', horizontal: 'center' };
    row.getCell(8).alignment = { vertical: 'middle', horizontal: 'center' };
    row.getCell(9).alignment = { vertical: 'middle', horizontal: 'center' };
    row.getCell(10).alignment = { vertical: 'middle', horizontal: 'center' };

    if (s.status === 'rejected') {
      row.getCell(8).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEE2E2' } };
      row.getCell(8).font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFB91C1C' } };
    }
  });

  sheet.views = [{ state: 'frozen', ySplit: 1 }];
  sheet.autoFilter = { from: 'A1', to: `L${Math.max(2, sheet.rowCount)}` };

  const maxValidRow = Math.max(2500, items.length + 500);
  applySpoolExcelDataValidations(sheet, maxValidRow);
}

async function downloadExcelJsWorkbook(workbook, filename) {
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function spoolExportUpdatedSpreadsheet(scope = 'all') {
  await ensureSpoolExcelLibrary();

  let listToExport = spoolDb;
  let exportDhTitle = 'Todos_DHs';

  if (scope === 'filtered') {
    const filtered = spoolFilterList(spoolDb);
    if (!filtered.length) {
      return toast('Nenhum spool corresponde aos filtros selecionados para exportar.', true);
    }
    listToExport = filtered;
    exportDhTitle = 'Filtrados';
    if (spoolActiveDh !== 'ALL') exportDhTitle += `_${spoolActiveDh.replace(/\s+/g, '_')}`;
    if (spoolActiveSector !== 'all') exportDhTitle += `_${spoolActiveSector}`;
  } else if (scope === 'daily') {
    const targetDate = spoolSelectedDate || getLocalDateStr();
    const dailyItems = spoolDb.filter(s => s.status === 'installed' && (s.installedDate === targetDate || (s.installedAt && formatSpoolLocalDate(s.installedAt) === targetDate)));
    if (!dailyItems.length) {
      return toast(`Nenhum spool instalado em ${new Date(targetDate + 'T12:00:00').toLocaleDateString('pt-BR')} para exportar.`, true);
    }
    listToExport = dailyItems;
    exportDhTitle = `Fechamento_${targetDate}`;
  }

  if (!listToExport.length) {
    return toast('Nenhum spool cadastrado para exportar.', true);
  }

  const todayStr = getLocalDateStr();
  let filename = `Planilha_Spools_Completa_${exportDhTitle}_${todayStr}.xlsx`;
  let toastMsg = `📥 Planilha com listas suspensas (${listToExport.length} spools) baixada com sucesso!`;
  if (scope === 'filtered') {
    filename = `Planilha_Spools_Filtrados_${exportDhTitle}_${todayStr}.xlsx`;
    toastMsg = `📥 Planilha filtrada com listas suspensas (${listToExport.length} spools) baixada com sucesso!`;
  } else if (scope === 'daily') {
    filename = `Planilha_Spools_Fechamento_${exportDhTitle}_${todayStr}.xlsx`;
    toastMsg = `📥 Fechamento diário (${listToExport.length} itens) baixado com sucesso!`;
  }

  if (window.ExcelJS) {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Heating Cooling';
    workbook.created = new Date();

    // 1. Cria aba oculta com os 7 setores, 10 DHs, 3 tipos e 3 status
    addSpoolHelperListSheet(workbook);

    // 2. Aba Principal
    const sheetTitle = scope === 'daily' ? 'Fechamento_Dia' : (scope === 'filtered' ? 'Spools_Filtrados' : 'Todos_os_Spools');
    const mainWs = workbook.addWorksheet(sheetTitle);
    populateSpoolExcelSheet(mainWs, listToExport);

    // Exporta uma única aba mestre com todos os spools e validações ativas, garantindo edição sem duplicidade
    await downloadExcelJsWorkbook(workbook, filename);
    toast(toastMsg);
    return;
  }

  // Fallback caso ExcelJS não esteja disponível
  if (!window.XLSX) return toast('Biblioteca Excel carregando...', true);

  const header = ['TAG / Spool', 'Parte / Sequência', 'Data Hall (DH)', 'Setor', 'Subárea', 'Classificação', 'Diâmetro', 'Status', 'Data de Recebimento', 'Data de Instalação', 'Responsável', 'Observações'];
  const rows = [header];
  listToExport.forEach(s => {
    const secName = SPOOL_SECTORS[s.area]?.name || s.area || 'Corredor FW A';
    let typeName = 'Trecho Reto';
    if (s.type === 'valve') typeName = 'Válvula de Ponta';
    else if (s.type === 'branch') typeName = 'Derivação (Ramal)';
    let statusName = s.status === 'installed' ? 'Instalado' : (s.status === 'received' ? 'Recebido' : (s.status === 'rejected' ? 'Reprovado' : 'Pendente'));
    const obsVal = s.status === 'rejected' && s.rejectedReason ? `[REPROVADO: ${s.rejectedReason}] ${s.notes || ''}` : (s.notes || '');
    rows.push([s.number, s.part || s.seq || '', normalizeDh(s.dh), secName, s.subArea || '', typeName, s.diameter || '', statusName, s.receivedDate || '', s.installedDate || '', s.installedBy || s.rejectedBy || '', obsVal]);
  });

  const wb = XLSX.utils.book_new();
  const mainWs = XLSX.utils.aoa_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, mainWs, 'Todos_os_Spools');
  XLSX.writeFile(wb, filename);
  toast(toastMsg);
}

/* ==========================================================================
   EXPORTAÇÃO: MODELO PRÉ-FORMATADO COM LISTA SUSPENSA DOS 7 LOCAIS
   ========================================================================== */

async function spoolDownloadSupercoreSpreadsheet() {
  await ensureSpoolExcelLibrary();

  if (window.ExcelJS) {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Heating Cooling';
    workbook.created = new Date();

    addSpoolHelperListSheet(workbook);
    const sheet = workbook.addWorksheet('SUPERCORE_DH04');
    const items = spoolDb.filter(s => normalizeDh(s.dh) === 'DH 04' && s.area === 'supercore');
    populateSpoolExcelSheet(sheet, items.length ? items : SUPERCORE_DH04_INITIAL_SPOOLS.map(sc => ({
      number: sc.number,
      dh: 'DH 04',
      area: 'supercore',
      type: 'straight',
      diameter: '10"',
      status: sc.status,
      notes: sc.notes
    })));
    await downloadExcelJsWorkbook(workbook, 'Planilha_Spools_SUPERCORE_DH04.xlsx');
    toast('Planilha SUPERCORE DH 04 com listas suspensas baixada com sucesso!');
    return;
  }

  // Fallback para download do arquivo pré-gerado com listas suspensas
  const link = document.createElement('a');
  link.href = 'Planilha_Spools_SUPERCORE_DH04.xlsx';
  link.download = 'Planilha_Spools_SUPERCORE_DH04.xlsx';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  toast('Planilha SUPERCORE DH 04 baixada!');
}

async function spoolDownloadSampleSpreadsheet() {
  await ensureSpoolExcelLibrary();

  if (window.ExcelJS) {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Heating Cooling';
    workbook.created = new Date();

    addSpoolHelperListSheet(workbook);

    const sheet = workbook.addWorksheet('Modelo_Spools');
    const sampleItems = [
      { number: '1601', part: '1 de 2', subArea: 'Linha Mestra FW A', dh: 'DH 04', area: 'Corredor FW A', type: 'Trecho Reto', diameter: '8"', status: 'not-started', notes: 'Alimentação AAG' },
      { number: '1601', part: '2 de 2', subArea: 'Linha Mestra FW A', dh: 'DH 04', area: 'Corredor FW A', type: 'Trecho Reto', diameter: '8"', status: 'received', notes: 'Alimentação AAG' },
      { number: '1602', dh: 'DH 04', area: 'Corredor FW B', type: 'Trecho Reto', diameter: '8"', status: 'received', notes: 'Retorno RAG' },
      { number: '1761', dh: 'DH 04', area: 'Corredor FW A', type: 'Derivação (Ramal)', diameter: '2.1/2"', status: 'received', notes: 'Ramal Fan Wall' },
      { number: 'GER-01', dh: 'DH 04', area: 'Corredor Gerador', type: 'Trecho Reto', diameter: '6"', status: 'not-started', notes: 'Linha de Resfriamento Gerador' },
      { number: 'GER-02', dh: 'DH 04', area: 'Corredor Gerador', type: 'Derivação (Ramal)', diameter: '3"', status: 'not-started', notes: 'Ramal de Dreno Gerador' },
      { number: 'ELE-101', dh: 'DH 04', area: 'Salas Elétricas', type: 'Trecho Reto', diameter: '4"', status: 'not-started', notes: 'Circuito Elétrico Auxiliar' },
      { number: 'CAG-01', dh: 'DH 04', area: 'CAG', type: 'Trecho Reto', diameter: '10"', status: 'installed', notes: 'Barramento Chiller CAG' },
      { number: 'CAG-V01', dh: 'DH 04', area: 'CAG', type: 'Válvula de Ponta', diameter: '10"', status: 'installed', notes: 'Válvula Borboleta Entrada CAG' },
      { number: 'SC-01', dh: 'DH 04', area: 'SUPERCORE', type: 'Trecho Reto', diameter: '10"', status: 'not-started', notes: 'Prumada Principal' },
      { number: 'RMU-01', dh: 'DH 04', area: 'Salas RMUs', type: 'Trecho Reto', diameter: '6"', status: 'not-started', notes: 'Alimentação RMU' }
    ];

    populateSpoolExcelSheet(sheet, sampleItems);
    await downloadExcelJsWorkbook(workbook, 'Modelo_Importacao_Spools_Lista_Suspensa.xlsx');
    toast('Planilha modelo com lista suspensa dos 7 locais baixada com sucesso!');
    return;
  }

  // Fallback direto para o arquivo pré-gerado com listas suspensas nativas
  const link = document.createElement('a');
  link.href = 'Modelo_Importacao_Spools_Lista_Suspensa.xlsx';
  link.download = 'Modelo_Importacao_Spools_Lista_Suspensa.xlsx';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  toast('Planilha modelo com lista suspensa baixada!');
}

/* ==========================================================================
   MODAL: SUBIR PLANILHA (EXCEL / CSV) COM SUPORTE TOTAL A DH E TODOS OS SETORES
   ========================================================================== */

function spoolOpenImportModal() {
  const currentDh = (spoolActiveDh === 'ALL' ? 'DH 04' : spoolActiveDh);

  modal(`
    <div>
      ${modalHead('Subir Planilha de Spools (Excel / CSV)', `Setores: Corredor FW A/B, Gerador, Salas Elétricas, CAG, SUPERCORE, RMUs`)}
      <div class="modal-body" style="display:grid; gap:16px; background:#ffffff; color:#0f172a;">
        
        <!-- Seleção de DH e Setor Padrão para itens sem coluna específica -->
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
          <label>
            <span style="font-weight:800; font-size:12px; color:#0f172a; display:block; margin-bottom:4px;">
              DATA HALL PADRÃO (Para itens sem DH na planilha ou substituição direta)
            </span>
            <select id="spoolImportDefaultDh" style="width:100%; padding:9px 12px; border-radius:8px; border:1.5px solid #cbd5e1; background:#ffffff; color:#0f172a; font-weight:700;">
              ${Array.from({ length: 10 }, (_, i) => {
                const name = `DH ${String(i + 1).padStart(2, '0')}`;
                const isSel = normalizeDh(currentDh) === name;
                return `<option value="${name}" ${isSel ? 'selected' : ''}>${name}</option>`;
              }).join('')}
            </select>
          </label>

          <label>
            <span style="font-weight:800; font-size:12px; color:#0f172a; display:block; margin-bottom:4px;">
              SETOR PADRÃO (Se a planilha não informar setor)
            </span>
            <select id="spoolImportDefaultSector" style="width:100%; padding:9px 12px; border-radius:8px; border:1.5px solid #cbd5e1; background:#ffffff; color:#0f172a; font-weight:700;">
              ${Object.values(SPOOL_SECTORS).map(sec => `
                <option value="${sec.id}" ${sec.id === (spoolActiveSector === 'all' ? 'fw-a' : spoolActiveSector) ? 'selected' : ''}>${sec.icon} ${sec.name}</option>
              `).join('')}
            </select>
          </label>
        </div>

        <!-- MODO DE IMPORTAÇÃO COM CONTROLE TOTAL E TRANSPARENTE -->
        <div style="background:#f8fafc; border:1.5px solid #cbd5e1; border-radius:10px; padding:14px;">
          <span style="font-weight:900; font-size:12px; color:#0f172a; display:block; margin-bottom:10px; text-transform:uppercase; letter-spacing:0.5px;">
            COMO APLICAR ESTA PLANILHA NO SISTEMA:
          </span>
          
          <label style="display:flex; align-items:flex-start; gap:10px; font-size:13px; font-weight:700; color:#0f172a; cursor:pointer; margin-bottom:10px;">
            <input type="radio" name="spoolImportMode" value="replace_dhs_in_sheet" checked style="margin-top:2px;">
            <div>
              <strong style="color:#047857;">Substituir apenas os Data Halls que constarem na planilha</strong> (Recomendado)
              <small style="display:block; color:#64748b; font-weight:500; margin-top:2px;">
                Exemplo: se a planilha contém spools de DH 04 e DH 06, apaga os spools anteriores desses DHs e cadastra os da planilha. Os demais DHs (DH 01, etc.) permanecem 100% intactos!
              </small>
            </div>
          </label>

          <label style="display:flex; align-items:flex-start; gap:10px; font-size:13px; font-weight:700; color:#0f172a; cursor:pointer; margin-bottom:10px;">
            <input type="radio" name="spoolImportMode" value="replace_selected_dh" style="margin-top:2px;">
            <div>
              <strong style="color:#0369a1;">Substituir APENAS o Data Hall padrão selecionado acima</strong>
              <small style="display:block; color:#64748b; font-weight:500; margin-top:2px;">
                Apaga somente os spools do DH escolhido no menu suspenso acima e cadastra os spools da planilha para ele.
              </small>
            </div>
          </label>

          <label style="display:flex; align-items:flex-start; gap:10px; font-size:13px; font-weight:700; color:#0f172a; cursor:pointer; margin-bottom:10px;">
            <input type="radio" name="spoolImportMode" value="merge" style="margin-top:2px;">
            <div>
              <strong style="color:#d97706;">Mesclar / Incrementar</strong>
              <small style="display:block; color:#64748b; font-weight:500; margin-top:2px;">
                Não apaga nada: apenas atualiza status dos spools existentes e insere novas tags.
              </small>
            </div>
          </label>

          <label style="display:flex; align-items:flex-start; gap:10px; font-size:13px; font-weight:700; color:#b91c1c; cursor:pointer;">
            <input type="radio" name="spoolImportMode" value="replace_all" style="margin-top:2px;">
            <div>
              <strong style="color:#b91c1c;">Substituir TODO o banco da obra</strong>
              <small style="display:block; color:#ef4444; font-weight:500; margin-top:2px;">
                Atenção: apaga TODOS os spools de todos os DHs e mantém estritamente os spools presentes nesta planilha.
              </small>
            </div>
          </label>
        </div>

        <!-- DROP ZONE DE ARQUIVO EXCEL -->
        <div style="background:#f0f9ff; border:2px dashed #0284c7; border-radius:12px; padding:24px 20px; text-align:center; cursor:pointer;" onclick="document.getElementById('spoolExcelFileInput').click()">
          <span style="font-size:38px; display:block; margin-bottom:8px;">📊</span>
          <strong style="color:#0f172a; font-size:16px; display:block; font-weight:800;">Clique ou Arraste sua Planilha Excel (.xlsx, .xls ou .csv)</strong>
          <span style="color:#475569; font-size:13px; margin-top:6px; display:block; font-weight:600;">
            O sistema lê automaticamente as colunas: <strong>TAG / Spool</strong>, <strong>Parte / Sequência</strong>, <strong>Data Hall (DH)</strong>, <strong>Setor</strong>, <strong>Subárea</strong>, <strong>Classificação</strong>, <strong>Diâmetro</strong> e <strong>Status</strong> em todas as abas.
          </span>
          <input type="file" id="spoolExcelFileInput" accept=".xlsx,.xls,.csv" style="display:none;" onchange="spoolHandleExcelUpload(event)">
        </div>

        <!-- DOWNLOADS DE APOIO -->
        <div style="display:flex; justify-content:space-between; align-items:center; background:#f1f5f9; padding:12px 16px; border-radius:8px; border:1.5px solid #cbd5e1; flex-wrap:wrap; gap:10px;">
          <div>
            <strong style="color:#0f172a; font-size:13px; display:block; font-weight:800;">Modelos e Backup:</strong>
            <small style="color:#475569; font-weight:600;">Baixe a planilha completa com todos os dados atuais antes de fazer grandes alterações.</small>
          </div>
          <div style="display:flex; gap:8px;">
            <button type="button" class="button button-outline compact" onclick="spoolDownloadSampleSpreadsheet()" style="color:#0f172a; font-weight:800; border-color:#94a3b8; background:#ffffff;">
              ${icon('download')} Baixar Modelo Excel
            </button>
            <button type="button" class="button button-green compact" onclick="spoolExportUpdatedSpreadsheet('all')" style="font-weight:800;">
              ${icon('download')} Baixar Dados Atuais (${spoolDb.length})
            </button>
          </div>
        </div>

        <div id="spoolImportPreviewArea"></div>
      </div>
      <div class="modal-foot" style="background:#ffffff; border-top:1px solid #e2e8f0;">
        <button type="button" class="button button-outline" onclick="closeModal()">Cancelar</button>
      </div>
    </div>
  `, 'modal-large');
}

async function spoolHandleExcelUpload(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  toast('Lendo planilha Excel...');

  try {
    const defaultDh = normalizeDh(document.getElementById('spoolImportDefaultDh')?.value || 'DH 04');
    const defaultSector = document.getElementById('spoolImportDefaultSector')?.value || 'fw-a';

    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, { type: 'array' });

    if (!workbook.SheetNames || !workbook.SheetNames.length) {
      return toast('Arquivo Excel vazio ou sem abas.', true);
    }

    const parsedSpools = [];
    const seenSpoolKeys = new Map();

    // Se a planilha contiver a aba principal consolidada (ex: "Todos_os_Spools", "Todos os Spools", "Spools_Filtrados"),
    // processa APENAS ela para evitar que abas secundárias desatualizadas sobrescrevam os dados editados pelo usuário
    const masterSheetName = workbook.SheetNames.find(n => /todos.*spool|spools_filtrados|supercore.*dh/i.test(n));
    const sheetsToProcess = masterSheetName ? [masterSheetName] : workbook.SheetNames.filter(n => !/^Listas?_Auxiliar|Auxiliar/i.test(n));

    for (const sheetName of sheetsToProcess) {
      const worksheet = workbook.Sheets[sheetName];
      if (!worksheet) continue;

      // 1. DESFAZER MESCLAGEM DE CÉLULAS (!merges): Preenche células mescladas com o valor do topo
      if (worksheet['!merges']) {
        worksheet['!merges'].forEach(range => {
          const startCellAddress = XLSX.utils.encode_cell(range.s);
          const startCell = worksheet[startCellAddress];
          if (startCell && startCell.v !== undefined) {
            for (let R = range.s.r; R <= range.e.r; ++R) {
              for (let C = range.s.c; C <= range.e.c; ++C) {
                const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
                if (!worksheet[cellAddress] || worksheet[cellAddress].v === undefined) {
                  worksheet[cellAddress] = { t: startCell.t, v: startCell.v, w: startCell.w };
                }
              }
            }
          }
        });
      }

      const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
      if (!rows || rows.length < 2) continue;

      // 2. DETECTAR LINHA DE CABEÇALHO
      let headerRowIndex = -1;
      let tagIdx = -1;
      let dhIdx = -1;
      let typeIdx = -1;
      let diaIdx = -1;
      let statusIdx = -1;
      let sectorIdx = -1;
      let recDateIdx = -1;
      let instDateIdx = -1;
      let respIdx = -1;
      let notesIdx = -1;
      let partIdx = -1;
      let subAreaIdx = -1;

      for (let r = 0; r < Math.min(rows.length, 20); r++) {
        const rowStr = rows[r].map(c => String(c || '').trim().toLowerCase());
        const tIdx = rowStr.findIndex(h => /^(?:tag|spool|tubo|tag\s*\/|n[uú]mero\s*(?:do\s*)?(?:spool|tubo)?)$/i.test(h) || (/tag|spool/.test(h) && !/status|setor|dh|data/.test(h)));
        const numIdx = rowStr.findIndex(h => /n[uú]mero|c[oó]digo/i.test(h) && !/documento|nf|nota/i.test(h));
        
        if (tIdx !== -1 || numIdx !== -1) {
          headerRowIndex = r;
          tagIdx = tIdx !== -1 ? tIdx : numIdx;
          dhIdx = rowStr.findIndex(h => /dh|data.*hall|datahall|sala|ambiente|hall/i.test(h));
          typeIdx = rowStr.findIndex(h => /tipo|trecho|classific|reta|deriva|valv/i.test(h));
          diaIdx = rowStr.findIndex(h => /di[aâ]metro|dimens|bitola|polegada/i.test(h));
          statusIdx = rowStr.findIndex(h => /status|situa/i.test(h));
          sectorIdx = rowStr.findIndex(h => /setor|área|area|corredor/i.test(h));
          recDateIdx = rowStr.findIndex(h => /rec.*data|data.*rec/i.test(h));
          instDateIdx = rowStr.findIndex(h => /inst.*data|data.*inst|montad.*em/i.test(h));
          respIdx = rowStr.findIndex(h => /resp|instalador|quem/i.test(h));
          notesIdx = rowStr.findIndex(h => /obs|observa|descri|nota/i.test(h));
          partIdx = rowStr.findIndex(h => /^(?:parte|parte\s*\/\s*sequ[eê]ncia|seq\.?|sequ[eê]ncia|sub.*pe[cç]a|divis[aã]o|conjunto)$/i.test(h));
          if (partIdx === tagIdx) partIdx = -1;
          subAreaIdx = rowStr.findIndex(h => /sub.*[aá]rea|sub.*tipo|sub.*setor|subsistema|sistema/i.test(h));
          break;
        }
      }

      if (headerRowIndex === -1) {
        headerRowIndex = 0;
        tagIdx = 0;
      }

      // Se o nome da aba indicar um DH (ex: "DH 06", "DH 6", "DH06"), usa ele como padrão
      let sheetDh = defaultDh;
      const sheetDhMatch = sheetName.match(/\b(?:dh|data\s*hall)?\s*0?(\d+)\b/i);
      if (/dh/i.test(sheetName) && sheetDhMatch) {
        sheetDh = `DH ${String(parseInt(sheetDhMatch[1], 10)).padStart(2, '0')}`;
      }

      let currentDh = sheetDh;
      let currentSector = defaultSector;

      // 3. PROCESSAR LINHAS
      for (let i = headerRowIndex + 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row || !row.length) continue;

        const rowCells = row.map(c => String(c || '').trim());
        const fullRowText = rowCells.filter(Boolean).join(' ');
        if (!fullRowText) continue;

        // Linha divisória de DH
        const dhLineMatch = fullRowText.match(/\b(?:dh|data\s*hall)\s*0?(\d+)\b/i);
        if (dhLineMatch && (!row[tagIdx] || /^(?:dh|data\s*hall)\s*0?\d+$/i.test(rowCells[tagIdx]))) {
          currentDh = `DH ${String(parseInt(dhLineMatch[1], 10)).padStart(2, '0')}`;
          continue;
        }

        // DH na coluna: se informado, atualiza o preenchimento contínuo (fill-down)
        if (dhIdx !== -1 && row[dhIdx] && String(row[dhIdx]).trim()) {
          currentDh = normalizeDh(row[dhIdx]);
        }
        const targetDh = currentDh;

        // Setor na coluna: se informado, atualiza o preenchimento contínuo
        if (sectorIdx !== -1 && row[sectorIdx] && String(row[sectorIdx]).trim()) {
          currentSector = normalizeSector(row[sectorIdx]);
        }
        const sectorVal = currentSector;

        // Tag:
        const rawTagVal = tagIdx !== -1 && row[tagIdx] !== undefined ? String(row[tagIdx]).trim() : '';
        if (!rawTagVal) continue;
        if (/^(tag|spool|n[uú]mero|item|código)$/i.test(rawTagVal)) continue;

        // Suporte a múltiplas tags no mesmo campo (ex: "2001, 2002, 2003" ou "2001 a 2010")
        const extractedTags = [];
        const rangeMatch = rawTagVal.match(/^(\d+)\s*(?:a|à|até|-)\s*(\d+)$/i);
        if (rangeMatch) {
          const startNum = parseInt(rangeMatch[1], 10);
          const endNum = parseInt(rangeMatch[2], 10);
          if (startNum <= endNum && endNum - startNum <= 300) {
            const padLen = rangeMatch[1].length;
            for (let n = startNum; n <= endNum; n++) {
              extractedTags.push(String(n).padStart(padLen, '0'));
            }
          }
        }

        if (!extractedTags.length) {
          const parts = rawTagVal.split(/[\n,;\t/]+/).map(t => t.trim()).filter(Boolean);
          if (parts.length > 0) {
            extractedTags.push(...parts);
          } else {
            extractedTags.push(rawTagVal);
          }
        }

        // Classificação
        let typeVal = 'straight';
        if (typeIdx !== -1 && row[typeIdx]) {
          const tStr = String(row[typeIdx]).toLowerCase();
          if (/valv|vlv|bloqueio/i.test(tStr)) typeVal = 'valve';
          else if (/deriv|ramal|m[aá]quina|fw|drop/i.test(tStr)) typeVal = 'branch';
          else if (/reta|barramento|mestra|linha/i.test(tStr)) typeVal = 'straight';
        }

        // Diâmetro
        let diaVal = typeVal === 'straight' ? '8"' : (typeVal === 'valve' ? '8"' : '2.1/2"');
        if (diaIdx !== -1 && row[diaIdx]) diaVal = String(row[diaIdx]).trim();

        // Status
        let statusVal = 'not-started';
        if (statusIdx !== -1 && row[statusIdx] !== undefined) {
          const sStr = String(row[statusIdx]).toLowerCase().trim();
          if (/instal|montad|conclu|ok/i.test(sStr)) {
            statusVal = 'installed';
          } else if (/receb|obra|cheg/i.test(sStr)) {
            statusVal = 'received';
          } else if (/reprov|rejeit|quarent|devol|rnc|defeit/i.test(sStr)) {
            statusVal = 'rejected';
          } else if (/pend|aguard|fabr|n[aã]o/i.test(sStr)) {
            statusVal = 'not-started';
          }
        }

        const notesVal = notesIdx !== -1 && row[notesIdx] ? String(row[notesIdx]).trim() : '';
        const partColVal = partIdx !== -1 && row[partIdx] ? String(row[partIdx]).trim() : '';
        const subAreaColVal = subAreaIdx !== -1 && row[subAreaIdx] ? String(row[subAreaIdx]).trim() : '';

        extractedTags.forEach(rawTag => {
          let tagVal = rawTag;
          let partVal = partColVal;

          // Se a tag contiver "(1 de 2)" ou "- 1/2", extrai tag e parte
          const tagPartMatch = rawTag.match(/^(.+?)\s*[\(\[\-]\s*(\d+\s*(?:de|\/)\s*\d+|parte\s*\d+|sub\s*\d+)\s*[\)\]]?$/i);
          if (tagPartMatch) {
            tagVal = tagPartMatch[1].trim();
            if (!partVal) partVal = tagPartMatch[2].trim();
          }

          let finalType = typeVal;
          if (typeIdx === -1 || !row[typeIdx]) {
            if (/valv/i.test(tagVal)) finalType = 'valve';
            else {
              const numInt = parseInt(tagVal.replace(/\D/g, ''), 10);
              if (numInt >= 1600 && numInt <= 1710) finalType = 'straight';
              else if (!isNaN(numInt) && numInt > 0) finalType = 'branch';
            }
          }

          // Conta ocorrências para manter IDs temporários únicos; as partes são fechadas após ler toda a planilha.
          let partSuffix = partVal;
          const baseKey = `${targetDh}|${sectorVal}|${tagVal}`;
          const currentCount = seenSpoolKeys.get(baseKey) || 0;
          seenSpoolKeys.set(baseKey, currentCount + 1);

          let instDate = '';
          let instAt = '';
          let instBy = '';
          if (statusVal === 'installed') {
            instDate = (instDateIdx !== -1 && row[instDateIdx]) ? String(row[instDateIdx]).trim() : new Date().toISOString().slice(0, 10);
            instAt = instDate ? `${instDate}T10:00:00.000Z` : new Date().toISOString();
            instBy = (respIdx !== -1 && row[respIdx]) ? String(row[respIdx]).trim() : (currentUser?.name || 'Pedro Alves');
          }

          let recDate = '';
          let recAt = '';
          if (statusVal === 'received') {
            recDate = (recDateIdx !== -1 && row[recDateIdx]) ? String(row[recDateIdx]).trim() : new Date().toISOString().slice(0, 10);
            recAt = recDate ? `${recDate}T08:00:00.000Z` : new Date().toISOString();
          }

          let rejDate = '';
          let rejAt = '';
          let rejBy = '';
          let rejReason = '';
          if (statusVal === 'rejected') {
            rejDate = new Date().toISOString().slice(0, 10);
            rejAt = new Date().toISOString();
            rejBy = (respIdx !== -1 && row[respIdx]) ? String(row[respIdx]).trim() : (currentUser?.name || 'Pedro Alves');
            rejReason = notesVal || 'Reprovado na importação';
          }

          const safePartId = partSuffix ? `-${partSuffix.replace(/[^a-zA-Z0-9]/g, '_')}` : (currentCount > 0 ? `-${currentCount + 1}` : '');
          parsedSpools.push({
            id: `spool-${targetDh.replace(/\s+/g, '')}-${sectorVal}-${tagVal}${safePartId}`,
            number: tagVal,
            part: partSuffix || '',
            subArea: subAreaColVal || '',
            dh: targetDh,
            area: sectorVal,
            type: finalType,
            diameter: diaVal,
            status: statusVal,
            installedDate: instDate,
            installedAt: instAt,
            installedBy: instBy,
            receivedDate: recDate,
            receivedAt: recAt,
            rejectedDate: rejDate,
            rejectedAt: rejAt,
            rejectedBy: rejBy,
            rejectedReason: rejReason,
            notes: notesVal
          });
        });
      }
    }

    // Tags repetidas sem sequência explícita representam peças físicas separadas.
    // Depois de conhecer o total, nomeia corretamente como "1 de 2", "2 de 2", etc.
    const repeatedGroups = new Map();
    parsedSpools.forEach(spool => {
      const groupKey = [
        normalizeDh(spool.dh),
        normalizeSector(spool.area),
        spoolTextKey(spool.number),
        spoolCanonicalSubArea(spool.subArea, spool.area)
      ].join('|');
      if (!repeatedGroups.has(groupKey)) repeatedGroups.set(groupKey, []);
      repeatedGroups.get(groupKey).push(spool);
    });

    repeatedGroups.forEach(group => {
      if (group.length > 1) {
        group.forEach((spool, index) => {
          if (!spool.part) spool.part = `${index + 1} de ${group.length}`;
        });
      }
      group.forEach(spool => {
        spool.id = spoolBuildStableId(spool);
      });
    });

    if (!parsedSpools.length) {
      return toast('Nenhum spool válido encontrado nas linhas da planilha.', true);
    }

    // Salva na memória global para importação segura
    window._pendingImportSpools = parsedSpools;

    // Resumo por Data Hall para validação imediata do usuário
    const dhCountMap = {};
    parsedSpools.forEach(s => {
      const dh = normalizeDh(s.dh);
      dhCountMap[dh] = (dhCountMap[dh] || 0) + 1;
    });

    const dhSummaryHtml = Object.entries(dhCountMap).sort((a, b) => {
      const na = parseInt(a[0].replace(/\D/g, ''), 10) || 0;
      const nb = parseInt(b[0].replace(/\D/g, ''), 10) || 0;
      return na - nb;
    }).map(([dh, count]) => `
      <span style="display:inline-flex; align-items:center; gap:6px; background:#e0f2fe; color:#0369a1; padding:4px 10px; border-radius:6px; font-weight:800; font-size:12px; border:1px solid #bae6fd;">
        🏢 <strong>${dh}:</strong> ${count} spools
      </span>
    `).join('');

    const previewContainer = document.getElementById('spoolImportPreviewArea');
    if (previewContainer) {
      previewContainer.innerHTML = `
        <div style="background:#ffffff; border:1.5px solid #cbd5e1; border-radius:10px; padding:16px; margin-top:14px; box-shadow:0 4px 12px rgba(0,0,0,0.06);">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; flex-wrap:wrap; gap:8px;">
            <div>
              <strong style="color:#059669; font-size:15px; font-weight:800; display:block;">
                ✅ ${parsedSpools.length} spools identificados com sucesso!
              </strong>
              <div style="display:flex; flex-wrap:wrap; gap:6px; margin-top:6px;">
                ${dhSummaryHtml}
              </div>
            </div>
            <button type="button" class="button button-green" onclick="spoolConfirmImport()" style="font-weight:800; padding:10px 18px;">
              Confirmar & Inserir Spools no Sistema
            </button>
          </div>
          <div style="max-height:280px; overflow-y:auto; border:1px solid #cbd5e1; border-radius:6px; background:#ffffff;">
            <table class="data-table compact" style="margin:0; width:100%;">
              <thead>
                <tr style="background:#f1f5f9;">
                  <th style="width:130px;">TAG / SPOOL</th>
                  <th>DATA HALL (DH)</th>
                  <th>SETOR</th>
                  <th>CLASSIFICAÇÃO</th>
                  <th>DIÂMETRO</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                ${parsedSpools.slice(0, 30).map(s => `
                  <tr>
                    <td>
                      <span class="spool-tag-pill status-${s.status === 'not-started' ? 'pending' : s.status}" style="display:inline-flex; align-items:center; justify-content:center; font-family:monospace; font-size:13px; font-weight:900; padding:4px 10px; border-radius:5px; background:${s.status === 'installed' ? '#059669' : (s.status === 'received' ? '#0284c7' : (s.status === 'rejected' ? '#dc2626' : '#0f172a'))}; color:#ffffff; border:1px solid #334155;">
                        ${esc(s.number)}
                      </span>
                      ${s.part ? `<small class="spool-part-badge" style="display:block; width:max-content; margin-top:3px;">${esc(s.part)}</small>` : ''}
                    </td>
                    <td>
                      <strong style="color:#0369a1; font-size:12px; font-weight:800; background:#e0f2fe; padding:2px 8px; border-radius:4px; border:1px solid #bae6fd;">
                        ${esc(normalizeDh(s.dh))}
                      </strong>
                    </td>
                    <td>
                      <strong style="color:#0f172a; font-size:13px;">${esc(SPOOL_SECTORS[s.area]?.name || s.area)}</strong>
                      ${s.subArea ? `<small style="display:block; color:#92400e; font-weight:700;">${esc(s.subArea)}</small>` : ''}
                    </td>
                    <td>
                      ${s.type === 'valve'
                        ? '<span class="badge-valve">🔘 Válvula</span>'
                        : (s.type === 'straight'
                          ? '<span class="badge-straight">📏 Trecho Reto</span>'
                          : '<span class="badge-branch">📐 Derivação</span>')}
                    </td>
                    <td><strong style="color:#0f172a; font-size:13px;">${esc(s.diameter)}</strong></td>
                    <td>
                      <span style="font-weight:800; font-size:12px; color:${s.status === 'installed' ? '#059669' : (s.status === 'received' ? '#0284c7' : (s.status === 'rejected' ? '#dc2626' : '#64748b'))};">
                        ${s.status === 'installed' ? '🟢 Instalado' : (s.status === 'received' ? '🟡 Recebido' : (s.status === 'rejected' ? '🔴 Reprovado' : '⚪ Pendente'))}
                      </span>
                    </td>
                  </tr>
                `).join('')}
                ${parsedSpools.length > 30 ? `<tr><td colspan="6" style="text-align:center; font-weight:700; color:#475569; padding:10px;">... e mais ${parsedSpools.length - 30} spools na planilha</td></tr>` : ''}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }

  } catch (err) {
    console.error(err);
    toast('Erro ao processar arquivo Excel: ' + (err.message || err), true);
  }
}

function spoolConfirmImport(importedSpools) {
  const list = importedSpools || window._pendingImportSpools;
  if (!Array.isArray(list) || !list.length) {
    return toast('Nenhum spool para importar.', true);
  }

  const mode = document.querySelector('input[name="spoolImportMode"]:checked')?.value || 'replace_dhs_in_sheet';
  const defaultDh = normalizeDh(document.getElementById('spoolImportDefaultDh')?.value || 'DH 04');

  if (mode === 'replace_all') {
    spoolDb = list;
  } else if (mode === 'replace_selected_dh') {
    // Apaga apenas o DH padrão selecionado no modal
    spoolDb = spoolDb.filter(s => normalizeDh(s.dh) !== defaultDh);
    const itemsToAdd = list.map(s => ({
      ...s,
      dh: s.dh ? normalizeDh(s.dh) : defaultDh
    })).filter(s => normalizeDh(s.dh) === defaultDh);
    spoolDb.push(...itemsToAdd);
  } else if (mode === 'replace_dhs_in_sheet') {
    // Substitui apenas os DHs que aparecem na planilha importada
    const sheetDhs = [...new Set(list.map(s => normalizeDh(s.dh)))];
    spoolDb = spoolDb.filter(s => !sheetDhs.includes(normalizeDh(s.dh)));
    spoolDb.push(...list);
  } else {
    // merge: atualiza existentes ou adiciona novos
    list.forEach(imp => {
      const existing = spoolDb.find(s =>
        (s.id === imp.id) ||
        (s.number === imp.number && (s.part || '') === (imp.part || '') && s.area === imp.area && normalizeDh(s.dh) === normalizeDh(imp.dh))
      );
      if (existing) {
        existing.type = imp.type;
        existing.diameter = imp.diameter;
        existing.status = imp.status;
        if (imp.part) existing.part = imp.part;
        if (imp.subArea) existing.subArea = imp.subArea;
        if (imp.notes) existing.notes = imp.notes;
        if (imp.status === 'installed') {
          existing.installedDate = imp.installedDate || existing.installedDate || new Date().toISOString().slice(0, 10);
          existing.installedAt = imp.installedAt || existing.installedAt || new Date().toISOString();
          existing.installedBy = imp.installedBy || existing.installedBy || (currentUser?.name || 'Pedro Alves');
          existing.receivedDate = imp.receivedDate || existing.receivedDate || existing.installedDate;
          existing.receivedAt = imp.receivedAt || existing.receivedAt || existing.installedAt;
          existing.receivedBy = imp.receivedBy || existing.receivedBy || existing.installedBy;
        } else if (imp.status === 'received') {
          existing.receivedDate = imp.receivedDate || existing.receivedDate || new Date().toISOString().slice(0, 10);
          existing.receivedAt = imp.receivedAt || existing.receivedAt || new Date().toISOString();
          existing.receivedBy = imp.receivedBy || existing.receivedBy || (currentUser?.name || 'Pedro Alves');
          existing.installedDate = '';
          existing.installedAt = '';
          existing.installedBy = '';
          existing.rejectedDate = '';
          existing.rejectedAt = '';
          existing.rejectedBy = '';
          existing.rejectedReason = '';
        } else if (imp.status === 'rejected') {
          existing.rejectedDate = imp.rejectedDate || existing.rejectedDate || new Date().toISOString().slice(0, 10);
          existing.rejectedAt = imp.rejectedAt || existing.rejectedAt || new Date().toISOString();
          existing.rejectedBy = imp.rejectedBy || existing.rejectedBy || (currentUser?.name || 'Pedro Alves');
          existing.rejectedReason = imp.rejectedReason || existing.rejectedReason || 'Reprovado na importação';
          existing.installedDate = '';
          existing.installedAt = '';
          existing.installedBy = '';
        } else {
          existing.receivedDate = '';
          existing.receivedAt = '';
          existing.receivedBy = '';
          existing.installedDate = '';
          existing.installedAt = '';
          existing.installedBy = '';
          existing.rejectedDate = '';
          existing.rejectedAt = '';
          existing.rejectedBy = '';
          existing.rejectedReason = '';
        }
        if (imp.notes) existing.notes = imp.notes;
      } else {
        spoolDb.push(imp);
      }
    });
  }

  // Visualização padrão: Todos os DHs e todos os setores para conferência total
  spoolActiveSector = 'all';
  spoolActiveSubArea = 'all';
  spoolActiveDh = 'ALL';
  localStorage.setItem('obraflow_spool_active_dh', 'ALL');
  localStorage.setItem('obraflow_spool_active_sector', 'all');
  localStorage.setItem('obraflow_spool_active_subarea', 'all');

  spoolSelectedIds.clear();
  spoolMultiSelectMode = false;

  spoolSaveAll(spoolDb);
  closeModal();
  renderSpools();

  const dhSummary = [...new Set(list.map(s => normalizeDh(s.dh)))].join(', ');
  toast(`🎉 ${list.length} spools importados com sucesso (${dhSummary})!`);
}

function spoolDeleteItem(spoolId) {
  const item = spoolDb.find(s => s.id === spoolId || s.number === spoolId);
  if (!item) return toast('Spool não encontrado.', true);

  if (!confirm(`Deseja realmente excluir o spool ${item.number} (${item.dh} · ${SPOOL_SECTORS[item.area]?.name || item.area})?`)) {
    return;
  }

  spoolDb = spoolDb.filter(s => s.id !== item.id);
  spoolSaveAll(spoolDb);
  renderSpools();
  toast(`🗑️ Spool ${item.number} excluído com sucesso.`);
}

function spoolClearDh(dhName) {
  const norm = normalizeDh(dhName);
  const items = spoolDb.filter(s => normalizeDh(s.dh) === norm);
  if (!items.length) return toast(`Não há spools cadastrados no ${norm}.`, true);

  if (!confirm(`Deseja realmente apagar TODOS os ${items.length} spool(s) do ${norm}?`)) {
    return;
  }

  spoolDb = spoolDb.filter(s => normalizeDh(s.dh) !== norm);
  spoolSaveAll(spoolDb);
  renderSpools();
  toast(`🗑️ ${items.length} spool(s) do ${norm} apagado(s) com sucesso.`);
}

/* ==========================================================================
   SELEÇÃO EM MASSA & AÇÕES EM LOTE (EXCLUSÃO / STATUS)
   ========================================================================== */

function spoolGetSelectedIds() {
  const validIds = new Set(spoolDb.map(s => s.id));
  spoolSelectedIds = new Set(Array.from(spoolSelectedIds).filter(id => validIds.has(id)));
  return Array.from(spoolSelectedIds);
}

function spoolSetSelectionFromCheckbox(checkbox) {
  if (!checkbox?.value) return;
  if (checkbox.checked) {
    spoolSelectedIds.add(checkbox.value);
  } else {
    spoolSelectedIds.delete(checkbox.value);
  }
  spoolUpdateSelection();
}

function spoolUpdateSelection() {
  const ids = spoolGetSelectedIds();
  const selectedSet = new Set(ids);
  const bar = document.getElementById('spoolBatchBar');
  const countEl = document.getElementById('spoolBatchCount');
  const headerCb = document.getElementById('selectAllSpools');
  const allChecks = document.querySelectorAll('.spool-select-check');
  const banner = document.getElementById('spoolTableBatchBanner');
  const bannerCount = document.getElementById('spoolBannerCount');

  // Mantém cartões, mapa e tabela sincronizados com a mesma seleção em memória.
  allChecks.forEach(cb => {
    cb.checked = selectedSet.has(cb.value);
  });
  spoolSyncCardSelectionUI();

  // Atualiza estado do checkbox mestre no cabeçalho
  if (headerCb && allChecks.length > 0) {
    const visibleSelectedCount = Array.from(allChecks).filter(cb => selectedSet.has(cb.value)).length;
    headerCb.checked = visibleSelectedCount === allChecks.length;
    headerCb.indeterminate = visibleSelectedCount > 0 && visibleSelectedCount < allChecks.length;
  }

  // Atualiza barra flutuante
  if (bar && countEl) {
    if (ids.length > 0) {
      bar.style.display = 'flex';
      countEl.textContent = `${ids.length} spool(s) selecionado(s)`;
    } else {
      bar.style.display = 'none';
    }
  }

  // Atualiza banner de destaque acima da tabela
  if (banner && bannerCount) {
    if (ids.length > 0) {
      banner.style.display = 'flex';
      bannerCount.textContent = `✓ ${ids.length} spool(s) selecionado(s)`;
    } else {
      banner.style.display = 'none';
    }
  }

  // Destaca as linhas selecionadas com fundo suave
  allChecks.forEach(cb => {
    const tr = cb.closest('tr');
    if (tr) {
      tr.style.backgroundColor = cb.checked ? '#fef2f2' : '';
    }
  });
}

function spoolToggleSelectAll(headerCheckbox) {
  const isChecked = typeof headerCheckbox === 'boolean' ? headerCheckbox : headerCheckbox.checked;
  const checks = document.querySelectorAll('.spool-select-check');
  checks.forEach(cb => {
    if (isChecked) spoolSelectedIds.add(cb.value);
    else spoolSelectedIds.delete(cb.value);
  });
  spoolUpdateSelection();
}

function spoolClearSelection() {
  spoolSelectedIds.clear();
  const headerCb = document.getElementById('selectAllSpools');
  if (headerCb) {
    headerCb.checked = false;
    headerCb.indeterminate = false;
  }
  spoolUpdateSelection();
}

function spoolBulkDelete() {
  const ids = spoolGetSelectedIds();
  if (!ids.length) return toast('Selecione ao menos um spool para excluir.', true);

  if (!confirm(`⚠️ Deseja realmente excluir permanentemente os ${ids.length} spool(s) selecionado(s)? Esta ação não poderá ser desfeita.`)) {
    return;
  }

  const idSet = new Set(ids);
  spoolDb = spoolDb.filter(s => !idSet.has(s.id));
  spoolSelectedIds.clear();
  spoolMultiSelectMode = false;
  spoolSaveAll(spoolDb);
  renderSpools();
  toast(`🗑️ ${ids.length} spool(s) excluído(s) com sucesso!`);
}

function spoolBulkReject() {
  const ids = spoolGetSelectedIds();
  if (!ids.length) return toast('Selecione ao menos um spool para reprovar.', true);

  modal(`
    <form onsubmit="spoolConfirmBulkReject(event)">
      ${modalHead('Reprovar Spools Selecionados em Lote', `${ids.length} spool(s) selecionado(s)`)}
      <div class="modal-body" style="display:grid; gap:14px; background:#ffffff; color:#0f172a;">
        <div style="background:#fef2f2; border:1.5px solid #f87171; border-radius:10px; padding:12px 14px;">
          <strong style="color:#991b1b; font-size:13px; display:block;">⛔ Bloqueio em Massa para Montagem</strong>
          <small style="color:#b91c1c; font-size:11.5px; font-weight:600;">Todos os ${ids.length} spools marcados serão sinalizados como REPROVADOS / QUARENTENA.</small>
        </div>
        <div>
          <label style="font-size:12px; font-weight:800; color:#0f172a; display:block; margin-bottom:4px;">
            MOTIVO DA REPROVAÇÃO DO LOTE *
          </label>
          <input type="text" id="spoolBulkRejectReason" required placeholder="Ex.: Duplicidade enviada pela fábrica, lote avariado..." value="Duplicidade enviada pela fábrica" style="width:100%; padding:10px 12px; border-radius:8px; border:1.5px solid #cbd5e1; font-weight:700; font-size:13px; color:#0f172a;">
        </div>
      </div>
      <div class="modal-foot" style="background:#ffffff; border-top:1px solid #e2e8f0; display:flex; justify-content:space-between;">
        <button type="button" class="button button-outline" onclick="closeModal()">Cancelar</button>
        <button type="submit" class="button compact" style="background:#dc2626; color:#ffffff; font-weight:800; border:none; padding:8px 18px;">
          🔴 Reprovar ${ids.length} Spools
        </button>
      </div>
    </form>
  `, 'modal-medium');
}

function spoolConfirmBulkReject(event) {
  event.preventDefault();
  const ids = spoolGetSelectedIds();
  if (!ids.length) return;

  const reason = document.getElementById('spoolBulkRejectReason')?.value.trim() || 'Reprovação em lote';
  const today = getLocalDateStr();
  const now = new Date().toISOString();
  const user = (window.currentUser?.name) || 'Pedro Alves';
  const idSet = new Set(ids);

  spoolDb = spoolDb.map(s => {
    if (!idSet.has(s.id)) return s;
    return {
      ...s,
      status: 'rejected',
      rejectedDate: today,
      rejectedAt: now,
      rejectedBy: user,
      rejectedReason: reason,
      installedDate: '',
      installedAt: '',
      installedBy: ''
    };
  });

  spoolSaveAll(spoolDb);
  spoolSelectedIds.clear();
  spoolMultiSelectMode = false;
  closeModal();
  renderSpools();
  toast(`🔴 ${ids.length} spool(s) marcados como REPROVADOS (${reason})!`);
}

function spoolBulkSetStatus(newStatus) {
  const ids = spoolGetSelectedIds();
  if (!ids.length) return toast('Selecione ao menos um spool.', true);

  if (newStatus === 'rejected') {
    spoolBulkReject();
    return;
  }

  const idSet = new Set(ids);
  const now = new Date().toISOString();
  const dateStr = getLocalDateStr();
  const user = currentUser?.name || 'Operador';

  spoolDb = spoolDb.map(s => {
    if (!idSet.has(s.id)) return s;
    const updated = { ...s, status: newStatus };
    if (newStatus === 'received') {
      updated.receivedAt = now;
      updated.receivedDate = dateStr;
      updated.receivedBy = user;
      updated.installedDate = '';
      updated.installedAt = '';
      updated.installedBy = '';
      updated.rejectedDate = '';
      updated.rejectedAt = '';
      updated.rejectedBy = '';
      updated.rejectedReason = '';
    } else if (newStatus === 'installed') {
      if (!updated.receivedDate) {
        updated.receivedDate = dateStr;
        updated.receivedAt = now;
        updated.receivedBy = user;
      }
      updated.installedAt = now;
      updated.installedDate = dateStr;
      updated.installedBy = user;
      updated.rejectedDate = '';
      updated.rejectedAt = '';
      updated.rejectedBy = '';
      updated.rejectedReason = '';
    } else if (newStatus === 'not-started') {
      updated.receivedDate = '';
      updated.receivedAt = '';
      updated.receivedBy = '';
      updated.installedDate = '';
      updated.installedAt = '';
      updated.installedBy = '';
      updated.rejectedDate = '';
      updated.rejectedAt = '';
      updated.rejectedBy = '';
      updated.rejectedReason = '';
    }
    return updated;
  });

  spoolSaveAll(spoolDb);
  spoolSelectedIds.clear();
  spoolMultiSelectMode = false;
  renderSpools();
  const label = newStatus === 'installed' ? 'instalados' : (newStatus === 'received' ? 'recebidos' : 'pendentes');
  toast(`✅ ${ids.length} spool(s) marcados como ${label}!`);
}

/* ==========================================================================
   MODAL 2: ESCREVER SPOOLS MANUALMENTE (COM OS 7 SETORES OFICIAIS)
   ========================================================================== */

function spoolOpenManualEntryModal() {
  const currentSector = SPOOL_SECTORS[spoolActiveSector] || SPOOL_SECTORS['fw-a'];
  const currentDh = (spoolActiveDh === 'ALL' ? 'DH 04' : spoolActiveDh);

  modal(`
    <form onsubmit="spoolSaveManualBatch(event)">
      ${modalHead('Escrever / Cadastrar Spools', `Setor: ${currentSector.name} · ${currentDh}`)}
      <div class="modal-body" style="display:grid; gap:16px; background:#ffffff; color:#0f172a;">
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
          <label>
            <span style="font-weight:800; font-size:12px; color:#0f172a; display:block; margin-bottom:4px;">SETOR *</span>
            <select name="sector" style="width:100%; padding:9px 12px; border-radius:8px; border:1.5px solid #cbd5e1; background:#ffffff; color:#0f172a; font-weight:700;">
              ${Object.values(SPOOL_SECTORS).map(sec => `
                <option value="${sec.id}" ${sec.id === (spoolActiveSector === 'all' ? 'fw-a' : spoolActiveSector) ? 'selected' : ''}>${sec.icon} ${sec.name}</option>
              `).join('')}
            </select>
          </label>

          <label>
            <span style="font-weight:800; font-size:12px; color:#0f172a; display:block; margin-bottom:4px;">CLASSIFICAÇÃO *</span>
            <select name="type" style="width:100%; padding:9px 12px; border-radius:8px; border:1.5px solid #cbd5e1; background:#ffffff; color:#0f172a; font-weight:700;">
              <option value="straight">📏 Trecho Reto (Linha Mestra / Barramento)</option>
              <option value="branch">📐 Derivação (Ramais / Máquinas Fan Wall)</option>
            </select>
          </label>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
          <label>
            <span style="font-weight:800; font-size:12px; color:#0f172a; display:block; margin-bottom:4px;">DATA HALL (DH) *</span>
            <select name="dh" style="width:100%; padding:9px 12px; border-radius:8px; border:1.5px solid #cbd5e1; background:#ffffff; color:#0f172a; font-weight:700;">
              ${Array.from({ length: 10 }, (_, i) => {
                const name = `DH ${String(i + 1).padStart(2, '0')}`;
                return `<option value="${name}" ${normalizeDh(name) === normalizeDh(currentDh) ? 'selected' : ''}>${name}</option>`;
              }).join('')}
            </select>
          </label>

          <label>
            <span style="font-weight:800; font-size:12px; color:#0f172a; display:block; margin-bottom:4px;">DIÂMETRO (Ex.: 8", 2.1/2", 10", 6")</span>
            <input name="diameter" placeholder="Ex.: 8\"" value="8\"" style="width:100%; padding:9px 12px; border-radius:8px; border:1.5px solid #cbd5e1; background:#ffffff; color:#0f172a; font-weight:700;">
          </label>
        </div>

        <label>
          <span style="font-weight:800; font-size:12px; color:#0f172a; display:block; margin-bottom:4px;">SUBÁREA / LOCAL ESPECÍFICO</span>
          <input name="subArea" list="spoolManualSubAreas" placeholder="Ex.: Chillers, Bombas Primárias, Linha Mestra FW A" value="${spoolActiveSubArea === 'all' ? '' : esc(spoolActiveSubArea)}" style="width:100%; padding:9px 12px; border-radius:8px; border:1.5px solid #cbd5e1; background:#ffffff; color:#0f172a; font-weight:700;">
          <datalist id="spoolManualSubAreas">
            ${SPOOL_DROPDOWN_SUBAREAS.map(name => `<option value="${esc(name)}"></option>`).join('')}
          </datalist>
        </label>

        <div style="background:#faf5ff; border:1.5px solid #d8b4fe; border-radius:10px; padding:12px;">
          <div style="display:flex; justify-content:space-between; align-items:center; gap:10px; margin-bottom:10px;">
            <div>
              <strong style="font-size:12px; color:#6d28d9; display:block;">PARTE / SEQUÊNCIA DO SPOOL *</strong>
              <small style="color:#64748b; font-weight:600;">Permite cadastrar a mesma TAG como peças físicas diferentes.</small>
            </div>
            <span id="spoolManualPartPreview" class="spool-part-badge" style="font-size:13px; padding:5px 10px;">1 de 1</span>
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
            <label>
              <span style="font-weight:800; font-size:11px; color:#475569; display:block; margin-bottom:4px;">NÚMERO DESTA PARTE</span>
              <input type="number" name="partCurrent" min="1" value="1" required oninput="spoolUpdateManualPartPreview(this.form)" style="width:100%; padding:9px 12px; border-radius:8px; border:1.5px solid #c4b5fd; background:#ffffff; color:#0f172a; font-weight:800;">
            </label>
            <label>
              <span style="font-weight:800; font-size:11px; color:#475569; display:block; margin-bottom:4px;">TOTAL DE PARTES</span>
              <input type="number" name="partTotal" min="1" value="1" required oninput="spoolUpdateManualPartPreview(this.form)" style="width:100%; padding:9px 12px; border-radius:8px; border:1.5px solid #c4b5fd; background:#ffffff; color:#0f172a; font-weight:800;">
            </label>
          </div>
          <small style="display:block; margin-top:7px; color:#6d28d9; font-weight:700;">Exemplos: peça única = 1 de 1 · primeira peça = 1 de 2 · segunda peça = 2 de 2.</small>
        </div>

        <label>
          <span style="font-weight:800; font-size:12px; color:#0f172a; display:block; margin-bottom:4px;">
            NÚMEROS DAS TAGS DOS SPOOLS *
          </span>
          <textarea name="tags" rows="3" required placeholder="Exemplo: 1601, 1603, 1605..." style="width:100%; padding:10px 12px; border-radius:8px; border:1.5px solid #cbd5e1; background:#ffffff; color:#0f172a; font-family:var(--font-mono, monospace); font-size:14px; font-weight:800;"></textarea>
          <small style="color:#64748b; font-weight:600; display:block; margin-top:4px;">A parte informada acima será aplicada às TAGs. Também é possível colar “1601 (1 de 2)” e “1601 (2 de 2)” para sequências diferentes no mesmo lote.</small>
        </label>

        <label>
          <span style="font-weight:800; font-size:12px; color:#0f172a; display:block; margin-bottom:4px;">OBSERVAÇÕES</span>
          <textarea name="notes" rows="3" placeholder="Ex.: peça recebida separada, referência do isométrico, restrição de montagem..." style="width:100%; padding:10px 12px; border-radius:8px; border:1.5px solid #cbd5e1; background:#ffffff; color:#0f172a; font-size:13px; font-weight:600; resize:vertical;"></textarea>
        </label>
      </div>

      <div class="modal-foot" style="background:#ffffff; border-top:1px solid #e2e8f0;">
        <button type="button" class="button button-outline" onclick="closeModal()">Cancelar</button>
        <button type="submit" class="button button-green">${icon('check')} Salvar Spools</button>
      </div>
    </form>
  `, 'modal-medium');
}

function spoolUpdateManualPartPreview(form) {
  if (!form) return;
  const current = Math.max(1, parseInt(form.elements.partCurrent?.value, 10) || 1);
  const total = Math.max(1, parseInt(form.elements.partTotal?.value, 10) || 1);
  const preview = document.getElementById('spoolManualPartPreview');
  if (preview) {
    preview.textContent = `${current} de ${total}`;
    preview.style.background = current <= total ? '#e0e7ff' : '#fee2e2';
    preview.style.color = current <= total ? '#3730a3' : '#b91c1c';
  }
}

function spoolSaveManualBatch(event) {
  event.preventDefault();
  const form = event.target;
  const sector = form.elements.sector.value;
  const type = form.elements.type.value;
  const dh = normalizeDh(form.elements.dh.value.trim() || 'DH 04');
  const diameter = form.elements.diameter.value.trim() || (type === 'straight' ? '8"' : '2.1/2"');
  const subArea = (form.elements.subArea?.value || '').trim();
  const notes = (form.elements.notes?.value || '').trim();
  const partCurrent = Math.max(1, parseInt(form.elements.partCurrent?.value, 10) || 1);
  const partTotal = Math.max(1, parseInt(form.elements.partTotal?.value, 10) || 1);
  const rawTags = form.elements.tags.value;

  if (partCurrent > partTotal) {
    return toast(`A parte atual (${partCurrent}) não pode ser maior que o total de partes (${partTotal}).`, true);
  }

  const tags = rawTags.split(/[\n,;\t]+/).map(t => t.trim()).filter(Boolean);

  if (!tags.length) {
    return toast('Por favor, informe pelo menos uma tag.', true);
  }

  const parsedTags = tags.map(rawTag => {
    const match = rawTag.match(/^(.+?)\s*[\(\[\-]\s*(\d+\s*(?:de|\/)\s*\d+|parte\s*\d+|sub\s*\d+)\s*[\)\]]?$/i);
    return match
      ? { number: match[1].trim(), part: match[2].trim(), explicitPart: true }
      : { number: rawTag, part: `${partCurrent} de ${partTotal}`, explicitPart: false };
  });

  const repeated = new Map();
  parsedTags.forEach(item => {
    if (!repeated.has(item.number)) repeated.set(item.number, []);
    repeated.get(item.number).push(item);
  });
  repeated.forEach(group => {
    const allUseCommonPart = group.length > 1 && group.every(item => !item.explicitPart);
    if (!allUseCommonPart) return;
    const resolvedTotal = Math.max(partTotal, partCurrent + group.length - 1);
    group.forEach((item, index) => {
      item.part = `${partCurrent + index} de ${resolvedTotal}`;
    });
  });

  let count = 0;
  let skipped = 0;
  parsedTags.forEach(({ number, part }) => {
    const existing = spoolDb.find(s =>
      s.number === number &&
      (s.part || '') === part &&
      s.area === sector &&
      normalizeDh(s.dh) === dh &&
      spoolCanonicalSubArea(s.subArea, s.area) === spoolCanonicalSubArea(subArea, sector)
    );
    if (!existing) {
      const newSpool = {
        number,
        part,
        subArea,
        dh,
        area: sector,
        type,
        diameter,
        status: 'not-started',
        installedDate: '',
        installedAt: '',
        installedBy: '',
        receivedDate: '',
        receivedAt: '',
        notes
      };
      newSpool.id = spoolBuildStableId(newSpool);
      spoolDb.push(newSpool);
      count++;
    } else {
      skipped++;
    }
  });

  if (!count) {
    return toast('Nenhum spool novo foi cadastrado. A TAG, parte, setor, DH e subárea informados já existem.', true);
  }

  spoolSaveAll(spoolDb);
  closeModal();
  renderSpools();
  toast(`🎉 ${count} spool(s) cadastrado(s) com sucesso${skipped ? ` · ${skipped} duplicado(s) ignorado(s)` : ''}!`);
}

/* ==========================================================================
   RELATÓRIO EXECUTIVO EM PDF COM LOGOS HEATING COOLING & AFONSO FRANÇA
   ========================================================================== */

function spoolOpenReportPDF(scope = 'daily') {
  const targetDate = spoolSelectedDate || getLocalDateStr();
  const formattedDate = new Date(targetDate + 'T12:00:00').toLocaleDateString('pt-BR');
  const nowFormatted = new Date().toLocaleDateString('pt-BR') + ' às ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  const sectorMeta = SPOOL_SECTORS[spoolActiveSector] || { name: 'Todos os Setores da Obra' };
  const dhLabel = spoolActiveDh === 'ALL' ? 'Todos os Data Halls' : spoolActiveDh;

  let reportTitle = 'RELATÓRIO DIÁRIO DE MONTAGEM DE SPOOLS';
  let reportSubtitle = `Fechamento Diário de Instalação · ${sectorMeta.name} · ${dhLabel} · Data: ${formattedDate}`;
  let items = [];

  const dailyInstalled = spoolDb.filter(s => s.status === 'installed' && (s.installedDate === targetDate || (s.installedAt && formatSpoolLocalDate(s.installedAt) === targetDate)));
  const filteredList = spoolFilterList(spoolDb);

  if (scope === 'daily') {
    items = dailyInstalled;
    reportTitle = 'RELATÓRIO DIÁRIO DE MONTAGEM DE SPOOLS';
    reportSubtitle = `Apontamento Oficial de Tubos e Ramais Instalados · ${formattedDate}`;
  } else if (scope === 'filtered') {
    items = filteredList;
    reportTitle = 'RELATÓRIO EXECUTIVO DE SPOOLS · ITENS FILTRADOS';
    reportSubtitle = `Recorte Operacional: ${sectorMeta.name} · ${dhLabel} · Total: ${filteredList.length} itens`;
  } else {
    items = spoolDb;
    reportTitle = 'RELATÓRIO GERAL DE TUBULAÇÃO E SPOOLS';
    reportSubtitle = `Data Center Omnia (DC01) · Cadastro Consolidado da Obra (${spoolDb.length} itens)`;
  }

  const totalItems = items.length;
  const installedCount = items.filter(s => s.status === 'installed').length;
  const receivedCount = items.filter(s => s.status === 'received').length;
  const rejectedCount = items.filter(s => s.status === 'rejected').length;
  const pendingCount = items.filter(s => s.status === 'not-started').length;
  const straightCount = items.filter(s => s.type === 'straight').length;
  const branchCount = items.filter(s => s.type === 'branch').length;
  const percInstalled = totalItems ? Math.round((installedCount / totalItems) * 100) : 0;

  const tableRows = items.map(s => {
    const secName = SPOOL_SECTORS[s.area]?.name || s.area || '—';
    const typeLabel = s.type === 'straight' ? '📏 Trecho Reto' : (s.type === 'branch' ? '📐 Derivação' : '📏 Tubo');
    
    let statusBadge = '<span style="display:inline-block; padding:2px 8px; border-radius:4px; font-weight:800; font-size:10px; background:#f1f5f9; color:#475569; border:1px solid #cbd5e1;">⚪ Pendente</span>';
    if (s.status === 'installed') {
      statusBadge = '<span style="display:inline-block; padding:2px 8px; border-radius:4px; font-weight:800; font-size:10px; background:#dcfce7; color:#15803d; border:1px solid #86efac;">🟢 Instalado</span>';
    } else if (s.status === 'received') {
      statusBadge = '<span style="display:inline-block; padding:2px 8px; border-radius:4px; font-weight:800; font-size:10px; background:#fef9c3; color:#a16207; border:1px solid #fde047;">🟡 Recebido</span>';
    } else if (s.status === 'rejected') {
      statusBadge = '<span style="display:inline-block; padding:2px 8px; border-radius:4px; font-weight:800; font-size:10px; background:#fee2e2; color:#b91c1c; border:1px solid #fca5a5;">🔴 Reprovado</span>';
    }

    let instInfo = s.installedDate ? `${formatSpoolDateDisplay(s.installedDate)}${s.installedAt ? ` às ${formatSpoolTime(s.installedAt)}` : ''}` : '—';
    let recInfo = s.receivedDate ? `${formatSpoolDateDisplay(s.receivedDate)}${s.receivedAt ? ` às ${formatSpoolTime(s.receivedAt)}` : ''}` : '—';

    if (s.status === 'rejected') {
      instInfo = '<span style="color:#b91c1c; font-weight:800;">⛔ BLOQUEADO P/ MONTAGEM</span>';
      if (s.rejectedDate) {
        recInfo = `<span style="color:#b91c1c; font-weight:800;">🔴 ${formatSpoolDateDisplay(s.rejectedDate)}</span>`;
      }
    }

    const obsContent = s.status === 'rejected' && s.rejectedReason ? `[REPROVADO: ${s.rejectedReason}] ${s.notes || ''}` : (s.notes || '');

    return `
      <tr style="${s.status === 'rejected' ? 'background:#fff8f8;' : ''}">
        <td style="text-align:center; font-weight:800; color:#0f172a; padding:6px 8px; border:1px solid #cbd5e1;">${esc(spoolDisplayNumber(s))}</td>
        <td style="text-align:center; font-weight:700; padding:6px 8px; border:1px solid #cbd5e1;">${esc(normalizeDh(s.dh))}</td>
        <td style="padding:6px 8px; border:1px solid #cbd5e1;">${esc(secName)}${s.subArea ? `<small style="display:block; color:#92400e;">${esc(s.subArea)}</small>` : ''}</td>
        <td style="font-weight:700; padding:6px 8px; border:1px solid #cbd5e1;">${typeLabel}</td>
        <td style="text-align:center; font-weight:800; padding:6px 8px; border:1px solid #cbd5e1;">${esc(s.diameter || '—')}</td>
        <td style="text-align:center; padding:6px 8px; border:1px solid #cbd5e1;">${statusBadge}</td>
        <td style="text-align:center; font-size:10px; padding:6px 8px; border:1px solid #cbd5e1;">${recInfo}</td>
        <td style="text-align:center; font-size:10px; font-weight:700; color:${s.status === 'rejected' ? '#b91c1c' : '#15803d'}; padding:6px 8px; border:1px solid #cbd5e1;">${instInfo}</td>
        <td style="padding:6px 8px; border:1px solid #cbd5e1;">${esc(s.status === 'rejected' ? (s.rejectedBy || 'Fiscalização') : (s.installedBy || 'Equipe HVAC'))}</td>
        <td style="color:${s.status === 'rejected' ? '#b91c1c' : '#64748b'}; font-size:10px; padding:6px 8px; border:1px solid #cbd5e1; font-weight:${s.status === 'rejected' ? '700' : 'normal'};">${esc(obsContent)}</td>
      </tr>
    `;
  }).join('');

  const content = `
    <!-- CONTROLES DE ESCOPO (OCULTOS NA IMPRESSÃO) -->
    <div class="no-print" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; margin-bottom:16px; padding:10px 14px; background:#f8fafc; border:1.5px solid #cbd5e1; border-radius:8px;">
      <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
        <span style="font-size:12px; font-weight:800; color:#334155;">VISUALIZAR ESCOPO:</span>
        <button type="button" class="button compact ${scope === 'daily' ? 'button-dark' : 'button-outline'}" onclick="spoolOpenReportPDF('daily')" style="font-size:11px; font-weight:800;">
          🟢 Fechamento do Dia (${dailyInstalled.length})
        </button>
        <button type="button" class="button compact ${scope === 'filtered' ? 'button-dark' : 'button-outline'}" onclick="spoolOpenReportPDF('filtered')" style="font-size:11px; font-weight:800;">
          🔍 Filtros da Tela (${filteredList.length})
        </button>
        <button type="button" class="button compact ${scope === 'all' ? 'button-dark' : 'button-outline'}" onclick="spoolOpenReportPDF('all')" style="font-size:11px; font-weight:800;">
          🌐 Toda a Obra (${spoolDb.length})
        </button>
      </div>
      <div style="font-size:11px; color:#64748b; font-weight:600;">
        💡 Clique no botão <strong>Imprimir / Salvar em PDF</strong> para salvar seu arquivo timbrado oficial.
      </div>
    </div>

    <!-- DOCUMENTO OFICIAL TIMBRADO (ESTILO FOLHA A4 PAISAGEM) -->
    <article class="report-document" style="padding:24px 28px; background:#ffffff; color:#0f172a; min-width:980px; box-shadow:0 4px 18px rgba(0,0,0,0.06); border-radius:8px;">
      
      <!-- CABEÇALHO COM AS DUAS LOGOS OFICIAIS -->
      <header class="report-document-head" style="display:grid; grid-template-columns:auto 1fr auto; align-items:center; gap:20px; border-bottom:2.5px solid #0f172a; padding-bottom:14px; margin-bottom:16px;">
        <div class="report-logos" style="display:flex; align-items:center; gap:14px;">
          <img src="assets/heating-cooling-logo.jpg" alt="Heating Cooling" style="height:48px; max-width:145px; object-fit:contain;">
          <div style="height:36px; width:1.5px; background:#cbd5e1;"></div>
          <img src="assets/afonso-franca-logo.png" alt="Afonso França Engenharia" style="height:44px; max-width:145px; object-fit:contain;">
        </div>

        <div style="text-align:center;">
          <small style="color:#0284c7; font-weight:800; letter-spacing:1px; text-transform:uppercase; font-size:10px; display:block;">
            HEATING COOLING TECNOLOGIA & AFONSO FRANÇA ENGENHARIA
          </small>
          <h1 style="margin:4px 0 0; font-size:18px; font-weight:900; color:#0f172a; letter-spacing:-0.3px;">
            ${reportTitle}
          </h1>
          <p style="margin:4px 0 0; font-size:11px; color:#475569; font-weight:600;">
            ${reportSubtitle}
          </p>
        </div>

        <aside style="text-align:right; font-size:10px; color:#475569; display:grid; gap:3px; padding-left:14px; border-left:1px solid #cbd5e1;">
          <strong style="color:#0f172a; font-size:11px;">DATA CENTER OMNIA</strong>
          <span>Edificação: DC01</span>
          <span>Emissão: ${nowFormatted}</span>
        </aside>
      </header>

      <!-- QUADRO RESUMO EXECUTIVO (KPIS) -->
      <div class="report-summary" style="display:grid; grid-template-columns:repeat(6, 1fr); margin-bottom:16px; border:1px solid #cbd5e1; border-radius:8px; overflow:hidden; background:#f8fafc;">
        <span style="padding:10px 14px; border-right:1px solid #e2e8f0; display:grid; gap:2px;">
          <b style="font-size:18px; color:#0f172a; font-weight:900;">${totalItems}</b>
          <small style="font-size:10px; font-weight:800; color:#64748b; text-transform:uppercase;">Total de Peças</small>
        </span>
        <span style="padding:10px 14px; border-right:1px solid #e2e8f0; display:grid; gap:2px; background:#f0fdf4;">
          <b style="font-size:18px; color:#15803d; font-weight:900;">${installedCount}</b>
          <small style="font-size:10px; font-weight:800; color:#15803d; text-transform:uppercase;">Instalados (${percInstalled}%)</small>
        </span>
        <span style="padding:10px 14px; border-right:1px solid #e2e8f0; display:grid; gap:2px; background:#fefce8;">
          <b style="font-size:18px; color:#a16207; font-weight:900;">${receivedCount}</b>
          <small style="font-size:10px; font-weight:800; color:#a16207; text-transform:uppercase;">Recebidos</small>
        </span>
        <span style="padding:10px 14px; border-right:1px solid #e2e8f0; display:grid; gap:2px; background:#fef2f2;">
          <b style="font-size:18px; color:#b91c1c; font-weight:900;">${rejectedCount}</b>
          <small style="font-size:10px; font-weight:800; color:#b91c1c; text-transform:uppercase;">Reprovados</small>
        </span>
        <span style="padding:10px 14px; border-right:1px solid #e2e8f0; display:grid; gap:2px;">
          <b style="font-size:18px; color:#64748b; font-weight:900;">${pendingCount}</b>
          <small style="font-size:10px; font-weight:800; color:#64748b; text-transform:uppercase;">Pendentes</small>
        </span>
        <span style="padding:10px 14px; display:grid; gap:2px;">
          <b style="font-size:18px; color:#0284c7; font-weight:900;">${straightCount}R / ${branchCount}D</b>
          <small style="font-size:10px; font-weight:800; color:#0284c7; text-transform:uppercase;">Retos / Ramais</small>
        </span>
      </div>

      <!-- TABELA DETALHADA DE SPOOLS -->
      <section class="report-section">
        <h2 style="font-size:13px; font-weight:800; margin-bottom:8px; color:#0f172a; border-left:3px solid #0284c7; padding-left:8px;">
          Relação de Spools (${items.length} itens)
        </h2>
        
        ${items.length === 0 ? `
          <div class="report-empty" style="padding:28px; text-align:center; color:#64748b; border:1px dashed #cbd5e1; border-radius:8px;">
            Nenhum spool encontrado para o critério selecionado (${scope === 'daily' ? `Nenhum spool instalado em ${formattedDate}` : 'Sem itens'}).
          </div>
        ` : `
          <table class="report-table" style="width:100%; font-size:10.5px; border-collapse:collapse;">
            <thead>
              <tr style="background:#0f172a; color:#ffffff;">
                <th style="padding:7px 8px; text-align:center; border:1px solid #475569;">TAG / SPOOL</th>
                <th style="padding:7px 8px; text-align:center; border:1px solid #475569;">DATA HALL</th>
                <th style="padding:7px 8px; border:1px solid #475569;">SETOR</th>
                <th style="padding:7px 8px; border:1px solid #475569;">CLASSIFICAÇÃO</th>
                <th style="padding:7px 8px; text-align:center; border:1px solid #475569;">DIÂM.</th>
                <th style="padding:7px 8px; text-align:center; border:1px solid #475569;">STATUS</th>
                <th style="padding:7px 8px; text-align:center; border:1px solid #475569;">RECEBIMENTO</th>
                <th style="padding:7px 8px; text-align:center; border:1px solid #475569;">INSTALAÇÃO</th>
                <th style="padding:7px 8px; border:1px solid #475569;">RESPONSÁVEL</th>
                <th style="padding:7px 8px; border:1px solid #475569;">OBSERVAÇÕES</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
        `}
      </section>

      <!-- CAMPO DE ASSINATURAS PARA ACEITE -->
      <div style="margin-top:36px; padding-top:20px; border-top:1px solid #cbd5e1; display:grid; grid-template-columns:1fr 1fr; gap:48px; page-break-inside:avoid;">
        <div style="text-align:center;">
          <div style="border-bottom:1.5px solid #0f172a; height:32px; margin-bottom:8px;"></div>
          <strong style="font-size:12px; color:#0f172a; display:block;">HEATING COOLING TECNOLOGIA</strong>
          <span style="font-size:10px; color:#64748b; font-weight:600;">Encarregado / Responsável de Montagem HVAC</span>
        </div>
        <div style="text-align:center;">
          <div style="border-bottom:1.5px solid #0f172a; height:32px; margin-bottom:8px;"></div>
          <strong style="font-size:12px; color:#0f172a; display:block;">AFONSO FRANÇA ENGENHARIA</strong>
          <span style="font-size:10px; color:#64748b; font-weight:600;">Fiscalização de Campo / Aceite da Obra</span>
        </div>
      </div>

      <!-- RODAPÉ DO DOCUMENTO -->
      <footer class="report-footer" style="margin-top:24px; padding-top:8px; border-top:1px solid #e2e8f0; display:flex; justify-content:space-between; font-size:9px; color:#94a3b8;">
        <span>Heating Cooling Tecnologia & Afonso França Engenharia · Data Center Omnia (DC01)</span>
        <span>Documento Técnico Emitido em ${nowFormatted}</span>
      </footer>

    </article>
  `;

  modal(`
    <div style="padding:0;">
      <div class="modal-head" style="padding:14px 20px; background:#0f172a; color:#ffffff; display:flex; justify-content:space-between; align-items:center;">
        <div>
          <h3 style="margin:0; font-size:15px; font-weight:900; color:#ffffff; display:flex; align-items:center; gap:8px;">
            📄 Relatório Executivo em PDF · Heating Cooling & Afonso França
          </h3>
          <p style="margin:2px 0 0; font-size:11px; color:#94a3b8;">
            Documento formatado com as logos oficiais. Clique em "Imprimir / Salvar em PDF" para extrair.
          </p>
        </div>
        <div style="display:flex; gap:8px;">
          <button type="button" class="button button-green" onclick="window.print()" style="font-weight:800; font-size:12px; padding:8px 16px;">
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

      <div class="modal-foot" style="padding:12px 20px; background:#ffffff; border-top:1px solid #cbd5e1; display:flex; justify-content:space-between; align-items:center;">
        <span style="font-size:11px; color:#64748b; font-weight:600;">
          Dica: Na janela de impressão do navegador, selecione <strong>"Salvar como PDF"</strong> com layout em formato <strong>Paisagem (Landscape)</strong>.
        </span>
        <div style="display:flex; gap:8px;">
          <button type="button" class="button button-outline" onclick="closeModal()">Fechar</button>
          <button type="button" class="button button-green" onclick="window.print()" style="font-weight:800;">
            🖨️ Imprimir / Salvar em PDF
          </button>
        </div>
      </div>
    </div>
  `, 'modal-paper');

  const backdrop = document.querySelector('.modal-backdrop');
  if (backdrop) {
    backdrop.classList.add('print-area', 'report-print-area');
  }
}

/* ==========================================================================
   FECHAMENTO DO DIA & WHATSAPP
   ========================================================================== */

function spoolCopyFilteredReport(customList = null) {
  const list = customList || spoolFilterList(spoolDb);
  if (!list.length) {
    return toast('Nenhum spool encontrado com os filtros atuais para copiar.', true);
  }

  const targetDate = spoolSelectedDate || getLocalDateStr();
  const dateFormatted = new Date(targetDate + 'T12:00:00').toLocaleDateString('pt-BR');
  const sectorMeta = SPOOL_SECTORS[spoolActiveSector] || { name: 'Todos os Setores' };

  // Contexto dos filtros ativos
  const filterDesc = [];
  if (spoolActiveSector !== 'all') filterDesc.push(`Setor: *${sectorMeta.name}*`);
  if (spoolActiveSubArea !== 'all') filterDesc.push(`Subárea: *${spoolActiveSubArea}*`);
  if (spoolActiveDh !== 'ALL') filterDesc.push(`DH: *${spoolActiveDh}*`);
  if (spoolDateFilterMode !== 'all') {
    const modeMap = {
      'activity': `Atividade no Dia (${dateFormatted})`,
      'installed': `Instalados no Dia (${dateFormatted})`,
      'received': `Recebidos no Dia (${dateFormatted})`,
      'rejected': `Reprovados no Dia (${dateFormatted})`
    };
    filterDesc.push(`Data: *${modeMap[spoolDateFilterMode] || dateFormatted}*`);
  }
  if (spoolStatusFilter !== 'all') {
    const statusMap = {
      'not-started': 'Pendente',
      'pending': 'Pendente',
      'received': 'Recebido',
      'installed': 'Instalado',
      'rejected': '🔴 Reprovado / Quarentena',
      'installed_on_date': `Instalados no Dia (${dateFormatted})`,
      'received_on_date': `Recebidos no Dia (${dateFormatted})`,
      'rejected_on_date': `Reprovados no Dia (${dateFormatted})`,
      'activity_on_date': `Atividade no Dia (${dateFormatted})`
    };
    filterDesc.push(`Status: *${statusMap[spoolStatusFilter] || spoolStatusFilter}*`);
  }
  if (spoolTypeFilter !== 'all') {
    filterDesc.push(`Tipo: *${spoolTypeFilter === 'straight' ? 'Trecho Reto' : (spoolTypeFilter === 'valve' ? 'Válvula' : 'Derivação')}*`);
  }
  if (spoolDiameterFilter !== 'all') filterDesc.push(`Diâmetro: *${spoolDiameterFilter}*`);
  if (spoolSearchTerm) filterDesc.push(`Busca: *"${spoolSearchTerm}"*`);

  const installed = list.filter(s => s.status === 'installed');
  const received = list.filter(s => s.status === 'received');
  const rejected = list.filter(s => s.status === 'rejected');
  const pending = list.filter(s => s.status === 'not-started');

  const straight = list.filter(s => s.type === 'straight');
  const branches = list.filter(s => s.type === 'branch');
  const valves = list.filter(s => s.type === 'valve');

  let text = `🏗️ *RELATÓRIO DE SPOOLS (FILTRADOS)*\n`;
  text += `📍 *Data Center Omnia (DC01)*\n`;
  if (filterDesc.length > 0) {
    text += `🎯 *Filtros:* ${filterDesc.join(' · ')}\n`;
  } else {
    text += `🌐 *Escopo:* Visão Geral da Obra (${list.length} spools)\n`;
  }
  text += `📅 *Gerado em:* ${new Date().toLocaleDateString('pt-BR')} às ${getLocalTimeStr()}\n`;
  text += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  text += `📊 *RESUMO DA SELEÇÃO:* ${list.length} spools\n`;
  text += `🟢 *Instalados:* ${installed.length}\n`;
  text += `🟡 *Recebidos:* ${received.length}\n`;
  if (rejected.length > 0) {
    text += `🔴 *Reprovados / Quarentena:* ${rejected.length}\n`;
  }
  text += `⚪ *Pendentes:* ${pending.length}\n`;
  if (straight.length || branches.length || valves.length) {
    text += `📏 Retos: ${straight.length} · 📐 Derivações: ${branches.length}${valves.length ? ` · 🔘 Válvulas: ${valves.length}` : ''}\n`;
  }
  text += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;

  if (list.length <= 100) {
    if (installed.length > 0) {
      text += `\n🟢 *INSTALADOS (${installed.length}):*\n`;
      text += installed.map(s => {
        const dia = s.diameter ? ` (${s.diameter})` : '';
        const dh = s.dh ? ` · ${s.dh}` : '';
        const dt = s.installedDate ? ` — ${formatSpoolDateShort(s.installedDate)}${s.installedAt ? ` às ${formatSpoolTime(s.installedAt)}` : ''}` : '';
        return `• Tubo ${spoolDisplayNumber(s)}${dia}${dh}${dt}`;
      }).join('\n') + `\n`;
    }

    if (received.length > 0) {
      text += `\n🟡 *RECEBIDOS (${received.length}):*\n`;
      text += received.map(s => {
        const dia = s.diameter ? ` (${s.diameter})` : '';
        const dh = s.dh ? ` · ${s.dh}` : '';
        const dt = s.receivedDate ? ` — ${formatSpoolDateShort(s.receivedDate)}${s.receivedAt ? ` às ${formatSpoolTime(s.receivedAt)}` : ''}` : '';
        return `• Spool ${spoolDisplayNumber(s)}${dia}${dh}${dt}`;
      }).join('\n') + `\n`;
    }

    if (rejected.length > 0) {
      text += `\n🔴 *REPROVADOS / QUARENTENA (${rejected.length}):*\n`;
      text += rejected.map(s => {
        const dia = s.diameter ? ` (${s.diameter})` : '';
        const dh = s.dh ? ` · ${s.dh}` : '';
        const rsn = s.rejectedReason ? ` [Motivo: ${s.rejectedReason}]` : '';
        const dt = s.rejectedDate ? ` — ${formatSpoolDateShort(s.rejectedDate)}${s.rejectedAt ? ` às ${formatSpoolTime(s.rejectedAt)}` : ''}` : '';
        return `• Spool ${spoolDisplayNumber(s)}${dia}${dh}${rsn}${dt}`;
      }).join('\n') + `\n`;
    }

    if (pending.length > 0) {
      text += `\n⚪ *PENDENTES (${pending.length}):*\n`;
      text += pending.map(s => {
        const dia = s.diameter ? ` (${s.diameter})` : '';
        const dh = s.dh ? ` · ${s.dh}` : '';
        return `• Spool ${spoolDisplayNumber(s)}${dia}${dh}`;
      }).join('\n') + `\n`;
    }
  } else {
    text += `\n📋 *PRIMEIRAS 60 TAGS (de ${list.length} itens):*\n`;
    const sample = list.slice(0, 60);
    text += sample.map(s => `• ${spoolDisplayNumber(s)} (${s.dh || 'DH'} - ${s.status === 'installed' ? '🟢' : (s.status === 'received' ? '🟡' : (s.status === 'rejected' ? '🔴' : '⚪'))})`).join('\n');
    text += `\n\n_(+ ${list.length - 60} spools não detalhados na mensagem. Baixe a planilha Excel para a relação completa.)_\n`;
  }

  text += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  text += `_Heating Cooling & Afonso França Engenharia_`;

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      toast(`📋 Lista filtrada (${list.length} spools) copiada para o WhatsApp!`);
    }).catch(() => spoolPromptFallbackCopy(text, `Lista Filtrada (${list.length} spools)`));
  } else {
    spoolPromptFallbackCopy(text, `Lista Filtrada (${list.length} spools)`);
  }
}

function spoolCopyDailyReport(dateStr = '') {
  const targetDate = dateStr || spoolSelectedDate || getLocalDateStr();
  const sectorSpools = spoolDb.filter(s =>
    (spoolActiveSector === 'all' || s.area === spoolActiveSector) &&
    (spoolActiveSubArea === 'all' || spoolCanonicalSubArea(s.subArea, s.area) === spoolCanonicalSubArea(spoolActiveSubArea, spoolActiveSector)) &&
    (spoolActiveDh === 'ALL' || normalizeDh(s.dh) === normalizeDh(spoolActiveDh))
  );
  const sectorMeta = SPOOL_SECTORS[spoolActiveSector] || { name: 'Todos os Setores' };

  const installed = sectorSpools.filter(s => s.status === 'installed' && (s.installedDate === targetDate || (s.installedAt && formatSpoolLocalDate(s.installedAt) === targetDate)));
  const straight = installed.filter(s => s.type === 'straight');
  const branches = installed.filter(s => s.type === 'branch');
  const rejectedOnDay = sectorSpools.filter(s => s.status === 'rejected' && (s.rejectedDate === targetDate || (s.rejectedAt && formatSpoolLocalDate(s.rejectedAt) === targetDate)));

  const allStraight = sectorSpools.filter(s => s.type === 'straight');
  const straightInstalledTotal = allStraight.filter(s => s.status === 'installed').length;
  const totalPending = sectorSpools.filter(s => s.status === 'not-started').length;

  const dateFormatted = new Date(targetDate + 'T12:00:00').toLocaleDateString('pt-BR');

  let text = `🏗️ *FECHAMENTO DIÁRIO DE SPOOLS*\n`;
  text += `📍 *Data Center Omnia (DC01)* · *${sectorMeta.name}* · *${spoolActiveDh}*\n`;
  text += `📅 *Data:* ${dateFormatted}\n`;
  text += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  text += `🟢 *TOTAL INSTALADO NO DIA:* ${installed.length} itens\n\n`;

  text += `📏 *TRECHOS RETOS:* ${straight.length} tubos\n`;
  text += `${straight.length ? straight.map(s => `• Tubo ${spoolDisplayNumber(s)} (${s.diameter || '8"'})${s.installedAt ? ` — ${formatSpoolTime(s.installedAt)}` : ''}`).join('\n') : '• Nenhum trecho reto hoje'}\n\n`;

  text += `📐 *DERIVAÇÕES (Ramais):* ${branches.length} tubos\n`;
  text += `${branches.length ? branches.map(s => `• Spool ${spoolDisplayNumber(s)} (${s.diameter || '2.1/2"'})${s.installedAt ? ` — ${formatSpoolTime(s.installedAt)}` : ''}`).join('\n') : '• Nenhuma derivação hoje'}\n`;

  if (rejectedOnDay.length > 0) {
    text += `\n🔴 *REPROVADOS NO DIA:* ${rejectedOnDay.length} tubos\n`;
    text += `${rejectedOnDay.map(s => `• Spool ${spoolDisplayNumber(s)} (${s.diameter || '8"'})${s.rejectedReason ? ` [${s.rejectedReason}]` : ''}`).join('\n')}\n`;
  }

  text += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  text += `📊 *STATUS ACUMULADO:*\n`;
  text += `• Linha Reta: ${straightInstalledTotal} de ${allStraight.length} concluídos (${allStraight.length ? Math.round((straightInstalledTotal / allStraight.length) * 100) : 0}%)\n`;
  text += `• Restante no Setor: ${totalPending} itens pendentes\n`;
  text += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  text += `_Heating Cooling & Afonso França Engenharia_`;

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      toast('📋 Relatório do dia copiado para o WhatsApp!');
    }).catch(() => spoolPromptFallbackCopy(text, 'Fechamento Diário de Spools'));
  } else {
    spoolPromptFallbackCopy(text, 'Fechamento Diário de Spools');
  }
}

function spoolCopyReceivedDailyReport(dateStr = '') {
  const targetDate = dateStr || spoolSelectedDate || getLocalDateStr();
  const sectorSpools = spoolDb.filter(s =>
    (spoolActiveSector === 'all' || s.area === spoolActiveSector) &&
    (spoolActiveSubArea === 'all' || spoolCanonicalSubArea(s.subArea, s.area) === spoolCanonicalSubArea(spoolActiveSubArea, spoolActiveSector)) &&
    (spoolActiveDh === 'ALL' || normalizeDh(s.dh) === normalizeDh(spoolActiveDh))
  );
  const sectorMeta = SPOOL_SECTORS[spoolActiveSector] || { name: 'Todos os Setores' };

  const received = sectorSpools.filter(s => (s.status === 'received' || s.status === 'installed') && (s.receivedDate === targetDate || (s.receivedAt && formatSpoolLocalDate(s.receivedAt) === targetDate)));
  const straight = received.filter(s => s.type === 'straight');
  const branches = received.filter(s => s.type === 'branch');
  const valves = received.filter(s => s.type === 'valve');

  const dateFormatted = new Date(targetDate + 'T12:00:00').toLocaleDateString('pt-BR');

  let text = `🏗️ *RECEBIMENTO DIÁRIO DE SPOOLS*\n`;
  text += `📍 *Data Center Omnia (DC01)* · *${sectorMeta.name}* · *${spoolActiveDh}*\n`;
  text += `📅 *Data de Descarga:* ${dateFormatted}\n`;
  text += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  text += `🟡 *TOTAL RECEBIDO NO DIA:* ${received.length} peças\n\n`;

  text += `📏 *TRECHOS RETOS RECEBIDOS:* ${straight.length} tubos\n`;
  text += `${straight.length ? straight.map(s => `• Tubo ${spoolDisplayNumber(s)} (${s.diameter || '8"'})${s.receivedAt ? ` — ${formatSpoolTime(s.receivedAt)}` : ''}`).join('\n') : '• Nenhum trecho reto recebido hoje'}\n\n`;

  text += `📐 *DERIVAÇÕES (Ramais) RECEBIDAS:* ${branches.length} tubos\n`;
  text += `${branches.length ? branches.map(s => `• Spool ${spoolDisplayNumber(s)} (${s.diameter || '2.1/2"'})${s.receivedAt ? ` — ${formatSpoolTime(s.receivedAt)}` : ''}`).join('\n') : '• Nenhuma derivação recebida hoje'}\n`;

  if (valves.length > 0) {
    text += `\n🔘 *VÁLVULAS RECEBIDAS:* ${valves.length}\n${valves.map(s => `• Válvula ${spoolDisplayNumber(s)}`).join('\n')}\n`;
  }

  text += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  text += `_Heating Cooling & Afonso França Engenharia_`;

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      toast('📋 Relatório de recebidos copiado para o WhatsApp!');
    }).catch(() => spoolPromptFallbackCopy(text, 'Recebimento Diário de Spools'));
  } else {
    spoolPromptFallbackCopy(text, 'Recebimento Diário de Spools');
  }
}

function spoolCopyTagsOnly(customList = null) {
  const list = customList || spoolFilterList(spoolDb);
  if (!list.length) return toast('Nenhum spool encontrado para copiar tags.', true);

  const tags = list.map(spoolDisplayNumber).filter(Boolean);
  const text = tags.join(', ');

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      toast(`🏷️ ${tags.length} tags copiadas!`);
    }).catch(() => spoolPromptFallbackCopy(text, `Tags (${tags.length})`));
  } else {
    spoolPromptFallbackCopy(text, `Tags (${tags.length})`);
  }
}

function spoolCopySelectedSpools() {
  const ids = spoolGetSelectedIds();
  if (!ids.length) return toast('Selecione ao menos um spool na tabela.', true);

  const idSet = new Set(ids);
  const selectedList = spoolDb.filter(s => idSet.has(s.id));
  spoolCopyFilteredReport(selectedList);
}

function spoolOpenCopyModal() {
  const filteredList = spoolFilterList(spoolDb);
  const targetDate = spoolSelectedDate || getLocalDateStr();
  const dateFormatted = new Date(targetDate + 'T12:00:00').toLocaleDateString('pt-BR');
  const installedToday = spoolDb.filter(s => s.status === 'installed' && (s.installedDate === targetDate || (s.installedAt && formatSpoolLocalDate(s.installedAt) === targetDate)));
  const receivedToday = spoolDb.filter(s => (s.status === 'received' || s.status === 'installed') && (s.receivedDate === targetDate || (s.receivedAt && formatSpoolLocalDate(s.receivedAt) === targetDate)));
  const selectedIds = spoolGetSelectedIds();

  modal(`
    <div style="padding:18px;">
      ${modalHead('Copiar Spools para WhatsApp / Clipboard', 'Escolha qual formato e seleção você deseja copiar')}

      <div class="modal-body" style="display:flex; flex-direction:column; gap:12px; margin-top:14px;">
        <!-- Opção 1: Copiar Spools Filtrados da Tela -->
        <div style="border:1.5px solid #10b981; background:#f0fdf4; border-radius:10px; padding:14px; display:flex; justify-content:space-between; align-items:center; gap:12px; flex-wrap:wrap;">
          <div>
            <strong style="color:#065f46; font-size:14px; display:block;">📋 Copiar Lista com Filtros Atuais (${filteredList.length} spools)</strong>
            <small style="color:#047857; font-size:12px;">Copia a relação completa dos spools atualmente visíveis na tela, com status, diâmetro e DH.</small>
          </div>
          <div style="display:flex; gap:6px;">
            <button type="button" class="button button-green compact" onclick="closeModal(); spoolCopyFilteredReport();" style="font-weight:800;">
              Copiar Detalhado
            </button>
            <button type="button" class="button button-outline compact" onclick="closeModal(); spoolCopyTagsOnly();" style="font-weight:700; color:#065f46; border-color:#86efac; background:#ffffff;" title="Copiar apenas os números das tags separados por vírgula">
              Apenas Tags
            </button>
          </div>
        </div>

        <!-- Opção 2: Fechamento Diário de Montagem (Instalados no Dia) -->
        <div style="border:1.5px solid #0284c7; background:#f0f9ff; border-radius:10px; padding:14px; display:flex; justify-content:space-between; align-items:center; gap:12px; flex-wrap:wrap;">
          <div>
            <strong style="color:#0369a1; font-size:14px; display:block;">🟢 Fechamento do Dia · Instalados (${installedToday.length} tubos)</strong>
            <small style="color:#0284c7; font-size:12px;">Relatório executivo de avanço físico em ${dateFormatted} por trecho reto e ramal.</small>
          </div>
          <button type="button" class="button compact" onclick="closeModal(); spoolCopyDailyReport('${targetDate}');" style="background:#0284c7; color:#ffffff; font-weight:800;">
            Copiar Fechamento
          </button>
        </div>

        <!-- Opção 3: Recebidos no Dia -->
        <div style="border:1.5px solid #ca8a04; background:#fefce8; border-radius:10px; padding:14px; display:flex; justify-content:space-between; align-items:center; gap:12px; flex-wrap:wrap;">
          <div>
            <strong style="color:#854d0e; font-size:14px; display:block;">🟡 Recebidos no Dia (${receivedToday.length} peças)</strong>
            <small style="color:#713f12; font-size:12px;">Lista de materiais descarregados e conferidos em ${dateFormatted}.</small>
          </div>
          <button type="button" class="button compact" onclick="closeModal(); spoolCopyReceivedDailyReport('${targetDate}');" style="background:#ca8a04; color:#ffffff; font-weight:800;">
            Copiar Recebidos
          </button>
        </div>

        <!-- Opção 4: Se houver spools selecionados via checkbox -->
        ${selectedIds.length > 0 ? `
          <div style="border:1.5px solid #8b5cf6; background:#f5f3ff; border-radius:10px; padding:14px; display:flex; justify-content:space-between; align-items:center; gap:12px; flex-wrap:wrap;">
            <div>
              <strong style="color:#6d28d9; font-size:14px; display:block;">☑️ Copiar Selecionados (${selectedIds.length} spools)</strong>
              <small style="color:#5b21b6; font-size:12px;">Apenas as peças marcadas com caixa de seleção na tabela.</small>
            </div>
            <button type="button" class="button compact" onclick="closeModal(); spoolCopySelectedSpools();" style="background:#7c3aed; color:#ffffff; font-weight:800;">
              Copiar Marcados
            </button>
          </div>
        ` : ''}
      </div>

      <div class="modal-foot" style="margin-top:16px;">
        <button type="button" class="button button-outline" onclick="closeModal()">Fechar</button>
      </div>
    </div>
  `, 'modal-medium');
}

function spoolPromptFallbackCopy(text, title = 'Relatório de Spools') {
  modal(`
    <div style="padding:18px;">
      ${modalHead(title, 'Copie o texto formatado abaixo para enviar no WhatsApp')}
      <div class="modal-body">
        <textarea readonly style="width:100%; height:260px; font-family:monospace; font-size:12px; padding:10px; border-radius:8px; border:1px solid #cbd5e1; background:#f8fafc;" onclick="this.select()">${esc(text)}</textarea>
      </div>
      <div class="modal-foot">
        <button class="button button-green" onclick="navigator.clipboard?.writeText(document.querySelector('textarea').value); toast('Copiado!'); closeModal();">Copiar</button>
        <button class="button button-outline" onclick="closeModal()">Fechar</button>
      </div>
    </div>
  `, 'modal-small');
}

/* ==========================================================================
   LIMPAR DADOS / ZERAR SETOR
   ========================================================================== */

function spoolClearSectorData(sectorId, dh) {
  const sectorName = sectorId === 'all' ? 'Todos os Setores' : (SPOOL_SECTORS[sectorId]?.name || sectorId);
  const count = spoolDb.filter(s => (sectorId === 'all' || s.area === sectorId) && (dh === 'ALL' || normalizeDh(s.dh) === normalizeDh(dh))).length;

  if (!count) return toast('Não há spools cadastrados neste setor para limpar.', true);

  if (!confirm(`Deseja realmente apagar TODOS os ${count} spools do ${sectorName} (${dh})?`)) {
    return;
  }

  spoolDb = spoolDb.filter(s => !((sectorId === 'all' || s.area === sectorId) && (dh === 'ALL' || normalizeDh(s.dh) === normalizeDh(dh))));
  spoolSaveAll(spoolDb);
  renderSpools();
  toast(`🗑️ Spools apagados com sucesso.`);
}

function spoolTotalCount() {
  return spoolDb.length;
}

function spoolOpenTrackingModal(spoolId) {
  const spool = spoolDb.find(s => s.id === spoolId || s.number === spoolId);
  if (!spool) return toast('Spool não encontrado.', true);

  const isInst = spool.status === 'installed';
  const isRec = spool.status === 'received';
  const sector = SPOOL_SECTORS[spool.area] || { name: spool.area || 'Setor da Obra' };
  const todayStr = getLocalDateStr();

  modal(`
    <div style="padding:18px;">
      ${modalHead(`Spool ${esc(spool.number)} · Rastreabilidade de Datas`, `${sector.name} · ${spool.dh}`)}
      
      <div class="modal-body" style="padding:16px 0;">
        <!-- CABEÇALHO DO SPOOL -->
        <div style="background:#f8fafc; border:1.5px solid #cbd5e1; border-radius:10px; padding:12px 16px; margin-bottom:16px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
          <div>
            <span style="font-size:24px; font-weight:900; font-family:monospace; color:#0f172a; display:block;">
              ${esc(spool.number)}
            </span>
            <span style="font-size:12px; color:#475569; font-weight:700;">
              ${spool.type === 'straight' ? '📏 Trecho Reto' : (spool.type === 'branch' ? '📐 Derivação' : '🔘 Válvula')} · Ø ${esc(spool.diameter || '—')} · ${esc(spool.dh)}
            </span>
          </div>
          <div>
            ${isInst
              ? '<span class="spool-status done" style="font-size:13px; font-weight:900; padding:6px 14px;"><i></i>🟢 INSTALADO</span>'
              : (isRec
                ? '<span class="spool-status in-progress" style="font-size:13px; font-weight:900; padding:6px 14px;"><i></i>🟡 RECEBIDO</span>'
                : (spool.status === 'rejected'
                  ? '<span class="spool-status rejected" style="font-size:13px; font-weight:900; padding:6px 14px; background:#fee2e2; color:#b91c1c; border-color:#fca5a5;"><i></i>🔴 REPROVADO / QUARENTENA</span>'
                  : '<span class="spool-status" style="font-size:13px; font-weight:900; padding:6px 14px;"><i></i>⚪ PENDENTE</span>'))}
          </div>
        </div>

        <!-- FORMULÁRIO COM AS DATAS: RECEBIDO, INSTALADO & REPROVADO -->
        <form id="spoolTrackingForm" onsubmit="event.preventDefault(); spoolSaveModalDates('${spool.id}');" style="display:flex; flex-direction:column; gap:14px;">
          
          <!-- 1. BLOCO DE RECEBIMENTO -->
          <div style="background:${spool.receivedDate ? '#f0f9ff' : '#ffffff'}; border:1.5px solid ${spool.receivedDate ? '#0284c7' : '#cbd5e1'}; border-radius:10px; padding:14px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
              <strong style="font-size:13px; color:#0369a1; display:flex; align-items:center; gap:6px;">
                <span>🟡</span> 1. Data de Recebimento na Obra
              </strong>
              ${spool.receivedDate ? `<span style="font-size:11px; font-weight:800; color:#0284c7; background:#e0f2fe; padding:2px 8px; border-radius:4px;">CONFIRMADO (${formatSpoolDateDisplay(spool.receivedDate)})${spool.receivedAt ? ` às ${formatSpoolTime(spool.receivedAt)}` : ''}</span>` : '<span style="font-size:11px; font-weight:700; color:#94a3b8;">NÃO RECEBIDO</span>'}
            </div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
              <div>
                <label style="font-size:11px; font-weight:700; color:#475569; display:block; margin-bottom:4px;">Data:</label>
                <input type="date" id="spoolModalRecDate" value="${spool.receivedDate || ''}" style="width:100%; padding:8px 10px; border-radius:6px; border:1px solid #cbd5e1; font-weight:700;">
              </div>
              <div>
                <label style="font-size:11px; font-weight:700; color:#475569; display:block; margin-bottom:4px;">Horário de Recebimento:</label>
                <input type="time" id="spoolModalRecTime" value="${formatSpoolTime(spool.receivedAt) || (spool.receivedDate ? getLocalTimeStr() : '')}" style="width:100%; padding:8px 10px; border-radius:6px; border:1px solid #cbd5e1; font-weight:700; background:#ffffff;">
              </div>
            </div>
          </div>

          <!-- 2. BLOCO DE INSTALAÇÃO -->
          <div style="background:${spool.installedDate ? '#f0fdf4' : '#ffffff'}; border:1.5px solid ${spool.installedDate ? '#10b981' : '#cbd5e1'}; border-radius:10px; padding:14px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
              <strong style="font-size:13px; color:#065f46; display:flex; align-items:center; gap:6px;">
                <span>🟢</span> 2. Data de Instalação / Montagem
              </strong>
              ${spool.installedDate ? `<span style="font-size:11px; font-weight:800; color:#047857; background:#dcfce7; padding:2px 8px; border-radius:4px;">MONTADO (${formatSpoolDateDisplay(spool.installedDate)})${spool.installedAt ? ` às ${formatSpoolTime(spool.installedAt)}` : ''}</span>` : '<span style="font-size:11px; font-weight:700; color:#94a3b8;">NÃO MONTADO</span>'}
            </div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
              <div>
                <label style="font-size:11px; font-weight:700; color:#475569; display:block; margin-bottom:4px;">Data:</label>
                <input type="date" id="spoolModalInstDate" value="${spool.installedDate || ''}" style="width:100%; padding:8px 10px; border-radius:6px; border:1px solid #cbd5e1; font-weight:700;">
              </div>
              <div>
                <label style="font-size:11px; font-weight:700; color:#475569; display:block; margin-bottom:4px;">Horário de Instalação:</label>
                <input type="time" id="spoolModalInstTime" value="${formatSpoolTime(spool.installedAt) || (spool.installedDate ? getLocalTimeStr() : '')}" style="width:100%; padding:8px 10px; border-radius:6px; border:1px solid #cbd5e1; font-weight:700; background:#ffffff;">
              </div>
            </div>
          </div>

          <!-- 3. BLOCO DE REPROVAÇÃO / QUARENTENA -->
          <div style="background:${spool.status === 'rejected' || spool.rejectedDate ? '#fef2f2' : '#ffffff'}; border:1.5px solid ${spool.status === 'rejected' || spool.rejectedDate ? '#ef4444' : '#cbd5e1'}; border-radius:10px; padding:14px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
              <strong style="font-size:13px; color:#b91c1c; display:flex; align-items:center; gap:6px;">
                <span>🔴</span> 3. Reprovação / Quarentena / Devolução
              </strong>
              ${spool.status === 'rejected' || spool.rejectedDate ? `<span style="font-size:11px; font-weight:800; color:#b91c1c; background:#fee2e2; padding:2px 8px; border-radius:4px;">REPROVADO (${formatSpoolDateDisplay(spool.rejectedDate || '')})${spool.rejectedAt ? ` às ${formatSpoolTime(spool.rejectedAt)}` : ''}</span>` : '<span style="font-size:11px; font-weight:700; color:#94a3b8;">NÃO REPROVADO</span>'}
            </div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:8px;">
              <div>
                <label style="font-size:11px; font-weight:700; color:#475569; display:block; margin-bottom:4px;">Data da Reprovação:</label>
                <input type="date" id="spoolModalRejDate" value="${spool.rejectedDate || ''}" style="width:100%; padding:8px 10px; border-radius:6px; border:1px solid #cbd5e1; font-weight:700;">
              </div>
              <div>
                <label style="font-size:11px; font-weight:700; color:#475569; display:block; margin-bottom:4px;">Horário de Reprovação:</label>
                <input type="time" id="spoolModalRejTime" value="${formatSpoolTime(spool.rejectedAt) || (spool.rejectedDate ? getLocalTimeStr() : '')}" style="width:100%; padding:8px 10px; border-radius:6px; border:1px solid #cbd5e1; font-weight:700; background:#ffffff;">
              </div>
            </div>
            <div>
              <label style="font-size:11px; font-weight:700; color:#475569; display:block; margin-bottom:4px;">Motivo da Não-Conformidade / Quarentena:</label>
              <input type="text" id="spoolModalRejReason" placeholder="Ex.: Duplicidade enviada pela fábrica, defeito de solda, dimensional incorreto..." value="${esc(spool.rejectedReason || '')}" style="width:100%; padding:8px 10px; border-radius:6px; border:1px solid #cbd5e1; font-weight:700;">
            </div>
          </div>

          <!-- 4. PARTE / SEQUÊNCIA E SUBÁREA -->
          <div style="background:#faf5ff; border:1.5px solid #d8b4fe; border-radius:10px; padding:14px;">
            <strong style="font-size:13px; color:#6d28d9; display:flex; align-items:center; gap:6px; margin-bottom:10px;">
              <span>📦</span> 4. Identificação / Sequência do Spool
            </strong>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:10px;">
              <div>
                <label style="font-size:11px; font-weight:700; color:#475569; display:block; margin-bottom:4px;">Parte / Sequência (Ex.: 1 de 2, 2 de 2):</label>
                <input type="text" id="spoolModalPart" placeholder="Ex.: 1 de 2" value="${esc(spool.part || '')}" style="width:100%; padding:8px 10px; border-radius:6px; border:1px solid #d8b4fe; font-weight:700;">
              </div>
              <div>
                <label style="font-size:11px; font-weight:700; color:#475569; display:block; margin-bottom:4px;">Sub-área / Local Específico:</label>
                <input type="text" id="spoolModalSubArea" placeholder="Ex.: Chillers, Bombas Primárias..." value="${esc(spool.subArea || '')}" style="width:100%; padding:8px 10px; border-radius:6px; border:1px solid #d8b4fe; font-weight:700;">
              </div>
            </div>
            <div>
              <label style="font-size:11px; font-weight:700; color:#475569; display:block; margin-bottom:4px;">📝 Observações / Notas do Spool:</label>
              <textarea id="spoolModalNotes" rows="2" placeholder="Observações técnicas, restrições, referências de isométrico..." style="width:100%; padding:8px 10px; border-radius:6px; border:1px solid #d8b4fe; font-weight:600; font-size:12px; resize:vertical;">${esc(spool.notes || '')}</textarea>
            </div>
          </div>

          <!-- 5. RESPONSÁVEL PELO APONTAMENTO -->
          <div>
            <label style="font-size:11px; font-weight:700; color:#475569; display:block; margin-bottom:4px;">Responsável pelo Apontamento / Montagem / Inspeção:</label>
            <input type="text" id="spoolModalResp" placeholder="Ex.: Pedro Alves, Equipe HVAC..." value="${esc(spool.installedBy || spool.receivedBy || spool.rejectedBy || '')}" style="width:100%; padding:8px 10px; border-radius:6px; border:1px solid #cbd5e1; font-weight:700;">
          </div>

          <!-- ATALHOS RÁPIDOS -->
          <div style="display:flex; gap:8px; flex-wrap:wrap; margin-top:4px;">
            <button type="button" class="button compact" style="background:#0284c7; color:#ffffff; font-weight:700;" onclick="const t = getLocalDateStr(); const cur = getLocalTimeStr(); document.getElementById('spoolModalRecDate').value = t; document.getElementById('spoolModalRecTime').value = cur;">
              🟡 Recebido Agora
            </button>
            <button type="button" class="button button-green compact" style="font-weight:700;" onclick="const t = getLocalDateStr(); const cur = getLocalTimeStr(); document.getElementById('spoolModalInstDate').value = t; document.getElementById('spoolModalInstTime').value = cur; document.getElementById('spoolModalRecDate').value = t; document.getElementById('spoolModalRecTime').value = cur; document.getElementById('spoolModalRejDate').value = ''; document.getElementById('spoolModalRejTime').value = '';">
              🟢 Montado Hoje (Mesmo Horário)
            </button>
            <button type="button" class="button compact" style="background:#ef4444; color:#ffffff; font-weight:700;" onclick="const t = getLocalDateStr(); const cur = getLocalTimeStr(); document.getElementById('spoolModalRejDate').value = t; document.getElementById('spoolModalRejTime').value = cur; document.getElementById('spoolModalInstDate').value = ''; document.getElementById('spoolModalInstTime').value = ''; if(!document.getElementById('spoolModalRejReason').value) document.getElementById('spoolModalRejReason').value = 'Duplicidade enviada pela fábrica'; toast('Marcado para Reprovação');">
              🔴 Reprovar Hoje
            </button>
            <button type="button" class="button button-dark compact" style="font-weight:700;" onclick="const cur = document.getElementById('spoolModalInstTime').value || document.getElementById('spoolModalRecTime').value || getLocalTimeStr(); document.getElementById('spoolModalRecTime').value = cur; document.getElementById('spoolModalInstTime').value = cur; toast('Horários igualados!');">
              ⏱️ Igualar Horários
            </button>
            <button type="button" class="button button-outline compact" style="color:#ef4444; border-color:#fca5a5; font-weight:700;" onclick="document.getElementById('spoolModalRecDate').value = ''; document.getElementById('spoolModalRecTime').value = ''; document.getElementById('spoolModalInstDate').value = ''; document.getElementById('spoolModalInstTime').value = ''; document.getElementById('spoolModalRejDate').value = ''; document.getElementById('spoolModalRejTime').value = ''; document.getElementById('spoolModalRejReason').value = '';">
              ↩️ Limpar (Pendente)
            </button>
          </div>
        </form>
      </div>

      <div class="modal-foot" style="display:flex; justify-content:space-between; align-items:center;">
        <button type="button" class="button button-outline" onclick="closeModal()">Cancelar</button>
        <button type="button" class="button button-dark" onclick="spoolSaveModalDates('${spool.id}')" style="font-weight:800;">
          💾 Salvar Datas e Dados
        </button>
      </div>
    </div>
  `, 'modal-medium');
}

function spoolSaveModalDates(spoolId) {
  const item = spoolDb.find(s => s.id === spoolId);
  if (!item) return;

  const recDate = document.getElementById('spoolModalRecDate')?.value || '';
  const recTime = document.getElementById('spoolModalRecTime')?.value || '';
  const instDate = document.getElementById('spoolModalInstDate')?.value || '';
  const instTime = document.getElementById('spoolModalInstTime')?.value || '';
  const rejDate = document.getElementById('spoolModalRejDate')?.value || '';
  const rejTime = document.getElementById('spoolModalRejTime')?.value || '';
  const rejReason = document.getElementById('spoolModalRejReason')?.value.trim() || '';
  const resp = document.getElementById('spoolModalResp')?.value.trim() || '';
  const partVal = (document.getElementById('spoolModalPart')?.value || '').trim();
  const subAreaVal = (document.getElementById('spoolModalSubArea')?.value || '').trim();
  const notesVal = (document.getElementById('spoolModalNotes')?.value || '').trim();

  // Salvar Parte, Subárea e Observações
  if (partVal !== undefined) item.part = partVal;
  if (subAreaVal !== undefined) item.subArea = subAreaVal;
  if (notesVal !== undefined) item.notes = notesVal;

  item.receivedDate = recDate;
  item.receivedAt = recDate ? buildIsoFromLocalDateAndTime(recDate, recTime) : '';
  if (resp) item.receivedBy = resp;

  item.installedDate = instDate;
  item.installedAt = instDate ? buildIsoFromLocalDateAndTime(instDate, instTime) : '';
  if (resp) item.installedBy = resp;

  item.rejectedDate = rejDate;
  item.rejectedAt = rejDate ? buildIsoFromLocalDateAndTime(rejDate, rejTime) : '';
  item.rejectedReason = rejReason;
  if (rejDate && resp) item.rejectedBy = resp;

  if (rejDate) {
    item.status = 'rejected';
    item.installedDate = '';
    item.installedAt = '';
  } else if (instDate) {
    item.status = 'installed';
    item.rejectedDate = '';
    item.rejectedAt = '';
    item.rejectedReason = '';
    if (!item.receivedDate) {
      item.receivedDate = instDate;
      item.receivedAt = item.installedAt;
    }
  } else if (recDate) {
    item.status = 'received';
    item.rejectedDate = '';
    item.rejectedAt = '';
    item.rejectedReason = '';
  } else {
    item.status = 'not-started';
    item.receivedAt = '';
    item.installedAt = '';
    item.rejectedAt = '';
    item.receivedDate = '';
    item.installedDate = '';
    item.rejectedDate = '';
    item.rejectedReason = '';
  }

  spoolSaveAll(spoolDb);
  renderSpools();
  closeModal();

  if (item.status === 'rejected') {
    toast(`🔴 Spool ${item.number} marcado como REPROVADO em ${formatSpoolDateShort(item.rejectedDate)}${item.rejectedReason ? ` (${item.rejectedReason})` : ''}`);
  } else {
    toast(`✅ Spool ${item.number}: Recebido ${item.receivedDate ? formatSpoolDateShort(item.receivedDate) + ' ' + formatSpoolTime(item.receivedAt) : '—'} | Instalado ${item.installedDate ? formatSpoolDateShort(item.installedDate) + ' ' + formatSpoolTime(item.installedAt) : '—'}`);
  }
}

// Exportações Globais
window.renderSpools = renderSpools;
window.spoolSelectSector = spoolSelectSector;
window.spoolSelectDh = spoolSelectDh;
window.spoolSetFilter = spoolSetFilter;
window.spoolSetStatusFilter = spoolSetStatusFilter;
window.spoolSetTypeFilter = spoolSetTypeFilter;
window.spoolSetDiameterFilter = spoolSetDiameterFilter;
window.spoolClearAllFilters = spoolClearAllFilters;
window.spoolShowAllMySpools = spoolShowAllMySpools;
window.spoolSetSelectedDate = spoolSetSelectedDate;
window.spoolSetDateFilterMode = spoolSetDateFilterMode;
window.spoolQuickFilterDay = spoolQuickFilterDay;
window.spoolClearDateFilter = spoolClearDateFilter;
window.spoolToggleStatus = spoolToggleStatus;
window.spoolHandleTubeTap = spoolHandleTubeTap;
window.spoolToggleSafeTapMode = spoolToggleSafeTapMode;
window.spoolToggleMapCollapse = spoolToggleMapCollapse;
window.spoolToggleMultiSelectMode = spoolToggleMultiSelectMode;
window.spoolToggleCardSelection = spoolToggleCardSelection;
window.spoolSelectAllVisible = spoolSelectAllVisible;
window.spoolOpenQuickActionModal = spoolOpenQuickActionModal;
window.spoolSaveQuickNote = spoolSaveQuickNote;
window.spoolSelectSubArea = spoolSelectSubArea;
window.spoolSetItemStatus = spoolSetItemStatus;
window.spoolPromptRejectItem = spoolPromptRejectItem;
window.spoolConfirmRejectItem = spoolConfirmRejectItem;
window.spoolBulkReject = spoolBulkReject;
window.spoolConfirmBulkReject = spoolConfirmBulkReject;
window.spoolOpenImportModal = spoolOpenImportModal;
window.spoolHandleExcelUpload = spoolHandleExcelUpload;
window.spoolConfirmImport = spoolConfirmImport;
window.spoolDownloadSampleSpreadsheet = spoolDownloadSampleSpreadsheet;
window.spoolExportUpdatedSpreadsheet = spoolExportUpdatedSpreadsheet;
window.spoolOpenExportModal = spoolOpenExportModal;
window.spoolOpenManualEntryModal = spoolOpenManualEntryModal;
window.spoolUpdateManualPartPreview = spoolUpdateManualPartPreview;
window.spoolSaveManualBatch = spoolSaveManualBatch;
window.spoolCopyDailyReport = spoolCopyDailyReport;
window.spoolCopyFilteredReport = spoolCopyFilteredReport;
window.spoolCopyReceivedDailyReport = spoolCopyReceivedDailyReport;
window.spoolCopyTagsOnly = spoolCopyTagsOnly;
window.spoolCopySelectedSpools = spoolCopySelectedSpools;
window.spoolOpenCopyModal = spoolOpenCopyModal;
window.spoolClearSectorData = spoolClearSectorData;
window.spoolOpenTrackingModal = spoolOpenTrackingModal;
window.spoolTotalCount = spoolTotalCount;
window.spoolDeleteItem = spoolDeleteItem;
window.spoolClearDh = spoolClearDh;
window.spoolToggleSelectAll = spoolToggleSelectAll;
window.spoolSetSelectionFromCheckbox = spoolSetSelectionFromCheckbox;
window.spoolUpdateSelection = spoolUpdateSelection;
window.spoolClearSelection = spoolClearSelection;
window.spoolBulkDelete = spoolBulkDelete;
window.spoolBulkSetStatus = spoolBulkSetStatus;
window.spoolDownloadSupercoreSpreadsheet = spoolDownloadSupercoreSpreadsheet;
window.spoolOpenReportPDF = spoolOpenReportPDF;
window.spoolSaveModalDates = spoolSaveModalDates;
window.formatSpoolDateDisplay = formatSpoolDateDisplay;
