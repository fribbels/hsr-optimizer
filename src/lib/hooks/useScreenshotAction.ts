import { Utils } from 'lib/utils/utils'
import { useCallback, useState } from 'react'

export function useScreenshotAction(elementId: string) {
  const [loading, setLoading] = useState(false)

  const trigger = useCallback((action: 'clipboard' | 'download', name?: string | null) => {
    setLoading(true)
    setTimeout(() => {
      void Utils.screenshotElementById(elementId, action, name).finally(() => {
        setLoading(false)
      })
    }, 100)
  }, [elementId])

  return { loading, trigger }
}
