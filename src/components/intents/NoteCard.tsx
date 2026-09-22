"use client";

import type { NoteData } from "@/lib/parse/note";
import { Field } from "./shared";
import type { CardProps } from "./types";

export function NoteCard({ data, signals }: CardProps<NoteData>) {
  return (
    <div className="flex flex-col gap-1">
      <Field index={0} className="flex items-start gap-2">
        <h2 className="text-[17px] leading-6 font-[550] text-pretty break-words">{data.title}</h2>
        {signals.isQuestion && !data.title.endsWith("?") && (
          <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-secondary text-[12px] font-semibold text-ink-2" role="img" aria-label="Question">
            ?
          </span>
        )}
      </Field>
      {data.body && (
        <Field index={1}>
          <p className="text-[15px] leading-[22px] text-pretty text-ink-2">{data.body}</p>
        </Field>
      )}
    </div>
  );
}
