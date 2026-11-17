'use strict';
/* FASE 4 — O Lixão Gigante
   Monstros de lixo (desenho) e o Martelo da Reciclagem, que os transforma em blocos. A multiplicação fica em nucleo/11-inimigos.js. */

const LIXO_LARG = 14, LIXO_ALT = 14;
const LIXO_COR = {
  contorno: '#1a2a10', corpo: '#6aa830', brilho: '#9ad84a',
  vidro: '#bfe9ff', rotulo: '#2a9a4a', metal: '#c0c0c8', tampa: '#e03030',
  papel: '#fff', embalagem: '#e8c030', olho: '#fff', pupila: '#111',
};

/* Sprite pré-renderizado uma única vez (antes eram ~25 fillRect por monstro por frame) */
let _spriteLixo = null;
function spriteLixo() {
  if (_spriteLixo) return _spriteLixo;
  const c = document.createElement('canvas'); c.width = LIXO_LARG; c.height = LIXO_ALT;
  const g = c.getContext('2d');
  const R = (cor, a, b, w, h) => { g.fillStyle = cor; g.fillRect(a, b, w, h); };
  const C = LIXO_COR;
  // corpo
  R(C.contorno, 0, 4, 14, 10); R(C.contorno, 2, 2, 10, 3);
  R(C.corpo, 1, 5, 12, 8); R(C.corpo, 3, 3, 8, 2); R(C.brilho, 2, 5, 6, 2);
  // detalhes de lixo: garrafa, lata, papel e embalagem
  R(C.vidro, 2, 7, 2, 4); R(C.rotulo, 2, 6, 2, 1);
  R(C.metal, 9, 9, 3, 3); R(C.tampa, 9, 10, 3, 1);
  R(C.papel, 6, 3, 3, 2); R(C.embalagem, 11, 6, 2, 2);
  // olhos
  R(C.olho, 4, 7, 3, 3); R(C.olho, 8, 7, 3, 3);
  R(C.pupila, 5, 8, 1, 2); R(C.pupila, 9, 8, 1, 2);
  R(C.pupila, 4, 6, 3, 1); R(C.pupila, 8, 6, 3, 1);                          // sobrancelhas
  return (_spriteLixo = c);
}

function desenharLixo(e) {
  const t = e.t || 0, esc = e.pequeno ? 0.72 : 1, dir = e.dir < 0 ? -1 : 1;
  const sq = 1 + 0.1 * Math.sin(t * 8);                                      // "respiração" ancorada nos pés
  ctx.save();
  ctx.translate(Math.round(e.x), Math.round(e.y + e.h));                     // origem = pés do monstro
  ctx.scale(esc * dir, esc * sq);
  ctx.translate(dir < 0 ? -LIXO_LARG : 0, -LIXO_ALT);
  ctx.imageSmoothingEnabled = false;                                         // mantém o pixel art nítido ao reduzir
  ctx.drawImage(spriteLixo(), 0, 0);
  ctx.restore();
}

/* Onde o bloco reciclado deve nascer: no tile dos pés do monstro; se estiver ocupado sobe um tile,
   e se o monstro estiver no ar o bloco cai até apoiar no chão (no máximo 6 tiles). */
function tileDoBlocoReciclado(e) {
  const tx = Math.floor((e.x + e.w / 2) / TAM);
  let ty = Math.floor((e.y + e.h - 1) / TAM);
  if (tile(tx, ty) !== '.') ty--;
  if (tile(tx, ty) !== '.') return null;
  for (let i = 0; i < 6 && tile(tx, ty + 1) === '.'; i++) ty++;
  return { tx, ty };
}

/* Martelo da Reciclagem: o monstro de lixo vira um bloco verde (ponte/degrau) e conta como item reciclado */
function reciclarLixo(e) {
  if (e.reciclado) return;                                                   // evita contar duas vezes o mesmo monstro
  e.reciclado = true;
  const pos = tileDoBlocoReciclado(e);
  if (pos) criarMuda(pos.tx, pos.ty, 'B');                                   // criarMuda ainda valida limites do mapa
  dispararLicao('recicla');
  if (FASES[L.idx].contaItens) { L.progresso++; atualizarMeta(); toast('Reciclado! ' + L.progresso + '/' + L.total, 1.6); }
  som('montar');
}
