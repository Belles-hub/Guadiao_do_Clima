'use strict';
/* =====================================================================
   18g. FORJA DA ARMADURA DE OBSIDIANA: aparece ao reunir as 5 joias (fase 6, parte 1)
   ===================================================================== */
let forjaInicio = 0;
function iniciarForja() { forjaInicio = tempoGlobal; som('vitoria'); mudar('armadura'); }
function telaArmadura() {
  const t = tempoGlobal - forjaInicio, pronta = t > 2.2;
  desenharCena();
  ret('rgba(10,4,24,0.78)', 0, 0, LARG, ALT);
  rrect(48, 8, 288, 200, 5); ctx.fillStyle = '#8a5ae8'; ctx.fill();
  rrect(50, 10, 284, 196, 4); ctx.fillStyle = '#241442'; ctx.fill();
  textoContorno('ARMADURA DE OBSIDIANA', 192, 18, '#cdb8ff', 11, 'center', 270);
  if (pronta) textoContorno('forjada!', 192, 36, '#ffd84f', 9, 'center'); else textoContorno('forjando...', 192, 36, '#b8a0f0', 9, 'center');
  // aura
  const cx = 192, cy = 106;
  [[60, 'rgba(120,80,210,0.18)'], [44, 'rgba(140,100,230,0.22)'], [28, 'rgba(170,130,255,0.28)']].forEach(([r, c]) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(cx, cy, r + (pronta ? Math.sin(t * 3) * 2 : 0), 0, 7); ctx.fill(); });
  // cinco joias: giram em volta e se encaixam no Davi
  for (let i = 0; i < 5; i++) {
    const a = -Math.PI / 2 + (i - 2) * 0.62 + (pronta ? 0 : Math.sin(t * 2 + i) * 0.1);
    const r = pronta ? 70 : 70 - Math.min(40, t * 22), gx = cx + Math.cos(a) * r * 1.15, gy = cy + 6 + Math.sin(a) * r * 0.7;
    ctx.fillStyle = 'rgba(160,120,240,0.35)'; ctx.beginPath(); ctx.arc(gx, gy, 12, 0, 7); ctx.fill();
    desenharObsidiana(gx, gy, 1.5);
  }
  if (t > 2.0 && t < 2.5) { ctx.fillStyle = 'rgba(255,255,255,' + (1 - (t - 2.0) / 0.5).toFixed(2) + ')'; ctx.fillRect(50, 10, 284, 196); }
  daviArmado = pronta;
  desenharDavi(cx - 8 * 2.6, cy + 50 - 24 * 2.6, 1, 'parado', 0, null, 2.6);
  daviArmado = false;
  if (pronta && Math.random() < 0.3) emitir('brilho', cx + rnd(-30, 30), cy + rnd(-40, 40), 1, '#a07af0');
  atualizarParticulas(1 / 60); desenharParticulas();
  rrect(60, 166, 264, 16, 2); ctx.fillStyle = '#8a5ae8'; ctx.fill(); rrect(61, 167, 262, 14, 1.5); ctx.fillStyle = '#2a1850'; ctx.fill();
  texto('Protege do calor do Fornax e revela os pontos fracos', 192, 171, '#e8dcff', 7, 'center', false, 254);
  if (pronta) menuGrade([{ txt: 'ENFRENTAR FORNAX', x: 192 - 55, y: 187, w: 110, h: 15, acao: () => iniciarFase(5, false, 1) }], [[0]]);
}
