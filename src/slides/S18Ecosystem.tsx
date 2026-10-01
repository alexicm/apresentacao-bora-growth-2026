"use client";

import { useMemo, useState } from "react";
import { useSlide } from "@/components/deck/hooks";
import { useStepTimeline } from "@/components/deck/useStepTimeline";
import { EcosystemMap } from "@/components/diagrams/EcosystemMap";
import { SectionHeader, revealHeader } from "@/components/ui/SectionHeader";
import { SimPanel } from "@/components/ui/SimPanel";
import { StageTag } from "@/components/ui/StageTag";
import { Toggle } from "@/components/ui/Toggle";
import { GROWTH_FRONTS, GROWTH_PROJECTS, PACK, STAGE_DEF, STAGE_PLURAL, STAGES, horizonLabel, type GrowthFront, type GrowthProject } from "@/content/projects";
import { copy } from "@/content/slides/18-ecosystem";
import { draw, fade, motionPrefs, pop, rise } from "@/lib/motion";
import { cn } from "@/lib/utils";
import styles from "./S18Ecosystem.module.css";

type View = "map" | "table";
type Preset = (typeof copy.sim.presets)[number]["value"];
type Filter = GrowthFront | "all";

const BY_ID = new Map(GROWTH_PROJECTS.map((p) => [p.id, p]));
const DEP_COUNT = GROWTH_PROJECTS.reduce((n, p) => n + p.dependsOn.length, 0);
const USERS = new Map<string, string[]>();
GROWTH_PROJECTS.forEach((p) => p.dependsOn.forEach((d) => USERS.set(d, [...(USERS.get(d) ?? []), p.id])));
const LAYERS = ["open", "powered", "enterprise", "pass", "coaching"] as const;

/** Quantas ações se apoiam (direta ou indiretamente) na base BORA ID + CRM. */
const BASE_IDS = ["bora-id", "crm-tracking"];
const dependsOnBase = (id: string, seen = new Set<string>()): boolean =>
  (BY_ID.get(id)?.dependsOn ?? []).some((d) => {
    if (BASE_IDS.includes(d)) return true;
    if (seen.has(d)) return false;
    seen.add(d);
    return dependsOnBase(d, seen);
  });
const OTHERS = PACK.filter((p) => !BASE_IDS.includes(p.id));
const LEDE = copy.lede
  .replace("{n}", String(OTHERS.filter((p) => dependsOnBase(p.id)).length))
  .replace("{m}", String(OTHERS.length));

/** Ligar por estágio (cumulativo): Rodando hoje → + Backlog → Tudo. */
function presetSet(preset: Preset) {
  const take: Record<Preset, GrowthProject["stage"][]> = {
    agora: ["agora"],
    depois: ["agora", "depois"],
    tudo: ["agora", "depois", "ideia"],
  };
  return new Set(GROWTH_PROJECTS.filter((p) => take[preset].includes(p.stage)).map((p) => p.id));
}

const sameSet = (a: ReadonlySet<string>, b: ReadonlySet<string>) => a.size === b.size && [...a].every((x) => b.has(x));
const nameOf = (id: string) => BY_ID.get(id)?.name ?? id;
const shortOf = (id: string) => copy.shortNames[id] ?? nameOf(id);
const mapName = (id: string) => copy.mapNames[id] ?? nameOf(id);

/** Selo de estágio; o produto atual (Coaching) aparece como base do pack. */
function ProjectStage({ p }: { p: GrowthProject }) {
  return p.core ? <StageTag stage={p.stage} label={copy.legend.baseTag} /> : <StageTag of={p.id} />;
}

export function EcosystemSlide() {
  const { index, step, current } = useSlide();
  const [hovered, setHovered] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [preset, setPreset] = useState<Preset>("agora");
  const [active, setActive] = useState<ReadonlySet<string>>(() => presetSet("agora"));
  // Escolhas do apresentador valem só enquanto ele está no passo em que foram feitas.
  const [viewPick, setViewPick] = useState<{ step: number; view: View } | null>(null);
  const [filterPick, setFilterPick] = useState<{ step: number; filter: Filter } | null>(null);
  const [lastStep, setLastStep] = useState(step);
  if (lastStep !== step) {
    setLastStep(step);
    setViewPick(null);
    setFilterPick(null);
  }

  const mode = step >= 2 ? "build" : "explore";
  // O passo define a vista: 0 = mapa, 1 = tabela, 2 = mapa em modo montar.
  const view: View = step === 1 ? (viewPick?.step === 1 ? viewPick.view : "table") : "map";
  const filter: Filter = filterPick?.step === step ? filterPick.filter : "all";
  const setView = (v: View) => setViewPick({ step, view: v });
  const setFilter = (f: Filter) => setFilterPick({ step, filter: f });

  const { scope } = useStepTimeline(({ step: at, q }) => {
    at(0, (tl) => {
      revealHeader(tl, q);
      rise(tl, q('[data-a="lede"]'), 0.45, { y: 14 });
      rise(tl, q('[data-a="eco-head"]'), 0.35, { stagger: 0.06, y: 10 });
      rise(tl, q('[data-a="eco-node"]'), 0.5, { stagger: 0.018, y: 12, duration: 0.7 });
      // As dependências se propagam a partir da Fundação, nível a nível.
      for (let d = 0; d <= 6; d++) {
        const edges = q(`[data-a="eco-edge"][data-depth="${d}"]`);
        if (edges.length) draw(tl, edges, 0.7 + d * 0.18, { duration: d === 0 ? 0.45 : 0.75, stagger: 0.03 });
      }
      pop(tl, q('[data-a="eco-dot"]'), 1.45, { stagger: 0.01, duration: 0.4 });
      fade(tl, q('[data-a="eco-rail-label"]'), 1.4, { duration: 0.5 });
      rise(tl, q('[data-a="strip"]'), 1.0, { y: 16 });
    });

    at(1, (tl) => {
      rise(tl, q('[data-a="view-toggle"]'), 0, { y: 8, duration: 0.6 });
      rise(tl, q('[data-a="filters"]'), 0.1, { y: 8, duration: 0.6 });
      rise(tl, q('[data-a="trow"]'), 0.2, { stagger: 0.024, y: 8, duration: 0.55 });
      fade(tl, q('[data-a="table-note"]'), 0.7, { duration: 0.5 });
    });

    at(2, (tl) => {
      tl.to(q('[data-a="view-toggle"]'), { autoAlpha: 0, duration: 0.3 }, 0);
      rise(tl, q('[data-a="sim"]'), 0.15, { y: 18 });
      rise(tl, q('[data-a="sim-item"]'), 0.35, { stagger: 0.08, y: 10, duration: 0.6 });
    });
  });

  const focus = mode === "explore" ? (hovered ?? selected) : null;
  const focusProject = focus ? BY_ID.get(focus) : undefined;

  // ── Simulação ────────────────────────────────────────────────────────
  const missingPairs = useMemo(
    () =>
      GROWTH_PROJECTS.filter((p) => active.has(p.id)).flatMap((p) =>
        p.dependsOn.filter((d) => !active.has(d)).map((d) => ({ who: p.id, needs: d })),
      ),
    [active],
  );
  const missing = useMemo(() => new Set(missingPairs.map((m) => m.needs)), [missingPairs]);
  const coveredFronts = GROWTH_FRONTS.filter((f) => GROWTH_PROJECTS.some((p) => p.front === f && active.has(p.id)));
  const measurable = active.has("bora-id") && active.has("crm-tracking");
  const measureGap = [!active.has("bora-id") && copy.sim.idName, !active.has("crm-tracking") && copy.sim.crmName].filter(Boolean).join(` ${copy.sim.and} `);
  const packOn = PACK.filter((p) => active.has(p.id)).length;
  const offLayers = LAYERS.filter((l) => !active.has(l));
  const isCustom = !sameSet(active, presetSet(preset));

  const choosePreset = (v: Preset) => {
    setPreset(v);
    setActive(presetSet(v));
  };
  const activate = (id: string) => {
    if (mode === "build") {
      setActive((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
    } else {
      setSelected((s) => (s === id ? null : id));
    }
  };

  const stageCounts = STAGES.map((s) => ({ s, n: PACK.filter((p) => p.stage === s).length }));
  const shownRows = filter === "all" ? GROWTH_PROJECTS : GROWTH_PROJECTS.filter((p) => p.front === filter);

  return (
    <div ref={scope} className={cn("slide", styles.root)}>
      <div className={cn("grid-12 items-end gap-y-4", styles.top)}>
        <SectionHeader index={index} label={copy.label} title={copy.headline} className="col-span-12 lg:col-span-7" titleClassName={styles.headline} />
        <div className="col-span-12 flex flex-col items-start gap-4 lg:col-span-4 lg:col-start-9">
          <p data-a="lede" className={cn("t-lede", styles.lede)}>
            {LEDE}
          </p>
          <div data-a="view-toggle" className={styles.viewToggle}>
            <Toggle
              size="sm"
              label={copy.viewLabel}
              value={view}
              onChange={(v) => setView(v)}
              options={[
                { value: "map", label: copy.views.map },
                { value: "table", label: copy.views.table },
              ]}
            />
          </div>
        </div>
      </div>

      <div className={styles.main} data-view={view}>
        {/* ── Mapa (+ painel da ação / simulação) ────────────────────── */}
        <div className={styles.mapView} aria-hidden={view !== "map"}>
          <EcosystemMap
            className={styles.mapBox}
            projects={GROWTH_PROJECTS}
            fronts={GROWTH_FRONTS}
            names={copy.mapNames}
            railLabels={copy.railLabels}
            ariaLabel={copy.mapLabel}
            focus={focus}
            selected={selected}
            mode={mode}
            active={active}
            missing={missing}
            missingTag={copy.sim.missingTag}
            stateLabels={{ on: copy.sim.on, off: copy.sim.off }}
            animate={current && !motionPrefs.reduced}
            onHover={setHovered}
            onActivate={activate}
          />

          <div className={styles.strip}>
            {/* Painel da ação (explorar) */}
            <div className={styles.layer} data-show={mode === "explore"}>
              <div data-a="strip" className={styles.inspector} aria-live="polite">
                {focusProject ? (
                  <>
                    <div className={styles.inspName}>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                        <ProjectStage p={focusProject} />
                        <span className="t-label text-fg-3">
                          {focusProject.front} · <span className="t-mono tracking-normal normal-case">{horizonLabel(focusProject.horizon)}</span>
                        </span>
                      </div>
                      <p className={styles.inspTitle}>{focusProject.name}</p>
                      {focusProject.core && <p className={styles.inspNote}>{copy.inspector.coreNote}</p>}
                    </div>
                    <dl className={styles.inspFacts}>
                      <div>
                        <dt className="t-label text-fg-3">{copy.inspector.goal}</dt>
                        <dd>{focusProject.goal}</dd>
                      </div>
                      <div>
                        <dt className="t-label text-fg-3">{copy.inspector.kpi}</dt>
                        <dd className="font-semibold text-fg">{focusProject.kpi}</dd>
                      </div>
                    </dl>
                    <dl className={styles.inspChain}>
                      <div>
                        <dt className="t-label text-fg-3">
                          <i className={styles.keyUp} aria-hidden="true" />
                          {copy.inspector.deps}
                        </dt>
                        <dd>
                          {focusProject.dependsOn.length ? (
                            focusProject.dependsOn.map((d) => (
                              <span key={d} className={styles.chip}>
                                {shortOf(d)}
                              </span>
                            ))
                          ) : (
                            <span className="text-fg-3">{copy.inspector.noDeps}</span>
                          )}
                        </dd>
                      </div>
                      <div>
                        <dt className="t-label text-fg-3">
                          <i className={styles.keyDown} aria-hidden="true" />
                          {copy.inspector.unlocks}
                        </dt>
                        <dd>
                          {(USERS.get(focusProject.id) ?? []).length ? (
                            (USERS.get(focusProject.id) ?? []).map((d) => (
                              <span key={d} className={cn(styles.chip, styles.chipDown)}>
                                {shortOf(d)}
                              </span>
                            ))
                          ) : (
                            <span className="text-fg-3">{copy.inspector.noUnlocks}</span>
                          )}
                        </dd>
                      </div>
                    </dl>
                  </>
                ) : (
                  <>
                    <dl className={styles.stats}>
                      {[
                        { n: PACK.length, l: copy.stats.actions },
                        { n: GROWTH_FRONTS.length, l: copy.stats.fronts },
                        { n: DEP_COUNT, l: copy.stats.deps },
                      ].map((s) => (
                        <div key={s.l}>
                          <dt className={styles.statNum}>{s.n}</dt>
                          <dd className={styles.statLabel}>{s.l}</dd>
                        </div>
                      ))}
                    </dl>
                    <ul className={styles.legend} aria-label={copy.legend.title}>
                      {stageCounts.map(({ s, n }) => (
                        <li key={s}>
                          <StageTag stage={s} label={STAGE_PLURAL[s]} />
                          <span className={cn("t-mono", styles.legendCount)}>{n}</span>
                          <span className={styles.legendDef}>{STAGE_DEF[s]}</span>
                        </li>
                      ))}
                      <li className={styles.legendBase}>
                        <i className={styles.baseSwatch} aria-hidden="true" />
                        <span className={styles.legendDef}>{copy.legend.base}</span>
                      </li>
                    </ul>
                    <div className={styles.hintBox}>
                      <p className={styles.hint}>{copy.inspector.hint}</p>
                      <p className={styles.lineKey}>
                        <span>
                          <i className={styles.keyUp} aria-hidden="true" />
                          {copy.legend.upstream}
                        </span>
                        <span>
                          <i className={styles.keyDown} aria-hidden="true" />
                          {copy.legend.downstream}
                        </span>
                        <span>
                          <i className={styles.keyRail} aria-hidden="true" />
                          {copy.legend.rails}
                        </span>
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Simulação (montar) */}
            <div className={styles.layer} data-show={mode === "build"}>
              <div data-a="sim">
                <SimPanel title={copy.sim.title} note={copy.sim.note} className={styles.sim}>
                  <div className={styles.simGrid}>
                    <div data-a="sim-item" className={styles.simCell}>
                      <p className="t-label text-fg-3">{copy.sim.presetsLabel}</p>
                      <Toggle size="sm" label={copy.sim.presetsLabel} value={preset} onChange={choosePreset} options={copy.sim.presets} />
                      <div className={styles.frontsRow}>
                        <p className={styles.bigFig}>
                          <span className="t-mono">{coveredFronts.length}</span>
                          <span className={styles.bigOf}>
                            {copy.sim.of} {GROWTH_FRONTS.length} {copy.sim.fronts.toLowerCase()}
                          </span>
                        </p>
                        <ol className={styles.frontBars} aria-label={copy.sim.fronts}>
                          {GROWTH_FRONTS.map((f) => (
                            <li key={f} data-on={coveredFronts.includes(f)} title={f}>
                              <span className="sr-only">{f}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                      <p className={styles.activeCount}>
                        <span className="t-mono text-fg">{packOn}</span> {copy.sim.of} {PACK.length} {copy.sim.activeLabel}
                        <span className={cn(styles.custom, isCustom && styles.customOn)}> · {copy.sim.custom}</span>
                      </p>
                    </div>

                    <div data-a="sim-item" className={styles.simCell}>
                      <p className="t-label text-fg-3">{copy.sim.layers}</p>
                      <ol className={styles.layers}>
                        {LAYERS.map((l) => (
                          <li key={l} data-on={active.has(l)}>
                            {copy.sim.layerNames[l]}
                          </li>
                        ))}
                      </ol>
                      <p className={cn(styles.measure, measurable && styles.measureOk)}>
                        <i aria-hidden="true" />
                        {measurable
                          ? offLayers.length
                            ? `${copy.sim.measurable}. ${copy.sim.layersMissing}: ${offLayers.map((l) => copy.sim.layerNames[l]).join(", ")}.`
                            : `${copy.sim.measurable}. ${copy.sim.layersAll}.`
                          : copy.sim.notMeasurable.replace("{x}", measureGap)}
                      </p>
                    </div>

                    <div data-a="sim-item" className={styles.simCell}>
                      <p className="t-label text-fg-3">
                        {copy.sim.missing}
                        <span className="t-mono ml-2 tracking-normal text-fg">{missingPairs.length}</span>
                      </p>
                      {missingPairs.length ? (
                        <ul className={styles.missingList}>
                          {missingPairs.slice(0, 3).map((m) => (
                            <li key={`${m.who}-${m.needs}`}>
                              <strong>{mapName(m.who)}</strong> {copy.sim.dependsOn} <strong>{mapName(m.needs)}</strong>
                            </li>
                          ))}
                          {missingPairs.length > 3 && (
                            <li className="text-fg-3">
                              +{missingPairs.length - 3} {copy.sim.more}
                            </li>
                          )}
                        </ul>
                      ) : (
                        <p className={styles.allGood}>{copy.sim.noMissing}</p>
                      )}
                    </div>
                  </div>
                </SimPanel>
              </div>
            </div>
          </div>
        </div>

        {/* ── Tabela ─────────────────────────────────────────────────── */}
        <div className={styles.tableView} aria-hidden={view !== "table"}>
          <div data-a="filters" className={styles.filters}>
            <Toggle
              size="sm"
              label={copy.filterLabel}
              value={filter}
              onChange={setFilter}
              options={[{ value: "all" as Filter, label: copy.filterAll }, ...GROWTH_FRONTS.map((f) => ({ value: f as Filter, label: f }))]}
            />
            <p data-a="table-note" className={styles.tableNote}>
              {copy.horizonNote}
            </p>
          </div>
          <div className={styles.tableWrap}>
            <table className={cn("data-table data-table--dense", styles.table)}>
              <caption className="sr-only">{copy.tableCaption}</caption>
              <colgroup>
                <col className={styles.cProject} />
                <col className={styles.cFront} />
                <col className={styles.cStage} />
                <col />
                <col className={styles.cKpi} />
                <col className={styles.cWhen} />
                <col className={styles.cDeps} />
              </colgroup>
              <thead>
                <tr>
                  {Object.values(copy.columns).map((c) => (
                    <th key={c} scope="col" className="t-label">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {GROWTH_PROJECTS.map((p, i) => {
                  const first = i === 0 || GROWTH_PROJECTS[i - 1].front !== p.front;
                  const visible = shownRows.includes(p);
                  return (
                    <tr key={p.id} data-a="trow" className={cn("dt-row", first && styles.groupStart)} hidden={!visible}>
                      <th scope="row">{p.name}</th>
                      <td className={styles.front}>{first || filter !== "all" ? p.front : ""}</td>
                      <td>
                        <ProjectStage p={p} />
                      </td>
                      <td>{p.goal}</td>
                      <td className="text-fg">{p.kpi}</td>
                      <td className="t-mono">{horizonLabel(p.horizon)}</td>
                      <td>{p.dependsOn.length ? p.dependsOn.map(shortOf).join(" · ") : copy.noDeps}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
