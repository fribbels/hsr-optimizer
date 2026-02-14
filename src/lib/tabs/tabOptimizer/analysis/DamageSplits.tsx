import { Flex } from 'antd'
import { ComputedStatsArray, DamageBreakdown } from 'lib/optimization/computedStatsArray'
import { DamageSplitsChart } from 'lib/tabs/tabOptimizer/analysis/DamageSplitsChart'
import { OptimizerResultAnalysis } from 'lib/tabs/tabOptimizer/analysis/expandedDataPanelController'
import { cardShadow } from 'lib/tabs/tabOptimizer/optimizerForm/layout/FormCard'
import React from 'react'

export const DAMAGE_SPLITS_CHART_WIDTH = 730
export const DAMAGE_SPLITS_CHART_HEIGHT = 400

export function DamageSplits(props: {
  analysis: OptimizerResultAnalysis,
}) {
  // Legacy access: newX is ComputedStatsArray at runtime but typed as ComputedStatsContainer
  // TODO: Refactor all of this
  const legacyX = props.analysis.newX as unknown as ComputedStatsArray
  const splits = legacyX.dmgSplits

  if (!splits) {
    return <div />
  }

  if (legacyX.m?.dmgSplits) {
    splits.MEMO_SKILL_DMG = legacyX.m.dmgSplits.MEMO_SKILL_DMG
    splits.MEMO_TALENT_DMG = legacyX.m.dmgSplits.MEMO_TALENT_DMG
  }

  const data: DamageBreakdown[] = Object.values(splits)

  return (
    <Flex
      vertical
      align='center'
      gap={8}
      style={{
        width: DAMAGE_SPLITS_CHART_WIDTH,
        height: DAMAGE_SPLITS_CHART_HEIGHT,
        boxShadow: cardShadow,
        borderRadius: 5,
        overflow: 'hidden',
        background: '#243356',
      }}
    >
      <DamageSplitsChart data={data} />
    </Flex>
  )
}
