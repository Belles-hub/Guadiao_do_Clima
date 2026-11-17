'use strict';
/* FASE 3 — A Fábrica de Carvão
   Dados da fase: tema de cores, objetivo, dica e curiosidade educativa. */
FASES[2] = {
  nome: 'A Fábrica de Carvão', curto: 'FÁBRICA', causa: 'Energia suja',
  tema: {
    estilo: 'fabrica',
    ceuQuente: ['#1c0808', '#6a1a12'], ceuFrio: ['#3a7ac0', '#b8dcf0'], sol: '#e03020',
    montanha: ['#1a0c0c', '#4a6a7a'], arvoreLonge: ['#2a1414', '#3a5a6a'], arvorePerto: ['#180a0a', '#2a4a5a'],
    terreno: { grama: '#4a4a4a', terra: '#3a2a2a', pedra: '#4a4a52', madeira: '#6a5a4a', plataforma: '#7a7a88', muda: '#4fb54a' }
  },
  mapa: MAPA_FASE3, fundo: fundoFabrica, vilao: 'barao', objetivo: { rotulo: 'Geradores desligados', total: 3 }, arma: 2,
  dica: 'Escudo Solar: segure J contra os raios!',
  curiosidade: "O carvão é a energia que mais emite CO2.",
  atitude: "Apague luzes e prefira energia solar e eólica.",
  passos: ["Colete placas e cristais.", "Monte o Escudo Solar.", "Toque em J perto dos geradores."],
  intro: {
    "retrato": "barao",
    "historia": "O Barão Carvão dispara raios de calor!",
    "missao": ["Desligue 3 geradores", "Monte o Escudo Solar", "Derrote o Barão"],
    "dica": "Segure J com o escudo contra os raios."
  },
  licoes: {
    "vilao_vem": "O Barão é a energia suja do carvão.",
    "vilao": "Energia limpa esfria o planeta!",
    "inicio": "Queimar carvão solta muito CO2.",
    "item_placa": "Placas solares usam a luz do sol.",
    "item_cristal": "Sol, vento e água geram energia limpa.",
    "arma": "Energia solar protege o clima!",
    "escudo": "Energia limpa já substitui o carvão.",
    "obj1": "Economizar energia também ajuda.",
    "obj3": "Apague a luz e tire da tomada!"
  },
  quiz: {
    "pergunta": "O que economiza energia em casa?",
    "opcoes": [
      "Deixar as luzes acesas",
      "Deixar a TV ligada sozinha",
      "Apagar a luz ao sair do quarto"
    ],
    "certa": 2,
    "explicacao": "Menos energia gasta = menos carvão queimado."
  }
};
