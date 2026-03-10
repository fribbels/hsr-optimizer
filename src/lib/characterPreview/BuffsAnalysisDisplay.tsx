import { Flex } from 'antd'
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
import {
  collectAllBuffs,
  computeStatSums,
  StatSummaryTable,
} from 'lib/characterPreview/buffsAnalysis/StatSummary'
import { seedRelevantTagsFromHits } from 'lib/characterPreview/buffsAnalysis/buffUtils'
import { BUFF_TYPE } from 'lib/optimization/buffSource'
import { generateContext } from 'lib/optimization/context/calculateContext'
import { DamageTag } from 'lib/optimization/engine/config/tag'
import { Assets } from 'lib/rendering/assets'
import {
  originalScoringParams,
  SimulationScore,
} from 'lib/scoring/simScoringUtils'
import {
  aggregatePerActionBuffs,
  BuffGroups,
  PerActionBuffGroups,
} from 'lib/simulations/combatBuffsAnalysis'
import { runStatSimulations } from 'lib/simulations/statSimulation'
import React, {
  ReactElement,
  useMemo,
  useState,
} from 'react'
import { OptimizerContext } from 'types/optimizer'

type BuffsAnalysisProps = {
  result?: SimulationScore,
  perActionBuffGroups?: PerActionBuffGroups,
  size?: BuffDisplaySize,
  context?: OptimizerContext,
}

export enum BuffDisplaySize {
  SMALL = 390,
  LARGE = 450,
}

export function BuffsAnalysisDisplay(props: BuffsAnalysisProps) {
  const rerunResult = useMemo(
    () => props.perActionBuffGroups ? null : rerunSim(props.result),
    [props.perActionBuffGroups, props.result],
  )
  const perActionBuffGroups = props.perActionBuffGroups ?? rerunResult?.perActionBuffGroups
  const context = props.context ?? rerunResult?.context
  const [selectedAction, setSelectedAction] = useState<number | null>(null)
  const [selectedFilter, setSelectedFilter] = useState<DamageTag | null>(null)

  const options = useMemo(() => ({
    ...DEFAULT_OPTIONS,
    panelWidth: props.size ?? DEFAULT_OPTIONS.panelWidth,
  }), [props.size])

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

  // Seed relevantTags from hit definitions so FilterBar renders for characters
  // whose buffs are all ALL-type (damageTags == null)
  if (context) {
    seedRelevantTagsFromHits(relevantTags, context, selectedAction)
  }

  const primaryGroup = buffGroups[BUFF_TYPE.PRIMARY]
  const firstPrimaryId = primaryGroup ? Object.keys(primaryGroup)[0] : undefined
  const summaryAvatarSrc = firstPrimaryId ? Assets.getCharacterAvatarById(firstPrimaryId) : Assets.getBlank()

  return (
    <DesignContext.Provider value={options}>
      <FilterContext.Provider value={selectedFilter}>
        <Flex vertical gap={5} style={{ width: options.panelWidth }}>
          <StatSummaryTable
            sums={statSums}
            avatarSrc={summaryAvatarSrc}
            context={context}
            selectedAction={selectedAction}
          />
          <ActionSelector
            rotationSteps={perActionBuffGroups.rotationSteps}
            selectedAction={selectedAction}
            onActionChange={setSelectedAction}
          />
          <FilterBar selectedFilter={selectedFilter} onFilterChange={setSelectedFilter} relevantTags={relevantTags} />
          <GroupedLayout buffGroups={buffGroups} />
          <FilterBar selectedFilter={selectedFilter} onFilterChange={setSelectedFilter} relevantTags={relevantTags} />
        </Flex>
      </FilterContext.Provider>
    </DesignContext.Provider>
  )
}

function GroupedLayout(props: { buffGroups: BuffGroups }) {
  const groups: ReactElement[] = []
  let groupKey = 0

  for (const buffType of GROUP_ORDER) {
    const groupMap = props.buffGroups[buffType]
    if (!groupMap) continue

    for (const [id, buffs] of Object.entries(groupMap)) {
      if (buffs.length === 0) continue

      groups.push(
        <BuffGroup
          key={groupKey++}
          id={id}
          buffs={buffs}
          buffType={buffType}
        />,
      )
    }
  }
  return <Flex vertical gap={GROUP_SPACING}>{groups}</Flex>
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
