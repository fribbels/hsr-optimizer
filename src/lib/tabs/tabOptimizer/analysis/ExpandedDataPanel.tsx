import { Flex } from 'antd'
import { BuffsAnalysisDisplay } from 'lib/characterPreview/BuffsAnalysisDisplay'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { generateAnalysisData, getCachedForm, getPinnedRowData, mismatchedCharacter } from 'lib/tabs/tabOptimizer/analysis/expandedDataPanelController'
import { StatsDiffCard } from 'lib/tabs/tabOptimizer/analysis/StatsDiffCard'
import { DamageUpgrades } from 'lib/tabs/tabOptimizer/analysis/SubstatUpgrades'
import { HeaderText } from 'lib/ui/HeaderText'
import { numberToLocaleString } from 'lib/utils/i18nUtils'
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

          <Flex justify='space-between' gap={20}>
            <DamageUpgrades analysis={analysis}/>
            <DamageSplits analysis={analysis}/>
          </Flex>
        </Flex>

        <BuffsAnalysisDisplay buffGroups={analysis.buffGroups} singleColumn={true}/>
      </Flex>
    </Flex>
  )
}

function DamageSplits() {
  const selectedBuildData = window.store((s) => s.optimizerExpandedPanelBuildData)
  const splits = selectedBuildData?.x.dmgSplits

  if (!splits) {
    return (
      <div/>
    )
  }

  const dmgSplitsByDmgType: Partial<{ [K in keyof ComputedStatsArray['dmgSplits'][number]]: ComputedStatsArray['dmgSplits'][number][K][] }> = {
    abilityType: [],
    critDmg: [],
    trueDmg: [],
    additionalDmg: [],
    breakDmg: [],
    superBreakDmg: [],
    jointDmg: [],
  }

  splits
    .reverse()
    .filter((action) => action.abilityType !== 'DEFAULT')
    .forEach((action) => {
      (Object.entries(action) as [keyof ComputedStatsArray['dmgSplits'][number], ComputedStatsArray['dmgSplits'][number][keyof ComputedStatsArray['dmgSplits'][number]]][])
        .forEach(([key, value]) => {
          dmgSplitsByDmgType[key]!.push(value as never)
        })
    })

  for (const key of Object.keys(dmgSplitsByDmgType)) {
    const values = dmgSplitsByDmgType[key as keyof ComputedStatsArray['dmgSplits'][number]]!
    let hasNon0Value = false
    for (const value of values) {
      if (value !== 0) {
        hasNon0Value = true
        break
      }
    }
    if (!hasNon0Value) {
      delete dmgSplitsByDmgType[key as keyof ComputedStatsArray['dmgSplits'][number]]
    }
  }

  const dmgSplitColumns: JSX.Element[] = []
  for (let i = -1; i < dmgSplitsByDmgType.abilityType!.length; i++) {
    dmgSplitColumns.push(<DamageSplitColumn key={i} dmgSplitsByDmgType={dmgSplitsByDmgType} index={i}/>)
  }

  return (
    <Flex vertical align='center' gap={8}>
      <HeaderText>Damage split</HeaderText>
      <Flex justify='space-between' gap={24}>
        {dmgSplitColumns}
      </Flex>
    </Flex>
  )
}

function DamageSplitColumn(props: {
  dmgSplitsByDmgType: Partial<{ [K in keyof ComputedStatsArray['dmgSplits'][number]]: ComputedStatsArray['dmgSplits'][number][K][] }>
  index: number
}) {
  if (props.index === -1) return (
    <Flex vertical justify='center'>
      <HeaderText>Damage sources</HeaderText>
      {Object.keys(props.dmgSplitsByDmgType).map((key, index) => {
        if (key === 'abilityType') return null
        return (
          <span key={index}>
            {key}
          </span>
        )
      })}
    </Flex>
  )
  return (
    <Flex vertical justify='center'>
      <HeaderText>{props.dmgSplitsByDmgType.abilityType![props.index]}</HeaderText>
      {Object.keys(props.dmgSplitsByDmgType).map((key, index) => {
        if (key === 'abilityType') return null
        return (
          <span key={index}>
            {numberToLocaleString(props.dmgSplitsByDmgType[key as Exclude<keyof ComputedStatsArray['dmgSplits'][number], 'abilityType'>]![props.index])}
          </span>
        )
      })}
    </Flex>
  )
}

