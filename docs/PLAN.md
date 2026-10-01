# BORA Growth (antes BORA NETWORK): plano de construção

> Documento de planejamento (etapa 35 do briefing). Escrito antes da implementação e mantido como referência de arquitetura.

## 0. Revisões após o plano inicial (pedidos do cliente durante a construção)

### Revisão de 30/09/2026
- Nome: **BORA Growth · Pack de Ações e Projetos** (lockup "BORA / GROWTH"). O conceito de rede passa a ser **Rede BORA**.
- **Estágios** (Rodando / Backlog / Ideia) informados pelo Alex para cada ação, em `GROWTH_PROJECTS.stage`. Novos itens de funil: Landing por cidade e Conteúdo por intenção (rodando), Preço único e Pré-cadastro com plano (backlog).
- Novos slides: **Quem apresenta** (currículo do Alex, a partir de `Profile_Alex.pdf`), **O pack** (quadro frente × estágio) e **O método** (ciclo de growth, ICE, ficha por ação, cadência). Capítulos "Abertura" e "O pack".
- Mapa ganha a aba **Projetos** (tecla P): pastas por frente com a ficha de cada ação e atalho para o slide.
- Revisão de copy em todos os slides, sem travessões (`docs/COPY_GUIDE.md`).

| Pedido | Decisão |
| --- | --- |
| Usar a foto `image-ee789d9693` no hero | Foto da comunidade BORA revelada no hero: os pontos (corredores) se agrupam em comunidades e se dissolvem na comunidade real. WebP responsivo (≤ 315 KB), pintada desde o carregamento sob uma camada (LCP rápido). |
| "Quero tudo em PT Brasil" | Todo o conteúdo em PT-BR. Nomes de produto (BORA OPEN, POWERED, PASS…) e jargão consolidado (CRM, CAC, check-in…) mantidos. |
| "Veja como é a estrutura visual da BORA" | Identidade realinhada ao site: **Lexend** (mais próxima da Altone), manchetes em peso leve + **negrito**, marca-texto volt (mesmo desenho do `.marca-txt` do site), pílulas, raios da família do site, **alternância de slides claros e escuros**, grafismo oficial de contornos do raio. Substitui a direção inicial (Mona Sans condensada, só tema escuro). |
| Exemplos, tabelas e simulações dos produtos e projetos | Cada produto ganhou exemplo marcado, tabela quando cabe e simulação interativa (`SimPanel` + `Slider` + `Stat`) com premissas ajustáveis ao vivo, sempre rotuladas. |
| "Mostre o ecossistema de projetos de growth" | Novo slide 18 (Ecossistema de growth): mapa + tabela + "monte o portfólio", alimentado por `GROWTH_PROJECTS` em `projects.ts`. Total: 22 slides. |

## 1. Auditoria

| Item | Resultado |
| --- | --- |
| Projeto | Pasta vazia. Stack criada do zero. |
| Stack | Next.js 16.3 (App Router, Turbopack) · React 19.3 · TypeScript 6 · Tailwind CSS 4 · GSAP 3.15 + @gsap/react |
| TypeScript | Fixado em 6.0.3: o TS 7 (port nativo) não expõe a API JS que o `next build` usa para checar tipos. |
| GSAP | Todos os plugins usados (ScrollTrigger, Flip, SplitText, DrawSVG, MotionPath, ScrollTo, CustomEase) estão no pacote público `gsap` sob a licença gratuita da GreenSock (pós-Webflow). Uso legal. |
| Lenis | **Não usado.** A navegação é por passos (teclado/clicker) com palcos `sticky`; o scroll nativo do Mac já é suave e o Lenis conflitaria com snap + saltos instantâneos entre passos. |

### Assets oficiais da BORA (fonte: boraassessoria.com, set/2026)

- **Cor principal:** `--bora-verde: #ceff00` (volt). Variações oficiais: `#a6cf00` (pressed), `#5c6e00` (profundo).
- **Neutros do site:** `#0b0d0a`, `#0a0a0a`, `rgba(5,6,4,.8)`, off-white `#eef0e6` / `#f7f9ef`.
- **Easing do site:** `cubic-bezier(.16,1,.3,1)` → registrado como `CustomEase("bora")`.
- **Marca:** wordmark "BORA" (Λ sem travessa) + escudo com raio. Vetorizados a partir dos PNGs públicos → `src/components/brand/BoraMark.tsx`.
- **Fonte do site:** Altone (comercial) → **não usada**. Substituta: **Mona Sans** (Google Fonts, eixo de largura 75–125), que permite manchetes condensadas de 180px e texto normal na mesma família. Rótulos de sistema em **Geist Mono**.

### Contexto real (diagnósticos públicos de 30/09/2026)

Usado apenas como **Current BORA · dado público**: 3.000+ atletas (declarado), núcleos em 7 regiões, treinador + app Runy + apoio em provas. Nenhum número de receita, CAC, conversão ou cliente é inventado.

## 2. Design tokens

Definidos em `src/app/globals.css` (`:root`), expostos ao Tailwind via `@theme inline`.

| Token | Valor | Uso |
| --- | --- | --- |
| `--bg-primary` | `#080907` | Palco |
| `--bg-secondary` / `--surface` / `--surface-2` | `#0d0f0c` / `#121510` / `#191c17` | Planos de profundidade |
| `--text-primary` | `#eef0e6` | Texto principal (17:1) |
| `--text-secondary` | `#a3a69c` | Explicações (8:1) |
| `--text-tertiary` | `#7a7d74` | Rótulos (4,8:1 — AA) |
| `--border` / `--border-strong` / `--line` | off-white 10% / 20% / 30% | Hairlines e diagramas |
| `--brand` | `#ceff00` | BORA Network, atividade, conexões |
| `--club` | `#ff7a3d` | Clube fictício (mostra que o clube mantém identidade própria) |

**Escala tipográfica:** display XL `clamp(72px, 10.6vw, 180px)` → display M `clamp(40px, 4.8vw, 84px)` → lede `clamp(17px, 1.3vw, 21px)` → rótulo mono 11px.
**Grid:** 12 colunas, margem `clamp(20px, 4.4vw, 84px)`, gutter `clamp(12px, 1.6vw, 28px)`.
**Motion:** 0,5s / 0,8s / 1,2s / 1,8s · `bora` (expo-out da marca), `power2/3`, `expo`. Sem bounce/elastic.

### Linguagem visual

| Elemento | Significado |
| --- | --- |
| Ponto pequeno off-white | Um corredor |
| Aglomerado de pontos | Uma comunidade |
| Nó / linha volt | BORA Network (proposto), conexão ativa |
| Linha tracejada | Hipótese, opcional, arquitetura-alvo |
| Rótulo mono | Metadado de sistema |

**Status epistêmico** (componente `Tag`, sempre visível quando há dado ou exemplo): `CURRENT BORA` (sólido neutro) · `PROPOSED` (volt) · `ILLUSTRATIVE` / `EXAMPLE` / `CONCEPT` / `DEMO DATA` / `HYPOTHESIS` / `TARGET ARCHITECTURE` (contorno tracejado).

## 3. Arquitetura da apresentação

```
page.tsx → <Deck>
  ├─ Chrome (marca + capítulo)            fixed
  ├─ ProgressIndicator ("06 / 21" + passos) fixed
  ├─ KeyboardNavigation                    ← → Space PgUp PgDn ↑ ↓ Home End · F · M · ESC
  ├─ PresentationMap (M)                   overlay
  └─ PresentationSection × 21              <section> alto = 100svh + (passos-1) × 70svh
        └─ palco sticky 100svh             ← o "slide"
              └─ Slide (monta sob demanda, perto da viewport)
```

- **Uma posição de scroll = um estado.** O `deck-store` mede as seções e deriva, para cada slide, `entered` e `step` a partir do `scrollY`. Scroll natural, teclado e mapa usam o mesmo modelo.
- **Passos internos:** a timeline GSAP de cada slide tem rótulos `s0…sN`; quando o passo muda, `tweenTo(sN)` toca a animação desenhada (para frente em 1×, para trás acelerado).
- **Teclado:** passo dentro do mesmo slide = salto instantâneo de scroll (o palco está fixo, sem latência); troca de slide = tween de scroll de 1,1s com o próximo slide cobrindo o anterior.
- **Scrub** (ScrollTrigger) só onde o gesto de rolar é a narrativa: construção do flywheel.
- **Snap** global para posições de passo, para nunca parar entre dois slides.
- **Resize/fullscreen (F):** o slide e o passo atuais são preservados após o `refresh`.
- **Modo fluxo** (< 768px de largura ou < 560px de altura): seções empilhadas, cada slide toca inteiro ao entrar.
- **Reduced motion:** só opacidade, durações curtas, sem loops/parallax, troca de slide instantânea.
- **Hero:** revelação inicial em CSS puro (pinta antes da hidratação → LCP rápido); a transformação vem depois via GSAP.

## 4. Mapa de componentes

| Camada | Componentes |
| --- | --- |
| Deck | `Deck`, `PresentationSection`, `KeyboardNavigation`, `ProgressIndicator`, `PresentationMap`, `Chrome`, `deck-store` |
| UI | `SectionHeader`, `SplitHeadline`, `Tag`, `Toggle`, `InteractiveTooltip`, `BoraMark` |
| Diagramas | `FlowDiagram`, `NetworkGraph`, `ProjectNode`, `MetricTree`, `ComparisonTable`, `Timeline`, `Flywheel`, `ArchitectureDiagram`, `DotField` |
| Painéis | `ProjectModal`, `UseCasePanel` |
| Motion | `lib/gsap.ts` (registro de plugins), `lib/motion.ts` (presets + reduced motion), `useStepTimeline`, `useSlide` |
| Conteúdo | `content/projects.ts` (fonte única dos produtos), `content/deck.ts` (ordem, capítulos, passos), `content/copy.ts` (todos os textos) |

## 5. Storyboard resumido (versão inicial — ver slides em `src/content/slides/` para a versão final em PT-BR, 22 slides)

| # | Slide | Ideia única | Passos (→) |
| --- | --- | --- | --- |
| 01 | Hero | Não adquirir corredores; adquirir comunidades | Pontos soltos (corredores) se agrupam em comunidades enquanto a frase é empurrada |
| 02 | The Problem | Crescer atleta por atleta é linear | Contexto atual → funil AD→COACHING com um ponto por vez → FLIP para COMMUNITY→REVENUE; mídia vira amplificador |
| 03 | The Thesis | Ir onde os corredores já estão | Lugares dispersos → convergem no núcleo BORA → núcleo expande em BORA NETWORK com canal de entrada de cada um |
| 04 | The BORA Network | 9 produtos, uma camada comum | OS → OPEN → POWERED → ENTERPRISE → demais; clique abre painel lateral |
| 05 | BORA OPEN | Porta de entrada gratuita ≠ coaching grátis | Fluxo → simulação (evento gera IDs, poucos seguem) → OPEN × COACHING |
| 06 | BORA POWERED | O clube continua dele; a BORA vira infraestrutura | Clube → sem BORA (fragmentado) → com BORA (FLIP) → CLUB + BORA = B2B2C |
| 07 | Land and Expand | Aprofundar degrau por degrau | 7 degraus acendem um a um → "Don't steal the community" |
| 08 | BORA BOOST | Verba de marca vira capital de crescimento | Cadeia → vira circuito animado → o que cada parte recebe |
| 09 | BORA ENTERPRISE | Corrida como plataforma de engajamento | START → RUN CLUB → RACE TEAM → LEAGUE (painel à direita) |
| 10 | BORA LEAGUE | Um produto, várias camadas de receita | Temporada + pontuação → leaderboard reordena (FLIP) → pilha de receita |
| 11 | BORA CHALLENGES | Vender a próxima meta antes da assinatura | Assinatura × desafio → catálogo → rotas até o Coaching |
| 12 | BORA PASS | Pertencer sem precisar de treinador | Manchete → tabela ID/PASS/COACHING → círculo do mercado se expande |
| 13 | BORA CAPTAINS | Demanda antes de infraestrutura | Mapa abstrato: capitães → pontos → densidade → nasce um HUB |
| 14 | BORA HOUSE | Suporte de prova como produto | Timeline sex→pós-prova → públicos → receitas |
| 15 | BORA OS | A camada que conecta tudo | Identity layer → módulos → integrações-alvo → "What should BORA know?" |
| 16 | The Flywheel | Crescimento vira efeito de rede | Estágios acendem com o scroll → a roda ganha movimento |
| 17 | Expansion Pipeline | Pipeline, não obrigação | Rota A → Rota B → convergem em BORA CITY → saídas legítimas |
| 18 | Brasília Lab | Brasília é o primeiro laboratório | 0–30 → 31–60 → 61–90 → Playbook V1 → próxima cidade |
| 19 | What We Measure | Uma North Star, cinco árvores | North Star → ramos → métricas |
| 20 | The Role | Onde/quem × como | Diretor de Expansão → Alex → ponte "Expansion Strategy & Growth" |
| 21 | Final | Build the network | Frase → BORA → Brasília is the lab. Brazil is the project. |

## 6. Ordem de implementação

1. Fundação: tokens, registro GSAP, deck-store, seção, teclado, progresso, mapa.
2. Cinco telas que definem a linguagem: **Hero, Problem, Network, Powered, Flywheel**.
3. Revisão visual (screenshots 1440×900 e 1920×1080) e ajuste do sistema.
4. Demais 16 telas sobre o sistema consolidado.
5. QA: teclado, resize/fullscreen, reduced motion, tablet, mobile, Lighthouse.
