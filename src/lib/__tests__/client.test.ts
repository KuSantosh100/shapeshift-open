import { describe, expect, mock, test } from "bun:test";

mock.module("server-only", () => ({}));
const { looksLikeKey } = await import("@/lib/jev/client");

describe("API key detection", () => {
  test("empty or missing → offline", () => {
    expect(looksLikeKey(undefined)).toBe(false);
    expect(looksLikeKey("")).toBe(false);
    expect(looksLikeKey("   ")).toBe(false);
  });
  test("copied placeholders → offline", () => {
    expect(looksLikeKey("sk-...")).toBe(false);
    expect(looksLikeKey("your-api-key-here")).toBe(false);
    expect(looksLikeKey("<TYPESAFE_API_KEY>")).toBe(false);
  });
  test("a real-looking key → online", () => {
    expect(looksLikeKey("sk-live-8f2c1a9b7d6e5f40")).toBe(true);
  });
});
