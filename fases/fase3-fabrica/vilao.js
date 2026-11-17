'use strict';
/* FASE 3 — A Fábrica de Carvão
   Subguardião: BARÃO CARVÃO, O SENHOR DAS CHAMINÉS (energia suja).
   Ataques: raio de calor (aviso de 0,9 s) e chuva de pedras de carvão (marcas vermelhas no chão mostram onde caem).
   Ponto fraco: Escudo Solar. Segure J de frente para o raio: o raio refletido machuca o Barão. */
VILOES.barao = {
  nome: 'BARÃO CARVÃO, O SENHOR DAS CHAMINÉS', curto: 'BARÃO', cor: '#ff3a2a', w: 40, h: 46, hp: 8, fraqueza: 'escudo', range: 24,
  iniciar(v) { v.refl = 0; },
  atualizar(v, dt) {
    const rapido = v.hp <= v.hpMax / 2 ? 1.3 : 1;
    const dxp = (J.x + J.w / 2) - (v.x + v.w / 2);
    v.tt -= dt;
    if (v.estado === 'descanso') {
      v.dir = dxp >= 0 ? 1 : -1;
      v.x = v.baseX + Math.sin(v.t * 0.8) * v.range;                                 // balança devagar
      if (v.tt <= 0) { v.estado = ['carga', 'pedras'][v.ataque++ % 2]; v.n = 0; v.tt = v.estado === 'carga' ? 0.9 : 0.4; v.contra = false; if (v.estado === 'carga') som('carga'); }
    } else if (v.estado === 'carga') {                                                // aviso do raio
      v.dir = dxp >= 0 ? 1 : -1; v.shake = 0.04;
      if (v.tt <= 0) { v.estado = 'feixe'; v.tt = 0.75; som('raio'); }
    } else if (v.estado === 'feixe') {
      const b = this.retRaio(v);
      if (colide(b, J)) {
        if (J.escudo && J.dir === -v.dir) {                                           // escudo bloqueia e devolve o raio
          v.refl += dt; emitir('brilho', J.x + J.w / 2 + J.dir * 8, J.y + 10, 2, '#ffd84f'); dispararLicao('escudo');
          if (v.refl >= 0.25 && !v.contra) { v.contra = true; machucarVilao(2 * armaNivel('escudo'), 'escudo'); toast('Raio refletido!', 1.5); emitir('brilho', v.x + v.w / 2, v.y + 20, 14, '#ffd84f'); }
        } else danificarJogador(v.x + v.w / 2);
      } else v.refl = 0;
      if (v.tt <= 0) { v.estado = 'descanso'; v.tt = 1.5 / rapido; v.refl = 0; }
    } else if (v.estado === 'pedras') {
      if (v.tt <= 0) {
        if (v.n < 4) {
          const ax = clamp(J.x + J.w / 2 + rnd(-36, 36), v.baseX - 110, v.baseX + 110);
          atirarVilao('pedra', { x: ax, y: v.baseY + v.h - 200, chao: v.baseY + v.h, aviso: 0.85, vida: 5 });
          v.n++; v.tt = 0.45 / rapido;
        } else { v.estado = 'descanso'; v.tt = 1.8 / rapido; }
      }
    }
  },
  retRaio(v) { return { x: v.dir > 0 ? v.x + v.w : v.x - 210, y: v.y + 14, w: 210, h: 10 }; },
  desenhar(v) { desenharVilaoSprite('barao', v); }
};
