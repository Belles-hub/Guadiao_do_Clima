'use strict';
/* =====================================================================
   8. TILES (texturas pixeladas geradas por código, com estilo de cada cenário)
   ===================================================================== */
let tiles = {};
function criarTile(tipo, v, T, estilo) {
  const c = document.createElement('canvas'); c.width = c.height = TAM;
  const g = c.getContext('2d'); g.imageSmoothingEnabled = false;
  const r = gerador(tipo.charCodeAt(0) * 977 + v * 131 + 7);
  const R = (cor, x, y, w, h) => { g.fillStyle = cor; g.fillRect(x, y, w, h); };
  const ruido = (base, n) => {
    for (let i = 0; i < n; i++) R(r() < 0.5 ? escurecer(base, 0.86) : escurecer(base, 1.14), (r() * 15) | 0, (r() * 15) | 0, 1 + ((r() * 2) | 0), 1);
  };
  const lixoCores = ['#e03a3a', '#3a8ae0', '#e8d83a', '#f4f4f4', '#3ac06a', '#e07a1a'];
  if (tipo === '#' || tipo === 'D') {
    const base = T.terra; R(base, 0, 0, 16, 16); ruido(base, 26);
    for (let i = 0; i < 3; i++) R(escurecer(base, 0.7), (r() * 13) | 0, 5 + ((r() * 9) | 0), 2, 2);
    if (tipo === '#') {
      if (estilo === 'cidade') {            // calçada/asfalto
        R('#8a8a94', 0, 0, 16, 4); R('#c0c0cc', 0, 0, 16, 1); R('#5a5a64', 0, 4, 16, 1);
        for (let x = 1; x < 16; x += 6) R('#e8c030', x, 2, 3, 1);
      } else if (estilo === 'fabrica') {    // chapa metálica com listras de perigo
        R('#6a6a76', 0, 0, 16, 4); R('#3a3a44', 0, 4, 16, 1);
        for (let x = 0; x < 16; x += 4) { R('#e8c030', x, 0, 2, 2); R('#1a1a1a', x + 2, 0, 2, 2); }
        R('#b0b0bc', 1, 3, 1, 1); R('#b0b0bc', 14, 3, 1, 1);
      } else if (estilo === 'lixao') {      // lixo colorido por cima
        R('#4a4a2a', 0, 0, 16, 3);
        for (let i = 0; i < 12; i++) R(lixoCores[(r() * 6) | 0], (r() * 14) | 0, (r() * 4) | 0, 1 + ((r() * 3) | 0), 1 + ((r() * 2) | 0));
        R('#2a2a1a', 0, 4, 16, 1);
      } else if (estilo === 'oceano') {     // areia do fundo do mar
        R('#e8d8a0', 0, 0, 16, 4);
        for (let x = 0; x < 16; x += 3) R('#c8b880', x + ((r() * 2) | 0), 1 + ((r() * 2) | 0), 2, 1);
        R('#b8a870', 0, 4, 16, 1);
      } else if (estilo === 'vulcao') {     // rocha escura com lava nas frestas
        R('#2a1a1a', 0, 0, 16, 4); R('#4a3030', 0, 0, 16, 1); R('#140808', 0, 4, 16, 1);
        for (let i = 0; i < 3; i++) R('#ff5a1a', (r() * 13) | 0, 1 + ((r() * 2) | 0), 3, 1);
      } else {                              // grama
        R(T.grama, 0, 0, 16, 4);
        for (let x = 0; x < 16; x++) { const h = 4 + ((r() * 3) | 0); R(T.grama, x, 0, 1, h); if (r() < 0.4) R(escurecer(T.grama, 0.8), x, h - 1, 1, 1); }
        R(escurecer(T.grama, 1.25), 0, 0, 16, 1);
        for (let i = 0; i < 4; i++) R(escurecer(T.grama, 1.2), (r() * 15) | 0, 1 + ((r() * 2) | 0), 1, 1);
      }
    }
  } else if (tipo === 'S') {
    const base = T.pedra; R(base, 0, 0, 16, 16); ruido(base, 30);
    R(escurecer(base, 0.7), 2 + ((r() * 4) | 0), 3, 5, 1); R(escurecer(base, 0.7), 7, 3, 1, 4); R(escurecer(base, 0.7), 6, 8 + ((r() * 3) | 0), 7, 1);
    R(escurecer(base, 1.25), 1, 1, 4, 1); R(escurecer(base, 1.25), 10, 10, 3, 1);
    if (estilo === 'vulcao') { R('#ff5a1a', 4, 6, 1, 4); R('#ff5a1a', 5, 9, 4, 1); }
  } else if (tipo === 'T') {                // viaduto do trem: concreto com trilhos e dormentes
    R('#8a8e9a', 0, 0, 16, 16); ruido('#8a8e9a', 18); R('#5a5e6a', 0, 12, 16, 4); R('#a8acb8', 0, 4, 16, 1);
    R('#4a3a2a', 0, 3, 16, 3); for (let i = 0; i < 16; i += 5) R('#6a5238', i, 3, 3, 3);
    R('#e4e8f2', 0, 1, 16, 2); R('#9a9eaa', 0, 3, 16, 1);
    R('#3a3e48', 0, 15, 16, 1);
  } else if (tipo === 'Q') {                // pilar do viaduto (decoração)
    R('#10131a', 3, 0, 10, 16); R('#7e828e', 4, 0, 8, 16); ruido('#7e828e', 10); R('#a4a8b4', 4, 0, 2, 16); R('#585c68', 10, 0, 2, 16);
  } else if (tipo === 'X') {
    const base = T.madeira;
    if (estilo === 'cidade') {              // prédio de tijolos com janelas acesas
      R(base, 0, 0, 16, 16); ruido(base, 14);
      for (let y = 3; y < 16; y += 4) R(escurecer(base, 0.7), 0, y, 16, 1);
      for (let i = 0; i < 2; i++) {
        const wx = 2 + i * 8; R('#1a1a28', wx, 3, 5, 7);
        R(r() < 0.65 ? '#ffe680' : '#3a4a6a', wx + 1, 4, 3, 5); R('#1a1a28', wx + 2, 4, 1, 5);
      }
    } else if (estilo === 'fabrica') {      // caixa de metal com X e listras
      R(base, 0, 0, 16, 16); R(escurecer(base, 0.55), 1, 1, 14, 1); R(escurecer(base, 0.55), 1, 14, 14, 1);
      for (let i = 0; i < 13; i++) { R(escurecer(base, 0.65), 1 + i, 1 + i, 1, 1); R(escurecer(base, 0.65), 13 - i + 1, 1 + i, 1, 1); }
      for (let x = 0; x < 16; x += 4) { R('#e8c030', x, 13, 2, 3); R('#1a1a1a', x + 2, 13, 2, 3); }
      R('#b0b0bc', 2, 2, 1, 1); R('#b0b0bc', 13, 2, 1, 1);
    } else if (estilo === 'lixao') {        // montinho de entulho colorido
      R('#3a3a2a', 0, 0, 16, 16);
      for (let i = 0; i < 9; i++) R(lixoCores[(r() * 6) | 0], (r() * 12) | 0, (r() * 12) | 0, 3 + ((r() * 3) | 0), 3 + ((r() * 3) | 0));
    } else if (estilo === 'oceano') {       // bloco de coral
      R(base, 0, 0, 16, 16); ruido(base, 16);
      for (let i = 0; i < 9; i++) R(escurecer(base, 1.35), (r() * 14) | 0, (r() * 14) | 0, 2, 2);
      for (let i = 0; i < 5; i++) R(escurecer(base, 0.6), (r() * 14) | 0, (r() * 14) | 0, 2, 2);
    } else if (estilo === 'vulcao') {       // obsidiana
      R('#2a1620', 0, 0, 16, 16); ruido('#2a1620', 10);
      R('#ff5a1a', 3, 0, 1, 16); R('#ff5a1a', 10, 0, 1, 9); R('#ff5a1a', 3, 8, 8, 1);
    } else {                                // tábuas de madeira
      R(base, 0, 0, 16, 16);
      for (let y = 0; y < 16; y += 5) { R(escurecer(base, 0.7), 0, y + 4, 16, 1); R(escurecer(base, 1.18), 0, y, 16, 1); }
      ruido(base, 12);
      R(escurecer(base, 0.55), 2, 2, 1, 1); R(escurecer(base, 0.55), 13, 2, 1, 1); R(escurecer(base, 0.55), 2, 12, 1, 1); R(escurecer(base, 0.55), 13, 12, 1, 1);
    }
  } else if (tipo === '=') {
    const base = T.plataforma; R(base, 0, 0, 16, 5); ruido(base, 6);
    R(escurecer(base, 1.25), 0, 0, 16, 1); R(escurecer(base, 0.6), 0, 4, 16, 1);
    R(escurecer(base, 0.5), 3, 2, 1, 1); R(escurecer(base, 0.5), 12, 2, 1, 1);
    R('rgba(0,0,0,0.25)', 0, 5, 16, 1);
  } else if (tipo === 'M') {                // muda (plataforma criada pelo Lança-Sementes)
    const base = T.muda; R(base, 0, 1, 16, 4); ruido(base, 8);
    for (let x = 0; x < 16; x += 2) R(escurecer(base, 1.2), x, (r() * 2) | 0, 2, 2);
    R(escurecer(base, 0.6), 0, 4, 16, 1); R('#2a7a2a', 0, 5, 16, 1);
    for (let i = 0; i < 3; i++) R('#ffe14a', 2 + i * 5, 0, 1, 1);
  } else if (tipo === 'I') {                // gelo (plataforma criada pela Bolha Gelada)
    R('#8ad0f4', 0, 0, 16, 6); R('#d8f4ff', 0, 0, 16, 2); R('#fff', 2, 0, 5, 1); R('#fff', 10, 1, 3, 1);
    R('#5aa8d8', 0, 5, 16, 1); R('#bfe9ff', 4, 3, 2, 2); R('#bfe9ff', 11, 3, 1, 2);
  } else if (tipo === 'B') {                // bloco reciclado (Martelo da Reciclagem)
    R('#2b8236', 0, 0, 16, 16); R('#3fae49', 1, 1, 14, 14); R('#6fd36a', 1, 1, 14, 2); R('#1f6a2a', 1, 13, 14, 2);
    R('#fff', 6, 3, 4, 2); R('#fff', 9, 4, 2, 3); R('#fff', 3, 8, 2, 3); R('#fff', 3, 10, 4, 2); R('#fff', 10, 10, 3, 2); R('#fff', 11, 7, 2, 3);
  }
  if (tipo !== '=' && tipo !== 'M' && tipo !== 'I') {   // bordas mais escuras nos blocos
    R('rgba(0,0,0,0.38)', 0, 15, 16, 1); R('rgba(0,0,0,0.38)', 15, 0, 1, 16);
    R('rgba(0,0,0,0.18)', 0, 14, 16, 1); R('rgba(0,0,0,0.18)', 14, 0, 1, 16);
  }
  return c;
}
function construirTiles(tema) {
  tiles = {};
  ['#', 'D', 'S', 'X', 'T', 'Q', '=', 'M', 'I', 'B'].forEach(t => { tiles[t] = []; for (let v = 0; v < 4; v++) tiles[t].push(criarTile(t, v, tema.terreno, tema.estilo)); });
}
