import { parseHash } from 'lib/tabs/navigation/parseHash'
import {
  useCallback,
  useEffect,
} from 'react'

export function useHashNavigation(callback: (newHash: string) => void) {
  const listener = useCallback(function(e: HashChangeEvent) {
    const oldHash = parseHash(new URL(e.oldURL).hash).hash
    const newHash = parseHash(new URL(e.newURL).hash).hash
    if (oldHash === newHash) return
    callback(newHash)
  }, [callback])

  useEffect(() => {
    window.addEventListener('hashchange', listener)
    return () => {
      window.removeEventListener('hashchange', listener)
    }
  }, [listener])
}
