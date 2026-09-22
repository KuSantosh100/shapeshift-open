"use client";

import { AnimatePresence, motion, type MotionValue, useReducedMotion, useTransform } from "motion/react";
import type { ReactNode } from "react";
import { spring, tween } from "@/lib/motion";

/**
 * The shell. Never unmounted, so its size and radius animate between states.
 * Readiness (0..1 spring) lifts it and fades in a float shadow — both on
 * transform/opacity only; the shadow lives on its own layer.
 */
export function MorphContainer({
  readiness,
  edge,
  children,
}: {
  readiness: MotionValue<number>;
  edge: string | null;
  children: ReactNode;
}) {
  const reduce = useReducedMotion();
  const lift = useTransform(readiness, [0, 1], [0, reduce ? 0 : -2]);
  const floatOpacity = useTransform(readiness, [0, 1], [0, 1]);

  return (
    <motion.div style={{ y: lift }} className="relative">
      <motion.div
        layout
        layoutId="shell"
        transition={reduce ? tween.fade : spring.morph}
        style={{ borderRadius: 28 }}
        className="group/shell relative overflow-hidden border border-border bg-card shadow-[var(--shadow-rest)] outline-0 outline-brand-soft transition-[border-color,outline-width] duration-150 ease-out focus-within:border-brand focus-within:outline-4"
      >
        <motion.div
          aria-hidden
          style={{ opacity: floatOpacity, borderRadius: 28 }}
          className="pointer-events-none absolute inset-0 shadow-[var(--shadow-float)]"
        />
        <AnimatePresence initial={false}>
          {edge && (
            <motion.div
              key="edge"
              aria-hidden
              className="absolute top-0 bottom-0 left-0 z-10 w-[3px] origin-top"
              style={{ backgroundColor: edge }}
              initial={reduce ? { opacity: 0 } : { scaleY: 0 }}
              animate={reduce ? { opacity: 1 } : { scaleY: 1 }}
              exit={reduce ? { opacity: 0 } : { scaleY: 0, transition: tween.exit }}
              transition={reduce ? tween.fade : spring.settle}
            />
          )}
        </AnimatePresence>
        {children}
      </motion.div>
    </motion.div>
  );
}
