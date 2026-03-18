import { useCallback, useState } from 'react'
import { screenshotElementById } from 'lib/utils/screenshotUtils'

export function useScreenshotAction(elementId: string) {
  const [loading, setLoading] = useState(false)

  const trigger = useCallback((action: 'clipboard' | 'download', name?: string | null) => {
    setLoading(true)
    setTimeout(() => {
      void screenshotElementById(elementId, action, name).finally(() => {
        setLoading(false)
      })
    }, 100)
  }, [elementId])

  return { loading, trigger }
}
