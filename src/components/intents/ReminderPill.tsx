"use client";

import { Clock } from "lucide-react";
import type { ReminderData } from "@/lib/parse/reminder";
import { Chip, Field, formatWhen, Missing } from "./shared";
import type { CardProps } from "./types";

export function ReminderPill({ data }: CardProps<ReminderData>) {
  const when = data.when ? formatWhen(data.when, data.hasTime) : null;
  return (
    <Field index={0} className="flex flex-wrap items-center justify-between gap-3">
      {data.task ? (
        <h2 className="min-w-0 text-[17px] leading-6 font-[550] tracking-[-0.01em] text-pretty break-words">{data.task}</h2>
      ) : (
        <Missing>No task yet</Missing>
      )}
      {when ? (
        <Chip icon={Clock} className="shrink-0">
          {when.time ? `${when.day}, ${when.time}` : when.day}
        </Chip>
      ) : (
        <Chip icon={Clock} className="shrink-0 text-muted-foreground">
          Anytime
        </Chip>
      )}
    </Field>
  );
}
