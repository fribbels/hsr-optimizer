import { useEffect, useState } from 'react'
import { CustomImage } from 'types/CharacterCustomImage'

interface CharacterCustomPortraitProps {
  customImage: CustomImage
  parentW: number
  isBlur?: boolean
  setCharacterTabBlur: (val: boolean) => void
}

const CharacterCustomPortrait: React.FC<CharacterCustomPortraitProps> = ({
  customImage,
  parentW,
  isBlur: propIsBlur = false,
  setCharacterTabBlur,
}) => {
  const [isBlur, setIsBlur] = useState(propIsBlur)
  const scaleWidth = parentW / customImage.customImageParams.croppedAreaPixels.width

  // Same imageUrls between characters cause a permanent blur when switching between them
  // This hook handles that behavior
  useEffect(() => {
    if (propIsBlur) {
      setIsBlur(true)
      const timer = setTimeout(() => {
        setIsBlur(false)
        setCharacterTabBlur(false)
      }, 50)
      return () => clearTimeout(timer)
    }
  }, [customImage, propIsBlur, setCharacterTabBlur])

  return (
    <img
      src={customImage.imageUrl}
      style={{
        position: 'absolute',
        left: `-${customImage.customImageParams.croppedAreaPixels.x * scaleWidth}px`,
        top: `-${customImage.customImageParams.croppedAreaPixels.y * scaleWidth}px`,
        width: `${customImage.originalDimensions.width * scaleWidth}px`,
        height: `${customImage.originalDimensions.height * scaleWidth}px`,
        objectFit: 'cover',
        filter: isBlur ? 'blur(20px)' : '',
      }}
    />
  )
}

export default CharacterCustomPortrait
