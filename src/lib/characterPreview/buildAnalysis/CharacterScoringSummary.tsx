import { Skeleton } from '@mantine/core'
import { type TFunction } from 'i18next'
import {
  BuffDisplaySize,
  BuffsAnalysisDisplay,
} from 'lib/characterPreview/buildAnalysis/BuffsAnalysisDisplay'
import { CharacterStatSummary } from 'lib/characterPreview/card/CharacterStatSummary'
import type { ShowcaseMetadata } from 'lib/characterPreview/characterPreviewController'
import { DPSScoreDisclaimer } from 'lib/characterPreview/DPSScoreDisclaimer'
import {
  ScoringSelector,
  useSimScoringContext,
} from 'lib/characterPreview/SimScoringContext'
import { AbilityDamageSummary } from 'lib/characterPreview/summary/AbilityDamageSummary'
import { DpsScoreGradeRuler } from 'lib/characterPreview/summary/DpsScoreGradeRuler'
import { DpsScoreMainStatUpgradesTable } from 'lib/characterPreview/summary/DpsScoreMainStatUpgradesTable'
import { DpsScoreSubstatUpgradesTable } from 'lib/characterPreview/summary/DpsScoreSubstatUpgradesTable'
import { EstimatedTbpRelicsDisplay } from 'lib/characterPreview/summary/EstimatedTbpRelicsDisplay'
import { MainStatsSummary } from 'lib/characterPreview/summary/MainStatsSummary'
import { SubstatRollsSummary } from 'lib/characterPreview/summary/SubstatRollsSummary'
import {
  type ElementName,
  ElementToDamage,
  PathNames,
  Stats,
} from 'lib/constants/constants'
import { defaultGap } from 'lib/constants/constantsUi'
import type { SingleRelicByPart } from 'lib/gpu/webgpuTypes'
import { toBasicStatsObject } from 'lib/optimization/basicStatsArray'
import { type TurnAbilityName } from 'lib/optimization/rotation/turnAbilityConfig'
import { Assets } from 'lib/rendering/assets'
import {
  getElementalDmgFromContainer,
  StatsToStatKey,
} from 'lib/scoring/simScoringUtils'
import type {
  RunStatSimulationsResult,
  Simulation,
} from 'lib/simulations/statSimulationTypes'
import { getGameMetadata } from 'lib/state/gameMetadata'
import { ColorizedTitleWithInfo } from 'lib/ui/ColorizedLink'
import {
  DeferCreate,
  DeferCreateProvider,
} from 'lib/ui/DeferredRender'
import { VerticalDivider } from 'lib/ui/Dividers'
import { numberToLocaleString } from 'lib/utils/i18nUtils'
import {
  precisionRound,
  truncate10ths,
} from 'lib/utils/mathUtils'
import {
  memo,
  Suspense,
} from 'react'
import {
  Trans,
  useTranslation,
} from 'react-i18next'
import type { CharacterId } from 'types/character'
import { type Form } from 'types/form'
import classes from './CharacterScoringSummary.module.css'
import {
  CharacterScoringColumn,
  SimulationScoringColumn,
} from './ScoringColumns'

// ─── ScoringColumn ────────────────────────────────────────────────────────────

function ScoringColumnReady() {}

function ScoringColumnPending() {}

function ScoringColumn(props: {
  simulation: Simulation,
  originalSimResult: RunStatSimulationsResult,
  percent: number | null,
  precision: number,
  type: 'Character' | 'Benchmark' | 'Perfect',
  characterId: CharacterId,
  elementalDmgValue: string,
  element: ElementName,
  characterMetadata: { path: string },
  columnClassName?: string,
  comboTurnAbilities: TurnAbilityName[],
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

  // only the character scoring column will pass as null (when waiting for scores to load)
  // others have an entirely seperate column for loading state as there is far less information available
  const headerText = props.percent !== null
    ? t(`CharacterPreview.ScoringColumn.${props.type}.Header`, {
      score: truncate10ths(precisionRound(props.percent * 100)),
    })
    : t('CharacterPreview.ScoringColumn.Character.LoadingHeader')

  const basicStatsBlock = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: defaultGap }} className={classes.statPreviewSection}>
      <div className={classes.sectionLabel} style={{ color: highlight ? color : '' }}>
        <Trans t={t} i18nKey={`CharacterPreview.ScoringColumn.${props.type}.BasicStats`}>
          build type <u>basic stats</u>
        </Trans>
      </div>
      <CharacterStatSummary
        characterId={props.characterId}
        finalStats={basicStats}
        elementalDmgValue={props.elementalDmgValue}
        simScore={simResult.simScore}
        showAll={true}
        zebra
      />
    </div>
  )

  const combatStatsBlock = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: defaultGap }} className={classes.statPreviewSection}>
      <div className={classes.sectionLabel} style={{ color: highlight ? color : '' }}>
        <Trans t={t} i18nKey={`CharacterPreview.ScoringColumn.${props.type}.CombatStats`}>
          build type <u>combat stats</u>
        </Trans>
      </div>
      <CharacterStatSummary
        characterId={props.characterId}
        finalStats={combatStats}
        elementalDmgValue={props.elementalDmgValue}
        simScore={simResult.simScore}
        showAll={true}
        zebra
      />
    </div>
  )

  const substatsBlock = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: defaultGap }}>
      <div className={classes.sectionLabel} style={{ color: highlight ? color : '' }}>
        {t(`CharacterPreview.ScoringColumn.${props.type}.Substats`)}
      </div>
      <SubstatRollsSummary
        simRequest={props.simulation.request}
        precision={props.precision}
        diminish={props.type === 'Benchmark'}
        columns={2}
      />
    </div>
  )

  const mainstatsBlock = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: defaultGap }}>
      <div className={classes.sectionLabel} style={{ color: highlight ? color : '' }}>
        {t(`CharacterPreview.ScoringColumn.${props.type}.Mainstats`)}
      </div>
      <div style={{ display: 'flex', gap: defaultGap, justifyContent: 'space-around' }}>
        <MainStatsSummary
          simBody={simRequest.simBody}
          simFeet={simRequest.simFeet}
          simPlanarSphere={simRequest.simPlanarSphere}
          simLinkRope={simRequest.simLinkRope}
        />
      </div>
    </div>
  )

  const abilityBlock = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }} className={classes.abilityDamageSection}>
      <div className={classes.sectionLabel} style={{ color: highlight ? color : '' }}>
        {t(`CharacterPreview.ScoringColumn.${props.type}.Abilities`)}
      </div>
      <AbilityDamageSummary rotationDamage={simResult.rotationDamage ?? []} comboTurnAbilities={props.comboTurnAbilities} />
    </div>
  )

  return (
    <div className={props.columnClassName}>
      <div className={classes.columnFilledHeader}>
        <div className={classes.scoringColumnHeader} style={{ color: highlight ? color : '' }}>
          {headerText}
          {props.percent === null && <Skeleton width={60} />}
        </div>
      </div>
      <div className={classes.columnFilledBody}>
        <DeferCreate>
          <div className={classes.columnFilledSection}>{basicStatsBlock}</div>
        </DeferCreate>
        <DeferCreate>
          <div className={classes.columnFilledSection}>{combatStatsBlock}</div>
        </DeferCreate>
        <DeferCreate>
          <div className={classes.columnFilledSection}>{substatsBlock}</div>
        </DeferCreate>
        <DeferCreate>
          <div className={classes.columnFilledSection}>{mainstatsBlock}</div>
        </DeferCreate>
        <DeferCreate>
          <div className={classes.columnFilledSection}>{abilityBlock}</div>
        </DeferCreate>
      </div>
    </div>
  )
}

// ─── Primitives used by ScoringBenchmarksPanel ───────────────────────────────

function ScoringSet(props: { set: string }) {
  return <img src={Assets.getSetImage(props.set)} className={classes.setImage} />
}

function ScoringNumber(props: {
  label: string,
  number?: number,
  precision?: number,
  useGrouping?: boolean,
  suffix?: string,
}) {
  const precision = props.precision ?? 1
  const value = props.number ?? 0
  const show = value !== 0
  return (
    <div style={{ display: 'flex', gap: 15, justifyContent: 'space-between' }}>
      <span className={classes.dataLabel}>{props.label}</span>
      <span className={classes.dataValue}>{show && `${numberToLocaleString(value, precision, props.useGrouping)}${props.suffix ?? ''}`}</span>
    </div>
  )
}

function ScoringText(props: {
  label: string,
  text?: string,
}) {
  const value = props.text ?? ''
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'space-between' }}>
      <span className={classes.dataLabel}>{props.label}</span>
      <span className={classes.dataValue}>{value}</span>
    </div>
  )
}

function ScoringTeammate({ form, index }: {
  form: Form,
  index: 0 | 1 | 2,
}) {
  const { t } = useTranslation('common')
  const teammate = form[`teammate${index}`]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
      <img src={Assets.getCharacterAvatarById(teammate.characterId)} className={classes.teammateIcon} />
      <span className={classes.annotation}>
        {t('EidolonNShort', { eidolon: teammate.characterEidolon })}
      </span>
      <img src={Assets.getLightConeIconById(teammate.lightCone)} className={classes.teammateIcon} />
      <span className={classes.annotation}>
        {t('SuperimpositionNShort', { superimposition: teammate.lightConeSuperimposition })}
      </span>
    </div>
  )
}

// ─── ScoringBenchmarksPanel ──────────────────────────────────────────────────

function ScoringBenchmarksPanel() {
  const { t } = useTranslation('charactersTab')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 15 }}>
      <div className={classes.sectionTitle}>
        {t('CharacterPreview.BuildAnalysis.SimulatedBenchmarks')}
      </div>
      <BenchmarkDefaultLayout />
    </div>
  )
}

function BenchmarkDefaultLayout() {
  const { t } = useTranslation('charactersTab', { keyPrefix: 'CharacterPreview.BuildAnalysis' })
  const preview = useSimScoringContext(ScoringSelector.Preview)
  if (preview === null) return null
  return (
    <div className={classes.columnCardFilled} style={{ width: '100%' }}>
      <div className={classes.columnFilledBody}>
        <div style={{ display: 'flex', gap: 25, justifyContent: 'space-around' }}>
          <DeferCreate>
            <div style={{ display: 'flex', flexDirection: 'column', gap: defaultGap }}>
              <div className={classes.sectionLabel} style={{ margin: '5px auto' }}>
                {t('SimulationTeammates')}
              </div>
              <div style={{ display: 'flex', gap: 15 }}>
                <ScoringTeammate form={preview.simForm} index={0} />
                <ScoringTeammate form={preview.simForm} index={1} />
                <ScoringTeammate form={preview.simForm} index={2} />
              </div>
            </div>
          </DeferCreate>

          <VerticalDivider />

          <DeferCreate>
            <div style={{ display: 'flex', flexDirection: 'column', gap: defaultGap }}>
              <div className={classes.sectionLabel} style={{ margin: '5px auto' }}>
                {t('SimulationSets')}
              </div>
              <SimSetPreview />
            </div>
          </DeferCreate>

          <VerticalDivider />

          <DeferCreate>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div className={classes.sectionLabel} style={{ margin: '5px auto' }}>
                {t('CombatResults.Header')}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }} className={classes.combatResultsWidth}>
                <ScoringText
                  label={t('CombatResults.Primary')}
                  text={
                    // @ts-expect-error - type of key is not specific enough
                    t(`CombatResults.Abilities.${preview.characterMetadata.scoringMetadata.sortOption.key}`)
                  }
                />
                <ScoringNumber label={t('CombatResults.Character')} number={preview.originalSimResult.simScore} precision={1} />
                <ScoringNumber label={t('CombatResults.Baseline')} number={preview.baselineSimResult.simScore} precision={1} />
                <SuspendedScoringNumbers t={t} />
              </div>
            </div>
          </DeferCreate>
        </div>
      </div>
    </div>
  )
}

function SuspendedScoringNumbers({ t }: { t: TFunction<'charactersTab', 'CharacterPreview.BuildAnalysis'> }) {
  return (
    <Suspense fallback={<ScoringNumbersPending t={t} />}>
      <ScoringNumbersReady t={t} />
    </Suspense>
  )
}

const idxToLabel = ['Benchmark', 'Maximum', 'Score'] as const
function ScoringNumbersPending({ t }: { t: TFunction<'charactersTab', 'CharacterPreview.BuildAnalysis'> }) {
  return (
    <>
      {Array.from({ length: 3 }).map((_, idx) => (
        <div key={idx} style={{ display: 'flex', gap: 15, justifyContent: 'space-between' }}>
          <span className={classes.dataLabel}>{t(`CombatResults.${idxToLabel[idx]}`)}</span>
          <Skeleton style={{ justifySelf: 'right' }} width={80} />
        </div>
      ))}
    </>
  )
}

function ScoringNumbersReady({ t }: { t: TFunction<'charactersTab', 'CharacterPreview.BuildAnalysis'> }) {
  const result = useSimScoringContext(ScoringSelector.Score)
  if (result === null) return null
  return (
    <>
      <ScoringNumber label={t('CombatResults.Benchmark')} number={result.benchmarkSimScore} precision={1} />
      <ScoringNumber label={t('CombatResults.Maximum')} number={result.maximumSimScore} precision={1} />
      <ScoringNumber label={t('CombatResults.Score')} number={result.percent * 100} precision={2} suffix=' %' />
    </>
  )
}

function SimSetPreview() {
  return (
    <Suspense fallback={<SimSetPreviewPending />}>
      <SimSetPreviewReady />
    </Suspense>
  )
}

function SimSetPreviewPending() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: defaultGap }}>
      <div style={{ display: 'flex' }}>
        <Skeleton height={60} width={120} radius={30} />
      </div>
      <Skeleton height={60} circle style={{ margin: 'auto' }} />
    </div>
  )
}

function SimSetPreviewReady() {
  const result = useSimScoringContext(ScoringSelector.Score)
  if (result === null) return null
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: defaultGap }}>
      <div style={{ display: 'flex' }}>
        <ScoringSet set={result.maximumSim.request.simRelicSet1} />
        <ScoringSet set={result.maximumSim.request.simRelicSet2} />
      </div>
      <ScoringSet set={result.maximumSim.request.simOrnamentSet} />
    </div>
  )
}

// ─── ScoringColumnsSection ────────────────────────────────────────────────────

function ScoringColumnsSection() {
  const preview = useSimScoringContext(ScoringSelector.Preview)
  if (preview === null) return null
  const characterId = preview.characterMetadata.id
  const characterMetadata = preview.characterMetadata
  const elementalDmgValue = ElementToDamage[characterMetadata.element]
  const element = characterMetadata.element

  const comboTurnAbilities = preview.simForm.comboTurnAbilities

  return (
    <div style={{ display: 'flex', gap: 12 }}>
      <CharacterScoringColumn
        characterId={characterId}
        elementalDmgValue={elementalDmgValue}
        element={element}
        characterMetadata={characterMetadata}
        comboTurnAbilities={comboTurnAbilities}
      />

      <SimulationScoringColumn
        characterId={characterId}
        elementalDmgValue={elementalDmgValue}
        element={element}
        characterMetadata={characterMetadata}
        comboTurnAbilities={comboTurnAbilities}
        type='Benchmark'
      />

      <SimulationScoringColumn
        characterId={characterId}
        elementalDmgValue={elementalDmgValue}
        element={element}
        characterMetadata={characterMetadata}
        comboTurnAbilities={comboTurnAbilities}
        type='Perfect'
      />
    </div>
  )
}

// ─── CharacterScoringSummary ──────────────────────────────────────────────────

export const CharacterScoringSummary = memo(function CharacterScoringSummary({
  displayRelics,
  showcaseMetadata,
}: {
  displayRelics: SingleRelicByPart,
  showcaseMetadata: ShowcaseMetadata,
}) {
  const { t } = useTranslation('charactersTab')

  return (
    <DeferCreateProvider resetKey={showcaseMetadata.characterId}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 15, alignItems: 'center' }} className={classes.rootContainer}>
        {/* Grade ruler */}
        <DeferCreate>
          <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'column', gap: 5, width: '100%' }}>
            <div className={classes.mainTitle}>
              <ColorizedTitleWithInfo
                text={t('CharacterPreview.BuildAnalysis.Header')}
                url='https://github.com/fribbels/hsr-optimizer/blob/main/docs/guides/en/dps-score.md'
              />
            </div>
            <DPSScoreDisclaimer />
            <DpsScoreGradeRuler />
          </div>
        </DeferCreate>

        {/* Substat upgrade table */}
        <DeferCreate>
          <div style={{ display: 'flex', gap: defaultGap, flexDirection: 'column', width: '100%', alignItems: 'center' }}>
            <div className={classes.sectionTitle}>
              {t('CharacterPreview.SubstatUpgradeComparisons.Header')}
            </div>
            <DpsScoreSubstatUpgradesTable meta={showcaseMetadata.characterMetadata.scoringMetadata.simulation!} />
          </div>
        </DeferCreate>

        {/* Main stat upgrade table */}
        <DeferCreate>
          <div style={{ display: 'flex', gap: defaultGap, flexDirection: 'column', width: '100%', alignItems: 'center' }}>
            <div className={classes.sectionTitle}>
              {t('CharacterPreview.SubstatUpgradeComparisons.MainStatHeader')}
            </div>
            <DpsScoreMainStatUpgradesTable
              meta={showcaseMetadata}
              relics={displayRelics}
            />
          </div>
        </DeferCreate>

        {/* Relic rarity */}
        <DeferCreate>
          <div style={{ display: 'flex', gap: defaultGap, flexDirection: 'column', alignItems: 'center' }} className={classes.relicRaritySection}>
            <ColorizedTitleWithInfo
              text={t('CharacterPreview.BuildAnalysis.RelicRarityHeader')}
              url='https://github.com/fribbels/hsr-optimizer/blob/main/docs/guides/en/stat-score.md#estimated-tbp'
              fontSize={24}
            />
            <EstimatedTbpRelicsDisplay
              displayRelics={displayRelics}
              showcaseMetadata={showcaseMetadata}
            />
          </div>
        </DeferCreate>

        {/* Simulated benchmarks */}
        <DeferCreate>
          <ScoringBenchmarksPanel />
        </DeferCreate>

        {/* Three-column scoring comparison */}
        <DeferCreate>
          <ScoringColumnsSection />
        </DeferCreate>

        {/* Buffs analysis */}
        <DeferCreate>
          <WrappedBuffAnalysisDisplay t={t} />
        </DeferCreate>
      </div>
    </DeferCreateProvider>
  )
})

const WrappedBuffAnalysisDisplay = memo(function({ t }: { t: TFunction<'charactersTab', undefined> }) {
  const preview = useSimScoringContext(ScoringSelector.Preview)
  if (preview === null) return null
  console.log(preview.simForm)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
      <div className={classes.sectionTitle}>
        {preview.simForm.deprioritizeBuffs
          ? t('CharacterPreview.BuildAnalysis.CombatBuffs.SubDpsHeader')
          : t('CharacterPreview.BuildAnalysis.CombatBuffs.Header')}
      </div>
      <BuffsAnalysisDisplay
        originalSim={preview.originalSim}
        simulationForm={preview.simForm}
        size={BuffDisplaySize.LARGE}
        twoColumn
      />
    </div>
  )
})
