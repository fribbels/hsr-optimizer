import { IRowNode } from 'ag-grid-community'
import { CustomCellRendererProps } from 'ag-grid-react'
import { Divider, Flex } from 'antd'
import { StatTextSm } from 'lib/characterPreview/StatText'
import { Stats, SubStats } from 'lib/constants/constants'
import { iconSize } from 'lib/constants/constantsUi'
import { OptimizerDisplayDataStatSim } from 'lib/optimization/bufferPacker'
import { generateContext } from 'lib/optimization/context/calculateContext'
import { Assets } from 'lib/rendering/assets'
import { originalScoringParams } from 'lib/scoring/simScoringUtils'
import {
  convertRelicsToSimulation,
  ornamentSetIndexToName,
  relicSetIndexToNames,
  runSimulations,
  Simulation,
  SimulationRequest,
} from 'lib/simulations/statSimulationController'
import { StatSimTypes } from 'lib/tabs/tabOptimizer/optimizerForm/components/StatSimulationDisplay'
import { GRID_DIMENSIONS } from 'lib/tabs/tabOptimizer/optimizerForm/grid/OptimizerGrid'
import { optimizerFormCache } from 'lib/tabs/tabOptimizer/optimizerForm/OptimizerForm'
import { OptimizerTabController } from 'lib/tabs/tabOptimizer/optimizerTabController'
import { VerticalDivider } from 'lib/ui/Dividers'
import { HeaderText } from 'lib/ui/HeaderText'
import { TsUtils } from 'lib/utils/TsUtils'
import { Utils } from 'lib/utils/utils'
import React from 'react'
import { Build } from 'types/character'

export function ExpandedDataPanel(props: CustomCellRendererProps<OptimizerDisplayDataStatSim>) {
  return !props.data
    ? (<></>)
    : (
      <Flex style={{ height: GRID_DIMENSIONS.PANEL_HEIGHT, marginLeft: 5, marginRight: 5 }}>

        <DamageUpgrades
          id={props.data.id}
          ornamentIndex={props.data.ornamentSetIndex}
          relicIndex={props.data.relicSetIndex}
          combo={props.data.COMBO}
          // optimizerBuild used only to trigger a re-render when equipped build changes
          optimizerBuild={window.store((s) => s.optimizerBuild)}
        />

        <VerticalDivider/>

        <BuffTracing id={props.data.id}/>

        <VerticalDivider/>

        <Flex vertical flex={1} style={{ alignItems: 'center' }}>
          <div>id = {props.data.id}</div>
        </Flex>

        <VerticalDivider/>

        <Flex vertical flex={1} style={{ alignItems: 'center' }}>
          <div>id = {props.data.id}</div>
        </Flex>

      </Flex>
    )
}

function BuffTracing(props: { id: number }) {
  const buffs = []
  return (
    <Flex flex={2} justify='center'>
      <div>id = {props.id}</div>
    </Flex>
  )
}

function DamageUpgrades(props: { id: number; relicIndex: number; ornamentIndex: number; combo: number; optimizerBuild: Build | null }) {
  const statUpgrades = calculateStatUpgrades(props.id, props.ornamentIndex, props.relicIndex)
    .filter((result) => result.COMBO >= props.combo)
    .sort((a, b) => a.COMBO > b.COMBO ? -1 : 1)
    .map((result, index) => (
      index >= 4
        ? null
        : (
          <Flex key={Utils.randomId()} align='center' justify='space-between' style={{ width: '100%' }}>
            <img src={Assets.getStatIcon(result.statSim.key)} style={{ width: iconSize, height: iconSize, marginRight: 3 }}/>
            <StatTextSm>{`+1x ${result.statSim.key}`}</StatTextSm>
            <Divider style={{ margin: 'auto 10px', flexGrow: 1, width: 'unset', minWidth: 'unset' }} dashed/>
            <StatTextSm>{`+ ${TsUtils.precisionRound(((result.COMBO / props.combo) - 1) * 100, 2).toLocaleString('en-US', { minimumFractionDigits: 2 })}%`}</StatTextSm>
          </Flex>
        )
    ),
    )

  const equippedBuildComboDmg = (window.optimizerGrid.current?.api.getPinnedTopRow(0) as IRowNode<OptimizerDisplayDataStatSim>).data?.COMBO
  const dmgChange = props.combo / (equippedBuildComboDmg ?? 1)
  return (
    <Flex vertical flex={1} align='center'>
      <HeaderText>Dmg Upgrades</HeaderText>

      {equippedBuildComboDmg && (
        <Flex key={Utils.randomId()} align='center' justify='space-between' style={{ width: '100%' }}>
          {/* <img src={Assets.getBlank()} style={{ width: iconSize, height: iconSize, marginRight: 3 }}/> */}
          <StatTextSm>vs equipped</StatTextSm>
          <Divider style={{ margin: 'auto 10px', flexGrow: 1, width: 'unset', minWidth: 'unset' }} dashed/>
          <StatTextSm>
            {`${dmgChange >= 1 ? '+' : '-'} ${TsUtils.precisionRound(Math.abs(dmgChange - 1) * 100, 2).toLocaleString('en-US', { minimumFractionDigits: 2 })}%`}
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
  const form = optimizerFormCache[optimizationID] //
  const context = generateContext(form)

  const simulations: Simulation[] = []
  const relics = OptimizerTabController.calculateRelicsFromId(id)
  const relicSets = relicSetIndexToNames(relicIndex)
  const ornamentSets = ornamentSetIndexToName(ornamentIndex)
  const simulation = convertRelicsToSimulation(relics, relicSets[0], relicSets[1], ornamentSets)

  for (const substat of SubStats) {
    const upgradeSim = TsUtils.clone(simulation)
    if (upgradeSim.stats[substat]) {
      upgradeSim.stats[substat] += substat === Stats.SPD ? originalScoringParams.speedRollValue : originalScoringParams.quality
    } else {
      upgradeSim.stats[substat] = substat === Stats.SPD ? originalScoringParams.speedRollValue : originalScoringParams.quality
    }
    simulations.push({ request: upgradeSim as SimulationRequest, simType: StatSimTypes.SubstatRolls, key: substat } as Simulation)
  }

  return runSimulations(
    form,
    context,
    simulations,
  )
}
