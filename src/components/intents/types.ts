import type { LucideIcon } from "lucide-react";
import type { ComponentType } from "react";
import type { CardIntent, SignalKey } from "@/lib/jev/types";
import type { ParsedMap } from "@/lib/parse";
import type { GatedSignals } from "@/lib/signals";

export type CardProps<D> = {
  data: D;
  signals: GatedSignals;
  /** False while the card is a ghost preview. */
  interactive: boolean;
};

export type BadgeSpec = { id: string; label: string; icon?: LucideIcon; tone?: "caution" | "brand" };

export type IntentDef<K extends CardIntent> = {
  label: string;
  example: string;
  icon: LucideIcon;
  /** Signals this intent reads (section 7.3). Everything else is ignored. */
  signals: readonly SignalKey[];
  /** Signal-driven variant of the header icon. */
  headerIcon?: (s: GatedSignals, d: ParsedMap[K]) => LucideIcon;
  headerLabel?: (s: GatedSignals, d: ParsedMap[K]) => string;
  badges?: (s: GatedSignals, d: ParsedMap[K]) => BadgeSpec[];
  /** A 3px left edge color, e.g. caution for urgent reminders or tone for notes. */
  edge?: (s: GatedSignals, d: ParsedMap[K]) => string | null;
  /** One line for the recent stack. */
  summary: (d: ParsedMap[K]) => string;
  Component: ComponentType<CardProps<ParsedMap[K]>>;
};

export type Registry = { [K in CardIntent]: IntentDef<K> };
