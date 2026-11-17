'use strict';
/* FASE 6 — O Vulcão de Fornax
   Dados da fase: tema de cores, objetivo, dica e curiosidade educativa. */
FASES[5] = {
  nome: 'O Vulcão de Fornax', curto: 'VULCÃO', causa: 'O Monstro do Calor', chefe: true,
  tema: {
    estilo: 'vulcao',
    ceuQuente: ['#2a0606', '#e0501a'], ceuFrio: ['#3a8ae0', '#c8f0f8'], sol: '#ff6020',
    montanha: ['#200808', '#4a7a9a'], arvoreLonge: ['#2a1010', '#3a6a8a'], arvorePerto: ['#180808', '#2a5a7a'],
    terreno: { grama: '#3a2a2a', terra: '#2a1a1a', pedra: '#3a3036', madeira: '#6a3a2a', plataforma: '#7a4a3a', muda: '#4fb54a' }
  },
  mapa: MAPA_F6_CAMINHO, fundo: fundoVulcao, objetivo: { rotulo: 'Joias e Fornax', total: 5 }, arma: -1,
  partes: [
    { mapa: MAPA_F6_CAMINHO, objetivo: { rotulo: 'Obsidianas', total: 5 }, titulo: 'Fase 6 • Parte 1: O Caminho de Obsidiana', banner: 'Fase 6 • Parte 1: Obsidiana', dica: 'Pegue as 5 joias de obsidiana!' },
    { mapa: MAPA_FASE6, objetivo: { rotulo: 'Pontos fracos', total: 5 }, titulo: 'Fase 6 • Parte 2: Fornax, o Monstro do Calor', banner: 'Fase 6 • Parte 2: Fornax', dica: 'A armadura protege. Acerte os pontos fracos!' }
  ],
  dica: 'Qualquer arma acerta o ponto brilhante!',
  curiosidade: "O planeta já esquentou cerca de 1,1 °C.",
  atitude: "Pequenas atitudes de muita gente mudam o mundo!",
  passos: ["Atire no ponto brilhante.", "Pule as ondas de calor.", "Use Q/R: poderes."],
  intro: {
    "retrato": "fornax",
    "historia": "Suas armas viram o PODER DO CLIMA!",
    "missao": ["Pegue 5 joias de obsidiana", "Forje a Armadura de Obsidiana", "Acerte os pontos fracos de Fornax"],
    "dica": "Fornax bate MUITO forte: a armadura aguenta pouco!"
  },
  licoes: {
    "inicio": "Fornax é o aquecimento global.",
    "ponto1": "Cada solução esfria um pouco.",
    "errou": "Use uma arma, não o soco.",
    "ponto3": "Conte à sua família o que aprendeu!"
  },
  quiz: {
    "pergunta": "O que resolve o aquecimento global?",
    "opcoes": [
      "Só uma pessoa fazendo tudo",
      "Nada, não dá para mudar",
      "Muita gente fazendo a sua parte"
    ],
    "certa": 2,
    "explicacao": "Muitas pequenas ações mudam o mundo."
  }
};
