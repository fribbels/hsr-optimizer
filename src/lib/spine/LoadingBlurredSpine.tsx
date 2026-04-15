import { SpinePortrait } from 'lib/spine/SpinePortrait'
import {
  type CSSProperties,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import type { CharacterId } from 'types/character'

const BLUR_OUT_MS = 1000
const BLUR_PX = 8.5
const BLUR_CURVE = 'cubic-bezier(0.1,0.2,0.5,1)'

export function LoadingBlurredSpine({
  characterId,
  style,
  onUnsupported,
}: {
  characterId: CharacterId,
  style: CSSProperties,
  onUnsupported?: () => void,
}) {
  const styleRef = useRef(style)
  styleRef.current = style
  const charIdRef = useRef(characterId)
  charIdRef.current = characterId

  const loadedCharIdRef = useRef<CharacterId | null>(null)

  const [storedStyle, setStoredStyle] = useState<CSSProperties>(style)
  const [blur, setBlur] = useState(true)

  useEffect(() => {
    if (characterId === loadedCharIdRef.current) {
      setStoredStyle(styleRef.current)
      return
    }

    setBlur(true)
  }, [characterId])

  const handleReady = useCallback(() => {
    loadedCharIdRef.current = charIdRef.current
    setStoredStyle(styleRef.current)
    setBlur(false)
  }, [])

  // During blur (character transition), freeze position so old spine doesn't jump.
  // Otherwise use live style so scoring-type changes recenter immediately.
  const effectiveStyle = blur ? storedStyle : style

  return (
    <SpinePortrait
      characterId={characterId}
      style={{
        ...effectiveStyle,
        filter: blur ? `blur(${BLUR_PX}px)` : 'none',
        transition: blur ? '' : `filter ${BLUR_OUT_MS}ms ${BLUR_CURVE}`,
      }}
      onReady={handleReady}
      onUnsupported={onUnsupported}
    />
  )
}
