'use strict';
/* =====================================================================
   15b. CHECKPOINTS
   Guarda em salvo.checkpoint um retrato simples da fase: onde o jogador estava (último ponto seguro),
   o que já foi coletado/apagado/derrotado e o progresso. Vai junto com o save (local e na nuvem).
   Salvo automaticamente: (1) ao coletar item ou cumprir objetivo e (2) uma vez ao começar a luta com o vilão.
   Apagado ao concluir a fase. Os inimigos e itens são identificados pela ordem em que o mapa os cria.
   ===================================================================== */
const checkpointDaFase = idx => (salvo.checkpoint && salvo.checkpoint.idx === idx) ? salvo.checkpoint : null;

function limparCheckpoint() {
  if (!salvo.checkpoint) return;
  salvo.checkpoint = null; salvo.cpT = Date.now(); salvarProgresso();
}

function tirarCheckpoint() {
  const nIni = L.nInimigosIni;
  const vivos = new Set(inimigos.filter(e => e.vivo && e.cid < nIni).map(e => e.cid));
  const mortos = [];
  for (let i = 0; i < nIni; i++) if (!vivos.has(i)) mortos.push(i);
  const pegos = [], apagados = [];
  for (let i = 0; i < L.nItensIni; i++) if (itens[i] && itens[i].pego) pegos.push(i);
  focos.forEach((f, i) => { if (f.apagado) apagados.push(i); });
  salvo.checkpoint = {
    idx: L.idx, parte: L.parte || 0, x: Math.round(J.seguro.x), y: Math.round(J.seguro.y),
    vidas: J.vidas, armadura: Math.round(J.armadura || 0),
    progresso: L.progresso, coletados: L.coletados, inv: Object.assign({}, L.inv),
    itens: pegos, focos: apagados, inimigos: mortos
  };
  salvo.cpT = Date.now();
  salvarProgresso();
}

/* Chamado a cada quadro da fase: só grava quando algo mudou e o jogador está seguro no chão */
function tentarCheckpoint() {
  if (!L || !J || L.concluida || L.forja > 0 || L.tempo < 1 || J.vidas <= 0 || !J.noChao || J.invul > 0) return;
  const luta = !!(vilao && vilao.ativo && !vilao.morto);
  if (luta) {
    if (L.cpLuta) return;                              // durante a luta não grava mais nada
    L.cpLuta = true; L.cpMarca = L.progresso + '|' + L.coletados; tirarCheckpoint(); return;
  }
  const marca = L.progresso + '|' + L.coletados;
  if (marca === L.cpMarca) return;
  L.cpMarca = marca;
  if (L.progresso === 0 && L.coletados === 0) return;
  tirarCheckpoint();
}

/* Começa a fase do checkpoint e reaplica o que já tinha sido feito */
function continuarDoCheckpoint(cp) {
  iniciarFase(cp.idx, false, cp.parte);
  if (!L || L.idx !== cp.idx) return;
  const ints = a => (Array.isArray(a) ? a : []).filter(Number.isInteger);
  const mortos = new Set(ints(cp.inimigos));
  inimigos = inimigos.filter(e => !(e.cid < L.nInimigosIni && mortos.has(e.cid)));
  for (const i of ints(cp.itens)) if (i < L.nItensIni && itens[i]) itens[i].pego = true;
  for (const i of ints(cp.focos)) if (focos[i]) { focos[i].apagado = true; focos[i].hp = 0; }
  L.progresso = Math.max(0, Math.min(L.total, Number(cp.progresso) || 0));
  L.coletados = Math.max(0, Number(cp.coletados) || 0);
  L.inv = (cp.inv && typeof cp.inv === 'object') ? Object.assign({}, cp.inv) : {};
  atualizarMeta(); L.calor = L.calorAlvo;
  const px = Math.max(0, Math.min(mapaLarg * TAM - J.w, Number(cp.x) || J.x));
  const py = Math.max(0, Math.min(mapaAlt * TAM - J.h, Number(cp.y) || J.y));
  J.x = px; J.y = py; J.seguro = { x: px, y: py };
  J.vidas = Math.max(3, Math.min(VIDAS_MAX, Number(cp.vidas) || 3));      // voltar com pelo menos 3 vidas
  if (cp.armadura > 0) J.armadura = Math.min(ARMADURA_MAX, cp.armadura);
  L.cpMarca = L.progresso + '|' + L.coletados;
  atualizarCamera(1, true);
  toast('Voltou ao checkpoint!', 2.5); som('ok');
}
