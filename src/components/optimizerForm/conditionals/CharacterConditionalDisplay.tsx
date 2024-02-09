import { Flex } from 'antd'
import { memo } from 'react'
import { HeaderText } from 'components/HeaderText'
import { TooltipImage } from 'components/TooltipImage'
import { Hint } from 'lib/hint'
import DisplayFormControl from './DisplayFormControl'
import { characterOptionMapping } from 'lib/characterConditionals'
import { Eidolon } from 'types/Character'
import { DataMineId } from 'types/Common'

export interface CharacterConditionalDisplayProps {
  id?: DataMineId
  eidolon: Eidolon
}

export const CharacterConditionalDisplay = memo(({ id, eidolon }: CharacterConditionalDisplayProps) => {
  console.log('getDisplayForCharacter', id)
  // TODO revisit type workaround
  const characterId = id as unknown as keyof typeof characterOptionMapping
  if (!id || !characterOptionMapping[characterId]) {
    return (
      <Flex justify="space-between" align="center">
        <HeaderText>Character passives</HeaderText>
        <TooltipImage type={Hint.characterPassives()} />
      </Flex>
    )
  }

  const characterFn = characterOptionMapping[characterId]
  const content = characterFn(eidolon).content()

  return (
    <Flex vertical gap={5}>
      <Flex justify="space-between" align="center">
        <HeaderText>Character passives</HeaderText>
        <TooltipImage type={Hint.characterPassives()} />
      </Flex>
      <DisplayFormControl content={content} />
    </Flex>
  )
})

CharacterConditionalDisplay.displayName = 'CharacterConditionalDisplay'
