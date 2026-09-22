"use client";

import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { dayShift, formatIn, type TimezoneData } from "@/lib/parse/timezone";
import { Chip, Field, HeroNumber, Meta, Missing } from "./shared";
import type { CardProps } from "./types";

export function TimezoneCard({ data }: CardProps<TimezoneData>) {
  // "What time is it in Tokyo" keeps ticking; a specific time stays put.
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    if (!data.isNow) return;
    const id = setInterval(() => setNow(new Date()), 15_000);
    return () => clearInterval(id);
  }, [data.isNow]);

  if (!data.to || !data.instant) {
    return (
      <Field index={0}>
        <Missing>Add a place or zone, like “3pm pst in ist” or “time in tokyo”</Missing>
      </Field>
    );
  }
  const at = data.isNow ? now : data.instant;
  const shift = dayShift(data.from.tz, data.to.tz, at);

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <Field index={0} className="flex flex-col gap-2">
        <HeroNumber className="text-ink-2">{formatIn(data.from.tz, at)}</HeroNumber>
        <Chip>{data.from.label}</Chip>
      </Field>
      <Field index={1} className="text-muted-foreground">
        <ArrowRight className="size-5" aria-hidden />
      </Field>
      <Field index={2} className="flex flex-col items-end gap-2">
        <HeroNumber>{formatIn(data.to.tz, at)}</HeroNumber>
        <div className="flex items-center gap-2">
          {shift !== 0 && <Meta>{shift > 0 ? "next day" : "previous day"}</Meta>}
          <Chip>{data.to.label}</Chip>
        </div>
      </Field>
    </div>
  );
}
