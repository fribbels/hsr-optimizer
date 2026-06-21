import {
  useCallback,
  useEffect,
} from 'react'

export function useHashParams(fn: (params: URLSearchParams) => void, fireOnMount = false) {
  const callback = useCallback(function(e: HashChangeEvent) {
    const url = e.newURL
    const paramsString = url.split('?')[1] ?? ''
    const params = new URLSearchParams(paramsString)
    fn(params)
  }, [fn])

  useEffect(() => {
    window.addEventListener('hashchange', callback)
    return () => {
      window.removeEventListener('hashchange', callback)
    }
  }, [callback])

  useEffect(() => {
    if (fireOnMount) {
      const url = window.location.href
      const paramsString = url.split('?')[1] ?? ''
      const params = new URLSearchParams(paramsString)
      fn(params)
    }
  }, [])
}
