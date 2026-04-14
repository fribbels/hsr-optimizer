import { Skeleton } from '@mantine/core'
import type { TFunction } from 'i18next'
import {
  BuffDisplaySize,
  BuffsAnalysisDisplay,
} from 'lib/characterPreview/buildAnalysis/BuffsAnalysisDisplay'
import type { ShowcaseMetadata } from 'lib/characterPreview/characterPreviewController'
import { DPSScoreDisclaimer } from 'lib/characterPreview/DPSScoreDisclaimer'
import {
  ScoringSelector,
  SimScoringContext,
  useSimScoringContext,
} from 'lib/characterPreview/SimScoringContext'
import { DpsScoreGradeRuler } from 'lib/characterPreview/summary/DpsScoreGradeRuler'
import { DpsScoreMainStatUpgradesTable } from 'lib/characterPreview/summary/DpsScoreMainStatUpgradesTable'
import { DpsScoreSubstatUpgradesTable } from 'lib/characterPreview/summary/DpsScoreSubstatUpgradesTable'
import { EstimatedTbpRelicsDisplay } from 'lib/characterPreview/summary/EstimatedTbpRelicsDisplay'
import { ElementToDamage } from 'lib/constants/constants'
import { defaultGap } from 'lib/constants/constantsUi'
import type { SingleRelicByPart } from 'lib/gpu/webgpuTypes'
import { Assets } from 'lib/rendering/assets'
import type { SimulationScore } from 'lib/scoring/simScoringUtils'
import { ColorizedTitleWithInfo } from 'lib/ui/ColorizedLink'
import {
  DeferCreate,
  DeferCreateProvider,
} from 'lib/ui/DeferredRender'
import { VerticalDivider } from 'lib/ui/Dividers'
import { SuspenseNode } from 'lib/ui/SuspenseNode'
import { numberToLocaleString } from 'lib/utils/i18nUtils'
import {
  memo,
  useContext,
} from 'react'
import { useTranslation } from 'react-i18next'
import type { Form } from 'types/form'
import classes from './CharacterScoringSummary.module.css'
import {
  CharacterScoringColumn,
  SimulationScoringColumn,
} from './ScoringColumns'

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
  const scoringPromise = useContext(SimScoringContext).scoringPromise
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: defaultGap }}>
                <div style={{ display: 'flex' }}>
                  <SuspenseNode
                    selector={(score: SimulationScore | null) =>
                      score
                        ? <ScoringSet set={score.maximumSim.request.simRelicSet1} />
                        : null}
                    promise={scoringPromise}
                    circle
                    className={classes.setImage}
                  />
                  <SuspenseNode
                    selector={(score: SimulationScore | null) =>
                      score
                        ? <ScoringSet set={score.maximumSim.request.simRelicSet2} />
                        : null}
                    promise={scoringPromise}
                    circle
                    className={classes.setImage}
                  />
                </div>

                <SuspenseNode
                  selector={(score: SimulationScore | null) =>
                    score
                      ? <ScoringSet set={score.maximumSim.request.simOrnamentSet} />
                      : null}
                  promise={scoringPromise}
                  circle
                  className={classes.setImage}
                />
              </div>
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
                  // @ts-expect-error - not all sortOption keys have translations yet
                  text={t(`CombatResults.Abilities.${preview.characterMetadata.scoringMetadata.sortOption.key}`)}
                />
                <ScoringNumber label={t('CombatResults.Character')} number={preview.originalSimResult.simScore} precision={1} />
                <ScoringNumber label={t('CombatResults.Baseline')} number={preview.baselineSimResult.simScore} precision={1} />
                <SuspenseNode
                  promise={scoringPromise}
                  fallback={<ScoringNumber label={t('CombatResults.Benchmark')} />}
                  selector={(result: SimulationScore | null) => {
                    if (result === null) return null
                    return (
                      <ScoringNumber
                        label={t('CombatResults.Benchmark')}
                        number={result.benchmarkSimScore}
                        precision={1}
                      />
                    )
                  }}
                />
                <SuspenseNode
                  promise={scoringPromise}
                  fallback={<ScoringNumber label={t('CombatResults.Maximum')} />}
                  selector={(result: SimulationScore | null) => {
                    if (result === null) return null
                    return (
                      <ScoringNumber
                        label={t('CombatResults.Maximum')}
                        number={result.maximumSimScore}
                        precision={1}
                      />
                    )
                  }}
                />
                <SuspenseNode
                  promise={scoringPromise}
                  fallback={<ScoringNumber label={t('CombatResults.Score')} />}
                  selector={(result: SimulationScore | null) => {
                    if (result === null) return null
                    return (
                      <ScoringNumber
                        label={t('CombatResults.Score')}
                        number={result.percent * 100}
                        precision={2}
                        suffix=' %'
                      />
                    )
                  }}
                />
              </div>
            </div>
          </DeferCreate>
        </div>
      </div>
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

  return (
    <div style={{ display: 'flex', gap: 12 }}>
      <CharacterScoringColumn
        characterId={characterId}
        elementalDmgValue={elementalDmgValue}
        element={element}
        characterMetadata={characterMetadata}
      />

      <SimulationScoringColumn
        characterId={characterId}
        elementalDmgValue={elementalDmgValue}
        element={element}
        characterMetadata={characterMetadata}
        type='Benchmark'
      />

      <SimulationScoringColumn
        characterId={characterId}
        elementalDmgValue={elementalDmgValue}
        element={element}
        characterMetadata={characterMetadata}
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
