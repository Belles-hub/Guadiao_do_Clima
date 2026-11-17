'use strict';
/* =====================================================================
   18b. QUIZ DO GUARDIÃO: uma pergunta no fim de cada fase (definida em fase.js)
   ===================================================================== */
let quizResp = null;
function iniciarQuiz() { quizResp = null; mudar('quiz'); }
function responderQuiz(i) {
  const q = FASES[L.idx].quiz;
  quizResp = i;
  if (i === q.certa) { salvo.quiz = salvo.quiz || {}; salvo.quiz[L.idx] = true; salvarProgresso(); som('curar'); } else som('erro');
}
function telaQuiz() {
  const f = FASES[L.idx], q = f.quiz;
  cenarioMenu(Math.max(0.05, 0.6 - L.idx * 0.1), tempoGlobal);
  ret('rgba(8,14,30,0.33)', 0, 0, LARG, ALT);
  painel(35, 8, 315, 200, '#141c38', '#ffc81e');
  textoContorno('QUIZ DO GUARDIÃO', 192, 16, '#ffd84f', 13, 'center');
  texto('Pergunta da fase ' + (L.idx + 1), 192, 33, '#9aa6c8', 8, 'center', false);
  const lp = linhasTexto(q.pergunta, 262, 10), hp = lp.length * 13 + 10;
  rrect(48, 45, 288, hp, 1.5); ctx.fillStyle = '#4a5580'; ctx.fill(); rrect(49, 46, 286, hp - 2, 1); ctx.fillStyle = '#161c3a'; ctx.fill();
  lp.forEach((t, i) => textoContorno(t, 192, 51 + i * 13, '#fff', 10, 'center'));
  const y = 45 + hp + 11;
  if (quizResp === null) {
    for (let i = 0; i < 3; i++) if (press('Digit' + (i + 1), 'Numpad' + (i + 1))) responderQuiz(i);
    menuLista(q.opcoes.map((t, i) => ({ txt: String.fromCharCode(65 + i) + ') ' + t, acao: () => responderQuiz(i) })), 192, y, 266, 17, 24);
    texto('Escolha a resposta certa!', 192, 174, '#9aa6c8', 8, 'center', false);
  } else {
    q.opcoes.forEach((t, i) => {
      const bx = 59, by = y + i * 24, certa = i === q.certa, esc = i === quizResp;
      rrect(bx - 1, by - 1, 268, 19, 2.5); ctx.fillStyle = '#05060c'; ctx.fill();
      rrect(bx, by, 266, 17, 2); ctx.fillStyle = degrade(0, by, 17, certa ? '#6fe07a' : (esc ? '#ff9a8a' : '#5a5e6e'), certa ? '#2f9a44' : (esc ? '#c0382a' : '#3a3e4c')); ctx.fill();
      texto(String.fromCharCode(65 + i) + ') ' + t, bx + 133, by + 5, certa || esc ? '#fff' : '#8a8f9e', 8, 'center');
      if (certa) { ctx.strokeStyle = '#0c3a1a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(bx + 250, by + 9); ctx.lineTo(bx + 254, by + 13); ctx.lineTo(bx + 260, by + 5); ctx.stroke(); }
    });
    const acertou = quizResp === q.certa, le = linhasTexto(q.explicacao, 262, 8), hr = 28 + le.length * 10;
    const ry = y + 3 * 24 + 1;
    rrect(48, ry, 288, hr, 1.5); ctx.fillStyle = acertou ? '#4fd868' : '#ff9a6a'; ctx.fill(); rrect(49, ry + 1, 286, hr - 2, 1); ctx.fillStyle = acertou ? '#1b3a2a' : '#3a2418'; ctx.fill();
    textoContorno(acertou ? 'ACERTOU! Muito bem, Guardião!' : 'Quase! A resposta certa é a letra ' + String.fromCharCode(65 + q.certa) + '.', 192, ry + 6, acertou ? '#6fe07a' : '#ffb08a', 9, 'center');
    le.forEach((t, i) => textoContorno(t, 192, ry + 19 + i * 10, '#d8f0ff', 8, 'center'));
    if (press('Enter', 'Space') || mouse.clique) { som('ok'); quizResp = null; mudar(L.idx >= 5 ? 'vitoria' : 'fases'); }
  }
}
