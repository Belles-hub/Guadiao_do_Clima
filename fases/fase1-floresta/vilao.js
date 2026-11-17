'use strict';
/* FASE 1 — A Floresta em Chamas
   Subguardião: SERRÃO, O LENHADOR-ROBÔ (desmatamento).
   Ataques: investida com a motosserra (aviso: o motor ronca) e três toras rolando no chão (pule por cima!).
   Quando a vida chega à metade, chama dois robôs-motosserra. Ponto fraco: Lança-Sementes. */
VILOES.serrao = {
  nome: 'SERRÃO, O LENHADOR-ROBÔ', curto: 'SERRÃO', cor: '#ff7a1a', w: 40, h: 44, hp: 8, fraqueza: 'semente', range: 72,
  atualizar(v, dt) {
    const rapido = v.hp <= v.hpMax / 2 ? 1.3 : 1;
    const dxp = (J.x + J.w / 2) - (v.x + v.w / 2);
    v.tt -= dt;
    if (v.estado === 'descanso') {
      v.dir = dxp >= 0 ? 1 : -1;
      v.x += Math.sign(v.baseX - v.x) * Math.min(Math.abs(v.baseX - v.x), 22 * dt);       // volta ao centro da arena
      if (v.tt <= 0) {
        v.estado = ['carga', 'toras'][v.ataque++ % 2]; v.n = 0;
        v.tt = v.estado === 'carga' ? 0.9 : 0.5;
        if (v.estado === 'carga') som('serra');
      }
    } else if (v.estado === 'carga') {                                                     // aviso: motor ronca e solta faíscas
      v.dir = dxp >= 0 ? 1 : -1; v.shake = 0.05;
      if (Math.random() < dt * 40) emitir('fagulha', v.x + v.w / 2 + v.dir * 24, v.y + 24, 1, '#ffd84f');
      if (v.tt <= 0) {
        v.estado = 'investida'; v.tt = 1.4; v.vx = v.dir * 150 * rapido;
        if (!v.chamou && v.hp <= v.hpMax / 2) {                                           // reforços
          v.chamou = true; invocarDoVilao('motosserra', v.baseX - 90); invocarDoVilao('motosserra', v.baseX + 90);
        }
      }
    } else if (v.estado === 'investida') {
      v.x += v.vx * dt;
      if (Math.random() < dt * 30) emitir('fagulha', v.x + v.w / 2 + v.dir * 26, v.y + 26, 1, '#ffd84f');
      if (Math.abs(v.x - v.baseX) > v.range) {
        v.x = clamp(v.x, v.baseX - v.range, v.baseX + v.range); v.vx = 0;
        v.estado = 'descanso'; v.tt = 1.4 / rapido; v.shake = 0.3; som('impacto', 0.6);
      } else if (v.tt <= 0) { v.estado = 'descanso'; v.tt = 1.2; v.vx = 0; }
    } else if (v.estado === 'toras') {
      if (v.tt <= 0) {
        if (v.n < 3) {
          atirarVilao('tora', { x: v.x + v.w / 2 + v.dir * 22, y: v.y + v.h - 7, vx: v.dir * 95 * rapido });
          som('tiro'); v.n++; v.tt = 0.8 / rapido;
        } else { v.estado = 'descanso'; v.tt = 1.4 / rapido; }
      }
    }
  },
  desenhar(v) { desenharVilaoSprite('serrao', v); }
};
