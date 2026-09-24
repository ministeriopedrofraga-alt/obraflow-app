/* Controle unificado de materiais
 * Entradas (NF/Excel) e saídas (romaneios) formam um único razão de estoque,
 * sempre identificado pelo código de produto da Heating Cooling.
 */

let pendingMaterialImport = null;
let pendingMaterialOutputImport = null;
let pendingInvoicePdfFile = null;
const materialInvoiceBucket = 'material-invoices';
const materialInvoiceMaxBytes = 6 * 1024 * 1024;
const materialInvoiceDeviceDb = 'datacenter-omnia-files';
const materialInvoiceDeviceStore = 'material-invoices';

function openMaterialInvoiceDeviceDb() {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) return reject(new Error('Este navegador não oferece armazenamento local de arquivos.'));
    const request = indexedDB.open(materialInvoiceDeviceDb, 1);
    request.onerror = () => reject(request.error || new Error('Não foi possível abrir o arquivo local.'));
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(materialInvoiceDeviceStore)) request.result.createObjectStore(materialInvoiceDeviceStore, { keyPath: 'key' });
    };
    request.onsuccess = () => resolve(request.result);
  });
}

async function storeLocalMaterialInvoice(file, recordId) {
  const database = await openMaterialInvoiceDeviceDb();
  const key = `${recordId}-${Date.now()}`;
  await new Promise((resolve, reject) => {
    const transaction = database.transaction(materialInvoiceDeviceStore, 'readwrite');
    transaction.objectStore(materialInvoiceDeviceStore).put({ key, blob: file, name: file.name, type: file.type || 'application/pdf', savedAt: new Date().toISOString() });
    transaction.oncomplete = resolve;
    transaction.onerror = () => reject(transaction.error || new Error('Não foi possível arquivar o PDF neste aparelho.'));
  });
  database.close();
  return key;
}

async function getLocalMaterialInvoice(key) {
  const database = await openMaterialInvoiceDeviceDb();
  const row = await new Promise((resolve, reject) => {
    const request = database.transaction(materialInvoiceDeviceStore, 'readonly').objectStore(materialInvoiceDeviceStore).get(key);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error || new Error('Não foi possível ler o PDF deste aparelho.'));
  });
  database.close();
  return row?.blob || null;
}

async function deleteLocalMaterialInvoice(key) {
  if (!key) return;
  const database = await openMaterialInvoiceDeviceDb();
  await new Promise((resolve, reject) => {
    const transaction = database.transaction(materialInvoiceDeviceStore, 'readwrite');
    transaction.objectStore(materialInvoiceDeviceStore).delete(key);
    transaction.oncomplete = resolve;
    transaction.onerror = () => reject(transaction.error || new Error('Não foi possível remover o PDF deste aparelho.'));
  });
  database.close();
}

function hasMaterialInvoiceAttachment(recordOrAttachment) {
  const attachment = recordOrAttachment?.attachment || recordOrAttachment;
  return !!(attachment?.path || attachment?.localKey);
}

function materialInvoiceLocation(attachment) {
  return attachment?.path ? 'nuvem privada' : attachment?.localKey ? 'neste aparelho' : '';
}

function materialCode(value) {
  return String(value || '').trim().toUpperCase().replace(/\s+/g, '').replace(/[^A-Z0-9._/-]/g, '');
}

function materialNumber(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  let valueText = String(value ?? '').trim().replace(/R\$\s*/gi, '').replace(/\s/g, '');
  if (!valueText) return 0;
  if (valueText.includes(',') && valueText.includes('.')) valueText = valueText.replace(/\./g, '').replace(',', '.');
  else if (valueText.includes(',')) valueText = valueText.replace(',', '.');
  const parsed = Number(valueText);
  return Number.isFinite(parsed) ? parsed : 0;
}

function materialQuantity(value) {
  return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 3 }).format(materialNumber(value));
}

function materialMoney(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(materialNumber(value));
}

function materialEntryItems(record) {
  if (Array.isArray(record?.items)) return record.items;
  if (record?.operation === 'entrada_nf' && Array.isArray(record.answers)) {
    return record.answers.map(item => ({
      code: item.code || '', description: item.description || item.title || '',
      quantity: materialNumber(item.quantity ?? item.result), unit: item.unit || 'UN',
      unitValue: materialNumber(item.unitValue), totalValue: materialNumber(item.totalValue)
    }));
  }
  return [];
}

function inventoryMovements() {
  const movements = [];
  receivingInspections.forEach(record => {
    if (!['entrada_nf', 'entrada_planilha', 'entrada_manual'].includes(record?.operation)) return;
    materialEntryItems(record).forEach(item => {
      const code = materialCode(item.code);
      if (!code || materialNumber(item.quantity) <= 0) return;
      movements.push({
        id: `${record.id}-${code}`, recordId: record.id, recordType: 'receiving', type: 'in', code,
        description: String(item.description || '').trim(), unit: String(item.unit || 'UN').toUpperCase(),
        quantity: materialNumber(item.quantity), unitValue: materialNumber(item.unitValue),
        totalValue: materialNumber(item.totalValue) || materialNumber(item.quantity) * materialNumber(item.unitValue),
        date: record.entryDate || record.inspectedAt || record.createdAt,
        document: record.control || record.invoiceNumber || record.number || '',
        party: record.supplier || record.inspectedBy || '', destination: 'Almoxarifado', source: record.source || 'Entrada'
      });
    });
  });
  packingSlips.forEach(slip => {
    if (['divergence', 'cancelled'].includes(slip?.status)) return;
    (slip.items || []).forEach((item, itemIndex) => {
      const tracked = item.tracked !== false && item.isCustom !== true;
      const code = materialCode(item.code);
      if (materialNumber(item.quantity) <= 0 || (tracked && !code)) return;
      movements.push({
        id: `${slip.id}-${code || `AVULSO-${itemIndex + 1}`}`, recordId: slip.id, type: 'out', code: code || 'AVULSO', tracked,
        description: String(item.description || '').trim(), unit: String(item.unit || 'UN').toUpperCase(),
        quantity: materialNumber(item.quantity), unitValue: 0, totalValue: 0,
        date: slip.issuedAt || slip.createdAt, document: slip.number || '',
        party: slip.requestedBy || slip.sentBy || '', destination: slip.destination || '', source: slip.recordType === 'output' ? 'Saída simples' : 'Romaneio'
      });
    });
  });
  return movements.sort((a, b) => (Date.parse(b.date || '') || 0) - (Date.parse(a.date || '') || 0));
}

function inventorySnapshot() {
  const products = new Map();
  inventoryMovements().slice().reverse().forEach(movement => {
    if (movement.tracked === false) return;
    const current = products.get(movement.code) || {
      code: movement.code, description: movement.description, unit: movement.unit,
      entered: 0, exited: 0, balance: 0, entryValue: 0, movements: 0, lastMovement: ''
    };
    if (movement.description) current.description = movement.description;
    if (movement.unit) current.unit = movement.unit;
    if (movement.type === 'in') {
      current.entered += movement.quantity;
      current.entryValue += movement.totalValue;
    } else current.exited += movement.quantity;
    current.balance = current.entered - current.exited;
    current.movements += 1;
    if (!current.lastMovement || (Date.parse(movement.date || '') || 0) > (Date.parse(current.lastMovement || '') || 0)) current.lastMovement = movement.date;
    products.set(movement.code, current);
  });
  return Array.from(products.values()).sort((a, b) => safeSort(a.code, b.code));
}

function inventoryProduct(code) {
  return inventorySnapshot().find(item => item.code === materialCode(code));
}

function materialModuleTabs(active = 'estoque') {
  const entryCount = receivingInspections.filter(record => ['entrada_nf', 'entrada_planilha', 'entrada_manual'].includes(record?.operation)).length;
  const checkoutCount = typeof cautelasList !== 'undefined' ? cautelasList.length : 0;
  return `<nav class="module-tabs material-tabs" aria-label="Seções do controle de materiais e saídas"><a href="#materiais" class="${active === 'estoque' ? 'active' : ''}">${icon('pallet')} Saldo atual <b>${inventorySnapshot().length}</b></a><a href="#notas-entrada" class="${active === 'entradas' ? 'active' : ''}">${icon('file')} Entradas <b>${entryCount}</b></a><a href="#movimentacoes-materiais" class="${active === 'movimentacoes' ? 'active' : ''}">${icon('swap')} Movimentações <b>${inventoryMovements().length}</b></a><a href="#romaneios" class="${active === 'romaneios' ? 'active' : ''}">${icon('truck')} Documentos <b>${packingSlips.length}</b></a><a href="#cautelas" class="${active === 'saidas' ? 'active' : ''}">${icon('tool')} Saídas e cautelas <b>${checkoutCount}</b></a></nav>`;
}

function renderMaterials() {
  const stock = inventorySnapshot();
  const value = stock.reduce((sum, item) => sum + (item.entered ? item.entryValue * Math.max(0, item.balance) / item.entered : 0), 0);
  document.getElementById('app').innerHTML = `
    ${pageHeader('Materiais e saídas', 'Estoque, entradas, documentos e entregas do almoxarifado reunidos em um único módulo.', 'ALMOXARIFADO · HEATING COOLING', `<button class="button button-outline" onclick="openMaterialActionMenu('entry')">${icon('download')} Nova entrada</button><button class="button button-green" onclick="openUnifiedOutputMenu()">${icon('swap')} Nova saída</button>`)}
    ${materialModuleTabs('estoque')}
    <section class="inventory-overview"><span>${icon('pallet')} <strong>${stock.length}</strong> produtos cadastrados</span><span><strong>${stock.filter(item => item.balance > 0).length}</strong> com saldo</span><span><strong>${materialMoney(value)}</strong> em estoque</span></section>
    <section class="inventory-toolbar">
      <label class="search-box">${icon('search')}<input id="materialSearch" type="search" placeholder="Buscar código Heating ou descrição..." oninput="filterMaterials()"></label>
      <label class="filter-field"><span>Situação</span><select id="materialStatus" onchange="filterMaterials()"><option value="">Todos</option><option value="positive">Com saldo</option><option value="empty">Sem saldo</option></select></label>
      <button class="button button-outline" onclick="exportInventoryExcel()">${icon('download')} Exportar estoque</button>
      <button class="button button-dark" onclick="openInventoryReport()">${icon('print')} Imprimir estoque</button>
    </section>
    <article class="panel inventory-panel"><div class="table-wrap"><table class="data-table inventory-table"><thead><tr><th>Código Heating</th><th>Descrição do material</th><th>Un.</th><th>Saldo atual</th><th>Valor estimado</th><th></th></tr></thead><tbody>
      ${stock.map(item => `<tr class="material-row" data-status="${item.balance > 0 ? 'positive' : 'empty'}" data-search="${esc(`${item.code} ${item.description}`.toLowerCase())}"><td><strong class="material-code">${esc(item.code)}</strong></td><td><strong>${esc(item.description || 'Sem descrição')}</strong></td><td>${esc(item.unit)}</td><td><strong class="stock-balance ${item.balance <= 0 ? 'empty' : ''}">${materialQuantity(item.balance)}</strong></td><td>${materialMoney(item.entered ? item.entryValue * Math.max(0, item.balance) / item.entered : 0)}</td><td><div style="display:flex;gap:4px;"><button class="table-action" onclick="openMaterialHistory('${esc(item.code)}')">${icon('file')} Ver ficha</button><button class="table-action" style="color:var(--red);" title="Excluir material" onclick="deleteMaterialProduct('${esc(item.code)}')">${icon('trash')}</button></div></td></tr>`).join('')}
      </tbody></table></div>${stock.length ? '' : `<div class="empty-state"><div><span>${icon('pallet')}</span><h2>Nenhum material no estoque</h2><p>Faça uma entrada manual, por nota fiscal ou por planilha para iniciar o controle.</p><button class="button button-green" onclick="openMaterialActionMenu('entry')">${icon('plus')} Nova entrada</button></div></div>`}<div class="no-filter-results" id="noMaterialResults">Nenhum material encontrado.</div></article>
    `;
}

function materialEntryRecords() {
  return receivingInspections
    .filter(record => ['entrada_nf', 'entrada_planilha', 'entrada_manual'].includes(record?.operation))
    .sort((a, b) => (Date.parse(b.entryDate || b.inspectedAt || b.createdAt || '') || 0) - (Date.parse(a.entryDate || a.inspectedAt || a.createdAt || '') || 0));
}

function renderMaterialEntries() {
  const records = materialEntryRecords();
  const suppliers = [...new Set(records.map(record => record.supplier).filter(Boolean))].sort(safeSort);
  const withPdf = records.filter(hasMaterialInvoiceAttachment).length;
  const totalItems = records.reduce((sum, record) => sum + (record.items?.length || 0), 0);
  document.getElementById('app').innerHTML = `
    ${pageHeader('Notas e entradas de materiais', 'Localize cada recebimento por NF, fornecedor, data ou produto e recupere o PDF original.', 'ALMOXARIFADO · RASTREABILIDADE', `<button class="button button-outline" onclick="openMaterialSpreadsheetModal()">${icon('download')} Importar planilha</button><button class="button button-green" onclick="openReceivingInvoiceModal()">${icon('plus')} Nova nota / entrada</button>`)}
    ${materialModuleTabs('entradas')}
    <section class="inventory-overview"><span>${icon('file')} <strong>${records.length}</strong> documentos de entrada</span><span><strong>${withPdf}</strong> com PDF original</span><span><strong>${totalItems}</strong> linhas de materiais</span></section>
    <section class="material-entry-filters">
      <label class="search-box">${icon('search')}<input id="entrySearch" type="search" placeholder="Buscar NF, fornecedor, código ou material..." oninput="filterMaterialEntries()"></label>
      <label class="filter-field"><span>Nota / documento</span><select id="entryDocument" onchange="filterMaterialEntries()"><option value="">Todas</option>${records.map(record => `<option value="${esc(record.control || record.invoiceNumber || record.number)}">${esc(record.control || record.invoiceNumber || record.number)}</option>`).join('')}</select></label>
      <label class="filter-field"><span>Fornecedor</span><select id="entrySupplier" onchange="filterMaterialEntries()"><option value="">Todos</option>${suppliers.map(supplier => `<option value="${esc(supplier)}">${esc(supplier)}</option>`).join('')}</select></label>
      <label class="filter-field"><span>Arquivo original</span><select id="entryAttachment" onchange="filterMaterialEntries()"><option value="">Todos</option><option value="yes">Com PDF</option><option value="no">Sem PDF</option></select></label>
      <label class="filter-field"><span>Data inicial</span><input id="entryStart" type="date" onchange="filterMaterialEntries()"></label>
      <label class="filter-field"><span>Data final</span><input id="entryEnd" type="date" onchange="filterMaterialEntries()"></label>
    </section>
    <article class="panel inventory-panel"><div class="table-wrap"><table class="data-table material-entry-table"><thead><tr><th>Data de entrada</th><th>NF / documento</th><th>Fornecedor</th><th>Materiais recebidos</th><th>Arquivo original</th><th></th></tr></thead><tbody>
      ${records.map(record => {
        const documentNumber = record.control || record.invoiceNumber || record.number || 'SEM-NF';
        const itemsText = (record.items || []).map(item => `${item.code || ''} ${item.description || ''}`).join(' ');
        const quantity = (record.items || []).reduce((sum, item) => sum + materialNumber(item.quantity), 0);
        const search = `${documentNumber} ${record.supplier || ''} ${itemsText}`.toLocaleLowerCase('pt-BR');
        const hasAttachment = hasMaterialInvoiceAttachment(record);
        return `<tr class="material-entry-row" data-document="${esc(documentNumber)}" data-supplier="${esc(record.supplier || '')}" data-attachment="${hasAttachment ? 'yes' : 'no'}" data-date="${esc(String(record.entryDate || record.inspectedAt || record.createdAt || '').slice(0, 10))}" data-search="${esc(search)}"><td><strong>${record.entryDate || record.inspectedAt ? fullDate(record.entryDate || record.inspectedAt) : '—'}</strong><small class="table-sub">Lançado por ${esc(record.inspectedBy || 'Almoxarifado')}</small></td><td><strong class="document-number">${esc(documentNumber)}</strong><small class="table-sub">${esc(record.number || '')}</small></td><td>${esc(record.supplier || 'Não informado')}</td><td><strong>${record.items?.length || 0} item(ns)</strong><small class="table-sub">${materialQuantity(quantity)} em quantidade total</small></td><td>${hasAttachment ? `<span class="invoice-file-status available">${icon('check')} PDF arquivado</span><small class="table-sub">${esc(record.attachment.name || 'Nota fiscal.pdf')} · ${materialInvoiceLocation(record.attachment)}</small>` : `<span class="invoice-file-status missing">${icon('alert')} Sem PDF</span>`}</td><td><div class="entry-row-actions"><button class="table-action" onclick="openMaterialEntryRecord('${esc(record.id)}')">${icon('file')} Abrir</button>${hasAttachment ? `<button class="table-action" onclick="openMaterialInvoiceAttachment('${esc(record.id)}','download')">${icon('download')} Baixar NF</button>` : ''}<button class="table-action danger-text" title="Excluir entrada" onclick="deleteReceivingInspectionRecord('${esc(record.id)}')">${icon('trash')}</button></div></td></tr>`;
      }).join('')}
    </tbody></table></div>${records.length ? '' : `<div class="empty-state"><div><span>${icon('file')}</span><h2>Nenhuma nota de entrada registrada</h2><p>Envie a primeira nota fiscal em PDF ou registre uma entrada manual.</p><button class="button button-green" onclick="openReceivingInvoiceModal()">${icon('plus')} Nova entrada</button></div></div>`}<div class="no-filter-results" id="noMaterialEntryResults">Nenhuma nota encontrada com estes filtros.</div></article>`;
}

function filterMaterialEntries() {
  const search = (document.getElementById('entrySearch')?.value || '').trim().toLocaleLowerCase('pt-BR');
  const documentNumber = document.getElementById('entryDocument')?.value || '';
  const supplier = document.getElementById('entrySupplier')?.value || '';
  const attachment = document.getElementById('entryAttachment')?.value || '';
  const start = document.getElementById('entryStart')?.value || '';
  const end = document.getElementById('entryEnd')?.value || '';
  let visible = 0;
  document.querySelectorAll('.material-entry-row').forEach(row => {
    const show = (!search || row.dataset.search.includes(search))
      && (!documentNumber || row.dataset.document === documentNumber)
      && (!supplier || row.dataset.supplier === supplier)
      && (!attachment || row.dataset.attachment === attachment)
      && (!start || row.dataset.date >= start)
      && (!end || row.dataset.date <= end);
    row.style.display = show ? '' : 'none';
    if (show) visible++;
  });
  const empty = document.getElementById('noMaterialEntryResults');
  if (empty) empty.style.display = document.querySelectorAll('.material-entry-row').length && !visible ? 'block' : 'none';
}

function openMaterialEntryRecord(id) {
  const record = receivingInspections.find(item => String(item.id) === String(id));
  if (!record || !['entrada_nf', 'entrada_planilha', 'entrada_manual'].includes(record.operation)) return toast('Entrada de material não encontrada.', true);
  const documentNumber = record.control || record.invoiceNumber || record.number || 'SEM-NF';
  const hasAttachment = hasMaterialInvoiceAttachment(record);
  const rows = (record.items || []).map(item => `<tr><td><strong class="material-code">${esc(item.code || '—')}</strong></td><td>${esc(item.description || '—')}</td><td>${esc(item.unit || 'UN')}</td><td>${materialQuantity(item.quantity)}</td><td>${materialMoney(item.unitValue || 0)}</td><td>${materialMoney(item.totalValue || materialNumber(item.quantity) * materialNumber(item.unitValue))}</td></tr>`).join('');
  modal(`${modalHead(`Entrada · ${esc(documentNumber)}`, `${record.items?.length || 0} item(ns) · ${esc(record.supplier || 'Fornecedor não informado')}`)}<div class="modal-body"><section class="entry-document-summary"><span><small>Data de entrada</small><strong>${record.entryDate || record.inspectedAt ? fullDate(record.entryDate || record.inspectedAt) : '—'}</strong></span><span><small>NF / documento</small><strong>${esc(documentNumber)}</strong></span><span><small>Fornecedor</small><strong>${esc(record.supplier || 'Não informado')}</strong></span><span><small>Responsável</small><strong>${esc(record.inspectedBy || 'Almoxarifado')}</strong></span></section><section class="entry-attachment-card ${hasAttachment ? 'available' : 'missing'}"><span>${icon(hasAttachment ? 'file' : 'alert')}</span><div><strong>${hasAttachment ? esc(record.attachment.name || 'Nota fiscal.pdf') : 'Arquivo original não anexado'}</strong><small>${hasAttachment ? `${materialQuantity((record.attachment.size || 0) / 1024)} KB · arquivado ${materialInvoiceLocation(record.attachment)}` : 'Este lançamento foi criado sem um PDF vinculado.'}</small></div>${hasAttachment ? `<button class="button button-outline compact" onclick="openMaterialInvoiceAttachment('${esc(record.id)}','view')">${icon('file')} Visualizar</button><button class="button button-dark compact" onclick="openMaterialInvoiceAttachment('${esc(record.id)}','download')">${icon('download')} Baixar original</button>` : ''}</section><div class="table-wrap entry-items-table"><table class="data-table"><thead><tr><th>Código</th><th>Material</th><th>Un.</th><th>Quantidade</th><th>Valor unit.</th><th>Valor total</th></tr></thead><tbody>${rows}</tbody></table></div></div><div class="modal-foot"><button type="button" class="button button-outline danger-button" onclick="deleteReceivingInspectionRecord('${esc(record.id)}')">${icon('trash')} Excluir entrada</button><button class="button button-outline" onclick="closeModal()">Fechar</button></div>`, 'modal-large');
}

async function openMaterialInvoiceAttachment(recordId, mode = 'download') {
  const record = receivingInspections.find(item => String(item.id) === String(recordId));
  const attachment = record?.attachment;
  if (!hasMaterialInvoiceAttachment(attachment)) return toast('Esta entrada não possui PDF original anexado.', true);
  const previewWindow = mode === 'view' ? window.open('', '_blank') : null;
  try {
    let data;
    if (attachment.localKey) {
      data = await getLocalMaterialInvoice(attachment.localKey);
      if (!data) throw new Error('Este PDF foi arquivado em outro aparelho ou foi removido do navegador.');
    } else {
      const client = await waitForSupabaseClient(8000);
      if (!client) throw new Error('Serviço de arquivos indisponível.');
      const result = await client.storage.from(attachment.bucket || materialInvoiceBucket).download(attachment.path);
      if (result.error) throw result.error;
      data = result.data;
    }
    const url = URL.createObjectURL(data);
    if (mode === 'view' && previewWindow) {
      previewWindow.location.href = url;
      setTimeout(() => URL.revokeObjectURL(url), 120000);
    } else {
      previewWindow?.close();
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = attachment.name || `NF-${record.control || record.invoiceNumber || record.number}.pdf`;
      anchor.click();
      setTimeout(() => URL.revokeObjectURL(url), 1500);
    }
  } catch (error) {
    previewWindow?.close();
    console.error('Falha ao recuperar a nota fiscal:', error);
    toast(error.message || 'Não foi possível recuperar o PDF da nota.', true);
  }
}

function renderMaterialMovements() {
  const movements = inventoryMovements();
  const entryCount = movements.filter(item => item.type === 'in').length;
  const outputCount = movements.filter(item => item.type === 'out').length;
  document.getElementById('app').innerHTML = `
    ${pageHeader('Movimentações de materiais', 'Consulte tudo o que entrou, saiu ou retornou, com data, código, documento e responsável.', 'ALMOXARIFADO · HEATING COOLING', `<button class="button button-outline" onclick="openMaterialActionMenu('entry')">${icon('download')} Nova entrada</button><button class="button button-green" onclick="openUnifiedOutputMenu()">${icon('swap')} Nova saída</button>`)}
    ${materialModuleTabs('movimentacoes')}
    <section class="metrics-grid material-metrics">${metric('MOVIMENTAÇÕES', movements.length, 'registros no razão', 'blue', 'swap', 100)}${metric('ENTRADAS', entryCount, 'lançamentos', 'green', 'download', movements.length ? entryCount / movements.length * 100 : 0)}${metric('SAÍDAS', outputCount, 'lançamentos', 'amber', 'truck', movements.length ? outputCount / movements.length * 100 : 0)}${metric('DOCUMENTOS', new Set(movements.map(item => item.document).filter(Boolean)).size, 'NF, planilhas e romaneios', 'blue', 'file', 100)}</section>
    <section class="movement-filters"><label class="search-box">${icon('search')}<input id="movementSearch" type="search" placeholder="Código, material, documento, destino ou responsável..." oninput="filterMaterialMovements()"></label><label class="filter-field"><span>Operação</span><select id="movementType" onchange="filterMaterialMovements()"><option value="">Todas</option><option value="in">Entradas e retornos</option><option value="out">Saídas</option></select></label><label class="filter-field"><span>Data inicial</span><input id="movementStart" type="date" onchange="filterMaterialMovements()"></label><label class="filter-field"><span>Data final</span><input id="movementEnd" type="date" onchange="filterMaterialMovements()"></label></section>
    <article class="panel inventory-panel"><div class="table-wrap"><table class="data-table movement-table"><thead><tr><th>Data</th><th>Operação</th><th>Código Heating</th><th>Material</th><th>Quantidade</th><th>Documento</th><th>Fornecedor / destino</th><th></th></tr></thead><tbody>${movements.map(movement => `<tr class="material-movement-row" data-type="${movement.type}" data-date="${esc(String(movement.date || '').slice(0, 10))}" data-search="${esc(`${movement.code} ${movement.description} ${movement.document} ${movement.party} ${movement.destination}`.toLowerCase())}"><td>${movement.date ? fullDate(movement.date) : '—'}</td><td><span class="movement-badge ${movement.type}">${movement.type === 'in' ? 'Entrada' : 'Saída'}</span></td><td><strong class="material-code">${esc(movement.code)}</strong></td><td><strong>${esc(movement.description)}</strong><small class="table-sub">${esc(movement.unit)}</small></td><td class="${movement.type === 'in' ? 'quantity-in' : 'quantity-out'}">${movement.type === 'in' ? '+' : '−'} ${materialQuantity(movement.quantity)} ${esc(movement.unit)}</td><td><strong>${esc(movement.document || '—')}</strong><small class="table-sub">${esc(movement.source || '')}</small></td><td><strong>${esc(movement.type === 'in' ? movement.party || 'Almoxarifado' : movement.destination || '—')}</strong><small class="table-sub">${esc(movement.type === 'out' ? movement.party || '' : '')}</small></td><td><div style="display:flex;gap:4px;"><button class="table-action" onclick="${movement.recordType === 'receiving' ? `openMaterialEntryRecord('${esc(movement.recordId)}')` : movement.tracked === false ? `openPackingSlipRecord('${esc(movement.recordId)}')` : `openMaterialHistory('${esc(movement.code)}')`}">${icon('file')} ${movement.recordType === 'receiving' ? 'Ver nota' : movement.tracked === false ? 'Documento' : 'Ficha'}</button><button class="table-action" style="color:var(--red);" title="Excluir lançamento" onclick="${movement.recordType === 'receiving' ? `deleteReceivingInspectionRecord('${esc(movement.recordId)}')` : `deletePackingSlipRecord('${esc(movement.recordId)}')`}">${icon('trash')}</button></div></td></tr>`).join('')}</tbody></table></div>${movements.length ? '' : `<div class="empty-state"><div><span>${icon('swap')}</span><h2>Nenhuma movimentação registrada</h2><p>As entradas e saídas aparecerão aqui automaticamente.</p></div></div>`}<div class="no-filter-results" id="noMovementResults">Nenhuma movimentação encontrada com esses filtros.</div></article>`;
}

function filterMaterialMovements() {
  const search = document.getElementById('movementSearch')?.value.toLowerCase() || '';
  const type = document.getElementById('movementType')?.value || '';
  const start = document.getElementById('movementStart')?.value || '';
  const end = document.getElementById('movementEnd')?.value || '';
  let visible = 0;
  document.querySelectorAll('.material-movement-row').forEach(row => {
    const show = (!search || row.dataset.search.includes(search)) && (!type || row.dataset.type === type) && (!start || row.dataset.date >= start) && (!end || row.dataset.date <= end);
    row.style.display = show ? '' : 'none';
    if (show) visible++;
  });
  const empty = document.getElementById('noMovementResults');
  if (empty) empty.style.display = document.querySelectorAll('.material-movement-row').length && !visible ? 'block' : 'none';
}

function filterMaterials() {
  const search = document.getElementById('materialSearch')?.value.toLowerCase() || '';
  const status = document.getElementById('materialStatus')?.value || '';
  let visible = 0;
  document.querySelectorAll('.material-row').forEach(row => {
    const show = (!search || row.dataset.search.includes(search)) && (!status || row.dataset.status === status);
    row.style.display = show ? '' : 'none';
    if (show) visible++;
  });
  const empty = document.getElementById('noMaterialResults');
  if (empty) empty.style.display = document.querySelectorAll('.material-row').length && !visible ? 'block' : 'none';
}

function materialEntryRow(item = {}) {
  return `<tr><td><input name="item_code" required placeholder="Ex.: 21099" value="${esc(item.code || '')}"></td><td><input name="item_desc" required placeholder="Descrição do material" value="${esc(item.description || '')}"></td><td><input name="item_qty" type="number" min="0.001" step="0.001" required value="${esc(item.quantity || '')}"></td><td><input name="item_unit" required value="${esc(item.unit || 'UN')}"></td><td><input name="item_unit_value" type="number" min="0" step="0.01" value="${esc(item.unitValue || '')}"></td><td><button type="button" class="icon-button" title="Remover" onclick="removeMaterialEntryRow(this)">${icon('trash')}</button></td></tr>`;
}

function addMaterialEntryRow(item = {}) {
  const tbody = document.querySelector('#invoiceItemsTable tbody');
  if (tbody) tbody.insertAdjacentHTML('beforeend', materialEntryRow(item));
}

function removeMaterialEntryRow(button) {
  const tbody = button.closest('tbody');
  if (!tbody || tbody.children.length <= 1) return toast('A entrada precisa ter pelo menos um material.', true);
  button.closest('tr')?.remove();
}

function openReceivingInvoiceModal() {
  pendingInvoicePdfFile = null;
  modal(`${modalHead('Entrada de materiais', 'Nota fiscal em PDF ou lançamento manual pelo código Heating')}
    <div class="modal-body"><div class="receiving-reference"><span>${icon('file')}</span><div><small>CÓDIGO HEATING OBRIGATÓRIO</small><strong>A nota e o estoque serão relacionados pelo código do produto.</strong><p>Confira os itens extraídos antes de confirmar a entrada.</p></div></div>
      <div class="upload-zone" onclick="document.getElementById('invoicePdfInput').click()"><span>${icon('download')}</span><div><h3>Selecionar Nota Fiscal em PDF</h3><p>O leitor tentará localizar os dados e o arquivo original ficará vinculado a esta entrada (máximo 6 MB).</p></div><button type="button" class="button button-outline compact">Escolher PDF</button><input id="invoicePdfInput" type="file" accept="application/pdf,.pdf" hidden onchange="handleInvoicePdfUpload(event)"></div>
      <div id="invoiceFileState" class="invoice-file-selection" hidden></div>
      <div id="invoiceLoading" class="inventory-loading" hidden>Lendo a nota fiscal…</div>
      <form id="materialEntryForm" onsubmit="submitInvoiceEntry(event)"><div class="form-grid inventory-entry-head"><div class="field"><label>Número da NF / documento <em>*</em></label><input name="invoiceNumber" id="parsedInvoiceNumber" required></div><div class="field"><label>Fornecedor</label><input name="supplier" id="parsedSupplier" placeholder="Razão social"></div><div class="field"><label>Data de entrada <em>*</em></label><input type="date" name="entryDate" value="${new Date().toISOString().slice(0, 10)}" required></div></div>
        <div class="inventory-entry-table table-wrap"><table class="data-table" id="invoiceItemsTable"><thead><tr><th>Código Heating</th><th>Descrição do material</th><th>Qtd.</th><th>Un.</th><th>Valor unit.</th><th></th></tr></thead><tbody>${materialEntryRow()}</tbody></table></div>
        <button type="button" class="button button-outline compact" onclick="addMaterialEntryRow()">${icon('plus')} Adicionar item</button>
        <div class="modal-foot"><button type="button" class="button button-outline" onclick="closeModal()">Cancelar</button><button class="button button-green">${icon('check')} Confirmar entrada no estoque</button></div>
      </form></div>`, 'modal-large');
}

function invoiceTextLines(content) {
  const lineThreshold = 4;
  const lines = [];
  (content.items || []).forEach(item => {
    const str = item.str.trim();
    if (!str) return;
    const x = item.transform?.[4] || 0;
    const y = item.transform?.[5] || 0;
    let line = lines.find(l => Math.abs(l.y - y) <= lineThreshold);
    if (!line) {
      line = { y, items: [] };
      lines.push(line);
    }
    line.items.push({ x, str });
  });
  lines.sort((a, b) => b.y - a.y);
  return lines.map(line => {
    line.items.sort((a, b) => a.x - b.x);
    return line.items.map(i => i.str).join(' ').replace(/\s+/g, ' ').trim();
  }).filter(Boolean);
}

function parseInvoiceItems(lines) {
  const validUnits = 'KG|UN|UND|PC|PÇ|PCA|M|MT|M2|M3|CX|RL|ROLO|KIT|PAR|L|LT|TON|BD|CJ|TB|FD|BARRA|BR|SACO|SAC';
  const items = [];
  
  lines.forEach(line => {
    const clean = line.replace(/\s+/g, ' ').trim();
    if (!clean || clean.length < 10) return;
    
    // Padrão 1: DANFE completo (Código ... NCM CST CFOP UN QUANT VALOR_UNIT VALOR_TOTAL)
    const danfeMatch = clean.match(new RegExp(
      `^([A-Z0-9._/-]{2,25})\\s+` +
      `(.+?)` +
      `(?:\\s+\\d{8})?` +
      `(?:\\s+(?:\\d{1,3}|\\d/\\d{2}))?` +
      `(?:\\s+\\d{4})?` +
      `\\s+\\b(${validUnits})\\b` +
      `\\s+([\\d.,]+)` +
      `\\s+([\\d.,]+)` +
      `(?:\\s+[\\d.,]+)*$`,
      'i'
    ));

    if (danfeMatch) {
      const rawCode = danfeMatch[1];
      if (!/^(DADOS|NOTA|CHAVE|FATURA|VALOR|DOCUMENTO|DESTINATARIO|RECEBEMOS|EMITENTE|TRANSPORTADOR|CALCULO|INFORMACOES)$/i.test(rawCode) && (/\d/.test(rawCode) || rawCode.length >= 3)) {
        const code = materialCode(rawCode);
        const description = danfeMatch[2].trim();
        const unit = danfeMatch[3].toUpperCase();
        const quantity = materialNumber(danfeMatch[4]);
        const unitValue = materialNumber(danfeMatch[5]);
        
        if (code && quantity > 0 && description.length >= 2) {
          items.push({
            code,
            description,
            quantity,
            unit,
            unitValue: unitValue || ''
          });
          return;
        }
      }
    }

    // Padrão 2: Notas simplificadas (Código Descrição UN QUANT VALOR_UNIT)
    const simpleMatch = clean.match(new RegExp(
      `^([A-Z0-9._/-]{2,25})\\s+` +
      `(.+?)` +
      `\\s+\\b(${validUnits})\\b` +
      `\\s+([\\d.,]+)` +
      `(?:\\s+([\\d.,]+))?`,
      'i'
    ));

    if (simpleMatch) {
      const rawCode = simpleMatch[1];
      if (!/^(DADOS|NOTA|CHAVE|FATURA|VALOR|DOCUMENTO|DESTINATARIO|RECEBEMOS|EMITENTE|TRANSPORTADOR|CALCULO|INFORMACOES)$/i.test(rawCode) && (/\d/.test(rawCode) || rawCode.length >= 3)) {
        const code = materialCode(rawCode);
        const description = simpleMatch[2].trim();
        const unit = simpleMatch[3].toUpperCase();
        const quantity = materialNumber(simpleMatch[4]);
        const unitValue = simpleMatch[5] ? materialNumber(simpleMatch[5]) : '';
        
        if (code && quantity > 0 && description.length >= 2) {
          items.push({
            code,
            description,
            quantity,
            unit,
            unitValue: unitValue || ''
          });
        }
      }
    }
  });
  
  return items;
}

async function handleInvoicePdfUpload(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  if (!/\.pdf$/i.test(file.name) || (file.type && file.type !== 'application/pdf')) {
    event.target.value = '';
    pendingInvoicePdfFile = null;
    const state = document.getElementById('invoiceFileState');
    if (state) state.hidden = true;
    return toast('Selecione um arquivo PDF válido.', true);
  }
  if (file.size > materialInvoiceMaxBytes) {
    event.target.value = '';
    pendingInvoicePdfFile = null;
    const state = document.getElementById('invoiceFileState');
    if (state) state.hidden = true;
    return toast('O PDF deve ter no máximo 6 MB.', true);
  }
  pendingInvoicePdfFile = file;
  const fileState = document.getElementById('invoiceFileState');
  if (fileState) {
    fileState.hidden = false;
    fileState.innerHTML = `${icon('check')}<div><strong>${esc(file.name)}</strong><small>${materialQuantity(file.size / 1024)} KB · será arquivado junto com a entrada</small></div>`;
  }
  const loading = document.getElementById('invoiceLoading');
  if (loading) loading.hidden = false;
  try {
    if (typeof pdfjsLib === 'undefined') throw new Error('Leitor de PDF não carregado.');
    const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
    const lines = [];
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
      const page = await pdf.getPage(pageNumber);
      lines.push(...invoiceTextLines(await page.getTextContent()));
    }
    const text = lines.join('\n');

    // 1. Extração do Número da Nota Fiscal
    let invoiceNumber = '';
    const nfMatch = text.match(/(?:NF-e|N[º°o]|Número|Nota)\s*[:\-.]?\s*([\d\.\-]+)/i);
    if (nfMatch) {
      let raw = nfMatch[1].trim().replace(/\.+$/, '');
      if (raw) invoiceNumber = raw;
    }
    if (!invoiceNumber || invoiceNumber === '000') {
      const chaveMatch = text.match(/\b\d{44}\b/);
      if (chaveMatch) {
        invoiceNumber = chaveMatch[0].slice(25, 34);
      }
    }
    if (!invoiceNumber) invoiceNumber = file.name.replace(/\.pdf$/i, '');
    
    const numInput = document.getElementById('parsedInvoiceNumber');
    if (numInput) numInput.value = invoiceNumber;

    // 2. Extração do Fornecedor (Emitente)
    let supplier = '';
    const reciboMatch = text.match(/RECEBEMOS\s+DE\s+([^\n\r]+?)\s+OS\s+PRODUTOS/i);
    if (reciboMatch) {
      supplier = reciboMatch[1].trim();
    } else {
      const emitenteMatch = text.match(/(?:EMITENTE|RAZÃO\s+SOCIAL)\s*[:\-]?\s*([^\n\r]+)/i);
      if (emitenteMatch) {
        const candidate = emitenteMatch[1].trim();
        if (!candidate.toUpperCase().includes('HEATING')) {
          supplier = candidate;
        }
      }
    }
    const supplierInput = document.getElementById('parsedSupplier');
    if (supplierInput && supplier) supplierInput.value = supplier;

    // 3. Extração dos Itens da NF
    const items = parseInvoiceItems(lines);
    if (items.length) {
      const tbody = document.querySelector('#invoiceItemsTable tbody');
      if (tbody) tbody.innerHTML = items.map(materialEntryRow).join('');
    }
    
    toast(items.length ? `${items.length} item(ns) localizado(s). Todos os campos podem ser editados abaixo.` : 'PDF lido. Preencha ou edite os itens manualmente.', !items.length);
  } catch (error) {
    console.error(error);
    toast(error.message || 'Não foi possível ler a nota fiscal.', true);
  } finally {
    if (loading) loading.hidden = true;
  }
}

function materialInvoiceStorageName(name) {
  const base = String(name || 'nota-fiscal.pdf')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'nota-fiscal.pdf';
  return base.toLowerCase().endsWith('.pdf') ? base : `${base}.pdf`;
}

async function uploadMaterialInvoicePdf(file, recordId, entryDate) {
  if (!file) return null;
  const client = getSupabase();
  if (client?.auth) {
    try {
      const { data: authData } = await client.auth.getSession();
      if (authData?.session) {
        const year = String(entryDate || new Date().toISOString()).slice(0, 4) || String(new Date().getFullYear());
        const path = `${year}/${recordId}/${Date.now()}-${materialInvoiceStorageName(file.name)}`;
        const { data, error } = await client.storage.from(materialInvoiceBucket).upload(path, file, {
          contentType: 'application/pdf',
          cacheControl: '3600',
          upsert: false
        });
        if (error) throw error;
        return {
          storage: 'supabase', bucket: materialInvoiceBucket, path: data?.path || path,
          name: file.name, size: file.size, type: 'application/pdf', uploadedAt: new Date().toISOString()
        };
      }
    } catch (error) {
      console.warn('Armazenamento privado indisponível; mantendo a nota neste aparelho:', error);
    }
  }
  const localKey = await storeLocalMaterialInvoice(file, recordId);
  return {
    storage: 'device', localKey, name: file.name, size: file.size,
    type: 'application/pdf', uploadedAt: new Date().toISOString()
  };
}

async function submitInvoiceEntry(event) {
  event.preventDefault();
  const form = event.target;
  const submitButton = form.querySelector('button[type="submit"], button:not([type])');
  const submitLabel = submitButton?.innerHTML;
  const data = new FormData(form);
  const codes = data.getAll('item_code');
  const descriptions = data.getAll('item_desc');
  const quantities = data.getAll('item_qty');
  const units = data.getAll('item_unit');
  const values = data.getAll('item_unit_value');
  const parsedItems = codes.map((code, index) => ({
    code: materialCode(code), description: String(descriptions[index] || '').trim(),
    quantity: materialNumber(quantities[index]), unit: String(units[index] || 'UN').toUpperCase(),
    unitValue: materialNumber(values[index])
  })).filter(item => item.code && item.description && item.quantity > 0);
  
  if (!parsedItems.length) return toast('Informe ao menos um item com código Heating e quantidade.', true);
  
  const items = parsedItems;
  const invoiceNumber = String(data.get('invoiceNumber') || '').trim();
  const duplicate = receivingInspections.some(record => ['entrada_nf', 'entrada_manual'].includes(record.operation) && String(record.control || '').toLowerCase() === invoiceNumber.toLowerCase());
  if (duplicate && !confirm(`A nota/documento ${invoiceNumber} já foi lançado. Deseja registrar outra entrada mesmo assim?`)) return;
  const recordId = crypto.randomUUID?.() || `ent-${Date.now()}`;
  let attachment = null;
  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = pendingInvoicePdfFile ? 'Arquivando PDF…' : 'Registrando entrada…';
  }
  try {
    attachment = await uploadMaterialInvoicePdf(pendingInvoicePdfFile, recordId, data.get('entryDate'));
  } catch (error) {
    console.error('Falha ao arquivar a nota fiscal:', error);
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.innerHTML = submitLabel;
    }
    return toast(error.message || 'Não foi possível arquivar o PDF. A entrada não foi registrada.', true);
  }
  const record = {
    id: recordId,
    number: `ENT-${new Date().getFullYear()}-${String(receivingInspections.filter(item => String(item.number || '').startsWith('ENT-')).length + 1).padStart(4, '0')}`,
    operation: 'entrada_nf', control: invoiceNumber, invoiceNumber,
    supplier: String(data.get('supplier') || '').trim(), entryDate: data.get('entryDate'), inspectedAt: data.get('entryDate'),
    items, attachment, source: attachment ? 'Nota fiscal com PDF original' : 'Nota fiscal / lançamento manual',
    inspectedBy: currentUser?.name || 'Almoxarifado', createdAt: new Date().toISOString()
  };
  receivingInspections.unshift(record);
  const synced = await persistReceivingInspection(record);
  pendingInvoicePdfFile = null;
  closeModal();
  location.hash = 'notas-entrada';
  render();
  const attachmentLabel = attachment ? ` PDF original arquivado ${materialInvoiceLocation(attachment)}.` : '';
  toast(synced ? `Entrada ${invoiceNumber} registrada e sincronizada.${attachmentLabel}` : `Entrada ${invoiceNumber} salva neste aparelho.${attachmentLabel}`);
}

function openMaterialSpreadsheetModal() {
  modal(`${modalHead('Importar entrada por planilha', 'Use o relatório de entrada com o código de produto da Heating')}
    <div class="modal-body"><div class="upload-zone" onclick="document.getElementById('materialSpreadsheet').click()"><span>${icon('download')}</span><div><h3>Selecionar planilha de materiais</h3><p>.xlsx, .xls ou .xlsm · o cabeçalho pode estar em qualquer uma das primeiras 20 linhas</p></div><button type="button" class="button button-green compact">Escolher arquivo</button><input id="materialSpreadsheet" type="file" accept=".xlsx,.xls,.xlsm" hidden onchange="handleMaterialSpreadsheet(event)"></div>
    <div class="import-columns"><span>Código Produto</span><span>Data</span><span>NF</span><span>Fornecedor</span><span>Descrição do Item</span><span>Qtde</span><span>Unidade</span><span>Valor Unit.</span><span>Valor Total</span></div>
    <div class="notice">${icon('alert')} Cada código Heating vira um único produto no estoque. Uma nova importação gera entradas; ela não substitui nem apaga movimentações anteriores.</div></div><div class="modal-foot"><button class="button button-outline" onclick="closeModal()">Cancelar</button></div>`, 'modal-large');
}

function normalizedMaterialHeader(value) {
  return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

function materialColumnMap(row) {
  const map = {};
  row.forEach((value, index) => {
    const header = normalizedMaterialHeader(value);
    if (((header.includes('codigo') || header.includes('digo')) && (header.includes('produto') || header.includes('mega') || header.includes('material'))) || header === 'codigo' || header === 'cod' || header === 'codproduto' || header === 'codigomega') map.code = index;
    else if (header === 'data' || header.includes('dataentrada') || header.includes('emissao')) map.date = index;
    else if (header === 'nf' || header.includes('notafiscal')) map.invoice = index;
    else if (header.includes('fornecedor')) map.supplier = index;
    else if (header.includes('descr') || header === 'item' || header === 'material' || header === 'produto' || header.endsWith('doitem')) map.description = index;
    else if (header.includes('qtde') || header.includes('quantidade') || header === 'qtd' || header.startsWith('qtd')) map.quantity = index;
    else if (header.includes('unidade') || header === 'un' || header === 'und') map.unit = index;
    else if (header.includes('valorunit')) map.unitValue = index;
    else if (header.includes('valortotal')) map.totalValue = index;
    else if (header === 'dh' || header.includes('datahall')) map.dataHall = index;
    else if (header === 'local' || header.includes('localentrega')) map.location = index;
    else if (header.includes('datapedido')) map.requestDate = index;
    else if (header.includes('dataentrega')) map.deliveryDate = index;
    else if (header.includes('rmvinculada') || header === 'rm') map.linkedRequest = index;
    else if (header.includes('observ')) map.observation = index;
  });
  return map;
}

function materialExcelDate(value) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value.toISOString().slice(0, 10);
  if (typeof value === 'number' && window.XLSX?.SSF) {
    const parsed = XLSX.SSF.parse_date_code(value);
    if (parsed) return `${parsed.y}-${String(parsed.m).padStart(2, '0')}-${String(parsed.d).padStart(2, '0')}`;
  }
  const raw = String(value || '').trim();
  const brazilian = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (brazilian) return `${brazilian[3].length === 2 ? `20${brazilian[3]}` : brazilian[3]}-${brazilian[2].padStart(2, '0')}-${brazilian[1].padStart(2, '0')}`;
  return /^\d{4}-\d{2}-\d{2}/.test(raw) ? raw.slice(0, 10) : new Date().toISOString().slice(0, 10);
}

async function handleMaterialSpreadsheet(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  try {
    if (!await ensureExcelLibrary()) throw new Error('Leitor de Excel indisponível.');
    const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array', cellDates: true });
    const imported = [];
    workbook.SheetNames.forEach(sheetName => {
      const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1, defval: '', raw: true });
      let headerIndex = -1;
      let columns = {};
      for (let index = 0; index < Math.min(20, rows.length); index++) {
        const candidate = materialColumnMap(rows[index]);
        if (candidate.code !== undefined && candidate.description !== undefined && candidate.quantity !== undefined) {
          headerIndex = index;
          columns = candidate;
          break;
        }
      }
      if (headerIndex < 0) return;
      rows.slice(headerIndex + 1).forEach(row => {
        const code = materialCode(row[columns.code]);
        const description = String(row[columns.description] || '').trim();
        const quantity = materialNumber(row[columns.quantity]);
        if (!code || !description || quantity <= 0) return;
        imported.push({
          code, description, quantity, unit: String(row[columns.unit] || 'UN').toUpperCase(),
          unitValue: materialNumber(row[columns.unitValue]), totalValue: materialNumber(row[columns.totalValue]),
          invoice: String(row[columns.invoice] || 'SEM-NF').trim(), date: materialExcelDate(row[columns.date]),
          supplier: String(row[columns.supplier] || '').trim(), sheet: sheetName
        });
      });
    });
    if (!imported.length) throw new Error('Nenhum item válido encontrado. Confira Código Produto, Descrição do Item e Qtde.');
    pendingMaterialImport = { fileName: file.name, rows: imported };
    showMaterialImportPreview();
  } catch (error) {
    console.error(error);
    toast(error.message || 'Não foi possível ler a planilha.', true);
  }
}

function showMaterialImportPreview() {
  const rows = pendingMaterialImport?.rows || [];
  const groups = new Set(rows.map(item => `${item.invoice}|${item.date}|${item.supplier}`));
  modal(`${modalHead('Conferir importação', `${pendingMaterialImport.fileName} · ${rows.length} item(ns) em ${groups.size} documento(s)`)}<div class="modal-body"><div class="import-preview-summary"><span><b>${new Set(rows.map(item => item.code)).size}</b> códigos Heating</span><span><b>${materialQuantity(rows.reduce((sum, item) => sum + item.quantity, 0))}</b> quantidade total</span><span><b>${materialMoney(rows.reduce((sum, item) => sum + (item.totalValue || item.quantity * item.unitValue), 0))}</b> valor total</span></div><div class="table-wrap import-preview-table"><table class="data-table"><thead><tr><th>Código</th><th>Descrição</th><th>NF</th><th>Data</th><th>Qtd.</th><th>Un.</th><th>Valor total</th></tr></thead><tbody>${rows.slice(0, 100).map(item => `<tr><td><strong class="material-code">${esc(item.code)}</strong></td><td>${esc(item.description)}</td><td>${esc(item.invoice)}</td><td>${esc(item.date)}</td><td>${materialQuantity(item.quantity)}</td><td>${esc(item.unit)}</td><td>${materialMoney(item.totalValue || item.quantity * item.unitValue)}</td></tr>`).join('')}</tbody></table></div>${rows.length > 100 ? `<p class="inventory-empty-note">Exibindo os primeiros 100 de ${rows.length} itens.</p>` : ''}</div><div class="modal-foot"><button class="button button-outline" onclick="openMaterialSpreadsheetModal()">Voltar</button><button class="button button-green" onclick="confirmMaterialSpreadsheetImport()">${icon('check')} Confirmar entradas</button></div>`, 'modal-large');
}

async function confirmMaterialSpreadsheetImport() {
  const pending = pendingMaterialImport;
  if (!pending?.rows?.length) return;
  const grouped = new Map();
  pending.rows.forEach(item => {
    const key = `${item.invoice}|${item.date}|${item.supplier}`;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(item);
  });
  const sequenceStart = receivingInspections.filter(item => String(item.number || '').startsWith('ENT-')).length;
  const records = Array.from(grouped.entries()).map(([key, items], index) => ({
    id: crypto.randomUUID?.() || `imp-${Date.now()}-${index}`,
    number: `ENT-${new Date().getFullYear()}-${String(sequenceStart + index + 1).padStart(4, '0')}`,
    operation: 'entrada_planilha', control: items[0].invoice, invoiceNumber: items[0].invoice, supplier: items[0].supplier,
    entryDate: items[0].date, inspectedAt: items[0].date, source: `Planilha: ${pending.fileName}`,
    importKey: `${pending.fileName}|${key}`,
    items: items.map(({ invoice, date, supplier, sheet, ...item }) => item),
    inspectedBy: currentUser?.name || 'Almoxarifado', createdAt: new Date().toISOString()
  })).filter(record => !receivingInspections.some(existing => existing.importKey === record.importKey));
  if (!records.length) return toast('Esta planilha já foi importada; nenhuma entrada duplicada foi criada.', true);
  receivingInspections.unshift(...records);
  saveLocalBackup();
  const synced = await Promise.all(records.map(persistReceivingInspection));
  const itemCount = pending.rows.length;
  pendingMaterialImport = null;
  closeModal();
  location.hash = 'materiais';
  render();
  toast(`${records.length} entrada(s) e ${itemCount} item(ns) importados${synced.every(Boolean) ? ' e sincronizados' : ''}.`);
}

async function handleMaterialOutputSpreadsheet(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  try {
    if (!await ensureExcelLibrary()) throw new Error('Leitor de Excel indisponível.');
    const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array', cellDates: true });
    const imported = [];
    const detailedSheets = workbook.SheetNames.filter(sheetName => {
      const normalized = normalizedMaterialHeader(sheetName);
      return !normalized.includes('quantitativo') && !normalized.includes('consolidado') && normalized !== 'total' && !normalized.includes('resumo');
    });
    const sheetsToImport = detailedSheets.length ? detailedSheets : workbook.SheetNames;
    sheetsToImport.forEach(sheetName => {
      const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1, defval: '', raw: true });
      let headerIndex = -1;
      let columns = {};
      for (let index = 0; index < Math.min(30, rows.length); index++) {
        const candidate = materialColumnMap(rows[index]);
        if (candidate.description !== undefined && candidate.quantity !== undefined) {
          headerIndex = index;
          columns = candidate;
          break;
        }
      }
      if (headerIndex < 0) return;
      rows.slice(headerIndex + 1).forEach(row => {
        const code = columns.code === undefined ? '' : materialCode(row[columns.code]);
        const description = String(row[columns.description] || '').replace(/\s+/g, ' ').trim();
        const quantity = materialNumber(row[columns.quantity]);
        if (!description || quantity <= 0) return;
        const product = code ? inventoryProduct(code) : null;
        const details = [
          columns.dataHall === undefined ? '' : String(row[columns.dataHall] || '').trim(),
          columns.location === undefined ? '' : String(row[columns.location] || '').trim(),
          columns.linkedRequest === undefined || !row[columns.linkedRequest] ? '' : `RM ${String(row[columns.linkedRequest]).trim()}`,
          columns.observation === undefined ? '' : String(row[columns.observation] || '').trim()
        ].filter(Boolean);
        imported.push({
          code,
          description: product?.description || description,
          quantity,
          unit: String(product?.unit || row[columns.unit] || 'UN').trim().toUpperCase(),
          observation: [...details, `Importado de ${file.name} · ${sheetName}`].join(' · '),
          tracked: !!product,
          isCustom: !product
        });
      });
    });
    if (!imported.length) throw new Error('Nenhum item válido encontrado. A planilha precisa ter Descrição e Quantidade; Código e Unidade são opcionais.');
    pendingMaterialOutputImport = { fileName: file.name, rows: imported, input: event.target };
    showMaterialOutputImportPreview();
  } catch (error) {
    console.error(error);
    event.target.value = '';
    toast(error.message || 'Não foi possível ler a planilha de saída.', true);
  }
}

function showMaterialOutputImportPreview() {
  const pending = pendingMaterialOutputImport;
  const preview = document.getElementById('packingSpreadsheetPreview');
  if (!pending || !preview) return;
  const registered = pending.rows.filter(item => item.tracked).length;
  const custom = pending.rows.length - registered;
  preview.innerHTML = `<section class="output-import-preview">
    <div class="output-import-summary"><div><strong>${esc(pending.fileName)}</strong><small>${pending.rows.length} item(ns) encontrado(s)</small></div><span><b>${registered}</b> com código no estoque</span><span><b>${custom}</b> avulso(s) / sem entrada</span></div>
    <div class="table-wrap"><table class="data-table"><thead><tr><th>Código</th><th>Descrição</th><th>Quantidade</th><th>Un.</th><th>Tratamento</th></tr></thead><tbody>${pending.rows.slice(0, 12).map(item => `<tr><td><strong class="material-code">${esc(item.code || 'AVULSO')}</strong></td><td>${esc(item.description)}</td><td>${materialQuantity(item.quantity)}</td><td>${esc(item.unit)}</td><td>${item.tracked ? '<span class="status available">Baixa no estoque</span>' : '<span class="status in-use">Item avulso</span>'}</td></tr>`).join('')}</tbody></table></div>
    ${pending.rows.length > 12 ? `<small class="output-import-more">Mais ${pending.rows.length - 12} item(ns) serão importados.</small>` : ''}
    <div class="output-import-actions"><button type="button" class="button button-outline compact" onclick="cancelMaterialOutputImport()">Cancelar importação</button><button type="button" class="button button-outline compact" onclick="applyMaterialOutputSpreadsheet(true)">Adicionar aos itens atuais</button><button type="button" class="button button-green compact" onclick="applyMaterialOutputSpreadsheet(false)">${icon('check')} Substituir pelos itens da planilha</button></div>
  </section>`;
}

function applyMaterialOutputSpreadsheet(append = false) {
  const pending = pendingMaterialOutputImport;
  const list = document.getElementById('packingItems');
  if (!pending || !list) return;
  const importedHtml = pending.rows.map((item, index) => materialOutputRow(item, append ? list.children.length + index : index)).join('');
  if (append) list.insertAdjacentHTML('beforeend', importedHtml);
  else list.innerHTML = importedHtml;
  list.querySelectorAll('.packing-item-index').forEach((element, index) => { element.textContent = String(index + 1).padStart(2, '0'); });
  const count = pending.rows.length;
  if (pending.input) pending.input.value = '';
  pendingMaterialOutputImport = null;
  const preview = document.getElementById('packingSpreadsheetPreview');
  if (preview) preview.innerHTML = '';
  toast(`${count} item(ns) carregado(s) da planilha. Confira os saldos antes de registrar.`);
}

function cancelMaterialOutputImport() {
  if (pendingMaterialOutputImport?.input) pendingMaterialOutputImport.input.value = '';
  pendingMaterialOutputImport = null;
  const preview = document.getElementById('packingSpreadsheetPreview');
  if (preview) preview.innerHTML = '';
}

function materialOutputRow(item = {}, index = 0) {
  const stock = inventorySnapshot();
  const selected = materialCode(item.code);
  const isCustom = item.isCustom || (selected && !stock.some(p => p.code === selected));
  const customActive = isCustom || (!selected && stock.length === 0);
  const product = stock.find(p => p.code === selected);
  
  const options = stock.map(p => {
    const isSel = !isCustom && selected === p.code;
    const balanceText = p.balance > 0 ? `saldo ${materialQuantity(p.balance)} ${p.unit}` : (p.balance === 0 ? `saldo 0 ${p.unit}` : `saldo ${materialQuantity(p.balance)} ${p.unit}`);
    return `<option value="${esc(p.code)}" ${isSel ? 'selected' : ''}>${esc(p.code)} — ${esc(p.description)} (${balanceText})</option>`;
  }).join('');

  const descVal = product?.description || item.description || '';
  const unitVal = product?.unit || item.unit || 'UN';
  const balanceVal = product ? `${materialQuantity(product.balance)} ${product.unit} disponíveis` : (customActive || selected ? 'Item avulso · não altera estoque' : '—');
  const codeVal = selected || item.code || '';

  return `<div class="packing-item-row material-output-row">
    <span class="packing-item-index">${String(index + 1).padStart(2, '0')}</span>
    <label class="packing-description">
      <span>Selecione ou crie o material <em>*</em></span>
      <select class="item-select" onchange="fillMaterialOutputRow(this)">
        <option value="">Selecione do estoque…</option>
        <option value="__CUSTOM__" ${customActive ? 'selected' : ''}>+ ITEM AVULSO / SEM ENTRADA DE ESTOQUE</option>
        ${options}
      </select>
    </label>
    <label class="custom-code-wrap" style="${customActive ? '' : 'display:none;'}">
      <span>Código (opcional)</span>
      <input name="itemCodeCustom" placeholder="Ex: DUTO-100 ou deixe vazio" value="${esc(codeVal)}" oninput="this.closest('.material-output-row').querySelector('[name=itemCode]').value=materialCode(this.value)">
    </label>
    <input type="hidden" name="itemCode" value="${esc(codeVal)}">
    <label>
      <span>Descrição <em>*</em></span>
      <input name="itemDescription" required value="${esc(descVal)}" ${product && !isCustom ? 'readonly' : ''} placeholder="Ex: Duto flexível 6&quot; / Chave grifo">
    </label>
    <label>
      <span>Un. <em>*</em></span>
      <input name="itemUnit" required value="${esc(unitVal)}" ${product && !isCustom ? 'readonly' : ''} placeholder="UN">
    </label>
    <label>
      <span>Saldo</span>
      <input class="available-stock" readonly value="${balanceVal}">
    </label>
    <label>
      <span>Quantidade <em>*</em></span>
      <input name="itemQuantity" type="number" min="0.001" step="0.001" required value="${esc(item.quantity || '')}" oninput="updateMaterialOutputBalance(this)">
    </label>
    <label class="packing-observation">
      <span>Observação</span>
      <input name="itemObservation" value="${esc(item.observation || '')}" placeholder="Ex: Retirada direta">
    </label>
    <button type="button" class="icon-button packing-remove" onclick="removeMaterialOutputRow(this)">${icon('trash')}</button>
  </div>`;
}

function fillMaterialOutputRow(select) {
  const row = select.closest('.material-output-row');
  if (!row) return;
  const customWrap = row.querySelector('.custom-code-wrap');
  const customCodeInput = row.querySelector('[name="itemCodeCustom"]');
  const hiddenCodeInput = row.querySelector('[name="itemCode"]');
  const descInput = row.querySelector('[name="itemDescription"]');
  const unitInput = row.querySelector('[name="itemUnit"]');
  const stockInput = row.querySelector('.available-stock');
  const qtyInput = row.querySelector('[name="itemQuantity"]');

  if (select.value === '__CUSTOM__') {
    if (customWrap) customWrap.style.display = '';
    if (customCodeInput) {
      customCodeInput.required = false;
      customCodeInput.focus();
      hiddenCodeInput.value = materialCode(customCodeInput.value);
    }
    descInput.readOnly = false;
    descInput.placeholder = 'Ex: Duto flexível 6" / Chave grifo';
    unitInput.readOnly = false;
    if (!unitInput.value) unitInput.value = 'UN';
    stockInput.value = 'Item avulso · não altera estoque';
    qtyInput.removeAttribute('max');
  } else if (select.value) {
    const product = inventoryProduct(select.value);
    if (customWrap) customWrap.style.display = 'none';
    if (customCodeInput) customCodeInput.required = false;
    hiddenCodeInput.value = select.value;
    if (product) {
      descInput.value = product.description;
      descInput.readOnly = true;
      unitInput.value = product.unit;
      unitInput.readOnly = true;
      stockInput.value = `${materialQuantity(product.balance)} ${product.unit} disponíveis`;
    }
    qtyInput.removeAttribute('max');
  } else {
    if (customWrap) customWrap.style.display = 'none';
    if (customCodeInput) customCodeInput.required = false;
    hiddenCodeInput.value = '';
    descInput.value = '';
    descInput.readOnly = false;
    unitInput.value = '';
    unitInput.readOnly = false;
    stockInput.value = '';
    qtyInput.removeAttribute('max');
  }
}

function updateMaterialOutputBalance(quantityInput) {
  const row = quantityInput?.closest('.material-output-row');
  if (!row) return;
  const selectedCode = row.querySelector('.item-select')?.value || '';
  const stockInput = row.querySelector('.available-stock');
  if (!stockInput || !selectedCode || selectedCode === '__CUSTOM__') return;
  const product = inventoryProduct(selectedCode);
  if (!product) return;
  const requested = materialNumber(quantityInput.value);
  const after = product.balance - requested;
  stockInput.value = `${materialQuantity(product.balance)} ${product.unit} disponíveis · após: ${materialQuantity(after)} ${product.unit}`;
  stockInput.classList.toggle('insufficient-stock', requested > product.balance);
}

function addMaterialOutputRow() {
  const list = document.getElementById('packingItems');
  if (!list) return;
  list.insertAdjacentHTML('beforeend', materialOutputRow({}, list.children.length));
}

function removeMaterialOutputRow(button) {
  const list = document.getElementById('packingItems');
  if (!list || list.children.length <= 1) return toast('A saída precisa ter pelo menos um material.', true);
  button.closest('.material-output-row')?.remove();
  list.querySelectorAll('.packing-item-index').forEach((element, index) => { element.textContent = String(index + 1).padStart(2, '0'); });
}

function openPackingSlipModal() {
  modal(`<form onsubmit="submitPackingSlip(event)">${modalHead('Registrar saída de materiais', 'O romaneio baixará o estoque pelo código Heating ou registrará saída direta')}<div class="modal-body"><div class="section-title"><span>${icon('truck')}</span><div><h3>Identificação e destino</h3><small>Dados da retirada e da frente de serviço</small></div></div><div class="form-grid packing-header-grid"><div class="field"><label>Número</label><input name="number" value="${nextPackingSlipNumber()}" readonly></div><div class="field"><label>Data e hora <em>*</em></label><input name="issuedAt" type="datetime-local" required value="${nowLocal()}"></div><div class="field"><label>Origem</label><input name="origin" value="Almoxarifado DC01" required></div><div class="field"><label>Destino / frente <em>*</em></label><input name="destination" required placeholder="Ex: Sala de Máquinas / Roof Top"></div><div class="field"><label>Responsável pela saída <em>*</em></label><input name="sentBy" required value="${esc(currentUser?.name || '')}"></div><div class="field"><label>Solicitante / recebedor <em>*</em></label><input name="requestedBy" required placeholder="Nome do recebedor"></div><div class="field"><label>Transportadora / motorista</label><input name="carrier"></div><div class="field"><label>Veículo / placa</label><input name="vehicle"></div></div><div class="section-title packing-items-title"><span>${icon('pallet')}</span><div><h3>Materiais retirados</h3><small>Selecione do estoque ou informe materiais sem entrada prévia (dutos, ferramentas, etc.)</small></div><button type="button" class="button button-outline compact" onclick="addMaterialOutputRow()">${icon('plus')} Adicionar item</button></div><div id="packingItems" class="packing-items">${materialOutputRow({}, 0)}</div><div class="field full packing-notes"><label>Observações</label><textarea name="notes" placeholder="Observações sobre a remessa..."></textarea></div></div><div class="modal-foot"><button type="button" class="button button-outline" onclick="closeModal()">Cancelar</button><button class="button button-green">${icon('check')} Emitir e baixar estoque</button></div></form>`, 'modal-inspection');
}

async function submitPackingSlip(event) {
  event.preventDefault();
  const form = event.target;
  const data = new FormData(form);

  form.querySelectorAll('.material-output-row').forEach(row => {
    const select = row.querySelector('.item-select');
    const customInput = row.querySelector('[name="itemCodeCustom"]');
    const hiddenCode = row.querySelector('[name="itemCode"]');
    if (select && select.value === '__CUSTOM__' && customInput && hiddenCode) {
      hiddenCode.value = materialCode(customInput.value);
    } else if (select && select.value && select.value !== '__CUSTOM__' && hiddenCode) {
      hiddenCode.value = materialCode(select.value);
    }
  });

  const codes = Array.from(form.querySelectorAll('[name="itemCode"]')).map(el => materialCode(el.value));
  const descriptions = data.getAll('itemDescription');
  const units = data.getAll('itemUnit');
  const quantities = data.getAll('itemQuantity');
  const observations = data.getAll('itemObservation');

  const grouped = new Map();
  codes.forEach((code, index) => {
    const quantity = materialNumber(quantities[index]);
    const desc = String(descriptions[index] || '').trim();
    const unit = String(units[index] || 'UN').toUpperCase().trim();
    if (!code || !desc || quantity <= 0) return;
    const previous = grouped.get(code) || { code, description: desc, unit, quantity: 0, observation: observations[index] || '' };
    previous.quantity += quantity;
    grouped.set(code, previous);
  });
  const items = Array.from(grouped.values());
  if (!items.length) return toast('Informe ao menos um material com código, descrição e quantidade.', true);

  const slip = {
    id: crypto.randomUUID?.() || `rom-${Date.now()}`,
    number: data.get('number'),
    issuedAt: data.get('issuedAt'),
    origin: data.get('origin'),
    destination: data.get('destination'),
    sentBy: data.get('sentBy'),
    requestedBy: data.get('requestedBy'),
    carrier: data.get('carrier') || '',
    vehicle: data.get('vehicle') || '',
    notes: data.get('notes') || '',
    items,
    status: 'sent',
    createdAt: new Date().toISOString(),
    createdBy: currentUser?.name || ''
  };
  packingSlips.unshift(slip);
  saveLocalBackup();
  const synced = await persistPackingSlip(slip);
  closeModal();
  location.hash = 'materiais';
  render();
  toast(synced ? `${slip.number} emitido; saída registrada e sincronizada.` : `${slip.number} emitido; saída registrada neste aparelho.`);
}

function openMaterialHistory(code) {
  const product = inventoryProduct(code);
  if (!product) return;
  const movements = inventoryMovements().filter(movement => movement.code === product.code);
  const origins = materialEntryRecords().map(record => {
    const matchingItems = (record.items || []).filter(item => materialCode(item.code) === product.code);
    if (!matchingItems.length) return null;
    return {
      record,
      quantity: matchingItems.reduce((sum, item) => sum + materialNumber(item.quantity), 0)
    };
  }).filter(Boolean);
  const rows = movements.map(movement => [movement.date ? fullDate(movement.date) : '—', movement.type === 'in' ? 'Entrada' : 'Saída', movement.document || '—', movement.type === 'in' ? movement.party : movement.destination, movement.type === 'in' ? `+ ${materialQuantity(movement.quantity)}` : `− ${materialQuantity(movement.quantity)}`, movement.unit]);
  const summary = `<span><b>${materialQuantity(product.entered)}</b> entrou</span><span><b>${materialQuantity(product.exited)}</b> saiu</span><span><b>${materialQuantity(product.balance)}</b> saldo atual</span>`;
  const originLinks = `<section class="material-origin-links"><div><strong>Notas de origem deste material</strong><small>${origins.length} recebimento(s) separado(s), mesmo quando o código se repete.</small></div><div>${origins.map(({ record, quantity }) => `<button type="button" onclick="openMaterialEntryRecord('${esc(record.id)}')"><span>${icon(hasMaterialInvoiceAttachment(record) ? 'file' : 'download')}</span><strong>${esc(record.control || record.invoiceNumber || record.number || 'SEM-NF')}</strong><small>${record.entryDate || record.inspectedAt ? fullDate(record.entryDate || record.inspectedAt) : '—'} · ${materialQuantity(quantity)} ${esc(product.unit)} · ${esc(record.supplier || 'Fornecedor não informado')}</small>${hasMaterialInvoiceAttachment(record) ? '<em>PDF</em>' : ''}</button>`).join('') || '<p>Nenhuma nota de origem vinculada.</p>'}</div></section>`;
  modal(`${modalHead(`${esc(product.code)} · ${esc(product.description)}`, 'Histórico completo do material')}<div class="modal-body report-preview">${originLinks}${reportDocument(`Ficha de estoque · ${product.code}`, product.description, `<section class="report-section"><h2>Movimentações</h2>${reportTable(['Data', 'Operação', 'Documento', 'Fornecedor / destino', 'Quantidade', 'Un.'], rows)}</section>`, summary)}</div><div class="modal-foot"><button type="button" class="button button-outline danger-button" style="color:var(--red);border-color:var(--red-soft);" onclick="deleteMaterialProduct('${esc(product.code)}')">${icon('trash')} Excluir material e lançamentos</button><button class="button button-outline" onclick="closeModal()">Fechar</button><button class="button button-dark" onclick="window.print()">${icon('print')} Imprimir ficha</button></div>`, 'modal-paper');
  document.querySelector('.modal-backdrop')?.classList.add('print-area', 'report-print-area');
}

async function deleteMaterialProduct(code) {
  const product = inventoryProduct(code);
  const targetCode = materialCode(code);
  if (!targetCode) return toast('Código de produto inválido.', true);
  const desc = product ? product.description : targetCode;

  if (!confirm(`Tem certeza que deseja excluir o material "${targetCode} - ${desc}"?\nIsso estornará e removerá todos os lançamentos vinculados a este código.`)) return;

  try {
    await supabaseRestRequest(`products?code=eq.${encodeURIComponent(targetCode)}`, { method: 'DELETE' });
  } catch (error) {
    console.warn('Erro ao excluir produto no Supabase:', error);
  }

  receivingInspections.forEach(record => {
    if (Array.isArray(record.items)) {
      record.items = record.items.filter(item => materialCode(item.code) !== targetCode);
    }
  });
  receivingInspections = receivingInspections.filter(record => {
    if (['entrada_nf', 'entrada_planilha', 'entrada_manual'].includes(record?.operation)) {
      return Array.isArray(record.items) && record.items.length > 0;
    }
    return true;
  });

  packingSlips.forEach(slip => {
    if (Array.isArray(slip.items)) {
      slip.items = slip.items.filter(item => materialCode(item.code) !== targetCode);
    }
  });
  packingSlips = packingSlips.filter(slip => Array.isArray(slip.items) && slip.items.length > 0);

  saveLocalBackup();
  closeModal();
  render();
  toast(`Material ${targetCode} e seus lançamentos foram removidos.`);
}

function openInventoryReport() {
  const stock = inventorySnapshot();
  if (!stock.length) return toast('Não há produtos no estoque para imprimir.', true);
  const stockRows = stock.map(item => [
    item.code,
    item.description,
    item.unit,
    materialQuantity(item.balance),
    materialMoney(item.entered ? item.entryValue * Math.max(0, item.balance) / item.entered : 0)
  ]);
  const totalValue = stock.reduce((sum, item) => sum + (item.entered ? item.entryValue * Math.max(0, item.balance) / item.entered : 0), 0);
  const summary = `<span><b>${stock.length}</b> produto(s)</span><span><b>${stock.filter(item => item.balance > 0).length}</b> com saldo</span><span><b>${materialMoney(totalValue)}</b> valor estimado</span>`;
  const content = `<section class="report-section"><h2>Posição atual do estoque</h2>${reportTable(['Código Heating', 'Descrição do material', 'Un.', 'Saldo atual', 'Valor estimado'], stockRows, 'Nenhum produto no estoque.')}</section>`;
  modal(`${modalHead('Relatório de estoque', `${stock.length} produto(s) na posição atual`)}<div class="modal-body report-preview">${reportDocument('Posição atual do estoque', 'Todos os produtos cadastrados no controle de materiais', content, summary)}</div><div class="modal-foot"><button class="button button-outline" onclick="closeModal()">Fechar</button><button class="button button-dark" onclick="window.print()">${icon('print')} Imprimir / salvar PDF</button></div>`, 'modal-paper');
  document.querySelector('.modal-backdrop')?.classList.add('print-area', 'report-print-area');
}

async function imageAsBase64(url) {
  const blob = await (await fetch(url)).blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

async function exportInventoryExcel() {
  const stock = inventorySnapshot();
  if (!stock.length) return toast('Não há produtos no estoque para exportar.', true);
  if (!await ensureExcelExportLibrary()) return toast('Gerador de Excel indisponível. Verifique a internet.', true);
  try {
    const book = new ExcelJS.Workbook();
    book.creator = 'Heating Cooling';
    book.created = new Date();
    const sheet = book.addWorksheet('Estoque', { pageSetup: { orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0, paperSize: 9 } });
    sheet.mergeCells('A1:B3'); sheet.mergeCells('C1:E1'); sheet.mergeCells('C2:E2');
    sheet.getCell('C1').value = 'POSIÇÃO ATUAL DO ESTOQUE';
    sheet.getCell('C1').font = { name: 'Arial', size: 18, bold: true, color: { argb: 'FF0B2447' } };
    sheet.getCell('C2').value = `${stock.length} produto(s) na posição atual · Heating Cooling`;
    sheet.getCell('C2').font = { name: 'Arial', size: 10, color: { argb: 'FF48705C' } };
    sheet.getCell('C3').value = `Emitido em ${new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date())}`;
    try {
      const logo = book.addImage({ base64: await imageAsBase64('assets/heating-cooling-logo.png'), extension: 'png' });
      sheet.addImage(logo, { tl: { col: .1, row: .1 }, ext: { width: 145, height: 62 } });
    } catch (error) { console.warn('Logo não incorporada ao Excel:', error); }
    sheet.addRow([]);
    const header = sheet.addRow(['Código Heating', 'Descrição do material', 'Unidade', 'Saldo atual', 'Valor estimado']);
    header.eachCell(cell => { cell.font = { bold: true, color: { argb: 'FFFFFFFF' } }; cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0B2447' } }; cell.alignment = { vertical: 'middle' }; });
    header.height = 24;
    stock.forEach(item => {
      const row = sheet.addRow([item.code, item.description, item.unit, item.balance, item.entered ? item.entryValue * Math.max(0, item.balance) / item.entered : 0]);
      row.getCell(4).font = { bold: true, color: { argb: item.balance > 0 ? 'FF207A4F' : 'FFC1443B' } };
      row.getCell(5).numFmt = 'R$ #,##0.00';
    });
    sheet.columns = [18, 62, 12, 18, 20].map(width => ({ width }));
    sheet.views = [{ state: 'frozen', ySplit: 5 }];
    sheet.autoFilter = { from: 'A5', to: `E${Math.max(5, sheet.rowCount)}` };
    sheet.headerFooter.oddHeader = '&C&"Arial,Bold"HEATING COOLING — POSIÇÃO DO ESTOQUE';
    sheet.headerFooter.oddFooter = '&LHeating Cooling&R&P / &N';
    const buffer = await book.xlsx.writeBuffer();
    const anchor = document.createElement('a');
    anchor.href = URL.createObjectURL(new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
    anchor.download = `heating-controle-materiais-${new Date().toISOString().slice(0, 10)}.xlsx`;
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(anchor.href), 1000);
    toast(`${stock.length} produto(s) do estoque exportado(s).`);
  } catch (error) {
    console.error(error);
    toast('Não foi possível gerar o relatório em Excel.', true);
  }
}
