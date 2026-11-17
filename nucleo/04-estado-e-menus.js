'use strict';
/* =====================================================================
   4. ESTADO GERAL E TELAS
   ===================================================================== */
let estado = 'menu', menuSel = 0, tempoGlobal = 0;
let faseSel = 0;               // fase marcada no mapa de fases
let aviso = { txt: '', t: 0 }; // mensagem curta nas telas de menu
function mudar(novo) { estado = novo; menuSel = 0; if (novo === 'vitoria') { vitoriaInicio = tempoGlobal; finalH = 0; finalInicio = tempoGlobal; } }

/* Lista de botões estilo menu: teclado (cima/baixo/Enter) e mouse */
function menuLista(itens, cx, y0, larg = 132, altb = 16, esp = 20) {
  if (press('ArrowUp', 'KeyW')) { menuSel = (menuSel + itens.length - 1) % itens.length; som('menu'); }
  if (press('ArrowDown', 'KeyS')) { menuSel = (menuSel + 1) % itens.length; som('menu'); }
  let acionar = -1;
  itens.forEach((it, i) => {
    const x = cx - larg / 2, y = y0 + i * esp;
    const dentro = noRet(x, y, larg, altb);
    if (dentro && mouse.moveu && menuSel !== i) { menuSel = i; som('menu'); }
    if (dentro && mouse.clique) { menuSel = i; acionar = i; }
    desenharBotao(x, y, larg, altb, it.txt, i === menuSel, it.desativado);
  });
  if (press('Enter')) acionar = menuSel;
  if (acionar >= 0 && !itens[acionar].desativado) { som('ok'); itens[acionar].acao(); }
}
function desenharBotao(x, y, w, h, txt, sel, desativado) {
  const pulso = sel ? Math.round(Math.sin(tempoGlobal * 8)) : 0;
  ctx.save();
  if (sel && !desativado) brilho(x + w / 2, y + h / 2, w * 0.62, '255,160,50', 0.28);
  rrect(x - 1, y - 1, w + 2, h + 3, 4); ctx.fillStyle = '#05060c'; ctx.fill();
  rrect(x, y, w, h, 3.5);
  ctx.fillStyle = degrade(x, y, h, desativado ? '#707070' : (sel ? '#ffd070' : '#8e9cff'), desativado ? '#444444' : (sel ? '#ff8a2a' : '#4558d8')); ctx.fill();
  rrect(x + 1.5, y + 1.5, w - 3, h - 3, 2.6);
  ctx.fillStyle = degrade(x, y, h, desativado ? '#3a3d48' : (sel ? '#ff7a4a' : '#3c4ca8'), desativado ? '#22252e' : (sel ? '#d8381e' : '#1e2a74')); ctx.fill();
  rrect(x + 2.5, y + 2.5, w - 5, h * 0.4, 2); ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.fill();
  ctx.restore();
  texto(txt, x + w / 2, y + Math.floor((h - 8) / 2) + 1, desativado ? '#888' : '#fff', 8, 'center', true, w - 8);
  if (sel) {
    ctx.fillStyle = '#ffd84f';
    [[x - 7 - pulso, 1], [x + w + 7 + pulso, -1]].forEach(([ax, d]) => { ctx.beginPath(); ctx.moveTo(ax, y + h / 2 - 4); ctx.lineTo(ax + 4 * d, y + h / 2); ctx.lineTo(ax, y + h / 2 + 4); ctx.closePath(); ctx.fill(); });
  }
}

/* Menu em grade (linhas de botões): setas movem, Enter/clique aciona.
   itens: { txt, acao, x, y, w, h }; linhas: lista de listas de índices, ex.: [[0], [1, 2], [3, 4]] */
function menuGrade(itens, linhas) {
  const pos = () => { for (let r = 0; r < linhas.length; r++) { const c = linhas[r].indexOf(menuSel); if (c >= 0) return [r, c]; } return [0, 0]; };
  let [r, c] = pos();
  if (press('ArrowLeft', 'KeyA')) { c = (c + linhas[r].length - 1) % linhas[r].length; menuSel = linhas[r][c]; som('menu'); }
  if (press('ArrowRight', 'KeyD')) { c = (c + 1) % linhas[r].length; menuSel = linhas[r][c]; som('menu'); }
  if (press('ArrowUp', 'KeyW')) { r = (r + linhas.length - 1) % linhas.length; c = Math.min(c, linhas[r].length - 1); menuSel = linhas[r][c]; som('menu'); }
  if (press('ArrowDown', 'KeyS')) { r = (r + 1) % linhas.length; c = Math.min(c, linhas[r].length - 1); menuSel = linhas[r][c]; som('menu'); }
  let acionar = -1;
  itens.forEach((it, i) => {
    const dentro = noRet(it.x, it.y, it.w, it.h);
    if (dentro && mouse.moveu && menuSel !== i) { menuSel = i; som('menu'); }
    if (dentro && mouse.clique) { menuSel = i; acionar = i; }
    if (it.desenhar) it.desenhar(it.x, it.y, it.w, it.h, i === menuSel); else desenharBotao(it.x, it.y, it.w, it.h, it.txt, i === menuSel, it.desativado);
  });
  if (press('Enter', 'Space')) acionar = menuSel;
  if (acionar >= 0 && !itens[acionar].desativado) { som('ok'); itens[acionar].acao(); }
}
