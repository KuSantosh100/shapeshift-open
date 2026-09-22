"use client";

import type { CalcData } from "@/lib/parse/calc";
import { AnimatedNumber, Field, HeroNumber, Meta } from "./shared";
import type { CardProps } from "./types";

const fmt = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: Math.abs(n) < 1 ? 6 : 4 });

export function CalcCard({ data }: CardProps<CalcData>) {
  return (
    <div className="flex flex-col items-end gap-1 text-end">
      <Field index={0}>
        <Meta className="font-mono text-[13px] tabular-nums break-all">{data.expression || "…"}</Meta>
      </Field>
      <Field index={1}>
        <HeroNumber>
          {data.result === null ? <span className="text-muted-foreground">=</span> : <>= <AnimatedNumber value={data.result} format={fmt} /></>}
        </HeroNumber>
      </Field>
    </div>
  );
}
