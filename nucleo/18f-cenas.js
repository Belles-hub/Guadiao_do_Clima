'use strict';
/* =====================================================================
   18f. DESENHOS DA HISTÓRIA: árvore da praça, vovó e vilões em miniatura
   ===================================================================== */
/* Árvore da praça: vida 0 = seca, 1 = cheia de folhas. cx = centro, baseY = chão */
function desenharArvore(cx, baseY, vida, esc = 1, t = 0) {
  ctx.save(); ctx.translate(Math.round(cx), Math.round(baseY)); ctx.scale(esc, esc);
  const R = (c, x, y, w, h) => { ctx.fillStyle = c; ctx.fillRect(Math.round(x), Math.round(y), w, h); };
  const tronco = misturar('#3a2a20', '#6a4426', vida);
  R('#1a0e08', -5, -40, 10, 40); R(tronco, -4, -40, 8, 40); R(misturar('#2a1c14', '#8a5c34', vida), -4, -40, 2, 40);
  R('#1a0e08', -12, -33, 9, 5); R(tronco, -11, -32, 8, 3); R('#1a0e08', 3, -27, 10, 5); R(tronco, 3, -26, 9, 3);
  R('#1a0e08', -8, -46, 5, 8); R(tronco, -7, -45, 3, 7);
  if (vida > 0.12) {
    const cor = misturar('#7a6a2a', '#2f9a3a', vida), luz = misturar('#9a8a3a', '#6fd25a', vida), k = 0.5 + vida * 0.5;
    [[0, -52, 17], [-14, -42, 11], [14, -42, 11], [-6, -62, 11], [8, -60, 10]].forEach(([bx, by, r]) => {
      r = Math.round(r * k);
      for (let y = -r; y <= r; y++) { const w = Math.floor(Math.sqrt(r * r - y * y)); R('#14301a', bx - w - 1, by + y, w * 2 + 2, 1); }
      for (let y = -r; y <= r; y++) { const w = Math.floor(Math.sqrt(r * r - y * y)); R(cor, bx - w, by + y, w * 2, 1); }
      R(luz, bx - Math.round(r * 0.5), by - Math.round(r * 0.55), Math.round(r * 0.5), 2);
      R(luz, bx + Math.round(r * 0.2), by - Math.round(r * 0.2), 3, 2);
    });
  }
  ctx.restore();
}

/* Vovó: sprite 16x24 */
const PALETA_AVO = { K: '#1a1a2a', W: '#e8e8f0', w: '#b8b8cc', S: '#f2c28b', s: '#e8a080', E: '#1a1a2a', P: '#9a4fc0', p: '#6e3490', A: '#fff3d6', G: '#3fae49', B: '#6a4a2a' };
const CORPO_AVO = [
  '......KKKK......',
  '.....KWWWWK.....',
  '....KWWWWWWK....',
  '...KWWwWWwWWK...',
  '...KWSSSSSSWK...',
  '...KSSESSESSK...',
  '...KSsSSSSsSK...',
  '....KSSSSSSK....',
  '.....KKSSKK.....',
  '...KKPPGGPPKK...',
  '..KPPPPGGPPPPK..',
  '..KPPPPPPPPPPK..',
  '..KPPPAAAAPPPK..',
  '..KPPPAAAAPPPK..',
  '..KPPPAAAAPPPK..',
  '..KPPPPPPPPPPK..',
  '..KpPPPPPPPPpK..',
  '..KppppppppppK..',
  '...KSSK..KSSK...',
  '...KBBK..KBBK...'
];
let spriteAvo = null;
function desenharAvo(px, py, dir = 1, esc = 1) {
  if (!spriteAvo) {
    spriteAvo = document.createElement('canvas'); spriteAvo.width = 16; spriteAvo.height = 20;
    const g = spriteAvo.getContext('2d');
    CORPO_AVO.forEach((lin, y) => { for (let x = 0; x < 16; x++) { const p = PALETA_AVO[lin[x]]; if (lin[x] !== '.' && p) { g.fillStyle = p; g.fillRect(x, y, 1, 1); } } });
  }
  ctx.save(); ctx.translate(Math.round(px), Math.round(py)); ctx.scale(esc, esc);
  if (dir < 0) { ctx.translate(16, 0); ctx.scale(-1, 1); }
  ctx.drawImage(spriteAvo, 0, 0);
  ctx.restore();
}

/* Subguardião em miniatura: cx = centro, baseY = pés, esc = escala */
function desenharVilaoMini(tipo, cx, baseY, esc) {
  const d = VILOES[tipo]; if (!d) return;
  ctx.save();
  ctx.translate(Math.round(cx), Math.round(baseY - d.h * esc / 2)); ctx.scale(esc, esc);
  d.desenhar({ x: -d.w / 2, y: -d.h / 2, w: d.w, h: d.h, dir: -1, t: tempoGlobal, estado: 'descanso', tt: 1, hp: d.hp || 1, hpMax: d.hp || 1, flash: 0, inv: 0, shake: 0, ativo: true, morto: false, vx: 0, vy: 0, n: 0, ataque: 0, fim: 1 });
  ctx.restore();
}

/* Balão de fala com rabinho apontando para (ax, ay) */
function balaoFala(x, y, w, h, ax, ay) {
  ret('#000', x - 1, y - 1, w + 2, h + 2); ret('#fff8e0', x, y, w, h);
  ret('#000', ax - 3, y + h, 7, 3); ret('#fff8e0', ax - 2, y + h, 5, 2); ret('#000', ax - 1, y + h + 2, 3, 3); ret('#fff8e0', ax, y + h + 2, 1, 2);
}

/* ---------- Vó Rosa e cenário da casa dela (arte/vo.png e arte/cenario.png) ---------- */
ARTE.vo = new Image(); ARTE.vo.src = 'arte/vo.png';
ARTE.cenario = new Image(); ARTE.cenario.src = 'arte/cenario.png';
/* Vó Rosa com os pés em (cx, baseY), altura "alt" em pixels lógicos. dir = 1 olha para a direita */
function spriteVo(nome, cx, baseY, alt, dir = 1) {
  const f = ATLAS_VO[nome]; if (!f || !arteOk(ARTE.vo)) return false;
  const k = alt / ATLAS_VO.idle1.h, w = f.w * k, h = f.h * k;
  ctx.save(); ctx.translate(Math.round(cx), Math.round(baseY)); if (dir < 0) ctx.scale(-1, 1);
  ctx.drawImage(ARTE.vo, f.x, f.y, f.w, f.h, -w / 2, -h, w, h);
  ctx.restore(); return true;
}
/* Peça do cenário (casa, horta, árvore...) com a base em (cx, baseY) e largura "larg" em pixels lógicos */
function spriteCen(nome, cx, baseY, larg) {
  const f = ATLAS_CENARIO[nome]; if (!f || !arteOk(ARTE.cenario)) return false;
  const k = larg / f.w, h = f.h * k;
  ctx.drawImage(ARTE.cenario, f.x, f.y, f.w, f.h, Math.round(cx - larg / 2), Math.round(baseY - h), larg, h);
  return true;
}
/* Vó animada: fala (alterna os quadros) ou parada */
function desenharVoAnim(cx, baseY, alt, dir, t, falando) {
  const q = falando ? ['fala1', 'fala2', 'fala3', 'fala4'][Math.floor(t * 4) % 4] : ['idle1', 'idle2', 'idle3', 'idle4'][Math.floor(t * 2) % 4];
  const sal = Math.round(Math.sin(t * 4) * 0.6);
  if (!spriteVo(q, cx, baseY + sal, alt, dir)) desenharAvo(cx - 16, baseY - 40, dir, 2);
}
