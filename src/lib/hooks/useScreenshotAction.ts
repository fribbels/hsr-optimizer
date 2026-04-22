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
    // Defer one frame so React can flush loading state before capture blocks main thread
    requestAnimationFrame(() => {
      void screenshotElementById(elementId, action, name)
        .catch((e: unknown) => {
          console.error(e)
          Message.error(i18next.t('charactersTab:ScreenshotMessages.ScreenshotFailed'))
        })
        .finally(() => setLoading(false))
    })
  }, [elementId])

  return { loading, trigger }
}
