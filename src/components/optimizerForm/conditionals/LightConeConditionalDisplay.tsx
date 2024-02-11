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
}

export const LightConeConditionalDisplay = memo((props: LightConeConditionalDisplayProps) => {
  const { id, superImposition } = props
  // TODO revisit type workaround
  const lightConeId = id as unknown as keyof typeof lightConeOptionMapping
  if (!lightConeId || !lightConeOptionMapping[lightConeId]) {
    return (
      <Flex vertical gap={5}>
        <Flex justify="space-between" align="center">
          <HeaderText>Light cone passives</HeaderText>
          <TooltipImage type={Hint.lightConePassives()} />
        </Flex>
        <Typography.Text italic>Select a Light cone to view passives</Typography.Text>
      </Flex>
    )
  }

  const lcFn = lightConeOptionMapping[lightConeId]
  const content = lcFn(superImposition - 1).content()

  return (
    <Flex vertical gap={5}>
      <Flex justify="space-between" align="center">
        <HeaderText>Light cone passives</HeaderText>
        <TooltipImage type={Hint.lightConePassives()} />
      </Flex>
      <DisplayFormControl content={content} />
    </Flex>
  )
})

LightConeConditionalDisplay.displayName = 'LightConeConstionalDisplay'
