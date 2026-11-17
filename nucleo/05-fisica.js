'use strict';
/* =====================================================================
   5. FÍSICA E COLISÃO (tiles)
   ===================================================================== */
let grade = [], mapaLarg = 0, mapaAlt = 0;
const eSolido = c => c === '#' || c === 'D' || c === 'S' || c === 'X' || c === 'T' || c === 'B' || c === '>' || c === '<';
const eUmaVia = c => c === '=' || c === 'M' || c === 'I';
function tile(tx, ty) {
  if (tx < 0 || tx >= mapaLarg) return 'S';     // paredes invisíveis nas laterais
  if (ty < 0 || ty >= mapaAlt) return '.';
  return grade[ty][tx];
}

/* Move um corpo {x,y,w,h,vx,vy} resolvendo colisão eixo por eixo */
function moverCorpo(c, dt, atravessaPlataforma = false) {
  // --- eixo X ---
  const vxT = c.vx + (c.extraVx || 0);   // extraVx = esteiras e correntes
  c.x += vxT * dt; c.bateuX = false;
  let t = Math.floor(c.y / TAM), b = Math.floor((c.y + c.h - 0.01) / TAM);
  if (vxT !== 0) {
    const dir = vxT > 0;
    const tx = Math.floor((dir ? c.x + c.w - 0.01 : c.x) / TAM);
    for (let ty = t; ty <= b; ty++) {
      if (eSolido(tile(tx, ty))) { c.x = dir ? tx * TAM - c.w : (tx + 1) * TAM; c.vx = 0; c.bateuX = true; break; }
    }
  }
  // --- eixo Y ---
  const fundoAnt = c.y + c.h;
  c.y += c.vy * dt; c.noChao = false;
  const l = Math.floor(c.x / TAM), r = Math.floor((c.x + c.w - 0.01) / TAM);
  if (c.vy >= 0) {
    const tyb = Math.floor((c.y + c.h) / TAM);
    for (let tx = l; tx <= r; tx++) {
      const tp = tile(tx, tyb);
      if (eSolido(tp) || (eUmaVia(tp) && !atravessaPlataforma && fundoAnt <= tyb * TAM + 0.5)) {
        c.y = tyb * TAM - c.h; c.vy = 0; c.noChao = true; break;
      }
    }
  } else {
    const tyt = Math.floor(c.y / TAM);
    for (let tx = l; tx <= r; tx++) {
      if (eSolido(tile(tx, tyt))) { c.y = (tyt + 1) * TAM; c.vy = 0; break; }
    }
  }
}
