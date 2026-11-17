'use strict';
/* =====================================================================
   12. ITENS, OBJETIVOS, PROJÉTEIS, MUDAS/GELO/BLOCOS E FUMAÇA
   ===================================================================== */
/* Coração que recupera 1 vida; solta por inimigos derrotados ou objetivos concluídos */
function soltarVida(x, y, chanceMachucado, chanceCheio) {
  if (Math.random() < (J.vidas < VIDAS_MAX ? chanceMachucado : chanceCheio)) itens.push({ x, y: y - 4, tipo: 'vida', t: 0, pego: false, expira: 16 });
}
function atualizarMeta() { L.calorAlvo = Math.max(0.1, 1 - (L.progresso / L.total) * 0.85); }
function coletarItem(it) {
  it.pego = true;
  if (it.tipo === 'vida') {
    J.vidas = Math.min(VIDAS_MAX, J.vidas + 1);
    emitir('brilho', it.x, it.y, 16); emitir('folha', it.x, it.y, 6); som('curar'); toast('+1 VIDA!', 1.6);
    return;
  }
  if (it.tipo === 'obsidiana') {
    L.progresso++; atualizarMeta(); emitir('brilho', it.x, it.y, 18, '#a07af0'); emitir('fagulha', it.x, it.y, 10, '#8a6ae0'); som('objetivo');
    toast('Obsidiana: ' + L.progresso + '/' + L.total, 1.8);
    if (L.progresso >= L.total) { L.forja = 1.6; toast('Todas as joias! Forjando a armadura...', 2.4); confete(it.x, it.y, 30); }
    return;
  }
  L.inv[it.tipo] = (L.inv[it.tipo] || 0) + 1; L.coletados++;
  dispararLicao('item_' + it.tipo);
  emitir('brilho', it.x, it.y, 10); som('moeda');
  if (it.tipo === 'bolha' && L.agua) { J.ar = Math.min(100, J.ar + 45); emitir('bolha', it.x, it.y, 8); }
  const f = FASES[L.idx];
  if (f.contaItens && (it.tipo === 'pet' || it.tipo === 'lata' || it.tipo === 'papel')) {   // fase 4: cada item reciclável conta
    L.progresso++; atualizarMeta(); dispararLicao('obj' + L.progresso);
    if (L.progresso === L.total) toast('Meta de reciclagem! Suba até o topo!', 3);
  }
  // aviso quando já dá para montar a arma da fase
  if (f.arma >= 0 && !salvo.armas[ARMAS[f.arma].id] && !L.dicaMontar && podeMontar(f.arma)) {
    L.dicaMontar = true; toast('Materiais prontos! Monte a arma!', 3.5);
    craftAberto = true; craftSel = f.arma; som('ok');                       // abre o menu de montagem sozinho
  }
}
function atualizarItens(dt) {
  for (const it of itens) {
    if (it.pego) continue;
    it.t += dt;
    if (it.expira !== undefined) { it.expira -= dt; if (it.expira <= 0) { it.pego = true; continue; } }
    if (it.tipo === 'vida' && J.vidas >= VIDAS_MAX) continue;      // coração espera até você precisar
    const cx = J.x + J.w / 2, cy = J.y + J.h / 2;
    const dist = Math.hypot(it.x - cx, (it.y + Math.sin(it.t * 3) * 2) - cy);
    if (dist < 16 || (press('KeyE') && dist < 40)) { coletarItem(it); if (press('KeyE')) apertou['KeyE'] = false; }
    else if (Math.random() < dt * 1.2) emitir('brilho', it.x + rnd(-5, 5), it.y + rnd(-5, 5), 1);
  }
}
/* Conclui um objetivo da fase (apaga o foco, limpa o bairro, desliga o gerador, salva o recife) */
function apagarFoco(f) {
  f.apagado = true; L.progresso++; soltarVida(f.x + f.w / 2, f.y, 0.8, 0.15);
  const cx = f.x + f.w / 2, cy = f.y + f.h / 2;
  if (f.tipo === 'fogo') { emitir('vapor', cx, cy, 16); emitir('folha', cx, cy, 8); emitir('brilho', cx, f.y + 6, 8); som('apagar'); }
  else if (f.tipo === 'bairro') { emitir('vapor', cx, cy, 14); emitir('brilho', cx, cy, 14, '#bfe9ff'); emitir('folha', cx, cy, 8); som('curar'); }
  else if (f.tipo === 'gerador') { emitir('fumaca', cx, cy, 10); emitir('fagulha', cx, cy, 16); emitir('brilho', cx, cy, 8, '#7fe07a'); som('explodir'); }
  else { emitir('bolha', cx, cy, 14); emitir('brilho', cx, cy, 14, '#ff9ae0'); som('curar'); }
  atualizarMeta(); dispararLicao('obj' + L.progresso);
  toast(objAtual().rotulo + ': ' + L.progresso + '/' + L.total, 1.8);
  confete(cx, cy, 30); som('objetivo'); gaia.alerta = 1.5;
}
/* Cria um tile temporário: 'M' muda (semente), 'I' gelo (bolha), 'B' bloco reciclado (martelo) */
const LIMITE_MUDAS = { M: 5, I: 6, B: 8 }, TEMPO_MUDAS = { M: 14, I: 12, B: 24 };
function criarMuda(tx, ty, tipo = 'M') {
  if (tx < 0 || tx >= mapaLarg || ty < 0 || ty >= mapaAlt || tile(tx, ty) !== '.') return;
  grade[ty][tx] = tipo;
  mudas.push({ tx, ty, tipo, t: TEMPO_MUDAS[tipo] });
  const mesmos = mudas.filter(m => m.tipo === tipo);
  if (mesmos.length > LIMITE_MUDAS[tipo]) {
    const o = mesmos[0]; mudas.splice(mudas.indexOf(o), 1); grade[o.ty][o.tx] = '.';
    emitir(tipo === 'I' ? 'brilho' : 'folha', o.tx * TAM + 8, o.ty * TAM + 4, 6);
  }
  emitir(tipo === 'I' ? 'brilho' : 'folha', tx * TAM + 8, ty * TAM + 4, 8, tipo === 'I' ? '#bfe9ff' : null);
}
function atualizarProjeteis(dt) {
  for (const p of projeteis) {
    if (p.vilao) continue;                                   // projéteis dos vilões: atualizarHostis
    if (p.tipo === 'ondaAmiga') {                            // onda de choque do Martelo Sísmico
      p.vida -= dt; p.x += p.vx * dt;
      if (eSolido(tile(Math.floor((p.x + (p.vx > 0 ? 6 : -6)) / TAM), Math.floor(p.y / TAM)))) p.vida = 0;
      const co = { x: p.x - 8, y: p.y - 10, w: 16, h: 14 };
      p.acert = p.acert || [];
      for (const e of inimigos) if (e.vivo && e.tipo !== 'chamine' && !p.acert.includes(e) && colide(co, e)) { p.acert.push(e); machucarInimigo(e, 2, p.vx > 0 ? 1 : -1); }
      if (vilao && vilao.ativo && !vilao.morto && !p.acertV && colide(co, retVilao())) { p.acertV = true; machucarVilao(2, 'martelo'); }
      if (Math.random() < dt * 40) emitir('poeira', p.x, p.y + 4, 1, '#7fe07a');
      continue;
    }
    p.vida -= dt; p.vy += p.g * dt;
    const ox = p.x, oy = p.y;
    p.x += p.vx * dt; p.y += p.vy * dt;
    const tx = Math.floor(p.x / TAM), ty = Math.floor(p.y / TAM);
    const t = tile(tx, ty);
    if (p.tipo === 'onda') {                                   // onda de calor do chefe, rente ao chão
      if (eSolido(t) && p.vida > 0.1) { p.vida = 0; continue; }
      if (colide({ x: p.x - 7, y: p.y - 6, w: 14, h: 12 }, J)) { danificarJogador(p.x); }
      if (Math.random() < dt * 30) emitir('fagulha', p.x, p.y + 3, 1);
      continue;
    }
    if (p.tipo === 'bolafogo') {                               // bola de fogo do chefe (pode ser refletida pelo escudo)
      if (Math.random() < dt * 30) emitir('fagulha', p.x, p.y, 1, p.refletida ? '#ffe14a' : null);
      if (p.refletida) {
        if (chefe && !chefe.morto && colide({ x: p.x - 3, y: p.y - 3, w: 6, h: 6 }, retChefe())) { golpeChefe('escudo'); p.vida = 0; emitir('brilho', p.x, p.y, 10, '#ffd84f'); }
      } else {
        const esc = J.escudo ? { x: J.dir > 0 ? J.x + J.w : J.x - 6, y: J.y, w: 6, h: J.h } : null;
        if (esc && p.vx * J.dir < 0 && colide({ x: p.x - 3, y: p.y - 3, w: 6, h: 6 }, esc)) {
          p.refletida = true; p.vx = -p.vx * 1.25; p.vy = -p.vy * 1.25; som('escudo'); emitir('brilho', p.x, p.y, 8, '#ffd84f');
        } else if (colide({ x: p.x - 3, y: p.y - 3, w: 6, h: 6 }, J)) {
          danificarJogador(p.x); p.vida = 0; emitir('fagulha', p.x, p.y, 10); som('explodir');
        }
      }
      if (eSolido(t) || p.y > mapaAlt * TAM) { p.vida = 0; emitir('fagulha', p.x, p.y, 8); emitir('fumaca', p.x, p.y, 2); }
      continue;
    }
    // projéteis do jogador: colisão com o cenário
    const pe = tile(Math.floor(ox / TAM), Math.floor(oy / TAM));
    if (eSolido(t) || (eUmaVia(t) && p.vy > 0 && pe === '.' && ty !== Math.floor(oy / TAM))) {
      if (p.tipo === 'semente') criarMuda(Math.floor(ox / TAM), Math.floor(oy / TAM), 'M');
      else if (p.tipo === 'bolha') criarMuda(Math.floor(ox / TAM), Math.floor(oy / TAM), 'I');
      emitir(p.tipo === 'bolha' ? 'bolha' : 'folha', ox, oy, 5); p.vida = 0; p.semGelo = true; continue;
    }
    const caixa = { x: p.x - 4, y: p.y - 4, w: 8, h: 8 };
    for (const f of focos) {
      if (f.apagado) continue;
      if (p.tipo === 'semente' && f.tipo === 'fogo' && colide(caixa, { x: f.x, y: f.y - 6, w: f.w, h: f.h + 6 })) { apagarFoco(f); p.vida = 0; p.semGelo = true; break; }
      if (p.tipo === 'bolha' && f.tipo === 'recife' && colide(caixa, f)) { apagarFoco(f); p.vida = 0; p.semGelo = true; break; }
    }
    if (p.vida <= 0) continue;
    for (const h of projeteis) if (h.vilao && h.tipo !== 'pedra' && colide(caixa, { x: h.x - 6, y: h.y - 7, w: 12, h: 14 })) { h.vida = 0; p.vida = 0; p.semGelo = true; emitir('bolha', h.x, h.y, 6, '#fff'); }
    if (p.vida <= 0) continue;
    if (vilao && vilao.ativo && !vilao.morto && colide(caixa, retVilao())) { machucarVilao(1, p.tipo); emitir('brilho', p.x, p.y, 6); p.vida = 0; p.semGelo = true; continue; }
    if (chefe && !chefe.morto && colide(caixa, retChefe())) { golpeChefe(p.tipo); emitir('brilho', p.x, p.y, 6); p.vida = 0; p.semGelo = true; continue; }
    for (const e of inimigos) {
      if (!e.vivo || !colide(caixa, e)) continue;
      if (e.tipo === 'chamine') continue;
      if (p.tipo === 'semente') machucarInimigo(e, e.tipo === 'chama' ? 2 : 1, p.dir);
      else { machucarInimigo(e, 1, p.dir); e.stun = 1.2; e.vx = 0; e.vy = 0; }
      emitir(p.tipo === 'bolha' ? 'bolha' : 'folha', p.x, p.y, 5); p.vida = 0; p.semGelo = true; break;
    }
  }
  // armas de nível 2: explosão de flores e bolha congelante
  for (const p of projeteis) if (p.vida <= 0 && !p.fim) {
    p.fim = true;
    if (p.tipo === 'semente' && p.flor) florAoE(p.x, p.y);
    if (p.tipo === 'bolha' && p.congela) congelarAoE(p.x, p.y);
  }
  // a bolha gelada congela a água onde termina o voo, criando uma plataforma de gelo
  for (const p of projeteis) {
    if (p.vida <= 0 && p.tipo === 'bolha' && !p.semGelo) criarMuda(Math.floor(p.x / TAM), Math.floor(p.y / TAM), 'I');
  }
  projeteis = projeteis.filter(p => p.vida > 0);
  for (const m of mudas) {
    m.t -= dt;
    if (m.t < 2 && Math.random() < dt * 8) emitir(m.tipo === 'I' ? 'brilho' : 'folha', m.tx * TAM + rnd(0, 16), m.ty * TAM + 3, 1);
  }
  mudas = mudas.filter(m => { if (m.t <= 0) { grade[m.ty][m.tx] = '.'; return false; } return true; });
  // nuvens de fumaça dos carros-monstros
  for (const n of nuvens) {
    n.t -= dt; n.y -= 3 * dt; n.s += dt;
    if (colide(n, J)) { J.lento = 0.5; dispararLicao('fumaca'); if (Math.random() < dt * 3) { som('tosse'); emitir('fumaca', J.x + 5, J.y, 2); } }
  }
  nuvens = nuvens.filter(n => n.t > 0);
}
