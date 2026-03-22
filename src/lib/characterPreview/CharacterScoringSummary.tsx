import { Alert, Divider, Flex } from '@mantine/core'
import { debugLog, renderLog } from 'lib/debug/renderDebug'
import classes from './CharacterScoringSummary.module.css'
import { BuffDisplaySize, BuffsAnalysisDisplay } from 'lib/characterPreview/BuffsAnalysisDisplay'
import { type ShowcaseMetadata } from 'lib/characterPreview/characterPreviewController'
import { CharacterStatSummary } from 'lib/characterPreview/CharacterStatSummary'
import { AbilityDamageSummary } from 'lib/characterPreview/summary/AbilityDamageSummary'
import { ComboRotationSummary } from 'lib/characterPreview/summary/ComboRotationSummary'
import { DpsScoreGradeRuler } from 'lib/characterPreview/summary/DpsScoreGradeRuler'
import { DpsScoreMainStatUpgradesTable } from 'lib/characterPreview/summary/DpsScoreMainStatUpgradesTable'
import { DpsScoreSubstatUpgradesTable } from 'lib/characterPreview/summary/DpsScoreSubstatUpgradesTable'
import { EstimatedTbpRelicsDisplay } from 'lib/characterPreview/summary/EstimatedTbpRelicsDisplay'
import { SubstatRollsSummary } from 'lib/characterPreview/summary/SubstatRollsSummary'
import { type ElementName, ElementToDamage, type MainStats, PathNames, Parts, Stats } from 'lib/constants/constants'
import { defaultGap } from 'lib/constants/constantsUi'
import { type SingleRelicByPart } from 'lib/gpu/webgpuTypes'
import { toBasicStatsObject } from 'lib/optimization/basicStatsArray'
import { Assets } from 'lib/rendering/assets'
import {
  diminishingReturnsFormula,
  getElementalDmgFromContainer,
  ScoringType,
  type SimulationScore,
  spdDiminishingReturnsFormula,
  StatsToStatKey,
} from 'lib/scoring/simScoringUtils'
import { type RunStatSimulationsResult, type Simulation } from 'lib/simulations/statSimulationTypes'
import { getGameMetadata } from 'lib/state/gameMetadata'
import { ColorizedTitleWithInfo } from 'lib/ui/ColorizedLink'
import { VerticalDivider } from 'lib/ui/Dividers'
import { numberToLocaleString } from 'lib/utils/i18nUtils'
import { clone } from 'lib/utils/objectUtils'
import { memo, useMemo } from 'react'
import { useProgressivePhase } from 'lib/characterPreview/useProgressivePhase'
import { Trans, useTranslation } from 'react-i18next'
import { DPSScoreDisclaimer } from 'lib/characterPreview/DPSScoreDisclaimer'
import { type CharacterId } from 'types/character'
import { truncate10ths, precisionRound } from 'lib/utils/mathUtils'

function ScoringSet(props: {
  set: string
}) {
  return (
    <Flex direction="column" align='center' gap={2}>
      <img src={Assets.getSetImage(props.set)} className={classes.setImage}/>
    </Flex>
  )
}

function ScoringStat(props: {
  stat: string
  part: string
}) {
  const display = props.stat?.replace('Boost', '') || ''
  return (
    <Flex align='center' gap={10}>
      <img src={Assets.getPart(props.part)} className={classes.partImage}/>
      <pre style={{ margin: 0 }}>{display}</pre>
    </Flex>
  )
}

function ScoringNumber(props: {
  label: string
  number?: number
  precision?: number
  useGrouping?: boolean
}) {
  const precision = props.precision ?? 1
  const value = props.number ?? 0
  const show = value !== 0
  return (
    <Flex gap={15} justify='space-between'>
      <pre style={{ margin: 0 }}>{props.label}</pre>
      <pre className={classes.preTextRight}>{show && numberToLocaleString(value, precision, props.useGrouping)}</pre>
    </Flex>
  )
}

function ScoringInteger(props: {
  label: string
  number?: number
  valueWidth?: number
}) {
  const value = props.number ?? 0
  return (
    <Flex gap={9} justify='space-between'>
      <pre style={{ margin: 0 }}>{props.label}</pre>
      <pre style={{ margin: 0, width: props.valueWidth }}>{value}</pre>
    </Flex>
  )
}

function ScoringText(props: {
  label: string
  text?: string
}) {
  const value = props.text ?? ''
  return (
    <Flex align='center' gap={1} justify='space-between'>
      <pre style={{ margin: 0 }}>{props.label}</pre>
      <pre className={classes.preTextRight}>{value}</pre>
    </Flex>
  )
}

function ScoringColumn(props: {
  simulation: Simulation
  originalSimResult: RunStatSimulationsResult
  percent: number
  precision: number
  type: 'Character' | 'Benchmark' | 'Perfect'
  characterId: CharacterId
  elementalDmgValue: string
  element: ElementName
  characterMetadata: { path: string }

}) {
  renderLog(`ScoringColumn[${props.type}]`)
  const { t } = useTranslation(['charactersTab', 'common'])

  const simulation = useMemo(() => clone(props.simulation), [props.simulation])
  const simRequest = simulation.request
  const simResult = simulation.result!

  const basicStats = toBasicStatsObject(simResult.ca)
  const combatStats = props.originalSimResult.x.toComputedStatsObject()

  const highlight = props.type === 'Character'
  const color = 'rgb(225, 165, 100)'
  ;(combatStats as Record<string, number>)[props.elementalDmgValue] = getElementalDmgFromContainer(props.originalSimResult.x, props.element)

  if (props.characterMetadata.path === PathNames.Elation) {
    combatStats[Stats.Elation] = props.originalSimResult.x.getSelfValue(StatsToStatKey[Stats.Elation])
  }

  const diminishingReturns: Record<string, number> = {}
  if (props.type === 'Benchmark') {
    for (const [stat, rolls] of Object.entries(simRequest.stats)) {
      const mainsCount = [
        simRequest.simBody,
        simRequest.simFeet,
        simRequest.simPlanarSphere,
        simRequest.simLinkRope,
        Stats.ATK,
        Stats.HP,
      ].filter((x) => x === stat).length
      if (stat === Stats.SPD) {
        diminishingReturns[stat] = rolls - spdDiminishingReturnsFormula(mainsCount, rolls)
      } else {
        diminishingReturns[stat] = rolls - diminishingReturnsFormula(mainsCount, rolls)
      }
    }
  }

  const precision = props.precision

  return (
    <Flex direction="column" gap={25} style={{ margin: 'auto' }}>
      <Flex direction="column" gap={defaultGap}>
        <Flex justify='space-around'>
          <pre className={classes.scoringColumnHeader} style={{ color: highlight ? color : '' }}>
            <u>{t(`CharacterPreview.ScoringColumn.${props.type}.Header`, { score: truncate10ths(precisionRound(props.percent * 100)) })}</u>
          </pre>
          {/* Character/Benchmark/Perfect build ({{score}}%) */}
        </Flex>
      </Flex>

      <Flex direction="column" gap={defaultGap} className={classes.statPreviewSection}>
        <pre style={{ margin: 'auto', color: highlight ? color : '' }}>
          {t(`CharacterPreview.ScoringColumn.${props.type}.BasicStats`)}
        </pre>
        {/* Character/100% benchmark/200% prefect basic stats */}
        <CharacterStatSummary
          characterId={props.characterId}
          finalStats={basicStats}
          elementalDmgValue={props.elementalDmgValue}
          simScore={simResult.simScore}
          showAll={true}
          scoringDone={true}
          scoringResult={null}
        />
      </Flex>

      <Flex direction="column" gap={defaultGap} className={classes.statPreviewSection}>
        <pre style={{ margin: 'auto', color: highlight ? color : '' }}>
          <Trans t={t} i18nKey={`CharacterPreview.ScoringColumn.${props.type}.CombatStats`}>
            build type <u>combat stats</u>
          </Trans>
        </pre>
        <CharacterStatSummary
          characterId={props.characterId}
          finalStats={combatStats}
          elementalDmgValue={props.elementalDmgValue}
          simScore={simResult.simScore}
          showAll={true}
          scoringDone={true}
          scoringResult={null}
        />
      </Flex>

      <Flex direction="column" gap={defaultGap}>
        <pre style={{ margin: '10px auto', color: highlight ? color : '' }}>
          {t(`CharacterPreview.ScoringColumn.${props.type}.Substats`)}
        </pre>
        {/* Character subs (min rolls)/100% benchmark subs (min rolls)/200% perfect subs (max rolls) */}

        <SubstatRollsSummary
          simRequest={simulation.request}
          precision={precision}
          diminish={props.type === 'Benchmark'}
          columns={2}
        />
      </Flex>

      <Flex direction="column" gap={defaultGap}>
        <pre style={{ margin: '0 auto', color: highlight ? color : '' }}>
          {t(`CharacterPreview.ScoringColumn.${props.type}.Mainstats`)}
        </pre>
        {/* Character main stats/100% benchmark main stats/200% perfect main stats */}
        <Flex gap={defaultGap} justify='space-around'>
          <Flex direction="column" gap={10}>
            <ScoringStat stat={simRequest.simBody ? t(`common:ReadableStats.${simRequest.simBody as MainStats}`) : ''} part={Parts.Body}/>
            <ScoringStat stat={simRequest.simFeet ? t(`common:ReadableStats.${simRequest.simFeet as MainStats}`) : ''} part={Parts.Feet}/>
            <ScoringStat stat={simRequest.simPlanarSphere ? t(`common:ReadableStats.${simRequest.simPlanarSphere as MainStats}`) : ''} part={Parts.PlanarSphere}/>
            <ScoringStat stat={simRequest.simLinkRope ? t(`common:ReadableStats.${simRequest.simLinkRope as MainStats}`) : ''} part={Parts.LinkRope}/>
          </Flex>
        </Flex>
      </Flex>

      <Flex direction="column" gap={20} className={classes.abilityDamageSection}>
        <pre style={{ margin: '0 auto', color: highlight ? color : '' }}>
          {t(`CharacterPreview.ScoringColumn.${props.type}.Abilities`)}
        </pre>
        {/* Character/100% benchmark/200% perfect ability damage */}
        <AbilityDamageSummary
          simResult={simulation.result!}
        />
      </Flex>
    </Flex>
  )
}

export const CharacterScoringSummary = memo(function CharacterScoringSummary({
  simScoringResult,
  displayRelics,
  showcaseMetadata,
}: {
  simScoringResult?: SimulationScore
  displayRelics: SingleRelicByPart
  showcaseMetadata: ShowcaseMetadata
}) {
  const { t } = useTranslation(['charactersTab', 'common'])

  const result = useMemo(
    () => simScoringResult ? clone(simScoringResult) : undefined,
    [simScoringResult],
  )

  const phase = useProgressivePhase(result, 4)
  debugLog('CharacterScoringSummary', `render: phase=${phase} hasResult=${!!result}`)

  // Derived values — computed safely with optional chaining so hooks below can run
  // unconditionally (React requires hooks to be called in the same order every render).
  const characterId = result?.simulationForm.characterId
  const characterMetadata = characterId ? getGameMetadata().characters[characterId] : undefined
  const elementalDmgValue = characterMetadata ? ElementToDamage[characterMetadata.element] : undefined
  const element = characterMetadata?.element as ElementName | undefined

  const divider = useMemo(() => (
    <Flex direction="column">
      <Divider orientation='vertical' className={classes.columnDivider}/>
    </Flex>
  ), [])

  // Memoize each section's JSX so phase increments don't re-render already-visible sections.
  // When phase advances (state change → re-render), React sees the same element references
  // for existing sections and bails out of reconciling them.
  // Each useMemo guards on `result` to handle the pre-scoring state safely.

  // Phase 0: Grade ruler (always visible)
  const gradeRulerJsx = useMemo(() => {
    if (!result) return null
    return (
      <Flex align='center' direction="column" gap={5}>
        <pre className={classes.mainTitle}>
          <ColorizedTitleWithInfo
            text={t('CharacterPreview.BuildAnalysis.Header')/* Character build analysis */}
            url='https://github.com/fribbels/hsr-optimizer/blob/main/docs/guides/en/dps-score.md'
          />
        </pre>
        <DPSScoreDisclaimer/>
        <DpsScoreGradeRuler
          score={result.originalSimScore}
          minimum={result.baselineSimScore}
          maximum={result.maximumSimScore}
          benchmark={result.benchmarkSimScore}
        />
      </Flex>
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result])

  // Phase 1: Upgrade tables
  const upgradeTablesJsx = useMemo(() => {
    if (!result) return null
    return (
      <>
        <Flex gap={defaultGap} direction="column" w='100%' align='center'>
          <pre className={classes.sectionTitle}>
            {t('CharacterPreview.SubstatUpgradeComparisons.Header')/* Substat upgrade comparisons */}
          </pre>
          <DpsScoreSubstatUpgradesTable simScore={result}/>
        </Flex>

        <Flex gap={defaultGap} direction="column" w='100%' align='center'>
          <pre className={classes.sectionTitle}>
            {t('CharacterPreview.SubstatUpgradeComparisons.MainStatHeader')/* Main stat upgrade comparisons */}
          </pre>
          <DpsScoreMainStatUpgradesTable simScore={result}/>
        </Flex>
      </>
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result])

  // Phase 2: Relic rarity + simulated benchmarks
  const relicBenchmarksJsx = useMemo(() => {
    if (!result) return null
    return (
      <>
        <Flex gap={defaultGap} direction="column" className={classes.relicRaritySection} align='center'>
          <ColorizedTitleWithInfo
            text={t('CharacterPreview.BuildAnalysis.RelicRarityHeader')/* Relic rarity upgrade comparisons */}
            url='https://github.com/fribbels/hsr-optimizer/blob/main/docs/guides/en/stat-score.md#estimated-tbp'
          />
          <Alert
            color='blue'
            className={classes.relicRarityAlert}
          >
            {t('CharacterPreview.BuildAnalysis.RelicRarityNote')}
          </Alert>
          <EstimatedTbpRelicsDisplay
            displayRelics={displayRelics}
            showcaseMetadata={showcaseMetadata}
            scoringType={ScoringType.COMBAT_SCORE}
          />
        </Flex>

        <pre className={classes.sectionTitle}>
          {t('CharacterPreview.BuildAnalysis.SimulatedBenchmarks')/* Simulated benchmark builds */}
        </pre>

        <Flex gap={25} w='100%' justify='space-around'>
          <Flex direction="column" gap={defaultGap}>
            <pre style={{ margin: '5px auto' }}>
              {t('CharacterPreview.BuildAnalysis.SimulationTeammates')/* Simulation teammates */}
            </pre>
            <Flex gap={15}>
              <ScoringTeammate result={result} index={0}/>
              <ScoringTeammate result={result} index={1}/>
              <ScoringTeammate result={result} index={2}/>
            </Flex>
          </Flex>

          <VerticalDivider/>

          <Flex direction="column" gap={defaultGap}>
            <pre style={{ margin: '5px auto' }}>
              {t('CharacterPreview.BuildAnalysis.SimulationSets')/* Simulation sets */}
            </pre>
            <Flex direction="column" gap={defaultGap}>
              <Flex>
                <ScoringSet set={result.maximumSim.request.simRelicSet1}/>
                <ScoringSet set={result.maximumSim.request.simRelicSet2}/>
              </Flex>
              <ScoringSet set={result.maximumSim.request.simOrnamentSet}/>
            </Flex>
          </Flex>

          <VerticalDivider/>

          <Flex direction="column" gap={defaultGap}>
            <pre style={{ margin: '5px auto' }}>
              {t('CharacterPreview.BuildAnalysis.Rotation.Header')/* Combo damage rotation */}
            </pre>
            <ComboRotationSummary
              simMetadata={result.simulationMetadata}
            />
          </Flex>

          <VerticalDivider/>

          <Flex direction="column" gap={10}>
            <pre style={{ margin: '5px auto' }}>
              {t('CharacterPreview.BuildAnalysis.CombatResults.Header')/* Combat damage results */}
            </pre>
            <Flex direction="column" gap={10} className={classes.combatResultsWidth}>
              <ScoringText
                label={t('CharacterPreview.BuildAnalysis.CombatResults.Primary')}
                text={
                  // @ts-expect-error - type of key is not specific enough for ts to know that t() will resolve properly
                  t(`CharacterPreview.BuildAnalysis.CombatResults.Abilities.${result.characterMetadata.scoringMetadata.sortOption.key}`)
                }
              />
              <ScoringNumber label={t('CharacterPreview.BuildAnalysis.CombatResults.Character')} number={result.originalSimScore} precision={1}/>
              <ScoringNumber label={t('CharacterPreview.BuildAnalysis.CombatResults.Baseline')} number={result.baselineSimScore} precision={1}/>
              <ScoringNumber label={t('CharacterPreview.BuildAnalysis.CombatResults.Benchmark')} number={result.benchmarkSimScore} precision={1}/>
              <ScoringNumber label={t('CharacterPreview.BuildAnalysis.CombatResults.Maximum')} number={result.maximumSimScore} precision={1}/>
              <ScoringNumber label={t('CharacterPreview.BuildAnalysis.CombatResults.Score')} number={result.percent * 100} precision={2}/>
            </Flex>
          </Flex>
        </Flex>
      </>
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result, displayRelics, showcaseMetadata])

  // Phase 3: Scoring columns
  const scoringColumnsJsx = useMemo(() => {
    if (!result || !simScoringResult || !characterId || !characterMetadata || !elementalDmgValue || !element) return null
    return (
      <Flex>
        <ScoringColumn
          simulation={result.originalSim}
          originalSimResult={simScoringResult.originalSimResult}
          percent={result.percent}
          precision={2}
          type='Character'
          characterId={characterId}
          elementalDmgValue={elementalDmgValue}
          element={element}
          characterMetadata={characterMetadata}
        />

        {divider}

        <ScoringColumn
          simulation={result.benchmarkSim}
          originalSimResult={simScoringResult.benchmarkSimResult}
          percent={1.00}
          precision={0}
          type='Benchmark'
          characterId={characterId}
          elementalDmgValue={elementalDmgValue}
          element={element}
          characterMetadata={characterMetadata}
        />

        {divider}

        <ScoringColumn
          simulation={result.maximumSim}
          originalSimResult={simScoringResult.maximumSimResult}
          percent={2.00}
          precision={0}
          type='Perfect'
          characterId={characterId}
          elementalDmgValue={elementalDmgValue}
          element={element}
          characterMetadata={characterMetadata}
        />
      </Flex>
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result, simScoringResult])

  // Phase 4: Buffs analysis
  const buffsJsx = useMemo(() => {
    if (!result) return null
    return (
      <Flex direction="column" align='center' w='100%'>
        <pre className={classes.sectionTitle}>
          {
            result.simulationForm.deprioritizeBuffs
              ? t('CharacterPreview.BuildAnalysis.CombatBuffs.SubDpsHeader')/* Combat buffs (Sub DPS) */
              : t('CharacterPreview.BuildAnalysis.CombatBuffs.Header')/* Combat buffs */
          }
        </pre>

        <BuffsAnalysisDisplay result={result} size={BuffDisplaySize.LARGE} twoColumn/>
      </Flex>
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result])

  // Early return after all hooks
  if (!simScoringResult || !result) return null

  return (
    <Flex direction="column" gap={15} align='center' className={classes.rootContainer}>
      {gradeRulerJsx}
      {phase >= 1 && upgradeTablesJsx}
      {phase >= 2 && relicBenchmarksJsx}
      {phase >= 3 && scoringColumnsJsx}
      {phase >= 4 && buffsJsx}
    </Flex>
  )
})

function ScoringTeammate({ result, index }: {
  result: SimulationScore
  index: number
}) {
  const { t } = useTranslation('common')
  const teammate = result.simulationMetadata.teammates[index]
  return (
    <Flex direction="column" align='center' gap={5}>
      <img src={Assets.getCharacterAvatarById(teammate.characterId)} className={classes.teammateIcon}/>
      <pre style={{ margin: 0 }}>
        {t('EidolonNShort', { eidolon: teammate.characterEidolon })}
      </pre>
      <img src={Assets.getLightConeIconById(teammate.lightCone)} className={classes.teammateIcon}/>
      <pre style={{ margin: 0 }}>
        {t('SuperimpositionNShort', { superimposition: teammate.lightConeSuperimposition })}
      </pre>
    </Flex>
  )
}
