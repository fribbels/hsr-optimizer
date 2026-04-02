import { ActionSelector } from 'lib/characterPreview/buffsAnalysis/ActionSelector'
import { BuffGroup } from 'lib/characterPreview/buffsAnalysis/BuffGroup'
import {
  DEFAULT_OPTIONS,
  DesignContext,
  FilterContext,
  GROUP_ORDER,
  GROUP_SPACING,
} from 'lib/characterPreview/buffsAnalysis/designContext'
import {
  computeRelevantTags,
  FilterBar,
} from 'lib/characterPreview/buffsAnalysis/FilterBar'
import { EnemyPanel } from 'lib/characterPreview/buffsAnalysis/EnemyPanel'
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
import type { ReactElement } from 'react'
import {
  memo,

  useMemo,
  useState,
} from 'react'
import { DeferCreate } from 'lib/ui/DeferredRender'
import type { OptimizerContext } from 'types/optimizer'

type BuffsAnalysisProps = {
  result?: SimulationScore,
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
  result,
  perActionBuffGroups: perActionBuffGroupsProp,
  size,
  context: contextProp,
  twoColumn,
}: BuffsAnalysisProps) {
  const rerunResult = useMemo(
    () => perActionBuffGroupsProp ? null : rerunSim(result),
    [perActionBuffGroupsProp, result],
  )
  const perActionBuffGroups = perActionBuffGroupsProp ?? rerunResult?.perActionBuffGroups
  const context = contextProp ?? rerunResult?.context
  const [selectedAction, setSelectedAction] = useState<number | null>(null)
  const [selectedFilter, setSelectedFilter] = useState<DamageTag | null>(null)

  const options = useMemo(() => ({
    ...DEFAULT_OPTIONS,
    panelWidth: size ?? DEFAULT_OPTIONS.panelWidth,
  }), [size])

  if (!perActionBuffGroups || Object.keys(perActionBuffGroups.byAction).length === 0) {
    return null
  }

  const byAction = perActionBuffGroups.byAction
  const buffGroups = selectedAction != null && perActionBuffGroups.rotationSteps[selectedAction]
    ? perActionBuffGroups.rotationSteps[selectedAction].groups
    : byAction[perActionBuffGroups.primaryAction] ?? byAction[Object.keys(byAction)[0]]

  if (!buffGroups) {
    return null
  }

  const allBuffs = useMemo(() => collectAllBuffs(buffGroups), [buffGroups])
  const relevantTags = useMemo(() => computeRelevantTags(allBuffs), [allBuffs])
  const statSums = useMemo(() => computeStatSums(allBuffs, selectedFilter), [allBuffs, selectedFilter])

  const primaryGroup = buffGroups[BUFF_TYPE.PRIMARY]
  const firstPrimaryId = primaryGroup ? Object.keys(primaryGroup)[0] : undefined
  const summaryAvatarSrc = firstPrimaryId ? Assets.getCharacterAvatarById(firstPrimaryId) : Assets.getBlank()

  const summaryColumn = (
    <>
      <DeferCreate>
        <StatSummaryTable
          sums={statSums}
          avatarSrc={summaryAvatarSrc}
        />
      </DeferCreate>
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

  const actionSelector = (
    <ActionSelector
      rotationSteps={perActionBuffGroups.rotationSteps}
      selectedAction={selectedAction}
      onActionChange={setSelectedAction}
    />
  )

  return (
    <DesignContext.Provider value={options}>
      <FilterContext.Provider value={selectedFilter}>
        {twoColumn
          ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: GROUP_SPACING }}>
              {actionSelector}
              <FilterBar selectedFilter={selectedFilter} onFilterChange={setSelectedFilter} relevantTags={relevantTags} />
              <div style={{ display: 'flex', gap: GROUP_SPACING, alignItems: 'start' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: GROUP_SPACING, width: options.panelWidth }}>
                  {summaryColumn}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: GROUP_SPACING, width: options.panelWidth }}>
                  {buffsColumn}
                </div>
              </div>
            </div>
          )
          : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: GROUP_SPACING, width: options.panelWidth }}>
              {actionSelector}
              <FilterBar selectedFilter={selectedFilter} onFilterChange={setSelectedFilter} relevantTags={relevantTags} />
              {summaryColumn}
              <FilterBar selectedFilter={selectedFilter} onFilterChange={setSelectedFilter} relevantTags={relevantTags} />
              {buffsColumn}
              <FilterBar selectedFilter={selectedFilter} onFilterChange={setSelectedFilter} relevantTags={relevantTags} />
            </div>
          )}
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
  perActionBuffGroups: PerActionBuffGroups
  context: OptimizerContext
}

function rerunSim(result?: SimulationScore): RerunResult | null {
  if (!result) return null

  const form = {
    ...result.simulationForm,
    trace: true,
  }
  const context = generateContext(form)
  const rerun = runStatSimulations([result.originalSim], form, context, originalScoringParams)[0]
  if (!rerun.actionBuffSnapshots) return null

  const perActionBuffGroups = aggregatePerActionBuffs(rerun.actionBuffSnapshots, rerun.rotationBuffSteps ?? [], rerun.x, form, context.primaryAbilityKey)
  return { perActionBuffGroups, context }
}
