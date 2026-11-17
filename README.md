# Guardião do Clima

Jogo educativo de plataforma sobre o aquecimento global. Feito em JavaScript puro com `<canvas>`, sem bibliotecas no navegador.

## Jogar localmente

Abra o `index.html` no navegador. O save fica salvo no próprio navegador (convidado).

## Com save na nuvem (opcional)

O servidor em [`servidor/`](servidor) serve o jogo e guarda o progresso de cada conta Google.

```
cd servidor
npm install
npm start
```

Depois abra `http://localhost:3000`.

- **Sem configuração:** o servidor usa um SQLite local (`servidor/dados/`).
- **Em produção:** use o Supabase. Rode [`servidor/supabase.sql`](servidor/supabase.sql) uma vez e defina `SUPABASE_URL` e `SUPABASE_SERVICE_KEY` (veja [`servidor/.env.example`](servidor/.env.example)). Nunca publique a service key.
- **Login do Google:** crie um ID de cliente OAuth e coloque em `GOOGLE_CLIENT_ID` em [`nucleo/02c-conta.js`](nucleo/02c-conta.js).

## Estrutura

| Pasta | Conteúdo |
| --- | --- |
| `nucleo/` | motor do jogo: física, jogador, inimigos, telas, save, checkpoints |
| `fases/` | uma pasta por fase (mapa, fundo, vilão e itens próprios) |
| `arte/` | imagens |
| `servidor/` | back-end do save na nuvem (Express + SQLite/Supabase) |

## Recursos

- 6 fases, cada uma com uma causa do aquecimento global e um vilão.
- Armas para montar com os materiais coletados.
- Checkpoints: continue de onde parou depois de perder.
- Contas Google com save na nuvem, ou convidado.
