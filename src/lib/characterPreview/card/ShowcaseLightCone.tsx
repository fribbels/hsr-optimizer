import {
  showcaseShadow,
} from 'lib/characterPreview/CharacterPreviewComponents'
import {
  type ShowcaseDisplayDimensions,
  type ShowcaseMetadata,
} from 'lib/characterPreview/characterPreviewController'
import styles from 'lib/characterPreview/card/ShowcaseLightCone.module.css'
import { StatText } from 'lib/characterPreview/StatText'
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
  setOriginalCharacterModalInitialCharacter?: (c: Character) => void,
  setOriginalCharacterModalOpen?: (b: boolean) => void,
}

export const ShowcaseLightConeSmall = memo(function ShowcaseLightConeSmall({
  character,
  displayDimensions,
  setOriginalCharacterModalInitialCharacter,
  setOriginalCharacterModalOpen,
  showcaseMetadata,
}: ShowcaseLightConeProps) {
  const { t } = useTranslation(['charactersTab', 'modals', 'common'])

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
            {`${t('common:SuperimpositionNShort', { superimposition: lightConeSuperimposition })} - ${lightConeName}`}
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
        }}
        onClick={() => {
          setOriginalCharacterModalInitialCharacter?.(character)
          setOriginalCharacterModalOpen?.(true)
        }}
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

export const ShowcaseLightConeLarge = memo(function ShowcaseLightConeLarge({
  character,
  displayDimensions,
  setOriginalCharacterModalInitialCharacter,
  setOriginalCharacterModalOpen,
  showcaseMetadata,
}: ShowcaseLightConeProps) {
  const {
    tempLcParentW,
    tempLcParentH,
    lcImageOffset,
  } = displayDimensions

  const {
    lightConeSrc,
  } = showcaseMetadata

  const { dy, scale } = computeLcTransform(lcImageOffset, tempLcParentW, tempLcParentH)

  return (
    <div
      className={`lightConeCard ${styles.lcCard}`}
      style={{
        width: `${tempLcParentW}px`,
        height: `${tempLcParentH}px`,
        boxShadow: showcaseShadow,
      }}
      onClick={() => {
        setOriginalCharacterModalInitialCharacter?.(character)
        setOriginalCharacterModalOpen?.(true)
      }}
    >
      <LoadingBlurredImage
        src={lightConeSrc}
        style={{
          width: '100%',
          transform: `translateY(${dy}px) scale(${scale})`,
        }}
      />
    </div>
  )
})

export const ShowcaseLightConeLargeName = memo(function ShowcaseLightConeLargeName({ showcaseMetadata }: {
  showcaseMetadata: ShowcaseMetadata
}) {
  const { t } = useTranslation(['charactersTab', 'modals', 'common'])

  const {
    lightConeName,
    lightConeLevel,
    lightConeSuperimposition,
  } = showcaseMetadata

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <StatText className={styles.lcNameText}>
        {lightConeName}
      </StatText>
      <StatText className={styles.lcLevelText}>
        {
          `${t('common:LevelShort', { level: lightConeLevel })} ${t('common:SuperimpositionNShort', { superimposition: lightConeSuperimposition })}`
          /* Lv 80 S5 */
        }
      </StatText>
    </div>
  )
})
