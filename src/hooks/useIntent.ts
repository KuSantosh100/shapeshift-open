"use client";

import { useEffect, useRef, useState } from "react";
import { notify } from "@/lib/notify";
import { mockClassify, mockClassifyAsync } from "@/lib/jev/mock";
import { type IntentResult, intentResultSchema, noneResult } from "@/lib/jev/types";
import { LRU, normalizeKey } from "@/lib/lru";

export type IntentStatus = "idle" | "thinking" | "ready";

export type IntentState = {
  result: IntentResult;
  /** The text `result` was computed for. */
  resultText: string;
  status: IntentStatus;
  /** Last real classification, for the latency HUD. */
  hud: { latency: number | null; questions: number; model: string; cached: boolean };
};

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true";
const clientCache = new LRU<string, IntentResult>(300);
let toasted = false;

function fallback(text: string): IntentResult {
  if (!toasted) {
    toasted = true;
    notify("Jev is busy. Using offline mode for now.", { id: "offline" });
  }
  return mockClassify(text);
}

async function classify(text: string, signal: AbortSignal): Promise<IntentResult> {
  if (USE_MOCK) return mockClassifyAsync(text, signal);
  let res: Response;
  try {
    res = await fetch("/api/intent", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text }),
      signal,
    });
  } catch (err) {
    if (signal.aborted) throw err;
    return fallback(text);
  }
  if (!res.ok) return fallback(text);
  const parsed = intentResultSchema.safeParse(await res.json());
  if (!parsed.success || parsed.data.error) return fallback(text);
  return parsed.data;
}

/**
 * Debounced, abortable, stale-safe intent classification.
 * Only the latest request id may update state.
 */
export function useIntent(text: string, { debounceMs = 120 }: { debounceMs?: number } = {}): IntentState {
  const [state, setState] = useState<IntentState>({
    result: noneResult(),
    resultText: "",
    status: "idle",
    hud: { latency: null, questions: 0, model: "", cached: false },
  });
  const reqId = useRef(0);
  const controller = useRef<AbortController | null>(null);

  useEffect(() => {
    const id = ++reqId.current;
    controller.current?.abort();
    const key = normalizeKey(text);

    if (key.length < 2) {
      // Nothing to ask; resolve synchronously on the next frame.
      const raf = requestAnimationFrame(() => {
        if (id === reqId.current) setState((s) => ({ ...s, result: noneResult(), resultText: text, status: "idle" }));
      });
      return () => cancelAnimationFrame(raf);
    }

    const cached = clientCache.get(key);
    if (cached) {
      const raf = requestAnimationFrame(() => {
        if (id === reqId.current)
          setState((s) => ({
            ...s,
            result: { ...cached, cached: true },
            resultText: text,
            status: "ready",
            hud: { latency: 0, questions: cached.questionCount, model: cached.model, cached: true },
          }));
      });
      return () => cancelAnimationFrame(raf);
    }

    const timer = setTimeout(async () => {
      const ctrl = new AbortController();
      controller.current = ctrl;
      setState((s) => ({ ...s, status: "thinking" }));
      try {
        const result = await classify(text, ctrl.signal);
        if (id !== reqId.current) return; // stale
        if (!result.error) clientCache.set(key, result);
        setState({
          result,
          resultText: text,
          status: "ready",
          hud: {
            latency: result.cached ? 0 : result.latencyMs,
            questions: result.questionCount,
            model: result.model,
            cached: Boolean(result.cached),
          },
        });
      } catch {
        // aborted — a newer request owns the state
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [text, debounceMs]);

  useEffect(() => () => controller.current?.abort(), []);

  return state;
}
