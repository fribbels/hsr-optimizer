import { CSSProperties, useEffect, useRef } from 'react'
import { CharacterId } from 'types/character'
import { getSkeletonCount, getSkeletonFiles, getSpineAssetBaseUrl } from './manifest'
import { createSpineInstance, SpineInstance } from './spineEngine'

const CANVAS_SIZE = 2048

export function SpinePortrait({
  characterId,
  style,
  onUnsupported,
}: {
  characterId: CharacterId
  style?: CSSProperties
  onUnsupported?: () => void
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const instanceRef = useRef<SpineInstance | null>(null)
  const onUnsupportedRef = useRef(onUnsupported)
  onUnsupportedRef.current = onUnsupported

  useEffect(() => {
    const canvas = canvasRef.current!
    let disposed = false

    async function init() {
      try {
        const count = await getSkeletonCount(characterId)

        if (count == null) {
          if (!disposed) onUnsupportedRef.current?.()
          return
        }

        if (disposed) return

        const files = getSkeletonFiles(characterId, count)
        const baseUrl = getSpineAssetBaseUrl(characterId)

        const instance = await createSpineInstance(canvas, baseUrl, files)

        if (disposed) {
          instance.dispose()
          return
        }

        instanceRef.current = instance
      } catch (err) {
        console.error('SpinePortrait: failed to load', characterId, err)
        if (!disposed) onUnsupportedRef.current?.()
      }
    }

    init()

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
