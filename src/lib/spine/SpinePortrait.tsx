import { CSSProperties, useEffect, useRef } from 'react'
import { CharacterId } from 'types/character'
import { getSkeletonName } from './manifest'
import { createSpineInstance, SpineInstance } from './spineEngine'

const CANVAS_SIZE = 2048

export function SpinePortrait({
  characterId,
  cdnBase,
  style,
  onUnsupported,
}: {
  characterId: CharacterId
  cdnBase: string
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
        const skeletonName = await getSkeletonName(characterId, cdnBase)

        if (!skeletonName) {
          if (!disposed) onUnsupportedRef.current?.()
          return
        }

        if (disposed) return

        const instance = await createSpineInstance(canvas, skeletonName, {
          cdnBase,
          characterId,
        })

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
  }, [characterId, cdnBase])

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_SIZE}
      height={CANVAS_SIZE}
      style={style}
    />
  )
}
