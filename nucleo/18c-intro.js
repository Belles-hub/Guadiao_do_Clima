'use strict';
/* =====================================================================
   18c. INTRODUÇÃO DA FASE: história, missão e dica antes de começar
   Os textos ficam em fase.js (campo "intro") de cada fase.
   ===================================================================== */
function telaIntro() {
  const f = FASES[L.idx], it = f.intro;
  desenharCena();
  ret('rgba(6,10,24,0.6)', 0, 0, LARG, ALT);
  painel(4, 4, 376, 208, '#141a30', '#e8d9a0');
  // cabeçalho: selo da fase + nome
  const rot = 'FASE ' + (L.idx + 1), wb = rot.length * 7 + 10;
  rrect(16, 11, wb + 2, 14, 2); ctx.fillStyle = '#05060c'; ctx.fill();
  rrect(17, 12, wb, 12, 1.5); ctx.fillStyle = degrade(0, 12, 12, '#4aa85a', '#1f6a30'); ctx.fill();
  texto(rot, 17 + wb / 2, 15, '#fff', 7, 'center', false, wb - 4);
  textoContorno(f.nome.toUpperCase(), 26 + wb, 12, '#ffd84f', 13, 'left', 368 - (26 + wb));
  ret('rgba(190,200,240,0.4)', 16, 32, 352, 1);
  // retrato do vilão: faixa com rótulo, quadro escuro, nome embaixo
  const bx = 16, by = 41, bw = 110, bh = 134, d = VILOES[it.retrato];
  ret('#000', bx - 1, by - 1, bw + 2, bh + 2); ret('#6a2420', bx, by, bw, bh);
  ret('#a8342e', bx, by, bw, 19); ret('#2a1412', bx, by + 19, bw, 1);
  texto(L.idx === 5 ? 'CHEFE FINAL' : 'SUBGUARDIÃO', bx + bw / 2, by + 6, '#ffd6cc', 8, 'center');
  ret('#0e1226', bx + 8, by + 24, bw - 16, 86);
  if (d) {
    const esc = Math.min(d.escalaRetrato || 1.5, 1.4);
    ctx.save(); ctx.beginPath(); ctx.rect(bx + 8, by + 24, bw - 16, 86); ctx.clip();
    ctx.translate(bx + bw / 2, by + 67 + 8); ctx.scale(esc, esc);
    d.desenhar({ x: -d.w / 2, y: -d.h / 2, w: d.w, h: d.h, dir: -1, t: tempoGlobal, estado: 'descanso', tt: 1, hp: d.hp || 1, hpMax: d.hp || 1, flash: 0, inv: 0, shake: 0, ativo: true, morto: false, vx: 0, vy: 0, n: 0, ataque: 0, fim: 1 });
    ctx.restore();
  }
  textoContorno(d ? (d.curto || d.nome) : '', bx + bw / 2, by + 117, '#fff', 12, 'center');
  // história, missão e dica: cada bloco começa depois do anterior (nada se sobrepõe)
  const rx = 144, rw = 224;
  const lh = linhasTexto(it.historia, rw, 8);
  lh.forEach((t, i) => texto(t, rx, 42 + i * 11, '#fff', 8, 'left', true, rw));
  let yy = 42 + lh.length * 11 + 6;
  texto('MISSÃO', rx, yy, '#7fe07a', 10, 'left', true, rw); yy += 15;
  it.missao.forEach(m => {
    ret('#05060c', rx, yy, 10, 10); ret('#c8d0f0', rx + 1, yy + 1, 8, 8); ret('#141a30', rx + 2, yy + 2, 6, 6);
    const lm = linhasTexto(m, rw - 16, 8);
    lm.forEach((t, i) => texto(t, rx + 16, yy + 1 + i * 10, '#c8dcff', 8, 'left', true, rw - 16));
    yy += Math.max(13, lm.length * 10 + 3);
  });
  const ld = linhasTexto(it.dica, rw - 12, 7), hd = 17 + ld.length * 10, dy = Math.min(yy + 3, 182 - hd);
  rrect(rx - 2, dy, rw + 2, hd, 2); ctx.fillStyle = '#05060c'; ctx.fill();
  rrect(rx - 1, dy + 1, rw, hd - 2, 2); ctx.fillStyle = '#3a3418'; ctx.fill();
  rrect(rx, dy + 2, rw - 2, hd - 4, 1.5); ctx.fillStyle = '#2a2612'; ctx.fill();
  ctx.fillStyle = '#ffd84f'; ctx.beginPath(); ctx.arc(rx + 7, dy + 8, 3, 0, 7); ctx.fill(); ctx.fillRect(rx + 5, dy + 10, 4, 3);
  texto('DICA', rx + 14, dy + 4, '#ffd84f', 8, 'left', true, 60);
  ld.forEach((t, i) => texto(t, rx + 5, dy + 16 + i * 10, '#fff6c0', 7, 'left', true, rw - 12));
  // botões
  menuGrade([
    { txt: 'COMEÇAR', x: 290, y: 186, w: 76, h: 15, acao: () => { mudar('jogo'); toastAtual.t = 0; } },
    { txt: 'VOLTAR', x: 227, y: 186, w: 54, h: 15, acao: () => mudar('fases') }
  ], [[1, 0]]);
  if (press('Escape')) mudar('fases');
}
