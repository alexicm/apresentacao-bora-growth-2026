import type { SlideMeta } from "../types";

export const meta = {
  id: "close",
  title: "Construa a rede",
  chapter: "close",
  steps: 2,
  theme: "dark",
  summary: "Brasília como laboratório. O Brasil como projeto.",
} as const satisfies SlideMeta;

export const copy = {
  small: "A oportunidade é maior do que vender mais assessoria.",
  headline: ["Construa", "**a rede.**"],
  closing: ["Brasília como laboratório.", "**O Brasil como projeto.**"],
} as const;
