import { Flex } from 'antd'
import { memo } from 'react'
import { HeaderText } from 'components/HeaderText.jsx'
import { TooltipImage } from 'components/TooltipImage.jsx'
import { Hint } from 'lib/hint.jsx'
import DisplayFormControl from 'components/optimizerTab/conditionals/DisplayFormControl'
import { characterOptionMapping } from 'lib/characterConditionals.js'
import { Eidolon } from 'types/Character'
import { DataMineId } from 'types/Common'
import { useTranslation } from 'react-i18next'

export interface CharacterConditionalDisplayProps {
  id?: DataMineId
  eidolon: Eidolon
  teammateIndex?: number
}

export const CharacterConditionalDisplay = memo(({ id, eidolon, teammateIndex }: CharacterConditionalDisplayProps) => {
  const { t } = useTranslation('optimizerTab')
  // console.log('getDisplayForCharacter', id, teammateIndex)

  // TODO revisit type workaround
  const characterId = id as unknown as keyof typeof characterOptionMapping
  if (!id || !characterOptionMapping[characterId]) {
    return (
      <Flex justify='space-between' align='center'>
        <HeaderText>{t('CharacterPassives')/* Character passives */}</HeaderText>
        <TooltipImage type={Hint.characterPassives()}/>
      </Flex>
    )
  }

  const characterFn = characterOptionMapping[characterId]

  const character = characterFn(eidolon, true)
  const content = teammateIndex != null
    ? (character.teammateContent ? character.teammateContent() : undefined)
    : character.content()

  return (
    <Flex vertical gap={5}>
      {(teammateIndex == null)
      && (
        <Flex justify='space-between' align='center'>
          <HeaderText>{t('CharacterPassives')/* Character passives */}</HeaderText>
          <TooltipImage type={Hint.characterPassives()}/>
        </Flex>
      )}
      <DisplayFormControl content={content} teammateIndex={teammateIndex}/>
    </Flex>
  )
})

CharacterConditionalDisplay.displayName = 'CharacterConditionalDisplay'
