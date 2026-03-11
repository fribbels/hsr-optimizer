import { Flex } from '@mantine/core'
import { StatRow } from 'lib/characterPreview/StatRow'
import StatText from 'lib/characterPreview/StatText'
import { useAsyncSimScoringExecution } from 'lib/characterPreview/useAsyncSimScoringExecution'
import { BasicStatsObject } from 'lib/conditionals/conditionalConstants'
import { PathNames, Stats } from 'lib/constants/constants'
import { SavedSessionKeys } from 'lib/constants/constantsSession'
import { calculateCustomTraces } from 'lib/optimization/calculateTraces'
import { ComputedStatsObjectExternal } from 'lib/optimization/engine/container/computedStatsContainer'

import { AsyncSimScoringExecution } from 'lib/scoring/dpsScore'
import { ScoringType } from 'lib/scoring/simScoringUtils'
import { useGlobalStore } from 'lib/state/db'
import { getGameMetadata } from 'lib/state/gameMetadata'
import { TsUtils } from 'lib/utils/TsUtils'
import { CharacterId } from 'types/character'

// FIXME MED

const epsilon = 0.001

export const CharacterStatSummary = (props: {
  characterId: CharacterId,
  finalStats: BasicStatsObject | ComputedStatsObjectExternal,
  elementalDmgValue: string,
  asyncSimScoringExecution: AsyncSimScoringExecution | null,
  scoringType?: ScoringType,
  simScore?: number,
  showAll?: boolean,
}) => {
  const edits = calculateStatCustomizations(props.characterId)
  const preciseSpd = useGlobalStore((s) => s.savedSession[SavedSessionKeys.showcasePreciseSpd])
  const simScoringExecution = useAsyncSimScoringExecution(props.asyncSimScoringExecution)

  return (
    <StatText style={{ paddingLeft: 4, paddingRight: 6, width: '100%' }}>
      <Flex direction="column" gap={props.scoringType == ScoringType.NONE ? 5 : 3}>
        <StatRow finalStats={props.finalStats} stat={Stats.HP} edits={edits} />
        <StatRow finalStats={props.finalStats} stat={Stats.ATK} edits={edits} />
        <StatRow finalStats={props.finalStats} stat={Stats.DEF} edits={edits} />
        <StatRow finalStats={props.finalStats} stat={Stats.SPD} edits={edits} preciseSpd={preciseSpd} />
        <StatRow finalStats={props.finalStats} stat={Stats.CR} edits={edits} />
        <StatRow finalStats={props.finalStats} stat={Stats.CD} edits={edits} />
        <StatRow finalStats={props.finalStats} stat={Stats.EHR} edits={edits} />
        <StatRow finalStats={props.finalStats} stat={Stats.RES} edits={edits} />
        <StatRow finalStats={props.finalStats} stat={Stats.BE} edits={edits} />

        {(props.showAll || !props.asyncSimScoringExecution && props.finalStats[Stats.OHB] > epsilon)
          && <StatRow finalStats={props.finalStats} stat={Stats.OHB} edits={edits} />}

        {((props.showAll || props.finalStats[Stats.ERR] > epsilon) || props.asyncSimScoringExecution == null)
          && <StatRow finalStats={props.finalStats} stat={Stats.ERR} edits={edits} />}

        <StatRow finalStats={props.finalStats} stat={props.elementalDmgValue} edits={edits} />

        {props.showAll && getGameMetadata().characters[props.characterId]?.path === PathNames.Elation
          && <StatRow finalStats={props.finalStats} stat={Stats.Elation} edits={edits} />}

        {props.scoringType == ScoringType.COMBAT_SCORE
          && !props.asyncSimScoringExecution?.done
          && props.asyncSimScoringExecution?.result == null
          && (
            <StatRow
              finalStats={props.finalStats}
              stat='simScore'
              value={props.simScore}
            />
          )}

        {props.scoringType == ScoringType.COMBAT_SCORE
          && props.asyncSimScoringExecution?.result != null
          && (
            <StatRow
              finalStats={props.finalStats}
              stat='simScore'
              value={simScoringExecution?.result?.originalSimResult.simScore}
              loading={!simScoringExecution?.done}
            />
          )}
      </Flex>
    </StatText>
  )
}

function calculateStatCustomizations(characterId: CharacterId) {
  if (!characterId) return {}

  const meta = getGameMetadata().characters[characterId]
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
