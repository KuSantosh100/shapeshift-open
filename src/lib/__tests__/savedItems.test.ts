import { describe, expect, test } from "bun:test";
import { newId, savedItemSchema } from "@/lib/savedItems";

describe("saved items", () => {
  test("ids are unique and increasing", () => {
    const ids = Array.from({ length: 50 }, newId);
    expect(new Set(ids).size).toBe(50);
    expect([...ids].sort((a, b) => a - b)).toEqual(ids);
  });
  test("schema rejects the none intent and bad shapes", () => {
    const ok = { id: 1, intent: "timer", summary: "Focus", text: "25 min focus", createdAt: 1 };
    expect(savedItemSchema.safeParse(ok).success).toBe(true);
    expect(savedItemSchema.safeParse({ ...ok, intent: "none" }).success).toBe(false);
    expect(savedItemSchema.safeParse({ ...ok, text: undefined }).success).toBe(false);
  });
});
