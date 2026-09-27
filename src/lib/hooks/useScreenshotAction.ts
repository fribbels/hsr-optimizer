import {
  type ScreenshotAction,
  screenshotElementById,
  type ScreenshotSize,
} from 'lib/utils/screenshotUtils'
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'

const SCREENSHOT_START_DELAY_MS = 50

export function useScreenshotAction(elementId: string, size?: ScreenshotSize) {
  const [activeAction, setActiveAction] = useState<ScreenshotAction | null>(null)
  const activeActionRef = useRef<ScreenshotAction | null>(null)
  const timeoutRef = useRef<number | null>(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    setActiveAction(activeActionRef.current)

    return () => {
      mountedRef.current = false
      if (timeoutRef.current == null) return

      window.clearTimeout(timeoutRef.current)
      timeoutRef.current = null
      activeActionRef.current = null
    }
  }, [])

  const trigger = useCallback((action: ScreenshotAction, name?: string | null) => {
    if (activeActionRef.current != null) return
    activeActionRef.current = action
    setActiveAction(action)
    // Delay lets the browser paint the loading spinner before capture blocks the thread
    timeoutRef.current = window.setTimeout(() => {
      timeoutRef.current = null
      void screenshotElementById(elementId, action, name, size)
        .finally(() => {
          activeActionRef.current = null
          if (mountedRef.current) setActiveAction(null)
        })
    }, SCREENSHOT_START_DELAY_MS)
  }, [elementId, size])

  return { activeAction, trigger }
}
