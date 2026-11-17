'use strict';
/* FASE 6 — O Vulcão de Fornax
   Cenário de fundo com parallax desta fase. */
function fundoVulcao(cx, cy, calor, base2, base3, c2, c3, T) {
    fundoEspinhos(cx, 0.3, base2, 38, 40, 40, c2, 'rgba(255,100,30,' + (0.8 * calor) + ')');
    fundoCascatasLava(cx, 0.45, base2, calor, 5);
    fundoEspinhos(cx, 0.6, base3, 54, 50, 46, c3, 'rgba(255,160,40,' + (0.9 * calor) + ')');
    ctx.fillStyle = 'rgba(255,70,10,' + (0.18 * calor) + ')'; ctx.fillRect(0, ALT - 50, LARG, 50);   // brilho de lava no horizonte
}
