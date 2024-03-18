import { useEffect, useState } from 'react'
import { CustomImageConfig } from 'types/CustomImage'

interface CharacterCustomPortraitProps {
  customPortrait: CustomImageConfig
  parentW: number
  isBlur?: boolean
  setBlur: (_x: boolean) => void
}

const CharacterCustomPortrait: React.FC<CharacterCustomPortraitProps> = ({
  customPortrait,
  parentW,
  isBlur = false,
  setBlur,
}) => {
  const [isCurrentBlur, setIsCurrentBlur] = useState(isBlur)
  const scaleWidth = parentW / customPortrait.customImageParams.croppedAreaPixels.width

  // Same imageUrls between instances of CharacterCustomPortrait
  // cause a permanent blur when switching between them
  // This hook handles that behavior
  useEffect(() => {
    if (isBlur) {
      setIsCurrentBlur(true)
      const timer = setTimeout(() => {
        setIsCurrentBlur(false)
        setBlur(false)
      }, 50)
      return () => clearTimeout(timer)
    }
  }, [customPortrait, isBlur, setBlur])

  return (
    <img
      src={customPortrait.imageUrl}
      style={{
        position: 'absolute',
        left: `-${customPortrait.customImageParams.croppedAreaPixels.x * scaleWidth}px`,
        top: `-${customPortrait.customImageParams.croppedAreaPixels.y * scaleWidth}px`,
        width: `${customPortrait.originalDimensions.width * scaleWidth}px`,
        height: `${customPortrait.originalDimensions.height * scaleWidth}px`,
        objectFit: 'cover',
        filter: isCurrentBlur ? 'blur(20px)' : '',
      }}
    />
  )
}

export default CharacterCustomPortrait
