# BORA Growth · Pack de Ações e Projetos

**As ações e projetos de growth para a BORA Assessoria Brasil: o que já está rodando, o que está no backlog e o que ainda é ideia.**
Apresentação executiva interativa, feita para ser apresentada ao vivo numa reunião estratégica com a liderança da BORA.

> Ideia central: **não é sobre conquistar corredores um a um. É sobre conquistar comunidades.** Com estratégia, método e organização.

---

## Rodar e apresentar

```bash
npm install
npm run dev          # http://localhost:3000
```

Para a reunião, use a versão de produção (mais rápida e estável):

```bash
npm run build && npm start
```

Versão 100% estática (abre sem servidor Node, ideal para apresentar offline ou hospedar em qualquer lugar):

```bash
npm run build:static   # gera a pasta /out
npx serve out          # ou qualquer servidor estático
```

### Atalhos

| Tecla | Ação |
| --- | --- |
| `→` `↓` `Space` `PageDown` | Avança (próximo passo ou próximo slide) |
| `←` `↑` `Shift+Space` `PageUp` | Volta |
| `Home` / `End` | Primeiro / último slide |
| `M` | Mapa da apresentação (salta para qualquer slide) |
| `P` | Pastas de projetos: cada ação do pack com ficha, estágio e atalho para o slide |
| `F` | Tela cheia |
| `ESC` | Fecha mapa e painéis |

- Funciona com **clicker** (os passadores comuns enviam `PageDown`/`PageUp` ou setas).
- O **scroll** do trackpad/mouse também navega; a página sempre "encaixa" num passo, nunca para entre dois slides.
- Rodapé: `06 / 28` + marcadores dos passos do slide atual (você sempre sabe se ainda há algo para revelar).
- Link direto para um slide: `/#powered`, `/#portfolio`, `/#method` etc.
- No slide "O pack", clicar numa ação abre a ficha dela nas pastas.
- Dica de ensaio: abra no Chrome, aperte `F` e percorra tudo com `→` antes da reunião.

---

## Estágio de cada ação (Rodando · Backlog · Ideia)

Fonte única: o campo `stage` de cada item em **`GROWTH_PROJECTS`**, em `src/content/projects.ts`.

| Estágio | Significado | Visual |
| --- | --- | --- |
| `rodando` | Já está em execução na BORA | ●●● volt sólido |
| `backlog` | Desenhado e priorizado, entra na próxima janela | ●●○ contorno |
| `ideia` | Hipótese a validar antes de virar projeto | ●○○ tracejado |

Mudou o estágio de um projeto? Edite só o `stage` dele. O quadro do pack, as pastas do mapa, o mapa da rede, o ecossistema, os selos dos slides e as contagens se atualizam sozinhos. Para mostrar o estágio num slide: `<StageTag of="open" />`.

---

## Editar textos

Todo texto visível está em **`src/content/slides/`**, um arquivo por slide, com `meta` (título, passos, tema) e `copy` (textos). O padrão de escrita está em **`docs/COPY_GUIDE.md`** (sem travessões, voz da BORA, regras de honestidade).

- `**texto**` vira negrito (a voz da BORA: "Não é sobre ser rápido. **É sobre começar.**")
- `==texto==` vira marca-texto volt animado
- Manchetes são arrays: **cada item é uma linha** e precisa caber numa linha (a revelação é por máscara).
- `meta.steps` = quantas vezes se aperta `→` dentro do slide. Se mudar, ajuste a timeline do slide em `src/slides/`.
- `meta.theme` = `"dark"` ou `"light"` (a apresentação alterna claro e escuro, como o site da BORA).

**Produtos e projetos** (fonte única): `src/content/projects.ts`
- `GROWTH_PROJECTS`: todas as ações do pack (frente, estágio, objetivo, métrica, horizonte, dependências) e a explicação de cada uma: `plain` (o que é, em português simples), `why` (por que importa) e `howTo` (3 passos de execução; para ideias, de validação).
- `PROJECTS`: os produtos da rede (mapa da rede, painéis laterais, exemplos) e `pt`, a legenda em português de cada nome em inglês.

**Ficha da ação** (`ActionBrief`, em `src/components/ui/ActionBrief.tsx`, textos fixos em `src/content/brief.ts`): o mesmo formato no método, no último passo de cada slide de produto e nas pastas (tecla P). Mudou o `plain`, o `why` ou o `howTo` de uma ação? A ficha se atualiza em todos os lugares.

**Narrativa** (começo, meio e fim, ordem e papel de cada slide): `docs/NARRATIVE.md`.

**Currículo** (slide "Quem apresenta"): `src/content/slides/01b-profile.ts`. Para usar uma foto, salve a imagem em `public/brand/` e aponte o campo `photo` para ela.

**Ordem e capítulos**: `src/content/deck.ts`.

### Regra de honestidade dos dados

- **Estágio** (Rodando / Backlog / Ideia) diz em que pé está cada ação. Rodando não é resultado: nenhum resultado é afirmado sem dado medido.
- `BORA atual`: fatos públicos declarados pela própria BORA, sempre com fonte.
- `Exemplo`, `Exemplo fictício`, `Hipótese`, `Ilustrativo`, `Dados demo`, `Simulação`, `Arquitetura-alvo`: tudo que não é dado real.

Nenhuma receita, CAC, cliente ou parceiro é inventado. Os números das **simulações** são premissas ajustáveis ao vivo (sliders), sempre rotuladas como tal.

---

## Roteiro (28 slides, 8 capítulos, 3 atos)

Detalhes em `docs/NARRATIVE.md`.

**Começo · por que mudar**
1. **Abertura**: hero · quem apresenta (currículo) · a proposta (uma frase e o roteiro)
2. **A virada**: o problema · a tese

**Meio · o que fazer e como**
3. **O pack**: o quadro das ações por frente e estágio · o método de growth
4. **O que já roda**: a base do funil · a Rede BORA · OPEN · CHALLENGES · POWERED · entrar e expandir · CAPTAINS · HOUSE · ENTERPRISE
5. **O que vem depois** (ideias a validar): PASS · BOOST · LEAGUE
6. **O sistema**: ecossistema de growth · BORA OS · a roda de crescimento (flywheel) · pipeline de expansão

**Fim · o plano e a decisão**
7. **O plano**: Brasília Lab (90 dias) · o que medimos · o papel
8. **Fechamento**: próximos passos (o que proponho à diretoria) · construa a rede

Cada slide de produto segue o mesmo padrão: rótulo com o nome e o estágio, manchete com a conclusão, uma linha em português do que é, o aprofundamento (exemplo, tabela, simulação) e, no último passo, a ficha da ação.

---

## Estrutura

```
src/
  app/                 layout (fontes, metadata), page, globals.css (design tokens)
  content/             TODOS os textos e dados (edite aqui)
    slides/            um arquivo por slide
    projects.ts        ações, estágios e produtos (fonte única)
    deck.ts            ordem e capítulos
  components/
    deck/              motor da apresentação (store, seção sticky, teclado, progresso, mapa, pastas)
    ui/                SectionHeader, SplitHeadline, Tag, StageTag, Toggle, Slider, Stat, SimPanel, DataTable, InteractiveTooltip
    diagrams/          NetworkGraph, Flywheel, EcosystemMap, MetricTree, …
    panels/            ProjectModal (painel lateral de produto)
    brand/             marca BORA vetorizada (BoraWordmark, BoraShield, BoraLockup)
  slides/              um componente por slide
  lib/                 gsap.ts (registro de plugins), motion.ts (presets), format.ts, utils.ts
docs/
  COPY_GUIDE.md        padrão de escrita
  SLIDE_GUIDE.md       guia para criar e editar slides (contrato do motor, design, QA)
  PLAN.md              auditoria, tokens, arquitetura e storyboard
public/brand/          assets oficiais da BORA (logo, contornos, fotos otimizadas)
```

---

## Design system

Interpretação premium da identidade atual da BORA (estudada em boraassessoria.com):

- **Cor**: volt `#ceff00` (token oficial `--bora-verde`), usado como sinal: conexões ativas, ações rodando, resultado principal, marca-texto. Variações oficiais `#a6cf00` e `#5c6e00`.
- **Temas**: escuro (quase-preto esverdeado + off-white `#eef0e6` da BORA) e claro (`#f7f9ef`, do site). Tokens em `src/app/globals.css`.
- **Tipografia**: **Lexend** (Google Fonts), a alternativa gratuita mais próxima da Altone, fonte comercial do site. Manchetes em peso leve com **negrito** na ideia principal. **Geist Mono** para números e dados.
- **Marca**: wordmark e escudo vetorizados dos arquivos públicos; lockup "BORA / GROWTH" no mesmo sistema de "BORA / ASSESSORIA"; grafismo oficial de contornos do raio (`.contours`).
- **Linguagem visual**: ponto = corredor · aglomerado = comunidade · volt = BORA e ações rodando · tracejado = ideia ou hipótese.
- **Grid** de 12 colunas, muito espaço negativo, linhas finas, pílulas e raios da família do site.

## Motion system

GSAP 3.15 (+ ScrollTrigger, Flip, SplitText, DrawSVG, MotionPath, ScrollTo, CustomEase, todos no pacote público, licença gratuita). Princípios: **revelar, transformar, conectar, focar, causa e efeito**.

- Presets em `src/lib/motion.ts` (`rise`, `fade`, `unmask`, `draw`, `pop`, `dim`, `hold`), curva `bora` (a mesma do site), sem bounce.
- Cada slide tem uma timeline por passos (`useStepTimeline`): `→` toca o próximo trecho; `←` rebobina rápido.
- **Reduced motion**: respeitado em tudo (vira fade curto; sem loops, parallax ou rotação).

---

## Decisões técnicas

- **Uma posição de scroll = um estado.** Cada seção tem altura `100svh + (passos − 1) × 70svh` com palco `sticky`. Scroll natural, teclado e mapa usam o mesmo cálculo: a apresentação nunca "se perde", inclusive ao entrar em tela cheia.
- **Sticky + ScrollTrigger** em vez de `pin` do ScrollTrigger: mais robusto com React (sem reparenting). O ScrollTrigger deriva o estado, faz o snap para os passos e controla os scrubs.
- **Sem Lenis**: a navegação é por passos com saltos instantâneos dentro do palco fixo; o scroll nativo do Mac já é suave e o Lenis conflitaria com o snap.
- **Manchetes divididas no servidor** (sem SplitText em runtime): zero layout shift e texto acessível.
- **Hero com revelação em CSS** (pinta antes da hidratação) e foto pré-otimizada em WebP responsivo (LCP rápido).
- **Slides montam sob demanda** (perto da viewport) e cada um tem um *error boundary*: se um slide falhar, só ele mostra aviso.
- Next.js 16.3 (Turbopack) · React 19 · **TypeScript 6** (o TS 7 nativo ainda não expõe a API usada pelo `next build`) · Tailwind 4 · **ESLint 9** (o `eslint-plugin-react` do eslint-config-next ainda não suporta o ESLint 10).

```bash
npm run typecheck
npm run lint
```

## Acessibilidade

Navegação completa por teclado, foco visível, `aria-label` nos controles, região `aria-live` anunciando o slide atual, contraste AA nos dois temas, conteúdo essencial nunca escondido só em hover, `prefers-reduced-motion`.

## Créditos

Marca, cores e fotos: BORA Assessoria (arquivos públicos de boraassessoria.com), usados nesta apresentação interna para a própria BORA. Clube "Sunset Run Club" e demais entidades de exemplo são fictícios.
