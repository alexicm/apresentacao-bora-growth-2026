"use client";

import { useRef, type ReactNode } from "react";
import { Emphasis } from "@/components/ui/SplitHeadline";
import { gsap, useGSAP } from "@/lib/gsap";
import { motionPrefs } from "@/lib/motion";
import { cn } from "@/lib/utils";

export type UseCaseField = {
  key: string;
  label: string;
  /** Aceita **negrito** e ==marca-texto== quando for string. */
  value: ReactNode;
  /** Campo em destaque (ex.: conversão em usuários BORA): rótulo com marca-texto volt. */
  accent?: boolean;
};

type Props = {
  /** Identidade do conteúdo exibido — quando muda, os campos entram em sequência. */
  id: string;
  /** Linha acima do título (ex.: "01 / 04 · Entrada"). */
  kicker?: ReactNode;
  title: ReactNode;
  /** Frase-síntese em corpo grande (ex.: o objetivo do produto). */
  statementLabel?: string;
  statement?: string;
  fields: readonly UseCaseField[];
  /** Diagrama opcional entre a síntese e os campos (ocupa o espaço livre, centralizado). */
  visual?: ReactNode;
  /** Classes do contêiner do diagrama (ex.: esconder em telas baixas). */
  visualClassName?: string;
  /** Conteúdo extra no rodapé do painel (tag, nota, CTA). */
  footer?: ReactNode;
  className?: string;
  panelId?: string;
  /** id do controle que rotula o painel (aria-labelledby). */
  labelledBy?: string;
};

/**
 * Painel de caso de uso: um produto/projeto descrito sempre na mesma grade
 * (síntese grande + campos em duas colunas). Reutilizável em qualquer slide que
 * troque o conteúdo por seleção — a troca anima só o conteúdo novo (entrada em cascata).
 * Alvos internos de animação: `[data-ucp-in]`. Moldura: `.ucp` (animável pelo slide).
 */
export function UseCasePanel({
  id,
  kicker,
  title,
  statementLabel,
  statement,
  fields,
  visual,
  visualClassName,
  footer,
  className,
  panelId,
  labelledBy,
}: Props) {
  const rootRef = useRef<HTMLElement>(null);
  const shownId = useRef(id);

  useGSAP(
    () => {
      // Primeira montagem (e o duplo efeito do StrictMode) não animam: só trocas reais de conteúdo.
      if (shownId.current === id) return;
      shownId.current = id;
      const r = motionPrefs.reduced;
      gsap.from(gsap.utils.toArray<HTMLElement>("[data-ucp-in]", rootRef.current), {
        autoAlpha: 0,
        y: r ? 0 : 14,
        duration: r ? 0.3 : 0.62,
        ease: "bora",
        stagger: r ? 0 : 0.045,
        overwrite: true,
      });
    },
    { dependencies: [id], scope: rootRef },
  );

  return (
    <section
      ref={rootRef}
      id={panelId}
      aria-labelledby={labelledBy}
      className={cn(
        "ucp flex flex-col gap-[clamp(14px,2.4vh,28px)] rounded-[var(--radius-xl)] border border-line bg-surface p-[clamp(20px,2.2vw,36px)]",
        className,
      )}
    >
      <header className="ucp-head">
        {kicker && (
          <p data-ucp-in className="t-label text-fg-3">
            {kicker}
          </p>
        )}
        <h3 data-ucp-in className="ucp-title t-title mt-2.5 text-[clamp(22px,1.9vw,32px)]">
          {title}
        </h3>
      </header>

      {statement && (
        <div className="ucp-statement">
          {statementLabel && (
            <p data-ucp-in className="t-label text-fg-3">
              {statementLabel}
            </p>
          )}
          <p
            data-ucp-in
            className="ucp-statement-text mt-2.5 max-w-[30ch] text-[clamp(22px,2.35vw,42px)] leading-[1.12] font-light tracking-[-0.032em] text-balance text-fg [&_strong]:font-bold"
          >
            <Emphasis text={statement} />
          </p>
        </div>
      )}

      {visual && (
        <div data-ucp-in className={cn("ucp-visual flex min-h-0 flex-1 items-center", visualClassName)}>
          {visual}
        </div>
      )}

      <dl className="ucp-fields mt-auto grid grid-cols-1 gap-x-[var(--gutter)] gap-y-[clamp(12px,2.2vh,24px)] border-t border-line pt-[clamp(14px,2.4vh,26px)] sm:grid-cols-2">
        {fields.map((f) => (
          <div key={f.key} data-ucp-in className={cn("ucp-field", f.accent && "is-accent")}>
            <dt className="t-label text-fg-3">{f.accent ? <span className="hl">{f.label}</span> : f.label}</dt>
            <dd className="mt-1.5 max-w-[42ch] text-[length:var(--fs-body)] leading-snug text-fg-2">
              {typeof f.value === "string" ? <Emphasis text={f.value} /> : f.value}
            </dd>
          </div>
        ))}
      </dl>

      {footer && (
        <div data-ucp-in className="ucp-foot">
          {footer}
        </div>
      )}
    </section>
  );
}
