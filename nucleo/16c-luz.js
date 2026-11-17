'use strict';
/* =====================================================================
   16c. LUZ E ESTÉTICA: cantos suaves, vinheta, brilho do sol, cenário do menu
   Como o canvas tem 3x a resolução lógica, aqui dá para usar degradês e curvas suaves
   sem perder o estilo pixelado dos sprites.
   ===================================================================== */
function rrect(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}
function degrade(x, y, h, topo, base) {
  const g = ctx.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, topo); g.addColorStop(1, base);
  return g;
}
/* Brilho aditivo (sol, fogo, magia) */
function brilho(x, y, r, rgb, alfa) {
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, 'rgba(' + rgb + ',' + alfa + ')'); g.addColorStop(1, 'rgba(' + rgb + ',0)');
  ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2);
  ctx.restore();
}
/* Vinheta e clima de cor por cima de tudo (menos o HUD) */
function posProcesso(calor) {
  const v = ctx.createRadialGradient(LARG / 2, ALT / 2, ALT * 0.32, LARG / 2, ALT / 2, LARG * 0.64);
  v.addColorStop(0, 'rgba(8,2,16,0)'); v.addColorStop(1, 'rgba(8,2,16,' + (0.34 + 0.22 * calor).toFixed(3) + ')');
  ctx.fillStyle = v; ctx.fillRect(0, 0, LARG, ALT);
  // calor: leve brilho alaranjado no alto; frio/limpo: brilho dourado do sol
  const alto = ctx.createLinearGradient(0, 0, 0, ALT * 0.6);
  alto.addColorStop(0, calor > 0.5 ? 'rgba(255,90,20,' + (0.10 * calor).toFixed(3) + ')' : 'rgba(255,240,170,' + (0.10 * (1 - calor)).toFixed(3) + ')');
  alto.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = alto; ctx.fillRect(0, 0, LARG, ALT * 0.6);
}

/* Nuvem suave feita de elipses */
function nuvem(x, y, esc, rgb, alfa) {
  ctx.fillStyle = 'rgba(' + rgb + ',' + alfa + ')';
  [[0, 0, 16, 5], [-10, 2, 11, 4], [11, 2, 12, 4], [3, -4, 9, 4]].forEach(([dx, dy, rx, ry]) => {
    ctx.beginPath(); ctx.ellipse(x + dx * esc, y + dy * esc, rx * esc, ry * esc, 0, 0, 7); ctx.fill();
  });
}

/* Cenário do menu e das telas de história. calor: 0 = planeta saudável, 1 = fornalha */
function cenarioMenu(calor, t) {
  const frio = ['#2d7fe0', '#82c8f2', '#d6f1d8'], quente = ['#4a0a0c', '#b82e16', '#ff9a34'];
  const g = ctx.createLinearGradient(0, 0, 0, 176);
  [0, 0.55, 1].forEach((p, i) => g.addColorStop(p, misturar(frio[i], quente[i], calor)));
  ctx.fillStyle = g; ctx.fillRect(0, 0, LARG, ALT);
  // estrelas aparecem quando o céu escurece de calor e fumaça
  if (calor > 0.55) {
    ctx.fillStyle = 'rgba(255,230,200,' + ((calor - 0.55) * 0.9).toFixed(2) + ')';
    for (let i = 0; i < 28; i++) { const h = hash(i * 13 + 5); if (Math.sin(t * 2 + i) > -0.4) ctx.fillRect(h % LARG, (h >> 8) % 70, 1, 1); }
  }
  // sol com halo
  const sx = 317, sy = 41;
  brilho(sx, sy, 70, calor > 0.5 ? '255,140,40' : '255,240,170', 0.55);
  ctx.fillStyle = misturar('#fff6c0', '#ffd24a', calor); ctx.beginPath(); ctx.arc(sx, sy, 11, 0, 7); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.beginPath(); ctx.arc(sx - 3, sy - 3, 4, 0, 7); ctx.fill();
  // raios de luz (só com o planeta mais saudável)
  if (calor < 0.6) {
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 4; i++) {
      const a = 2.35 + i * 0.16 + Math.sin(t * 0.4 + i) * 0.03;
      ctx.fillStyle = 'rgba(255,245,190,' + (0.07 * (1 - calor)).toFixed(3) + ')';
      ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx + Math.cos(a) * 320, sy + Math.sin(a) * 320); ctx.lineTo(sx + Math.cos(a + 0.07) * 320, sy + Math.sin(a + 0.07) * 320); ctx.closePath(); ctx.fill();
    }
    ctx.restore();
  }
  // nuvens (brancas) ou fumaça (escura), em parallax
  const nuv = calor > 0.5 ? ['40,20,20', 0.38] : ['255,255,255', 0.6 * (1 - calor) + 0.2];
  [[40, 28, 1], [150, 20, 0.8], [250, 52, 1.2], [350, 14, 0.7]].forEach(([x, y, e], i) => nuvem(((x - t * (3 + i * 1.4)) % (LARG + 80) + LARG + 80) % (LARG + 80) - 40, y, e, nuv[0], nuv[1]));
  // três camadas de colinas com neblina entre elas
  const camadas = [[150, 0.006, 30, '#8fbf98', '#7a3a2c', 2.5, 0.2], [158, 0.012, 24, '#5b9a66', '#58261c', 6, 0.5], [164, 0.02, 18, '#3f7a52', '#34170f', 12, 1]];
  camadas.forEach(([base, freq, amp, cf, cq, vel, op], k) => {
    ctx.fillStyle = misturar(cf, cq, calor);
    ctx.beginPath(); ctx.moveTo(0, ALT);
    for (let px = 0; px <= LARG; px += 4) ctx.lineTo(px, base - 22 - amp * 0.5 - Math.sin((px + t * vel) * freq * 3 + k) * amp * 0.5 - Math.sin((px + t * vel) * freq * 7 + k * 2) * amp * 0.2);
    ctx.lineTo(LARG, ALT); ctx.closePath(); ctx.fill();
    const n = ctx.createLinearGradient(0, base - 50, 0, base + 10);
    n.addColorStop(0, 'rgba(255,255,255,0)'); n.addColorStop(1, 'rgba(' + (calor > 0.5 ? '255,120,60' : '230,245,235') + ',' + (0.16 * (k + 1) / 3).toFixed(3) + ')');
    ctx.fillStyle = n; ctx.fillRect(0, base - 50, LARG, 60);
  });
  ctx.fillStyle = 'rgba(255,70,0,' + (0.1 * calor).toFixed(3) + ')'; ctx.fillRect(0, 0, LARG, ALT);
  posProcesso(calor);
}

/* =====================================================================
   CAPA DO JOGO: imagem de fundo (arte/capa.png), letreiro redesenhado e animado
   ===================================================================== */
ARTE.capa = new Image(); ARTE.capa.src = 'arte/capa.png';
/* Texto com contorno escuro grosso: bem mais fácil de ler sobre a arte */
function textoContorno(str, x, y, cor = '#fff', tam = 8, alinha = 'left', maxW = 0) {
  [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [1, 1], [-1, 1], [1, -1]].forEach(([ox, oy]) => texto(str, x + ox * 0.9, y + oy * 0.9, '#10060c', tam, alinha, false, maxW));
  texto(str, x, y, cor, tam, alinha, false, maxW);
}
function desenharCapa(t) {
  if (arteOk(ARTE.capa)) ctx.drawImage(ARTE.capa, 0, 0, LARG, ALT);
  else { cenarioMenu(0.5, t); chaoMenu(); }
  // nuvens suaves atrás do letreiro (as da imagem ficaram escondidas pelo título antigo)
  [[60, 40, 1.1, '255,255,255', 0.5, 3], [150, 76, 0.8, '255,255,255', 0.4, 2], [300, 34, 1.0, '60,28,34', 0.45, 2.5], [350, 70, 0.8, '60,28,34', 0.4, 3.5]].forEach(([x, y, e, rgb, al, v], i) =>
    nuvem(((x + t * v) % (LARG + 90)) - 45, y + Math.sin(t * 0.4 + i) * 2, e, rgb, al));
  // a energia entre o Davi e o Fornax pulsa devagar
  const p = Math.sin(t * 3);
  brilho(208, 151, 26 + 2 * p, '255,255,235', 0.2 + 0.08 * p);
}
/* Letreiro 3D vermelho. Balança de leve, cada letra com uma fase, e um brilho passa de tempos em tempos. */
function tituloCapa(t, y0 = 15) {
  const tam = 32, linhas = ['GUARDIÃO', 'DO CLIMA'], bob = Math.sin(t * 1.3) * 1.6;
  ctx.save();
  ctx.font = tam + 'px ' + FONTE; ctx.textBaseline = 'top'; ctx.textAlign = 'left';
  linhas.forEach((txt, li) => {
    const x0 = 192 - txt.length * tam / 2, gx = ((t * 60) % 560) - 120 - li * 24;
    for (let i = 0; i < txt.length; i++) {
      const c = txt[i]; if (c === ' ') continue;
      const x = x0 + i * tam, y = y0 + li * 36 + bob + Math.sin(t * 2 + i * 0.55 + li) * 0.9;
      ctx.fillStyle = 'rgba(10,0,10,0.32)'; ctx.fillText(c, x + 5, y + 6);                    // sombra no cenário
      ctx.fillStyle = '#12040a';                                                                 // contorno em volta da letra e da extrusão
      for (let k = 0; k <= 4; k++) [[-1.5, 0], [1.5, 0], [0, -1.5], [0, 1.5], [-1.1, -1.1], [1.1, 1.1], [-1.1, 1.1], [1.1, -1.1]].forEach(([ox, oy]) => ctx.fillText(c, x + k * 0.9 + ox, y + k * 0.9 + oy));
      ctx.fillStyle = '#7a0c20'; for (let k = 4; k >= 1; k--) ctx.fillText(c, x + k * 0.9, y + k * 0.9);   // extrusão 3D
      ctx.fillStyle = '#ff8a72'; ctx.fillText(c, x - 0.8, y - 0.8);                              // brilho na quina
      ctx.fillStyle = '#e82a2a'; ctx.fillText(c, x, y);                                          // face
      const g = Math.max(0, 1 - Math.abs(x + tam / 2 - gx) / 50);
      if (g > 0) { ctx.globalAlpha = g * 0.65; ctx.fillStyle = '#fff4d8'; ctx.fillText(c, x, y); ctx.globalAlpha = 1; }
    }
  });
  ctx.restore();
}

/* ---------- peças compartilhadas pelas telas de painel (fim de fase, curiosidade, quiz) ---------- */
function linhasTexto(str, larg, tam = 8) {
  ctx.font = tam + 'px ' + FONTE;
  const out = []; let l = '';
  for (const p of str.split(' ')) {
    const t = l ? l + ' ' + p : p;
    if (ctx.measureText(t).width > larg && l) { out.push(l); l = p; } else l = t;
  }
  if (l) out.push(l);
  return out;
}
function estrela(cx, cy, r, acesa) {
  const pts = a => { ctx.beginPath(); for (let i = 0; i < 10; i++) { const rr = i % 2 ? r * 0.45 : r, an = -Math.PI / 2 + i * Math.PI / 5; ctx.lineTo(cx + Math.cos(an) * rr, cy + Math.sin(an) * rr + a); } ctx.closePath(); };
  ctx.save(); ctx.lineJoin = 'round';
  pts(1.5); ctx.fillStyle = '#05060c'; ctx.fill(); ctx.strokeStyle = '#05060c'; ctx.lineWidth = 2.5; ctx.stroke();
  pts(0); ctx.fillStyle = acesa ? '#ffd23c' : '#3c4258'; ctx.fill();
  if (acesa) { ctx.beginPath(); ctx.moveTo(cx, cy - r * 0.8); ctx.lineTo(cx + r * 0.3, cy - r * 0.1); ctx.lineTo(cx, cy + r * 0.1); ctx.lineTo(cx - r * 0.3, cy - r * 0.1); ctx.closePath(); ctx.fillStyle = '#fff2a0'; ctx.fill(); }
  ctx.restore();
}
function lampada(cx, cy) {
  ctx.fillStyle = '#05060c'; ctx.beginPath(); ctx.arc(cx, cy, 5.5, 0, 7); ctx.fill(); ctx.fillRect(cx - 3.5, cy + 3, 7, 6);
  ctx.fillStyle = '#ffd84f'; ctx.beginPath(); ctx.arc(cx, cy, 4.3, 0, 7); ctx.fill();
  ctx.fillStyle = '#fff6b0'; ctx.fillRect(cx - 2, cy - 2, 2, 2);
  ctx.fillStyle = '#9aa0b4'; ctx.fillRect(cx - 2.5, cy + 4, 5, 4);
}
function iconeQuadrado(x, y, cor) {
  rrect(x - 5.5, y - 5.5, 11, 11, 1.5); ctx.fillStyle = '#05060c'; ctx.fill();
  rrect(x - 4.5, y - 4.5, 9, 9, 1); ctx.fillStyle = cor; ctx.fill();
}
/* botão único centralizado (Enter/Espaço/clique) */
function botaoContinuar(y, txt, acao) {
  menuGrade([{ txt, x: 192 - 39, y, w: 78, h: 15, acao }], [[0]]);
}
