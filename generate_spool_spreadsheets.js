const ExcelJS = require('./exceljs.min.js');
const fs = require('fs');

const SPOOL_SECTORS = [
  'Corredor FW A',
  'Corredor FW B',
  'Corredor Gerador',
  'Salas Elétricas',
  'CAG',
  'SUPERCORE',
  'Salas RMUs'
];

const SPOOL_DHS = Array.from({ length: 10 }, (_, i) => `DH ${String(i + 1).padStart(2, '0')}`);
const SPOOL_TYPES = ['Trecho Reto', 'Válvula de Ponta', 'Derivação (Ramal)'];
const SPOOL_STATUS = ['Pendente', 'Recebido', 'Instalado'];

function setupWorkbookStructure(workbook, sheetName, items, maxRow = 1500) {
  // 1. Hidden List Sheet
  const listSheet = workbook.addWorksheet('Listas_Auxiliares', { state: 'hidden' });
  SPOOL_SECTORS.forEach((sec, idx) => { listSheet.getCell(`A${idx + 1}`).value = sec; });
  SPOOL_DHS.forEach((dh, idx) => { listSheet.getCell(`B${idx + 1}`).value = dh; });
  SPOOL_TYPES.forEach((t, idx) => { listSheet.getCell(`C${idx + 1}`).value = t; });
  SPOOL_STATUS.forEach((st, idx) => { listSheet.getCell(`D${idx + 1}`).value = st; });

  // 2. Main Sheet
  const sheet = workbook.addWorksheet(sheetName);
  sheet.columns = [
    { header: 'TAG / Spool', key: 'tag', width: 16 },
    { header: 'Data Hall (DH)', key: 'dh', width: 16 },
    { header: 'Setor', key: 'setor', width: 24 },
    { header: 'Classificação', key: 'tipo', width: 22 },
    { header: 'Diâmetro', key: 'diametro', width: 12 },
    { header: 'Status', key: 'status', width: 14 },
    { header: 'Data de Recebimento', key: 'recData', width: 18 },
    { header: 'Data de Instalação', key: 'instData', width: 18 },
    { header: 'Responsável', key: 'resp', width: 22 },
    { header: 'Observações', key: 'obs', width: 36 }
  ];

  // Header styling
  const headerRow = sheet.getRow(1);
  headerRow.height = 26;
  headerRow.eachCell(cell => {
    cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0B2447' } };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FF334155' } },
      bottom: { style: 'thin', color: { argb: 'FF334155' } }
    };
  });

  // Data rows
  items.forEach(s => {
    const row = sheet.addRow({
      tag: s.tag || s.number,
      dh: s.dh,
      setor: s.setor || s.area,
      tipo: s.tipo || s.type || 'Trecho Reto',
      diametro: s.diametro || s.diameter || '10"',
      status: s.status,
      recData: s.recData || s.receivedDate || '',
      instData: s.instData || s.installedDate || '',
      resp: s.resp || s.installedBy || '',
      obs: s.obs || s.notes || ''
    });

    row.height = 20;
    row.alignment = { vertical: 'middle' };
    row.getCell(1).alignment = { vertical: 'middle', horizontal: 'center' };
    row.getCell(2).alignment = { vertical: 'middle', horizontal: 'center' };
    row.getCell(5).alignment = { vertical: 'middle', horizontal: 'center' };
    row.getCell(6).alignment = { vertical: 'middle', horizontal: 'center' };
    row.getCell(7).alignment = { vertical: 'middle', horizontal: 'center' };
    row.getCell(8).alignment = { vertical: 'middle', horizontal: 'center' };

    // Highlight status
    const stCell = row.getCell(6);
    if (s.status === 'Instalado') {
      stCell.font = { color: { argb: 'FF047857' }, bold: true };
      stCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD1FAE5' } };
    } else if (s.status === 'Pendente') {
      stCell.font = { color: { argb: 'FFB91C1C' }, bold: true };
      stCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEE2E2' } };
    }
  });

  sheet.views = [{ state: 'frozen', ySplit: 1 }];
  sheet.autoFilter = { from: 'A1', to: `J${Math.max(2, sheet.rowCount)}` };

  // Data validations
  const limitRow = Math.max(maxRow, items.length + 500);

  // Col B: DH
  sheet.dataValidations.add(`B2:B${limitRow}`, {
    type: 'list',
    allowBlank: true,
    formulae: ['Listas_Auxiliares!$B$1:$B$10'],
    showErrorMessage: true,
    errorTitle: 'Data Hall Inválido',
    error: 'Selecione um Data Hall válido (DH 01 a DH 10).'
  });

  // Col C: Setores (7 locais oficiais)
  sheet.dataValidations.add(`C2:C${limitRow}`, {
    type: 'list',
    allowBlank: true,
    formulae: ['Listas_Auxiliares!$A$1:$A$7'],
    showErrorMessage: true,
    errorTitle: 'Setor / Local Inválido',
    error: 'Selecione um dos 7 locais oficiais da obra.'
  });

  // Col D: Tipo
  sheet.dataValidations.add(`D2:D${limitRow}`, {
    type: 'list',
    allowBlank: true,
    formulae: ['Listas_Auxiliares!$C$1:$C$3'],
    showErrorMessage: true,
    errorTitle: 'Classificação Inválida',
    error: 'Selecione Trecho Reto, Válvula de Ponta ou Derivação (Ramal).'
  });

  // Col F: Status
  sheet.dataValidations.add(`F2:F${limitRow}`, {
    type: 'list',
    allowBlank: true,
    formulae: ['Listas_Auxiliares!$D$1:$D$3'],
    showErrorMessage: true,
    errorTitle: 'Status Inválido',
    error: 'Selecione Pendente, Recebido ou Instalado.'
  });

  return sheet;
}

async function generateAll() {
  // 1. MODELO EM BRANCO COM EXEMPLOS
  const wbTemplate = new ExcelJS.Workbook();
  wbTemplate.creator = 'Heating Cooling';
  const sampleItems = [
    { tag: '1601', dh: 'DH 04', setor: 'Corredor FW A', tipo: 'Trecho Reto', diametro: '8"', status: 'Pendente', obs: 'Alimentação AAG' },
    { tag: '1603', dh: 'DH 04', setor: 'Corredor FW A', tipo: 'Trecho Reto', diametro: '8"', status: 'Recebido', obs: 'Alimentação AAG' },
    { tag: '1602', dh: 'DH 04', setor: 'Corredor FW B', tipo: 'Trecho Reto', diametro: '8"', status: 'Recebido', obs: 'Retorno RAG' },
    { tag: '1761', dh: 'DH 04', setor: 'Corredor FW A', tipo: 'Derivação (Ramal)', diametro: '2.1/2"', status: 'Recebido', obs: 'Ramal Fan Wall' },
    { tag: 'GER-01', dh: 'DH 04', setor: 'Corredor Gerador', tipo: 'Trecho Reto', diametro: '6"', status: 'Pendente', obs: 'Linha Resfriamento Gerador' },
    { tag: 'GER-02', dh: 'DH 04', setor: 'Corredor Gerador', tipo: 'Derivação (Ramal)', diametro: '3"', status: 'Pendente', obs: 'Ramal de Dreno Gerador' },
    { tag: 'ELE-101', dh: 'DH 04', setor: 'Salas Elétricas', tipo: 'Trecho Reto', diametro: '4"', status: 'Pendente', obs: 'Circuito Auxiliar' },
    { tag: 'CAG-01', dh: 'DH 04', setor: 'CAG', tipo: 'Trecho Reto', diametro: '10"', status: 'Instalado', recData: '2026-10-15', instData: '2026-10-17', resp: 'Equipe CAG', obs: 'Barramento Chiller' },
    { tag: 'CAG-V01', dh: 'DH 04', setor: 'CAG', tipo: 'Válvula de Ponta', diametro: '10"', status: 'Instalado', recData: '2026-10-15', instData: '2026-10-17', resp: 'Equipe CAG', obs: 'Válvula Borboleta' },
    { tag: 'SC-01', dh: 'DH 04', setor: 'SUPERCORE', tipo: 'Trecho Reto', diametro: '10"', status: 'Pendente', obs: 'Prumada Principal' },
    { tag: 'RMU-01', dh: 'DH 04', setor: 'Salas RMUs', tipo: 'Trecho Reto', diametro: '6"', status: 'Pendente', obs: 'Alimentação RMU' }
  ];
  setupWorkbookStructure(wbTemplate, 'Modelo_Spools', sampleItems, 1000);
  const bufTemplate = await wbTemplate.xlsx.writeBuffer();
  fs.writeFileSync('Modelo_Importacao_Spools_Lista_Suspensa.xlsx', Buffer.from(bufTemplate));
  console.log('✓ Gerado: Modelo_Importacao_Spools_Lista_Suspensa.xlsx');

  // 2. PLANILHA COMPLETA DO SUPERCORE DH 04 (34 SPOOLS COM CIRCUITOS E STATUS DA FOTO)
  const wbSupercore = new ExcelJS.Workbook();
  wbSupercore.creator = 'Heating Cooling';
  const supercoreItems = [
    // Conjunto 1 - Alimentação
    { tag: '1873', dh: 'DH 04', setor: 'SUPERCORE', tipo: 'Trecho Reto', diametro: '10"', status: 'Pendente', recData: '2026-10-15', instData: '', resp: '', obs: 'Conjunto 1 - Alimentação (C1A1)' },
    { tag: '1833', dh: 'DH 04', setor: 'SUPERCORE', tipo: 'Trecho Reto', diametro: '10"', status: 'Instalado', recData: '2026-10-15', instData: '2026-10-17', resp: 'Equipe SUPERCORE', obs: 'Conjunto 1 - Alimentação (C1A2)' },
    { tag: '1831', dh: 'DH 04', setor: 'SUPERCORE', tipo: 'Trecho Reto', diametro: '10"', status: 'Instalado', recData: '2026-10-15', instData: '2026-10-17', resp: 'Equipe SUPERCORE', obs: 'Conjunto 1 - Alimentação (C1A3)' },
    { tag: '1829', dh: 'DH 04', setor: 'SUPERCORE', tipo: 'Trecho Reto', diametro: '10"', status: 'Instalado', recData: '2026-10-15', instData: '2026-10-17', resp: 'Equipe SUPERCORE', obs: 'Conjunto 1 - Alimentação (C1A4)' },
    { tag: '1865', dh: 'DH 04', setor: 'SUPERCORE', tipo: 'Trecho Reto', diametro: '10"', status: 'Instalado', recData: '2026-10-15', instData: '2026-10-17', resp: 'Equipe SUPERCORE', obs: 'Conjunto 1 - Alimentação (C1A5)' },
    { tag: '1861', dh: 'DH 04', setor: 'SUPERCORE', tipo: 'Trecho Reto', diametro: '10"', status: 'Instalado', recData: '2026-10-15', instData: '2026-10-17', resp: 'Equipe SUPERCORE', obs: 'Conjunto 1 - Alimentação (C1A6)' },
    { tag: '1867', dh: 'DH 04', setor: 'SUPERCORE', tipo: 'Trecho Reto', diametro: '10"', status: 'Pendente', recData: '2026-10-15', instData: '', resp: '', obs: 'Conjunto 1 - Alimentação (C1A7)' },
    { tag: '1877', dh: 'DH 04', setor: 'SUPERCORE', tipo: 'Trecho Reto', diametro: '10"', status: 'Instalado', recData: '2026-10-15', instData: '2026-10-17', resp: 'Equipe SUPERCORE', obs: 'Conjunto 1 - Alimentação (C1A8)' },
    { tag: '1879', dh: 'DH 04', setor: 'SUPERCORE', tipo: 'Trecho Reto', diametro: '10"', status: 'Instalado', recData: '2026-10-15', instData: '2026-10-17', resp: 'Equipe SUPERCORE', obs: 'Conjunto 1 - Alimentação (C1A9)' },
    
    // Conjunto 1 - Retorno
    { tag: '1874', dh: 'DH 04', setor: 'SUPERCORE', tipo: 'Trecho Reto', diametro: '10"', status: 'Instalado', recData: '2026-10-15', instData: '2026-10-17', resp: 'Equipe SUPERCORE', obs: 'Conjunto 1 - Retorno (C1R1)' },
    { tag: '1832', dh: 'DH 04', setor: 'SUPERCORE', tipo: 'Trecho Reto', diametro: '10"', status: 'Pendente', recData: '2026-10-15', instData: '', resp: '', obs: 'Conjunto 1 - Retorno (C1R2)' },
    { tag: '1830', dh: 'DH 04', setor: 'SUPERCORE', tipo: 'Trecho Reto', diametro: '10"', status: 'Instalado', recData: '2026-10-15', instData: '2026-10-17', resp: 'Equipe SUPERCORE', obs: 'Conjunto 1 - Retorno (C1R3)' },
    { tag: '1828', dh: 'DH 04', setor: 'SUPERCORE', tipo: 'Trecho Reto', diametro: '10"', status: 'Instalado', recData: '2026-10-15', instData: '2026-10-17', resp: 'Equipe SUPERCORE', obs: 'Conjunto 1 - Retorno (C1R4)' },
    { tag: '1863', dh: 'DH 04', setor: 'SUPERCORE', tipo: 'Trecho Reto', diametro: '10"', status: 'Instalado', recData: '2026-10-15', instData: '2026-10-17', resp: 'Equipe SUPERCORE', obs: 'Conjunto 1 - Retorno (C1R5)' },
    { tag: '1870', dh: 'DH 04', setor: 'SUPERCORE', tipo: 'Trecho Reto', diametro: '10"', status: 'Instalado', recData: '2026-10-15', instData: '2026-10-17', resp: 'Equipe SUPERCORE', obs: 'Conjunto 1 - Retorno (C1R6)' },
    { tag: '1868', dh: 'DH 04', setor: 'SUPERCORE', tipo: 'Trecho Reto', diametro: '10"', status: 'Instalado', recData: '2026-10-15', instData: '2026-10-17', resp: 'Equipe SUPERCORE', obs: 'Conjunto 1 - Retorno (C1R7)' },
    { tag: '1878', dh: 'DH 04', setor: 'SUPERCORE', tipo: 'Trecho Reto', diametro: '10"', status: 'Instalado', recData: '2026-10-15', instData: '2026-10-17', resp: 'Equipe SUPERCORE', obs: 'Conjunto 1 - Retorno (C1R8)' },
    { tag: '1879', dh: 'DH 04', setor: 'SUPERCORE', tipo: 'Trecho Reto', diametro: '10"', status: 'Instalado', recData: '2026-10-15', instData: '2026-10-17', resp: 'Equipe SUPERCORE', obs: 'Conjunto 1 - Retorno (C1R9)' },

    // Conjunto 2 - Alimentação
    { tag: '1879', dh: 'DH 04', setor: 'SUPERCORE', tipo: 'Trecho Reto', diametro: '10"', status: 'Pendente', recData: '2026-10-15', instData: '', resp: '', obs: 'Conjunto 2 - Alimentação (C2A1)' },
    { tag: '1876', dh: 'DH 04', setor: 'SUPERCORE', tipo: 'Trecho Reto', diametro: '10"', status: 'Instalado', recData: '2026-10-15', instData: '2026-10-17', resp: 'Equipe SUPERCORE', obs: 'Conjunto 2 - Alimentação (C2A2)' },
    { tag: '1872', dh: 'DH 04', setor: 'SUPERCORE', tipo: 'Trecho Reto', diametro: '10"', status: 'Pendente', recData: '2026-10-15', instData: '', resp: '', obs: 'Conjunto 2 - Alimentação (C2A3)' },
    { tag: '1871', dh: 'DH 04', setor: 'SUPERCORE', tipo: 'Trecho Reto', diametro: '10"', status: 'Instalado', recData: '2026-10-15', instData: '2026-10-17', resp: 'Equipe SUPERCORE', obs: 'Conjunto 2 - Alimentação (C2A4)' },
    { tag: '1838', dh: 'DH 04', setor: 'SUPERCORE', tipo: 'Trecho Reto', diametro: '10"', status: 'Instalado', recData: '2026-10-15', instData: '2026-10-17', resp: 'Equipe SUPERCORE', obs: 'Conjunto 2 - Alimentação (C2A5)' },
    { tag: '1836', dh: 'DH 04', setor: 'SUPERCORE', tipo: 'Trecho Reto', diametro: '10"', status: 'Instalado', recData: '2026-10-15', instData: '2026-10-17', resp: 'Equipe SUPERCORE', obs: 'Conjunto 2 - Alimentação (C2A6)' },
    { tag: '1834', dh: 'DH 04', setor: 'SUPERCORE', tipo: 'Trecho Reto', diametro: '10"', status: 'Instalado', recData: '2026-10-15', instData: '2026-10-17', resp: 'Equipe SUPERCORE', obs: 'Conjunto 2 - Alimentação (C2A7)' },
    { tag: '1869', dh: 'DH 04', setor: 'SUPERCORE', tipo: 'Trecho Reto', diametro: '10"', status: 'Instalado', recData: '2026-10-15', instData: '2026-10-17', resp: 'Equipe SUPERCORE', obs: 'Conjunto 2 - Alimentação (C2A8)' },

    // Conjunto 2 - Retorno
    { tag: '1879', dh: 'DH 04', setor: 'SUPERCORE', tipo: 'Trecho Reto', diametro: '10"', status: 'Pendente', recData: '2026-10-15', instData: '', resp: '', obs: 'Conjunto 2 - Retorno (C2R1)' },
    { tag: '1875', dh: 'DH 04', setor: 'SUPERCORE', tipo: 'Trecho Reto', diametro: '10"', status: 'Instalado', recData: '2026-10-15', instData: '2026-10-17', resp: 'Equipe SUPERCORE', obs: 'Conjunto 2 - Retorno (C2R2)' },
    { tag: '1864', dh: 'DH 04', setor: 'SUPERCORE', tipo: 'Trecho Reto', diametro: '10"', status: 'Instalado', recData: '2026-10-15', instData: '2026-10-17', resp: 'Equipe SUPERCORE', obs: 'Conjunto 2 - Retorno (C2R3)' },
    { tag: '1862', dh: 'DH 04', setor: 'SUPERCORE', tipo: 'Trecho Reto', diametro: '10"', status: 'Pendente', recData: '2026-10-15', instData: '', resp: '', obs: 'Conjunto 2 - Retorno (C2R4)' },
    { tag: '1839', dh: 'DH 04', setor: 'SUPERCORE', tipo: 'Trecho Reto', diametro: '10"', status: 'Instalado', recData: '2026-10-15', instData: '2026-10-17', resp: 'Equipe SUPERCORE', obs: 'Conjunto 2 - Retorno (C2R5)' },
    { tag: '1837', dh: 'DH 04', setor: 'SUPERCORE', tipo: 'Trecho Reto', diametro: '10"', status: 'Instalado', recData: '2026-10-15', instData: '2026-10-17', resp: 'Equipe SUPERCORE', obs: 'Conjunto 2 - Retorno (C2R6)' },
    { tag: '1835', dh: 'DH 04', setor: 'SUPERCORE', tipo: 'Trecho Reto', diametro: '10"', status: 'Pendente', recData: '2026-10-15', instData: '', resp: '', obs: 'Conjunto 2 - Retorno (C2R7)' },
    { tag: '1866', dh: 'DH 04', setor: 'SUPERCORE', tipo: 'Trecho Reto', diametro: '10"', status: 'Instalado', recData: '2026-10-15', instData: '2026-10-17', resp: 'Equipe SUPERCORE', obs: 'Conjunto 2 - Retorno (C2R8)' }
  ];
  setupWorkbookStructure(wbSupercore, 'SUPERCORE_DH04', supercoreItems, 1000);
  const bufSupercore = await wbSupercore.xlsx.writeBuffer();
  fs.writeFileSync('Planilha_Spools_SUPERCORE_DH04.xlsx', Buffer.from(bufSupercore));
  console.log('✓ Gerado: Planilha_Spools_SUPERCORE_DH04.xlsx');
}

generateAll().catch(console.error);
