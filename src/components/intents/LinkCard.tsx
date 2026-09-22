"use client";

import type { LinkData } from "@/lib/parse/link";
import { Field, Meta, Missing } from "./shared";
import type { CardProps } from "./types";

export function LinkCard({ data }: CardProps<LinkData>) {
  return (
    <div className="flex items-start gap-4">
      <Field index={0}>
        <div className="grid size-12 place-items-center rounded-md bg-foreground text-[20px] font-[550] text-background">
          {data.monogram || "·"}
        </div>
      </Field>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <Field index={1}>
          {data.domain ? <h2 className="text-[17px] leading-6 font-[550] break-all">{data.domain}</h2> : <Missing>Paste a link</Missing>}
        </Field>
        {data.url && (
          <Field index={2}>
            <Meta className="font-mono text-[12px] break-all">{data.url.replace(/^https?:\/\//, "")}</Meta>
          </Field>
        )}
        <Field index={3} className="pt-1 text-[15px] leading-[22px] text-ink-2">
          {data.note || <span className="text-muted-foreground">No note</span>}
        </Field>
      </div>
    </div>
  );
}
