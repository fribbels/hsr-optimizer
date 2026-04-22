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
    void screenshotElementById(elementId, action, name)
      .catch((e: unknown) => {
        console.error(e)
        const msg = e instanceof Error ? `${e.name}: ${e.message}` : String(e)
        Message.error(`[debug] capture failed: ${msg}`)
      })
      .finally(() => setLoading(false))
  }, [elementId])

  return { loading, trigger }
}
