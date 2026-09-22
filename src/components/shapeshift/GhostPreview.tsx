"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { spring, tween } from "@/lib/motion";

/** A faint, non-interactive preview of the likely card. Tab promotes it. */
export function GhostPreview({ ghost, children }: { ghost: boolean; children: ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={false}
      animate={{
        opacity: ghost ? 0.35 : 1,
        filter: ghost && !reduce ? "grayscale(0.6)" : "grayscale(0)",
      }}
      transition={reduce ? tween.fade : spring.settle}
      className={ghost ? "pointer-events-none select-none" : undefined}
      aria-hidden={ghost || undefined}
      inert={ghost || undefined}
    >
      {children}
    </motion.div>
  );
}
