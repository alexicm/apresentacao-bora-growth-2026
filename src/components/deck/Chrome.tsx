"use client";

import { BoraShield } from "@/components/brand/BoraMark";
import { CHAPTERS, SLIDES } from "@/content/deck";
import { copy as intro } from "@/content/slides/01-intro";
import { cn } from "@/lib/utils";
import { useDeck } from "./hooks";

/** Cabeçalho discreto: marca à esquerda, capítulo atual à direita. Some no hero. */
export function Chrome() {
  const { current, started } = useDeck();
  const chapter = CHAPTERS[SLIDES[current].chapter];
  const theme = SLIDES[current].theme;
  const onHero = current === 0;

  return (
    <>
      <header data-theme={theme} className={cn("chrome chrome--top transition-opacity duration-700", onHero && "opacity-0")}>
        <div className="flex items-center gap-3">
          <BoraShield className="h-[18px] w-auto text-fg" title="BORA" />
          <span className="t-label text-fg-2">BORA Growth</span>
        </div>
        <p key={chapter.title} className="chrome-fade t-label flex items-center gap-3 text-fg-3">
          <span className="t-mono text-fg-4">{chapter.roman}</span>
          <span>{chapter.title}</span>
        </p>
      </header>

      <p
        className={cn(
          "t-label pointer-events-none fixed bottom-[calc(var(--chrome-h)*0.5)] left-[var(--margin)] z-40 hidden translate-y-1/2 text-fg-3 transition-opacity duration-700 md:block",
          (!onHero || started) && "opacity-0",
        )}
        aria-hidden="true"
      >
        {intro.hint}
      </p>
    </>
  );
}
