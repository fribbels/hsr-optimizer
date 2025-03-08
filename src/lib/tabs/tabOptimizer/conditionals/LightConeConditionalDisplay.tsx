import { Flex } from 'antd'
import { LightConeConditionalsResolver } from 'lib/conditionals/resolver/lightConeConditionalsResolver'
import { Hint } from 'lib/interactions/hint'
import DisplayFormControl from 'lib/tabs/tabOptimizer/conditionals/DisplayFormControl'
import { HeaderText } from 'lib/ui/HeaderText'
import { TooltipImage } from 'lib/ui/TooltipImage'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { SuperImpositionLevel } from 'types/lightCone'
import { DBMetadata } from 'types/metadata'

export interface LightConeConditionalDisplayProps {
  id?: string
  superImposition: SuperImpositionLevel
  teammateIndex?: number
  dbMetadata: DBMetadata
}

export const LightConeConditionalDisplay = memo((props: LightConeConditionalDisplayProps) => {
  const { t } = useTranslation('optimizerTab')
  // console.log('LightConeConditionalDisplay', props)

  const { id, superImposition, teammateIndex } = props

  const wearerId: string = teammateIndex == undefined
    ? window.optimizerForm.getFieldValue('characterId')
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    : window.optimizerForm.getFieldValue(`teammate${teammateIndex as 0 | 1 | 2}`)?.characterId

  const lightCone = LightConeConditionalsResolver.get({
    lightCone: id!,
    lightConeSuperimposition: superImposition,
    lightConePath: props.dbMetadata.lightCones[id!]?.path,
    path: props.dbMetadata.characters[wearerId]?.path,
    element: props.dbMetadata.characters[wearerId]?.element,
    baseEnergy: props.dbMetadata.characters[wearerId]?.max_sp,
  }, true)

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
