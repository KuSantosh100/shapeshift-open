"use client";

import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EXPENSE_CATEGORIES, type ExpenseCategory } from "@/lib/jev/types";
import { formatAmount } from "@/lib/parse/common";
import type { ExpenseData } from "@/lib/parse/expense";
import { CATEGORY_ICON, CATEGORY_LABEL } from "./icons";
import { AnimatedNumber, Field, HeroNumber, IconSwap, Missing, Placeholder } from "./shared";
import type { CardProps } from "./types";

export function ExpenseRow({ data, signals, interactive }: CardProps<ExpenseData>) {
  const [picked, setPicked] = useState<ExpenseCategory | null>(null);
  const category = picked ?? signals.expenseCategory ?? "other";

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <Field index={0} className="flex min-w-0 items-center gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-md bg-secondary text-ink-2">
          <IconSwap icon={CATEGORY_ICON[category]} iconClassName="size-5" />
        </span>
        <div className="flex min-w-0 flex-col gap-1">
          {data.item ? <h2 className="text-[17px] leading-6 font-[550] text-pretty break-words">{data.item}</h2> : <Placeholder insert=" on ">Add what it was for</Placeholder>}
          <Select value={category} onValueChange={(v) => setPicked(v as ExpenseCategory)} disabled={!interactive}>
            <SelectTrigger size="sm" className="h-7 w-fit gap-1 rounded-full border-none bg-secondary px-2.5 text-[13px] font-medium text-ink-2 shadow-none" aria-label="Category">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {EXPENSE_CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {CATEGORY_LABEL[c]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Field>
      <Field index={1}>
        {data.amount !== null ? (
          <HeroNumber>
            <AnimatedNumber value={data.amount} format={(v) => formatAmount(v, data.currency)} />
          </HeroNumber>
        ) : (
          <Missing>No amount yet</Missing>
        )}
      </Field>
    </div>
  );
}
