'use strict';
/* =====================================================================
   18. TELAS: menu, controles, créditos, mapa de fases, pausa etc.
   ===================================================================== */
/* Cenário animado usado no menu e nas telas */
/* cenarioMenu agora está em 16c-luz.js */
let tilesMenu = null;
function chaoMenu(dy = 0) {
  if (!tilesMenu) { construirTiles(FASES[0].tema); tilesMenu = tiles; }
  for (let x = 0; x < 25; x++) {
    ctx.drawImage(tilesMenu['#'][hash(x) & 3], x * TAM, 176 + dy);
    ctx.drawImage(tilesMenu['D'][hash(x + 9) & 3], x * TAM, 192 + dy);
    ctx.drawImage(tilesMenu['S'][hash(x + 4) & 3], x * TAM, 208 + dy);
  }
}
let proxRugido = 3;
function telaMenu(dt) {
  if (actx && actx.state === 'running' && tempoGlobal > proxRugido) { som('rugido'); proxRugido = tempoGlobal + 14; }
  desenharCapa(tempoGlobal);
  if (Math.random() < dt * 14) emitir('brasa', rnd(210, LARG), rnd(110, 190), 1);
  if (Math.random() < dt * 2) emitir('folha', rnd(0, 150), rnd(20, 120), 1);
  atualizarParticulas(dt); desenharParticulas();
  tituloCapa(tempoGlobal);
  textoContorno('SALVE O PLANETA!', 192, 95, '#fff6d0', 8, 'center');
  menuGrade([
    { txt: 'JOGAR', x: 133, y: 161, w: 94, h: 18, acao: () => { if (!salvo.historiaVista) iniciarHistoria(); else { faseSel = Math.min(5, salvo.liberadas - 1); mudar('fases'); } } },
    { txt: 'HISTÓRIA', x: 105, y: 184, w: 74, h: 14, acao: () => iniciarHistoria() },
    { txt: 'COMANDOS', x: 183, y: 184, w: 74, h: 14, acao: () => mudar('controles') },
    { txt: 'CRÉDITOS', x: 143, y: 201, w: 98, h: 13, acao: () => mudar('creditos') },
    { txt: 'REINICIAR', x: 4, y: 4, w: 68, h: 11, acao: () => mudar('reiniciar') }
  ], [[0], [1, 2], [3], [4]]);
  if (aviso.t > 0) { aviso.t -= dt; textoContorno(aviso.txt, 192, 30, '#9dff8a', 8, 'center'); }
  textoContorno('M MÚSICA  N EFEITOS', 380, 3, '#ffffff', 8, 'right');
}
/* Tecla desenhada como um botãozinho; devolve a largura */
function chipTecla(x, y, txt) {
  const seta = txt === '<' || txt === '>', tam = txt.length > 1 ? 6 : 8, w = seta ? 12 : Math.max(12, txt.length * tam + 5);
  rrect(x - 1, y - 1, w + 2, 14, 2); ctx.fillStyle = '#05060c'; ctx.fill();
  rrect(x, y, w, 12, 1.5); ctx.fillStyle = degrade(0, y, 12, '#f2f2f8', '#aeb2c4'); ctx.fill();
  if (seta) { ctx.fillStyle = '#242a44'; ctx.beginPath(); if (txt === '<') { ctx.moveTo(x + 8, y + 3); ctx.lineTo(x + 3.5, y + 6); ctx.lineTo(x + 8, y + 9); } else { ctx.moveTo(x + 4, y + 3); ctx.lineTo(x + 8.5, y + 6); ctx.lineTo(x + 4, y + 9); } ctx.closePath(); ctx.fill(); }
  else texto(txt, x + w / 2 + 0.5, y + (tam === 6 ? 3 : 2), '#242a44', tam, 'center', false, w - 1);
  return w;
}
function telaControles() {
  cenarioMenu(0.6, tempoGlobal);
  ret('rgba(8,14,30,0.33)', 0, 0, LARG, ALT);
  painel(27, 6, 330, 204);
  textoContorno('CONTROLES', 192, 14, '#ffd84f', 13, 'center');
  ret('rgba(190,200,240,0.4)', 42, 34, 300, 1);
  const lin = [
    [['<', '>', '/', 'A', 'D'], 'Andar'], [['ESPAÇO', '/', 'W'], 'Pular (segure = mais alto)'], [['J'], 'Atacar com a arma'],
    [['K', '/', '0-5'], 'Trocar arma (0 = punhos)'], [['E'], 'Coletar / montar armas'], [['Q', '/', 'R'], 'Usar / trocar poder'],
    [['H'], 'Ajuda'], [['P', '/', 'ESC'], 'Pausar']
  ];
  lin.forEach(([teclas, desc], i) => {
    const y = 40 + i * 17.4;
    if (i % 2 === 0) ret('rgba(255,255,255,0.05)', 38, y - 1, 308, 16);
    let x = 46;
    teclas.forEach(t => { if (t === '/') { texto('/', x + 1, y + 3, '#8a96b8', 8, 'left', false); x += 10; } else x += chipTecla(x, y + 0.5, t) + 3; });
    texto(desc, 150, y + 4, '#fff', 7, 'left', true, 192);
  });
  botaoContinuar(187, 'VOLTAR', () => mudar('menu'));
  if (press('Escape')) mudar('menu');
}
function telaCreditos() {
  cenarioMenu(0.4, tempoGlobal);
  ret('rgba(8,14,30,0.33)', 0, 0, LARG, ALT);
  painel(30, 9, 324, 197);
  textoContorno('CRÉDITOS', 192, 17, '#ffd84f', 13, 'center');
  linhasTexto('Guardião do Clima é um jogo educativo sobre o aquecimento global.', 290, 7).forEach((t, i) => textoContorno(t, 192, 37 + i * 11, '#fff', 7, 'center'));
  [[44, 13, '#2f7a3a', '#4fd868', 'Ação contra a mudança do clima'], [198, 12, '#b07a24', '#e8a83a', 'Consumo e produção responsável']].forEach(([x, n, cor, borda, txt]) => {
    rrect(x, 62, 142, 36, 1.5); ctx.fillStyle = borda; ctx.fill(); rrect(x + 1, 63, 140, 34, 1); ctx.fillStyle = '#16213a'; ctx.fill();
    rrect(x + 4, 66, 22, 28, 1); ctx.fillStyle = '#05060c'; ctx.fill(); rrect(x + 5, 67, 20, 26, 1); ctx.fillStyle = cor; ctx.fill();
    texto('ODS', x + 15.5, 69, '#fff', 6, 'center', false);
    textoContorno(String(n), x + 15.5, 78, '#fff', 10, 'center', 18);
    linhasTexto(txt, 104, 7).forEach((t, i) => texto(t, x + 32, 69 + i * 10, '#d8e0ff', 7, 'left', false, 106));
  });
  ret('rgba(190,200,240,0.4)', 44, 105, 296, 1);
  [['Criação', '[seu nome]'], ['Arte e código', 'feitos com apoio de IA'], ['Fonte', 'Press Start 2P']].forEach(([r, v], i) => {
    texto(r, 52, 113 + i * 13, '#8e9cff', 7, 'left', false, 96); texto(v, 150, 113 + i * 13, '#fff', 7, 'left', true, 188);
  });
  rrect(44, 154, 296, 28, 1.5); ctx.fillStyle = '#d8a82a'; ctx.fill(); rrect(45, 155, 294, 26, 1); ctx.fillStyle = '#3a3214'; ctx.fill();
  texto('Cada atitude conta.', 192, 159, '#ffd84f', 7, 'center', false, 284);
  texto('Seja você também um Guardião do Clima!', 192, 170, '#ffd84f', 7, 'center', false, 284);
  botaoContinuar(186, 'VOLTAR', () => mudar('menu'));
  if (press('Escape')) mudar('menu');
}

/* ---------- história (introdução antes de jogar) ---------- */
const HISTORIA = [
  { cena: 'praca', quem: 'DAVI', texto: 'Oi! Eu sou o Davi e tenho 15 anos. Moro numa cidade que fica mais quente a cada verão.' },
  { cena: 'praca', quem: 'DAVI', texto: 'Esta bandana verde nunca sai de mim: foi presente da minha avó. E eu ainda rego a última árvore da praça.' },
  { cena: 'seca', texto: 'Num dia de calor recorde, o céu fica vermelho e a árvore da praça seca de vez.' },
  { cena: 'semente', texto: 'Davi encosta na árvore, triste. Uma luz verde sai das raízes: é a SEMENTE DO CLIMA, a última energia viva do planeta. Ela escolhe o Davi!' },
  { cena: 'poder', texto: 'A energia entra pela mão dele. Agora Davi sente de onde vem a força que adoece o mundo, e pode destruir essas fontes!' },
  { cena: 'fornax', texto: 'Essa força é FORNAX, a febre do planeta. Nasceu um broto de fumaça e cresce a cada poluição, desmatamento ou desperdício. No peito, ele prende o coração da Terra.' },
  { cena: 'subs', texto: 'Fornax tem 5 subguardiões. Cada um é uma causa real do aquecimento global.' },
  { cena: 'armas', texto: 'A cada subguardião vencido, Davi ganha uma arma verde, Fornax enfraquece e um pedaço do mundo volta a ficar verde.' },
  { cena: 'guardiao', texto: 'Davi aceita de vez a missão. A energia explode e ele vira o GUARDIÃO DO CLIMA, com máscara, capa e o emblema da folha no peito!' },
  { cena: 'missao', texto: 'Juntas, as armas formam o PODER DO CLIMA. Você aceita a missão de salvar o planeta?' }
];
const SUBS = [['serrao', 'SERRÃO', 'DESMATAMENTO'], ['capitao', 'CAPITÃO', 'POLUIÇÃO DOS CARROS'], ['barao', 'BARÃO', 'ENERGIA SUJA'], ['reilixo', 'REI LIXO', 'DESPERDÍCIO'], ['medusa', 'MEDUSA', 'PLÁSTICO NO MAR']];
let slideH = 0, slideInicio = 0;
function iniciarHistoria() { slideH = 0; slideInicio = tempoGlobal; mudar('historia'); }
function terminarHistoria() { salvo.historiaVista = true; salvarProgresso(); faseSel = Math.min(5, salvo.liberadas - 1); mudar('fases'); }
function quebrarLinhas(str, larg, tam = 8) {
  ctx.font = tam + 'px ' + FONTE;
  const linhas = []; let atual = '';
  for (const p of str.split(' ')) {
    const teste = atual ? atual + ' ' + p : p;
    if (ctx.measureText(teste).width > larg && atual) { linhas.push(atual); atual = p; } else atual = teste;
  }
  if (atual) linhas.push(atual);
  return linhas;
}
function desenharPlaneta(cx, cy, r, calor) {
  ctx.fillStyle = misturar('#2f7be0', '#e0381a', calor);
  for (let y = -r; y <= r; y++) { const w = Math.floor(Math.sqrt(r * r - y * y)); ctx.fillRect(cx - w, cy + y, w * 2, 1); }
  ctx.fillStyle = misturar('#3fae49', '#8a4a1a', calor);
  const s = r / 40;
  [[-20, -12, 18, 10], [4, -6, 22, 12], [-12, 12, 16, 9], [14, 20, 10, 6]].forEach(([a, b, w, h]) => ctx.fillRect(Math.round(cx + a * s), Math.round(cy + b * s), Math.round(w * s), Math.round(h * s)));
  ctx.fillStyle = 'rgba(255,255,255,' + (0.5 * (1 - calor)) + ')';
  ctx.fillRect(cx - Math.round(24 * s), cy - Math.round(24 * s), Math.round(14 * s), 3); ctx.fillRect(cx + Math.round(6 * s), cy + Math.round(4 * s), Math.round(18 * s), 3);
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  for (let y = -r; y <= r; y++) { const w = Math.floor(Math.sqrt(r * r - y * y)); ctx.fillRect(cx + Math.floor(w * 0.5), cy + y, Math.ceil(w * 0.5), 1); }
}
function telaHistoria(dt) {
  const sl = HISTORIA[slideH], t = tempoGlobal - slideInicio;
  const DY = -44, CHAO = 132;   // DY sobe o cenário para não ficar atrás da caixa de texto; CHAO = y do chão
  const nome = (s, x, y, cor = '#ffd84f') => texto(s, x, y, cor, 8, 'center');
  switch (sl.cena) {
    case 'praca': {                                                                  // cenário claro de floresta, Davi grande regando
      cenarioMenu(0.0, tempoGlobal); chaoMenu(0);
      const dx = 110;
      desenharDavi(dx - 8 * 3, 186 - 24 * 3 + Math.round(Math.sin(tempoGlobal * 4) * 0.6), 1, 'parado', 0, null, 3);
      spriteCen('regador', dx + 30, 160, 18);                                      // regador nas mãos do Davi
      for (let i = 0; i < 4; i++) { const f = (tempoGlobal * 1.4 + i * 0.25) % 1; ret('#6ab8f0', dx + 38 + i * 0.5, 160 + f * 24, 1, 2); }
      if (Math.random() < dt * 5) emitir('brilho', dx - 6 + rnd(-6, 6), 150, 1, '#7fe07a');   // a bandana brilha
      if (Math.random() < dt * 3) emitir('folha', rnd(0, LARG), rnd(30, 110), 1);
      break;
    }
    case 'seca': {
      const calor = Math.min(1, 0.6 + t * 0.2);
      cenarioMenu(calor, tempoGlobal); chaoMenu(DY);
      desenharArvore(250, CHAO, Math.max(0, 0.5 - t * 0.2), 1.3, tempoGlobal);
      desenharDavi(150, CHAO - 48, 1, 'parado', 0, null, 2);
      if (Math.random() < dt * 8) emitir('brasa', rnd(0, LARG), rnd(60, 130), 1);
      if (t > 1.5 && Math.random() < dt * 5) emitir('folha', 250 + rnd(-24, 24), CHAO - 60, 1);
      ret('#000', 340, 14, 14, 110); ret('#2a2030', 342, 16, 10, 106);
      const h = Math.round(106 * calor); ctx.fillStyle = misturar('#3ec1ff', '#ff3b1f', calor); ctx.fillRect(342, 16 + 106 - h, 10, h);
      break;
    }
    case 'semente': {
      cenarioMenu(0.8 - Math.min(0.4, t * 0.1), tempoGlobal); chaoMenu(DY);
      const luz = Math.min(1, t * 0.5);
      desenharArvore(250, CHAO, luz * 0.5, 1.3, tempoGlobal);
      ctx.fillStyle = 'rgba(127,224,122,' + (0.35 * luz) + ')'; ctx.fillRect(240, 0, 20, CHAO + 4);
      ctx.fillStyle = 'rgba(220,255,200,' + (0.55 * luz) + ')'; ctx.fillRect(246, 0, 8, CHAO + 4);
      desenharDavi(222, CHAO - 48, 1, 'parado', 0, null, 2);
      if (Math.random() < dt * 22 * luz) emitir('brilho', 250 + rnd(-16, 16), rnd(30, CHAO), 1, '#7fe07a');
      if (t > 1.2) nome('SEMENTE DO CLIMA', 250, 6, '#7fe07a');
      break;
    }
    case 'poder': {
      cenarioMenu(0.55, tempoGlobal); chaoMenu(DY);
      for (let i = 0; i < 3; i++) {                                                    // anéis de energia
        const r = ((t * 30 + i * 22) % 66) + 6;
        ctx.strokeStyle = 'rgba(127,224,122,' + (1 - r / 74) + ')'; ctx.lineWidth = 2;
        ctx.strokeRect(Math.round(192 - r), Math.round(CHAO - 36 - r), r * 2, r * 2);
      }
      desenharDavi(168, CHAO - 72, 1, 'parado', 0, null, 3);
      if (Math.random() < dt * 20) emitir('brilho', 192 + rnd(-40, 40), rnd(30, CHAO), 1, '#7fe07a');
      const dx = 330 + Math.sin(tempoGlobal * 3) * 2;                                  // onde está a fonte do mal
      texto('!', dx, 40, '#ff5a3a', 16, 'center'); ctx.fillStyle = 'rgba(255,90,58,0.5)'; ctx.fillRect(250, 78, 70, 2);
      break;
    }
    case 'fornax':
      cenarioMenu(Math.min(0.95, 0.3 + t * 0.3), tempoGlobal);
      desenharFornax(192, 178 + DY + Math.max(0, 70 - t * 70), 1, tempoGlobal);        // Fornax emerge do chão
      chaoMenu(DY);
      if (Math.random() < dt * 14) emitir('fumaca', 189 + (Math.random() < 0.5 ? -3 : 3), 124 + DY, 1);
      if (Math.random() < dt * 10) emitir('fagulha', rnd(150, 235), 90 + DY, 1);
      if (t > 2) { nome('FORNAX, A FEBRE DO PLANETA', 192, 2, '#ff8a7a'); nome('O CORAÇÃO DA TERRA ESTÁ PRESO NO PEITO', 192, 13, '#9ae0ff'); }
      break;
    case 'subs': {
      cenarioMenu(0.7, tempoGlobal); ret('rgba(10,14,30,0.45)', 0, 0, LARG, 140); chaoMenu(DY);
      const dest = Math.floor(t / 1.4) % 5;
      SUBS.forEach((s, i) => {
        const x = 40 + i * 76, ativo = i === dest, esc = ativo ? 0.95 : 0.7;
        desenharVilaoMini(s[0], x, CHAO - 4 - (ativo ? Math.round(Math.sin(tempoGlobal * 6)) * 2 : 0), esc);
        nome(s[1], x, 70, ativo ? '#fff' : '#8a96b8');
      });
      nome(SUBS[dest][1] + ' = ' + SUBS[dest][2], 192, 8, '#ffd84f');
      break;
    }
    case 'armas':
      cenarioMenu(0.3, tempoGlobal); ret('rgba(10,14,30,0.55)', 0, 0, LARG, 140);
      texto('AS 5 ARMAS VERDES', 192, 14, '#ffd84f', 8, 'center');
      ARMAS.forEach((a, i) => {
        const x = 192 + (i - 2) * 56, y = 44, apareceu = t > 0.25 * i;
        if (!apareceu) return;
        if (!desenharMolduraArma(i, x, y + 21, 44)) {
          ret('#000', x - 22, y - 1, 44, 44); ret('#e8d8b8', x - 21, y, 42, 42); ret('#1d2236', x - 19, y + 2, 38, 38);
          ctx.save(); ctx.translate(x, y + 21); ctx.scale(2.4, 2.4); desenharIcone('arma_' + a.id, 0, 0); ctx.restore();
          texto(String(i + 1), x - 18, y + 4, '#ffd84f', 8);
        }
        if (Math.random() < dt * 2) emitir('brilho', x + rnd(-18, 18), y + rnd(0, 40), 1);
      });
      texto('FASES 1 A 5: UMA ARMA POR CAUSA', 192, 98, '#fff', 8, 'center');
      texto('FASE 6: O PODER DO CLIMA!', 192, 112, '#ff8a7a', 8, 'center');
      break;
    case 'guardiao': {
      cenarioMenu(0.35, tempoGlobal); chaoMenu(DY);
      const flash = Math.max(0, 1 - t * 1.5);
      for (let i = 0; i < 10; i++) {                                                   // raios saindo do Davi
        const a = i * 0.628 + t * 0.6; ctx.fillStyle = 'rgba(255,240,150,0.25)';
        for (let k = 8; k < 90; k += 6) ctx.fillRect(Math.round(192 + Math.cos(a) * k), Math.round(CHAO - 36 + Math.sin(a) * k), 3, 3);
      }
      desenharDavi(168, CHAO - 72 + Math.round(Math.sin(tempoGlobal * 4)), 1, 'parado', 0, null, 3);
      const my = CHAO - 72 + Math.round(Math.sin(tempoGlobal * 4)); ret('#14301a', 183, my + 14, 27, 6); ret('#2a6a2a', 184, my + 15, 25, 1); ret('#fff', 198, my + 16, 3, 3); ret('#1a1a2a', 201, my + 16, 3, 3);   // máscara sobre os olhos
      if (Math.random() < dt * 20) emitir('brilho', 192 + rnd(-50, 50), rnd(20, CHAO), 1, '#ffd84f');
      if (flash > 0) { ctx.fillStyle = 'rgba(255,255,255,' + flash + ')'; ctx.fillRect(0, 0, LARG, ALT); }
      if (t > 1.2) nome('GUARDIÃO DO CLIMA', 192, 6, '#7fe07a');
      break;
    }
    case 'missao':
      cenarioMenu(0.5 - Math.min(0.3, t * 0.1), tempoGlobal); chaoMenu(DY);
      desenharFornax(300, CHAO + 4, 0.6, tempoGlobal * 0.6);
      desenharDavi(120, CHAO - 48 + Math.round(Math.sin(tempoGlobal * 4) * 0.6), 1, 'parado', 0, null, 2);
      desenharGaia(60, 70 + Math.round(Math.sin(tempoGlobal * 3) * 2), 0.5, 2.5);
      if (Math.random() < dt * 8) emitir('brilho', rnd(80, 180), rnd(40, 120), 1, '#7fe07a');
      break;
  }
  atualizarParticulas(dt); desenharParticulas();
  // caixa de texto com efeito de digitação
  let restantes = Math.floor(t * 38);
  const total = sl.texto.length, completo = restantes >= total;
  if (sl.quem) {                                                                  // diálogo: caixa no alto com a etiqueta de quem fala
    const lin = linhasTexto(sl.texto, 332, 8), h = 18 + lin.length * 11;
    rrect(12, 15, 360, h + 2, 5); ctx.fillStyle = '#e8d9a0'; ctx.fill();
    rrect(13.5, 16.5, 357, h - 1, 4); ctx.fillStyle = '#141a30'; ctx.fill();
    const cor = sl.quem === 'DAVI' ? '#ffd84f' : (sl.quem === 'VÓ ROSA' ? '#ffb8d8' : '#bfe9ff'), wq = sl.quem.length * 8 + 16;
    rrect(20, 6, wq + 2, 15, 3); ctx.fillStyle = '#05060c'; ctx.fill();
    rrect(21, 7, wq, 13, 2.5); ctx.fillStyle = cor; ctx.fill();
    texto(sl.quem, 21 + wq / 2, 10, '#2a1a10', 8, 'center', false);
    lin.forEach((l, i) => { if (restantes <= 0) return; texto(l.slice(0, restantes), 26, 26 + i * 11, '#fff', 8, 'left', true, 340); restantes -= l.length + 1; });
    if (completo && Math.sin(tempoGlobal * 7) > 0) { ctx.fillStyle = cor; ctx.beginPath(); ctx.moveTo(356, 15 + h - 7); ctx.lineTo(364, 15 + h - 7); ctx.lineTo(360, 15 + h - 2); ctx.closePath(); ctx.fill(); }
  } else {
    painel(16, 140, 352, 70, '#12182c', '#e8d9a0');
    const linhas = quebrarLinhas(sl.texto, 328);
    linhas.forEach((l, i) => {
      if (restantes <= 0) return;
      texto(l.slice(0, restantes), 28, 148 + i * 12, '#fff', 8);
      restantes -= l.length + 1;
    });
  }
  for (let i = 0; i < HISTORIA.length; i++) ret(i === slideH ? '#ffd84f' : '#556', 366 - (HISTORIA.length - i) * 6, 202, 4, 4);
  const ultimo = slideH === HISTORIA.length - 1;
  texto(completo ? (ultimo ? 'ENTER: aceitar a missão' : 'ENTER: continuar') : 'ENTER: acelerar', 28, 199, '#8a96b8', 8);
  if (!ultimo) texto('ESC: pular', 210, 199, '#8a96b8', 8);
  if (press('Escape')) { terminarHistoria(); return; }
  if (press('Enter', 'Space') || mouse.clique) {
    if (!completo) slideInicio = tempoGlobal - total / 38 - 0.1;
    else if (slideH + 1 < HISTORIA.length) { slideH++; slideInicio = tempoGlobal; som('menu'); if (HISTORIA[slideH].cena === 'fornax') som('rugido'); }
    else { som('ok'); terminarHistoria(); }
  }
}

/* ---------- seleção de fases (mapa com 6 fases) ---------- */
const POS_FASES = [[52, 128], [111, 86], [172, 128], [232, 86], [292, 128], [343, 69]];
const COR_FASES = ['#3f9a4c', '#6e7078', '#8a4a3c', '#6c7a2c', '#3a74d0', '#b02a20'];
function desenharCadeado(cx, cy) {
  ret('#222', cx - 5, cy - 1, 10, 8); ret('#c0c0c8', cx - 4, cy, 8, 6); ret('#ffd84f', cx - 1, cy + 2, 2, 2);
  ret('#c0c0c8', cx - 3, cy - 5, 2, 4); ret('#c0c0c8', cx + 1, cy - 5, 2, 4); ret('#c0c0c8', cx - 2, cy - 6, 4, 2);
}
function selo(x, y) {                                       // escudinho verde de fase concluída
  ctx.fillStyle = '#0c2a14'; ctx.beginPath(); ctx.moveTo(x - 4.5, y - 4); ctx.lineTo(x + 4.5, y - 4); ctx.lineTo(x + 4.5, y + 1); ctx.lineTo(x, y + 5.5); ctx.lineTo(x - 4.5, y + 1); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#4fd868'; ctx.beginPath(); ctx.moveTo(x - 3.3, y - 3); ctx.lineTo(x + 3.3, y - 3); ctx.lineTo(x + 3.3, y + 0.7); ctx.lineTo(x, y + 4.2); ctx.lineTo(x - 3.3, y + 0.7); ctx.closePath(); ctx.fill();
}
function telaFases() {
  cenarioMenu(0.5, tempoGlobal);
  ret('rgba(10,14,30,0.36)', 0, 0, LARG, ALT);
  textoContorno('ESCOLHA A FASE', 192, 9, '#ffd84f', 13, 'center');
  // caminho entre as fases (pontinhos entre as bordas dos quadros)
  for (let i = 0; i < 5; i++) {
    const a = POS_FASES[i], b = POS_FASES[i + 1], d = Math.hypot(b[0] - a[0], b[1] - a[1]), n = 8;
    for (let k = 0; k < n; k++) {
      const u = (21 + (d - 42) * (k + 0.5) / n) / d;
      ret(i + 1 < salvo.liberadas ? '#ffd84f' : '#667', Math.round(a[0] + (b[0] - a[0]) * u) - 1, Math.round(a[1] + (b[1] - a[1]) * u) - 1, 3, 3);
    }
  }
  if (press('ArrowRight', 'KeyD')) { faseSel = (faseSel + 1) % 6; som('menu'); }
  if (press('ArrowLeft', 'KeyA')) { faseSel = (faseSel + 5) % 6; som('menu'); }
  let jogar = false;
  FASES.forEach((f, i) => {
    const [x, y] = POS_FASES[i], lib = i < salvo.liberadas, sel = i === faseSel;
    if (noRet(x - 17, y - 17, 34, 34)) {
      if (mouse.moveu) faseSel = i;
      if (mouse.clique) { faseSel = i; jogar = true; }
    }
    const p = sel ? Math.round(Math.sin(tempoGlobal * 8)) : 0, h = 17 + p;
    if (sel) brilho(x, y, 40, '255,200,80', 0.3);
    ctx.save();
    rrect(x - h - 1, y - h - 1, 2 * h + 2, 2 * h + 2, 2); ctx.fillStyle = '#06070c'; ctx.fill();
    rrect(x - h, y - h, 2 * h, 2 * h, 1.5); ctx.fillStyle = sel ? '#ffc81e' : (lib ? '#ece0b4' : '#6a6a72'); ctx.fill();
    rrect(x - h + 3, y - h + 3, 2 * h - 6, 2 * h - 6, 1); ctx.fillStyle = '#1a1612'; ctx.fill();
    const cor = lib ? COR_FASES[i] : '#2a2d38';
    rrect(x - h + 4, y - h + 4, 2 * h - 8, 2 * h - 8, 1);
    ctx.fillStyle = degrade(0, y - h, 2 * h, misturar(cor, '#ffffff', 0.22), cor); ctx.fill();
    ctx.restore();
    if (lib) { textoContorno(String(i + 1), x, y - 5, '#fff', 11, 'center'); if (salvo.concluidas[i]) selo(x + 10, y + 10); }
    else desenharCadeado(x, y - 1);
  });
  // informações da fase marcada
  const f = FASES[faseSel], lib = faseSel < salvo.liberadas;
  painel(23, 161, 340, 51);
  texto(lib ? f.nome.toUpperCase() : '??? BLOQUEADA', 38, 165, lib ? '#ffd84f' : '#999', 11);
  if (lib) {
    texto('Causa: ' + f.causa, 38, 177, '#fff', 8);
    texto('Objetivo: ' + f.objetivo.rotulo + ' (' + f.objetivo.total + ')', 38, 187, '#b8c4e8', 8);
    if (f.arma >= 0) texto('Arma: ' + ARMAS[f.arma].nome + (salvo.armas[ARMAS[f.arma].id] ? ' [OK]' : ''), 38, 198, '#7fe07a', 8);
    if (!f.mapa) texto('EM BREVE', 350, 165, '#ff8a7a', 8, 'right');
  } else texto('Conclua a fase anterior para liberar.', 38, 184, '#999', 8);
  if (aviso.t > 0) { aviso.t -= 1 / 60; textoContorno(aviso.txt, 192, 30, '#ff9a8a', 8, 'center'); }
  const cp = lib ? checkpointDaFase(faseSel) : null;
  if (cp) texto('ENTER: continuar do checkpoint   R: recomeçar', 350, 203, '#7fd8ff', 6, 'right', false);
  if (press('Enter', 'Space') || (cp && press('KeyR'))) jogar = true;
  if (jogar) { if (lib) { som('ok'); if (cp && !press('KeyR')) continuarDoCheckpoint(cp); else { if (cp) limparCheckpoint(); iniciarFase(faseSel, true); } } else { som('erro'); aviso = { txt: 'Fase bloqueada!', t: 1.5 }; } }
  if (press('Escape')) mudar('menu');
}
/* Linha de som da pausa: rótulo à esquerda e chave liga/desliga à direita */
function linhaSom(x, y, w, h, sel, rotulo, ligado) {
  if (sel) { rrect(x - 3, y - 2, w + 6, h + 4, 3); ctx.fillStyle = 'rgba(255,200,80,0.18)'; ctx.fill(); }
  texto(rotulo, x, y + 4, '#fff', 7, 'left', true, w - 40);
  const tx = x + w - 30, ty = y + 1;
  rrect(tx - 1, ty - 1, 32, 15, 7.5); ctx.fillStyle = '#05060c'; ctx.fill();
  rrect(tx, ty, 30, 13, 6.5); ctx.fillStyle = ligado ? '#3aa84e' : '#4a5068'; ctx.fill();
  ctx.fillStyle = '#f4f4fa'; ctx.beginPath(); ctx.arc(ligado ? tx + 23.5 : tx + 6.5, ty + 6.5, 5, 0, 7); ctx.fill();
  texto(ligado ? 'ON' : 'OFF', ligado ? tx + 9 : tx + 23, ty + 3, ligado ? '#d8ffd8' : '#aab', 5, 'center', false);
}
function telaPausa() {
  desenharCena();
  ret('rgba(0,0,0,0.45)', 0, 0, LARG, ALT);
  painel(108, 7, 168, 202);
  ret('#ffd84f', 140, 17, 3, 11); ret('#ffd84f', 146, 17, 3, 11);
  textoContorno('PAUSADO', 154, 17, '#ffd84f', 12, 'left', 110);
  texto('Fase ' + (L.idx + 1) + ' • ' + objAtual().rotulo.split(' ')[0] + ' ' + L.progresso + '/' + L.total, 192, 39, '#9aa6c8', 7, 'center', false, 150);
  menuGrade([
    { txt: 'CONTINUAR', x: 127, y: 50, w: 130, h: 18, acao: () => mudar('jogo') },
    { txt: 'REINICIAR', x: 128, y: 76, w: 62, h: 14, acao: () => iniciarFase(L.idx) },
    { txt: 'FASES', x: 194, y: 76, w: 62, h: 14, acao: () => mudar('fases') },
    { desenhar: (x, y, w, h, sel) => linhaSom(x, y, w, h, sel, 'Música', AJUSTES.musica), x: 125, y: 115, w: 142, h: 15, acao: () => alternarMusica() },
    { desenhar: (x, y, w, h, sel) => linhaSom(x, y, w, h, sel, 'Efeitos sonoros', AJUSTES.efeitos), x: 125, y: 137, w: 142, h: 15, acao: () => alternarEfeitos() },
    { txt: 'SAIR PARA O MENU', x: 138, y: 180, w: 108, h: 14, acao: () => mudar('menu') }
  ], [[0], [1, 2], [3], [4], [5]]);
  ret('rgba(190,200,240,0.35)', 125, 99, 142, 1);
  texto('SOM', 125, 104, '#ffd84f', 7, 'left', false);
  ret('rgba(190,200,240,0.35)', 125, 163, 142, 1);
  if (press('KeyP', 'Escape')) mudar('jogo');
}
function telaGameOver() {
  desenharCena();
  ret('rgba(30,0,0,0.42)', 0, 0, LARG, ALT);
  texto('FIM DE JOGO', 192, 54, '#ff5a4a', 16, 'center');
  texto('O planeta ainda precisa de você, Davi!', 192, 80, '#fff', 8, 'center');
  const cp = checkpointDaFase(L.idx);
  menuLista([
    ...(cp ? [{ txt: 'CONTINUAR DO CHECKPOINT', acao: () => continuarDoCheckpoint(cp) }] : []),
    { txt: cp ? 'RECOMEÇAR A FASE' : 'TENTAR DE NOVO', acao: () => iniciarFase(L.idx) },
    { txt: 'MAPA DE FASES', acao: () => mudar('fases') },
    { txt: 'MENU', acao: () => mudar('menu') }
  ], 192, 108, 150, 16, 21);
}
function telaConcluida() {
  desenharCena();
  ret('rgba(0,20,10,0.5)', 0, 0, LARG, ALT);
  painel(58, 12, 269, 192);
  textoContorno('FASE CONCLUÍDA!', 192, 23, '#6fe07a', 16, 'center');
  textoContorno(FASES[L.idx].nome, 192, 43, '#ffd84f', 9, 'center');
  const est = Math.max(1, Math.min(3, J.vidas || 1));
  [151, 184, 219].forEach((x, i) => estrela(x, 66 + (i === 1 ? -2 : 0), i === 1 ? 10 : 8.5, i < est));
  ret('rgba(190,200,240,0.4)', 76, 82, 233, 1);
  const a = FASES[L.idx].arma, mont = a >= 0 && salvo.armas[ARMAS[a].id];
  const linhas = [['Meta', L.progresso + '/' + L.total, '#fff', 'meta']];
  if (a >= 0) linhas.push(['Arma', mont ? ARMAS[a].nome.split('-')[0] : 'não montada', mont ? '#7fe07a' : '#ff8a7a', 'arma']);
  const queda = Math.round((1 - L.calor) * 100);
  linhas.push(['Calor do planeta', (queda > 0 ? '-' : '') + queda + '%', '#8fd8ff', 'calor']);
  linhas.push(['Lições aprendidas', String(L.aprendidos.length), '#fff', 'licoes']);
  linhas.forEach(([r, v, c, ic], i) => {
    const y = 95 + i * 15.3;
    if (ic === 'meta') { iconeQuadrado(82, y, '#e0302a'); ret('#fff', 80, y - 2, 4, 4); ret('#e0302a', 81, y - 1, 2, 2); }
    else if (ic === 'arma') { if (a < 0 || !iconeArma(ARMAS[a].id, 82, y, 12)) iconeQuadrado(82, y, '#4fd04a'); }
    else if (ic === 'calor') { iconeQuadrado(82, y, '#e0302a'); ret('#fff', 81, y - 3, 2, 4); }
    else { iconeQuadrado(82, y, '#2a4aa8'); ret('#e8f0ff', 79, y - 3, 3, 6); ret('#fff', 83, y - 3, 3, 6); }
    textoContorno(r, 97, y - 4, '#c8d0f0', 8, 'left');
    textoContorno(v, 304, y - 4, c, 8, 'right', 100);
  });
  if (mont) {
    rrect(75, 150, 235, 17, 1.5); ctx.fillStyle = '#4fd868'; ctx.fill();
    rrect(76.5, 151.5, 232, 14, 1); ctx.fillStyle = '#1f4a2c'; ctx.fill();
    iconeArma(ARMAS[a].id, 87, 158.5, 11);
    textoContorno('NOVA ARMA: ' + ARMAS[a].nome.split('-')[0].toUpperCase(), 102, 155, '#d8ffd8', 8, 'left', 204);
  }
  botaoContinuar(178, 'CONTINUAR', () => mudar('curiosidade'));
}
function telaCuriosidade() {
  cenarioMenu(Math.max(0.05, 0.6 - L.idx * 0.1), tempoGlobal);
  ret('rgba(8,14,30,0.33)', 0, 0, LARG, ALT);
  const f = FASES[L.idx], l1 = linhasTexto(f.curiosidade, 250, 9), l2 = linhasTexto(f.atitude, 250, 9);
  const h1 = l1.length * 13 + 10, h2 = l2.length * 13 + 26, alto = 38 + h1 + 8 + h2 + 8 + 15 + 12;
  const y0 = Math.max(6, Math.round((ALT - alto) / 2));
  painel(45, y0, 294, alto, '#162c36', '#6fe07a');
  lampada(127, y0 + 20); textoContorno('VOCÊ SABIA?', 141, y0 + 13, '#ffd84f', 16, 'left');
  let y = y0 + 38;
  rrect(59, y, 266, h1, 1.5); ctx.fillStyle = '#44537a'; ctx.fill(); rrect(60, y + 1, 264, h1 - 2, 1); ctx.fillStyle = '#16213a'; ctx.fill();
  l1.forEach((t, i) => textoContorno(t, 70, y + 6 + i * 13, '#fff', 9, 'left'));
  y += h1 + 8;
  rrect(59, y, 266, h2, 1.5); ctx.fillStyle = '#4fd868'; ctx.fill(); rrect(60, y + 1, 264, h2 - 2, 1); ctx.fillStyle = '#1b3a2a'; ctx.fill();
  ctx.strokeStyle = '#4fd868'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(68, y + 11); ctx.lineTo(71, y + 14); ctx.lineTo(76, y + 7); ctx.stroke();
  textoContorno('O QUE VOCÊ PODE FAZER', 87, y + 6, '#6fe07a', 8, 'left');
  l2.forEach((t, i) => textoContorno(t, 70, y + 20 + i * 13, '#bfe9ff', 9, 'left'));
  y += h2 + 8;
  botaoContinuar(y, 'CONTINUAR', () => { if (FASES[L.idx].quiz) iniciarQuiz(); else mudar(L.idx >= 5 ? 'vitoria' : 'fases'); });
}
const FINAL = [
  { cena: 'poder', quem: 'DAVI', texto: 'As cinco armas brilham juntas! É agora: PODER DO CLIMA!' },
  { cena: 'gelo', texto: 'O raio esfria Fornax até congelar a febre do planeta, e o monstro vira flocos de neve.' },
  { cena: 'casa', quem: 'DAVI', texto: 'O coração da Terra voltou ao lugar e o mundo está se curando. Hora de regar a nossa árvore!' },
  { cena: 'mundo', texto: 'Fornax pode voltar sempre que esquecermos de cuidar do planeta. Mas qualquer um pode ser um Guardião do Clima.' }
];
let finalH = 0, finalInicio = 0;
function desenharCasa(x, y) {
  const R = ret;
  R('#000', x - 1, y + 17, 50, 33); R('#e8d0a0', x, y + 18, 48, 31); R('#c8a870', x, y + 44, 48, 5);
  R('#000', x - 5, y + 6, 58, 14); R('#c0402a', x - 4, y + 7, 56, 12); R('#e0604a', x - 4, y + 7, 56, 3); R('#a02a1a', x + 4, y + 2, 40, 6);
  R('#000', x + 18, y + 30, 13, 19); R('#7a4a2a', x + 19, y + 31, 11, 18); R('#ffd84f', x + 27, y + 40, 2, 2);
  R('#000', x + 3, y + 25, 11, 10); R('#9ae0ff', x + 4, y + 26, 9, 8); R('#fff', x + 4, y + 26, 3, 3);
  R('#000', x + 35, y + 25, 11, 10); R('#9ae0ff', x + 36, y + 26, 9, 8); R('#fff', x + 36, y + 26, 3, 3);
  R('#3fae49', x - 14, y + 40, 10, 10); R('#2a8a3a', x - 12, y + 36, 6, 6); R('#ff6aa0', x - 10, y + 38, 2, 2);
}
/* Raio do Poder do Clima: cinco faixas coloridas (uma por arma) saindo da mão do Davi até o alvo */
function raioColorido(x0, y0, x1, t, prog) {
  const cores = ['#4fd04a', '#c0c0d0', '#ffd84f', '#4adfb0', '#5ab0ff'];
  const fim = Math.round(x0 + (x1 - x0) * Math.min(1, prog));
  if (fim <= x0) return;
  brilho((x0 + fim) / 2, y0, (fim - x0) / 2 + 12, '255,255,255', 0.18);
  cores.forEach((c, i) => {
    const off = (i - 2) * 4;
    for (let x = x0; x < fim; x += 3) {
      const y = y0 + off + Math.round(Math.sin(x * 0.12 - t * 14 + i) * 2.5);
      ctx.fillStyle = c; ctx.fillRect(x, y - 1, 3, 3);
    }
  });
  for (let x = x0; x < fim; x += 3) { ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.fillRect(x, y0 + Math.round(Math.sin(x * 0.12 - t * 14 + 2) * 2.5), 3, 1); }
  brilho(x0, y0, 14, '255,250,200', 0.7);
  brilho(fim, y0, 14 + Math.sin(t * 20) * 3, '255,255,255', 0.6);
  cores.forEach((c, i) => { const a = t * 6 + i * 1.256; ctx.fillStyle = c; ctx.fillRect(Math.round(fim + Math.cos(a) * 10), Math.round(y0 + Math.sin(a) * 10), 3, 3); });
}
function telaVitoria() {
  const dt = 1 / 60, sl = FINAL[finalH], t = tempoGlobal - finalInicio, FY = 186;
  const davi = (x, est, esc) => desenharDavi(x - 8 * esc, FY - 24 * esc, 1, est, 0, null, esc);
  switch (sl.cena) {
    case 'poder': {
      cenarioMenu(Math.max(0.3, 0.85 - t * 0.12), tempoGlobal); chaoMenu(0);
      davi(80, t < 2.4 ? 'parado' : 'atacar', 2.6);
      desenharFornax(305, FY, 0.95, tempoGlobal * 0.8);
      const cores = ['#4fd04a', '#c0c0d0', '#ffd84f', '#4adfb0', '#5ab0ff'];
      cores.forEach((c, i) => {                                     // cinco raios se unindo em um só
        const a = t * 2 + i * 1.256, r = Math.max(2, 30 - t * 12);
        ctx.fillStyle = c; ctx.fillRect(Math.round(120 + Math.cos(a) * r), Math.round(140 + Math.sin(a) * r), 5, 5);
      });
      brilho(120, 140, 22 + t * 8, '255,240,160', Math.min(0.6, t * 0.2));
      if (t >= 2.4) raioColorido(124, 140, 272, tempoGlobal, (t - 2.4) * 1.2);
      if (Math.random() < dt * 20) emitir('brilho', rnd(100, 280), rnd(100, 180), 1, cores[Math.floor(Math.random() * 5)]);
      break;
    }
    case 'gelo': {
      cenarioMenu(Math.max(0.1, 0.55 - t * 0.12), tempoGlobal); chaoMenu(0);
      davi(80, 'atacar', 2.6);
      desenharFornax(305, FY, 0.95, tempoGlobal * 0.3, undefined, undefined, { quadro: 'idle0', tinta: '#9fe4ff', forca: Math.min(0.8, 0.15 + t * 0.2) });
      raioColorido(124, 140, 272, tempoGlobal, 1);
      if (Math.random() < dt * 14) emitir('brilho', rnd(250, 350), rnd(90, 180), 1, '#bfe9ff');
      if (Math.random() < dt * 8) emitir('bolha', rnd(250, 350), rnd(110, 180), 1, '#ffffff');
      break;
    }
    case 'casa': {
      cenarioMenu(0, tempoGlobal); chaoMenu(0);
      desenharArvore(290, 178, 1, 1.9, tempoGlobal);
      const x = Math.min(200, 30 + t * 40);
      davi(x, t < 3.2 ? 'correr' : 'vitoria', 2.6);
      if (t > 3.2 && Math.random() < dt * 8) emitir('brilho', 255, 150, 1, '#7fe07a');
      if (Math.random() < dt * 5) emitir('folha', rnd(0, LARG), rnd(60, 160), 1);
      break;
    }
    default: {
      cenarioMenu(0, tempoGlobal);
      ret('rgba(10,30,50,0.25)', 0, 0, LARG, ALT);
      desenharPlaneta(192, 128, 42, 0);
      desenharGaia(310, 150, 0, 1);
      if (Math.random() < dt * 6) emitir('brilho', rnd(100, 290), rnd(70, 190), 1, '#ffd84f');
      if (Math.random() < dt * 3) confete(rnd(60, 320), 70, 4);
      textoContorno('VITÓRIA!', 192, 70, '#ffd84f', 14, 'center', 300);
    }
  }
  atualizarParticulas(dt); desenharParticulas();
  const completo = caixaFalaTopo(sl.texto, t, finalH === FINAL.length - 1 ? 'ENTER: menu principal' : 'ENTER >', sl.quem);
  for (let i = 0; i < FINAL.length; i++) ret(i === finalH ? '#ffd84f' : '#556', 366 - (FINAL.length - i) * 6, 209, 4, 4);
  if (press('Enter', 'Space') || mouse.clique) {
    if (!completo) finalInicio = tempoGlobal - sl.texto.length / VEL_TEXTO - 0.1;
    else if (finalH + 1 < FINAL.length) { finalH++; finalInicio = tempoGlobal; som('menu'); }
    else { som('ok'); mudar('menu'); }
  }
}
let vitoriaInicio = 0;
