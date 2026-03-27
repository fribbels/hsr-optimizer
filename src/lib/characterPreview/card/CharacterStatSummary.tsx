import { memo, useMemo } from 'react'
import { StatRow } from 'lib/characterPreview/StatRow'
import { StatText } from 'lib/characterPreview/StatText'
import { type BasicStatsObject } from 'lib/conditionals/conditionalConstants'
import { PathNames, Stats } from 'lib/constants/constants'
import { SavedSessionKeys } from 'lib/constants/constantsSession'
import { calculateCustomTraces } from 'lib/optimization/calculateTraces'
import { type ComputedStatsObjectExternal } from 'lib/optimization/engine/container/computedStatsContainer'

import { ScoringType, type SimulationScore } from 'lib/scoring/simScoringUtils'
import { useGlobalStore } from 'lib/stores/app/appStore'
import { getGameMetadata } from 'lib/state/gameMetadata'
import { type CharacterId } from 'types/character'
import classes from './CharacterStatSummary.module.css'
import { precisionRound } from 'lib/utils/mathUtils'

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
      <div style={{ display: 'flex', flexDirection: 'column', gap: scoringType === ScoringType.NONE ? 5 : 3 }}>
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
      </div>
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
    if (precisionRound(customTraces[stat]) !== precisionRound(value)) {
      edits[stat] = true
      if (stat === Stats.ATK_P) edits[Stats.ATK] = true
      if (stat === Stats.DEF_P) edits[Stats.DEF] = true
      if (stat === Stats.HP_P) edits[Stats.HP] = true
    }
  }

  return edits
}
