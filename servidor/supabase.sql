-- Rode isto uma vez no Supabase: SQL Editor > New query > Run
create table if not exists public.saves (
  usuario_id text primary key,          -- "sub" da conta Google
  nome       text,
  dados      jsonb  not null,           -- o objeto "salvo" do jogo
  atualizado bigint not null            -- milissegundos (Date.now())
);

-- Segurança: com RLS ligado e SEM políticas, a chave pública (anon) não lê nem escreve nada.
-- Só o servidor, usando a chave service_role, acessa a tabela.
alter table public.saves enable row level security;
