import type { CSSProperties, ReactNode } from 'react'
import { useRef, useState } from 'react'

// Mounts a triggerless select invisibly so it can be opened imperatively from custom UI.
const HIDDEN_HOST_STYLE: CSSProperties = { position: 'absolute', opacity: 0, pointerEvents: 'none', width: 0, height: 0, overflow: 'hidden' }

export type HiddenSelectTrigger = {
  opened: boolean,
  open: () => void,
  onOpenChange: (open: boolean) => void,
}

export function useHiddenSelectTrigger(): HiddenSelectTrigger {
  const [opened, setOpened] = useState(false)
  const justClosedRef = useRef(false)

  // Briefly ignore open() after a close so the dismissing click can't immediately reopen.
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
