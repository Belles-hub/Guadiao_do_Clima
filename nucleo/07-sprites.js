'use strict';
/* =====================================================================
   7. SPRITES (desenhados por código)
   ===================================================================== */
/* Davi e Fornax agora vêm das folhas de sprites (07c-arte.js). */

/* Desenha fogo em camadas (usado pelos focos, chamas e menu) */
function desenharFogo(x, y, w, h, t, forca = 1, paleta = null) {
  const cores = paleta || ['#b81e0c', '#f2661a', '#ffc933', '#fff1a0'];
  for (let c = 0; c < cores.length; c++) {
    const k = (1 - c * (0.8 / cores.length)) * forca;
    for (let i = 0; i < w; i += 2) {
      const env = 1 - Math.abs((i - w / 2) / (w / 2)) * 0.65;
      const a = Math.max(2, h * k * env * (0.62 + 0.38 * Math.sin(t * 9 + i * 0.9 + c * 1.3)));
      ctx.fillStyle = cores[c];
      ctx.fillRect(Math.round(x + i), Math.round(y + h - a), 2, Math.round(a));
    }
  }
}

/* Ícones de materiais e armas (cx, cy = centro) */
function desenharIcone(tipo, cx, cy) {
  const R = (c, x, y, w, h) => { ctx.fillStyle = c; ctx.fillRect(Math.round(cx + x), Math.round(cy + y), w, h); };
  switch (tipo) {
    case 'vida': CORACAO.forEach((lin, j) => { for (let i = 0; i < 7; i++) if (lin[i] === 'X') R(j < 2 && i < 3 ? '#ffb0b0' : '#e0302a', -7 + i * 2, -6 + j * 2, 2, 2); }); break;
    case 'semente': R('#4a2e14', -2, -1, 4, 5); R('#8b5a2b', -1, -1, 2, 4); R('#4fb54a', 0, -4, 1, 3); R('#7fd35a', 1, -4, 2, 1); R('#7fd35a', -2, -3, 2, 1); break;
    case 'galho': for (let i = -4; i <= 3; i++) R('#7a4e24', i, -i / 2 | 0, 2, 2); R('#9a6a34', -3, 1, 2, 1); R('#5a3a18', 1, -3, 2, 1); break;
    case 'gota': R('#3aa0ff', -1, -4, 2, 2); R('#3aa0ff', -2, -2, 4, 2); R('#3aa0ff', -3, 0, 6, 3); R('#8ad0ff', -2, 0, 1, 2); R('#3aa0ff', -2, 3, 4, 1); break;
    case 'peca': R('#888', -3, -3, 6, 6); R('#bbb', -2, -2, 4, 4); R('#444', -1, -1, 2, 2); R('#888', -1, -5, 2, 2); R('#888', -1, 3, 2, 2); R('#888', -5, -1, 2, 2); R('#888', 3, -1, 2, 2); break;
    case 'bateria': R('#222', -3, -3, 6, 7); R('#4cd964', -2, -2, 4, 5); R('#ffd84f', -1, -5, 2, 2); R('#fff', -1, -1, 2, 2); break;
    case 'placa': R('#143a7a', -4, -3, 8, 7); R('#2f6fd0', -3, -2, 3, 2); R('#2f6fd0', 0, -2, 3, 2); R('#2f6fd0', -3, 1, 3, 2); R('#2f6fd0', 0, 1, 3, 2); break;
    case 'cristal': R('#7ae8ff', -1, -5, 2, 2); R('#4cc8f0', -2, -3, 4, 3); R('#2a9ad0', -3, 0, 6, 2); R('#4cc8f0', -2, 2, 4, 2); R('#e8ffff', -1, -3, 1, 3); break;
    case 'pet': R('#bfe9ff', -2, -4, 4, 8); R('#8ad0ff', -2, -1, 4, 3); R('#2a9a4a', -1, -5, 2, 2); break;
    case 'lata': R('#c0c0c8', -3, -4, 6, 8); R('#e03030', -3, -1, 6, 3); R('#fff', -3, -4, 6, 1); break;
    case 'papel': R('#f4f4f4', -3, -4, 6, 8); R('#bbb', -2, -2, 4, 1); R('#bbb', -2, 0, 4, 1); R('#bbb', -2, 2, 3, 1); break;
    case 'bolha': R('#bfe9ff', -3, -2, 6, 4); R('#bfe9ff', -2, -3, 4, 6); R('#eaffff', -2, -2, 2, 2); R('#6ab8e8', 1, 1, 1, 1); break;
    case 'concha': R('#f4a8c0', -4, -2, 8, 5); R('#fcd0e0', -3, -3, 6, 2); R('#d0809c', -3, 0, 1, 3); R('#d0809c', 0, -1, 1, 4); R('#d0809c', 3, 0, 1, 3); break;
    case 'obsidiana': desenharObsidiana(cx, cy, 1); break;
    // armas
    case 'arma_semente': case 'arma_bike': case 'arma_escudo': case 'arma_martelo': case 'arma_bolha': iconeArma(tipo.slice(5), cx, cy, 15); break;
  }
}

/* Joia de obsidiana: cristal roxo muito escuro com facetas e brilho */
function desenharObsidiana(cx, cy, esc = 1) {
  ctx.save(); ctx.translate(Math.round(cx), Math.round(cy)); ctx.scale(esc, esc);
  const P = (cor, pts) => { ctx.fillStyle = cor; ctx.beginPath(); pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath(); ctx.fill(); };
  P('#0a0616', [[0, -8], [5.5, -2], [4, 6], [0, 9], [-4, 6], [-5.5, -2]]);
  P('#2c1860', [[0, -7], [4.5, -2], [3.2, 5.3], [0, 8], [-3.2, 5.3], [-4.5, -2]]);
  P('#4a2a98', [[0, -7], [4.5, -2], [0, 0], [-4.5, -2]]);
  P('#1a0e40', [[0, 0], [3.2, 5.3], [0, 8], [-3.2, 5.3]]);
  P('#8a6ae0', [[-1, -6], [1.2, -5], [-0.6, -2.6], [-2.6, -2.8]]);
  ctx.fillStyle = '#d8c8ff'; ctx.fillRect(-2, -4, 1, 1);
  ctx.restore();
}
