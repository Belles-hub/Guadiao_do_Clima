'use strict';
/* =====================================================================
   15. ATUALIZAÇÃO DA FASE (um quadro)
   ===================================================================== */
function atualizarCena(dt) {
  L.tempo += dt;
  if (L.forja > 0) { L.forja -= dt; if (L.forja <= 0) { iniciarForja(); return; } }
  atualizarJogador(dt);
  if (estado !== 'jogo') return;
  for (const e of inimigos) if (e.vivo) atualizarInimigo(e, dt);
  inimigos = inimigos.filter(e => e.vivo);
  atualizarChefe(dt);
  atualizarVilao(dt); atualizarHostis(dt);
  atualizarPoderes(dt); atualizarAmbienteVisual(dt);
  atualizarItens(dt);
  atualizarProjeteis(dt);
  tentarCheckpoint();
  // objetivos: fogo, bairros poluídos, geradores, recifes
  for (const f of focos) {
    f.t += dt; f.flash -= dt;
    const cx = f.x + f.w / 2;
    const dd = Math.hypot(cx - J.x, f.y - J.y), volF = clamp(1 - dd / 130, 0, 1);
    if (!f.apagado) {
      if (f.tipo === 'fogo') {
        if (Math.random() < dt * 10) emitir('fagulha', f.x + 8, f.y + 4, 1);
        if (Math.random() < dt * 1.5 && volF > 0.1) som('crepitar', volF * 0.8);
        if (Math.random() < dt * 6) emitir('fumaca', f.x + 8, f.y - 4, 1);
        if (colide({ x: f.x + 3, y: f.y + 1, w: 10, h: 15 }, J)) danificarJogador(f.x + 8);
      } else if (f.tipo === 'bairro') {
        if (Math.random() < dt * 8) emitir('fumaca', cx + rnd(-8, 8), f.y + 4, 1);
        if (Math.random() < dt * 0.8 && volF > 0.1) som('tosse', volF * 0.6);
      } else if (f.tipo === 'gerador') {
        if (Math.random() < dt * 7) emitir('fumaca', f.x + 13, f.y - 2, 1);
        if (Math.random() < dt * 4) emitir('fagulha', f.x + 8, f.y + 8, 1, '#ff5a3a');
        if (Math.random() < dt * 1.2 && volF > 0.1) som('motor', volF * 0.8);
      }
    } else if (f.tipo === 'recife' && Math.random() < dt * 3) emitir('bolha', cx + rnd(-8, 8), f.y + 6, 1, '#ff9ae0');
  }
  // bandeira / fim da fase
  const b = L.bandeira, fase = FASES[L.idx];
  L.avisoBandeira -= dt;
  if (!L.concluida && !chefe && colide(b, J)) {
    const faltaArma = fase.arma >= 0 && !salvo.armas[ARMAS[fase.arma].id];
    const vilaoOk = !vilao || vilao.morto;
    if (L.progresso >= L.total && !faltaArma && vilaoOk) {
      L.concluida = true; L.fim = 0; L.calorAlvo = 0.05; som('vitoria'); confete(J.x, J.y - 10, 70);
      emitir('brilho', b.x + 8, b.y + 10, 30); emitir('folha', b.x + 8, b.y + 10, 20);
    } else if (L.avisoBandeira <= 0) {
      L.avisoBandeira = 3; som('erro');
      toast(!vilaoOk && L.progresso >= L.total && !faltaArma ? 'Derrote ' + vilao.d.curto + ' para passar!' : (L.progresso >= L.total ? (faltaArma ? 'Monte a arma (tecla E) antes de terminar!' : 'Derrote ' + vilao.d.curto + ' para passar!') : fase.objetivo.rotulo + ': ' + L.progresso + '/' + L.total), 2.5);
    }
  }
  if (L.concluida) {
    L.fim += dt;
    if (!chefe && Math.random() < dt * 20) emitir('brilho', b.x + rnd(-20, 30), b.y + rnd(0, 40), 1);
    if (L.fim > (chefe ? 3.6 : 1.8)) { finalizarFase(); return; }
  }
  // clima suavizado
  L.calor = lerp(L.calor, L.calorAlvo, 1 - Math.exp(-2 * dt));
  // partículas ambientes de cada cenário
  if (Math.random() < dt * (3 + 8 * L.calor)) {
    const est = fase.tema.estilo, x = cam.x + rnd(0, LARG), y = cam.y + rnd(0, ALT * 0.7);
    if (est === 'oceano') emitir('bolha', x, cam.y + ALT - rnd(0, 40), 1);
    else if (est === 'cidade') emitir('fumaca', x, cam.y + rnd(ALT * 0.4, ALT), 1);
    else if (est === 'lixao') emitir('poeira', x, y, 1, '#9a9a80');
    else emitir(L.calor > 0.45 ? 'brasa' : 'folha', x, y, 1);
  }
  atualizarParticulas(dt);
  atualizarLicoes(dt); if (L.tempo > 5) dispararLicao('inicio');
  atualizarCamera(dt);
  toastAtual.t -= dt;
}
function finalizarFase() {
  salvo.concluidas[L.idx] = true;
  salvo.liberadas = Math.max(salvo.liberadas, Math.min(6, L.idx + 2));
  if (salvo.checkpoint && salvo.checkpoint.idx === L.idx) { salvo.checkpoint = null; salvo.cpT = Date.now(); }   // fase concluída: o checkpoint não vale mais
  salvarProgresso();
  faseSel = Math.min(5, L.idx + 1);
  chefe = null;
  mudar('concluida');
}
