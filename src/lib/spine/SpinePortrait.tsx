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

  // Pause the rAF loop when the host tab hides, resume when it shows again.
  useEffect(() => {
    const unsubActivate = addActivationListener(() => {
      instanceRef.current?.resume()
    })
    const unsubDeactivate = addDeactivationListener(() => {
      instanceRef.current?.pause()
    })
    return () => {
      unsubActivate()
      unsubDeactivate()
    }
  }, [addActivationListener, addDeactivationListener])

  useEffect(() => {
    const canvas = canvasRef.current!
    let disposed = false
    // Abort in-flight loads when characterId changes (or component unmounts).
    // createSpineInstance checks this signal at each await boundary and skips
    // shader compile + rAF bootstrap for doomed loads. `disposed` still guards
    // the rare race where abort fires AFTER the instance is already returned.
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
          // Start paused if the host tab became hidden during the async load.
          // Without this, a spine that loads while its tab is invisible would
          // run uselessly until the tab is focused and hidden again.
          if (!isActiveRef.current) {
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
  }, [characterId, isActiveRef])

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_SIZE}
      height={CANVAS_SIZE}
      style={style}
    />
  )
}
