'use strict';
/* =====================================================================
   9. ESTADO DA FASE, JOGADOR, ENTIDADES
   ===================================================================== */
const ARMADURA_MAX = 100;   // armadura de obsidiana (fase 6, parte 2)
let L = null;        // estado da fase atual
let J = null;        // jogador
let inimigos = [], itens = [], focos = [], projeteis = [], mudas = [], nuvens = [];
let chefe = null;    // Fornax (fase 6)
let contInimigo = 0; // próximo id de inimigo (cid)
let cam = { x: 0, y: 0 };
let craftAberto = false, craftSel = 0;
let toastAtual = { txt: '', t: 0 };
const toast = (txt, t = 2.2) => { toastAtual = { txt, t }; };

const TIPOS_INIMIGO = {
  motosserra: { w: 14, h: 16, hp: 2, alcance: 0, vPatrulha: 34, vPerseguir: 34, vAtaque: 34, semPerseguir: true, tVolta: 2.6 },   // vai e volta num tempo fixo
  chama: { w: 12, h: 14, hp: 2, alcance: 0, vPatrulha: 26, vPerseguir: 26, vAtaque: 26, semPerseguir: true, tVolta: 3.2 },
  carro: { w: 22, h: 12, hp: 1, alcance: 0, vPatrulha: 40, vPerseguir: 40, vAtaque: 40, semPerseguir: true, tVolta: 3 },   // vai e volta num tempo fixo: não persegue
  lixo: { w: 14, h: 14, hp: 1, alcance: 0, vPatrulha: 28, vPerseguir: 28, vAtaque: 28, semPerseguir: true, tVolta: 3 },
  aguaviva: { w: 14, h: 14, hp: 1, alcance: 0, vPatrulha: 24, vPerseguir: 24, vAtaque: 0, flutua: true, semPerseguir: true, tVolta: 3.4 },
  chamine: { w: 16, h: 32, hp: 999, alcance: 190, vPatrulha: 0, vPerseguir: 0, vAtaque: 0, fixo: true }
};
/* Objetivos da fase: foco de fogo, bairro poluído, gerador a carvão, recife de coral */
const OBJ_CHAR = { f: 'fogo', z: 'bairro', y: 'gerador', q: 'recife' };
const TIPOS_OBJ = { fogo: { w: 16, h: 16, hp: 1 }, bairro: { w: 28, h: 22, hp: 1 }, gerador: { w: 16, h: 24, hp: 2 }, recife: { w: 20, h: 20, hp: 1 } };

function criarJogador(px, py) {
  return {
    x: px, y: py, w: 10, h: 22, vx: 0, vy: 0, dir: 1, noChao: false,
    vidas: VIDAS_MAX, invul: 0, coyote: 0, buffer: 0, pulosUsados: 0,
    atk: 0, recarga: 0, acertados: [], anim: 0, quadro: 0, knock: 0, lento: 0, dash: 0,
    escudo: false, extraVx: 0, ar: 100, afoga: 0.6, poderSel: 0, recPoder: [0, 0, 0, 0, 0], passoT: 0,
    arma: -1, seguro: { x: px, y: py }
  };
}
const armaAtual = () => (J.arma >= 0 && salvo.armas[ARMAS[J.arma].id]) ? ARMAS[J.arma].id : null;

function criarObjetivo(tipo, tx, ty) {
  const d = TIPOS_OBJ[tipo];
  focos.push({
    tipo, w: d.w, h: d.h, hp: d.hp, hpMax: d.hp, apagado: false, t: Math.random() * 6, flash: 0,
    x: tipo === 'fogo' ? tx * TAM : tx * TAM + (TAM - d.w) / 2,
    y: tipo === 'fogo' ? ty * TAM : (ty + 1) * TAM - d.h
  });
}
/* Objetivo da parte atual (a fase 6 tem duas partes) */
const objAtual = () => { const f = FASES[L.idx]; return f.partes ? f.partes[L.parte || 0].objetivo : f.objetivo; };
function iniciarFase(idx, comIntro = false, parte) {
  const f = FASES[idx];
  if (parte === undefined) parte = (!comIntro && L && L.idx === idx && L.parte) || 0;   // reiniciar volta para a parte em que você estava
  if (!f.partes) parte = 0;
  if (!f.mapa) { aviso = { txt: 'Esta fase chega na próxima versão!', t: 2.5 }; som('erro'); return; }
  const linhas = f.partes ? f.partes[parte].mapa : f.mapa;
  mapaAlt = linhas.length; mapaLarg = Math.max(...linhas.map(s => s.length));
  grade = []; inimigos = []; itens = []; focos = []; projeteis = []; mudas = []; nuvens = []; particulas = []; chefe = null; vilao = null;
  contInimigo = 0;                                          // identifica os inimigos do mapa pela ordem (usado nos checkpoints)
  let inicio = { x: 2, y: 11 }, bandeira = null, chefePos = null, vilaoPos = null;
  for (let y = 0; y < mapaAlt; y++) {
    const linha = [];
    for (let x = 0; x < mapaLarg; x++) {
      let c = linhas[y][x] || '.';
      if (c === 'P') { inicio = { x, y }; c = '.'; }
      else if (c === 'G') { bandeira = { x, y }; c = '.'; }
      else if (c === 'F') { chefePos = { x, y }; c = '.'; }
      else if (c === 'V') { vilaoPos = { x, y }; c = '.'; }
      else if (OBJ_CHAR[c]) { criarObjetivo(OBJ_CHAR[c], x, y); c = '.'; }
      else if (CHAR_INIMIGO[c]) { criarInimigo(CHAR_INIMIGO[c], x, y); c = '.'; }
      else if (CHAR_ITEM[c]) { itens.push({ x: x * TAM + 8, y: y * TAM + 8, tipo: CHAR_ITEM[c], t: Math.random() * 6, pego: false }); c = '.'; }
      linha.push(c);
    }
    grade.push(linha);
  }
  construirTiles(f.tema);
  J = criarJogador(inicio.x * TAM + 3, (inicio.y + 1) * TAM - 22);
  if (f.chefe) {   // na fase final, todas as armas estão disponíveis (as que faltarem são emprestadas)
    let emprestou = false;
    ARMAS.forEach(a => { if (!salvo.armas[a.id]) { salvo.armas[a.id] = true; emprestou = true; } });
    J.arma = 0;
    if (emprestou) setTimeout(() => toast('O planeta emprestou as armas que faltavam!', 3), 3800);
  } else {
    const ult = ARMAS.map((a, i) => salvo.armas[a.id] ? i : -1).filter(i => i >= 0);
    J.arma = ult.length ? ult[ult.length - 1] : -1;
  }
  L = {
    nInimigosIni: inimigos.length, nItensIni: itens.length, cpMarca: '0|0', cpLuta: false,
    idx, parte, forja: 0, tempo: 0, progresso: 0, total: (f.partes ? f.partes[parte].objetivo : f.objetivo).total, coletados: 0, inv: {},
    calor: 1, calorAlvo: 1, agua: !!f.agua, avisoErro: 0,
    bandeira: bandeira ? { x: bandeira.x * TAM, y: (bandeira.y - 2) * TAM, w: 16, h: 48 } : { x: -999, y: -999, w: 16, h: 48 },
    concluida: false, fim: 0, avisoBandeira: 0, dicaMontar: false, licoesVistas: {}, aprendidos: [], avisouPisao: false, vilaoDerrotado: false, avisouFraqueza: false
  };
  licaoAtual = null; filaLicoes = []; pausaLicao = 0;
  J.poderSel = Math.max(0, PODERES.findIndex((p, i) => poderConquistado(i))); reiniciarAmbienteVisual();
  if (chefePos) criarChefe(chefePos.x, chefePos.y);
  if (vilaoPos && f.vilao) criarVilao(f.vilao, vilaoPos.x, vilaoPos.y);
  craftAberto = false; ajudaAberta = false; craftSel = f.arma >= 0 ? f.arma : 0;
  cam.x = 0; cam.y = 0; atualizarCamera(1, true);
  if (f.partes && parte === 1) J.armadura = ARMADURA_MAX;
  if (!(comIntro && f.intro)) toast(f.partes ? f.partes[parte].titulo : (f.dica || f.nome), 3.5);   // com introdução, a dica já foi lida
  mudar(comIntro && f.intro ? 'intro' : 'jogo');
}
/* Dificuldade por fase (0 = fase 1 ... 5 = fase 6): tudo fica um pouco mais rápido e resistente a cada fase */
const difFase = () => (L && L.idx) || 0;
const difVel = () => 0.9 + 0.1 * difFase();        // ritmo dos ataques de vilões, projéteis e chefe (0,70 na fase 1 até 1,00 na fase 6)
function criarInimigo(tipo, tx, ty) {
  const d0 = TIPOS_INIMIGO[tipo], fi = difFase(), k = 1 + 0.12 * fi;
  const d = d0.fixo ? d0 : Object.assign({}, d0, { vPatrulha: d0.vPatrulha * k, vPerseguir: d0.vPerseguir * k, vAtaque: d0.vAtaque * k, hp: d0.hp + (fi >= 2 ? 1 : 0) + (fi >= 4 ? 1 : 0) });   // mais rápidos e, da fase 4 em diante, mais resistentes
  const e = {
    tipo, w: d.w, h: d.h, x: tx * TAM + (TAM - d.w) / 2, y: (ty + 1) * TAM - d.h, vx: 0, vy: 0, hp: d.hp,
    dir: Math.random() < 0.5 ? 1 : -1, t: Math.random() * 5, pal: hash(tx * 7 + ty * 13) % 3, somT: Math.random(), voltaT: 0.8 + Math.random() * 2,
    cid: contInimigo++, estado: 'patrulha', atk: 0, cd: 0.5, stun: 0, noChao: false, vivo: true, d, fumaT: Math.random(), multT: 8 + Math.random() * 4
  };
  if (tipo === 'chamine') { e.estado = 'espera'; e.cd = 1 + Math.random(); e.y = (ty + 1) * TAM - d.h; }
  inimigos.push(e);
  return e;
}
