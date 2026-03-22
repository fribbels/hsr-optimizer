import { useRef } from 'react'

const t0 = performance.now()
let globalRenderCount = 0

function ts() {
  return `+${(performance.now() - t0).toFixed(1)}ms`
}

/**
 * Simple render log — call at the top of a component body.
 */
export function renderLog(component: string, details?: string) {
  globalRenderCount++
  const extra = details ? ` — ${details}` : ''
  console.log(`[RENDER #${globalRenderCount}] ${ts()} ${component}${extra}`)
}

/**
 * General debug log for non-render events (effects, callbacks, store updates).
 */
export function debugLog(source: string, message: string) {
  console.log(`[DEBUG] ${ts()} ${source}: ${message}`)
}

/**
 * Hook: tracks which props changed between renders.
 * Call once at the top of a memo'd component.
 */
export function useRenderTracker(name: string, props: Record<string, unknown>) {
  const prevRef = useRef<Record<string, unknown> | null>(null)
  const countRef = useRef(0)
  countRef.current++
  globalRenderCount++

  if (!prevRef.current) {
    console.log(`[RENDER #${globalRenderCount}] ${ts()} ${name} (#${countRef.current}) — MOUNT`)
    prevRef.current = { ...props }
    return
  }

  const changed: string[] = []
  for (const key of Object.keys(props)) {
    if (prevRef.current[key] !== props[key]) {
      changed.push(key)
    }
  }
  prevRef.current = { ...props }

  const reason = changed.length > 0
    ? `props changed: [${changed.join(', ')}]`
    : 'internal state/hook (no prop changes)'

  console.log(`[RENDER #${globalRenderCount}] ${ts()} ${name} (#${countRef.current}) — ${reason}`)
}

/**
 * Hook: tracks which values from hooks/state changed between renders.
 * Use for internal state/store values that aren't props.
 */
export function useValueTracker(name: string, values: Record<string, unknown>) {
  const prevRef = useRef<Record<string, unknown> | null>(null)

  if (!prevRef.current) {
    prevRef.current = { ...values }
    return // skip on mount — useRenderTracker already logs mount
  }

  const changed: string[] = []
  for (const key of Object.keys(values)) {
    if (prevRef.current[key] !== values[key]) {
      changed.push(key)
    }
  }
  prevRef.current = { ...values }

  if (changed.length > 0) {
    console.log(`[VALUES] ${ts()} ${name} hook/state changed: [${changed.join(', ')}]`)
  }
}
