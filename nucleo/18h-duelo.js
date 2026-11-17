'use strict';
/* =====================================================================
   18h. CAIXA DE FALA NO ALTO (mesmo estilo da abertura): etiqueta com o nome e texto letra por letra
   ===================================================================== */
const VEL_TEXTO = 38;                                   // letras por segundo
/* Desenha a caixa e devolve true quando o texto já apareceu inteiro */
function caixaFalaTopo(txt, t, dica, quem, cor) {
  const total = txt.length, n = Math.min(total, Math.floor(t * VEL_TEXTO)), completo = n >= total;
  const linhas = linhasTexto(txt, 332, 8), h = 18 + linhas.length * 11;
  rrect(12, 15, 360, h + 2, 5); ctx.fillStyle = '#e8d9a0'; ctx.fill();
  rrect(13.5, 16.5, 357, h - 1, 4); ctx.fillStyle = '#141a30'; ctx.fill();
  if (quem) {
    const c = cor || (quem === 'DAVI' ? '#ffd84f' : (quem === 'FORNAX' ? '#ff9a6a' : '#bfe9ff')), wq = quem.length * 8 + 16;
    rrect(20, 6, wq + 2, 15, 3); ctx.fillStyle = '#05060c'; ctx.fill();
    rrect(21, 7, wq, 13, 2.5); ctx.fillStyle = c; ctx.fill();
    texto(quem, 21 + wq / 2, 10, '#2a1a10', 8, 'center', false);
  }
  let resta = n;
  linhas.forEach((l, i) => { if (resta <= 0) return; texto(l.slice(0, resta), 26, 26 + i * 11, '#fff', 8, 'left', true, 340); resta -= l.length + 1; });
  if (completo && dica && Math.sin(tempoGlobal * 6) > -0.2) texto(dica, 366, 15 + h - 8, '#ffd84f', 6, 'right', false);
  return completo;
}
