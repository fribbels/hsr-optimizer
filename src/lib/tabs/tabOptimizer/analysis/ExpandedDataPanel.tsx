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
  const charId: string = AntDForm.useWatch(['characterId'], window.optimizerForm)
  const eidolon: string = AntDForm.useWatch(['characterEidolon'], window.optimizerForm)
  const lcId: string = AntDForm.useWatch(['lightCone'], window.optimizerForm)
  const superimposition: string = AntDForm.useWatch(['lightConeSuperimposition'], window.optimizerForm)

  let form = getCachedForm() ?? OptimizerTabController.getForm()
  const pinnedRowData = getPinnedRowData()

  if (mismatchedCharacter(optimizerTabFocusCharacter, form)) {
    form = OptimizerTabController.getForm()
    console.debug('exit mismatch', form, form?.characterId, optimizerTabFocusCharacter)
  }
  if (selectedRowData == null) {
    console.debug('exit null selected')
    return <></>
  }
  if (selectedRowData.tracedX == null) {
    console.debug('exit null trace')
    return <></>
  }
  if (pinnedRowData == null) {
    console.debug('exit null pinned')
    return <></>
  }
  if (form == null) {
    console.debug('exit null form')
    return <></>
  }
  if (DB.getCharacterById(form.characterId) == null) {
    console.debug('exit null character')
    return <></>
  }

  const analysis = generateAnalysisData(pinnedRowData, selectedRowData, form)
  console.log('analysis', analysis)

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

