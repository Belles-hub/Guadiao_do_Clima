'use strict';
/* =====================================================================
   14. CÂMERA
   ===================================================================== */
function atualizarCamera(dt, instantanea = false) {
  const alvoX = J.x + J.w / 2 - LARG / 2 + J.dir * 22;
  const alvoY = J.y + J.h / 2 - ALT * 0.55;
  const k = instantanea ? 1 : 1 - Math.exp(-5 * dt);
  cam.x = lerp(cam.x, alvoX, k); cam.y = lerp(cam.y, alvoY, k);
  const maxX = mapaLarg * TAM - LARG, maxY = mapaAlt * TAM - ALT;
  cam.x = maxX > 0 ? clamp(cam.x, 0, maxX) : maxX / 2;
  cam.y = maxY > 0 ? clamp(cam.y, 0, maxY) : maxY / 2;
}
