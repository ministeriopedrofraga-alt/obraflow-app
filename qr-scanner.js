(() => {
  let scanner = null;
  let scanHandled = false;
  const originalCloseModal = window.closeModal;

  async function stopQrScanner() {
    const current = scanner;
    scanner = null;
    if (!current) return;
    try { await current.stop(); } catch (error) {}
    try { current.clear(); } catch (error) {}
  }

  window.closeModal = function closeModalWithScanner() {
    stopQrScanner();
    return originalCloseModal();
  };

  function cameraMessage(title, detail) {
    const container = document.getElementById('qrCameraContainer');
    if (!container) return;
    container.innerHTML = `<div style="padding:24px;text-align:center;color:#d6e2dc;"><span style="font-size:26px;display:block;margin-bottom:8px;">📷</span><strong>${esc(title)}</strong><br><small style="display:block;margin-top:6px;color:#a3b8af;line-height:1.45;">${esc(detail)}</small></div>`;
  }

  function cameraErrorMessage(error) {
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

  function showScannedEquipment(text) {
    if (!text) return;
    let target = String(text).trim();
    if (target.includes('#scan/')) target = target.split('#scan/')[1];
    else if (target.includes('/')) target = target.split('/').pop();
    target = target.split(/[?#]/)[0].toLowerCase().trim();

    const equipment = equipments.find(item =>
      (item.id && item.id.toLowerCase() === target) ||
      (item.code && item.code.toLowerCase() === target) ||
      (item.afNumber && item.afNumber.toLowerCase() === target) ||
      (item.serial && item.serial.toLowerCase() === target)
    );
    if (!equipment) return toast(`Equipamento não encontrado para o código "${text}".`, true);
    openPublicEquipmentModal(equipment.id);
  }

  window.openScanModal = async function openQrScannerModal() {
    await stopQrScanner();
    scanHandled = false;
    modal(`${modalHead('Ler QR Code do Equipamento','Aponte a câmera para o QR Code impresso no equipamento')}<div class="modal-body"><div id="qrCameraContainer" style="width:100%;min-height:220px;background:#14201b;border-radius:12px;overflow:hidden;position:relative;display:flex;align-items:center;justify-content:center;color:#fff;"><div id="reader" style="width:100%;"></div></div><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px;"><button type="button" class="button button-outline" onclick="initQrCamera()">${icon('scan')} Ativar câmera</button><label class="button button-outline" style="cursor:pointer;justify-content:center;">${icon('qr')} Ler pela foto<input type="file" accept="image/*" capture="environment" hidden onchange="scanQrImage(event)"></label></div><div style="margin:14px 0 10px;text-align:center;color:#67736d;font-size:11px;font-weight:600;letter-spacing:0.5px;">OU DIGITE O CÓDIGO DO ATIVO</div><form class="scan-input" onsubmit="findEquipment(event)"><input id="scanCode" required autocomplete="off" placeholder="Ex.: TPTA00674, 686..."><button class="button button-green">Localizar</button></form><div class="notice">${icon('qr')} Autorize o uso da câmera quando o navegador solicitar.</div></div>`, 'modal-small');
    setTimeout(window.initQrCamera, 100);
  };

  window.initQrCamera = async function initQrCamera() {
    if (!document.getElementById('qrCameraContainer')) return;
    await stopQrScanner();
    scanHandled = false;

    if (!window.Html5Qrcode) {
      cameraMessage('Leitor QR não carregado', 'Recarregue a página. Você ainda pode localizar o ativo digitando o código.');
      return;
    }
    const localHost = ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname);
    if (!window.isSecureContext && !localHost) {
      cameraMessage('Câmera bloqueada nesta conexão', 'O navegador exige HTTPS para vídeo ao vivo. Use “Ler pela foto” ou abra o sistema em uma URL HTTPS.');
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      cameraMessage('Câmera indisponível neste navegador', 'Use “Ler pela foto” ou abra a página em Chrome, Edge ou Safari atualizado.');
      return;
    }

    const container = document.getElementById('qrCameraContainer');
    if (!container) return;
    container.innerHTML = '<div id="reader" style="width:100%;"></div>';
    try {
      const cameras = await window.Html5Qrcode.getCameras();
      if (!cameras.length) throw new Error('No camera found');
      const rearCamera = cameras.find(camera => /back|rear|environment|traseira/i.test(camera.label));
      scanner = new window.Html5Qrcode('reader');
      await scanner.start(
        (rearCamera || cameras[0]).id,
        { fps: 10, qrbox: { width: 200, height: 200 }, aspectRatio: 1 },
        async decodedText => {
          if (scanHandled) return;
          scanHandled = true;
          await stopQrScanner();
          originalCloseModal();
          showScannedEquipment(decodedText);
        },
        () => {}
      );
    } catch (error) {
      console.warn('Erro ao inicializar leitor QR:', error);
      await stopQrScanner();
      const [title, detail] = cameraErrorMessage(error);
      cameraMessage(title, detail);
    }
  };

  window.scanQrImage = async function scanQrImage(event) {
    const input = event.target;
    const file = input.files?.[0];
    if (!file) return;
    if (!window.Html5Qrcode) return toast('O leitor QR não foi carregado. Recarregue a página.', true);
    await stopQrScanner();
    const container = document.getElementById('qrCameraContainer');
    if (!container) return;
    container.innerHTML = '<div id="reader" style="width:100%;"></div>';
    const fileScanner = new window.Html5Qrcode('reader');
    scanner = fileScanner;
    try {
      const decodedText = await fileScanner.scanFile(file, true);
      scanner = null;
      try { fileScanner.clear(); } catch (error) {}
      originalCloseModal();
      showScannedEquipment(decodedText);
    } catch (error) {
      scanner = null;
      try { fileScanner.clear(); } catch (clearError) {}
      cameraMessage('QR Code não encontrado na foto', 'Tire outra foto com boa iluminação, foco e o código inteiro dentro da imagem.');
    } finally {
      input.value = '';
    }
  };

  window.findEquipment = function findQrEquipment(event) {
    event.preventDefault();
    const code = document.getElementById('scanCode')?.value.trim();
    if (!code) return;
    stopQrScanner();
    originalCloseModal();
    showScannedEquipment(code);
  };

  const oldQuickScanButton = document.getElementById('quickScanButton');
  if (oldQuickScanButton) {
    const quickScanButton = oldQuickScanButton.cloneNode(true);
    oldQuickScanButton.replaceWith(quickScanButton);
    quickScanButton.addEventListener('click', window.openScanModal);
  }
})();
