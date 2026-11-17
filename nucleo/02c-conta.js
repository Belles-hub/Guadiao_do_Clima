'use strict';
/* =====================================================================
   2c. CONTA: entrar com o Google (ou jogar como convidado)
   Usa o Google Identity Services (login do Google para sites). Cada conta Google tem o seu save.

   COMO ATIVAR (uma vez só):
   1. Google Cloud Console > APIs e serviços > Credenciais > Criar credenciais > ID do cliente OAuth > "Aplicativo da Web".
   2. Em "Origens JavaScript autorizadas" coloque o endereço onde o jogo fica publicado (ex.: https://seujogo.com).
   3. Cole o ID do cliente abaixo em GOOGLE_CLIENT_ID.
   (Não funciona abrindo o arquivo direto do computador: precisa de um endereço http/https.)
   ===================================================================== */
const GOOGLE_CLIENT_ID = '';

const CHAVE_SESSAO = 'guardiao_clima_sessao_v2';
let usuario = null;          // nome da conta Google atual (null = convidado)
let precisaConta = true;     // true = ainda não há sessão: mostra a tela de conta
const gLogin = { pronto: false, carregando: false, pendente: false, erro: '' };

/* Abre o save de uma conta Google (nome, id) ou do convidado (id = null) e lembra a sessão */
function abrirSave(nome, id) {
  usuario = id ? nome : null;
  chaveSave = id ? CHAVE_SAVE + '_g_' + id : CHAVE_SAVE;
  carregarProgresso();
  try { localStorage.setItem(CHAVE_SESSAO, JSON.stringify(id ? { tipo: 'google', id, nome } : { tipo: 'convidado' })); } catch (e) {}
  precisaConta = false;
}
function sairDaConta() {
  nuvemDesligar();
  usuario = null; chaveSave = null; salvo = salvoPadrao(); precisaConta = true;
  try { localStorage.removeItem(CHAVE_SESSAO); } catch (e) {}
  try { if (window.google && google_gsi()) google_gsi().disableAutoSelect(); } catch (e) {}
}
const google_gsi = () => (window.google && window.google.accounts && window.google.accounts.id) || null;

/* Carrega a biblioteca do Google logo no começo, para o clique no botão abrir a janela sem atraso */
function prepararGoogle() {
  if (!GOOGLE_CLIENT_ID || gLogin.pronto || gLogin.carregando) return;
  gLogin.carregando = true;
  const s = document.createElement('script');
  s.src = 'https://accounts.google.com/gsi/client'; s.async = true;
  s.onload = () => { gLogin.pronto = true; gLogin.carregando = false; };
  s.onerror = () => { gLogin.carregando = false; gLogin.erro = 'Sem conexão'; };
  document.head.appendChild(s);
}
let tokenGoogle = null;
function entrarComGoogle() {
  gLogin.erro = '';
  if (!GOOGLE_CLIENT_ID) { gLogin.erro = 'Google não configurado'; return; }
  if (!gLogin.pronto) { gLogin.erro = 'Carregando Google...'; prepararGoogle(); return; }
  try {
    if (!tokenGoogle) {
      tokenGoogle = window.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID, scope: 'openid profile',
        callback: resp => {
          if (!resp || !resp.access_token) { gLogin.pendente = false; gLogin.erro = 'Login cancelado'; return; }
          fetch('https://www.googleapis.com/oauth2/v3/userinfo', { headers: { Authorization: 'Bearer ' + resp.access_token } })
            .then(r => r.json())
            .then(u => { gLogin.pendente = false; abrirSave(u.given_name || u.name || 'Jogador', u.sub); aposEntrar(); nuvemSincronizar(resp.access_token); })
            .catch(() => { gLogin.pendente = false; gLogin.erro = 'Erro ao ler a conta'; });
        },
        error_callback: () => { gLogin.pendente = false; gLogin.erro = 'Login cancelado'; }
      });
    }
    gLogin.pendente = true;
    tokenGoogle.requestAccessToken();
  } catch (e) { gLogin.pendente = false; gLogin.erro = 'Erro no login'; }
}

/* Restaura a sessão anterior, se houver */
(function restaurarSessao() {
  try {
    const s = JSON.parse(localStorage.getItem(CHAVE_SESSAO) || 'null');
    if (s && s.tipo === 'google' && s.id) abrirSave(s.nome, s.id);
    else if (s && s.tipo === 'convidado') abrirSave(null, null);
  } catch (e) {}
  prepararGoogle();
})();
