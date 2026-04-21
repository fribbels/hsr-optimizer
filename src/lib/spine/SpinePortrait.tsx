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

// Debug: track mounted SpinePortrait components
let portraitMountCounter = 0
const mountedPortraits = new Map<number, { characterId: string, mountedAt: number }>()

// Expose to window for console debugging
if (typeof window !== 'undefined') {
  ;(window as any).__SPINE_PORTRAIT_DEBUG__ = {
    getMountedCount: () => mountedPortraits.size,
    getMountedPortraits: () => Array.from(mountedPortraits.entries()),
  }
}

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
  // See diagnostic logs in spineEngine.ts — after this lands, [Spine #N] FRAME
  // logs should freeze between TAB HIDDEN and TAB SHOWN for the same instance.
  useEffect(() => {
    const unsubActivate = addActivationListener(() => {
      console.log(`[SpinePortrait char:${characterId}] TAB SHOWN — resuming spine instance #${instanceRef.current?.debugId ?? '?'}`)
      instanceRef.current?.resume()
    })
    const unsubDeactivate = addDeactivationListener(() => {
      console.log(`[SpinePortrait char:${characterId}] TAB HIDDEN — pausing spine instance #${instanceRef.current?.debugId ?? '?'}`)
      instanceRef.current?.pause()
    })
    return () => {
      unsubActivate()
      unsubDeactivate()
    }
  }, [characterId, addActivationListener, addDeactivationListener])

  useEffect(() => {
    const debugId = ++portraitMountCounter
    mountedPortraits.set(debugId, { characterId, mountedAt: Date.now() })
    console.log(`[SpinePortrait #${debugId}] MOUNT - char: ${characterId}, total mounted: ${mountedPortraits.size}`)

    const canvas = canvasRef.current!
    let disposed = false

    const count = getSkeletonCount(characterId)

    if (count != null) {
      const files = getSkeletonFiles(characterId, count)
      const baseUrl = getSpineAssetBaseUrl(characterId)

      createSpineInstance(canvas, baseUrl, files)
        .then((instance) => {
          if (disposed) {
            console.log(`[SpinePortrait #${debugId}] DISPOSED BEFORE READY - char: ${characterId}`)
            instance.dispose()
            return
          }
          instanceRef.current = instance
          // Start paused if the host tab became hidden during the async load.
          // Without this, a spine that loads while its tab is invisible would
          // run uselessly until the tab is focused and hidden again.
          if (!isActiveRef.current) {
            console.log(`[SpinePortrait #${debugId}] READY but tab HIDDEN — starting paused, spine instance #${instance.debugId}`)
            instance.pause()
          } else {
            console.log(`[SpinePortrait #${debugId}] READY - char: ${characterId}, spine instance #${instance.debugId}`)
          }
          onReadyRef.current?.()
        })
        .catch((err) => {
          console.error('SpinePortrait: failed to load', characterId, err)
          if (!disposed) onUnsupportedRef.current?.()
        })
    } else {
      console.log(`[SpinePortrait #${debugId}] NO SPINE DATA - char: ${characterId}`)
      onUnsupportedRef.current?.()
    }

    return () => {
      console.log(`[SpinePortrait #${debugId}] UNMOUNT - char: ${characterId}, remaining: ${mountedPortraits.size - 1}`)
      mountedPortraits.delete(debugId)
      disposed = true
      instanceRef.current?.dispose()
      instanceRef.current = null
    }
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
