'use strict';
/* =====================================================================
   16. DESENHO DA FASE: fundo com parallax, mundo, entidades
   ===================================================================== */
const COR_FUNDO = (par, calor) => misturar(par[1], par[0], calor);

/* Prédios ou blocos de fábrica em parallax */
function fundoPredios(cx, cy, par, baseY, tam, hMin, hVar, cor, janelas, semente) {
  for (let i = -1; i < LARG / tam + 2; i++) {
    const idx = Math.floor((cx * par) / tam) + i, hs = hash(idx * semente + 3);
    const w = tam - 4 - (hs % 6), h = hMin + (hs % hVar), x = Math.round(idx * tam - cx * par), top = Math.round(baseY - h);
    ctx.fillStyle = cor; ctx.fillRect(x, top, w, h + 40);
    if (hs % 4 === 0) ctx.fillRect(x + (w >> 1), top - 8, 1, 8);         // antena
    if (janelas) {
      for (let wy = top + 4; wy < baseY - 4; wy += 6) for (let wx = x + 3; wx < x + w - 3; wx += 5) {
        if (hash(idx * 31 + wy * 7 + wx) % 3 === 0) { ctx.fillStyle = 'rgba(255,230,128,0.8)'; ctx.fillRect(wx, wy, 2, 3); }
      }
    }
  }
}
/* Chaminés com colunas de fumaça e luzes vermelhas piscando */
function fundoChamines(cx, par, baseY, tam, hMin, hVar, cor, semente) {
  for (let i = -1; i < LARG / tam + 2; i++) {
    const idx = Math.floor((cx * par) / tam) + i, hs = hash(idx * semente + 5);
    const h = hMin + (hs % hVar), x = Math.round(idx * tam - cx * par) + (hs % 12), top = Math.round(baseY - h);
    ctx.fillStyle = cor; ctx.fillRect(x, top, 10, h + 40); ctx.fillRect(x - 2, top - 3, 14, 4);
    ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.fillRect(x + 1, top, 2, h);
    ctx.fillStyle = 'rgba(30,30,34,0.35)';
    for (let k = 0; k < 6; k++) { const o = Math.sin(L.tempo * 0.8 + k + idx) * 4; ctx.fillRect(Math.round(x + 1 + o), Math.round(top - 8 - k * 9), 8 + k * 2, 9); }
    if (Math.floor(L.tempo * 2 + idx) % 2) { ctx.fillStyle = '#ff3a2a'; ctx.fillRect(x + 4, top - 6, 3, 3); }
  }
}
/* Espinhos/pilares pontudos (corais distantes, rochas do vulcão) */
function fundoEspinhos(cx, par, baseY, tam, hMin, hVar, cor, ponta) {
  for (let i = -1; i < LARG / tam + 2; i++) {
    const idx = Math.floor((cx * par) / tam) + i, hs = hash(idx * 17 + 9);
    const h = hMin + (hs % hVar), x = Math.round(idx * tam - cx * par) + (hs % 10);
    ctx.fillStyle = cor;
    for (let yy = 0; yy < h; yy += 3) { const w = Math.max(2, Math.round(10 * (1 - yy / h)) + 2); ctx.fillRect(x + 6 - (w >> 1), Math.round(baseY - yy), w, 3); }
    ctx.fillRect(x - 2, Math.round(baseY), 16, 40);
    if (ponta) { ctx.fillStyle = ponta; ctx.fillRect(x + 5, Math.round(baseY - h), 2, 3); }
  }
}
function desenharFundo(calor) {
  const T = FASES[L.idx].tema, est = T.estilo;
  const cx = Math.round(cam.x), cy = Math.round(cam.y);
  // camada 0: céu (faixas), muda de cor conforme o calor
  const faixas = 27, h = Math.ceil(ALT / faixas);
  for (let i = 0; i < faixas; i++) {
    const t = i / (faixas - 1);
    const q = hex(T.ceuQuente[0]), q2 = hex(T.ceuQuente[1]), f = hex(T.ceuFrio[0]), f2 = hex(T.ceuFrio[1]);
    const hexq = '#' + [0, 1, 2].map(k => Math.round(lerp(q[k], q2[k], t)).toString(16).padStart(2, '0')).join('');
    const hexf = '#' + [0, 1, 2].map(k => Math.round(lerp(f[k], f2[k], t)).toString(16).padStart(2, '0')).join('');
    ctx.fillStyle = misturar(hexf, hexq, calor);
    ctx.fillRect(0, i * h, LARG, h + 1);
  }
  // sol / lua de calor (não aparece embaixo d'água)
  if (est !== 'oceano') {
    const solY = 38 + (1 - calor) * -6, cs = misturar('#fff3b0', T.sol, calor);
    ret(cs, 300, solY, 20, 20); ret(cs, 297, solY + 3, 26, 14); ret(cs, 303, solY - 3, 14, 26);
    rostoSol(310, solY + 10, calor);
  } else {                                        // raios de luz atravessando a água
    ctx.globalAlpha = 0.07;
    for (let k = 0; k < 5; k++) { const x0 = k * 90 - ((cx * 0.1) % 90); for (let y = 0; y < ALT; y += 4) ret('#cfeaff', x0 + y * 0.35 + Math.sin(L.tempo + k) * 6, y, 18, 4); }
    ctx.globalAlpha = 1;
  }
  desenharCeuVivo(calor, est);
  // camada 1: montanhas distantes (parallax 0.15)
  const base = 190 - cy * 0.45, amp = est === 'vulcao' ? 1.7 : 1;
  for (let px = 0; px < LARG; px += 4) {
    const wx = px + cx * 0.15;
    const alt = (38 + Math.sin(wx * 0.012) * 24 + Math.sin(wx * 0.031 + 1) * 12 + Math.sin(wx * 0.07) * 4) * amp;
    ctx.fillStyle = COR_FUNDO(T.montanha, calor);
    ctx.fillRect(px, Math.round(base - alt), 4, Math.round(alt) + 40);
    if (est === 'vulcao' && alt > 62 * amp * 0.8) { ctx.fillStyle = 'rgba(255,90,20,' + (0.5 * calor) + ')'; ctx.fillRect(px, Math.round(base - alt), 4, 2); }   // cratera brilhando
  }
  // camadas 2 e 3: estruturas de cada cenário
  const base2 = 196 - cy * 0.7, base3 = 198 - cy * 0.85;
  const c2 = COR_FUNDO(T.arvoreLonge, calor), c3 = COR_FUNDO(T.arvorePerto, calor);
  FASES[L.idx].fundo(cx, cy, calor, base2, base3, c2, c3, T);   // cenário específico de cada fase (fases/*/fundo.js)
}

/* ---------- desenho de monstros e objetivos novos ---------- */
function desenharObjetivo(f) {
  const t = f.t, R = ret, fl = f.flash > 0;
  if (f.tipo === 'fogo') {
    if (!f.apagado) { desenharFogo(f.x + 1, f.y - 8, 14, 24, t); R('#2a1a10', f.x + 2, f.y + 14, 12, 2); }
    else {
      R('#3a2410', f.x + 3, f.y + 14, 10, 2);
      R('#4fb54a', f.x + 7, f.y + 8, 2, 6); R('#7fd35a', f.x + 4, f.y + 8, 3, 2); R('#7fd35a', f.x + 9, f.y + 6, 3, 2);
      if (Math.random() < 0.02) emitir('vapor', f.x + 8, f.y + 8, 1);
    }
  } else if (f.tipo === 'bairro') {
    const puffs = [[2, 8, 12, 10], [8, 3, 12, 12], [14, 6, 12, 12], [18, 10, 10, 10], [0, 12, 10, 8], [10, 12, 12, 8]];
    if (!f.apagado) {                                   // nuvem de poluição com olhos vermelhos
      puffs.forEach(([x, y, w, h], i) => { const o = Math.round(Math.sin(t * 2 + i)); R(fl ? '#fff' : '#101014', f.x + x - 1, f.y + y + o - 1, w + 2, h + 2); });
      puffs.forEach(([x, y, w, h], i) => { const o = Math.round(Math.sin(t * 2 + i)); R(fl ? '#ddd' : '#2e2e36', f.x + x, f.y + y + o, w, h); R(fl ? '#fff' : '#4a4a56', f.x + x, f.y + y + o, w, 2); });
      R('#ff3a3a', f.x + 8, f.y + 10, 3, 3); R('#ff3a3a', f.x + 17, f.y + 10, 3, 3); R('#101014', f.x + 9, f.y + 11, 1, 1); R('#101014', f.x + 18, f.y + 11, 1, 1);
      for (let k = 0; k < 4; k++) R('#101014', f.x + 9 + k * 3, f.y + 16 + (k % 2), 2, 1);
    } else {                                            // ar limpo: nuvem branca e sol
      puffs.slice(0, 4).forEach(([x, y, w, h]) => { R('#e8f4ff', f.x + x, f.y + y - 4, w - 2, h - 3); });
      R('#ffe14a', f.x + 20, f.y, 5, 5); R('#fff6a0', f.x + 21, f.y + 1, 3, 3);
      if (Math.random() < 0.05) emitir('brilho', f.x + rnd(0, 26), f.y + rnd(0, 18), 1);
    }
  } else if (f.tipo === 'gerador') {
    R('#101014', f.x - 1, f.y + 6, 18, 19); R(f.apagado ? '#4a4a52' : '#6a5a5a', f.x, f.y + 7, 16, 17);
    R(fl ? '#fff' : (f.apagado ? '#5a5a62' : '#8a7a7a'), f.x, f.y + 7, 16, 2);
    R('#101014', f.x + 10, f.y, 5, 8); R('#4a4a56', f.x + 11, f.y + 1, 3, 7);
    R('#222', f.x + 3, f.y + 12, 10, 6); R(f.apagado ? '#2a5a2a' : '#3a1010', f.x + 4, f.y + 13, 8, 4);
    R(f.apagado ? '#4cd964' : (Math.floor(t * 4) % 2 ? '#ff3a2a' : '#7a1a14'), f.x + 7, f.y + 14, 2, 2);
    for (let k = 0; k < f.hp; k++) R('#ffd84f', f.x + 1 + k * 4, f.y + 21, 3, 2);     // vida restante
    if (f.apagado) R('#101014', f.x + 3, f.y + 20, 10, 1);
  } else if (f.tipo === 'recife') {
    const viv = f.apagado, c1 = viv ? '#ff6aa0' : '#e8e8e0', c2 = viv ? '#ff9a3a' : '#c8c8c0', c3 = viv ? '#b060e0' : '#d8d8d0';
    const gx = f.x, gy = f.y + f.h;
    R('#101018', gx + 7, gy - 14, 6, 14); R(c1, gx + 8, gy - 13, 4, 13); R('#101018', gx + 1, gy - 10, 5, 10); R(c2, gx + 2, gy - 9, 3, 9);
    R('#101018', gx + 14, gy - 12, 5, 12); R(c3, gx + 15, gy - 11, 3, 11); R(c1, gx + 3, gy - 12, 2, 3); R(c3, gx + 9, gy - 17, 2, 4);
    R(c2, gx + 16, gy - 15, 2, 4);
    if (viv) { R('#fff', gx + 9, gy - 12, 1, 1); R('#fff', gx + 3, gy - 8, 1, 1); }
    else if (Math.floor(t * 2) % 2) R('#aaa', gx + 8, gy - 20, 1, 3);   // fica "triste"
  }
}
/* Fundo das esteiras, lava e correntes (tiles animados) */
function desenharTileAnimado(c, px, py, t, acima) {
  const R = ret;
  if (c === '>' || c === '<') {
    const d = c === '>' ? 1 : -1;
    R('#1a1a22', px, py, 16, 16); R('#3a3a46', px, py + 1, 16, 5); R('#4a4a58', px, py + 6, 16, 10);
    for (let x = 0; x < 16; x += 8) { const sx = (((x + t * 26 * d) % 16) + 16) % 16; R('#e8c030', px + sx, py + 2, 3, 3); R('#1a1a22', px + sx + (d > 0 ? 1 : 0), py + 3, 1, 1); }
    R('#9a9aa8', px + 2, py + 10, 2, 2); R('#9a9aa8', px + 12, py + 10, 2, 2); R('rgba(0,0,0,0.38)', px, py + 15, 16, 1);
  } else if (c === 'W') {
    R('#a81a0a', px, py, 16, 16); R('#e0401a', px, py + 3, 16, 13);
    for (let x = 0; x < 16; x += 4) { const yy = Math.round(Math.sin(t * 3 + (px + x) * 0.25) * 1.6); R('#ffb42a', px + x, py + yy + (acima ? 1 : 0), 4, 2); R('#ffe14a', px + x + 1, py + yy + (acima ? 1 : 0), 2, 1); }
    if (Math.random() < 0.01) emitir('fagulha', px + rnd(0, 16), py + 2, 1);
  } else {           // correntes de água quente: faixas laranja translúcidas
    ctx.globalAlpha = 0.3;
    for (let k = 0; k < 3; k++) {
      const pos = (t * 42 + k * 6 + px * 3) % 16;
      if (c === 'R') R('#ffb070', px + pos, py + 3 + k * 5, 7, 1);
      else if (c === 'L') R('#ffb070', px + 16 - pos - 7, py + 3 + k * 5, 7, 1);
      else R('#ffb070', px + 3 + k * 5, py + 16 - pos, 1, 7);
    }
    ctx.globalAlpha = 0.08; R('#ff7a3a', px, py, 16, 16); ctx.globalAlpha = 1;
  }
}
function desenharMundo() {
  const cx = Math.round(cam.x), cy = Math.round(cam.y);
  const t0 = Math.floor(cx / TAM), t1 = Math.ceil((cx + LARG) / TAM);
  const u0 = Math.floor(cy / TAM), u1 = Math.ceil((cy + ALT) / TAM);
  const est = FASES[L.idx].tema.estilo;
  ctx.save(); ctx.translate(-cx, -cy);
  // decoração do terreno
  for (let ty = Math.max(0, u0); ty < Math.min(mapaAlt, u1); ty++) {
    for (let tx = Math.max(0, t0 - 1); tx < Math.min(mapaLarg, t1 + 1); tx++) {
      const c = grade[ty][tx];
      if (c === '#' && tile(tx, ty - 1) === '.') {
        const h = hash(tx * 31 + ty) % 11, px = tx * TAM, py = ty * TAM;
        if (est === 'floresta') {
          if (h === 2) { ret('#5a3a1e', px + 4, py - 6, 8, 6); ret('#7a5028', px + 4, py - 7, 8, 2); ret('#3a2410', px + 4, py - 1, 8, 1); ret('#a87840', px + 6, py - 6, 4, 1); } // toco cortado
          else if (h === 6 && L.calor > 0.5) { ret('#2a1a10', px + 7, py - 8, 2, 8); ret('#2a1a10', px + 4, py - 6, 3, 1); ret('#2a1a10', px + 9, py - 4, 3, 1); }
          else if (h === 8) { ret(L.calor > 0.5 ? '#5a4a1e' : '#4fb54a', px + 5, py - 3, 6, 3); ret(L.calor > 0.5 ? '#7a6a2e' : '#7fd35a', px + 7, py - 4, 2, 1); }
        } else if (est === 'cidade' && h === 2) { ret('#c03030', px + 5, py - 7, 6, 7); ret('#e05050', px + 5, py - 7, 6, 2); ret('#ddd', px + 4, py - 5, 8, 1); }   // hidrante
        else if (est === 'lixao' && h < 3) { ret(['#e03a3a', '#3a8ae0', '#e8d83a'][h], px + 4 + h * 2, py - 4, 3, 4); ret('#fff', px + 5 + h * 2, py - 5, 1, 1); }
        else if (est === 'oceano' && h < 4) { for (let k = 0; k < 3; k++) ret('#2f9a5a', px + 3 + k * 4 + Math.round(Math.sin(L.tempo * 2 + k + tx)), py - 6 + k % 2, 2, 6 - k % 2); }
        else if (est === 'fabrica' && h === 2) { ret('#444', px + 5, py - 5, 6, 5); ret('#e8c030', px + 5, py - 3, 6, 1); }
        else if (est === 'vulcao' && h < 2) { ret('#3a2020', px + 5, py - 5, 6, 5); ret('#ff5a1a', px + 7, py - 5, 2, 1); }
      }
    }
  }
  for (let ty = Math.max(0, u0); ty < Math.min(mapaAlt, u1); ty++) {
    for (let tx = Math.max(0, t0); tx < Math.min(mapaLarg, t1); tx++) {
      const c = grade[ty][tx];
      if (c === '.') continue;
      if ('><WRLU'.includes(c)) { desenharTileAnimado(c, tx * TAM, ty * TAM, L.tempo, tile(tx, ty - 1) !== 'W'); continue; }
      const vis = (c === '#' && eSolido(tile(tx, ty - 1))) ? 'D' : c;
      ctx.drawImage(tiles[vis][hash(tx * 131 + ty * 7) & 3], tx * TAM, ty * TAM);
    }
  }
  // bandeira de chegada
  const b = L.bandeira, ok = L.progresso >= L.total && (!vilao || vilao.morto) && !(FASES[L.idx].arma >= 0 && !salvo.armas[ARMAS[FASES[L.idx].arma].id]);
  if (b.x > 0) {
    if (FASES[L.idx].tema.estilo === 'lixao') lixeirasColoridas(b.x - 62, b.y + 48);
    ret('#6a4a2a', b.x + 7, b.y, 2, 48); ret('#ffd84f', b.x + 6, b.y - 2, 4, 3);
    const onda = Math.sin(L.tempo * 5);
    for (let i = 0; i < 10; i++) ret(ok ? '#3fae49' : '#555', b.x + 9 + i, b.y + 2 + i * 0.4 + Math.round(onda * (i / 5)), 1, 10 - i);
    if (ok) ret('#fff', b.x + 11, b.y + 6, 2, 2);
  }
  for (const f of focos) desenharObjetivo(f);
  // itens flutuando e brilhando
  for (const it of itens) {
    if (it.pego) continue;
    const yy = it.y + Math.sin(it.t * 3) * 2, pulso = 0.35 + 0.25 * Math.sin(it.t * 6);
    const brilhoCor = it.tipo === 'vida' ? '#ffb0b0' : (it.tipo === 'obsidiana' ? '#a07af0' : '#fff6a0'); ctx.globalAlpha = pulso; ret(brilhoCor, it.x - 7, yy - 7, 14, 14); ctx.globalAlpha = pulso * 0.8; ret(brilhoCor, it.x - 5, yy - 9, 10, 18); ctx.globalAlpha = 1;
    desenharIcone(it.tipo, it.x, yy);
  }
  desenharAmbienteVisual(t0, t1, u0, u1);
  desenharVilao();
  if (chefe) desenharFornax(chefe.x + 48 + (chefe.shake > 0 ? Math.round(rnd(-1, 1)) : 0), chefe.y + 96, 1, chefe.t, chefe.pontos.map(p => p.vivo), undefined, { chefe, dir: chefe.dir || 1, quadro: quadroFornaxChefe(chefe), tinta: chefe.flash > 0 ? '#ffffff' : null, forca: chefe.flash > 0 ? 0.55 : 0 });
  // inimigos
  for (const e of inimigos) {
    if (e.stun > 0 && Math.floor(e.stun * 30) % 2 && e.tipo !== 'chamine') continue;
    switch (e.tipo) {
      case 'motosserra': desenharMotosserra(e); break;
      case 'chama': desenharChamaInimigo(e); break;
      case 'carro': desenharCarro(e); break;
      case 'lixo': desenharLixo(e); break;
      case 'aguaviva': desenharAguaViva(e); break;
      case 'chamine': desenharChamine(e); break;
    }
  }
  // nuvens de fumaça dos carros
  for (const n of nuvens) {
    const a = Math.min(1, n.t / 1.5) * 0.75;
    ctx.globalAlpha = a;
    ret('#1e1e24', n.x, n.y + 3, n.w, n.h - 5); ret('#2e2e36', n.x + 3, n.y, n.w - 6, n.h); ret('#42424e', n.x + 5, n.y + 1 + Math.round(Math.sin(n.s * 3)), 5, 3);
    ctx.globalAlpha = 1;
  }
  // projéteis
  for (const p of projeteis) {
    if (p.vilao) { desenharProjetilVilao(p); continue; }
    if (p.tipo === 'semente') { if (!spriteArma('muda_disparo', p.x, p.y, 20, null, p.dir || 1)) { ret('#8b5a2b', p.x - 2, p.y - 2, 4, 4); ret('#4fb54a', p.x, p.y - 4, 2, 2); } }
    else if (p.tipo === 'bolha' && spriteArma('gota_disparo', p.x, p.y, 18, null, p.dir || 1)) { /* sprite */ }
    else if (p.tipo === 'bolha') { ret('#9ee0ff', p.x - 4, p.y - 4, 8, 8); ret('#eaffff', p.x - 3, p.y - 3, 2, 2); ret('#5ab0e8', p.x + 1, p.y + 2, 2, 1); }
    else if (p.tipo === 'ondaAmiga') { ret('#2b8236', p.x - 8, p.y - 7, 16, 11); ret('#7fe07a', p.x - 7, p.y - 6, 14, 8); ret('#fff', p.x - 3, p.y - 5, 6, 2); }
    else if (p.tipo === 'bolafogo') {
      const c = p.refletida ? ['#ffe14a', '#fff6a0', '#fff'] : ['#c1250e', '#ff7a1a', '#ffd84f'];
      ret('#140808', p.x - 6, p.y - 6, 12, 12); ret(c[0], p.x - 5, p.y - 5, 10, 10); ret(c[1], p.x - 3, p.y - 3, 6, 6); ret(c[2], p.x - 1, p.y - 1, 3, 3);
    } else if (p.tipo === 'onda') {
      desenharFogo(p.x - 7, p.y - 12, 14, 18, L.tempo * 1.3 + p.x * 0.05, 1, FOGO_FORNAX);
    }
  }
  // jogador (pisca ao ser atingido)
  if (!(J.invul > 0 && Math.floor(J.invul * 18) % 2)) {
    const arma = armaAtual();
    let est2 = 'parado';
    if (J.escudo) est2 = 'escudo'; else if (J.invul > 1.25) est2 = 'dano'; else if (J.atk > 0) est2 = 'atacar'; else if (!J.noChao && L.agua) est2 = 'nadar'; else if (!J.noChao) est2 = 'pular'; else if (Math.abs(J.vx) > 60) est2 = 'correr'; else if (Math.abs(J.vx) > 12) est2 = 'andar';
    desenharDavi(J.x - 3, J.y - 2, J.dir, est2, est2 === 'pular' ? J.vy : est2 === 'nadar' ? { vx: J.vx, vy: J.vy } : J.quadro, arma);
    if (J.atk > 0.1 && arma !== 'semente' && arma !== 'bolha') {   // golpe corpo a corpo visível
      const alc = arma === 'martelo' ? 24 : arma === 'bike' ? 20 : 18, gx = J.dir > 0 ? J.x + J.w : J.x - alc;
      ctx.globalAlpha = 0.6; ret(arma === 'martelo' ? '#7fe07a' : arma === 'bike' ? '#ffb02a' : '#fff', gx, J.y + 6, alc, 3); ctx.globalAlpha = 1;
    }
  }
  if (J.escudo) {                                  // brilho do escudo levantado (o desenho vem do sprite)
    const sx = J.dir > 0 ? J.x + J.w + 6 : J.x - 6;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createRadialGradient(sx, J.y + 11, 0, sx, J.y + 11, 16);
    g.addColorStop(0, 'rgba(255,230,120,' + (0.35 + 0.15 * Math.sin(L.tempo * 12)) + ')'); g.addColorStop(1, 'rgba(255,230,120,0)');
    ctx.fillStyle = g; ctx.fillRect(sx - 16, J.y - 6, 32, 34); ctx.restore();
  }
  desenharParticulas();
  ctx.restore();
}
