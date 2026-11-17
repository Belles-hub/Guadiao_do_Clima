'use strict';
/* FASE 2 — A Cidade da Fumaça
   Carros-monstros: paletas e desenho. A IA e a fumaça ficam em nucleo/11-inimigos.js (tipo "carro"). */
const PAL_CARRO = [
  { c: '#e03a3a', e: '#9a1a1a', l: '#ff8a7a' }, { c: '#f2c230', e: '#b08a10', l: '#ffe680' }, { c: '#3a8ae0', e: '#1a5aa0', l: '#8ac8ff' }
];

function desenharCarro(e) {
  const P = PAL_CARRO[e.pal], K = '#1a1a22', furia = e.estado === 'perseguir' || e.atk > 0, rod = Math.floor(e.t * 14) % 2;
  ctx.save(); ctx.translate(Math.round(e.x), Math.round(e.y));
  if (e.dir < 0) { ctx.translate(e.w, 0); ctx.scale(-1, 1); }
  const R = (c, a, b, w, h) => { ctx.fillStyle = c; ctx.fillRect(a, b, w, h); };
  R(K, 0, 2, 22, 9); R(P.c, 1, 3, 20, 6); R(P.l, 1, 3, 20, 1); R(P.e, 1, 8, 20, 2);
  R(K, 5, -3, 12, 6); R(P.c, 6, -2, 10, 4); R('#bfe9ff', 7, -1, 8, 3); R(K, 11, -1, 1, 3);
  R(furia ? '#ff2a1a' : '#ffee3a', 18, 4, 3, 3); R('#fff', 18, 4, 1, 1); R(K, 17, 3, 4, 1);   // faróis bravos
  R(K, 17, 8, 5, 2); R('#fff', 17, 8, 1, 1); R('#fff', 19, 8, 1, 1); R('#fff', 21, 8, 1, 1);  // dentes
  R('#333', -2, 7, 3, 2);                                                                    // escapamento
  for (const wx of [3, 14]) { R(K, wx, 8, 6, 5); R('#2a2a30', wx + 1, 9, 4, 3); R('#aab', wx + 2 + rod, 10, 1, 1); }
  ctx.restore();
}
