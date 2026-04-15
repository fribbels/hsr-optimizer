import {
  getSkeletonCount,
  getSkeletonFiles,
  getSpineAssetBaseUrl,
} from 'lib/spine/manifest'
import { createSpineInstance } from 'lib/spine/spineEngine'
import type { SpineInstance } from 'lib/spine/spineEngine'
import {
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

  useEffect(() => {
    const canvas = canvasRef.current!
    let disposed = false

    const count = getSkeletonCount(characterId)

    if (count != null) {
      const files = getSkeletonFiles(characterId, count)
      const baseUrl = getSpineAssetBaseUrl(characterId)

      createSpineInstance(canvas, baseUrl, files)
        .then((instance) => {
          if (disposed) {
            instance.dispose()
            return
          }
          instanceRef.current = instance
          onReadyRef.current?.()
        })
        .catch((err) => {
          console.error('SpinePortrait: failed to load', characterId, err)
          if (!disposed) onUnsupportedRef.current?.()
        })
    } else {
      onUnsupportedRef.current?.()
    }

    return () => {
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
