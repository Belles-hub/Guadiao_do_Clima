'use strict';
/* =====================================================================
   18d. TELA DE ENTRADA: entrar com o Google ou jogar como convidado
   ===================================================================== */
function abrirTelaConta() { gLogin.erro = ''; mudar('conta'); }
function aposEntrar() {                                   // quem é novo vê a história antes de tudo
  if (!salvo.historiaVista) iniciarHistoria(); else mudar('menu');
}
function telaConta(dt) {
  desenharCapa(tempoGlobal);
  if (Math.random() < dt * 14) emitir('brasa', rnd(210, LARG), rnd(110, 190), 1);
  atualizarParticulas(dt); desenharParticulas();
  tituloCapa(tempoGlobal);
  textoContorno('ENTRE PARA SALVAR', 192, 88, '#fff6d0', 8, 'center');
  textoContorno('SEU PROGRESSO', 192, 98, '#fff6d0', 8, 'center');
  menuGrade([
    { txt: gLogin.pendente ? 'ABRINDO...' : 'LOGIN GOOGLE', x: 130, y: 161, w: 124, h: 18, acao: () => { if (!gLogin.pendente) entrarComGoogle(); } },
    { txt: chaveSave ? 'VOLTAR' : 'CONVIDADO', x: 130, y: 184, w: 124, h: 16, acao: () => { if (!chaveSave) abrirSave(null, null); aposEntrar(); } }
  ], [[0], [1]]);
  if (gLogin.erro) {
    ctx.save(); ctx.fillStyle = 'rgba(10,6,12,0.7)'; rrect(100, 201, 184, 13, 3); ctx.fill(); ctx.restore();
    texto(gLogin.erro, 192, 204, '#ff9a8a', 8, 'center', false);
  }
}
