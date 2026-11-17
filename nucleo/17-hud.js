'use strict';
/* =====================================================================
   17. HUD (visual limpo, em cápsulas) — vidas, missão, planeta, poderes, armas e guia
   ===================================================================== */
const CORACAO = ['.XX.XX.', 'XXXXXXX', 'XXXXXXX', '.XXXXX.', '..XXX..', '...X...'];
function desenharCoracao(x, y, cheio) {
  CORACAO.forEach((lin, j) => {
    for (let i = 0; i < 7; i++) if (lin[i] === 'X') {
      ctx.fillStyle = cheio ? (j < 2 && i < 3 ? '#ff9a9a' : '#ff4a5a') : '#3a3050';
      ctx.fillRect(x + i * 2, y + j * 2, 2, 2);
    }
  });
}
function larguraTexto(s) { ctx.font = '8px ' + FONTE; return Math.ceil(ctx.measureText(s).width); }
/* Cápsula escura com borda colorida (visual novo do HUD) */
function capsulaHud(x, y, w, h, borda = '#c8a040') {
  rrect(x - 1, y - 1, w + 2, h + 2, 4.5); ctx.fillStyle = borda; ctx.fill();
  rrect(x, y, w, h, 3.6); ctx.fillStyle = 'rgba(10,14,34,0.9)'; ctx.fill();
}
/* Ícone do objetivo de cada fase (pequeno, ao lado do contador) */
function iconeObjetivo(idx, parte, cx, cy) {
  const R = (c, x, y, w, h) => { ctx.fillStyle = c; ctx.fillRect(Math.round(cx + x), Math.round(cy + y), w, h); };
  if (idx === 0 || (idx === 5 && parte === 1)) { R('#ff5a1a', -3, -1, 6, 6); R('#ff9a2a', -2, -3, 4, 6); R('#ffd84f', -1, -5, 2, 4); R('#fff3a0', -1, 0, 2, 3); }
  else if (idx === 1) { R('#6e6e7c', -6, 0, 12, 5); R('#8a8a98', -4, -3, 8, 5); R('#ff4a3a', -3, 1, 2, 2); R('#ff4a3a', 1, 1, 2, 2); }
  else if (idx === 2) { R('#8a8e9c', -4, -3, 8, 9); R('#c2c6d2', -3, -2, 6, 3); R('#e03a2a', -2, 2, 4, 2); R('#6a6e7c', -1, -5, 2, 2); }
  else if (idx === 3) { R('#20202a', -4, -2, 8, 8); R('#3a3a48', -3, -1, 3, 3); R('#ffd84f', -1, -5, 2, 3); }
  else if (idx === 4) { desenharIcone('pet', cx, cy); }
  else desenharObsidiana(cx, cy, 0.8);
}
function desenharHUD() {
  const f = FASES[L.idx], po = objAtual();
  // vidas (canto esquerdo)
  capsulaHud(6, 5, 104, 20);
  for (let i = 0; i < VIDAS_MAX; i++) desenharCoracao(12 + i * 19, 9, i < J.vidas);
  // objetivo (centro)
  const txt = po.rotulo.toUpperCase() + ' ' + L.progresso + '/' + L.total, tm = tamCabe(txt, 8, 126), wo = Math.ceil(txt.length * tm) + 32, xo = Math.round(192 - wo / 2);
  capsulaHud(xo, 5, wo, 20, L.progresso >= L.total ? '#7fe07a' : '#e8b030');
  iconeObjetivo(L.idx, L.parte, xo + 13, 15);
  texto(txt, xo + 25, 11, L.progresso >= L.total ? '#9fffa8' : '#fff', tm, 'left', true, wo - 28);
  // termômetro do planeta (canto direito): quanto mais frio, melhor
  capsulaHud(274, 5, 104, 20);
  ret('#05060c', 283, 9, 5, 11); ret('#e03a2a', 284, 12, 3, 7); ret('#e03a2a', 282, 17, 7, 5); ret('#ff8a7a', 284, 12, 1, 5);
  ret('#000', 294, 11, 78, 9); ret('#3a2030', 295, 12, 76, 7);
  ctx.fillStyle = misturar('#3ec1ff', '#ff5a2a', L.calor); ctx.fillRect(295, 12, Math.round(76 * L.calor), 7);
  ret('rgba(255,255,255,0.35)', 295, 12, Math.round(76 * L.calor), 1);
  // título da fase (logo abaixo do objetivo)
  const ban = f.partes ? f.partes[L.parte].banner : 'Fase ' + (L.idx + 1) + ': ' + f.nome, tb = tamCabe(ban, 6, 156), wb = Math.ceil(ban.length * tb) + 14, xb = Math.round(192 - wb / 2);
  capsulaHud(xb, 29, wb, 12, '#8a7a48');
  texto(ban, 192, 32, '#f4e6b0', tb, 'center', false, wb - 8);
  // ar (oceano) e armadura (fase 6): cápsula abaixo das vidas
  if (L.agua) {
    capsulaHud(6, 29, 98, 13, '#58b8f0');
    ctx.fillStyle = '#6ad8ff'; ctx.beginPath(); ctx.arc(15, 35.5, 4, 0, 7); ctx.fill(); ctx.fillStyle = '#e8ffff'; ctx.fillRect(13, 33, 2, 2);
    texto('AR', 23, 32, '#bfe9ff', 6, 'left', false);
    const ar = J.ar / 100;
    ret('#1a2a44', 38, 32, 62, 7);
    ctx.fillStyle = ar > 0.3 ? '#6ad8ff' : (Math.floor(L.tempo * 6) % 2 ? '#ff5a4a' : '#6ad8ff'); ctx.fillRect(38, 32, Math.round(62 * ar), 7);
    ret('rgba(255,255,255,0.4)', 38, 32, Math.round(62 * ar), 1);
  }
  if (J.armadura !== undefined) {
    capsulaHud(6, 29, 98, 13, '#a07af0');
    desenharObsidiana(15, 35.5, 0.6);
    texto('ARMADURA', 23, 33, '#d8c8ff', 5, 'left', false);
    ret('#000', 66, 32, 34, 7); ret('#2a1a48', 67, 33, 32, 5);
    ret(J.armadura > 25 ? '#a07af0' : (Math.floor(L.tempo * 6) % 2 ? '#ff5a4a' : '#a07af0'), 67, 33, Math.round(32 * J.armadura / ARMADURA_MAX), 5);
  }
  // vida do chefe final: caixa larga com um segmento por ponto fraco
  if (chefe) {
    capsulaHud(92, 45, 200, 17, '#e04a4a');
    texto('FORNAX, O MONSTRO DO CALOR', 192, 48, '#fff', 6, 'center', false, 190);
    chefe.pontos.forEach((p, i) => {
      ret('#2a1a20', 96 + i * 37.8, 55, 36, 4);
      if (p.vivo) ret(COR_PONTOS_FORNAX[i], 96 + i * 37.8, 55, Math.round(36 * p.hp / 2), 4);
    });
  }
  desenharGuia();
  desenharBarraVilao();
  // painel de baixo: poderes (Q/R) e armas (1-5) no mesmo quadro
  capsulaHud(70, 184, 244, 30, '#c8a848');
  texto('PODERES (Q/R)', 76, 187, '#b8a8e8', 5, 'left', false);
  texto('ARMAS (1-5)', 187, 187, '#f0c890', 5, 'left', false);
  desenharBarraPoderes();
  ret('rgba(255,255,255,0.25)', 179, 188, 1, 22);
  const x0 = 185, y0 = 193, TS = 18;
  for (let i = 0; i < 5; i++) {
    const x = x0 + i * 25, a = ARMAS[i], tem = salvo.armas[a.id], sel = J.arma === i && tem;
    if (!desenharSlotArma(i, x, y0, tem, sel, tem && armaNivel(a.id) >= 2, TS)) {
      pilula(x, y0, TS, TS, sel ? 'rgba(58,47,16,0.92)' : 'rgba(16,24,52,0.85)', sel ? '#ffd84f' : 'rgba(255,255,255,0.3)');
      if (tem) desenharIcone('arma_' + a.id, x + TS / 2, y0 + TS / 2);
      texto(String(i + 1), x + 2, y0 + 2, sel ? '#ffd84f' : '#9aa', 6);
      if (tem && armaNivel(a.id) >= 2) { ret('#ffd84f', x + 12, y0 + 11, 5, 5); ret('#7a5a10', x + 13, y0 + 12, 3, 3); }   // nível 2
    }
  }
  const arma = armaAtual();
  if (arma && L.tempo - (L.trocouArma || 0) < 2.5) {
    const nome = ARMAS[J.arma].nome + (armaNivel(arma) >= 2 ? ' NV2' : '') + (arma === 'escudo' ? ' (segure J)' : ''), tn = tamCabe(nome, 8, 220), w = Math.ceil(nome.length * tn) + 12;
    capsulaHud(192 - w / 2, 160, w, 13, '#c8a848');
    texto(nome, 192, 163, '#fff', tn, 'center', false, w - 8);
  }
  texto('H AJUDA', LARG - 4, ALT - 11, 'rgba(255,255,255,0.55)', 8, 'right', false);
  desenharLicao();
  // aviso (toast)
  if (toastAtual.t > 0) {
    const w2 = Math.min(250, larguraTexto(toastAtual.txt) + 16), ty = licaoAtual ? (retLicao().y + retLicao().h + 4) : (chefe ? 66 : 46);
    ctx.globalAlpha = Math.min(1, toastAtual.t * 2);
    pilula(LARG / 2 - w2 / 2, ty, w2, 14, 'rgba(16,24,52,0.9)', '#ffd84f');
    texto(toastAtual.txt, LARG / 2, ty + 3, '#fff6a0', 8, 'center', true, w2 - 8);
    ctx.globalAlpha = 1;
  }
  if (J.lento > 0) texto('LENTO!', LARG / 2, 66, '#ddd', 8, 'center');
}
function desenharCena() {
  desenharFundo(L.calor);
  desenharMundo();
  const est = FASES[L.idx].tema.estilo;
  const tinta = { oceano: ['20,120,220', 0.14], cidade: ['100,90,60', 0.12 * L.calor], lixao: ['120,150,20', 0.1 * L.calor], fabrica: ['255,40,0', 0.08 * L.calor] }[est] || ['255,70,0', 0.08 * L.calor];
  ctx.fillStyle = 'rgba(' + tinta[0] + ',' + tinta[1].toFixed(3) + ')'; ctx.fillRect(0, 0, LARG, ALT);   // névoa do cenário (mais leve = mais limpo e colorido)
  posProcesso(L.calor);
  if (L.agua) {                                   // linha da superfície (onde o ar se recupera)
    const sy = 2 * TAM - Math.round(cam.y);
    if (sy > -4 && sy < ALT) { ctx.globalAlpha = 0.5; for (let x = 0; x < LARG; x += 4) ret('#fff', x, sy + Math.round(Math.sin(L.tempo * 3 + x * 0.2 + cam.x * 0.2)), 3, 1); ctx.globalAlpha = 1; }
  }
  desenharHUD();
}
