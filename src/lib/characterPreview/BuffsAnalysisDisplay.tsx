import { Flex } from 'antd'
import { ActionSelector } from 'lib/characterPreview/buffsAnalysis/ActionSelector'
import { FilterBar, computeRelevantTags } from 'lib/characterPreview/buffsAnalysis/FilterBar'
import { BuffGroup } from 'lib/characterPreview/buffsAnalysis/BuffGroup'
import { DEFAULT_OPTIONS, DesignContext, FilterContext, GROUP_SPACING } from 'lib/characterPreview/buffsAnalysis/designContext'
import { collectAllBuffs, computeStatSums, GROUP_ORDER, StatSummaryTable } from 'lib/characterPreview/buffsAnalysis/StatSummary'
import { BUFF_TYPE } from 'lib/optimization/buffSource'
import { DamageTag } from 'lib/optimization/engine/config/tag'
import { generateContext } from 'lib/optimization/context/calculateContext'
import { Assets } from 'lib/rendering/assets'
import {
  originalScoringParams,
  SimulationScore,
} from 'lib/scoring/simScoringUtils'
import { aggregatePerActionBuffs, BuffGroups, PerActionBuffGroups } from 'lib/simulations/combatBuffsAnalysis'
import { runStatSimulations } from 'lib/simulations/statSimulation'
import React, { ReactElement, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

type BuffsAnalysisProps = {
  result?: SimulationScore
  perActionBuffGroups?: PerActionBuffGroups
  size?: BuffDisplaySize
}

export enum BuffDisplaySize {
  SMALL = 390,
  LARGE = 450,
}

export function BuffsAnalysisDisplay(props: BuffsAnalysisProps) {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'ExpandedDataPanel.BuffsAnalysisDisplay' })
  const perActionBuffGroups = useMemo(
    () => props.perActionBuffGroups ?? rerunSim(props.result),
    [props.perActionBuffGroups, props.result],
  )
  const [selectedAction, setSelectedAction] = useState<number | null>(null)
  const [selectedFilter, setSelectedFilter] = useState<DamageTag | null>(null)
  const options = useMemo(() => ({ ...DEFAULT_OPTIONS, panelWidth: props.size ?? DEFAULT_OPTIONS.panelWidth }), [props.size])

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

  return (
    <DesignContext.Provider value={options}>
    <FilterContext.Provider value={selectedFilter}>
      <Flex vertical gap={5} style={{ width: options.panelWidth }}>
        <ActionSelector
          rotationSteps={perActionBuffGroups.rotationSteps}
          selectedAction={selectedAction}
          onActionChange={setSelectedAction}
        />
        <FilterBar selectedFilter={selectedFilter} onFilterChange={setSelectedFilter} relevantTags={relevantTags} />

        <GroupedLayout buffGroups={buffGroups} />
        <span style={{ fontSize: 11, color: '#ffffff73', letterSpacing: 1, fontWeight: 600 }}>{t('SummaryLabel')}</span>
        <StatSummaryTable sums={statSums} avatarSrc={summaryAvatarSrc} />
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
      groups.push(<BuffGroup key={groupKey++} id={id} buffs={buffs} buffType={buffType} />)
    }
  }
  return <Flex vertical gap={GROUP_SPACING}>{groups}</Flex>
}

function rerunSim(result?: SimulationScore): PerActionBuffGroups | null {
  if (!result) return null
  const form = { ...result.simulationForm, trace: true }
  const context = generateContext(form)
  const rerun = runStatSimulations([result.originalSim], form, context, originalScoringParams)[0]
  if (!rerun.actionBuffSnapshots) return null
  return aggregatePerActionBuffs(rerun.actionBuffSnapshots, rerun.rotationBuffSteps ?? [], rerun.x, form, context.primaryAbilityKey)
}
