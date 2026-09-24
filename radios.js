/* Controle de rádios comunicadores.
 * O cadastro e o histórico ficam disponíveis localmente e, após a execução do
 * SQL do projeto, são sincronizados entre os aparelhos pelo Supabase.
 */
let radioAssets = [];
let radioMovements = [];
let radioRemoteAvailable = null;
let pendingRadioImport = null;

function radioLoadLocalData() {
  try {
    const assets = JSON.parse(localStorage.getItem('obraflow_radio_assets') || '[]');
    const movements = JSON.parse(localStorage.getItem('obraflow_radio_movements') || '[]');
    if (Array.isArray(assets)) radioAssets = assets;
    if (Array.isArray(movements)) radioMovements = movements;
  } catch (error) {
    console.warn('Não foi possível carregar a cópia local dos rádios:', error);
  }
}

function radioSaveLocalData() {
  try {
    localStorage.setItem('obraflow_radio_assets', JSON.stringify(radioAssets));
    localStorage.setItem('obraflow_radio_movements', JSON.stringify(radioMovements));
    return true;
  } catch (error) {
    console.warn('Não foi possível salvar a cópia local dos rádios:', error);
    return false;
  }
}

function radioTimestamp(record) {
  return Date.parse(record?.updatedAt || record?.occurredAt || record?.createdAt || 0) || 0;
}

function radioMerge(records = []) {
  const merged = new Map();
  records.filter(Boolean).forEach(record => {
    const key = String(record.id || record.code || '').trim();
    if (!key) return;
    const current = merged.get(key);
    if (!current || radioTimestamp(record) >= radioTimestamp(current)) merged.set(key, record);
  });
  return Array.from(merged.values());
}

async function syncRadiosFromSupabase() {
  radioLoadLocalData();
  try {
    if (typeof supabaseRestRequest !== 'function') return false;
    const [assetRows, movementRows] = await Promise.all([
      supabaseRestRequest('radio_assets?select=id,data,updated_at&order=updated_at.desc'),
      supabaseRestRequest('radio_movements?select=id,data,updated_at&order=occurred_at.desc')
    ]);
    const remoteAssets = (assetRows || []).map(row => ({ ...(row.data || {}), updatedAt: row.data?.updatedAt || row.updated_at })).filter(item => item.id);
    const remoteMovements = (movementRows || []).map(row => ({ ...(row.data || {}), updatedAt: row.data?.updatedAt || row.updated_at })).filter(item => item.id);
    radioAssets = radioMerge([...radioAssets, ...remoteAssets]).sort((a, b) => String(a.code || '').localeCompare(String(b.code || ''), 'pt-BR'));
    radioMovements = radioMerge([...radioMovements, ...remoteMovements]).sort((a, b) => radioTimestamp(b) - radioTimestamp(a));
    
    // Auto-cleanup for garbage rows imported from spreadsheet
    const garbageIds = radioAssets.filter(r => /^\d+\.\s/.test(r.code || '') || (r.code || '').includes('REGISTRE')).map(r => r.id);
    if (garbageIds.length > 0) {
      radioAssets = radioAssets.filter(r => !garbageIds.includes(r.id));
      radioMovements = radioMovements.filter(r => !garbageIds.includes(r.radioId));
      garbageIds.forEach(id => {
        supabaseRestRequest(`radio_assets?id=eq.${id}`, { method: 'DELETE' }).catch(() => {});
      });
    }

    radioRemoteAvailable = true;
    radioSaveLocalData();
    const count = document.getElementById('navRadioCount');
    if (count) count.textContent = radioAssets.length;
    if (typeof currentPage !== 'undefined' && currentPage === 'radios' && !document.querySelector('#modalRoot form')) renderRadios();
    return true;
  } catch (error) {
    radioRemoteAvailable = false;
    console.warn('Sincronização dos rádios indisponível; mantendo a cópia local:', error);
    return false;
  }
}

async function persistRadioAsset(asset) {
  asset.updatedAt = new Date().toISOString();
  radioSaveLocalData();
  try {
    await supabaseRestRequest('radio_assets?on_conflict=id', {
      method: 'POST',
      headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
      body: JSON.stringify({ id: String(asset.id), code: asset.code, data: asset, updated_at: asset.updatedAt })
    });
    radioRemoteAvailable = true;
    return true;
  } catch (error) {
    radioRemoteAvailable = false;
    console.warn('Rádio salvo somente neste aparelho:', error);
    return false;
  }
}

async function persistRadioMovement(movement) {
  movement.updatedAt = new Date().toISOString();
  radioSaveLocalData();
  try {
    await supabaseRestRequest('radio_movements?on_conflict=id', {
      method: 'POST',
      headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
      body: JSON.stringify({ id: String(movement.id), radio_id: movement.radioId, occurred_at: movement.occurredAt, data: movement, updated_at: movement.updatedAt })
    });
    return true;
  } catch (error) {
    console.warn('Movimentação do rádio salva somente neste aparelho:', error);
    return false;
  }
}

window.deleteRadioAsset = async function(id) {
  if (!confirm('Tem certeza que deseja excluir este rádio e todo o seu histórico? Esta ação não pode ser desfeita.')) return;
  const radioIndex = radioAssets.findIndex(item => String(item.id) === String(id));
  if (radioIndex === -1) return;
  radioAssets.splice(radioIndex, 1);
  const movementsToDelete = radioMovements.filter(item => String(item.radioId) === String(id));
  radioMovements = radioMovements.filter(item => String(item.radioId) !== String(id));
  radioSaveLocalData();
  try {
    if (typeof supabaseRestRequest === 'function') {
      await supabaseRestRequest(`radio_assets?id=eq.${id}`, { method: 'DELETE' });
      await Promise.all(movementsToDelete.map(mov => 
        supabaseRestRequest(`radio_movements?id=eq.${mov.id}`, { method: 'DELETE' }).catch(() => {})
      ));
    }
  } catch (err) {
    console.warn('Erro ao excluir do banco:', err);
  }
  const modalWrap = document.getElementById('modalRoot');
  if (modalWrap?.querySelector('form')) closeModal();
  renderRadios();
  toast('Rádio excluído com sucesso.');
};

function radioStatusLabel(status) {
  return ({ available: 'Disponível', 'in-use': 'Em uso', maintenance: 'Manutenção' })[status] || 'Disponível';
}

function radioStatusBadge(status) {
  const cssClass = status === 'available' ? 'available' : status === 'maintenance' ? 'maintenance' : 'in-use';
  return `<span class="status ${cssClass}">${radioStatusLabel(status)}</span>`;
}

function radioPeopleOptions() {
  const people = typeof workforce !== 'undefined' && Array.isArray(workforce) ? workforce : [];
  return [...new Map(people.filter(person => person?.name).map(person => [String(person.name).trim().toLocaleUpperCase('pt-BR'), person])).values()]
    .sort((a, b) => String(a.name).localeCompare(String(b.name), 'pt-BR'))
    .map(person => `<option value="${esc(person.name)}">${esc([person.company, person.role].filter(Boolean).join(' · '))}</option>`).join('');
}

function normalizedRadioHeader(value) {
  return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

function normalizeRadioCode(value) {
  let code = String(value || '').trim().toUpperCase().replace(/\s+/g, ' ').replace(/\s*-\s*/g, '-');
  const radioNumber = code.match(/^RAD-?(\d+)$/);
  if (radioNumber) code = `RAD-${String(Number(radioNumber[1])).padStart(3, '0')}`;
  return code;
}

function radioColumnMap(row = []) {
  const map = {};
  row.forEach((value, index) => {
    const header = normalizedRadioHeader(value);
    if (!header) return;
    if (['codigo', 'cod', 'prefixo', 'idradio', 'codigoradio', 'radio'].includes(header)) map.code = index;
    else if (header.includes('patrimonio') || ['tag', 'tombo', 'ativo'].includes(header)) map.assetNumber = index;
    else if (header.includes('marcamodelo')) map.brandModel = index;
    else if (header === 'marca' || header.includes('fabricante')) map.brand = index;
    else if (header === 'modelo') map.model = index;
    else if (header.includes('numerodeserie') || header.includes('nserie') || header === 'serie' || header === 'serial') map.serial = index;
    else if (header.includes('canal') || header.includes('frequencia')) map.channel = index;
    else if (header.includes('dataentrega')) map.deliveryDate = index;
    else if (header.includes('horaentrega')) map.deliveryTime = index;
    else if (header.includes('previsaodevolucao')) map.expectedReturn = index;
    else if (header.includes('datadevolucao')) map.returnDate = index;
    else if (header.includes('condicaonaentrega')) map.deliveryCondition = index;
    else if (header.includes('condicaonadevolucao')) map.returnCondition = index;
    else if (header.includes('carregador')) map.charger = index;
    else if (header.includes('bateriaextra')) map.extraBattery = index;
    else if (header.includes('almoxarife') && header.includes('responsavel')) map.warehouseResponsible = index;
    else if (header === 'funcao' || header.includes('cargo')) map.role = index;
    else if (header === 'status' || header.includes('situacao') || header === 'statusatual' || header.includes('disponibilidade')) map.status = index;
    else if (header.includes('responsavel') || header.includes('colaborador') || header === 'usuario' || header === 'portador') map.collaborator = index;
    else if (header === 'empresa' || header.includes('empreiteira')) map.company = index;
    else if (header === 'local' || header.includes('frente') || header.includes('datahall') || header.includes('obra') || header.includes('site')) map.location = index;
    else if (header.includes('dataaquisicao')) map.acquisitionDate = index;
    else if (header.includes('observ')) map.notes = index;
  });
  return map;
}

function radioImportedStatus(value, collaborator = '') {
  const normalized = normalizedRadioHeader(value);
  if (normalized.includes('manut') || normalized.includes('avaria') || normalized.includes('indispon')) return 'maintenance';
  if (normalized.includes('uso') || normalized.includes('entreg') || normalized.includes('emprest') || collaborator) return 'in-use';
  return 'available';
}

function radioImportDate(value) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value.toISOString().slice(0, 16);
  if (typeof value === 'number' && window.XLSX?.SSF) {
    const parsed = XLSX.SSF.parse_date_code(value);
    if (parsed) return `${parsed.y}-${String(parsed.m).padStart(2, '0')}-${String(parsed.d).padStart(2, '0')}T${String(parsed.H || 17).padStart(2, '0')}:${String(parsed.M || 0).padStart(2, '0')}`;
  }
  const raw = String(value || '').trim();
  const brazilian = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})(?:\s+(\d{1,2}):(\d{2}))?/);
  if (brazilian) return `${brazilian[3].length === 2 ? `20${brazilian[3]}` : brazilian[3]}-${brazilian[2].padStart(2, '0')}-${brazilian[1].padStart(2, '0')}T${String(brazilian[4] || 17).padStart(2, '0')}:${brazilian[5] || '00'}`;
  return /^\d{4}-\d{2}-\d{2}/.test(raw) ? raw.slice(0, 16) : '';
}

function radioImportDateTime(dateValue, timeValue = '') {
  const date = radioImportDate(dateValue);
  if (!date) return '';
  let hours = 0;
  let minutes = 0;
  if (timeValue instanceof Date && !Number.isNaN(timeValue.getTime())) {
    hours = timeValue.getHours();
    minutes = timeValue.getMinutes();
  } else if (typeof timeValue === 'number') {
    const totalMinutes = Math.round((timeValue % 1) * 24 * 60);
    hours = Math.floor(totalMinutes / 60) % 24;
    minutes = totalMinutes % 60;
  } else {
    const match = String(timeValue || '').match(/(\d{1,2}):(\d{2})/);
    if (match) {
      hours = Number(match[1]);
      minutes = Number(match[2]);
    }
  }
  return `${date.slice(0, 10)}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

function radioBrandAndModel(brandModel, brand = '', model = '') {
  const combined = String(brandModel || '').trim();
  if (!combined) return { brand: String(brand || '').trim(), model: String(model || '').trim() };
  const parts = combined.split(/\s+/);
  return { brand: parts.shift() || '', model: parts.join(' ') };
}

function radioConditionValue(value) {
  const normalized = normalizedRadioHeader(value);
  return normalized.includes('avaria') || normalized.includes('ruim') || normalized.includes('danif') ? 'damaged' : 'ok';
}

window.handleRadioSpreadsheet = async function(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  try {
    if (!await ensureExcelLibrary()) throw new Error('Leitor de Excel indisponível. Verifique a conexão.');
    const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array', cellDates: true });
    const imported = [];
    workbook.SheetNames.forEach(sheetName => {
      const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1, defval: '', raw: true });
      let headerIndex = -1;
      let columns = {};
      for (let index = 0; index < Math.min(30, rows.length); index++) {
        const candidate = radioColumnMap(rows[index]);
        if (candidate.code !== undefined || candidate.assetNumber !== undefined || candidate.serial !== undefined) {
          headerIndex = index;
          columns = candidate;
          break;
        }
      }
      if (headerIndex < 0) return;
      rows.slice(headerIndex + 1).forEach((row, rowOffset) => {
        const value = key => columns[key] === undefined ? '' : row[columns[key]];
        const serial = String(value('serial') || '').trim();
        const assetNumber = String(value('assetNumber') || '').trim();
        const code = normalizeRadioCode(value('code') || assetNumber || serial);
        if (!code) return;
        const collaborator = String(value('collaborator') || '').trim();
        const status = radioImportedStatus(value('status'), collaborator);
        const identity = radioBrandAndModel(value('brandModel'), value('brand'), value('model'));
        const deliveryDate = radioImportDateTime(value('deliveryDate'), value('deliveryTime'));
        const returnDate = radioImportDateTime(value('returnDate'));
        const accessories = [
          value('charger') ? `Carregador: ${String(value('charger')).trim()}` : '',
          value('extraBattery') ? `Bateria extra: ${String(value('extraBattery')).trim()}` : '',
          value('deliveryCondition') ? `Condição na entrega: ${String(value('deliveryCondition')).trim()}` : ''
        ].filter(Boolean).join(' · ');
        imported.push({
          code,
          assetNumber: assetNumber || code,
          brand: identity.brand,
          model: identity.model,
          serial,
          channel: String(value('channel') || '').trim(),
          status,
          collaborator,
          company: String(value('company') || '').trim(),
          role: String(value('role') || '').trim(),
          location: String(value('location') || '').trim(),
          expectedReturn: radioImportDateTime(value('expectedReturn')),
          acquisitionDate: radioImportDate(value('acquisitionDate')).slice(0, 10),
          deliveryDate,
          returnDate,
          deliveryCondition: String(value('deliveryCondition') || '').trim(),
          returnCondition: String(value('returnCondition') || '').trim(),
          warehouseResponsible: String(value('warehouseResponsible') || '').trim(),
          accessories,
          notes: String(value('notes') || '').trim(),
          sheetName,
          isRegistration: normalizedRadioHeader(sheetName).includes('cadastro'),
          isDelivery: !!(deliveryDate || collaborator || columns.deliveryDate !== undefined),
          importKey: `${file.name}|${sheetName}|${headerIndex + rowOffset + 2}|${code}`
        });
      });
    });
    if (!imported.length) throw new Error('Nenhum rádio encontrado. A planilha precisa ter Nº Patrimônio, Código/Rádio ou Número de série.');
    const assetMap = new Map();
    imported.forEach(item => {
      const current = assetMap.get(item.code) || { code: item.code, assetNumber: item.assetNumber || item.code, _registration: false };
      ['assetNumber','brand','model','serial','channel','location','acquisitionDate','notes'].forEach(key => {
        if (item[key] && (!current[key] || item.isRegistration)) current[key] = item[key];
      });
      if (item.isRegistration || !current._registration) current.status = item.status;
      if (item.isRegistration) current._registration = true;
      assetMap.set(item.code, current);
    });

    const deliveryRows = imported.filter(item => item.isDelivery && item.collaborator);
    const assets = Array.from(assetMap.values()).map(asset => {
      const deliveries = deliveryRows.filter(item => item.code === asset.code).sort((a, b) => Date.parse(b.deliveryDate || 0) - Date.parse(a.deliveryDate || 0));
      const openDelivery = deliveries.find(item => !item.returnDate);
      const status = asset._registration ? asset.status : openDelivery ? 'in-use' : asset.status || 'available';
      delete asset._registration;
      return {
        ...asset,
        status,
        usage: status === 'in-use' && openDelivery ? {
          collaborator: openDelivery.collaborator,
          company: openDelivery.company,
          role: openDelivery.role,
          location: openDelivery.location || 'Não informado',
          expectedReturn: openDelivery.expectedReturn,
          notes: [openDelivery.accessories, openDelivery.notes].filter(Boolean).join(' · '),
          signature: '',
          deliveredBy: openDelivery.warehouseResponsible || 'Importado da planilha',
          checkoutAt: openDelivery.deliveryDate,
          importedLegacy: true
        } : null
      };
    });

    const movements = [];
    deliveryRows.forEach(item => {
      const notes = [item.accessories, item.notes].filter(Boolean).join(' · ');
      movements.push({
        importKey: `${item.importKey}|checkout`,
        radioCode: item.code,
        action: 'checkout',
        occurredAt: item.deliveryDate || new Date().toISOString(),
        collaborator: item.collaborator,
        company: item.company,
        role: item.role,
        location: item.location,
        expectedReturn: item.expectedReturn,
        notes,
        signature: '',
        deliveredBy: item.warehouseResponsible || 'Importado da planilha',
        importedLegacy: true
      });
      if (item.returnDate) movements.push({
        importKey: `${item.importKey}|return`,
        radioCode: item.code,
        action: 'return',
        occurredAt: item.returnDate,
        collaborator: item.collaborator,
        company: item.company,
        condition: radioConditionValue(item.returnCondition),
        notes: [item.returnCondition ? `Condição: ${item.returnCondition}` : '', item.notes].filter(Boolean).join(' · '),
        receivedBy: item.warehouseResponsible || 'Importado da planilha',
        importedLegacy: true
      });
    });

    pendingRadioImport = { fileName: file.name, rows: assets, movements, input: event.target };
    showRadioImportPreview();
  } catch (error) {
    console.error(error);
    event.target.value = '';
    toast(error.message || 'Não foi possível ler a planilha de rádios.', true);
  }
};

function showRadioImportPreview() {
  const pending = pendingRadioImport;
  if (!pending) return;
  const existing = pending.rows.filter(row => radioAssets.some(item => normalizeRadioCode(item.code) === row.code || (row.serial && item.serial === row.serial))).length;
  const previewRows = pending.rows.slice(0, 12).map(row => `<tr><td><strong>${esc(row.code)}</strong></td><td>${esc([row.brand, row.model].filter(Boolean).join(' ') || '—')}</td><td>${esc(row.serial || '—')}</td><td>${radioStatusBadge(row.status)}</td><td>${esc(row.collaborator || '—')}</td></tr>`).join('');
  modal(`${modalHead('Conferir importação de rádios', `${esc(pending.fileName)} · ${pending.rows.length} registro(s)`)}<div class="modal-body">
    <section class="inventory-overview"><span>${icon('radio')} <strong>${pending.rows.length}</strong> rádios identificados</span><span><strong>${pending.movements?.filter(item => item.action === 'checkout').length || 0}</strong> entregas encontradas</span><span><strong>${existing}</strong> serão atualizados</span><span><strong>${pending.rows.length - existing}</strong> serão cadastrados</span></section>
    <div class="table-wrap"><table class="data-table"><thead><tr><th>Código</th><th>Marca / modelo</th><th>Série</th><th>Situação</th><th>Responsável atual</th></tr></thead><tbody>${previewRows}</tbody></table></div>
    ${pending.rows.length > 12 ? `<div class="notice">${icon('file')} Prévia das primeiras 12 linhas. Mais ${pending.rows.length - 12} registro(s) também serão importados.</div>` : ''}
    <div class="notice">${icon('alert')} Registros com o mesmo código ou número de série serão atualizados, sem duplicar o rádio. Entregas importadas sem assinatura ficam identificadas como dados anteriores à implantação.</div>
  </div><div class="modal-foot"><button type="button" class="button button-outline" onclick="cancelRadioImport()">Cancelar</button><button type="button" class="button button-green" onclick="applyRadioSpreadsheet()">${icon('check')} Confirmar importação</button></div>`, 'modal-large');
};

window.cancelRadioImport = function() {
  if (pendingRadioImport?.input) pendingRadioImport.input.value = '';
  pendingRadioImport = null;
  closeModal();
};

window.applyRadioSpreadsheet = async function() {
  const pending = pendingRadioImport;
  if (!pending) return;
  const changed = [];
  pending.rows.forEach(row => {
    let radio = radioAssets.find(item => normalizeRadioCode(item.code) === row.code || (row.serial && item.serial === row.serial));
    if (!radio) {
      radio = { id: crypto.randomUUID?.() || `radio-${Date.now()}-${changed.length}`, createdAt: new Date().toISOString(), usage: null };
      radioAssets.push(radio);
    }
    radio.code = row.code;
    ['assetNumber','brand','model','serial','channel','acquisitionDate','notes'].forEach(key => {
      if (row[key]) radio[key] = row[key];
    });
    radio.status = row.status || radio.status || 'available';
    radio.usage = row.usage || null;
    radio.importSource = pending.fileName;
    changed.push(radio);
  });
  const importedMovements = [];
  (pending.movements || []).forEach(source => {
    if (radioMovements.some(item => item.importKey === source.importKey)) return;
    const radio = radioAssets.find(item => item.code === source.radioCode);
    if (!radio) return;
    importedMovements.push({
      ...source,
      id: crypto.randomUUID?.() || `radio-mov-${Date.now()}-${importedMovements.length}`,
      radioId: radio.id,
      createdAt: new Date().toISOString()
    });
  });
  radioMovements = [...importedMovements, ...radioMovements].sort((a, b) => radioTimestamp(b) - radioTimestamp(a));
  radioAssets.sort((a, b) => String(a.code).localeCompare(String(b.code), 'pt-BR'));
  radioSaveLocalData();
  const input = pending.input;
  pendingRadioImport = null;
  if (input) input.value = '';
  const assetResults = await Promise.all(changed.map(persistRadioAsset));
  const movementResults = assetResults.every(Boolean) ? await Promise.all(importedMovements.map(persistRadioMovement)) : importedMovements.map(() => false);
  closeModal(); renderRadios();
  const databaseSaved = assetResults.every(Boolean) && movementResults.every(Boolean);
  toast(databaseSaved
    ? `${changed.length} rádio(s) e ${importedMovements.length} movimentação(ões) importados e salvos no banco.`
    : `${changed.length} rádio(s) importados localmente, mas o banco de rádios ainda não está configurado.`, !databaseSaved);
};

function radioExportRows() {
  return radioAssets.map(radio => [
    radio.code || '', radio.assetNumber || '', radio.brand || '', radio.model || '', radio.serial || '', radio.channel || '',
    radioStatusLabel(radio.status), radio.usage?.collaborator || '', radio.usage?.company || '', radio.usage?.location || '',
    radio.usage?.expectedReturn ? new Date(radio.usage.expectedReturn) : '', radio.notes || ''
  ]);
}

window.exportRadiosExcel = async function() {
  if (!radioAssets.length) return toast('Cadastre ou importe ao menos um rádio antes de exportar.', true);
  if (!await ensureExcelLibrary()) return toast('Gerador de Excel indisponível. Verifique a conexão.', true);
  const headers = ['CÓDIGO', 'PATRIMÔNIO', 'MARCA', 'MODELO', 'NÚMERO DE SÉRIE', 'CANAL / FREQUÊNCIA', 'SITUAÇÃO', 'RESPONSÁVEL ATUAL', 'EMPRESA', 'LOCAL / FRENTE', 'PREVISÃO DE DEVOLUÇÃO', 'OBSERVAÇÕES'];
  const sheet = XLSX.utils.aoa_to_sheet([headers, ...radioExportRows()]);
  sheet['!cols'] = [16,16,18,22,23,19,16,28,22,24,22,36].map(wch => ({ wch }));
  sheet['!autofilter'] = { ref: `A1:L${radioAssets.length + 1}` };
  for (let row = 2; row <= radioAssets.length + 1; row++) if (sheet[`K${row}`]?.v) sheet[`K${row}`].z = 'dd/mm/yyyy hh:mm';
  const historyHeaders = ['DATA', 'RÁDIO', 'OPERAÇÃO', 'COLABORADOR', 'EMPRESA', 'LOCAL / CONDIÇÃO', 'RESPONSÁVEL PELO REGISTRO', 'OBSERVAÇÕES'];
  const historyRows = radioMovements.map(item => [
    item.occurredAt ? new Date(item.occurredAt) : '', item.radioCode || radioAssets.find(radio => radio.id === item.radioId)?.code || '',
    item.action === 'checkout' ? 'Entrega' : 'Devolução', item.collaborator || '', item.company || '',
    item.action === 'return' ? (item.condition === 'damaged' ? 'Com avaria' : 'Conforme') : item.location || '',
    item.deliveredBy || item.receivedBy || '', item.notes || ''
  ]);
  const historySheet = XLSX.utils.aoa_to_sheet([historyHeaders, ...historyRows]);
  historySheet['!cols'] = [21,16,15,28,22,26,28,38].map(wch => ({ wch }));
  if (historyRows.length) historySheet['!autofilter'] = { ref: `A1:H${historyRows.length + 1}` };
  for (let row = 2; row <= historyRows.length + 1; row++) if (historySheet[`A${row}`]?.v) historySheet[`A${row}`].z = 'dd/mm/yyyy hh:mm';
  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, sheet, 'Cadastro de rádios');
  XLSX.utils.book_append_sheet(book, historySheet, 'Histórico');
  XLSX.writeFile(book, `controle-radios-${new Date().toISOString().slice(0, 10)}.xlsx`);
  toast(`${radioAssets.length} rádio(s) exportado(s) para Excel.`);
};

window.downloadRadioSpreadsheetTemplate = async function() {
  if (!await ensureExcelLibrary()) return toast('Gerador de Excel indisponível. Verifique a conexão.', true);
  const headers = ['CÓDIGO', 'PATRIMÔNIO', 'MARCA', 'MODELO', 'NÚMERO DE SÉRIE', 'CANAL / FREQUÊNCIA', 'SITUAÇÃO', 'RESPONSÁVEL ATUAL', 'EMPRESA', 'LOCAL / FRENTE', 'PREVISÃO DE DEVOLUÇÃO', 'OBSERVAÇÕES'];
  const example = ['RAD-001', 'PAT-0001', 'Motorola', 'DEP450', 'SERIE-EXEMPLO', 'Canal 03', 'Disponível', '', '', '', '', 'Apagar esta linha antes de preencher'];
  const sheet = XLSX.utils.aoa_to_sheet([headers, example]);
  sheet['!cols'] = [16,16,18,22,23,19,16,28,22,24,22,36].map(wch => ({ wch }));
  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, sheet, 'Rádios');
  XLSX.writeFile(book, 'modelo-importacao-radios.xlsx');
  toast('Modelo de importação baixado.');
};

window.currentRadioTab = window.currentRadioTab || '';

window.setRadioTab = function(status) {
  window.currentRadioTab = status;
  document.querySelectorAll('.radio-tab').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.status === status);
  });
  filterRadios();
};

function renderRadios() {
  radioLoadLocalData();
  
  // Clean garbage locally
  const garbageIds = radioAssets.filter(r => /^\d+\.\s/.test(r.code || '') || (r.code || '').includes('REGISTRE')).map(r => r.id);
  if (garbageIds.length > 0) {
    radioAssets = radioAssets.filter(r => !garbageIds.includes(r.id));
    radioMovements = radioMovements.filter(r => !garbageIds.includes(r.radioId));
    radioSaveLocalData();
  }

  const available = radioAssets.filter(item => item.status !== 'in-use' && item.status !== 'maintenance').length;
  const inUse = radioAssets.filter(item => item.status === 'in-use').length;
  const maintenance = radioAssets.filter(item => item.status === 'maintenance').length;
  const navCount = document.getElementById('navRadioCount');
  if (navCount) navCount.textContent = radioAssets.length;
  const rows = radioAssets.map(radio => `<tr class="radio-row" data-status="${esc(radio.status || 'available')}" data-search="${esc(`${radio.code || ''} ${radio.brand || ''} ${radio.model || ''} ${radio.serial || ''} ${radio.channel || ''} ${radio.usage?.collaborator || ''} ${radio.usage?.location || ''}`.toLocaleLowerCase('pt-BR'))}">
    <td><strong class="document-number">${esc(radio.code)}</strong><small class="table-sub">${esc(radio.brand || 'Marca não informada')} ${esc(radio.model || '')}</small></td>
    <td><strong>${esc(radio.serial || '—')}</strong><small class="table-sub">Patrimônio: ${esc(radio.assetNumber || '—')}</small></td>
    <td>${esc(radio.channel || '—')}</td>
    <td>${radioStatusBadge(radio.status || 'available')}</td>
    <td>${radio.usage ? `<strong>${esc(radio.usage.collaborator)}</strong><small class="table-sub">${esc(radio.usage.location || 'Local não informado')}</small>` : '<span class="table-muted">Almoxarifado</span>'}</td>
    <td>${radio.usage?.expectedReturn ? fullDate(radio.usage.expectedReturn) : '—'}</td>
    <td><div class="entry-row-actions"><button class="table-action" onclick="openRadioDetails('${esc(radio.id)}')">${icon('file')} Abrir</button>${radio.status === 'in-use' ? `<button class="table-action" onclick="openRadioReturnModal('${esc(radio.id)}')">${icon('return')} Devolver</button>` : radio.status !== 'maintenance' ? `<button class="table-action" onclick="openRadioCheckoutModal('${esc(radio.id)}')">${icon('arrow')} Entregar</button>` : ''}<button class="table-action action-danger" onclick="deleteRadioAsset('${esc(radio.id)}')" title="Excluir">${icon('trash')}</button></div></td>
  </tr>`).join('');

  document.getElementById('app').innerHTML = `
    <style>
      .radio-tabs-nav {
        display: flex;
        gap: 16px;
        border-bottom: 1px solid var(--border, #e2e8f0);
        margin-bottom: 24px;
        overflow-x: auto;
      }
      .radio-tab {
        background: none;
        border: none;
        padding: 12px 4px;
        font-size: 14px;
        font-weight: 600;
        color: var(--muted, #64748b);
        cursor: pointer;
        border-bottom: 2px solid transparent;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        gap: 8px;
        white-space: nowrap;
      }
      .radio-tab:hover {
        color: var(--text, #1e293b);
      }
      .radio-tab.active {
        color: var(--primary, #0f172a);
        border-bottom-color: var(--primary, #0f172a);
      }
      .radio-tab-badge {
        background: var(--border, #e2e8f0);
        padding: 2px 8px;
        border-radius: 12px;
        font-size: 12px;
        color: var(--text, #1e293b);
        font-weight: 700;
      }
      .radio-tab.active .radio-tab-badge {
        background: var(--primary, #0f172a);
        color: #fff;
      }
    </style>
    ${pageHeader('Controle de rádios', 'Cadastre os comunicadores e acompanhe cada entrega assinada, devolução e indisponibilidade.', 'COMUNICAÇÃO · ALMOXARIFADO', `<button class="button button-outline" onclick="downloadRadioSpreadsheetTemplate()">${icon('file')} Baixar modelo</button><label class="button button-outline radio-import-button">${icon('download')} Importar planilha<input type="file" accept=".xlsx,.xls,.xlsm,.csv" hidden onchange="handleRadioSpreadsheet(event)"></label><button class="button button-outline" onclick="exportRadiosExcel()">${icon('download')} Exportar Excel</button><button class="button button-outline" onclick="openRadioHistoryReport()">${icon('print')} Histórico</button><button class="button button-green" onclick="openRadioAssetModal()">${icon('plus')} Cadastrar rádio</button>`)}
    
    <div class="radio-tabs-nav">
      <button class="radio-tab ${window.currentRadioTab === '' ? 'active' : ''}" data-status="" onclick="setRadioTab('')">Todos os cadastrados <span class="radio-tab-badge">${radioAssets.length}</span></button>
      <button class="radio-tab ${window.currentRadioTab === 'in-use' ? 'active' : ''}" data-status="in-use" onclick="setRadioTab('in-use')">Distribuídos (em uso) <span class="radio-tab-badge">${inUse}</span></button>
      <button class="radio-tab ${window.currentRadioTab === 'available' ? 'active' : ''}" data-status="available" onclick="setRadioTab('available')">No almoxarifado <span class="radio-tab-badge">${available}</span></button>
    </div>

    <section class="packing-filters radio-filters" style="margin-top: 0;">
      <label class="search-box" style="flex: 1; max-width: 100%;">${icon('search')}<input id="radioSearch" type="search" placeholder="Buscar código, série, patrimônio ou responsável..." oninput="filterRadios()"></label>
    </section>
    <article class="panel inventory-panel radio-panel">
      <div class="table-wrap"><table class="data-table"><thead><tr><th>Rádio</th><th>Série / patrimônio</th><th>Canal</th><th>Situação</th><th>Responsável atual</th><th>Previsão de retorno</th><th></th></tr></thead><tbody>${rows || '<tr><td colspan="7" class="unified-output-empty">Nenhum rádio cadastrado.</td></tr>'}</tbody></table></div>
      <div class="no-filter-results" id="noRadioResults">Nenhum rádio encontrado com estes filtros.</div>
    </article>`;
  hydrateIcons();
  filterRadios();
}

window.filterRadios = function() {
  const search = (document.getElementById('radioSearch')?.value || '').trim().toLocaleLowerCase('pt-BR');
  const status = window.currentRadioTab || '';
  let visible = 0;
  document.querySelectorAll('.radio-row').forEach(row => {
    const show = (!search || row.dataset.search.includes(search)) && (!status || row.dataset.status === status);
    row.style.display = show ? '' : 'none';
    if (show) visible++;
  });
  const empty = document.getElementById('noRadioResults');
  if (empty) empty.style.display = document.querySelectorAll('.radio-row').length && !visible ? 'block' : 'none';
};

window.openRadioAssetModal = function(id = '') {
  const radio = radioAssets.find(item => String(item.id) === String(id)) || {};
  modal(`<form onsubmit="submitRadioAsset(event, '${esc(id)}')">${modalHead(id ? 'Editar rádio' : 'Cadastrar rádio', 'Identificação do comunicador no controle da obra')}
    <div class="modal-body"><div class="form-grid">
      <div class="field"><label>Código de controle <em>*</em></label><input name="code" required value="${esc(radio.code || '')}" placeholder="Ex.: RAD-001"></div>
      <div class="field"><label>Patrimônio</label><input name="assetNumber" value="${esc(radio.assetNumber || '')}" placeholder="Etiqueta patrimonial"></div>
      <div class="field"><label>Marca</label><input name="brand" value="${esc(radio.brand || '')}" placeholder="Ex.: Motorola"></div>
      <div class="field"><label>Modelo</label><input name="model" value="${esc(radio.model || '')}" placeholder="Ex.: DEP450"></div>
      <div class="field"><label>Número de série</label><input name="serial" value="${esc(radio.serial || '')}"></div>
      <div class="field"><label>Canal / frequência</label><input name="channel" value="${esc(radio.channel || '')}" placeholder="Ex.: Canal 03"></div>
      <div class="field"><label>Situação <em>*</em></label><select name="status" required ${radio.status === 'in-use' ? 'disabled' : ''}><option value="available" ${(radio.status || 'available') === 'available' ? 'selected' : ''}>Disponível</option><option value="maintenance" ${radio.status === 'maintenance' ? 'selected' : ''}>Manutenção</option>${radio.status === 'in-use' ? '<option value="in-use" selected>Em uso</option>' : ''}</select></div>
      <div class="field full"><label>Observações</label><textarea name="notes" placeholder="Acessórios, condição, carregador ou outras informações...">${esc(radio.notes || '')}</textarea></div>
    </div></div>
    <div class="modal-foot"><button type="button" class="button button-outline" onclick="closeModal()">Cancelar</button><button class="button button-green">${icon('check')} Salvar rádio</button></div></form>`, 'modal-inspection');
};

window.submitRadioAsset = async function(event, id = '') {
  event.preventDefault();
  const data = new FormData(event.target);
  const code = String(data.get('code') || '').trim().toUpperCase();
  if (radioAssets.some(item => item.code === code && String(item.id) !== String(id))) return toast('Já existe um rádio com esse código.', true);
  let radio = radioAssets.find(item => String(item.id) === String(id));
  if (!radio) {
    radio = { id: crypto.randomUUID?.() || `radio-${Date.now()}`, createdAt: new Date().toISOString(), usage: null };
    radioAssets.push(radio);
  }
  Object.assign(radio, {
    code,
    assetNumber: String(data.get('assetNumber') || '').trim(),
    brand: String(data.get('brand') || '').trim(),
    model: String(data.get('model') || '').trim(),
    serial: String(data.get('serial') || '').trim(),
    channel: String(data.get('channel') || '').trim(),
    status: radio.status === 'in-use' ? 'in-use' : data.get('status'),
    notes: String(data.get('notes') || '').trim()
  });
  radioAssets.sort((a, b) => String(a.code).localeCompare(String(b.code), 'pt-BR'));
  const synced = await persistRadioAsset(radio);
  closeModal(); renderRadios();
  toast(synced ? 'Rádio salvo e sincronizado.' : 'Rádio salvo neste aparelho.');
};

window.openRadioCheckoutModal = function(id) {
  const radio = radioAssets.find(item => String(item.id) === String(id));
  if (!radio || radio.status !== 'available') return toast('Este rádio não está disponível para entrega.', true);
  modal(`<form onsubmit="submitRadioCheckout(event, '${esc(id)}')">${modalHead(`Entregar ${esc(radio.code)}`, 'A assinatura do recebedor é obrigatória em cada entrega')}
    <div class="modal-body"><datalist id="radioPeopleList">${radioPeopleOptions()}</datalist>
      <div class="form-grid">
        <div class="field"><label>Colaborador <em>*</em></label><input name="collaborator" list="radioPeopleList" required placeholder="Selecione ou digite o nome"></div>
        <div class="field"><label>Empresa</label><input name="company" placeholder="Empresa do colaborador"></div>
        <div class="field"><label>Local / frente de serviço <em>*</em></label><input name="location" required placeholder="Ex.: Data Hall 04"></div>
        <div class="field"><label>Previsão de devolução</label><input name="expectedReturn" type="datetime-local"></div>
        <div class="field full"><label>Observações</label><textarea name="notes" placeholder="Condição, carregador, bateria ou acessórios entregues..."></textarea></div>
        <label class="operator-sign-field"><span>Assinatura de quem recebeu <em>*</em></span><input type="hidden" name="operatorSign" id="operatorSignInput" data-signature-label="Recebedor do rádio"><div id="signPreviewContainer" class="sign-preview-box" onclick="openSignatureModal()"><span class="sign-placeholder-text">✍️ Clique para assinar a entrega</span></div></label>
      </div>
    </div><div class="modal-foot"><button type="button" class="button button-outline" onclick="closeModal()">Cancelar</button><button class="button button-green">${icon('check')} Confirmar entrega</button></div></form>`, 'modal-inspection');
};

window.submitRadioCheckout = async function(event, id) {
  event.preventDefault();
  const radio = radioAssets.find(item => String(item.id) === String(id));
  if (!radio || radio.status !== 'available') return toast('Este rádio não está mais disponível.', true);
  const data = new FormData(event.target);
  const signature = data.get('operatorSign');
  if (!signature) {
    toast('Registre a assinatura de quem recebeu o rádio.', true);
    return openSignatureModal();
  }
  const occurredAt = new Date().toISOString();
  const usage = {
    collaborator: String(data.get('collaborator') || '').trim(),
    company: String(data.get('company') || '').trim(),
    location: String(data.get('location') || '').trim(),
    expectedReturn: data.get('expectedReturn') || '',
    notes: String(data.get('notes') || '').trim(),
    signature,
    deliveredBy: currentUser?.name || 'Almoxarifado',
    checkoutAt: occurredAt
  };
  radio.status = 'in-use';
  radio.usage = usage;
  const movement = { id: crypto.randomUUID?.() || `radio-mov-${Date.now()}`, radioId: radio.id, radioCode: radio.code, action: 'checkout', occurredAt, ...usage, createdAt: occurredAt };
  radioMovements.unshift(movement);
  radioSaveLocalData();
  const [assetSynced, movementSynced] = await Promise.all([persistRadioAsset(radio), persistRadioMovement(movement)]);
  closeModal(); renderRadios();
  toast(assetSynced && movementSynced ? 'Rádio entregue com assinatura e sincronizado.' : 'Rádio entregue e salvo neste aparelho.');
};

window.openRadioReturnModal = function(id) {
  const radio = radioAssets.find(item => String(item.id) === String(id));
  if (!radio || radio.status !== 'in-use') return toast('Este rádio não possui entrega em aberto.', true);
  modal(`<form onsubmit="submitRadioReturn(event, '${esc(id)}')">${modalHead(`Devolver ${esc(radio.code)}`, `Em posse de ${esc(radio.usage?.collaborator || 'colaborador')}`)}
    <div class="modal-body"><div class="form-grid">
      <div class="field"><label>Condição na devolução <em>*</em></label><select name="condition" required><option value="ok">Conforme / disponível</option><option value="damaged">Com avaria / manutenção</option></select></div>
      <div class="field full"><label>Observações</label><textarea name="notes" placeholder="Registre avarias, falta de acessórios ou condição da bateria..."></textarea></div>
    </div></div><div class="modal-foot"><button type="button" class="button button-outline" onclick="closeModal()">Cancelar</button><button class="button button-green">${icon('return')} Confirmar devolução</button></div></form>`, 'modal-small');
};

window.submitRadioReturn = async function(event, id) {
  event.preventDefault();
  const radio = radioAssets.find(item => String(item.id) === String(id));
  if (!radio || radio.status !== 'in-use') return toast('Esta entrega já foi encerrada.', true);
  const data = new FormData(event.target);
  const condition = data.get('condition');
  const occurredAt = new Date().toISOString();
  const movement = {
    id: crypto.randomUUID?.() || `radio-mov-${Date.now()}`,
    radioId: radio.id,
    radioCode: radio.code,
    action: 'return',
    occurredAt,
    collaborator: radio.usage?.collaborator || '',
    company: radio.usage?.company || '',
    condition,
    notes: String(data.get('notes') || '').trim(),
    receivedBy: currentUser?.name || 'Almoxarifado',
    checkoutMovementId: radioMovements.find(item => item.radioId === radio.id && item.action === 'checkout' && !item.returnedAt)?.id || '',
    createdAt: occurredAt
  };
  const checkout = radioMovements.find(item => item.id === movement.checkoutMovementId);
  if (checkout) checkout.returnedAt = occurredAt;
  radio.status = condition === 'damaged' ? 'maintenance' : 'available';
  radio.usage = null;
  radioMovements.unshift(movement);
  radioSaveLocalData();
  const operations = [persistRadioAsset(radio), persistRadioMovement(movement)];
  if (checkout) operations.push(persistRadioMovement(checkout));
  await Promise.all(operations);
  closeModal(); renderRadios();
  toast(condition === 'damaged' ? 'Devolução registrada e rádio enviado para manutenção.' : 'Devolução registrada; rádio disponível.');
};

function printableRadioReceipt(movement, radio) {
  return `<article class="packing-document radio-receipt">
    <header class="packing-document-head"><div class="report-logos"><img src="assets/heating-cooling-logo.jpg" alt="Heating Cooling"><img src="assets/afonso-franca-logo.png" alt="Afonso França Engenharia"></div><div><small>CONTROLE DE RÁDIOS · DC01</small><h1>TERMO DE ENTREGA DE RÁDIO</h1><p>Comprovante individual de responsabilidade e recebimento</p></div><aside><strong>${esc(radio?.code || movement.radioCode)}</strong><span class="status in-use">Entregue</span></aside></header>
    <section class="packing-document-meta"><span><small>Data da entrega</small><strong>${fullDate(movement.occurredAt)}</strong></span><span><small>Recebedor</small><strong>${esc(movement.collaborator)}</strong></span><span><small>Empresa</small><strong>${esc(movement.company || '—')}</strong></span><span><small>Local</small><strong>${esc(movement.location || '—')}</strong></span><span><small>Marca / modelo</small><strong>${esc([radio?.brand, radio?.model].filter(Boolean).join(' ') || '—')}</strong></span><span><small>Série</small><strong>${esc(radio?.serial || '—')}</strong></span><span><small>Patrimônio</small><strong>${esc(radio?.assetNumber || '—')}</strong></span><span><small>Canal</small><strong>${esc(radio?.channel || '—')}</strong></span></section>
    <div class="packing-document-notes"><strong>Termo de responsabilidade</strong><p>Declaro que recebi o rádio acima identificado e me responsabilizo por sua guarda, conservação e devolução ao almoxarifado nas mesmas condições, ressalvado o desgaste normal de uso.</p>${movement.notes ? `<p><strong>Observações:</strong> ${esc(movement.notes)}</p>` : ''}</div>
    <section class="packing-signatures radio-signatures"><span>${movement.signature ? `<img src="${esc(movement.signature)}" alt="Assinatura do recebedor">` : '<br><br>________________________________'}<br>${esc(movement.collaborator || 'Recebedor')}<small>Responsável pelo rádio</small></span><span><br><br>________________________________<br>${esc(movement.deliveredBy || 'Almoxarifado')}<small>Responsável pela entrega</small></span></section>
    <footer class="report-footer">Documento gerado pelo ObraFlow · Gestão HVAC · ${fullDate(new Date().toISOString())}</footer>
  </article>`;
}

window.openRadioReceipt = function(movementId) {
  const movement = radioMovements.find(item => String(item.id) === String(movementId));
  if (!movement || movement.action !== 'checkout') return toast('Comprovante de entrega não encontrado.', true);
  const radio = radioAssets.find(item => String(item.id) === String(movement.radioId));
  modal(`${modalHead(`Entrega ${esc(movement.radioCode || radio?.code || '')}`, `${esc(movement.collaborator)} · ${fullDate(movement.occurredAt)}`)}<div class="modal-body report-preview">${printableRadioReceipt(movement, radio)}</div><div class="modal-foot"><button class="button button-outline" onclick="closeModal()">Fechar</button><button class="button button-dark" onclick="window.print()">${icon('print')} Imprimir / salvar PDF</button></div>`, 'modal-paper');
  document.querySelector('.modal-backdrop')?.classList.add('print-area', 'packing-slip-print-area');
};

window.openRadioDetails = function(id) {
  const radio = radioAssets.find(item => String(item.id) === String(id));
  if (!radio) return toast('Rádio não encontrado.', true);
  const movements = radioMovements.filter(item => String(item.radioId) === String(id));
  const rows = movements.map(item => `<tr><td>${fullDate(item.occurredAt)}</td><td><span class="document-type ${item.action === 'checkout' ? 'formal' : 'simple'}">${item.action === 'checkout' ? 'Entrega' : 'Devolução'}</span></td><td>${esc(item.collaborator || '—')}</td><td>${item.action === 'return' ? (item.condition === 'damaged' ? 'Com avaria' : 'Conforme') : esc(item.location || '—')}</td><td>${item.action === 'checkout' ? `<button class="table-action" onclick="openRadioReceipt('${esc(item.id)}')">${icon('print')} Comprovante</button>` : ''}</td></tr>`).join('');
  modal(`${modalHead(`${esc(radio.code)} · ${esc([radio.brand, radio.model].filter(Boolean).join(' ') || 'Rádio')}`, `Série ${esc(radio.serial || 'não informada')} · ${radioStatusLabel(radio.status)}`)}<div class="modal-body">
    ${radio.usage ? `<section class="public-use-card"><h3>Entrega atual</h3><div class="public-use-grid"><span><small>Responsável</small><strong>${esc(radio.usage.collaborator)}</strong><em>${esc(radio.usage.company || '')}</em></span><span><small>Local</small><strong>${esc(radio.usage.location)}</strong></span><span><small>Entregue em</small><strong>${fullDate(radio.usage.checkoutAt)}</strong></span><span><small>Previsão de retorno</small><strong>${radio.usage.expectedReturn ? fullDate(radio.usage.expectedReturn) : 'Não informada'}</strong></span></div></section>` : ''}
    <div class="public-specs radio-specs"><span><small>Patrimônio</small><strong>${esc(radio.assetNumber || '—')}</strong></span><span><small>Canal</small><strong>${esc(radio.channel || '—')}</strong></span><span><small>Situação</small><strong>${radioStatusLabel(radio.status)}</strong></span><span><small>Observações</small><strong>${esc(radio.notes || '—')}</strong></span></div>
    <div class="section-title"><span>${icon('swap')}</span><div><h3>Histórico do rádio</h3><small>${movements.length} movimentação(ões)</small></div></div>
    <div class="table-wrap"><table class="data-table"><thead><tr><th>Data</th><th>Operação</th><th>Colaborador</th><th>Local / condição</th><th></th></tr></thead><tbody>${rows || '<tr><td colspan="5">Nenhuma movimentação registrada.</td></tr>'}</tbody></table></div>
  </div><div class="modal-foot"><button class="button button-outline" onclick="closeModal()">Fechar</button><button class="button button-outline" onclick="openRadioAssetModal('${esc(id)}')">${icon('edit')} Editar</button>${radio.status === 'in-use' ? `<button class="button button-green" onclick="openRadioReturnModal('${esc(id)}')">${icon('return')} Registrar devolução</button>` : radio.status === 'available' ? `<button class="button button-green" onclick="openRadioCheckoutModal('${esc(id)}')">${icon('arrow')} Entregar rádio</button>` : ''}</div>`, 'modal-large');
};

window.openRadioHistoryReport = function() {
  const rows = radioMovements.map(item => [
    fullDate(item.occurredAt),
    item.radioCode || radioAssets.find(radio => radio.id === item.radioId)?.code || '—',
    item.action === 'checkout' ? 'Entrega' : 'Devolução',
    item.collaborator || '—',
    item.action === 'return' ? (item.condition === 'damaged' ? 'Com avaria' : 'Conforme') : item.location || '—'
  ]);
  const content = `<section class="report-section"><h2>Movimentações de rádios</h2>${reportTable(['Data', 'Rádio', 'Operação', 'Colaborador', 'Local / condição'], rows, 'Nenhuma movimentação registrada.')}</section>`;
  modal(`${modalHead('Histórico de rádios', `${rows.length} movimentação(ões) registrada(s)`)}<div class="modal-body report-preview">${reportDocument('Controle de rádios', 'Entregas e devoluções dos comunicadores da obra', content, `<span><b>${radioAssets.length}</b> rádios</span><span><b>${rows.length}</b> movimentações</span>`)}</div><div class="modal-foot"><button class="button button-outline" onclick="closeModal()">Fechar</button><button class="button button-dark" onclick="window.print()">${icon('print')} Imprimir / salvar PDF</button></div>`, 'modal-paper');
  document.querySelector('.modal-backdrop')?.classList.add('print-area', 'report-print-area');
};

radioLoadLocalData();
