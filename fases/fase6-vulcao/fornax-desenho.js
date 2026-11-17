'use strict';
/* FASE 6 — O Vulcão de Fornax
   Desenho do chefe Fornax a partir da folha de sprites (arte/fornax.png): lava à esquerda, gelo à direita e a Terra no peito. */
const COR_PONTOS_FORNAX = ['#4fd35a', '#c8c8d4', '#ffd84f', '#2fe0a0', '#6ad8ff']; // semente, bike, escudo, martelo, bolha
const FOGO_FORNAX = ['#5a1a9a', '#c1250e', '#ff5a1a', '#ffb42a', '#fff1a0'];       // do roxo ao amarelo-branco
/* 5 pontos fracos em pentágono em volta da Terra que ele carrega no peito (relativos ao canto da caixa 96x96) */
const POS_PONTOS_FORNAX = [[0, -23], [22, -7], [14, 19], [-14, 19], [-22, -7]];   // pentágono em volta da Terra (relativo ao centro dela)
/* Posição de um ponto fraco no mundo: usa o centro da Terra do quadro desenhado por último */
function posPontoFornax(c, i) {
  const gx = c.gx !== undefined ? c.gx : c.x + 48, gy = c.gy !== undefined ? c.gy : c.y + 40;
  return [gx + POS_PONTOS_FORNAX[i][0] * (c.dir || 1), gy + POS_PONTOS_FORNAX[i][1]];
}

/* Orbes de poder em volta da Terra: cada um com a cor da sua arma */
function desenharPontosFornax(gx, gy, esc, t, pontos, dir = 1) {
  const alvoIdx = pontos ? pontos.indexOf(true) : -1;
  POS_PONTOS_FORNAX.forEach(([px, py], i) => {
    const x = gx + px * esc * dir, y = gy + py * esc, ativo = !pontos || pontos[i] !== false;
    const cor = COR_PONTOS_FORNAX[i];
    ctx.save();
    if (ativo && (alvoIdx < 0 || i === alvoIdx)) {            // o orbe da vez brilha e pulsa
      const p = 0.5 + 0.5 * Math.sin(t * 6 + i);
      ctx.globalCompositeOperation = 'lighter';
      const g = ctx.createRadialGradient(x, y, 0, x, y, 12 * esc);
      g.addColorStop(0, cor); g.addColorStop(0.35, cor + 'aa'); g.addColorStop(1, cor + '00');
      ctx.globalAlpha = 0.55 + 0.35 * p; ctx.fillStyle = g; ctx.fillRect(x - 12 * esc, y - 12 * esc, 24 * esc, 24 * esc);
      ctx.restore(); ctx.save();
      ctx.fillStyle = '#10080c'; ctx.beginPath(); ctx.arc(x, y, 5.2 * esc, 0, 7); ctx.fill();
      ctx.fillStyle = cor; ctx.beginPath(); ctx.arc(x, y, 4 * esc, 0, 7); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x - 1.2 * esc, y - 1.2 * esc, 1.4 * esc, 0, 7); ctx.fill();
    } else if (ativo) {                                       // aguardando a vez
      ctx.fillStyle = '#10080c'; ctx.beginPath(); ctx.arc(x, y, 4.4 * esc, 0, 7); ctx.fill();
      ctx.fillStyle = '#5a4a58'; ctx.beginPath(); ctx.arc(x, y, 3.2 * esc, 0, 7); ctx.fill();
      ctx.fillStyle = '#8a7a88'; ctx.beginPath(); ctx.arc(x - 1 * esc, y - 1 * esc, 1 * esc, 0, 7); ctx.fill();
    } else {                                                  // cratera congelada
      ctx.fillStyle = '#10080c'; ctx.beginPath(); ctx.arc(x, y, 4.4 * esc, 0, 7); ctx.fill();
      ctx.fillStyle = '#aee4ff'; ctx.beginPath(); ctx.arc(x, y, 2.6 * esc, 0, 7); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x, y, 1 * esc, 0, 7); ctx.fill();
    }
    ctx.restore();
  });
}

/* Que quadro do atlas usar para o chefe, conforme o que ele está fazendo */
function quadroFornaxChefe(c) {
  if (c.morto) return 'fumaca';
  if (c.pos > 0) return c.posQ;
  if (c.flash > 0) return 'furia';
  switch (c.estado) {
    case 'intro': return 'idle' + (Math.floor(c.t * 4) % 4);
    case 'fogo': return c.tiros === 0 ? 'pre' : 'soco';
    case 'onda': return 'agach' + (Math.floor(c.t * 6) % 2);
    case 'invocar': return 'furia';
    default: return 'andar' + (Math.floor(c.t * 6) % 4);
  }
}

/* cx = centro, baseY = pés, esc = escala (1 = ~100 px de altura), t = tempo.
   pontos = 5 booleanos (só no chefe). ex = { quadro, tinta, forca } para escolher o quadro e dar clarão de cor. */
function desenharFornax(cx, baseY, esc, t, pontos, gelo, ex) {
  ex = ex || {};
  const nome = ex.quadro || 'idle' + (Math.floor(t * 4) % 4);
  const noChao = nome !== 'fumaca';
  const dir = ex.dir || 1;                     // 1 = olha para a esquerda (como no desenho), -1 = olha para a direita
  sombraChao(cx, baseY + 1, 78 * esc, 0.38);
  ctx.save();
  if (dir < 0) { ctx.translate(cx, 0); ctx.scale(-1, 1); ctx.translate(-cx, 0); }
  // brilho quente (esquerda) e frio (direita) em volta do corpo
  if (nome !== 'fumaca') {
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    const pul = 0.5 + 0.5 * Math.sin(t * 4);
    [[-30, '255,120,30'], [30, '70,150,255']].forEach(([dx, rgb]) => {
      const gx = cx + dx * esc, gy = baseY - 40 * esc, r = 52 * esc;
      const g = ctx.createRadialGradient(gx, gy, 0, gx, gy, r);
      g.addColorStop(0, 'rgba(' + rgb + ',' + (0.22 + 0.08 * pul) + ')'); g.addColorStop(1, 'rgba(' + rgb + ',0)');
      ctx.fillStyle = g; ctx.fillRect(gx - r, gy - r, r * 2, r * 2);
    });
    ctx.restore();
  }
  // a Terra do peito fica sempre no centro (cx), qualquer que seja a pose
  const f = ATLAS_FORNAX[nome] || ATLAS_FORNAX.idle0;
  const gx = cx, gy = baseY - (f.ay - f.gy) / ESC_TELA * esc;
  quadroArte(ARTE.fornax, ATLAS_FORNAX, nome, cx - (f.gx - f.ax) / ESC_TELA * esc, baseY, esc, 1, 1, ex.tinta, ex.forca || 0);
  ctx.restore();
  if (ex.chefe) { ex.chefe.gx = gx; ex.chefe.gy = gy; }
  if (pontos) desenharPontosFornax(gx, gy, esc, t, pontos, dir);
}
