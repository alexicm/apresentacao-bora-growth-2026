/**
 * Capítulos. A versão curta usa opening, shift, pack, fronts, plan e close.
 * start, later, ideas e system ficam para os slides da versão longa (fora do deck, mantidos no projeto).
 */
export type ChapterId = "opening" | "shift" | "pack" | "fronts" | "plan" | "close" | "start" | "later" | "ideas" | "system";

export type SlideMeta = {
  id: string;
  /** Título curto (mapa, rodapé). */
  title: string;
  chapter: ChapterId;
  /** Quantas vezes o apresentador aperta → dentro do slide. Deve bater com a timeline do slide. */
  steps: number;
  /** Tema visual do slide — alterna claro/escuro como o site da BORA. */
  theme: "dark" | "light";
  /** Uma linha para o mapa (M). */
  summary: string;
};
