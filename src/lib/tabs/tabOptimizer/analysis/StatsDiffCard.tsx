import { Flex } from 'antd'
import { getStatRenderValues, StatRow } from 'lib/characterPreview/StatRow'
import StatText from 'lib/characterPreview/StatText'
import { Stats, StatsValues } from 'lib/constants/constants'
import { ComputedStatsObjectExternal } from 'lib/optimization/computedStatsArray'
import { OptimizerResultAnalysis } from 'lib/tabs/tabOptimizer/analysis/expandedDataPanelController'
import { CharacterPreviewInternalImage } from 'lib/tabs/tabOptimizer/optimizerForm/components/OptimizerTabCharacterPanel'

const cardHeight = 400
const cardWidth = 700
const gap = 16
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
      <Flex gap={8}>
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
    <StatText>
      <Flex vertical style={{ paddingLeft: 4, paddingRight: 6 }} gap={5}>
        <DiffRow oldStats={oldStats} newStats={newStats} stat={Stats.ATK}/>
      </Flex>
    </StatText>
  )
}

function DiffRow(props: {
  oldStats: ComputedStatsObjectExternal
  newStats: ComputedStatsObjectExternal
  stat: string
}) {
  const { valueDisplay } = getStatRenderValues(
    props.newStats[props.stat as StatsValues],
    props.newStats[props.stat as StatsValues],
    props.stat,
    true,
  )

  return (
    <Flex gap={15} align='center'>
      <div style={{ width: 240 }}>
        <StatRow finalStats={props.oldStats} stat={props.stat}/>
      </div>
      <span>⮞</span>
      <div>
        {valueDisplay}
      </div>
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
        width: 233,
        height: cardHeight,
        background: '#243356',
      }}
    >
      <CharacterPreviewInternalImage id={props.analysis.request.characterId} disableClick={true}/>
    </div>
  )
}
