'use strict';
/* =====================================================================
   18e. CONQUISTAS: tela de introdução quando você ganha um poder, monta uma arma ou a melhora
   conquista = { titulo, nome, desc, como, cor, icone() }  (o ícone é desenhado com o centro em 0,0)
   ===================================================================== */
let conquista = null, conquistaT = 0;
function mostrarConquista(c) {
  conquista = c; conquistaT = 0;
  som('conquista');
  confete(J.x + J.w / 2, J.y, 30);
  mudar('conquista');
}
function telaConquista() {
  const c = conquista;
  conquistaT += 1 / 60;
  desenharCena();
  ret('rgba(6,10,24,0.49)', 0, 0, LARG, ALT);
  painel(36, 14, 312, 188, '#12182c', c.cor);
  // título que pulsa
  const pulso = Math.round(Math.sin(conquistaT * 6));
  texto(c.titulo, 192, 22 + pulso, '#ffd84f', 16, 'center');
  // raios de luz girando atrás do ícone
  ctx.save(); ctx.translate(192, 82); ctx.beginPath(); ctx.rect(-70, -34, 140, 68); ctx.clip();
  ctx.rotate(conquistaT * 0.8);
  for (let i = 0; i < 12; i++) { ctx.rotate(Math.PI / 6); ctx.globalAlpha = 0.22; ctx.fillStyle = c.cor; ctx.fillRect(10, -3, 80, 6); }
  ctx.globalAlpha = 1; ctx.restore();
  // ícone grande
  ret('#000', 168, 58, 48, 48); ret(c.cor, 169, 59, 46, 46); ret('#161c34', 171, 61, 42, 42);
  ctx.save(); ctx.translate(192, 82 + Math.round(Math.sin(conquistaT * 4) * 1.5)); ctx.scale(3, 3); c.icone(); ctx.restore();
  // nome e explicação
  texto(c.nome.toUpperCase(), 192, 112, c.cor, 8, 'center');
  let y = 126;
  y += 11 * textoQuebrado(c.desc, 52, y, 280, '#fff', 11) + 4;
  texto(c.poder ? 'COMO USAR:' : 'COMO USAR:', 52, y, '#7fe07a', 8); y += 11;
  textoQuebrado(c.como, 52, y, 280, '#bfe9ff', 11);
  if (conquistaT > 0.8 && Math.sin(tempoGlobal * 6) > -0.3) texto('ENTER: continuar', 192, 190, '#ffd84f', 8, 'center');
  if (conquistaT > 0.8 && (press('Enter', 'Space', 'KeyJ') || mouse.clique)) { som('ok'); mudar('jogo'); }
}
