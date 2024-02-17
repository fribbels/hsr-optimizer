import React, { useEffect, useState } from 'react'

export const LoadingBlurImage = ({ style, src }) => {
  const [blur, setBlur] = useState(false)
  useEffect(() => {
    setBlur(true)
  }, src)

  return (
    <img
      src={src}
      style={{
        ...style,
        filter: (blur) ? 'blur(20px)' : '',
      }}
      onLoad={() => setTimeout(() => setBlur(false), 500)}
    />
  )
}
