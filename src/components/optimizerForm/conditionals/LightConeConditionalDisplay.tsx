import { Flex, Typography } from 'antd'
import { HeaderText } from 'components/HeaderText'
import { TooltipImage } from 'components/TooltipImage'
import { Hint } from 'lib/hint'
import { DataMineId } from 'types/Common'
import { SuperImpositionLevel } from 'types/LightCone'
import { memo } from 'react'
import { lightConeOptionMapping } from 'lib/lightConeConditionals'
import DisplayFormControl from './DisplayFormControl.tsx'

export interface LightConeConditionalDisplayProps {
  id?: DataMineId
  superImposition: SuperImpositionLevel
  teammateIndex?: number
}

export const LightConeConditionalDisplay = memo((props: LightConeConditionalDisplayProps) => {
  const { id, superImposition, teammateIndex } = props
  // TODO revisit type workaround
  const lightConeId = id as unknown as keyof typeof lightConeOptionMapping

  if (!lightConeId || !lightConeOptionMapping[lightConeId]) {
    return (
      <Flex vertical gap={5}>
        <Flex justify="space-between" align="center">
          <HeaderText>Light cone passives</HeaderText>
          <TooltipImage type={Hint.lightConePassives()} />
        </Flex>
        {(teammateIndex == null) && <Typography.Text italic>Select Light cone to view passives</Typography.Text>}
      </Flex>
    )
  }

  const lcFn = lightConeOptionMapping[lightConeId]
  const lightCone = lcFn(superImposition - 1)

  const content = teammateIndex != null
    ? (lightCone.teammateContent ? lightCone.teammateContent(teammateIndex) : undefined)
    : lightCone.content()

  return (
    <Flex vertical gap={5}>
      <Flex justify="space-between" align="center">
        <HeaderText>Light cone passives</HeaderText>
        <TooltipImage type={Hint.lightConePassives()} />
      </Flex>
      <DisplayFormControl content={content} teammateIndex={teammateIndex} />
    </Flex>
  )
})

LightConeConditionalDisplay.displayName = 'LightConeConstionalDisplay'
