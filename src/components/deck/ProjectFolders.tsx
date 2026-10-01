"use client";

import { useMemo, useState } from "react";
import { ActionBriefCard } from "@/components/ui/ActionBrief";
import { StageDots, StageTag } from "@/components/ui/StageTag";
import { Tag } from "@/components/ui/Tag";
import { slideIndex } from "@/content/deck";
import {
  GROWTH_FRONTS,
  GROWTH_PROJECTS,
  GROWTH_SLIDE,
  PACK,
  PROJECTS,
  STAGES,
  STAGE_DEF,
  STAGE_PLURAL,
  growthById,
  type GrowthProject,
  type ProjectStatus,
  type Stage,
} from "@/content/projects";
import { cn } from "@/lib/utils";
import { deck } from "./deck-store";
import { useDeck } from "./hooks";

const ORIGIN: Record<ProjectStatus, string> = {
  current: "Já existia na BORA",
  evolution: "Evolui algo que a BORA já fazia",
  proposed: "Novo, criado no pack",
};

/** Quem depende de cada ação (o que ela destrava). */
const UNLOCKS = GROWTH_PROJECTS.reduce<Record<string, string[]>>((acc, g) => {
  for (const d of g.dependsOn) (acc[d] ??= []).push(g.id);
  return acc;
}, {});

const names = (ids: string[]) => ids.map((id) => growthById(id)?.name ?? id);

/** Pastas do pack (tecla P): uma pasta por frente, cada ação com sua ficha e o atalho para o slide. */
export function ProjectFolders() {
  const { mapFocus } = useDeck();
  const [filter, setFilter] = useState<Stage | null>(null);
  const [selected, setSelected] = useState<string | null>(mapFocus);
  const project = selected ? growthById(selected) : undefined;

  const counts = useMemo(() => Object.fromEntries(STAGES.map((s) => [s, PACK.filter((g) => g.stage === s).length])) as Record<Stage, number>, []);

  return (
    <div className="pf" id="map-panel-projects" role="tabpanel" aria-labelledby="map-tab-projects">
      <div className="min-w-0">
        <div className="pf-filter" role="group" aria-label="Filtrar por estágio">
          <button type="button" className="pf-chip" aria-pressed={filter === null} onClick={() => setFilter(null)} data-pf-item>
            Todas <span className="t-mono">{PACK.length}</span>
          </button>
          {STAGES.map((s) => (
            <button
              key={s}
              type="button"
              className={cn("pf-chip", `pf-chip--${s}`)}
              aria-pressed={filter === s}
              onClick={() => setFilter(filter === s ? null : s)}
              title={STAGE_DEF[s]}
              data-pf-item
            >
              <StageDots stage={s} />
              {STAGE_PLURAL[s]} <span className="t-mono">{counts[s]}</span>
            </button>
          ))}
        </div>

        <div className="pf-grid">
          {GROWTH_FRONTS.map((front) => {
            const items = GROWTH_PROJECTS.filter((g) => g.front === front);
            const visible = filter ? items.filter((g) => g.stage === filter).length : items.length;
            return (
              <section key={front} className="pf-folder" aria-label={`Pasta ${front}`} data-pf-item data-empty={visible === 0 ? "" : undefined}>
                <header className="pf-folder-head">
                  <FolderIcon />
                  <h3>{front}</h3>
                  <span className="t-mono text-fg-3">{items.filter((g) => !g.core).length}</span>
                </header>
                <ul>
                  {items.map((g) => (
                    <li key={g.id}>
                      <button
                        type="button"
                        className={cn("pf-file", `pf-file--${g.stage}`)}
                        aria-pressed={selected === g.id}
                        data-dim={filter && g.stage !== filter ? "" : undefined}
                        onClick={() => setSelected(selected === g.id ? null : g.id)}
                        onDoubleClick={() => openSlide(g.id)}
                      >
                        <StageDots stage={g.stage} />
                        <span className="truncate">{g.name}</span>
                        {g.core ? (
                          <span className="pf-has-slide">atual</span>
                        ) : GROWTH_SLIDE[g.id] && (
                          <span className="pf-has-slide" aria-label="tem slide">
                            ↗
                          </span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      </div>

      <aside className="pf-ficha" aria-live="polite" data-pf-item>
        {project ? <Ficha g={project} /> : <Overview counts={counts} />}
      </aside>
    </div>
  );
}

function openSlide(id: string) {
  const target = GROWTH_SLIDE[id];
  if (!target) return;
  deck.setOverlay(null);
  deck.goTo(slideIndex(target), 0, "cut");
}

/** A ficha de cada ação: a mesma ActionBrief dos slides, mais dependências, origem, exemplo e atalho. */
function Ficha({ g }: { g: GrowthProject }) {
  const product = g.product ? PROJECTS[g.product] : undefined;
  const unlocks = UNLOCKS[g.id] ?? [];
  const slide = GROWTH_SLIDE[g.id];
  return (
    <div key={g.id} className="pf-ficha-in">
      <ActionBriefCard g={g} as="div" className="pf-brief">
        <dl className="pf-dl">
          {g.dependsOn.length > 0 && (
            <>
              <dt>Depende de</dt>
              <dd>{names(g.dependsOn).join(", ")}</dd>
            </>
          )}
          {unlocks.length > 0 && (
            <>
              <dt>Destrava</dt>
              <dd>{names(unlocks).join(", ")}</dd>
            </>
          )}
          <dt>Origem</dt>
          <dd>{ORIGIN[g.status]}</dd>
        </dl>

        {product && (
          <div className="pf-example">
            <Tag kind="example" />
            <p>{product.example}</p>
          </div>
        )}

        {slide && (
          <button type="button" className="pill pill--brand pf-open" onClick={() => openSlide(g.id)}>
            Abrir o slide <span aria-hidden="true">→</span>
          </button>
        )}
      </ActionBriefCard>
    </div>
  );
}

function Overview({ counts }: { counts: Record<Stage, number> }) {
  return (
    <div className="pf-ficha-in">
      <p className="t-label text-fg-3">Pastas do pack</p>
      <h3 className="pf-name">
        {PACK.length} ações em {GROWTH_FRONTS.length} frentes
      </h3>
      <ul className="mt-5 grid gap-3">
        {STAGES.map((s) => (
          <li key={s} className="flex items-start gap-3">
            <StageTag stage={s} className="shrink-0" />
            <span className="pt-1 text-[14px] leading-snug text-fg-2">
              <strong className="text-fg">{counts[s]}</strong> · {STAGE_DEF[s]}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-6 text-[13px] leading-relaxed text-fg-3">
        Escolha uma ação para abrir a ficha. O ícone ↗ indica que ela tem slide próprio; clique duas vezes para ir direto.
      </p>
    </div>
  );
}

function FolderIcon() {
  return (
    <svg viewBox="0 0 24 24" className="pf-folder-ico" aria-hidden="true" focusable="false">
      <path d="M3 6.5A1.5 1.5 0 0 1 4.5 5h4.6l2 2.2h8.4A1.5 1.5 0 0 1 21 8.7v9.8a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 18.5z" />
    </svg>
  );
}
