'use strict';
/* FASE 1 — A Floresta em Chamas
   Dados da fase: tema de cores, objetivo, dica e curiosidade educativa. */
FASES[0] = {
  nome: 'A Floresta em Chamas', curto: 'FLORESTA', causa: 'Desmatamento e queimadas',
  tema: {
    estilo: 'floresta',
    ceuQuente: ['#8a160c', '#f48a2a'], ceuFrio: ['#3b8de0', '#c2ecd2'], sol: '#ffd84f',
    montanha: ['#4a2118', '#3f7a52'], arvoreLonge: ['#34170f', '#2f6a40'], arvorePerto: ['#1f0e07', '#245a2e'],
    terreno: { grama: '#738c2c', terra: '#6a4a2c', pedra: '#6c7076', madeira: '#9b6b3a', plataforma: '#b07a40', muda: '#4fb54a' }
  },
  mapa: MAPA_FASE1, fundo: fundoFloresta, vilao: 'serrao',
  objetivo: { rotulo: 'Focos apagados', total: 4 }, arma: 0,
  dica: 'Colete os materiais e monte sua arma!',
  curiosidade: "Queimadas e desmatamento liberam CO2 e respondem por cerca de 10% das emissões.",
  atitude: "Plante árvores e nunca queime lixo ou mato.",
  passos: ["Colete sementes, galhos e gotas.", "Monte o Lança-Sementes (o menu abre sozinho).", "Aperte J perto do fogo."],
  intro: {
    "retrato": "serrao",
    "historia": "Serrão, o robô-lenhador, incendeia a floresta!",
    "missao": ["Apague 4 focos de fogo", "Monte o Lança-Sementes", "Derrote o Serrão"],
    "dica": "J atira sementes: elas apagam o fogo!"
  },
  licoes: {
    "vilao_vem": "Serrão é o desmatamento: derruba florestas.",
    "vilao": "Proteger florestas esfria o planeta!",
    "inicio": "Árvores absorvem CO2 e esfriam o planeta.",
    "item_semente": "Plantar árvores ajuda o clima.",
    "item_gota": "Nunca queime lixo perto de mata.",
    "arma": "Mudas viram árvores: reflorestar cura o planeta.",
    "obj1": "Viu fogo na mata? Ligue 193 (bombeiros).",
    "obj3": "Proteger florestas é proteger o clima.",
    "mata_motosserra": "Prefira madeira e papel certificados."
  },
  quiz: {
    "pergunta": "O que ajuda a proteger as florestas?",
    "opcoes": [
      "Queimar o lixo no mato",
      "Plantar árvores e não usar fogo",
      "Cortar árvores sem pensar"
    ],
    "certa": 1,
    "explicacao": "Árvores guardam carbono: plante e proteja!"
  }
};
