'use strict';
/* =====================================================================
   16b. AMBIENTE DINÂMICO: o cenário muda conforme o planeta esfria (objetivo do jogo!)
   Planeta quente: nuvens sujas, sol triste, nada de flores.
   Planeta saudável: nuvens brancas, sol sorrindo, flores, borboletas, pássaros e arco-íris.
   Gaia, o mascote, acompanha Davi e mostra como o planeta está se sentindo.
   ===================================================================== */
const gaia = { x: 0, y: 0, alerta: 0 };
let borboletas = [];
function reiniciarAmbienteVisual() { borboletas = []; gaia.x = J.x - 14; gaia.y = J.y - 14; gaia.alerta = 0; efeitosPoder = []; }
function atualizarAmbienteVisual(dt) {
  const c = L.calor;
  gaia.x += (J.x - J.dir * 16 - gaia.x) * Math.min(1, dt * 4);
  gaia.y += (J.y - 14 + Math.sin(L.tempo * 3) * 3 - gaia.y) * Math.min(1, dt * 4);
  gaia.alerta = Math.max(0, gaia.alerta - dt);
  const est = FASES[L.idx].tema.estilo;
  const alvo = est === 'oceano' ? 0 : Math.round((1 - c) * 6);
  if (borboletas.length < alvo && Math.random() < dt * 0.8) borboletas.push({ x: cam.x + rnd(0, LARG), y: cam.y + rnd(40, ALT * 0.6), t: Math.random() * 6, cor: ['#ff7aa8', '#ffd84f', '#6ad0ff', '#c08aff'][Math.floor(Math.random() * 4)] });
  for (const b of borboletas) { b.t += dt; b.x += (Math.sin(b.t * 1.7) * 20 + 8) * dt; b.y += Math.cos(b.t * 2.3) * 14 * dt; }
  borboletas = borboletas.filter(b => b.x > cam.x - 60 && b.x < cam.x + LARG + 60);
}

/* ---------- céu: nuvens, arco-íris, pássaros e rosto do sol ---------- */
function rostoSol(cx, cy, calor) {
  ret('#3a2a10', cx - 5, cy - 3, 2, 3); ret('#3a2a10', cx + 3, cy - 3, 2, 3);
  if (calor < 0.5) { ret('#3a2a10', cx - 4, cy + 3, 1, 1); ret('#3a2a10', cx - 3, cy + 4, 7, 1); ret('#3a2a10', cx + 4, cy + 3, 1, 1); ret('#ff8a8a', cx - 7, cy + 1, 2, 2); ret('#ff8a8a', cx + 5, cy + 1, 2, 2); }   // sorriso e bochechas
  else if (calor < 0.8) ret('#3a2a10', cx - 3, cy + 4, 7, 1);
  else { ret('#3a2a10', cx - 3, cy + 5, 7, 1); ret('#3a2a10', cx - 4, cy + 6, 1, 1); ret('#3a2a10', cx + 4, cy + 6, 1, 1); ret('#7ad0ff', cx + 8, cy - 2, 2, 4); }   // triste, com gota de suor
}
function desenharCeuVivo(calor, est) {
  if (est === 'oceano') return;
  const cx = Math.round(cam.x);
  // arco-íris quando o planeta está bem frio
  if (calor < 0.3) {
    ctx.globalAlpha = (0.3 - calor) / 0.3 * 0.55;
    ['#ff5a5a', '#ffa03a', '#ffe14a', '#5adc6a', '#4aa8ff', '#a06aff'].forEach((cor, i) => {
      const R = 150 - i * 5;
      for (let x = -R; x <= R; x += 2) { const y = Math.sqrt(R * R - x * x); ret(cor, 120 + x - (cx * 0.05) % 20, 170 - y, 3, 5); }
    });
    ctx.globalAlpha = 1;
  }
  // nuvens: sujas e escuras no calor, brancas e fofas no frio
  const corNuvem = misturar('#ffffff', '#8a7a70', calor), sombra = misturar('#dfe8f4', '#5a4a44', calor);
  for (let i = 0; i < 5; i++) {
    const x = ((i * 120 - cx * 0.1 + tempoGlobal * 4) % (LARG + 120) + LARG + 120) % (LARG + 120) - 60, y = 18 + (i * 23) % 70;
    ctx.globalAlpha = 0.9;
    ret(sombra, x, y + 6, 40, 6); ret(corNuvem, x + 4, y + 2, 32, 8); ret(corNuvem, x + 10, y - 3, 16, 8); ret(corNuvem, x + 20, y, 12, 6);
    ctx.globalAlpha = 1;
  }
  // pássaros voltam quando o planeta melhora
  if (calor < 0.6) {
    const n = Math.min(5, Math.ceil((0.6 - calor) / 0.1));
    for (let i = 0; i < n; i++) {
      const x = ((tempoGlobal * 30 + i * 90 - cx * 0.2) % (LARG + 40) + LARG + 40) % (LARG + 40) - 20, y = 40 + i * 14 + Math.sin(tempoGlobal * 3 + i) * 4, asa = Math.floor(tempoGlobal * 6 + i) % 2;
      ctx.fillStyle = '#2a2a3a';
      ctx.fillRect(Math.round(x), Math.round(y + (asa ? 0 : 1)), 2, 1); ctx.fillRect(Math.round(x) + 2, Math.round(y + 1), 2, 1); ctx.fillRect(Math.round(x) + 4, Math.round(y + (asa ? 0 : 1)), 2, 1);
    }
  }
}

/* ---------- no mundo: flores, borboletas, poderes e Gaia ---------- */
function desenharFlores(t0, t1, u0, u1) {
  const est = FASES[L.idx].tema.estilo;
  if (est === 'vulcao' && L.calor > 0.35) return;
  const lim = (1 - L.calor) * 55;
  const cores = ['#ff7aa8', '#ffd84f', '#6ad0ff', '#fff', '#c08aff'];
  for (let ty = Math.max(0, u0); ty < Math.min(mapaAlt, u1); ty++) {
    for (let tx = Math.max(0, t0 - 1); tx < Math.min(mapaLarg, t1 + 1); tx++) {
      if (grade[ty][tx] !== '#' || tile(tx, ty - 1) !== '.') continue;
      const h = hash(tx * 29 + ty * 7) % 100;
      if (h >= lim) continue;
      const px = tx * TAM + 3 + (hash(tx * 5 + ty) % 9), py = ty * TAM, cor = cores[hash(tx + ty * 3) % 5], bal = Math.round(Math.sin(L.tempo * 2 + tx) * 1);
      ret('#3fae49', px, py - 4, 1, 4); ret('#3fae49', px + 1, py - 3, 2, 1);
      ret(cor, px - 1 + bal, py - 7, 3, 3); ret('#ffd84f', px + bal, py - 6, 1, 1);
    }
  }
}
function desenharGaia(x, y, calor, esc = 1) {
  const FORMA = ['....XXXX....', '..XXXXXXXX..', '.XXXXXXXXXX.', '.XXXXXXXXXX.', 'XXXXXXXXXXXX', 'XXXXXXXXXXXX', 'XXXXXXXXXXXX', 'XXXXXXXXXXXX', '.XXXXXXXXXX.', '.XXXXXXXXXX.', '..XXXXXXXX..', '....XXXX....'];
  ctx.save(); ctx.translate(Math.round(x), Math.round(y)); ctx.scale(esc, esc);
  const mar = misturar('#4aa8ff', '#ff6a3a', calor), terra = misturar('#4fd35a', '#a0501a', calor);
  FORMA.forEach((lin, j) => { for (let i = 0; i < 12; i++) if (lin[i] === 'X') { ctx.fillStyle = mar; ctx.fillRect(i - 6, j - 6, 1, 1); } });
  ctx.fillStyle = '#14203a'; ctx.fillRect(-7, -2, 1, 4); ctx.fillRect(6, -2, 1, 4);
  ctx.fillStyle = terra; [[-3, -5], [-2, -5], [-4, -4], [-3, -4], [3, -2], [4, -2], [3, -1], [-4, 3], [-3, 4]].forEach(([a, b]) => ctx.fillRect(a, b, 1, 1));
  ctx.fillStyle = '#fff'; ctx.fillRect(-4, -1, 2, 2); ctx.fillRect(2, -1, 2, 2);
  ctx.fillStyle = '#14203a'; ctx.fillRect(-3, 0, 1, 1); ctx.fillRect(3, 0, 1, 1);
  const boca = calor < 0.4 ? [[-2, 3], [-1, 4], [0, 4], [1, 4], [2, 3]] : calor < 0.7 ? [[-2, 3], [-1, 3], [0, 3], [1, 3], [2, 3]] : [[-2, 4], [-1, 3], [0, 3], [1, 3], [2, 4]];
  ctx.fillStyle = '#5a1a1a'; boca.forEach(([a, b]) => ctx.fillRect(a, b, 1, 1));
  if (calor < 0.4) { ctx.fillStyle = '#ff8aa8'; ctx.fillRect(-6, 2, 2, 1); ctx.fillRect(4, 2, 2, 1); }
  if (calor > 0.7) { ctx.fillStyle = '#9ae0ff'; ctx.fillRect(5, -5, 1, 2); }
  ctx.restore();
}
function desenharAmbienteVisual(t0, t1, u0, u1) {
  desenharFlores(t0, t1, u0, u1);
  for (const b of borboletas) {
    const asa = Math.floor(b.t * 10) % 2;
    ret(b.cor, b.x - (asa ? 2 : 1), b.y, asa ? 2 : 1, 2); ret(b.cor, b.x + 1, b.y, asa ? 2 : 1, 2); ret('#3a2a1a', b.x, b.y, 1, 2);
  }
  desenharEfeitosPoder();
  desenharGaia(gaia.x, gaia.y, L.calor);
  if (gaia.alerta > 0) {                                      // balão de aviso quando aparece uma lição
    const bx = Math.round(gaia.x) - 5, by = Math.round(gaia.y) - 18 - Math.round(Math.abs(Math.sin(L.tempo * 8)) * 2);
    ret('#14203a', bx - 1, by - 1, 12, 12); ret('#fff', bx, by, 10, 10); ret('#ffb02a', bx + 4, by + 2, 2, 5); ret('#ffb02a', bx + 4, by + 8, 2, 1);
  }
}
