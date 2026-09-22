"use client";

import { CalendarDays } from "lucide-react";
import type { CountdownData } from "@/lib/parse/countdown";
import { AnimatedNumber, Chip, Field, HeroNumber, Meta, Missing } from "./shared";
import type { CardProps } from "./types";

const long = (d: Date) => d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });

export function CountdownCard({ data }: CardProps<CountdownData>) {
  if (data.days === null || !data.date) {
    return (
      <Field index={0}>
        <Missing>Type a date or a holiday, like “days until christmas”</Missing>
      </Field>
    );
  }
  const past = data.days < 0;
  const n = Math.abs(data.days);
  const weeks = Math.floor(n / 7);

  return (
    <div className="flex flex-col gap-3">
      <Field index={0} className="flex flex-wrap items-end gap-x-3 gap-y-1">
        {data.days === 0 ? (
          <HeroNumber className="text-[44px] leading-[48px]">Today</HeroNumber>
        ) : (
          <>
            <HeroNumber className="text-[44px] leading-[48px]">
              <AnimatedNumber value={n} format={(v) => Math.round(v).toLocaleString("en-US")} />
            </HeroNumber>
            <span className="pb-1.5 text-[17px] leading-6 font-[550] text-ink-2">
              {n === 1 ? "day" : "days"} {past ? "since" : "until"} {data.title || "then"}
            </span>
          </>
        )}
      </Field>
      <Field index={1} className="flex flex-wrap items-center gap-2">
        <Chip icon={CalendarDays}>{long(data.date)}</Chip>
        {weeks >= 2 && (
          <Meta>
            {weeks} weeks{n % 7 ? `, ${n % 7} ${n % 7 === 1 ? "day" : "days"}` : ""}
          </Meta>
        )}
      </Field>
    </div>
  );
}
