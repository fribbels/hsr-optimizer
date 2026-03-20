import {
  type CSSProperties,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import type { CharacterId } from 'types/character'
import { SpinePortrait } from 'lib/spine/SpinePortrait'

export function LoadingBlurredSpine({
  characterId,
  style,
  onUnsupported,
}: {
  characterId: CharacterId
  style: CSSProperties
  onUnsupported?: () => void
}) {
  // Capture the latest style/characterId in refs so async callbacks
  // always read the values current at the time they fire
  const styleRef = useRef(style)
  styleRef.current = style
  const charIdRef = useRef(characterId)
  charIdRef.current = characterId

  // Track which characterId has finished loading
  const loadedCharIdRef = useRef<CharacterId | null>(null)

  const [storedStyle, setStoredStyle] = useState<CSSProperties>(style)
  const [blur, setBlur] = useState(true)

  useEffect(() => {
    if (characterId === loadedCharIdRef.current) {
      // Same character already loaded — just pass through style updates
      setStoredStyle(styleRef.current)
      return
    }

    // New character — freeze style at current position, show blur
    setBlur(true)
  }, [characterId])

  const handleReady = useCallback(() => {
    loadedCharIdRef.current = charIdRef.current
    setStoredStyle(styleRef.current)
    setBlur(false)
  }, [])

  return (
    <SpinePortrait
      characterId={characterId}
      style={{
        ...storedStyle,
        filter: blur ? 'blur(6px)' : 'none',
        transition: blur ? '' : 'filter 0.35s cubic-bezier(.41,.65,.39,.99)',
      }}
      onReady={handleReady}
      onUnsupported={onUnsupported}
    />
  )
}
