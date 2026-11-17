# Guardião do Clima

Jogo educativo de plataforma sobre as causas do aquecimento global e o que podemos fazer contra elas.
Davi, o Guardião do Clima, atravessa seis cenários, derrota os vilões que representam cada causa e aprende, no caminho, por que o planeta está esquentando.

## 🎮 [Jogue agora: belles-hub.github.io/Guadiao_do_Clima](https://belles-hub.github.io/Guadiao_do_Clima/)

Funciona direto no navegador, no computador, sem instalar nada. O progresso e os checkpoints ficam salvos no próprio navegador.

## Objetivos de Desenvolvimento Sustentável (ODS)

O jogo trabalha com dois ODS da Agenda 2030 da ONU:

| ODS | Como o jogo aborda |
| --- | --- |
| **ODS 13: Ação contra a mudança global do clima** | Quatro das seis fases mostram uma causa do aquecimento global (desmatamento, transporte, energia suja, aquecimento dos mares), e a última mostra a consequência: o calor extremo. Cada uma tem uma ação que o jogador executa para combater o problema. |
| **ODS 12: Consumo e produção responsáveis** | A fase 4 trata do lixo e do consumo. O jogador recicla itens, transforma os monstros de lixo em blocos úteis e vê que o lixo em lixões também libera gás do efeito estufa. |

### Metas da ONU que o jogo apoia

- **Meta 13.3:** melhorar a educação e a conscientização sobre a mudança do clima. É o objetivo central do jogo.
- **Meta 12.5:** reduzir a geração de resíduos por meio da prevenção, redução, reciclagem e reuso. É a mecânica da fase 4.
- **Meta 12.8:** garantir que as pessoas tenham informação e conscientização para o desenvolvimento sustentável.

## Como o jogo ensina

O conteúdo educativo aparece **dentro** da jogada, e não em um texto separado:

- **Cada fase é uma causa.** O cenário, os inimigos e o vilão mostram o problema. Para vencer, o jogador usa uma ação que combate aquela causa.
- **Armas que são soluções.** Cada arma é montada com materiais coletados na fase e representa uma solução real: sementes para reflorestar, bicicleta no lugar do carro, energia solar no lugar do carvão, reciclagem do lixo e proteção dos recifes.
- **"SABIA?" durante a fase.** Frases curtas aparecem quando o jogador coleta, monta ou cumpre um objetivo, explicando o que acabou de fazer.
- **Curiosidade e quiz ao fim de cada fase.** Um dado real sobre o clima e uma pergunta de múltipla escolha fixam o que foi visto.
- **Vilões com ponto fraco ligado ao tema.** Cada vilão só é derrotado de forma eficiente com a arma que representa a solução para a causa dele.

## As seis fases

| # | Fase | Causa | Solução (arma) | ODS |
| --- | --- | --- | --- | --- |
| 1 | A Floresta em Chamas | Desmatamento e queimadas | Lança-Sementes: replantar e apagar o fogo | 13 |
| 2 | A Cidade da Fumaça | Poluição dos carros | Bicicleta-Turbo: transporte limpo | 13 |
| 3 | A Fábrica de Carvão | Energia suja | Escudo Solar: energia solar | 13 |
| 4 | O Lixão Gigante | Consumo e lixo | Martelo da Reciclagem: lixo vira bloco | **12** e 13 |
| 5 | O Oceano Fervendo | Aquecimento dos mares | Bolha Gelada: salvar os recifes | 13 |
| 6 | O Vulcão de Fornax | O calor extremo | Todas as soluções juntas contra o chefe | 13 |

### Dados reais citados no jogo

- Queimadas e desmatamento liberam CO₂ e respondem por cerca de 10% das emissões.
- O transporte emite cerca de 1/5 do CO₂ do mundo.
- O carvão é a energia que mais emite CO₂.
- O lixo em lixões libera metano, um gás do efeito estufa.
- Os oceanos absorvem mais de 90% do calor extra do planeta.
- O planeta já esquentou cerca de 1,1 °C.

## Recursos do jogo

- 6 fases com vilões e chefe final.
- Armas para montar e melhorar com os materiais coletados.
- Checkpoints: ao perder, continue de onde parou.
- Botão para reiniciar o progresso.
- Controles por teclado e por controle (joystick).

## Controles

| Tecla | Ação |
| --- | --- |
| ← → ou A D | Andar |
| Espaço ou W | Pular (segure para pular mais alto) |
| J | Atacar com a arma |
| K ou 0 a 5 | Trocar de arma |
| E | Coletar e montar armas |
| Q / R | Usar e trocar poder |
| H | Ajuda |
| P ou Esc | Pausar |

## Para desenvolvedores

Feito em JavaScript puro com `<canvas>`, sem bibliotecas. Para jogar localmente, abra o `index.html` no navegador.

| Pasta | Conteúdo |
| --- | --- |
| `nucleo/` | motor do jogo: física, jogador, inimigos, telas, save, checkpoints |
| `fases/` | uma pasta por fase (mapa, fundo, vilão e itens próprios) |
| `arte/` | imagens |
| `servidor/` | back-end opcional de save na nuvem (Express + SQLite/Supabase). **Não é usado na versão publicada.** |

A versão publicada é um site estático no GitHub Pages: qualquer mudança enviada à branch `main` é publicada sozinha.
