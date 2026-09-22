"use client";

import { Pause, Play, RotateCcw } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import type { TimerData } from "@/lib/parse/timer";
import { formatClock } from "@/lib/parse/timer";
import { spring } from "@/lib/motion";
import { Field, Meta, Placeholder } from "./shared";
import type { CardProps } from "./types";

const SIZE = 140;
const STROKE = 3;
const R = (SIZE - STROKE) / 2;

const RING_COLOR = { countdown: "var(--foreground)", focus: "var(--brand)", break: "var(--positive)", stopwatch: "var(--foreground)" };

export function TimerRing({ data, signals, interactive }: CardProps<TimerData>) {
  const kind = signals.timerKind ?? (data.seconds ? "countdown" : "stopwatch");
  const stopwatch = kind === "stopwatch" || !data.seconds;
  const total = data.seconds ?? 0;
  const reduce = useReducedMotion();

  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const startedAt = useRef<number | null>(null);
  const base = useRef(0);

  // A new duration resets the clock.
  const [prevTotal, setPrevTotal] = useState(total);
  if (prevTotal !== total) {
    setPrevTotal(total);
    setElapsed(0);
    setRunning(false);
  }

  useEffect(() => {
    if (!running) return;
    startedAt.current = performance.now();
    base.current = elapsed;
    const id = setInterval(() => {
      const e = base.current + (performance.now() - (startedAt.current ?? 0)) / 1000;
      setElapsed(stopwatch ? e : Math.min(total, e));
      if (!stopwatch && e >= total) setRunning(false);
    }, 200);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only (re)start on toggle
  }, [running]);

  const shown = stopwatch ? elapsed : total - elapsed;
  const progress = stopwatch ? (elapsed % 60) / 60 : total ? 1 - elapsed / total : 0;

  return (
    <div className="flex flex-wrap items-center gap-6">
      <Field index={0} className="relative grid shrink-0 place-items-center">
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="-rotate-90" aria-hidden>
          <circle cx={SIZE / 2} cy={SIZE / 2} r={R} fill="none" stroke="var(--line-strong)" strokeWidth={STROKE} />
          <motion.circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={R}
            fill="none"
            strokeWidth={STROKE}
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: progress, stroke: RING_COLOR[kind] }}
            transition={reduce ? { duration: 0 } : running ? { duration: 0.2, ease: "linear" } : spring.settle}
          />
        </svg>
        <div className="absolute inset-0 grid place-items-center">
          <span className="text-[32px] leading-9 font-[550] tracking-[-0.02em] tabular-nums" role="timer" aria-live="off">
            {formatClock(shown)}
          </span>
        </div>
      </Field>
      <Field index={1} className="flex min-w-0 flex-col gap-3">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-[17px] leading-6 font-[550] text-balance">{data.label || (stopwatch ? "Stopwatch" : "Timer")}</h2>
          {data.seconds ? <Meta>{describe(data.seconds)}</Meta> : <Placeholder insert=" 10 min">Add duration</Placeholder>}
        </div>
        <div className="flex gap-2">
          <Button size="sm" disabled={!interactive || (!stopwatch && elapsed >= total)} onClick={() => setRunning((r) => !r)}>
            {running ? <Pause /> : <Play />}
            {running ? "Pause" : elapsed > 0 ? "Resume" : "Start"}
          </Button>
          <Button
            size="icon-sm"
            variant="ghost"
            aria-label="Reset"
            disabled={!interactive || elapsed === 0}
            onClick={() => {
              setRunning(false);
              setElapsed(0);
            }}
          >
            <RotateCcw />
          </Button>
        </div>
      </Field>
    </div>
  );
}

function describe(s: number) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return [h && `${h} hr`, m && `${m} min`, sec && `${sec} sec`].filter(Boolean).join(" ");
}
