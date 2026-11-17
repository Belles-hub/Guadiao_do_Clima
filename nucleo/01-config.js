'use strict';
/* =====================================================================
   GUARDIÃO DO CLIMA — jogo de plataforma 2D educativo (ODS 13 e ODS 12)
   Tudo desenhado por código. Sem imagens externas.
   ===================================================================== */

/* =====================================================================
   1. CONFIGURAÇÃO
   ===================================================================== */
const LARG = 384, ALT = 216;      // resolução interna 16:9 (ampliada 3x em 1152x648)
const TAM = 16;                   // tamanho do tile em pixels
const FONTE = '"Press Start 2P", monospace';

const GRAV = 900;                 // gravidade (px/s²)
const VEL_MAX = 96;               // velocidade máxima de corrida
const ACEL = 650, ACEL_AR = 420, DESACEL = 800, DESACEL_AR = 260;
const FORCA_PULO = 335;           // impulso do pulo
const TEMPO_COYOTE = 0.16;        // tolerância para pular depois de sair da borda
const TEMPO_BUFFER = 0.2;         // tolerância para apertar pulo antes de tocar o chão
const VEL_QUEDA_MAX = 360;
const DANO_FASE = [1, 1, 2, 2, 2, 3];   // corações perdidos por golpe em cada fase (a 6 bate MUITO forte)
const CUSTO_ARMADURA = 12;          // pontos de armadura gastos por coração de dano absorvido
const TEMPO_INVUL = 1.6;          // invencibilidade após dano
const VIDAS_MAX = 5;

const canvas = document.getElementById('tela');
const ctx = canvas.getContext('2d');
const ESC_TELA = 3;                // o canvas tem 3x a resolução lógica: sprites ficam detalhados, o resto continua em pixels de 384x216
canvas.width = LARG * ESC_TELA; canvas.height = ALT * ESC_TELA;
ctx.imageSmoothingEnabled = false;

/* Adapta ao tamanho da janela mantendo 16:9 */
function ajustarJanela() {
  const w = window.innerWidth, h = window.innerHeight;
  let cw = w, ch = w * 9 / 16;
  if (ch > h) { ch = h; cw = h * 16 / 9; }
  canvas.style.width = Math.floor(cw) + 'px';
  canvas.style.height = Math.floor(ch) + 'px';
}
window.addEventListener('resize', ajustarJanela);
ajustarJanela();
try { document.fonts.load('8px "Press Start 2P"'); document.fonts.load('16px "Press Start 2P"'); } catch (e) {}

/* ---------- utilidades ---------- */
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const aprox = (v, alvo, d) => v < alvo ? Math.min(v + d, alvo) : Math.max(v - d, alvo);
const rnd = (a, b) => a + Math.random() * (b - a);
const sinal = v => v < 0 ? -1 : 1;
function hex(c) {
  if (c[0] === 'r') return c.match(/\d+/g).slice(0, 3).map(Number);   // aceita também 'rgb(r,g,b)'
  return [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)]; }
function misturar(a, b, t) {
  const A = hex(a), B = hex(b);
  return 'rgb(' + A.map((v, i) => Math.round(lerp(v, B[i], t))).join(',') + ')';
}
function escurecer(c, f) {
  const A = hex(c);
  return 'rgb(' + A.map(v => clamp(Math.round(v * f), 0, 255)).join(',') + ')';
}
function colide(a, b) { return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y; }
function hash(n) { n = (n ^ 61) ^ (n >>> 16); n = (n + (n << 3)) | 0; n ^= n >>> 4; n = Math.imul(n, 0x27d4eb2d); n ^= n >>> 15; return n >>> 0; }
function gerador(semente) { let s = semente >>> 0; return () => (s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296; }

/* ---------- desenho básico ---------- */
function ret(c, x, y, w, h) { ctx.fillStyle = c; ctx.fillRect(Math.round(x), Math.round(y), w, h); }
/* Tamanho de fonte que faz o texto caber em maxW (nunca aumenta; mínimo 5) */
function tamCabe(str, tam, maxW) {
  if (str.length * tam <= maxW) return tam;
  ctx.font = tam + 'px ' + FONTE; const w = ctx.measureText(str).width;
  return w <= maxW ? tam : Math.max(5, Math.floor(tam * maxW / w * 2) / 2);
}
function texto(str, x, y, cor = '#fff', tam = 8, alinha = 'left', sombra = true, maxW = 0) {
  if (!maxW) {                                  // sem limite dado: ao menos não sai da tela
    const lado = alinha === 'center' ? Math.min(x, LARG - x) * 2 - 4 : (alinha === 'right' ? x - 2 : LARG - 2 - x);
    maxW = Math.max(20, lado);
  }
  tam = tamCabe(str, tam, maxW);
  ctx.font = tam + 'px ' + FONTE;
  ctx.textBaseline = 'top';
  ctx.textAlign = alinha;
  x = Math.round(x); y = Math.round(y);
  if (sombra) { ctx.fillStyle = 'rgba(0,0,0,0.75)'; ctx.fillText(str, x + 1, y + 1); }
  ctx.fillStyle = cor;
  ctx.fillText(str, x, y);
}
/* Quebra um texto em linhas que caibam em larguraMax; retorna o número de linhas */
function textoQuebrado(str, x, y, larguraMax, cor = '#fff', alturaLinha = 12, tam = 8) {
  ctx.font = tam + 'px ' + FONTE;
  const palavras = str.split(' ');
  let linha = '', n = 0;
  for (const p of palavras) {
    const teste = linha ? linha + ' ' + p : p;
    if (ctx.measureText(teste).width > larguraMax && linha) {
      texto(linha, x, y + n * alturaLinha, cor, tam); n++; linha = p;
    } else linha = teste;
  }
  if (linha) { texto(linha, x, y + n * alturaLinha, cor, tam); n++; }
  return n;
}
/* retângulo com cantos cortados (estilo pixel arredondado) */
function cantos(c, x, y, w, h) { ctx.fillStyle = c; ctx.fillRect(x + 1, y, w - 2, h); ctx.fillRect(x, y + 1, w, h - 2); }
/* cápsula translúcida usada no HUD */
function pilula(x, y, w, h, fundo = 'rgba(16,24,52,0.6)', borda = 'rgba(255,255,255,0.22)') {
  x = Math.round(x); y = Math.round(y);
  ctx.save();
  rrect(x, y, w, h, 3); ctx.fillStyle = borda; ctx.fill();
  rrect(x + 1, y + 1, w - 2, h - 2, 2.4); ctx.fillStyle = fundo; ctx.fill();
  const g = ctx.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, 'rgba(255,255,255,0.14)'); g.addColorStop(0.5, 'rgba(255,255,255,0)');
  rrect(x + 1, y + 1, w - 2, h - 2, 2.4); ctx.fillStyle = g; ctx.fill();
  ctx.restore();
}
function painel(x, y, w, h, fundo = '#1b2238', borda = '#e8d9a0') {
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.35)'; rrect(x + 1, y + 3, w, h, 5); ctx.fill();                 // sombra
  rrect(x - 1, y - 1, w + 2, h + 2, 5); ctx.fillStyle = '#05060c'; ctx.fill();
  rrect(x, y, w, h, 4.5); ctx.fillStyle = degrade(x, y, h, misturar(borda, '#ffffff', 0.35), misturar(borda, '#000000', 0.35)); ctx.fill();
  rrect(x + 2, y + 2, w - 4, h - 4, 3); ctx.fillStyle = degrade(x, y + 2, h - 4, misturar(fundo, '#ffffff', 0.12), misturar(fundo, '#000000', 0.25)); ctx.fill();
  rrect(x + 2.5, y + 2.5, w - 5, h - 5, 2.8); ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth = 0.6; ctx.stroke();
  ctx.fillStyle = misturar(borda, '#ffffff', 0.5);                                              // pinos nos cantos
  [[x + 4, y + 4], [x + w - 4, y + 4], [x + 4, y + h - 4], [x + w - 4, y + h - 4]].forEach(([px, py]) => { ctx.beginPath(); ctx.arc(px, py, 0.9, 0, 7); ctx.fill(); });
  ctx.restore();
}
/* título com letras coloridas que dançam */
function tituloAnimado(txt, cx, y, tam, t) {
  const cores = ['#ffd84f', '#ff7aa8', '#7fe07a', '#6ad0ff', '#ffb02a'], x0 = cx - txt.length * tam / 2;
  for (let i = 0; i < txt.length; i++) {
    if (txt[i] === ' ') continue;
    const dy = Math.round(Math.sin(t * 3 + i * 0.7) * 2), x = x0 + i * tam;
    [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [1, 1]].forEach(([ox, oy]) => texto(txt[i], x + ox, y + dy + oy, '#1a0e2a', tam, 'left', false));
    texto(txt[i], x, y + dy + 2, 'rgba(0,0,0,0.45)', tam, 'left', false);
    texto(txt[i], x, y + dy, cores[(i + Math.floor(t * 2)) % cores.length], tam, 'left', false);
  }
}
