import {
  type CSSProperties,
  useEffect,
  useRef,
  useState,
} from 'react'

interface LoadingBlurredImageProps {
  src: string
  style: CSSProperties
}

function isImageCached(src: string): boolean {
  const img = new Image()
  img.src = src
  return img.complete && img.naturalWidth > 0
}

export function LoadingBlurredImage({ src, style }: LoadingBlurredImageProps) {
  // Capture the latest style in a ref so the onload callback always applies
  // the position that was current when the image finished loading
  const styleRef = useRef(style)
  styleRef.current = style

  // Initialize without blur if the image is already browser-cached
  const cached = isImageCached(src)
  const [storedSrc, setStoredSrc] = useState<string | undefined>(() =>
    cached ? src : undefined
  )
  const [storedStyle, setStoredStyle] = useState<CSSProperties>(style)
  const [blur, setBlur] = useState<boolean>(() => !cached)

  useEffect(() => {
    // Already loaded this src — nothing to do
    if (src === storedSrc) {
      setStoredStyle(styleRef.current)
      return
    }

    // Check if browser has it cached — skip blur entirely
    if (isImageCached(src)) {
      setStoredSrc(src)
      setStoredStyle(styleRef.current)
      setBlur(false)
      return
    }

    // Not cached — show blur, keep old style/position until new image loads
    setBlur(true)

    const img = new Image()
    img.src = src
    img.onload = () => {
      setStoredSrc(src)
      setStoredStyle(styleRef.current)
      setBlur(false)
    }

    return () => { img.onload = null }
  }, [src])

  // During blur (src transition), freeze position so old image doesn't jump.
  // Otherwise use live style so scoring-type changes recenter immediately.
  const effectiveStyle = blur ? storedStyle : style

  return (
    <img
      src={storedSrc}
      loading='eager'
      style={{
        ...effectiveStyle,
        filter: blur ? 'blur(6px)' : 'none',
        transition: blur ? '' : 'filter 0.35s cubic-bezier(.41,.65,.39,.99)',
      }}
    />
  )
}
