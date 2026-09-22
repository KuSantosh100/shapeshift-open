"use client";

import { Mail, Phone } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { ContactData } from "@/lib/parse/contact";
import { Field, Missing } from "./shared";
import type { CardProps } from "./types";

export function ContactCard({ data }: CardProps<ContactData>) {
  return (
    <div className="flex items-start gap-4">
      <Field index={0}>
        <Avatar className="size-12">
          <AvatarFallback className="bg-secondary text-[15px] font-semibold text-ink-2">{data.initials || "?"}</AvatarFallback>
        </Avatar>
      </Field>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <Field index={1}>
          {data.name ? <h2 className="text-[17px] leading-6 font-[550] break-words">{data.name}</h2> : <Missing>No name yet</Missing>}
        </Field>
        <Field index={2} className="flex flex-col divide-y divide-border/70">
          <Row icon={Phone} value={data.phone} placeholder="No phone yet" />
          <Row icon={Mail} value={data.email} placeholder="No email yet" mono />
        </Field>
      </div>
    </div>
  );
}

function Row({ icon: Icon, value, placeholder, mono }: { icon: typeof Phone; value: string | null; placeholder: string; mono?: boolean }) {
  return (
    <div className="flex min-h-9 items-center gap-2.5 py-1.5 text-[15px]">
      <Icon className="size-4 text-muted-foreground" aria-hidden />
      {value ? <span className={mono ? "min-w-0 break-all" : "tabular-nums"}>{value}</span> : <span className="text-muted-foreground">{placeholder}</span>}
    </div>
  );
}
