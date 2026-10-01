import type { ReactNode } from "react";
import { DUR, EASE, motionPrefs, unmask } from "@/lib/motion";
import { cn, pad2 } from "@/lib/utils";
import { Emphasis, SplitHeadline } from "./SplitHeadline";

type Props = {
  index: number;
  label: string;
  /** Linhas da manchete. Aceita **negrito** e ==marca-texto==. */
  title: readonly string[];
  lede?: string;
  tag?: ReactNode;
  size?: "m" | "l";
  className?: string;
  titleClassName?: string;
  as?: "h1" | "h2";
};

/** Cabeçalho padrão de slide: índice + rótulo + status, manchete (leve + negrito) e explicação. */
export function SectionHeader({ index, label, title, lede, tag, size = "m", className, titleClassName, as = "h2" }: Props) {
  return (
    <header className={cn("section-header", className)}>
      <div className="sh-meta flex flex-wrap items-center gap-x-4 gap-y-2">
        <span className="t-label t-mono text-fg-3">{pad2(index + 1)}</span>
        <span className="h-px w-6 bg-line-strong" aria-hidden="true" />
        <span className="t-label text-fg-2">{label}</span>
        {tag}
      </div>
      <SplitHeadline
        as={as}
        lines={title}
        className={cn(
          "sh-title t-headline mt-5",
          size === "l" ? "text-[length:var(--fs-display-l)]" : "text-[length:var(--fs-display-m)]",
          titleClassName,
        )}
      />
      {lede && (
        <p className="sh-lede t-lede mt-5 max-w-[46ch]">
          <Emphasis text={lede} />
        </p>
      )}
    </header>
  );
}

/** Revelação padrão do cabeçalho — mesma cadência em todos os slides. */
export function revealHeader(tl: gsap.core.Timeline, q: (s: string) => Element[], pos: gsap.Position = 0) {
  const r = motionPrefs.reduced;
  const at = (offset: number) => (typeof pos === "number" ? pos + offset : `${pos}+=${offset}`);
  tl.from(q(".sh-meta"), { autoAlpha: 0, y: r ? 0 : 10, duration: DUR.m, ease: EASE.soft }, pos);
  unmask(tl, q(".sh-title .split-unit"), at(0.1), { stagger: 0.045 });
  revealHighlights(tl, q(".sh-title .hl"), at(0.75));
  if (q(".sh-lede").length) {
    tl.from(q(".sh-lede"), { autoAlpha: 0, y: r ? 0 : 14, duration: DUR.m, ease: EASE.out }, at(0.45));
  }
  return tl;
}

/** Marca-texto: a barra volt corre da esquerda para a direita (como no site da BORA). */
export function revealHighlights(tl: gsap.core.Timeline, targets: Element[], pos: gsap.Position) {
  if (!targets.length) return tl;
  return tl.fromTo(
    targets,
    { "--hl-x": 0 },
    { "--hl-x": 1, duration: motionPrefs.reduced ? DUR.s : 0.82, ease: EASE.out, stagger: 0.12 },
    pos,
  );
}
