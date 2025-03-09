import { Flex } from 'antd'
import { StatRow } from 'lib/characterPreview/StatRow'
import StatText from 'lib/characterPreview/StatText'
import { BasicStatsObject } from 'lib/conditionals/conditionalConstants'
import { NONE_SCORE, Stats } from 'lib/constants/constants'
import { SavedSessionKeys } from 'lib/constants/constantsSession'
import { calculateCustomTraces } from 'lib/optimization/calculateTraces'
import { ComputedStatsObjectExternal } from 'lib/optimization/computedStatsArray'
import { SimulationResult } from 'lib/scoring/simScoringUtils'
import DB from 'lib/state/db'
import { TsUtils } from 'lib/utils/TsUtils'

// FIXME MED

const epsilon = 0.001

export const CharacterStatSummary = (props: {
  characterId: string
  finalStats: BasicStatsObject | SimulationResult | ComputedStatsObjectExternal
  elementalDmgValue: string
  scoringType?: string
  simScore?: number
  showAll?: boolean
}) => {
  const edits = calculateStatCustomizations(props.characterId)
  const preciseSpd = window.store((s) => s.savedSession[SavedSessionKeys.showcasePreciseSpd])

  return (
    <StatText>
      <Flex vertical style={{ paddingLeft: 4, paddingRight: 6 }} gap={props.scoringType == NONE_SCORE ? 5 : 3}>
        <StatRow finalStats={props.finalStats} stat={Stats.HP} edits={edits}/>
        <StatRow finalStats={props.finalStats} stat={Stats.ATK} edits={edits}/>
        <StatRow finalStats={props.finalStats} stat={Stats.DEF} edits={edits}/>
        <StatRow finalStats={props.finalStats} stat={Stats.SPD} edits={edits} preciseSpd={preciseSpd}/>
        <StatRow finalStats={props.finalStats} stat={Stats.CR} edits={edits}/>
        <StatRow finalStats={props.finalStats} stat={Stats.CD} edits={edits}/>
        <StatRow finalStats={props.finalStats} stat={Stats.EHR} edits={edits}/>
        <StatRow finalStats={props.finalStats} stat={Stats.RES} edits={edits}/>
        <StatRow finalStats={props.finalStats} stat={Stats.BE} edits={edits}/>
        {(!props.simScore && props.finalStats[Stats.OHB] > epsilon) && <StatRow finalStats={props.finalStats} stat={Stats.OHB} edits={edits}/>}
        {(props.showAll || props.finalStats[Stats.ERR] > epsilon || props.simScore == null) && <StatRow finalStats={props.finalStats} stat={Stats.ERR} edits={edits}/>}
        <StatRow finalStats={props.finalStats} stat={props.elementalDmgValue} edits={edits}/>
        {props.simScore != null && <StatRow finalStats={props.finalStats} stat='simScore' value={props.simScore}/>}
      </Flex>
    </StatText>
  )
}

function calculateStatCustomizations(characterId: string) {
  if (!characterId) return {}

  const meta = DB.getMetadata().characters[characterId]
  const customTraces = calculateCustomTraces(meta)
  const defaultTraces = meta.traces
  const edits: Record<string, boolean> = {}

  for (const [stat, value] of Object.entries(defaultTraces)) {
    if (TsUtils.precisionRound(customTraces[stat]) != TsUtils.precisionRound(value)) {
      edits[stat] = true
      if (stat == Stats.ATK_P) edits[Stats.ATK] = true
      if (stat == Stats.DEF_P) edits[Stats.DEF] = true
      if (stat == Stats.HP_P) edits[Stats.HP] = true
    }
  }

  return edits
}
