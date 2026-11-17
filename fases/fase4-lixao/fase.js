'use strict';
/* FASE 4 — O Lixão Gigante
   Dados da fase: tema de cores, objetivo, dica e curiosidade educativa. */
FASES[3] = {
  nome: 'O Lixão Gigante', curto: 'LIXÃO', causa: 'Consumo e lixo', contaItens: true,
  tema: {
    estilo: 'lixao',
    ceuQuente: ['#3a4a1a', '#a0a840'], ceuFrio: ['#4a9ae0', '#c8f0d0'], sol: '#d8e070',
    montanha: ['#2a3012', '#5a7a4a'], arvoreLonge: ['#222810', '#4a6a3a'], arvorePerto: ['#161a0a', '#3a5a2a'],
    terreno: { grama: '#6a7a30', terra: '#5a4a2a', pedra: '#5a5a50', madeira: '#8a6a3a', plataforma: '#9a7a40', muda: '#4fb54a' }
  },
  mapa: MAPA_FASE4, fundo: fundoLixao, vilao: 'reilixo', objetivo: { rotulo: 'Itens reciclados', total: 15 }, arma: 3,
  dica: 'Recicle 15 itens e suba ao topo!',
  curiosidade: "O lixo em lixões libera metano, um gás do efeito estufa.",
  atitude: "Reduza, reutilize e recicle.",
  passos: ["Colete PET, latas e papel.", "Monte o Martelo e golpeie os monstros.", "Chegue a 15 e suba ao topo."],
  intro: {
    "retrato": "reilixo",
    "historia": "O Rei do Lixo cresce com todo lixo jogado fora!",
    "missao": ["Recicle 15 itens", "Monte o Martelo", "Derrote o Rei do Lixo"],
    "dica": "O Martelo é o ponto fraco do Rei."
  },
  licoes: {
    "vilao_vem": "O Rei é o excesso de lixo.",
    "vilao": "Consumir com consciência reduz o lixo!",
    "inicio": "Lixo orgânico no lixão solta metano.",
    "item_pet": "PET reciclada vira roupa e embalagem.",
    "item_lata": "Latas podem ser recicladas sem fim.",
    "item_papel": "Reciclar papel poupa árvores.",
    "arma": "Reciclar é dar nova vida ao lixo!",
    "multiplica": "Lixo não reciclado só cresce.",
    "recicla": "Separe o lixo: reciclável à parte.",
    "obj10": "Restos de comida viram adubo."
  },
  quiz: {
    "pergunta": "Para onde vai uma garrafa PET vazia?",
    "opcoes": [
      "Para o lixo comum, misturada",
      "Para a coleta seletiva",
      "Para o rio ou a rua"
    ],
    "certa": 1,
    "explicacao": "Reciclada, vira produto novo."
  }
};
