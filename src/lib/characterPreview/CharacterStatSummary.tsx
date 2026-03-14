import { memo, useMemo } from 'react'
import { Flex } from '@mantine/core'
import { StatRow } from 'lib/characterPreview/StatRow'
import { StatText } from 'lib/characterPreview/StatText'
import { BasicStatsObject } from 'lib/conditionals/conditionalConstants'
import { PathNames, Stats } from 'lib/constants/constants'
import { SavedSessionKeys } from 'lib/constants/constantsSession'
import { calculateCustomTraces } from 'lib/optimization/calculateTraces'
import { ComputedStatsObjectExternal } from 'lib/optimization/engine/container/computedStatsContainer'

import { ScoringType, SimulationScore } from 'lib/scoring/simScoringUtils'
import { useGlobalStore } from 'lib/stores/appStore'
import { getGameMetadata } from 'lib/state/gameMetadata'
import { TsUtils } from 'lib/utils/TsUtils'
import { CharacterId } from 'types/character'
import classes from './CharacterStatSummary.module.css'

const epsilon = 0.001

export const CharacterStatSummary = memo(function CharacterStatSummary({
  characterId,
  finalStats,
  elementalDmgValue,
  scoringDone,
  scoringResult,
  scoringType,
  simScore,
  showAll,
}: {
  characterId: CharacterId
  finalStats: BasicStatsObject | ComputedStatsObjectExternal
  elementalDmgValue: string
  scoringDone?: boolean
  scoringResult?: SimulationScore | null
  scoringType?: ScoringType
  simScore?: number
  showAll?: boolean
}) {
  const edits = useMemo(() => calculateStatCustomizations(characterId), [characterId])
  const preciseSpd = useGlobalStore((s) => s.savedSession[SavedSessionKeys.showcasePreciseSpd])

  // For callers that don't pass scoring props (CharacterScoringSummary, BenchmarkResults),
  // scoringResult defaults to undefined (treated as "no scoring")
  const hasScoring = scoringResult !== undefined

  return (
    <StatText className={classes.statSummary}>
      <Flex direction="column" gap={scoringType === ScoringType.NONE ? 5 : 3}>
        <StatRow finalStats={finalStats} stat={Stats.HP} edits={edits} />
        <StatRow finalStats={finalStats} stat={Stats.ATK} edits={edits} />
        <StatRow finalStats={finalStats} stat={Stats.DEF} edits={edits} />
        <StatRow finalStats={finalStats} stat={Stats.SPD} edits={edits} preciseSpd={preciseSpd} />
        <StatRow finalStats={finalStats} stat={Stats.CR} edits={edits} />
        <StatRow finalStats={finalStats} stat={Stats.CD} edits={edits} />
        <StatRow finalStats={finalStats} stat={Stats.EHR} edits={edits} />
        <StatRow finalStats={finalStats} stat={Stats.RES} edits={edits} />
        <StatRow finalStats={finalStats} stat={Stats.BE} edits={edits} />

        {(showAll || (!hasScoring && finalStats[Stats.OHB] > epsilon))
          && <StatRow finalStats={finalStats} stat={Stats.OHB} edits={edits} />}

        {((showAll || finalStats[Stats.ERR] > epsilon) || !hasScoring)
          && <StatRow finalStats={finalStats} stat={Stats.ERR} edits={edits} />}

        <StatRow finalStats={finalStats} stat={elementalDmgValue} edits={edits} />

        {showAll && getGameMetadata().characters[characterId]?.path === PathNames.Elation
          && <StatRow finalStats={finalStats} stat={Stats.Elation} edits={edits} />}

        {scoringType === ScoringType.COMBAT_SCORE
          && !scoringDone
          && scoringResult == null
          && (
            <StatRow
              finalStats={finalStats}
              stat='simScore'
              value={simScore}
            />
          )}

        {scoringType === ScoringType.COMBAT_SCORE
          && scoringResult != null
          && (
            <StatRow
              finalStats={finalStats}
              stat='simScore'
              value={scoringResult?.originalSimResult.simScore}
              loading={!scoringDone}
            />
          )}
      </Flex>
    </StatText>
  )
})

function calculateStatCustomizations(characterId: CharacterId) {
  if (!characterId) return {}

  const meta = getGameMetadata().characters[characterId]
  const customTraces = calculateCustomTraces(meta)
  const defaultTraces = meta.traces
  const edits: Record<string, boolean> = {}

  for (const [stat, value] of Object.entries(defaultTraces)) {
    if (TsUtils.precisionRound(customTraces[stat]) !== TsUtils.precisionRound(value)) {
      edits[stat] = true
      if (stat === Stats.ATK_P) edits[Stats.ATK] = true
      if (stat === Stats.DEF_P) edits[Stats.DEF] = true
      if (stat === Stats.HP_P) edits[Stats.HP] = true
    }
  }

  return edits
}
