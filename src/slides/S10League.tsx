"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useDeck, useSlide } from "@/components/deck/hooks";
import { useStepTimeline } from "@/components/deck/useStepTimeline";
import { Leaderboard, type LeaderboardHandle, type LeaderboardRow } from "@/components/diagrams/Leaderboard";
import { ActionBrief, revealBrief } from "@/components/ui/ActionBrief";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { SectionHeader, revealHeader, revealHighlights } from "@/components/ui/SectionHeader";
import { Slider } from "@/components/ui/Slider";
import { SplitHeadline } from "@/components/ui/SplitHeadline";
import { StageTag } from "@/components/ui/StageTag";
import { Tag } from "@/components/ui/Tag";
import { copy, type LeagueCompany } from "@/content/slides/10-league";
import { gsap } from "@/lib/gsap";
import { fade, motionPrefs, rise, unmask } from "@/lib/motion";
import { cn, pad2 } from "@/lib/utils";
import s from "./S10League.module.css";

// ── Temporada simulada (determinística, mesmas regras da tabela de pontuação) ──────────────
const WEEKS = 8;
const RULES = copy.scoringRules;
const CHALLENGE_WEEKS: readonly number[] = RULES.challengeWeeks;
/** Segundos por semana na reprodução automática. */
const WEEK_DUR = 1.15;

function weekly(c: LeagueCompany, w: number) {
  const checkins = Math.round(c.pp[w - 1] * RULES.checkin);
  const streak = Math.round(c.pc * Math.min(w, RULES.streakCap) * RULES.streakStep);
  const ci = CHALLENGE_WEEKS.indexOf(w);
  const challenge = ci >= 0 ? Math.round(c.de[ci] * RULES.challenge) : 0;
  const final = w === WEEKS ? Math.round(c.ev * RULES.final) : 0;
  const perf = Math.round(c.cp * RULES.perf);
  return { base: checkins + streak + challenge + final, perf };
}

/** Classificação acumulada da semana 0 (pré-temporada) à 8. */
const STANDINGS: LeaderboardRow[][] = (() => {
  const acc = new Map<string, { base: number; perf: number }>(copy.companies.map((c) => [c.id, { base: 0, perf: 0 }]));
  const out: LeaderboardRow[][] = [];
  let prev = new Map<string, number>();
  for (let w = 0; w <= WEEKS; w++) {
    if (w > 0) {
      for (const c of copy.companies) {
        const x = weekly(c, w);
        const a = acc.get(c.id)!;
        a.base += x.base;
        a.perf += x.perf;
      }
    }
    const rows: LeaderboardRow[] = copy.companies.map((c) => {
      const a = acc.get(c.id)!;
      return { id: c.id, name: c.name, total: a.base + a.perf, perf: a.perf, delta: null };
    });
    rows.sort((a, b) => b.total - a.total || a.name.localeCompare(b.name, "pt-BR"));
    rows.forEach((r, i) => {
      r.delta = w >= 2 ? (prev.get(r.id) ?? i) - i : null;
    });
    prev = new Map(rows.map((r, i) => [r.id, i]));
    out.push(rows);
  }
  return out;
})();
const MAX = Math.max(...STANDINGS[WEEKS].map((r) => r.total));

type ScoreRow = (typeof copy.scoring)[number];
const SCORE_COLUMNS: Column<ScoreRow>[] = [
  {
    key: "category",
    label: copy.scoringCols.category,
    render: (r) => (
      <span className="whitespace-nowrap">
        <i className={s.swatch} data-perf={r.id === "cp" ? "" : undefined} aria-hidden="true" />
        {r.category}
      </span>
    ),
  },
  { key: "action", label: copy.scoringCols.action },
  { key: "points", label: copy.scoringCols.points, align: "right", mono: true, className: "whitespace-nowrap max-md:whitespace-normal" },
];

const WEEK_LIST = Array.from({ length: WEEKS }, (_, i) => i + 1);
const PAYER_COUNTS = (["company", "brand", "runner"] as const).map((p) => ({
  id: p,
  label: copy.payers[p],
  count: copy.stack.filter((l) => l.payer === p).length,
}));

export function LeagueSlide() {
  const slide = useSlide();
  const { mode } = useDeck();
  const flow = mode === "flow";

  // ── Semana exibida + reprodução automática ─────────────────────────
  const [week, setWeek] = useState(0);
  const [playing, setPlaying] = useState(false);
  const weekRef = useRef(0);
  const runRef = useRef<gsap.core.Timeline | null>(null);
  const boardRef = useRef<LeaderboardHandle>(null);

  const goWeek = useCallback((w: number) => {
    if (w === weekRef.current) return;
    boardRef.current?.capture(); // posições atuais → o Flip anima a troca de ordem
    weekRef.current = w;
    setWeek(w);
  }, []);

  const stop = useCallback(() => {
    runRef.current?.kill();
    runRef.current = null;
    setPlaying(false);
  }, []);

  const play = useCallback(
    (from: number) => {
      runRef.current?.kill();
      const tl = gsap.timeline({
        onComplete: () => {
          runRef.current = null;
          setPlaying(false);
        },
      });
      for (let w = from; w <= WEEKS; w++) tl.call(goWeek, [w], (w - from) * WEEK_DUR);
      tl.to({}, { duration: 0.6 });
      runRef.current = tl;
      setPlaying(true);
    },
    [goWeek],
  );

  // Entrar no passo 1 com o slide em cena: a temporada toca da semana 1 à 8 (movimento reduzido: vai direto à 8).
  const boardActive = slide.current && slide.entered && slide.step === 1 && !flow;
  useEffect(() => {
    if (!boardActive) return;
    const reduced = motionPrefs.reduced;
    const start = gsap.delayedCall(reduced ? 0 : 0.9, () => {
      if (reduced) goWeek(WEEKS);
      else if (weekRef.current < WEEKS) play(weekRef.current + 1);
      else setPlaying(false);
    });
    return () => {
      start.kill();
      runRef.current?.kill();
      runRef.current = null;
    };
  }, [boardActive, goWeek, play]);

  // Saiu do slide por baixo (voltou para o anterior): a temporada recomeça na próxima entrada.
  useEffect(() => {
    if (slide.entered) return;
    const reset = gsap.delayedCall(0, () => {
      runRef.current?.kill();
      runRef.current = null;
      weekRef.current = 0;
      setWeek(0);
      setPlaying(false);
    });
    return () => {
      reset.kill();
    };
  }, [slide.entered]);

  const isPlaying = playing && boardActive;
  const shownWeek = flow && week === 0 ? WEEKS : week;
  const rows = STANDINGS[shownWeek];
  const trackWeek = slide.step >= 1 || flow ? shownWeek : 0;
  const pickWeek = (w: number) => {
    stop();
    goWeek(w);
  };

  const { scope } = useStepTimeline(
    ({ step, q, reduced }) => {
      // 0 · Manchete + temporada + proposta de pontuação
      step(0, (tl) => {
        revealHeader(tl, q);
        fade(tl, q("[data-a='season-title']"), 0.4);
        if (reduced) fade(tl, q("[data-a='season-line']"), 0.5);
        else tl.from(q("[data-a='season-line']"), { scaleX: 0, duration: 1.2, ease: "power3.inOut" }, 0.5);
        tl.from(q("[data-a='wk']"), { autoAlpha: 0, scale: reduced ? 1 : 0.4, duration: 0.5, ease: "bora", stagger: 0.08 }, 0.55);
        fade(tl, q("[data-a='season-meta']"), 1.0, { stagger: 0.08 });
        rise(tl, q("[data-a='chip']"), 1.1, { stagger: 0.04, y: 10, duration: 0.6 });
        rise(tl, q("[data-a='scoring-head']"), 0.5, { y: 14 });
        rise(tl, q("[data-a='scoring'] .dt-row"), 0.65, { stagger: 0.07, y: 12 });
        fade(tl, q("[data-a='scoring-note']"), 1.2);
      });

      // 1 · A classificação semana a semana (a reprodução é imperativa, ver efeito acima)
      step(1, (tl) => {
        if (!flow) tl.to(q("[data-a='scoring']"), { autoAlpha: 0, y: reduced ? 0 : -14, duration: 0.4, ease: "power2.in" }, 0);
        // O painel inteiro fica oculto até o seu passo (senão, vazio, ele intercepta cliques).
        tl.from(q("[data-a='board']"), { autoAlpha: 0, duration: 0.01 }, 0);
        rise(tl, q("[data-a='board'] [data-a='in']"), flow ? 0 : 0.3, { stagger: 0.08, y: 18 });
      });

      // 2 · Um produto, várias camadas de receita
      step(2, (tl) => {
        tl.to(q(".sh-title .split-unit"), {
          yPercent: reduced ? 0 : -112,
          autoAlpha: 0,
          duration: reduced ? 0.3 : 0.55,
          ease: "power3.in",
          stagger: 0.03,
        }, 0);
        unmask(tl, q("[data-a='rev-title'] .split-unit"), 0.45, { stagger: 0.05 });
        revealHighlights(tl, q("[data-a='rev-title'] .hl"), 1.05);
        tl.to(q(".sh-lede"), { autoAlpha: 0, duration: 0.3 }, 0);
        fade(tl, q("[data-a='rev-lede']"), 0.6);
        if (!flow) {
          tl.to(q("[data-a='season'], [data-a='board']"), { autoAlpha: 0, y: reduced ? 0 : -14, duration: 0.4, ease: "power2.in" }, 0);
        }
        tl.from(q("[data-a='product'], [data-a='stack']"), { autoAlpha: 0, duration: 0.01 }, 0);
        rise(tl, q("[data-a='product'] [data-a='in']"), 0.5, { stagger: 0.08, y: 14 });
        fade(tl, q("[data-a='stack-in']"), 0.5);
        if (reduced) fade(tl, q("[data-a='bracket']"), 0.6);
        else tl.from(q("[data-a='bracket']"), { scaleY: 0, duration: 0.9, ease: "power3.inOut" }, 0.6);
        rise(tl, q("[data-a='slab']"), 0.6, { stagger: 0.12, y: 22, duration: 0.7 });
      });

      // 3 · A ficha da ação (ideia: como validamos).
      step(3, (tl) => revealBrief(tl, q));
    },
    [flow],
  );

  return (
    <div ref={scope} className="slide flex flex-col gap-y-[clamp(16px,3vh,40px)] md:grid md:grid-rows-[auto_minmax(0,1fr)]">
      {/* Cabeçalho (o passo 2 troca a manchete e a explicação) */}
      <div className="grid-12 items-end gap-y-5">
        <div className="col-span-12 grid md:col-span-8">
          <SectionHeader
            className="[grid-area:1/1]"
            index={slide.index}
            label={copy.label}
            tag={<StageTag of="league" />}
            title={copy.headline}
          />
          <div data-a="rev-title" className="[grid-area:1/1] mt-[calc(26px+1.25rem)] self-start" aria-hidden={slide.step < 2 ? true : undefined}>
            <SplitHeadline lines={copy.stackHeadline} className="t-headline text-[length:var(--fs-display-m)]" />
          </div>
        </div>
        <div className="col-span-12 grid md:col-span-4">
          <p className="sh-lede t-lede [grid-area:1/1] max-w-[44ch] self-end">{copy.lede}</p>
          <p data-a="rev-lede" className="t-lede [grid-area:1/1] max-w-[44ch] self-end" aria-hidden={slide.step < 2 ? true : undefined}>
            {copy.stackLede}
          </p>
        </div>
      </div>

      {/* Palco: coluna esquerda (temporada → produto) e direita (pontuação → classificação → camadas) */}
      <div className={cn("grid-12 min-h-0 gap-y-8", s.stage)} data-flow={flow ? "" : undefined}>
        <div className={cn(s.col, "col-span-12 md:col-span-5", flow && "!static flex flex-col gap-8")}>
          {/* Temporada */}
          <section data-a="season" className={cn(s.panel, s.panelCenter, s.season, flow && "!static")} aria-label={copy.season}>
            <p data-a="season-title" className="t-label text-fg-3">
              {copy.season}
            </p>
            <div className={s.marks} aria-hidden="true">
              {WEEK_LIST.map((w) => {
                const label =
                  w === 1 ? copy.seasonMarks.kickoff : w === WEEKS ? copy.seasonMarks.final : CHALLENGE_WEEKS.includes(w) ? copy.seasonMarks.challenge : "";
                return (
                  <span key={w} data-a="season-meta" className={s.mark} data-edge={w === 1 ? "start" : w === WEEKS ? "end" : undefined}>
                    {label}
                  </span>
                );
              })}
            </div>
            <div className={s.weeks}>
              <span data-a="season-line" className={s.line} aria-hidden="true">
                <span className={s.lineFill} style={{ transform: `scaleX(${trackWeek <= 1 ? 0 : (trackWeek - 1) / (WEEKS - 1)})` }} />
              </span>
              {WEEK_LIST.map((w) => (
                <button
                  key={w}
                  type="button"
                  data-a="wk"
                  className={s.wk}
                  data-kind={w === WEEKS ? "final" : CHALLENGE_WEEKS.includes(w) ? "challenge" : undefined}
                  data-state={trackWeek === 0 ? undefined : w < trackWeek ? "past" : w === trackWeek ? "current" : undefined}
                  aria-label={`${copy.weekLabel} ${w}`}
                  aria-pressed={w === trackWeek}
                  tabIndex={slide.step === 1 ? 0 : -1}
                  onClick={() => slide.step === 1 && pickWeek(w)}
                >
                  <span className={s.wkDot} />
                </button>
              ))}
            </div>
            <div className={s.nums} aria-hidden="true">
              {WEEK_LIST.map((w) => (
                <span key={w} data-a="season-meta" className={cn(s.num, "t-mono")} data-state={w === trackWeek ? "current" : undefined}>
                  {copy.weekShort}
                  {w}
                </span>
              ))}
            </div>
            <ul className={s.chips}>
              {copy.seasonItems.map((it) => (
                <li key={it} data-a="chip" className={s.chip}>
                  {it}
                </li>
              ))}
            </ul>
          </section>

          {/* Passo 2: um produto */}
          <section data-a="product" className={cn(s.panel, s.panelCenter, s.product, flow && "!static")} aria-label={copy.stackProduct}>
            <div className={s.productCore}>
              <p data-a="in" className="t-headline text-[length:var(--fs-display-s)]">
                <strong>{copy.stackProduct}</strong>
              </p>
              <p data-a="in" className="t-mono mt-2 text-[13px] text-fg-3">
                {copy.stackProductLine}
              </p>
            </div>
            <div data-a="in" className={s.productPayers}>
              <p className="t-label text-fg-3">{copy.stackPayersTitle}</p>
              <ul className={s.payerRows}>
                {PAYER_COUNTS.map((p) => (
                  <li key={p.id} className={s.payerRow}>
                    <span className="flex items-center gap-2 text-fg">
                      <i className={s.payerDot} data-payer={p.id} aria-hidden="true" />
                      {p.label}
                    </span>
                    <span className="flex items-center gap-3">
                      <span className={s.ticks} aria-hidden="true">
                        {Array.from({ length: p.count }, (_, i) => (
                          <i key={i} className={s.tick} />
                        ))}
                      </span>
                      <span className="t-mono text-[12px] text-fg-3">{p.count}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </div>

        <div className={cn(s.col, "col-span-12 md:col-span-7", flow && "!static flex flex-col gap-8")}>
          {/* 0 · Proposta de pontuação */}
          <section data-a="scoring" className={cn(s.panel, s.panelCenter, flow && "!static")} aria-label={copy.scoringTitle}>
            <div data-a="scoring-head" className="flex flex-wrap items-center gap-3">
              <h3 className="t-title text-[length:var(--fs-title)]">{copy.scoringTitle}</h3>
              <Tag kind="illustrative" />
            </div>
            <DataTable className="mt-[clamp(10px,1.8vh,18px)]" columns={SCORE_COLUMNS} rows={copy.scoring} rowKey={(r) => r.id} caption={copy.scoringTitle} />
            <p data-a="scoring-note" className="mt-[clamp(10px,1.8vh,16px)] max-w-[60ch] text-[13px] leading-snug text-fg-3">
              {copy.scoringNote}
            </p>
          </section>

          {/* 1 · Classificação animada */}
          <section data-a="board" className={cn(s.panel, s.panelCenter, flow && "!static")} aria-label={copy.leaderboardTitle}>
            <div data-a="in" className="flex flex-wrap items-baseline justify-between gap-3">
              <h3 className="t-title text-[length:var(--fs-title)]">{copy.leaderboardTitle}</h3>
              <p className="t-mono text-[13px] text-fg-2" aria-live={isPlaying ? "off" : "polite"}>
                {shownWeek === 0 ? copy.preseason : `${copy.weekLabel} ${shownWeek} ${copy.weekOf} ${WEEKS}`}
              </p>
            </div>
            <div data-a="in" className="mt-[clamp(8px,1.4vh,14px)]">
              <Leaderboard
                ref={boardRef}
                rows={rows}
                max={MAX}
                cols={copy.cols}
                leaderTag={copy.leaderTag}
                caption={`${copy.leaderboardTitle}. ${copy.disclaimer}`}
              />
            </div>
            <div data-a="in" className="mt-[clamp(8px,1.4vh,14px)] flex flex-wrap items-center gap-x-5 gap-y-1 text-[12px] text-fg-3">
              <span className="flex items-center">
                <i className={s.swatch} aria-hidden="true" />
                {copy.legend.base}
              </span>
              <span className="flex items-center">
                <i className={s.swatch} data-perf="" aria-hidden="true" />
                {copy.legend.perf}
              </span>
            </div>
            <div data-a="in" className="mt-[clamp(10px,1.8vh,18px)] flex items-end gap-5">
              <button
                type="button"
                className={cn("pill shrink-0", isPlaying && "pill--brand")}
                onClick={() => (isPlaying ? stop() : play(week >= WEEKS ? 1 : week + 1))}
                aria-pressed={isPlaying}
              >
                <span aria-hidden="true">{isPlaying ? "❚❚" : week >= WEEKS ? "↺" : "▶"}</span>
                {isPlaying ? copy.pause : week >= WEEKS ? copy.replay : copy.play}
              </button>
              <Slider
                className="min-w-0 flex-1"
                label={copy.weekLabel}
                min={1}
                max={WEEKS}
                value={Math.max(1, shownWeek)}
                onChange={pickWeek}
                format={(v) => `${pad2(v)} / ${pad2(WEEKS)}`}
              />
            </div>
            <p data-a="in" className="mt-[clamp(8px,1.4vh,14px)] flex flex-wrap items-center gap-2 text-[12px] text-fg-3">
              <Tag kind="illustrative" />
              {copy.disclaimer}
            </p>
          </section>

          {/* 2 · Camadas de receita */}
          <section data-a="stack" className={cn(s.panel, s.panelCenter, flow && "!static")} aria-label={copy.stackTitle}>
            <div className={s.stackWrap}>
              <p data-a="stack-in" className={cn(s.stackTitle, "t-label text-fg-3")}>
                {copy.stackTitle}
              </p>
              <span data-a="bracket" className={s.bracket} aria-hidden="true">
                <i className={s.stub} />
              </span>
              <ol className={s.stack}>
              {copy.stack.map((l, i) => (
                <li key={l.id} data-a="slab" className={s.slab} data-top={i === copy.stack.length - 1 ? "" : undefined}>
                  <span className={cn(s.slabIdx, "t-mono")}>{pad2(i + 1)}</span>
                  <span className={s.slabName}>
                    {l.label}
                    <span className={s.slabDesc}>{l.desc}</span>
                  </span>
                  <span className={s.payer}>
                    <i className={s.payerDot} data-payer={l.payer} aria-hidden="true" />
                    {copy.payers[l.payer]}
                  </span>
                  <span className={cn(s.when, "t-mono")}>{copy.when[l.when]}</span>
                </li>
              ))}
              </ol>
            </div>
          </section>
        </div>
      </div>

      <ActionBrief id="league" />
    </div>
  );
}
