import { Alert, Divider } from '@mantine/core'
import classes from './CharacterScoringSummary.module.css'
import { BuffDisplaySize, BuffsAnalysisDisplay } from 'lib/characterPreview/buildAnalysis/BuffsAnalysisDisplay'
import { type ShowcaseMetadata } from 'lib/characterPreview/characterPreviewController'
import { CharacterStatSummary } from 'lib/characterPreview/card/CharacterStatSummary'
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
  getElementalDmgFromContainer,
  ScoringType,
  type SimulationScore,
  StatsToStatKey,
} from 'lib/scoring/simScoringUtils'
import { type RunStatSimulationsResult, type Simulation } from 'lib/simulations/statSimulationTypes'
import { getGameMetadata } from 'lib/state/gameMetadata'
import { ColorizedTitleWithInfo } from 'lib/ui/ColorizedLink'
import { VerticalDivider } from 'lib/ui/Dividers'
import { numberToLocaleString } from 'lib/utils/i18nUtils'
import { memo } from 'react'
import { DeferCreate, DeferCreateProvider } from 'lib/ui/DeferredRender'
import { Trans, useTranslation } from 'react-i18next'
import { DPSScoreDisclaimer } from 'lib/characterPreview/DPSScoreDisclaimer'
import { type CharacterId } from 'types/character'
import { truncate10ths, precisionRound } from 'lib/utils/mathUtils'

// ─── Primitives used by ScoringColumn ────────────────────────────────────────

function ScoringStat(props: {
  stat: string
  part: string
}) {
  const display = props.stat?.replace('Boost', '') || ''
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <img src={Assets.getPart(props.part)} className={classes.partImage}/>
      <pre style={{ margin: 0 }}>{display}</pre>
    </div>
  )
}

// ─── ScoringColumn ────────────────────────────────────────────────────────────

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
  const { t } = useTranslation(['charactersTab', 'common'])

  const simRequest = props.simulation.request
  const simResult = props.simulation.result
  if (!simResult) return null

  const basicStats = toBasicStatsObject(simResult.ca)
  const combatStats = props.originalSimResult.x.toComputedStatsObject()

  const highlight = props.type === 'Character'
  const color = 'rgb(225, 165, 100)'
  ;(combatStats as Record<string, number>)[props.elementalDmgValue] = getElementalDmgFromContainer(props.originalSimResult.x, props.element)

  if (props.characterMetadata.path === PathNames.Elation) {
    combatStats[Stats.Elation] = props.originalSimResult.x.getSelfValue(StatsToStatKey[Stats.Elation])
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 25, margin: 'auto' }}>
      {/* Header + Basic stats */}
      <DeferCreate>
        <div style={{ display: 'flex', flexDirection: 'column', gap: defaultGap }}>
          <div>
            <pre className={classes.scoringColumnHeader} style={{ color: highlight ? color : '' }}>
              <u>{t(`CharacterPreview.ScoringColumn.${props.type}.Header`, { score: truncate10ths(precisionRound(props.percent * 100)) })}</u>
            </pre>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: defaultGap }} className={classes.statPreviewSection}>
          <pre style={{ margin: 'auto', color: highlight ? color : '' }}>
            {t(`CharacterPreview.ScoringColumn.${props.type}.BasicStats`)}
          </pre>
          <CharacterStatSummary
            characterId={props.characterId}
            finalStats={basicStats}
            elementalDmgValue={props.elementalDmgValue}
            simScore={simResult.simScore}
            showAll={true}
            scoringDone={true}
            scoringResult={null}
          />
        </div>
      </DeferCreate>

      {/* Combat stats */}
      <DeferCreate>
        <div style={{ display: 'flex', flexDirection: 'column', gap: defaultGap }} className={classes.statPreviewSection}>
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
        </div>
      </DeferCreate>

      {/* Substats */}
      <DeferCreate>
        <div style={{ display: 'flex', flexDirection: 'column', gap: defaultGap }}>
          <pre style={{ margin: '10px auto', color: highlight ? color : '' }}>
            {t(`CharacterPreview.ScoringColumn.${props.type}.Substats`)}
          </pre>
          <SubstatRollsSummary
            simRequest={props.simulation.request}
            precision={props.precision}
            diminish={props.type === 'Benchmark'}
            columns={2}
          />
        </div>
      </DeferCreate>

      {/* Mainstats */}
      <DeferCreate>
        <div style={{ display: 'flex', flexDirection: 'column', gap: defaultGap }}>
          <pre style={{ margin: '0 auto', color: highlight ? color : '' }}>
            {t(`CharacterPreview.ScoringColumn.${props.type}.Mainstats`)}
          </pre>
          <div style={{ display: 'flex', gap: defaultGap, justifyContent: 'space-around' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <ScoringStat stat={simRequest.simBody ? t(`common:ReadableStats.${simRequest.simBody as MainStats}`) : ''} part={Parts.Body}/>
              <ScoringStat stat={simRequest.simFeet ? t(`common:ReadableStats.${simRequest.simFeet as MainStats}`) : ''} part={Parts.Feet}/>
              <ScoringStat stat={simRequest.simPlanarSphere ? t(`common:ReadableStats.${simRequest.simPlanarSphere as MainStats}`) : ''} part={Parts.PlanarSphere}/>
              <ScoringStat stat={simRequest.simLinkRope ? t(`common:ReadableStats.${simRequest.simLinkRope as MainStats}`) : ''} part={Parts.LinkRope}/>
            </div>
          </div>
        </div>
      </DeferCreate>

      {/* Ability damage */}
      <DeferCreate>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }} className={classes.abilityDamageSection}>
          <pre style={{ margin: '0 auto', color: highlight ? color : '' }}>
            {t(`CharacterPreview.ScoringColumn.${props.type}.Abilities`)}
          </pre>
          <AbilityDamageSummary simResult={simResult}/>
        </div>
      </DeferCreate>
    </div>
  )
}

// ─── Primitives used by ScoringBenchmarksPanel ───────────────────────────────

function ScoringSet(props: {
  set: string
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      <img src={Assets.getSetImage(props.set)} className={classes.setImage}/>
    </div>
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
    <div style={{ display: 'flex', gap: 15, justifyContent: 'space-between' }}>
      <pre style={{ margin: 0 }}>{props.label}</pre>
      <pre className={classes.preTextRight}>{show && numberToLocaleString(value, precision, props.useGrouping)}</pre>
    </div>
  )
}

function ScoringText(props: {
  label: string
  text?: string
}) {
  const value = props.text ?? ''
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'space-between' }}>
      <pre style={{ margin: 0 }}>{props.label}</pre>
      <pre className={classes.preTextRight}>{value}</pre>
    </div>
  )
}

function ScoringTeammate({ result, index }: {
  result: SimulationScore
  index: number
}) {
  const { t } = useTranslation('common')
  const teammate = result.simulationMetadata.teammates[index]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
      <img src={Assets.getCharacterAvatarById(teammate.characterId)} className={classes.teammateIcon}/>
      <pre style={{ margin: 0 }}>
        {t('EidolonNShort', { eidolon: teammate.characterEidolon })}
      </pre>
      <img src={Assets.getLightConeIconById(teammate.lightCone)} className={classes.teammateIcon}/>
      <pre style={{ margin: 0 }}>
        {t('SuperimpositionNShort', { superimposition: teammate.lightConeSuperimposition })}
      </pre>
    </div>
  )
}

// ─── ScoringBenchmarksPanel ──────────────────────────────────────────────────

function ScoringBenchmarksPanel({ result }: { result: SimulationScore }) {
  const { t } = useTranslation('charactersTab')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 15 }} className={classes.deferredSection}>
      <pre className={classes.sectionTitle}>
        {t('CharacterPreview.BuildAnalysis.SimulatedBenchmarks')}
      </pre>
      <div style={{ display: 'flex', gap: 25, width: '100%', justifyContent: 'space-around' }}>
        <DeferCreate>
          <div style={{ display: 'flex', flexDirection: 'column', gap: defaultGap }}>
            <pre style={{ margin: '5px auto' }}>
              {t('CharacterPreview.BuildAnalysis.SimulationTeammates')}
            </pre>
            <div style={{ display: 'flex', gap: 15 }}>
              <ScoringTeammate result={result} index={0}/>
              <ScoringTeammate result={result} index={1}/>
              <ScoringTeammate result={result} index={2}/>
            </div>
          </div>
        </DeferCreate>

        <VerticalDivider/>

        <DeferCreate>
          <div style={{ display: 'flex', flexDirection: 'column', gap: defaultGap }}>
            <pre style={{ margin: '5px auto' }}>
              {t('CharacterPreview.BuildAnalysis.SimulationSets')}
            </pre>
            <div style={{ display: 'flex', flexDirection: 'column', gap: defaultGap }}>
              <div style={{ display: 'flex' }}>
                <ScoringSet set={result.maximumSim.request.simRelicSet1}/>
                <ScoringSet set={result.maximumSim.request.simRelicSet2}/>
              </div>
              <ScoringSet set={result.maximumSim.request.simOrnamentSet}/>
            </div>
          </div>
        </DeferCreate>

        <VerticalDivider/>

        <DeferCreate>
          <div style={{ display: 'flex', flexDirection: 'column', gap: defaultGap }}>
            <pre style={{ margin: '5px auto' }}>
              {t('CharacterPreview.BuildAnalysis.Rotation.Header')}
            </pre>
            <ComboRotationSummary simMetadata={result.simulationMetadata}/>
          </div>
        </DeferCreate>

        <VerticalDivider/>

        <DeferCreate>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <pre style={{ margin: '5px auto' }}>
              {t('CharacterPreview.BuildAnalysis.CombatResults.Header')}
            </pre>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }} className={classes.combatResultsWidth}>
              <ScoringText
                label={t('CharacterPreview.BuildAnalysis.CombatResults.Primary')}
                text={
                  // @ts-expect-error - type of key is not specific enough
                  t(`CharacterPreview.BuildAnalysis.CombatResults.Abilities.${result.characterMetadata.scoringMetadata.sortOption.key}`)
                }
              />
              <ScoringNumber label={t('CharacterPreview.BuildAnalysis.CombatResults.Character')} number={result.originalSimScore} precision={1}/>
              <ScoringNumber label={t('CharacterPreview.BuildAnalysis.CombatResults.Baseline')} number={result.baselineSimScore} precision={1}/>
              <ScoringNumber label={t('CharacterPreview.BuildAnalysis.CombatResults.Benchmark')} number={result.benchmarkSimScore} precision={1}/>
              <ScoringNumber label={t('CharacterPreview.BuildAnalysis.CombatResults.Maximum')} number={result.maximumSimScore} precision={1}/>
              <ScoringNumber label={t('CharacterPreview.BuildAnalysis.CombatResults.Score')} number={result.percent * 100} precision={2}/>
            </div>
          </div>
        </DeferCreate>
      </div>
    </div>
  )
}

// ─── ScoringColumnsSection ────────────────────────────────────────────────────

function ScoringColumnsSection({ result }: { result: SimulationScore }) {
  const characterId = result.simulationForm.characterId
  const characterMetadata = getGameMetadata().characters[characterId]
  if (!characterMetadata) return null
  const elementalDmgValue = ElementToDamage[characterMetadata.element]
  const element = characterMetadata.element as ElementName

  return (
    <div style={{ display: 'flex' }} className={classes.deferredSection}>
      <DeferCreate>
        <ScoringColumn
          simulation={result.originalSim}
          originalSimResult={result.originalSimResult}
          percent={result.percent}
          precision={2}
          type='Character'
          characterId={characterId}
          elementalDmgValue={elementalDmgValue}
          element={element}
          characterMetadata={characterMetadata}
        />
      </DeferCreate>

      <div>
        <Divider orientation='vertical' className={classes.columnDivider}/>
      </div>

      <DeferCreate>
        <ScoringColumn
          simulation={result.benchmarkSim}
          originalSimResult={result.benchmarkSimResult}
          percent={1.00}
          precision={0}
          type='Benchmark'
          characterId={characterId}
          elementalDmgValue={elementalDmgValue}
          element={element}
          characterMetadata={characterMetadata}
        />
      </DeferCreate>

      <div>
        <Divider orientation='vertical' className={classes.columnDivider}/>
      </div>

      <DeferCreate>
        <ScoringColumn
          simulation={result.maximumSim}
          originalSimResult={result.maximumSimResult}
          percent={2.00}
          precision={0}
          type='Perfect'
          characterId={characterId}
          elementalDmgValue={elementalDmgValue}
          element={element}
          characterMetadata={characterMetadata}
        />
      </DeferCreate>
    </div>
  )
}

// ─── CharacterScoringSummary ──────────────────────────────────────────────────

export const CharacterScoringSummary = memo(function CharacterScoringSummary({
  simScoringResult,
  displayRelics,
  showcaseMetadata,
}: {
  simScoringResult?: SimulationScore
  displayRelics: SingleRelicByPart
  showcaseMetadata: ShowcaseMetadata
}) {
  const { t } = useTranslation('charactersTab')

  if (!simScoringResult) return null
  const result = simScoringResult

  return (
    <DeferCreateProvider resetKey={result.simulationForm.characterId}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 15, alignItems: 'center' }} className={classes.rootContainer}>

        {/* Grade ruler */}
        <DeferCreate>
          <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'column', gap: 5 }}>
            <pre className={classes.mainTitle}>
              <ColorizedTitleWithInfo
                text={t('CharacterPreview.BuildAnalysis.Header')}
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
          </div>
        </DeferCreate>

        {/* Substat upgrade table */}
        <DeferCreate>
          <div style={{ display: 'flex', gap: defaultGap, flexDirection: 'column', width: '100%', alignItems: 'center' }}>
            <pre className={classes.sectionTitle}>
              {t('CharacterPreview.SubstatUpgradeComparisons.Header')}
            </pre>
            <DpsScoreSubstatUpgradesTable simScore={result}/>
          </div>
        </DeferCreate>

        {/* Main stat upgrade table */}
        <DeferCreate>
          <div style={{ display: 'flex', gap: defaultGap, flexDirection: 'column', width: '100%', alignItems: 'center' }}>
            <pre className={classes.sectionTitle}>
              {t('CharacterPreview.SubstatUpgradeComparisons.MainStatHeader')}
            </pre>
            <DpsScoreMainStatUpgradesTable simScore={result}/>
          </div>
        </DeferCreate>

        {/* Relic rarity */}
        <DeferCreate>
          <div style={{ display: 'flex', gap: defaultGap, flexDirection: 'column', alignItems: 'center' }} className={classes.relicRaritySection}>
            <ColorizedTitleWithInfo
              text={t('CharacterPreview.BuildAnalysis.RelicRarityHeader')}
              url='https://github.com/fribbels/hsr-optimizer/blob/main/docs/guides/en/stat-score.md#estimated-tbp'
            />
            <Alert color='blue' className={classes.relicRarityAlert}>
              {t('CharacterPreview.BuildAnalysis.RelicRarityNote')}
            </Alert>
            <EstimatedTbpRelicsDisplay
              displayRelics={displayRelics}
              showcaseMetadata={showcaseMetadata}
              scoringType={ScoringType.COMBAT_SCORE}
            />
          </div>
        </DeferCreate>

        {/* Simulated benchmarks */}
        <DeferCreate>
          <ScoringBenchmarksPanel result={result}/>
        </DeferCreate>

        {/* Three-column scoring comparison */}
        <ScoringColumnsSection result={result}/>

        {/* Buffs analysis */}
        <DeferCreate>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }} className={classes.deferredSection}>
            <pre className={classes.sectionTitle}>
              {result.simulationForm.deprioritizeBuffs
                ? t('CharacterPreview.BuildAnalysis.CombatBuffs.SubDpsHeader')
                : t('CharacterPreview.BuildAnalysis.CombatBuffs.Header')}
            </pre>
            <BuffsAnalysisDisplay result={result} size={BuffDisplaySize.LARGE} twoColumn/>
          </div>
        </DeferCreate>

      </div>
    </DeferCreateProvider>
  )
})
