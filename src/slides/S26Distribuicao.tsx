"use client";

import { useMemo, useState, type CSSProperties } from "react";
import { BoraShield } from "@/components/brand/BoraMark";
import { useDeck, useSlide } from "@/components/deck/hooks";
import { useStepTimeline } from "@/components/deck/useStepTimeline";
import { ClubCrest } from "@/components/diagrams/ClubCrest";
import { Emphasis } from "@/components/ui/SplitHeadline";
import { Tag } from "@/components/ui/Tag";
import { Toggle } from "@/components/ui/Toggle";
import { copy } from "@/content/slides/26-frente-distribuicao";
import { draw, fade, rise } from "@/lib/motion";
import { cn, r2 } from "@/lib/utils";
import { FrontFrame, revealBriefStep, revealFront, showVisual } from "./FrontFrame";
import styles from "./S26Distribuicao.module.css";

// Composição em coordenadas fixas (viewBox 900×620), a mesma do slide BORA POWERED da versão longa.
const VB = { w: 900, h: 620 };
const CREST = { x: 395, y: 290, r: 112 };
const pct = (x: number, y: number) => ({ left: `${(x / VB.w) * 100}%`, top: `${(y / VB.h) * 100}%` });

const BORA_X = 616;
const boraY = (i: number) => 58 + i * 52;
const CLUB_X = 30;
const clubY = (i: number) => 178 + i * 56;

// Remendos da operação manual → capacidade da BORA que os substituiria (índice em boraItems).
const FRAGMENTS = [
  { at: { x: 250, y: 110 }, to: 0, rot: -3 }, // Grupos de WhatsApp → Tecnologia
  { at: { x: 540, y: 128 }, to: 2, rot: 2.5 }, // Planilhas → CRM
  { at: { x: 585, y: 318 }, to: 0, rot: -2 }, // Pix manual → Tecnologia
  { at: { x: 548, y: 470 }, to: 1, rot: 3 }, // Lista no papel → Check-in
  { at: { x: 205, y: 470 }, to: 6, rot: -2.5 }, // Patrocínio avulso → Patrocinadores
  { at: { x: 150, y: 300 }, to: 3, rot: 2 }, // Eventos improvisados → Eventos
];

const MEMBERS = 22;
/** Passos do visual: sem a BORA (s1) e com a BORA (s2). */
const S_WITHOUT = 1;
const S_WITH = 2;

/**
 * Frente 3 · Distribuição. s0 as três ações · s1 um clube sem a BORA (operação manual) ·
 * s2 o mesmo clube com a BORA · s3 e s4 as fichas de BORA POWERED e BORA HOUSE.
 */
export function DistribuicaoSlide() {
  const { index, step } = useSlide();
  const { mode: deckMode } = useDeck();
  const flow = deckMode === "flow";
  // O toggle vale só no passo em que foi usado; ao mudar de passo, o passo manda.
  const [override, setOverride] = useState<{ v: "without" | "with"; at: number } | null>(null);
  const mode = override && override.at === step ? override.v : step >= S_WITH ? "with" : "without";

  const members = useMemo(
    () =>
      Array.from({ length: MEMBERS }, (_, i) => {
        const a = (i / MEMBERS) * Math.PI * 2 - Math.PI / 2;
        const r = 158 + (i % 3) * 9;
        return { x: r2(CREST.x + Math.cos(a) * r), y: r2(CREST.y + Math.sin(a) * r) };
      }),
    [],
  );

  const { scope, timeline } = useStepTimeline(
    ({ step: at, q, reduced }) => {
      at(0, (tl) => revealFront(tl, q));

      // 1: o clube, com a própria identidade e comunidade, e a operação manual em volta.
      at(S_WITHOUT, (tl) => {
        const t = showVisual(tl, q, flow, reduced);
        rise(tl, q('[data-a="pw-side"] > *'), t, { stagger: 0.08, y: 10 });
        tl.from(q('[data-a="crest"]'), { autoAlpha: 0, scale: reduced ? 1 : 0.85, duration: 1, ease: "bora" }, t);
        tl.from(q('[data-a="member"]'), { autoAlpha: 0, scale: 0, duration: 0.45, stagger: { each: 0.02, from: "random" } }, t + 0.3);
        fade(tl, q('[data-a="ring"]'), t + 0.3, { duration: 0.9 });
        tl.from(q('[data-a="frag"]'), { autoAlpha: 0, scale: reduced ? 1 : 0.8, duration: 0.55, stagger: 0.08, ease: "bora" }, t + 0.7);
      });

      // 2: com a BORA, cada remendo vira uma capacidade conectada; o clube continua sendo o clube.
      at(S_WITH, (tl) => {
        FRAGMENTS.forEach((f, i) => {
          const dx = ((BORA_X - f.at.x) / VB.w) * 100;
          const dy = ((boraY(f.to) - f.at.y) / VB.h) * 100;
          tl.to(q(`[data-frag-layer="${i}"]`), { xPercent: dx, yPercent: dy, duration: reduced ? 0.01 : 1.0, ease: "power3.inOut" }, i * 0.05);
          tl.to(q(`[data-frag-layer="${i}"] [data-a="frag"]`), { rotation: 0, autoAlpha: 0, duration: 0.35 }, 0.75 + i * 0.05);
        });
        if (!flow) tl.to(q('[data-a="cap-without"]'), { autoAlpha: 0, duration: 0.3 }, 0);
        rise(tl, q('[data-a="bora-item"]'), 0.8, { stagger: 0.05, x: 16, y: 0 });
        draw(tl, q('[data-a="bora-line"]'), 0.9, { stagger: 0.04, duration: 0.8 });
        rise(tl, q('[data-a="club-item"]'), 1.1, { stagger: 0.06, x: -16, y: 0 });
        draw(tl, q('[data-a="club-line"]'), 1.2, { stagger: 0.05, duration: 0.8 });
        fade(tl, q('[data-a="list-title"]'), 0.9);
        tl.from(q('[data-a="seal"]'), { autoAlpha: 0, y: reduced ? 0 : 10, duration: 0.8, ease: "bora" }, 1.3);
        tl.to(q('[data-a="member-id"]'), { opacity: 1, duration: 0.4, stagger: { each: 0.02, from: "random" } }, 1.5);
        rise(tl, q('[data-a="cap-with"]'), 1.4);
        rise(tl, q('[data-a="equation"]'), 1.6);
      });

      at(3, (tl) => revealBriefStep(tl, q, 0, { flow }));
      at(4, (tl) => revealBriefStep(tl, q, 1, { flow }));
    },
    [flow],
  );

  // O toggle leva a timeline entre "sem" (s1) e "com" (s2).
  const onToggle = (v: "without" | "with") => {
    setOverride({ v, at: step });
    timeline.current?.tweenTo(v === "with" ? `s${S_WITH}` : `s${S_WITHOUT}`, { duration: 1.2, ease: "none" });
  };

  return (
    <FrontFrame scope={scope} index={index} copy={copy}>
      <div className={styles.wrap}>
        <div data-a="pw-side" className={styles.side}>
          <div className={styles.head}>
            <span className="t-label text-fg-2">{copy.visualLabel}</span>
            <Tag kind="fictional" />
          </div>
          <Toggle
            label={copy.toggleLabel}
            value={mode}
            onChange={onToggle}
            options={[
              { value: "without", label: copy.toggle.without },
              { value: "with", label: copy.toggle.with },
            ]}
          />
          <div className={styles.swap}>
            <p data-a="cap-without" className={cn("t-lede", styles.caption)}>
              {copy.withoutCaption}
            </p>
            <p data-a="cap-with" className={cn("t-lede text-fg", styles.caption)}>
              {copy.withCaption}
            </p>
          </div>
          <p data-a="equation" className={styles.equation}>
            <Emphasis text={copy.equation} />
          </p>
        </div>

        <div className={styles.diagramBox}>
          <div className={cn("powered", styles.diagram)} style={{ maxHeight: "none" } as CSSProperties}>
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
      </div>
    </FrontFrame>
  );
}
