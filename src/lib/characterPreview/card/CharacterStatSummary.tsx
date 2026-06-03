import { usePromise } from 'hooks/usePromise'
import { ScoringColumnKind } from 'lib/characterPreview/buildAnalysis/ScoringColumns'
import classes from 'lib/characterPreview/card/CharacterStatSummary.module.css'
import { SimScoreRow } from 'lib/characterPreview/SimScoreRow'
import {
  AsyncStatRow,
  StatRow,
} from 'lib/characterPreview/StatRow'
import { StatText } from 'lib/characterPreview/StatText'
import type { BasicStatsObject } from 'lib/conditionals/conditionalConstants'
import {
  PathNames,
  Stats,
  type StatsValues,
} from 'lib/constants/constants'
import { SavedSessionKeys } from 'lib/constants/constantsSession'
import { calculateCustomTraces } from 'lib/optimization/calculateTraces'
import type { AKeyValue } from 'lib/optimization/engine/config/keys'
import type { ComputedStatsObjectExternal } from 'lib/optimization/engine/container/computedStatsContainer'
import {
  isSimScoreMode,
  ScoringType,
} from 'lib/scoring/scoringConfig'
import type { SimulationScore } from 'lib/scoring/simScoringUtils'
import { getGameMetadata } from 'lib/state/gameMetadata'
import { useGlobalStore } from 'lib/stores/app/appStore'
import { precisionRound } from 'lib/utils/mathUtils'
import {
  memo,
  useMemo,
} from 'react'
import type { CharacterId } from 'types/character'
import { ScoringConfigType } from 'types/metadata'

const epsilon = 0.001

interface CommonStatSummaryProps {
  characterId: CharacterId
  elementalDmgValue: StatsValues
  scoringType?: ScoringType
  showAll?: boolean
  zebra?: boolean
}

interface SyncStatSummaryProps extends CommonStatSummaryProps {
  simScore: number
  finalStats: BasicStatsObject | ComputedStatsObjectExternal
  hasScoring?: boolean
  buffStat?: AKeyValue
  configType?: ScoringConfigType
}

interface AsyncStatSummaryProps extends CommonStatSummaryProps {
  promise: Promise<SimulationScore | null>
  type: ScoringColumnKind.BENCHMARK | ScoringColumnKind.PERFECT
  subType: 'Combat' | 'Basic'
  configType?: ScoringConfigType
  buffStat?: AKeyValue
}

export const CharacterStatSummary = memo(function CharacterStatSummary({
  characterId,
  finalStats,
  elementalDmgValue,
  hasScoring,
  scoringType,
  showAll,
  simScore,
  zebra,
  buffStat,
  configType,
}: SyncStatSummaryProps) {
  const edits = useMemo(() => calculateStatCustomizations(characterId), [characterId])
  const preciseSpd = useGlobalStore((s) => s.savedSession[SavedSessionKeys.showcasePreciseSpd])

  return (
    <StatText className={classes.statSummary}>
      <div
        style={{ display: 'flex', flexDirection: 'column', gap: 3 }}
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

        {isSimScoreMode(scoringType) && configType != null
          && (
            <SimScoreRow
              value={simScore}
              configType={configType}
              buffStat={buffStat}
            />
          )}
      </div>
    </StatText>
  )
})

export const AsyncCharacterStatSummary = memo(function({
  characterId,
  elementalDmgValue,
  scoringType,
  zebra,
  promise,
  type,
  subType,
  configType,
  buffStat,
}: AsyncStatSummaryProps) {
  const edits = useMemo(() => calculateStatCustomizations(characterId), [characterId])
  const preciseSpd = useGlobalStore((s) => s.savedSession[SavedSessionKeys.showcasePreciseSpd])

  const charMeta = getGameMetadata().characters[characterId]

  return (
    <StatText className={classes.statSummary}>
      <div
        style={{ display: 'flex', flexDirection: 'column', gap: 3 }}
        className={zebra ? classes.zebra : undefined}
      >
        <AsyncStatRow
          path={charMeta.path}
          element={charMeta.element}
          elementalDmgValue={elementalDmgValue}
          promise={promise}
          type={type}
          subType={subType}
          stat={Stats.HP}
          edits={edits}
        />
        <AsyncStatRow
          path={charMeta.path}
          element={charMeta.element}
          elementalDmgValue={elementalDmgValue}
          promise={promise}
          type={type}
          subType={subType}
          stat={Stats.ATK}
          edits={edits}
        />
        <AsyncStatRow
          path={charMeta.path}
          element={charMeta.element}
          elementalDmgValue={elementalDmgValue}
          promise={promise}
          type={type}
          subType={subType}
          stat={Stats.DEF}
          edits={edits}
        />
        <AsyncStatRow
          path={charMeta.path}
          element={charMeta.element}
          elementalDmgValue={elementalDmgValue}
          promise={promise}
          type={type}
          subType={subType}
          stat={Stats.SPD}
          edits={edits}
          preciseSpd={preciseSpd}
        />
        <AsyncStatRow
          path={charMeta.path}
          element={charMeta.element}
          elementalDmgValue={elementalDmgValue}
          promise={promise}
          type={type}
          subType={subType}
          stat={Stats.CR}
          edits={edits}
        />
        <AsyncStatRow
          path={charMeta.path}
          element={charMeta.element}
          elementalDmgValue={elementalDmgValue}
          promise={promise}
          type={type}
          subType={subType}
          stat={Stats.CD}
          edits={edits}
        />
        <AsyncStatRow
          path={charMeta.path}
          element={charMeta.element}
          elementalDmgValue={elementalDmgValue}
          promise={promise}
          type={type}
          subType={subType}
          stat={Stats.EHR}
          edits={edits}
        />
        <AsyncStatRow
          path={charMeta.path}
          element={charMeta.element}
          elementalDmgValue={elementalDmgValue}
          promise={promise}
          type={type}
          subType={subType}
          stat={Stats.RES}
          edits={edits}
        />
        <AsyncStatRow
          path={charMeta.path}
          element={charMeta.element}
          elementalDmgValue={elementalDmgValue}
          promise={promise}
          type={type}
          subType={subType}
          stat={Stats.BE}
          edits={edits}
        />

        <AsyncStatRow
          path={charMeta.path}
          element={charMeta.element}
          elementalDmgValue={elementalDmgValue}
          promise={promise}
          type={type}
          subType={subType}
          stat={Stats.OHB}
          edits={edits}
        />

        <AsyncStatRow
          path={charMeta.path}
          element={charMeta.element}
          elementalDmgValue={elementalDmgValue}
          promise={promise}
          type={type}
          subType={subType}
          stat={Stats.ERR}
          edits={edits}
        />

        <AsyncStatRow
          path={charMeta.path}
          element={charMeta.element}
          elementalDmgValue={elementalDmgValue}
          promise={promise}
          type={type}
          subType={subType}
          stat={elementalDmgValue}
          edits={edits}
        />

        {charMeta.path === PathNames.Elation
          && (
            <AsyncStatRow
              path={charMeta.path}
              element={charMeta.element}
              elementalDmgValue={elementalDmgValue}
              promise={promise}
              type={type}
              subType={subType}
              stat={Stats.Elation}
              edits={edits}
            />
          )}

        {configType != null && <AsyncSimScoreRow promise={promise} type={type} configType={configType} buffStat={buffStat} />}
      </div>
    </StatText>
  )
})

function AsyncSimScoreRow({ promise, type, configType, buffStat }: {
  promise: Promise<SimulationScore | null>,
  type: ScoringColumnKind.BENCHMARK | ScoringColumnKind.PERFECT,
  configType: ScoringConfigType,
  buffStat?: AKeyValue,
}) {
  const output = usePromise(promise)
  const sim = output?.[type === ScoringColumnKind.BENCHMARK ? 'benchmarkSim' : 'maximumSim']
  if (!sim?.result) return null

  return <SimScoreRow value={sim.result.simScore} configType={configType} buffStat={buffStat} />
}

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
