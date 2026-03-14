import {
  CSSProperties,
  useEffect,
  useRef,
  useState,
} from 'react'

interface LoadingBlurredImageProps {
  src: string
  style: CSSProperties
  callback?: (img: string) => void
}

function isImageCached(src: string): boolean {
  const img = new Image()
  img.src = src
  return img.complete && img.naturalWidth > 0
}

export function LoadingBlurredImage({ src, style, callback }: LoadingBlurredImageProps) {
  const callbackRef = useRef(callback)
  callbackRef.current = callback

  // Initialize without blur if the image is already browser-cached
  const [storedSrc, setStoredSrc] = useState<string | undefined>(() =>
    isImageCached(src) ? src : undefined
  )
  const [blur, setBlur] = useState<boolean>(() => !storedSrc)

  useEffect(() => {
    // Already loaded this src — nothing to do
    if (src === storedSrc) {
      return
    }

    // Check if browser has it cached — skip blur entirely
    if (isImageCached(src)) {
      setStoredSrc(src)
      setBlur(false)
      callbackRef.current?.(src)
      return
    }

    // Not cached — show blur and load
    setBlur(true)

    const img = new Image()
    img.src = src
    img.onload = () => {
      setStoredSrc(src)
      setBlur(false)
      callbackRef.current?.(src)
    }

    return () => { img.onload = null }
  }, [src])

  return (
    <img
      src={storedSrc}
      loading='eager'
      style={{
        ...style,
        filter: blur ? 'blur(6px)' : 'none',
        transition: blur ? '' : 'filter 0.35s cubic-bezier(.41,.65,.39,.99)',
      }}
    />
  )
}
