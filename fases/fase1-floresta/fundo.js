'use strict';
/* FASE 1 — A Floresta em Chamas
   Cenário de fundo com parallax desta fase. */
function fundoFloresta(cx, cy, calor, base2, base3, c2, c3, T) {
    raiosSol('255,190,110', 0.05 + 0.04 * (1 - calor));
    nuvensDeriva(cx, 0.05, 4, 20, 70, calor > 0.5 ? '70,40,30' : '255,255,255', calor > 0.5 ? 0.3 : 0.35, 2.5);
    fundoPinheiros(cx, 0.3, base2, c2, 7, 40, calor * 0.7);
    neblina(base2 - 40, base2 + 6, calor > 0.5 ? '255,120,50' : '230,245,235', 0, 0.18);
    fundoPinheiros(cx, 0.6, base3, c3, 11, 56, calor);
    neblina(base3 - 24, base3 + 6, calor > 0.5 ? '255,100,40' : '210,235,215', 0, 0.2);
}
