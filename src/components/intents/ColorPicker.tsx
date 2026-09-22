"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { hexToOklch, shades, withLightness } from "@/lib/color";
import type { ColorData } from "@/lib/parse/color";
import { tween } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { Field, Meta, Missing } from "./shared";
import type { CardProps } from "./types";

export function ColorPicker({ data, interactive }: CardProps<ColorData>) {
  const reduce = useReducedMotion();
  const [lightness, setLightness] = useState<number | null>(null);
  const [picked, setPicked] = useState<string | null>(null);

  // Reset local edits when the parsed color changes.
  const [prevHex, setPrevHex] = useState(data.hex);
  if (prevHex !== data.hex) {
    setPrevHex(data.hex);
    setLightness(null);
    setPicked(null);
  }

  if (!data.hex) {
    return (
      <Field index={0} className="flex items-center gap-4">
        <div className="size-16 shrink-0 rounded-md border border-dashed border-line-strong" />
        <Missing>Type a hex code like #ff6b35 or a color name</Missing>
      </Field>
    );
  }

  const base = picked ?? data.hex;
  const baseL = hexToOklch(base)?.l ?? 0.6;
  const hex = lightness === null ? base : withLightness(base, lightness);
  const steps = shades(data.hex);

  return (
    <div className="flex flex-col gap-4">
      <Field index={0} className="flex items-center gap-4">
        <div className="relative size-16 shrink-0 overflow-hidden rounded-md shadow-[inset_0_0_0_1px_var(--swatch-outline)]">
          <AnimatePresence initial={false}>
            <motion.div
              key={hex}
              className="absolute inset-0"
              style={{ backgroundColor: hex }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={reduce ? tween.fade : tween.crossfade}
            />
          </AnimatePresence>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="font-mono text-[17px] leading-6 font-medium tracking-tight uppercase tabular-nums">{hex}</span>
          <Meta className="capitalize">{data.name ?? (data.source === "mood" ? "Picked from the mood" : data.source?.toUpperCase())}</Meta>
        </div>
      </Field>

      <Field index={1} className="flex flex-wrap gap-1.5">
        {steps.map((s) => (
          <button
            key={s}
            type="button"
            disabled={!interactive}
            aria-label={`Use ${s}`}
            aria-pressed={base === s}
            onClick={() => {
              setPicked(s);
              setLightness(null);
            }}
            className={cn(
              "size-10 rounded-sm shadow-[inset_0_0_0_1px_var(--swatch-outline)] transition-[scale] duration-150 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:scale-[0.96]",
              base === s && "ring-2 ring-foreground ring-offset-2",
            )}
            style={{ backgroundColor: s }}
          />
        ))}
      </Field>

      <Field index={2} className="flex items-center gap-3">
        <Meta className="w-16">Lightness</Meta>
        <Slider
          className="max-w-56"
          disabled={!interactive}
          min={10}
          max={96}
          step={1}
          value={[Math.round((lightness ?? baseL) * 100)]}
          onValueChange={([v]) => setLightness(v / 100)}
          aria-label="Lightness"
        />
      </Field>
    </div>
  );
}
