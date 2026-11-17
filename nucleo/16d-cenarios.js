'use strict';
/* =====================================================================
   16d. CENÁRIOS: camadas extras de fundo (casas, pinheiros, lixo, recifes, lava...)
   Cada fase chama estas peças no seu fundo.js. Tudo em parallax e determinístico (hash).
   ===================================================================== */
/* Repete um elemento ao longo do mundo: fn(x, hash, índice) */
function repetirFundo(cx, par, tam, sem, fn) {
  for (let i = -1; i < LARG / tam + 2; i++) {
    const idx = Math.floor((cx * par) / tam) + i, hs = hash(idx * sem + 3);
    fn(idx * tam - cx * par + (hs % Math.max(1, Math.floor(tam * 0.4))), hs, idx);
  }
}
function triangulo(cor, x1, y1, x2, y2, x3, y3) {
  ctx.fillStyle = cor; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.lineTo(x3, y3); ctx.closePath(); ctx.fill();
}
/* Faixa de neblina: degradê vertical translúcido */
function neblina(y0, y1, rgb, a0, a1) {
  const g = ctx.createLinearGradient(0, y0, 0, y1);
  g.addColorStop(0, 'rgba(' + rgb + ',' + a0 + ')'); g.addColorStop(1, 'rgba(' + rgb + ',' + a1 + ')');
  ctx.fillStyle = g; ctx.fillRect(0, y0, LARG, y1 - y0);
}
/* Nuvens ou fumaça à deriva */
function nuvensDeriva(cx, par, n, yMin, yMax, rgb, alfa, vel, esc = 1) {
  for (let i = 0; i < n; i++) {
    const w = LARG + 120, x = (((i * 137 + 40) - cx * par - L.tempo * vel * (0.6 + (i % 3) * 0.3)) % w + w) % w - 60;
    nuvem(x, yMin + ((i * 53) % Math.max(1, yMax - yMin)), esc * (0.8 + (i % 3) * 0.25), rgb, alfa);
  }
}
/* Raios de luz do sol atravessando o cenário */
function raiosSol(rgb, alfa, sx = 317, sy = 41) {
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 5; i++) {
    const a = 2.25 + i * 0.17 + Math.sin(L.tempo * 0.3 + i) * 0.02;
    ctx.fillStyle = 'rgba(' + rgb + ',' + alfa + ')';
    ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx + Math.cos(a) * 340, sy + Math.sin(a) * 340); ctx.lineTo(sx + Math.cos(a + 0.07) * 340, sy + Math.sin(a + 0.07) * 340); ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}

/* ---- Fase 1: pinheiros em camadas com chamas nas copas ---- */
function fundoPinheiros(cx, par, baseY, cor, sem, alt, chamas) {
  repetirFundo(cx, par, 30, sem, (x, hs) => {
    const h = alt + (hs % 22), w = 15 + (hs % 6);
    ctx.fillStyle = cor; ctx.fillRect(Math.round(x + w / 2 - 1), Math.round(baseY - 6), 3, 40);
    for (let k = 0; k < 4; k++) {
      const ty = baseY - h + k * (h / 4.2), tw = w * (0.45 + k * 0.28);
      triangulo(cor, x + w / 2, ty - 2, x + w / 2 - tw / 2, ty + h / 3.2, x + w / 2 + tw / 2, ty + h / 3.2);
    }
    if (chamas && hs % 3 === 0) {                                       // fogo nas copas
      const f = Math.sin(L.tempo * 9 + hs) * 1.2, fy = baseY - h * 0.55;
      ctx.fillStyle = 'rgba(255,120,30,' + (0.75 * chamas).toFixed(2) + ')'; ctx.fillRect(Math.round(x + w / 2 - 2), Math.round(fy - 5 + f), 4, 6);
      ctx.fillStyle = 'rgba(255,220,90,' + (0.8 * chamas).toFixed(2) + ')'; ctx.fillRect(Math.round(x + w / 2 - 1), Math.round(fy - 3 + f), 2, 3);
    }
  });
}

/* ---- Fase 2: casinhas com telhado colorido e janelas acesas ---- */
function fundoCasas(cx, par, baseY, calor, sem) {
  repetirFundo(cx, par, 72, sem, (x, hs) => {
    const w = 34 + (hs % 14), h = 20 + (hs % 10);
    const parede = escurecer(misturar('#b8a890', '#6a5a52', calor), 0.62);
    const telha = escurecer(['#c04a30', '#3e62a8', '#8a6a3a'][hs % 3], 0.6 + 0.1 * (1 - calor));
    ctx.fillStyle = '#10080c'; ctx.fillRect(Math.round(x) - 1, Math.round(baseY - h) - 1, w + 2, h + 40);
    ctx.fillStyle = parede; ctx.fillRect(Math.round(x), Math.round(baseY - h), w, h + 40);
    triangulo('#10080c', x - 5, baseY - h + 1, x + w / 2, baseY - h - 17, x + w + 5, baseY - h + 1);
    triangulo(telha, x - 3, baseY - h, x + w / 2, baseY - h - 15, x + w + 3, baseY - h);
    ctx.fillStyle = '#4a2a1a'; ctx.fillRect(Math.round(x + w / 2 - 3), Math.round(baseY - 12), 6, 12);
    for (let k = 0; k < 2; k++) {
      const lit = ((hs >> (k + 2)) & 1) || calor > 0.5;
      ctx.fillStyle = lit ? '#ffd870' : '#2a3050'; ctx.fillRect(Math.round(x + 5 + k * (w - 15)), Math.round(baseY - h + 6), 6, 7);
      ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillRect(Math.round(x + 5 + k * (w - 15)) + 2, Math.round(baseY - h + 6), 1, 7);
    }
    if (hs % 4 === 0) { ctx.fillStyle = parede; ctx.fillRect(Math.round(x + w - 9), Math.round(baseY - h - 14), 5, 8); }   // chaminé
  });
}
/* Postes de luz da cidade, com brilho */
function fundoPostes(cx, par, baseY, sem) {
  repetirFundo(cx, par, 56, sem, (x, hs) => {
    ctx.fillStyle = '#1c1820'; ctx.fillRect(Math.round(x), Math.round(baseY - 24), 2, 28); ctx.fillRect(Math.round(x), Math.round(baseY - 24), 7, 2);
    ctx.fillStyle = '#ffe9a0'; ctx.fillRect(Math.round(x + 5), Math.round(baseY - 22), 3, 2);
    brilho(x + 6.5, baseY - 20, 14, '255,225,150', 0.35);
  });
}

/* ---- Fase 3: fornalhas com janelas incandescentes, canos e fumaça ---- */
function fundoFornalhas(cx, par, baseY, calor, sem) {
  repetirFundo(cx, par, 84, sem, (x, hs) => {
    const w = 44 + (hs % 18), h = 24 + (hs % 14);
    ctx.fillStyle = '#12080a'; ctx.fillRect(Math.round(x) - 1, Math.round(baseY - h) - 1, w + 2, h + 40);
    ctx.fillStyle = '#2a1618'; ctx.fillRect(Math.round(x), Math.round(baseY - h), w, h + 40);
    ctx.fillStyle = '#3a2026'; ctx.fillRect(Math.round(x), Math.round(baseY - h), w, 3);
    for (let k = 0; k < 3; k++) {                                       // janelas de fornalha
      const pul = 0.6 + 0.4 * Math.sin(L.tempo * 3 + hs + k * 2);
      ctx.fillStyle = 'rgba(255,' + Math.round(110 + 60 * pul) + ',30,' + (0.55 + 0.4 * calor).toFixed(2) + ')';
      ctx.fillRect(Math.round(x + 5 + k * 14), Math.round(baseY - h + 8), 9, 6);
    }
    ctx.fillStyle = '#3a2a30'; ctx.fillRect(Math.round(x - 6), Math.round(baseY - 12), w + 12, 3);      // cano
    ctx.fillRect(Math.round(x + w + 3), Math.round(baseY - h - 6), 3, 14);
    if (hs % 2 === 0) nuvem(x + w / 2 + Math.sin(L.tempo * 0.6 + hs) * 4, baseY - h - 18 - (L.tempo * 6 + hs) % 14, 0.5, '40,30,32', 0.4);
  });
}

/* ---- Fase 4: montes de lixo com pneus, garrafas e sacolas ---- */
function fundoDetalhesLixo(cx, par, baseY, sem) {
  repetirFundo(cx, par, 40, sem, (x, hs) => {
    const y = baseY - 26 - (hs % 18);
    if (hs % 3 === 0) { ctx.fillStyle = '#14141a'; ctx.beginPath(); ctx.arc(x, y, 5, 0, 7); ctx.fill(); ctx.fillStyle = '#3a3a44'; ctx.beginPath(); ctx.arc(x, y, 2.2, 0, 7); ctx.fill(); }
    else if (hs % 3 === 1) { ctx.fillStyle = '#7ac0e8'; ctx.fillRect(Math.round(x), Math.round(y), 3, 8); ctx.fillStyle = '#e8f4ff'; ctx.fillRect(Math.round(x), Math.round(y), 1, 6); }
    else { ctx.fillStyle = '#b8864a'; ctx.fillRect(Math.round(x), Math.round(y), 9, 6); ctx.fillStyle = '#8a6030'; ctx.fillRect(Math.round(x), Math.round(y) + 3, 9, 1); }
  });
  for (let i = 0; i < 3; i++) {                                         // urubus voando em círculos
    const x = ((L.tempo * 10 + i * 130 - cx * 0.1) % (LARG + 60) + LARG + 60) % (LARG + 60) - 30, y = 34 + i * 16 + Math.sin(L.tempo * 1.4 + i) * 5, b = Math.sin(L.tempo * 7 + i) > 0 ? 2 : -1;
    ctx.fillStyle = '#16161c'; ctx.fillRect(Math.round(x), Math.round(y), 3, 2); ctx.fillRect(Math.round(x) - 4, Math.round(y) + b, 4, 1); ctx.fillRect(Math.round(x) + 3, Math.round(y) + b, 4, 1);
  }
}

/* ---- Fase 5: recifes de coral e um navio naufragado ---- */
function fundoRecife(cx, par, baseY, cor, sem) {
  repetirFundo(cx, par, 46, sem, (x, hs) => {
    const cores = [escurecer('#e0607a', 0.5), escurecer('#e08a3a', 0.5), escurecer('#a060d0', 0.5)], c = cores[hs % 3];
    for (let k = 0; k < 3; k++) {
      const bx = x + k * 7, bh = 14 + ((hs >> k) % 16), bal = Math.sin(L.tempo * 1.2 + k + hs) * 1.2;
      ctx.fillStyle = c; ctx.fillRect(Math.round(bx), Math.round(baseY - bh), 3, bh + 20);
      ctx.fillRect(Math.round(bx - 3 + bal), Math.round(baseY - bh + 5), 3, 2); ctx.fillRect(Math.round(bx + 3 + bal), Math.round(baseY - bh + 9), 3, 2);
      ctx.beginPath(); ctx.arc(bx + 1.5 + bal, baseY - bh, 3.2, 0, 7); ctx.fill();
    }
  });
}
function navioAfundado(cx, par, baseY, cor) {
  const x = 150 - cx * par;
  if (x < -90 || x > LARG + 40) return;
  ctx.fillStyle = cor;
  ctx.beginPath(); ctx.moveTo(x, baseY - 18); ctx.lineTo(x + 70, baseY - 22); ctx.lineTo(x + 58, baseY + 2); ctx.lineTo(x + 8, baseY + 2); ctx.closePath(); ctx.fill();
  ctx.fillRect(Math.round(x + 30), Math.round(baseY - 56), 3, 36); ctx.fillRect(Math.round(x + 14), Math.round(baseY - 40), 3, 22);
  triangulo(cor, x + 33, baseY - 54, x + 33, baseY - 30, x + 52, baseY - 30);
  ctx.fillStyle = 'rgba(160,220,255,0.35)'; for (let k = 0; k < 4; k++) ctx.fillRect(Math.round(x + 14 + k * 11), Math.round(baseY - 14), 4, 3);   // vigias
}

/* ---- Fase 6: cascatas de lava, rachaduras brilhantes e cinzas ---- */
function fundoCascatasLava(cx, par, baseY, calor, sem) {
  repetirFundo(cx, par, 90, sem, (x, hs) => {
    const alt = 50 + (hs % 30), pul = 0.65 + 0.35 * Math.sin(L.tempo * 2 + hs);
    ctx.fillStyle = 'rgba(255,110,20,' + (0.5 * calor * pul).toFixed(2) + ')'; ctx.fillRect(Math.round(x), Math.round(baseY - alt), 3, alt + 10);
    ctx.fillStyle = 'rgba(255,220,100,' + (0.55 * calor * pul).toFixed(2) + ')'; ctx.fillRect(Math.round(x) + 1, Math.round(baseY - alt), 1, alt + 10);
    brilho(x + 1.5, baseY + 4, 14, '255,110,20', 0.25 * calor);
  });
  for (let i = 0; i < 10; i++) {                                        // cinzas caindo
    const x = ((i * 53 + L.tempo * 7 - cx * 0.3) % (LARG + 20) + LARG + 20) % (LARG + 20) - 10, y = ((L.tempo * (14 + i % 4 * 4) + i * 31) % ALT);
    ctx.fillStyle = 'rgba(40,30,34,0.6)'; ctx.fillRect(Math.round(x), Math.round(y), 2, 2);
  }
}

/* Guindaste do lixão com a caçamba balançando */
function fundoGuindaste(cx, par, baseY, cor) {
  const x = ((420 - cx * par) % 520 + 520) % 520 - 60;
  const amarelo = misturar(cor, '#d8a828', 0.75), y0 = Math.round(baseY - 104), xi = Math.round(x);
  ctx.fillStyle = cor;                                         // contorno escuro
  ctx.fillRect(xi - 1, y0 - 1, 8, 114); ctx.fillRect(xi - 82, y0 - 1, 90, 7);
  ctx.fillStyle = amarelo;
  ctx.fillRect(xi, y0, 6, 112); ctx.fillRect(xi - 80, y0, 86, 5);
  for (let i = 0; i < 112; i += 8) { ctx.fillStyle = cor; ctx.fillRect(xi + (i % 16 ? 1 : 3), y0 + i, 2, 3); }   // treliça
  for (let i = -80; i < 0; i += 8) { ctx.fillStyle = cor; ctx.fillRect(xi + i, y0 + 1, 2, 3); }
  triangulo(amarelo, x - 2, y0, x + 26, y0, x + 4, y0 - 18);
  const bal = Math.sin(L.tempo * 1.1) * 2.5, bx = x - 66 + bal;
  ctx.fillStyle = cor; ctx.fillRect(Math.round(bx), y0 + 5, 1, 28);
  ctx.fillStyle = '#e03a2a'; ctx.beginPath(); ctx.moveTo(bx - 8, y0 + 33); ctx.lineTo(bx + 9, y0 + 33); ctx.lineTo(bx + 6, y0 + 46); ctx.lineTo(bx - 5, y0 + 46); ctx.closePath(); ctx.fill();
}
/* Lixeiras coloridas da coleta seletiva (perto da bandeira, fase 4) */
function lixeirasColoridas(x, y) {
  ['#3a7ae0', '#e03a3a', '#e8c83a', '#3fae49'].forEach((c, i) => {
    const bx = x + i * 14;
    ctx.fillStyle = '#10080c'; ctx.fillRect(bx - 1, y - 21, 14, 22);
    ctx.fillStyle = c; ctx.fillRect(bx, y - 17, 12, 17);
    ctx.fillStyle = escurecer(c, 0.7); ctx.fillRect(bx - 1, y - 20, 14, 4);
    ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.fillRect(bx + 1, y - 16, 1, 14);
    ctx.fillStyle = '#f4f4f8'; ctx.fillRect(bx + 4, y - 11, 4, 4); ctx.fillStyle = c; ctx.fillRect(bx + 5, y - 10, 2, 2);
  });
}
