'use strict';
/* =====================================================================
   12b. LIÇÕES: frases educativas curtas que aparecem durante a fase
   Cada fase define em fase.js um objeto "licoes" { chave: texto }.
   O jogo chama dispararLicao(chave) quando algo acontece (coletar, montar, objetivo...).
   ===================================================================== */
let licaoAtual = null, filaLicoes = [];
const TEMPO_LICAO = 5, PAUSA_LICOES = 8;   // cada lição some em 5 s e a próxima só vem 8 s depois
let pausaLicao = 0;
function dispararLicao(chave) {
  const f = FASES[L.idx], txt = f.licoes && f.licoes[chave];
  if (!txt || L.licoesVistas[chave]) return;
  L.licoesVistas[chave] = true; L.aprendidos.push(txt); gaia.alerta = 2.5;
  if (licaoAtual || pausaLicao > 0) { if (filaLicoes.length < 2) filaLicoes.push(txt); } else { licaoAtual = { txt, t: TEMPO_LICAO }; som('licao'); }
}
function atualizarLicoes(dt) {
  if (pausaLicao > 0) pausaLicao -= dt;
  if (!licaoAtual) {
    if (pausaLicao <= 0 && filaLicoes.length) { licaoAtual = { txt: filaLicoes.shift(), t: TEMPO_LICAO }; som('licao'); }
    return;
  }
  licaoAtual.t -= dt;
  if (licaoAtual.t <= 0) { licaoAtual = null; pausaLicao = PAUSA_LICOES; }
}
function retLicao() {
  const linhas = quebrarLinhas(licaoAtual.txt, 260);
  const larg = Math.max.apply(null, linhas.map(l => larguraTexto(l)));
  const w = Math.min(336, larg + 74), h = 8 + linhas.length * 10;
  return { x: Math.round((LARG - w) / 2), y: (chefe || (vilao && vilao.ativo && !vilao.morto)) ? (L.agua ? 54 : 50) : (L.agua ? 44 : 40), w, h, linhas };
}
function desenharLicao() {
  if (!licaoAtual) return;
  const r = retLicao();
  ctx.globalAlpha = Math.min(0.95, licaoAtual.t * 2);
  pilula(r.x, r.y, r.w, r.h, 'rgba(14,34,50,0.88)', '#7fe07a');
  ret('#ffd84f', r.x + 4, r.y + 4, 54, r.h - 8); texto('SABIA?', r.x + 31, r.y + Math.round(r.h / 2) - 4, '#3a2a00', 8, 'center', false);
  r.linhas.forEach((l, i) => texto(l, r.x + 66, r.y + 5 + i * 10, '#fff', 8));
  ctx.globalAlpha = 1;
}
