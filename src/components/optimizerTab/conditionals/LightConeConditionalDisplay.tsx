import { Flex, Typography } from 'antd'
import { HeaderText } from 'components/HeaderText'
import DisplayFormControl from 'components/optimizerTab/conditionals/DisplayFormControl'
import { TooltipImage } from 'components/TooltipImage'
import { Hint } from 'lib/hint'
import { lightConeOptionMapping } from 'lib/lightConeConditionals'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { SuperImpositionLevel } from 'types/LightCone'

export interface LightConeConditionalDisplayProps {
  id?: string
  superImposition: SuperImpositionLevel
  teammateIndex?: number
}

export const LightConeConditionalDisplay = memo((props: LightConeConditionalDisplayProps) => {
  const { t } = useTranslation('optimizerTab')
  // console.log('LightConeConditionalDisplay', props)

  const { id, superImposition, teammateIndex } = props
  // TODO revisit type workaround
  const lightConeId = id as unknown as keyof typeof lightConeOptionMapping

  if (!lightConeId || !lightConeOptionMapping[lightConeId]) {
    return (
      <Flex vertical gap={5}>
        <Flex justify='space-between' align='center'>
          <HeaderText>{t('LightconePassives')/* Light cone passives */}</HeaderText>
          <TooltipImage type={Hint.lightConePassives()}/>
        </Flex>
        {(teammateIndex == null) && <Typography.Text italic></Typography.Text>}
      </Flex>
    )
  }

  const lcFn = lightConeOptionMapping[lightConeId]
  const lightCone = lcFn(superImposition - 1, true)

  const content = teammateIndex != null
    ? (lightCone.teammateContent ? lightCone.teammateContent() : undefined)
    : lightCone.content()

  return (
    <Flex vertical gap={5}>
      <DisplayFormControl content={content} teammateIndex={teammateIndex}/>
    </Flex>
  )
})

LightConeConditionalDisplay.displayName = 'LightConeConditionalDisplay'
