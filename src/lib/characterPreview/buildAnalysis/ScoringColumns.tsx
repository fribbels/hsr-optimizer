import { Skeleton } from '@mantine/core'
import type { TFunction } from 'i18next'
import {
  AsyncCharacterStatSummary,
  CharacterStatSummary,
} from 'lib/characterPreview/card/CharacterStatSummary'
import {
  ScoringSelector,
  SimScoringContext,
  useSimScoringContext,
} from 'lib/characterPreview/SimScoringContext'
import {
  AbilityDamageSummary,
  AsyncAbilityDamageSummary,
} from 'lib/characterPreview/summary/AbilityDamageSummary'
import { MainStatsSummary } from 'lib/characterPreview/summary/MainStatsSummary'
import { SubstatRollsSummary } from 'lib/characterPreview/summary/SubstatRollsSummary'
import {
  type ElementName,
  type PathName,
  PathNames,
  Stats,
} from 'lib/constants/constants'
import { defaultGap } from 'lib/constants/constantsUi'
import { toBasicStatsObject } from 'lib/optimization/basicStatsArray'
import {
  getElementalDmgFromContainer,
  type SimulationScore,
  StatsToStatKey,
} from 'lib/scoring/simScoringUtils'
import type {
  RunStatSimulationsResult,
  Simulation,
} from 'lib/simulations/statSimulationTypes'
import { DeferCreate } from 'lib/ui/DeferredRender'
import { SuspenseNode } from 'lib/ui/SuspenseNode'
import {
  precisionRound,
  truncate10ths,
} from 'lib/utils/mathUtils'
import {
  memo,
  Suspense,
  useContext,
} from 'react'
import {
  Trans,
  useTranslation,
} from 'react-i18next'
import type { CharacterId } from 'types/character'
import classes from './CharacterScoringSummary.module.css'

const highlightColor = 'rgb(225, 165, 100)'

interface ExternalScoringColumnProps {
  characterId: CharacterId
  elementalDmgValue: string
  element: ElementName
  characterMetadata: { path: PathName }
}

interface ExternalSimulationScoringColumnProps extends ExternalScoringColumnProps {
  type: 'Benchmark' | 'Perfect'
}

interface SharedScoringColumnProps extends ExternalScoringColumnProps {
  percent: number | null
  precision: number
  columnClassName: string
}

interface SynchronousScoringColumnProps extends SharedScoringColumnProps {
  type: 'Character'
  simulation: Simulation
  originalSimResult: RunStatSimulationsResult
}

interface AsynchronousScoringColumnProps extends SharedScoringColumnProps {
  type: 'Benchmark' | 'Perfect'
  simulation: Promise<SimulationScore | null>
}

type ScoringColumnProps = SynchronousScoringColumnProps | AsynchronousScoringColumnProps

function isAsyncProps(props: ScoringColumnProps): props is AsynchronousScoringColumnProps {
  return props.type !== 'Character'
}

const ScoringColumn = memo(function ScoringColumn(props: ScoringColumnProps) {
  const { t } = useTranslation(['charactersTab', 'common'])

  const highlight = props.type === 'Character'

  // only the character scoring column will pass as null as all other info is available synchronously
  const headerText = props.percent !== null
    ? t(`CharacterPreview.ScoringColumn.${props.type}.Header`, {
      score: truncate10ths(precisionRound(props.percent * 100)),
    })
    : null

  if (!isAsyncProps(props) && !props.simulation.result) return null

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
          />
        )
        : (
          <CharacterStatSummary
            characterId={props.characterId}
            finalStats={toBasicStatsObject(props.simulation.result!.ca)}
            elementalDmgValue={props.elementalDmgValue}
            simScore={props.simulation.result!.simScore}
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
          />
        )
        : (
          <CharacterStatSummary
            characterId={props.characterId}
            finalStats={combatStats!}
            elementalDmgValue={props.elementalDmgValue}
            simScore={props.simulation.result!.simScore}
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
            diminish={props.type === 'Benchmark'}
            type={props.type}
            columns={2}
          />
        )
        : (
          <SubstatRollsSummary
            simRequest={props.simulation.request}
            precision={props.precision}
            diminish={false}
            columns={2}
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

  const abilityBlock = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }} className={classes.abilityDamageSection}>
      <div className={classes.sectionLabel} style={{ color: highlight ? highlightColor : '' }}>
        {t(`CharacterPreview.ScoringColumn.${props.type}.Abilities`)}
      </div>
      {isAsyncProps(props)
        ? (
          <Suspense>
            <AsyncAbilityDamageSummary promise={props.simulation} mode={props.type} />
          </Suspense>
        )
        : <AbilityDamageSummary rotationDamage={props.simulation.result?.rotationDamage ?? []} />}
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
})

const SuspendedHeader = memo(function SuspendedHeader({ t }: {
  t: TFunction<readonly ['charactersTab', 'common'], undefined>,
}) {
  const promise = useContext(SimScoringContext).scoringPromise
  return (
    <div className={classes.columnFilledHeader}>
      <div className={classes.scoringColumnHeader} style={{ color: highlightColor, display: 'flex' }}>
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

const highlightClass = `${classes.columnCardFilled} ${classes.columnHighlightFilled}`
export const CharacterScoringColumn = memo(function(props: ExternalScoringColumnProps) {
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
    />
  )
})

const defaultClass = classes.columnCardFilled
export const SimulationScoringColumn = memo(function(props: ExternalSimulationScoringColumnProps) {
  const ctx = useContext(SimScoringContext)
  const isBenchmark = props.type === 'Benchmark'
  return (
    <ScoringColumn
      simulation={ctx.scoringPromise}
      percent={isBenchmark ? 1.00 : 2.00}
      precision={0}
      type={props.type}
      characterId={props.characterId}
      elementalDmgValue={props.elementalDmgValue}
      element={props.element}
      characterMetadata={props.characterMetadata}
      columnClassName={defaultClass}
    />
  )
})
