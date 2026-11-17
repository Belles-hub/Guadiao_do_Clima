'use strict';
/* FASE 1 — A Floresta em Chamas
   Inimigos da fase 1: robôs-motosserra (3 cores) e chamas andantes (3 cores). Também usados nas invocações do chefe. */
/* Robô-motosserra: 3 variações de cor (vermelho, roxo, verde-água) */
const PAL_ROBO = [
  { corpo: '#e0302a', escuro: '#9a1a1a', luz: '#ff7a5a', detalhe: '#ffd84f', olho: '#5af0ff' },
  { corpo: '#9a3ae0', escuro: '#6a1aa0', luz: '#c98aff', detalhe: '#ff7ad8', olho: '#ffee3a' },
  { corpo: '#1fb89a', escuro: '#0f7a6a', luz: '#6af0d0', detalhe: '#ff9a2a', olho: '#ff3a3a' }
];
const CORES_FAISCA = ['#ff9a2a', '#5ad0ff', '#ff7aff'];
function desenharMotosserra(e) {
  const P = PAL_ROBO[e.pal];
  ctx.save();
  ctx.translate(Math.round(e.x), Math.round(e.y));
  if (e.dir < 0) { ctx.translate(e.w, 0); ctx.scale(-1, 1); }
  const R = (c, a, b, w, h) => { ctx.fillStyle = c; ctx.fillRect(a, b, w, h); };
  const rod = Math.floor(e.t * 12) % 2, K = '#1a1a22';
  const furia = e.estado === 'perseguir' || e.atk > 0;
  // esteiras
  R(K, 0, 13, 14, 3);
  for (let i = 0; i < 3; i++) R('#9aa0b0', 1 + i * 4 + rod, 14, 2, 1);
  // escapamento atrás
  R(K, -2, 3, 3, 6); R('#555', -1, 4, 1, 4); R(P.detalhe, -2, 2, 3, 1);
  // corpo
  R(K, 0, 4, 13, 10); R(P.corpo, 1, 5, 11, 8); R(P.luz, 1, 5, 11, 1); R(P.escuro, 1, 11, 11, 2);
  R(P.detalhe, 3, 8, 7, 1); R('#fff', 2, 6, 1, 1); R('#fff', 11, 6, 1, 1);
  // cabeça com visor brilhante e antena piscando
  R(K, 2, -1, 9, 6); R('#8a8a9a', 3, 0, 7, 4); R('#c0c0d0', 3, 0, 7, 1);
  R(furia ? '#ff2a1a' : P.olho, 6, 1, 4, 2); R('#fff', 7, 1, 1, 1);
  R(K, 5, -4, 1, 3); R(Math.floor(e.t * 6) % 2 ? P.detalhe : '#fff', 4, -5, 3, 2);
  // serra elétrica (braço) com dentes em movimento
  const ext = e.atk > 0 ? 3 : 0;
  R(K, 10, 6, 6 + ext, 5); R('#cfd4dc', 11, 7, 5 + ext, 3); R('#fff', 11, 7, 5 + ext, 1);
  for (let i = 0; i < 5 + ext; i += 2) { R('#555', 11 + i + rod, 10, 1, 1); R('#555', 12 + i - rod, 6, 1, 1); }
  if (e.atk > 0) R(P.detalhe, 16 + ext, 8, 2, 2);
  ctx.restore();
}
/* Chama andante: laranja, azul ou rosa */
const PAL_CHAMA = [null, ['#1a2a9a', '#2a6aff', '#5ad0ff', '#e8ffff'], ['#6a1a9a', '#c03ae0', '#ff7aff', '#ffe0ff']];
function desenharChamaInimigo(e) {
  desenharFogo(e.x - 1, e.y - 4, e.w + 2, e.h + 4, e.t + e.x * 0.05, 1, PAL_CHAMA[e.pal]);
  const o = e.dir > 0 ? 1 : 0;
  ret('#fff', e.x + 2, e.y + 5, 3, 3); ret('#fff', e.x + 7, e.y + 5, 3, 3);
  ret('#111', e.x + 3 + o, e.y + 6, 1, 2); ret('#111', e.x + 8 + o, e.y + 6, 1, 2);
  ret('#111', e.x + 2, e.y + 4, 3, 1); ret('#111', e.x + 7, e.y + 4, 3, 1);
}
