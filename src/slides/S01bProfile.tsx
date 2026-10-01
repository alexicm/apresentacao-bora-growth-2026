"use client";

import { useDeck, useSlide } from "@/components/deck/hooks";
import { useStepTimeline } from "@/components/deck/useStepTimeline";
import { SectionHeader, revealHeader } from "@/components/ui/SectionHeader";
import { StageDots } from "@/components/ui/StageTag";
import { growthById } from "@/content/projects";
import { copy } from "@/content/slides/01b-profile";
import { DUR, EASE, hold, pop, rise } from "@/lib/motion";
import { cn } from "@/lib/utils";
import styles from "./S01bProfile.module.css";

/**
 * Quem apresenta: a identidade fica fixa à esquerda; à direita, três cenas
 * (em números → trajetória e formação → o que isso traz para cada ação do pack).
 * Tudo vem do currículo do Alex (Profile_Alex.pdf). No celular, as cenas empilham.
 */
export function ProfileSlide() {
  const { index } = useSlide();
  const { mode } = useDeck();
  const flow = mode === "flow";

  const { scope } = useStepTimeline(
    ({ step, q, reduced }) => {
      const swap = (tl: gsap.core.Timeline, from: number, to: number) => {
        if (!flow) tl.to(q(`[data-scene="${from}"]`), { autoAlpha: 0, duration: DUR.xs, ease: EASE.in }, 0);
        tl.fromTo(q(`[data-scene="${to}"]`), { autoAlpha: 0 }, { autoAlpha: 1, duration: DUR.xs, ease: EASE.soft }, flow ? 0 : 0.2);
      };

      step(0, (tl) => {
        revealHeader(tl, q);
        pop(tl, q('[data-a="avatar"]'), 0.55, { duration: DUR.m });
        rise(tl, q('[data-a="id"]'), 0.65, { y: 10 });
        rise(tl, q('[data-a="summary"]'), 0.8, { y: 12 });
        rise(tl, q('[data-a="fact"]'), 0.7, { stagger: 0.12, y: 14 });
        tl.from(q('[data-a="skill"]'), { autoAlpha: 0, scale: reduced ? 1 : 0.9, duration: DUR.s, ease: EASE.out, stagger: 0.04 }, 1.2);
      });
      step(1, (tl) => {
        swap(tl, 0, 1);
        rise(tl, q('[data-a="job"]'), 0.3, { stagger: 0.06, y: 10 });
        rise(tl, q('[data-a="side"]'), 0.6, { stagger: 0.1, y: 12 });
      });
      step(2, (tl) => {
        swap(tl, 1, 2);
        rise(tl, q('[data-a="bring"]'), 0.3, { stagger: 0.1, y: 12 });
        tl.from(q('[data-a="chip"]'), { autoAlpha: 0, scale: reduced ? 1 : 0.86, duration: DUR.s, ease: EASE.out, stagger: 0.03 }, 0.6);
        hold(tl, 0.2);
      });
    },
    [flow],
  );

  return (
    <div ref={scope} className="slide grid-12 items-center gap-y-8">
      {/* Identidade */}
      <div className="col-span-12 flex flex-col lg:col-span-5">
        <SectionHeader index={index} label={copy.label} title={copy.headline} titleClassName="!text-[clamp(34px,3.7vw,66px)]" />
        <div className={styles.idRow}>
          <div data-a="avatar" className={styles.avatar}>
            {copy.photo ? (
              // eslint-disable-next-line @next/next/no-img-element -- foto local opcional (funciona no export estático)
              <img src={copy.photo} alt={copy.photoAlt} />
            ) : (
              <span className={styles.monogram} aria-hidden="true">
                {copy.monogram}
              </span>
            )}
          </div>
          <div data-a="id" className="min-w-0">
            <p className={styles.role}>{copy.role}</p>
            <p className={styles.linkedin}>{copy.linkedin}</p>
          </div>
        </div>
        <p data-a="summary" className="t-lede mt-[clamp(14px,2.4vh,24px)] max-w-[40ch] text-fg-2">
          {copy.summary}
        </p>
      </div>

      {/* Cenas */}
      <div className={cn("col-span-12 lg:col-span-7", styles.stage)}>
        {/* Cena 0: em números */}
        <div data-scene="0" className={styles.scene}>
          <div className={styles.facts}>
            {copy.facts.map((f) => (
              <div key={f.value + f.label} data-a="fact" className={styles.fact}>
                <span className={styles.factValue}>{f.value}</span>
                <span className={styles.factLabel}>{f.label}</span>
              </div>
            ))}
          </div>
          <p className="t-label mt-[clamp(16px,3vh,28px)] text-fg-3">{copy.skillsTitle}</p>
          <ul className={styles.skills}>
            {copy.skills.map((s) => (
              <li key={s} data-a="skill" className={styles.skill}>
                {s}
              </li>
            ))}
          </ul>
        </div>

        {/* Cena 1: trajetória e formação */}
        <div data-scene="1" className={cn(styles.scene, "pre")}>
          <div className={styles.careerGrid}>
            <section aria-labelledby="profile-career">
              <h3 id="profile-career" className={styles.sceneTitle}>
                <span className="t-label text-fg-2">{copy.careerTitle}</span>
                <span className="text-[12px] text-fg-3">{copy.careerNote}</span>
              </h3>
              <ol className={styles.career}>
                {copy.career.map((j) => (
                  <li key={j.company} data-a="job" className={styles.job}>
                    <span className={styles.company}>{j.company}</span>
                    <span className={styles.years}>{j.years}</span>
                    <span className={styles.jobLine}>
                      {j.role}.<span className={styles.jobFocus}> {j.focus}.</span>
                    </span>
                  </li>
                ))}
              </ol>
            </section>
            <div className={styles.side}>
              <section data-a="side" aria-labelledby="profile-edu">
                <h3 id="profile-edu" className="t-label mb-1 text-fg-2">
                  {copy.educationTitle}
                </h3>
                <ul className={styles.edu}>
                  {copy.education.map((e) => (
                    <li key={e.school}>
                      <span className={styles.school}>{e.school}</span>
                      <span className={styles.course}>{e.course}</span>
                    </li>
                  ))}
                </ul>
              </section>
              <section data-a="side" aria-labelledby="profile-certs">
                <h3 id="profile-certs" className="t-label mb-2 text-fg-2">
                  {copy.certificationsTitle}
                </h3>
                <div className={styles.certs}>
                  {copy.certifications.map((c) => (
                    <span key={c} className={styles.cert}>
                      {c}
                    </span>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>

        {/* Cena 2: o que trago para a BORA */}
        <div data-scene="2" className={cn(styles.scene, "pre")}>
          <h3 className={styles.sceneTitle}>
            <span className="t-label text-fg-2">{copy.bringTitle}</span>
            <span className="text-[12px] text-fg-3">{copy.bringNote}</span>
          </h3>
          <ul className={styles.bring}>
            {copy.bring.map((b) => (
              <li key={b.skill} data-a="bring" className={styles.bringRow}>
                <span>
                  <span className={styles.bringSkill}>{b.skill}</span>
                  <span className={styles.bringFrom}>{b.from}</span>
                </span>
                <span className={styles.chips}>
                  {b.actions.map((id) => {
                    const g = growthById(id);
                    if (!g) return null;
                    return (
                      <span key={id} data-a="chip" className={cn(styles.chip, styles[`chip_${g.stage}`])}>
                        <StageDots stage={g.stage} />
                        {g.name}
                      </span>
                    );
                  })}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
