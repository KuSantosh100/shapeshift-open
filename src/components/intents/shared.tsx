"use client";

import { AnimatePresence, motion, useReducedMotion, useSpring, useTransform } from "motion/react";
import { Plus, type LucideIcon } from "lucide-react";
import { createContext, useContext, useEffect, type ReactNode } from "react";
import { spring, tween } from "@/lib/motion";
import { cn } from "@/lib/utils";

/** Lets a card write back into the main input — the text stays the source of truth. */
export const DraftContext = createContext<{ append: (snippet: string) => void } | null>(null);

const placeholderClass =
  "inline-flex h-7 items-center gap-1 rounded-full border border-dashed border-line-strong px-2.5 text-[13px] font-medium whitespace-nowrap text-muted-foreground";

/**
 * A dashed chip standing in for a missing field. It is always actionable:
 * with `insert` it types the connecting word into the input ("with", "at", ", "),
 * without it, it must sit inside a trigger (a popover button) that opens an editor.
 */
export function Placeholder({ children, insert, className }: { children: ReactNode; insert?: string; className?: string }) {
  const draft = useContext(DraftContext);
  if (insert && draft) {
    return (
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => draft.append(insert)}
        className={cn(
          placeholderClass,
          "transition-[border-color,color,scale] duration-150 ease-out hover:border-muted-foreground hover:text-ink-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:scale-[0.96]",
          className,
        )}
      >
        <Plus className="size-3.5" aria-hidden />
        {children}
      </button>
    );
  }
  return (
    <span className={cn(placeholderClass, className)}>
      <Plus className="size-3.5" aria-hidden />
      {children}
    </span>
  );
}

/** A missing value with nothing to click: plain muted text, not a control. */
export function Missing({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn("text-[15px] leading-[22px] text-muted-foreground", className)}>{children}</span>;
}

/** A soft chip for a filled field (date, time, person…). */
export function Chip({ icon: Icon, children, className }: { icon?: LucideIcon; children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-7 items-center gap-1.5 rounded-full bg-secondary px-2.5 text-[13px] font-medium text-ink-2",
        className,
      )}
    >
      {Icon && <Icon className="size-3.5 text-muted-foreground" aria-hidden />}
      {children}
    </span>
  );
}

/** Fields stagger in 30ms apart; `layout="position"` stops text stretching during the morph. */
export function Field({ index = 0, children, className }: { index?: number; children: ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      layout="position"
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 6, filter: "blur(4px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={reduce ? tween.fade : { ...spring.settle, delay: 0.04 + index * 0.03 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** A number that springs between values, with tabular figures so widths never jitter. */
export function AnimatedNumber({
  value,
  format,
  className,
}: {
  value: number;
  format: (n: number) => string;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const mv = useSpring(value, spring.number);
  const text = useTransform(mv, (n) => format(n));
  useEffect(() => {
    if (reduce) mv.jump(value);
    else mv.set(value);
  }, [value, mv, reduce]);
  return <motion.span className={cn("tabular-nums", className)}>{text}</motion.span>;
}

/** Contextual icon swap: opacity, scale 0.25→1 and blur 4px→0 (better-ui). */
export function IconSwap({ icon: Icon, className, iconClassName = "size-4" }: { icon: LucideIcon; className?: string; iconClassName?: string }) {
  const reduce = useReducedMotion();
  return (
    <span className={cn("relative inline-grid place-items-center", className)}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={Icon.displayName ?? Icon.name}
          initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.25, filter: "blur(4px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.25, filter: "blur(4px)" }}
          transition={reduce ? tween.fade : tween.icon}
          className="grid place-items-center"
        >
          <Icon className={iconClassName} aria-hidden />
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export function HeroNumber({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("text-[32px] leading-9 font-[550] tracking-[-0.02em] tabular-nums", className)}>{children}</div>;
}

export function Meta({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("text-[13px] leading-[18px] font-medium text-muted-foreground", className)}>{children}</div>;
}

export function formatWhen(date: Date, hasTime: boolean, now = new Date()) {
  const startOf = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const days = Math.round((startOf(date) - startOf(now)) / 86_400_000);
  const day =
    days === 0
      ? "Today"
      : days === 1
        ? "Tomorrow"
        : days > 1 && days < 7
          ? date.toLocaleDateString("en-US", { weekday: "long" })
          : date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  const time = hasTime ? date.toLocaleTimeString("en-US", { hour: "numeric", minute: date.getMinutes() ? "2-digit" : undefined }) : null;
  return { day, time };
}
