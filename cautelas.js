let cautelasList = [];

async function fetchCautelas() {
  try {
    const client = await waitForSupabaseClient();
    if (!client) return;
    const { data, error } = await client.from('employee_checkouts').select('*').order('checkout_date', { ascending: false });
    if (error) throw error;
    cautelasList = data || [];
  } catch (err) {
    console.error('Erro ao buscar saídas de ferramentas e EPIs:', err);
  }
}

async function saveCautela(cautelaData) {
  try {
    const client = await waitForSupabaseClient();
    if (!client) throw new Error('Supabase não disponível');
    const { error } = await client.from('employee_checkouts').insert([cautelaData]);
    if (error) throw error;
    await fetchCautelas();
    renderCautelas();
    toast('Saída registrada com sucesso!');
  } catch (err) {
    console.error(err);
    toast('Erro ao registrar a saída.', true);
  }
}

function cautelaTypeLabel(type) {
  return ({ TOOL: 'Ferramenta', EPI: 'EPI', OTHER: 'Outro item' })[type] || 'Outro item';
}

function cautelaReceipt(checkout) {
  return `<article class="packing-document checkout-receipt">
    <header class="packing-document-head"><div class="report-logos"><img src="assets/heating-cooling-logo.jpg" alt="Heating Cooling"><img src="assets/afonso-franca-logo.png" alt="Afonso França Engenharia"></div><div><small>ALMOXARIFADO · DC01</small><h1>COMPROVANTE DE ENTREGA</h1><p>${esc(cautelaTypeLabel(String(checkout.checkout_type || 'OTHER').toUpperCase()))} entregue ao colaborador</p></div><aside><strong>${esc(String(checkout.id || '').slice(0, 8).toUpperCase())}</strong><span class="status in-use">Entregue</span></aside></header>
    <section class="packing-document-meta"><span><small>Data da entrega</small><strong>${fullDate(checkout.checkout_date || checkout.created_at)}</strong></span><span><small>Colaborador</small><strong>${esc(checkout.collaborator_name)}</strong></span><span><small>Tipo</small><strong>${esc(cautelaTypeLabel(String(checkout.checkout_type || 'OTHER').toUpperCase()))}</strong></span><span><small>Quantidade</small><strong>${materialQuantity(checkout.quantity || 1)} UN</strong></span></section>
    <table class="packing-document-table"><thead><tr><th>Item</th><th>Descrição</th><th>Quantidade</th><th>Controle</th></tr></thead><tbody><tr><td>1</td><td>${esc(checkout.item_description)}</td><td>${materialQuantity(checkout.quantity || 1)} UN</td><td>${esc(checkoutStatusLabel(checkout.status))}</td></tr></tbody></table>
    ${checkout.notes ? `<div class="packing-document-notes"><strong>Observações</strong><p>${esc(checkout.notes)}</p></div>` : ''}
    <section class="packing-signatures checkout-signatures"><span>${checkout.signature_url ? `<img src="${esc(checkout.signature_url)}" alt="Assinatura do colaborador">` : '<br><br>________________________________'}<br>${esc(checkout.collaborator_name)}<small>Recebedor</small></span><span><br><br>________________________________<br>Responsável do almoxarifado<small>Entrega</small></span></section>
    <footer class="report-footer">Documento gerado pelo ObraFlow · Gestão HVAC · ${fullDate(new Date().toISOString())}</footer>
  </article>`;
}

window.openCautelaReceipt = function(id) {
  const checkout = cautelasList.find(item => String(item.id) === String(id));
  if (!checkout) return toast('Entrega não encontrada.', true);
  modal(`${modalHead('Comprovante de entrega', `${esc(checkout.collaborator_name)} · ${esc(checkout.item_description)}`)}<div class="modal-body report-preview">${cautelaReceipt(checkout)}</div><div class="modal-foot"><button class="button button-outline" onclick="closeModal()">Fechar</button><button class="button button-dark" onclick="window.print()">${icon('print')} Imprimir / salvar PDF</button></div>`, 'modal-paper');
  document.querySelector('.modal-backdrop')?.classList.add('print-area', 'packing-slip-print-area');
};

function checkoutStatusLabel(status) {
  return ({
    PENDING_RETURN: 'Devolução pendente',
    RETURNED: 'Devolvido',
    NO_RETURN_NEEDED: 'Sem devolução'
  })[status] || 'Registrado';
}

function unifiedOutputRecords() {
  const materialRecords = (typeof packingSlips !== 'undefined' ? packingSlips : []).map(slip => {
    const items = Array.isArray(slip.items) ? slip.items : [];
    const itemsHtml = items.length
      ? items.slice(0, 2).map(item => `<span class="unified-output-item"><strong>${esc(item.description || item.code || 'Material')}</strong><small>${materialQuantity(item.quantity)} ${esc(item.unit || 'UN')}</small></span>`).join('')
      : '<span class="unified-output-item"><strong>Material não informado</strong></span>';
    const extra = items.length > 2 ? `<small class="table-sub">+ ${items.length - 2} item(ns)</small>` : '';
    const type = slip.recordType === 'packing_slip' ? 'packing_slip' : 'material';
    return {
      id: `material-${slip.id}`,
      sourceId: slip.id,
      date: slip.issuedAt || slip.createdAt,
      type,
      typeLabel: type === 'packing_slip' ? 'Romaneio' : 'Material',
      person: slip.requestedBy || 'Não informado',
      secondary: slip.sentBy ? `Registrado por ${slip.sentBy}` : '',
      itemHtml: `${itemsHtml}${extra}`,
      destination: slip.destination || 'Não informado',
      status: slip.status || 'sent',
      statusLabel: slip.status === 'received' ? 'Recebido' : slip.status === 'divergence' ? 'Divergência' : 'Saída registrada',
      search: `${slip.number || ''} ${slip.requestedBy || ''} ${slip.sentBy || ''} ${slip.destination || ''} ${items.map(item => `${item.code || ''} ${item.description || ''}`).join(' ')}`,
      action: `<button class="table-action" onclick="openPackingSlipRecord('${esc(slip.id)}')">${icon('file')} Abrir</button>`
    };
  });

  const checkoutRecords = cautelasList.map(checkout => ({
    id: `checkout-${checkout.id}`,
    sourceId: checkout.id,
    date: checkout.checkout_date || checkout.created_at,
    type: String(checkout.checkout_type || 'OTHER').toUpperCase(),
    typeLabel: cautelaTypeLabel(String(checkout.checkout_type || 'OTHER').toUpperCase()),
    person: checkout.collaborator_name || 'Não informado',
    secondary: '',
    itemHtml: `<span class="unified-output-item"><strong>${esc(checkout.item_description || 'Item não informado')}</strong><small>${materialQuantity(checkout.quantity || 1)} UN</small></span>`,
    destination: checkout.status === 'PENDING_RETURN' ? 'Retorno ao almoxarifado' : 'Entrega ao colaborador',
    status: checkout.status,
    statusLabel: checkoutStatusLabel(checkout.status),
    search: `${checkout.collaborator_name || ''} ${checkout.item_description || ''} ${cautelaTypeLabel(checkout.checkout_type)}`,
    action: `<button onclick="openCautelaReceipt('${esc(checkout.id)}')" class="table-action">${icon('print')} Comprovante</button>${checkout.status === 'PENDING_RETURN' ? `<button onclick="returnCautela('${esc(checkout.id)}')" class="table-action">${icon('return')} Registrar devolução</button>` : ''}`
  }));

  return [...materialRecords, ...checkoutRecords]
    .sort((a, b) => (Date.parse(b.date || '') || 0) - (Date.parse(a.date || '') || 0));
}

async function renderCautelas() {
  const app = document.getElementById('app');
  app.innerHTML = '<div style="padding: 20px;">Carregando saídas...</div>';
  await fetchCautelas();

  const records = unifiedOutputRecords();
  const pending = cautelasList.filter(item => item.status === 'PENDING_RETURN').length;
  const materialCount = records.filter(item => ['material', 'packing_slip'].includes(item.type)).length;
  const navCount = document.getElementById('navCautelasCount');
  if (navCount) navCount.textContent = records.length;

  const rows = records.map(record => {
    const statusClass = record.status === 'RETURNED' || record.status === 'received'
      ? 'available'
      : record.status === 'PENDING_RETURN' || record.status === 'divergence'
        ? 'maintenance'
        : 'in-use';
    const typeClass = record.type === 'packing_slip' ? 'formal' : record.type === 'material' ? 'simple' : 'checkout';
    return `<tr class="unified-output-row" data-type="${esc(record.type)}" data-status="${esc(record.status)}" data-search="${esc(record.search.toLocaleLowerCase('pt-BR'))}">
      <td><strong>${record.date ? fullDate(record.date) : '—'}</strong></td>
      <td><span class="document-type ${typeClass}">${esc(record.typeLabel)}</span></td>
      <td><strong>${esc(record.person)}</strong>${record.secondary ? `<small class="table-sub">${esc(record.secondary)}</small>` : ''}</td>
      <td><div class="unified-output-items">${record.itemHtml}</div></td>
      <td>${esc(record.destination)}</td>
      <td><span class="status ${statusClass}">${esc(record.statusLabel)}</span></td>
      <td><div class="entry-row-actions">${record.action}</div></td>
    </tr>`;
  }).join('');

  app.innerHTML = `
    ${pageHeader('Saídas e cautelas', 'Materiais, romaneios, ferramentas e EPIs em uma única consulta.', 'MATERIAIS E SAÍDAS · ALMOXARIFADO', `<button class="button button-green" onclick="openUnifiedOutputMenu()">${icon('plus')} Nova saída</button>`)}
    ${typeof materialModuleTabs === 'function' ? materialModuleTabs('saidas') : ''}
    <section class="metrics-grid material-metrics unified-output-metrics">
      ${metric('TOTAL DE SAÍDAS', records.length, 'registros consolidados', 'blue', 'swap', 100)}
      ${metric('MATERIAIS', materialCount, 'saídas e romaneios', 'green', 'pallet', records.length ? materialCount / records.length * 100 : 0)}
      ${metric('FERRAMENTAS E EPIs', cautelasList.length, 'entregas registradas', 'amber', 'tool', records.length ? cautelasList.length / records.length * 100 : 0)}
      ${metric('DEVOLUÇÕES PENDENTES', pending, 'itens ainda em posse', pending ? 'red' : 'green', pending ? 100 : 0)}
    </section>
    <section class="packing-filters unified-output-filters">
      <label class="search-box">${icon('search')}<input id="unifiedOutputSearch" type="search" placeholder="Buscar item, pessoa, destino ou documento..." oninput="filterUnifiedOutputs()"></label>
      <label class="filter-field"><span>Tipo de saída</span><select id="unifiedOutputType" onchange="filterUnifiedOutputs()"><option value="">Todos os tipos</option><option value="material">Material</option><option value="packing_slip">Romaneio</option><option value="TOOL">Ferramenta</option><option value="EPI">EPI</option><option value="OTHER">Outro item</option></select></label>
      <label class="filter-field"><span>Situação</span><select id="unifiedOutputStatus" onchange="filterUnifiedOutputs()"><option value="">Todas</option><option value="PENDING_RETURN">Devolução pendente</option><option value="RETURNED">Devolvido</option><option value="NO_RETURN_NEEDED">Sem devolução</option><option value="sent">Saída registrada</option></select></label>
    </section>
    <article class="panel inventory-panel unified-output-panel">
      <div class="table-wrap"><table class="data-table unified-output-table"><thead><tr><th>Data</th><th>Tipo</th><th>Colaborador / recebedor</th><th>Item(ns)</th><th>Destino / controle</th><th>Situação</th><th></th></tr></thead><tbody>${rows || '<tr><td colspan="7" class="unified-output-empty">Nenhuma saída registrada.</td></tr>'}</tbody></table></div>
      <div class="no-filter-results" id="noUnifiedOutputResults">Nenhuma saída encontrada com esses filtros.</div>
    </article>`;

  hydrateIcons();
}

window.filterUnifiedOutputs = function() {
  const search = (document.getElementById('unifiedOutputSearch')?.value || '').trim().toLocaleLowerCase('pt-BR');
  const type = document.getElementById('unifiedOutputType')?.value || '';
  const status = document.getElementById('unifiedOutputStatus')?.value || '';
  let visible = 0;
  document.querySelectorAll('.unified-output-row').forEach(row => {
    const show = (!search || row.dataset.search.includes(search))
      && (!type || row.dataset.type === type)
      && (!status || row.dataset.status === status);
    row.style.display = show ? '' : 'none';
    if (show) visible++;
  });
  const empty = document.getElementById('noUnifiedOutputResults');
  if (empty) empty.style.display = document.querySelectorAll('.unified-output-row').length && !visible ? 'block' : 'none';
};

window.openUnifiedOutputMenu = function() {
  modal(`${modalHead('Nova saída', 'Escolha o tipo de saída que deseja registrar')}
    <div class="modal-body">
      <section class="output-type-grid">
        <button type="button" class="material-method-card" onclick="openMaterialActionMenu('output', 'cautelas')"><span>${icon('pallet')}</span><div><strong>Material</strong><small>Retirada rápida de materiais, com baixa no estoque.</small></div><b>${icon('arrow')}</b></button>
        <button type="button" class="material-method-card formal-output" onclick="openMaterialActionMenu('packing_slip', 'cautelas')"><span>${icon('truck')}</span><div><strong>Romaneio</strong><small>Saída formal com transporte, assinatura, foto e impressão.</small></div><b>${icon('arrow')}</b></button>
        <button type="button" class="material-method-card tool-output" onclick="openNewCautelaModal('TOOL')"><span>${icon('tool')}</span><div><strong>Ferramenta</strong><small>Entrega controlada, normalmente com devolução obrigatória.</small></div><b>${icon('arrow')}</b></button>
        <button type="button" class="material-method-card epi-output" onclick="openNewCautelaModal('EPI')"><span>${icon('shield')}</span><div><strong>EPI</strong><small>Entrega ao colaborador, normalmente sem devolução.</small></div><b>${icon('arrow')}</b></button>
      </section>
    </div>
    <div class="modal-foot"><button class="button button-outline" onclick="closeModal()">Cancelar</button></div>`, 'modal-small');
};

function cautelaPeopleOptions() {
  const people = typeof workforce !== 'undefined' && Array.isArray(workforce) ? workforce : [];
  return [...new Map(people.filter(person => person?.name).map(person => [String(person.name).trim().toLocaleUpperCase('pt-BR'), person])).values()]
    .sort((a, b) => String(a.name).localeCompare(String(b.name), 'pt-BR'))
    .map(person => `<option value="${esc(person.name)}">${person.company ? esc(person.company) : ''}</option>`).join('');
}

window.openNewCautelaModal = function(type = 'TOOL') {
  const normalizedType = ['TOOL', 'EPI', 'OTHER'].includes(type) ? type : 'TOOL';
  const defaultStatus = normalizedType === 'EPI' ? 'NO_RETURN_NEEDED' : 'PENDING_RETURN';
  const modalHtml = `
    <form onsubmit="submitNovaCautela(event)">
      ${modalHead('Registrar saída', 'Toda entrega de ferramenta ou EPI exige a assinatura do recebedor')}
      <div class="modal-body">
        <datalist id="cautelaPeopleList">${cautelaPeopleOptions()}</datalist>
        <div class="section-title"><span>${icon('tool')}</span><div><h3>Tipo e responsável</h3><small>Selecione o tipo da saída e quem está recebendo</small></div></div>
        <div class="form-grid">
          <div class="field"><label>Tipo da saída <em>*</em></label><select id="cType" name="checkoutType" required onchange="suggestCautelaReturn(this.value)"><option value="TOOL" ${normalizedType === 'TOOL' ? 'selected' : ''}>Ferramenta</option><option value="EPI" ${normalizedType === 'EPI' ? 'selected' : ''}>EPI</option><option value="OTHER" ${normalizedType === 'OTHER' ? 'selected' : ''}>Outro item</option></select></div>
          <div class="field"><label>Colaborador <em>*</em></label><input id="cCollab" name="collaborator" list="cautelaPeopleList" required placeholder="Selecione ou digite o nome"></div>
        </div>
        <div class="section-title"><span>${icon('pallet')}</span><div><h3>Item entregue</h3><small>Informe a descrição, quantidade e necessidade de devolução</small></div></div>
        <div class="form-grid cautela-item-grid">
          <div class="field full"><label>Descrição do item <em>*</em></label><input type="text" id="cItem" name="item" required placeholder="Ex.: Furadeira Makita 220 V ou luva de vaqueta"></div>
          <div class="field"><label>Quantidade <em>*</em></label><input type="number" id="cQtd" name="quantity" value="1" min="0.01" step="0.01" required></div>
          <div class="field"><label>Controle de devolução <em>*</em></label><select id="cStatus" name="status" required><option value="PENDING_RETURN" ${defaultStatus === 'PENDING_RETURN' ? 'selected' : ''}>Exige devolução</option><option value="NO_RETURN_NEEDED" ${defaultStatus === 'NO_RETURN_NEEDED' ? 'selected' : ''}>Não exige devolução / consumo</option></select></div>
          <div class="field full"><label>Observações</label><textarea id="cNotes" name="notes" placeholder="Marca, patrimônio, CA do EPI ou outra informação..."></textarea></div>
          <label class="operator-sign-field"><span>Assinatura de quem recebeu <em>*</em></span><input type="hidden" name="operatorSign" id="operatorSignInput" data-signature-label="Recebedor da ferramenta / EPI"><div id="signPreviewContainer" class="sign-preview-box" onclick="openSignatureModal()"><span class="sign-placeholder-text">✍️ Clique para assinar a entrega</span></div></label>
        </div>
      </div>
      <div class="modal-foot"><button type="button" onclick="closeModal()" class="button button-outline">Cancelar</button><button class="button button-green">${icon('check')} Confirmar saída</button></div>
    </form>`;
  modal(modalHtml, 'modal-inspection');
};

window.suggestCautelaReturn = function(type) {
  const status = document.getElementById('cStatus');
  if (status) status.value = type === 'EPI' ? 'NO_RETURN_NEEDED' : 'PENDING_RETURN';
};

window.submitNovaCautela = function(event) {
  event?.preventDefault();
  const collab = document.getElementById('cCollab')?.value.trim();
  const item = document.getElementById('cItem')?.value.trim();
  const qtd = document.getElementById('cQtd')?.value;
  const type = document.getElementById('cType')?.value;
  const status = document.getElementById('cStatus')?.value;
  const notes = document.getElementById('cNotes')?.value.trim();
  const signature = document.getElementById('operatorSignInput')?.value;

  if (!collab || !item) return toast('Selecione o colaborador e informe o item.', true);
  if (!signature) {
    toast('Registre a assinatura de quem recebeu o item.', true);
    return openSignatureModal();
  }

  saveCautela({
    collaborator_name: collab,
    item_description: item,
    quantity: parseFloat(qtd) || 1,
    checkout_type: type,
    status,
    signature_url: signature,
    notes: notes || null
  });
  closeModal();
};

window.returnCautela = async function(id) {
  if (!confirm('Confirmar a devolução deste item?')) return;
  try {
    const client = await waitForSupabaseClient();
    const { error } = await client.from('employee_checkouts').update({
      status: 'RETURNED',
      returned_date: new Date().toISOString()
    }).eq('id', id);
    if (error) throw error;
    toast('Devolução registrada com sucesso.');
    await fetchCautelas();
    renderCautelas();
  } catch (error) {
    console.error(error);
    toast('Erro ao registrar a devolução.', true);
  }
};
