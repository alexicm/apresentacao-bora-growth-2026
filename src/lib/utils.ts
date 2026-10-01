export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

export const pad2 = (n: number) => String(n).padStart(2, "0");

/** Gerador pseudoaleatório determinístico — mesma "aleatoriedade" no servidor e no cliente. */
export function seeded(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Ponto em coordenadas polares (graus, 0° = direita, sentido horário na tela). */
export function polar(cx: number, cy: number, radius: number, deg: number) {
  const a = (deg * Math.PI) / 180;
  return { x: cx + radius * Math.cos(a), y: cy + radius * Math.sin(a) };
}

/** Arredonda para SVG (evita diferenças de hidratação por ponto flutuante). */
export const r2 = (n: number) => Math.round(n * 100) / 100;
