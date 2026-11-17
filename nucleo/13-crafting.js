'use strict';
/* =====================================================================
   13. MONTAGEM E MELHORIA DE ARMAS (menu da tecla E)
   Primeiro você monta a arma da fase. Depois pode melhorá-la para o nível 2 com os materiais que sobraram.
   ===================================================================== */
const temMateriais = rec => Object.keys(rec).every(m => (L.inv[m] || 0) >= rec[m]);
const podeMontar = i => !salvo.armas[ARMAS[i].id] && temMateriais(ARMAS[i].receita);
const podeMelhorar = i => !!salvo.armas[ARMAS[i].id] && armaNivel(ARMAS[i].id) < 2 && temMateriais(ARMAS[i].nv2.receita);
function montarArma(i) {
  const a = ARMAS[i];
  if (salvo.armas[a.id]) { toast('Você já montou esta arma!', 1.5); return; }
  if (!podeMontar(i)) { toast('Faltam materiais!', 1.5); som('erro'); return; }
  for (const m in a.receita) L.inv[m] -= a.receita[m];
  salvo.armas[a.id] = true; salvarProgresso();
  J.arma = i; craftAberto = false; L.trocouArma = L.tempo;
  dispararLicao('arma');
  mostrarConquista({ titulo: 'NOVA ARMA!', nome: a.nome, desc: a.desc, como: a.como, cor: '#ffd84f', icone: () => desenharIcone('arma_' + a.id, 0, 0) });
}
function melhorarArma(i) {
  const a = ARMAS[i];
  if (!podeMelhorar(i)) { toast('Faltam materiais para a melhoria!', 1.6); som('erro'); return; }
  for (const m in a.nv2.receita) L.inv[m] -= a.nv2.receita[m];
  salvo.niveis = salvo.niveis || {}; salvo.niveis[a.id] = 2; salvarProgresso();
  J.arma = i; craftAberto = false;
  mostrarConquista({ titulo: 'ARMA MELHORADA!', nome: a.nv2.nome, desc: a.nv2.desc, como: a.nv2.como, cor: '#ff9a3a', icone: () => desenharIcone('arma_' + a.id, 0, 0) });
}
function acaoCrafting(i) {
  const a = ARMAS[i];
  if (!salvo.armas[a.id]) montarArma(i);
  else if (armaNivel(a.id) < 2) melhorarArma(i);
  else toast('Esta arma já está no nível máximo!', 1.6);
}
function atualizarCrafting() {
  if (press('ArrowUp', 'KeyW')) { craftSel = (craftSel + 4) % 5; som('menu'); }
  if (press('ArrowDown', 'KeyS')) { craftSel = (craftSel + 1) % 5; som('menu'); }
  if (press('Enter', 'Space', 'KeyJ')) acaoCrafting(craftSel);
  for (let i = 0; i < 5; i++) if (mouse.clique && noRet(48, 52 + i * 24, 112, 22)) craftSel = i;
  if (mouse.clique && noRet(186, 156, 104, 20)) acaoCrafting(craftSel);
}
function desenharCrafting() {
  ret('rgba(0,0,0,0.36)', 0, 0, LARG, ALT);
  painel(32, 20, 320, 176);
  texto('OFICINA DO GUARDIÃO', 192, 28, '#ffd84f', 8, 'center');
  ARMAS.forEach((a, i) => {
    const y = 52 + i * 24, sel = i === craftSel, feita = salvo.armas[a.id];
    cantos(sel ? '#ffd84f' : '#3a4468', 48, y, 112, 22); cantos(sel ? '#4a3a1a' : '#232a44', 50, y + 2, 108, 18);
    ret('#000', 53, y + 4, 14, 14); ret('#161b30', 54, y + 5, 12, 12);
    if (feita) desenharIcone('arma_' + a.id, 60, y + 11); else { ctx.globalAlpha = 0.3; desenharIcone('arma_' + a.id, 60, y + 11); ctx.globalAlpha = 1; }
    texto(String(i + 1) + (feita ? (armaNivel(a.id) >= 2 ? ' NV2' : ' OK') : ''), 72, y + 7, feita ? (armaNivel(a.id) >= 2 ? '#ffb02a' : '#7fe07a') : '#aab', 8);
  });
  const a = ARMAS[craftSel], feita = salvo.armas[a.id], nv2 = armaNivel(a.id) >= 2;
  const rec = !feita ? a.receita : (!nv2 ? a.nv2.receita : null);
  const titulo = (feita && !nv2 ? 'MELHORIA: ' + a.nv2.nome : (nv2 ? a.nv2.nome : a.nome)).toUpperCase();
  let ty = 52 + 11 * textoQuebrado(titulo, 176, 52, 168, nv2 ? '#ffb02a' : '#fff', 11) + 3;
  ty += 11 * textoQuebrado(!feita ? a.desc : a.nv2.desc, 176, ty, 168, '#b8c4e8', 11) + 4;
  if (rec) {
    texto('MATERIAIS:', 176, ty, '#ffd84f', 8);
    let y = ty + 11;
    for (const m in rec) {
      const tem = L.inv[m] || 0, nec = rec[m], ok = tem >= nec;
      desenharIcone(m, 182, y + 4);
      texto(MATERIAIS[m], 192, y, ok ? '#7fe07a' : '#ff8a7a', 8);
      texto(tem + '/' + nec, 342, y, ok ? '#7fe07a' : '#ff8a7a', 8, 'right');
      y += 11;
    }
  } else textoQuebrado('Nível máximo! ' + a.nv2.como, 176, ty, 168, '#7fe07a', 11);
  const ativo = !feita ? podeMontar(craftSel) : podeMelhorar(craftSel), rot = !feita ? 'MONTAR' : (!nv2 ? 'MELHORAR' : 'NÍVEL MÁXIMO');
  cantos('#000', 185, 155, 106, 22);
  cantos(nv2 ? '#3a6a3a' : ativo ? '#ffd84f' : '#555', 186, 156, 104, 20);
  cantos(nv2 ? '#245a2a' : ativo ? '#c0392b' : '#2a2d38', 188, 158, 100, 16);
  texto(rot, 238, 162, nv2 ? '#9fe09a' : ativo ? '#fff' : '#888', 8, 'center');
  texto('SETAS  ENTER/J: ' + (feita ? 'melhorar' : 'montar') + '  E: fechar', 192, 182, '#8a96b8', 8, 'center');
}
