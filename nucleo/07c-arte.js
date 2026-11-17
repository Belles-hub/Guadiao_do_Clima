'use strict';
/* =====================================================================
   7c. ARTE: Davi e Fornax a partir das folhas de sprites (arte/*.png)
   Os atlas já estão na escala certa: 3 pixels do dispositivo = 1 pixel lógico.
   ===================================================================== */
const ARTE = { davi: new Image(), daviArm: new Image(), fornax: new Image(), nado: new Image() };
ARTE.daviArm.src = 'arte/davi_armadura.png';
let daviArmado = false;   // força a versão com armadura (tela da forja)
ARTE.nado.src = 'arte/nado.png';
ARTE.davi.src = 'arte/davi.png';
ARTE.fornax.src = 'arte/fornax.png';
const arteOk = img => img.complete && img.naturalWidth > 0;
const encaixar = v => Math.round(v * ESC_TELA) / ESC_TELA;       // alinha ao pixel do dispositivo

/* Desenha um quadro do atlas com os pés (âncora) em (x, y). dir = -1 espelha. */
function quadroArte(img, atl, nome, x, y, esc = 1, dir = 1, alfa = 1, tinta = null, forca = 0) {
  const f = atl[nome];
  if (!f || !arteOk(img)) return false;
  const s = esc / ESC_TELA;
  ctx.save();
  ctx.translate(encaixar(x), encaixar(y));
  if (dir < 0) ctx.scale(-1, 1);
  if (alfa < 1) ctx.globalAlpha *= alfa;
  if (tinta && forca > 0) {                                      // clarão de cor (dano, gelo) só sobre os pixels do sprite
    const t = tingido(img, f, tinta, forca);
    ctx.drawImage(t, 0, 0, f.w, f.h, -f.ax * s, -f.ay * s, f.w * s, f.h * s);
  } else ctx.drawImage(img, f.x, f.y, f.w, f.h, -f.ax * s, -f.ay * s, f.w * s, f.h * s);
  ctx.restore();
  return true;
}
let _tmp = null;
function tingido(img, f, cor, forca) {
  if (!_tmp) _tmp = document.createElement('canvas');
  _tmp.width = f.w; _tmp.height = f.h;
  const g = _tmp.getContext('2d');
  g.clearRect(0, 0, f.w, f.h);
  g.drawImage(img, f.x, f.y, f.w, f.h, 0, 0, f.w, f.h);
  g.globalCompositeOperation = 'source-atop';
  g.globalAlpha = forca; g.fillStyle = cor; g.fillRect(0, 0, f.w, f.h);
  return _tmp;
}
/* Sombra suave no chão sob personagens */
function sombraChao(x, y, larg, alfa = 0.35) {
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,' + alfa + ')';
  ctx.beginPath(); ctx.ellipse(encaixar(x), encaixar(y), larg / 2, Math.max(1.5, larg / 9), 0, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

/* ---------- Davi ----------
   px, py = canto do sprite antigo de 16x24 (os pés ficam em px + 8*esc, py + 24*esc).
   est: parado | andar | correr | pular | atacar | dano | escudo | vitoria | morto | agachar
   q: para 'pular', a velocidade vertical (negativa = subindo). */
function quadroDavi(est, q) {
  const t = tempoGlobal;
  switch (est) {
    case 'andar': return 'andar' + (Math.floor(t * 10) % 6);
    case 'correr': return 'correr' + (Math.floor(t * 13) % 5);
    case 'pular': return q < -110 ? 'pulo0' : q < 30 ? 'pulo1' : 'pulo2';
    case 'atacar': return 'tiro1';
    case 'dano': return 'dano';
    case 'escudo': return 'escudo';
    case 'vitoria': return 'vitoria';
    case 'morto': return 'morto';
    case 'agachar': return 'agachar';
    default: return 'retrato';
  }
}
/* Davi nadando: q = { vx, vy }. Mergulhando (descendo), subindo, braçada (andando) ou deslizando. */
function quadroNado(q) {
  const t = tempoGlobal, vx = Math.abs(q && q.vx || 0), vy = q && q.vy || 0;
  if (vy > 55) return 'd' + (Math.floor(t * 9) % 6);
  if (vy < -55) return 'u' + (Math.floor(t * 9) % 5);
  if (vx > 45) return 's' + (Math.floor(t * 11) % 5);
  if (vx > 8) return 'g' + (Math.floor(t * 7) % 5);
  return 'g' + (Math.floor(t * 2.5) % 2);
}
function desenharDavi(px, py, dir, est, q, arma, esc = 1) {
  const fx = px + 8 * esc, fy = py + 24 * esc;
  if (est === 'nadar') {                                         // centro do sprite = centro do corpo do Davi
    const bob = Math.round(Math.sin(tempoGlobal * 3) * 0.5 * ESC_TELA) / ESC_TELA;
    quadroArte(ARTE.nado, ATLAS_NADO, quadroNado(q), fx, fy - 11 * esc + bob + 5 * esc, esc * 1.2, dir);
    return;
  }
  const noChao = est !== 'pular';
  if (noChao) sombraChao(fx, fy, 17 * esc, 0.32);
  const respira = est === 'parado' ? Math.round(Math.sin(tempoGlobal * 3) * 0.5 * ESC_TELA) / ESC_TELA : 0;
  const arm = daviArmado || (J && J.armadura > 0 && (estado === 'jogo' || estado === 'pausa'));
  quadroArte(arm && arteOk(ARTE.daviArm) ? ARTE.daviArm : ARTE.davi, ATLAS_DAVI, quadroDavi(est, q), fx, fy + respira, esc, dir);
}

/* Projétil de folha (Lança-Sementes) */
function desenharFolhaProjetil(x, y, dir, t) {
  const f = ATLAS_DAVI.folha;
  if (!f || !arteOk(ARTE.davi)) return false;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const g = ctx.createRadialGradient(x, y, 0, x, y, 9);
  g.addColorStop(0, 'rgba(160,255,150,0.55)'); g.addColorStop(1, 'rgba(160,255,150,0)');
  ctx.fillStyle = g; ctx.fillRect(x - 9, y - 9, 18, 18);
  ctx.restore();
  quadroArte(ARTE.davi, ATLAS_DAVI, 'folha', x, y + f.ay / 2 / ESC_TELA * 0.6, 0.6, dir);
  return true;
}

/* =====================================================================
   Subguardiões, armas e poderes (arte/viloes.png e arte/armas.png)
   ===================================================================== */
ARTE.viloes = new Image(); ARTE.viloes.src = 'arte/viloes.png';
ARTE.armas = new Image(); ARTE.armas.src = 'arte/armas.png';
const ARMA_SHEET = { semente: 'muda', bike: 'vento', escudo: 'sol', martelo: 'reciclagem', bolha: 'gota' };
const PODER_SHEET = { raizes: 'muda', ar: 'vento', raio: 'sol', reciclagem: 'reciclagem', mare: 'gota' };

/* Sprite do atlas de armas centrado em (cx, cy), com largura w (e altura h, ou a proporção original) em pixels lógicos */
function spriteArma(nome, cx, cy, w, h, dir = 1, alfa = 1) {
  const f = ATLAS_ARMAS[nome];
  if (!f || !arteOk(ARTE.armas)) return false;
  if (h === undefined || h === null) h = w * f.h / f.w;
  ctx.save();
  ctx.translate(encaixar(cx), encaixar(cy));
  if (dir < 0) ctx.scale(-1, 1);
  if (alfa < 1) ctx.globalAlpha *= alfa;
  ctx.drawImage(ARTE.armas, f.x, f.y, f.w, f.h, -w / 2, -h / 2, w, h);
  ctx.restore();
  return true;
}
/* Ícone da arma (idle da folha) cabendo num quadrado de "lado" pixels lógicos */
function iconeArma(idArma, cx, cy, lado = 15, quadro = 'idle') {
  const f = ATLAS_ARMAS[(ARMA_SHEET[idArma] || idArma) + '_' + quadro];
  if (!f) return false;
  const k = lado / Math.max(f.w, f.h);
  return spriteArma((ARMA_SHEET[idArma] || idArma) + '_' + quadro, cx, cy, f.w * k, f.h * k);
}

/* ---------- subguardiões ---------- */
function quadroVilao(tipo, v) {
  if (v.morto) return 'derrota';
  if (v.flash > 0) return 'dano';
  const st = v.estado, t = v.t;
  const idle = 'idle' + (Math.floor(t * 2.5) % 2), mov = 'mov' + (Math.floor(t * 6) % 3);
  const andando = Math.abs((v.x || 0) - (v.baseX !== undefined ? v.baseX : v.x)) > 1.5;
  switch (tipo) {
    case 'serrao': return st === 'carga' ? 'at1' : st === 'investida' ? 'at1b' : st === 'toras' ? (Math.floor(t * 5) % 2 ? 'at2' : 'at2b') : (st === 'descanso' && andando ? mov : idle);
    case 'capitao': return st === 'buzina' ? 'at1' : st === 'investida' ? 'at2' : st === 'fumaca' ? 'at1b' : (st === 'descanso' && andando ? mov : idle);
    case 'barao': return st === 'carga' ? 'at1' : st === 'feixe' ? 'at2' : st === 'pedras' ? 'at1b' : idle;
    case 'reilixo': return st === 'agacha' ? 'mov0' : st === 'ar' ? 'mov2' : st === 'jogar' ? 'at1' : idle;
    case 'medusa': return st === 'sacolas' ? 'at1b' : st === 'aviso' ? 'at2' : (st === 'ida' || st === 'volta') ? 'at1' : mov;
  }
  return idle;
}
function desenharVilaoSprite(tipo, v) {
  const fx = v.x + v.w / 2, fy = v.y + v.h;
  if (tipo !== 'medusa' && !v.morto && v.estado !== 'ar') sombraChao(fx, fy + 1, v.w * 1.15, 0.33);
  if (tipo === 'medusa' && !v.morto) sombraChao(fx, v.baseY !== undefined ? v.baseY + v.h + 4 : fy + 6, v.w * 0.9, 0.12);
  const pulso = v.estado === 'aviso' || v.estado === 'carga' || v.estado === 'buzina';
  const ok = quadroArte(ARTE.viloes, ATLAS_VILOES, tipo + '_' + quadroVilao(tipo, v), fx, fy + (v.morto ? 2 : 0), 1, v.dir < 0 ? -1 : 1, 1,
    pulso ? '#ff3030' : null, pulso ? 0.18 + 0.2 * Math.max(0, Math.sin(v.t * 18)) : 0);
  return ok;
}

/* =====================================================================
   Casinhas das armas no HUD e molduras coloridas (arte/slots.png)
   ===================================================================== */
ARTE.slots = new Image(); ARTE.slots.src = 'arte/slots.png';
/* Casinha da arma i (0 a 4) no HUD: canto (x, y), 22 px de largura. Já traz número e ícone desenhados. */
function desenharSlotArma(i, x, y, tem, sel, nv2, lado = 22) {
  if (!arteOk(ARTE.slots)) return false;
  const f = ATLAS_SLOTS['s' + i];
  if (!f) return false;
  const w = lado, h = Math.min(lado, w * f.h / f.w);
  ctx.save();
  let fonte = ARTE.slots, sx = f.x, sy = f.y;
  if (i === 4 && !sel) { fonte = tingido(ARTE.slots, f, '#6a6e7a', 0.62); sx = 0; sy = 0; }          // a da bolha é dourada: apaga a cor quando não está selecionada
  else if (i !== 4 && sel) { fonte = tingido(ARTE.slots, f, '#e0a420', 0.45); sx = 0; sy = 0; }       // as outras ganham brilho dourado quando selecionadas
  else if (!tem) { fonte = tingido(ARTE.slots, f, '#000000', 0.58); sx = 0; sy = 0; }
  if (!tem && fonte !== ARTE.slots) { /* sem a arma: escurece */ }
  ctx.drawImage(fonte, sx, sy, f.w, f.h, x, y, w, h);
  if (!tem && i === 4) { ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(x + 1, y + 1, w - 2, h - 2); }
  if (sel) { rrect(x + 0.5, y + 0.5, w - 1, h - 1, 3); ctx.strokeStyle = '#ffd84f'; ctx.lineWidth = 0.9; ctx.stroke(); }
  if (nv2) { ctx.fillStyle = '#ffe34a'; ctx.fillRect(x + w * 0.74, y + h * 0.72, 3.4, 3.4); ctx.fillStyle = '#fff6b0'; ctx.fillRect(x + w * 0.74 + 0.6, y + h * 0.72 + 0.6, 1.2, 1.2); }
  ctx.restore();
  return true;
}
/* Moldura grande colorida da arma i, centrada em (cx, cy), com "lado" px */
function desenharMolduraArma(i, cx, cy, lado = 42) {
  const f = ATLAS_SLOTS['m' + i];
  if (!f || !arteOk(ARTE.slots)) return false;
  ctx.drawImage(ARTE.slots, f.x, f.y, f.w, f.h, encaixar(cx - lado / 2), encaixar(cy - lado / 2), lado, lado * f.h / f.w);
  return true;
}
