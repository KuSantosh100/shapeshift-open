"use client";

import { Minus, Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { GoalData } from "@/lib/parse/goal";
import { AnimatedNumber, Field, HeroNumber, Meta, Missing } from "./shared";
import type { CardProps } from "./types";

const fmt = (n: number) => n.toLocaleString("en-IN", { maximumFractionDigits: 1 });

export function GoalCard({ data, interactive }: CardProps<GoalData>) {
  const [current, setCurrent] = useState<number | null>(null);
  const key = `${data.current}|${data.target}`;
  const [prev, setPrev] = useState(key);
  if (prev !== key) {
    setPrev(key);
    setCurrent(null);
  }

  if (!data.target) {
    return (
      <Field index={0} className="flex flex-col gap-1">
        {data.title && <h2 className="text-[17px] leading-6 font-[550] text-balance">{data.title}</h2>}
        <Missing>Add a target, like “read 12 books, 4 done”</Missing>
      </Field>
    );
  }

  const value = current ?? data.current;
  const pct = Math.min(100, (value / data.target) * 100);
  const step = data.target >= 1000 ? Math.round(data.target / 20) : 1;
  const unit = data.unit ? ` ${data.unit}` : "";

  return (
    <div className="flex flex-col gap-3">
      <Field index={0} className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-0.5">
          <h2 className="text-[17px] leading-6 font-[550] text-balance">{data.title || "Goal"}</h2>
          <Meta className="tabular-nums">
            {fmt(value)} of {fmt(data.target)}
            {unit}
          </Meta>
        </div>
        <HeroNumber>
          <AnimatedNumber value={pct} format={(v) => `${Math.round(v)}%`} />
        </HeroNumber>
      </Field>
      <Field index={1}>
        <Progress value={pct} className="h-2 bg-secondary" aria-label={`${Math.round(pct)}% of goal`} />
      </Field>
      <Field index={2} className="flex items-center gap-1">
        <Button size="icon-sm" variant="ghost" aria-label="Less progress" disabled={!interactive || value <= 0} onClick={() => setCurrent(Math.max(0, value - step))}>
          <Minus />
        </Button>
        <Button size="icon-sm" variant="ghost" aria-label="More progress" disabled={!interactive || value >= data.target} onClick={() => setCurrent(Math.min(data.target ?? 0, value + step))}>
          <Plus />
        </Button>
        {value >= data.target && <Meta className="ps-1 text-positive">Done</Meta>}
      </Field>
    </div>
  );
}
