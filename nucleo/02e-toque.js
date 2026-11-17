'use strict';
/* =====================================================================
   2e. CONTROLES POR TOQUE (celular e tablet)
   - Botões na tela viram "teclas virtuais" (as mesmas do teclado), então o jogo não precisa saber a diferença.
   - Toque no canvas vira clique do mouse: menus, mapa de fases, quiz e oficina funcionam tocando direto.
   - A barra de direção aceita deslizar o dedo; vários botões funcionam ao mesmo tempo (andar + pular + atacar).
   Os botões só aparecem em celulares e tablets (tela de toque como dispositivo principal). Em computador e notebook, mesmo com tela de toque, nada muda.
   ===================================================================== */
const toque = { ativo: false, raiz: null, modo: '' };

/* Aperta ou solta uma tecla como se fosse o teclado */
function teclaVirtual(code, ativo) {
  if (ativo) { if (!teclas[code]) apertou[code] = true; teclas[code] = true; iniciarAudio(); }
  else teclas[code] = false;
}

const CSS_TOQUE = `
html, body { touch-action: none; overscroll-behavior: none; -webkit-user-select: none; user-select: none; -webkit-touch-callout: none; -webkit-tap-highlight-color: transparent; }
#toque { position: fixed; inset: 0; z-index: 50; pointer-events: none; display: none; --b: clamp(46px, 17vh, 92px); --m: max(3vw, env(safe-area-inset-left, 0px)); --d: max(3vw, env(safe-area-inset-right, 0px)); font-family: "Press Start 2P", monospace; }
body.toque-on #toque { display: block; }
#toque .tb { position: absolute; pointer-events: auto; touch-action: none; display: none; align-items: center; justify-content: center; flex-direction: column; box-sizing: border-box;
  border-radius: 50%; background: rgba(20, 28, 56, .5); border: 2px solid rgba(255, 255, 255, .55); color: #fff; font-size: calc(var(--b) * .17); text-align: center; line-height: 1.25;
  text-shadow: 0 1px 0 #000; user-select: none; -webkit-user-select: none; cursor: pointer; }
#toque .tb.on { background: rgba(255, 200, 60, .7); border-color: #ffd84f; color: #1a1a1a; text-shadow: none; }
#toque .tb b { font-size: 1.5em; font-weight: normal; }
#toque .tb small { font-size: .5em; opacity: .95; }
#toque .pular b { font-size: 1.05em; }
#toque .pill { border-radius: 999px; }
#toque[data-modo~="jogo"] .g-jogo, #toque[data-modo~="menu"] .g-menu, #toque[data-modo~="fs"] .g-fs, #toque[data-modo~="craft"] .g-craft, #toque[data-modo~="fasesr"] .g-fasesr { display: flex; }
#toque[data-modo~="craft"] .dpad { display: none; }
#toque .dpad { left: var(--m); bottom: 5vh; width: calc(var(--b) * 2.8); height: calc(var(--b) * 1.25); border-radius: calc(var(--b) * .65); flex-direction: row; justify-content: space-between; padding: 0 calc(var(--b) * .3); font-size: calc(var(--b) * .55); }
#toque .dpad span { opacity: .6; } #toque .dpad span.on { opacity: 1; color: #ffd84f; }
#toque .pular { right: var(--d); bottom: 5vh; width: calc(var(--b) * 1.3); height: calc(var(--b) * 1.3); }
#toque .atacar { right: calc(var(--d) + var(--b) * 1.45); bottom: 5vh; width: calc(var(--b) * 1.1); height: calc(var(--b) * 1.1); }
#toque .peq { width: calc(var(--b) * .85); height: calc(var(--b) * .85); bottom: calc(5vh + var(--b) * 1.45); }
#toque .bE { right: var(--d); } #toque .bQ { right: calc(var(--d) + var(--b) * .95); } #toque .bR { right: calc(var(--d) + var(--b) * 1.9); } #toque .bK { right: calc(var(--d) + var(--b) * 2.85); }
#toque .topo { top: 3vh; width: calc(var(--b) * .6); height: calc(var(--b) * .6); font-size: calc(var(--b) * .3); }
#toque .bP { right: var(--d); } #toque .bH { right: calc(var(--d) + var(--b) * .75); } #toque .bFs { right: var(--d); }
#toque .bVoltar { left: var(--m); top: 3vh; width: calc(var(--b) * 1.7); height: calc(var(--b) * .6); }
#toque .bOk { right: var(--d); bottom: 5vh; width: calc(var(--b) * 1.2); height: calc(var(--b) * .7); }
#toque .bFasesR { left: var(--m); bottom: 5vh; width: calc(var(--b) * 2.3); height: calc(var(--b) * .7); }
#toque .bCima { left: var(--m); bottom: calc(5vh + var(--b) * 1.05); width: calc(var(--b) * .9); height: calc(var(--b) * .9); border-radius: 22%; font-size: calc(var(--b) * .45); }
#toque .bBaixo { left: var(--m); bottom: 5vh; width: calc(var(--b) * .9); height: calc(var(--b) * .9); border-radius: 22%; font-size: calc(var(--b) * .45); }
#girar { position: fixed; inset: 0; z-index: 100; display: none; align-items: center; justify-content: center; flex-direction: column; gap: 18px; background: #080b14; color: #ffd84f; font: 12px/1.8 "Press Start 2P", monospace; text-align: center; padding: 24px; }
#girar i { font-style: normal; font-size: 48px; display: block; animation: gira 1.6s ease-in-out infinite; }
@keyframes gira { 0%, 20% { transform: rotate(0); } 60%, 100% { transform: rotate(-90deg); } }
@media (orientation: portrait) { body.toque-on #girar { display: flex; } }
`;

function criarToque() {
  const st = document.createElement('style'); st.textContent = CSS_TOQUE; document.head.appendChild(st);
  const raiz = document.createElement('div'); raiz.id = 'toque'; document.body.appendChild(raiz); toque.raiz = raiz;
  const girar = document.createElement('div'); girar.id = 'girar'; girar.innerHTML = '<i>📱</i>GIRE O CELULAR<br>PARA JOGAR'; document.body.appendChild(girar);

  /* Botão comum: segura a tecla enquanto houver algum dedo sobre ele */
  const botao = (cls, html, code, extra = '') => {
    const el = document.createElement('div'); el.className = 'tb ' + cls + ' ' + extra; el.innerHTML = html;
    const dedos = new Set();
    const soltar = e => { dedos.delete(e.pointerId); if (!dedos.size) { teclaVirtual(code, false); el.classList.remove('on'); } };
    el.addEventListener('pointerdown', e => {
      e.preventDefault();
      try { el.setPointerCapture(e.pointerId); } catch (x) {}
      dedos.add(e.pointerId); if (dedos.size === 1) { teclaVirtual(code, true); el.classList.add('on'); }
    });
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(n => el.addEventListener(n, soltar));
    raiz.appendChild(el); return el;
  };

  /* Direção: uma barra só; o dedo pode deslizar de um lado ao outro sem soltar */
  const dir = document.createElement('div'); dir.className = 'tb dpad g-jogo'; dir.innerHTML = '<span>◀</span><span>▶</span>';
  const [setaE, setaD] = dir.children; let dedoDir = null;
  const lerDir = e => {
    const r = dir.getBoundingClientRect(), u = (e.clientX - r.left) / r.width;
    const esq = u < 0.46, dire = u > 0.54;
    teclaVirtual('ArrowLeft', esq); teclaVirtual('ArrowRight', dire);
    setaE.classList.toggle('on', esq); setaD.classList.toggle('on', dire);
  };
  const fimDir = e => {
    if (e.pointerId !== dedoDir) return; dedoDir = null;
    teclaVirtual('ArrowLeft', false); teclaVirtual('ArrowRight', false); setaE.classList.remove('on'); setaD.classList.remove('on');
  };
  dir.addEventListener('pointerdown', e => { e.preventDefault(); try { dir.setPointerCapture(e.pointerId); } catch (x) {} dedoDir = e.pointerId; lerDir(e); });
  dir.addEventListener('pointermove', e => { if (e.pointerId === dedoDir) lerDir(e); });
  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(n => dir.addEventListener(n, fimDir));
  raiz.appendChild(dir);

  botao('pular g-jogo', '<b>PULAR</b>', 'Space');
  botao('atacar g-jogo', '<b>J</b><small>ATACAR</small>', 'KeyJ');
  botao('peq bE g-jogo', '<b>E</b><small>COLETA</small>', 'KeyE');
  botao('peq bQ g-jogo', '<b>Q</b><small>PODER</small>', 'KeyQ');
  botao('peq bR g-jogo', '<b>R</b><small>TROCA</small>', 'KeyR');
  botao('peq bK g-jogo', '<b>K</b><small>ARMA</small>', 'KeyK');
  botao('topo bP g-jogo', '❚❚', 'Escape');
  botao('topo bH g-jogo', '?', 'KeyH');
  botao('bCima g-craft', '▲', 'ArrowUp');
  botao('bBaixo g-craft', '▼', 'ArrowDown');
  botao('pill bVoltar g-menu', '◀ VOLTAR', 'Escape');
  botao('pill bOk g-menu', 'OK', 'Enter');
  botao('pill bFasesR g-fasesr', 'R RECOMEÇAR', 'KeyR');
  const fs = botao('topo bFs g-fs', '⛶', 'F13'); fs.addEventListener('pointerup', alternarTelaCheia);
}

function alternarTelaCheia() {
  try {
    const d = document, el = d.documentElement;
    if (!d.fullscreenElement && !d.webkitFullscreenElement) {
      const p = (el.requestFullscreen || el.webkitRequestFullscreen).call(el);
      if (p && p.then) p.then(() => { try { screen.orientation.lock('landscape').catch(() => {}); } catch (e) {} }).catch(() => {});
    } else (d.exitFullscreen || d.webkitExitFullscreen).call(d);
  } catch (e) {}
}

function ativarToque() {
  if (toque.ativo) return;
  toque.ativo = true;
  if (!toque.raiz) criarToque();
  document.body.classList.add('toque-on');
  ajustarJanela();
}

/* Quais botões aparecem em cada tela */
function modoToque() {
  if (estado === 'jogo') return craftAberto && !ajudaAberta ? 'jogo craft' : 'jogo';
  if (estado === 'menu') return 'fs';
  const r = (estado === 'fases' && typeof checkpointDaFase === 'function' && checkpointDaFase(faseSel) && faseSel < salvo.liberadas) ? ' fasesr' : '';
  return 'menu fs' + r;
}
/* Chamado a cada quadro (19-loop.js): só mexe no DOM quando a tela muda */
function atualizarToque() {
  if (!toque.ativo) return;
  const m = modoToque();
  if (m !== toque.modo) {
    toque.modo = m; toque.raiz.dataset.modo = m;
    if (!m.includes('jogo')) for (const k of ['Space', 'KeyJ', 'KeyE', 'KeyQ', 'KeyR', 'KeyK', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown']) if (!padAtivo[k]) teclas[k] = false;   // nada fica "preso" ao trocar de tela
  }
}

/* ---------- toque direto no canvas = mouse (menus, mapa, quiz, oficina) ---------- */
function posToque(t) {
  const r = canvas.getBoundingClientRect();
  mouse.x = (t.clientX - r.left) * LARG / r.width; mouse.y = (t.clientY - r.top) * ALT / r.height;
}
canvas.addEventListener('touchstart', e => { e.preventDefault(); posToque(e.changedTouches[0]); mouse.moveu = true; mouse.clique = true; iniciarAudio(); }, { passive: false });
canvas.addEventListener('touchmove', e => { e.preventDefault(); posToque(e.changedTouches[0]); mouse.moveu = true; }, { passive: false });
canvas.addEventListener('touchend', e => { e.preventDefault(); }, { passive: false });
window.addEventListener('contextmenu', e => { if (toque.ativo) e.preventDefault(); });

/* Celular e tablet: o toque é o controle principal (pointer grosso e sem hover). Computador não entra, nem com tela de toque. */
const eCelularOuTablet = () => {
  try {
    const tela = window.matchMedia('(pointer: coarse)').matches && window.matchMedia('(hover: none)').matches && navigator.maxTouchPoints > 0;
    const ua = navigator.userAgent || '';
    const movel = /Android|iPhone|iPad|iPod|Mobi|Tablet|Silk|Kindle/i.test(ua)                    // celular e tablet pelo sistema
      || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);                                   // iPad que se apresenta como Mac
    return tela || movel;
  } catch (e) { return false; }
};
if (eCelularOuTablet()) { if (document.readyState === 'loading') window.addEventListener('DOMContentLoaded', ativarToque); else ativarToque(); }
