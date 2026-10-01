"use client";

import { Fragment, type CSSProperties } from "react";
import { BoraLockup } from "@/components/brand/BoraLockup";
import { parseEmphasis, plainText } from "@/components/ui/SplitHeadline";
import { copy } from "@/content/slides/01-intro";
import { cn } from "@/lib/utils";

const PHOTO_SRCSET = [640, 1024, 1600, 2048].map((w) => `/brand/bora-comunidade-${w}.webp ${w}w`).join(", ");

/** Atrasos da revelação (s): 1ª linha, pausa, 2ª linha, marca-texto, apoio. */
const T = { line1: 0.35, line2: 1.45, step: 0.07, mark: 2.55, sub: 2.9, lockup: 3.2 };

/**
 * Hero na voz da BORA, como no site: foto da comunidade, contraste leve/negrito e marca-texto volt.
 * A revelação é toda em CSS (pinta antes da hidratação — LCP rápido) e funciona com quebra de linha.
 */
export function HeroSlide() {
  let word = 0;
  return (
    <div className="slide hero">
      <div className="hero-photo" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element -- WebP responsivo já otimizado (funciona no export estático) */}
        <img src="/brand/bora-comunidade-1600.webp" srcSet={PHOTO_SRCSET} sizes="100vw" alt="" fetchPriority="high" decoding="async" />
        <div className="hero-grade" />
      </div>
      <span className="sr-only">{copy.photoAlt}</span>

      <div className="hero-top" style={{ "--d": `${T.lockup}s` } as CSSProperties}>
        <BoraLockup className="w-[clamp(112px,8.8vw,158px)] text-fg" />
        <p className="hero-pack t-label">{copy.pack}</p>
      </div>

      <div className="hero-center">
        <h1 className="hero-title">
          <span className="sr-only">{copy.headline.map(plainText).join(" ")}</span>
          {copy.headline.map((line, li) => (
            <span key={li} className={cn("hero-line", li === 0 ? "hero-line--light" : "hero-line--bold")} aria-hidden="true">
              {parseEmphasis(line).map((t, ti) => {
                if ("space" in t) return <Fragment key={ti}> </Fragment>;
                const delay = (li === 0 ? T.line1 : T.line2) + (li === 0 ? word++ : word++ - countWords(copy.headline[0])) * T.step;
                return (
                  <span key={ti} className="hero-word" style={{ "--d": `${delay}s` } as CSSProperties}>
                    {t.hl ? (
                      <span className="hl hero-mark" style={{ "--md": `${T.mark}s` } as CSSProperties}>
                        {t.text}
                      </span>
                    ) : (
                      t.text
                    )}
                  </span>
                );
              })}
            </span>
          ))}
        </h1>
        <p className="hero-sub" style={{ "--d": `${T.sub}s` } as CSSProperties}>
          {copy.subheadline}
        </p>
      </div>

      <p className="hero-session t-label" style={{ "--d": `${T.lockup}s` } as CSSProperties}>
        {copy.session}
      </p>
    </div>
  );
}

function countWords(line: string) {
  return parseEmphasis(line).filter((t) => !("space" in t)).length;
}
