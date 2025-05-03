import { Flex } from 'antd'
import { LightConeConditionalsResolver } from 'lib/conditionals/resolver/lightConeConditionalsResolver'
import { Hint } from 'lib/interactions/hint'
import { generateConditionalResolverMetadata } from 'lib/tabs/tabOptimizer/combo/comboDrawerController'
import DisplayFormControl from 'lib/tabs/tabOptimizer/conditionals/DisplayFormControl'
import { HeaderText } from 'lib/ui/HeaderText'
import { TooltipImage } from 'lib/ui/TooltipImage'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { CharacterId } from 'types/character'
import { LightCone, SuperImpositionLevel } from 'types/lightCone'
import { DBMetadata } from 'types/metadata'

export interface LightConeConditionalDisplayProps {
  id?: LightCone['id']
  superImposition: SuperImpositionLevel
  teammateIndex?: number
  dbMetadata: DBMetadata
}

export const LightConeConditionalDisplay = memo((props: LightConeConditionalDisplayProps) => {
  const { t } = useTranslation('optimizerTab')
  // console.log('LightConeConditionalDisplay', props)

  const { id, superImposition, teammateIndex } = props

  const wearerId: CharacterId = teammateIndex == undefined
    ? window.optimizerForm.getFieldValue('characterId')
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    : window.optimizerForm.getFieldValue(`teammate${teammateIndex as 0 | 1 | 2}`)?.characterId

  const conditionalResolverMetadata = generateConditionalResolverMetadata({
    characterId: wearerId,
    characterEidolon: 0, // Assuming eidolon is not needed for light cone metadata
    lightCone: id!,
    lightConeSuperimposition: superImposition,
  }, props.dbMetadata)
  const lightCone = LightConeConditionalsResolver.get(conditionalResolverMetadata, true)

  const content = teammateIndex != null
    ? (lightCone.teammateContent ? lightCone.teammateContent() : undefined)
    : lightCone.content()

  return (
    <Flex vertical gap={5}>
      {
        (teammateIndex == null) && (
          <Flex justify='space-between' align='center'>
            <HeaderText>{t('LightconePassives')/* Light cone passives */}</HeaderText>
            <TooltipImage type={Hint.lightConePassives()}/>
          </Flex>
        )
      }
      <DisplayFormControl content={content} teammateIndex={teammateIndex}/>
    </Flex>
  )
})

LightConeConditionalDisplay.displayName = 'LightConeConditionalDisplay'
