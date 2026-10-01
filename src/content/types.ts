export type ChapterId = "opening" | "shift" | "pack" | "running" | "next" | "system" | "plan" | "close";

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
