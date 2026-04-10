import classes from 'lib/characterPreview/card/CharacterStatSummary.module.css'
import {
  StatRow,
} from 'lib/characterPreview/StatRow'
import { StatText } from 'lib/characterPreview/StatText'
import type { BasicStatsObject } from 'lib/conditionals/conditionalConstants'
import {
  PathNames,
  Stats,
} from 'lib/constants/constants'
import { SavedSessionKeys } from 'lib/constants/constantsSession'
import { calculateCustomTraces } from 'lib/optimization/calculateTraces'
import type { ComputedStatsObjectExternal } from 'lib/optimization/engine/container/computedStatsContainer'
import { ScoringType } from 'lib/scoring/simScoringUtils'
import { getGameMetadata } from 'lib/state/gameMetadata'
import { useGlobalStore } from 'lib/stores/app/appStore'
import { precisionRound } from 'lib/utils/mathUtils'
import {
  memo,
  use,
  useMemo,
} from 'react'
import type { CharacterId } from 'types/character'
import { SimScoringContext } from '../SimScoringContext'

const epsilon = 0.001

export const CharacterStatSummary = memo(function CharacterStatSummary({
  characterId,
  finalStats,
  elementalDmgValue,
  hasScoring,
  scoringType,
  showAll,
  simScore: simScoreProp,
  zebra,
}: {
  characterId: CharacterId,
  finalStats: BasicStatsObject | ComputedStatsObjectExternal,
  elementalDmgValue: string,
  hasScoring?: boolean,
  scoringType?: ScoringType,
  showAll?: boolean,
  simScore?: number,
  zebra?: boolean,
}) {
  const edits = useMemo(() => calculateStatCustomizations(characterId), [characterId])
  const preciseSpd = useGlobalStore((s) => s.savedSession[SavedSessionKeys.showcasePreciseSpd])
  const simScore = simScoreProp ?? use(SimScoringContext).preview?.originalSimResult.simScore

  return (
    <StatText className={classes.statSummary}>
      <div
        style={{ display: 'flex', flexDirection: 'column', gap: scoringType === ScoringType.NONE ? 6 : 3 }}
        className={zebra ? classes.zebra : undefined}
      >
        <StatRow finalStats={finalStats} stat={Stats.HP} edits={edits} />
        <StatRow finalStats={finalStats} stat={Stats.ATK} edits={edits} />
        <StatRow finalStats={finalStats} stat={Stats.DEF} edits={edits} />
        <StatRow finalStats={finalStats} stat={Stats.SPD} edits={edits} preciseSpd={preciseSpd} />
        <StatRow finalStats={finalStats} stat={Stats.CR} edits={edits} />
        <StatRow finalStats={finalStats} stat={Stats.CD} edits={edits} />
        <StatRow finalStats={finalStats} stat={Stats.EHR} edits={edits} />
        <StatRow finalStats={finalStats} stat={Stats.RES} edits={edits} />
        <StatRow finalStats={finalStats} stat={Stats.BE} edits={edits} />

        {(showAll || finalStats[Stats.OHB] > epsilon || !hasScoring)
          && <StatRow finalStats={finalStats} stat={Stats.OHB} edits={edits} />}

        {(showAll || finalStats[Stats.ERR] > epsilon || !hasScoring)
          && <StatRow finalStats={finalStats} stat={Stats.ERR} edits={edits} />}

        <StatRow finalStats={finalStats} stat={elementalDmgValue} edits={edits} />

        {showAll && getGameMetadata().characters[characterId]?.path === PathNames.Elation
          && <StatRow finalStats={finalStats} stat={Stats.Elation} edits={edits} />}

        {scoringType === ScoringType.COMBAT_SCORE
          && (
            <StatRow
              finalStats={finalStats}
              stat='simScore'
              value={simScore}
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
