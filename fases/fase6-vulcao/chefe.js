'use strict';
/* FASE 6 — O Vulcão de Fornax
   Lógica do chefe: 5 pontos fracos (um por arma), ataques e vitória. */
/* =====================================================================
   12b. CHEFE: FORNAX (cada ponto fraco é vulnerável a uma arma)
   ===================================================================== */
const SEQ_CHEFE = ['fogo', 'onda', 'invocar', 'fogo', 'onda', 'invocar'];
function criarChefe(tx, ty) {
  chefe = {
    w: 96, h: 96, baseX: tx * TAM + 8 - 48, x: tx * TAM + 8 - 48, y: (ty + 1) * TAM - 96, t: 0, estado: 'intro', tt: 2.2, ataque: 0, tiros: 0,
    pontos: [0, 1, 2, 3, 4].map(() => ({ hp: 2, inv: 0, vivo: true })), morto: false, flash: 0, shake: 0, fase: 0, pos: 0, posQ: '', pos: 0, posQ: ''
  };
}
const retChefe = () => ({ x: chefe.x, y: chefe.y, w: chefe.w, h: chefe.h });
const retContatoChefe = () => ({ x: chefe.x + 18, y: chefe.y + 14, w: chefe.w - 36, h: chefe.h - 16 });
function golpeChefe(arma) {
  const c = chefe; if (!c || c.morto) return;
  const idx = c.pontos.findIndex(p => p.vivo);       // o ponto brilhante da vez: QUALQUER arma o acerta
  if (!arma) {                                       // só o soco sem arma quica
    emitir('fagulha', c.x + 48, c.y + 60, 6, '#aab'); som('metal'); dispararLicao('errou');
    if (L.avisoErro <= 0) { toast('Use uma arma no ponto brilhante!', 2.2); L.avisoErro = 2.6; }
    return;
  }
  const pt = c.pontos[idx];
  if (pt.inv > 0) return;
  pt.hp--; pt.inv = 0.6; c.flash = 0.2; c.shake = 0.25;
  const [px, py] = posPontoFornax(c, idx);
  emitir('fagulha', px, py, 12, COR_PONTOS_FORNAX[idx]); emitir('brilho', px, py, 8, COR_PONTOS_FORNAX[idx]); som('explodir');
  if (pt.hp <= 0) {
    pt.vivo = false; L.progresso++; atualizarMeta(); c.tt = Math.max(c.tt, 1.3);
    emitir('fumaca', px, py, 14, COR_PONTOS_FORNAX[idx]); emitir('brilho', px, py, 24, COR_PONTOS_FORNAX[idx]);
    emitir('bolha', px, py, 10, '#bfe9ff'); som('rugido');
    soltarVida(px, py + 20, 0.9, 0);
    toast('Ponto fraco destruído! ' + L.progresso + '/5', 2); dispararLicao('ponto' + L.progresso);
    if (c.pontos.every(p => !p.vivo)) {
      c.morto = true; L.concluida = true; L.fim = 0; L.calorAlvo = 0.02; som('vitoria'); confete(c.x + 48, c.y + 20, 90);
      projeteis = []; inimigos.forEach(e => { e.vivo = false; });
    }
  }
}
function atualizarChefe(dt) {
  const c = chefe; if (!c) return;
  dt *= difVel();
  c.dir = (J.x + J.w / 2) > (c.x + 48) ? -1 : 1;     // sempre de frente para o Davi
  c.t += dt; c.flash -= dt; c.shake -= dt; c.pos -= dt; L.avisoErro -= dt;
  c.pontos.forEach(p => { p.inv -= dt; });
  if (c.morto) {                                   // explosões e esfriamento
    if (Math.random() < dt * 25) emitir('fagulha', c.x + rnd(0, 96), c.y + rnd(0, 96), 2, ['#ffd84f', '#ff7a1a', '#9af0ff'][Math.floor(Math.random() * 3)]);
    if (Math.random() < dt * 12) emitir('vapor', c.x + rnd(10, 86), c.y + rnd(0, 80), 1);
    if (Math.random() < dt * 4) som('explodir', 0.6);
    return;
  }
  const vivos = c.pontos.filter(p => p.vivo).length, vel = 1 + (5 - vivos) * 0.2;
  c.x = c.baseX + Math.sin(c.t * 0.55 * vel) * 34;
  const b = c.x + 48, bocaY = c.y + 36;
  c.tt -= dt;
  if (c.estado === 'intro') {
    if (c.tt <= 0) { c.estado = 'descanso'; c.tt = 1.2; }
  } else if (c.estado === 'descanso') {
    if (c.tt <= 0) {
      c.estado = SEQ_CHEFE[c.ataque++ % SEQ_CHEFE.length]; c.tiros = 0;
      c.tt = c.estado === 'fogo' ? 0.5 : 1.0;
      if (c.estado !== 'fogo') { som('rugido'); c.shake = 0.9; }
    }
  } else if (c.estado === 'fogo') {
    if (c.tt <= 0) {
      if (c.tiros < 3) {
        const ang = Math.atan2(J.y + 8 - bocaY, J.x + 5 - b) + (c.tiros - 1) * 0.12;
        projeteis.push({ x: b, y: bocaY, vx: Math.cos(ang) * 105 * Math.min(1.5, vel), vy: Math.sin(ang) * 105 * Math.min(1.5, vel), g: 0, vida: 5, tipo: 'bolafogo' });
        emitir('fagulha', b, bocaY, 8); som('bolafogo'); c.pos = 0.35; c.posQ = 'soco'; c.tiros++; c.tt = 0.5 / vel;
      } else { c.estado = 'descanso'; c.tt = Math.max(0.8, 1.7 / vel); }
    }
  } else if (c.estado === 'onda') {
    if (Math.random() < dt * 40) emitir('poeira', c.x + rnd(0, 96), c.y + 96, 1);
    if (c.tt <= 0) {
      const gy = c.y + c.h - 6;
      projeteis.push({ x: c.x + 4, y: gy, vx: -95 * Math.min(1.5, vel), vy: 0, g: 0, vida: 7, tipo: 'onda' });
      projeteis.push({ x: c.x + 92, y: gy, vx: 95 * Math.min(1.5, vel), vy: 0, g: 0, vida: 7, tipo: 'onda' });
      som('impacto'); c.shake = 0.4; c.pos = 0.7; c.posQ = 'espinhos'; c.estado = 'descanso'; c.tt = Math.max(0.9, 1.9 / vel);
    }
  } else if (c.estado === 'invocar') {
    if (Math.random() < dt * 30) emitir('brilho', c.x + rnd(0, 96), c.y + rnd(0, 96), 1, '#ff3aa0');
    if (c.tt <= 0) {
      if (inimigos.filter(e => e.vivo).length < 4) {
        ['motosserra', 'chama', 'carro', 'lixo'].sort(() => Math.random() - 0.5).slice(0, 2).forEach((tp, i) => {
          const e = criarInimigo(tp, Math.floor((i ? mapaLarg * TAM - 40 : 24) / TAM), 11);
          e.semMult = true; emitir('fumaca', e.x + 6, e.y + 6, 8, '#ff3aa0'); emitir('brilho', e.x + 6, e.y + 6, 10, '#ff3aa0');
        });
        som('serra');
      }
      c.estado = 'descanso'; c.tt = Math.max(0.9, 1.8 / vel);
    }
  }
  if (colide(retContatoChefe(), J)) danificarJogador(b);
}
