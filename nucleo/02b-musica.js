'use strict';
/* =====================================================================
   02b. MÚSICA E SOM AMBIENTE (tudo gerado por código com WebAudio, sem arquivos)
   - Cada fase tem a sua trilha.
   - A música acompanha o objetivo do jogo: quanto mais o planeta esfria, mais alegre ela fica
     (a escala passa de menor para maior e entram mais instrumentos: arpejo, melodia e sinos).
   - Lutas contra vilões e contra o Fornax deixam a música mais rápida e forte.
   - Som ambiente de cada cenário (vento, trânsito, máquinas, mar, vulcão); pássaros voltam quando o planeta esfria.
   - Teclas: M liga/desliga a música, N liga/desliga os efeitos e o ambiente.
   ===================================================================== */
const AJUSTES = { musica: true, efeitos: true };
const CHAVE_AJUSTES = 'guardiao_clima_ajustes_v1';
(function () { try { const s = localStorage.getItem(CHAVE_AJUSTES); if (s) Object.assign(AJUSTES, JSON.parse(s)); } catch (e) {} })();
function salvarAjustes() { try { localStorage.setItem(CHAVE_AJUSTES, JSON.stringify(AJUSTES)); } catch (e) {} }

let mestre = null, sfxBus = null, musBus = null, ambBus = null, bufRuido = null, duck = 1;
const avisoSom = { txt: '', t: 0 };
function montarBarramentos() {
  if (mestre || !actx) return;
  mestre = actx.createGain(); mestre.gain.value = 0.9; mestre.connect(actx.destination);
  sfxBus = actx.createGain(); sfxBus.connect(mestre);
  musBus = actx.createGain(); musBus.connect(mestre);
  ambBus = actx.createGain(); ambBus.connect(mestre);
  bufRuido = actx.createBuffer(1, actx.sampleRate, actx.sampleRate);
  const d = bufRuido.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  aplicarAjustes();
  iniciarSequenciador(); iniciarAmbienteSom();
}
function aplicarAjustes() {
  if (!mestre) return;
  const t = actx.currentTime;
  sfxBus.gain.setTargetAtTime(AJUSTES.efeitos ? 1 : 0, t, 0.05);
  ambBus.gain.setTargetAtTime(AJUSTES.efeitos ? 1 : 0, t, 0.1);
  musBus.gain.setTargetAtTime(AJUSTES.musica ? 0.5 * duck * seq.fade : 0, t, 0.08);
}
function alternarMusica() { AJUSTES.musica = !AJUSTES.musica; salvarAjustes(); aplicarAjustes(); avisoSom.txt = 'MÚSICA: ' + (AJUSTES.musica ? 'LIGADA' : 'DESLIGADA'); avisoSom.t = 1.8; }
function alternarEfeitos() { AJUSTES.efeitos = !AJUSTES.efeitos; salvarAjustes(); aplicarAjustes(); avisoSom.txt = 'EFEITOS: ' + (AJUSTES.efeitos ? 'LIGADOS' : 'DESLIGADOS'); avisoSom.t = 1.8; if (AJUSTES.efeitos) som('ok'); }
function desenharAvisoSom() {
  if (avisoSom.t <= 0) return;
  ctx.font = '8px ' + FONTE;
  const w = ctx.measureText(avisoSom.txt).width + 16;
  ctx.globalAlpha = Math.min(1, avisoSom.t * 2);
  pilula(LARG - w - 6, ALT - 30, w, 14, 'rgba(16,24,52,0.9)', '#ffd84f');
  texto(avisoSom.txt, LARG - w / 2 - 6, ALT - 27, '#fff', 8, 'center');
  ctx.globalAlpha = 1;
}

/* ---------------- notas, escalas e padrões ---------------- */
const NOTA = m => 440 * Math.pow(2, (m - 69) / 12);
const ESC_MAIOR = [0, 2, 4, 5, 7, 9, 11], ESC_MENOR = [0, 2, 3, 5, 7, 8, 10];
function midiGrau(raiz, grau, modo) {
  const e = modo ? ESC_MAIOR : ESC_MENOR, o = Math.floor(grau / 7), g = ((grau % 7) + 7) % 7;
  return raiz + e[g] + 12 * o;
}
const PAD = {
  B_SALTA: [1, 0, 0, 1, 0, 0, 2, 0, 1, 0, 0, 1, 0, 0, 2, 0], B_FUNK: [1, 0, 1, 0, 0, 3, 0, 1, 1, 0, 1, 0, 0, 3, 2, 0],
  B_MOTOR: [1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 2, 1], B_LENTO: [1, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0],
  A_UP: [0, -1, 1, -1, 2, -1, 1, -1, 0, -1, 1, -1, 2, -1, 3, -1], A_ONDA: [0, 1, 2, 3, 2, 1, 0, 1, 0, 1, 2, 3, 2, 1, 0, 1],
  R_ALEGRE: [1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0], R_FLAUTA: [1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0],
  R_SONHO: [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0]
};
const PERC = {
  nenhuma: { k: [], s: [], h: [] }, suave: { k: [0], s: [], h: [4, 12] },
  leve: { k: [0, 8], s: [4, 12], h: [0, 2, 4, 6, 8, 10, 12, 14] }, funk: { k: [0, 3, 8, 10], s: [4, 12], h: [0, 2, 4, 6, 8, 10, 12, 14] },
  ind: { k: [0, 4, 8, 12], s: [6, 14], h: [2, 6, 10, 14] }, forte: { k: [0, 3, 4, 8, 10, 12], s: [4, 12, 15], h: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15] }
};
const TEMAS = {
  menu: { bpm: 108, raiz: 60, modoFixo: 1, prog: [0, 4, 5, 3], baixo: PAD.B_SALTA, baixoOnda: 'triangle', arp: PAD.A_UP, mel: PAD.R_ALEGRE, perc: 'leve', onda: 'triangle', melOnda: 'square', semente: 11 },
  mapa: { bpm: 96, raiz: 62, modoFixo: 1, prog: [0, 5, 3, 4], baixo: PAD.B_SALTA, baixoOnda: 'triangle', arp: PAD.A_UP, mel: PAD.R_FLAUTA, perc: 'suave', onda: 'triangle', melOnda: 'triangle', semente: 5 },
  floresta: { bpm: 100, raiz: 57, prog: [0, 5, 3, 4], baixo: PAD.B_SALTA, baixoOnda: 'triangle', arp: PAD.A_UP, mel: PAD.R_FLAUTA, perc: 'leve', onda: 'triangle', melOnda: 'triangle', semente: 3 },
  cidade: { bpm: 116, raiz: 62, prog: [0, 3, 4, 3], baixo: PAD.B_FUNK, baixoOnda: 'square', arp: PAD.A_UP, mel: PAD.R_ALEGRE, perc: 'funk', onda: 'square', melOnda: 'square', semente: 7 },
  fabrica: { bpm: 108, raiz: 52, prog: [0, 0, 5, 4], baixo: PAD.B_MOTOR, baixoOnda: 'sawtooth', arp: PAD.A_UP, mel: PAD.R_FLAUTA, perc: 'ind', onda: 'square', melOnda: 'sawtooth', semente: 13 },
  lixao: { bpm: 104, raiz: 55, prog: [0, 3, 0, 4], baixo: PAD.B_FUNK, baixoOnda: 'square', arp: PAD.A_UP, mel: PAD.R_ALEGRE, perc: 'leve', onda: 'square', melOnda: 'triangle', semente: 17 },
  oceano: { bpm: 84, raiz: 53, prog: [0, 4, 5, 2], baixo: PAD.B_LENTO, baixoOnda: 'sine', arp: PAD.A_ONDA, mel: PAD.R_SONHO, perc: 'suave', onda: 'sine', melOnda: 'sine', semente: 19 },
  vulcao: { bpm: 126, raiz: 50, prog: [0, 5, 3, 4], baixo: PAD.B_MOTOR, baixoOnda: 'sawtooth', arp: PAD.A_UP, mel: PAD.R_FLAUTA, perc: 'forte', onda: 'square', melOnda: 'sawtooth', semente: 23 },
  fim: { bpm: 66, raiz: 57, modoFixo: 0, prog: [0, 5, 3, 4], baixo: PAD.B_LENTO, baixoOnda: 'triangle', mel: PAD.R_SONHO, perc: 'nenhuma', onda: 'triangle', melOnda: 'triangle', semente: 29 },
  conquista: { bpm: 112, raiz: 64, modoFixo: 1, prog: [0, 3, 4, 0], baixo: PAD.B_SALTA, baixoOnda: 'triangle', arp: PAD.A_UP, mel: PAD.R_ALEGRE, perc: 'leve', onda: 'triangle', melOnda: 'square', semente: 31 },
  vitoria: { bpm: 120, raiz: 60, modoFixo: 1, prog: [0, 4, 5, 3, 0, 4, 0, 0], baixo: PAD.B_FUNK, baixoOnda: 'triangle', arp: PAD.A_UP, mel: PAD.R_ALEGRE, perc: 'funk', onda: 'square', melOnda: 'square', semente: 37 }
};

/* ---------------- vozes e percussão ---------------- */
function voz(freq, t, dur, tipo, vol, atk = 0.005, rel = 0.1) {
  const o = actx.createOscillator(), g = actx.createGain();
  o.type = tipo; o.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(vol, t + atk);
  g.gain.setValueAtTime(vol, t + Math.max(atk, dur - rel));
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur + rel);
  o.connect(g); g.connect(musBus); o.start(t); o.stop(t + dur + rel + 0.02);
}
function bumbo(t) {
  const o = actx.createOscillator(), g = actx.createGain();
  o.type = 'sine'; o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(45, t + 0.12);
  g.gain.setValueAtTime(0.28, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
  o.connect(g); g.connect(musBus); o.start(t); o.stop(t + 0.2);
}
function ruidoMus(t, dur, vol, tipo, freq) {
  const s = actx.createBufferSource(), f = actx.createBiquadFilter(), g = actx.createGain();
  s.buffer = bufRuido; f.type = tipo; f.frequency.value = freq;
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  s.connect(f); f.connect(g); g.connect(musBus); s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.02);
}
const caixa = t => { ruidoMus(t, 0.1, 0.12, 'bandpass', 1800); voz(190, t, 0.05, 'triangle', 0.06, 0.002, 0.05); };
const chimbal = t => ruidoMus(t, 0.035, 0.05, 'highpass', 7000);

/* ---------------- sequenciador ---------------- */
const seq = { tema: null, alvo: 'menu', intenso: 0, passo: 0, compasso: 0, proxT: 0, modo: 1, calor: 1, fade: 1, timer: null, tt: null, mel: [] };
function gerarMelodia(T) {
  const r = gerador(T.semente * 101 + (seq.compasso % 8) * 17);
  const acorde = T.prog[seq.compasso % T.prog.length], alvos = [acorde, acorde + 2, acorde + 4, acorde + 7];
  let g = acorde + 4; const out = [];
  for (let p = 0; p < 16; p++) {
    if (!T.mel[p] || r() < 0.12) { out.push(null); continue; }
    if (p % 4 === 0) g = alvos[Math.floor(r() * 4)];
    else g = clamp(g + (r() < 0.5 ? -1 : 1) * (r() < 0.7 ? 1 : 2), acorde - 2, acorde + 9);
    out.push(g);
  }
  return out;
}
function iniciarCompasso(T) {
  if (T.modoFixo !== undefined) seq.modo = T.modoFixo;
  else if (seq.calor < 0.45) seq.modo = 1;            // planeta frio e saudável: escala maior (alegre)
  else if (seq.calor > 0.55) seq.modo = 0;            // planeta quente: escala menor (tensa)
  seq.mel = T.mel ? gerarMelodia(T) : [];
}
function tocarPasso(T, t, dur) {
  const p = seq.passo, acorde = T.prog[seq.compasso % T.prog.length], modo = seq.modo, c = seq.calor, raiz = T.raiz;
  const extra = T.modoFixo !== undefined;               // temas de tela sempre completos
  // baixo
  const b = T.baixo[p];
  if (b) voz(NOTA(midiGrau(raiz - 12, acorde + (b === 2 ? 4 : 0), modo) + (b === 3 ? 12 : 0)), t, dur * 1.6, T.baixoOnda, 0.1, 0.005, 0.08);
  // arpejo (entra quando o planeta começa a melhorar)
  if (T.arp && (extra || c < 0.95)) {
    const i = T.arp[p];
    if (i >= 0) voz(NOTA(midiGrau(raiz, acorde + [0, 2, 4, 7][i], modo)), t, dur * 0.9, T.onda, 0.035, 0.003, 0.09);
  }
  // melodia (entra com o planeta mais fresco e fica mais forte)
  if (T.mel && (extra || c < 0.8) && seq.mel[p] != null) voz(NOTA(midiGrau(raiz + 12, seq.mel[p], modo)), t, dur * 1.4, T.melOnda, 0.04 + (1 - c) * 0.025, 0.004, 0.12);
  // sinos: só quando o planeta já está bem frio
  if ((c < 0.45 || extra) && p % 8 === 0) voz(NOTA(midiGrau(raiz + 24, acorde + 4, modo)), t, dur * 3, 'sine', 0.045, 0.002, 0.5);
  // percussão (mais forte nas lutas)
  const pr = PERC[seq.intenso > 0.5 && T.perc !== 'nenhuma' ? 'forte' : T.perc];
  if (pr.k.includes(p)) bumbo(t);
  if (pr.s.includes(p)) caixa(t);
  if (pr.h.includes(p)) chimbal(t);
}
function agendar() {
  if (!actx || !musBus || actx.state !== 'running') return;
  const agora = actx.currentTime;
  if (!AJUSTES.musica || seq.fade === 0 || !seq.tema) { seq.proxT = Math.max(seq.proxT, agora + 0.05); return; }
  const T = TEMAS[seq.tema]; if (!T) return;
  if (!seq.mel.length && T.mel) iniciarCompasso(T);
  while (seq.proxT < agora + 0.3) {
    const dur = 60 / (T.bpm * (1 + 0.2 * seq.intenso)) / 4;
    tocarPasso(T, seq.proxT, dur);
    seq.proxT += dur; seq.passo++;
    if (seq.passo >= 16) { seq.passo = 0; seq.compasso++; iniciarCompasso(T); }
  }
}
function iniciarSequenciador() {
  if (seq.timer) return;
  seq.proxT = actx.currentTime + 0.1;
  seq.timer = setInterval(() => { try { agendar(); } catch (e) {} }, 60);
}
/* troca de trilha com um pequeno fade */
function musicaTema(nome, intenso = 0) {
  seq.intenso = intenso;
  if (nome === seq.alvo && seq.tema) return;
  seq.alvo = nome;
  if (!actx || !musBus) { seq.tema = nome; seq.passo = 0; seq.compasso = 0; seq.mel = []; return; }
  seq.fade = 0; aplicarAjustes();
  clearTimeout(seq.tt);
  seq.tt = setTimeout(() => {
    seq.tema = seq.alvo; seq.passo = 0; seq.compasso = 0; seq.mel = []; seq.proxT = actx.currentTime + 0.05; seq.fade = 1; aplicarAjustes();
  }, 280);
}
/* que trilha deve tocar agora? */
function temaDesejado() {
  const naFase = (estado === 'jogo' || estado === 'pausa' || estado === 'intro') && L;
  if (naFase) {
    const est = FASES[L.idx].tema.estilo;
    if (chefe && !chefe.morto && estado !== 'intro') return { tema: 'vulcao', intenso: 1.4, calor: L.calor };
    if (vilao && vilao.ativo && !vilao.morto) return { tema: est, intenso: 1, calor: L.calor };
    return { tema: est, intenso: 0, calor: L.calor };
  }
  switch (estado) {
    case 'fases': case 'diario': return { tema: 'mapa', intenso: 0, calor: 0.5 };
    case 'gameover': return { tema: 'fim', intenso: 0, calor: 1 };
    case 'concluida': case 'curiosidade': case 'quiz': return { tema: 'conquista', intenso: 0, calor: 0.3 };
    case 'vitoria': return { tema: 'vitoria', intenso: 0, calor: 0 };
    default: return { tema: 'menu', intenso: 0, calor: 0.5 };
  }
}
function atualizarMusica(dt) {
  const d = temaDesejado();
  musicaTema(d.tema, d.intenso);
  seq.calor += (d.calor - seq.calor) * Math.min(1, dt * 0.8);
  const duckAlvo = estado === 'pausa' ? 0.3 : ((typeof craftAberto !== 'undefined' && craftAberto) || (typeof ajudaAberta !== 'undefined' && ajudaAberta) ? 0.6 : 1);
  if (duckAlvo !== duck) { duck = duckAlvo; aplicarAjustes(); }
  ambienteSomAtualizar(dt);
  avisoSom.t -= dt;
}

/* ---------------- som ambiente de cada cenário ---------------- */
const amb = { src: null, filtro: null, gain: null, timer: null, acumulado: 0 };
const AMB_CEN = {   // freq do filtro e volume do "colchão" de ruído de cada cenário
  floresta: [520, 0.05], cidade: [230, 0.09], fabrica: [150, 0.1], lixao: [380, 0.04], oceano: [270, 0.1], vulcao: [100, 0.15], menu: [650, 0.02]
};
function iniciarAmbienteSom() {
  if (amb.src) return;
  const n = actx.sampleRate * 2, buf = actx.createBuffer(1, n, actx.sampleRate), d = buf.getChannelData(0);
  let ult = 0; for (let i = 0; i < n; i++) { ult = (ult + 0.02 * (Math.random() * 2 - 1)) / 1.02; d[i] = ult * 3.5; }   // ruído "marrom"
  amb.src = actx.createBufferSource(); amb.src.buffer = buf; amb.src.loop = true;
  amb.filtro = actx.createBiquadFilter(); amb.filtro.type = 'lowpass'; amb.filtro.frequency.value = 400;
  amb.gain = actx.createGain(); amb.gain.gain.value = 0;
  amb.src.connect(amb.filtro); amb.filtro.connect(amb.gain); amb.gain.connect(ambBus); amb.src.start();
  amb.timer = setInterval(() => { try { ambienteEventos(); } catch (e) {} }, 420);
}
function cenarioAtual() { return ((estado === 'jogo' || estado === 'pausa' || estado === 'intro') && L) ? FASES[L.idx].tema.estilo : 'menu'; }
function ambienteSomAtualizar(dt) {
  if (!amb.src) return;
  const est = cenarioAtual(), cfg = AMB_CEN[est] || AMB_CEN.menu, t = actx.currentTime;
  let g = cfg[1];
  if (est === 'oceano') g *= 0.7 + 0.3 * Math.sin(tempoGlobal * 0.7);          // ondas
  if (estado === 'pausa') g *= 0.3;
  amb.filtro.frequency.setTargetAtTime(cfg[0], t, 0.3);
  amb.gain.gain.setTargetAtTime(g, t, 0.3);
}
function passaro() {
  const f = 2300 + Math.random() * 900, n = 2 + Math.floor(Math.random() * 3);
  for (let i = 0; i < n; i++) setTimeout(() => bip(f + i * 150, 0.07, 'sine', 0.03, 650), i * 110);
}
function ambienteEventos() {
  if (!actx || actx.state !== 'running' || !AJUSTES.efeitos || estado !== 'jogo' || !L) return;
  const est = FASES[L.idx].tema.estilo, c = L.calor, r = Math.random();
  const fresco = c < 0.5;
  if (fresco && r < 0.3 && est !== 'oceano' && est !== 'vulcao') { passaro(); return; }          // pássaros voltam quando o planeta esfria
  switch (est) {
    case 'floresta': if (!fresco && r < 0.4) ruido(0.08, 0.025, 4500, 'highpass'); break;          // fogo crepitando ao longe
    case 'cidade': if (r < 0.1) bip(233, 0.25, 'square', 0.012); break;                           // buzina distante
    case 'fabrica': if (r < 0.15) { bip(700, 0.06, 'square', 0.015, -300); } break;                 // batida de metal
    case 'lixao': if (r < 0.15) bip(520, 0.12, 'sine', 0.012, 60); break;                          // moscas
    case 'oceano': if (r < 0.4) bip(500 + Math.random() * 500, 0.06, 'sine', 0.02, 250); else if (r < 0.43) bip(110, 1.2, 'triangle', 0.025, 70); break;   // bolhas e baleia
    case 'vulcao': if (r < 0.2) ruido(0.2, 0.04, 500, 'lowpass', -300); break;
  }
}
