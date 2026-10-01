"use client";

import { createContext, useContext, useSyncExternalStore, type RefObject } from "react";
import type { SlideId } from "@/content/deck";
import { deck } from "./deck-store";

export function useDeck() {
  return useSyncExternalStore(deck.subscribe, deck.getSnapshot, deck.getSnapshot);
}

export function useSlideState(index: number) {
  const get = () => deck.getSlide(index);
  return useSyncExternalStore(deck.subscribe, get, get);
}

/** true enquanto este slide é o atual — use para pausar loops fora de cena. */
export function useIsCurrent(index: number) {
  const get = () => deck.getSnapshot().current === index;
  return useSyncExternalStore(deck.subscribe, get, get);
}

export type SlideContextValue = {
  index: number;
  id: SlideId;
  steps: number;
  sectionRef: RefObject<HTMLElement | null>;
  stageRef: RefObject<HTMLDivElement | null>;
};

export const SlideContext = createContext<SlideContextValue | null>(null);

/** Estado do slide em que o componente está: passo atual, se já entrou, refs. */
export function useSlide() {
  const ctx = useContext(SlideContext);
  if (!ctx) throw new Error("useSlide() precisa estar dentro de <PresentationSection>.");
  const state = useSlideState(ctx.index);
  const current = useIsCurrent(ctx.index);
  return { ...ctx, ...state, current };
}
