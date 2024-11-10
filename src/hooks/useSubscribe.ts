import { useEffect } from 'react'

export const useSubscribe = (eventName: string, callback: () => void) => {
  const unsubscribe = () => {
    document.removeEventListener(eventName, callback)
  }

  useEffect(() => {
    document.addEventListener(eventName, callback)
    return () => unsubscribe()
  }, [eventName, callback])
}
