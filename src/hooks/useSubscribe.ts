import { useEffect } from 'react'

export const useSubscribe = (eventName: string, callback) => {
  // console.log(`++++++++++ Subscribing to [${eventName}]`);

  const unsubscribe = () => {
    // console.log(`++++++++++ Unsubscribing from [${eventName}]`);
    document.removeEventListener(eventName, callback)
  }

  useEffect(() => {
    document.addEventListener(eventName, callback)
    return () => unsubscribe()
  }, [eventName, callback]) // eslint-disable-line react-hooks/exhaustive-deps
}
