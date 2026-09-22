"use client"

import { Toaster as Sonner, type ToasterProps } from "sonner"

/** Toasts render through `notify()` (lib/notify.tsx); this only positions and stacks them. */
const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      position="bottom-center"
      offset={24}
      mobileOffset={{ bottom: "max(16px, env(safe-area-inset-bottom))" }}
      gap={8}
      visibleToasts={3}
      swipeDirections={["left", "right", "bottom"]}
      className="toaster group"
      {...props}
    />
  )
}

export { Toaster }
