import { ActionSelector } from 'lib/characterPreview/buffsAnalysis/ActionSelector'
import { BuffGroup } from 'lib/characterPreview/buffsAnalysis/BuffGroup'
import {
  DEFAULT_OPTIONS,
  DesignContext,
  FilterChangeContext,
  FilterContext,
  GROUP_ORDER,
  GROUP_SPACING,
} from 'lib/characterPreview/buffsAnalysis/designContext'
import { EnemyPanel } from 'lib/characterPreview/buffsAnalysis/EnemyPanel'
import {
  computeRelevantTags,
  FilterBar,
} from 'lib/characterPreview/buffsAnalysis/FilterBar'
import {
  collectAllBuffs,
  computeStatSums,
  HitDefinitionTable,
  StatSummaryTable,
} from 'lib/characterPreview/buffsAnalysis/StatSummary'
import { BUFF_TYPE } from 'lib/optimization/buffSource'
import { generateContext } from 'lib/optimization/context/calculateContext'
import type { DamageTag } from 'lib/optimization/engine/config/tag'
import { Assets } from 'lib/rendering/assets'
import { originalScoringParams } from 'lib/scoring/simScoringUtils'
import type { SimulationScore } from 'lib/scoring/simScoringUtils'
import { aggregatePerActionBuffs } from 'lib/simulations/combatBuffsAnalysis'
import type {
  BuffGroups,
  PerActionBuffGroups,
} from 'lib/simulations/combatBuffsAnalysis'
import { runStatSimulations } from 'lib/simulations/statSimulation'
import { type Simulation } from 'lib/simulations/statSimulationTypes'
import { DeferCreate } from 'lib/ui/DeferredRender'
import type { ReactElement } from 'react'
import {
  memo,
  useCallback,
  useMemo,
  useState,
} from 'react'
import { type Form } from 'types/form'
import type { OptimizerContext } from 'types/optimizer'

type BuffsAnalysisProps = {
  originalSim?: Simulation,
  simulationForm?: Form,
  perActionBuffGroups?: PerActionBuffGroups,
  size?: BuffDisplaySize,
  context?: OptimizerContext,
  twoColumn?: boolean,
}

export enum BuffDisplaySize {
  SMALL = 390,
  LARGE = 450,
}

export const BuffsAnalysisDisplay = memo(function BuffsAnalysisDisplay({
  originalSim,
  simulationForm,
  perActionBuffGroups: perActionBuffGroupsProp,
  size,
  context: contextProp,
  twoColumn,
}: BuffsAnalysisProps) {
  const rerunResult = useMemo(
    () => perActionBuffGroupsProp ? null : rerunSim({ originalSim, simulationForm }),
    [perActionBuffGroupsProp, originalSim, simulationForm],
  )
  const perActionBuffGroups = perActionBuffGroupsProp ?? rerunResult?.perActionBuffGroups
  const context = contextProp ?? rerunResult?.context
  const [selectedAction, setSelectedAction] = useState<number | null>(null)
  const [selectedFilter, setSelectedFilter] = useState<DamageTag | null>(null)
  const toggleFilter = useCallback((tag: DamageTag | null) => {
    setSelectedFilter((prev) => prev === tag ? null : tag)
  }, [])

  const options = useMemo(() => ({
    ...DEFAULT_OPTIONS,
    panelWidth: size ?? DEFAULT_OPTIONS.panelWidth,
  }), [size])

  const byAction = perActionBuffGroups?.byAction
  const rotationSteps = perActionBuffGroups?.rotationSteps
  const primaryAction = perActionBuffGroups?.primaryAction
  const buffGroups = useMemo(() => {
    if (!byAction || Object.keys(byAction).length === 0) return null
    if (selectedAction != null && rotationSteps?.[selectedAction]) {
      return rotationSteps[selectedAction].groups
    }
    return (primaryAction != null ? byAction[primaryAction] : undefined) ?? byAction[Object.keys(byAction)[0]]
  }, [byAction, selectedAction, rotationSteps, primaryAction])

  const allBuffs = useMemo(() => buffGroups ? collectAllBuffs(buffGroups) : [], [buffGroups])
  const relevantTags = useMemo(() => computeRelevantTags(allBuffs), [allBuffs])
  const statSums = useMemo(() => computeStatSums(allBuffs, selectedFilter), [allBuffs, selectedFilter])

  if (!buffGroups) {
    return null
  }

  const primaryGroup = buffGroups[BUFF_TYPE.PRIMARY]
  const firstPrimaryId = primaryGroup ? Object.keys(primaryGroup)[0] : undefined
  const summaryAvatarSrc = firstPrimaryId ? Assets.getCharacterAvatarById(firstPrimaryId) : Assets.getBlank()

  const statSummary = (
    <DeferCreate>
      <StatSummaryTable
        sums={statSums}
        avatarSrc={summaryAvatarSrc}
      />
    </DeferCreate>
  )

  const hitAndEnemy = (
    <>
      {context && (
        <DeferCreate>
          <HitDefinitionTable
            avatarSrc={summaryAvatarSrc}
            context={context}
            selectedAction={selectedAction}
          />
        </DeferCreate>
      )}
      {context && (
        <DeferCreate>
          <EnemyPanel
            avatarSrc={summaryAvatarSrc}
            context={context}
          />
        </DeferCreate>
      )}
    </>
  )

  const buffsColumn = <GroupedLayout buffGroups={buffGroups} />

  const actionSelector = rotationSteps && (
    <ActionSelector
      rotationSteps={rotationSteps}
      selectedAction={selectedAction}
      onActionChange={setSelectedAction}
    />
  )

  return (
    <DesignContext.Provider value={options}>
      <FilterContext.Provider value={selectedFilter}>
        <FilterChangeContext.Provider value={toggleFilter}>
          {twoColumn
            ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: GROUP_SPACING }}>
                {actionSelector}
                <FilterBar selectedFilter={selectedFilter} onFilterChange={toggleFilter} relevantTags={relevantTags} />
                <div style={{ display: 'flex', gap: GROUP_SPACING, alignItems: 'start' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: GROUP_SPACING, width: options.panelWidth }}>
                    {statSummary}
                    {hitAndEnemy}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: GROUP_SPACING, width: options.panelWidth }}>
                    {buffsColumn}
                  </div>
                </div>
              </div>
            )
            : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: GROUP_SPACING, width: options.panelWidth }}>
                {statSummary}
                <FilterBar selectedFilter={selectedFilter} onFilterChange={toggleFilter} relevantTags={relevantTags} />
                {actionSelector}
                {buffsColumn}
                <FilterBar selectedFilter={selectedFilter} onFilterChange={toggleFilter} relevantTags={relevantTags} />
                {hitAndEnemy}
              </div>
            )}
        </FilterChangeContext.Provider>
      </FilterContext.Provider>
    </DesignContext.Provider>
  )
})

function GroupedLayout({ buffGroups }: { buffGroups: BuffGroups }) {
  const groups: ReactElement[] = []

  for (const buffType of GROUP_ORDER) {
    const groupMap = buffGroups[buffType]
    if (!groupMap) continue

    for (const [id, buffs] of Object.entries(groupMap)) {
      if (buffs.length === 0) continue

      groups.push(
        <DeferCreate key={`${buffType}-${id}`}>
          <BuffGroup
            id={id}
            buffs={buffs}
            buffType={buffType}
          />
        </DeferCreate>,
      )
    }
  }
  return <div style={{ display: 'flex', flexDirection: 'column', gap: GROUP_SPACING }}>{groups}</div>
}

type RerunResult = {
  perActionBuffGroups: PerActionBuffGroups,
  context: OptimizerContext,
}

function rerunSim({ simulationForm, originalSim }: {
  simulationForm: Form | undefined,
  originalSim: Simulation | undefined,
}): RerunResult | null {
  if (!simulationForm || !originalSim) return null

  const form = {
    ...simulationForm,
    trace: true,
  }
  const context = generateContext(form)
  const rerun = runStatSimulations([originalSim], form, context, originalScoringParams)[0]
  if (!rerun.actionBuffSnapshots) return null

  const perActionBuffGroups = aggregatePerActionBuffs(rerun.actionBuffSnapshots, rerun.rotationBuffSteps ?? [], rerun.x, form, context.primaryAbilityKey)
  return { perActionBuffGroups, context }
}
