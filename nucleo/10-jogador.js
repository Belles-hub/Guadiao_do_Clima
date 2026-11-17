'use strict';
/* =====================================================================
   10. JOGADOR (movimento, pulo, natação, escudo, ataque, dano)
   ===================================================================== */
function atualizarJogador(dt) {
  const j = J, agua = L.agua;
  j.invul = Math.max(0, j.invul - dt); j.knock = Math.max(0, j.knock - dt); j.dash = Math.max(0, j.dash - dt);
  j.recarga -= dt; j.atk = Math.max(0, j.atk - dt); j.lento = Math.max(0, j.lento - dt);
  const arma = armaAtual();
  j.escudo = arma === 'escudo' && seg('KeyJ') && j.knock <= 0;

  // --- horizontal: aceleração e desaceleração suaves ---
  let alvo = 0;
  if (seg('ArrowLeft', 'KeyA')) alvo -= 1;
  if (seg('ArrowRight', 'KeyD')) alvo += 1;
  if (j.knock <= 0 && j.dash <= 0) {
    const vmax = VEL_MAX * (arma === 'bike' ? 1.45 : 1) * (j.lento > 0 ? 0.7 : 1) * (j.escudo ? 0.5 : 1) * (agua ? 0.8 : 1);
    if (alvo !== 0) {
      j.dir = alvo;
      const virando = Math.sign(j.vx) === -alvo;
      j.vx = aprox(j.vx, alvo * vmax, (agua ? 320 : (j.noChao ? ACEL : ACEL_AR)) * (virando ? 1.8 : 1) * dt);
    } else {
      j.vx = aprox(j.vx, 0, (agua ? 220 : (j.noChao ? DESACEL : DESACEL_AR)) * dt);
    }
  }
  // esteiras e correntes de água empurram o jogador
  const tcx = Math.floor((j.x + j.w / 2) / TAM), tcy = Math.floor((j.y + j.h / 2) / TAM);
  const zona = tile(tcx, tcy), sob = tile(tcx, Math.floor((j.y + j.h + 1) / TAM));
  j.extraVx = 0;
  if (j.noChao) { if (sob === '>') j.extraVx = 44; else if (sob === '<') j.extraVx = -44; }
  if (zona === 'R') j.extraVx += 62; else if (zona === 'L') j.extraVx -= 62;
  const corrCima = zona === 'U';
  if (zona === 'R' || zona === 'L' || zona === 'U') dispararLicao('corrente');

  // --- pulo (coyote + buffer + variável) ou natação ---
  const pulando = seg('Space', 'KeyW', 'ArrowUp');
  if (agua) {
    if (pulando) j.vy = aprox(j.vy, -95, 650 * dt); else j.vy = Math.min(j.vy + 240 * dt, 55);
    if (corrCima) j.vy -= 380 * dt;
    if (press('Space', 'KeyW', 'ArrowUp')) { emitir('bolha', j.x + j.w / 2, j.y, 3); som('bolha'); }
    if (Math.random() < dt * 3) emitir('bolha', j.x + j.w / 2 + j.dir * 3, j.y + 3, 1);
  } else {
    if (press('Space', 'KeyW', 'ArrowUp')) j.buffer = TEMPO_BUFFER; else j.buffer -= dt;
    if (j.noChao) { j.coyote = TEMPO_COYOTE; j.pulosUsados = 0; } else j.coyote -= dt;
    if (j.buffer > 0) {
      if (j.coyote > 0) {
        j.vy = -FORCA_PULO; j.coyote = 0; j.buffer = 0; j.noChao = false; som('pulo');
        emitir('poeira', j.x + j.w / 2, j.y + j.h, 4);
      } else if (arma === 'bike' && j.pulosUsados < 1) {   // pulo duplo da Bicicleta-Turbo
        j.vy = -FORCA_PULO * 0.9; j.pulosUsados++; j.buffer = 0; som('pulo');
        emitir('brilho', j.x + j.w / 2, j.y + j.h, 6);
      }
    }
    let g = GRAV;
    if (j.vy < 0 && !pulando) g *= 2.6;      // soltou o botão: corta o pulo
    else if (j.vy > 0) g *= 1.15;
    j.vy = Math.min(j.vy + g * dt, VEL_QUEDA_MAX);
  }

  const noChaoAntes = j.noChao, vyAntes = j.vy;
  moverCorpo(j, dt);
  if (j.noChao && !noChaoAntes && vyAntes > 140) { som('pouso'); emitir('poeira', j.x + j.w / 2, j.y + j.h, 5); }
  if (j.noChao && Math.abs(j.vx) > 30) { j.passoT += dt * Math.abs(j.vx) / 55; if (j.passoT >= 1) { j.passoT = 0; som('passo', 0.7); } }

  // posição segura para voltar após cair no buraco ou na lava
  if (j.noChao) {
    const e = tile(Math.floor((j.x - 2) / TAM), Math.floor((j.y + j.h + 1) / TAM));
    const d = tile(Math.floor((j.x + j.w + 2) / TAM), Math.floor((j.y + j.h + 1) / TAM));
    if (eSolido(e) && eSolido(d) && e !== 'B' && d !== 'B') j.seguro = { x: j.x, y: j.y };
  }
  const naLava = tile(Math.floor((j.x + j.w / 2) / TAM), Math.floor((j.y + j.h - 3) / TAM)) === 'W';
  if (j.y > mapaAlt * TAM + 24 || naLava) {
    if (naLava) { emitir('fagulha', j.x + 5, j.y + 18, 14); som('splash'); }
    perderVida(0, 'queda');
    if (estado === 'jogo') { j.x = j.seguro.x; j.y = j.seguro.y; j.vx = j.vy = 0; j.invul = 1.6; }
  }
  // --- ar embaixo d'água ---
  if (agua) {
    if (j.y < 2 * TAM) j.ar = Math.min(100, j.ar + 70 * dt);
    else j.ar -= (100 / 42) * dt;
    if (j.ar < 55) dispararLicao('ar');
    if (j.ar <= 0) {
      j.ar = 0; j.afoga -= dt;
      if (j.afoga <= 0) { j.afoga = 2.6; danificarJogador(j.x + j.w / 2 + 1, 1); toast('Sem ar! Suba à superfície ou pegue bolhas!', 2); }
    } else j.afoga = 0.8;
  }

  // --- trocar de arma (K ou 1 a 5) ---
  if (press('KeyK')) {
    const lib = ARMAS.map((a, i) => salvo.armas[a.id] ? i : -1).filter(i => i >= 0); lib.push(-1);   // -1 = punhos
    if (lib.length > 1) { const pos = lib.indexOf(j.arma); j.arma = lib[(pos + 1) % lib.length]; som('menu'); L.trocouArma = L.tempo; }
  }
  for (let i = 0; i < 5; i++) {
    if (press('Digit' + (i + 1), 'Numpad' + (i + 1))) {
      if (salvo.armas[ARMAS[i].id]) { j.arma = i; som('menu'); L.trocouArma = L.tempo; } else { toast('Arma ainda não montada!', 1.5); som('erro'); }
    }
  }

  if (press('Digit0', 'Numpad0')) { j.arma = -1; som('menu'); toast('Punhos', 1); }
  // --- ataque (J); o Escudo Solar bloqueia enquanto J está segurado ---
  if (press('KeyJ') && j.recarga <= 0) atacar();
  if (j.atk > 0.1) golpeCorpoACorpo();
  if (j.escudo && Math.random() < dt * 8) emitir('brilho', j.x + j.w / 2 + j.dir * 8, j.y + rnd(2, 20), 1, '#ffd84f');

  // --- animação ---
  j.anim += dt * (1 + Math.abs(j.vx) / 60);
  j.quadro = Math.floor(j.anim * 8) % 4;
  if (j.noChao && Math.abs(j.vx) > 30 && Math.random() < 0.15) emitir('poeira', j.x + j.w / 2, j.y + j.h, 1);
}
function atacar() {
  const j = J, arma = armaAtual();
  j.atk = 0.22; j.acertados = [];
  if (arma === 'semente') {
    j.recarga = 0.38;
    const v = velMira('semente', 210), a0 = Math.atan2(v.vy, v.vx), n2 = armaNivel('semente') >= 2;   // mira assistida: vai reto até o alvo
    for (const off of (n2 ? [-0.24, 0, 0.24] : [0])) projeteis.push({ x: j.x + j.w / 2 + j.dir * 8, y: j.y + 9, vx: Math.cos(a0 + off) * 210, vy: Math.sin(a0 + off) * 210, g: 0, vida: 1.2, tipo: 'semente', dir: j.dir, flor: n2 });
    emitir('folha', j.x + j.w / 2 + j.dir * 10, j.y + 9, 3); som('tiro');
  } else if (arma === 'martelo') {
    j.recarga = 0.55; som('soco');
    if (armaNivel('martelo') >= 2) projeteis.push({ tipo: 'ondaAmiga', x: j.x + j.w / 2 + j.dir * 10, y: j.y + j.h - 6, vx: j.dir * 150, vy: 0, g: 0, vida: 0.9 });
  } else if (arma === 'bike') {              // pedalada turbo: arrancada com golpe
    const n2 = armaNivel('bike') >= 2;
    j.recarga = 0.5; j.dash = n2 ? 0.28 : 0.18; j.vx = j.dir * (n2 ? 270 : 215); som('serra');
    if (n2) emitir('brilho', j.x + j.w / 2, j.y + 12, 8, '#6ad8ff');
    emitir('poeira', j.x + j.w / 2 - j.dir * 4, j.y + j.h, 6); emitir('brilho', j.x + j.w / 2, j.y + 10, 4, '#ffb02a');
  } else if (arma === 'bolha') {
    j.recarga = 0.45; som('bolha');
    const v = velMira('bolha', 170), a0 = Math.atan2(v.vy, v.vx), n2 = armaNivel('bolha') >= 2;
    for (const off of (n2 ? [-0.18, 0.18] : [0])) projeteis.push({ x: j.x + j.w / 2 + j.dir * 8, y: j.y + 9, vx: Math.cos(a0 + off) * 170, vy: Math.sin(a0 + off) * 170, g: 0, vida: 1.1, tipo: 'bolha', dir: j.dir, congela: n2 });
  } else if (arma === 'escudo') {             // um toque em J dá uma escudada; segurar J levanta o escudo
    j.recarga = 0.45; som('metal');
  } else { j.recarga = 0.32; som('soco'); }
}
/* Mira assistida: aponta para o alvo mais próximo à frente (objetivo da arma, inimigo, vilão ou ponto fraco); sem alvo, vai reto */
function velMira(tipo, vel) {
  const j = J, cx = j.x + j.w / 2 + j.dir * 8, cy = j.y + 9;
  let melhor = null, md = 1e9;
  const cand = (x, y, bonus = 0) => {
    const dx = x - cx, dy = y - cy;
    if (dx * j.dir < -6 || Math.abs(dx) > 200 || Math.abs(dy) > 80) return;
    const d = Math.hypot(dx, dy) - bonus;
    if (d < md) { md = d; melhor = { x, y }; }
  };
  for (const f of focos) if (!f.apagado && ((tipo === 'semente' && f.tipo === 'fogo') || (tipo === 'bolha' && f.tipo === 'recife'))) cand(f.x + f.w / 2, f.y + f.h / 2, 90);   // o objetivo da arma tem prioridade sobre inimigos
  for (const e of inimigos) if (e.vivo && e.tipo !== 'chamine') cand(e.x + e.w / 2, e.y + e.h / 2);
  if (vilao && vilao.ativo && !vilao.morto) cand(vilao.x + vilao.w / 2, vilao.y + vilao.h / 2, 20);
  if (chefe && !chefe.morto) {
    const i = chefe.pontos.findIndex(p => p.vivo);
    if (i >= 0) cand(posPontoFornax(chefe, i)[0], posPontoFornax(chefe, i)[1], 60);
  }
  if (!melhor) return { vx: j.dir * vel, vy: 0 };
  const a = Math.atan2(melhor.y - cy, melhor.x - cx);
  return { vx: Math.cos(a) * vel, vy: Math.sin(a) * vel };
}
/* Caixa do golpe corpo a corpo (soco, martelo ou pedalada) */
function golpeCorpoACorpo() {
  const j = J, arma = armaAtual();
  if (arma === 'semente' || arma === 'bolha') return;
  const alc = arma === 'martelo' ? 24 : arma === 'bike' ? 20 : 18;
  const dano = arma === 'martelo' ? 3 : arma === 'bike' ? (armaNivel('bike') >= 2 ? 3 : 2) : 1;
  const caixa = { x: j.dir > 0 ? j.x + j.w : j.x - alc, y: j.y, w: alc, h: 22 };
  // ataques de vilões (toras, lixo, sacolas) podem ser destruídos em vez de só desviados
  for (const h of projeteis) if (h.vilao && h.tipo !== 'pedra' && colide(caixa, { x: h.x - 8, y: h.y - 8, w: 16, h: 16 })) { h.vida = 0; emitir('fagulha', h.x, h.y, 6); som('metal'); }
  for (const e of inimigos) {
    if (!e.vivo || e.tipo === 'chamine' || j.acertados.includes(e)) continue;
    if (colide(caixa, e)) {
      j.acertados.push(e);
      if (e.tipo === 'chama') { emitir('fagulha', e.x + e.w / 2, e.y + 4, 5); danificarJogador(e.x + e.w / 2, 1); continue; } // chama não pode ser socada!
      machucarInimigo(e, dano, j.dir, arma === 'martelo');
    }
  }
  for (const f of focos) {
    if (f.apagado || (f.tipo !== 'bairro' && f.tipo !== 'gerador') || j.acertados.includes(f)) continue;
    if (colide(caixa, f)) { j.acertados.push(f); machucarObjetivo(f, dano); }
  }
  if (vilao && vilao.ativo && !vilao.morto && !j.acertados.includes('vilao') && colide(caixa, retVilao())) { j.acertados.push('vilao'); machucarVilao(dano, arma || 'soco'); }
  if (chefe && !chefe.morto && !j.acertados.includes('chefe') && colide(caixa, retChefe())) {
    j.acertados.push('chefe'); golpeChefe(arma || null);
  }
}
function machucarObjetivo(f, dano) {
  f.hp -= dano; f.flash = 0.15;
  emitir('fagulha', f.x + f.w / 2, f.y + f.h / 2, 8, f.tipo === 'bairro' ? '#9ad0ff' : '#ffd84f'); som(f.tipo === 'gerador' ? 'metal' : 'soco');
  if (f.hp <= 0) apagarFoco(f);
}
function machucarInimigo(e, dano, dir, reciclar = false) {
  if (e.tipo === 'chamine') return;
  e.hp -= dano; e.stun = 0.3; e.vx = dir * 120; if (!e.d.flutua) e.vy = -90; e.atk = 0;
  emitir('fagulha', e.x + e.w / 2, e.y + e.h / 2, 6); som('inimigo');
  if (e.hp <= 0) {
    e.vivo = false; dispararLicao('mata_' + e.tipo); som('explodir'); soltarVida(e.x + e.w / 2, e.y + e.h / 2, 0.75, 0.25);
    const cx = e.x + e.w / 2, cy = e.y + e.h / 2;
    const cor = e.tipo === 'chama' ? CORES_FAISCA[e.pal] : e.tipo === 'motosserra' ? PAL_ROBO[e.pal].detalhe : e.tipo === 'carro' ? PAL_CARRO[e.pal].c : e.tipo === 'lixo' ? '#8ac84a' : '#ff6ad8';
    emitir('fumaca', cx, cy, 8, cor); emitir('fagulha', cx, cy, 14, cor); emitir('brilho', cx, cy, 6);
    if (e.tipo === 'chama') emitir('vapor', cx, cy, 8);
    if (e.tipo === 'aguaviva') emitir('bolha', cx, cy, 10);
    if (e.tipo === 'lixo' && reciclar) reciclarLixo(e);
  }
}
/* Dano no jogador: pisca e fica invencível por 1 segundo */
function danificarJogador(origemX, qtd = 1) {
  const j = J;
  if (j.invul > 0 || L.concluida) return;
  qtd *= DANO_FASE[L.idx] || 1;                    // quanto mais avançada a fase, mais forte cada golpe
  if (j.armadura > 0) {                            // a armadura de obsidiana absorve primeiro
    const abs = Math.min(qtd, j.armadura / CUSTO_ARMADURA);
    j.armadura = Math.max(0, j.armadura - abs * CUSTO_ARMADURA); qtd -= abs;
    emitir('fagulha', j.x + 5, j.y + 10, 10, '#a07af0'); som('metal');
    if (j.armadura <= 0) toast('A armadura quebrou!', 2);
  }
  if (qtd > 0.01) perderVida(Math.ceil(qtd - 0.001), 'dano');
  if (estado !== 'jogo') return;
  j.invul = Math.max(0.9, TEMPO_INVUL - 0.1 * L.idx); j.knock = 0.25;
  const d = (j.x + j.w / 2) < origemX ? -1 : 1;
  j.vx = d * 110; j.vy = L.agua ? -40 : -150; j.noChao = false;
  emitir('fagulha', j.x + j.w / 2, j.y + 10, 8);
}
function perderVida(qtd, motivo) {
  J.vidas = Math.max(0, J.vidas - (motivo === 'queda' ? 1 : qtd));
  som('dano');
  if (J.vidas <= 0) {
    if (!L.segundaChance) {                       // segunda chance: volta com 3 vidas, uma vez por fase
      L.segundaChance = true; J.vidas = 3; J.invul = 2.5; J.x = J.seguro.x; J.y = J.seguro.y; J.vx = J.vy = 0;
      toast('Segunda chance! Você ganhou 3 vidas.', 3); som('curar');
    } else mudar('gameover');
  }
}
