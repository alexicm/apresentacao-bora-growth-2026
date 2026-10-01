// Motor da apresentação.
// Modelo: uma posição de scroll = um estado (slide + passo). Scroll natural, teclado e mapa
// passam pelo mesmo cálculo, então a apresentação nunca "se perde".
//
// Cada <section> tem altura 100svh + (passos-1) × --step-len e um palco `sticky`.
// Enquanto o palco está fixo, rolar muda apenas o passo; entre seções, o próximo slide cobre o anterior.

import { SLIDES } from "@/content/deck";
import { gsap } from "@/lib/gsap";
import { motionPrefs } from "@/lib/motion";
import { clamp } from "@/lib/utils";

export type SlideState = Readonly<{ entered: boolean; step: number; mounted: boolean }>;
export type DeckMode = "deck" | "flow";
export type Overlay = "map" | null;
/** Aba do mapa: índice de slides ou pastas de projetos. */
export type MapTab = "slides" | "projects";
export type NavMethod = "tween" | "instant" | "cut";

export type DeckSnapshot = Readonly<{
  current: number;
  step: number;
  steps: number;
  mode: DeckMode;
  overlay: Overlay;
  mapTab: MapTab;
  /** Ação aberta nas pastas ao abrir o mapa por um slide (clique num projeto). */
  mapFocus: string | null;
  started: boolean;
  fullscreen: boolean;
}>;

const COUNT = SLIDES.length;
/** A seção "entra" (dispara a revelação) quando seu topo cruza este ponto da viewport. */
const ENTER_AT = 0.62;
const FLOW_ENTER_AT = 0.82;
/** Duração da troca de slide pelo teclado. */
const SLIDE_DURATION = 1.1;
/** Abaixo disso, a apresentação vira documento empilhado (mobile / janelas baixas). */
export const FLOW_QUERY = "(max-width: 767px), (max-height: 559px)";

type Target = { slide: number; step: number };

class DeckStore {
  private els: (HTMLElement | null)[] = new Array(COUNT).fill(null);
  private tops: number[] = new Array(COUNT).fill(0);
  private stepLens: number[] = new Array(COUNT).fill(0);
  private vh = 1;
  private measured = false;
  private states: SlideState[] = SLIDES.map((_, i) => ({ entered: i === 0, step: 0, mounted: i < 2 }));
  private snapshot: DeckSnapshot = {
    current: 0,
    step: 0,
    steps: SLIDES[0].steps,
    mode: "deck",
    overlay: null,
    mapTab: "slides",
    mapFocus: null,
    started: false,
    fullscreen: false,
  };
  private listeners = new Set<() => void>();
  private nav: Target | null = null;
  private tween: gsap.core.Tween | null = null;
  private keep: Target | null = null;
  private escapes: Array<() => void> = [];
  private cutHandler: ((jump: () => void) => void) | null = null;
  private hashIndex = -1;

  // ── Assinatura (useSyncExternalStore) ────────────────────────────────
  subscribe = (fn: () => void) => {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  };
  getSnapshot = () => this.snapshot;
  getSlide = (i: number) => this.states[i];

  private emit() {
    for (const fn of this.listeners) fn();
  }

  private patch(p: Partial<DeckSnapshot>) {
    const next = { ...this.snapshot, ...p };
    const changed = (Object.keys(p) as (keyof DeckSnapshot)[]).some((k) => this.snapshot[k] !== next[k]);
    if (changed) this.snapshot = next;
    return changed;
  }

  // ── Registro e medição ───────────────────────────────────────────────
  register(i: number, el: HTMLElement | null) {
    this.els[i] = el;
  }

  setCutHandler(fn: ((jump: () => void) => void) | null) {
    this.cutHandler = fn;
  }

  measure() {
    if (typeof window === "undefined") return;
    this.vh = window.innerHeight || 1;
    const y = window.scrollY;
    const mode: DeckMode = window.matchMedia(FLOW_QUERY).matches ? "flow" : "deck";
    for (let i = 0; i < COUNT; i++) {
      const el = this.els[i];
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      this.tops[i] = rect.top + y;
      const steps = SLIDES[i].steps;
      this.stepLens[i] = mode === "deck" && steps > 1 ? Math.max(1, (rect.height - this.vh) / (steps - 1)) : 0;
    }
    this.measured = true;
    if (this.patch({ mode })) this.emit();
  }

  /** Deriva, a partir do scroll, quais slides entraram e em que passo cada um está. */
  update(y = typeof window !== "undefined" ? window.scrollY : 0) {
    if (!this.measured) return;
    const vh = this.vh;
    const flow = this.snapshot.mode === "flow";
    let current = 0;
    let changed = false;

    for (let i = 0; i < COUNT; i++) {
      const rel = this.tops[i] - y; // topo da seção em relação ao topo da viewport
      if (rel <= vh * 0.5) current = i;
      const prev = this.states[i];
      let entered = prev.entered;
      if (rel <= vh * (flow ? FLOW_ENTER_AT : ENTER_AT)) entered = true;
      else if (rel >= vh - 1) entered = false; // saiu totalmente por baixo → reinicia
      const steps = SLIDES[i].steps;
      let step = 0;
      if (entered) {
        if (flow) step = steps - 1;
        else if (steps > 1 && this.stepLens[i] > 0) step = clamp(Math.round(-rel / this.stepLens[i]), 0, steps - 1);
      }
      const mounted = prev.mounted || entered;
      if (entered !== prev.entered || step !== prev.step || mounted !== prev.mounted) {
        this.states[i] = { entered, step, mounted };
        changed = true;
      }
    }

    // Vizinhos já montados para a navegação nunca esperar.
    for (const j of [current - 1, current + 1, current + 2]) {
      if (j >= 0 && j < COUNT && !this.states[j].mounted) {
        this.states[j] = { ...this.states[j], mounted: true };
        changed = true;
      }
    }

    if (this.patch({ current, step: this.states[current].step, steps: SLIDES[current].steps })) changed = true;
    this.syncHash(current);
    if (changed) this.emit();
  }

  positionOf(i: number, step = 0) {
    const s = clamp(step, 0, SLIDES[i].steps - 1);
    if (this.snapshot.mode === "flow") return this.tops[i];
    return this.tops[i] + s * this.stepLens[i];
  }

  /** Posição de passo mais próxima — usada pelo snap do ScrollTrigger. */
  snapTarget(y: number) {
    if (this.snapshot.mode === "flow" || this.snapshot.overlay) return y;
    let best = y;
    let bestD = Infinity;
    for (let i = 0; i < COUNT; i++) {
      for (let s = 0; s < SLIDES[i].steps; s++) {
        const p = this.positionOf(i, s);
        const d = Math.abs(p - y);
        if (d < bestD) {
          bestD = d;
          best = p;
        }
      }
    }
    return best;
  }

  /**
   * Encaixe próprio (no fim do scroll natural): leva à posição de passo mais próxima.
   * Fica na mesma referência de tween da navegação, então qualquer goTo() o cancela.
   */
  snapNow() {
    if (typeof window === "undefined" || !this.measured || this.nav || this.tween) return;
    if (this.snapshot.mode === "flow" || this.snapshot.overlay) return;
    const y = window.scrollY;
    const target = this.snapTarget(y);
    const dist = Math.abs(target - y);
    if (dist < 2) return;
    if (motionPrefs.reduced) {
      window.scrollTo(0, target);
      this.update(target);
      return;
    }
    this.tween = gsap.to(window, {
      scrollTo: { y: target, autoKill: true, onAutoKill: () => (this.tween = null) },
      duration: clamp((dist / this.vh) * 0.7, 0.2, 0.6),
      ease: "power2.inOut",
      onComplete: () => {
        this.tween = null;
        this.update();
      },
    });
  }

  // ── Navegação ────────────────────────────────────────────────────────
  private logical(): Target {
    if (this.nav) return this.nav;
    const c = this.snapshot.current;
    const st = this.states[c];
    return { slide: c, step: st.entered ? st.step : -1 };
  }

  next() {
    const { slide, step } = this.logical();
    if (this.snapshot.mode === "flow") return this.goTo(Math.min(slide + 1, COUNT - 1), 0);
    if (step < 0) return this.goTo(slide, 0);
    if (step < SLIDES[slide].steps - 1) return this.goTo(slide, step + 1, "instant");
    if (slide < COUNT - 1) this.goTo(slide + 1, 0);
  }

  prev() {
    const { slide, step } = this.logical();
    if (this.snapshot.mode === "flow") return this.goTo(Math.max(slide - 1, 0), 0);
    if (step > 0) return this.goTo(slide, step - 1, "instant");
    if (slide > 0) this.goTo(slide - 1, SLIDES[slide - 1].steps - 1);
  }

  first() {
    this.goTo(0, 0, "cut");
  }

  last() {
    this.goTo(COUNT - 1, SLIDES[COUNT - 1].steps - 1, "cut");
  }

  /**
   * tween   — troca de slide com rolagem animada (padrão).
   * instant — salto imediato; usado entre passos (o palco está fixo, então nada "pula").
   * cut     — cortina rápida + salto; usado pelo mapa para ir longe.
   */
  goTo(slide: number, step = 0, method: NavMethod = "tween") {
    if (typeof window === "undefined" || !this.measured || !Number.isFinite(slide)) return;
    const i = clamp(Math.round(slide), 0, COUNT - 1);
    this.markStarted();
    this.ensureMounted(i, i + 1);
    this.tween?.kill();
    this.tween = null;

    const jump = () => {
      const y = this.positionOf(i, step);
      window.scrollTo(0, y);
      this.nav = null;
      this.update(y);
    };

    if (method === "instant" || (method === "tween" && motionPrefs.reduced)) return jump();
    if (method === "cut") {
      this.nav = { slide: i, step };
      if (this.cutHandler) this.cutHandler(jump);
      else jump();
      return;
    }

    this.nav = { slide: i, step };
    this.tween = gsap.to(window, {
      scrollTo: {
        y: this.positionOf(i, step),
        autoKill: true,
        onAutoKill: () => {
          this.nav = null;
          this.tween = null;
        },
      },
      duration: SLIDE_DURATION,
      ease: "power3.inOut",
      onComplete: () => {
        this.nav = null;
        this.tween = null;
        this.update();
      },
    });
  }

  ensureMounted(...indices: number[]) {
    let changed = false;
    for (const i of indices) {
      if (i < 0 || i >= COUNT || this.states[i].mounted) continue;
      this.states[i] = { ...this.states[i], mounted: true };
      changed = true;
    }
    if (changed) this.emit();
  }

  // ── Resize / fullscreen: preserva slide e passo ─────────────────────
  beforeRefresh() {
    if (!this.measured) return;
    this.keep = this.nav ?? { slide: this.snapshot.current, step: this.states[this.snapshot.current].step };
  }

  afterRefresh() {
    this.measure();
    if (this.keep) {
      this.tween?.kill();
      this.tween = null;
      this.nav = null;
      const y = this.positionOf(this.keep.slide, this.keep.step);
      if (Math.abs(window.scrollY - y) > 1) window.scrollTo(0, y);
      this.keep = null;
    }
    this.update();
  }

  // ── Overlays, teclado, tela cheia ────────────────────────────────────
  setOverlay(o: Overlay) {
    if (this.patch({ overlay: o })) this.emit();
  }

  /** M abre os slides, P abre as pastas de projetos; a mesma tecla de novo fecha. */
  toggleMap(tab: MapTab = "slides") {
    this.markStarted();
    const { overlay, mapTab } = this.snapshot;
    if (overlay === "map" && mapTab === tab) return this.setOverlay(null);
    if (this.patch({ overlay: "map", mapTab: tab, mapFocus: null })) this.emit();
  }

  /** Abre as pastas já com a ficha de uma ação. */
  openProject(id: string) {
    this.markStarted();
    if (this.patch({ overlay: "map", mapTab: "projects", mapFocus: id })) this.emit();
  }

  setMapTab(tab: MapTab) {
    if (this.patch({ mapTab: tab })) this.emit();
  }

  /** Pilha de "fechar" para o ESC: o overlay mais recente fecha primeiro. */
  pushEscape(fn: () => void) {
    this.escapes.push(fn);
    return () => {
      this.escapes = this.escapes.filter((f) => f !== fn);
    };
  }

  escape() {
    const fn = this.escapes[this.escapes.length - 1];
    if (!fn) return false;
    fn();
    return true;
  }

  toggleFullscreen() {
    const d = document;
    if (d.fullscreenElement) d.exitFullscreen?.().catch(() => undefined);
    else d.documentElement.requestFullscreen?.().catch(() => undefined);
  }

  setFullscreen(v: boolean) {
    if (this.patch({ fullscreen: v })) this.emit();
  }

  markStarted() {
    if (this.patch({ started: true })) this.emit();
  }

  private syncHash(i: number) {
    if (i === this.hashIndex || typeof window === "undefined") return;
    this.hashIndex = i;
    const url = i === 0 ? window.location.pathname + window.location.search : `#${SLIDES[i].id}`;
    window.history.replaceState(null, "", url);
  }
}

export const deck = new DeckStore();
