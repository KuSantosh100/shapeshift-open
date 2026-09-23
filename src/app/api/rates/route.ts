import { LRU } from "@/lib/lru";

export const runtime = "nodejs";

type RatesPayload = { base: string; date: string | null; rates: Record<string, number> };

const RATE_TTL_MS = 60 * 60 * 1000;
const cache = new LRU<string, { at: number; payload: RatesPayload }>(50);

async function fetchRates(base: string): Promise<RatesPayload> {
  const res = await fetch(`https://api.frankfurter.dev/v1/latest?base=${base}`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error(`upstream ${res.status}`);
  const data = (await res.json()) as { base: string; date: string; rates: Record<string, number> };
  return { base, date: data.date, rates: { ...data.rates, [base]: 1 } };
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const base = (url.searchParams.get("base") ?? "").toUpperCase();
  if (!/^[A-Z]{3}$/.test(base)) return Response.json({ error: "Expected ?base=XXX (a 3-letter currency code)" }, { status: 400 });

  const cached = cache.get(base);
  if (cached && Date.now() - cached.at < RATE_TTL_MS) {
    return Response.json({ ...cached.payload, cached: true });
  }

  try {
    const payload = await fetchRates(base);
    cache.set(base, { at: Date.now(), payload });
    return Response.json(payload);
  } catch (err) {
    console.warn(`[rates] fetch failed for ${base}: ${err instanceof Error ? err.message : String(err)}`);
    if (cached) return Response.json({ ...cached.payload, stale: true });
    return Response.json({ error: "Live rate unavailable" }, { status: 502 });
  }
}
