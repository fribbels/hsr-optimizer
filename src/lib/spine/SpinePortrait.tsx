import {
  getSkeletonCount,
  getSkeletonFiles,
  getSpineAssetBaseUrl,
} from 'lib/spine/manifest'
import { createSpineInstance } from 'lib/spine/spineEngine'
import type { SpineInstance } from 'lib/spine/spineEngine'
import { TabVisibilityContext } from 'lib/hooks/useTabVisibility'
import {
  useContext,
  useEffect,
  useRef,
} from 'react'
import type { CSSProperties } from 'react'
import type { CharacterId } from 'types/character'

const CANVAS_SIZE = 2048

export function SpinePortrait({
  characterId,
  style,
  onUnsupported,
  onReady,
}: {
  characterId: CharacterId,
  style?: CSSProperties,
  onUnsupported?: () => void,
  onReady?: () => void,
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const instanceRef = useRef<SpineInstance | null>(null)
  const onUnsupportedRef = useRef(onUnsupported)
  onUnsupportedRef.current = onUnsupported
  const onReadyRef = useRef(onReady)
  onReadyRef.current = onReady

  const { isActiveRef, addActivationListener, addDeactivationListener } = useContext(TabVisibilityContext)
  const windowVisibleRef = useRef(!document.hidden && document.hasFocus())

  function syncPause() {
    windowVisibleRef.current = !document.hidden && document.hasFocus()
    if (windowVisibleRef.current && isActiveRef.current) {
      instanceRef.current?.resume()
    } else {
      instanceRef.current?.pause()
    }
  }

  // Pause the rAF loop when the host tab hides, resume when it shows again.
  useEffect(() => {
    const unsubActivate = addActivationListener(() => syncPause())
    const unsubDeactivate = addDeactivationListener(() => instanceRef.current?.pause())
    return () => {
      unsubActivate()
      unsubDeactivate()
    }
  }, [addActivationListener, addDeactivationListener])

  // Pause when the browser tab is hidden or the window loses focus (alt-tab).
  // syncPause reads from refs so it's stable — empty deps is correct.
  useEffect(() => {
    document.addEventListener('visibilitychange', syncPause)
    window.addEventListener('focus', syncPause)
    window.addEventListener('blur', syncPause)

    return () => {
      document.removeEventListener('visibilitychange', syncPause)
      window.removeEventListener('focus', syncPause)
      window.removeEventListener('blur', syncPause)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const canvas = canvasRef.current!
    let disposed = false
    // Abort in-flight load on characterId change / unmount. `disposed` still
    // guards the race where abort fires after the instance resolves.
    const abortController = new AbortController()

    const count = getSkeletonCount(characterId)

    if (count != null) {
      const files = getSkeletonFiles(characterId, count)
      const baseUrl = getSpineAssetBaseUrl(characterId)

      createSpineInstance(canvas, baseUrl, files, abortController.signal)
        .then((instance) => {
          if (disposed) {
            instance.dispose()
            return
          }
          instanceRef.current = instance
          // Start paused if the tab hid mid-load or window lost focus.
          if (!isActiveRef.current || !windowVisibleRef.current) {
            instance.pause()
          }
          onReadyRef.current?.()
        })
        .catch((err) => {
          // Expected path when user switches characters mid-load — not an error.
          if ((err as DOMException | undefined)?.name === 'AbortError') return
          console.error('SpinePortrait: failed to load', characterId, err)
          if (!disposed) onUnsupportedRef.current?.()
        })
    } else {
      onUnsupportedRef.current?.()
    }

    return () => {
      disposed = true
      abortController.abort()
      instanceRef.current?.dispose()
      instanceRef.current = null
    }
    // isActiveRef is a stable ref from context — .current is read in the async
    // path but the ref identity never changes, so it's not a real dep.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [characterId])

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_SIZE}
      height={CANVAS_SIZE}
      style={style}
    />
  )
}
