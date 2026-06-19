import {
  type CSSProperties,
  useEffect,
  useRef,
  useState,
} from 'react'

interface LoadingBlurredImageProps {
  src: string
  style: CSSProperties
  className?: string
}

function isImageCached(src: string): boolean {
  const img = new Image()
  img.src = src
  return img.complete && img.naturalWidth > 0
}

export function LoadingBlurredImage({ src, style, className }: LoadingBlurredImageProps) {
  // Capture the latest style in a ref so the onload callback always applies
  // the position that was current when the image finished loading
  const styleRef = useRef(style)
  styleRef.current = style

  // Initialize without blur if the image is already browser-cached
  const cached = isImageCached(src)
  const [storedSrc, setStoredSrc] = useState<string | undefined>(() => cached ? src : undefined)
  const [storedStyle, setStoredStyle] = useState<CSSProperties>(style)
  const [blur, setBlur] = useState<boolean>(() => !cached)

  // Synchronous state adjustment during render — useEffect runs after paint,
  // so without this the old image renders at the new position for one frame.
  if (src !== storedSrc) {
    if (isImageCached(src)) {
      setStoredSrc(src)
      setStoredStyle(style)
      setBlur(false)
    } else if (!blur) {
      setBlur(true)
    }
  }

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

    // Not cached — load in background, blur already set by render-time check
    const img = new Image()
    img.src = src
    img.onload = () => {
      setStoredSrc(src)
      setStoredStyle(styleRef.current)
      setBlur(false)
    }

    return () => {
      img.onload = null
    }
  }, [src]) // eslint-disable-line react-hooks/exhaustive-deps

  // During blur (src transition), freeze position so old image doesn't jump.
  // Otherwise use live style so scoring-type changes recenter immediately.
  const effectiveStyle = blur ? storedStyle : style

  return (
    <img
      src={storedSrc}
      loading='eager'
      className={className}
      style={{
        ...effectiveStyle,
        filter: blur ? 'blur(6px)' : 'none',
        transition: blur ? '' : 'filter 0.35s cubic-bezier(.41,.65,.39,.99)',
      }}
    />
  )
}
