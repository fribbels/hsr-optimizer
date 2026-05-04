import i18next from 'i18next'
import { Message } from 'lib/interactions/message'
import { screenshotElementById } from 'lib/utils/screenshotUtils'
import {
  useCallback,
  useState,
} from 'react'

export function useScreenshotAction(elementId: string) {
  const [loading, setLoading] = useState(false)

  const trigger = useCallback((action: 'clipboard' | 'download', name?: string | null) => {
    setLoading(true)
    // Delay lets the browser paint the loading spinner before capture blocks the thread
    setTimeout(() => {
      void screenshotElementById(elementId, action, name)
        .then(() => setLoading(false))
    }, 50)
  }, [elementId])

  return { loading, trigger }
}
