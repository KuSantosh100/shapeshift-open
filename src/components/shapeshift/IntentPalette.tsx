"use client";

import { CARD_INTENTS, registry } from "@/components/intents/registry";
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import type { CardIntent } from "@/lib/jev/types";

/**
 * "/" opens every UI type — a manual override and a gallery in one.
 * Keyboard-summoned and used often, so it opens without animation.
 */
export function IntentPalette({
  open,
  onOpenChange,
  onPick,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPick: (intent: CardIntent) => void;
}) {
  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Choose a card"
      description="Force the input into a specific card type"
      className="shadow-[var(--shadow-float)] data-closed:animate-none data-open:animate-none sm:max-w-[480px]"
    >
      {/* shadcn's CommandDialog no longer includes the cmdk root; without it cmdk has no store. */}
      <Command>
        <CommandInput placeholder="Show as…" className="text-base sm:text-sm" />
        <CommandList className="max-h-[420px] overscroll-contain">
          <CommandEmpty>No card type matches. Try “timer” or “poll”.</CommandEmpty>
          <CommandGroup>
            {CARD_INTENTS.map((intent) => {
              const def = registry[intent];
              const Icon = def.icon;
              return (
                <CommandItem
                  key={intent}
                  value={`${def.label} ${intent} ${def.example}`}
                  onSelect={() => onPick(intent)}
                  className="min-h-12 gap-3"
                >
                  <span className="bg-secondary text-foreground grid size-8 shrink-0 place-items-center rounded-sm">
                    <Icon className="size-[18px]" aria-hidden />
                  </span>
                  <span className="w-20 shrink-0 text-[14px] font-medium">{def.label}</span>
                  <span className="text-muted-foreground min-w-0 text-[13px] text-pretty">{def.example}</span>
                </CommandItem>
              );
            })}
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
