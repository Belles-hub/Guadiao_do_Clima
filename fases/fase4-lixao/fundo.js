'use strict';
/* FASE 4 — O Lixão Gigante
   Cenário de fundo com parallax desta fase. */
function fundoLixao(cx, cy, calor, base2, base3, c2, c3, T) {
    for (const [par, bs, cor, sem] of [[0.3, base2, c2, 3], [0.6, base3, c3, 5]]) {
      for (let px = 0; px < LARG; px += 4) {
        const wx = px + cx * par, alt = 30 + Math.sin(wx * 0.02) * 14 + Math.sin(wx * 0.07) * 6 + (hash(Math.floor(wx / 6) + sem) % 5) + (par > 0.5 ? 10 : 0);
        ctx.fillStyle = cor; ctx.fillRect(px, Math.round(bs - alt), 4, Math.round(alt) + 40);
        if (hash(Math.floor(wx / 4) * 7 + sem) % 9 === 0) { ctx.fillStyle = ['#e03a3a', '#3a8ae0', '#e8d83a', '#f4f4f4'][hash(Math.floor(wx / 4)) % 4]; ctx.fillRect(px, Math.round(bs - alt) + 4, 2, 2); }
      }
      fundoDetalhesLixo(cx, par, bs, sem);
      if (par < 0.5) fundoGuindaste(cx, par, bs - 10, escurecer(c3, 0.8));
      neblina(bs - 30, bs + 6, '150,160,70', 0, 0.2);
    }
    for (let i = 0; i < 6; i++) {               // sacolas plásticas voando
      const x = ((L.tempo * 16 + i * 80 - cx * 0.25) % (LARG + 40) + LARG + 40) % (LARG + 40) - 20, y = 30 + i * 20 + Math.sin(L.tempo * 2 + i) * 6;
      ret('#f4f4f4', x, y, 7, 6); ret('#cfcfd8', x + 1, y + 1, 4, 3); ret('#f4f4f4', x - 2 + Math.round(Math.sin(L.tempo * 6 + i)), y + 2, 2, 2);
    }
}
