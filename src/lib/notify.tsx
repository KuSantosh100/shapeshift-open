"use client";

import { toast } from "sonner";

type NotifyOptions = {
  /** Muted lead-in before the message, e.g. "Deleted". */
  lead?: string;
  action?: { label: string; onClick: () => void };
  /** Replaces an existing toast with the same id instead of stacking. */
  id?: string;
  /** Hovering pauses the timer; swiping down dismisses early. */
  duration?: number;
};

/**
 * The app's one toast. Headless `toast.custom` keeps Sonner's stacking, swipe and
 * hover-to-pause, while the card itself uses the design tokens. No close button:
 * it times out, or you swipe it left, right or down.
 */
export function notify(message: string, { lead, action, id, duration = action ? 6000 : 4000 }: NotifyOptions = {}) {
  return toast.custom(
    (t) => (
      <div className="flex w-[356px] max-w-[calc(100vw-32px)] items-center gap-3 rounded-xl border border-border bg-popover py-2 ps-4 pe-2 text-[14px] leading-5 text-popover-foreground shadow-[var(--shadow-float)]">
        <p className="min-h-8 min-w-0 flex-1 content-center py-1.5 text-pretty break-words">
          {lead && <span className="text-muted-foreground">{lead} </span>}
          {message}
        </p>
        {action && (
          <button
            type="button"
            onClick={() => {
              action.onClick();
              toast.dismiss(t);
            }}
            className="h-8 shrink-0 rounded-full bg-foreground px-3.5 text-[13px] font-medium text-background transition-[scale,opacity] duration-150 ease-out hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:scale-[0.96]"
          >
            {action.label}
          </button>
        )}
      </div>
    ),
    { id, duration },
  );
}
