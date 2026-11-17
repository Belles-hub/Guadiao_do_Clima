'use strict';
/* =====================================================================
   19. LOOP PRINCIPAL (requestAnimationFrame com delta time)
   ===================================================================== */
function quadro(dt) {
  lerControle();
  atualizarToque();
  ctx.setTransform(ESC_TELA, 0, 0, ESC_TELA, 0, 0);
  ctx.imageSmoothingEnabled = false;
  if (estado !== 'conta') {                 // na tela de conta as letras M e N são texto
    if (press('KeyM')) alternarMusica();
    if (press('KeyN')) alternarEfeitos();
  }
  atualizarMusica(dt);
  switch (estado) {
    case 'conta': telaConta(dt); break;
    case 'menu': telaMenu(dt); break;
    case 'historia': telaHistoria(dt); break;
    case 'controles': telaControles(); break;
    case 'creditos': telaCreditos(); break;
    case 'reiniciar': telaReiniciar(); break;
    case 'fases': telaFases(); break;
    case 'jogo':
      if (press('KeyH')) { ajudaAberta = !ajudaAberta; som('menu'); }
      if (press('KeyP', 'Escape')) { if (ajudaAberta) ajudaAberta = false; else if (craftAberto) craftAberto = false; else { mudar('pausa'); desenharCena(); return; } }
      else if (press('KeyE')) {
        if (craftAberto) craftAberto = false;
        else {
          // E: coleta item próximo (feito em atualizarItens); se não houver, abre o menu de montagem
          const perto = itens.some(it => !it.pego && Math.hypot(it.x - (J.x + J.w / 2), it.y - (J.y + J.h / 2)) < 40);
          if (!perto) { craftAberto = true; som('ok'); }
        }
      }
      if (ajudaAberta) { /* jogo pausado enquanto a ajuda está aberta */ }
      else if (!craftAberto) atualizarCena(dt); else { atualizarCrafting(); atualizarParticulas(dt); toastAtual.t -= dt; }
      if (estado === 'jogo') { desenharCena(); if (craftAberto && !ajudaAberta) desenharCrafting(); if (ajudaAberta) desenharAjuda(); }
      else if (estado === 'gameover') telaGameOver();
      else if (estado === 'concluida') telaConcluida();
      else if (estado === 'conquista') telaConquista();
      break;
    case 'pausa': telaPausa(); break;
    case 'gameover': telaGameOver(); break;
    case 'concluida': telaConcluida(); break;
    case 'armadura': telaArmadura(); break;
    case 'curiosidade': telaCuriosidade(); break;
    case 'quiz': telaQuiz(); break;
    case 'intro': telaIntro(); break;
    case 'conquista': telaConquista(); break;
    case 'vitoria': telaVitoria(); break;
  }
}
let ultimo = 0;
function loop(agora) {
  const dt = Math.min(0.033, (agora - ultimo) / 1000 || 0.016);
  ultimo = agora; tempoGlobal += dt;
  quadro(dt);
  desenharAvisoSom();
  for (const k in apertou) delete apertou[k];
  digitado = '';
  mouse.clique = false; mouse.moveu = false;
  requestAnimationFrame(loop);
}
