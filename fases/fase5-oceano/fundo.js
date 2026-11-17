'use strict';
/* FASE 5 — O Oceano Fervendo
   Cenário de fundo com parallax desta fase. */
function fundoOceano(cx, cy, calor, base2, base3, c2, c3, T) {
    fundoEspinhos(cx, 0.3, base2, 34, 34, 40, c2, null);
    navioAfundado(cx, 0.25, base2 - 2, c2);
    fundoRecife(cx, 0.45, base3 + 4, c3, 7);
    // algas balançando e peixes
    for (let i = -1; i < LARG / 44 + 2; i++) {
      const idx = Math.floor((cx * 0.6) / 44) + i, hs = hash(idx * 19 + 2), x = Math.round(idx * 44 - cx * 0.6) + (hs % 20);
      ctx.fillStyle = misturar('#2f9a5a', '#6a8a50', calor);
      for (let k = 0; k < 10 + (hs % 6); k++) ctx.fillRect(Math.round(x + Math.sin(L.tempo * 1.6 + k * 0.5 + idx) * 3), Math.round(base3 - k * 6), 3, 7);
    }
    for (let i = 0; i < 6; i++) {                                              // cardume em parallax
      const dir = i % 2 ? 1 : -1, x = ((L.tempo * (16 + i * 3) * dir + i * 97 - cx * 0.2) % (LARG + 60) + LARG + 60) % (LARG + 60) - 30, y = 46 + i * 20 + Math.sin(L.tempo * 1.3 + i) * 4;
      desenharPeixe(x, y, dir, ['#ff9a2a', '#ff6ab8', '#4ab8ff', '#ffd84f', '#7a6aff', '#4fd8a0'][i], L.tempo * 6 + i * 2, i % 3 === 0 ? 1.3 : 1);
    }
}

/* Peixe em pixel art: corpo oval com contorno, barriga clara, nadadeiras, olho e cauda que balança */
const _peixes = {};
function peixeSprite(cor, q) {
  const k = cor + q; if (_peixes[k]) return _peixes[k];
  const W = 20, H = 12, c = document.createElement('canvas'); c.width = W; c.height = H;
  const g = c.getContext('2d'), dentro = [], cy = 6, cx = 12.5, rx = 6.6, ry = 4;
  for (let y = 0; y < H; y++) { dentro[y] = []; for (let x = 0; x < W; x++) {
    const corpo = ((x - cx) / rx) ** 2 + ((y + 0.5 - cy) / ry) ** 2 <= 1;
    const ct = 6 - x, cauda = x >= 1 && x <= 6 && Math.abs(y + 0.5 - cy - (q - 1) * (7 - x) * 0.25) <= 0.7 + ct * 0.55;
    const dorsal = x >= 10 && x <= 14 && y >= 1 && y < 3 && (y + 0.5) >= 4 - (x - 9) * 0.5 - 1.5 && y + 0.5 >= 1.2 + Math.abs(x - 12) * 0.6;
    dentro[y][x] = corpo || cauda || dorsal; } }
  const claro = misturar(cor, '#ffffff', 0.45), escuro = misturar(cor, '#10163a', 0.4);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (!dentro[y][x]) continue;
    const borda = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => !(dentro[y + dy] && dentro[y + dy][x + dx]));
    let col = cor;
    if (x <= 6 || (y < 3 && x >= 10)) col = escuro;                 // cauda e nadadeira dorsal mais escuras
    else if (y >= cy + 1.5) col = claro;                            // barriga
    else if (x >= 10 && x <= 11 && Math.abs(y - cy) <= 3) col = escuro;   // listra
    g.fillStyle = borda ? '#0c1233' : col; g.fillRect(x, y, 1, 1);
  }
  g.fillStyle = '#fff'; g.fillRect(16, 4, 2, 2); g.fillStyle = '#0c1233'; g.fillRect(17, 5, 1, 1);
  return (_peixes[k] = c);
}
function desenharPeixe(x, y, dir, cor, t, esc = 1) {
  const c = peixeSprite(cor, Math.floor(t) % 3), w = 20 * esc, h = 12 * esc;
  ctx.save(); ctx.translate(Math.round(x), Math.round(y));
  if (dir < 0) ctx.scale(-1, 1);
  ctx.drawImage(c, -w / 2, -h / 2, w, h);
  ctx.restore();
}
