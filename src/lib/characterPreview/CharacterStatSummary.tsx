import { Flex } from 'antd'
import StatRow from 'lib/characterPreview/StatRow'
import { Constants, NONE_SCORE, Stats } from 'lib/constants/constants'

// FIXME MED

const epsilon = 0.001

export const CharacterStatSummary = (props: {
  finalStats: object
  elementalDmgValue: string
  cv?: number
  scoringType?: string
  simScore?: number
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
      {!props.simScore && props.finalStats[Stats.OHB] > epsilon && <StatRow finalStats={props.finalStats} stat={Stats.OHB}/>}
      {(props.simScore == null || props.cv <= 64.8) && <StatRow finalStats={props.finalStats} stat={Constants.Stats.ERR}/>}
      <StatRow finalStats={props.finalStats} stat={props.elementalDmgValue}/>
      {props.cv != null && props.cv > 64.8 && <StatRow finalStats={props.finalStats} stat='CV' value={props.cv}/>}
      {props.simScore != null && <StatRow finalStats={props.finalStats} stat='simScore' value={props.simScore}/>}
    </Flex>
  )
}
