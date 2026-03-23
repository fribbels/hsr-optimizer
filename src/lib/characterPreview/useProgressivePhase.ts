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

  // When key changes, return 0 immediately via ref detection — no setState needed.
  // The rAF effect below will advance from 0 on the next frame.
  const keyJustChanged = key != null && key !== prevKeyRef.current
  if (keyJustChanged) {
    prevKeyRef.current = key
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
