import { TsUtils } from 'lib/utils/TsUtils'
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

type ImageProperties = {
  src: string
  styleHash: string
}

function isImageCached(src: string): boolean {
  const img = new Image()
  img.src = src
  return img.complete && img.naturalWidth > 0
}

export function LoadingBlurredImage({ src, style, callback }: LoadingBlurredImageProps) {
  const styleHash = TsUtils.objectHash(style)
  const callbackRef = useRef(callback)
  callbackRef.current = callback

  // Initialize without blur if the image is already browser-cached
  const [storedImg, setStoredImg] = useState<ImageProperties | undefined>(() =>
    isImageCached(src) ? { src, styleHash } : undefined
  )
  const [blur, setBlur] = useState<boolean>(() => !storedImg)

  useEffect(() => {
    // Already stored with same src+style — nothing to do
    if (src === storedImg?.src && styleHash === storedImg?.styleHash) {
      return
    }

    // Check if browser has it cached — skip blur entirely
    if (isImageCached(src)) {
      setStoredImg({ src, styleHash })
      setBlur(false)
      callbackRef.current?.(src)
      return
    }

    // Not cached — show blur and load
    setBlur(true)

    const img = new Image()
    img.src = src
    img.onload = () => {
      setStoredImg({ src, styleHash })
      setBlur(false)
      callbackRef.current?.(src)
    }

    return () => { img.onload = null }
  }, [src, styleHash])

  return (
    <img
      src={storedImg?.src}
      loading='eager'
      style={{
        ...style,
        filter: blur ? 'blur(6px)' : 'none',
        transition: blur ? '' : 'filter 0.35s cubic-bezier(.41,.65,.39,.99)',
      }}
    />
  )
}
