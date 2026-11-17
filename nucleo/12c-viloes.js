'use strict';
/* =====================================================================
   12c. SUBGUARDIÕES DA POLUIÇÃO (vilões das fases 1 a 5)
   Cada fase define o seu em fases/faseN/vilao.js: VILOES.tipo = { nome, w, h, hp, fraqueza, atualizar, desenhar }.
   O vilão fica adormecido no mapa (caractere V) até Davi se aproximar. A bandeira só abre depois de derrotá-lo.
   Dano: soco 1, pedalada 2, martelo 3, semente 1, bolha 1, pisão 2, escudo refletindo 2.
   A arma da "fraqueza" do vilão causa o DOBRO de dano.
   ===================================================================== */
const VILOES = {};
let vilao = null;

function criarVilao(tipo, tx, ty) {
  const d = VILOES[tipo];
  const x = tx * TAM + 8 - d.w / 2, y = (ty + 1) * TAM - d.h;
  vilao = {
    tipo, d, w: d.w, h: d.h, x, y, baseX: x, baseY: y, vx: 0, vy: 0, hp: d.hp, hpMax: d.hp,
    ativo: false, morto: false, t: 0, estado: 'espera', tt: 0, dir: -1, inv: 0, flash: 0, shake: 0, ataque: 0, n: 0, range: d.range || 60
  };
  if (d.iniciar) d.iniciar(vilao);
}
const retVilao = () => ({ x: vilao.x, y: vilao.y, w: vilao.w, h: vilao.h });
const chaoTyVilao = v => Math.floor((v.baseY + v.h) / TAM) - 1;       // linha de tiles onde o vilão pisa

function machucarVilao(dano, fonte) {
  const v = vilao;
  if (!v || !v.ativo || v.morto || v.inv > 0 || v.estado === 'intro') return false;
  const forte = fonte && v.d.fraqueza === fonte;
  if (forte) dano *= 2;
  v.hp -= dano; v.inv = 0.45; v.flash = 0.2; v.shake = 0.2;
  emitir('fagulha', v.x + v.w / 2, v.y + v.h / 2, 10, forte ? '#ffd84f' : null); som(forte ? 'explodir' : 'metal');
  if (forte && !L.avisouFraqueza) { L.avisouFraqueza = true; toast('Ponto fraco! ' + ARMAS.find(a => a.id === v.d.fraqueza).nome + ' machuca mais!', 2.6); }
  if (v.d.aoSofrer) v.d.aoSofrer(v, dano);
  if (v.hp <= 0) derrotarVilao();
  return true;
}
function derrotarVilao() {
  const v = vilao;
  v.morto = true; v.hp = 0; v.tt = 0; L.vilaoDerrotado = true;
  projeteis = projeteis.filter(p => !p.vilao);
  inimigos.forEach(e => { if (e.doVilao) e.vivo = false; });
  for (let i = 0; i < 2; i++) itens.push({ x: v.x + v.w / 2 + (i ? 14 : -14), y: v.y + v.h / 2, tipo: 'vida', t: 0, pego: false, expira: 30 });
  som('vitoria'); toast(v.d.curto + ' foi derrotado!', 3); confete(v.x + v.w / 2, v.y, 70);
  L.poderPend = L.idx; L.poderT = 1.8;                               // o poder do vilão é concedido depois da explosão
  dispararLicao('vilao');
}
/* Atira um projétil do vilão (tratado em atualizarHostis) */
function atirarVilao(tipo, props) {
  projeteis.push(Object.assign({ vilao: true, tipo, vida: 6, vx: 0, vy: 0, g: 0, t: 0 }, props));
}
/* Cria inimigos comuns durante a luta (somem quando o vilão cai) */
function invocarDoVilao(tipo, x) {
  if (inimigos.filter(e => e.vivo && e.doVilao).length >= 4) return;
  const v = vilao, e = criarInimigo(tipo, Math.floor(x / TAM), chaoTyVilao(v));
  e.doVilao = true; e.semMult = true;
  emitir('fumaca', e.x + 6, e.y + 6, 8, '#ff3aa0'); emitir('brilho', e.x + 6, e.y + 6, 10, '#ff3aa0');
}

function atualizarVilao(dt) {
  const v = vilao; if (!v) return;
  v.t += dt; v.inv -= dt; v.flash -= dt; v.shake -= dt;
  if (v.morto) {                                   // explosões enquanto some
    v.tt += dt;
    if (v.tt < 2.2 && Math.random() < dt * 30) emitir('fagulha', v.x + rnd(0, v.w), v.y + rnd(0, v.h), 2, ['#ffd84f', '#ff7a1a', '#fff'][Math.floor(Math.random() * 3)]);
    if (v.tt < 2.2 && Math.random() < dt * 8) { emitir('fumaca', v.x + rnd(0, v.w), v.y + rnd(0, v.h), 1); som('explodir', 0.5); }
    return;
  }
  if (!v.ativo) {                                  // acorda quando Davi chega perto
    if (Math.abs(J.x - (v.x + v.w / 2)) < 200 && Math.abs(J.y - v.y) < 150) {
      v.ativo = true; v.estado = 'intro'; v.tt = 1.8; v.shake = 1.2;
      toast(v.d.nome, 3); som('rugido'); dispararLicao('vilao_vem');
    }
    return;
  }
  if (v.estado === 'intro') { v.tt -= dt; if (v.tt <= 0) { v.estado = 'descanso'; v.tt = 0.9; } return; }
  v.d.atualizar(v, dt * difVel());                     // ataques mais lentos = mais tempo para reagir
  // contato: pisão machuca o vilão; pelo lado, machuca Davi
  const r = { x: v.x + 4, y: v.y + 4, w: v.w - 8, h: v.h - 6 };
  if (colide(r, J)) {
    if (v.d.pisavel !== false && J.vy > 40 && (J.y + J.h) - v.y < 12) {
      machucarVilao(2, 'pisao');                                                  // pisão sempre quica, mesmo se o vilão estiver invulnerável
      J.vy = -240; J.noChao = false; J.pulosUsados = 0; som('pulo');
      J.y = Math.min(J.y, v.y - J.h + 2); J.invul = Math.max(J.invul, 0.25);     // sai de cima do vilão para não levar dano
    } else danificarJogador(v.x + v.w / 2);
  }
}
/* Projéteis hostis do vilão */
function atualizarHostis(dt) {
  dt *= 0.95 + 0.08 * difFase();
  for (const p of projeteis) {
    if (!p.vilao) continue;
    p.vida -= dt; p.t += dt;
    const caixa = { x: p.x - 6, y: p.y - 5, w: 12, h: 10 };
    if (p.tipo === 'tora') {                       // tora rolando no chão: pule por cima!
      p.x += p.vx * dt;
      if (eSolido(tile(Math.floor((p.x + (p.vx > 0 ? 8 : -8)) / TAM), Math.floor(p.y / TAM)))) { p.vida = 0; emitir('poeira', p.x, p.y, 4); }
      if (Math.random() < dt * 20) emitir('poeira', p.x, p.y + 5, 1);
      if (colide(caixa, J)) { danificarJogador(p.x); }
    } else if (p.tipo === 'lixoarc') {             // lixo arremessado em arco
      p.vy += 320 * dt; p.x += p.vx * dt; p.y += p.vy * dt;
      if (colide(caixa, J)) { danificarJogador(p.x); p.vida = 0; emitir('fumaca', p.x, p.y, 4, '#8ac84a'); }
      else if (eSolido(tile(Math.floor(p.x / TAM), Math.floor(p.y / TAM)))) { p.vida = 0; emitir('fumaca', p.x, p.y, 4, '#8ac84a'); emitir('poeira', p.x, p.y, 4); }
    } else if (p.tipo === 'sacola') {              // sacola plástica: vai reto na direção onde Davi estava
      p.x += p.vx * dt; p.y += p.vy * dt;                  // segue em linha reta (não persegue)
      if (colide(caixa, J)) { danificarJogador(p.x); p.vida = 0; emitir('bolha', p.x, p.y, 6, '#fff'); }
    } else if (p.tipo === 'pedra') {               // pedra de carvão: aviso no chão e depois cai
      if (p.aviso > 0) p.aviso -= dt;
      else {
        p.vy += 520 * dt; p.y += p.vy * dt;
        if (colide({ x: p.x - 7, y: p.y - 7, w: 14, h: 14 }, J)) { danificarJogador(p.x); p.vida = 0; emitir('fagulha', p.x, p.y, 8); }
        else if (p.y > p.chao - 6) { p.vida = 0; emitir('poeira', p.x, p.chao, 8); emitir('fagulha', p.x, p.chao - 4, 6, '#ff7a1a'); som('impacto', 0.5); }
      }
    }
  }
}
function desenharProjetilVilao(p) {
  const R = ret;
  if (p.tipo === 'tora') {
    R('#2a1808', p.x - 9, p.y - 7, 18, 14); R('#7a5028', p.x - 8, p.y - 6, 16, 12); R('#a87840', p.x - 8, p.y - 6, 16, 2);
    R('#c89a58', p.x - 8, p.y - 4, 3, 8); R('#5a3a1e', p.x - 3 + Math.round(Math.sin(p.t * 20) * 2), p.y - 2, 2, 5); R('#5a3a1e', p.x + 3, p.y - 5, 1, 4);
  } else if (p.tipo === 'lixoarc') {
    const c = ['#e03a3a', '#3a8ae0', '#e8d83a', '#3ac06a'][Math.floor(p.t * 10) % 4];
    R('#1a1a10', p.x - 5, p.y - 5, 10, 10); R(c, p.x - 4, p.y - 4, 8, 8); R('#fff', p.x - 3, p.y - 3, 2, 2);
  } else if (p.tipo === 'sacola') {
    const o = Math.round(Math.sin(p.t * 8));
    R('#8a8a9a', p.x - 6, p.y - 6, 12, 13); R('#f4f4ff', p.x - 5, p.y - 5, 10, 11); R('#cfcfe0', p.x - 3, p.y - 2, 6, 5);
    R('#f4f4ff', p.x - 6 + o, p.y - 9, 3, 4); R('#f4f4ff', p.x + 3 - o, p.y - 9, 3, 4); R('#e03a3a', p.x - 2, p.y - 1, 1, 1); R('#e03a3a', p.x + 1, p.y - 1, 1, 1);
  } else if (p.tipo === 'pedra') {
    if (p.aviso > 0) {
      ctx.globalAlpha = 0.4 + 0.4 * Math.sin(p.t * 30); R('#ff3a1a', p.x - 10, p.chao - 2, 20, 2); R('#ff3a1a', p.x - 1, p.chao - 40, 2, 38); ctx.globalAlpha = 1;
    } else {
      R('#101014', p.x - 8, p.y - 8, 16, 16); R('#2a2a32', p.x - 7, p.y - 7, 14, 14); R('#44444e', p.x - 7, p.y - 7, 14, 3);
      R('#ff5a1a', p.x - 2, p.y - 2, 4, 1); R('#ff5a1a', p.x + 1, p.y, 1, 4);
    }
  }
}
function desenharVilao() {
  const v = vilao; if (!v) return;
  if (v.morto && v.tt > 2.4) return;
  if (v.inv > 0 && !v.morto && Math.floor(v.inv * 24) % 2) return;                // pisca ao levar dano
  const sx = v.shake > 0 ? Math.round(rnd(-1.5, 1.5)) : 0;
  ctx.save(); ctx.translate(sx, 0);
  if (v.morto) ctx.globalAlpha = Math.max(0, 1 - v.tt / 2.4);
  v.d.desenhar(v);
  ctx.restore();
  if (!v.ativo) {                                                                  // pisca um aviso enquanto dorme
    ctx.globalAlpha = 0.5 + 0.4 * Math.sin(L.tempo * 4); texto('!', v.x + v.w / 2, v.y - 12, '#ff3a3a', 8, 'center'); ctx.globalAlpha = 1;
  }
}
/* Barra de vida do vilão (HUD) */
function desenharBarraVilao() {
  const v = vilao;
  if (!v || !v.ativo || v.morto) return;
  capsulaHud(280, 30, 98, 18, '#e04a4a');
  texto((v.d.nome || v.d.curto).split(',')[0].toUpperCase(), 329, 33, '#fff', 6, 'center', false, 92);
  ret('#000', 283, 41, 92, 5); ret('#2a1a20', 284, 42, 90, 3);
  ret(v.d.cor, 284, 42, Math.round(90 * v.hp / v.hpMax), 3); ret('rgba(255,255,255,0.3)', 284, 42, 90, 1);
}
