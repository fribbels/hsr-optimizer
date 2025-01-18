import { Flex } from 'antd'
import StatRow from 'lib/characterPreview/StatRow'
import { BasicStatsObject } from 'lib/conditionals/conditionalConstants'
import { Constants, NONE_SCORE, Stats } from 'lib/constants/constants'
import { ComputedStatsObjectExternal } from 'lib/optimization/computedStatsArray'
import { SimulationResult } from 'lib/scoring/characterScorer'

// FIXME MED

const epsilon = 0.001

export const CharacterStatSummary = (props: {
  finalStats: BasicStatsObject | SimulationResult | ComputedStatsObjectExternal
  elementalDmgValue: string
  cv?: number
  scoringType?: string
  simScore?: number
  showAll?: boolean
}) => {
  return (
    <Flex vertical style={{ paddingLeft: 4, paddingRight: 6 }} gap={props.scoringType == NONE_SCORE ? 5 : 3}>
      <StatRow finalStats={props.finalStats} stat={Constants.Stats.HP}/>
      <StatRow finalStats={props.finalStats} stat={Constants.Stats.ATK}/>
      <StatRow finalStats={props.finalStats} stat={Constants.Stats.DEF}/>
      <StatRow finalStats={props.finalStats} stat={Constants.Stats.SPD}/>
      <StatRow finalStats={props.finalStats} stat={Constants.Stats.CR}/>
      <StatRow finalStats={props.finalStats} stat={Constants.Stats.CD}/>
      <StatRow finalStats={props.finalStats} stat={Constants.Stats.EHR}/>
      <StatRow finalStats={props.finalStats} stat={Constants.Stats.RES}/>
      <StatRow finalStats={props.finalStats} stat={Constants.Stats.BE}/>
      {(!props.simScore && props.finalStats[Stats.OHB] > epsilon) && <StatRow finalStats={props.finalStats} stat={Stats.OHB}/>}
      {(props.showAll || props.finalStats[Stats.ERR] > epsilon || props.simScore == null) && <StatRow finalStats={props.finalStats} stat={Constants.Stats.ERR}/>}
      <StatRow finalStats={props.finalStats} stat={props.elementalDmgValue}/>
      {props.simScore != null && <StatRow finalStats={props.finalStats} stat='simScore' value={props.simScore}/>}
    </Flex>
  )
}
