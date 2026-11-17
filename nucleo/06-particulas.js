'use strict';
/* =====================================================================
   6. PARTÍCULAS
   ===================================================================== */
let particulas = [];
function emitir(tipo, x, y, n = 1, cor = null) {
  for (let i = 0; i < n; i++) {
    if (particulas.length > 450) return;
    const p = { tipo, x: x + rnd(-2, 2), y: y + rnd(-2, 2), vx: 0, vy: 0, g: 0, vida: 1, max: 1, tam: 2, cor: '#fff' };
    switch (tipo) {
      case 'fumaca': p.vx = rnd(-6, 6); p.vy = rnd(-26, -12); p.max = p.vida = rnd(1.1, 2); p.tam = rnd(3, 5); p.cor = Math.random() < 0.5 ? '#2c2c2c' : '#454545'; break;
      case 'vapor': p.vx = rnd(-10, 10); p.vy = rnd(-35, -15); p.max = p.vida = rnd(0.6, 1.1); p.tam = rnd(2, 4); p.cor = '#e8f0f4'; break;
      case 'fagulha': p.vx = rnd(-22, 22); p.vy = rnd(-70, -25); p.g = 70; p.max = p.vida = rnd(0.4, 0.9); p.tam = Math.random() < 0.5 ? 1 : 2; p.cor = Math.random() < 0.5 ? '#ff9a2a' : '#ffd84f'; break;
      case 'folha': p.vx = rnd(-30, 30); p.vy = rnd(-60, -20); p.g = 90; p.max = p.vida = rnd(0.8, 1.6); p.tam = 2; p.cor = Math.random() < 0.5 ? '#4fb54a' : '#7fd35a'; break;
      case 'bolha': p.vx = rnd(-6, 6); p.vy = rnd(-30, -14); p.max = p.vida = rnd(0.9, 1.6); p.tam = rnd(2, 4); p.cor = '#bfe9ff'; break;
      case 'brilho': p.vx = rnd(-26, 26); p.vy = rnd(-40, 5); p.max = p.vida = rnd(0.35, 0.7); p.tam = 2; p.cor = Math.random() < 0.5 ? '#fff6a0' : '#ffd84f'; break;
      case 'poeira': p.vx = rnd(-14, 14); p.vy = rnd(-14, -2); p.max = p.vida = rnd(0.25, 0.45); p.tam = 2; p.cor = '#c9b48a'; break;
      case 'confete': p.vx = rnd(-70, 70); p.vy = rnd(-130, -50); p.g = 140; p.max = p.vida = rnd(1.2, 2.2); p.tam = Math.random() < 0.5 ? 2 : 3; p.cor = ['#ff5a8a', '#ffd84f', '#5fe0c0', '#6ad0ff', '#c08aff', '#ff9a3a'][Math.floor(Math.random() * 6)]; break;
      case 'brasa': p.vx = rnd(8, 26); p.vy = rnd(-24, -8); p.max = p.vida = rnd(1.5, 3); p.tam = 1; p.cor = '#ff8a2a'; break;
    }
    if (cor) p.cor = cor;
    particulas.push(p);
  }
}
function atualizarParticulas(dt) {
  for (const p of particulas) {
    p.vida -= dt; p.vy += p.g * dt; p.x += p.vx * dt; p.y += p.vy * dt;
    if (p.tipo === 'folha') p.x += Math.sin(p.vida * 10 + p.max) * 0.4;
    if (p.tipo === 'fumaca') p.tam += dt * 2;
  }
  particulas = particulas.filter(p => p.vida > 0);
}
function desenharParticulas() {
  for (const p of particulas) {
    const a = clamp(p.vida / p.max, 0, 1);
    ctx.globalAlpha = (p.tipo === 'fumaca' || p.tipo === 'vapor') ? a * 0.7 : a;
    const s = Math.round(p.tam);
    if (p.tipo === 'bolha') {
      ctx.strokeStyle = p.cor; ctx.lineWidth = 1;
      ctx.strokeRect(Math.round(p.x) + 0.5, Math.round(p.y) + 0.5, s, s);
    } else if (p.tipo === 'brilho') {
      ctx.fillStyle = p.cor;
      ctx.fillRect(Math.round(p.x) - 1, Math.round(p.y), 3, 1);
      ctx.fillRect(Math.round(p.x), Math.round(p.y) - 1, 1, 3);
    } else {
      ctx.fillStyle = p.cor; ctx.fillRect(Math.round(p.x), Math.round(p.y), s, s);
    }
  }
  ctx.globalAlpha = 1;
}

/* chuva de confete para comemorar */
function confete(x, y, n = 20) { emitir('confete', x, y, n); }
