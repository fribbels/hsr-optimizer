import { Flex, Tag, Typography } from 'antd'
import { Sets } from 'lib/constants/constants'
import { BUFF_TYPE } from 'lib/optimization/buffSource'
import { Buff } from 'lib/optimization/computedStatsArray'
import { Assets } from 'lib/rendering/assets'
import { SimulationScore } from 'lib/scoring/simScoringUtils'
import { aggregateCombatBuffs } from 'lib/simulations/combatBuffsAnalysis'
import { runSimulations } from 'lib/simulations/statSimulationController'
import { TsUtils } from 'lib/utils/TsUtils'
import React, { ReactElement } from 'react'

const { Text } = Typography

export function BuffsAnalysisDisplay(props: { result: SimulationScore }) {
  const { result } = props
  result.simulationForm.trace = true
  const rerun = runSimulations(result.simulationForm, null, [result.originalSim])[0]
  const x = rerun.tracedX!
  const buffGroups = aggregateCombatBuffs(x, result.simulationForm)

  const buffsDisplay: ReactElement[] = []
  let groupKey = 0

  for (const [id, buffs] of Object.entries(buffGroups.CHARACTER)) {
    buffsDisplay.push(<BuffGroup id={id} buffs={buffs} buffType={BUFF_TYPE.CHARACTER} key={groupKey++}/>)
  }

  for (const [id, buffs] of Object.entries(buffGroups.LIGHTCONE)) {
    buffsDisplay.push(<BuffGroup id={id} buffs={buffs} buffType={BUFF_TYPE.LIGHTCONE} key={groupKey++}/>)
  }

  for (const [id, buffs] of Object.entries(buffGroups.SETS)) {
    buffsDisplay.push(<BuffGroup id={id} buffs={buffs} buffType={BUFF_TYPE.SETS} key={groupKey++}/>)
  }
  // for (const buff of namedCombatBuffs.buffsMemo) {
  //   buffsDisplay.push(<BuffTag buff={buff} memo={true} id={id++}/>)
  // }

  console.log(rerun)

  return (
    <Flex gap={8} wrap style={{ marginLeft: 15, marginRight: 15 }} vertical>
      {buffsDisplay}
    </Flex>
  )
}

function BuffGroup(props: { id: string; buffs: Buff[]; buffType: BUFF_TYPE }) {
  const { id, buffs, buffType } = props

  let src
  if (buffType == BUFF_TYPE.CHARACTER) src = Assets.getCharacterAvatarById(id)
  else if (buffType == BUFF_TYPE.LIGHTCONE) src = Assets.getLightConeIconById(id)
  else if (buffType == BUFF_TYPE.SETS) src = Assets.getSetImage(Sets[id as keyof typeof Sets])
  else src = Assets.getBlank()

  return (
    <Flex>
      <img src={src} style={{ width: 50, height: 50 }}/>
      <Flex vertical>
        {buffs.map((buff, i) => (
          <BuffTag buff={buff} key={i}/>
        ))}
      </Flex>
    </Flex>
  )
}

function BuffTag(props: { buff: Buff }) {
  const { buff } = props
  const memo = false
  return (
    <Tag style={{ paddingInline: '5px', marginInlineEnd: '0px' }}>
      <Flex justify='space-between' style={{ width: 350 }}>
        <Text style={{ margin: 0, alignItems: 'center', fontSize: 14 }}>
          {`${buff.stat} (${buff.source.label})`}
        </Text>
        <Text style={{ margin: 0, alignItems: 'center', fontSize: 14 }}>
          {`${TsUtils.precisionRound(buff.value)}`}
        </Text>
      </Flex>
    </Tag>
  )
}

// ${memo ? 'ᴹ' : ''} :
