'use strict';
/* =====================================================================
   11. INIMIGOS (IA: patrulhar, perseguir, atacar) e chaminés de raios
   ===================================================================== */
function haChaoAdiante(e) {
  const fx = e.dir > 0 ? e.x + e.w + 2 : e.x - 2;
  const t = tile(Math.floor(fx / TAM), Math.floor((e.y + e.h + 2) / TAM));
  return eSolido(t) || eUmaVia(t);
}
function contarTipo(tipo) { let n = 0; for (const e of inimigos) if (e.vivo && e.tipo === tipo) n++; return n; }
function atualizarInimigo(e, dt) {
  const d = e.d;
  e.t += dt; e.stun -= dt; e.cd -= dt; e.recuo = Math.max(0, (e.recuo || 0) - dt);
  const dx = (J.x + J.w / 2) - (e.x + e.w / 2), dy = (J.y + J.h / 2) - (e.y + e.h / 2);
  const dist = Math.hypot(dx, dy), volD = clamp(1 - dist / 170, 0, 1);
  e.somT -= dt;
  if (d.fixo) { atualizarChamine(e, dt, dx, dy, volD); return; }

  if (d.flutua) {                          // águas-vivas boiam: vão e voltam num tempo fixo, subindo e descendo suavemente
    if (e.stun > 0) { e.vx = aprox(e.vx, 0, 200 * dt); e.vy = aprox(e.vy, 0, 200 * dt); }
    else {
      e.voltaT -= dt;
      if (e.voltaT <= 0) { e.dir *= -1; e.voltaT = d.tVolta * (0.9 + Math.random() * 0.2); }
      e.vx = aprox(e.vx, e.dir * d.vPatrulha, 80 * dt); e.vy = aprox(e.vy, Math.sin(e.t * 2.2) * 14, 80 * dt);
    }
    moverCorpo(e, dt, true);
    if (e.bateuX) { e.dir *= -1; e.vx = 0; e.voltaT = d.tVolta; }
    if (Math.random() < dt * 2.5) emitir('bolha', e.x + e.w / 2, e.y + 2, 1, '#ff9ae0');
    if (volD > 0.1 && e.somT <= 0) { som('bolha', volD * 0.7); e.somT = 0.9 + Math.random() * 0.6; }
  } else {
    if (e.stun > 0) {
      e.vx = aprox(e.vx, 0, 260 * dt);
    } else {
      let vel = d.vPatrulha;
      const perto = !(e.recuo > 0) && Math.abs(dx) < d.alcance && Math.abs(dy) < 36;   // depois de acertar, recua um pouco
      if (perto) {
        e.dir = dx >= 0 ? 1 : -1; vel = d.vPerseguir; e.estado = 'perseguir';
        if (Math.abs(dx) < 24 && e.cd <= 0 && e.noChao) { e.atk = 0.3; e.cd = 1.7; }   // dá o bote
      } else e.estado = 'patrulha';
      if (d.semPerseguir) {                 // carros vão e voltam em intervalos de tempo (os prédios impedem a perseguição)
        e.voltaT -= dt;
        if (e.voltaT <= 0) { e.dir *= -1; e.voltaT = d.tVolta * (0.8 + Math.random() * 0.4); }
      }
      if (e.atk > 0) { e.atk -= dt; vel = d.vAtaque; }
      if (e.noChao && !haChaoAdiante(e)) {
        if (e.estado === 'patrulha') e.dir *= -1; else vel = 0;
      }
      e.vx = e.dir * vel;
    }
    e.vy = Math.min(e.vy + GRAV * dt, VEL_QUEDA_MAX);
    // esteiras também carregam os inimigos
    const sob = tile(Math.floor((e.x + e.w / 2) / TAM), Math.floor((e.y + e.h + 1) / TAM));
    e.extraVx = e.noChao ? (sob === '>' ? 44 : sob === '<' ? -44 : 0) : 0;
    moverCorpo(e, dt);
    if (e.bateuX && e.stun <= 0) e.dir *= -1;
    if (d.semPerseguir) {                   // qualquer virada (parede, buraco ou tempo) reinicia o cronômetro: vai e volta regular
      if (e.dirAnt !== undefined && e.dir !== e.dirAnt) e.voltaT = d.tVolta * (0.9 + Math.random() * 0.2);
      e.dirAnt = e.dir;
    }
    if (e.y > mapaAlt * TAM + 40) e.vivo = false;
    // efeitos de cada tipo
    if (e.tipo === 'motosserra') {
      if (Math.random() < dt * 6) emitir('fumaca', e.x + (e.dir > 0 ? 1 : e.w - 1), e.y + 2, 1, PAL_ROBO[e.pal].detalhe);
      if (e.atk > 0 && Math.random() < dt * 40) emitir('fagulha', e.x + e.w / 2 + e.dir * 11, e.y + 9, 1, '#ffd84f');
      if (volD > 0.08 && e.somT <= 0) { som(e.atk > 0 ? 'serra' : 'motor', volD); e.somT = e.atk > 0 ? 0.25 : 0.45; }
    } else if (e.tipo === 'chama') {
      if (Math.random() < dt * 14) emitir('fagulha', e.x + e.w / 2, e.y, 1, CORES_FAISCA[e.pal]);
      if (volD > 0.08 && e.somT <= 0) { som('crepitar', volD); e.somT = 0.35 + Math.random() * 0.3; }
    } else if (e.tipo === 'carro') {        // carro-monstro solta nuvens de fumaça que deixam Davi lento
      e.fumaT -= dt;
      if (e.fumaT <= 0) { e.fumaT = 0.9; nuvens.push({ x: e.x + (e.dir > 0 ? -8 : e.w - 6), y: e.y - 4, w: 18, h: 14, t: 3.2, s: Math.random() * 6 }); }
      if (volD > 0.08 && e.somT <= 0) { som('motor', volD); e.somT = 0.5; }
    } else if (e.tipo === 'lixo') {          // monstros de lixo se multiplicam se não forem reciclados
      if (!e.semMult && dist < 260) {
        e.multT -= dt;
        if (e.multT <= 0 && contarTipo('lixo') < 10) {
          e.multT = 9 + Math.random() * 4;
          const f = criarInimigo('lixo', 0, 0);
          f.x = e.x + e.dir * 12; f.y = e.y - 6; f.w = 10; f.h = 10; f.hp = 1; f.pequeno = true; f.semMult = true;
          emitir('brilho', e.x + 7, e.y, 6, '#8ac84a'); som('gosma', volD); dispararLicao('multiplica');
        }
      }
      if (volD > 0.1 && e.somT <= 0) { som('gosma', volD * 0.6); e.somT = 1.1 + Math.random(); }
    }
  }
  // escudo nível 2: quem encosta no escudo fica atordoado
  if (J.escudo && armaNivel('escudo') >= 2 && e.vivo) {
    const esc = { x: J.dir > 0 ? J.x + J.w : J.x - 9, y: J.y, w: 9, h: J.h };
    if (colide(esc, e)) { e.stun = 1.8; e.vx = J.dir * 200; emitir('brilho', e.x + e.w / 2, e.y + 4, 3, '#ffd84f'); }
  }
  // contato: pular em cima vence o inimigo (pisão); pelo lado, machuca o jogador (se não estiver atordoado)
  const caixa = { x: e.x + 2, y: e.y + 2, w: e.w - 4, h: e.h - 3 };
  if (e.vivo && colide(caixa, J)) {
    if (e.tipo !== 'chama' && J.vy > 40 && (J.y + J.h) - e.y < 10) {
      machucarInimigo(e, 1, J.dir); J.vy = -230; J.noChao = false; J.pulosUsados = 0; som('pulo');
      J.y = Math.min(J.y, e.y - J.h + 2); J.invul = Math.max(J.invul, 0.25);   // sai de cima do inimigo para não levar dano
      emitir('brilho', J.x + 5, J.y + J.h, 6);
      if (!L.avisouPisao) { L.avisouPisao = true; toast('Pisão! Pule em cima dos inimigos.', 2.2); }
    } else if (e.stun <= 0) {
      danificarJogador(e.x + e.w / 2);
      if (e.tipo === 'carro' || e.tipo === 'lixo' || e.tipo === 'motosserra') {   // quem acertou recua, para você poder escapar
        e.dir = (e.x + e.w / 2) < (J.x + J.w / 2) ? -1 : 1; e.recuo = 1.6; e.atk = 0;
      }
    }
  }
}
