import { IconEdit } from '@tabler/icons-react'
import { Button, Flex } from '@mantine/core'
import CharacterCustomPortrait from 'lib/characterPreview/CharacterCustomPortrait'
import {
  showcaseButtonStyle,
  showcaseShadow,
  ShowcaseSource,
} from 'lib/characterPreview/CharacterPreviewComponents'
import { ShowcaseDisplayDimensions } from 'lib/characterPreview/characterPreviewController'
import styles from 'lib/characterPreview/ShowcasePortrait.module.css'
import {
  parentH,
  parentW,
} from 'lib/constants/constantsUi'
import EditImageModal from 'lib/overlays/modals/EditImageModal'
import { Assets } from 'lib/rendering/assets'
import { ScoringType } from 'lib/scoring/simScoringUtils'
import { useShowcaseTabStore } from 'lib/tabs/tabShowcase/useShowcaseTabStore'
import { LoadingBlurredImage } from 'lib/ui/LoadingBlurredImage'
import { useTranslation } from 'react-i18next'
import { Character } from 'types/character'
import {
  CustomImageConfig,
  CustomImagePayload,
} from 'types/customImage'
import { useGlobalStore } from 'lib/state/db'

export function ShowcasePortrait(props: {
  source: ShowcaseSource,
  character: Character,
  scoringType: ScoringType,
  displayDimensions: ShowcaseDisplayDimensions,
  customPortrait: CustomImageConfig | undefined,
  editPortraitModalOpen: boolean,
  setEditPortraitModalOpen: (b: boolean) => void,
  onEditPortraitOk: (p: CustomImagePayload) => void,
  artistName: string | undefined,
  setOriginalCharacterModalInitialCharacter: (c: Character) => void,
  setOriginalCharacterModalOpen: (b: boolean) => void,
  onPortraitLoad: (img: string) => void,
}) {
  const { t } = useTranslation(['charactersTab', 'modals', 'common'])
  const showcaseUID = useGlobalStore((s) => s.savedSession.showcaseUID)
  const uid = useShowcaseTabStore((s) => s.savedSession.scorerId)

  const showUid = props.source == ShowcaseSource.SHOWCASE_TAB && showcaseUID

  const {
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
    onPortraitLoad,
  } = props

  const {
    tempInnerW,
    tempParentH,
    newLcHeight,
    newLcMargin,
    charCenter,
  } = displayDimensions

  return (
    <div
      className={styles.portraitContainer}
      style={{
        width: `${parentW}px`,
        height: `${tempParentH}px`,
        boxShadow: showcaseShadow,
      }}
    >
      {(character.portrait ?? customPortrait)
        ? (
          <CharacterCustomPortrait
            customPortrait={customPortrait ?? character.portrait!}
            parentW={parentW}
            scoringType={scoringType}
            onPortraitLoad={onPortraitLoad}
          />
        )
        : (
          <LoadingBlurredImage
            src={Assets.getCharacterPortraitById(character.id)}
            style={{
              position: 'absolute',
              left: -charCenter.x * charCenter.z / 2 * tempInnerW / 1024 + parentW / 2,
              top: -charCenter.y * charCenter.z / 2 * tempInnerW / 1024 + tempParentH / 2,
              width: tempInnerW * charCenter.z,
            }}
            callback={onPortraitLoad}
          />
        )}

      <Flex direction="column" className={styles.buttonColumn} gap={7}>
        {source != ShowcaseSource.BUILDS_MODAL && (
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
      </Flex>
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
      <Flex
        direction="column"
        gap={3}
        className={styles.bottomInfoContainer}
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
      </Flex>
    </div>
  )
}
