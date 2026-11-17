'use strict';
/* =====================================================================
   2d. SAVE NA NUVEM (opcional)
   Fala com o servidor em /servidor (GET/PUT /api/save). Só funciona com conta Google e com o jogo
   aberto por http(s) a partir desse servidor. Sem servidor ou sem internet, o jogo segue só com o save local.
   O token do Google fica apenas na memória: ao recarregar a página, o save local continua valendo
   e a nuvem volta a sincronizar no próximo login.
   ===================================================================== */
const API_NUVEM = typeof window.API_NUVEM === 'string' ? window.API_NUVEM : (location.protocol.startsWith('http') ? '' : null);
const estadoNuvem = { token: null, estado: 'off', envio: null, enviando: false, sujo: false };   // estado: off | sincronizando | ok | erro

/* Une dois saves sem perder progresso: números pegam o maior, verdadeiro vence, objetos se juntam */
function juntarSaves(a, b) {
  if (a === undefined) return b;
  if (b === undefined) return a;
  if (typeof a === 'number' && typeof b === 'number') return Math.max(a, b);
  if (typeof a === 'boolean' && typeof b === 'boolean') return a || b;
  if (a && b && typeof a === 'object' && typeof b === 'object' && !Array.isArray(a) && !Array.isArray(b)) {
    const r = {};
    for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) r[k] = juntarSaves(a[k], b[k]);
    return r;
  }
  return a;                                       // tipos diferentes: mantém o local
}

async function chamarNuvem(metodo, corpo) {
  const r = await fetch(API_NUVEM + '/api/save', {
    method: metodo,
    headers: Object.assign({ Authorization: 'Bearer ' + estadoNuvem.token }, corpo ? { 'Content-Type': 'application/json' } : {}),
    body: corpo ? JSON.stringify(corpo) : undefined
  });
  if (r.status === 401) { estadoNuvem.token = null; throw new Error('sessão expirada'); }
  if (!r.ok) throw new Error('HTTP ' + r.status);
  return r.json();
}

/* Chamada logo após o login: baixa o save da nuvem, junta com o local e envia o resultado */
async function nuvemSincronizar(token) {
  if (API_NUVEM === null || !token) return;
  estadoNuvem.token = token; estadoNuvem.estado = 'sincronizando';
  try {
    const r = await chamarNuvem('GET');
    if (r.salvo) {
      // o checkpoint não se mistura: vale o mais recente (cpT), inclusive quando foi apagado ao concluir a fase
      const local = { checkpoint: salvo.checkpoint || null, cpT: salvo.cpT || 0 }, nuv = { checkpoint: r.salvo.checkpoint || null, cpT: r.salvo.cpT || 0 };
      const a = Object.assign({}, salvo), b = Object.assign({}, r.salvo);
      for (const o of [a, b]) { delete o.checkpoint; delete o.cpT; }
      salvo = Object.assign(salvoPadrao(), juntarSaves(a, b), nuv.cpT > local.cpT ? nuv : local);
    }
    salvarProgresso();                            // grava local e agenda o envio
  } catch (e) { estadoNuvem.estado = 'erro'; }
}

function nuvemAgendar() {
  if (!estadoNuvem.token || API_NUVEM === null) return;
  estadoNuvem.sujo = true;
  clearTimeout(estadoNuvem.envio);
  estadoNuvem.envio = setTimeout(nuvemEnviar, 1500);   // junta várias gravações seguidas num só envio
}
async function nuvemEnviar() {
  if (!estadoNuvem.token || estadoNuvem.enviando) { if (estadoNuvem.token) nuvemAgendar(); return; }
  estadoNuvem.enviando = true; estadoNuvem.sujo = false;
  try { await chamarNuvem('PUT', { salvo }); estadoNuvem.estado = 'ok'; }
  catch (e) { estadoNuvem.estado = 'erro'; estadoNuvem.sujo = true; }
  estadoNuvem.enviando = false;
  if (estadoNuvem.sujo && estadoNuvem.token && estadoNuvem.estado !== 'erro') nuvemAgendar();
}
function nuvemDesligar() { clearTimeout(estadoNuvem.envio); estadoNuvem.token = null; estadoNuvem.estado = 'off'; estadoNuvem.sujo = false; }

/* Última tentativa ao fechar a aba */
window.addEventListener('pagehide', () => {
  if (!estadoNuvem.token || !estadoNuvem.sujo || API_NUVEM === null) return;
  try { fetch(API_NUVEM + '/api/save', { method: 'PUT', keepalive: true, headers: { Authorization: 'Bearer ' + estadoNuvem.token, 'Content-Type': 'application/json' }, body: JSON.stringify({ salvo }) }); } catch (e) {}
});
