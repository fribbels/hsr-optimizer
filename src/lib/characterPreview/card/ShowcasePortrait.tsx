import { IconEdit } from '@tabler/icons-react'
import { Button } from '@mantine/core'
import { CharacterCustomPortrait } from 'lib/characterPreview/card/CharacterCustomPortrait'
import {
  showcaseButtonStyle,
  showcaseShadow,
  ShowcaseSource,
} from 'lib/characterPreview/CharacterPreviewComponents'
import { type ShowcaseDisplayDimensions } from 'lib/characterPreview/characterPreviewController'
import styles from 'lib/characterPreview/card/ShowcasePortrait.module.css'
import {
  parentH,
  parentW,
} from 'lib/constants/constantsUi'
import { EditImageModal } from 'lib/overlays/modals/EditImageModal'
import { Assets } from 'lib/rendering/assets'
import { type ScoringType } from 'lib/scoring/simScoringUtils'
import { LoadingBlurredSpine } from 'lib/spine/LoadingBlurredSpine'
import { getSkeletonCount } from 'lib/spine/manifest'
import { useShowcaseTabStore } from 'lib/tabs/tabShowcase/useShowcaseTabStore'
import { LoadingBlurredImage } from 'lib/ui/LoadingBlurredImage'
import { memo, useCallback, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { type Character } from 'types/character'
import {
  type CustomImageConfig,
  type CustomImagePayload,
} from 'types/customImage'
import { useGlobalStore } from 'lib/stores/app/appStore'

export const ShowcasePortrait = memo(function ShowcasePortrait({
  source,
  character,
  scoringType,
  displayDimensions,
  customPortrait,
  editPortraitModalOpen,
  setEditPortraitModalOpen,
  onEditPortraitOk,
  artistName,
  setOriginalCharacterModalInitialCharacter,
  setOriginalCharacterModalOpen,
}: {
  source: ShowcaseSource
  character: Character
  scoringType: ScoringType
  displayDimensions: ShowcaseDisplayDimensions
  customPortrait: CustomImageConfig | undefined
  editPortraitModalOpen: boolean
  setEditPortraitModalOpen: (b: boolean) => void
  onEditPortraitOk: (p: CustomImagePayload) => void
  artistName: string | undefined
  setOriginalCharacterModalInitialCharacter: (c: Character) => void
  setOriginalCharacterModalOpen: (b: boolean) => void
}) {
  const { t } = useTranslation(['charactersTab', 'modals', 'common'])
  const showcaseUID = useGlobalStore((s) => s.savedSession.showcaseUID)
  const uid = useShowcaseTabStore((s) => s.savedSession.scorerId)

  const prevCharIdRef = useRef(character.id)
  const [spineFallback, setSpineFallback] = useState(false)
  const handleSpineUnsupported = useCallback(() => setSpineFallback(true), [])

  // Reset synchronously during render when character changes — avoids a
  // useEffect race where the parent reset would run after the child's
  // onUnsupported callback, preventing fallback from ever taking effect.
  if (prevCharIdRef.current !== character.id) {
    prevCharIdRef.current = character.id
    if (spineFallback) {
      setSpineFallback(false)
    }
  }

  const showUid = source === ShowcaseSource.SHOWCASE_TAB && showcaseUID

  const {
    tempInnerW,
    tempParentH,
    charCenter,
    spineCenter,
    disableSpine,
  } = displayDimensions

  const portraitStyle = {
    position: 'absolute' as const,
    left: -charCenter.x * charCenter.z / 2 * tempInnerW / 1024 + parentW / 2,
    top: -charCenter.y * charCenter.z / 2 * tempInnerW / 1024 + tempParentH / 2,
    width: tempInnerW * charCenter.z,
  }

  const spinePortraitStyle = {
    position: 'absolute' as const,
    left: -spineCenter.x * spineCenter.z / 2 * tempInnerW / 1024 + parentW / 2,
    top: -spineCenter.y * spineCenter.z / 2 * tempInnerW / 1024 + tempParentH / 2,
    width: tempInnerW * spineCenter.z,
  }

  const hasCustomPortrait = !!(character.portrait ?? customPortrait)
  const hasSpineData = getSkeletonCount(character.id) != null
  const useSpine = hasSpineData && !disableSpine && !spineFallback && !hasCustomPortrait

  return (
    <div
      className={styles.portraitContainer}
      style={{
        width: `${parentW}px`,
        height: `${tempParentH}px`,
        boxShadow: showcaseShadow,
      }}
    >
      {useSpine
        ? (
          <LoadingBlurredSpine
            characterId={character.id}
            style={spinePortraitStyle}
            onUnsupported={handleSpineUnsupported}
          />
        )
        : (character.portrait ?? customPortrait)
          ? (
            <CharacterCustomPortrait
              customPortrait={customPortrait ?? character.portrait!}
              parentW={parentW}
              scoringType={scoringType}
            />
          )
          : (
            <LoadingBlurredImage
              src={Assets.getCharacterPortraitById(character.id)}
              style={portraitStyle}
            />
          )}

      <div className={styles.buttonColumn} style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        {source !== ShowcaseSource.BUILDS_MODAL && (
          <>
            <Button
              style={showcaseButtonStyle}
              className='character-build-portrait-button'
              leftSection={<IconEdit size={16} />}
              onClick={() => {
                setOriginalCharacterModalInitialCharacter(character)
                setOriginalCharacterModalOpen(true)
              }}
            >
              {t('CharacterPreview.EditCharacter') /* Edit character */}
            </Button>
            <Button
              style={showcaseButtonStyle}
              className='character-build-portrait-button'
              leftSection={<IconEdit size={16} />}
              onClick={() => setEditPortraitModalOpen(true)}
            >
              {t('CharacterPreview.EditPortrait') /* Edit portrait */}
            </Button>
          </>
        )}
      </div>
      {editPortraitModalOpen && (
        <EditImageModal
          title={t('CharacterPreview.EditPortrait') /* Edit portrait */}
          aspectRatio={parentW / parentH}
          existingConfig={customPortrait ?? character.portrait}
          open={editPortraitModalOpen}
          setOpen={setEditPortraitModalOpen}
          onOk={onEditPortraitOk}
          defaultImageUrl={Assets.getCharacterPortraitById(character.id)}
          width={500}
        />
      )}
      <div
        className={styles.bottomInfoContainer}
        style={{ display: 'flex', flexDirection: 'column', gap: 3 }}
      >
        <span
          className={styles.overlayTag}
          style={{
            display: showUid ? 'inline' : 'none',
            maxWidth: parentW - 150,
          }}
        >
          {uid}
        </span>
        <span
          className={styles.overlayTag}
          style={{
            display: artistName ? 'inline' : 'none',
            maxWidth: parentW - 150,
          }}
        >
          {t('CharacterPreview.ArtBy', { artistName: artistName ?? '' }) /* Art by {{artistName}} */}
        </span>
      </div>
    </div>
  )
})
