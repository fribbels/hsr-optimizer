import { Flex } from 'antd'
import { getStatRenderValues, StatRow } from 'lib/characterPreview/StatRow'
import StatText from 'lib/characterPreview/StatText'
import { Stats } from 'lib/constants/constants'
import { ComputedStatsObjectExternal } from 'lib/optimization/computedStatsArray'
import { OptimizerResultAnalysis } from 'lib/tabs/tabOptimizer/analysis/expandedDataPanelController'
import { CharacterPreviewInternalImage } from 'lib/tabs/tabOptimizer/optimizerForm/components/OptimizerTabCharacterPanel'
import { cardShadow } from 'lib/tabs/tabOptimizer/optimizerForm/layout/FormCard'
import { TsUtils } from 'lib/utils/TsUtils'
import { Utils } from 'lib/utils/utils'
import { useTranslation } from 'react-i18next'

const cardHeight = 429
const cardWidth = 730
const border = '1px solid rgb(53, 75, 125)'

export function StatsDiffCard(props: {
  analysis: OptimizerResultAnalysis
}) {
  const { analysis } = props

  return (
    <Flex
      style={{
        borderRadius: 5,
        width: cardWidth,
        height: cardHeight,
      }}
      gap={10}
    >
      <CardImage analysis={analysis}/>

      <Flex
        style={{
          borderRadius: 5,
          width: cardWidth,
          overflow: 'hidden',
          padding: 10,
          background: '#243356',
          boxShadow: cardShadow,
        }}
      >
        <StatDiffSummary analysis={analysis}/>
      </Flex>
    </Flex>
  )
}

function StatDiffSummary(props: { analysis: OptimizerResultAnalysis }) {
  const oldStats = props.analysis.oldX.toComputedStatsObject()
  const newStats = props.analysis.newX.toComputedStatsObject()

  oldStats[props.analysis.elementalDmgValue] = oldStats.ELEMENTAL_DMG
  newStats[props.analysis.elementalDmgValue] = newStats.ELEMENTAL_DMG
  // @ts-ignore For compatibility with StatRow
  oldStats.simScore = oldStats.COMBO_DMG
  // @ts-ignore For compatibility with StatRow
  newStats.simScore = newStats.COMBO_DMG

  return (
    <StatText style={{ width: '100%' }}>
      <Flex vertical gap={5}>
        <DiffRow oldStats={oldStats} newStats={newStats} stat='COMBO_DMG'/>
        <DiffRow oldStats={oldStats} newStats={newStats} stat={Stats.HP}/>
        <DiffRow oldStats={oldStats} newStats={newStats} stat={Stats.ATK}/>
        <DiffRow oldStats={oldStats} newStats={newStats} stat={Stats.DEF}/>
        <DiffRow oldStats={oldStats} newStats={newStats} stat={Stats.SPD}/>
        <DiffRow oldStats={oldStats} newStats={newStats} stat={Stats.CR}/>
        <DiffRow oldStats={oldStats} newStats={newStats} stat={Stats.CD}/>
        <DiffRow oldStats={oldStats} newStats={newStats} stat={Stats.EHR}/>
        <DiffRow oldStats={oldStats} newStats={newStats} stat={Stats.RES}/>
        <DiffRow oldStats={oldStats} newStats={newStats} stat={Stats.BE}/>
        <DiffRow oldStats={oldStats} newStats={newStats} stat={Stats.OHB}/>
        <DiffRow oldStats={oldStats} newStats={newStats} stat={Stats.ERR}/>
        <DiffRow oldStats={oldStats} newStats={newStats} stat={props.analysis.elementalDmgValue}/>
      </Flex>
    </StatText>
  )
}

function DiffRow(props: {
  oldStats: ComputedStatsObjectExternal
  newStats: ComputedStatsObjectExternal
  stat: keyof ComputedStatsObjectExternal
}) {
  const { oldStats, newStats, stat } = props
  const oldValue = TsUtils.precisionRound(oldStats[stat])
  const newValue = TsUtils.precisionRound(newStats[stat])

  const { valueDisplay } = getStatRenderValues(
    newValue,
    newValue,
    stat,
    false,
  )

  return (
    <Flex gap={12} align='center'>
      <div style={{ width: 240 }}>
        <StatRow finalStats={oldStats} stat={stat == 'COMBO_DMG' ? 'simScore' : stat} value={stat == 'COMBO_DMG' ? oldValue : undefined}/>
      </div>

      <span style={{ marginLeft: 15, marginRight: 15, fontSize: 14, lineHeight: '17px' }}>
        ⮞
      </span>

      <Flex style={{ width: 55 }} justify='end'>
        <RenderValue value={valueDisplay} stat={stat}/>
      </Flex>

      <DiffRender oldValue={oldValue} newValue={newValue} stat={stat}/>
    </Flex>
  )
}

function RenderValue(props: { value: string | number; stat: string; comboDiff?: boolean }) {
  const { t } = useTranslation('common')
  const { value, stat } = props
  if (stat == 'COMBO_DMG') {
    return value + (props.comboDiff ? '%' : t('ThousandsSuffix'))
  } else if (Utils.isFlat(stat)) {
    return value
  }
  return value + '%'
}

const GREEN = '#95ef90'
const RED = '#ff97a9'

function DiffRender(props: { oldValue: number; newValue: number; stat: string }) {
  const { newValue, oldValue, stat } = props

  if (visualDiff(newValue, oldValue, stat) == 0) return <></>

  const increase = newValue > oldValue
  const diff = increase ? visualDiff(newValue, oldValue, stat) : visualDiff(oldValue, newValue, stat)
  const icon = increase ? '▲' : '▼'
  const color = increase ? GREEN : RED
  const { valueDisplay } = getStatDiffRenderValues(diff, diff, stat)

  return (
    <Flex style={{ color: color, width: 90 }} gap={10} justify='end' align='center'>
      <RenderValue value={valueDisplay} stat={stat} comboDiff={true}/>
      <span style={{ fontSize: 10, lineHeight: '17px' }}>
        {icon}
      </span>
    </Flex>
  )
}

function getStatDiffRenderValues(statValue: number, customValue: number, stat: string) {
  if (stat == 'COMBO_DMG') {
    const valueDisplay = `${Utils.truncate10ths(Utils.precisionRound((customValue ?? 0))).toFixed(1)}`
    const value1000thsPrecision = Utils.precisionRound(customValue).toFixed(3)
    return {
      valueDisplay,
      value1000thsPrecision,
    }
  }
  return getStatRenderValues(statValue, customValue, stat)
}

function visualDiff(n1: number, n2: number, stat: string) {
  if (stat == Stats.SPD) {
    return TsUtils.precisionRound(Utils.truncate10ths(n1) - Utils.truncate10ths(n2))
  } else if (Utils.isFlat(stat)) {
    return TsUtils.precisionRound(Math.floor(n1) - Math.floor(n2))
  } else if (stat == 'COMBO_DMG') {
    return TsUtils.precisionRound((n1 / n2 - 1) * 100)
  } else {
    return TsUtils.precisionRound((Utils.truncate1000ths(n1) - Utils.truncate1000ths(n2)))
  }
}

function CardImage(props: { analysis: OptimizerResultAnalysis }) {
  return (
    <div
      style={{
        overflow: 'hidden',
        boxShadow: cardShadow,
        borderRadius: 5,
        minWidth: 233,
        height: '100%',
        background: '#243356',
      }}
    >
      <CharacterPreviewInternalImage id={props.analysis.request.characterId} disableClick={true} parentH={400}/>
    </div>
  )
}
