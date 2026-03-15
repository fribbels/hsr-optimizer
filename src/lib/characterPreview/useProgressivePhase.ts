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

  // Reset phase when key changes (inline setState during render — React 19 pattern)
  if (key != null && key !== prevKeyRef.current) {
    prevKeyRef.current = key
    if (phase !== 0) {
      setPhase(0)
    }
  }

  // Advance one phase per animation frame
  useEffect(() => {
    if (key == null || phase >= maxPhase) return
    const id = requestAnimationFrame(() => setPhase((p) => Math.min(p + 1, maxPhase)))
    return () => cancelAnimationFrame(id)
  }, [key, phase, maxPhase])

  return phase
}
