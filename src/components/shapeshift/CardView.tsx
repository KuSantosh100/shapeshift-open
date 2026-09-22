"use client";

import { CornerDownLeft } from "lucide-react";
import { AnimatePresence, motion, type MotionValue, useReducedMotion, useTransform } from "motion/react";
import { registry } from "@/components/intents/registry";
import { IconSwap } from "@/components/intents/shared";
import type { BadgeSpec } from "@/components/intents/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import type { CardIntent } from "@/lib/jev/types";
import { spring, tween } from "@/lib/motion";
import type { ParsedMap } from "@/lib/parse";
import type { GatedSignals } from "@/lib/signals";
import { cn } from "@/lib/utils";

type Props<K extends CardIntent> = {
  intent: K;
  data: ParsedMap[K];
  signals: GatedSignals;
  readiness: MotionValue<number>;
  ghost: boolean;
  /** Reopened from the saved list: Enter saves, Esc cancels. */
  editing?: boolean;
  onConfirm: () => void;
};

export function CardView<K extends CardIntent>({ intent, data, signals, readiness, ghost, editing, onConfirm }: Props<K>) {
  const def = registry[intent];
  const reduce = useReducedMotion();
  const Icon = def.headerIcon?.(signals, data) ?? def.icon;
  const label = def.headerLabel?.(signals, data) ?? def.label;
  const badges = def.badges?.(signals, data) ?? [];
  const Body = def.Component;

  // Never fully invisible: it stays a visible, focusable control while it "fills in".
  const btnOpacity = useTransform(readiness, [0.3, 0.9], [0.4, 1]);
  const btnY = useTransform(readiness, [0.3, 0.9], [reduce ? 0 : 4, 0]);

  return (
    <div className="flex flex-col gap-4 px-5 pt-1 pb-5">
      {/* Shared header: the same row relabels itself between intents. */}
      <motion.div layout="position" className="flex min-h-11 items-center gap-3 text-ink-2">
        <IconSwap icon={Icon} className="size-11 shrink-0 rounded-md bg-secondary text-foreground" iconClassName="size-6" />
        <span className="relative h-[22px] overflow-hidden text-[15px] leading-[22px] font-medium whitespace-nowrap">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={label}
              className="block"
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 6, filter: "blur(2px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6, filter: "blur(2px)" }}
              transition={reduce ? tween.fade : spring.snappy}
            >
              {label}
            </motion.span>
          </AnimatePresence>
        </span>
        <div className="ms-auto flex items-center gap-1.5">
          <AnimatePresence initial={false} mode="popLayout">
            {badges.map((b) => (
              <SignalBadge key={b.id} badge={b} />
            ))}
          </AnimatePresence>
        </div>
      </motion.div>

      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={intent}
          layout="position"
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 6, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={reduce ? { opacity: 0, transition: tween.exit } : { opacity: 0, scale: 0.98, filter: "blur(4px)", transition: tween.exit }}
          transition={reduce ? tween.fade : { ...spring.settle, delay: 0.04 }}
        >
          <Body data={data} signals={signals} interactive={!ghost} />
        </motion.div>
      </AnimatePresence>

      <motion.div layout="position" className="flex min-h-8 flex-wrap items-center justify-between gap-2">
        {ghost ? (
          <span className="flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground">
            <Kbd>Tab</Kbd> to keep as {def.label.toLowerCase()}
          </span>
        ) : (
          <>
            <span className="flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground">
              <Kbd>Esc</Kbd> {editing ? "to cancel" : "to clear"}
            </span>
            <motion.div style={{ opacity: btnOpacity, y: btnY }}>
              <Button size="sm" onClick={onConfirm} className="gap-1.5 rounded-full pr-2 pl-3">
                {editing ? "Save" : "Add"} {def.label.toLowerCase()}
                <CornerDownLeft className="size-3.5 opacity-60" aria-hidden />
              </Button>
            </motion.div>
          </>
        )}
      </motion.div>
    </div>
  );
}

function SignalBadge({ badge }: { badge: BadgeSpec }) {
  const reduce = useReducedMotion();
  const Icon = badge.icon;
  return (
    <motion.span
      layout="position"
      initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.9, filter: "blur(2px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.9, filter: "blur(2px)" }}
      transition={reduce ? tween.fade : spring.snappy}
    >
      <Badge
        variant="outline"
        className={cn(
          "h-6 gap-1 rounded-full px-2 text-[12px] font-medium text-ink-2 [&>svg]:size-3.5!",
          badge.tone === "caution" && "border-caution/30 bg-caution/8 text-caution-text",
          badge.tone === "brand" && "border-brand/30 bg-brand-soft text-brand",
        )}
      >
        {Icon && <Icon aria-hidden />}
        {badge.label}
      </Badge>
    </motion.span>
  );
}
