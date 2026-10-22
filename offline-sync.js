(function () {
  'use strict';

  const DB_NAME = 'datacenter-omnia-offline';
  const DB_VERSION = 1;
  const STORE_NAME = 'mutations';
  const FALLBACK_KEY = 'obraflow_offline_mutations_v1';
  const listeners = new Set();
  let databasePromise = null;
  let useFallbackStorage = typeof indexedDB === 'undefined';
  let activeFlush = null;

  function requestPromise(request) {
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error('Falha no armazenamento offline.'));
    });
  }

  function openDatabase() {
    if (useFallbackStorage) return Promise.resolve(null);
    if (databasePromise) return databasePromise;
    databasePromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const database = request.result;
        if (!database.objectStoreNames.contains(STORE_NAME)) {
          const store = database.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('createdAt', 'createdAt');
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error('IndexedDB indisponivel.'));
    }).catch(error => {
      console.warn('IndexedDB indisponivel; usando a fila local de compatibilidade:', error);
      useFallbackStorage = true;
      databasePromise = null;
      return null;
    });
    return databasePromise;
  }

  function fallbackList() {
    try {
      const parsed = JSON.parse(localStorage.getItem(FALLBACK_KEY) || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.warn('Fila offline local invalida:', error);
      return [];
    }
  }

  function saveFallback(records) {
    try {
      localStorage.setItem(FALLBACK_KEY, JSON.stringify(records));
      return true;
    } catch (error) {
      console.warn('A fila de segurança do localStorage atingiu o limite; o IndexedDB continuará sendo usado:', error);
      return false;
    }
  }

  async function withStore(mode, operation) {
    const database = await openDatabase();
    if (!database || useFallbackStorage) return null;
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, mode);
      const store = transaction.objectStore(STORE_NAME);
      let result;
      try {
        result = operation(store);
      } catch (error) {
        reject(error);
        return;
      }
      transaction.oncomplete = () => resolve(result);
      transaction.onerror = () => reject(transaction.error || new Error('Falha ao atualizar a fila offline.'));
      transaction.onabort = () => reject(transaction.error || new Error('Atualizacao da fila offline cancelada.'));
    });
  }

  function parseBody(body) {
    if (!body || typeof body !== 'string') return body || null;
    try { return JSON.parse(body); } catch (error) { return body; }
  }

  function pathParts(path) {
    const [table = '', query = ''] = String(path || '').split('?');
    const params = new URLSearchParams(query);
    let resource = '';
    if (table === 'app_metadata') {
      const keyFilter = params.get('key') || '';
      resource = keyFilter.startsWith('eq.') ? keyFilter.slice(3) : '';
    }
    return { table, resource };
  }

  function requestScope(path, body) {
    const scope = pathParts(path);
    const parsed = parseBody(body);
    if (scope.table === 'app_metadata' && parsed && !Array.isArray(parsed) && parsed.key) {
      scope.resource = String(parsed.key);
    }
    return scope;
  }

  function stringHash(value) {
    let hash = 2166136261;
    for (let index = 0; index < value.length; index += 1) {
      hash ^= value.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(36);
  }

  function mutationId(path, method, body, explicitKey) {
    if (explicitKey) return `explicit:${explicitKey}`;
    const scope = requestScope(path, body);
    const parsed = parseBody(body);
    if (scope.table === 'app_metadata' && scope.resource) return `${method}:${scope.table}:${scope.resource}`;
    if (parsed && !Array.isArray(parsed) && typeof parsed === 'object' && parsed.id != null) {
      return `${method}:${scope.table}:${String(parsed.id)}`;
    }
    if (method === 'PATCH' || method === 'DELETE') return `${method}:${path}`;
    const serialized = typeof body === 'string' ? body : JSON.stringify(body || null);
    return `${method}:${path}:${stringHash(serialized)}`;
  }

  async function list() {
    if (useFallbackStorage) return fallbackList().sort((a, b) => a.createdAt - b.createdAt);
    try {
      const database = await openDatabase();
      if (!database || useFallbackStorage) return fallbackList().sort((a, b) => a.createdAt - b.createdAt);
      const records = await new Promise((resolve, reject) => {
        const transaction = database.transaction(STORE_NAME, 'readonly');
        const request = transaction.objectStore(STORE_NAME).getAll();
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
      });
      const merged = new Map(fallbackList().map(record => [record.id, record]));
      records.forEach(record => {
        const shadow = merged.get(record.id);
        if (!shadow || Number(record.updatedAt || 0) >= Number(shadow.updatedAt || 0)) merged.set(record.id, record);
      });
      return Array.from(merged.values()).sort((a, b) => a.createdAt - b.createdAt);
    } catch (error) {
      console.warn('Falha ao ler IndexedDB; usando fila de compatibilidade:', error);
      useFallbackStorage = true;
      return fallbackList().sort((a, b) => a.createdAt - b.createdAt);
    }
  }

  async function getRecord(id) {
    const shadow = fallbackList().find(record => record.id === id) || null;
    if (useFallbackStorage) return shadow;
    const database = await openDatabase();
    if (!database || useFallbackStorage) return shadow;
    const transaction = database.transaction(STORE_NAME, 'readonly');
    const stored = await requestPromise(transaction.objectStore(STORE_NAME).get(id));
    if (!stored) return shadow;
    if (!shadow) return stored;
    return Number(stored.updatedAt || 0) >= Number(shadow.updatedAt || 0) ? stored : shadow;
  }

  async function putRecord(record) {
    const records = fallbackList();
    const index = records.findIndex(item => item.id === record.id);
    if (index >= 0) records[index] = record;
    else records.push(record);
    saveFallback(records);
    if (useFallbackStorage) return;
    const database = await openDatabase();
    if (!database || useFallbackStorage) return putRecord(record);
    await withStore('readwrite', store => store.put(record));
  }

  async function removeRecord(record) {
    const current = await getRecord(record.id);
    if (!current || current.revision !== record.revision) return false;
    const shadowRecords = fallbackList();
    const shadow = shadowRecords.find(item => item.id === record.id);
    if (!shadow || shadow.revision === record.revision) {
      saveFallback(shadowRecords.filter(item => item.id !== record.id));
    }
    if (useFallbackStorage) {
      return true;
    }
    const database = await openDatabase();
    if (!database || useFallbackStorage) return true;
    const transaction = database.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const stored = await requestPromise(store.get(record.id));
    if (stored?.revision === record.revision) store.delete(record.id);
    return true;
  }

  async function emit(extra = {}) {
    const records = await list();
    const state = {
      online: navigator.onLine !== false,
      pending: records.length,
      syncing: Boolean(activeFlush),
      failed: records.filter(record => record.lastError).length,
      ...extra
    };
    listeners.forEach(listener => {
      try { listener(state); } catch (error) { console.warn('Indicador offline falhou:', error); }
    });
    window.dispatchEvent(new CustomEvent('obraflow:offline-sync', { detail: state }));
    return state;
  }

  async function enqueue(path, options = {}) {
    const method = String(options.method || 'POST').toUpperCase();
    const body = options.body == null ? null : String(options.body);
    const id = mutationId(path, method, body, options.offlineKey);
    const now = Date.now();
    const scope = requestScope(path, body);
    const existing = fallbackList().find(item => item.id === id);
    const record = {
      id,
      path: String(path),
      method,
      headers: { ...(options.headers || {}) },
      body,
      table: scope.table,
      resource: scope.resource,
      createdAt: existing?.createdAt || now,
      updatedAt: now,
      revision: `${now}-${Math.random().toString(36).slice(2)}`,
      attempts: 0,
      lastError: ''
    };
    await putRecord(record);
    await emit({ queued: true });
    return record;
  }

  async function markFailure(record, error) {
    const current = await getRecord(record.id);
    if (!current || current.revision !== record.revision) return;
    current.attempts = Number(current.attempts || 0) + 1;
    current.lastError = String(error?.message || error || 'Falha de sincronizacao').slice(0, 500);
    current.lastAttemptAt = Date.now();
    await putRecord(current);
  }

  async function hasConflict(path) {
    const target = pathParts(path);
    const records = await list();
    return records.some(record => {
      if (record.table !== target.table) return false;
      if (target.table === 'app_metadata' && target.resource && record.resource) {
        return target.resource === record.resource;
      }
      return true;
    });
  }

  async function flush(sender) {
    if (activeFlush) return activeFlush;
    if (navigator.onLine === false) {
      await emit({ syncing: false });
      return { sent: 0, failed: 0, pending: (await list()).length };
    }
    activeFlush = (async () => {
      await emit({ syncing: true });
      let sent = 0;
      let failed = 0;
      const records = await list();
      for (const record of records) {
        try {
          await sender(record);
          if (await removeRecord(record)) sent += 1;
        } catch (error) {
          failed += 1;
          await markFailure(record, error);
        }
      }
      const pending = (await list()).length;
      return { sent, failed, pending };
    })().finally(async () => {
      activeFlush = null;
      await emit({ syncing: false });
    });
    return activeFlush;
  }

  function subscribe(listener) {
    listeners.add(listener);
    emit();
    return () => listeners.delete(listener);
  }

  window.ObraflowOfflineSync = {
    enqueue,
    flush,
    list,
    hasConflict,
    complete: removeRecord,
    subscribe,
    refresh: emit
  };
})();
