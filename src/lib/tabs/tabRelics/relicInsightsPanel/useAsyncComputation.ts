import { type DependencyList, useEffect, useState } from 'react'

export function useAsyncComputation<TOutput>(
  computeFn: (() => Promise<TOutput>) | null,
  deps: DependencyList,
): { ready: boolean; output: TOutput | null } {
  const [ready, setReady] = useState(false)
  const [output, setOutput] = useState<TOutput | null>(null)

  useEffect(() => {
    let cancelled = false
    setOutput(null)
    setReady(false)

    if (!computeFn) {
      setReady(true)
      return
    }

    computeFn().then((result) => {
      if (cancelled) return
      setOutput(result)
      setReady(true)
    }).catch(() => {
      if (cancelled) return
      setReady(true)
    })

    return () => {
      cancelled = true
    }
  }, deps)

  return { ready, output }
}
