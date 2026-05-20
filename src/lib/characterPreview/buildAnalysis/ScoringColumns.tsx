import { Skeleton } from '@mantine/core'
import type { TFunction } from 'i18next'
import {
  AsyncCharacterStatSummary,
  CharacterStatSummary,
} from 'lib/characterPreview/card/CharacterStatSummary'
import {
  AbilityDamageSummary,
  AsyncAbilityDamageSummary,
  SummaryRows,
} from 'lib/characterPreview/summary/AbilityDamageSummary'
import { MainStatsSummary } from 'lib/characterPreview/summary/MainStatsSummary'
import { SubstatRollsSummary } from 'lib/characterPreview/summary/SubstatRollsSummary'
import {
  useScoringPipeline,
  useSimPreview,
} from 'lib/characterPreview/useSimScoringHooks'
import {
  type ElementName,
  type PathName,
  PathNames,
  Stats,
  type StatsValues,
} from 'lib/constants/constants'
import { defaultGap } from 'lib/constants/constantsUi'
import { toBasicStatsObject } from 'lib/optimization/basicStatsArray'
import { AbilityKind } from 'lib/optimization/rotation/turnAbilityConfig'
import { Assets } from 'lib/rendering/assets'
import {
  CONFIG_FIELD_MAP,
  resolveComboLabel,
  SCORING_CONFIG_REGISTRY,
  ScoringType,
} from 'lib/scoring/scoringConfig'
import {
  formatSimScore,
  getElementalDmgFromContainer,
  type SimulationScore,
  StatsToStatKey,
} from 'lib/scoring/simScoringUtils'
import type {
  RunStatSimulationsResult,
  Simulation,
} from 'lib/simulations/statSimulationTypes'
import { getScoringMetadata } from 'lib/stores/scoring/scoringStore'
import { DeferCreate } from 'lib/ui/DeferredRender'
import { SuspenseNode } from 'lib/ui/SuspenseNode'
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
import { ScoringConfigType } from 'types/metadata'
import classes from './CharacterScoringSummary.module.css'

const nullPromise = Promise.resolve(null)
const highlightColor = 'rgb(225, 165, 100)'

export enum ScoringColumnKind {
  CHARACTER = 'Character',
  BASELINE = 'Baseline',
  BENCHMARK = 'Benchmark',
  PERFECT = 'Perfect',
}

interface ExternalScoringColumnProps {
  characterId: CharacterId
  elementalDmgValue: StatsValues
  element: ElementName
  characterMetadata: { path: PathName }
  configType: ScoringConfigType
}

interface ExternalSimulationScoringColumnProps extends ExternalScoringColumnProps {
  type: ScoringColumnKind.BENCHMARK | ScoringColumnKind.PERFECT
}

interface SharedScoringColumnProps extends ExternalScoringColumnProps {
  percent: number | null
  precision: number
  columnClassName: string
}

interface SynchronousScoringColumnProps extends SharedScoringColumnProps {
  type: ScoringColumnKind.CHARACTER | ScoringColumnKind.BASELINE
  simulation: Simulation
  originalSimResult: RunStatSimulationsResult
}

interface AsynchronousScoringColumnProps extends SharedScoringColumnProps {
  type: ScoringColumnKind.BENCHMARK | ScoringColumnKind.PERFECT
  simulation: Promise<SimulationScore | null>
}

type ScoringColumnProps = SynchronousScoringColumnProps | AsynchronousScoringColumnProps

function isAsyncProps(props: ScoringColumnProps): props is AsynchronousScoringColumnProps {
  return props.type === ScoringColumnKind.BENCHMARK || props.type === ScoringColumnKind.PERFECT
}

const ScoringColumn = memo(function ScoringColumn(props: ScoringColumnProps) {
  const { t } = useTranslation(['charactersTab', 'common'])

  const highlight = props.type === ScoringColumnKind.CHARACTER

  // only the character scoring column will pass as null as all other info is available synchronously
  const headerText = props.percent !== null
    ? t(`CharacterPreview.ScoringColumn.${props.type}.Header`, {
      score: truncate10ths(precisionRound(props.percent * 100)).toFixed(1),
    })
    : null

  if (!isAsyncProps(props) && !props.simulation.result) return null

  const scoringEntry = SCORING_CONFIG_REGISTRY[props.configType]
  const scoringBuffStat = getScoringMetadata(props.characterId)[CONFIG_FIELD_MAP[props.configType]]?.buffStat
  const avatarSrc = Assets.getCharacterAvatarById(props.characterId)

  const setsBlock = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: defaultGap, alignItems: 'center' }}>
      <div className={classes.sectionLabel} style={{ color: highlight ? highlightColor : '' }}>
        {t(`CharacterPreview.ScoringColumn.${props.type}.Sets`)}
      </div>
      <div style={{ display: 'flex', height: 60, alignItems: 'center' }}>
        {isAsyncProps(props)
          ? (['simRelicSet1', 'simRelicSet2', 'simOrnamentSet'] as SetField[]).map((field) => (
            <SuspenseNode
              key={field}
              promise={props.simulation}
              circle
              className={classes.setImage}
              selector={setSelector(props.type, field)}
            />
          ))
          : ([props.simulation.request.simRelicSet1, props.simulation.request.simRelicSet2, props.simulation.request.simOrnamentSet]
            .filter(Boolean)
            .map((set, i) => <img key={i} src={Assets.getSetImage(set)} className={classes.setImage} />))}
      </div>
    </div>
  )

  const basicStatsBlock = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: defaultGap }} className={classes.statPreviewSection}>
      <div className={classes.sectionLabel} style={{ color: highlight ? highlightColor : '' }}>
        <Trans t={t} i18nKey={`CharacterPreview.ScoringColumn.${props.type}.BasicStats`}>
          build type <u>basic stats</u>
        </Trans>
      </div>
      {isAsyncProps(props)
        ? (
          <AsyncCharacterStatSummary
            characterId={props.characterId}
            elementalDmgValue={props.elementalDmgValue}
            zebra
            promise={props.simulation}
            type={props.type}
            subType='Basic'
            configType={props.configType}
            buffStat={scoringBuffStat}
          />
        )
        : (
          <CharacterStatSummary
            characterId={props.characterId}
            finalStats={toBasicStatsObject(props.simulation.result!.ca)}
            elementalDmgValue={props.elementalDmgValue}
            simScore={props.simulation.result!.simScore}
            configType={props.configType}
            scoringType={scoringEntry.scoringType}
            buffStat={scoringBuffStat}
            showAll={true}
            zebra
          />
        )}
    </div>
  )

  const combatStats = isAsyncProps(props) ? null : props.originalSimResult.x.toComputedStatsObject()
  if (!isAsyncProps(props)) {
    ;(combatStats as Record<string, number>)[props.elementalDmgValue] = getElementalDmgFromContainer(props.originalSimResult.x, props.element)
    if (props.characterMetadata.path === PathNames.Elation) {
      combatStats![Stats.Elation] = props.originalSimResult.x.getSelfValue(StatsToStatKey[Stats.Elation])
    }
  }

  const combatStatsBlock = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: defaultGap }} className={classes.statPreviewSection}>
      <div className={classes.sectionLabel} style={{ color: highlight ? highlightColor : '' }}>
        <Trans t={t} i18nKey={`CharacterPreview.ScoringColumn.${props.type}.CombatStats`}>
          build type <u>combat stats</u>
        </Trans>
      </div>
      {isAsyncProps(props)
        ? (
          <AsyncCharacterStatSummary
            characterId={props.characterId}
            elementalDmgValue={props.elementalDmgValue}
            zebra
            promise={props.simulation}
            type={props.type}
            subType='Combat'
            configType={props.configType}
            buffStat={scoringBuffStat}
          />
        )
        : (
          <CharacterStatSummary
            characterId={props.characterId}
            finalStats={combatStats!}
            elementalDmgValue={props.elementalDmgValue}
            simScore={props.simulation.result!.simScore}
            configType={props.configType}
            scoringType={scoringEntry.scoringType}
            buffStat={scoringBuffStat}
            showAll={true}
            zebra
          />
        )}
    </div>
  )

  const substatsBlock = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: defaultGap }}>
      <div className={classes.sectionLabel} style={{ color: highlight ? highlightColor : '' }}>
        {t(`CharacterPreview.ScoringColumn.${props.type}.Substats`)}
      </div>
      {isAsyncProps(props)
        ? (
          <SubstatRollsSummary
            promise={props.simulation}
            precision={props.precision}
            diminish={props.type === ScoringColumnKind.BENCHMARK}
            type={props.type}
            columns={2}
            configType={props.configType}
          />
        )
        : (
          <SubstatRollsSummary
            simRequest={props.simulation.request}
            precision={props.precision}
            diminish={false}
            columns={2}
            configType={props.configType}
          />
        )}
    </div>
  )

  const mainstatsBlock = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: defaultGap }}>
      <div className={classes.sectionLabel} style={{ color: highlight ? highlightColor : '' }}>
        {t(`CharacterPreview.ScoringColumn.${props.type}.Mainstats`)}
      </div>
      <div style={{ display: 'flex', gap: defaultGap, justifyContent: 'space-around' }}>
        {isAsyncProps(props)
          ? <MainStatsSummary promise={props.simulation} mode={props.type} />
          : (
            <MainStatsSummary
              simBody={props.simulation.request.simBody}
              simFeet={props.simulation.request.simFeet}
              simPlanarSphere={props.simulation.request.simPlanarSphere}
              simLinkRope={props.simulation.request.simLinkRope}
            />
          )}
      </div>
    </div>
  )

  const abilityHeader = (
    <div className={classes.sectionLabel} style={{ color: highlight ? highlightColor : '' }}>
      {t(`CharacterPreview.ScoringColumn.${props.type}.Abilities`)}
    </div>
  )

  const isDps = props.configType === ScoringConfigType.DPS

  let abilityBlock: React.ReactNode
  if (isDps) {
    const syncRotationDamage = !isAsyncProps(props) ? (props.simulation.result?.rotationDamage ?? []) : null
    const hasSyncAbilityData = syncRotationDamage != null && syncRotationDamage.some((step) => step.actionType !== AbilityKind.NULL)

    abilityBlock = isAsyncProps(props)
      ? (
        <Suspense>
          <AsyncAbilityDamageSummary
            promise={props.simulation}
            mode={props.type}
            configType={props.configType}
            header={abilityHeader}
            wrapperClassName={classes.abilityDamageSection}
          />
        </Suspense>
      )
      : hasSyncAbilityData
      ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }} className={classes.abilityDamageSection}>
          {abilityHeader}
          <AbilityDamageSummary rotationDamage={syncRotationDamage!} configType={props.configType} />
        </div>
      )
      : null
  } else {
    const entry = SCORING_CONFIG_REGISTRY[props.configType]
    const buffStat = getScoringMetadata(props.characterId)[CONFIG_FIELD_MAP[props.configType]]?.buffStat
    const buffLabel = resolveComboLabel(entry, buffStat)

    abilityBlock = isAsyncProps(props)
      ? (
        <Suspense>
          <SuspenseNode
            promise={props.simulation}
            selector={(result: SimulationScore | null) => {
              if (!result) return null
              const sim = props.type === ScoringColumnKind.BENCHMARK ? result.benchmarkSim : result.maximumSim
              const value = sim.result?.simScore ?? 0
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }} className={classes.abilityDamageSection}>
                  {abilityHeader}
                  <SummaryRows entries={[[buffLabel, formatSimScore(value, buffStat, 1, entry.thousands)]]} />
                </div>
              )
            }}
          />
        </Suspense>
      )
      : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }} className={classes.abilityDamageSection}>
          {abilityHeader}
          <SummaryRows entries={[[buffLabel, formatSimScore(props.simulation.result?.simScore ?? 0, buffStat, 1, entry.thousands)]]} />
        </div>
      )
  }

  return (
    <div className={props.columnClassName}>
      {headerText
        ? (
          <div className={classes.columnFilledHeader}>
            <div className={classes.scoringColumnHeader} style={{ color: highlight ? highlightColor : '', alignItems: 'center', gap: 6 }}>
              <img src={avatarSrc} style={{ width: 22, height: 22, borderRadius: '50%' }} />
              {headerText}
            </div>
          </div>
        )
        : <SuspendedHeader t={t} configType={props.configType} avatarSrc={avatarSrc} />}
      <div className={classes.columnFilledBody}>
        <DeferCreate>
          <div className={classes.columnFilledSection}>{setsBlock}</div>
        </DeferCreate>
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
})

const SuspendedHeader = memo(function SuspendedHeader({ t, configType, avatarSrc }: {
  t: TFunction<readonly ['charactersTab', 'common'], undefined>,
  configType: ScoringConfigType,
  avatarSrc: string,
}) {
  const scoringPipeline = useScoringPipeline(configType)
  const promise = scoringPipeline?.scoringPromise ?? nullPromise
  return (
    <div className={classes.columnFilledHeader}>
      <div className={classes.scoringColumnHeader} style={{ color: highlightColor, alignItems: 'center', gap: 6 }}>
        <img src={avatarSrc} style={{ width: 22, height: 22, borderRadius: '50%' }} />
        <SuspenseNode
          fallback={<Fallback t={t} />}
          promise={promise}
          selector={(result: SimulationScore | null) => {
            if (!result) return null
            return t('CharacterPreview.ScoringColumn.Character.Header', {
              score: truncate10ths(precisionRound(result.percent * 100)),
            })
          }}
        />
      </div>
    </div>
  )
})

function Fallback({ t }: {
  t: TFunction<readonly ['charactersTab', 'common'], undefined>,
}) {
  const headerText = t('CharacterPreview.ScoringColumn.Character.LoadingHeader')
  return (
    <>
      {headerText}
      <Skeleton height='100%' width={50}>foo</Skeleton>
    </>
  )
}

type SetField = 'simRelicSet1' | 'simRelicSet2' | 'simOrnamentSet'
function setSelector(type: ScoringColumnKind.BENCHMARK | ScoringColumnKind.PERFECT, field: SetField) {
  const key = type === ScoringColumnKind.BENCHMARK ? 'benchmarkSim' : 'maximumSim'
  return (score: SimulationScore | null) => {
    if (!score) return null
    const set = score[key].request[field]
    if (!set) return null
    return <img src={Assets.getSetImage(set)} className={classes.setImage} />
  }
}

const highlightClass = `${classes.columnCardFilled} ${classes.columnHighlightFilled}`
export const CharacterScoringColumn = memo(function(props: ExternalScoringColumnProps) {
  const preview = useSimPreview(props.configType)
  if (preview === null) return null
  return (
    <ScoringColumn
      simulation={preview.originalSim}
      originalSimResult={preview.originalSimResult}
      percent={null}
      precision={2}
      type={ScoringColumnKind.CHARACTER}
      characterId={props.characterId}
      elementalDmgValue={props.elementalDmgValue}
      element={props.element}
      characterMetadata={props.characterMetadata}
      columnClassName={highlightClass}
      configType={props.configType}
    />
  )
})

export const BaselineScoringColumn = memo(function(props: ExternalScoringColumnProps) {
  const preview = useSimPreview(props.configType)
  if (preview === null) return null
  return (
    <ScoringColumn
      simulation={preview.baselineSim}
      originalSimResult={preview.baselineSimResult}
      percent={0}
      precision={0}
      type={ScoringColumnKind.BASELINE}
      characterId={props.characterId}
      elementalDmgValue={props.elementalDmgValue}
      element={props.element}
      characterMetadata={props.characterMetadata}
      columnClassName={classes.columnCardFilled}
      configType={props.configType}
    />
  )
})

const defaultClass = classes.columnCardFilled
export const SimulationScoringColumn = memo(function(props: ExternalSimulationScoringColumnProps) {
  const scoringPipeline = useScoringPipeline(props.configType)
  const isBenchmark = props.type === ScoringColumnKind.BENCHMARK
  return (
    <ScoringColumn
      simulation={scoringPipeline?.scoringPromise ?? nullPromise}
      percent={isBenchmark ? 1.00 : 2.00}
      precision={0}
      type={props.type}
      characterId={props.characterId}
      elementalDmgValue={props.elementalDmgValue}
      element={props.element}
      characterMetadata={props.characterMetadata}
      columnClassName={defaultClass}
      configType={props.configType}
    />
  )
})
