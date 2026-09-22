"use client";

import { Shuffle } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { spring, tween } from "@/lib/motion";
import { describeRandom, type RandomData, rollRandom } from "@/lib/parse/random";
import { Field, Meta } from "./shared";
import type { CardProps } from "./types";

export function RandomCard({ data, interactive }: CardProps<RandomData>) {
  const reduce = useReducedMotion();
  const key = JSON.stringify(data);
  // A new question rolls fresh; the same question keeps its result until you roll again.
  const [state, setState] = useState(() => ({ key, rolls: 0, result: rollRandom(data) }));
  if (state.key !== key) setState({ key, rolls: 0, result: rollRandom(data) });
  const roll = () => setState((s) => ({ ...s, rolls: s.rolls + 1, result: rollRandom(data) }));
  const total = data.kind === "dice" && data.count > 1 ? state.result.reduce((a, b) => a + Number(b), 0) : null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <Field index={0} className="flex min-w-0 flex-col gap-2">
        <Meta>{describeRandom(data)}</Meta>
        <div className="flex flex-wrap items-center gap-2" aria-live="polite">
          <AnimatePresence mode="popLayout" initial={false}>
            {state.result.map((r, i) => (
              <motion.span
                key={`${state.rolls}-${i}`}
                initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.9, filter: "blur(4px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.9, filter: "blur(4px)", transition: tween.exit }}
                transition={reduce ? tween.fade : { ...spring.snappy, delay: i * 0.04 }}
                className={
                  data.kind === "dice"
                    ? "grid size-14 place-items-center rounded-md bg-secondary text-[28px] font-[550] tabular-nums"
                    : "text-[32px] leading-9 font-[550] tracking-[-0.02em] text-balance break-words"
                }
              >
                {r}
              </motion.span>
            ))}
          </AnimatePresence>
          {total !== null && <span className="ps-1 text-[17px] font-[550] text-ink-2 tabular-nums">= {total}</span>}
        </div>
      </Field>
      <Field index={1}>
        <Button size="sm" onClick={roll} disabled={!interactive} className="gap-1.5 px-3.5">
          <Shuffle />
          {data.kind === "coin" ? "Flip again" : data.kind === "pick" ? "Pick again" : "Roll again"}
        </Button>
      </Field>
    </div>
  );
}
