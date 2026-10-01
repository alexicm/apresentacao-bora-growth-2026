"use client";

import { deck } from "@/components/deck/deck-store";
import { useSlide } from "@/components/deck/hooks";
import { useStepTimeline } from "@/components/deck/useStepTimeline";
import { SectionHeader, revealHeader } from "@/components/ui/SectionHeader";
import { SLIDES } from "@/content/deck";
import { PACK } from "@/content/projects";
import { copy } from "@/content/slides/01c-proposal";
import { fade, rise } from "@/lib/motion";
import { cn, pad2 } from "@/lib/utils";
import styles from "./S01cProposal.module.css";

const fill = (t: string, v: Record<string, string | number>) => t.replace(/\{(\w+)\}/g, (_, k: string) => String(v[k] ?? ""));

const LEDE = fill(copy.lede, { total: PACK.length, rodando: PACK.filter((g) => g.stage === "rodando").length });

/** Cada parte do roteiro aponta para o intervalo de slides dos seus capítulos (calculado de deck.ts). */
const ACTS = copy.acts.map((a) => {
  const chapters: readonly string[] = a.chapters;
  const idx = SLIDES.flatMap((s, i) => (chapters.includes(s.chapter) ? [i] : []));
  return { ...a, from: idx[0] ?? 0, to: idx[idx.length - 1] ?? 0 };
});

/**
 * A proposta em uma frase e o roteiro em três partes (começo, meio e fim).
 * Cada parte é um atalho: clicar leva ao primeiro slide dela.
 */
export function ProposalSlide() {
  const { index } = useSlide();

  const { scope } = useStepTimeline(({ step, q, reduced }) => {
    step(0, (tl) => {
      revealHeader(tl, q);
      fade(tl, q('[data-a="contours"]'), 0.4, { duration: 1.6 });
    });
    step(1, (tl) => {
      fade(tl, q('[data-a="roadmap-label"]'), 0);
      tl.from(
        q('[data-a="act-line"]'),
        { scaleX: 0, transformOrigin: "0% 50%", duration: reduced ? 0.4 : 0.9, ease: "power3.inOut", stagger: 0.14 },
        0.05,
      );
      rise(tl, q('[data-a="act"]'), 0.2, { stagger: 0.14, y: 18 });
    });
  });

  return (
    <div ref={scope} className={cn("slide", styles.root)}>
      <div data-a="contours" className={cn("contours text-brand-text", styles.contours)} aria-hidden="true" />

      <SectionHeader
        index={index}
        label={copy.label}
        title={copy.headline}
        lede={LEDE}
        className="relative max-w-[1100px]"
        titleClassName="!text-[clamp(38px,4.9vw,86px)]"
      />

      <section className={styles.roadmap} aria-label={copy.roadmapLabel}>
        <p data-a="roadmap-label" className="t-label text-fg-3">
          {copy.roadmapLabel}
        </p>
        <ol className={styles.acts}>
          {ACTS.map((a, i) => (
            <li key={a.title} className={styles.actItem}>
              <span data-a="act-line" className={styles.actLine} aria-hidden="true" />
              <div data-a="act">
                <button
                  type="button"
                  className={styles.act}
                  onClick={() => deck.goTo(a.from, 0)}
                  aria-label={fill(copy.goTo, { title: a.title })}
                >
                  <span className={styles.actNum}>{pad2(i + 1)}</span>
                  <span className={styles.actTitle}>{a.title}</span>
                  <span className={styles.actText}>{a.text}</span>
                  <span className={styles.actRange}>
                    {fill(copy.range, { from: pad2(a.from + 1), to: pad2(a.to + 1) })} <span aria-hidden="true">→</span>
                  </span>
                </button>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
