"use client";

import { motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import type { TodoData } from "@/lib/parse/todo";
import { easeOut, spring, tween } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { Placeholder } from "./shared";
import type { CardProps } from "./types";

export function TodoList({ data, interactive }: CardProps<TodoData>) {
  const [done, setDone] = useState<Record<string, boolean>>({});
  const reduce = useReducedMotion();

  return (
    <ul className="flex flex-col">
      {data.items.map((item, i) => {
        const checked = Boolean(done[item]);
        const id = `todo-${i}-${item}`;
        return (
          <motion.li
            key={item + i}
            layout="position"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 6, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={reduce ? tween.fade : { ...spring.settle, delay: 0.04 + i * 0.04 }}
            className="flex min-h-10 items-center gap-3 border-b border-border/70 py-2 last:border-b-0"
          >
            <Checkbox
              id={id}
              checked={checked}
              disabled={!interactive}
              onCheckedChange={(v) => setDone((d) => ({ ...d, [item]: v === true }))}
            />
            <label htmlFor={id} className={cn("relative text-[15px] leading-[22px] transition-colors duration-200", checked && "text-muted-foreground")}>
              {item}
              <motion.span
                aria-hidden
                className="absolute top-1/2 right-0 left-0 h-px origin-left bg-current"
                initial={false}
                animate={{ scaleX: checked ? 1 : 0 }}
                transition={reduce ? { duration: 0 } : { duration: 0.22, ease: easeOut }}
              />
            </label>
          </motion.li>
        );
      })}
      <li className="flex h-10 items-center">
        <Placeholder insert=", ">Add item</Placeholder>
      </li>
    </ul>
  );
}
