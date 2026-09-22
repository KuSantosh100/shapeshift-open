"use client";

import type { DecideMemory } from "@/lib/decide";
import type { Answer, IntentResult } from "@/lib/jev/types";
import type { GatedSignals } from "@/lib/signals";

const pct = (n: number) => `${Math.round(n * 100)}`.padStart(3, " ");

function Dist({ name, a }: { name: string; a: Answer<string> }) {
  const rows = Object.entries(a.probabilities).sort((x, y) => (y[1] ?? 0) - (x[1] ?? 0));
  return (
    <div className="flex flex-col gap-0.5">
      <div className="flex justify-between text-foreground">
        <span>{name}</span>
        <span>
          {a.value} · {a.confidence.toFixed(2)}
        </span>
      </div>
      {rows.slice(0, name === "intent" ? 16 : 4).map(([k, v]) => (
        <div key={k} className="flex items-center gap-2">
          <span className="w-24 truncate">{k}</span>
          <span className="relative h-1 flex-1 rounded-full bg-secondary">
            <span className="absolute inset-y-0 left-0 rounded-full bg-brand" style={{ width: `${(v ?? 0) * 100}%` }} />
          </span>
          <span className="w-7 text-right">{pct(v ?? 0)}</span>
        </div>
      ))}
    </div>
  );
}

/** ?debug=1 — every answer, probability and confidence. */
export function DebugPanel({ result, mem, gated }: { result: IntentResult; mem: DecideMemory; gated: GatedSignals }) {
  const s = result.signals;
  return (
    <aside className="fixed start-4 top-4 z-40 hidden max-h-[calc(100vh-2rem)] w-72 flex-col gap-3 overflow-y-auto rounded-xl border bg-card p-3 font-mono text-[11px] leading-4 text-muted-foreground shadow-[var(--shadow-lift)] tabular-nums lg:flex">
      <div className="text-foreground">
        ui: {mem.ui.kind}
        {"intent" in mem.ui ? ` → ${mem.ui.intent}${mem.ui.kind === "committed" && mem.ui.forced ? " (forced)" : ""}` : ""}
        {"options" in mem.ui ? ` → ${mem.ui.options.join(" / ")}` : ""}
        {mem.challenger ? ` · challenger ${mem.challenger.intent}×${mem.challenger.wins}` : ""}
      </div>
      <div>
        readiness {result.readiness.toFixed(2)} · {result.source ?? "?"} · {result.model}
        {result.cached ? " · cached" : ""}
      </div>
      <Dist name="intent" a={result.intent} />
      <div className="flex flex-col gap-0.5">
        <span className="text-foreground">noul / score</span>
        <span>isQuestion {s.isQuestion.toFixed(2)} → {String(gated.isQuestion)}</span>
        <span>recurring {s.recurring.toFixed(2)} → {String(gated.recurring)}</span>
        <span>hasExplicitOptions {s.hasExplicitOptions.toFixed(2)} → {String(gated.hasExplicitOptions)}</span>
        <span>isShoppingList {s.isShoppingList.toFixed(2)} → {String(gated.isShoppingList)}</span>
        <span>urgency {s.urgency.score.toFixed(2)} (c {s.urgency.confidence.toFixed(2)}) → {String(gated.urgent)}</span>
      </div>
      <Dist name="tone" a={s.tone} />
      <Dist name="eventMode" a={s.eventMode} />
      <Dist name="transport" a={s.transport} />
      <Dist name="tripType" a={s.tripType} />
      <Dist name="expenseCategory" a={s.expenseCategory} />
      <Dist name="colorMood" a={s.colorMood} />
      <Dist name="timerKind" a={s.timerKind} />
    </aside>
  );
}
