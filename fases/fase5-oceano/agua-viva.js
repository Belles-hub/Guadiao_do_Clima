'use strict';
/* FASE 5 — O Oceano Fervendo
   Águas-vivas de plástico (desenho). A natação, o ar e as correntes ficam em nucleo/10-jogador.js. */
function desenharAguaViva(e) {
  ctx.save(); ctx.translate(Math.round(e.x), Math.round(e.y));
  const R = (c, a, b, w, h) => { ctx.fillStyle = c; ctx.fillRect(a, b, w, h); };
  const pulsa = Math.round(Math.sin(e.t * 4));
  ctx.globalAlpha = 0.85;
  [[4, 0, 6], [2, 1, 10], [1, 2, 12], [0, 3, 14], [0, 4, 14], [1, 5, 12]].forEach(([x, y, w]) => R('#f4f4ff', x - (y === 3 ? pulsa * 0 : 0), y + 1, w, 1));
  R('#ffc0ec', 2, 3, 10, 3); R('#c0e8ff', 3, 2, 8, 1); ctx.globalAlpha = 1;
  R('#fff', 3, 2, 2, 1); R('#111', 4, 5, 2, 2); R('#111', 8, 5, 2, 2); R('#e03a3a', 4, 4, 2, 1); R('#e03a3a', 8, 4, 2, 1);   // olhos bravos
  const cores = ['#ff6ad8', '#6ad8ff', '#ffe14a', '#fff'];
  for (let i = 0; i < 4; i++) for (let k = 0; k < 4; k++) R(cores[i], Math.round(1 + i * 3.6 + Math.sin(e.t * 4 + i + k * 0.7) * 1.4), 8 + k * 2, 1, 2);   // tiras de plástico
  ctx.restore();
}
