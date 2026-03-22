import { Flex } from '@mantine/core'
import { debugLog, useRenderTracker } from 'lib/debug/renderDebug'
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
  useRenderTracker('BuffsAnalysisDisplay', { result, perActionBuffGroups: perActionBuffGroupsProp, size, context: contextProp, twoColumn })

  const rerunResult = useMemo(
    () => {
      if (perActionBuffGroupsProp) return null
      debugLog('BuffsAnalysisDisplay', 'rerunSim executing (expensive!)')
      return rerunSim(result)
    },
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

  const buffGroups = selectedAction != null && perActionBuffGroups.rotationSteps[selectedAction]
    ? perActionBuffGroups.rotationSteps[selectedAction].groups
    : perActionBuffGroups.byAction[perActionBuffGroups.primaryAction]

  if (!buffGroups) {
    return null
  }

  const allBuffs = collectAllBuffs(buffGroups)
  const relevantTags = computeRelevantTags(allBuffs)
  const statSums = computeStatSums(allBuffs, selectedFilter)

  const primaryGroup = buffGroups[BUFF_TYPE.PRIMARY]
  const firstPrimaryId = primaryGroup ? Object.keys(primaryGroup)[0] : undefined
  const summaryAvatarSrc = firstPrimaryId ? Assets.getCharacterAvatarById(firstPrimaryId) : Assets.getBlank()

  const summaryColumn = (
    <>
      <StatSummaryTable
        sums={statSums}
        avatarSrc={summaryAvatarSrc}
      />
      {context && (
        <HitDefinitionTable
          avatarSrc={summaryAvatarSrc}
          context={context}
          selectedAction={selectedAction}
        />
      )}
      {context && (
        <EnemyPanel
          avatarSrc={summaryAvatarSrc}
          context={context}
        />
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
            <Flex direction="column" gap={GROUP_SPACING}>
              {actionSelector}
              <FilterBar selectedFilter={selectedFilter} onFilterChange={setSelectedFilter} relevantTags={relevantTags} />
              <Flex gap={GROUP_SPACING} align='start'>
                <Flex direction="column" gap={GROUP_SPACING} w={options.panelWidth}>
                  {summaryColumn}
                </Flex>
                <Flex direction="column" gap={GROUP_SPACING} w={options.panelWidth}>
                  {buffsColumn}
                </Flex>
              </Flex>
            </Flex>
          )
          : (
            <Flex direction="column" gap={GROUP_SPACING} w={options.panelWidth}>
              {actionSelector}
              <FilterBar selectedFilter={selectedFilter} onFilterChange={setSelectedFilter} relevantTags={relevantTags} />
              {summaryColumn}
              <FilterBar selectedFilter={selectedFilter} onFilterChange={setSelectedFilter} relevantTags={relevantTags} />
              {buffsColumn}
              <FilterBar selectedFilter={selectedFilter} onFilterChange={setSelectedFilter} relevantTags={relevantTags} />
            </Flex>
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
        <BuffGroup
          key={`${buffType}-${id}`}
          id={id}
          buffs={buffs}
          buffType={buffType}
        />,
      )
    }
  }
  return <Flex direction="column" gap={GROUP_SPACING}>{groups}</Flex>
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
