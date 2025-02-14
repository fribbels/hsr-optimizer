import { IRowNode } from 'ag-grid-community'
import { Divider, Flex } from 'antd'
import { BuffsAnalysisDisplay } from 'lib/characterPreview/BuffsAnalysisDisplay'
import { StatTextSm } from 'lib/characterPreview/StatText'
import { iconSize } from 'lib/constants/constantsUi'
import { OptimizerDisplayDataStatSim } from 'lib/optimization/bufferPacker'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { Assets } from 'lib/rendering/assets'
import { calculateStatUpgrades } from 'lib/tabs/tabOptimizer/optimizerForm/grid/expandedDataPanelController'
import { optimizerFormCache } from 'lib/tabs/tabOptimizer/optimizerForm/OptimizerForm'
import { VerticalDivider } from 'lib/ui/Dividers'
import { HeaderText } from 'lib/ui/HeaderText'
import { numberToLocaleString } from 'lib/utils/i18nUtils'
import React from 'react'

export function ExpandedDataPanel() {
  const selectedRowData = window.store((s) => s.optimizerSelectedRowData)
  const selectedBuildData = window.store((s) => s.optimizerExpandedPanelBuildData)
  const buffGroups = window.store((s) => s.optimizerBuffGroups)
  const optimizerTabFocusCharacter = window.store((s) => s.optimizerTabFocusCharacter)

  return !selectedRowData || mismatchedCharacter(optimizerTabFocusCharacter)
    ? (<></>)
    : (
      <Flex vertical gap={16} justify='center'>
        <Flex justify='center'>
          <DamageUpgrades selectedRowData={selectedRowData}/>
          <VerticalDivider/>
          <DamageSplits splits={selectedBuildData?.x.dmgSplits}/>
        </Flex>
        {buffGroups && <BuffsAnalysisDisplay buffGroups={buffGroups}/>}
      </Flex>
    )
}

function mismatchedCharacter(optimizerTabFocusCharacter?: string) {
  return optimizerFormCache[window.store.getState().optimizationId!].characterId !== optimizerTabFocusCharacter
}

function DamageSplits(props: { splits?: ComputedStatsArray['dmgSplits'] }) {
  if (!props.splits) {
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

  props.splits
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

function DamageUpgrades(props: {
  selectedRowData: OptimizerDisplayDataStatSim
}) {
  const { id, relicSetIndex, ornamentSetIndex, COMBO } = props.selectedRowData
  const optimizerBuild = window.store((s) => s.optimizerBuild) // For rerender trigger

  const statUpgrades = calculateStatUpgrades(id, ornamentSetIndex, relicSetIndex)
    .filter((result) => result.COMBO >= COMBO)
    .sort((a, b) => a.COMBO > b.COMBO ? -1 : 1)
    .map((result, index) => (
      index >= 4
        ? null
        : (
          <Flex key={index} align='center' justify='space-between' style={{ width: '100%' }}>
            <img src={Assets.getStatIcon(result.statSim.key)} style={{ width: iconSize, height: iconSize, marginRight: 3 }}/>
            <StatTextSm>{`+1x ${result.statSim.key}`}</StatTextSm>
            <Divider style={{ margin: 'auto 10px', flexGrow: 1, width: 'unset', minWidth: 'unset' }} dashed/>
            <StatTextSm>{`+ ${numberToLocaleString((result.COMBO / COMBO - 1) * 100, 2)}%`}</StatTextSm>
          </Flex>
        )
    ))
  const equippedBuildComboDmg = (window.optimizerGrid.current?.api.getPinnedTopRow(0) as IRowNode<OptimizerDisplayDataStatSim>)?.data?.COMBO
  let dmgChange = 0
  if (equippedBuildComboDmg) dmgChange = (COMBO / equippedBuildComboDmg - 1) * 100

  return (
    <Flex vertical align='center'>
      <HeaderText>Dmg Upgrades</HeaderText>

      {equippedBuildComboDmg && (
        <Flex align='center' justify='space-between' style={{ width: '100%' }}>
          {/* <img src={Assets.getBlank()} style={{ width: iconSize, height: iconSize, marginRight: 3 }}/> */}
          <StatTextSm>vs equipped</StatTextSm>
          <Divider style={{ margin: 'auto 10px', flexGrow: 1, width: 'unset', minWidth: 'unset' }} dashed/>
          <StatTextSm>
            {`${dmgChange >= 0 ? '+' : '-'} ${numberToLocaleString(Math.abs(dmgChange), 2)}%`}
          </StatTextSm>
        </Flex>
      )}

      {statUpgrades}
    </Flex>
  )
}

