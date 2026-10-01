"use client";

import { useMemo, useState, type CSSProperties } from "react";
import { BoraShield } from "@/components/brand/BoraMark";
import { useSlide } from "@/components/deck/hooks";
import { useStepTimeline } from "@/components/deck/useStepTimeline";
import { ClubCrest } from "@/components/diagrams/ClubCrest";
import { ActionBrief, revealBrief } from "@/components/ui/ActionBrief";
import { SectionHeader, revealHeader, revealHighlights } from "@/components/ui/SectionHeader";
import { Emphasis, SplitHeadline } from "@/components/ui/SplitHeadline";
import { StageTag } from "@/components/ui/StageTag";
import { Tag } from "@/components/ui/Tag";
import { Toggle } from "@/components/ui/Toggle";
import { copy } from "@/content/slides/06-powered";
import { draw, fade, hold, rise, unmask } from "@/lib/motion";
import { r2 } from "@/lib/utils";

// Composição em coordenadas fixas (viewBox 900×620) — tudo em %, responsivo e sem medição.
const VB = { w: 900, h: 620 };
const CREST = { x: 395, y: 290, r: 112 };
const pct = (x: number, y: number) => ({ left: `${(x / VB.w) * 100}%`, top: `${(y / VB.h) * 100}%` });

const BORA_X = 616;
const boraY = (i: number) => 58 + i * 52;
const CLUB_X = 30;
const clubY = (i: number) => 178 + i * 56;

// Remendos da operação manual → capacidade da BORA que os substitui (índice em boraItems).
const FRAGMENTS = [
  { at: { x: 250, y: 110 }, to: 0, rot: -3 }, // Grupos de WhatsApp → Tecnologia
  { at: { x: 540, y: 128 }, to: 2, rot: 2.5 }, // Planilhas → CRM
  { at: { x: 585, y: 318 }, to: 0, rot: -2 }, // Pix manual → Tecnologia
  { at: { x: 548, y: 470 }, to: 1, rot: 3 }, // Lista no papel → Check-in
  { at: { x: 205, y: 470 }, to: 6, rot: -2.5 }, // Patrocínio avulso → Patrocinadores
  { at: { x: 150, y: 300 }, to: 3, rot: 2 }, // Eventos improvisados → Eventos
];

const MEMBERS = 22;

export function PoweredSlide() {
  const { index, step } = useSlide();
  // O toggle vale só no passo em que foi usado; ao mudar de passo, o passo manda.
  const [override, setOverride] = useState<{ v: "without" | "with"; at: number } | null>(null);
  const mode = override && override.at === step ? override.v : step >= 2 ? "with" : "without";

  const members = useMemo(
    () =>
      Array.from({ length: MEMBERS }, (_, i) => {
        const a = (i / MEMBERS) * Math.PI * 2 - Math.PI / 2;
        const r = 158 + (i % 3) * 9;
        return { x: r2(CREST.x + Math.cos(a) * r), y: r2(CREST.y + Math.sin(a) * r) };
      }),
    [],
  );

  const { scope, timeline } = useStepTimeline(({ step: at, q, reduced }) => {
    // 0 — o clube, com a própria identidade e a própria comunidade.
    at(0, (tl) => {
      revealHeader(tl, q);
      tl.from(q('[data-a="crest"]'), { autoAlpha: 0, scale: reduced ? 1 : 0.85, duration: 1.1, ease: "bora" }, 0.3);
      fade(tl, q('[data-a="crest-tag"]'), 0.9);
      tl.from(q('[data-a="member"]'), { autoAlpha: 0, scale: 0, duration: 0.5, stagger: { each: 0.03, from: "random" } }, 0.6);
      fade(tl, q('[data-a="ring"]'), 0.6, { duration: 1 });
    });

    // 1 — sem a BORA: operação manual, fragmentada, tudo depende do líder.
    at(1, (tl) => {
      fade(tl, q('[data-a="toggle"]'), 0);
      tl.from(q('[data-a="frag"]'), { autoAlpha: 0, scale: reduced ? 1 : 0.8, duration: 0.6, stagger: 0.09, ease: "bora" }, 0.1);
      rise(tl, q('[data-a="cap-without"]'), 0.6);
    });

    // 2 — com a BORA: cada remendo vira uma capacidade conectada; o clube continua sendo o clube.
    at(2, (tl) => {
      // Os remendos voam até a capacidade que os substitui e somem nela.
      FRAGMENTS.forEach((f, i) => {
        const dx = ((BORA_X - f.at.x) / VB.w) * 100;
        const dy = ((boraY(f.to) - f.at.y) / VB.h) * 100;
        tl.to(q(`[data-frag-layer="${i}"]`), { xPercent: dx, yPercent: dy, duration: reduced ? 0.01 : 1.1, ease: "power3.inOut" }, i * 0.05);
        tl.to(q(`[data-frag-layer="${i}"] [data-a="frag"]`), { rotation: 0, autoAlpha: 0, duration: 0.35 }, 0.85 + i * 0.05);
      });
      tl.to(q('[data-a="cap-without"]'), { autoAlpha: 0, duration: 0.3 }, 0);
      rise(tl, q('[data-a="bora-item"]'), 0.9, { stagger: 0.06, x: 16, y: 0 });
      draw(tl, q('[data-a="bora-line"]'), 1.0, { stagger: 0.04, duration: 0.8 });
      rise(tl, q('[data-a="club-item"]'), 1.2, { stagger: 0.07, x: -16, y: 0 });
      draw(tl, q('[data-a="club-line"]'), 1.3, { stagger: 0.05, duration: 0.8 });
      fade(tl, q('[data-a="list-title"]'), 1.0);
      tl.from(q('[data-a="seal"]'), { autoAlpha: 0, y: reduced ? 0 : 10, duration: 0.8, ease: "bora" }, 1.4);
      tl.to(q('[data-a="member-id"]'), { opacity: 1, duration: 0.4, stagger: { each: 0.02, from: "random" } }, 1.6);
      rise(tl, q('[data-a="cap-with"]'), 1.6);
    });

    // 3 — a equação.
    at(3, (tl) => {
      tl.to(q('[data-a="toggle"], [data-a="cap-with"]'), { autoAlpha: 0, duration: 0.3 }, 0);
      unmask(tl, q('[data-a="equation"] .split-unit'), 0.2, { stagger: 0.06 });
      revealHighlights(tl, q('[data-a="equation"] .hl'), 1.0);
      rise(tl, q('[data-a="equation-lede"]'), 0.9);
      hold(tl, 0.2);
    });

    // 4 — a ficha da ação.
    at(4, (tl) => revealBrief(tl, q));
  });

  // O toggle leva a timeline entre "sem" (s1) e "com" (s2).
  const onToggle = (v: "without" | "with") => {
    setOverride({ v, at: step });
    timeline.current?.tweenTo(v === "with" ? "s2" : "s1", { duration: 1.2, ease: "none" });
  };

  return (
    <div ref={scope} className="slide grid-12 items-center gap-y-6">
      <div className="col-span-12 flex h-full flex-col justify-between py-2 lg:col-span-5">
        <SectionHeader
          index={index}
          label={copy.label}
          title={copy.headline}
          lede={copy.lede}
          tag={<StageTag of="powered" />}
          size="l"
          titleClassName="!text-[clamp(40px,4.6vw,82px)]"
        />

        <div className="relative mt-8 min-h-[190px]">
          <div data-a="toggle">
            <Toggle
              label="Operação do clube"
              value={mode}
              onChange={onToggle}
              options={[
                { value: "without", label: copy.toggle.without },
                { value: "with", label: copy.toggle.with },
              ]}
            />
          </div>
          <p data-a="cap-without" className="t-lede absolute left-0 top-16 max-w-[36ch]">
            {copy.withoutCaption}
          </p>
          <p data-a="cap-with" className="t-lede absolute left-0 top-16 max-w-[36ch] text-fg">
            {copy.withCaption}
          </p>
          <div className="absolute inset-x-0 top-0">
            <div data-a="equation">
              <SplitHeadline
                as="p"
                lines={[`${copy.equation[0]} + ${copy.equation[1]} =`, `**==${copy.equation[2]}==**`]}
                className="t-headline text-[clamp(30px,3vw,52px)]"
              />
            </div>
            <p data-a="equation-lede" className="t-lede mt-4 max-w-[40ch] text-[length:var(--fs-body)]">
              {copy.equationLede}
            </p>
          </div>
        </div>
      </div>

      <div className="col-span-12 lg:col-span-7">
        <div className="powered" style={{ aspectRatio: `${VB.w} / ${VB.h}` } as CSSProperties}>
          <svg viewBox={`0 0 ${VB.w} ${VB.h}`} className="absolute inset-0 h-full w-full overflow-visible" aria-hidden="true">
            <circle data-a="ring" cx={CREST.x} cy={CREST.y} r={166} className="powered-ring" />
            {copy.boraItems.map((_, i) => (
              <path
                key={i}
                data-a="bora-line"
                d={`M${CREST.x + CREST.r * 0.94} ${CREST.y} C ${CREST.x + 170} ${CREST.y}, ${BORA_X - 90} ${boraY(i)}, ${BORA_X - 14} ${boraY(i)}`}
                className="powered-line powered-line--bora"
              />
            ))}
            {copy.clubItems.map((_, i) => (
              <path
                key={i}
                data-a="club-line"
                d={`M${CLUB_X + 150} ${clubY(i)} C ${CLUB_X + 200} ${clubY(i)}, ${CREST.x - 170} ${CREST.y}, ${CREST.x - CREST.r * 0.94} ${CREST.y}`}
                className="powered-line powered-line--club"
              />
            ))}
          </svg>

          {members.map((m, i) => (
            <span key={i} data-a="member" className="powered-member" style={pct(m.x, m.y)}>
              <span data-a="member-id" className="powered-member-id" />
            </span>
          ))}

          <div data-a="crest" className="powered-crest" style={{ ...pct(CREST.x, CREST.y), width: `${((CREST.r * 2) / VB.w) * 100}%` }}>
            <ClubCrest name={copy.club.name} suffix={copy.club.suffix} className="block h-auto w-full" />
          </div>
          <div data-a="crest-tag" className="absolute -translate-x-1/2" style={pct(CREST.x, 26)}>
            <Tag kind="fictional" />
          </div>
          <div data-a="seal" className="powered-seal" style={pct(CREST.x, CREST.y + CREST.r + 36)}>
            <BoraShield className="h-4 w-auto text-fg" />
            {copy.poweredBy}
          </div>

          <p data-a="list-title" className="t-label absolute text-fg-3" style={pct(BORA_X, 14)}>
            {copy.boraTitle}
          </p>
          {copy.boraItems.map((item, i) => (
            <p key={item} data-a="bora-item" className="powered-item" style={pct(BORA_X, boraY(i))}>
              <span className="powered-item-dot" aria-hidden="true" />
              {item}
            </p>
          ))}
          <p data-a="list-title" className="t-label absolute text-fg-3" style={pct(CLUB_X, 134)}>
            {copy.clubTitle}
          </p>
          {copy.clubItems.map((item, i) => (
            <p key={item} data-a="club-item" className="powered-item powered-item--club" style={pct(CLUB_X, clubY(i))}>
              {item}
            </p>
          ))}

          {FRAGMENTS.map((f, i) => (
            <div key={i} data-frag-layer={i} className="powered-frag-layer" aria-hidden={mode === "with"}>
              <span data-a="frag" className="powered-frag" style={{ ...pct(f.at.x, f.at.y), rotate: `${f.rot}deg` }}>
                <Emphasis text={copy.withoutItems[i]} />
              </span>
            </div>
          ))}
        </div>
      </div>

      <ActionBrief id="powered" />
    </div>
  );
}
