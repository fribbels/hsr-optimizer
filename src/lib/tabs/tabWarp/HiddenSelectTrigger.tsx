import type { CSSProperties, ReactNode } from 'react'
import { useRef, useState } from 'react'

// CharacterSelect / LightConeSelect render a modal popover but no visible trigger. We drive them from
// custom UI (a table cell, a button) by mounting them invisibly and toggling `opened` imperatively.
const HIDDEN_HOST_STYLE: CSSProperties = { position: 'absolute', opacity: 0, pointerEvents: 'none', width: 0, height: 0, overflow: 'hidden' }

export type HiddenSelectTrigger = {
  opened: boolean,
  open: () => void,
  onOpenChange: (open: boolean) => void,
}

export function useHiddenSelectTrigger(): HiddenSelectTrigger {
  const [opened, setOpened] = useState(false)
  const justClosedRef = useRef(false)

  // Suppress opening for a moment after a close, so the same click that dismissed the popover
  // (e.g. on the trigger cell itself) doesn't immediately reopen it.
  const open = () => {
    if (!justClosedRef.current) setOpened(true)
  }

  const onOpenChange = (next: boolean) => {
    setOpened(next)
    if (!next) {
      justClosedRef.current = true
      setTimeout(() => { justClosedRef.current = false }, 150)
    }
  }

  return { opened, open, onOpenChange }
}

export function HiddenSelectHost({ children }: { children: ReactNode }) {
  return <div style={HIDDEN_HOST_STYLE}>{children}</div>
}
