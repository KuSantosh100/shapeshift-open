"use client";

import { AnimatePresence, motion, MotionConfig, useReducedMotion, useSpring } from "motion/react";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { registry } from "@/components/intents/registry";
import { useDemoScript } from "@/hooks/useDemoScript";
import { useIntent } from "@/hooks/useIntent";
import { activeIntent, type DecideMemory, decide, force, initialMemory, promote } from "@/lib/decide";
import type { CardIntent, IntentResult } from "@/lib/jev/types";
import { spring, tween } from "@/lib/motion";
import { parseFor, parsers } from "@/lib/parse";
import { type GatedSignals, gateSignals, neutralGated } from "@/lib/signals";
import { cn } from "@/lib/utils";
import { DraftContext } from "@/components/intents/shared";
import { CardView } from "./CardView";
import { CyclingPlaceholder } from "./CyclingPlaceholder";
import { DebugPanel } from "./DebugPanel";
import { GhostPreview } from "./GhostPreview";
import { FirstRunHint } from "./FirstRunHint";
import { IntentChips } from "./IntentChips";
import { IntentPalette } from "./IntentPalette";
import { LatencyHud } from "./LatencyHud";
import { MorphContainer } from "./MorphContainer";
import { RecentStack } from "./RecentStack";
import { newId, type SavedItem, savedItems } from "@/lib/savedItems";
import { notify } from "@/lib/notify";

const subscribeNoop = () => () => {};

function useSearchFlags() {
  const search = useSyncExternalStore(
    subscribeNoop,
    () => window.location.search,
    () => "",
  );
  return useMemo(() => {
    const p = new URLSearchParams(search);
    return { debug: p.get("debug") === "1", demo: p.get("demo") === "1", loop: p.get("loop") === "1" };
  }, [search]);
}

/** Everything about the current card that isn't the typed data itself. */
function derive<K extends CardIntent>(intent: K, text: string, signals: GatedSignals) {
  const data = parseFor(intent, text, { colorMood: signals.colorMood });
  const def = registry[intent];
  return {
    edge: def.edge?.(signals, data) ?? null,
    summary: def.summary(data),
    completeness: parsers[intent].complete(data),
  };
}

function IntentCard<K extends CardIntent>(props: {
  intent: K;
  text: string;
  signals: GatedSignals;
  readiness: ReturnType<typeof useSpring>;
  ghost: boolean;
  editing: boolean;
  onConfirm: () => void;
}) {
  const { intent, text, signals } = props;
  const data = useMemo(() => parseFor(intent, text, { colorMood: signals.colorMood }), [intent, text, signals.colorMood]);
  return <CardView {...props} data={data} />;
}

export function Shapeshift() {
  const flags = useSearchFlags();
  const reduce = useReducedMotion();
  const inputRef = useRef<HTMLInputElement>(null);

  const [text, setText] = useState("");
  const { result, resultText, status, hud } = useIntent(text);

  const [mem, setMem] = useState<DecideMemory>(initialMemory);
  const [gated, setGated] = useState<GatedSignals>(neutralGated);
  const [seen, setSeen] = useState<IntentResult>(result);
  const [chip, setChip] = useState(0);
  const saved = useSyncExternalStore(savedItems.subscribe, savedItems.getSnapshot, savedItems.getServerSnapshot);
  // The saved item currently reopened in the shell; its row is hidden while you edit.
  const [editingId, setEditingId] = useState<number | null>(null);
  // The saved row currently flying out of the shell (shared layoutId), so it skips its fade-in.
  const [flyingId, setFlyingId] = useState<number | null>(null);
  // Not rendered until a card exists, so a client-only id is hydration-safe.
  const [draftId, setDraftId] = useState(newId);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [announcement, setAnnouncement] = useState("");

  // Fold each new result into the calm UI state (decide + signal gating).
  if (seen !== result) {
    setSeen(result);
    const next = decide(mem, result, resultText);
    const nextIntent = activeIntent(next.ui);
    const prevIntent = activeIntent(mem.ui);
    setMem(next);
    setGated(nextIntent ? gateSignals(prevIntent === nextIntent ? gated : neutralGated, result, registry[nextIntent].signals) : neutralGated);
    if (next.ui.kind === "choose" && mem.ui.kind !== "choose") setChip(0);
  }

  const ui = mem.ui;
  const intent = activeIntent(ui);
  const ghost = ui.kind === "ghost";
  const meta = useMemo(() => (intent ? derive(intent, text, gated) : null), [intent, text, gated]);

  // Readiness: Jev's continuous score when it agrees with the card, otherwise how filled-in the card is.
  const target = !intent
    ? 0
    : result.intent.value === intent && resultText === text && result.source === "jev"
      ? result.readiness / 2
      : (meta?.completeness ?? 0);
  const readiness = useSpring(0, spring.number);
  useEffect(() => {
    readiness.set(ghost ? target * 0.4 : target);
  }, [target, ghost, readiness]);

  // Announce commits (and completions) for screen readers.
  const committedIntent = ui.kind === "committed" ? ui.intent : null;
  const liveMessage = committedIntent ? `Showing ${registry[committedIntent].label.toLowerCase()} card` : announcement;

  /** Clear the input. When editing a saved item, it returns to the list unchanged. */
  const reset = () => {
    setText("");
    setMem(initialMemory);
    setGated(neutralGated);
    if (editingId !== null) {
      setFlyingId(editingId);
      setEditingId(null);
      setDraftId(newId());
    }
  };

  const complete = (): boolean => {
    const target: CardIntent | null =
      ui.kind === "committed" || ui.kind === "ghost" ? ui.intent : ui.kind === "choose" ? ui.options[chip] : null;
    if (!target || !text.trim()) return false;
    const { summary } = derive(target, text, gated);
    if (editingId !== null) {
      // Save edits in place, keeping the item's position in the list.
      savedItems.update((list) => list.map((x) => (x.id === editingId ? { ...x, intent: target, summary, text } : x)));
      setAnnouncement(`Updated ${registry[target].label.toLowerCase()}: ${summary}`);
    } else {
      const item: SavedItem = { id: draftId, intent: target, summary, text, createdAt: Date.now() };
      savedItems.update((list) => (flags.demo ? [item, ...list].slice(0, 9) : [item, ...list])); // demo list is in-memory
      setAnnouncement(`Added ${registry[target].label.toLowerCase()}: ${summary}`);
    }
    setFlyingId(editingId ?? draftId);
    // Saving with the button (or a card control) keeps you in flow: focus returns to the input.
    requestAnimationFrame(() => inputRef.current?.focus());
    setEditingId(null);
    setText("");
    setMem(initialMemory);
    setGated(neutralGated);
    setDraftId(newId());
    return true;
  };

  // Reopen a completed card: it flies back into the shell (shared layoutId) with its text.
  const reopen = (item: SavedItem) => {
    complete(); // file away whatever is being drafted instead of discarding it
    setEditingId(item.id);
    setDraftId(item.id);
    setText(item.text);
    setMem(force(item.intent, item.text));
    setGated(neutralGated);
    requestAnimationFrame(() => {
      const el = inputRef.current;
      el?.focus();
      el?.setSelectionRange(item.text.length, item.text.length);
    });
  };

  // The only way an item leaves the list. Undo is offered for 6s (hover pauses it).
  const remove = (item: SavedItem) => {
    const index = savedItems.getSnapshot().findIndex((x) => x.id === item.id);
    savedItems.update((list) => list.filter((x) => x.id !== item.id));
    setAnnouncement(`Deleted ${registry[item.intent].label.toLowerCase()}: ${item.summary}`);
    notify(item.summary, {
      lead: "Deleted",
      id: "deleted",
      action: {
        label: "Undo",
        onClick: () =>
          savedItems.update((list) => {
            if (list.some((x) => x.id === item.id)) return list;
            const next = [...list];
            next.splice(Math.min(index, next.length), 0, item);
            return next;
          }),
      },
    });
  };

  const pick = (picked: CardIntent) => {
    let t = text;
    if (!t.trim()) {
      t = registry[picked].example;
      setText(t);
    }
    setMem(force(picked, t));
    setGated((g) => (intent === picked ? g : neutralGated));
    setPaletteOpen(false);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  // Dashed "Add …" chips type their connecting word into the input.
  const draft = useMemo(
    () => ({
      append: (snippet: string) => {
        setText((t) => {
          const base = t.trimEnd();
          // Keep a trailing question mark at the end: "pizza or burgers?" + " or " → "pizza or burgers or ?"
          return base.endsWith("?") ? `${base.slice(0, -1).trimEnd()}${snippet}?` : `${base}${snippet}`;
        });
        requestAnimationFrame(() => {
          const el = inputRef.current;
          if (!el) return;
          el.focus();
          const end = el.value.endsWith("?") ? el.value.length - 1 : el.value.length;
          el.setSelectionRange(end, end);
        });
      },
    }),
    [],
  );

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const atEnd = e.currentTarget.selectionStart === text.length;
    if (e.key === "/" && text === "") {
      e.preventDefault();
      setPaletteOpen(true);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (ui.kind === "choose") pick(ui.options[chip]);
      else complete();
    } else if (e.key === "Escape") {
      e.preventDefault();
      reset();
    } else if (e.key === "Tab" && ghost) {
      e.preventDefault();
      setMem(promote(mem));
    } else if (ui.kind === "choose" && atEnd && (e.key === "ArrowLeft" || e.key === "ArrowRight")) {
      e.preventDefault();
      setChip(e.key === "ArrowLeft" ? 0 : 1);
    }
  };

  useEffect(() => {
    savedItems.setEphemeral(flags.demo);
  }, [flags.demo]);

  useDemoScript(flags.demo, flags.loop, {
    getText: () => inputRef.current?.value ?? "",
    setText: (t) => setText(t),
    complete,
    clear: reset,
  });

  // Focus the input on load, and whenever "/" is pressed elsewhere on the page.
  useEffect(() => {
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (e.key === "/" && el && !el.closest("input, textarea, [contenteditable], [role=dialog]")) {
        e.preventDefault();
        inputRef.current?.focus();
        if (!inputRef.current?.value) setPaletteOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <main id="main" className="mx-auto w-full max-w-[560px] px-4 pt-[14vh] pb-24 sm:px-0 sm:pt-[22vh]">
        <h1 className="sr-only">Shapeshift</h1>
        <MorphContainer readiness={readiness} edge={ghost ? null : (meta?.edge ?? null)}>
          <motion.div layout="position" className="relative flex h-[72px] items-center px-5">
            <input
              ref={inputRef}
              value={text}
              onChange={(e) => {
                const v = e.target.value;
                setText(v);
                if (!v.trim()) {
                  setMem(initialMemory);
                  setGated(neutralGated);
                }
              }}
              onKeyDown={onKeyDown}
              aria-label="Type anything"
              aria-describedby="shapeshift-hint"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              enterKeyHint="done"
              className="relative z-[1] h-8 w-full bg-transparent pe-6 text-[22px] leading-8 font-[450] tracking-[-0.01em] text-foreground caret-brand outline-none"
            />
            {text === "" && <CyclingPlaceholder />}
            <span
              aria-hidden
              className={cn(
                "absolute end-5 size-1.5 rounded-full bg-brand transition-opacity duration-300 ease-out",
                status === "thinking" ? "opacity-60" : "opacity-0",
              )}
            />
          </motion.div>

          <AnimatePresence initial={false} mode="popLayout">
            {intent && (
              <motion.div
                key={`card-${draftId}`}
                layoutId={reduce ? undefined : `item-${draftId}`}
                initial={reduce ? { opacity: 0 } : { opacity: 0, filter: "blur(4px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, transition: tween.exit }}
                transition={reduce ? tween.fade : { ...spring.settle, delay: 0.04 }}
              >
                <GhostPreview ghost={ghost}>
                  <DraftContext value={draft}>
                    <IntentCard intent={intent} text={text} signals={gated} readiness={readiness} ghost={ghost} editing={editingId !== null} onConfirm={complete} />
                  </DraftContext>
                </GhostPreview>
              </motion.div>
            )}
          </AnimatePresence>
        </MorphContainer>

        <FirstRunHint show={!intent && ui.kind !== "choose" && saved.length === 0 && !flags.demo} />

        <IntentChips
          options={ui.kind === "choose" ? ui.options : null}
          probabilities={result.intent.probabilities}
          active={chip}
          onPick={pick}
        />

        <RecentStack items={saved.filter((x) => x.id !== editingId)} flyingId={flyingId} onOpen={reopen} onDelete={remove} />

        <p id="shapeshift-hint" className="sr-only">
          Type anything. Enter adds the card, Escape clears, Tab keeps a preview, slash opens every card type.
        </p>
        <div role="status" aria-live="polite" className="sr-only">
          {liveMessage}
        </div>
      </main>

      <IntentPalette open={paletteOpen} onOpenChange={setPaletteOpen} onPick={pick} />
      <LatencyHud {...hud} large={flags.demo} />
      {flags.debug && <DebugPanel result={result} mem={mem} gated={gated} />}
    </MotionConfig>
  );
}
