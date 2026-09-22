"use client";

import { CalendarDays, Clock, MapPin, Phone, Video } from "lucide-react";
import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { EventData } from "@/lib/parse/event";
import { Chip, Field, formatWhen, IconSwap, Missing, Placeholder } from "./shared";
import type { CardProps } from "./types";

export function EventCard({ data, signals, interactive }: CardProps<EventData>) {
  const [override, setOverride] = useState<Date | null>(null);
  const date = override ?? data.date;
  const when = date ? formatWhen(date, data.hasTime) : null;

  const mode = data.link ? "video_call" : signals.eventMode;
  const placeIcon = mode === "video_call" ? Video : mode === "phone_call" ? Phone : MapPin;
  const place = data.link ?? data.location ?? (mode === "video_call" ? "Video call" : mode === "phone_call" ? "Phone call" : null);

  return (
    <div className="flex flex-col gap-3">
      <Field index={0}>
        {data.title ? (
          <h2 className="text-[17px] leading-6 font-[550] tracking-[-0.01em] text-balance">{data.title}</h2>
        ) : (
          <Missing>Untitled event</Missing>
        )}
      </Field>

      <Field index={1} className="flex flex-wrap items-center gap-2">
        <Popover>
          <PopoverTrigger asChild disabled={!interactive}>
            <button type="button" aria-label={when ? `Date: ${when.day}. Change date` : "Add date"} className="rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
              {when ? <Chip icon={CalendarDays}>{when.day}</Chip> : <Placeholder>Add date</Placeholder>}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar mode="single" selected={date ?? undefined} onSelect={(d) => d && setOverride(withTime(d, date))} />
          </PopoverContent>
        </Popover>
        {when?.time ? <Chip icon={Clock}>{when.time}</Chip> : <Placeholder insert=" at ">Add time</Placeholder>}
      </Field>

      <Field index={2} className="flex items-center gap-2 text-[15px] leading-[22px] text-ink-2">
        <span className="text-muted-foreground">
          <IconSwap icon={placeIcon} iconClassName="size-5" />
        </span>
        {place ? <span>{place}</span> : <Placeholder insert=" at ">Add place</Placeholder>}
      </Field>

      <Field index={3} className="flex items-center gap-2">
        {data.people.length ? (
          <>
            <div className="flex -space-x-1.5">
              {data.people.map((p) => (
                <Avatar key={p} className="size-7 ring-2 ring-card">
                  <AvatarFallback className="bg-secondary text-[11px] font-semibold text-ink-2">{initials(p)}</AvatarFallback>
                </Avatar>
              ))}
            </div>
            <span className="text-[15px] text-ink-2">{data.people.join(", ")}</span>
          </>
        ) : (
          <Placeholder insert=" with ">Add people</Placeholder>
        )}
      </Field>
    </div>
  );
}

function withTime(day: Date, prev: Date | null) {
  const d = new Date(day);
  if (prev) d.setHours(prev.getHours(), prev.getMinutes());
  return d;
}

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}
