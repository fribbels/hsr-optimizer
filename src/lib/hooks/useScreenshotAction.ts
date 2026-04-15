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
    setTimeout(() => {
      void screenshotElementById(elementId, action, name)
        .catch((e) => {
          console.error(e)
          Message.error(i18next.t('charactersTab:ScreenshotMessages.ScreenshotFailed'))
        })
        .finally(() => setLoading(false))
    }, 100)
  }, [elementId])

  return { loading, trigger }
}
