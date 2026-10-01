# Guia para construir um slide

Leia antes de escrever qualquer slide. Referência viva: `src/slides/S01Hero.tsx` (motion + tema escuro) e, quando existir, `src/slides/S02Problem.tsx` (diagrama por passos + tema claro).

## 1. Contrato do motor

- Cada slide é um componente em `src/slides/SXXNome.tsx`, já registrado em `src/slides/index.ts`.
- Textos e metadados ficam em `src/content/slides/NN-id.ts` (`meta` + `copy`). **Nenhum texto visível hardcoded no componente.**
- `meta.steps` = quantas vezes o apresentador aperta → dentro do slide. A timeline precisa ter exatamente esse número de rótulos (`s0…sN-1`) — o console avisa se não bater.
- `meta.theme`: `"dark"` ou `"light"` (já definido; os tokens se ajustam sozinhos).

```tsx
"use client";
import { useStepTimeline } from "@/components/deck/useStepTimeline";
import { useSlide } from "@/components/deck/hooks";
import { SectionHeader, revealHeader } from "@/components/ui/SectionHeader";
import { copy, meta } from "@/content/slides/05-open";
import { rise, draw, pop, fade, unmask, hold } from "@/lib/motion";

export function OpenSlide() {
  const { index } = useSlide();
  const { scope } = useStepTimeline(({ step, q, reduced }) => {
    step(0, (tl) => { revealHeader(tl, q); rise(tl, q(".x"), 0.4); });   // entrada
    step(1, (tl) => { /* animações do passo 1 */ });
    step(2, (tl) => { /* passo 2 */ });
  });
  return <div ref={scope} className="slide">…</div>;   // ref={scope} é obrigatório na raiz
}
```

- `step(n, build)` adiciona as animações e marca o rótulo `s{n}` no fim. → toca o trecho no tempo desenhado; ← rebobina rápido. Não chame `tl.play()`.
- Estado vindo do scroll: `const { step, entered, current } = useSlide()`. Use para interações imperativas (ex.: `Flip`, loops). **Loops infinitos só rodam com `current === true`**, e nunca com `motionPrefs.reduced`.
- Seletores: `q(".classe")` (escopo no slide). Para animar, prefira classes estáveis/`data-a` — nunca IDs globais.
- **Nunca** coloque `transition` CSS em `opacity`, `transform` ou `visibility` de um elemento que o GSAP anima (nem nos filhos que o GSAP anima): o GSAP lê o estado final via `getComputedStyle` no meio da transição e o elemento fica invisível/encolhido. Hover/dim em CSS → use um elemento interno dedicado.
- Linhas tracejadas (`stroke-dasharray`) não podem ser desenhadas com `draw()` (DrawSVG usa o próprio dasharray) — use `fade()`.
- Um `from()` por propriedade por elemento; mudanças posteriores usam `to()`.
- **Máscaras (`unmask`) exigem uma linha visual por item**: em `SplitHeadline`, cada item do array `lines` precisa caber numa linha a 1440px — se quebrar, a revelação vaza. Quebre as manchetes explicitamente no conteúdo.
- Elementos que só aparecem em passos futuros: esconda com `from()` no próprio passo (o `immediateRender` já esconde desde o início).
- Flip (reorganização de layout) é imperativo: aplique no `useEffect` quando o passo mudar (ver S02Problem).

## 2. Layout

- A raiz `.slide` já tem padding para o chrome (topo/rodapé). Área útil ≈ 1314×750 em 1440×900.
- Grid: `grid-12` (12 colunas, `--gutter`). Margens laterais já estão no `.slide`.
- Teste em **1440×900** e **1920×1080**. Nada pode vazar do palco (ele corta overflow). Tablet (1024×768) precisa funcionar; em < 768px o slide vira fluxo vertical (`.slide` com altura automática) — empilhe colunas com `md:` / `lg:`.
- Uma ideia por tela. Hierarquia: manchete → diagrama/simulação → apoio. Muito espaço negativo.

## 3. Design system (identidade BORA)

| Uso | Classe/token |
| --- | --- |
| Manchete | `SectionHeader` ou `SplitHeadline` com `t-headline` — peso leve + `**negrito**` (voz da BORA: “Não é sobre ser rápido. **É sobre começar.**”) |
| Marca-texto volt | `==palavra==` no conteúdo → `.hl`; anime com `revealHighlights(tl, q(".hl"), pos)` |
| Explicação | `t-lede` (Lexend 350, `text-fg-2`) |
| Rótulo | `t-label` (caixa-alta espaçada) |
| Números/dados | `t-mono` (Geist Mono tabular) |
| Cores | só tokens: `text-fg / fg-2 / fg-3 / fg-4`, `bg-bg / bg-2 / surface / surface-2`, `border-line / line-strong`, `bg-brand`, `text-brand-text` (volt no escuro, oliva no claro), `text-brand-ink` (texto sobre volt), `var(--club)` só para o clube fictício |
| Raios | `rounded-[var(--radius-lg)]` cards, `--radius-xl` painéis, `--radius-pill` pílulas |
| Pílulas | `.pill`, `.pill--brand` (botão volt), `Toggle` |
| Status | `<Tag kind="current|evolution|proposed|example|fictional|illustrative|hypothesis|demo|target|simulation" />` |

- **Volt é sinal, não decoração**: conexões ativas, resultado principal, marca-texto, estado selecionado. No tema claro, texto volt é ilegível → use `text-brand-text`.
- Evite: cards genéricos de SaaS em grade, sombras pesadas, gradientes coloridos, ícones genéricos, emojis. Diagramas com linhas finas (`--line`), pontos (= corredores), nós circulares, rótulos tipográficos.
- Linguagem visual compartilhada: ponto pequeno = corredor; aglomerado = comunidade; volt = BORA Network/atividade; tracejado = hipótese/opcional.
- Grafismo oficial disponível: `<div className="contours text-brand opacity-[.08]" />` (contornos do raio da marca, máscara SVG).

## 4. Motion

- Presets em `@/lib/motion`: `rise`, `fade`, `unmask` (dentro de `.split-line`), `draw` (SVG stroke, DrawSVG), `pop`, `dim`, `hold`. Todos já respeitam reduced motion.
- Curvas: `"bora"` (entrada), `"power3.inOut"` (transformação), `"expo.out"`. Sem bounce/elastic.
- Durações 0,5–1,2s; grandes transições 1,2–2s. Cada passo deve se resolver em ≤ 2,2s.
- Motion explica relação: conexão → linha se desenha; evolução → elemento se transforma; funil → pontos percorrem; densidade → pontos aparecem.
- Só `transform`/`opacity` (e `drawSVG`). Nada de animar `width/height/top/left` em loop.

## 5. Conteúdo — regras inegociáveis

1. **Tudo em PT-BR.** Nomes de produto (BORA OPEN, POWERED, PASS…) e jargão consolidado (CRM, CAC, LTV, MRR, check-in, B2B2C, playbook) ficam como estão.
2. **Nunca apresentar hipótese como dado.** Não invente clientes, receita, CAC, parceiros ou resultados. Números só em simulações com premissas ajustáveis, marcadas com `SimPanel` (tag “Simulação” + nota) ou `<Tag kind="illustrative|example|demo|hypothesis" />`.
3. Empresas reais só onde o briefing pede (Liga) e com o aviso “não são clientes”.
4. Dados da BORA atual só os públicos já em `02-problem.ts`, marcados como declarados.
5. Pouco texto. Manchetes fortes. Explicação em ≤ 2 linhas.

## 6. Exemplos, tabelas e simulações (pedido do cliente)

Cada slide de produto deve ter **um exemplo concreto** (marcado como exemplo) e, quando fizer sentido, **uma tabela** e/ou **uma simulação interativa**:

- `SimPanel` + `Slider` (premissas) + `Stat` (resultados animados). Defaults plausíveis e redondos; valores exibidos com `fmtInt`, `fmtPct`, `fmtBRL` de `@/lib/format`.
- A simulação precisa ser entendida em 10 segundos: 2–4 premissas, 2–4 resultados, 1 resultado principal com `accent`.
- `DataTable` para comparativos (tabelas qualitativas não precisam de números).
- A simulação vive no passo em que o apresentador vai falar dela; deve funcionar com mouse **e** teclado, e não roubar as setas (os sliders usam as setas só quando focados — tudo bem).
- Nada essencial escondido só em hover (hover = aprofundamento).

## 7. Acessibilidade e performance

- Controles com rótulo (`aria-label`), foco visível (já global), `role` correto.
- SVG decorativo com `aria-hidden`. Texto do diagrama como texto real (HTML) sempre que possível.
- Sem bibliotecas novas. Sem canvas/WebGL. Sem imagens pesadas (fotos: WebP ≤ 250 KB em `public/brand`).
- Limpe tudo: `useGSAP`/`useStepTimeline` já revertem; loops criados manualmente precisam de `kill()` no cleanup.

## 8. Propriedade de arquivos (trabalho em paralelo)

Você só edita: seus `src/slides/SXX*.tsx`, seus `src/content/slides/NN-*.ts` e arquivos **novos** que você criar (ex.: `src/components/diagrams/Timeline.tsx`, CSS module `src/slides/SXXNome.module.css`). Não edite `globals.css`, `deck.ts`, `projects.ts`, primitivos de `ui/` ou `deck/`, nem slides de outras pessoas. Precisa de algo global? Crie localmente e registre a necessidade no relatório final.

CSS específico: prefira utilitários Tailwind; para estilos complexos, crie `SXXNome.module.css` e use `data-a="…"` como alvo de animação.

## 9. QA obrigatório

Com o dev server rodando em `http://localhost:3000`:

```bash
# screenshot do slide (índice base 0) em um passo; w h opcionais
node /private/tmp/claude-501/-Users-alexrodrigues-Projetos-Bora-Assessoria-Growth/dfc231b2-3dbf-4446-bd58-6411b86caf0c/scratchpad/qa/goto.mjs <saida.png> <indice> <passo> 1440 900
```

Verifique cada passo em 1440×900 e 1920×1080, olhe as imagens (Read), corrija. Rode `npx tsc --noEmit` e `npx eslint src/slides/SXX*.tsx`. Console sem erros.

## 10. Slide de produto: o padrão de "ação explicada"

Todo slide de ação (OPEN, CHALLENGES, POWERED, CAPTAINS, HOUSE, ENTERPRISE, PASS, BOOST, LEAGUE) segue a mesma estrutura, para a diretoria reconhecer o formato:

1. Linha de cima: número, nome do produto e `<StageTag of="id" />`.
2. Manchete: a conclusão do slide.
3. Logo abaixo, uma linha em português do que é (nome em inglês nunca sozinho).
4. Aprofundamento: exemplo rotulado, tabela e/ou simulação.
5. **Último passo: a ficha da ação.** Renderize `<ActionBrief id="open" />` no fim da raiz do slide e chame `revealBrief(tl, q)` no último `step()` (some 1 em `meta.steps`). No celular, a ficha vira um bloco no fim do slide.

Os textos da ficha vêm de `plain`, `why` e `howTo` em `GROWTH_PROJECTS`. Passos de execução são plano, não resultado: concretos, simples e sem metas inventadas (a meta aparece como "A definir com o time").

## 11. Lições do trabalho em paralelo

- **Copy**: siga `docs/COPY_GUIDE.md`. Nenhum travessão (—) em texto visível, inclusive `aria-label`, `alt`, células vazias e notas.
- **Nome**: a apresentação é "BORA Growth · Pack de Ações e Projetos"; o conceito de rede é "Rede BORA".
- **Estágio**: use `<StageTag of="id" />` (de `@/components/ui/StageTag`) para o estágio da ação, nunca `Tag kind="proposed"`. A fonte é `stage` em `GROWTH_PROJECTS`.
- **DrawSVG + `vector-effect: non-scaling-stroke`** desenha segmentos soltos no fim do caminho. Não combine os dois.
- **Painel revelado depois**: se só os filhos ficam escondidos, o contêiner visível continua bloqueando cliques. Esconda o contêiner até o passo dele.
- **Rebuild por `deps`**: o `useStepTimeline` agora leva a timeline reconstruída direto ao passo atual. No modo celular, cada slide toca inteiro em no máximo cerca de 3 s.
- **Tabelas**: `.data-table` usa `border-collapse: separate`, então revelar linha a linha não mostra a grade vazia. `DataTable` aceita arrays `readonly` direto do conteúdo.
- **Marca-texto no celular**: `.hl` quebra linha abaixo de 768px (fundo por fragmento). Não precisa de override local.
- **Estado derivado**: não chame `setState` dentro de `useEffect` para "resetar" estado ao mudar de passo (o lint bloqueia). Derive do passo ou ajuste o estado durante a renderização.
