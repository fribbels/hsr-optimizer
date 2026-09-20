import i18next from 'i18next'
import { Message } from 'lib/interactions/message'
import {
  type ScreenshotAction,
  screenshotElementById,
  type ScreenshotSize,
} from 'lib/utils/screenshotUtils'
import {
  useCallback,
  useState,
} from 'react'

export function useScreenshotAction(elementId: string, size?: ScreenshotSize) {
  const [loading, setLoading] = useState(false)

  const trigger = useCallback((action: ScreenshotAction, name?: string | null) => {
    setLoading(true)
    // Delay lets the browser paint the loading spinner before capture blocks the thread
    setTimeout(() => {
      void screenshotElementById(elementId, action, name, size)
        .finally(() => setLoading(false))
    }, 50)
  }, [elementId, size])

  return { loading, trigger }
}
