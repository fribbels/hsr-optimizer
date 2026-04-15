import { Flex } from '@mantine/core'
import { characterOptionMapping } from 'lib/conditionals/resolver/characterConditionalsResolver'
import { Hint } from 'lib/interactions/hint'
import { DisplayFormControl } from 'lib/tabs/tabOptimizer/conditionals/DisplayFormControl'
import { HeaderText } from 'lib/ui/HeaderText'
import { TooltipImage } from 'lib/ui/TooltipImage'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import type {
  CharacterId,
  Eidolon,
} from 'types/character'

interface CharacterConditionalDisplayProps {
  id?: CharacterId
  eidolon: Eidolon
  teammateIndex?: number
}

export const CharacterConditionalsDisplay = memo(function CharacterConditionalsDisplay({ id, eidolon, teammateIndex }: CharacterConditionalDisplayProps) {
  const { t } = useTranslation('optimizerTab')

  const characterId = id as unknown as keyof typeof characterOptionMapping
  if (!id || !characterOptionMapping[characterId]) {
    return (
      <Flex justify='space-between' align='center'>
        <HeaderText>{t('CharacterPassives') /* Character passives */}</HeaderText>
        <TooltipImage type={Hint.characterPassives()} />
      </Flex>
    )
  }

  const characterFn = characterOptionMapping[characterId]

  const character = characterFn(eidolon, true)
  const content = teammateIndex != null
    ? (character.teammateContent ? character.teammateContent() : undefined)
    : character.content()

  return (
    <Flex direction='column' gap={5}>
      {(teammateIndex == null)
        && (
          <Flex justify='space-between' align='center'>
            <HeaderText>{t('CharacterPassives') /* Character passives */}</HeaderText>
            <TooltipImage type={Hint.characterPassives()} />
          </Flex>
        )}
      <DisplayFormControl content={content} teammateIndex={teammateIndex} />
    </Flex>
  )
})
