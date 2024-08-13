import { Flex } from 'antd'
import StatRow from 'components/characterPreview/StatRow.tsx'
import { Constants } from 'lib/constants.ts'
import { SimulationResult } from "lib/characterScorer";

export const CharacterStatSummary = (props: {
  finalStats: any
  elementalDmgValue: string
  cv?: number
  simScore?: number
  simResult?: SimulationResult
  displayedDmgValues?: string[]
}) => {
  return (
    <Flex vertical style={{ paddingLeft: 6, paddingRight: 8 }} gap={3}>
      <StatRow finalStats={props.finalStats} stat={Constants.Stats.HP}/>
      <StatRow finalStats={props.finalStats} stat={Constants.Stats.ATK}/>
      <StatRow finalStats={props.finalStats} stat={Constants.Stats.DEF}/>
      <StatRow finalStats={props.finalStats} stat={Constants.Stats.SPD}/>
      <StatRow finalStats={props.finalStats} stat={Constants.Stats.CR}/>
      <StatRow finalStats={props.finalStats} stat={Constants.Stats.CD}/>
      <StatRow finalStats={props.finalStats} stat={Constants.Stats.EHR}/>
      <StatRow finalStats={props.finalStats} stat={Constants.Stats.RES}/>
      <StatRow finalStats={props.finalStats} stat={Constants.Stats.BE}/>
      {!props.simScore && <StatRow finalStats={props.finalStats} stat={Constants.Stats.OHB}/>}
      <StatRow finalStats={props.finalStats} stat={Constants.Stats.ERR}/>
      <StatRow finalStats={props.finalStats} stat={props.elementalDmgValue}/>
      {/*{props.simScore != null && <StatRow finalStats={props.finalStats} stat="simScore" value={props.simScore}/>}*/}
      {props.simResult != null && props.displayedDmgValues?.[0] && <StatRow finalStats={props.simResult} stat={props.displayedDmgValues![0]} value={props.simResult[props.displayedDmgValues![0]]}/>}
      {props.simResult != null && props.displayedDmgValues?.[1] && <StatRow finalStats={props.simResult} stat={props.displayedDmgValues![1]} value={props.simResult[props.displayedDmgValues![1]]}/>}
    </Flex>
  )
}
