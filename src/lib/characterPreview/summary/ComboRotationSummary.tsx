import { Flex } from 'antd'
import { useTranslation } from 'react-i18next'
import { SimulationMetadata } from 'types/metadata'

type ComboRotationSummaryProps = {
  simMetadata: SimulationMetadata
}

export function ComboRotationSummary({ simMetadata }: ComboRotationSummaryProps) {
  const { t } = useTranslation(['charactersTab', 'common'])

  // TODO: Combo turn abilities
  return (
    <Flex gap={30}>
      <Flex vertical gap={2}>
        <ScoringAbility comboAbilities={simMetadata.comboTurnAbilities} index={1}/>
        <ScoringAbility comboAbilities={simMetadata.comboTurnAbilities} index={2}/>
        <ScoringAbility comboAbilities={simMetadata.comboTurnAbilities} index={3}/>
        <ScoringAbility comboAbilities={simMetadata.comboTurnAbilities} index={4}/>
        <ScoringAbility comboAbilities={simMetadata.comboTurnAbilities} index={5}/>
        <ScoringAbility comboAbilities={simMetadata.comboTurnAbilities} index={6}/>
        <ScoringAbility comboAbilities={simMetadata.comboTurnAbilities} index={7}/>
        <ScoringAbility comboAbilities={simMetadata.comboTurnAbilities} index={8}/>
      </Flex>
      <Flex vertical gap={2}>
        <ScoringInteger label={t('CharacterPreview.BuildAnalysis.Rotation.DOTS')} number={simMetadata.comboDot}/>
        <ScoringInteger label={t('CharacterPreview.BuildAnalysis.Rotation.BREAKS')} number={simMetadata.comboBreak}/>
      </Flex>
    </Flex>
  )
}

function ScoringAbility(props: {
  comboAbilities: string[]
  index: number
}) {
  const { t, i18n } = useTranslation(['charactersTab', 'common'])

  const displayValue = i18n.exists(`charactersTab:CharacterPreview.BuildAnalysis.Rotation.${props.comboAbilities[props.index]}`)
    ? t(`CharacterPreview.BuildAnalysis.Rotation.${props.comboAbilities[props.index]}` as never)
    : null
  if (displayValue == null) return <></>

  return (
    <Flex align='center' gap={15}>
      <pre style={{ margin: 0 }}>{`#${props.index} - ${displayValue as string}`}</pre>
    </Flex>
  )
}

function ScoringInteger(props: {
  label: string
  number?: number
  valueWidth?: number
}) {
  const value = props.number ?? 0
  return (
    <Flex gap={9} justify='space-between'>
      <pre style={{ margin: 0 }}>{props.label}</pre>
      <pre style={{ margin: 0, width: props.valueWidth }}>{value}</pre>
    </Flex>
  )
}
