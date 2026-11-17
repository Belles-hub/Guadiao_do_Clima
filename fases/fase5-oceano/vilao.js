'use strict';
/* FASE 5 — O Oceano Fervendo
   Subguardião: MEDUSA DE PLÁSTICO, A RAINHA DA POLUIÇÃO (plástico e aquecimento dos mares).
   Flutua pela água. Ataques: três sacolas plásticas em leque e um mergulho (ela avisa e pisca antes).
   Ponto fraco: Bolha Gelada. */
VILOES.medusa = {
  nome: 'MEDUSA DE PLÁSTICO, A RAINHA DA POLUIÇÃO', curto: 'MEDUSA', cor: '#ff6ad8', w: 44, h: 44, hp: 8, fraqueza: 'bolha', range: 62, pisavel: true,
  iniciar(v) { v.px = v.x; v.py = v.y; },
  posicaoBase(v) { return { x: v.baseX + Math.sin(v.t * 0.7) * v.range, y: v.baseY + Math.sin(v.t * 1.3) * 26 }; },
  atualizar(v, dt) {
    const rapido = v.hp <= v.hpMax / 2 ? 1.3 : 1;
    v.tt -= dt;
    const b = this.posicaoBase(v);
    if (v.estado === 'descanso') {
      v.x = b.x; v.y = b.y; v.dir = (J.x + 5) >= (v.x + v.w / 2) ? 1 : -1;
      if (Math.random() < dt * 4) emitir('bolha', v.x + rnd(6, 38), v.y + 6, 1, '#ff9ae0');
      if (v.tt <= 0) { v.estado = ['sacolas', 'aviso'][v.ataque++ % 2]; v.n = 0; v.tt = v.estado === 'sacolas' ? 0.5 : 0.9; if (v.estado === 'aviso') { v.p0 = { x: v.x, y: v.y }; v.alvo = { x: clamp(J.x - 18, v.baseX - 90, v.baseX + 90), y: clamp(J.y - 20, v.baseY - 40, v.baseY + 60) }; som('carga'); } }
    } else if (v.estado === 'sacolas') {
      if (v.tt <= 0) {
        if (v.n < 3) { const a = Math.atan2(J.y + 10 - (v.y + 34), J.x + 5 - (v.x + 22)) + (v.n - 1) * 0.28; atirarVilao('sacola', { x: v.x + 22, y: v.y + 34, vx: Math.cos(a) * 62, vy: Math.sin(a) * 62, vida: 6 }); som('bolha'); v.n++; v.tt = 0.6 / rapido; }
        else { v.estado = 'descanso'; v.tt = 1.4 / rapido; }
      }
    } else if (v.estado === 'aviso') {                                  // aviso: pisca e treme antes de mergulhar
      v.shake = 0.05;
      if (v.tt <= 0) { v.estado = 'ida'; v.tt = 0.6; som('raio', 0.5); }
    } else if (v.estado === 'ida') {
      const k = 1 - clamp(v.tt / 0.6, 0, 1);
      v.x = lerp(v.p0.x, v.alvo.x, k); v.y = lerp(v.p0.y, v.alvo.y, k);
      if (v.tt <= 0) { v.estado = 'volta'; v.tt = 1.0; }
    } else if (v.estado === 'volta') {
      const k = 1 - clamp(v.tt / 1.0, 0, 1);
      v.x = lerp(v.alvo.x, b.x, k); v.y = lerp(v.alvo.y, b.y, k);
      if (v.tt <= 0) { v.estado = 'descanso'; v.tt = 1.2 / rapido; }
    }
  },
  desenhar(v) { desenharVilaoSprite('medusa', v); }
};
