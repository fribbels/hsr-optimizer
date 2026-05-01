import { SegmentedControl } from '@mantine/core'
import { CharacterScoringSummary } from 'lib/characterPreview/buildAnalysis/CharacterScoringSummary'
import { ShowcaseSource } from 'lib/characterPreview/CharacterPreviewComponents'
import type {
  PreviewRelics,
  ShowcaseMetadata,
} from 'lib/characterPreview/characterPreviewController'
import { EstimatedTbpRelicsDisplay } from 'lib/characterPreview/summary/EstimatedTbpRelicsDisplay'
import { SavedSessionKeys } from 'lib/constants/constantsSession'
import type { SingleRelicByPart } from 'lib/gpu/webgpuTypes'

import {
  ScoringSelector,
  useSimScoringContext,
} from 'lib/characterPreview/SimScoringContext'
import { type AKeyValue, StatKey } from 'lib/optimization/engine/config/keys'
import { SELF_ENTITY_INDEX } from 'lib/optimization/engine/config/tag'
import { AbilityKind } from 'lib/optimization/rotation/turnAbilityConfig'
import { getSimScoreGrade } from 'lib/scoring/dpsScore'
import { ScoringType, substatRollsModifier } from 'lib/scoring/simScoringUtils'
import { SaveState } from 'lib/state/saveState'
import { useGlobalStore } from 'lib/stores/app/appStore'
import { ColorizedTitleWithInfo } from 'lib/ui/ColorizedLink'
import { localeNumber_0 } from 'lib/utils/i18nUtils'
import { truncate10ths } from 'lib/utils/mathUtils'
import {
  memo,
  Suspense,
  useCallback,
  useMemo,
} from 'react'
import { useTranslation } from 'react-i18next'

interface ShowcaseBuildAnalysisProps {
  scoringType: ScoringType
  showcaseMetadata: ShowcaseMetadata
  displayRelics: PreviewRelics
  source: ShowcaseSource
}

export const ShowcaseBuildAnalysis = memo(function ShowcaseBuildAnalysis({
  scoringType,
  showcaseMetadata,
  displayRelics,
  source,
}: ShowcaseBuildAnalysisProps) {
  const { t } = useTranslation(['charactersTab', 'modals', 'common'])

  const { characterMetadata } = showcaseMetadata

  const simulationNull = characterMetadata.scoringMetadata.simulation == null && characterMetadata.scoringMetadata.supportSimulation == null
  const segmentData = useMemo(() => [
    {
      label: simulationNull
        ? t('CharacterPreview.AlgorithmSlider.Labels.CombatScoreTBD') /* Combat Score (TBD) */
        : t('CharacterPreview.AlgorithmSlider.Labels.CombatScore'), /* Combat Score */
      value: String(ScoringType.COMBAT_SCORE),
      disabled: simulationNull,
    },
    {
      label: t('CharacterPreview.AlgorithmSlider.Labels.StatScore'), /* Stat Score */
      value: String(ScoringType.SUBSTAT_SCORE),
      disabled: false,
    },
    {
      label: t('CharacterPreview.AlgorithmSlider.Labels.NoneScore'), /* None Score */
      value: String(ScoringType.NONE),
      disabled: false,
    },
  ], [simulationNull, t])

  const handleScoringTypeChange = useCallback((selection: string) => {
    const value = Number(selection) as ScoringType
    useGlobalStore.getState().setSavedSessionKey(SavedSessionKeys.scoringType, value)
    SaveState.delayedSave()
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: 1000 }}>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 10 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            borderRadius: 6,
            height: 40,
            marginTop: 10,
            marginBottom: 10,
            backgroundColor: 'color-mix(in srgb, var(--layer-0) 52%, transparent)',
            alignItems: 'center',
          }}
        >
          <SegmentedControl
            size='sm'
            style={{ width: 400 }}
            onChange={handleScoringTypeChange}
            value={String(scoringType)}
            fullWidth
            data={segmentData}
          />
        </div>
      </div>
      {scoringType === ScoringType.COMBAT_SCORE
        && !simulationNull
        && (
          <>
            {characterMetadata.scoringMetadata.simulation != null && (
              <CharacterScoringSummary
                displayRelics={displayRelics}
                showcaseMetadata={showcaseMetadata}
                source={source}
              />
            )}
            <SupportScoreSummary />
          </>
        )}
      {(scoringType === ScoringType.SUBSTAT_SCORE || simulationNull)
        && (
          <StatScoringSummary
            displayRelics={displayRelics}
            showcaseMetadata={showcaseMetadata}
          />
        )}
    </div>
  )
})

function StatScoringSummary({ displayRelics, showcaseMetadata }: {
  displayRelics: PreviewRelics,
  showcaseMetadata: ShowcaseMetadata,
}) {
  const { t } = useTranslation('charactersTab', { keyPrefix: 'CharacterPreview.EST-TBP' })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <ColorizedTitleWithInfo
        text={t('Header') /* Stat Score Analysis */}
        url='https://github.com/fribbels/hsr-optimizer/blob/main/docs/guides/en/stat-score.md'
      />
      <EstimatedTbpRelicsDisplay
        displayRelics={displayRelics}
        showcaseMetadata={showcaseMetadata}
      />
    </div>
  )
}

function SupportScoreSummary() {
  const result = useSimScoringContext(ScoringSelector.SupportScore)
  if (!result) return null

  const percent = Math.max(0, result.percent * 100)
  const grade = getSimScoreGrade(result.percent, true, 6, true)

  const metadata = result.simulationMetadata
  const flags = result.simulationFlags

  const benchmarkStats = result.benchmarkSim?.request?.stats ?? {}
  const originalStats = result.originalSim?.request?.stats ?? {}
  const maximumStats = result.maximumSim?.request?.stats ?? {}

  const upgrades = result.substatUpgrades ?? []
  const setUpgrades = result.setUpgrades ?? []
  const mainUpgrades = result.mainUpgrades ?? []

  const cellStyle: React.CSSProperties = { padding: '2px 8px', borderBottom: '1px solid rgba(255,255,255,0.08)', fontFamily: 'monospace', fontSize: 12 }
  const headerStyle: React.CSSProperties = { ...cellStyle, fontWeight: 600, color: 'rgba(255,255,255,0.7)' }
  const sectionStyle: React.CSSProperties = { marginBottom: 12 }
  const titleStyle: React.CSSProperties = { fontWeight: 600, fontSize: 14, marginBottom: 4, color: '#8cb4ff' }

  const getStat = (simResult: typeof result.originalSimResult, key: AKeyValue) => {
    try {
      return simResult?.x?.getActionValueByIndex(key, SELF_ENTITY_INDEX) ?? 0
    } catch {
      try { return simResult?.x?.a?.[key as number] ?? 0 } catch { return 0 }
    }
  }

  const FLAT_BUFF_STATS: Set<AKeyValue> = new Set([StatKey.ATK, StatKey.HP, StatKey.DEF, StatKey.SPD])
  const isFlatBuff = metadata.buffStat != null && FLAT_BUFF_STATS.has(metadata.buffStat)
  const formatBuff = (value: number) => {
    if (isFlatBuff) return value.toFixed(0)
    return `${(value * 100).toFixed(2)}%`
  }

  return (
    <div style={{ padding: '16px 24px', margin: '10px 0', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 8 }}>
      <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 12, textAlign: 'center' }}>
        Support Score: {localeNumber_0(truncate10ths(percent))}% {grade}
      </div>

      <div style={sectionStyle}>
        <div style={titleStyle}>Buff Values</div>
        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead>
            <tr>
              <td style={headerStyle}></td>
              <td style={headerStyle}>Buff Value</td>
              <td style={headerStyle}>simScore</td>
              <td style={headerStyle}>ATK</td>
              <td style={headerStyle}>CD</td>
              <td style={headerStyle}>BE</td>
              <td style={headerStyle}>SPD</td>
              <td style={headerStyle}>RES</td>
            </tr>
          </thead>
          <tbody>
            {([
              ['Your build', result.originalSimResult, result.originalSimScore],
              ['Baseline (0 rolls)', result.baselineSimResult, result.baselineSimScore],
              ['Benchmark (48/0.8)', result.benchmarkSimResult, result.benchmarkSimScore],
              ['Perfection (54/1.0)', result.maximumSimResult, result.maximumSimScore],
            ] as const).map(([label, simResult, simScore]) => {
              const buffValue = simResult?.actionDamage?.[AbilityKind.BUFF] ?? 0
              return (
                <tr key={label}>
                  <td style={headerStyle}>{label}</td>
                  <td style={{ ...cellStyle, fontWeight: 700, color: '#6f6' }}>{formatBuff(buffValue)}</td>
                  <td style={cellStyle}>{simScore.toFixed(4)}</td>
                  <td style={cellStyle}>{getStat(simResult, StatKey.ATK).toFixed(0)}</td>
                  <td style={cellStyle}>{(getStat(simResult, StatKey.CD) * 100).toFixed(1)}%</td>
                  <td style={cellStyle}>{(getStat(simResult, StatKey.BE) * 100).toFixed(1)}%</td>
                  <td style={cellStyle}>{getStat(simResult, StatKey.SPD).toFixed(1)}</td>
                  <td style={cellStyle}>{(getStat(simResult, StatKey.RES) * 100).toFixed(1)}%</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div style={sectionStyle}>
        <div style={titleStyle}>Score Normalization</div>
        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
          <tbody>
            <tr>
              <td style={headerStyle}>Percent</td>
              <td style={cellStyle}>{percent.toFixed(2)}%</td>
              <td style={headerStyle}>Grade</td>
              <td style={cellStyle}>{grade}</td>
            </tr>
            <tr>
              <td style={headerStyle}>Original simScore</td>
              <td style={cellStyle}>{result.originalSimScore.toFixed(6)}</td>
              <td style={headerStyle}>Baseline simScore</td>
              <td style={cellStyle}>{result.baselineSimScore.toFixed(6)}</td>
            </tr>
            <tr>
              <td style={headerStyle}>Benchmark simScore</td>
              <td style={cellStyle}>{result.benchmarkSimScore.toFixed(6)}</td>
              <td style={headerStyle}>Perfection simScore</td>
              <td style={cellStyle}>{result.maximumSimScore.toFixed(6)}</td>
            </tr>
            <tr>
              <td style={headerStyle}>Original SPD</td>
              <td style={cellStyle}>{result.originalSpd?.toFixed(2)}</td>
              <td style={headerStyle}>SPD Benchmark</td>
              <td style={cellStyle}>{result.spdBenchmark?.toFixed(2) ?? 'auto'}</td>
            </tr>
            <tr>
              <td style={headerStyle}>Formula</td>
              <td style={{ ...cellStyle, fontSize: 11 }} colSpan={3}>
                (original - baseline) / (benchmark - baseline) = ({result.originalSimScore.toFixed(4)} - {result.baselineSimScore.toFixed(4)}) / ({result.benchmarkSimScore.toFixed(4)} - {result.baselineSimScore.toFixed(4)}) = {percent.toFixed(2)}%
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style={sectionStyle}>
        <div style={titleStyle}>Flags</div>
        <div style={{ fontFamily: 'monospace', fontSize: 11, whiteSpace: 'pre-wrap', color: 'rgba(255,255,255,0.7)' }}>
          {JSON.stringify(flags, null, 2)}
        </div>
      </div>

      <div style={sectionStyle}>
        <div style={titleStyle}>Substat Allocations</div>
        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead>
            <tr>
              <td style={headerStyle}>Stat</td>
              <td style={headerStyle}>Original (raw)</td>
              <td style={headerStyle}>Benchmark (raw)</td>
              <td style={headerStyle}>Benchmark (DR)</td>
              <td style={headerStyle}>Perfection (raw)</td>
            </tr>
          </thead>
          <tbody>
            {Object.keys(benchmarkStats).filter((k) => {
              const o = (originalStats as Record<string, number>)[k] ?? 0
              const b = (benchmarkStats as Record<string, number>)[k] ?? 0
              const m = (maximumStats as Record<string, number>)[k] ?? 0
              return o > 0 || b > 0 || m > 0
            }).map((stat) => {
              const rawBenchmark = (benchmarkStats as Record<string, number>)[stat] ?? 0
              const drBenchmark = substatRollsModifier(rawBenchmark, stat, result.benchmarkSim)
              return (
                <tr key={stat}>
                  <td style={headerStyle}>{stat}</td>
                  <td style={cellStyle}>{((originalStats as Record<string, number>)[stat] ?? 0).toFixed(2)}</td>
                  <td style={cellStyle}>{rawBenchmark.toFixed(2)}</td>
                  <td style={cellStyle}>{drBenchmark.toFixed(2)}</td>
                  <td style={cellStyle}>{((maximumStats as Record<string, number>)[stat] ?? 0).toFixed(2)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {upgrades.length > 0 && (
        <div style={sectionStyle}>
          <div style={titleStyle}>Substat Upgrades (+1 roll)</div>
          <table style={{ borderCollapse: 'collapse', width: '100%' }}>
            <thead>
              <tr>
                <td style={headerStyle}>Stat</td>
                <td style={headerStyle}>New Score</td>
                <td style={headerStyle}>Delta</td>
              </tr>
            </thead>
            <tbody>
              {upgrades
                .filter((u) => u.simulationResult?.simScore != null)
                .sort((a, b) => (b.simulationResult?.simScore ?? 0) - (a.simulationResult?.simScore ?? 0))
                .map((u) => {
                  const delta = (u.simulationResult?.simScore ?? 0) - result.originalSimScore
                  return (
                    <tr key={u.stat}>
                      <td style={headerStyle}>{u.stat}</td>
                      <td style={cellStyle}>{u.simulationResult?.simScore?.toFixed(6)}</td>
                      <td style={{ ...cellStyle, color: delta > 0 ? '#6f6' : delta < 0 ? '#f66' : 'inherit' }}>
                        {delta > 0 ? '+' : ''}{delta.toFixed(6)}
                      </td>
                    </tr>
                  )
                })}
            </tbody>
          </table>
        </div>
      )}

      {setUpgrades.length > 0 && (
        <div style={sectionStyle}>
          <div style={titleStyle}>Set Upgrades</div>
          <div style={{ fontFamily: 'monospace', fontSize: 11 }}>
            Score: {setUpgrades[0]?.simulationResult?.simScore?.toFixed(6)}
            {' (delta: '}
            {((setUpgrades[0]?.simulationResult?.simScore ?? 0) - result.originalSimScore).toFixed(6)}
            {')'}
          </div>
          <div style={{ fontFamily: 'monospace', fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>
            Benchmark sets: {result.benchmarkSim?.request?.simRelicSet1} / {result.benchmarkSim?.request?.simRelicSet2} + {result.benchmarkSim?.request?.simOrnamentSet}
          </div>
        </div>
      )}

      {mainUpgrades.length > 0 && (
        <div style={sectionStyle}>
          <div style={titleStyle}>Main Stat Upgrades</div>
          <table style={{ borderCollapse: 'collapse', width: '100%' }}>
            <thead>
              <tr>
                <td style={headerStyle}>Part</td>
                <td style={headerStyle}>Stat</td>
                <td style={headerStyle}>New Score</td>
                <td style={headerStyle}>Delta</td>
              </tr>
            </thead>
            <tbody>
              {mainUpgrades
                .filter((u) => u.simulationResult?.simScore != null)
                .sort((a, b) => (b.simulationResult?.simScore ?? 0) - (a.simulationResult?.simScore ?? 0))
                .map((u, i) => {
                  const delta = (u.simulationResult?.simScore ?? 0) - result.originalSimScore
                  return (
                    <tr key={i}>
                      <td style={headerStyle}>{u.part}</td>
                      <td style={cellStyle}>{u.stat}</td>
                      <td style={cellStyle}>{u.simulationResult?.simScore?.toFixed(6)}</td>
                      <td style={{ ...cellStyle, color: delta > 0 ? '#6f6' : delta < 0 ? '#f66' : 'inherit' }}>
                        {delta > 0 ? '+' : ''}{delta.toFixed(6)}
                      </td>
                    </tr>
                  )
                })}
            </tbody>
          </table>
        </div>
      )}

      <div style={sectionStyle}>
        <div style={titleStyle}>Simulation Metadata</div>
        <div style={{ fontFamily: 'monospace', fontSize: 11, whiteSpace: 'pre-wrap', color: 'rgba(255,255,255,0.6)', maxHeight: 200, overflow: 'auto' }}>
          {JSON.stringify({
            parts: metadata.parts,
            substats: metadata.substats,
            deprioritizeBuffs: metadata.deprioritizeBuffs,
            relicSets: metadata.relicSets,
            ornamentSets: metadata.ornamentSets,
            breakpoints: metadata.breakpoints,
            teammates: metadata.teammates?.map((t) => t.characterId),
          }, null, 2)}
        </div>
      </div>
    </div>
  )
}
