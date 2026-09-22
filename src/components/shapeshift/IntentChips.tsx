"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { registry } from "@/components/intents/registry";
import type { CardIntent } from "@/lib/jev/types";
import { spring, tween } from "@/lib/motion";
import { cn } from "@/lib/utils";

export function IntentChips({
  options,
  probabilities,
  active,
  onPick,
}: {
  options: [CardIntent, CardIntent] | null;
  probabilities: Partial<Record<string, number>>;
  active: number;
  onPick: (intent: CardIntent) => void;
}) {
  const reduce = useReducedMotion();
  return (
    <div className="flex h-11 items-start justify-center gap-2 pt-3" role="group" aria-label="Did you mean"
      aria-describedby={options ? "chips-hint" : undefined}>
      <AnimatePresence mode="popLayout">
        {options?.map((intent, i) => {
          const def = registry[intent];
          const Icon = def.icon;
          const p = probabilities[intent] ?? 0;
          return (
            <motion.button
              key={intent}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => onPick(intent)}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 6, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: 4, filter: "blur(4px)", transition: tween.exit }}
              transition={reduce ? tween.fade : { ...spring.snappy, delay: i * 0.04 }}
              whileTap={reduce ? undefined : { scale: 0.96 }}
              className={cn(
                "relative flex h-8 items-center gap-1.5 overflow-hidden rounded-full border bg-card px-3 text-[13px] font-medium text-ink-2 shadow-[var(--shadow-rest)] transition-[border-color,color] duration-150 hover:border-line-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                active === i ? "border-brand/40 text-foreground" : "border-border",
              )}
            >
              <Icon className="size-4 text-foreground" aria-hidden />
              {def.label}?
              <span aria-hidden className="absolute start-0 bottom-0 h-[2px] w-full origin-left bg-brand" style={{ transform: `scaleX(${Math.min(1, p)})` }} />
            </motion.button>
          );
        })}
      </AnimatePresence>
      {options && (
        <span id="chips-hint" className="sr-only">
          Left and right arrows highlight a choice, Enter picks it.
        </span>
      )}
    </div>
  );
}
