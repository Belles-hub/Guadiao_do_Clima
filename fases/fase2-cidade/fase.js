'use strict';
/* FASE 2 — A Cidade da Fumaça
   Dados da fase: tema de cores, objetivo, dica e curiosidade educativa. */
FASES[1] = {
  nome: 'A Cidade da Fumaça', curto: 'CIDADE', causa: 'Poluição dos carros',
  tema: {
    estilo: 'cidade',
    ceuQuente: ['#3a3a3a', '#a89a8a'], ceuFrio: ['#4a9ae0', '#d4eef8'], sol: '#d8c8a0',
    montanha: ['#2b2b30', '#5a7a8a'], arvoreLonge: ['#25252a', '#6a8a9a'], arvorePerto: ['#18181c', '#4a6a7a'],
    terreno: { grama: '#6a6a6a', terra: '#4a4a50', pedra: '#5a5a62', madeira: '#8a4a3a', plataforma: '#9a9aa4', muda: '#4fb54a' }
  },
  mapa: MAPA_FASE2, fundo: fundoCidade, vilao: 'capitao', objetivo: { rotulo: 'Bairros limpos', total: 2 }, arma: 1,
  dica: 'Carros vão e voltam. Espere a hora certa!',
  curiosidade: "O transporte emite cerca de 1/5 do CO2 do mundo.",
  atitude: "Vá a pé, de bicicleta ou de ônibus.",
  passos: ["Colete peças e baterias.", "Monte a Bicicleta-Turbo.", "Suba nos prédios e aperte J na nuvem."],
  intro: {
    "retrato": "capitao",
    "historia": "O Capitão Fumaça enche a cidade de poluição!",
    "missao": ["Limpe 2 bairros (J na nuvem)", "Monte a Bicicleta-Turbo", "Derrote o Capitão"],
    "dica": "Carros vão e voltam: espere a hora certa."
  },
  licoes: {
    "vilao_vem": "O Capitão é a poluição do trânsito.",
    "vilao": "Ciclovias e ônibus limpam o ar!",
    "inicio": "Carros soltam CO2 e fumaça que sujam o ar.",
    "item_peca": "Bicicleta não polui e faz bem à saúde.",
    "fumaca": "Fumaça suja o ar e atrapalha a respiração.",
    "arma": "Pedalar e andar a pé não poluem.",
    "obj1": "Menos carros = ar mais limpo!",
    "mata_carro": "Carona e ônibus tiram carros das ruas.",
    "obj2": "Ônibus polui menos por pessoa."
  },
  quiz: {
    "pergunta": "Qual jeito de ir à escola polui menos?",
    "opcoes": [
      "De bicicleta ou a pé",
      "Sozinho, de carro",
      "De moto, só por diversão"
    ],
    "certa": 0,
    "explicacao": "Bicicleta e caminhada não emitem CO2."
  }
};
