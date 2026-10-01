"use client";

import { useEffect } from "react";
import { deck } from "@/components/deck/deck-store";
import { Emphasis } from "@/components/ui/SplitHeadline";
import { Tag } from "@/components/ui/Tag";
import { slideIndex } from "@/content/deck";
import { StageTag } from "@/components/ui/StageTag";
import { PROJECTS, type Project, type ProjectId } from "@/content/projects";
import { cn } from "@/lib/utils";

type Labels = { layer: string; audience: string; feeds: string; example: string; goTo: string; close: string };

type Props = {
  project: Project | null;
  labels: Labels;
  onClose: () => void;
  onSelect: (id: ProjectId) => void;
  className?: string;
};


/**
 * Painel lateral de um produto (não-modal): abre ao clicar num nó do mapa.
 * ESC fecha; os produtos em "Alimenta" navegam dentro do painel; "Ver o produto" salta para o slide.
 */
export function ProjectModal({ project, labels, onClose, onSelect, className }: Props) {
  useEffect(() => {
    if (!project) return;
    return deck.pushEscape(onClose);
  }, [project, onClose]);

  return (
    <aside
      className={cn("panel", className)}
      data-open={Boolean(project)}
      role="dialog"
      aria-modal="false"
      aria-hidden={!project}
      aria-label={project?.name ?? "Produto"}
    >
      {project && (
        <div key={project.id} className="panel-body">
          <div className="flex items-center justify-between gap-3">
            {project.id === "coaching" ? <Tag kind="current">Produto atual</Tag> : <StageTag of={project.id} />}
            <button type="button" className="panel-close" onClick={onClose} aria-label={labels.close}>
              <span aria-hidden="true">×</span>
            </button>
          </div>

          <h3 className="t-headline mt-5 text-[clamp(28px,2.4vw,40px)]">
            <strong>{project.name}</strong>
          </h3>
          <p className="mt-3 text-[clamp(16px,1.2vw,19px)] leading-snug text-fg">
            <Emphasis text={project.tagline} />
          </p>
          <p className="mt-4 text-[14.5px] leading-relaxed text-fg-2">{project.description}</p>

          <dl className="panel-facts">
            <div>
              <dt className="t-label text-fg-3">{labels.layer}</dt>
              <dd>{project.layer}</dd>
            </div>
            <div>
              <dt className="t-label text-fg-3">{labels.audience}</dt>
              <dd>{project.audience}</dd>
            </div>
          </dl>

          {project.feeds.length > 0 && (
            <div className="mt-5">
              <p className="t-label text-fg-3">{labels.feeds}</p>
              <ul className="mt-2 flex flex-wrap gap-1.5">
                {project.feeds.map((f) => (
                  <li key={f}>
                    <button type="button" className="panel-chip" onClick={() => onSelect(f)}>
                      {PROJECTS[f].short}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="panel-example">
            <Tag kind="example">{labels.example}</Tag>
            <p className="mt-2.5 text-[14px] leading-relaxed text-fg-2">{project.example}</p>
          </div>

          {project.note && <p className="mt-4 text-[13px] leading-relaxed text-fg-3">{project.note}</p>}

          {project.slide && (
            <button
              type="button"
              className="pill pill--brand mt-6"
              onClick={() => {
                onClose();
                deck.goTo(slideIndex(project.slide!), 0, "cut");
              }}
            >
              {labels.goTo} <span aria-hidden="true">→</span>
            </button>
          )}
        </div>
      )}
    </aside>
  );
}
