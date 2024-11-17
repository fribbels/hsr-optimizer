import { EditOutlined } from '@ant-design/icons'
import { Button, Flex, Typography } from 'antd'
import CharacterCustomPortrait from 'lib/characterPreview/CharacterCustomPortrait'
import { showcaseButtonStyle, showcaseDropShadowFilter, showcaseOutline, ShowcaseSource } from 'lib/characterPreview/CharacterPreviewComponents'
import { ShowcaseDisplayDimensions } from 'lib/characterPreview/characterPreviewController'
import { parentH, parentW } from 'lib/constants/constantsUi'
import EditImageModal from 'lib/overlays/modals/EditImageModal'
import { Assets } from 'lib/rendering/assets'
import { SimulationScore } from 'lib/scoring/characterScorer'
import { LoadingBlurredImage } from 'lib/ui/LoadingBlurredImage'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Character } from 'types/character'
import { CustomImageConfig, CustomImagePayload } from 'types/customImage'

const { Text } = Typography

export function ShowcasePortraitLarge() {

}

export function ShowcasePortrait(props: {
  source: ShowcaseSource,
  character: Character,
  displayDimensions: ShowcaseDisplayDimensions,
  customPortrait: CustomImageConfig | undefined
  editPortraitModalOpen: boolean
  setEditPortraitModalOpen: (b: boolean) => void
  onEditPortraitOk: (p: CustomImagePayload) => void
  simScoringResult: SimulationScore
  artistName: string | undefined,
  setOriginalCharacterModalInitialCharacter: (c: Character) => void,
  setOriginalCharacterModalOpen: (b: boolean) => void,
  setCharacterModalAdd: (b: boolean) => void,
}) {
  const { t } = useTranslation(['charactersTab', 'modals', 'common'])

  const {
    source,
    character,
    displayDimensions,
    customPortrait,
    editPortraitModalOpen,
    setEditPortraitModalOpen,
    onEditPortraitOk,
    simScoringResult,
    artistName,
    setOriginalCharacterModalInitialCharacter,
    setOriginalCharacterModalOpen,
    setCharacterModalAdd,
  } = props

  const {
    tempLcParentW,
    tempLcParentH,
    tempLcInnerW,
    tempLcInnerH,
    tempInnerW,
    tempParentH,
    newLcHeight,
    newLcMargin,
    lcCenter,
    charCenter,
  } = displayDimensions

  return (
    <div
      style={{
        width: `${parentW}px`,
        height: `${tempParentH}px`,
        overflow: 'hidden',
        borderRadius: '8px',
        outline: showcaseOutline,
        filter: showcaseDropShadowFilter,
        position: 'relative',
      }}
    >
      {
        (character.portrait || customPortrait)
          ? (
            <CharacterCustomPortrait
              customPortrait={customPortrait ?? character.portrait!}
              parentW={parentW}
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
            />
          )
      }
      <Flex vertical style={{ width: 'max-content', marginLeft: 6, marginTop: 6 }} gap={7}>
        {source != ShowcaseSource.SHOWCASE_TAB && (
          <Button
            style={showcaseButtonStyle}
            className='character-build-portrait-button'
            icon={<EditOutlined/>}
            onClick={() => {
              setCharacterModalAdd(false)
              setOriginalCharacterModalInitialCharacter(character)
              setOriginalCharacterModalOpen(true)
            }}
            type='primary'
          >
            {t('CharacterPreview.EditCharacter')/* Edit character */}
          </Button>
        )}
        {source == ShowcaseSource.SHOWCASE_TAB && (
          <Button
            style={showcaseButtonStyle}
            className='character-build-portrait-button'
            icon={<EditOutlined/>}
            onClick={() => {
              setOriginalCharacterModalInitialCharacter(character)
              setOriginalCharacterModalOpen(true)
            }}
            type='primary'
          >
            {t('CharacterPreview.EditCharacter')/* Edit character */}
          </Button>
        )}
        <Button
          style={showcaseButtonStyle}
          className='character-build-portrait-button'
          icon={<EditOutlined/>}
          onClick={() => setEditPortraitModalOpen(true)}
          type='primary'
        >
          {t('CharacterPreview.EditPortrait')/* Edit portrait */}
        </Button>
      </Flex>
      <EditImageModal
        title={t('CharacterPreview.EditPortrait')/* Edit portrait */}
        aspectRatio={parentW / parentH}
        existingConfig={customPortrait ?? character.portrait}
        open={editPortraitModalOpen}
        setOpen={setEditPortraitModalOpen}
        onOk={onEditPortraitOk}
        defaultImageUrl={Assets.getCharacterPortraitById(character.id)}
        width={500}
      />
      <Flex
        vertical
        style={{
          position: 'relative',
          top: simScoringResult ? tempParentH - 118 : tempParentH - 111,
          height: 34,
          paddingLeft: 4,
          display: artistName ? 'flex' : 'none',
        }}
        align='flex-start'
      >
        <Text
          style={{
            backgroundColor: 'rgb(0 0 0 / 40%)',
            padding: '4px 12px',
            borderRadius: 8,
            fontSize: 14,
            maxWidth: parentW - 150,
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            zIndex: 2,
            textShadow: '0px 0px 10px black',
          }}
        >
          {t('CharacterPreview.ArtBy', { artistName: artistName || '' })/* Art by {{artistName}} */}
        </Text>
      </Flex>
    </div>
  )
}
