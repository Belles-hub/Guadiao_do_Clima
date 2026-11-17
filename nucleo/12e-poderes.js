'use strict';
/* =====================================================================
   12e. PODERES E MELHORIAS DE ARMAS
   - Cada subguardião derrotado dá um PODER (tecla Q usa, R troca). Os poderes ficam salvos e valem em todas as fases.
   - Cada poder machuca vilões e também o ponto fraco do Fornax correspondente.
   - As 5 armas podem ser melhoradas para o nível 2 no menu de montagem (E) usando materiais que sobram.
   ===================================================================== */
const PODERES = [
  { id: 'raizes', nome: 'Raízes Vivas', fase: 0, cor: '#4fd35a', recarga: 8, arma: 'semente',
    desc: 'Raízes brotam do chão e prendem os inimigos.', como: 'Aperte Q: prende e fere quem estiver perto.' },
  { id: 'ar', nome: 'Rajada de Ar Puro', fase: 1, cor: '#bfe9ff', recarga: 7, arma: 'bike',
    desc: 'Um vento limpo que dissolve a fumaça.', como: 'Aperte Q: tira a fumaça e afasta os inimigos.' },
  { id: 'raio', nome: 'Raio Solar', fase: 2, cor: '#ffd84f', recarga: 9, arma: 'escudo',
    desc: 'Um feixe de luz do sol que atravessa tudo.', como: 'Aperte Q: raio à frente que desliga geradores.' },
  { id: 'reciclagem', nome: 'Reciclagem Total', fase: 3, cor: '#7fe07a', recarga: 12, arma: 'martelo',
    desc: 'Transforma inimigos em blocos e cura você.', como: 'Aperte Q: inimigos viram blocos e você ganha 1 vida.' },
  { id: 'mare', nome: 'Maré Gelada', fase: 4, cor: '#6ad8ff', recarga: 10, arma: 'bolha',
    desc: 'Uma onda fria que congela os inimigos.', como: 'Aperte Q: congela quem estiver perto.' }
];
const armaNivel = id => (salvo.niveis && salvo.niveis[id]) || 1;
const poderConquistado = i => !!(salvo.poderes && salvo.poderes[PODERES[i].id]);
let efeitosPoder = [];

/* ---------- uso dos poderes ---------- */
function retAreaPoder(raioX, altCima = 60, altBaixo = 40) { return { x: J.x + J.w / 2 - raioX, y: J.y - altCima, w: raioX * 2, h: J.h + altCima + altBaixo }; }
function acertarAlvosPoder(area, dano, armaId) {
  if (vilao && vilao.ativo && !vilao.morto && colide(area, retVilao())) machucarVilao(dano, 'poder');
  if (chefe && !chefe.morto && colide(area, retChefe())) golpeChefe(armaId);
}
function emFaixa(area, e) { return colide(area, { x: e.x, y: e.y, w: e.w, h: e.h }); }
function limparTirosHostis(area, tambemOndas = true) {
  projeteis = projeteis.filter(p => {
    const hostil = p.vilao || p.tipo === 'bolafogo' || (tambemOndas && p.tipo === 'onda');
    if (hostil && colide(area, { x: p.x - 8, y: p.y - 8, w: 16, h: 16 })) { emitir('brilho', p.x, p.y, 4); return false; }
    return true;
  });
}
function usarPoder() {
  const i = J.poderSel, p = PODERES[i];
  if (!poderConquistado(i)) { toast('Derrote o vilão da fase ' + (p.fase + 1) + ' para ganhar este poder!', 2.4); som('erro'); return; }
  if (J.recPoder[i] > 0) { toast('Poder recarregando: ' + Math.ceil(J.recPoder[i]) + 's', 1); som('erro'); return; }
  J.recPoder[i] = p.recarga; J.atk = 0.3; J.acertados = [];
  const cx = J.x + J.w / 2, cy = J.y + J.h / 2;
  if (p.id === 'raizes') {
    const area = retAreaPoder(100);
    for (const e of inimigos) if (e.vivo && e.tipo !== 'chamine' && emFaixa(area, e)) { machucarInimigo(e, 2, J.dir); e.stun = 3; e.vx = 0; emitir('folha', e.x + e.w / 2, e.y + e.h, 6); }
    acertarAlvosPoder(area, 3, p.arma);
    efeitosPoder.push({ tipo: 'raizes', x: cx, y: J.y + J.h, t: 0, max: 1.3 }); emitir('folha', cx, J.y + J.h, 20);
  } else if (p.id === 'ar') {
    const area = retAreaPoder(120, 80, 60);
    for (const e of inimigos) if (e.vivo && e.tipo !== 'chamine' && emFaixa(area, e)) {
      const d = (e.x + e.w / 2) >= cx ? 1 : -1; machucarInimigo(e, 1, d); e.stun = 1.4; e.vx = d * 240; if (!e.d.flutua) e.vy = -140;
    }
    nuvens = nuvens.filter(n => !colide(area, n)); J.lento = 0;
    limparTirosHostis(area);
    acertarAlvosPoder(area, 2, p.arma);
    efeitosPoder.push({ tipo: 'rajada', x: cx, y: cy, t: 0, max: 0.7, raio: 120 }); emitir('vapor', cx, cy, 18);
  } else if (p.id === 'raio') {
    const d = J.dir, area = { x: d > 0 ? J.x + J.w : J.x - 250, y: J.y - 4, w: 250, h: J.h + 8 };
    for (const e of inimigos) if (e.vivo && e.tipo !== 'chamine' && emFaixa(area, e)) machucarInimigo(e, 3, d);
    for (const f of focos) if (!f.apagado && (f.tipo === 'gerador' || f.tipo === 'bairro' || f.tipo === 'fogo') && colide(area, f)) apagarFoco(f);
    limparTirosHostis(area, false);
    acertarAlvosPoder(area, 4, p.arma);
    efeitosPoder.push({ tipo: 'feixe', x: d > 0 ? J.x + J.w : J.x - 250, y: J.y + 4, t: 0, max: 0.5, dir: d }); emitir('brilho', cx + d * 30, cy, 18, '#fff6a0');
  } else if (p.id === 'reciclagem') {
    const area = retAreaPoder(110);
    for (const e of inimigos) if (e.vivo && e.tipo !== 'chamine' && emFaixa(area, e)) {
      const tx = Math.floor((e.x + e.w / 2) / TAM), ty = Math.floor((e.y + e.h - 1) / TAM);
      if (e.tipo !== 'lixo') criarMuda(tx, ty, 'B');
      machucarInimigo(e, 99, J.dir, true);
    }
    J.vidas = Math.min(VIDAS_MAX, J.vidas + 1);
    acertarAlvosPoder(area, 4, p.arma);
    efeitosPoder.push({ tipo: 'reciclar', x: cx, y: cy, t: 0, max: 0.9 }); emitir('brilho', cx, cy, 20, '#7fe07a'); emitir('folha', cx, cy, 12);
  } else if (p.id === 'mare') {
    const area = retAreaPoder(210, 90, 70);
    for (const e of inimigos) if (e.vivo && e.tipo !== 'chamine' && emFaixa(area, e)) { machucarInimigo(e, 1, J.dir); e.stun = 4; e.vx = 0; e.vy = 0; emitir('bolha', e.x + e.w / 2, e.y + e.h / 2, 5); }
    limparTirosHostis(area);
    acertarAlvosPoder(area, 3, p.arma);
    efeitosPoder.push({ tipo: 'mare', x: cx, y: J.y + J.h, t: 0, max: 0.9 }); emitir('bolha', cx, cy, 20); emitir('brilho', cx, cy, 14, '#bfe9ff');
  }
  som('poder'); confete(cx, cy - 8, 18);
}
function atualizarPoderes(dt) {
  for (let i = 0; i < 5; i++) if (J.recPoder[i] > 0) J.recPoder[i] -= dt;
  for (const e of efeitosPoder) e.t += dt;
  efeitosPoder = efeitosPoder.filter(e => e.t < e.max);
  if (press('KeyQ')) usarPoder();
  if (press('KeyR')) {                                         // troca de poder (só entre os conquistados)
    const lib = PODERES.map((p, i) => poderConquistado(i) ? i : -1).filter(i => i >= 0);
    if (lib.length) { J.poderSel = lib[(Math.max(0, lib.indexOf(J.poderSel)) + 1) % lib.length]; som('menu'); toast('Poder: ' + PODERES[J.poderSel].nome, 1.4); }
    else toast('Derrote um vilão para ganhar um poder!', 1.8);
  }
  // poder conquistado ao derrotar o vilão: mostra a introdução depois da explosão
  if (L.poderPend !== undefined) { L.poderT -= dt; if (L.poderT <= 0) { const i = L.poderPend; L.poderPend = undefined; conquistarPoder(i); } }
}
function conquistarPoder(i) {
  const p = PODERES[i];
  if (!p || poderConquistado(i)) { if (p) toast('Você já tem o poder ' + p.nome + '!', 2); return; }
  salvo.poderes = salvo.poderes || {}; salvo.poderes[p.id] = true; salvarProgresso();
  J.poderSel = i; J.recPoder[i] = 0;
  mostrarConquista({ titulo: 'NOVO PODER!', nome: p.nome, desc: p.desc, como: p.como, cor: p.cor, icone: () => iconePoder(p.id), poder: true });
}

/* ---------- efeitos visuais ---------- */
function desenharEfeitosPoder() {
  for (const e of efeitosPoder) {
    const k = e.t / e.max, a = 1 - k;
    if (e.tipo === 'raizes') {
      for (let i = -5; i <= 5; i++) {
        const x = e.x + i * 17, h = Math.round(26 * Math.min(1, k * 3) * (1 - Math.abs(i) * 0.06)) + Math.round(Math.sin(e.t * 12 + i) * 2);
        ctx.globalAlpha = Math.min(1, a * 2); ret('#2a5a1a', x - 2, e.y - h, 5, h); ret('#4fd35a', x - 1, e.y - h, 3, h); ret('#7fe07a', x - 3, e.y - h, 2, 2); ret('#7fe07a', x + 2, e.y - h + 4, 2, 2);
      }
      ctx.globalAlpha = 1;
    } else if (e.tipo === 'rajada') {
      ctx.globalAlpha = a * 0.7;
      for (let r = 0; r < 3; r++) { const R = e.raio * Math.min(1, k * 1.4 + r * 0.05) - r * 14; for (let ang = 0; ang < 6.28; ang += 0.16) ret('#e8f8ff', e.x + Math.cos(ang) * R, e.y + Math.sin(ang) * R * 0.6, 3, 2); }
      ctx.globalAlpha = 1;
    } else if (e.tipo === 'feixe') {
      ctx.globalAlpha = Math.min(1, a * 2);
      const x = e.dir > 0 ? e.x : e.x, w = 250; ret('#ffb02a', x, e.y - 4, w, 18); ret('#ffd84f', x, e.y - 1, w, 12); ret('#fff6a0', x, e.y + 2, w, 6); ret('#fff', x, e.y + 4, w, 2);
      ctx.globalAlpha = 1;
    } else if (e.tipo === 'reciclar') {
      ctx.globalAlpha = a;
      for (let i = 0; i < 3; i++) { const ang = e.t * 7 + i * 2.09, R = 20 + k * 90; ret('#7fe07a', e.x + Math.cos(ang) * R - 3, e.y + Math.sin(ang) * R * 0.6 - 3, 7, 7); ret('#fff', e.x + Math.cos(ang) * R - 1, e.y + Math.sin(ang) * R * 0.6 - 1, 3, 3); }
      ctx.globalAlpha = 1;
    } else if (e.tipo === 'mare') {
      ctx.globalAlpha = a * 0.8;
      const R = 220 * Math.min(1, k * 1.3);
      for (let x = -R; x <= R; x += 4) ret(Math.abs(x) > R - 10 ? '#fff' : '#6ad8ff', e.x + x, e.y - 12 - Math.round(Math.sin(x * 0.12 + e.t * 12) * 4), 4, 14);
      ctx.globalAlpha = 1;
    }
  }
}
/* ícones dos poderes (centro em 0,0) */
function iconePoder(id) {
  const R = (c, x, y, w, h) => { ctx.fillStyle = c; ctx.fillRect(x, y, w, h); };
  if (id === 'raizes') { R('#2a5a1a', -1, -6, 3, 12); R('#4fd35a', 0, -6, 1, 12); R('#4fd35a', -5, -2, 4, 2); R('#4fd35a', 2, 0, 4, 2); R('#7fe07a', -6, -4, 2, 2); R('#7fe07a', 5, -2, 2, 2); }
  else if (id === 'ar') { R('#e8f8ff', -6, -4, 10, 2); R('#e8f8ff', -4, 0, 10, 2); R('#e8f8ff', -6, 4, 8, 2); R('#bfe9ff', 4, -4, 2, 4); R('#bfe9ff', 6, 0, 2, 4); }
  else if (id === 'raio') { R('#ffb02a', -6, -2, 12, 4); R('#ffd84f', -6, -1, 12, 2); R('#fff', -6, 0, 12, 1); R('#ffd84f', -2, -6, 4, 4); R('#ffd84f', -2, 2, 4, 4); }
  else if (id === 'reciclagem') { R('#2b8236', -5, -5, 10, 10); R('#7fe07a', -4, -4, 8, 8); R('#fff', -2, -3, 4, 2); R('#fff', 1, -2, 2, 4); R('#fff', -3, 1, 4, 2); }
  else if (id === 'mare') { R('#2a7ad0', -6, 0, 12, 5); R('#6ad8ff', -6, -2, 4, 4); R('#6ad8ff', -2, -4, 4, 6); R('#6ad8ff', 2, -2, 4, 4); R('#fff', -2, -4, 2, 2); }
}
/* barra de poderes no HUD (à esquerda da barra de armas) */
function desenharBarraPoderes() {
  const x0 = 76, y0 = 193;
  for (let i = 0; i < 5; i++) {
    const p = PODERES[i], x = x0 + i * 20, tem = poderConquistado(i), sel = J.poderSel === i;
    pilula(x, y0, 18, 18, sel ? 'rgba(58,47,16,0.92)' : 'rgba(16,24,52,0.85)', sel ? '#ffd84f' : 'rgba(255,255,255,0.3)');
    if (tem) {
      ctx.save(); ctx.translate(x + 9, y0 + 9); iconePoder(p.id); ctx.restore();
      if (J.recPoder[i] > 0) {                               // recarga: cobre o ícone de baixo para cima
        const f = clamp(J.recPoder[i] / p.recarga, 0, 1);
        ret('rgba(8,10,24,0.72)', x + 2, y0 + 2, 14, Math.round(14 * f));
      } else if (sel && Math.floor(tempoGlobal * 3) % 2) ret(p.cor, x + 2, y0 + 15, 14, 1);
    } else { ret('rgba(255,255,255,0.18)', x + 7, y0 + 5, 4, 7); ret('rgba(255,255,255,0.18)', x + 5, y0 + 9, 8, 6); }   // cadeado
  }
}

/* ---------- efeitos das armas de nível 2 ---------- */
function florAoE(x, y) {                                        // semente florescente: pequena explosão de flores
  for (const e of inimigos) if (e.vivo && e.tipo !== 'chamine' && Math.hypot(e.x + e.w / 2 - x, e.y + e.h / 2 - y) < 28) machucarInimigo(e, 1, J.dir);
  for (const f of focos) if (!f.apagado && f.tipo === 'fogo' && Math.hypot(f.x + 8 - x, f.y + 8 - y) < 32) apagarFoco(f);
  if (vilao && vilao.ativo && !vilao.morto && colide({ x: x - 14, y: y - 14, w: 28, h: 28 }, retVilao())) machucarVilao(1, 'semente');
  emitir('folha', x, y, 8); emitir('brilho', x, y, 6, '#ff7aa8'); confete(x, y, 6);
}
function congelarAoE(x, y) {                                    // bolha congelante: congela quem está perto
  for (const e of inimigos) if (e.vivo && e.tipo !== 'chamine' && Math.hypot(e.x + e.w / 2 - x, e.y + e.h / 2 - y) < 44) { e.stun = 2.5; e.vx = 0; e.vy = 0; }
  for (const f of focos) if (!f.apagado && f.tipo === 'recife' && Math.hypot(f.x + 10 - x, f.y + 10 - y) < 34) apagarFoco(f);
  if (vilao && vilao.ativo && !vilao.morto && colide({ x: x - 22, y: y - 22, w: 44, h: 44 }, retVilao())) machucarVilao(1, 'bolha');
  emitir('bolha', x, y, 10); emitir('brilho', x, y, 8, '#bfe9ff');
}

