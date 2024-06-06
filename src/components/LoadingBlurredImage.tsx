import React from 'react'

interface LoadingBlurredImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
}

export const LoadingBlurredImage: React.FC<LoadingBlurredImageProps> = ({ src, ...rest }) => {
  const blur = useProgressiveImg(src, src)
  return (
    <img
      {...rest}
      src={src}
      style={{
        ...rest.style,
        filter: blur ? 'blur(10px)' : 'none',
        transition: blur ? '' : 'filter 0.35s ease-in',
      }}
    />
  )
}

const useProgressiveImg = (lowQualitySrc: string, highQualitySrc: string) => {
  const [done, setDone] = React.useState(false)
  React.useEffect(() => {
    setDone(false)
    const img = new Image()
    img.src = highQualitySrc
    img.onload = () => {
      setDone(true)
    }
  }, [lowQualitySrc, highQualitySrc])
  return !done
}
