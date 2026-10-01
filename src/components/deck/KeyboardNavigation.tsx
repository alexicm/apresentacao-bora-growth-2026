"use client";

import { useEffect } from "react";
import { deck } from "./deck-store";

const NEXT = new Set(["ArrowRight", "ArrowDown", "PageDown"]);
const PREV = new Set(["ArrowLeft", "ArrowUp", "PageUp"]);

/** Atalhos: → ↓ PgDn Space avançam · ← ↑ PgUp Shift+Space voltam · Home/End · F tela cheia · M mapa · P pastas de projetos · ESC fecha. */
export function KeyboardNavigation() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (t?.closest("input, textarea, select, [contenteditable='true']")) return;

      if (e.key === "Escape") {
        if (deck.escape()) e.preventDefault();
        return;
      }
      if (e.key === "m" || e.key === "M") {
        e.preventDefault();
        deck.toggleMap("slides");
        return;
      }
      if (e.key === "p" || e.key === "P") {
        e.preventDefault();
        deck.toggleMap("projects");
        return;
      }
      if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        deck.toggleFullscreen();
        return;
      }
      // Com o mapa aberto, a navegação do deck fica suspensa (Tab/Enter navegam no mapa).
      if (deck.getSnapshot().overlay) return;

      if (e.key === " ") {
        // Botão focado pelo teclado: Space pertence ao botão. Focado pelo mouse: Space avança.
        if (t?.matches("button, [role='button'], [role='radio'], a") && t.matches(":focus-visible")) return;
        e.preventDefault();
        if (e.shiftKey) deck.prev();
        else deck.next();
        return;
      }
      if (NEXT.has(e.key)) {
        e.preventDefault();
        deck.next();
      } else if (PREV.has(e.key)) {
        e.preventDefault();
        deck.prev();
      } else if (e.key === "Home") {
        e.preventDefault();
        deck.first();
      } else if (e.key === "End") {
        e.preventDefault();
        deck.last();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return null;
}
