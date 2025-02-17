import { Flex, Form as AntDForm } from 'antd'
import { BuffsAnalysisDisplay } from 'lib/characterPreview/BuffsAnalysisDisplay'
import DB from 'lib/state/db'
import { DamageSplits } from 'lib/tabs/tabOptimizer/analysis/DamageSplits'
import { generateAnalysisData, getCachedForm, getPinnedRowData, mismatchedCharacter } from 'lib/tabs/tabOptimizer/analysis/expandedDataPanelController'
import { StatsDiffCard } from 'lib/tabs/tabOptimizer/analysis/StatsDiffCard'
import { DamageUpgrades } from 'lib/tabs/tabOptimizer/analysis/SubstatUpgrades'
import { OptimizerTabController } from 'lib/tabs/tabOptimizer/optimizerTabController'
import React from 'react'

export function ExpandedDataPanel() {
  const selectedRowData = window.store((s) => s.optimizerSelectedRowData)
  const optimizerTabFocusCharacter = window.store((s) => s.optimizerTabFocusCharacter)

  // For triggering updates
  const characterId: string = AntDForm.useWatch(['characterId'], window.optimizerForm)
  const lightConeId: string = AntDForm.useWatch(['lightCone'], window.optimizerForm)

  let form = getCachedForm() ?? OptimizerTabController.getForm()
  const pinnedRowData = getPinnedRowData()

  // Check the cached form first, otherwise try the current form
  if (mismatchedCharacter(optimizerTabFocusCharacter, form)) {
    form = OptimizerTabController.getForm()
    if (mismatchedCharacter(optimizerTabFocusCharacter, form)) {
      return <></>
    }
  }
  if (selectedRowData == null || selectedRowData.tracedX == null || pinnedRowData == null || form == null || DB.getCharacterById(form.characterId) == null) {
    return <></>
  }

  const analysis = generateAnalysisData(pinnedRowData, selectedRowData, form)
  console.log('Optimizer result', analysis)

  return (
    <Flex vertical gap={16} justify='center' style={{ marginTop: 2 }}>
      <Flex justify='space-between'>
        <Flex vertical gap={10}>
          <StatsDiffCard analysis={analysis}/>
          <DamageSplits analysis={analysis}/>
          <DamageUpgrades analysis={analysis}/>
        </Flex>

        <BuffsAnalysisDisplay buffGroups={analysis.buffGroups} singleColumn={true}/>
      </Flex>
    </Flex>
  )
}

