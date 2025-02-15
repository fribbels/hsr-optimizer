import { Flex } from 'antd'
import { getStatRenderValues, StatRow } from 'lib/characterPreview/StatRow'
import StatText from 'lib/characterPreview/StatText'
import { Stats, StatsValues } from 'lib/constants/constants'
import { ComputedStatsObjectExternal } from 'lib/optimization/computedStatsArray'
import { OptimizerResultAnalysis } from 'lib/tabs/tabOptimizer/analysis/expandedDataPanelController'
import { CharacterPreviewInternalImage } from 'lib/tabs/tabOptimizer/optimizerForm/components/OptimizerTabCharacterPanel'
import { TsUtils } from 'lib/utils/TsUtils'
import { Utils } from 'lib/utils/utils'

const cardHeight = 408
const cardWidth = 730
const gap = 12
const border = '1px solid rgb(53, 75, 125)'

export function StatsDiffCard(props: {
  analysis: OptimizerResultAnalysis
}) {
  const { analysis } = props

  return (
    <div
      style={{
        border: border,
        borderRadius: 10,
        width: cardWidth,
        height: 'fit-content',
        overflow: 'hidden',
        padding: gap,
      }}
    >
      <Flex gap={gap}>
        <CardImage analysis={analysis}/>
        <StatDiffSummary analysis={analysis}/>
      </Flex>
    </div>
  )
}

function StatDiffSummary(props: { analysis: OptimizerResultAnalysis }) {
  const oldStats = props.analysis.oldX.toComputedStatsObject()
  const newStats = props.analysis.newX.toComputedStatsObject()

  return (
    <StatText style={{ width: '100%' }}>
      <Flex vertical gap={5}>
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
        <DiffRow oldStats={oldStats} newStats={newStats} stat='ELEMENTAL_DMG'/>
        <DiffRow oldStats={oldStats} newStats={newStats} stat='COMBO_DMG'/>
      </Flex>
    </StatText>
  )
}

function DiffRow(props: {
  oldStats: ComputedStatsObjectExternal
  newStats: ComputedStatsObjectExternal
  stat: StatsValues
}) {
  const { oldStats, newStats, stat } = props
  const oldValue = TsUtils.precisionRound(oldStats[stat])
  const newValue = TsUtils.precisionRound(newStats[stat])

  const { valueDisplay } = getStatRenderValues(
    newValue,
    newValue,
    stat,
    true,
  )

  return (
    <Flex gap={10} align='center'>
      <div style={{ width: 240 }}>
        <StatRow finalStats={oldStats} stat={stat}/>
      </div>

      <span style={{ marginLeft: 20, marginRight: 20, fontSize: 14, lineHeight: '17px' }}>
        ⮞
      </span>

      <Flex style={{ width: 50, marginRight: 10 }} justify='end'>
        {renderValue(valueDisplay, stat)}
      </Flex>

      <DiffRender oldValue={oldValue} newValue={newValue} stat={stat}/>
    </Flex>
  )
}

function renderValue(value: string | number, stat: string) {
  if (Utils.isFlat(stat)) {
    return value
  }
  return value + '%'
}

const GREEN = '#90EF90'
const RED = '#FA6B84'

function DiffRender(props: { oldValue: number; newValue: number; stat: StatsValues }) {
  const { newValue, oldValue, stat } = props

  if (oldValue == newValue) return <></>

  const increase = newValue > oldValue
  const diff = increase ? TsUtils.precisionRound(newValue - oldValue) : TsUtils.precisionRound(oldValue - newValue)
  const icon = increase ? '▲' : '▼'
  const color = increase ? GREEN : RED
  const { valueDisplay } = getStatRenderValues(diff, diff, stat)

  return (
    <Flex style={{ lineHeight: '17px', color: color, width: 75 }} gap={10} justify='end'>
      {renderValue(valueDisplay, stat)}
      <span style={{ fontSize: 10 }}>
        {icon}
      </span>
    </Flex>
  )
}

function CardImage(props: { analysis: OptimizerResultAnalysis }) {
  return (
    <div
      style={{
        overflow: 'hidden',
        border: border,
        borderRadius: 10,
        minWidth: 233,
        height: cardHeight,
        background: '#243356',
      }}
    >
      <CharacterPreviewInternalImage id={props.analysis.request.characterId} disableClick={true}/>
    </div>
  )
}
