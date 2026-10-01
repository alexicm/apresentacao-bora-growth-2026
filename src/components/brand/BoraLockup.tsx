import { cn } from "@/lib/utils";
import { BoraWordmark } from "./BoraMark";

/**
 * Lockup no mesmo sistema da marca oficial ("BORA / ASSESSORIA"):
 * wordmark + palavra espaçada na largura exata do wordmark → "BORA / GROWTH".
 */
export function BoraLockup({ word = "GROWTH", className }: { word?: string; className?: string }) {
  return (
    <span className={cn("lockup inline-flex flex-col", className)} role="img" aria-label={`BORA ${word}`}>
      <BoraWordmark className="block h-auto w-full" title="" />
      <span className="lockup-word" aria-hidden="true">
        {Array.from(word).map((ch, i) => (
          <span key={i}>{ch}</span>
        ))}
      </span>
    </span>
  );
}
