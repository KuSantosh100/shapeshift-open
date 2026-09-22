"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Kbd } from "@/components/ui/kbd";
import { CARD_INTENTS } from "@/components/intents/registry";
import { tween } from "@/lib/motion";

/** Orientation for an empty page: what this is and the one shortcut worth knowing. Gone once you've saved something. */
export function FirstRunHint({ show }: { show: boolean }) {
  const reduce = useReducedMotion();
  return (
    <AnimatePresence initial={false}>
      {show && (
        <motion.p
          key="hint"
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, transition: tween.exit }}
          transition={tween.crossfade}
          className="mt-2 flex flex-wrap items-center justify-center gap-x-1.5 gap-y-1 px-4 text-center text-[13px] leading-[18px] font-medium text-muted-foreground"
        >
          Type a plan, a list, a color or a sum. It becomes a card.
          <span className="inline-flex items-center gap-1.5">
            Press <Kbd>/</Kbd> to see all {CARD_INTENTS.length} card types.
          </span>
        </motion.p>
      )}
    </AnimatePresence>
  );
}
