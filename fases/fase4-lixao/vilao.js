'use strict';
/* FASE 4 — O Lixão Gigante
   Subguardião: REI DO LIXO, O MONSTRO DESCARTÁVEL (consumo e lixo).
   Ataques: pulo com onda de choque (pule a onda!) e três arremessos de lixo em arco.
   A cada 4 pontos de vida perdidos, se divide em dois monstros de lixo. Ponto fraco: Martelo da Reciclagem. */
VILOES.reilixo = {
  nome: 'REI DO LIXO, O MONSTRO DESCARTÁVEL', curto: 'REI LIXO', cor: '#8ac84a', w: 44, h: 40, hp: 10, fraqueza: 'martelo', range: 60,
  iniciar(v) { v.proxDivisao = v.hpMax - 3; },
  aoSofrer(v) {                                                           // divide-se ao perder vida
    while (v.proxDivisao > 0 && v.hp <= v.proxDivisao) {
      v.proxDivisao -= 3;
      invocarDoVilao('lixo', v.x - 28); invocarDoVilao('lixo', v.x + v.w + 28);
      toast('O Rei do Lixo se dividiu! Recicle os monstros!', 2.4); dispararLicao('multiplica');
    }
  },
  atualizar(v, dt) {
    const rapido = v.hp <= v.hpMax / 2 ? 1.25 : 1;
    const dxp = (J.x + J.w / 2) - (v.x + v.w / 2);
    v.tt -= dt;
    if (v.estado === 'descanso') {
      v.dir = dxp >= 0 ? 1 : -1; v.y = v.baseY;
      if (v.tt <= 0) { v.estado = ['agacha', 'jogar'][v.ataque++ % 2]; v.n = 0; v.tt = v.estado === 'agacha' ? 0.7 : 0.5; if (v.estado === 'agacha') som('gosma'); }
    } else if (v.estado === 'agacha') {                                    // aviso: achata antes de pular
      v.dir = dxp >= 0 ? 1 : -1;
      if (v.tt <= 0) { v.estado = 'ar'; v.vy = -270; v.vx = clamp(dxp, -90, 90) * 0.9; som('pulo'); }
    } else if (v.estado === 'ar') {
      v.vy += 700 * dt; v.x = clamp(v.x + v.vx * dt, v.baseX - v.range, v.baseX + v.range); v.y += v.vy * dt;
      if (v.y >= v.baseY) {
        v.y = v.baseY; v.vy = 0; v.vx = 0; v.shake = 0.4; som('impacto'); emitir('poeira', v.x + 22, v.y + v.h, 10);
        const gy = v.y + v.h - 6;
        projeteis.push({ x: v.x + 2, y: gy, vx: -85 * rapido, vy: 0, g: 0, vida: 4, tipo: 'onda' });          // ondas de choque
        projeteis.push({ x: v.x + v.w - 2, y: gy, vx: 85 * rapido, vy: 0, g: 0, vida: 4, tipo: 'onda' });
        v.estado = 'descanso'; v.tt = 1.5 / rapido;
      }
    } else if (v.estado === 'jogar') {
      v.dir = dxp >= 0 ? 1 : -1;
      if (v.tt <= 0) {
        if (v.n < 3) {
          const sx = v.x + v.w / 2, alvo = J.x + J.w / 2 + rnd(-10, 10);
          atirarVilao('lixoarc', { x: sx, y: v.y + 6, vx: clamp((alvo - sx) / 0.95, -140, 140), vy: -170, vida: 4 });
          som('gosma'); v.n++; v.tt = 0.7 / rapido;
        } else { v.estado = 'descanso'; v.tt = 1.4 / rapido; }
      }
    }
  },
  desenhar(v) { desenharVilaoSprite('reilixo', v); }
};
