import {
  useCallback,
  useEffect,
} from 'react'

export function useHashNavigation(callback: (newHash: string) => void) {
  const listener = useCallback(function(e: HashChangeEvent) {
    const { oldURL, newURL } = e
    const oldHash = new URL(oldURL).hash.split('?')[0]
    const newHash = new URL(newURL).hash.split('?')[0]
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
