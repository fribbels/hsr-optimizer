import { IRowNode } from 'ag-grid-community'
import { Divider, Flex } from 'antd'
import { BuffsAnalysisDisplay } from 'lib/characterPreview/BuffsAnalysisDisplay'
import { StatTextSm } from 'lib/characterPreview/StatText'
import { Stats, SubStats } from 'lib/constants/constants'
import { iconSize } from 'lib/constants/constantsUi'
import { SingleRelicByPart } from 'lib/gpu/webgpuTypes'
import { OptimizerDisplayDataStatSim } from 'lib/optimization/bufferPacker'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { generateContext } from 'lib/optimization/context/calculateContext'
import { Assets } from 'lib/rendering/assets'
import { originalScoringParams } from 'lib/scoring/simScoringUtils'
import { handleOptimizerExpandedRowData } from 'lib/simulations/expandedComputedStats'
import {
  convertRelicsToSimulation,
  defaultSimulationParams,
  ornamentSetIndexToName,
  relicSetIndexToNames,
  runSimulations,
  Simulation,
  SimulationRequest,
} from 'lib/simulations/statSimulationController'
import { StatSimTypes } from 'lib/tabs/tabOptimizer/optimizerForm/components/StatSimulationDisplay'
import { optimizerFormCache } from 'lib/tabs/tabOptimizer/optimizerForm/OptimizerForm'
import { OptimizerTabController } from 'lib/tabs/tabOptimizer/optimizerTabController'
import { VerticalDivider } from 'lib/ui/Dividers'
import { HeaderText } from 'lib/ui/HeaderText'
import { numberToLocaleString } from 'lib/utils/i18nUtils'
import { TsUtils } from 'lib/utils/TsUtils'
import React from 'react'
import { Build } from 'types/character'

export function ExpandedDataPanel() {
  const selectedRowData = window.store((s) => s.optimizerSelectedRowData)

  // selectedBuildData and buffGroups come from expandedComputedStats.ts
  const selectedBuildData = window.store((s) => s.optimizerExpandedPanelBuildData)
  const buffGroups = window.store((s) => s.optimizerBuffGroups)

  const optimizerBuild = window.store((s) => s.optimizerBuild)

  const optimizerTabFocusCharacter = window.store((s) => s.optimizerTabFocusCharacter)

  return !selectedRowData || optimizerFormCache[window.store.getState().optimizationId!].characterId !== optimizerTabFocusCharacter
    ? (<></>)
    : (
      <Flex vertical gap={16} justify='center'>
        <Flex justify='center'>
          <DamageUpgrades
            id={selectedRowData.id}
            ornamentIndex={selectedRowData.ornamentSetIndex}
            relicIndex={selectedRowData.relicSetIndex}
            combo={selectedRowData.COMBO}
            // optimizerBuild used only to trigger a re-render when equipped build changes
            optimizerBuild={optimizerBuild}
          />
          <VerticalDivider/>
          <DamageSplits splits={selectedBuildData?.x.dmgSplits}/>
        </Flex>
        {buffGroups && <BuffsAnalysisDisplay buffGroups={buffGroups}/>}
      </Flex>
    )
}

function DamageSplits(props: { splits?: ComputedStatsArray['dmgSplits'] }) {
  if (!props.splits) {
    return (
      <Flex><></>
      </Flex>
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
  const clonedSplits = TsUtils.clone(props.splits)
  clonedSplits
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
      {/* {
        props.splits
          .filter((action) => action.abilityType !== 'DEFAULT')
          .map((action, index) => <DmgSplitDisplay key={index} action={action}/>)
      } */}
    </Flex>
  )
}

function DmgSplitDisplay(props: { action: ComputedStatsArray['dmgSplits'][number] }) {
  return (
    <Flex vertical align='center' style={{ borderColor: '#354b7d', borderRadius: 5, borderWidth: 1, borderStyle: 'solid', padding: 8, width: '100%' }}>
      <HeaderText>{props.action.abilityType}</HeaderText>
      <DmgSplitRow label='Crit dmg:' value={props.action.critDmg}/>
      <DmgSplitRow label='True dmg:' value={props.action.trueDmg}/>
      <DmgSplitRow label='Additional dmg:' value={props.action.additionalDmg}/>
      <DmgSplitRow label='Break dmg:' value={props.action.breakDmg}/>
      <DmgSplitRow label='SuperBreak dmg:' value={props.action.superBreakDmg}/>
      <DmgSplitRow label='Joint dmg:' value={props.action.jointDmg}/>
    </Flex>
  )
}

function DmgSplitRow(props: { label: string; value: number }) {
  return (
    <Flex justify='space-between' style={{ width: '100%' }}>
      <span>{props.label}</span>
      <Divider style={{ margin: 'auto 10px', flexGrow: 1, width: 'unset', minWidth: 'unset' }} dashed/>
      <span>{numberToLocaleString(props.value)}</span>
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
  id: number
  relicIndex: number
  ornamentIndex: number
  combo: number
  optimizerBuild: Build | null
}) {
  const statUpgrades = calculateStatUpgrades(props.id, props.ornamentIndex, props.relicIndex)
    .filter((result) => result.COMBO >= props.combo)
    .sort((a, b) => a.COMBO > b.COMBO ? -1 : 1)
    .map((result, index) => (
      index >= 4
        ? null
        : (
          <Flex key={index} align='center' justify='space-between' style={{ width: '100%' }}>
            <img src={Assets.getStatIcon(result.statSim.key)} style={{ width: iconSize, height: iconSize, marginRight: 3 }}/>
            <StatTextSm>{`+1x ${result.statSim.key}`}</StatTextSm>
            <Divider style={{ margin: 'auto 10px', flexGrow: 1, width: 'unset', minWidth: 'unset' }} dashed/>
            <StatTextSm>{`+ ${numberToLocaleString((result.COMBO / props.combo - 1) * 100, 2)}%`}</StatTextSm>
          </Flex>
        )
    ),
    )
  const equippedBuildComboDmg = (window.optimizerGrid.current?.api.getPinnedTopRow(0) as IRowNode<OptimizerDisplayDataStatSim>)?.data?.COMBO
  let dmgChange = 0
  if (equippedBuildComboDmg) dmgChange = (props.combo / equippedBuildComboDmg - 1) * 100

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

function calculateStatUpgrades(id: number, ornamentIndex: number, relicIndex: number) {
  // pull from cache instead of current form as the form may change since last optimizer run, and we want to match optimizer run's conditionals
  const optimizationID = window.store.getState().optimizationId!
  const form = optimizerFormCache[optimizationID]
  const context = generateContext(form)

  const simulations: Simulation[] = []
  const relics = OptimizerTabController.calculateRelicsFromId(id)
  if (Object.values(relics).length !== 6) return []
  const relicSets = relicSetIndexToNames(relicIndex)
  const ornamentSets = ornamentSetIndexToName(ornamentIndex)
  const simulation = convertRelicsToSimulation(relics as SingleRelicByPart, relicSets[0], relicSets[1], ornamentSets)

  for (const substat of SubStats) {
    const upgradeSim = TsUtils.clone(simulation)
    if (upgradeSim.stats[substat]) {
      upgradeSim.stats[substat] += substat === Stats.SPD
        ? originalScoringParams.speedRollValue / defaultSimulationParams.speedRollValue
        : originalScoringParams.quality
    } else { // we divide the additional speed so that it gets properly converted to a stat total during the sim
      upgradeSim.stats[substat] = substat === Stats.SPD
        ? originalScoringParams.speedRollValue / defaultSimulationParams.speedRollValue
        : originalScoringParams.quality
    }
    simulations.push({ request: upgradeSim as SimulationRequest, simType: StatSimTypes.SubstatRolls, key: substat } as Simulation)
  }

  return runSimulations(
    form,
    context,
    simulations,
  )
}

export async function updateExpandedDataPanel() {
  // running synchronously ends up trying to fetch the pinned/selected row before the grid updates
  // if a better spot to call this from is found maybe sleep() can be removed
  await TsUtils.sleep(200)
  let selectedRow: OptimizerDisplayDataStatSim | undefined = window.optimizerGrid.current?.api.getSelectedRows()[0]
  // default to equipped build if no selected row
  if (!selectedRow) selectedRow = (window.optimizerGrid.current?.api.getPinnedTopRow(0) as IRowNode<OptimizerDisplayDataStatSim> | undefined)?.data
  if (selectedRow) {
    const build = OptimizerTabController.calculateRelicIdsFromId(selectedRow.id)
    window.store.getState().setOptimizerBuild(build)
    window.store.getState().setOptimizerSelectedRowData(selectedRow)
    handleOptimizerExpandedRowData(build)
  }
}
