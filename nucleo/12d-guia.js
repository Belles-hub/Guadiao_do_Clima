'use strict';
/* =====================================================================
   12d. GUIA: diz qual é o próximo passo, aponta para o alvo e abre a ajuda (tecla H)
   ===================================================================== */
let ajudaAberta = false;
const NOME_ITEM_CURTO = { semente: 'Sementes', galho: 'Galhos', gota: 'Gotas', peca: 'Peças', bateria: 'Baterias', placa: 'Placas', cristal: 'Cristais', pet: 'PET', lata: 'Latas', papel: 'Papel', bolha: 'Bolhas', concha: 'Conchas' };
const NOME_ARMA_CURTO = ['Lança-Sementes', 'Bicicleta', 'Escudo Solar', 'Martelo', 'Bolha Gelada'];
const NOME_PONTO_COR = ['VERDE', 'CINZA', 'AMARELO', 'VERDE-ÁGUA', 'AZUL'];

function itemMaisProximo(tipos) {
  let m = null, md = 1e9;
  for (const it of itens) {
    if (it.pego || it.tipo === 'vida' || (tipos && !tipos.includes(it.tipo))) continue;
    const d = Math.hypot(it.x - J.x, it.y - J.y);
    if (d < md) { md = d; m = { x: it.x, y: it.y }; }
  }
  return m;
}
function objetivoMaisProximo() {
  let m = null, md = 1e9;
  for (const f of focos) {
    if (f.apagado) continue;
    const d = Math.hypot(f.x + f.w / 2 - J.x, f.y + f.h / 2 - J.y);
    if (d < md) { md = d; m = { x: f.x + f.w / 2, y: f.y + f.h / 2 }; }
  }
  return m;
}
/* Devolve { texto, alvo } com o que o jogador deve fazer agora */
function passoAtual() {
  const f = FASES[L.idx];
  if (chefe) {
    if (chefe.morto) return { texto: 'Fornax caiu! O planeta está esfriando...', alvo: null };
    const i = chefe.pontos.findIndex(p => p.vivo);
    return { texto: 'Acerte o ponto brilhante! (' + (i + 1) + '/5)', alvo: { x: posPontoFornax(chefe, i)[0], y: posPontoFornax(chefe, i)[1] } };
  }
  const arma = f.arma >= 0 ? ARMAS[f.arma] : null;
  if (arma && !salvo.armas[arma.id]) {                       // 1) reunir materiais e montar a arma
    const falta = [], tipos = [];
    for (const m in arma.receita) { const tem = L.inv[m] || 0; if (tem < arma.receita[m]) { falta.push(NOME_ITEM_CURTO[m] + ' ' + tem + '/' + arma.receita[m]); tipos.push(m); } }
    if (falta.length) return { texto: 'Colete: ' + falta.join('  '), alvo: itemMaisProximo(tipos) };
    return { texto: 'Monte a arma: aperte E', alvo: null };
  }
  if (arma && armaAtual() !== arma.id && f.arma <= 4) {      // 2) equipar
    return { texto: 'Aperte ' + (f.arma + 1) + ': ' + NOME_ARMA_CURTO[f.arma], alvo: null };
  }
  if (arma && podeMelhorar(f.arma)) return { texto: 'Melhoria pronta: aperte E', alvo: null };   // 2b) melhoria nível 2
  if (f.partes && L.parte === 0) return { texto: 'Pegue as obsidianas (' + L.progresso + '/' + L.total + ')', alvo: itemMaisProximo(['obsidiana']) };
  if (L.progresso < L.total) {                               // 3) cumprir o objetivo
    const n = ' (' + L.progresso + '/' + L.total + ')';
    if (f.contaItens) return { texto: 'Colete PET, latas e papel' + n, alvo: itemMaisProximo(['pet', 'lata', 'papel']) };
    const tipo = focos.length ? focos[0].tipo : null;
    const alvo = objetivoMaisProximo();
    if (tipo === 'fogo') return { texto: 'J perto do fogo' + n, alvo };
    if (tipo === 'bairro') return { texto: 'J na nuvem do telhado' + n, alvo };
    if (tipo === 'gerador') return { texto: 'J perto do gerador' + n, alvo };
    if (tipo === 'recife') return { texto: 'J no recife branco' + n, alvo };
  }
  if (vilao && !vilao.morto) {                               // 4) derrotar o subguardião
    const c = { x: vilao.x + vilao.w / 2, y: vilao.y + vilao.h / 2 };
    if (!vilao.ativo) return { texto: 'Siga em frente', alvo: c };
    const i = ARMAS.findIndex(a => a.id === vilao.d.fraqueza);
    return { texto: 'Derrote ' + vilao.d.curto + ': ' + NOME_ARMA_CURTO[i] + ' (' + (i + 1) + ')', alvo: c };
  }
  const b = L.bandeira;                                      // 5) bandeira
  return { texto: 'Vá até a bandeira >>>', alvo: { x: b.x + 8, y: b.y + 10 } };
}
/* Seta amarela: sobre o alvo, se estiver na tela, ou na borda apontando para ele */
function desenharSeta(alvo) {
  const sx = alvo.x - Math.round(cam.x), sy = alvo.y - Math.round(cam.y), pul = Math.round(Math.sin(L.tempo * 6) * 3);
  if (sx > 10 && sx < LARG - 10 && sy > 48 && sy < ALT - 36) {
    const ax = Math.round(sx), ay = Math.round(sy - 26 + pul);
    for (let i = 0; i < 6; i++) { ret('#000', ax - 6 + i, ay + i - 1, 13 - i * 2, 3); }
    for (let i = 0; i < 6; i++) { ret('#ffd84f', ax - 5 + i, ay + i, 11 - i * 2, 2); }
  } else {
    const ang = Math.atan2(sy - ALT / 2, sx - LARG / 2);
    const ex = clamp(LARG / 2 + Math.cos(ang) * LARG, 16, LARG - 16), ey = clamp(ALT / 2 + Math.sin(ang) * ALT, 50, ALT - 40);
    ctx.save(); ctx.translate(Math.round(ex), Math.round(ey)); ctx.rotate(ang);
    ctx.fillStyle = '#000'; ctx.beginPath(); ctx.moveTo(11, 0); ctx.lineTo(-6, -8); ctx.lineTo(-6, 8); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#ffd84f'; ctx.beginPath(); ctx.moveTo(9, 0); ctx.lineTo(-4, -6); ctx.lineTo(-4, 6); ctx.closePath(); ctx.fill();
    ctx.restore();
  }
}
function desenharGuia() {
  const p = passoAtual();
  ret('rgba(0,0,0,0.4)', 0, 164, LARG, 12);
  let txt = '> ' + p.texto;
  ctx.font = '8px ' + FONTE;
  while (ctx.measureText(txt).width > LARG - 8 && txt.length > 8) txt = txt.slice(0, -2);
  texto(txt, LARG / 2, 166, '#fff6a0', 8, 'center');
  if (p.alvo && Math.floor(L.tempo * 2) >= 0) desenharSeta(p.alvo);
}
/* Tela de ajuda (tecla H): controles e passo a passo da fase */
function desenharAjuda() {
  const f = FASES[L.idx];
  ret('rgba(0,0,0,0.43)', 0, 0, LARG, ALT);
  painel(14, 8, 356, 200, '#12263a', '#ffd84f');
  texto('COMO JOGAR', 192, 15, '#ffd84f', 8, 'center');
  const ctrl = [['SETAS / A D', 'andar'], ['K / 0 a 5', 'troca arma'], ['ESPAÇO / W', 'pular'], ['E', 'montar'], ['J', 'atacar'], ['Q / R', 'poder']];
  ctrl.forEach((c, i) => { const x = i % 2 ? 196 : 24, y = 28 + Math.floor(i / 2) * 12; texto(c[0], x, y, '#ffd84f', 8); texto(c[1], x + 96 - (i % 2 ? 8 : 0), y, '#fff', 8); });
  texto('NESTA FASE:', 24, 68, '#7fe07a', 8);
  let y = 80;
  (f.passos || []).forEach((p, i) => { texto(String(i + 1) + '.', 24, y, '#7fe07a', 8); y += 11 * textoQuebrado(p, 40, y, 318, '#bfe9ff', 11) + 1; });
  y = Math.max(y + 3, 150);
  texto('AGORA:', 24, y, '#ffd84f', 8);
  textoQuebrado(passoAtual().texto, 90, y, 270, '#fff6a0', 11);
  texto('H ou ESC: fechar', 192, 196, '#8a96b8', 8, 'center');
}
