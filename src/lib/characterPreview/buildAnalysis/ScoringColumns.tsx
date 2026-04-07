import { Skeleton } from '@mantine/core'
import { type TFunction } from 'i18next'
import { CharacterStatSummary } from 'lib/characterPreview/card/CharacterStatSummary'
import {
  ScoringSelector,
  useSimScoringContext,
} from 'lib/characterPreview/SimScoringContext'
import { AbilityDamageSummary } from 'lib/characterPreview/summary/AbilityDamageSummary'
import { MainStatsSummary } from 'lib/characterPreview/summary/MainStatsSummary'
import { SubstatRollsSummary } from 'lib/characterPreview/summary/SubstatRollsSummary'
import {
  type ElementName,
  ElementToDamage,
  type PathName,
  PathNames,
  Stats,
} from 'lib/constants/constants'
import { defaultGap } from 'lib/constants/constantsUi'
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
import { DeferCreate } from 'lib/ui/DeferredRender'
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
import classes from './CharacterScoringSummary.module.css'

const highlightColor = 'rgb(225, 165, 100)'

interface SharedScoringColumnProps {
  characterId: CharacterId
  elementalDmgValue: string
  element: ElementName
  characterMetadata: { path: PathName }
  comboTurnAbilities: TurnAbilityName[]
}

interface SimulationScoringColumnProps extends SharedScoringColumnProps {
  type: 'Benchmark' | 'Perfect'
}

function ScoringColumnPending(props: { type: 'Benchmark' | 'Perfect' }) {
  const { t } = useTranslation(['charactersTab', 'common'])
  const headerText = t(`CharacterPreview.ScoringColumn.${props.type}.Header`, { score: props.type === 'Benchmark' ? '100' : '200' })

  return (
    <div className={defaultClass} style={{ width: 300, display: 'flex', flexDirection: 'column' }}>
      <div className={classes.columnFilledHeader}>
        <div className={classes.scoringColumnHeader}>
          {headerText}
        </div>
      </div>
      <div className={classes.columnFilledBody} style={{ height: '100%' }}>
        <Skeleton height='100%'>foo</Skeleton>
      </div>
    </div>
  )
}

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
    : null

  const basicStatsBlock = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: defaultGap }} className={classes.statPreviewSection}>
      <div className={classes.sectionLabel} style={{ color: highlight ? highlightColor : '' }}>
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
      <div className={classes.sectionLabel} style={{ color: highlight ? highlightColor : '' }}>
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
      <div className={classes.sectionLabel} style={{ color: highlight ? highlightColor : '' }}>
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
      <div className={classes.sectionLabel} style={{ color: highlight ? highlightColor : '' }}>
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
      <div className={classes.sectionLabel} style={{ color: highlight ? highlightColor : '' }}>
        {t(`CharacterPreview.ScoringColumn.${props.type}.Abilities`)}
      </div>
      <AbilityDamageSummary rotationDamage={simResult.rotationDamage ?? []} comboTurnAbilities={props.comboTurnAbilities} />
    </div>
  )

  return (
    <div className={props.columnClassName}>
      {headerText
        ? (
          <div className={classes.columnFilledHeader}>
            <div className={classes.scoringColumnHeader} style={{ color: highlight ? highlightColor : '' }}>
              {headerText}
            </div>
          </div>
        )
        : <SuspendedHeader t={t} />}
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

function SuspendedHeader({ t }: { t: TFunction<readonly ['charactersTab', 'common'], undefined> }) {
  return (
    <Suspense fallback={<SuspendedHeaderShimmer t={t} />}>
      <SuspendedHeaderReady t={t} />
    </Suspense>
  )
}

function SuspendedHeaderShimmer({ t }: { t: TFunction<readonly ['charactersTab', 'common'], undefined> }) {
  const headerText = t('CharacterPreview.ScoringColumn.Character.LoadingHeader')
  return (
    <div className={classes.columnFilledHeader}>
      <div className={classes.scoringColumnHeader} style={{ color: highlightColor, display: 'flex' }}>
        {headerText}
        <Skeleton height='100%' width={50}>foo</Skeleton>
      </div>
    </div>
  )
}

function SuspendedHeaderReady({ t }: { t: TFunction<readonly ['charactersTab', 'common'], undefined> }) {
  const result = useSimScoringContext(ScoringSelector.Score)
  if (result === null) return null
  const headerText = t('CharacterPreview.ScoringColumn.Character.Header', {
    score: truncate10ths(precisionRound(result.percent * 100)),
  })
  return (
    <div className={classes.columnFilledHeader}>
      <div className={classes.scoringColumnHeader} style={{ color: highlightColor }}>
        {headerText}
      </div>
    </div>
  )
}

const highlightClass = `${classes.columnCardFilled} ${classes.columnHighlightFilled}`
export const CharacterScoringColumn = memo(function CharacterScoringColumn(props: SharedScoringColumnProps) {
  const preview = useSimScoringContext(ScoringSelector.Preview)
  if (preview === null) return null
  return (
    <ScoringColumn
      simulation={preview.originalSim}
      originalSimResult={preview.originalSimResult}
      percent={null}
      precision={2}
      type='Character'
      characterId={props.characterId}
      elementalDmgValue={props.elementalDmgValue}
      element={props.element}
      characterMetadata={props.characterMetadata}
      columnClassName={highlightClass}
      comboTurnAbilities={props.comboTurnAbilities}
    />
  )
})

export const SimulationScoringColumn = memo(function(props: SimulationScoringColumnProps) {
  return (
    <Suspense fallback={<ScoringColumnPending type={props.type} />}>
      <SimulationScoringColumnReady {...props} />
    </Suspense>
  )
})

const defaultClass = classes.columnCardFilled
function SimulationScoringColumnReady(props: SimulationScoringColumnProps) {
  const result = useSimScoringContext(ScoringSelector.Score)
  if (result === null) return null
  const isBenchmark = props.type === 'Benchmark'
  return (
    <ScoringColumn
      simulation={isBenchmark ? result.benchmarkSim : result.maximumSim}
      originalSimResult={isBenchmark ? result.benchmarkSimResult : result.maximumSimResult}
      percent={isBenchmark ? 1.00 : 2.00}
      precision={0}
      type={props.type}
      characterId={props.characterId}
      elementalDmgValue={props.elementalDmgValue}
      element={props.element}
      characterMetadata={props.characterMetadata}
      columnClassName={defaultClass}
      comboTurnAbilities={props.comboTurnAbilities}
    />
  )
}
