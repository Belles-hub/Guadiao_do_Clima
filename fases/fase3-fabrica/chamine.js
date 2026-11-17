'use strict';
/* FASE 3 — A Fábrica de Carvão
   Chaminés que carregam e disparam raios de calor; o Escudo Solar bloqueia. Lógica e desenho. */
/* Chaminé: carrega 0,85 s (aviso) e dispara um raio de calor horizontal. O Escudo Solar bloqueia. */
function retRaio(e) { const c = 170; return { x: e.dir > 0 ? e.x + e.w : e.x - c, y: e.y + 6, w: c, h: 8 }; }
function atualizarChamine(e, dt, dx, dy, volD) {
  const perto = Math.abs(dx) < e.d.alcance && Math.abs(dy) < 90;
  if (Math.random() < dt * 5) emitir('fumaca', e.x + e.w / 2, e.y - 2, 1);
  if (e.estado === 'espera') {
    if (perto && e.cd <= 0) { e.estado = 'carga'; e.tt = 1.3; e.dir = dx >= 0 ? 1 : -1; som('carga', Math.max(0.3, volD)); }
  } else if (e.estado === 'carga') {
    e.tt -= dt;
    if (e.tt <= 0) { e.estado = 'raio'; e.tt = 0.55; som('raio', Math.max(0.35, volD)); }
  } else if (e.estado === 'raio') {
    e.tt -= dt;
    const b = retRaio(e);
    if (colide(b, J)) {
      if (J.escudo && J.dir === -e.dir) {            // escudo defende
        emitir('brilho', J.x + J.w / 2 + J.dir * 8, J.y + 10, 2, '#ffd84f'); dispararLicao('escudo');
        if (e.somT <= 0) { som('escudo'); e.somT = 0.15; }
      } else danificarJogador(e.x + e.w / 2);
    }
    if (e.tt <= 0) { e.estado = 'espera'; e.cd = 3.4 + Math.random() * 1.2; }
  }
}


function desenharChamine(e) {
  const K = '#1a1a22';
  ctx.save(); ctx.translate(Math.round(e.x), Math.round(e.y));
  const R = (c, a, b, w, h) => { ctx.fillStyle = c; ctx.fillRect(a, b, w, h); };
  R(K, 0, 4, 16, 28); R('#8a3a2a', 1, 5, 14, 26); R('#a85a3a', 1, 5, 3, 26);
  for (let k = 0; k < 7; k++) R('#6a2a1a', 1, 8 + k * 4, 14, 1);
  R(K, -2, 2, 20, 5); R('#4a4a56', -1, 3, 18, 3);
  for (let x = 0; x < 16; x += 4) { R('#e8c030', x, 27, 2, 4); R(K, x + 2, 27, 2, 4); }
  const bx = e.dir > 0 ? 14 : -6;
  R(K, bx, 6, 8, 10); R('#3a3a44', bx + 1, 7, 6, 8);
  if (e.estado === 'carga') { const k = 1 - e.tt / 1.3; R('#ff9a2a', bx + 4 - Math.round(2 * k), 10 - Math.round(2 * k), 2 + Math.round(4 * k), 2 + Math.round(4 * k)); }
  if (e.estado === 'raio') R('#fff1a0', bx + 1, 8, 6, 6);
  R(Math.floor(e.t * 4) % 2 ? '#ff3a2a' : '#5a1010', 6, -1, 4, 3);       // luz de alerta
  ctx.restore();
  if (e.estado === 'carga') {                                               // linha de aviso do raio
    const b = retRaio(e); ctx.globalAlpha = 0.4 + 0.4 * Math.sin(e.t * 30);
    for (let k = 0; k < b.w; k += 8) ret('#ff3a1a', b.x + k, b.y + 3, 4, 2);
    ctx.globalAlpha = 1;
  } else if (e.estado === 'raio') {
    const b = retRaio(e); let bx2 = b.x, w = b.w;
    if (J.escudo && J.dir === -e.dir && colide(b, J)) { if (e.dir > 0) w = Math.max(4, J.x - 2 - b.x); else { bx2 = J.x + J.w + 2; w = Math.max(4, b.x + b.w - bx2); } }
    ctx.globalAlpha = 0.5 + 0.25 * Math.sin(e.t * 50); ret('#ff3a1a', bx2, b.y - 2, w, 12); ctx.globalAlpha = 1;
    ret('#ff9a2a', bx2, b.y, w, 8); ret('#fff1a0', bx2, b.y + 2, w, 4); ret('#fff', bx2, b.y + 3, w, 2);
  }
}
