import { useEffect, useRef, useState } from 'react'

/**
 * Progressively reveals content across frames using requestAnimationFrame.
 * On first mount or when `key` changes, resets to phase 0 and advances
 * one phase per frame until reaching `maxPhase`.
 *
 * Each phase gate (`phase >= N && jsx`) mounts one section per frame,
 * keeping individual frame render costs low.
 */
export function useProgressivePhase(key: unknown, maxPhase: number): number {
  const [phase, setPhase] = useState(0)
  const prevKeyRef = useRef<unknown>(undefined)

  // When key changes, reset phase state to 0 so the rAF effect can advance it.
  // Without the setState, setPhase(1) would be a no-op when phase is already 1.
  const keyJustChanged = key != null && key !== prevKeyRef.current
  if (keyJustChanged) {
    prevKeyRef.current = key
    setPhase(0)
  }

  const effectivePhase = keyJustChanged ? 0 : phase

  // Advance one phase per animation frame
  useEffect(() => {
    if (key == null || effectivePhase >= maxPhase) return
    const id = requestAnimationFrame(() => {
      setPhase(effectivePhase + 1)
    })
    return () => cancelAnimationFrame(id)
  }, [key, effectivePhase, maxPhase])

  return effectivePhase
}
