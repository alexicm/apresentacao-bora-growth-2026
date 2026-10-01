import type { ReactNode } from "react";
import { BRIEF } from "@/content/brief";
import { growthById, horizonLabel, type GrowthProject } from "@/content/projects";
import { DUR, EASE, motionPrefs } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { StageDots, StageTag } from "./StageTag";
import { Tag } from "./Tag";
import styles from "./ActionBrief.module.css";

/** Blocos da ficha que podem receber o rótulo de uma fase do método (só no slide do método). */
export type BriefBlock = "why" | "how" | "metric";

type CardProps = {
  g: GrowthProject;
  /** "md": slides e pastas · "sm": versão compacta (slide do método). */
  size?: "md" | "sm";
  /** Fase do ciclo de growth em cada bloco, ex.: { why: "01 · Descobrir" }. */
  phases?: Partial<Record<BriefBlock, string>>;
  as?: "article" | "div";
  className?: string;
  /** Conteúdo extra no fim da ficha (ex.: botão "Abrir o slide" nas pastas). */
  children?: ReactNode;
};

/**
 * Ficha da ação: o mesmo formato no método, no último passo de cada slide de produto e nas pastas (tecla P).
 * O que é · por que importa · como executamos (ou validamos) em 3 passos · como medimos · quando · estágio.
 * Os textos vêm de GROWTH_PROJECTS (projects.ts) e de BRIEF (content/brief.ts).
 * Alvos de animação: [data-a="brief-row"].
 */
export function ActionBriefCard({ g, size = "md", phases, as: Tagname = "article", className, children }: CardProps) {
  const chip = (b: BriefBlock) => (phases?.[b] ? <span className={styles.phase}>{phases[b]}</span> : null);
  return (
    <Tagname className={cn(styles.card, size === "sm" && styles.sm, className)} aria-label={`${BRIEF.kicker}: ${g.name}`}>
      <header data-a="brief-row" className={styles.head}>
        <span className={cn("t-label", styles.kicker)}>{BRIEF.kicker}</span>
        <span className={styles.front}>{g.front}</span>
        {g.core ? <Tag kind="current">{BRIEF.core}</Tag> : <StageTag stage={g.stage} />}
      </header>

      <p data-a="brief-row" className={styles.name}>
        {g.name}
      </p>
      <p data-a="brief-row" className={styles.plain}>
        {g.plain}
      </p>

      <div data-a="brief-row" className={styles.block}>
        <p className={styles.label}>
          {chip("why")}
          {BRIEF.why}
        </p>
        <p className={styles.text}>{g.why}</p>
      </div>

      <div data-a="brief-row" className={styles.block}>
        <p className={styles.label}>
          {chip("how")}
          {BRIEF.how[g.stage]}
        </p>
        <ol className={styles.steps}>
          {g.howTo.map((s, i) => (
            <li key={i}>
              <span className={styles.num} aria-hidden="true">
                {i + 1}
              </span>
              <span>{s}</span>
            </li>
          ))}
        </ol>
      </div>

      <dl data-a="brief-row" className={styles.facts}>
        <div>
          <dt className={styles.label}>
            {chip("metric")}
            {BRIEF.metric}
          </dt>
          <dd>{g.kpi}</dd>
        </div>
        <div>
          <dt className={styles.label}>{BRIEF.when}</dt>
          <dd>{horizonLabel(g.horizon)}</dd>
        </div>
        <div>
          <dt className={styles.label}>{BRIEF.goal}</dt>
          <dd>{BRIEF.goalValue}</dd>
        </div>
      </dl>

      <p data-a="brief-row" className={cn(styles.stageNote, styles[`note_${g.core ? "core" : g.stage}`])}>
        {!g.core && <StageDots stage={g.stage} className={styles.noteDots} />}
        {g.core ? BRIEF.coreNote : BRIEF.stageNote[g.stage]}
      </p>

      {children}
    </Tagname>
  );
}

/**
 * Último passo de um slide de produto: a ficha entra pela direita sobre o slide esmaecido.
 * No celular (modo documento) vira um bloco normal no fim do slide.
 * O contêiner fica oculto (autoAlpha) até o passo dele, para não bloquear cliques: use `revealBrief`.
 */
export function ActionBrief({ id }: { id: string }) {
  const g = growthById(id);
  if (!g) return null;
  return (
    <div data-a="brief" className={styles.layer}>
      <div data-a="brief-scrim" className={styles.scrim} aria-hidden="true" />
      <div data-a="brief-panel" className={styles.panel}>
        <ActionBriefCard g={g} />
      </div>
    </div>
  );
}

/** Revela a ficha (camada, véu, painel e linhas). Chame dentro do último `step()` do slide. */
export function revealBrief(tl: gsap.core.Timeline, q: (s: string) => Element[], pos = 0) {
  const r = motionPrefs.reduced;
  tl.from(q('[data-a="brief"]'), { autoAlpha: 0, duration: 0.01 }, pos);
  tl.from(q('[data-a="brief-scrim"]'), { autoAlpha: 0, duration: r ? DUR.s : 0.6, ease: EASE.soft }, pos);
  tl.from(q('[data-a="brief-panel"]'), { autoAlpha: 0, x: r ? 0 : 56, duration: r ? DUR.s : 0.9, ease: EASE.out }, pos + 0.12);
  tl.from(
    q('[data-a="brief-panel"] [data-a="brief-row"]'),
    { autoAlpha: 0, y: r ? 0 : 12, duration: r ? DUR.s : 0.6, ease: EASE.out, stagger: 0.06 },
    pos + 0.3,
  );
  return tl;
}

/**
 * Várias fichas no mesmo slide, uma por passo (slides de frente): a camada entra com a primeira
 * e cada passo seguinte troca a ficha. No celular, as fichas viram blocos em sequência no fim do slide.
 * Use `revealBriefStep(tl, q, k)` no passo de cada ficha.
 */
export function ActionBriefStack({ ids }: { ids: readonly string[] }) {
  const list = ids.map((id) => growthById(id)).filter((g): g is GrowthProject => Boolean(g));
  if (!list.length) return null;
  return (
    <div data-a="brief" className={styles.layer}>
      <div data-a="brief-scrim" className={styles.scrim} aria-hidden="true" />
      <div className={styles.stack}>
        {list.map((g, k) => (
          <div key={g.id} data-a="brief-panel" data-brief={k} className={styles.panel}>
            <ActionBriefCard g={g} />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Revela a ficha `k` da pilha (a 0 traz a camada e o véu; as seguintes trocam a anterior). */
export function revealBriefStep(tl: gsap.core.Timeline, q: (s: string) => Element[], k: number, { flow = false } = {}) {
  const r = motionPrefs.reduced;
  const panel = (i: number) => q(`[data-a="brief-panel"][data-brief="${i}"]`);
  let at = 0.12;
  if (k === 0) {
    tl.from(q('[data-a="brief"]'), { autoAlpha: 0, duration: 0.01 }, 0);
    tl.from(q('[data-a="brief-scrim"]'), { autoAlpha: 0, duration: r ? DUR.s : 0.6, ease: EASE.soft }, 0);
  } else {
    if (!flow) tl.to(panel(k - 1), { autoAlpha: 0, x: r ? 0 : -40, duration: 0.4, ease: EASE.in }, 0);
    at = flow ? 0 : 0.3;
  }
  tl.from(panel(k), { autoAlpha: 0, x: r ? 0 : 56, duration: r ? DUR.s : 0.9, ease: EASE.out }, at);
  tl.from(q(`[data-a="brief-panel"][data-brief="${k}"] [data-a="brief-row"]`), { autoAlpha: 0, y: r ? 0 : 12, duration: r ? DUR.s : 0.6, ease: EASE.out, stagger: 0.06 }, at + 0.18);
  return tl;
}
