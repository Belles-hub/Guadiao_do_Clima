'use strict';
/* =====================================================================
   18i. REINICIAR PROGRESSO
   Apaga fases liberadas, armas, poderes e checkpoint do save deste navegador.
   A história já vista continua marcada como vista.
   ===================================================================== */
function reiniciarProgresso() {
  const eraVista = !!salvo.historiaVista;
  salvo = salvoPadrao();
  salvo.historiaVista = eraVista;
  salvarProgresso();
  faseSel = 0;
  aviso = { txt: 'Progresso reiniciado!', t: 3 };
  mudar('menu');
}

function telaReiniciar() {
  cenarioMenu(0.4, tempoGlobal);
  ret('rgba(20,0,0,0.5)', 0, 0, LARG, ALT);
  painel(62, 44, 260, 124);
  textoContorno('REINICIAR PROGRESSO?', 192, 54, '#ff8a7a', 11, 'center');
  texto('Isto apaga as fases liberadas, as armas, os', 192, 78, '#fff', 7, 'center', true, 240);
  texto('poderes e o checkpoint.', 192, 89, '#fff', 7, 'center', true, 240);
  texto('Não dá para desfazer.', 192, 102, '#ffd84f', 7, 'center', true, 240);
  menuLista([
    { txt: 'CANCELAR', acao: () => mudar('menu') },
    { txt: 'SIM, APAGAR TUDO', acao: reiniciarProgresso }
  ], 192, 118, 150, 16, 22);
  if (press('Escape')) mudar('menu');
}
