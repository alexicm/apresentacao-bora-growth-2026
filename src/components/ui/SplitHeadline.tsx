import { Fragment, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  lines: readonly string[];
  as?: "h1" | "h2" | "h3" | "p" | "div";
  /** "words" preserva o kerning; "chars" para revelações letra a letra. */
  by?: "words" | "chars";
  className?: string;
  /** Classe por linha (string para todas ou função por índice). */
  lineClassName?: string | ((line: number) => string | undefined);
};

type Token = { text: string; bold: boolean; hl: boolean } | { space: true };

/**
 * Marcação de ênfase usada nos arquivos de conteúdo:
 *   **texto**  → negrito (voz da BORA: "Não é sobre ser rápido. **É sobre começar.**")
 *   ==texto==  → marca-texto volt (uma barra contínua para a frase inteira)
 */
export function parseEmphasis(input: string): Token[] {
  const line = String(input ?? "");
  const tokens: Token[] = [];
  const addWords = (text: string, bold: boolean, hl: boolean) => {
    if (hl) {
      if (text.trim()) tokens.push({ text: text.trim(), bold, hl: true });
      return;
    }
    for (const part of text.split(/(\s+)/)) {
      if (!part) continue;
      if (/^\s+$/.test(part)) tokens.push({ space: true });
      else tokens.push({ text: part, bold, hl: false });
    }
  };
  const addSegment = (text: string, bold: boolean) => {
    const re = /==(.+?)==/g;
    let last = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(text))) {
      addWords(text.slice(last, m.index), bold, false);
      addWords(m[1], bold, true);
      last = m.index + m[0].length;
    }
    addWords(text.slice(last), bold, false);
  };
  const re = /\*\*(.+?)\*\*/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(line))) {
    addSegment(line.slice(last, m.index), false);
    addSegment(m[1], true);
    last = m.index + m[0].length;
  }
  addSegment(line.slice(last), false);
  // espaços antes/depois de um trecho marcado ficam como tokens de espaço
  return tokens.filter((t, i, arr) => !("space" in t) || (i > 0 && i < arr.length - 1 && !("space" in arr[i - 1])));
}

/** Texto puro, sem a marcação (para leitores de tela e atributos). */
export const plainText = (line: string) => String(line ?? "").replace(/\*\*|==/g, "");

/** Renderiza uma linha com ênfases, sem dividir (para parágrafos e rótulos). */
export function Emphasis({ text }: { text: string }) {
  return (
    <>
      {parseEmphasis(text).map((t, i) =>
        "space" in t ? (
          <Fragment key={i}> </Fragment>
        ) : (
          <Fragment key={i}>{wrap(t.text, t.bold, t.hl)}</Fragment>
        ),
      )}
    </>
  );
}

function wrap(text: ReactNode, bold: boolean, hl: boolean) {
  let node = text;
  if (hl) node = <span className="hl">{node}</span>;
  if (bold) node = <strong>{node}</strong>;
  return node;
}

/**
 * Manchete dividida no servidor (sem SplitText em runtime): nenhum layout shift,
 * texto acessível via sr-only e máscara por linha para as revelações.
 * Alvos de animação: `.split-line`, `.split-unit`, `.hl` (marca-texto).
 */
export function SplitHeadline({ lines, as: Tag = "h2", by = "words", className, lineClassName }: Props) {
  return (
    <Tag className={cn("split", className)}>
      <span className="sr-only">{lines.map(plainText).join(" ")}</span>
      {lines.map((line, li) => (
        <span
          key={li}
          className={cn("split-line", typeof lineClassName === "function" ? lineClassName(li) : lineClassName)}
          aria-hidden="true"
          data-line={li}
        >
          {parseEmphasis(line).map((t, ti) => {
            if ("space" in t) return <Fragment key={ti}> </Fragment>;
            return (
              <span key={ti} className="split-word">
                {by === "chars" && !t.hl ? (
                  Array.from(t.text).map((ch, ci) => (
                    <span key={ci} className="split-unit">
                      {wrap(ch, t.bold, false)}
                    </span>
                  ))
                ) : (
                  <span className="split-unit">{wrap(t.text, t.bold, t.hl)}</span>
                )}
              </span>
            );
          })}
        </span>
      ))}
    </Tag>
  );
}
