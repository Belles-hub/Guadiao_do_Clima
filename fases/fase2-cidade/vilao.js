'use strict';
/* FASE 2 — A Cidade da Fumaça
   Subguardião: CAPITÃO FUMAÇA, O REI DO ENGARRAFAMENTO (poluição do trânsito).
   Ele vai e volta pela rua num tempo fixo: buzina (aviso), arranca até o outro lado e depois solta uma
   cortina de fumaça que deixa Davi lento. Pule no teto dele (pisão) ou use a pedalada da Bicicleta-Turbo.
   Quando a vida chega à metade, chama um carro-monstro. */
VILOES.capitao = {
  nome: 'CAPITÃO FUMAÇA, O REI DO ENGARRAFAMENTO', curto: 'CAPITÃO', cor: '#c0c0d0', w: 56, h: 30, hp: 8, fraqueza: 'bike', range: 44,
  iniciar(v) { v.fim = 1; },
  atualizar(v, dt) {
    const rapido = v.hp <= v.hpMax / 2 ? 1.25 : 1;
    v.tt -= dt;
    if (v.estado === 'descanso') {                                       // vai para a ponta oposta da rua
      const alvo = v.baseX - v.fim * v.range;
      v.dir = v.fim;
      v.x += Math.sign(alvo - v.x) * Math.min(Math.abs(alvo - v.x), 50 * dt);
      if (v.tt <= 0) { v.estado = 'buzina'; v.tt = 0.9; som('buzina'); }
    } else if (v.estado === 'buzina') {                                  // aviso: faróis piscam e ele treme
      v.shake = 0.05;
      if (Math.random() < dt * 20) emitir('fumaca', v.x + (v.fim > 0 ? 2 : v.w - 2), v.y + 26, 1, '#222');
      if (v.tt <= 0) { v.estado = 'investida'; v.tt = 2; }
    } else if (v.estado === 'investida') {
      v.x += v.fim * 125 * rapido * dt;
      if (Math.random() < dt * 25) emitir('fumaca', v.x + (v.fim > 0 ? 2 : v.w - 2), v.y + 26, 1, '#222');
      if (Math.abs(v.x - v.baseX) >= v.range) {
        v.x = v.baseX + v.fim * v.range; v.fim = -v.fim; v.estado = 'fumaca'; v.tt = 1.2; v.shake = 0.4; som('impacto', 0.6);
        v.dir = v.fim;
        if (!v.chamou && v.hp <= v.hpMax / 2) { v.chamou = true; invocarDoVilao('carro', v.baseX + v.range + 60); }
      } else if (v.tt <= 0) v.estado = 'descanso';
    } else if (v.estado === 'fumaca') {                                  // solta nuvens de fumaça pela rua
      if (v.n === 0) {
        v.n = 1;
        for (let i = 0; i < 5; i++) nuvens.push({ x: v.baseX - 70 + i * 36, y: v.y - 6 - (i % 2) * 8, w: 20, h: 16, t: 3.4, s: Math.random() * 6 });
        som('tosse');
      }
      if (v.tt <= 0) { v.n = 0; v.estado = 'descanso'; v.tt = 1.3 / rapido; }
    }
  },
  desenhar(v) { desenharVilaoSprite('capitao', v); }
};
