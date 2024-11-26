import { TsUtils } from 'lib/utils/TsUtils'
import React, { useEffect, useState } from 'react'

interface LoadingBlurredImageProps extends React.ImgHTMLAttributes<string> {
  src: string
  style: React.CSSProperties
  callback?: (img: string) => void
}

type ImageProperties = {
  src: string
  style: React.CSSProperties
}

export const LoadingBlurredImage: React.FC<LoadingBlurredImageProps> = ({ src, style, callback }) => {
  // @ts-ignore
  const [storedImg, setStoredImg] = useState<ImageProperties>({})
  // @ts-ignore
  const [pendingImage, setPendingImage] = useState<ImageProperties>({})

  const [finishedLoading, setFinishedLoading] = useState<boolean>(false)
  const [blur, setBlur] = useState<boolean>(true)

  useEffect(() => {
    if (src == storedImg.src && TsUtils.objectHash(style) == TsUtils.objectHash(storedImg.style)) {
      // Do nothing as its already loaded
      return
    }

    if (src == pendingImage.src && TsUtils.objectHash(style) == TsUtils.objectHash(pendingImage.style)) {
      // Do nothing as its already pending
      return
    }

    setBlur(true)
    setPendingImage({
      src: src,
      style: style,
    })

    const img = new Image()
    img.src = src

    if (img.complete || img.naturalWidth > 0) {
      // Pulled from cache
      setFinishedLoading(true)
      return
    }

    setFinishedLoading(false)

    // We have to load the pending image before it can be stored
    img.onload = () => {
      setFinishedLoading(true)
    }
  }, [storedImg, src, style])

  useEffect(() => {
    if (finishedLoading) {
      setTimeout(() => {
        setBlur(false)
      }, 150)

      setStoredImg({
        src: pendingImage.src,
        style: pendingImage.style,
      })

      setFinishedLoading(false)

      if (callback) {
        callback(pendingImage.src)
      }
    }
  }, [finishedLoading])

  return (
    <img
      src={storedImg.src}
      loading='eager'
      style={{
        ...storedImg.style,
        filter: blur ? 'blur(6px)' : 'none',
        transition: blur ? '' : 'filter 0.5s cubic-bezier(.41,.65,.39,.99)',
      }}
    />
  )
}
