'use strict';
/* Back-end do Guardião do Clima: save na nuvem.
   - Serve o jogo (index.html, nucleo/, fases/, arte/ e as imagens da raiz).
   - GET/PUT /api/save: o progresso de cada conta Google, guardado no Supabase (produção) ou em SQLite (teste local).
   O servidor NUNCA confia no id enviado pelo navegador: ele valida o token do Google e usa o "sub" de lá. */
const path = require('path');
const fs = require('fs');
const express = require('express');

const PORTA = Number(process.env.PORT) || 3000;
const RAIZ = path.resolve(__dirname, '..');
const LIMITE_BYTES = 100 * 1024;                 // um save de verdade tem poucos KB
const TTL_TOKEN_MS = 5 * 60 * 1000;              // cache da validação do token no Google

/* ---------- armazenamento ----------
   Com SUPABASE_URL + SUPABASE_SERVICE_KEY: Postgres do Supabase (grátis e persistente; use em produção).
   Sem elas: SQLite local em servidor/dados/saves.db (para testar no computador). */
const SUPA_URL = (process.env.SUPABASE_URL || '').replace(/\/+$/, '');
const SUPA_KEY = process.env.SUPABASE_SERVICE_KEY || '';
let lerSave, gravarSave;
if (SUPA_URL && SUPA_KEY) {
  const cab = { apikey: SUPA_KEY, Authorization: 'Bearer ' + SUPA_KEY, 'Content-Type': 'application/json' };
  lerSave = async id => {
    const r = await fetch(SUPA_URL + '/rest/v1/saves?select=dados,atualizado&usuario_id=eq.' + encodeURIComponent(id), { headers: cab });
    if (!r.ok) throw new Error('Supabase ' + r.status);
    const l = (await r.json())[0];
    return l ? { dados: l.dados, atualizado: Number(l.atualizado) } : null;
  };
  gravarSave = async (id, nome, dados, atualizado) => {
    const r = await fetch(SUPA_URL + '/rest/v1/saves?on_conflict=usuario_id', {
      method: 'POST', headers: { ...cab, Prefer: 'resolution=merge-duplicates,return=minimal' },
      body: JSON.stringify({ usuario_id: id, nome, dados, atualizado })
    });
    if (!r.ok) throw new Error('Supabase ' + r.status);
  };
  console.log('Armazenamento: Supabase');
} else {
  const { DatabaseSync } = require('node:sqlite');
  fs.mkdirSync(path.join(__dirname, 'dados'), { recursive: true });
  const db = new DatabaseSync(path.join(__dirname, 'dados', 'saves.db'));
  db.exec('CREATE TABLE IF NOT EXISTS saves (usuario_id TEXT PRIMARY KEY, nome TEXT, dados TEXT NOT NULL, atualizado INTEGER NOT NULL)');
  const sel = db.prepare('SELECT dados, atualizado FROM saves WHERE usuario_id = ?');
  const ins = db.prepare('INSERT INTO saves (usuario_id, nome, dados, atualizado) VALUES (?, ?, ?, ?) ON CONFLICT(usuario_id) DO UPDATE SET nome = excluded.nome, dados = excluded.dados, atualizado = excluded.atualizado');
  lerSave = async id => { const l = sel.get(id); return l ? { dados: JSON.parse(l.dados), atualizado: l.atualizado } : null; };
  gravarSave = async (id, nome, dados, atualizado) => { ins.run(id, nome, JSON.stringify(dados), atualizado); };
  console.log('Armazenamento: SQLite local');
}

/* ---------- autenticação: valida o access token no Google ---------- */
const cacheTokens = new Map();                   // token -> { id, nome, ate }
async function identificar(req) {
  const m = /^Bearer (.+)$/.exec(req.get('Authorization') || '');
  if (!m) return null;
  const token = m[1];
  const c = cacheTokens.get(token);
  if (c && c.ate > Date.now()) return c;
  const r = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', { headers: { Authorization: 'Bearer ' + token } });
  if (!r.ok) return null;
  const u = await r.json();
  if (!u || !u.sub) return null;
  const info = { id: String(u.sub), nome: String(u.given_name || u.name || 'Jogador').slice(0, 60), ate: Date.now() + TTL_TOKEN_MS };
  if (cacheTokens.size > 5000) cacheTokens.clear();
  cacheTokens.set(token, info);
  return info;
}
const exigirConta = async (req, res, next) => {
  try {
    const u = await identificar(req);
    if (!u) return res.status(401).json({ erro: 'Não autenticado' });
    req.usuario = u; next();
  } catch (e) { res.status(502).json({ erro: 'Não foi possível validar a conta' }); }
};

/* ---------- validação do save ---------- */
const ehObjeto = v => v && typeof v === 'object' && !Array.isArray(v);
function saveValido(s) {
  if (!ehObjeto(s)) return false;
  if (s.liberadas !== undefined && !(Number.isInteger(s.liberadas) && s.liberadas >= 1 && s.liberadas <= 6)) return false;
  for (const k of ['armas', 'concluidas', 'niveis', 'poderes']) if (s[k] !== undefined && !ehObjeto(s[k])) return false;
  if (s.checkpoint !== undefined && s.checkpoint !== null) {
    const c = s.checkpoint;
    if (!ehObjeto(c) || !Number.isInteger(c.idx) || c.idx < 0 || c.idx > 5) return false;
    if (!Number.isFinite(c.x) || !Number.isFinite(c.y)) return false;
    for (const k of ['itens', 'focos', 'inimigos']) if (!Array.isArray(c[k]) || c[k].length > 2000 || !c[k].every(Number.isInteger)) return false;
  }
  if (s.cpT !== undefined && !Number.isFinite(s.cpT)) return false;
  return true;
}

/* ---------- API ---------- */
const app = express();
app.disable('x-powered-by');
app.use('/api', (req, res, next) => {            // CORS aberto só para a API (o jogo pode estar em outro endereço)
  res.set({ 'Access-Control-Allow-Origin': process.env.ORIGEM || '*', 'Access-Control-Allow-Headers': 'Authorization, Content-Type',
            'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS', 'Cache-Control': 'no-store' });
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});
app.use('/api', express.json({ limit: LIMITE_BYTES }));

app.get('/api/saude', (req, res) => res.json({ ok: true }));

app.get('/api/save', exigirConta, async (req, res, next) => {
  try {
    const l = await lerSave(req.usuario.id);
    res.json(l ? { salvo: l.dados, atualizado: l.atualizado } : { salvo: null, atualizado: 0 });
  } catch (e) { next(e); }
});

app.put('/api/save', exigirConta, async (req, res, next) => {
  try {
    const salvo = req.body && req.body.salvo;
    if (!saveValido(salvo)) return res.status(400).json({ erro: 'Save inválido' });
    if (Buffer.byteLength(JSON.stringify(salvo)) > LIMITE_BYTES) return res.status(413).json({ erro: 'Save grande demais' });
    const agora = Date.now();
    await gravarSave(req.usuario.id, req.usuario.nome, salvo, agora);
    res.json({ ok: true, atualizado: agora });
  } catch (e) { next(e); }
});

app.use('/api', (req, res) => res.status(404).json({ erro: 'Rota não encontrada' }));
app.use((err, req, res, next) => {               // JSON quebrado, corpo grande demais etc.
  if (res.headersSent) return next(err);
  res.status(err.status || 500).json({ erro: err.status ? 'Requisição inválida' : 'Erro interno' });
});

/* ---------- arquivos do jogo (somente o que o navegador precisa) ---------- */
for (const pasta of ['nucleo', 'fases', 'arte']) app.use('/' + pasta, express.static(path.join(RAIZ, pasta)));
app.get('/', (req, res) => res.sendFile(path.join(RAIZ, 'index.html')));
app.get(/^\/[\w-]+\.(png|jpg|jpeg|gif|svg|ico|webp)$/, (req, res) => res.sendFile(path.join(RAIZ, req.path), e => { if (e) res.sendStatus(404); }));

app.listen(PORTA, () => console.log('Guardião do Clima em http://localhost:' + PORTA));
