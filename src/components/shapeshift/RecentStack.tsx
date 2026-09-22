"use client";

import { X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { registry } from "@/components/intents/registry";
import { spring, tween } from "@/lib/motion";
import type { SavedItem } from "@/lib/savedItems";
import { cn } from "@/lib/utils";

/** Saved cards. They stay until deleted; each row reopens its card for editing. */
export function RecentStack({
  items,
  flyingId,
  onOpen,
  onDelete,
}: {
  items: SavedItem[];
  /** The row arriving from the shell via the shared layoutId; it flies instead of fading. */
  flyingId: number | null;
  onOpen: (item: SavedItem) => void;
  onDelete: (item: SavedItem) => void;
}) {
  const reduce = useReducedMotion();
  return (
    <AnimatePresence initial={false}>
      {items.length > 0 && (
        <motion.section
          key="saved"
          aria-label="Saved"
          layout="position"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: tween.exit }}
          transition={reduce ? tween.fade : spring.settle}
          // Same surface as the input shell; rows inside sit 8px in, so their radius is 28 − 8 = 20.
          className="mt-4 flex flex-col gap-0.5 rounded-shell border border-border bg-card p-2 shadow-[var(--shadow-rest)]"
        >
          <AnimatePresence initial={false}>
            {items.map((item, i) => {
              const def = registry[item.intent];
              const Icon = def.icon;
              return (
                <motion.div
                  key={item.id}
                  layoutId={reduce ? undefined : `item-${item.id}`}
                  layout="position"
                  // Rows restored by Undo fade in where they were; the completed card flies in instead.
                  initial={
                    reduce
                      ? { opacity: 0 }
                      : item.id === flyingId
                        ? false
                        : { opacity: 0, y: -4, filter: "blur(4px)" }
                  }
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={
                    reduce
                      ? { opacity: 0 }
                      : {
                          opacity: 0,
                          y: -4,
                          filter: "blur(4px)",
                          transition: tween.exit,
                        }
                  }
                  transition={reduce ? tween.fade : spring.morph}
                  className="group relative flex items-center rounded-xl transition-[background-color] duration-150 ease-out hover:bg-secondary"
                >
                  <motion.button
                    type="button"
                    whileTap={reduce ? undefined : { scale: 0.96 }}
                    onClick={() => onOpen(item)}
                    aria-label={`Edit ${def.label.toLowerCase()}: ${item.summary}`}
                    className="flex min-h-14 min-w-0 flex-1 items-center gap-3 rounded-xl py-2 ps-2 pe-11 text-start focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  >
                    {/* Age reads through the tile fading, never through the text. */}
                    <span
                      className="grid size-10 shrink-0 place-items-center rounded-md bg-secondary text-foreground transition-[opacity,background-color] duration-150 group-hover:bg-card group-hover:opacity-100"
                      style={{ opacity: Math.max(0.45, 1 - i * 0.14) }}
                    >
                      <Icon className="size-5" aria-hidden />
                    </span>
                    <span
                      className={cn(
                        "min-w-0 flex-1 text-[15px] leading-[22px] text-pretty break-words",
                        i === 0 ? "text-foreground" : "text-ink-2",
                      )}
                    >
                      {item.summary}
                    </span>
                    <span className="shrink-0 text-[13px] font-medium text-muted-foreground">
                      {def.label}
                    </span>
                  </motion.button>
                  <button
                    type="button"
                    onClick={() => onDelete(item)}
                    aria-label={`Delete ${def.label.toLowerCase()}: ${item.summary}`}
                    className="absolute end-1 grid size-10 place-items-center rounded-md text-muted-foreground transition-[opacity,color,scale] duration-150 ease-out hover:text-foreground focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:scale-[0.96] [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100"
                  >
                    <X className="size-4" aria-hidden />
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.section>
      )}
    </AnimatePresence>
  );
}
