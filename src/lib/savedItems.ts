import { z } from "zod";
import { INTENT_KEYS } from "@/lib/jev/types";

/** Completed cards, persisted in localStorage until the user deletes them. */
export const savedItemSchema = z.object({
  id: z.number(),
  intent: z.enum(INTENT_KEYS).exclude(["none"]),
  summary: z.string(),
  text: z.string(),
  createdAt: z.number(),
});
export type SavedItem = z.infer<typeof savedItemSchema>;

const KEY = "shapeshift:saved:v1";
const EMPTY: SavedItem[] = [];
let items: SavedItem[] | null = null;
/** Demo mode records into memory only, so it never touches the user's saved list. */
let ephemeral = false;
const listeners = new Set<() => void>();

function load(): SavedItem[] {
  try {
    const parsed = z.array(savedItemSchema).safeParse(JSON.parse(localStorage.getItem(KEY) ?? "[]"));
    return parsed.success ? parsed.data : [];
  } catch {
    return [];
  }
}

export const savedItems = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    // Keep tabs in sync.
    const onStorage = (e: StorageEvent) => {
      if (e.key !== KEY || ephemeral) return;
      items = load();
      listener();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(listener);
      window.removeEventListener("storage", onStorage);
    };
  },
  getSnapshot(): SavedItem[] {
    if (items === null) items = load();
    return items;
  },
  getServerSnapshot(): SavedItem[] {
    return EMPTY;
  },
  update(fn: (prev: SavedItem[]) => SavedItem[]) {
    items = fn(savedItems.getSnapshot());
    if (!ephemeral) {
      try {
        localStorage.setItem(KEY, JSON.stringify(items));
      } catch {
        // Storage full or blocked: keep the in-memory list for this session.
      }
    }
    listeners.forEach((l) => l());
  },
  setEphemeral(on: boolean) {
    if (ephemeral === on) return;
    ephemeral = on;
    items = on ? [] : load();
    listeners.forEach((l) => l());
  },
};

let last = 0;
/** Unique, increasing ids that never collide with ones already saved. */
export function newId() {
  last = Math.max(Date.now(), last + 1);
  return last;
}
