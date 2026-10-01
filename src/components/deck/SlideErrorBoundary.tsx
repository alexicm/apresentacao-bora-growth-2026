"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = { title: string; children: ReactNode };
type State = { error: Error | null };

/**
 * Isola falhas: se um slide quebrar, só ele mostra um aviso — o resto da apresentação continua de pé.
 */
export class SlideErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`[deck] o slide "${this.props.title}" falhou ao renderizar`, error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="slide flex flex-col justify-center gap-4">
        <p className="t-label text-fg-3">Slide indisponível</p>
        <p className="t-headline text-[length:var(--fs-display-s)]">
          <strong>{this.props.title}</strong>
        </p>
        {process.env.NODE_ENV !== "production" && (
          <pre className="t-mono max-w-[80ch] whitespace-pre-wrap text-[12px] text-fg-3">{this.state.error.message}</pre>
        )}
        <button type="button" className="pill mt-2 self-start" onClick={() => this.setState({ error: null })}>
          Tentar de novo
        </button>
      </div>
    );
  }
}
