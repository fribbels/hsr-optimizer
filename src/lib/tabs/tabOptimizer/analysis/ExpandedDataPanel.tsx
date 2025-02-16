import { Flex } from 'antd'
import { BuffsAnalysisDisplay } from 'lib/characterPreview/BuffsAnalysisDisplay'
import { DamageSplits } from 'lib/tabs/tabOptimizer/analysis/DamageSplits'
import { generateAnalysisData, getCachedForm, getPinnedRowData, mismatchedCharacter } from 'lib/tabs/tabOptimizer/analysis/expandedDataPanelController'
import { StatsDiffCard } from 'lib/tabs/tabOptimizer/analysis/StatsDiffCard'
import { DamageUpgrades } from 'lib/tabs/tabOptimizer/analysis/SubstatUpgrades'
import React from 'react'

export function ExpandedDataPanel() {
  const selectedRowData = window.store((s) => s.optimizerSelectedRowData)
  const optimizerTabFocusCharacter = window.store((s) => s.optimizerTabFocusCharacter)

  const form = getCachedForm()
  const pinnedRowData = getPinnedRowData()

  if (mismatchedCharacter(optimizerTabFocusCharacter, form) || selectedRowData == null || selectedRowData.tracedX == null || pinnedRowData == null || form == null) {
    return <></>
  }

  const analysis = generateAnalysisData(pinnedRowData, selectedRowData, form)
  console.log('analysis', analysis)

  return (
    <Flex vertical gap={16} justify='center' style={{ marginTop: 2 }}>
      <Flex justify='space-between'>
        <Flex vertical gap={20}>
          <StatsDiffCard analysis={analysis}/>

          <Flex justify='space-between' gap={8}>
            <DamageSplits analysis={analysis}/>
            <DamageUpgrades analysis={analysis}/>
          </Flex>
        </Flex>

        <BuffsAnalysisDisplay buffGroups={analysis.buffGroups} singleColumn={true}/>
      </Flex>
    </Flex>
  )
}

