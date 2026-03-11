import { Flex, Text } from '@mantine/core'
import {
  showcaseShadow,
} from 'lib/characterPreview/CharacterPreviewComponents'
import {
  ShowcaseDisplayDimensions,
  ShowcaseMetadata,
} from 'lib/characterPreview/characterPreviewController'
import styles from 'lib/characterPreview/ShowcaseLightCone.module.css'
import StatText, { StatTextEllipses } from 'lib/characterPreview/StatText'
import { parentW } from 'lib/constants/constantsUi'
import { computeLcTransform } from 'lib/rendering/lcImageTransform'
import { LoadingBlurredImage } from 'lib/ui/LoadingBlurredImage'
import { useTranslation } from 'react-i18next'
import { Character } from 'types/character'

type ShowcaseLightConeProps = {
  character: Character,
  displayDimensions: ShowcaseDisplayDimensions,
  showcaseMetadata: ShowcaseMetadata,
  setOriginalCharacterModalInitialCharacter?: (c: Character) => void,
  setOriginalCharacterModalOpen?: (b: boolean) => void,
}

export function ShowcaseLightConeSmall(props: ShowcaseLightConeProps) {
  const { t } = useTranslation(['charactersTab', 'modals', 'common'])

  const {
    character,
    displayDimensions,
    setOriginalCharacterModalInitialCharacter,
    setOriginalCharacterModalOpen,
    showcaseMetadata,
  } = props

  const {
    tempLcParentW,
    tempLcParentH,
    newLcHeight,
    lcImageOffset,
  } = displayDimensions

  const {
    lightConeSrc,
    lightConeName,
    lightConeLevel,
    lightConeSuperimposition,
  } = showcaseMetadata

  const { dy, scale } = computeLcTransform(lcImageOffset, tempLcParentW, tempLcParentH)

  return (
    <Flex direction="column">
      {lightConeName && (
        <Flex
          direction="column"
          style={{
            position: 'relative',
            height: 0,
            top: newLcHeight - 35,
            paddingRight: 5,
          }}
          align='flex-end'
        >
          <Text
            className={styles.lcNameOverlay}
            style={{
              maxWidth: parentW - 50,
              boxShadow: showcaseShadow,
            }}
          >
            {`${t('common:SuperimpositionNShort', { superimposition: lightConeSuperimposition })} - ${lightConeName}`}
          </Text>
        </Flex>
      )}
      <Flex
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
      </Flex>
    </Flex>
  )
}

export function ShowcaseLightConeLarge(props: ShowcaseLightConeProps) {
  const { t } = useTranslation(['charactersTab', 'modals', 'common'])

  const {
    character,
    displayDimensions,
    setOriginalCharacterModalInitialCharacter,
    setOriginalCharacterModalOpen,
    showcaseMetadata,
  } = props

  const {
    tempLcParentW,
    tempLcParentH,
    lcImageOffset,
  } = displayDimensions

  const {
    lightConeSrc,
    lightConeName,
    lightConeLevel,
    lightConeSuperimposition,
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
}

export function ShowcaseLightConeLargeName(props: {
  showcaseMetadata: ShowcaseMetadata,
}) {
  const { t } = useTranslation(['charactersTab', 'modals', 'common'])

  const {
    showcaseMetadata,
  } = props

  const {
    lightConeSrc,
    lightConeName,
    lightConeLevel,
    lightConeSuperimposition,
  } = showcaseMetadata

  return (
    <Flex direction="column">
      <StatTextEllipses className={styles.lcNameText}>
        {`${lightConeName}`}
      </StatTextEllipses>
      <StatText className={styles.lcLevelText}>
        {
          `${t('common:LevelShort', { level: lightConeLevel })} ${t('common:SuperimpositionNShort', { superimposition: lightConeSuperimposition })}`
          /* Lv 80 S5 */
        }
      </StatText>
    </Flex>
  )
}
