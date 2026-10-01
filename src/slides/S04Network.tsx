"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSlide } from "@/components/deck/hooks";
import { useStepTimeline } from "@/components/deck/useStepTimeline";
import { NetworkGraph, type GraphNode } from "@/components/diagrams/NetworkGraph";
import { ProjectModal } from "@/components/panels/ProjectModal";
import { SectionHeader, revealHeader } from "@/components/ui/SectionHeader";
import { Tag } from "@/components/ui/Tag";
import { copy } from "@/content/slides/04-network";
import { StageTag } from "@/components/ui/StageTag";
import { NETWORK_ORDER, PROJECTS, stageOf, type ProjectId } from "@/content/projects";
import { gsap } from "@/lib/gsap";
import { draw, fade, motionPrefs, pop, rise } from "@/lib/motion";

const CORE = { x: 500, y: 360 };

// Órbita em elipse (viewBox 1000×750): lado esquerdo = corredores; topo = comunidades; direita = empresas.
const NODES: GraphNode[] = [
  { id: "open", x: 112, y: 360 },
  { id: "powered", x: 626, y: 76 },
  { id: "enterprise", x: 888, y: 360 },
  { id: "challenges", x: 182, y: 186 },
  { id: "captains", x: 336, y: 86 },
  { id: "boost", x: 818, y: 190 },
  { id: "league", x: 818, y: 536 },
  { id: "house", x: 372, y: 652 },
  { id: "pass", x: 182, y: 536 },
  { id: "coaching", x: 500, y: 520, side: "right" },
];

const FIRST: ProjectId[] = ["open", "powered", "enterprise"];
const countStage = (st: string) => NETWORK_ORDER.filter((id) => stageOf(id) === st).length;
const LEDE = copy.lede.replace("{rodando}", String(countStage("rodando"))).replace("{ideia}", String(countStage("ideia")));
const REST = NODES.map((n) => n.id).filter((id) => !FIRST.includes(id));

export function NetworkSlide() {
  const { index, current, step, entered } = useSlide();
  const [selected, setSelected] = useState<ProjectId | null>(null);
  // Fora de cena, o painel fecha: ajuste de estado durante a renderização, sem efeito.
  const [wasCurrent, setWasCurrent] = useState(current);
  if (wasCurrent !== current) {
    setWasCurrent(current);
    if (!current) setSelected(null);
  }
  const [hovered, setHovered] = useState<ProjectId | null>(null);
  const graphRef = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setSelected(null), []);

  const { scope } = useStepTimeline(({ step: at, q }) => {
    const revealNode = (tl: gsap.core.Timeline, id: ProjectId, pos: number) => {
      draw(tl, q(`[data-spoke="${id}"]`), pos, { duration: 0.9 });
      tl.from(q(`[data-node="${id}"]`), { autoAlpha: 0, duration: 0.4 }, pos + 0.45);
      pop(tl, q(`[data-node="${id}"] .net-node-dot`), pos + 0.45, { duration: 0.6 });
      rise(tl, q(`[data-node="${id}"] .net-node-text`), pos + 0.55, { y: 10, duration: 0.7 });
    };

    // 0 — o núcleo: BORA OS.
    at(0, (tl) => {
      revealHeader(tl, q);
      pop(tl, q('[data-a="core"]'), 0.3, { duration: 1 });
      fade(tl, q('[data-a="core-label"]'), 0.7);
    });
    // 1–3 — as três primeiras portas: OPEN, POWERED, ENTERPRISE.
    at(1, (tl) => revealNode(tl, "open", 0));
    at(2, (tl) => revealNode(tl, "powered", 0));
    at(3, (tl) => revealNode(tl, "enterprise", 0));
    // 4 — o restante da rede, todos conectados.
    at(4, (tl) => {
      REST.forEach((id, i) => revealNode(tl, id, i * 0.12));
      fade(tl, q('[data-a="orbit"]'), 0.4, { duration: 1.6 });
      rise(tl, q('[data-a="legend"] > *'), 1.1, { stagger: 0.08, y: 8 });
    });
  });

  // Dados fluindo dos produtos para a camada comum (só no passo final, em cena).
  useEffect(() => {
    const svg = graphRef.current?.querySelector("svg");
    const layer = svg?.querySelector('[data-a="pulses"]');
    if (!svg || !layer || !current || !entered || step < 4 || motionPrefs.reduced) return;
    const NS = "http://www.w3.org/2000/svg";
    const tweens: gsap.core.Timeline[] = [];
    NODES.forEach((n, i) => {
      const c = document.createElementNS(NS, "circle");
      c.setAttribute("r", "3");
      c.setAttribute("cx", String(n.x));
      c.setAttribute("cy", String(n.y));
      c.setAttribute("class", "net-pulse");
      c.setAttribute("opacity", "0");
      layer.appendChild(c);
      tweens.push(
        gsap
          .timeline({ repeat: -1, repeatDelay: 1.6 + (i % 4) * 0.5, delay: 1.2 + i * 0.37 })
          .fromTo(c, { attr: { cx: n.x, cy: n.y }, opacity: 0 }, { opacity: 1, duration: 0.25 })
          .to(c, { attr: { cx: CORE.x, cy: CORE.y }, duration: 1.8, ease: "power1.in" }, 0)
          .to(c, { opacity: 0, duration: 0.3 }, 1.5),
      );
    });
    return () => {
      tweens.forEach((t) => t.kill());
      layer.replaceChildren();
    };
  }, [current, entered, step]);

  return (
    <div ref={scope} className="slide grid-12 items-center gap-y-6">
      <div className="col-span-12 flex flex-col justify-center lg:col-span-4">
        <SectionHeader index={index} label={copy.label} title={copy.headline} lede={LEDE} size="l" />
        <div data-a="legend" className="mt-8 flex flex-col items-start gap-3">
          <p className="t-label text-fg-2">{copy.hint}</p>
          <div className="flex flex-wrap gap-2">
            <StageTag stage="rodando" />
            <StageTag stage="ideia" />
            <Tag kind="current">{copy.coachingCaption}</Tag>
          </div>
        </div>
      </div>

      <div ref={graphRef} className="col-span-12 lg:col-span-8">
        <NetworkGraph
          className="mx-auto max-w-[calc((100svh-2*var(--chrome-h)-40px)*4/3)]"
          core={{ ...CORE, label: PROJECTS.os.name, caption: copy.coreCaption }}
          nodes={NODES}
          selected={selected}
          hovered={hovered}
          onSelect={(id) => setSelected((cur) => (cur === id ? null : id))}
          onHover={setHovered}
        />
      </div>

      <ProjectModal project={selected ? PROJECTS[selected] : null} labels={copy.panel} onClose={close} onSelect={setSelected} />
    </div>
  );
}
