'use strict';
/* =====================================================================
   3. DADOS: materiais, armas e fases
   ===================================================================== */
const MATERIAIS = {
  semente: 'Sementes', galho: 'Galhos', gota: 'Gotas de água',
  peca: 'Peças de bike', bateria: 'Baterias', placa: 'Placas solares', cristal: 'Cristais de energia',
  pet: 'Garrafas PET', lata: 'Latas', papel: 'Papel', bolha: 'Bolhas de ar', concha: 'Conchas'
};
/* Caractere do mapa -> material */
const CHAR_ITEM = { o: 'semente', g: 'galho', w: 'gota', v: 'vida', b: 'peca', n: 'bateria', p: 'placa', k: 'cristal', j: 'pet', l: 'lata', a: 'papel', u: 'bolha', h: 'concha', O: 'obsidiana' };
/* Caractere do mapa -> inimigo */
const CHAR_INIMIGO = { m: 'motosserra', c: 'chama', r: 'carro', t: 'lixo', e: 'aguaviva', H: 'chamine' };

const ARMAS = [
  { id: 'semente', nome: 'Lança-Sementes', desc: 'Atira mudas que apagam o fogo.', receita: { semente: 4, galho: 2, gota: 2 }, como: 'Aperte J: a semente mira sozinha.',
    nv2: { nome: 'Lança-Sementes Florescente', desc: 'Atira 3 sementes em leque.', como: 'Aperte J: 3 sementes florescem.', receita: { semente: 3, galho: 1, gota: 1 } } },
  { id: 'bike', nome: 'Bicicleta-Turbo', desc: 'Pulo duplo e pedalada.', receita: { peca: 3, bateria: 2 }, como: 'Aperte J para pedalar com força.',
    nv2: { nome: 'Bicicleta Elétrica', desc: 'Pedalada mais forte.', como: 'Aperte J: arrancada maior.', receita: { peca: 2, bateria: 2 } } },
  { id: 'escudo', nome: 'Escudo Solar', desc: 'Bloqueia raios de calor.', receita: { placa: 3, cristal: 2 }, como: 'Segure J para bloquear.',
    nv2: { nome: 'Escudo Solar Supremo', desc: 'Atordoa quem encosta.', como: 'Segure J: o escudo atordoa.', receita: { placa: 1, cristal: 1 } } },
  { id: 'martelo', nome: 'Martelo da Reciclagem', desc: 'Transforma lixo em blocos.', receita: { pet: 4, lata: 3, papel: 3 }, como: 'Aperte J para golpear.',
    nv2: { nome: 'Martelo Sísmico', desc: 'O golpe lança uma onda.', como: 'Aperte J: onda pelo chão.', receita: { pet: 3, lata: 2, papel: 2 } } },
  { id: 'bolha', nome: 'Bolha Gelada', desc: 'Congela e salva recifes.', receita: { bolha: 4, concha: 2 }, como: 'Aperte J: a bolha mira sozinha.',
    nv2: { nome: 'Bolha Congelante', desc: 'Bolhas congelam uma área.', como: 'Aperte J: 2 bolhas congelantes.', receita: { bolha: 1, concha: 3 } } }
];

/* Mapas: cada caractere é um tipo de tile ou entidade.
   Terreno: #=chão com topo  D=terra  S=pedra  X=bloco (madeira/prédio/caixa)  ==plataforma atravessável
            >,<=esteira  W=lava  R,L,U=corrente de água  M=muda  I=gelo  B=bloco reciclado (os três últimos são criados no jogo)
   P=início  G=bandeira  F=Fornax (chefe)
   Objetivos: f=foco de fogo  z=bairro poluído  y=gerador a carvão  q=recife de coral
   Inimigos: m=robô-motosserra  c=chama  r=carro-monstro  t=monstro de lixo  e=água-viva  H=chaminé de raios
   Itens: o,g,w=semente,galho,gota  b,n=peça de bike,bateria  p,k=placa solar,cristal  j,l,a=PET,lata,papel  u,h=bolha de ar,concha  v=coração */
/* Lista das fases: cada pasta de fases/ registra a sua aqui (FASES[0] a FASES[5]). */
const FASES = [];
