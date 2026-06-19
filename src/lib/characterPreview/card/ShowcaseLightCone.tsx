import styles from 'lib/characterPreview/card/ShowcaseLightCone.module.css'
import {
  ShowcaseSource,
  showcaseShadow,
} from 'lib/characterPreview/CharacterPreviewComponents'
import {
  type ShowcaseDisplayDimensions,
  type ShowcaseMetadata,
} from 'lib/characterPreview/characterPreviewController'
import { parentW } from 'lib/constants/constantsUi'
import { computeLcTransform } from 'lib/rendering/lcImageTransform'
import { LoadingBlurredImage } from 'lib/ui/LoadingBlurredImage'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { type Character } from 'types/character'

type ShowcaseLightConeProps = {
  character: Character,
  displayDimensions: ShowcaseDisplayDimensions,
  showcaseMetadata: ShowcaseMetadata,
  source?: ShowcaseSource,
  setOriginalCharacterModalInitialCharacter?: (c: Character) => void,
  setOriginalCharacterModalOpen?: (b: boolean) => void,
}

export const ShowcaseLightConeSmall = memo(function ShowcaseLightConeSmall({
  character,
  displayDimensions,
  setOriginalCharacterModalInitialCharacter,
  setOriginalCharacterModalOpen,
  showcaseMetadata,
  source,
}: ShowcaseLightConeProps) {
  const { t } = useTranslation('common')

  const {
    tempLcParentW,
    tempLcParentH,
    newLcHeight,
    lcImageOffset,
  } = displayDimensions

  const {
    lightConeSrc,
    lightConeName,
    lightConeSuperimposition,
  } = showcaseMetadata

  const { dy, scale } = computeLcTransform(lcImageOffset, tempLcParentW, tempLcParentH)

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {lightConeName && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            position: 'relative',
            height: 0,
            top: newLcHeight - 35,
            paddingRight: 5,
          }}
        >
          <div
            className={styles.lcNameOverlay}
            style={{
              maxWidth: parentW - 50,
              boxShadow: showcaseShadow,
            }}
          >
            {`${t('SuperimpositionNShort', { superimposition: lightConeSuperimposition })} - ${lightConeName}`}
          </div>
        </div>
      )}
      <div
        className={`lightConeCard ${styles.lcCard}`}
        style={{
          display: 'flex',
          width: `${tempLcParentW}px`,
          height: `${tempLcParentH}px`,
          boxShadow: showcaseShadow,
          cursor: source === ShowcaseSource.LEADERBOARD ? 'default' : undefined,
        }}
        onClick={source !== ShowcaseSource.LEADERBOARD
          ? () => {
            setOriginalCharacterModalInitialCharacter?.(character)
            setOriginalCharacterModalOpen?.(true)
          }
          : undefined}
      >
        <LoadingBlurredImage
          src={lightConeSrc}
          style={{
            width: '100%',
            transform: `translateY(${dy}px) scale(${scale})`,
          }}
        />
      </div>
    </div>
  )
})

