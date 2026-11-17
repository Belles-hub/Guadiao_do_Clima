'use strict';
/* FASE 5 — O Oceano Fervendo
   Dados da fase: tema de cores, objetivo, dica e curiosidade educativa. */
FASES[4] = {
  nome: 'O Oceano Fervendo', curto: 'OCEANO', causa: 'Aquecimento dos mares', agua: true,
  tema: {
    estilo: 'oceano',
    ceuQuente: ['#1a4a6a', '#e07a4a'], ceuFrio: ['#1a6ac0', '#80e0f0'], sol: '#ffb060',
    montanha: ['#0c2a4a', '#1a5a8a'], arvoreLonge: ['#2a3a4a', '#1a6a8a'], arvorePerto: ['#08182a', '#145a7a'],
    terreno: { grama: '#c8b070', terra: '#b89a60', pedra: '#6a7a8a', madeira: '#d06a8a', plataforma: '#e08a6a', muda: '#4fb54a' }
  },
  mapa: MAPA_FASE5, fundo: fundoOceano, vilao: 'medusa', objetivo: { rotulo: 'Recifes salvos', total: 2 }, arma: 4,
  dica: 'ESPAÇO nada. Suba para respirar!',
  curiosidade: "Os oceanos absorvem mais de 90% do calor extra do planeta.",
  atitude: "Evite plástico descartável e proteja o mar.",
  passos: ["Segure ESPAÇO para nadar.", "Colete bolhas e conchas e monte a Bolha.", "Aperte J no recife branco."],
  intro: {
    "retrato": "medusa",
    "historia": "A Medusa de Plástico polui os mares!",
    "missao": ["Salve 2 recifes", "Monte a Bolha Gelada", "Derrote a Medusa"],
    "dica": "ESPAÇO nada. Suba para respirar."
  },
  licoes: {
    "vilao_vem": "A Medusa é o plástico nos mares.",
    "vilao": "Leve sua garrafa e sacola reutilizáveis!",
    "inicio": "Os oceanos absorvem o calor extra do planeta.",
    "item_bolha": "Água quente tem menos oxigênio.",
    "corrente": "Mar quente branqueia os corais.",
    "arma": "Menos CO2 no ar esfria o mar.",
    "mata_aguaviva": "Tartarugas comem sacola achando que é água-viva.",
    "obj1": "Corais abrigam muita vida marinha.",
    "item_concha": "Não retire conchas e corais do mar.",
    "ar": "Sem ar? Suba à superfície!"
  },
  quiz: {
    "pergunta": "Como ajudar os oceanos no dia a dia?",
    "opcoes": [
      "Evitar plástico descartável",
      "Jogar lixo na praia",
      "Pisar nos corais"
    ],
    "certa": 0,
    "explicacao": "Menos plástico, mar mais limpo."
  }
};
