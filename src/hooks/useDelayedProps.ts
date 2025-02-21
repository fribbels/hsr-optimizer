import { useEffect, useState } from 'react'

// Delays rendering a component for performance, useful to memoize heavy component renders
export function useDelayedProps<T>(props: T, delay = 100) {
  const [delayedProps, setDelayedProps] = useState<T | null>(null)

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDelayedProps(props)
    }, delay)

    return () => clearTimeout(timeout)
  }, [props, delay])

  return delayedProps
}
