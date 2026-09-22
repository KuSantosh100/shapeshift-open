"use client";

import { Minus, Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatAmount } from "@/lib/parse/common";
import type { SplitData } from "@/lib/parse/split";
import { AnimatedNumber, Field, HeroNumber, Meta } from "./shared";
import type { CardProps } from "./types";

export function SplitCard({ data, interactive }: CardProps<SplitData>) {
  const [people, setPeople] = useState<number | null>(null);
  const [total, setTotal] = useState<string | null>(null);

  const [prev, setPrev] = useState(data);
  if (prev.total !== data.total || prev.people !== data.people) {
    setPrev(data);
    setPeople(null);
    setTotal(null);
  }

  const n = people ?? data.people ?? 2;
  const amount = total !== null ? Number(total.replace(/,/g, "")) || 0 : (data.total ?? 0);
  const each = n > 0 ? amount / n : 0;

  return (
    <div className="flex flex-wrap items-end justify-between gap-6">
      <div className="flex flex-col gap-3">
        <Field index={0} className="flex flex-col gap-1">
          <Meta>Total</Meta>
          <div className="relative w-36">
            <span aria-hidden className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-[15px] text-muted-foreground">{data.currency}</span>
            <Input
              inputMode="decimal"
              disabled={!interactive}
              aria-label="Total"
              placeholder="0"
              className="h-9 ps-7 text-base tabular-nums sm:text-[15px]"
              value={total ?? (data.total !== null ? String(data.total) : "")}
              onChange={(e) => setTotal(e.target.value)}
            />
          </div>
        </Field>
        <Field index={1} className="flex flex-col gap-1">
          <Meta>People</Meta>
          <div className="flex items-center gap-1">
            <Button size="icon-sm" variant="ghost" aria-label="Fewer people" disabled={!interactive || n <= 1} onClick={() => setPeople(Math.max(1, n - 1))}>
              <Minus />
            </Button>
            <span className="w-8 text-center text-[17px] font-[550] tabular-nums">{n}</span>
            <Button size="icon-sm" variant="ghost" aria-label="More people" disabled={!interactive || n >= 99} onClick={() => setPeople(n + 1)}>
              <Plus />
            </Button>
          </div>
        </Field>
      </div>
      <Field index={2} className="flex min-w-0 flex-col items-end gap-1 text-end">
        <Meta>Each person pays</Meta>
        <HeroNumber>
          <AnimatedNumber value={each} format={(v) => formatAmount(v, data.currency)} />
        </HeroNumber>
      </Field>
    </div>
  );
}
