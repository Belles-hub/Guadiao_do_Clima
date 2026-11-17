'use strict';
/* FASE 2 — A Cidade da Fumaça
   Cenário de fundo com parallax desta fase. */
function fundoCidade(cx, cy, calor, base2, base3, c2, c3, T) {
    nuvensDeriva(cx, 0.05, 5, 24, 90, '70,66,64', 0.28, 3, 1.3);
    fundoPredios(cx, cy, 0.3, base2, 30, 34, 36, c2, false, 7); fundoPredios(cx, cy, 0.55, base3, 40, 50, 50, c3, true, 13);
    fundoCasas(cx, 0.72, base3 + 6, calor, 5);
    fundoPostes(cx, 0.85, base3 + 6, 9);
    neblina(base3 - 30, base3 + 8, '120,110,100', 0, 0.28);
}
