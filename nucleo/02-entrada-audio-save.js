'use strict';
/* =====================================================================
   2. ENTRADA (teclado e mouse)
   ===================================================================== */
const teclas = {}, apertou = {};
const mouse = { x: -1, y: -1, clique: false, moveu: false };
let digitado = '';   // caracteres digitados neste quadro (usado nos campos de texto da tela de conta)
window.addEventListener('keydown', e => {
  if (e.code === 'Space' || e.code.startsWith('Arrow') || e.code === 'Escape' || e.code === 'Backspace' || e.code === 'Tab') e.preventDefault();
  if (e.key && e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) digitado += e.key;
  if (!teclas[e.code]) apertou[e.code] = true;
  teclas[e.code] = true;
  iniciarAudio();
});
window.addEventListener('keyup', e => { teclas[e.code] = false; });
window.addEventListener('blur', () => { for (const k in teclas) teclas[k] = false; });
canvas.addEventListener('mousemove', e => {
  const r = canvas.getBoundingClientRect();
  mouse.x = (e.clientX - r.left) * LARG / r.width;
  mouse.y = (e.clientY - r.top) * ALT / r.height;
  mouse.moveu = true;
});
canvas.addEventListener('mousedown', e => {
  const r = canvas.getBoundingClientRect();
  mouse.x = (e.clientX - r.left) * LARG / r.width;
  mouse.y = (e.clientY - r.top) * ALT / r.height;
  mouse.clique = true; iniciarAudio();
});
/* ---------- controle / joystick (Gamepad API): vira "teclas" virtuais ---------- */
const padAtivo = {};
function lerControle() {
  let pads = [];
  try { pads = (navigator.getGamepads && navigator.getGamepads()) || []; } catch (e) {}
  const p = Array.from(pads).find(g => g && g.connected);
  const agora = {};
  if (p) {
    const b = i => !!(p.buttons[i] && p.buttons[i].pressed), ax = p.axes[0] || 0, ay = p.axes[1] || 0;
    const mapa = {
      ArrowLeft: b(14) || ax < -0.45, ArrowRight: b(15) || ax > 0.45, ArrowUp: b(12) || ay < -0.6, ArrowDown: b(13) || ay > 0.6,
      Space: b(0), Enter: b(0), KeyJ: b(2), KeyE: b(3), KeyK: b(1), KeyR: b(4), KeyQ: b(5), Escape: b(9), KeyH: b(8)
    };
    for (const c in mapa) agora[c] = mapa[c];
    if (Object.values(agora).some(Boolean)) iniciarAudio();
  }
  for (const c in padAtivo) if (padAtivo[c] && !agora[c]) { padAtivo[c] = false; teclas[c] = false; }
  for (const c in agora) if (agora[c] && !padAtivo[c]) { padAtivo[c] = true; if (!teclas[c]) apertou[c] = true; teclas[c] = true; }
}
const seg = (...cs) => cs.some(c => teclas[c]);        // tecla segurada
const press = (...cs) => cs.some(c => apertou[c]);     // tecla apertada neste quadro
const noRet = (x, y, w, h) => mouse.x >= x && mouse.x <= x + w && mouse.y >= y && mouse.y <= y + h;

/* ---------- áudio simples (opcional, falha em silêncio) ---------- */
let actx = null;
function iniciarAudio() {
  try {
    if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)();
    if (actx.state === 'suspended') actx.resume();
    montarBarramentos();
  } catch (e) {}
}
let volMul = 1;   // volume relativo do som atual (usado para sons por distância)
/* Rajada de ruído filtrado: explosões, serra, crepitar do fogo */
function ruido(dur, vol = 0.05, freq = 1200, tipo = 'lowpass', desliza = 0) {
  try {
    if (!actx) return;
    const t0 = actx.currentTime, n = Math.floor(actx.sampleRate * dur);
    const buf = actx.createBuffer(1, n, actx.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    const src = actx.createBufferSource(); src.buffer = buf;
    const f = actx.createBiquadFilter(); f.type = tipo; f.frequency.setValueAtTime(freq, t0);
    if (desliza) f.frequency.linearRampToValueAtTime(Math.max(60, freq + desliza), t0 + dur);
    const g = actx.createGain(); g.gain.setValueAtTime(Math.max(0.0002, vol * volMul), t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(f); f.connect(g); g.connect(sfxBus || actx.destination); src.start(t0);
  } catch (e) {}
}
function bip(freq, dur, tipo = 'square', vol = 0.04, desliza = 0) {
  try {
    if (!actx) return;
    const o = actx.createOscillator(), g = actx.createGain(), t0 = actx.currentTime;
    o.type = tipo; o.frequency.setValueAtTime(freq, t0);
    if (desliza) o.frequency.linearRampToValueAtTime(Math.max(40, freq + desliza), t0 + dur);
    g.gain.setValueAtTime(Math.max(0.0002, vol * volMul), t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(sfxBus || actx.destination);
    o.start(t0); o.stop(t0 + dur);
  } catch (e) {}
}
let contMoeda = 0, ultMoeda = 0;
const SONS = {
  menu: () => bip(440, 0.05), ok: () => { bip(520, 0.08); setTimeout(() => bip(780, 0.1), 70); },
  pulo: () => bip(280, 0.14, 'square', 0.035, 320), coleta: () => { bip(880, 0.07); setTimeout(() => bip(1320, 0.1), 60); },
  dano: () => { bip(180, 0.25, 'sawtooth', 0.06, -120); ruido(0.18, 0.05, 1800, 'lowpass', -1200); }, tiro: () => bip(600, 0.12, 'triangle', 0.05, -300),
  soco: () => bip(160, 0.08, 'square', 0.05, -60), apagar: () => bip(400, 0.3, 'sawtooth', 0.04, -250),
  montar: () => { [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => bip(f, 0.12, 'square', 0.045), i * 90)); },
  erro: () => bip(120, 0.2, 'square', 0.05), vitoria: () => { [523, 659, 784, 1047, 1319].forEach((f, i) => setTimeout(() => bip(f, 0.18, 'square', 0.05), i * 120)); },
  inimigo: () => { bip(220, 0.15, 'sawtooth', 0.05, -100); ruido(0.1, 0.04, 2500); },
  curar: () => { [659, 784, 988, 1319].forEach((f, i) => setTimeout(() => bip(f, 0.12, 'triangle', 0.06), i * 70)); },
  explodir: () => { ruido(0.4, 0.09, 1100, 'lowpass', -900); bip(130, 0.3, 'sawtooth', 0.06, -90); },
  serra: () => { bip(110, 0.25, 'sawtooth', 0.045, 70); bip(114, 0.25, 'sawtooth', 0.03, 70); ruido(0.2, 0.03, 3000, 'highpass'); },
  motor: () => { bip(70, 0.22, 'sawtooth', 0.03, 12); ruido(0.14, 0.02, 600, 'lowpass'); },
  crepitar: () => ruido(0.16, 0.03, 4200, 'highpass'),
  rugido: () => { bip(95, 1.1, 'sawtooth', 0.09, -55); bip(62, 1.1, 'square', 0.05, -25); ruido(1.0, 0.07, 600, 'lowpass', -400); },
  bolha: () => bip(700, 0.08, 'sine', 0.035, 320),
  gosma: () => { bip(170, 0.12, 'sine', 0.06, 90); bip(130, 0.1, 'sine', 0.04, 40); },
  carga: () => bip(220, 0.8, 'sawtooth', 0.035, 700),
  raio: () => { ruido(0.5, 0.07, 3500, 'highpass'); bip(180, 0.5, 'sawtooth', 0.06, -100); },
  impacto: () => { ruido(0.5, 0.1, 300, 'lowpass'); bip(60, 0.4, 'square', 0.08, -30); },
  bolafogo: () => { bip(480, 0.25, 'sawtooth', 0.05, -340); ruido(0.2, 0.04, 2000, 'lowpass'); },
  metal: () => { bip(900, 0.07, 'square', 0.04, -500); bip(450, 0.1, 'triangle', 0.04, -100); },
  escudo: () => { bip(1100, 0.1, 'triangle', 0.05, -300); bip(1500, 0.08, 'sine', 0.03); },
  tosse: () => { bip(150, 0.07, 'square', 0.035, -20); setTimeout(() => bip(140, 0.07, 'square', 0.035, -20), 90); },
  splash: () => ruido(0.35, 0.08, 1800, 'lowpass', -1400),
  buzina: () => { bip(330, 0.35, 'square', 0.06); bip(415, 0.35, 'square', 0.05); },
  poder: () => { bip(300, 0.4, 'sawtooth', 0.05, 900); bip(450, 0.4, 'square', 0.03, 900); ruido(0.35, 0.05, 2500, 'highpass'); setTimeout(() => bip(1200, 0.2, 'triangle', 0.05), 250); },
  objetivo: () => { [523, 659, 784, 1047, 1319, 1568].forEach((f, i) => setTimeout(() => bip(f, 0.14, 'triangle', 0.055), i * 70)); },
  passo: () => ruido(0.035, 0.02, 1100, 'lowpass'),
  pouso: () => { ruido(0.08, 0.04, 600, 'lowpass'); bip(95, 0.08, 'sine', 0.05, -30); },
  moeda: () => { const t = Date.now(); if (t - ultMoeda > 1500) contMoeda = 0; ultMoeda = t; const f = [784, 880, 988, 1175, 1319][contMoeda++ % 5]; bip(f, 0.07, 'square', 0.045); setTimeout(() => bip(f * 1.5, 0.09, 'square', 0.035), 55); },
  conquista: () => { [392, 523, 659, 784, 1047, 1319].forEach((f, i) => setTimeout(() => bip(f, 0.2, 'square', 0.05), i * 110)); setTimeout(() => ruido(0.4, 0.05, 6000, 'highpass'), 600); },
  licao: () => { bip(880, 0.08, 'triangle', 0.04); setTimeout(() => bip(1175, 0.12, 'triangle', 0.04), 80); }
};
const som = (n, v = 1) => { volMul = v; try { SONS[n] && SONS[n](); } catch (e) {} volMul = 1; };

/* ---------- progresso salvo (localStorage com try/catch) ---------- */
const CHAVE_SAVE = 'guardiao_clima_v1';
const salvoPadrao = () => ({ liberadas: 1, armas: {}, concluidas: {} });
let salvo = salvoPadrao();
const chaveSave = CHAVE_SAVE;
function carregarProgresso() {
  salvo = salvoPadrao();
  try {
    const s = chaveSave && localStorage.getItem(chaveSave);
    if (s) { const o = JSON.parse(s); if (o && typeof o === 'object') salvo = Object.assign(salvo, o); }
  } catch (e) {}
}
function salvarProgresso() { try { localStorage.setItem(chaveSave, JSON.stringify(salvo)); } catch (e) {} }
carregarProgresso();
