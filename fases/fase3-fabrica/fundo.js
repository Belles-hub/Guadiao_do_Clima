'use strict';
/* FASE 3 — A Fábrica de Carvão
   Cenário de fundo com parallax desta fase. */
function fundoFabrica(cx, cy, calor, base2, base3, c2, c3, T) {
    fundoPredios(cx, cy, 0.3, base2, 56, 22, 20, c2, false, 7); fundoChamines(cx, 0.3, base2, 90, 40, 40, c2, 3);
    fundoFornalhas(cx, 0.45, base3, calor, 5);
    fundoChamines(cx, 0.6, base3, 120, 60, 40, c3, 11);
    nuvensDeriva(cx, 0.1, 4, 30, 80, '50,30,30', 0.3, 5, 1.4);
    neblina(base3 - 36, base3 + 8, '255,80,30', 0, 0.22);
}
