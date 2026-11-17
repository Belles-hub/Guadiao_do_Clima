'use strict';
/* FASE 6 — O Vulcão de Fornax
   Aqui o vilão é o chefe final (lógica em chefe.js). Esta entrada só serve para o retrato na tela de introdução. */
VILOES.fornax = {
  nome: 'FORNAX, O MONSTRO DO CALOR', curto: 'FORNAX', cor: '#ff7a1a', w: 96, h: 96, escalaRetrato: 0.8,
  desenhar(v) { desenharFornax(v.x + 48, v.y + 96, 1, v.t); }
};
